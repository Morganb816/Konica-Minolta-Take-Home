/**
 * @name Line
 * @class
 * @classdesc A line on a plane.
 * @exports
 * @property {Point} start Start point on the plane.
 * @property {Point} end End point on the plane.
 */
class Line {
    constructor(start, end) {
        this.start = start;
        this.end = end;
    }
}

module.exports = Line;