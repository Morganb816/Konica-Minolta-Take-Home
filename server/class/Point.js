/**
 * @name Point
 * @class
 * @classdesc A point on a plane.
 * @exports
 * @property {number} x X position on plane.
 * @property {number} y Y position on plane.
 */
class Point {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
}

module.exports = Point;