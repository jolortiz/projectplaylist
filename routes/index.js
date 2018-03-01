var express = require('express');
var router = express.Router();

// Require controller modules.
var playlist_controller = require('../controllers/playlistController');

/// Playlist ROUTES ///

// GET catalog home page.
router.get('/', playlist_controller.index);
router.get('/index', playlist_controller.index);

// GET login page when creating playlist
router.get('/login_create', playlist_controller.login_create);

// GET login page when joining playlist
router.get('/login_join', playlist_controller.login_join);

// GET callback
router.get('/callback', playlist_controller.callback);

// GET refresh token
router.get('/refresh_token', playlist_controller.refresh_token);

// GET request for creating Playlist. NOTE This must come before route for id (i.e. display playlist).
router.get('/playlist/create', playlist_controller.playlist_create_get);

// POST request for creating Playlist.
router.post('/playlist/create', playlist_controller.playlist_create_post);

// GET request for joining Playlist
router.get('/playlist/join', playlist_controller.playlist_join_get);

// POST request for joining Playlist
router.post('/playlist/join', playlist_controller.playlist_join_post);

// GET request to delete Playlist.
router.get('/playlist/:id/delete', playlist_controller.playlist_delete_get);

// POST request to delete Playlist.
router.post('/playlist/:id/delete', playlist_controller.playlist_delete_post);

// GET request to update Playlist.
router.get('/playlist/:id/update', playlist_controller.playlist_update_get);

// POST request to update playlist.
router.post('/playlist/:id/update', playlist_controller.playlist_update_post);

// GET request for one Playlist.
router.get('/playlist/:id', playlist_controller.playlist_detail_get);

// POST request for updating playlist
router.post('/playlist/:id', playlist_controller.playlist_detail_post);

// GET request for list of all Authors.
router.get('/playlists', playlist_controller.playlist_list);

module.exports = router;