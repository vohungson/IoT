# TD1

The main aim of this project is to build a *tchat* application similar to *IRC* leveraging on a client/server architecture. In particular, you will design an application that enables users to exchange messages. To achieve this aim, you will use the *websocket* protocol.

> You must use the node.js library named
[socket.io](https://socket.io) either for the client and server side.

> Both the client and the server are developed using node.js. Note that the client is not running inside a web browser but **must be** a command line application.

1. You can have a look to the main [documentation](https://socket.io/docs/) to have details of the library.

1. In your project directory you should have at least to directory, one for client-side and one another for the server side of the application.

> In the directory dedicated to the code of the **client**, you must install the client side of the socket.io library. For example: ```npm install socket.io-client```

> In the directory dedicated to the code of the **server**, you must install the server side of the socket.io library. For example: ```npm install socket.io```

> Clients and servers must be interoperables. To this end we define the format of each exchange messages. **All messages exchanged between clients and servers must be in a Json format**. Specifications for message requests are given, you must give your specification for message responses. Specification for message responses must be the same for all groups.

1. Implement the function **connection** to enable a client to connect to the server.

|Format du message
|:---------------:|
|``` {sender: sender_name ,action:'connection'}```|


2. Implement the function **broadcast**
    - **broadcast** sends a message to connected persons

![Alt text](images/broadcast.png?raw=true "broadcast")

|command | message  | Json format | Comments
| :------------| :------------ |:---------------:|:---------------:|
|b;`hello` | broadcast     |       ``` {sender: sender_name ,msg: message_content ,action:'broadcast'}```      |  `sender_name` broadcasts the message `message_content`  

3. Implement the **list** command
    - **list** asks to the server the lists of connected users

|Command | Message  | Json format | Commments|
| :------------| :------------ |:---------------:|:---------------:|
|ls;| list   |       ``` {sender: sender_name ,action:'list'}```       |   `sender_name` lists the connected clients

4. Implement the **quit** command
    - **quit** enables to quit properly the connected user.

|Command | Message  | Json format  | comments
| :------------| :------------ |:---------------:|:---------------:|
|q;| quit   |        ``` {sender: sender_name ,action:'quit'}``` | `sender_name` quit the server

5. Implement notification. Users must be automatically notified when a new person is connected or disconnected.

    ![Alt text](images/notifications.png?raw=true "notifications")
6. Give the spécification (in terms of message format in JSON) of the messages SENT by the server. The specification must be the same for all clients and server.
