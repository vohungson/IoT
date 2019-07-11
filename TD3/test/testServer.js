var socketio = require('socket.io-client');
var socketURL = "http://localhost:3636";
const assert = require('chai').assert;

//Case 1: Run the server.js
const runServer = require('../server').runServer;
let run_Server = runServer();


var user1 = {'nick':'User1', 'msg':'Message1'};
var user2 = {'nick':'User2', 'msg':'Message2'};
var user3 = {'nick':'User3', 'msg':'Message3'};
var user4 = {'nick':'User4', 'msg':'Message4'};
var user5 = {'nick':'User5', 'msg':'Message5'};
var user6 = {'nick':'User6', 'msg':'Message6'};
var user7 = {'nick':'User7', 'msg':'Message7'};
var user8 = {'nick':'User8', 'msg':'Message8'};
var user9 = {'nick':'User9', 'msg':'Message9'};
var user10 = {'nick':'User10', 'msg':'Message10'};
var user11 = {'nick':'User11', 'msg':'Message11'};
var user12 = {'nick':'User12', 'msg':'Message12'};
var user13 = {'nick':'User13', 'msg':'Message13'};
var user14 = {'nick':'User14', 'msg':'Message14'};
var user15 = {'nick':'User15', 'msg':'Message15'};

describe('===>>> TESTING THE CODE FOR THE SERVER', function(){

    describe('=> CASE 0: Run the server.js',function(){
        it('The value should return server', function(){
            assert.equal(run_Server, 'server');
        });
    });

    var client1 = socketio.connect(socketURL);
    describe('=> CASE 1: The user connect to the server', function(){
        it('Should be return the connected', function(done){
            client1.emit('send', { sender: user1.nick, action: 'connection',message: user1.msg });

            setTimeout(() => {}, 100);//wait in 0.1s
            client1.on('message', function(data){//receive from the server
                if (data.action == "connection") {
                    assert.equal(data.message, 'connected');
                }
            });
            done();
        });
    });

    var client2 = socketio.connect(socketURL);
    describe('=> CASE 2: Change the name of the user', function(){
        it('Should be return the new name', function(done){
            client2.emit('send', { sender: user2.nick, action: 'connection',message: user2.msg });
            var new_name = 'one';
            var notice = '';// send nothing and get 'one' from server
            client2.emit('send', { type: 'notice', message: notice, oldname: user2.nick, newname: new_name });

            setTimeout(() => {}, 100);//wait in 0.1s
            client2.on('message', function(data){//receive from the server
                if (data.type == "notice") {
                    assert.equal(data.message, 'one');
                }
            });
            done();
        });
    });

    //test s;user2;hello
    var client3 = socketio.connect(socketURL);
    describe('=> CASE 3: Test message send to user1 from user3', function(){
        it('The message should be hello', function(done){
            client3.emit('send', { sender: user3.nick, action: 'connection',message: user3.msg });
            var message_content = 'hello';//user3 send string 'hello' to user1
            client3.emit('send',{sender: user3.nick, dest: user1.nick, msg: message_content, action: 'send'});

            setTimeout(() => {}, 100);//wait in 0.1s
            client1.on('message', function(data){
                if (data.action == "send") {
                    assert.equal(data.msg, 'hello');
                }
            });
            done();
        });
    });
    
    //cg;[group_name]
    var client4 = socketio.connect(socketURL);
    describe('=> CASE 4: Creating the group', function(){
        it('The value should be group: "un"', function(done){
            client4.emit('send', { sender: user4.nick, action: 'connection',message: user4.msg });
            var group_name = 'un';
            client4.emit('send',{sender: user4.nick, group: group_name, action:'cgroupe', message: ''});

            setTimeout(() => {}, 100);//wait in 0.1s
            client4.on('message', function(data){
                if (data.action == "cgroupe") {
                    assert.equal(data.message, 'un');
                }
            });
            done();
        });
    });

    //{sender: sender_name, group: group_name ,action:'join'} -> j;group_name
    var client5 = socketio.connect(socketURL);
    describe('=> CASE 5: Join the group', function(){
        it('The value should be "un"', function(done){
            client5.emit('send', { sender: user5.nick, action: 'connection',message: user5.msg });
            var group_name = 'un';
            client5.emit('send',{sender: user5.nick, group: group_name, action:'join', message: ''});

            setTimeout(() => {}, 100);//wait in 0.1s
            client5.on('message', function(data){
                if (data.action == "join") {
                    assert.equal(data.message, 'joined');
                }
            });
            done();
        });
    });

    //{sender: sender_name ,group: group_name, msg: message_content ,action:'gbroadcast'}
    //-> bg;group_name;hello
    var client6 = socketio.connect(socketURL);
    describe('=> CASE 6: Broadcast the message to the group', function(){
        it('The User6 should get the string "hello"', function(done){
            client6.emit('send', { sender: user6.nick, action: 'connection',message: user6.msg });
            var group_name = 'un';
            client6.emit('send',{sender: user6.nick, group: group_name, action:'join', message: ''});
            //after user6 joined the group, user5 will broadcast a message in the group
            client5.emit('send',{sender: user5.nick, group: group_name, msg: 'hello', action:'gbroadcast'})

            setTimeout(() => {}, 100);//wait in 0.1s
            client6.on('message', function(data){//client 6 get string from client 5
                if (data.action == "gbroadcast") {
                    assert.equal(data.msg, 'hello');
                }
            });
            done();
        });
    });

    //{sender: sender_name ,group: 'group_name', action:'members'}
    //sender_name lists all clients that are inside group_name
    //>members;group_name
    var client7 = socketio.connect(socketURL);
    describe('=> CASE 7: Check the number of clients in the group', function(){
        it('The number of users should be 3', function(done){
            client7.emit('send', { sender: user7.nick, action: 'connection',message: user7.msg });
            var group_name = 'un';
            client7.emit('send',{sender: user7.nick, group: group_name, action:'join', message: ''});
            //Here! we have user5,6,7 in the group 'un', we will check the number of users = 3
            client7.emit('send',{sender: user7.nick, group: group_name, msg: '', action:'members'})

            setTimeout(() => {}, 100);//wait in 0.1s
            client7.on('message', function(data){
                if (data.action == "members") {
                    assert.equal(data.msg, '3');
                }
            });
            done();
        });
    });

    //sender_name lists the history of messages exchanged in the group group_name
    //{sender: sender_name ,group: 'group_name', action:'msgs'}
    //messages;group_name -> list messages
    var client8 = socketio.connect(socketURL);
    describe('=> CASE 8: Check the history of the group', function(){
        it('The result of history should be "hello"', function(done){
            client8.emit('send', { sender: user8.nick, action: 'connection',message: user8.msg });
            var group_name = 'un';
            //History of group chat 'un' is 'hello' in case 6.
            client8.emit('send',{sender: user8.nick, group: group_name, message: '', action:'msgs'})

            setTimeout(() => {}, 100);//wait in 0.1s
            client8.on('message', function(data){
                if (data.action == "msgs") {
                    assert.equal(data.message, 'hello');
                }
            });
            done();
        });
    });

    //sender_name lists the existing groups
    //{name: sender_name ,action:'groups'}
    //>groups; -> list all groups
    var client9 = socketio.connect(socketURL);
    describe('=> CASE 9: Check the existing group', function(){
        it('The last group that you created should be "un"', function(done){
            client9.emit('send', { sender: user9.nick, action: 'connection',message: user9.msg });
            //There is the group 'un' that we created before
            client9.emit('send',{sender: user9.nick, message: '', action:'groups'});

            setTimeout(() => {}, 100);//wait in 0.1s
            client9.on('message', function(data){
                if (data.action == "groups") {
                    assert.equal(data.message, 'un');
                }
            });
            done();
        });
    });

    //sender_name leaves the group group_name
    //{sender: sender_name,group: 'group_name' ,action:'leave'}
    //leave;group_name
    var client10 = socketio.connect(socketURL);
    describe('=> CASE 10: The user leaving the group', function(){
        it('The User left the group should be User5', function(done){
            client10.emit('send', { sender: user10.nick, action: 'connection',message: user10.msg });
            //Users in group 'un': user5, user6, user7
            client10.emit('send',{sender: user5.nick, group: 'un', action:'leave', message: ''});
            //now the number of users in the groups is 2, we check it with this number
    
            setTimeout(() => {}, 100);//wait in 0.1s
            client10.on('message', function(data){
                if (data.action == "leave") {
                    assert.equal(data.message, 'User5');
                }
            });
            done();
        });
    });

    //sender_name invites the user receiver_name in the group group_name
    //{sender: sender_name , group: 'group_name', dest: receiver_name, action:'invite'}
    //invite;group_name;dest 
    var client11 = socketio.connect(socketURL);
    describe('=> CASE 11: Invite the user to the group', function(){
        it('The User join the group should be User8', function(done){
            client11.emit('send', { sender: user11.nick, action: 'connection',message: user11.msg });
            //Users in group 'un': user6, user7
            client11.emit('send',{sender: user11.nick, group: 'un', dest: user8.nick, action:'invite', message: ''});
            //now we add user8 to the group
    
            setTimeout(() => {}, 100);//wait in 0.1s
            client11.on('message', function(data){
                if (data.action == "invite") {
                    assert.equal(data.message, 'User8');
                }
            });
            done();
        });
    });

    //sender_name kicks out the user receiver_name from the group group_name with the reason reason
    //{sender: sender_name , group: 'group_name', dest: receiver_name, reason: 'reason', action:'kick'}
    //kick;[group_name];dest;reason
    var client12 = socketio.connect(socketURL);
    describe('=> CASE 12: Kick the user out of the group', function(){
        it('The User is out of the group should be User8', function(done){
            client12.emit('send', { sender: user12.nick, action: 'connection',message: user12.msg });
            //Users in group 'un': user6, user7, user8
            client12.emit('send',{sender: user12.nick, group: 'un', dest: user6.nick, reason: 'a bad user', action:'kick', message: ''});
            //now we kick user6 out of the group -> only have user7 and user8 in group
    
            setTimeout(() => {}, 100);//wait in 0.1s
            client12.on('message', function(data){
                if (data.action == "kick") {
                    assert.equal(data.message, 'User6');
                }
            });
            done();
        });
    });


    //sender_name bans definitively the user receiver_name from group group_name for the reason reason
    //{sender: sender_name , group: 'group_name', dest: receiver_name, reason: 'reason', action:'ban'}
    //ban;[group_name];dest;reason
    var client13 = socketio.connect(socketURL);
    describe('=> CASE 13: Ban the user from the group', function(){
        it('The User ban from the group should be User7', function(done){
            client13.emit('send', { sender: user13.nick, action: 'connection',message: user13.msg });
            //Users in group 'un': user7, user8
            client13.emit('send',{sender: user13.nick, group: 'un', dest: user7.nick, reason: 'a terrible user', action:'ban', message: ''});
            //user7 is banned -> so only have user8 in group

            setTimeout(() => {}, 100);//wait in 0.1s
            client13.on('message', function(data){
                if (data.action == "ban") {
                    assert.equal(data.message, 'User7');
                }
            });
            done();
        });
    });


    //sender_name unbans the user receiver_name from the group group_name
    //{sender: sender_name , group: 'group_name', dest: receiver_name, action:'unban'}
    //unban;[group_name];dest	
    var client14 = socketio.connect(socketURL);
    describe('=> CASE 14: Unban the user from the group', function(){
        it('The User unban from the group should be User7', function(done){
            client14.emit('send', { sender: user14.nick, action: 'connection',message: user14.msg });
            //Users in group 'un':  user8 (user7 is banned)
            client14.emit('send',{sender: user14.nick, group: 'un', dest: user7.nick, action:'unban', message: ''});
            //user7 is unbanned 

            setTimeout(() => {}, 100);//wait in 0.1s
            client14.on('message', function(data){
                if (data.action == "unban") {
                    assert.equal(data.message, 'User7');
                }
            });
            done();
        });
    });


    //sender_name lists all events that occur in the group group_name
    //{sender: sender_name , group: 'group_name', action:'states'}
    //states;group_name
    var client15 = socketio.connect(socketURL);
    describe('=> CASE 15: Test event function for the group', function(){
        it('The event should be okay', function(done){
            client15.emit('send', { sender: user15.nick, action: 'connection',message: user15.msg });
            client15.emit('send',{sender: user15.nick, group: 'un', action:'states', message: ''});

            setTimeout(() => {}, 100);//wait in 0.1s
            client15.on('message', function(data){
                if (data.action == "states") {
                    assert.equal(data.message, 'okay');
                }
            });
            done();
        });
    });
});

