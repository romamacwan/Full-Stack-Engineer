const express = require('express');
const server = require('http').createServer();
const app = express();

app.get('/', function(req, res) {
    res.sendFile('index.html', {root: __dirname});
});

server.on('request', app);
server.listen(3000, function() { console.log('Server started on port 3000'); });

// append this code when creating db and call shutting down db
process.on('SIGINT', () => {
    // when we kill server with Ctrl + C, we will go through every single web socket connection and close them
    // then close the server
    // then shut down the db
    wss.clients.forEach(function each(client) {
        client.close();
    });
    server.close(() => {
        shutdownDB();
    });
});


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

    // append this code when creating db
    db.run(`INSERT INTO visitors (count, time)
        VALUES (${numClients}, datetime('now'))
    `);

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

// END WEBSOCKET //


// BEGIN DATABASE //
const sqlite = require('sqlite3');
const db = new sqlite.Database(':memory:');

db.serialize(() => {        // ensures the db is setup before we run any queries
    db.run(`
        CREATE TABLE visitors (
            count INTEGER,
            time TEXT
        )
    `);
});

function getCounts() {
    db.each("SELECT * FROM visitors", (err, row) => {
        console.log(row);
    });
}

function shutdownDB() {
    getCounts();
    console.log('Shutting down db');
    db.close();
}
