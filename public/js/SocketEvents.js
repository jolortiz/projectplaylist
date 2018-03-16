
var socket = io.connect('http://localhost:8888');

socket.on('connect', function (playlist) {
    socket.emit('join', id);
});

socket.on('refresh tracks', function(data) {
    //console.log("Heerio");
    location.reload();
});
