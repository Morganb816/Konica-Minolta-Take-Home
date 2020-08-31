const Line = require("./Line");
const Point = require("./Point");
const { assignWithNesting, doIntersect, pointsAreEqual } = require("../util");
const { initializeMsg, invalidStartNodeMsg, validStartNodeMsg, invalidEndNodeMsg, gameOverMsg, validEndNodeMsg } = require("../messageCreators");

/**
 * @name Game
 * @class
 * @classdesc Instance of a game.
 * @exports
 * @property {number} playersTurn Either 1 or 2 depending on the current players turn.
 * @property {function | null} finishTurn Function to end a current turn.
 * @property {number[]} head Head of our line.
 * @property {number[]} tail Tail of our line.
 * @property {object} taken Map of taken nodes. {x: {y: true}}
 * @property {Line[]} lines Array of lines that can be used to check against intersects
 */
class Game {
    constructor() {
        this.playersTurn = 1;
        this.finishTurn = null;
        this.head = null;
        this.tail = null;
        this.taken = {};
        this.lines = [];

        this.initialize = this.initialize.bind(this);
        this.nodeClicked = this.nodeClicked.bind(this);
    }

    /**
     * @name initialize
     * @method
     * @returns {Partial<Payload>}
     * @description Initializes our game. Mostly used to inform client we are ready.
     */
    initialize() {
        return initializeMsg(this.playersTurn);
    }

    /**
     * @name nodeClicked
     * @method
     * @returns {Partial<Payload>}
     * @description Node clicked is used when we receive a message from a client that someone clicked a node.
     * Depending on what stage of a turn we are in it will either handle start nodes, or end nodes.
     * @param {Point} point Node that was clicked. 
     */
    nodeClicked({ x, y }) {
        // If this is the start of a players turn.
        if (!this.finishTurn) {
            return this.handleStartTurn(x, y);
            // If this is the end of a players turn.
        } else {
            const results = this.finishTurn(x, y);
            this.finishTurn = null;
            return results;
        }
    }

    /**
     * @name handleStartTurn
     * @method
     * @returns {Partial<Payload>}
     * @description Handles the start of a players turn. Also sets the end turn funciton for later on.
     * @param {number} x X point on plane.
     * @param {number} y Y point on plane.
     */
    handleStartTurn(x, y) {
        // If the selected node is not valid.
        if (!this.isValidStartNode(x, y)) {
            return invalidStartNodeMsg(this.playersTurn);
        }

        // Set current turn to a function that is used to end this players turn.
        this.finishTurn = this.createEndTurn(x, y);
        // Return valid start node
        return validStartNodeMsg(this.playersTurn);
    }

    /**
     * @name createEndTurn
     * @method
     * @returns {function}
     * @description Returns a function that can be called to handle the end of a players turn
     * @param {number} x X point on plane.
     * @param {number} y Y point on plane.
     */
    createEndTurn(x, y) {
        return (x2, y2) => {
            let isFirstTurn = this.head === null;
            // If the selected destination node is not valid.
            if (!this.isValidLine(x, y, x2, y2)) {
                return invalidEndNodeMsg(this.playersTurn);
            }
            // If this is not the first move of the game.
            if (!isFirstTurn) {
                // If our origin node was the head. Update head to destination node.
                if (this.isHeadOrTail(x, y) === 1) {
                    this.head = [x2, y2];
                // If our origin node was the tail. Update tail to destination node.
                } else {
                    this.tail = [x2, y2];
                }
            }

            // Swap players.
            this.playersTurn = this.playersTurn === 1 ? 2 : 1;

            // Clear the end turn function.
            this.finishTurn = null;

            // Set nodes as taken and all nodes inbetween if neccesary.
            // setting start node is kind of redundant but needs to happen on first step of game.
            // for sake of cleanliness set it hear instead of having a is first move block.
            assignWithNesting(this.taken, x2, y2, true);
            assignWithNesting(this.taken, x, y, true);

            // Add the created line segment to our line cache.
            this.lines.push(new Line(new Point(x, y), new Point(x2, y2)));
            // If this move wins the game. We run this last so that all updates are ready to check for a winning condition.
            // Other wise send valid end node msg to continue game.
            return this.gameIsWon()
                ? gameOverMsg(this.playersTurn, new Line(new Point(x, y), new Point(x2, y2)))
                : validEndNodeMsg(this.playersTurn, new Line(new Point(x, y), new Point(x2, y2)));
        }
    }

    /**
     * @name isValidLine
     * @method
     * @returns {boolean}
     * @description Returns true or false for a given Line if it can be created for our current game state.
     * @param {number} x Start x position on plane.
     * @param {number} y Start y position on plane.
     * @param {number} x2 End x position on plane.
     * @param {number} y2 End y position on plane.
     */
    isValidLine(x, y, x2, y2) {
        // Slope
        let changeInY = y - y2;
        let changeInX = x - x2;
        let acceptableSlope = Math.abs(changeInY / changeInX);
        // If the change in x is 0 mark the slope as acceptable
        if (changeInX === 0) {
            acceptableSlope = 1;
        // Other wise check if the slope is acceptable (1 even rise over run, or 0 Horizontal line).
        } else if (acceptableSlope !== 1 && acceptableSlope !== 0) {
            return false;
        }

        // If points are the same point
        if (pointsAreEqual(new Point(x, y), new Point(x2, y2))) {
            return false;
        }

        // Head and Tail
        // If this is the first turn of the game
        if (this.head === null && this.tail === null) {
            this.head = [x, y];
            this.tail = [x2, y2];
            return true;
        }

        // If this is not the current head or tail.
        if (!this.isHeadOrTail(x, y)) {
            return false;
        }

        // If the destination node is taken.
        if (this.taken?.[x2]?.[y2]) {
            return false;
        }

        // If line intersects with any of our other lines.
        for (let i = 0; i < this.lines.length; i ++) {
            if (doIntersect(new Point(x, y), new Point(x2, y2), this.lines[i].start, this.lines[i].end)) {
                return false;
            }
        }

        // Is a valid line.
        return true;
    }

    /**
     * @name isHeadOrTail
     * @method
     * @returns {number}
     * @description Returns either 1, 2 or 0 depending on if the input node is the current head, tail or neither of our line.
     * @param {number} x X position on plane.
     * @param {nubmer} y Y position on plane.
     */
    isHeadOrTail(x, y) {
        // If this is the current head of our line.
        if (this.head[0] === x && this.head[1] === y) {
            return 1;
        }
        // If this is the current tail of our line.
        if (this.tail[0] === x && this.tail[1] === y) {
            return 2;
        }
        // This is neither our head or tail.
        return 0;
    }

    /**
     * @name isValidStartNode
     * @method
     * @returns {boolean}
     * @description Returns true or false if a point is selectable for our current game state.
     * @param {number} x X position on plane.
     * @param {number} y Y position on plane.
     */
    isValidStartNode(x, y) {
        // In range
        if (x < 0 || x > 3 || y < 0 || y > 3) {
            return false;
        }
        // Is the first turn of the game
        if (this.head === null) {
            return true;
        }
        // If this is not the head or tail of our line.
        if (!this.isHeadOrTail(x, y)) {
            return false;
        }
        // Passed all cases is valid start node.
        return true;
    }

    /**
     * @name gameIsWon
     * @method
     * @description Checks wether or not the game has been won. Checks surrounding nodes of head and tail for valid move to take.
     * @returns {boolean}
     * @description Returns true or false if the game is won or not.
     */
    gameIsWon() {
        for (let y = this.tail[1] - 1; y <= this.tail[1] + 1; y ++) {
            for (let x = this.tail[0] - 1; x <= this.tail[0] + 1; x ++) {
                if (x < 0 || y < 0 || x > 3 || y > 3) {
                    continue;
                } else if (this.isValidLine(this.tail[0], this.tail[1], x, y)) {
                    return false;
                }
            }
        }

        for (let y = this.head[1] - 1; y <= this.head[1] + 1; y ++) {
            for (let x = this.head[0] - 1; x <= this.head[0] + 1; x ++) {
                if (x < 0 || y < 0 || x > 3 || y > 3) {
                    continue;
                } else if (this.isValidLine(this.head[0], this.head[1], x, y)) {
                    return false;
                }
            }
        }
        return true;
    }
}

module.exports = Game;