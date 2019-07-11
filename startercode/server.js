
// Create a server socket and listen on port 3636
var socketio = require('socket.io');
var io = socketio.listen(3636);


// Send to a connected client
io.on('connect', function (socket) {
    console.info("A new user enters the chat.");
    socket.on('send', function (data) {
        socket.emit('message', data);
    });
});

// Broadcast a user's message to everyone in the room
io.sockets.on('connection', function (socket) {
    socket.on('send', function (data) {
        io.sockets.emit('message', data);
    });
})
