const express = require('express');
const server = require('http').createServer();
const app = express();

app.get('/', function(req, res) {
    res.sendFile('index.html', {root: __dirname});
});

server.on('request', app);
server.listen(3000, function() { console.log('Server started on port 3000'); });


// BEGIN WEBSOCKET //

const WebSocketServer = require('ws').Server;

const wss = new WebSocketServer({server: server});  // attaching a websocket server to existing Express server

wss.on('connection', function connection(ws) {
    const numClients = wss.clients.size;            // number of clients connected
    console.log('Clients connected', numClients);

    wss.broadcast(`Current visitors: ${numClients}`);   // broadcasting message number of clients to all connected clients

    if (ws.readyState === ws.OPEN) {
        ws.send('Welcome to my server');    // Sending message to the client who gets connected
    }

    ws.on('close', function close() {
        wss.broadcast(`Current visitors: ${numClients}`);   // broadcasting message number of clients to all connected clients
        console.log('A client has disconnected');   // sending a message to client on disconnection of a client
    });
});

wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
        client.send(data);
    });
}
