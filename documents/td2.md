# TD2

1. Add the management of private messages.

|Command| Message  | JSON Format | Comments
| :------------| :------------ |:---------------:|:---------------:|
|s;david;`hello` | send     |       ``` {sender: sender_name, dest: receiver_name ,msg: message_content ,action:'send'}```      |  `sender_name` sends the message `message_content` to `receiver_name`

4. Add group management

|commande| Message  | Format du message | commentaires
| :------------| :------------ |:---------------:|:---------------:|
|cg;wob | create groupe     |       ``` {sender: sender_name, group: group_name ,action:'cgroupe'}```      |  `sender_name` creates the group `group_name`|
|j;wob | join     |       ``` {sender: sender_name, group: group_name ,action:'join'}```      |  `sender_name` joins the group `group_name`|
|bg;wob;`hello` | broadcast group     |       ``` {sender: sender_name ,group: group_name, msg: message_content ,action:'gbroadcast'}```      |  `sender_name` broadcasts the message `message_content` in the group `group_name`|
|members;wob| list   |       ``` {sender: sender_name ,group: 'group_name', action:'members'}```       |   `sender_name` lists all clients that are inside `group_name`
|messages;wob| list messages   |       ``` {sender: sender_name ,group: 'group_name', action:'msgs'}```       |   `sender_name` lists the history of messages exchanged in the group `group_name`
|groups;| group list   |       ``` {name: sender_name ,action:'groups'}```       |   `sender_name` lists the existing groups
|leave;wob| leave   |        ``` {sender: sender_name,group: 'group_name' ,action:'leave'}``` |    `sender_name` leaves the group `group_name`
|invite;[group];dest| invite   |        ``` {sender: sender_name , group: 'group_name', dest: receiver_name, action:'invite'}``` |    `sender_name` invites the user `receiver_name` in the group `group_name`
|kick;[group];dest;reason| kick   |        ``` {sender: sender_name , group: 'group_name', dest: receiver_name, reason: 'reason', action:'kick'}``` |    `sender_name` kicks out the user `receiver_name` from the group  `group_name` with the reason `reason`|
|ban;[group];dest;reason| ban   |        ``` {sender: sender_name , group: 'group_name', dest: receiver_name, reason: 'reason', action:'ban'}``` |    `sender_name` bans definitively the user `receiver_name` from group `group_name` for the reason `reason`|
|unban;[group];dest| unban   |        ``` {sender: sender_name , group: 'group_name', dest: receiver_name, action:'unban'}``` |    `sender_name` unbans the user `receiver_name` from the group `group_name`|
|states;wob| list states   |       ``` {sender: sender_name , group: 'group_name', action:'states'}```       |   `sender_name` lists all events that occur in the group `group_name`

5. You must give the specification of the response in JSON. All clients and servers must be interoperable.

6. Add the management of private and public groups. Update accordingly the specification.

7. Use a database such as `sqlite`, and in particular the `sqlite3` module to save data from users, such as their conversations. Each client must get back the history of messages sent and receive with all its friends. The same apply for group communications.
