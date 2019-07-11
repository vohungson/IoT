
// Create a client socket and connect to port 3636
var socketio = require('socket.io-client');
var socket = socketio.connect("http://localhost:3636");

// Read user's input
var readline = require('readline');
var rl = readline.createInterface(process.stdin, process.stdout);

// Variable to keep user's nickname
var nick;

// Set the username
rl.question("Please enter a nickname: ", function(name) {
    nick = name;
    var msg = nick + " has joined the chat";
    socket.emit('send', { type: 'notice', message: msg, nick: nick });
    rl.prompt(true);
});

// Process user's input
rl.on('line', function (line) {

    // User sends a command
    if (line[0] == "/" && line.length > 1) {
        var cmd = line.match(/[a-z]+\b/)[0];
        var arg = line.substr(cmd.length+2, line.length);
        chat_command(cmd, arg);
        rl.prompt(true);
    }

    // User sends a public chat message
    else {
        socket.emit('send', { type: 'chat', message: line, nick: nick });
        rl.prompt(true);
    }
});

function chat_command(cmd, arg) {
    switch (cmd) {

        // Command to change nickname
        case 'nick':
            var notice = nick + " changed their name to " + arg;
            nick = arg;
            socket.emit('send', { type: 'notice', message: notice });
            break;

        // Command to send private message
        case 'msg':
            var to = arg.match(/[a-z]+\b/)[0];
            var message = arg.substr(to.length, arg.length);
            socket.emit('send', { type: 'tell', message: message, to: to, from: nick });
            break;

        default:
            console.log("Not a valid command.");
            rl.prompt(true);
    }
}

socket.on('message', function (data) {

    // Public message from user to everyone
    if (data.type == 'chat' && data.nick != nick) {
        console.log("(Public from " + data.nick + "): " + data.message)
        rl.prompt(true);
    }

    // Notice sent by server
    else if (data.type == "notice") {
        console.log(data.message)
        rl.prompt(true);
    }

    // Private message from user to user
    else if (data.type == "tell" && data.to == nick) {
        console.log("(Private from " + data.from + " -> " + data.to +"): " + data.message)
        rl.prompt(true);
    }
});
