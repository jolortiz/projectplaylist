const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

var Playlist = require('../models/playlist');

var async = require('async');

var stateKey = 'spotify_auth_state';

var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var path= require('path');

var client_id = '3819f8f33b8e48e496a4babf32e60907'; // Your client id
var client_secret = 'bc19c389323740738b64c637880e680e'; // Your secret
var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri

exports.index = function (req, res) {
    async.parallel({
        playlist_count: function (callback) {
            Playlist.count(callback);
        }
    }, function (err, results) {
        res.render('index', { title: 'Musaic', error: err, data: results });
    });
};

var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

exports.login = function (req, res) {

    var state = generateRandomString(16);
    res.cookie(stateKey, state);

    // your application requests authorization
    var scope = 'user-read-private user-read-email playlist-modify-private';
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri,
            state: state
        }));
};

exports.callback = function (req, res) {

    // your application requests refresh and access tokens
    // after checking the state parameter

    var code = req.query.code || null;
    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[stateKey] : null;

    if (state === null || state !== storedState) {
        res.redirect('/#' +
            querystring.stringify({
                error: 'state_mismatch'
            }));
    } else {
        res.clearCookie(stateKey);
        var authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                code: code,
                redirect_uri: redirect_uri,
                grant_type: 'authorization_code'
            },
            headers: {
                'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
            },
            json: true
        };

        request.post(authOptions, function (error, response, body) {
            if (!error && response.statusCode === 200) {

                var access_token = body.access_token,
                    refresh_token = body.refresh_token;

                var options = {
                    url: 'https://api.spotify.com/v1/me',
                    headers: { 'Authorization': 'Bearer ' + access_token },
                    json: true
                };

                // use the access token to access the Spotify Web API
                request.get(options, function (error, response, body) {
                    console.log(body);
                });

                // we can also pass the token to the browser to make requests from there
                res.redirect('/#' +
                    querystring.stringify({
                        access_token: access_token,
                        refresh_token: refresh_token
                    }));
            } else {
                res.redirect('/#' +
                    querystring.stringify({
                        error: 'invalid_token'
                    }));
            }
        });
    }
};

exports.refresh_token = function (req, res) {
    
  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
};

createConnectCode = function () {
    //Generate random 5 digit connect code
    var connectCode = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    for (var i = 0; i < 5; i++) {
        connectCode += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return connectCode;
}

//Display list of all playlists
exports.playlist_list = function (req, res) {
    res.send('NOT IMPLEMENTED: Playlist list')
}

// Display detail page for a specific playlist
exports.playlist_detail = function (req, res, next) {
    async.parallel({
        playlist: function (callback) {
            Playlist.findById(req.params.id)
                //.populate('title')
                //.populate('numberOfTracks')
                //.populate('tracks')
                //.populate('_id')
                .exec(callback);
        }
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.playlist == null) {
            //No results
            var err = new Error('Playlist not found, did you get the wrong code?');
            err.status = 404;
            return next(err);
        }
        //Successful, so render
        res.render('playlist_detail', { title: 'Title', playlist: results.playlist });

    });

};

// Display playlist create form on GET.
exports.playlist_create_get = function (req, res, next) {
    res.render('playlist_form', { title: 'Create Playlist' });
};

// Handle playlist create on POST.
exports.playlist_create_post = [

    // Validate that the name field is not empty.
    body('title', 'Title required').isLength({ min: 1 }).trim(),

    // Sanitize (trim and escape) the name field.
    sanitizeBody('title').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        exports.playlist_create_post = [

            // Validate that the name field is not empty.
            body('title', 'Playlist title required').isLength({ min: 1 }).trim(),

            // Sanitize (trim and escape) the name field.
            sanitizeBody('title').trim().escape(),

            // Process request after validation and sanitization.
            (req, res, next) => {

                // Extract the validation errors from a request.
                const errors = validationResult(req);

                // Create a playlist object with escaped and trimmed data.
                var playlist = new Playlist(
                    {
                        title: req.body.title,
                        _id: createConnectCode(),
                        numberOfTracks: 0,
                        tracks: []
                    }
                );


                if (!errors.isEmpty()) {
                    // There are errors. Render the form again with sanitized values/error messages.
                    res.render('playlist_form', { title: 'Create Playlist', title: title, errors: errors.array() });
                    return;
                }
                else {
                    // Data from form is valid.
                    // Check if Playlist with same name already exists.
                    Playlist.findOne({ 'title': req.body.title })
                        .exec(function (err, found_playlist) {
                            if (err) { return next(err); }

                            if (found_playlist) {
                                // Playlist exists, redirect to its detail page.
                                res.redirect(found_playlist.url);
                            }
                            else {

                                playlist.save(function (err) {
                                    if (err) { return next(err); }
                                    // Playlist saved. Redirect to playlist detail page.
                                    res.redirect(playlist.url);
                                });

                            }

                        });
                }
            }
        ];

        // Create a playlist object with escaped and trimmed data.
        var playlist = new Playlist(
            {
                title: req.body.title,
                _id: createConnectCode(),
                numberOfTracks: 0,
                tracks: []
            }
        );


        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('playlist_form', { title: 'Create Playlist', title: title, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid.
            // Check if Playlist with same name already exists.
            Playlist.findOne({ 'name': req.body.title })
                .exec(function (err, found_playlist) {
                    if (err) { return next(err); }

                    if (found_playlist) {
                        // Playlist exists, redirect to its detail page.
                        res.redirect(found_playlist.url);
                    }
                    else {

                        playlist.save(function (err) {
                            if (err) { return next(err); }
                            // Playlist saved. Redirect to Playlist detail page.
                            res.redirect(playlist.url);
                        });

                    }

                });
        }
    }
];

// Display Playlist delete form on GET.
exports.playlist_delete_get = function (req, res) {
    res.send('NOT IMPLEMENTED: Playlist delete GET');
};

// Handle Playlist delete on POST.
exports.playlist_delete_post = function (req, res) {
    res.send('NOT IMPLEMENTED: Playlist delete POST');
};

// Display Playlist update form on GET.
exports.playlist_update_get = function (req, res) {
    res.send('NOT IMPLEMENTED: Playlist update GET');
};

// Handle Playlist update on POST.
exports.playlist_update_post = function (req, res) {
    res.send('NOT IMPLEMENTED: Playlist update POST');
};