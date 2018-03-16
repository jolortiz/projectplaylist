var global_playlistid;
var global_marker;

function makePlaylist(playlist) {
	//var isPublic = document.getElementById("public").value;
	//var playlistName = document.querySelector('#title.form-control').value;
	//console.log(playlist);
	//getallplaylists(global_username);
	
	global_marker = null;
	console.log(playlist);
	console.log(global_username);
	var playlistName = playlist.title;
	createPlaylist(global_username, playlistName, true, playlist);
	
}

function getallplaylists(username){
    //console.log(playlistid);
    var urlString = 'https://api.spotify.com/v1/users/' + username + '/playlists';

    $.ajax({
        type: 'GET',
        url: urlString,
        dataType: 'json',
        headers: {
            'Authorization': 'Bearer ' + global_token
        },
        contentType: 'application/json',
        success: function(result) {
            console.log('Success');
            checkplaylists(result);
        },
        error: function() {
            console.log('Error');
        }
    })
}

function checkplaylists(allplaylists) {
	//console.log(allplaylists);
	for (var i = 0; i < allplaylists.items.length; i++) {
		//var track = JSON.parse(playlist.tracks[i]);
		var playlist = allplaylists.items[i].name;
		console.log(playlist);
	};
}

function addtoPlaylist(playlist) {
	for (var i = 0; i < playlist.tracks.length; i++) {
		var track = JSON.parse(playlist.tracks[i]);
		console.log(track.id);
		addTrack(global_username, global_playlistid, track.id);
	};
	//this updates the widget to play the playlist
	var y = document.getElementById("widget");
    y.src = "https://open.spotify.com/embed?uri=spotify:user:" + global_username + ":playlist:" + global_playlistid + "&theme=white&view=coverart";
}

function createPlaylist(username, playlistName, isPublic, playlist){
	console.log(playlistName);
	var urlString = 'https://api.spotify.com/v1/users/' + username + '/playlists';

	$.ajax({
		type: 'POST',
		url: urlString,
		data: JSON.stringify({
				"description": "New playlist description",
				'name': playlistName,
				'public': true
		}),
		dataType: 'json',
		headers: {
			'Authorization': 'Bearer ' + global_token
		},
		contentType: 'application/json',
		success: function(result) {
			console.log('Success');
			console.log(result.id);
			global_playlistid = result.id;
			addtoPlaylist(playlist);
		},
		error: function() {
			console.log('Error');
		}
	})
}

function addTrack(username, playlistid, trackid){
    //console.log(playlistid);
    var urlString = 'https://api.spotify.com/v1/users/' + username + '/playlists/' + playlistid + '/tracks';
    var temp = "spotify:track:" + trackid;

    $.ajax({
        type: 'POST',
        url: urlString,
        data: JSON.stringify({
            'uris': [temp]
        }),
        dataType: 'json',
        headers: {
            'Authorization': 'Bearer ' + global_token
        },
        contentType: 'application/json',
        success: function(result) {
            console.log('Success');
        },
        error: function() {
            console.log('Error');
        }
    })
}

