       
// Create a server socket and listen on port 3636
var socketio = require('./node_modules/socket.io/lib');
var io = socketio.listen(3636);
var listOfClients = [];
var listOfGroups = [];
var client_message = "";

// open the database connection
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database(':memory:', (err) => {
    if (err) {
      console.error(err.message);
    }
});
let sql = "";
db.serialize(() => {//create the table of history and the table of event
    db.run('CREATE TABLE history(sender text NOT NULL, group_name text NOT NULL, message text NOT NULL)');
    db.run('CREATE TABLE event(sender text NOT NULL, group_name text NOT NULL, message text NOT NULL)');
});

function sqlInsert(sender, group_name, message, table){//insert the table history or event
    sql = "INSERT INTO'" + table + "'(sender, group_name, message) VALUES('" 
            + sender + "','" 
            + group_name + "','" 
            + message + "')";
}

function writeIntoDatabase(new_sender, new_group_name, new_message, table){
    sqlInsert(new_sender,new_group_name,new_message, table);
    db.run(sql, function(err) {
        if (err) {
          return console.error(err.message);
        }
    });
}

function readFromDatabase(read_group, table){//read the database and print it on the console
    if(table == 'history'){ //read the table history
        db.each(`SELECT * FROM history`, (err, row) => {
            if (err){
              throw err;
            }
            if(read_group == row.group_name){
                console.log("- " + row.sender + " in group " + row.group_name + ": " + row.message);
                client_message += "+ " + row.sender + " in group " + row.group_name + ": " + row.message + "\n";
            }
        });
    } else {//read the table event
        console.log("We are reading the table event");
        db.each(`SELECT * FROM event`, (err, row) => {
            if (err){
              throw err;
            }
            if(read_group == row.group_name){
                console.log("- " + row.sender + " in group " + row.group_name + ": " + row.message);
                client_message += "\n+ " + row.sender + " in group " + row.group_name + ": " + row.message;
            }
        });
    }
}

class Group{//make the group of clients
    constructor (name){
        this.group_name = name;
        this.clientsInGroup = [];//declare the list of clients in the group
        this.clientsBannedInGroup = [];
        this.property = 'public';
    }
    static setProperty (group, set_property){
        group.property = set_property;
    }
    static getName (group){
        return group.group_name;
    }
    static addClient (group, sender){
        group.clientsInGroup.push(sender);
        console.log("You just added the client to the list of group");
    }
    static removeClient (group, sender) {
        for (var i = 0; i < group.clientsInGroup.length; i++){
            if(group.clientsInGroup[i] == sender){
                group.clientsInGroup.splice(i,1);
                console.log(sender + " left the group chat: " + group.group_name);
            }
        }
    }
    static addBannedClient (group, sender){
        group.clientsBannedInGroup.push(sender);
        console.log("You just banned the client to the list of group");
    }
    static removeBannedClient (group, sender) {
        for (var i = 0; i < group.clientsBannedInGroup.length; i++){
            if(group.clientsBannedInGroup[i] == sender){
                group.clientsBannedInGroup.splice(i,1);
                console.log(sender + " unbanned from the group: " + group.group_name);
            }
        }
    }
    static showList(group){
        client_message = "List of clients in the group " + group.group_name + ": ";
        if(group.clientsInGroup.length>0){
            for (var i = 0; i < group.clientsInGroup.length; i++){
                var j = i + 1;
                client_message += "\n"+ j + ". " + group.clientsInGroup[i];
            }
        } else {
            client_message += "Empty!";
        }
    }
    static getList(group){
        return group.clientsInGroup;
    }
    static getBannedList(group){
        return group.clientsBannedInGroup;
    }
}

function existGroup (group_name){
    var checkExistGroup = false;
    for (var i = 0; i < listOfGroups.length; i++){
        group = listOfGroups[i];
        if(group_name == Group.getName(group)){
            checkExistGroup = true;
            break;
        }
    }
    return checkExistGroup;
}

function existClient (client_name){
    var checkExistClient = false;
    for (var i = 0; i < listOfClients.length; i ++){
        if(client_name == listOfClients[i]){
            checkExistClient = true;
            break;
        }
    }
    return checkExistClient;
}

function clientExistInGroup(group, client_name){
    var checkClientExistInGroup = false;
    var list = Group.getList(group);
    for(var i = 0; i < list.length; i ++ ){
        if(list[i] == client_name){
            checkClientExistInGroup = true;
            break;
        }
    }
    return checkClientExistInGroup;
}

function clientExistInBannedGroup(group, client_name){
    var checkClientExistInBannedGroup = false;
    var list = Group.getBannedList(group);
    for(var i = 0; i < list.length; i ++ ){
        if(list[i] == client_name){
            checkClientExistInBannedGroup = true;
            break;
        }
    }
    return checkClientExistInBannedGroup;
}

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
        //TD1
        if(data.action == 'connection'){
            listOfClients.push(data.sender);
            console.log(data.sender + " is connected");
        } else if (data.action == 'list'){
            console.log("- List of the connected clients: ");
            for(var i = 0; i < listOfClients.length; i++){
                console.log((i + 1) + ". " + listOfClients[i]);
            }
        } else if (data.type == 'notice'){
            console.log("The name is changed");
            for (var i = 0; i < listOfClients.length; i++){
                if(listOfClients[i] == data.oldname){
                    listOfClients[i] = data.newname;
                    break;
                }
            }
        } else if (data.action == 'quit'){
            for (var i = 0; i < listOfClients.length; i++){
                if(listOfClients[i] == data.sender){
                    listOfClients.splice(i,1);
                    console.log(data.sender + " left the chat!");
                }
            }
        } 
        //TD2
        //{sender: sender_name, group: group_name ,action:'cgroupe'}
        else if (data.action == 'cgroupe'){//Create a group
            group = new Group(data.group);
            listOfGroups.push(group);
            console.log("Group: " + data.group + " is created!");//created and added to the list of group!
            client_message = "cg;" + data.group;//write into the database
            writeIntoDatabase(data.sender,data.group,client_message,'event');            
        }
        //{sender: sender_name, group: group_name ,action:'join'}
        else if (data.action == 'join'){//sender_name joins the group group_name
            client_message = "j;" + data.group;//write into the database
            writeIntoDatabase(data.sender,data.group,client_message,'event');
            if (!existGroup(data.group)){
                console.log("The group " + data.group + " doesn't exist");
                data.group = "The group " + data.group + " doesn't exist";//save the message and sending it to the client 
            } else {//if the group exist, the client will be added to the group
                for (var i = 0; i < listOfGroups.length; i++){
                    group = listOfGroups[i];
                    if(data.group == Group.getName(group)){
                        break;
                    }
                }
                if(clientExistInGroup(group,data.sender)){
                    data.group = data.sender + " has already been in the group! You can not add again!"
                } else {//before adding, check client is banned or not?
                    if(!clientExistInBannedGroup(group,data.sender)){
                        Group.addClient(group,data.sender);//add sender_name to the group
                        data.group = data.sender + " is added in this group!";
                    } else {
                        data.group = "Sorry! " + data.sender + " is banned to this group!";
                    }
                }
            }
            io.sockets.emit('message',data);
        }
        //sender_name broadcasts the message message_content in the group group_name
        //{sender: sender_name ,group: group_name, msg: message_content ,action:'gbroadcast'}
        else if (data.action == 'gbroadcast'){//bg;group_name;hello
            writeIntoDatabase(data.sender,data.group,data.msg,'history');
            io.sockets.emit('message',data);
            client_message = "bg;" + data.group + ";" + data.msg;//write into the database
            writeIntoDatabase(data.sender,data.group,client_message,'event');
        }
        //{sender: sender_name ,group: 'group_name', action:'members'}
        else if (data.action == 'members'){//sender_name lists all clients that are inside group_name
            client_message = "members;" + data.group;//write into the database
            writeIntoDatabase(data.sender,data.group,client_message,'event');
            if (!existGroup(data.group)){
                console.log("The group " + data.group + " doesn't exist");
                data.group = "The group " + data.group + " doesn't exist";//save the message and sending it to the client 
            } else {
                for (var i = 0; i < listOfGroups.length; i++){
                    group = listOfGroups[i];
                    if(data.group == Group.getName(group)){
                        break;
                    }
                }
                client_message = "";
                Group.showList(group);
                data.group = client_message;//save client_message to group_name and send back to the client
                console.log(client_message);
            }
            io.sockets.emit('message',data);
        }
        //{name: sender_name ,action:'groups'} -> groups;
        else if (data.action == 'groups'){//sender_name lists the existing groups
            client_message = "groups;";//write into the database
            writeIntoDatabase(data.sender,data.group,client_message,'event');
            client_message = "List of the existing groups: ";
            for (var i = 0; i < listOfGroups.length; i++){
                group = listOfGroups[i];
                var j = i + 1;
                client_message += '\n' + j + '. ' + Group.getName(group); 
            }
            data.msg = client_message;
            console.log(client_message);
            io.sockets.emit('message',data);
        } 
        //{sender: sender_name,group: 'group_name' ,action:'leave'} -> leave;group_name
        else if (data.action == 'leave'){//sender_name leaves the group group_name
            client_message = "leave;" + data.group;//write into the database
            writeIntoDatabase(data.sender,data.group,client_message,'event');
            client_message = data.sender + " left from the group: " + data.group;
            if (!existGroup(data.group)){
                client_message = "The group " + data.group + " doesn't exist";
            } else {
                for (var i = 0; i < listOfGroups.length; i++){
                    group = listOfGroups[i];
                    if(data.group == Group.getName(group)){
                        break;
                    }
                }
                if(clientExistInGroup(group,data.sender)){
                    Group.removeClient(group, data.sender);//remove the client in list
                } else {
                    client_message = data.sender + " isn't exist in the group: " + data.group;
                }
            }
            data.msg = client_message;
            console.log(client_message);
            io.sockets.emit('message',data);
        }
        //{sender: sender_name , group: 'group_name', dest: receiver_name, action:'invite'} -> invite;[group];dest
        else if (data.action == 'invite'){//sender_name invites the user receiver_name in the group group_name
            client_message = "invite;" + data.group + ";" + data.dest;//write into the database
            writeIntoDatabase(data.sender,data.group,client_message,'event');
            if(existClient(data.dest) && existGroup(data.group)){
                for (var i = 0; i < listOfGroups.length; i++){
                    group = listOfGroups[i];
                    if(data.group == Group.getName(group)){
                        break;
                    }
                }
                if(!clientExistInGroup(group,data.dest)){
                    if(!clientExistInBannedGroup(group,data.dest)){
                        Group.addClient(group,data.dest);
                        client_message = data.dest + " is added to the group: " + data.group;
                    } else {
                        client_message = "Sorry! " + data.dest + " is banned to this group!";
                    }
                } else {
                    client_message = data.dest + " already existed in the group: " + data.group;
                }
            } else {
                client_message = "Receiver or Group doesn't exist!"
            }
            console.log(client_message);
            data.msg = client_message;
            io.sockets.emit('message',data);
        }
        //{sender: sender_name , group: 'group_name', dest: receiver_name, reason: 'reason', action:'kick'}
        else if (data.action == 'kick'){//sender_name kicks out the user receiver_name from the group group_name with the reason reason
            client_message = "kick;" + data.group + ";" + data.dest + ";" + data.reason;//write into the database
            writeIntoDatabase(data.sender,data.group,client_message,'event');
            if(existClient(data.dest) && existGroup(data.group)){
                for (var i = 0; i < listOfGroups.length; i++){
                    group = listOfGroups[i];
                    if(data.group == Group.getName(group)){
                        break;
                    }
                }
                if(clientExistInGroup(group,data.dest)){//main of this method
                    Group.removeClient(group, data.dest);
                    data.reason = data.dest + " is kicked out of the group: " + data.group + " with the reason: " + data.reason;
                } else {
                    data.reason = data.dest + " doesn't exist in the group: " + data.group;
                }
            } else {
                data.reason = "Receiver or Group doesn't exist!"
            }
            console.log(data.reason);
            io.sockets.emit('message',data);
        }
        //{sender: sender_name , group: 'group_name', dest: receiver_name, reason: 'reason', action:'ban'}
        else if (data.action == 'ban'){//sender_name bans definitively the user receiver_name from group group_name for the reason reason
            client_message = "ban;" + data.group + ";" + data.dest + ";" + data.reason;//write into the database
            writeIntoDatabase(data.sender,data.group,client_message,'event');
            if(existClient(data.dest) && existGroup(data.group)){
                for (var i = 0; i < listOfGroups.length; i++){
                    group = listOfGroups[i];
                    if(data.group == Group.getName(group)){
                        break;
                    }
                }
                if(clientExistInGroup(group,data.dest)){//kick out the client in the group first
                    Group.removeClient(group, data.dest);
                    data.reason = data.dest + " is kicked out of the group: " + data.group + " with the banned reason: " + data.reason;
                } 
                //ban the client here
                data.reason += "\n" + data.dest + " is banned from the group: " + data.group;
                if(!clientExistInBannedGroup(group,data.dest)){
                    Group.addBannedClient(group,data.dest);
                }
            } else {
                data.reason = "Receiver or Group doesn't exist! Please do it again";
            }
            console.log(data.reason);
            io.sockets.emit('message',data);
        }
        //{sender: sender_name , group: 'group_name', dest: receiver_name, action:'unban'}
        else if (data.action == 'unban'){//sender_name unbans the user receiver_name from the group group_name
            client_message = "unban;" + data.group + ";" + data.dest;//write into the database
            writeIntoDatabase(data.sender,data.group,client_message,'event');
            if(existClient(data.dest) && existGroup(data.group)){
                for (var i = 0; i < listOfGroups.length; i++){
                    group = listOfGroups[i];
                    if(data.group == Group.getName(group)){
                        break;
                    }
                }
                //unban the client here
                if(clientExistInBannedGroup(group,data.dest)){
                    if(data.sender != data.dest){
                        Group.removeBannedClient(group,data.dest);
                        data.msg = data.dest + " is unbanned from the group: " + data.group;
                    } else {
                        data.msg = data.sender + " can not unban itself!";
                    }
                } else {
                    data.msg = "Sorry! " + data.dest + " isn't exist in the list banned-clients in the group: " + data.group;
                }
            } else {
                data.msg = "Receiver or Group doesn't exist! Please do it again";
            }
            console.log(data.msg);
            io.sockets.emit('message',data);
        }
        //sender_name lists the history of messages exchanged in the group group_name
        //{sender: sender_name ,group: 'group_name', action:'msgs'}
        else if (data.action == 'msgs'){
            client_message = "messages;" + data.group;//write into the database
            writeIntoDatabase(data.sender,data.group,client_message,'event');
            data.msg = "Lists the history of messages exchanged in the group: \n";
            console.log(data.msg);
            if(existGroup(data.group)) {
                for (var i = 0; i < listOfGroups.length; i++){
                    group = listOfGroups[i];
                    if(data.group == Group.getName(group)){
                        break;
                    }
                }
                client_message = "";
                readFromDatabase(data.group,'history');
                setTimeout(() => {
                    data.msg += client_message;
                    io.sockets.emit('message',data);
                }, 500);//wait in 0.5s
            } else {
                data.msg += "SORRY - Group doesn't exist";
                io.sockets.emit('message',data);
            }
        }
        //sender_name lists all events that occur in the group group_name
        //{sender: sender_name , group: 'group_name', action:'states'} -> states;group_name
        else if (data.action == 'states'){
            data.msg = "Lists all events that occur in the group: \n";
            console.log(data.msg);
            if(existGroup(data.group)) {
                for (var i = 0; i < listOfGroups.length; i++){
                    group = listOfGroups[i];
                    if(data.group == Group.getName(group)){
                        break;
                    }
                }
                client_message = "";
                readFromDatabase(data.group,'event');
                setTimeout(() => {
                    data.msg += client_message;
                    io.sockets.emit('message',data);
                }, 500);//wait in 0.5s
            } else {
                data.msg += "SORRY - Group doesn't exist";
                io.sockets.emit('message',data);
            }
            client_message = "states;" + data.group;//write into the database
            writeIntoDatabase(data.sender,data.group,client_message,'event');
        }

        else io.sockets.emit('message', data);
    });
})
//end code