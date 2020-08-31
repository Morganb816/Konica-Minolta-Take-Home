const { INITIALIZE, INVALID_END_NODE, INVALID_START_NODE, VALID_END_NODE, VALID_START_NODE, GAME_OVER } = require('./constants').messageTypes;
const StateUpdate = require("./class/StateUpdate");

/**
 * @name playersTurnHeader
 * @function
 * @exports
 * @description Creates a player turn header for our messages.
 * @param {number} player Player 1 or 2.
 */
const playersTurnHeader = player => `Player ${player}`

/**
 * @name initializeMsg
 * @function
 * @exports
 * @description Creates an initialize message for the client.
 * @param {number} playersTurn Palyer 1 or 2.
 * @returns {Partial<StateUpdate>}
 */
const initializeMsg = playersTurn => ({
    msg: INITIALIZE,
    body: new StateUpdate(null, playersTurnHeader(playersTurn), "Awaiting Player 1's Move")
});

/**
 * @name invalidStartNodeMsg
 * @function
 * @exports
 * @description Creates an invalid start node message for the client.
 * @param {number} playersTurn Palyer 1 or 2.
 * @returns {Partial<StateUpdate>}
 */
const invalidStartNodeMsg = playersTurn => ({
    msg: INVALID_START_NODE,
    body: new StateUpdate(null, playersTurnHeader(playersTurn), "Not a valid starting position")
});

/**
 * @name validStartNodeMsg
 * @function
 * @exports
 * @description Creates an valid start node message for the client.
 * @param {number} playersTurn Palyer 1 or 2.
 * @returns {Partial<StateUpdate>}
 */
const validStartNodeMsg = playersTurn => ({
    msg: VALID_START_NODE,
    body: new StateUpdate(null, playersTurnHeader(playersTurn), "Select a second node to complete the line.")
});

/**
 * @name validEndNodeMsg
 * @function
 * @exports
 * @description Creates an valid end node message for the client.
 * @param {number} playersTurn Palyer 1 or 2.
 * @param {Line} line Newly created line
 * @returns {Partial<StateUpdate>}
 */
const validEndNodeMsg = (playersTurn, line) => ({
    msg: VALID_END_NODE,
    body: new StateUpdate(line, playersTurnHeader(playersTurn), null)
});

/**
 * @name invalidEndNodeMsg
 * @function
 * @exports
 * @description Creates an invalid end node message for the client.
 * @returns {Partial<StateUpdate>}
 * @param {number} playersTurn Palyer 1 or 2.
 */
const invalidEndNodeMsg = playersTurn => ({
    msg: INVALID_END_NODE,
    body: new StateUpdate(null, playersTurnHeader(playersTurn), "Invalid move!")
});

/**
 * @name gameOverMsg
 * @function
 * @exports
 * @description Creates an game over message for the client.
 * @param {number} playersTurn Palyer 1 or 2.
 * @param {Line} line Newly created line that wins the game.
 * @returns {Partial<StateUpdate>}
 */
const gameOverMsg = (playersTurn, line) => ({
    msg: GAME_OVER,
    body: new StateUpdate(line, "Game Over", `Player ${playersTurn} Wins!`)
});

module.exports = {
    initializeMsg,
    invalidStartNodeMsg,
    invalidEndNodeMsg,
    validStartNodeMsg,
    validEndNodeMsg,
    gameOverMsg
}