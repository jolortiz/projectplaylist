var global_playlistid;

function makePlaylist() {
	//var isPublic = document.getElementById("public").value;
	var playlistName = document.querySelector('#title.form-control').value;
	createPlaylist(global_username, playlistName, true);
}

function createPlaylist(username, playlistName, isPublic){
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
		},
		error: function() {
			console.log('Error');
		}
	})
}