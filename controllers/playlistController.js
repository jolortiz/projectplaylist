const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

var Playlist = require('../models/playlist');

var async = require('async');

exports.index = function (req, res) {
    async.parallel({
        playlist_count: function (callback) {
            Playlist.count(callback);
        }
    }, function (err, results) {
        res.render('index', { title: 'Musaic', error: err, data: results });
    });
};

createConnectCode = function () {
    //Generate random 5 digit connect code
    var connectCode = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    for (var i = 0; i < 5; i++) {
        connectCode += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    console.log("Connect code is: " + connectCode);
    return connectCode;
}

//Display list of all playlists
exports.playlist_list = function (req, res) {
    res.send('NOT IMPLEMENTED: Playlist list')
}

// Display detail page for a specific playlist
exports.playlist_detail = function (req, res, next) {
    async.parallel({
        playlist: function(callback) {
            Playlist.findById(req.params.id)
            .populate('title')
            .populate('numberOfTracks')
            .exec(callback);
        }
    }, function(err, results){
        if(err){ return next(err);}
        if(results.playlist==null){
            //No results
            var err = new Error('Playlist not found, did you get the wrong code?');
            err.status = 404;
            return next(err);
        }
        //Successful, so render
        res.render('playlist_detail', {title: 'Title', playlist: results.playlist});

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