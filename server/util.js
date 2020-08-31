/**
 * @name assignWithNesting
 * @function
 * @exports
 * @description Allows for nested property assignment without the usual undefined errors popping up.
 * ex. assignWithNesting(obj, 'a', 'b', 'c', true) will output
 * {
 *   a: {
 *      b: {
 *          c: true
 *      }
 *   }
 * }
 * @param {object} obj - Object to assign property to.
 * @param {string} string* - any amount of property names 
 * @param {any} value - value to assign to last property name in arguments list
 */
function assignWithNesting(obj) {
    for (let i = 1; i < arguments.length - 1; i++) {
        if (i === arguments.length - 2) {
            obj[arguments[i]] = arguments[arguments.length - 1];
        } else {
            if (!obj[arguments[i]]) {
                obj[arguments[i]] = {};
            }
            obj = obj[arguments[i]];
        }
    }
}

/**
 * @name onSegment
 * @function
 * @description Given three points p, q, and r, the function checks if
 * the point q lies on the line segment p -> r.
 * @param {Point} p Point p
 * @param {Point} q Point q
 * @param {Point} r Point r
 * @returns {boolean}
 */
function onSegment(p, q, r) {
    if (!pointsAreCollinear(p, r, q)) {
        return false;
    }
    // Given three colinear points p, q, r, the function checks if the point q lies on the colinear points p and r.
    if (q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) && q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y)) {
        return true;
    }
    return false;
}

/**
 * @name orientation
 * @function
 * @description Checks wether three points are clockwise, counter clockwise, or linear in relation to each other.
 * For more information on the formula used check out -> https://www.geeksforgeeks.org/orientation-3-ordered-points/
 * @param {Point} p Point p
 * @param {Point} q Point q
 * @param {Point} r Point r
 * @returns {number} 0 is linear, 1 is clockwise, 2 is counterclockwise.
 */
function orientation(p, q, r) {
    const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);

    return val === 0
        ? 0
        : val > 0
            ? 1
            : 2;
}

/**
 * @name pointsAreCollinear
 * @function
 * @description Checks wether points p, q, and r are collinear.
 * @param {Point} p Point p
 * @param {Point} q Point q
 * @param {Point} r Point r
 */
function pointsAreCollinear(p, q, r) {
    const area = p.x * (q.y - r.y) + q.x * (r.y - p.y) + r.x * (p.y - q.y);
    return area === 0
        ? true
        : false
}

/**
 * @name pointsAreEqual
 * @function
 * @exports
 * @description Checks wether two points are equal to each other.
 * @param {Point} p Point p
 * @param {Point} q Point 1
 */
function pointsAreEqual(p, q) {
    if (p.x === q.x && p.y === q.y) {
        return true;
    }
    return false;
}

/**
 * @name doIntersect
 * @function
 * @exports
 * @description Checks wether or not two line segments intersect each other.
 * Check out the following for more information. -> https://www.geeksforgeeks.org/check-if-two-given-line-segments-intersect/
 * @param {Point} p1 Point p1
 * @param {Point} q1 Point q1
 * @param {Point} p2 Point p2
 * @param {Point} q2 Point q2
 * @returns {boolean}
 */
function doIntersect(p1, q1, p2, q2) {
    // lines touch on a tip and are not the same line. return false.
    // In our game we need to start on the tip of a previous line
    // Check if any points are equal to each other and if so make
    // sure the other point is not collinear or also equal.
    if (
        (pointsAreEqual(p1, p2) && !pointsAreEqual(q1, q2) && !onSegment(p2, q1, q2)) ||
        (pointsAreEqual(p1, q2) && !pointsAreEqual(q1, p2) && !onSegment(p2, q1, q2)) ||
        (pointsAreEqual(q1, p2) && !pointsAreEqual(p1, q2) && !onSegment(p2, p1, q2)) ||
        (pointsAreEqual(q1, q2) && !pointsAreEqual(p1, p2) && !onSegment(p2, p1, q2))
    ) {
        return false;
    }

    // Collect orientations of line segments to determin collision.
    const o1 = orientation(p1, q1, p2);
    const o2 = orientation(p1, q1, q2);
    const o3 = orientation(p2, q2, p1);
    const o4 = orientation(p2, q2, q1);

    // General case. Orientations of orientation check pairs do not match.
    if (o1 !== o2 && o3 !== o4) {
        return true;
    }
    // p1, q1 and p2 are colinear and p2 lies on segment p1q1
    if (o1 == 0 && onSegment(p1, p2, q1)) {
        return true;
    }
    // p1, q1 and p2 are colinear and p2 lies on segment p1q1
    if (o2 == 0 && onSegment(p1, q2, q1)) {
        return true;
    }
    // p2, q2 and p1 are colinear and p1 lies on segment p2q2
    if (o3 == 0 && onSegment(p2, p1, q2)) {
        return true;
    }
    // p2, q2 and q1 are colinear and q1 lies on segment p2q2
    if (o4 == 0 && onSegment(p2, q1, q2)) {
        return true;
    }

    // Line segments do not intersect.
    return false;
}

module.exports = {
    assignWithNesting,
    doIntersect,
    pointsAreEqual
}