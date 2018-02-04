//console.log(global_token);

function createPlaylist(username, playlistName, isPublic){
	console.log(playlistName);
	var urlString = 'https://api.spotify.com/v1/users/' + username + '/playlists';

	var jsonData = {
	"name": playlistName,
	"public": isPublic
	};

	$.ajax({
		type: 'POST',
		url: urlString,
		data: JSON.stringify({
				'name': playlistName,
				'public': false
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
		});
}
