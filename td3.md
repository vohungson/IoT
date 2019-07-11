# TD3

To develop any software, you need to have good practices. In particular, you need to test your software. In particular, you must test both the client and the server side of your application independently for each implemented fonctions (messages sent and received). For instance, you must implement different use cases to test if the server behaves in the right manner for broadcasts operations, for private messages, for group management...

1. Setup good practices and develop a testbed to test the server side of your application. Use the node.js client version of socket.io to implement your tests (socket.io-client). You may have a look to [mocha](https://mochajs.org),
[chai](https://www.chaijs.com) to use as a testing frameworks in pair with `socket.io-client` to test the behavior of your server.

2. Test all the features of your server, different scenario. 

3. (Bonus question). Setup good practices and develop a testbed to test the client side of your application by mocking the server.
