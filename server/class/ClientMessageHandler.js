/**
 * @name ClientMessageHandler
 * @class
 * @classdesc Used to handle subscribing to incoming client messages
 * @exports
 * @property {WebSocket} client Client connection to our web socket server.
 * @property {object} subs Subscriptions to client message types
 */
class ClientMessageHandler {
    constructor(client) {
        this.client = client;
        this.subs = {};
        this.lastId = 0;
        this.lastMessageSent = null;
        this.client.on('message', (msg) => this.handleMessage(JSON.parse(msg)));
    }

    /**
     * @name handleMessage
     * @method
     * @description Handles incoming messages triggering any subscribed callbacks.
     * @param {Payload} payload
     */
    handleMessage({id, msg: msgType, body}) {
        
        if (id === this.lastId && id !== 0) {
            this.client.send(this.lastMessageSent);
            console.warn('Resending last sent message per request from client');
            return;
        }
        
        if (!this.subs[msgType]) {
            console.warn(`No listener for type ${msgType} found but message received from client...`);
            return;
        }
        const results = this.subs[msgType](body);
        this.lastMessageSent = JSON.stringify({
            id,
            ...results
        });
        this.client.send(this.lastMessageSent);
    }

    /**
     * @name subscribe
     * @method
     * @description Handles the subscription to a given client message.
     * @throws {Error}
     * @param {string} msgType Type of message to subscribe to
     * @param {function} listener Callback to run when a message of given type is received.
     */
    subscribe(msgType, listener) {
        if (this.subs[msgType]) {
            throw new Error(`Subscriber for ${msgType} already registered. Please unsubscribe before trying to register a new listener.`);
        }

        this.subs[msgType] = listener;
    }

    /**
     * @name unsubscribe
     * @method
     * @description Removes a listener from a client message subscription.
     * @throws {Error}
     * @param {string} msgType Type of message to unsubscribe a callback from.
     */
    unsubscribe(msgType) {
        if (!this.subs[msgType]) {
            throw new Error(`Subscriber for message type ${msgType} not found.`);
        }

        delete this.subs[msgType];
    }
}

module.exports = ClientMessageHandler;