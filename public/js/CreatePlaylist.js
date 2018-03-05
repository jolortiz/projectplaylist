//console.log(global_token);
var global_playlistid;

function makePlaylist(username, playlistName, isPublic) {
	//var isPublic = document.getElementById("public").value;
	//var playlistName = document.getElementById("nameField").value;
	createPlaylist(username, playlistName, isPublic);
}

function createPlaylist(username, playlistName, isPublic){
	console.log(playlistName);
	var urlString = 'https://api.spotify.com/v1/users/' + username + '/playlists';

	var jsonData = {
	"description": "New playlist description",
	"public": false,
	"name": "lol"
	};

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
		},
		error: function() {
			console.log('Error');
		}
	})
}

/*
JSON.stringify({
				'name': playlistName,
				'public': true
		})
*/
