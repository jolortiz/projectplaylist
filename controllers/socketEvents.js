exports = module.exports = function(io) {
    //Set socket listeners
    console.log("In here?");
    io.on('connection', (client) => {
        console.log('User connected');

        //Join playlist "channel"
        socket.on('Enter playlist', (playlist) => {
            socket.join(playlist);
        });

        //Leave playlist channel
        socket.on('Leave playlist', (playlist) => {
            socket.leave(playlist);
        });

        socket.on('new track', (playlist) => {
            io.sockets.in(playlist).emit('refresh tracks', playlist);
        });

        socket.on('Disconnect', () => {
            console.log('User disconnected');
        });
    });
}