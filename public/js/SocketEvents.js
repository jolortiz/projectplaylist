
var socket = io.connect('https://musaicplaylist.heroku.com');

socket.on('connect', function (playlist) {
    console.log("Here too");
    socket.emit('join', id);
});

socket.on('refresh tracks', function(data) {
    console.log("Heerio");
    location.reload();
});
