

function createPlaylistDB(){

    var playlist = mongoose.model('playlist', playlistSchema);

    //Generate random 5 digit connect code
    var connectCode = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    for (var i = 0; i < 5; i++) {
        connectCode += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    

    return connectCode;
}