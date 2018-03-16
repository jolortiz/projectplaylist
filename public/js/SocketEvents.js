
var socket = io.connect('http://musaicplaylist.heroku.com');

socket.on('connect', function (playlist) {
    socket.emit('join', id);
});

socket.on('refresh tracks', function(data) {
    //console.log("Heerio");
    location.reload();
});
