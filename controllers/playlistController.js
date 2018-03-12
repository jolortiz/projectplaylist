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
var path = require('path');

var client_id = '3819f8f33b8e48e496a4babf32e60907'; // Your client id
var client_secret = 'bc19c389323740738b64c637880e680e'; // Your secret
var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri

var creating = false;

exports.index = function (req, res) {
    async.parallel({
        playlist_count: function (callback) {
            Playlist.count(callback);
        }
    }, function (err, results) {
        res.render('index', { title: 'Musaic', error: err, data: results, from_delete: false });
    });
};

var generateRandomString = function (length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

function getTrack(track_id) {

}

exports.login_create = function (req, res) {

    var state = generateRandomString(16);
    res.cookie(stateKey, state);

    // your application requests authorization
    var scope = 'user-read-private user-read-email playlist-modify-private playlist-modify-public';
    creating = true;
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri,
            state: state
        }));

};

exports.login_join = function (req, res) {

    var state = generateRandomString(16);
    res.cookie(stateKey, state);

    // your application requests authorization
    var scope = 'user-read-private user-read-email playlist-modify-private';
    creating = false;
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
                if (creating) {
                    res.redirect('/playlist/create#' +
                        querystring.stringify({
                            access_token: access_token,
                            refresh_token: refresh_token
                        }));
                } else {
                    res.redirect('/playlist/join#' +
                        querystring.stringify({
                            access_token: access_token,
                            refresh_token: refresh_token
                        }));
                }
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

    request.post(authOptions, function (error, response, body) {
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
exports.playlist_detail_get = function (req, res, next) {
    async.parallel({
        playlist: function (callback) {
            Playlist.findById(req.params.id)

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
        res.render('playlist_detail', { title: 'Title', playlist: results.playlist, _id: req.params.id });
        //res.render('playlist_scroll', {title: 'Title', playlist: results.playlist, _id: req.params.id, tracks: req.params.tracks});

    });

};

exports.playlist_detail_post = [

    // Sanitize (trim and escape) the name field.
    sanitizeBody('track_id').trim().escape(),
    (req, res, next) => {
        //Add selected track to playlist
        if (req.body.functionality == "add") {
            Playlist.findOneAndUpdate({ '_id': req.body._id }, { $addToSet: { 'trackIDs': JSON.parse(req.body.track).id } })
                .exec(function (err, found_playlist) {
                    if (err) { return next(err); }

                    var found = (found_playlist.trackIDs.indexOf(JSON.parse(req.body.track).id) > -1);
                    if (found_playlist) {
                        //Add track to array
                        if (!found) {
                            found_playlist.tracks.push(req.body.track);
                            found_playlist.numberOfTracks++;
                            found_playlist.save();

                            res.render('playlist_detail', { title: 'Title', playlist: found_playlist, _id: req.body._id });
                        }
                    }
                    else {
                        //Playlist does not exist, something is seriously wrong
                        var not_found = { param: "_id", msg: "Playlist not found", value: req.body._id };
                        errors.array().push(not_found);
                        res.render('join', { title: 'Join Playlist', errors: errors.array() });
                    }

                });

        }
        // Delete selected track from playlist
        else if (req.body.functionality == "delete") {
            Playlist.findOne({ '_id': req.body._id })
                .exec(function (err, found_playlist) {
                    if (err) { return next(err); }
                    var found_index = found_playlist.tracks.indexOf(req.body.track);
                    var found = (found_index > -1);
                    if (found_playlist) {
                        //Delete track from array, cuz it's a loser that nobody loves
                        if (found) {
                            found_playlist.tracks.splice(found_index, 1);
                            found_playlist.numberOfTracks--;
                            found_playlist.save();
                            res.render('playlist_detail', { title: 'Title', playlist: found_playlist, _id: req.body._id });
                        }
                    }
                    else {
                        //Playlist does not exist, something is seriously wrong
                        var not_found = { param: "_id", msg: "Playlist not found", value: req.body._id };
                        errors.array().push(not_found);
                        res.render('join', { title: 'Join Playlist', errors: errors.array() });
                    }

                });
        }
        //Swap selected track with track directly above
        else if (req.body.functionality == "up") {
            Playlist.findOne({ '_id': req.body._id })
                .exec(function (err, found_playlist) {
                    if (err) { return next(err); }
                    var found_index = found_playlist.tracks.indexOf(req.body.track);
                    var found = (found_index > -1);
                    if (found_playlist) {
                        //Swap track with the one above it
                        if (found) {
                            var destination_index = found_index - 1;
                            var arr = found_playlist.tracks;
                            if (destination_index < 0) { destination_index = 0; }
                            arr[destination_index] = arr.splice(found_index, 1, arr[destination_index])[0];
                            found_playlist.tracks = arr;
                            found_playlist.save();

                            res.render('playlist_detail', { title: 'Title', playlist: found_playlist, _id: req.body._id });
                        }
                    }
                    else {
                        //Playlist does not exist, something is seriously wrong
                        var not_found = { param: "_id", msg: "Playlist not found", value: req.body._id };
                        errors.array().push(not_found);
                        res.render('join', { title: 'Join Playlist', errors: errors.array() });
                    }

                });
        }
        //Swap selected track with track directly below
        else if (req.body.functionality == "down") {
            Playlist.findOne({ '_id': req.body._id })
                .exec(function (err, found_playlist) {
                    if (err) { return next(err); }
                    var found_index = found_playlist.tracks.indexOf(req.body.track);
                    var found = (found_index > -1);
                    if (found_playlist) {
                        //Swap track with the one below it
                        if (found) {
                            var destination_index = found_index + 1;
                            var arr = found_playlist.tracks;
                            if (destination_index > arr.length - 1) { destination_index = arr.length - 1; }
                            arr[destination_index] = arr.splice(found_index, 1, arr[destination_index])[0];
                            found_playlist.tracks = arr;
                            found_playlist.save();

                            res.render('playlist_detail', { title: 'Title', playlist: found_playlist, _id: req.body._id });
                        }
                    }
                    else {
                        //Playlist does not exist, something is seriously wrong
                        var not_found = { param: "_id", msg: "Playlist not found", value: req.body._id };
                        errors.array().push(not_found);
                        res.render('join', { title: 'Join Playlist', errors: errors.array() });
                    }

                });
        } else {
            console.log("There is a problem with the functionality key in the ajax call in SearchTrack");
        }

    }
];

//Display playlist join form on GET.
exports.playlist_join_get = function (req, res, next) {
    res.render('join', { title: 'Join Playlist' });
};

// Display playlist create form on GET.
exports.playlist_create_get = function (req, res, next) {
    res.render('playlist_form', { title: 'Create Playlist' });
};

//Handle playlist join on POST
exports.playlist_join_post = [
    //Validate that it is a five digit code
    body('_id', '_id required').isLength({ min: 5, max: 5 }).withMessage('Must be of length 5').trim(),

    //Sanitize the code
    sanitizeBody('_id').trim().escape(),

    (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            //There are errors
            res.render('join', { title: 'Join Playlist', errors: errors.array() });
            return;
        } else {
            // Data from form is valid.
            // Check if Playlist with same name already exists.
            Playlist.findOne({ '_id': req.body._id })
                .exec(function (err, found_playlist) {
                    if (err) { return next(err); }

                    if (found_playlist) {
                        // Playlist exists, redirect to its detail page.
                        res.redirect(found_playlist.url);
                    }
                    else {
                        //Playlist does not exist
                        var not_found = { param: "_id", msg: "Playlist not found", value: req.body._id };
                        errors.array().push(not_found);
                        res.render('join', { title: 'Join Playlist', errors: errors.array() });
                    }

                });
        }
    }
];

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
                            // Playlist saved. Redirect to Playlist detail page.
                            res.redirect(playlist.url);
                        });

                    }

                });
        }
    }
];

// Display Playlist delete form on GET.
exports.playlist_delete_get = function (req, res, next) {
    async.parallel({
        playlist: function (callback) {
            Playlist.findById(req.params.id).exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); }
        if (results == null) { // No results.
            res.redirect('/index');
            console.log("No playlist to delete?");
        }
        // Successful, so delete
        Playlist.findByIdAndRemove(req.params.id, function deletePlaylist(err) {
            if (err) { return next(err); }
            res.render('index', { title: 'Musaic', error: err, data: results, from_delete: true });
            //res.redirect('/index')
        });
    });
};

// Handle Playlist delete on POST.
exports.playlist_delete_post = function (req, res, next) {
    
};

// Display Playlist update form on GET.
exports.playlist_update_get = function (req, res) {
    res.send('NOT IMPLEMENTED: Playlist update GET');
};

// Handle Playlist update on POST.
exports.playlist_update_post = function (req, res) {
    res.send('NOT IMPLEMENTED: Playlist update POST');
};