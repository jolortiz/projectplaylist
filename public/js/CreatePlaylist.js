//console.log(global_token);

function createPlaylist(username, playlistName, isPublic){
	var urlString = 'https://api.spotify.com/v1/users/' + username + '/playlists';

	var jsonData = {
	"name": playlistName,
	"public": isPublic
	};

	$.ajax({
	type: 'POST',
	url: urlString,
	data: jsonData,
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
