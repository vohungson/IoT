
// Create a client socket and connect to port 3636
var socketio = require('socket.io-client');
var socket = socketio.connect("http://localhost:3636");

//declare for password
const bcrypt = require('bcrypt');
const saltRounds = 10;
var password = "";

//declare for secure message use ECDH
var secure_message;
var privateKey;
const crypto = require('crypto');
const client = crypto.createECDH('secp256k1');
client.generateKeys();
const algorithm = 'aes-192-cbc';


// Read user's input
var readline = require('readline');
var rl = readline.createInterface(process.stdin, process.stdout);

// Variable to keep user's nickname
var nick;
var nick_group = ""; //to keep the group of the client
///////
var arrParams = [];
var sender_name;
process.argv.forEach(function (val, index, array) {
    arrParams[index] = val;
});
var sender_name = arrParams[arrParams.length-1];
nick = sender_name;// the name of this client
var connector ={
    connection: function(){
        var msg = " connected \n" + "hello " + sender_name;
        socket.emit('send', { sender: sender_name, action: 'connection',message:msg });
        rl.prompt(true);
    }
}
connector.connection();
///////

function chat_command(cmd, arg) {
    switch (cmd) {

        // Command to change nickname
        case 'nick':
            var notice = nick + " changed their name to " + arg;
            var oldnick = nick;//transfer old nick to the server
            nick = arg;
            socket.emit('send', { type: 'notice', message: notice, oldname: oldnick, newname: nick });
            break;

        // Command to send private message
        case 'msg':
            if(arg.length > 1){
            var to = arg.match(/[a-zA-Z0-9]+\b/)[0];
            var message = arg.substr(to.length, arg.length);
            socket.emit('send', { type: 'tell', message: message, to: to, from: nick });
            } else {
                console.log("Please after /msg, you should input receiver name and message content");
                console.log("Because you are sending a private message from user to user");
            }
            break;

        default:
            console.log("Not a valid command.");
            rl.prompt(true);
    }
}

// Process user's input
rl.on('line', function (line) {
    if(line.length > 0){
        var command = line.match(/[a-zA-Z0-9]+\b/)[0];
    }
    
    // User sends a command (TD1)
    if (line[0] == "/" && line.length > 1) {
        var cmd = line.match(/[a-zA-Z0-9]+\b/)[0];
        var arg = line.substr(cmd.length+2, line.length);
        chat_command(cmd, arg);
        rl.prompt(true);
    } else if(line[0] =="b" && line[1]==";" && line.length>2){
        var message_content = line.substring(2,line.length);
        message_content = sender_name + " broadcasts the message: " + message_content;
        socket.emit('send', { sender:sender_name, message: message_content, action:'broadcast'});
        rl.prompt(true);
    } else if (line == "ls;"){
        socket.emit('send', {sender: sender_name, action: 'list'});
        rl.prompt(true);
    } else if (line == "q;"){
        socket.emit('send', {sender: sender_name, action: 'quit'});
    }

    //User sends a command (TD2)
    //send a message to receiver by the command: >s; receiver; message
    else if (line[0] =="s" && line[1]==";" && line.length >= 2){
        var receiver_message = line.substring(2,line.length);
        var arr = receiver_message.split(";");
        var receiver_name = "", message_content = "";
        if(arr.length > 1){
            receiver_name = "" + arr[0].match(/[a-zA-Z0-9]+\b/)[0];
            message_content = arr[1];
            socket.emit('send',{sender: sender_name, dest: receiver_name, msg: message_content, action: 'send'});
        } else {
            console.log("You must input both receiver name & message content");
        }
        rl.prompt(true);
    }
    //sender_name creates the group group_name -> cg;group_name
    else if (line.length >= 3 && command == "cg"){
        var group_name = null;
        if(line.length > 3){
            var arr = line.split(";");
            group_name = "" + arr[1].match(/[a-zA-Z0-9]+\b/);
            if(group_name != null){
            console.log("Created the group : " + group_name);
            socket.emit('send',{sender: sender_name, group: group_name, action:'cgroupe'});
            } 
        } 
        if (group_name == null){
            console.log("You forgot to input the group name");
        }
        rl.prompt(true);
    }
    //sender_name joins the group group_name -> j;group_name
    else if (line.length >=2 && command == "j"){
        var group_name = null;
        if(line.length > 2){
            var arr = line.split(";");
            group_name = "" + arr[1].match(/[a-zA-Z0-9]+\b/);
            nick_group = group_name;//save the group_name to the nick_group
            if(group_name != null){
            socket.emit('send',{sender: sender_name, group: group_name, action:'join'});
            } 
        } 
        if (group_name == null){
            console.log("You forgot to input the group name");
        }
        rl.prompt(true);
    }
    //sender_name broadcasts the message message_content in the group group_name. 
    else if (line.length >=3 && command == "bg"){
        var group_name = null;
        var message_content = null;
        if(line.length > 3){
            var arr = line.split(";");
            group_name = "" + arr[1].match(/[a-zA-Z0-9]+\b/);
            message_content = arr[2];
            if(group_name != null && message_content != null){
            socket.emit('send',{sender: sender_name ,group: group_name, msg: message_content ,action:'gbroadcast'});
            } 
        } 
        if (group_name == null || message_content == null){
            console.log("Sorry! You must input both group name and message content");
        }
        rl.prompt(true);
    }
    //sender_name lists all clients that are inside group_name
    //{sender: sender_name ,group: 'group_name', action:'members'}
    else if (line.length >= 8 && command == "members"){
        var group_name = null;
        if(line.length > 8){
            var arr = line.split(";");
            group_name = "" + arr[1].match(/[a-zA-Z0-9]+\b/);
            if(group_name != null){
                socket.emit('send',{sender: sender_name ,group: group_name, action:'members'});
            }
        }
        if (group_name == null){
            console.log("Sorry! you must input more the group name");
        }
        rl.prompt(true);
    }
    //sender_name lists the existing groups
    //{name: sender_name ,action:'groups',msg: message}
    else if (line.length >= 7 && command == "groups"){
        var arr = line.split(";");
        var string = arr[1].match(/[a-zA-Z0-9]+\b/);
        var message = "";
        if(string == null){
            socket.emit('send',{name: sender_name, msg: message,action:'groups'});
        }
        else {
            console.log("Wrong syntax!");
        }
        rl.prompt(true);
    }
    //sender_name leaves the group group_name
    //{sender: sender_name,group: 'group_name' ,action:'leave'}
    else if (line.length >= 6 && command == "leave"){
        var length = 0;
        var arr = line.split(";");
        length = arr.length; 
        var message = "";
        if(length == 2 && arr[1].match(/[a-zA-Z0-9]+\b/) != null){
            var group_name = "" + arr[1].match(/[a-zA-Z0-9]+\b/);
            socket.emit('send',{sender: sender_name, group: group_name, msg: message, action:'leave'});
        } else {
            console.log("Sorry! you must input more the group name");
        }
        rl.prompt(true);
    }
    //sender_name invites the user receiver_name in the group group_name
    //{sender: sender_name , group: 'group_name', dest: receiver_name, action:'invite'}
    else if (line.length >=7 && command == "invite"){
        var message = "";
        var length = 0;
        var arr = line.split(";");
        length = arr.length;
        if(length == 3 && arr[2].match(/[a-zA-Z0-9]+\b/) != null){
            var group_name = "" + arr[1].match(/[a-zA-Z0-9]+\b/);
            var receiver_name = "" + arr[2].match(/[a-zA-Z0-9]+\b/);
            socket.emit('send',{sender: sender_name , group: group_name, dest: receiver_name, msg: message, action:'invite'});
        } else {
            console.log("Wrong syntax! You must input both group name and receiver name");
        }
        rl.prompt(true);
    }
    //sender_name kicks out the user receiver_name from the group group_name with the reason reason
    //{sender: sender_name , group: 'group_name', dest: receiver_name, reason: 'reason', action:'kick'}
    else if (line.length >=5 && command == "kick"){//kick;[group];dest;reason
        var arr = line.split(";");
        var length = arr.length;
        if(length == 4 && arr[3].match(/[a-zA-Z0-9]+\b/) != null){
            var group_name = "" + arr[1].match(/[a-zA-Z0-9]+\b/);
            var receiver_name = "" + arr[2].match(/[a-zA-Z0-9]+\b/);
            var reason_content = "" +  arr[3];
            socket.emit('send',{sender: sender_name , group: group_name, dest: receiver_name, reason: reason_content, action:'kick'});
        } else {
            console.log("Wrong syntax! The syntax must like this: kick;[group];dest;reason");
        }
        rl.prompt(true);
    }
    //sender_name bans definitively the user receiver_name from group group_name for the reason reason
    //{sender: sender_name , group: 'group_name', dest: receiver_name, reason: 'ban', action:'ban'}
    else if (line.length >=4 && command == "ban"){//ban;[group];dest;reason
        var arr = line.split(";");
        var length = arr.length;
        if(length == 4 && arr[3].match(/[a-zA-Z0-9]+\b/) != null){
            var group_name = "" + arr[1].match(/[a-zA-Z0-9]+\b/);
            var receiver_name = "" + arr[2].match(/[a-zA-Z0-9]+\b/);
            var reason_content = "" +  arr[3];
            socket.emit('send',{sender: sender_name , group: group_name, dest: receiver_name, reason: reason_content, action:'ban'});
        } else {
            console.log("Wrong syntax! The syntax must like this: ban;[group];dest;reason");
        }
        rl.prompt(true);
    }
    //sender_name unbans the user receiver_name from the group group_name
    //{sender: sender_name , group: 'group_name', dest: receiver_name, action:'unban'}
    else if (line.length >=6 && command == "unban"){//unban;[group];dest
        var arr = line.split(";");
        var message = "";
        var length = arr.length;
        if(length == 3 && arr[2].match(/[a-zA-Z0-9]+\b/) != null){
            var group_name = "" + arr[1].match(/[a-zA-Z0-9]+\b/);
            var receiver_name = "" + arr[2];
            socket.emit('send',{sender: sender_name , group: group_name, dest: receiver_name, msg: message, action:'unban'});
        } else {
            console.log("Wrong syntax! The syntax must like this: unban;[group];dest");
        }
        rl.prompt(true);
    }
    //sender_name lists the history of messages exchanged in the group group_name
    //{sender: sender_name ,group: 'group_name', action:'msgs'}
    else if (line.length >= 9 && command == "messages"){//messages;group
        var arr = line.split(";");
        var message = "";
        var length = arr.length;
        if(length == 2 && arr[1].match(/[a-zA-Z0-9]+\b/) != null){
            var group_name = "" + arr[1];
            socket.emit('send',{sender: sender_name , group: group_name, msg: message, action:'msgs'});
        } else {
            console.log("Wrong syntax! The syntax must like this: messages;group");
        }
        rl.prompt(true);
    }
    //sender_name lists all events that occur in the group group_name
    //{sender: sender_name , group: 'group_name', action:'states'}
    else if (line.length >= 7 && command == "states"){//states;group
        var arr = line.split(";");
        var message = "";
        var length = arr.length;
        if(length == 2 && arr[1].match(/[a-zA-Z0-9]+\b/) != null){
            var group_name = "" + arr[1];
            socket.emit('send',{sender: sender_name , group: group_name, msg: message, action:'states'});
        } else {
            console.log("Wrong syntax! The syntax must like this: states;group");
        }
        rl.prompt(true);
    }

    //TD4: 
    //sender_name register the password and send to server -> register;password
    else if (line.length >= 9 && command == "register"){
        password = null;
        if(line.length > 9){
            var arr = line.split(";");
            password = "" + arr[1].match(/[a-zA-Z0-9]+\b/);
            if(password != null){
                var salt = bcrypt.genSaltSync(saltRounds);
                var hash_password = bcrypt.hashSync(password, salt);
                console.log("Created the password : " + password);
                socket.emit('send',{sender: nick, password: hash_password, action:'register'});
            } 
        } 
        if (password == null){
            console.log("You forgot to input the password");
        }
        rl.prompt(true);
    }
    else if (line.length >= 7 && command == "secure"){
        secure_message = null;
        if(line.length > 7){
            var arr = line.split(";");
            secure_message = "" + arr[1].match(/[a-zA-Z0-9]+\b/);
            if(secure_message != null){
                console.log("The secure message is : " + secure_message);
                socket.emit('send',{sender: nick, publicKey: client.getPublicKey(), action:'secure'});
            } 
        } 
        if (password == null){
            console.log("You forgot to input the secure message");
        }
        rl.prompt(true);
    }

    // User sends a public chat message
    else {
        if(line.length>0){
            socket.emit('send', { type: 'chat', message: line, nick: nick });
        }
        rl.prompt(true);
    }
});

socket.on('message', function (data) {

    // Public message from user to everyone
    if (data.type == 'chat' && data.nick != nick) {
        console.log("(Public from " + data.nick + "): " + data.message)
        rl.prompt(true);
    }

    // Notice is sent by server (TD1)
    else if (data.type == 'notice') {
        console.log(data.message)
        rl.prompt(true);
    } else if (data.action == 'connection') {
        console.log(data.message);
        console.log("Please set up your password (register;password): ");
        rl.prompt(true);
    } else if (data.action == 'broadcast' && sender_name != nick) {
        console.log(data.message)
        rl.prompt(true);
    } else if (data.action == 'list'){//do nothing here
    } else if (data.action == 'quit'){
        socket.disconnect();
        process.exit();
    } 

    // Notice is sent by server (TD2)
    else if (data.action == 'send' && data.dest == nick){
        console.log("Message from " + data.sender + ": " + data.msg);
        rl.prompt(true);
    } else if (data.action == 'join' && data.sender == nick){//notify from server about joinning the group
        console.log(data.group);//print the message from the server
        rl.prompt(true);
    } else if (data.action == 'gbroadcast' && data.group == nick_group && data.sender != nick){//broadcast message in the group
        console.log("Message from the group " + data.group + ": " + data.msg);//print the message from the server
        rl.prompt(true);
    } else if (data.action == 'members' && data.sender == nick ){//sender_name lists all clients that are inside group_name
        console.log(data.group);
        rl.prompt(true);
    } else if (data.action == 'groups' && data.name == nick ){//sender_name lists the existing groups
        console.log(data.msg);
        rl.prompt(true);
    } else if (data.action == 'leave' && data.sender == nick){
        console.log(data.msg);
        rl.prompt(true);
    } else if (data.action == 'invite' && data.sender == nick ){
        console.log(data.msg);
        rl.prompt(true);
    } else if (data.action == 'kick' && data.sender == nick){
        console.log(data.reason);
        rl.prompt(true);
    } else if (data.action == 'ban' && data.sender == nick){
        console.log(data.reason);
        rl.prompt(true);
    } else if (data.action == 'unban' && data.sender == nick){
        console.log(data.msg);
        rl.prompt(true);
    } else if (data.action == 'msgs' && data.sender == nick){
        console.log(data.msg);
        rl.prompt(true);
    } else if (data.action == 'states' && data.sender == nick){
        console.log(data.msg);
        rl.prompt(true);
    } 
    //TD4
    else if (data.action == 'register' && data.sender == nick){
        console.log("hash of password get from the server: " + data.password);
        bcrypt.compare(password, data.password, function(err, res) {
            console.log("The password is correct: " + res);    
        });
        rl.prompt(true);
    }  

    // Private message from user to user
    else if (data.type == 'tell' && data.to == nick) {
        console.log("(Private from " + data.from + " -> " + data.to +"): " + data.message)
        rl.prompt(true);
    }
});//end code

socket.on('encryption', function (data) {
    if (data.action == 'secure' && data.sender == nick){
        privateKey = client.computeSecret(data.publicKey, null, 'hex');
        var cipher = crypto.createCipher(algorithm, privateKey);
        let encryptMessage = cipher.update(secure_message, 'utf8', 'hex');
        encryptMessage += cipher.final('hex');
        socket.emit('send', {sender: data.sender, message: encryptMessage, action:"securemessage"});
        console.log("Start sending ecnrypt message: " + encryptMessage);
        rl.prompt(true);
    } else if (data.action == 'clientdecrypt' && data.sender == nick){
        var decipher = crypto.createDecipher(algorithm,privateKey);
        var decrypted = decipher.update(data.message,'hex','utf8');
        decrypted += decipher.final('utf8');
        console.log("Decrypted message is : " + decrypted);
    }
});