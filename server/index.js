
/*
    Entry file for our server.
    This server is designed to run along side the provided Client code base.
    To see more information on running this server please see the `README.md`
*/

const WebSocketServer = require("ws").Server;
const { INITIALIZE, NODE_CLICKED } = require("./constants").messageTypes;
const ClientMessageHandler = require("./class/ClientMessageHandler");
const Game = require('./class/Game');

// Our websocket server.
const wss = new WebSocketServer({
    port: 8080
});

// When a client connects to our server.
wss.on("connection", ws => {
    const cmh = new ClientMessageHandler(ws);
    const game = new Game();
    cmh.subscribe(INITIALIZE, game.initialize);
    cmh.subscribe(NODE_CLICKED, game.nodeClicked);
});

// Display a message when the server starts.
wss.on("listening", () => {
    console.log(`
        Game Server Listening at ws://localhost:8080/
    `);
});
