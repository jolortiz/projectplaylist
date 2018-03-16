var global_playlistid;
var nothing;

function makePlaylist(playlist) {
	//var isPublic = document.getElementById("public").value;
	//var playlistName = document.querySelector('#title.form-control').value;
	//console.log(playlist);
	
	
	console.log(playlist);
	console.log(global_username);
	var playlistName = playlist.title;

	getallplaylists(global_username, playlistName, playlist);

	//createPlaylist(global_username, playlistName, true, playlist);
	
}

function getallplaylists(username, playlistName, playlist){
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
            checkplaylists(result, playlistName, playlist);
        },
        error: function() {
            console.log('Error');
        }
    })
}

function checkplaylists(allplaylists, playlistName, playlist) {
	console.log(allplaylists);
	var found = false;
	for (var i = 0; i < allplaylists.items.length; i++) {
		//var track = JSON.parse(playlist.tracks[i]);
		var playlistName2 = allplaylists.items[i].name;
		console.log(playlistName2);
		console.log(allplaylists.items[i].tracks.total);
		//if it finds a match in the spotify db
		if (playlistName2 === playlistName) {
			//console.log(allplaylists.items[i].id);
			console.log("a match");
			found = true;
			getaPlaylist(allplaylists.items[i].id, playlist);
		}
	};
	if(found === false) {
		console.log("create a playlist");
		createPlaylist(global_username, playlistName, true, playlist);

	}
}

function checkplaylists2(spotifyplist, currplist) {
	console.log(spotifyplist);
	console.log(currplist);
	console.log(spotifyplist.id);
	var id = spotifyplist.id;
	console.log("spotty: " + spotifyplist.tracks.total);
	console.log("mylist: " + currplist.tracks.length);
	var spottylength = spotifyplist.tracks.total;
	var mylistlength = currplist.tracks.length;
	
	//delete tracks in playlist and update

		var items = [];

		//loops and finds all tracks
		for (var i = 0; i < spottylength; i++) {
			var trackuri = spotifyplist.tracks.items[i].track.uri;
			console.log(trackuri);
			var item = { "uri": String(trackuri) }
			items.push(item);
		}
		console.log(items);
		
		//deletes songs in the playlist
		var urlString = 'https://api.spotify.com/v1/users/' + global_username + '/playlists/' + id + '/tracks';
	    $.ajax({
	        type: 'DELETE',
	        url: urlString,
	        data: JSON.stringify({
	        	"tracks": items
	        }),
	        dataType: 'json',
	        headers: {
	            'Authorization': 'Bearer ' + global_token
	        },
	        contentType: 'application/json',
	        success: function(result) {
	            console.log('Success');
	            nothing = true;
	        },
	        error: function() {
	            console.log('Error');
	        }
	    })

	    console.log("addtracks");
		//updates spotty db and adds tracks to it
		for (var i = 0; i < mylistlength; i++) {
			var track = JSON.parse(currplist.tracks[i]);
			console.log(track.id);
			addTrack(global_username, spotifyplist.id, track.id);
		};
		//update widget
		var y = document.getElementById("widget");
		y.src = "https://open.spotify.com/embed?uri=spotify:user:" + global_username + ":playlist:" + spotifyplist.id + "&theme=white&view=coverart";
		
}

function getaPlaylist(playlistName, playlist){
	var urlString = 'https://api.spotify.com/v1/users/' + global_username + '/playlists/' + playlistName;

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
			checkplaylists2(result, playlist)
		},
		error: function() {
			console.log('Error');
		}
	})
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

//Create button
$(document).on('click', '.create', function () {
    $(this).parent('a').addClass('open');
});
$(document).on('mouseleave', '.confirm_create', function () {
    $(this).parent('a').removeClass('open');
});
$(document).on('click', '.confirm_create', function () {
    //window.location.replace("/playlist/" + id + "/delete");
    //onclick="makePlaylist("+ playlist +")"
    //makePlaylist(playlist);
});

