/*
    Copyright 2008-2025
        Matthias Ehmann,
        Michael Gerhaeuser,
        Carsten Miller,
        Bianca Valentin,
        Alfred Wassermann,
        Peter Wilfahrt

    This file is part of JSXGraph.

    JSXGraph is free software dual licensed under the GNU LGPL or MIT License.

    You can redistribute it and/or modify it under the terms of the

      * GNU Lesser General Public License as published by
        the Free Software Foundation, either version 3 of the License, or
        (at your option) any later version
      OR
      * MIT License: https://github.com/jsxgraph/jsxgraph/blob/master/LICENSE.MIT

    JSXGraph is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License and
    the MIT License along with JSXGraph. If not, see <https://www.gnu.org/licenses/>
    and <https://opensource.org/licenses/MIT/>.
 */

/*global JXG2:true, define: true*/
/*jslint nomen: true, plusplus: true*/

import { JXG2 } from "../jxg.js";
import { JSXMath } from "./math.js";
import { Geometry } from "./geometry.js";
import { Type } from "../utils/type.js";

/**
 * Instantiate a new quadtree.
 *
 * @name Geometry.Quadtree
 * @exports JXG2.JSXMath.Quadtree as Geometry.Quadtree
 * @param {Array} bbox Bounding box of the new quad (sub)tree.
 * @param {Object} config Configuration object. Default value: to {capacity: 10}
 * @param {Object} [parent] Parent object or null if root.
 *
 * @constructor
 */
export class Quadtree {

    /**
     * Configuration object for quadtree.
     *
     * @name Geometry.Quadtree.config
     * @type Object
     */
    config: {
        /**
         * The maximum number of points stored in a quadtree node
         * before it is subdivided.
         * @name Geometry.Quadtree.config#capacity
         * @type Number
         * @default 10
         */
        capacity: number,
        /**
         * Type of a point object. Possible values are:
         * 'coords', 'object'.
         * @name Geometry.Quadtree.config#pointType
         * @type String
         * @default 'coords'
         */
        pointType: string
        parent?: Quadtree
    }


    /**
     * Point storage.
     * @name Geometry.Quadtree#points
     * @type Array
     */
    points = [];

    xlb
    xub
    ylb
    yub

    /**
     * Parent quadtree or null if there is not parent.
     *
     * @name Geometry.Quadtree#parent
     * @type Geometry.Quadtree
     *
     */
    parent = Quadtree || null;

    /**
     * In a subdivided quadtree this represents the top left subtree.
     * @name Geometry.Quadtree#northWest
     * @type Geometry.Quadtree
     */
    northWest = null;

    /**
     * In a subdivided quadtree this represents the top right subtree.
     * @name Geometry.Quadtree#northEast
     * @type Geometry.Quadtree
     */
    northEast = null;

    /**
     * In a subdivided quadtree this represents the bottom right subtree.
     * @name Geometry.Quadtree#southEast
     * @type Geometry.Quadtree
     */
    southEast = null;

    /**
     * In a subdivided quadtree this represents the bottom left subtree.
     * @name Geometry.Quadtree#southWest
     * @type Geometry.Quadtree
     */
    southWest = null;

    constructor(bbox, config = { capacity: 10, pointType: 'coords', parent: null}) {
        this.config = config

        this.xlb = bbox[0];
        this.xub = bbox[2];
        this.ylb = bbox[3];
        this.yub = bbox[1];
    }
    /**
     * Checks if the given coordinates are inside of the boundaries of the quadtree.
     * The quadtree is open to the left and botton and closed to
     * right and top.
     *
     * @param {Number} x
     * @param {Number} y
     * @returns {Boolean}
     */
    contains(x, y) {
        return this.xlb < x && x <= this.xub && this.ylb < y && y <= this.yub;
    }

    /**
     * Insert a new point into this quadtree if it is inside of
     * the quadtree's boundaries.
     *
     * @param {JXG2.Coords} p
     * @returns {Boolean} true if insert succeeded, false otherwise.
     */
    insert(p) {
        switch (this.config.pointType) {
            case 'coords':
                if (!this.contains(p.usrCoords[1], p.usrCoords[2])) {
                    return false;
                }
                break;
            case 'object':
                if (!this.contains(p.x, p.y)) {
                    return false;
                }
                break;
        }

        if (this.points.length < this.config.capacity && this.northWest === null) {
            this.points.push(p);
            return true;
        }

        // At this point the point has to be inserted into a subtree.
        if (this.northWest === null) {
            this.subdivide();
        }

        if (this.northWest.insert(p)) {
            return true;
        }

        if (this.northEast.insert(p)) {
            return true;
        }

        if (this.southEast.insert(p)) {
            return true;
        }

        return !!this.southWest.insert(p);
    }

    /**
     * Subdivide the quadtree.
     */
    subdivide() {
        var // i, le,
            cx = this.xlb + (this.xub - this.xlb) * 0.5,
            cy = this.ylb + (this.yub - this.ylb) * 0.5;

        this.northWest = new JXG2.JSXMath.Quadtree([this.xlb, this.yub, cx, cy], this.config, this);
        this.northEast = new JXG2.JSXMath.Quadtree([cx, this.yub, this.xub, cy], this.config, this);
        this.southEast = new JXG2.JSXMath.Quadtree([this.xlb, cy, cx, this.ylb], this.config, this);
        this.southWest = new JXG2.JSXMath.Quadtree([cx, cy, this.xub, this.ylb], this.config, this);

        // for (i = 0; i < le; i++) {
        //     if (this.northWest.insert(this.points[i])) { continue; }
        //     if (this.northEast.insert(this.points[i])) { continue; }
        //     if (this.southEast.insert(this.points[i])) { continue; }
        //     this.southWest.insert(this.points[i]);
        // }
    }

    /**
     * Internal _query method that lacks adjustment of the parameter.
     * @name Geometry.Quadtree#_query
     * @param {Number} x
     * @param {Number} y
     * @returns {Boolean|JXG2.Quadtree} The quadtree if the point is found, false
     * if none of the quadtrees contains the point (i.e. the point is not inside
     * the root tree's AABB,i.e. axis-aligned bounding box).
     * @private
     */
    _query(x, y) {
        var r;

        if (this.contains(x, y)) {
            if (this.northWest === null) {
                return this;
            }

            r = this.northWest._query(x, y);
            if (r) {
                return r;
            }

            r = this.northEast._query(x, y);
            if (r) {
                return r;
            }

            r = this.southEast._query(x, y);
            if (r) {
                return r;
            }

            r = this.southWest._query(x, y);
            if (r) {
                return r;
            }
        }

        return false;
    }

    /**
     * Retrieve the smallest quad tree that contains the given coordinate pair.
     * @name Geometry.Quadtree#query
     * @param {JXG2.Coords|Number} xp
     * @param {Number} y
     * @returns {Boolean|JXG2.Quadtree} The quadtree if the point is found, false
     * if none of the quadtrees contains the point (i.e. the point is not inside
     * the root tree's AABB (Axis-Aligned Bounding Box)).
     */
    query(xp, y) {
        var _x, _y;

        if (Type.exists(y)) {
            _x = xp;
            _y = y;
        } else {
            _x = xp.usrCoords[1];
            _y = xp.usrCoords[2];
        }

        return this._query(_x, _y);
    }

    /**
     * Check if the quadtree has a point which is inside of a sphere of
     * radius tol around [x, y].
     * @param {Number} x
     * @param {Number} y
     * @param {Number} tol
     * @returns {Boolean}
     */
    hasPoint(x, y, tol) {
        var r, i, le;

        if (this.contains(x, y)) {
            le = this.points.length;

            switch (this.config.pointType) {
                case 'coords':
                    for (i = 0; i < le; i++) {
                        if (Geometry.distance([x, y], this.points[i].usrCoords.slice(1), 2) < tol) {
                            return true;
                        }
                    }
                    break;
                case 'object':
                    for (i = 0; i < le; i++) {
                        if (Geometry.distance([x, y], [this.points[i].x, this.points[i].y], 2) < tol) {
                            return true;
                        }
                    }
                    break;
            }


            if (this.northWest === null) {
                return false;
            }

            r = this.northWest.hasPoint(x, y, tol);
            if (r) {
                return r;
            }

            r = this.northEast.hasPoint(x, y, tol);
            if (r) {
                return r;
            }

            r = this.southEast.hasPoint(x, y, tol);
            if (r) {
                return r;
            }

            r = this.southWest.hasPoint(x, y, tol);
            if (r) {
                return r;
            }
        }

        return false;
    }

    /**
     *
     * @returns {Array}
     */
    getAllPoints() {
        var pointsList = [];
        this.getAllPointsRecursive(pointsList);
        return pointsList;
    }

    /**
     *
     * @param {Array} pointsList
     * @private
     */
    getAllPointsRecursive(pointsList) {
        Array.prototype.push.apply(pointsList, this.points.slice());

        if (this.northWest === null) {
            return;
        }

        this.northWest.getAllPointsRecursive(pointsList);
        this.northEast.getAllPointsRecursive(pointsList);
        this.southEast.getAllPointsRecursive(pointsList);
        this.southWest.getAllPointsRecursive(pointsList);
    }

}
