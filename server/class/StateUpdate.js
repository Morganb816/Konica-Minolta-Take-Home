/**
 * @name StateUpdate
 * @class
 * @classdesc The body of an outgoing state update message.
 * @exports
 * @property {Line | null} newLine A new line to create on the client.
 * @property {string} heading String to display above the board on the client.
 * @property {string} message String to display below the board on the client.
 */
class StateUpdate {
    constructor(newLine = null, heading = '', message = '') {
        this.newLine = newLine;
        this.heading = heading;
        this.message = message;
    }
}

module.exports = StateUpdate;