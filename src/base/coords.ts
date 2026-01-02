const dbug = (elem) => elem && elem.id === "jxgBoard1L9";
const dbugColor = `color:black;background-color:white`;

// TODO: need a way to mark Coord as invalid.   Geometry often sends [0, NaN, NaN] or Coords



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

/*global JXG2: true, define: true, AMprocessNode: true, MathJax: true, document: true */
/*jslint nomen: true, plusplus: true*/

import type { Board } from './board.js'
import { Events } from '../utils/event.js'
import { JSXMath } from "../math/math.js";
import { COORDS_BY, OBJECT_TYPE, OBJECT_CLASS } from "./constants.js";
import { GeometryElement } from "./element.js";
// import { GeometryElementOptions } from "../optionInterfaces.js";

/**
 * @fileoverview In this file the Coords object is defined, a class to manage all
 * properties and methods coordinates usually have.
 */


export class Coords extends Events {   // tbtb - should NOT extend event!!
    /**
   * Stores the board the object is used on.
   */
    public board: Board
    /**
     * Stores coordinates for user view as homogeneous coordinates.
     * @type Array
     */
    public usrCoords: number[]
    /**
     * Stores coordinates for screen view as homogeneous coordinates.
     * @type Array
     */
    public scrCoords: number[]
    /**
     * If true, this coordinates object will emit update events every time
     * the coordinates are set.
     * @type boolean
     * @default true
     */
    public emitter: boolean = true

    public method: COORDS_BY

    public elem: GeometryElement

    public _t:number = 0    // this is used in Plot.  need to document

    /**
     * Constructs a new Coordinates object.
     * @class This is the Coordinates class.
     * All members a coordinate has to provide
     * are defined here.
     * @param {Number} method The type of coordinates given by the user. Accepted values are <b>COORDS_BY_SCREEN</b> and <b>COORDS_BY_USER</b>.
     * @param {Array} coordinates An array of affine coordinates.
     * @param {Board} board A reference to a board.
     * @param {Boolean} [emitter=true]
     * @constructor
     */
    constructor(method: COORDS_BY, coordinates: number[] | Object | Function, board: Board, emitter = true, elem?: GeometryElement) {
        super()

        this.elem = elem;

        if (board === undefined)
            throw new Error('who did not send Board??')
        if (!Array.isArray(coordinates))
            throw new Error('who did not send number[] to coordinates??')

        if (dbug(this.elem))
            console.warn(`%c coords [${JSON.stringify(coordinates)} ${method == COORDS_BY.USER ? 'User' : 'Screen'}]`, dbugColor)

        this.board = board
        this.method = method

        if (method == -COORDS_BY.USER) {
            this.usrCoords = [1, coordinates[0], coordinates[1]]
            this.usr2screen()
        } else {
            this.scrCoords = [1, coordinates[0], coordinates[1]]
            this.screen2usr()
        }

        // if (this.emitter) {
        // EventEmitter.eventify(this);  // tb now handled by class hierarchy
        // }

        this.setCoordinates(this.method, coordinates, false, true);

        if (dbug(this.elem))
            console.warn(`%c new Coords scrCoords:${JSON.stringify(this.scrCoords)}}`, dbugColor)
    };

    /**
     * Normalize homogeneous coordinates
     * @private
     */
    normalizeUsrCoords() {
        if (Math.abs(this.usrCoords[0]) > JSXMath.eps) {
            this.usrCoords[1] /= this.usrCoords[0];
            this.usrCoords[2] /= this.usrCoords[0];
            this.usrCoords[0] = 1.0;
        }
    }

    /**
     * Compute screen coordinates out of given user coordinates.
     * @private
     */
    usr2screen(doRound: boolean = false) {
        let b = this.board,
            uc = this.usrCoords,
            oc = b.origin.scrCoords;

        this.scrCoords = []
        if (doRound === true) {
            this.scrCoords[0] = Math.round(uc[0]);
            this.scrCoords[1] = Math.round(uc[0] * oc[1] + uc[1] * b.unitX);
            this.scrCoords[2] = Math.round(uc[0] * oc[2] - uc[2] * b.unitY);
        } else {
            this.scrCoords[0] = uc[0];
            this.scrCoords[1] = uc[0] * oc[1] + uc[1] * b.unitX;
            this.scrCoords[2] = uc[0] * oc[2] - uc[2] * b.unitY;
        }
    }

    /**
     * Compute user coordinates out of given screen coordinates.
     * @private
     */
    screen2usr() {
        var o = this.board.origin.scrCoords,
            sc = this.scrCoords,
            b = this.board;

        this.usrCoords = []
        this.usrCoords[0] = 1.0;
        this.usrCoords[1] = (sc[1] - o[1]) / b.unitX;
        this.usrCoords[2] = (o[2] - sc[2]) / b.unitY;
    }

    /**
     * Calculate distance of one point to another.
     * @param {Number} coord_type The type of coordinates used here. Possible values are <b>COORDS_BY.USER</b> and <b>COORDS_BY.SCREEN</b>.
     * @param {JXG2.Coords} coordinates The Coords object to which the distance is calculated.
     * @returns {Number} The distance
     */
    distance(coord_type: COORDS_BY, coordinates: Coords): number {
        var sum = 0,
            c,
            ucr = this.usrCoords,
            scr = this.scrCoords,
            f;

        if (coord_type === COORDS_BY.USER) {
            c = coordinates.usrCoords;
            f = ucr[0] - c[0];
            sum = f * f;

            if (sum > JSXMath.eps * JSXMath.eps) {
                return Number.POSITIVE_INFINITY;
            }
            return Math.hypot(ucr[1] - c[1], ucr[2] - c[2]);
        } else {
            c = coordinates.scrCoords;
            return Math.hypot(scr[1] - c[1], scr[2] - c[2]);
        }
    }

    /**
     * Set coordinates by either user coordinates or screen coordinates and recalculate the other one.
     * @param {Number} coord_type The type of coordinates used here. Possible values are <b>COORDS_BY_USER</b> and <b>COORDS_BY_SCREEN</b>.
     * @param {Array} coordinates An array of affine coordinates the Coords object is set to.
     * @param {Boolean} [doRound=true] flag If true or null round the coordinates in usr2screen. This is used in smooth curve plotting.
     * The IE needs rounded coordinates. Id doRound==false we have to round in updatePathString.
     * @param {Boolean} [noevent=false]
     * @returns {JXG2.Coords} Reference to the coords object.
     */
    setCoordinates(coord_type: COORDS_BY, coordinates: number[], doRound: boolean = true, noevent: boolean = false) {
        // console.log(`setCoordinates(${JSON.stringify(coordinates)})`)

        var uc = this.usrCoords,
            sc = this.scrCoords,
            // Original values
            ou = [uc[0], uc[1], uc[2]],
            os = [sc[0], sc[1], sc[2]];

        if (coord_type === COORDS_BY.USER) {
            if (coordinates.length === 2) {
                // Euclidean coordinates
                uc[0] = 1.0;
                uc[1] = coordinates[0];
                uc[2] = coordinates[1];
            } else {
                // Homogeneous coordinates (normalized)
                uc[0] = coordinates[0];
                uc[1] = coordinates[1];
                uc[2] = coordinates[2];
                this.normalizeUsrCoords();
            }
            this.usr2screen(doRound);
        } else {
            if (coordinates.length === 2) {
                // Euclidean coordinates
                sc[1] = coordinates[0];
                sc[2] = coordinates[1];
            } else {
                // Homogeneous coordinates (normalized)
                sc[1] = coordinates[1];
                sc[2] = coordinates[2];
            }
            this.screen2usr();
        }

        if (this.emitter && !noevent && (os[1] !== sc[1] || os[2] !== sc[2])) {
            this.triggerEventHandlers(["update"], [ou, os]);
        }

        if (dbug(this.elem))
            console.warn(`%c setCoordinates scrCoords:${JSON.stringify(this.scrCoords)}}`, dbugColor)

        return this;
    }




    /**
     * Copy array, either scrCoords or usrCoords
     * Uses slice() in case of standard arrays and set() in case of
     * typed arrays.
     * @private
     * @param {String} obj Either 'scrCoords' or 'usrCoords'
     * @param {Number} offset Offset, defaults to 0 if not given
     * @returns {Array} Returns copy of the coords array either as standard array or as
     *   typed array.
     */
    copy(obj:string, offset=0) {
        return this[obj].slice(offset);
    }

    /**
     * Test if one of the usrCoords is NaN or the coordinates are infinite.
     * @returns {Boolean} true if the coordinates are finite, false otherwise.
     */
    computeIsReal() {
        return (
            !isNaN(this.usrCoords[1] + this.usrCoords[2]) &&
            Math.abs(this.usrCoords[0]) > JSXMath.eps
        );
    }

    /**
     * Triggered whenever the coordinates change.
     * @name JXG2.Coords#update
     * @param {Array} ou Old user coordinates
     * @param {Array} os Old screen coordinates
     * @event
     */
    __evt__update(ou, os) { }

    /**
     * @ignore
     */
    __evt() { }
}

