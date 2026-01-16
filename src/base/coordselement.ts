let dbug = (elem) => false //elem && elem.id === 'jxgBoard1P3Label'
const dbugColor = `color:yellow;background-color:#803030`;

/*
    Copyright 2008-2025
        Matthias Ehmann,
        Michael Gerhaeuser,
        Carsten Miller,
        Alfred Wassermann

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
    the MIT License along with JSXGraph. If not, see <https://www.gnu.org/licenses/>updatecoord
    and <https://opensource.org/licenses/MIT/>.
 */

/*global JXG: true, define: true, console: true, window: true*/
/*jslint nomen: true, plusplus: true*/

/**
 * @fileoverview The geometry object CoordsElement is defined in this file.
 * This object provides the coordinate handling of points, images and texts.
 */

import { LooseObject } from "../interfaces.js";
import { Board } from "../base/board.js"
import { JSXMath } from "../math/math.js";
import { Geometry } from "../math/geometry.js";
import { Numerics } from "../math/numerics.js";
import { Statistics } from "../math/statistics.js";
import { Coords } from "./coords.js";
import { OBJECT_TYPE, OBJECT_CLASS, COORDS_BY } from "./constants.js";
import { Type } from "../utils/type.js";
import { GeometryElement } from "../base/element.js";
import { Options } from "../options.js"
import { Transformation } from "./transformation.js";
import { Glider } from "../element/glider.js";

export interface CoordsMethods {
    addTransform: Function
}


export class CoordsElement extends GeometryElement implements CoordsMethods {

    public usrCoords: number[] = [];
    public scrCoords: number[] = [];
    public method: COORDS_BY;
    public relativeCoords: Coords

    Xjc
    Yjc
    _smin
    _smax
    _initialized


    /** used by animation */
    private _roundsCount: number = 0
    private _intervalCode: number = 0
    private _intervalCount: number = 0
    public animationPath
    public animationStart

    // initialCoords and actualCoords are needed to handle transformations
    // and dragging of objects simultaneously.
    // actualCoords are needed for non-points since the visible objects
    // is transformed in the renderer.
    // For labels and other relative texts, actualCoords is ignored, see
    // board.initMoveObject
    initialCoords: Coords
    actualCoords: Coords

    /**
     * Relative position on a slide element (line, circle, curve) if element is a glider on this element.
     * @type Number
     * @private
     */
    position = null;

    /**
     * True if there the method this.updateConstraint() has been set. It is
     * probably different from the prototype function() {return this;}.
     * Used in updateCoords fo glider elements.
     *
     * @see JXG.CoordsElement#updateCoords
     * @type Boolean
     * @private
     */
    isConstrained = false;

    /**
     * A {@link JXG.CoordsElement#updateGlider} call is usually followed
     * by a general {@link JXG.Board#update} which calls
     * {@link JXG.CoordsElement#updateGliderFromParent}.
     * To prevent double updates, {@link JXG.CoordsElement#needsUpdateFromParent}
     * is set to false in updateGlider() and reset to true in the following call to
     * {@link JXG.CoordsElement#updateGliderFromParent}
     * @type Boolean
     */
    needsUpdateFromParent: boolean = true;

    /**
     * Stores the groups of this element in an array of Group.
     * @type Array
     * @see JXG.Group
     * @private
     */
    //TODO: groups must move higher // this.groups = [];

    /*
     * Do we need this?
    // TODO          */
    // this.Xjc = null;
    // this.Yjc = null;

    /**
 * New evaluation of the function term.
 * This is required for CAS-points: Their XTerm() method is
 * overwritten in {@link JXG.CoordsElement#addConstraint}.
 *
 * @returns {Number} User coordinate of point in x direction.
 * @private
 */

    ZEval: Function = () => this.coords.usrCoords[0];
    XEval: Function = () => this.coords.usrCoords[1];
    YEval: Function = () => this.coords.usrCoords[2];




    constructor(board: Board, method: COORDS_BY, coordinates: number[] | Object | Function = [1, 0, 0], attributes: Object, otype: number, oclass: number) {
        super(board, attributes, otype, oclass)

        this.coords = new Coords(COORDS_BY.USER, coordinates, this.board, true, this);

        this.initialCoords = new Coords(COORDS_BY.USER, coordinates, this.board, true, this);
        this.actualCoords = new Coords(COORDS_BY.USER, coordinates, this.board, true, this);


        // for (let i = 0; i < coordinates.length; ++i) {
        //     coordinates[i] = parseFloat(coordinates[i]);
        // }

        // TODO - phase 2just set up object
        // tbtb - doesn't appear to be used
        // this.usrCoords = new Coords(COORDS_BY.USER, coordinates, board).usrCoords
        // this.scrCoords = new Coords(COORDS_BY.SCREEN, coordinates, board).scrCoords

        if (dbug(this)) console.warn(`%c coordselements: constructor, ${this.id}`, dbugColor)


        // documented in GeometryElement
        this.methodMap = Type.deepCopy(this.methodMap, {
            move: "moveTo",
            moveTo: "moveTo",
            moveAlong: "moveAlong",
            visit: "visit",
            glide: "makeGlider",
            makeGlider: "makeGlider",
            intersect: "makeIntersection",
            makeIntersection: "makeIntersection",
            X: "X",
            Y: "Y",
            Coords: "Coords",
            free: "free",
            setPosition: "setGliderPosition",
            setGliderPosition: "setGliderPosition",
            addConstraint: "addConstraint",
            dist: "Dist",
            Dist: "Dist",
            onPolygon: "onPolygon",
            startAnimation: "startAnimation",
            stopAnimation: "stopAnimation"
        });

        /*
         * this.element may have been set by the object constructor.
         */
        // tbtb - should be renamed as parent or something, and moved to point, text, etc
        if (Type.exists(this.element)) {
            this.addAnchor(coordinates, attributes['isLabel']);
        }

        this.isDraggable = true;
    };

    /**
     * Dummy function for unconstrained points or gliders.
     * @private
     */
    updateConstraint(): CoordsElement {

        if (dbug(this))
            console.warn(`%c update constraint ${this.id}`, dbugColor, this.X(), this.Y(), this.XEval(), this.YEval())

        // this gets called for unconstrained elements, means something else

        let newCoords = [this.ZEval(), this.XEval(), this.YEval()]
        this.coords.setCoordinates(COORDS_BY.USER, newCoords);

        return this;
    }

    /**
     * Updates the coordinates of the element.
     * @private
    */
    updateCoords(fromParent = false): CoordsElement {
        if (dbug(this))
            console.warn(`%c coordselements: updateCoords( ${fromParent}, ${this.id} scr [${this.scrCoords[1]},${this.scrCoords[2]}] )`, dbugColor)

        this.updateConstraint();

        if (!this.needsUpdate) {
            return this;
        }

        // if (!this.evalVisProp('frozen')) {
        if (!Type.exists(this._initialized) || this.evalVisProp('frozen') !== true) {
            this.updateConstraint();
        }

        /*
        * We need to calculate the new coordinates no matter of the elements visibility because
     * a child could be visible and depend on the coordinates of the element/point (e.g. perpendicular).
     *
     * Check if the element is a glider and calculate new coords in dependency of this.slideObject.
     * This function is called with fromParent==true in case it is a glider element for example if
     * the defining elements of the line or circle have been changed.
        */
        if (this.otype === OBJECT_TYPE.GLIDER) {
            if (this.isConstrained) {
                fromParent = false;
            }

            if (fromParent) {
                this['updateGliderFromParent']();
            } else {
                this['updateGlider']();
            }
        }
        this.updateTransform(fromParent);
        if (!Type.exists(this._initialized)) {
            this._initialized = true;
        }


        return this;
    }


    /**
     * Find the closest entry in snapValues that is within snapValueDistance of pos.
     *
     * @param {Number} pos Value for which snapping is calculated.
     * @returns {Number} Index of the value to snap to, or null.
     * @private
     */
    findClosestSnapValue(pos) {
        if (dbug(this)) console.warn(`%c coordselements: findClosestSnapValue, ${this.id}`, dbugColor)
        var i, d,
            snapValues, snapValueDistance,
            snappedTo = null;

        // Snap the glider to snap values.
        snapValues = this.evalVisProp('snapvalues');
        snapValueDistance = this.evalVisProp('snapvaluedistance');

        if (Array.isArray(snapValues) &&
            Math.abs(this._smax - this._smin) >= JSXMath.eps &&
            snapValueDistance > 0.0) {
            for (i = 0; i < snapValues.length; i++) {
                d = Math.abs(pos * (this._smax - this._smin) + this._smin - snapValues[i]);
                if (d < snapValueDistance) {
                    snapValueDistance = d;
                    snappedTo = i;
                }
            }
        }

        return snappedTo;
    }


    updateRendererGeneric(rendererMethod: string) {
        //var wasReal;
        if (dbug(this))
            console.warn(`%c coordselements: updateRendererGeneric(${rendererMethod}), ${this.id}`, dbugColor)

        // tbtb - how does needUpdate get set FALSE?? this was a huge problem!!
        // if (!this.needsUpdate || !this.board.renderer) {
        //     return this;
        // }

        if (this.visPropCalc.visible) {
            //wasReal = this.isReal;
            this.isReal = !isNaN(this.coords.usrCoords[1] + this.coords.usrCoords[2]);
            //Homogeneous coords: ideal point
            this.isReal =
                Math.abs(this.coords.usrCoords[0]) > JSXMath.eps ? this.isReal : false;

            if (
                // wasReal &&
                !this.isReal
            ) {
                this.updateVisibility(false);
            }
        }

        // Call the renderer only if element is visible.
        // Update the position
        if (this.visPropCalc.visible) {
            this.board.renderer[rendererMethod](this);
        }

        if (
            this.hasLabel &&
            this.visPropCalc.visible &&
            this.label &&
            this.label.visPropCalc.visible &&
            this.isReal
        ) {
            this.label.update(true);
            this.board.renderer.updateText(this.label);
        }

        // Update rendNode display
        this.setDisplayRendNode();
        if (this.visPropCalc.visible !== this.visPropOld.visible) {
            this.board.renderer.display(this, this.visPropCalc.visible);
            this.visPropOld.visible = this.visPropCalc.visible;

            if (this.hasLabel) {
                this.board.renderer.display(this.label, this.label.visPropCalc.visible);
            }
        }

        this.needsUpdate = false;
        return this;
    }

    /**
     * Getter method for x, this is used by for CAS-points to access point coordinates.
     * @returns {Number} User coordinate of point in x direction.
     */
    X() {
        return this.coords.usrCoords[1];
    }

    /**
     * Getter method for y, this is used by CAS-points to access point coordinates.
     * @returns {Number} User coordinate of point in y direction.
     */
    Y() {
        return this.coords.usrCoords[2];
    }

    /**
     * Getter method for z, this is used by CAS-points to access point coordinates.
     * @returns {Number} User coordinate of point in z direction.
     */
    Z() {
        return this.coords.usrCoords[0];
    }

    /**
     * Getter method for coordinates x, y and (optional) z.
     * @param {Number|String} [digits='auto'] Truncating rule for the digits in the infobox.
     * <ul>
     * <li>'auto': done automatically by JXG.autoDigits()
     * <li>'none': no truncation
     * <li>number: truncate after "number digits" with JXG.toFixed()
     * </ul>
     * @param {Boolean} [withZ=false] If set to true the return value will be <tt>(x | y | z)</tt> instead of <tt>(x, y)</tt>.
     * @returns {String} User coordinates of point.
     */
    Coords(withZ) {
        if (withZ) {
            return this.coords.usrCoords.slice();
        }
        return this.coords.usrCoords.slice(1);
    }
    // Coords(digits, withZ) {
    //     var arr, sep;

    //     digits = digits || 'auto';

    //     if (withZ) {
    //         sep = ' | ';
    //     } else {
    //         sep = ', ';
    //     }

    //     if (digits === 'none') {
    //         arr = [this.X(), sep, this.Y()];
    //         if (withZ) {
    //             arr.push(sep, this.Z());
    //         }

    //     } else if (digits === 'auto') {
    //         if (this.useLocale()) {
    //             arr = [this.formatNumberLocale(this.X()), sep, this.formatNumberLocale(this.Y())];
    //             if (withZ) {
    //                 arr.push(sep, this.formatNumberLocale(this.Z()));
    //             }
    //         } else {
    //             arr = [Type.autoDigits(this.X()), sep, Type.autoDigits(this.Y())];
    //             if (withZ) {
    //                 arr.push(sep, Type.autoDigits(this.Z()));
    //             }
    //         }

    //     } else {
    //         if (this.useLocale()) {
    //             arr = [this.formatNumberLocale(this.X(), digits), sep, this.formatNumberLocale(this.Y(), digits)];
    //             if (withZ) {
    //                 arr.push(sep, this.formatNumberLocale(this.Z(), digits));
    //             }
    //         } else {
    //             arr = [Type.toFixed(this.X(), digits), sep, Type.toFixed(this.Y(), digits)];
    //             if (withZ) {
    //                 arr.push(sep, Type.toFixed(this.Z(), digits));
    //             }
    //         }
    //     }

    //     return '(' + arr.join('') + ')';
    // }


    /**
     * Getter method for the distance to a second point, this is required for CAS-elements.
     * Here, function inlining seems to be worthwile (for plotting).
     * @param {JXG.Point} point2 The point to which the distance shall be calculated.
     * @returns {Number} Distance in user coordinate to the given point
     */
    Dist(point2) {
        if (this.isReal && point2.isReal) {
            return this.coords.distance(COORDS_BY.USER, point2.coords);
        }
        return NaN;
    }

    /**
     * Alias for {@link JXG.Element#handleSnapToGrid}
     * @param {Boolean} force force snapping independent of what the snaptogrid attribute says
     * @returns {JXG.CoordsElement} Reference to this element
     */
    snapToGrid(force: boolean) {
        return this.handleSnapToGrid(force);
    }

    /**
     * Let a point snap to the nearest point in distance of
     * {@link JXG.Point#attractorDistance}.
     * The function uses the coords object of the point as
     * its actual position.
     * @param {Boolean} force force snapping independent of what the snaptogrid attribute says
     * @returns {JXG.CoordsElement} Reference to this element
     */
    handleSnapToPoints(force?: boolean) {
        var i,
            pEl,
            pCoords,
            d = 0,
            len,
            dMax = Infinity,
            c = null,
            ev_au,
            ev_ad,
            ev_is2p = this.evalVisProp('ignoredsnaptopoints'),
            len2,
            j,
            ignore = false;

        len = this.board.objectsList.length;

        if (ev_is2p) {
            len2 = ev_is2p.length;
        }

        if (this.evalVisProp('snaptopoints') || force) {
            ev_au = this.evalVisProp('attractorunit');
            ev_ad = this.evalVisProp('attractordistance');

            for (i = 0; i < len; i++) {
                pEl = this.board.objectsList[i];

                if (ev_is2p) {
                    ignore = false;
                    for (j = 0; j < len2; j++) {
                        if (pEl === this.board.select(ev_is2p[j])) {
                            ignore = true;
                            break;
                        }
                    }
                    if (ignore) {
                        continue;
                    }
                }

                if (Type.isPoint(pEl) && pEl !== this && pEl.visPropCalc.visible) {
                    pCoords = Geometry.projectPointToPoint(this, pEl);
                    if (ev_au === "screen") {
                        d = pCoords.distance(COORDS_BY.SCREEN, this.coords);
                    } else {
                        d = pCoords.distance(COORDS_BY.USER, this.coords);
                    }

                    if (d < ev_ad && d < dMax) {
                        dMax = d;
                        c = pCoords;
                    }
                }
            }

            if (c !== null) {
                this.coords.setCoordinates(COORDS_BY.USER, c.usrCoords);
            }
        }

        return this;
    }

    /**
     * Alias for {@link JXG.CoordsElement#handleSnapToPoints}.
     *
     * @param {Boolean} force force snapping independent of what the snaptogrid attribute says
     * @returns {JXG.CoordsElement} Reference to this element
     */
    snapToPoints(force?: boolean) {
        return this.handleSnapToPoints(force);
    }

    /**
     * A point can change its type from free point to glider
     * and vice versa. If it is given an array of attractor elements
     * (attribute attractors) and the attribute attractorDistance
     * then the point will be made a glider if it less than attractorDistance
     * apart from one of its attractor elements.
     * If attractorDistance is equal to zero, the point stays in its
     * current form.
     * @returns {JXG.CoordsElement} Reference to this element
     */
    handleAttractors() {
        var i,
            el,
            projCoords,
            d = 0.0,
            projection,
            ev_au = this.evalVisProp('attractorunit'),
            ev_ad = this.evalVisProp('attractordistance'),
            ev_sd = this.evalVisProp('snatchdistance'),
            ev_a = this.evalVisProp('attractors'),
            len = ev_a.length;

        if (ev_ad === 0.0) {
            return;
        }

        for (i = 0; i < len; i++) {
            el = this.board.select(ev_a[i]);

            if (Type.exists(el) && el !== this) {
                if (Type.isPoint(el)) {
                    projCoords = Geometry.projectPointToPoint(this, el);
                } else if (el.elementClass === OBJECT_CLASS.LINE) {
                    projection = Geometry.projectCoordsToSegment(
                        this.coords.usrCoords,
                        el.point1.coords.usrCoords,
                        el.point2.coords.usrCoords
                    );
                    if (!el.evalVisProp('straightfirst') && projection[1] < 0.0) {
                        projCoords = el.point1.coords;
                    } else if (
                        !el.evalVisProp('straightlast') &&
                        projection[1] > 1.0
                    ) {
                        projCoords = el.point2.coords;
                    } else {
                        projCoords = new Coords(
                            COORDS_BY.USER,
                            projection[0],
                            this.board,
                            true, this
                        );
                    }
                } else if (el.elementClass === OBJECT_CLASS.CIRCLE) {
                    projCoords = Geometry.projectPointToCircle(this, el, this.board);
                } else if (el.elementClass === OBJECT_CLASS.CURVE) {
                    projCoords = Geometry.projectPointToCurve(this, el, this.board)[0];
                } else if (el.type === OBJECT_TYPE.TURTLE) {
                    projCoords = Geometry.projectPointToTurtle(this, el, this.board)[0];
                } else if (el.type === OBJECT_TYPE.POLYGON) {
                    projCoords = new Coords(
                        COORDS_BY.USER,
                        Geometry.projectCoordsToPolygon(this.coords.usrCoords, el),
                        this.board,
                        true, this
                    );
                }

                if (ev_au === "screen") {
                    d = projCoords.distance(COORDS_BY.SCREEN, this.coords);
                } else {
                    d = projCoords.distance(COORDS_BY.USER, this.coords);
                }


                // TODO: move to Glider
                // if (d < ev_ad) {
                //     if (
                //         !(
                //             this.type === OBJECT_TYPE.GLIDER &&
                //             (el === this.slideObject ||
                //                 (this.slideObject &&
                //                     this.onPolygon &&
                //                     this.slideObject.parentPolygon === el))
                //         )
                //     ) {
                //         this.makeGlider(el);
                //     }
                //     break; // bind the point to the first attractor in its list.
                // }
                // if (
                //     d >= ev_sd &&
                //     (el === this.slideObject ||
                //         (this.slideObject &&
                //             this.onPolygon &&
                //             this.slideObject.parentPolygon === el))
                // ) {
                //     this.popSlideObject();
                // }
            }
        }

        return this;
    }

    /**
     * Sets coordinates and calls the elements's update() method.
     * @param {Number} method The type of coordinates used here.
     * Possible values are {@link COORDS_BY.USER} and {@link COORDS_BY.SCREEN}.
     * @param {Array} coords coordinates <tt>([z], x, y)</tt> in screen/user units
     * @returns {JXG.CoordsElement} this element
     */
    setPositionDirectly(method, coords) {
        var i,
            c, dc, m,
            oldCoords = this.coords,
            newCoords;

        if (dbug(this)) console.warn(`%c coordselements: setPositionDirectly, ${this.id} ${JSON.stringify(this.coords.usrCoords)}}`, dbugColor)

        if (this.relativeCoords) {
            c = new Coords(method, coords, this.board, true, this);
            if (this.evalVisProp('islabel')) {
                dc = Statistics.subtract(c.scrCoords, oldCoords.scrCoords);
                this.relativeCoords.scrCoords[1] += dc[1];
                this.relativeCoords.scrCoords[2] += dc[2];
            } else {
                dc = Statistics.subtract(c.usrCoords, oldCoords.usrCoords);
                this.relativeCoords.usrCoords[1] += dc[1];
                this.relativeCoords.usrCoords[2] += dc[2];
            }

            return this;
        }

        this.coords.setCoordinates(method, coords);
        this.handleSnapToGrid();
        this.handleSnapToPoints();
        this.handleAttractors();

        // Here, we set the object's "actualCoords", because
        // coords and initialCoords coincide since transformations
        // for these elements are handled in the renderers.
        this.actualCoords.setCoordinates(COORDS_BY.USER, this.coords.usrCoords);

        // The element's coords have been set above to the new position `coords`.
        // Now, determine the preimage of `coords`, prior to all transformations.
        // This is needed for free elements that have a transformation bound to it.
        if (this.transformations.length > 0) {
            if (method === COORDS_BY.SCREEN) {
                newCoords = new Coords(method, coords, this.board, true, this).usrCoords;
            } else {
                if (coords.length === 2) {
                    coords = [1].concat(coords);
                }
                newCoords = coords;
            }
            m = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
            for (i = 0; i < this.transformations.length; i++) {
                m = JSXMath.matMatMult(this.transformations[i].matrix, m);
            }
            newCoords = JSXMath.matVecMult(JSXMath.inverse(m), newCoords);

            this.initialCoords.setCoordinates(COORDS_BY.USER, newCoords);
            if (this.elementClass !== OBJECT_CLASS.POINT) {
                // This is necessary for images and texts.
                this.coords.setCoordinates(COORDS_BY.USER, newCoords);
            }
        }
        this.prepareUpdate().elementUpdate();

        // TODO: move to glider
        // // If the user suspends the board updates we need to recalculate the relative position of
        // // the point on the slide object. This is done in updateGlider() which is NOT called during the
        // // update process triggered by unsuspendUpdate.
        // if (this.board.isSuspendedUpdate && this.type === OBJECT_TYPE.GLIDER) {
        //     this.updateGlider();
        // }

        return this;
    }

    /**
     * Translates the point by <tt>tv = (x, y)</tt>.
     * @param {Number} method The type of coordinates used here.
     * Possible values are {@link COORDS_BY.USER} and {@link COORDS_BY.SCREEN}.
     * @param {Array} tv (x, y)
     * @returns {JXG.CoordsElement}
     */
    setPositionByTransform(method: COORDS_BY, tv: number[]) {
        var t;

        let tvCoords = new Coords(method, tv, this.board, true, this);
        t = this.board.create("transform", tvCoords.usrCoords.slice(1), {
            type: "translate"
        });

        if (
            this.transformations.length > 0 &&
            this.transformations[this.transformations.length - 1].isNumericMatrix
        ) {
            this.transformations[this.transformations.length - 1].melt(t);
        } else {
            this.addTransform(this.element, t);
        }

        this.prepareUpdate().elementUpdate();

        return this;
    }

    /**
     * Sets coordinates and calls the element's update() method.
     * @param {Number} method The type of coordinates used here.
     * Possible values are {@link COORDS_BY.USER} and {@link COORDS_BY.SCREEN}.
     * @param {Array} coords coordinates in screen/user units
     * @returns {JXG.CoordsElement}
     */
    setPosition(method, coords) {
        return this.setPositionDirectly(method, coords);
    }

    /**
     * Converts a calculated element into a free element,
     * i.e. it will delete all ancestors and transformations and,
     * if the element is currently a glider, will remove the slideObject reference.
     */
    free() {
        var ancestorId, ancestor;
        // child;

        if (this.otype !== OBJECT_TYPE.GLIDER) {
            // remove all transformations
            this.transformations.length = 0;

            delete this.updateConstraint;
            this.isConstrained = false;
            // this.updateConstraint = function () {
            //     return this;
            // };

            if (!this.isDraggable) {
                this.isDraggable = true;

                if (this.elementClass === OBJECT_CLASS.POINT) {
                    this.otype = OBJECT_TYPE.POINT;
                    this.elType = "point";
                }

                this.XEval = function () {
                    return this.coords.usrCoords[1];
                };

                this.YEval = function () {
                    return this.coords.usrCoords[2];
                };

                this.ZEval = function () {
                    return this.coords.usrCoords[0];
                };

                this.Xjc = null;
                this.Yjc = null;
            } else {
                return;
            }
        }

        // a free point does not depend on anything. And instead of running through tons of descendants and ancestor
        // structures, where we eventually are going to visit a lot of objects twice or thrice with hard to read and
        // comprehend code, just run once through all objects and delete all references to this point and its label.
        for (ancestorId in this.board.objects) {
            if (this.board.objects.hasOwnProperty(ancestorId)) {
                ancestor = this.board.objects[ancestorId];

                if (ancestor.descendants) {
                    delete ancestor.descendants[this.id];
                    delete ancestor.childElements[this.id];

                    if (this.hasLabel) {
                        delete ancestor.descendants[this.label.id];
                        delete ancestor.childElements[this.label.id];
                    }
                }
            }
        }

        // A free point does not depend on anything. Remove all ancestors.
        this.ancestors = {}; // only remove the reference
        this.parents = [];

        // Completely remove all slideObjects of the element
        if (this.otype === OBJECT_TYPE.GLIDER) {
            (this as unknown as Glider).slideObject = null;
            (this as unknown as Glider).slideObjects = [];
        }

        if (this.elementClass === OBJECT_CLASS.POINT) {
            this.otype = OBJECT_TYPE.POINT;
            this.elType = "point";
        } else if (this.elementClass === OBJECT_CLASS.TEXT) {
            this.otype = this._org_type;
            this.elType = "text";
        } else if (this.elementClass === OBJECT_CLASS.OTHER) {
            this.otype = this._org_type;
            this.elType = "image";
        }
    }

    /**
     * Convert the point to CAS point and call update().
     * @param {Array} terms [[zterm], xterm, yterm] defining terms for the z, x and y coordinate.
     * The z-coordinate is optional and it is used for homogeneous coordinates.
     * The coordinates may be either <ul>
     *   <li>a JavaScript function,</li>
     *   <li>a string containing GEONExT syntax. This string will be converted into a JavaScript
     *     function here,</li>
     *   <li>a Number</li>
     *   <li>a pointer to a slider object. This will be converted into a call of the Value()-method
     *     of this slider.</li>
     *   </ul>
     * @see JXG.GeonextParser#geonext2JS
     */

    addConstraint(terms: (number | Function)[]) {   // could be [0,0] or [()=>A,0] etc
        var i, v
        let newfuncs: Function[] = []
        let what = ["X", "Y"]
        let makeConstFunction = (z) => () => z
        let makeSliderFunction = (a) => () => a.Value()

        if (dbug(this))
            console.warn(`%c coordselements: addConstraint( ${this.id} terms: ${JSON.stringify(terms)} )`, dbugColor)


        if (this.elementClass === OBJECT_CLASS.POINT) {
            this.otype = OBJECT_TYPE.CAS;
        }

        this.isDraggable = false;

        for (i = 0; i < terms.length; i++) {
            v = terms[i];

            //tbtb - if (Type.isString(v)) {
            //     // Convert GEONExT syntax into JavaScript syntax
            //     //t  = JXG.GeonextParser.geonext2JS(v, this.board);
            //     //newfuncs[i] = new Function('','return ' + t + ';');
            //     //v = GeonextParser.replaceNameById(v, this.board);
            //     newfuncs[i] = Type.snippet(v, true, null, true);
            //     this.addParentsFromJCFunctions([newfuncs[i]]);

            //     // Store original term as 'Xjc' or 'Yjc'
            //     if (terms.length === 2) {
            //         this[what[i] + "jc"] = terms[i];
            //     }
            // } else
            if (Type.isFunction(v)) {
                newfuncs[i] = v;
            } else if (Type.isNumber(v)) {
                newfuncs[i] = makeConstFunction(v);
            } else if (Type.isObject(v) && Type.isFunction(v.Value)) {
                // Slider
                newfuncs[i] = makeSliderFunction(v);
            }

            // newfuncs[i].origin = v;  tbtb - what??

        }

        if (terms.length === 1) {
            // Intersection function
            this.updateConstraint = function () {
                var c = newfuncs[0]();

                // Array
                if (Array.isArray(c)) {
                    this.coords.setCoordinates(COORDS_BY.USER, c);
                    // Coords object
                } else {
                    this.coords = c;
                }
                return this;
            };
        } else if (terms.length === 2) {
            // Euclidean coordinates
            this.XEval = newfuncs[0];
            this.YEval = newfuncs[1];
            // tbtb - what is .origin ????  where does it belong??
            // this.addParents([newfuncs[0].origin, newfuncs[1].origin]);

            // this.updateConstraint = function () {
            //     this.coords.setCoordinates(COORDS_BY.USER, [
            //         this.XEval(),
            //         this.YEval()
            //     ]);
            //     return this;
            // };
        } else {
            // Homogeneous coordinates
            this.ZEval = newfuncs[0];
            this.XEval = newfuncs[1];
            this.YEval = newfuncs[2];

            // this.addParents([newfuncs[0].origin, newfuncs[1].origin, newfuncs[2].origin]);

            // this.updateConstraint = function () {
            //     this.coords.setCoordinates(COORDS_BY.USER, [
            //         this.ZEval(),
            //         this.XEval(),
            //         this.YEval()
            //     ]);
            //     return this;
            // };
        }
        this.isConstrained = true;

        /**
         * We have to do an update. Otherwise, elements relying on this point will receive NaN.
         */
        this.prepareUpdate().elementUpdate();
        if (!this.board.isSuspendedUpdate) {
            this.updateVisibility().elementUpdateRenderer();
            if (this.hasLabel) {
                this.label.fullUpdate();
            }
        }

        return this;
    }

    /**
     * In case there is an attribute "anchor", the element is bound to
     * this anchor element.
     * This is handled with this.relativeCoords. If the element is a label
     * relativeCoords are given in scrCoords, otherwise in usrCoords.
     * @param{Array} coordinates Offset from the anchor element. These are the values for this.relativeCoords.
     * In case of a label, coordinates are screen coordinates. Otherwise, coordinates are user coordinates.
     * @param{Boolean} isLabel Yes/no
     * @private
     */
    addAnchor(coordinates, isLabel: boolean) {
        if (dbug(this))
            console.log(`%c coordsElements addAnchor(${JSON.stringify(coordinates)},${isLabel})`, dbugColor)

        if (isLabel) {
            this.relativeCoords = new Coords(
                COORDS_BY.SCREEN,
                coordinates.slice(0, 2),
                this.board, true, this
            );
        } else {
            this.relativeCoords = new Coords(COORDS_BY.USER, coordinates, this.board, true, this);
        }
        this.addChild(this);
        if (isLabel) {
            this.addParents([this]);
        }

        // this.YEval = function () {
        //     var sy, coords, anchor, ev_o;

        //     if (this.evalVisProp('islabel')) {
        //         ev_o = this.evalVisProp('offset');
        //         sy = -parseFloat(ev_o[1]);
        //         anchor = this.element.getLabelAnchor();
        //         coords = new Coords(
        //             COORDS_BY.SCREEN,
        //             [0, sy + this.relativeCoords.scrCoords[2] + anchor.scrCoords[2]],
        //             this.board, true, this
        //         );

        //         return coords.usrCoords[2];
        //     }

        //     anchor = this.element.getTextAnchor();
        //     return this.relativeCoords.usrCoords[2] + anchor.usrCoords[2];
        // };

        // TODO:  ??         this.ZEval = Type.createFunction(1, this.board, "");

        // this.updateConstraint = () => {
        //     this.coords.setCoordinates(COORDS_BY.USER, [
        //         this.ZEval(),
        //         this.XEval(),
        //         this.YEval()
        //     ]);

        //     console.log(`cooords update constraint anon function`)
        //     return this;
        // };
        this.isConstrained = true;

        let ev_o, sx = 0, sy = 0, anchor, coords

        // if (this.evalVisProp('islabel')) {
        //     ev_o = this.evalVisProp('offset');
        //     sx = parseFloat(ev_o[0]);
        //     sy = parseFloat(ev_o[1]);
        //     anchor = this.element.elementGetLabelAnchor();

        //     this.addConstraint([1, () => this.elementX()+sx, () => this.Y()+sy])
        // } else {


        if (Type.exists(this.element) && Type.exists(this.element.id)) {
            let remote = this.board.select(this.element.id)
            if (remote !== null)
                anchor = remote.elementGetTextAnchor();
        } else {
            anchor = this.elementGetTextAnchor();
        }

        // }


        // this.coords.setCoordinates(COORDS_BY.SCREEN, [
        //     0,
        //     sx + this.initialCoords.scrCoords[1] + anchor.scrCoords[1],
        //     sy + this.initialCoords.scrCoords[2] + anchor.scrCoords[2],
        // ]);
    }

    /**
     * Applies the transformations of the element.
     * This method applies to text and images. Point transformations are handled differently.
     * @param {Boolean} fromParent True if the drag comes from a child element. Unused.
     * @returns {JXG.CoordsElement} Reference to itself.
     */
    updateTransform(fromParent) {
        var c, i;

        if (dbug(this)) console.warn(`%c coordselements: updateTransform( ${this.id} scr [${this.scrCoords[1]},${this.scrCoords[2]}] )`, dbugColor)

        if (this.transformations.length === 0 || this.baseElement === null) {
            return this;
        }

        // This method is called for non-points only.
        // Here, we set the object's "actualCoords", because
        // coords and initialCoords coincide since transformations
        // for these elements are handled in the renderers.

        this.transformations[0].update();
        if (this === this.baseElement) {
            // Case of bindTo
            c = this.transformations[0].apply(this, "self");
        } else {
            c = this.transformations[0].apply(this.baseElement);
        }
        for (i = 1; i < this.transformations.length; i++) {
            this.transformations[i].update();
            c = JSXMath.matVecMult(this.transformations[i].matrix, c);
        }
        this.actualCoords.setCoordinates(COORDS_BY.USER, c);

        return this;
    }

    /**
     * Add transformations to this element.
     * @param {JXG.GeometryElement} el
     * @param {JXG.Transformation|Array} transform Either one {@link JXG.Transformation}
     * or an array of {@link JXG.Transformation}s.
     * @returns {JXG.CoordsElement} Reference to itself.
     */
    addTransform(el: GeometryElement, transform: Transformation | Transformation[]) {
        var i,
            list = Array.isArray(transform) ? transform : [transform],
            len = list.length;

        // There is only one baseElement possible
        if (this.transformations.length === 0) {
            this.baseElement = el;
        }

        for (i = 0; i < len; i++) {
            this.transformations.push(list[i]);
        }

        return this;
    }

    /**
     * Animate a point.
     * @param {Number|Function} direction The direction the glider is animated. Can be +1 or -1.
     * @param {Number|Function} stepCount The number of steps in which the parent element is divided.
     * Must be at least 1.
     * @param {Number|Function} delay Time in msec between two animation steps. Default is 250.
     * @param {Number} [maxRounds=-1] The number of rounds the glider will be animated. The glider will run infinitely if
     * maxRounds is negative or equal to Infinity.
     * @returns {JXG.CoordsElement} Reference to itself.
     *
     * @name Glider#startAnimation
     * @see Glider#stopAnimation
     * @function
     * @example
     * // Divide the circle line into 6 steps and
     * // visit every step 330 msec counterclockwise.
     * var ci = board.create('circle', [[-1,2], [2,1]]);
     * var gl = board.create('glider', [0,2, ci]);
     * gl.startAnimation(-1, 6, 330);
     *
     * </pre><div id="JXG0f35a50e-e99d-11e8-a1ca-04d3b0c2aad3" class="jxgbox" style="width: 300px; height: 300px;"></div>
     * <script type="text/javascript">
     *     (function() {
     *         var board = JXG.JSXGraph.initBoard('JXG0f35a50e-e99d-11e8-a1ca-04d3b0c2aad3',
     *             {boundingbox: [-8, 8, 8,-8], axis: true, showcopyright: false, shownavigation: false});
     *     // Divide the circle line into 6 steps and
     *     // visit every step 330 msec counterclockwise.
     *     var ci = board.create('circle', [[-1,2], [2,1]]);
     *     var gl = board.create('glider', [0,2, ci]);
     *     gl.startAnimation(-1, 6, 330);
     *
     *     })();
     *
     * </script><pre>
     * @example
     * //animate example closed curve
     * var c1 = board.create('curve',[(u)=>4*Math.cos(u),(u)=>2*Math.sin(u)+2,0,2*Math.PI]);
     * var p2 = board.create('glider', [c1]);
     * var button1 = board.create('button', [1, 7, 'start animation',function(){p2.startAnimation(1,8)}]);
     * var button2 = board.create('button', [1, 5, 'stop animation',function(){p2.stopAnimation()}]);
     * </pre><div class="jxgbox" id="JXG10e885ea-b05d-4e7d-a473-bac2554bce68" style="width: 200px; height: 200px;"></div>
     * <script type="text/javascript">
     *   var gpex4_board = JXG.JSXGraph.initBoard('JXG10e885ea-b05d-4e7d-a473-bac2554bce68', {boundingbox: [-1, 10, 10, -1], axis: true, showcopyright: false, shownavigation: false});
     *   var gpex4_c1 = gpex4_board.create('curve',[(u)=>4*Math.cos(u)+4,(u)=>2*Math.sin(u)+2,0,2*Math.PI]);
     *   var gpex4_p2 = gpex4_board.create('glider', [gpex4_c1]);
     *   gpex4_board.create('button', [1, 7, 'start animation',function(){gpex4_p2.startAnimation(1,8)}]);
     *   gpex4_board.create('button', [1, 5, 'stop animation',function(){gpex4_p2.stopAnimation()}]);
     * </script><pre>
     *
     * @example
     * // Divide the slider area into 20 steps and
     * // visit every step 30 msec. Stop after 2 rounds.
     * var n = board.create('slider',[[-2,4],[2,4],[1,5,100]],{name:'n'});
     * n.startAnimation(1, 20, 30, 2);
     *
     * </pre><div id="JXG40ce04b8-e99c-11e8-a1ca-04d3b0c2aad3" class="jxgbox" style="width: 300px; height: 300px;"></div>
     * <script type="text/javascript">
     *     (function() {
     *         var board = JXG.JSXGraph.initBoard('JXG40ce04b8-e99c-11e8-a1ca-04d3b0c2aad3',
     *             {boundingbox: [-8, 8, 8,-8], axis: true, showcopyright: false, shownavigation: false});
     *     // Divide the slider area into 20 steps and
     *     // visit every step 30 msec.
     *     var n = board.create('slider',[[-2,4],[2,4],[1,5,100]],{name:'n'});
     *     n.startAnimation(1, 20, 30, 2);
     *
     *     })();
     * </script><pre>
     *
     */
    startAnimation(direction, stepCount, delay, maxRounds) {
        var dir = Type.evaluate(direction),
            sc = Type.evaluate(stepCount),
            that = this;

        delay = Type.evaluate(delay) || 250;
        maxRounds = Type.evaluate(maxRounds);
        maxRounds = (maxRounds !== 'undefined') ? maxRounds : -1;

        if (this.otype === OBJECT_TYPE.GLIDER && !Type.exists(this._intervalCode) && maxRounds !== 0) {
            this._roundsCount = 0;
            this._intervalCode = window.setInterval(function () {
                that._anim(dir, sc, maxRounds);
            }, delay);

            if (!Type.exists(this._intervalCount)) {
                this._intervalCount = 0;

            }
        }
        return this;
    }

    /**
     * Stop animation.
     * @name Glider#stopAnimation
     * @see Glider#startAnimation
     * @function
     * @returns {JXG.CoordsElement} Reference to itself.
     */
    stopAnimation() {
        if (Type.exists(this._intervalCode)) {
            window.clearInterval(this._intervalCode);
            delete this._intervalCode;
        }

        return this;
    }

    /**
     * Starts an animation which moves the point along a given path in given time.
     * @param {Array|function} path The path the point is moved on.
     * This can be either an array of arrays or containing x and y values of the points of
     * the path, or an array of points, or a function taking the amount of elapsed time since the animation
     * has started and returns an array containing a x and a y value or NaN.
     * In case of NaN the animation stops.
     * @param {Number} time The time in milliseconds in which to finish the animation
     * @param {Object} [options] Optional settings for the animation.
     * @param {function} [options.callback] A function that is called as soon as the animation is finished.
     * @param {Boolean} [options.interpolate=true] If <tt>path</tt> is an array moveAlong()
     * will interpolate the path
     * using {@link JXG.Math.Numerics.Neville}. Set this flag to false if you don't want to use interpolation.
     * @returns {JXG.CoordsElement} Reference to itself.
     * @see JXG.CoordsElement#moveTo
     * @see JXG.CoordsElement#visit
     * @see JXG.CoordsElement#moveAlongES6
     * @see JXG.GeometryElement#animate
     */
    moveAlong(path, time, options) {
        options = options || {};

        var i,
            neville,
            interpath = [],
            p: LooseObject[] = [],
            delay = this.board.attr.animationdelay,
            steps = time / delay,
            len,
            pos,
            part,
            makeFakeFunction = function (i, j) {
                return function () {
                    return path[i][j];
                };
            };

        if (Array.isArray(path)) {
            len = path.length;
            for (i = 0; i < len; i++) {
                if (Type.isPoint(path[i])) {
                    p[i] = path[i];
                } else {
                    p[i] = {
                        elementClass: OBJECT_CLASS.POINT,
                        X: makeFakeFunction(i, 0),
                        Y: makeFakeFunction(i, 1)
                    };
                }
            }

            time = time || 0;
            if (time === 0) {
                this.setPosition(COORDS_BY.USER, [
                    p[p.length - 1].X(),
                    p[p.length - 1].Y()
                ]);
                return this.board.update();
            }

            if (!Type.exists(options.interpolate) || options.interpolate) {
                neville = Numerics.Neville(p);
                for (i = 0; i < steps; i++) {
                    interpath[i] = [];
                    interpath[i][0] = neville[0](((steps - i) / steps) * neville[3]());
                    interpath[i][1] = neville[1](((steps - i) / steps) * neville[3]());
                }
            } else {
                len = path.length - 1;
                for (i = 0; i < steps; ++i) {
                    pos = Math.floor((i / steps) * len);
                    part = (i / steps) * len - pos;

                    interpath[i] = [];
                    interpath[i][0] = (1.0 - part) * p[pos].X() + part * p[pos + 1].X();
                    interpath[i][1] = (1.0 - part) * p[pos].Y() + part * p[pos + 1].Y();
                }
                interpath.push([p[len].X(), p[len].Y()]);
                interpath.reverse();
                /*
                for (i = 0; i < steps; i++) {
                    interpath[i] = [];
                    interpath[i][0] = path[Math.floor((steps - i) / steps * (path.length - 1))][0];
                    interpath[i][1] = path[Math.floor((steps - i) / steps * (path.length - 1))][1];
                }
                */
            }

            this.animationPath = interpath;
        } else if (Type.isFunction(path)) {
            this.animationPath = path;
            this.animationStart = new Date().getTime();
        }

        this.animationCallback = options.callback;
        this.board.addAnimation(this.element);

        return this;
    }

    /**
     * Starts an animated point movement towards the given coordinates <tt>where</tt>.
     * The animation is done after <tt>time</tt> milliseconds.
     * If the second parameter is not given or is equal to 0, setPosition() is called, see
     * {@link JXG.CoordsElement#setPosition}
     * i.e. the coordinates are changed without animation.
     * @param {Array} where Array containing the x and y coordinate of the target location.
     * @param {Number} [time] Number of milliseconds the animation should last.
     * @param {Object} [options] Optional settings for the animation
     * @param {function} [options.callback] A function that is called as soon as the animation is finished.
     * @param {String} [options.effect='<>'|'>'|'<'] animation effects like speed fade in and out. possible values are
     * '<>' for speed increase on start and slow down at the end (default), '<' for speed up, '>' for slow down, and '--' for constant speed during
     * the whole animation.
     * @returns {JXG.CoordsElement} Reference to itself.
     * @see JXG.CoordsElement#setPosition
     * @see JXG.CoordsElement#moveAlong
     * @see JXG.CoordsElement#visit
     * @see JXG.CoordsElement#moveToES6
     * @see JXG.GeometryElement#animate
     * @example
     * // moveTo() with different easing options and callback options
     * let yInit = 3
     * let [A, B, C, D] = ['==', '<>', '<', '>'].map((s) => board.create('point', [4, yInit--], { name: s, label: { fontSize: 24 } }))
     * let seg = board.create('segment', [A, [() => A.X(), 0]])  // shows linear
     *
     * let isLeftRight = true;
     * let buttonMove = board.create('button', [-2, 4, 'left',
     * () => {
     *    isLeftRight = !isLeftRight;
     *    buttonMove.rendNodeButton.innerHTML = isLeftRight ? 'left' : 'right'
     *    let x = isLeftRight ? 4 : -4
     *    let sym = isLeftRight ? 'triangleleft' : 'triangleright'
     *
     *    A.moveTo([x, 3], 1000, { callback: () => A.setAttribute({ face: sym, size: 5 }) })
     *    B.moveTo([x, 2], 1000, { callback: () => B.setAttribute({ face: sym, size: 5 }), effect: "<>" })
     *    C.moveTo([x, 1], 1000, { callback: () => C.setAttribute({ face: sym, size: 5 }), effect: "<" })
     *    D.moveTo([x, 0], 1000, { callback: () => D.setAttribute({ face: sym, size: 5 }), effect: ">" })
     *
     * }]);
     *
     * </pre><div id="JXG0f35a50e-e99d-11e8-a1ca-04d3b0c2aad4" class="jxgbox" style="width: 300px; height: 300px;"></div>
     * <script type="text/javascript">
     * {
     * let board = JXG.JSXGraph.initBoard('JXG0f35a50e-e99d-11e8-a1ca-04d3b0c2aad4')
     * let yInit = 3
     * let [A, B, C, D] = ['==', '<>', '<', '>'].map((s) => board.create('point', [4, yInit--], { name: s, label: { fontSize: 24 } }))
     * let seg = board.create('segment', [A, [() => A.X(), 0]])  // shows linear
     *
     * let isLeftRight = true;
     * let buttonMove = board.create('button', [-2, 4, 'left',
     * () => {
     *    isLeftRight = !isLeftRight;
     *    buttonMove.rendNodeButton.innerHTML = isLeftRight ? 'left' : 'right'
     *    let x = isLeftRight ? 4 : -4
     *    let sym = isLeftRight ? 'triangleleft' : 'triangleright'
     *
     *    A.moveTo([x, 3], 1000, { callback: () => A.setAttribute({ face: sym, size: 5 }) })
     *    B.moveTo([x, 2], 1000, { callback: () => B.setAttribute({ face: sym, size: 5 }), effect: "<>" })
     *    C.moveTo([x, 1], 1000, { callback: () => C.setAttribute({ face: sym, size: 5 }), effect: "<" })
     *    D.moveTo([x, 0], 1000, { callback: () => D.setAttribute({ face: sym, size: 5 }), effect: ">" })
     *
     * }]);
     *}
     *</script><pre>
     */
    moveTo(where, time, options) {
        options = options || {};
        where = new Coords(COORDS_BY.USER, where, this.board, true, this);

        var i,
            delay = this.board.attr.animationdelay,
            steps = Math.ceil(time / delay),
            coords = [],
            X = this.coords.usrCoords[1],
            Y = this.coords.usrCoords[2],
            dX = where.usrCoords[1] - X,
            dY = where.usrCoords[2] - Y,
            /** @ignore */
            stepFun = function (i) {
                var x = i / steps;  // absolute progress of the animatin

                if (options.effect) {
                    if (options.effect === "<>") {
                        return Math.pow(Math.sin((x * Math.PI) / 2), 2);
                    }
                    if (options.effect === "<") {   // cubic ease in
                        return x * x * x;
                    }
                    if (options.effect === ">") {   // cubic ease out
                        return 1 - Math.pow(1 - x, 3);
                    }
                    if (options.effect === "==") {
                        return i / steps;       // linear
                    }
                    throw new Error("valid effects are '==', '<>', '>', and '<'.");
                }
                return i / steps;  // default
            };

        if (
            !Type.exists(time) ||
            time === 0 ||
            Math.abs(where.usrCoords[0] - this.coords.usrCoords[0]) > JSXMath.eps
        ) {
            this.setPosition(COORDS_BY.USER, where.usrCoords);
            return this.board.update();
        }

        // In case there is no callback and we are already at the endpoint we can stop here
        if (
            !Type.exists(options.callback) &&
            Math.abs(dX) < JSXMath.eps &&
            Math.abs(dY) < JSXMath.eps
        ) {
            return this;
        }

        for (i = steps; i >= 0; i--) {
            coords[steps - i] = [
                where.usrCoords[0],
                X + dX * stepFun(i),
                Y + dY * stepFun(i)
            ];
        }

        this.animationPath = coords;
        this.animationCallback = options.callback;
        this.board.addAnimation(this);

        return this;
    }

    /**
     * Starts an animated point movement towards the given coordinates <tt>where</tt>. After arriving at
     * <tt>where</tt> the point moves back to where it started. The animation is done after <tt>time</tt>
     * milliseconds.
     * @param {Array} where Array containing the x and y coordinate of the target location.
     * @param {Number} time Number of milliseconds the animation should last.
     * @param {Object} [options] Optional settings for the animation
     * @param {function} [options.callback] A function that is called as soon as the animation is finished.
     * @param {String} [options.effect='<>'|'>'|'<'] animation effects like speed fade in and out. possible values are
     * '<>' for speed increase on start and slow down at the end (default), '<' for speed up, '>' for slow down, and '--' for constant speed during
     * the whole animation.
     * @param {Number} [options.repeat=1] How often this animation should be repeated.
     * @returns {JXG.CoordsElement} Reference to itself.
     * @see JXG.CoordsElement#moveAlong
     * @see JXG.CoordsElement#moveTo
     * @see JXG.CoordsElement#visitES6
     * @see JXG.GeometryElement#animate
     * @example
     * // visit() with different easing options
     * let yInit = 3
     * let [A, B, C, D] = ['==', '<>', '<', '>'].map((s) => board.create('point', [4, yInit--], { name: s, label: { fontSize: 24 } }))
     * let seg = board.create('segment', [A, [() => A.X(), 0]])  // shows linear
     *
     *let isLeftRight = true;
     *let buttonVisit = board.create('button', [0, 4, 'visit',
     *    () => {
     *        let x = isLeftRight ? 4 : -4
     *
     *        A.visit([-x, 3], 4000, { effect: "==", repeat: 2 })  // linear
     *        B.visit([-x, 2], 4000, { effect: "<>", repeat: 2 })
     *        C.visit([-x, 1], 4000, { effect: "<", repeat: 2 })
     *        D.visit([-x, 0], 4000, { effect: ">", repeat: 2 })
     *    }])
     *
     * </pre><div id="JXG0f35a50e-e99d-11e8-a1ca-04d3b0c2aad5" class="jxgbox" style="width: 300px; height: 300px;"></div>
     * <script type="text/javascript">
     * {
     *  let board = JXG.JSXGraph.initBoard('JXG0f35a50e-e99d-11e8-a1ca-04d3b0c2aad5')
     * let yInit = 3
     * let [A, B, C, D] = ['==', '<>', '<', '>'].map((s) => board.create('point', [4, yInit--], { name: s, label: { fontSize: 24 } }))
     * let seg = board.create('segment', [A, [() => A.X(), 0]])  // shows linear
     *
     * let isLeftRight = true;
     * let buttonVisit = board.create('button', [0, 4, 'visit',
     *    () => {
     *        let x = isLeftRight ? 4 : -4
     *
     *        A.visit([-x, 3], 4000, { effect: "==", repeat: 2 })  // linear
     *        B.visit([-x, 2], 4000, { effect: "<>", repeat: 2 })
     *        C.visit([-x, 1], 4000, { effect: "<", repeat: 2 })
     *        D.visit([-x, 0], 4000, { effect: ">", repeat: 2 })
     *    }])
     *   }
     * </script><pre>
     *
     */
    visit(where, time, options) {
        where = new Coords(COORDS_BY.USER, where, this.board, true, this);

        var i,
            j,
            steps,
            delay = this.board.attr.animationdelay,
            coords = [],
            X = this.coords.usrCoords[1],
            Y = this.coords.usrCoords[2],
            dX = where.usrCoords[1] - X,
            dY = where.usrCoords[2] - Y,
            /** @ignore */
            stepFun = function (i) {
                var x = i < steps / 2 ? (2 * i) / steps : (2 * (steps - i)) / steps;

                if (options.effect) {
                    if (options.effect === "<>") {        // slow at beginning and end
                        return Math.pow(Math.sin((x * Math.PI) / 2), 2);
                    }
                    if (options.effect === "<") {   // cubic ease in
                        return x * x * x;
                    }
                    if (options.effect === ">") {   // cubic ease out
                        return 1 - Math.pow(1 - x, 3);
                    }
                    if (options.effect === "==") {
                        return x;       // linear
                    }
                    throw new Error("valid effects are '==', '<>', '>', and '<'.");

                }
                return x;
            };

        // support legacy interface where the third parameter was the number of repeats
        if (Type.isNumber(options)) {
            options = { repeat: options };
        } else {
            options = options || {};
            if (!Type.exists(options.repeat)) {
                options.repeat = 1;
            }
        }

        steps = Math.ceil(time / (delay * options.repeat));

        for (j = 0; j < options.repeat; j++) {
            for (i = steps; i >= 0; i--) {
                coords[j * (steps + 1) + steps - i] = [
                    where.usrCoords[0],
                    X + dX * stepFun(i),
                    Y + dY * stepFun(i)
                ];
            }
        }
        this.animationPath = coords;
        this.animationCallback = options.callback;
        this.board.addAnimation(this.element);

        return this;
    }

    /**
     * ES6 version of {@link JXG.CoordsElement#moveAlong} using a promise.
     *
     * @param {Array} where Array containing the x and y coordinate of the target location.
     * @param {Number} [time] Number of milliseconds the animation should last.
     * @param {Object} [options] Optional settings for the animation
     * @returns Promise
     * @see JXG.CoordsElement#moveAlong
     * @example
     * var A = board.create('point', [4, 4]);
     * A.moveAlongES6([[3, -2], [4, 0], [3, 1], [4, 4]], 2000)
     *     .then(() => A.moveToES6([-3, -3], 1000));
     *
     * </pre><div id="JXGa45032e5-a517-4f1d-868a-65d698d344cf" class="jxgbox" style="width: 300px; height: 300px;"></div>
     * <script type="text/javascript">
     *     (function() {
     *         var board = JXG.JSXGraph.initBoard('JXGa45032e5-a517-4f1d-868a-65d698d344cf',
     *             {boundingbox: [-8, 8, 8,-8], axis: true, showcopyright: false, shownavigation: false});
     *     var A = board.create('point', [4, 4]);
     *     A.moveAlongES6([[3, -2], [4, 0], [3, 1], [4, 4]], 2000)
     *         .then(() => A.moveToES6([-3, -3], 1000));
     *
     *     })();
     *
     * </script><pre>
     *
     */
    moveAlongES6(path, time, options) {
        return new Promise((resolve, reject) => {
            if (Type.exists(options) && Type.exists(options.callback)) {
                options.callback = resolve;
            } else {
                options = {
                    callback: resolve
                };
            }
            this.moveAlong(path, time, options);
        });
    }

    /**
     * ES6 version of {@link JXG.CoordsElement#moveTo} using a promise.
     *
     * @param {Array} where Array containing the x and y coordinate of the target location.
     * @param {Number} [time] Number of milliseconds the animation should last.
     * @param {Object} [options] Optional settings for the animation
     * @returns Promise
     * @see JXG.CoordsElement#moveTo
     *
     * @example
     * var A = board.create('point', [4, 4]);
     * A.moveToES6([-3, 3], 1000)
     *     .then(() => A.moveToES6([-3, -3], 1000))
     *     .then(() => A.moveToES6([3, -3], 1000))
     *     .then(() => A.moveToES6([3, -3], 1000));
     *
     * </pre><div id="JXGabdc7771-34f0-4655-bb7b-fc329e773b89" class="jxgbox" style="width: 300px; height: 300px;"></div>
     * <script type="text/javascript">
     *     (function() {
     *         var board = JXG.JSXGraph.initBoard('JXGabdc7771-34f0-4655-bb7b-fc329e773b89',
     *             {boundingbox: [-8, 8, 8,-8], axis: true, showcopyright: false, shownavigation: false});
     *     var A = board.create('point', [4, 4]);
     *     A.moveToES6([-3, 3], 1000)
     *         .then(() => A.moveToES6([-3, -3], 1000))
     *         .then(() => A.moveToES6([3, -3], 1000))
     *         .then(() => A.moveToES6([3, -3], 1000));
     *
     *     })();
     *
     * </script><pre>
     *
     * @example
     *         var A = board.create('point', [4, 4]);
     *         A.moveToES6([-3, 3], 1000)
     *             .then(function() {
     *                 return A.moveToES6([-3, -3], 1000);
     *             }).then(function() {
     *                 return A.moveToES6([ 3, -3], 1000);
     *             }).then(function() {
     *                 return A.moveToES6([ 3, -3], 1000);
     *             }).then(function() {
     *                 return A.moveAlongES6([[3, -2], [4, 0], [3, 1], [4, 4]], 5000);
     *             }).then(function() {
     *                 return A.visitES6([-4, -4], 3000);
     *             });
     *
     * </pre><div id="JXGa9439ce5-516d-4dba-9233-2a4ad9589995" class="jxgbox" style="width: 300px; height: 300px;"></div>
     * <script type="text/javascript">
     *     (function() {
     *         var board = JXG.JSXGraph.initBoard('JXGa9439ce5-516d-4dba-9233-2a4ad9589995',
     *             {boundingbox: [-8, 8, 8,-8], axis: true, showcopyright: false, shownavigation: false});
     *             var A = board.create('point', [4, 4]);
     *             A.moveToES6([-3, 3], 1000)
     *                 .then(function() {
     *                     return A.moveToES6([-3, -3], 1000);
     *                 }).then(function() {
     *                     return A.moveToES6([ 3, -3], 1000);
     *                 }).then(function() {
     *                     return A.moveToES6([ 3, -3], 1000);
     *                 }).then(function() {
     *                     return A.moveAlongES6([[3, -2], [4, 0], [3, 1], [4, 4]], 5000);
     *                 }).then(function() {
     *                     return A.visitES6([-4, -4], 3000);
     *                 });
     *
     *     })();
     *
     * </script><pre>
     *
     */
    moveToES6(where, time, options) {
        return new Promise((resolve, reject) => {
            if (Type.exists(options) && Type.exists(options.callback)) {
                options.callback = resolve;
            } else {
                options = {
                    callback: resolve
                };
            }
            this.moveTo(where, time, options);
        });
    }

    /**
     * ES6 version of {@link JXG.CoordsElement#moveVisit} using a promise.
     *
     * @param {Array} where Array containing the x and y coordinate of the target location.
     * @param {Number} [time] Number of milliseconds the animation should last.
     * @param {Object} [options] Optional settings for the animation
     * @returns Promise
     * @see JXG.CoordsElement#visit
     * @example
     * var A = board.create('point', [4, 4]);
     * A.visitES6([-4, -4], 3000)
     *     .then(() => A.moveToES6([-3, 3], 1000));
     *
     * </pre><div id="JXG640f1fd2-05ec-46cb-b977-36d96648ce41" class="jxgbox" style="width: 300px; height: 300px;"></div>
     * <script type="text/javascript">
     *     (function() {
     *         var board = JXG.JSXGraph.initBoard('JXG640f1fd2-05ec-46cb-b977-36d96648ce41',
     *             {boundingbox: [-8, 8, 8,-8], axis: true, showcopyright: false, shownavigation: false});
     *     var A = board.create('point', [4, 4]);
     *     A.visitES6([-4, -4], 3000)
     *         .then(() => A.moveToES6([-3, 3], 1000));
     *
     *     })();
     *
     * </script><pre>
     *
     */
    visitES6(where, time, options) {
        return new Promise((resolve, reject) => {
            if (Type.exists(options) && Type.exists(options.callback)) {
                options.callback = resolve;
            } else {
                options = {
                    callback: resolve
                };
            }
            this.visit(where, time, options);
        });
    }

    /**
     * Animates a glider. Is called by the browser after startAnimation is called.
     * @param {Number} direction The direction the glider is animated.
     * @param {Number} stepCount The number of steps in which the parent element is divided.
     * Must be at least 1.
     * @param {Number} [maxRounds=-1] The number of rounds the glider will be animated. The glider will run infinitely if
     * maxRounds is negative or equal to Infinity.
     * @see JXG.CoordsElement#startAnimation
     * @see JXG.CoordsElement#stopAnimation
     * @private
     * @returns {JXG.CoordsElement} Reference to itself.
     */
    _anim(direction, stepCount, maxRounds) {
        var dX, dY, alpha, startPoint, newX, radius, sp1c, sp2c, res;

        // TODO: move this to glider
        // this._intervalCount += 1;
        // if (this._intervalCount > stepCount) {
        //     this._intervalCount = 0;

        //     this._roundsCount += 1;
        //     if (maxRounds > 0 && this._roundsCount >= maxRounds) {
        //         this._roundsCount = 0;
        //         return this.stopAnimation();
        //     }
        // }

        // if (this.slideObject.elementClass === OBJECT_CLASS.LINE) {
        //     sp1c = this.slideObject.point1.coords.scrCoords;
        //     sp2c = this.slideObject.point2.coords.scrCoords;

        //     dX = Math.round(((sp2c[1] - sp1c[1]) * this._intervalCount) / stepCount);
        //     dY = Math.round(((sp2c[2] - sp1c[2]) * this._intervalCount) / stepCount);
        //     if (direction > 0) {
        //         startPoint = this.slideObject.point1;
        //     } else {
        //         startPoint = this.slideObject.point2;
        //         dX *= -1;
        //         dY *= -1;
        //     }

        //     this.coords.setCoordinates(COORDS_BY.SCREEN, [
        //         startPoint.coords.scrCoords[1] + dX,
        //         startPoint.coords.scrCoords[2] + dY
        //     ]);
        // } else if (this.slideObject.elementClass === OBJECT_CLASS.CURVE) {
        //     if (direction > 0) {
        //         newX = (this.slideObject.maxX() - this.slideObject.minX()) * this._intervalCount / stepCount + this.slideObject.minX();
        //     } else {
        //         newX = -(this.slideObject.maxX() - this.slideObject.minX()) * this._intervalCount / stepCount + this.slideObject.maxX();
        //     }
        //     this.coords.setCoordinates(COORDS_BY.USER, [this.slideObject.X(newX), this.slideObject.Y(newX)]);

        //     res = Geometry.projectPointToCurve(this, this.slideObject, this.board);
        //     this.coords = res[0];
        //     this.position = res[1];
        // } else if (this.slideObject.elementClass === OBJECT_CLASS.CIRCLE) {
        //     alpha = 2 * Math.PI;
        //     if (direction < 0) {
        //         alpha *= this._intervalCount / stepCount;
        //     } else {
        //         alpha *= (stepCount - this._intervalCount) / stepCount;
        //     }
        //     radius = this.slideObject.Radius();

        //     this.coords.setCoordinates(COORDS_BY.USER, [
        //         this.slideObject.center.coords.usrCoords[1] + radius * Math.cos(alpha),
        //         this.slideObject.center.coords.usrCoords[2] + radius * Math.sin(alpha)
        //     ]);
        // }

        // this.board.update(this);
        return this;
    }


    // tbtb - moved to individual elements
    // // documented in GeometryElement
    // getTextAnchor() {
    //     return this.coords;
    // }

    // // documented in GeometryElement
    // getLabelAnchor() {
    //     return this.coords;
    // }

    // documented in element.js
    getParents() {
        var p = [this.Z(), this.X(), this.Y()];

        if (this.parents.length !== 0) {
            p = this.parents;
        }

        // TODO: move to glider
        // if (this.type === OBJECT_TYPE.GLIDER) {
        //     p = [this.X(), this.Y(), this.slideObject.id];
        // }

        return p;
    }



    /**
     * Generic method to create point, text or image.
     * Determines the type of the construction, i.e. free, or constrained by function,
     * transformation or of glider type.
     * @param{Object} Callback Object type, e.g. JXG.Point, JXG.Text or JXG.Image
     * @param{Object} board Link to the board object
     * @param{Array} coords Array with coordinates. This may be: array of numbers, function
     * returning an array of numbers, array of functions returning a number, object and transformation.
     * If the attribute "slideObject" exists, a glider element is constructed.
     * @param{Object} attr Attributes object
     * @param{Object} arg1 Optional argument 1: in case of text this is the text content,
     * in case of an image this is the url.
     * @param{Array} arg2 Optional argument 2: in case of image this is an array containing the size of
     * the image.
     * @returns{Object} returns the created object or false.
     */

    // old version  THIS SHOULD BE MOVED TO CONSTRUCTOR, BUT VISPROPS NOT YET SET IN CONSTRUCTOR ?!?
    public create(Callback, board, coords, attr, arg1, arg2) {

        if (dbug(this)) console.warn(`%c coordselements: create ${JSON.stringify(coords)}`, dbugColor)
        console.error(`%c this should be in the coordselements constructor`)

        var el,
            isConstrained = false,
            i;

        for (i = 0; i < coords.length; i++) {
            if (Type.isFunction(coords[i]) || Type.isString(coords[i])) {
                isConstrained = true;
            }
        }

        if (!isConstrained) {
            if (Type.isNumber(coords[0]) && Type.isNumber(coords[1])) {
                el = new Callback(board, coords, attr, arg1, arg2);

                if (Type.exists(attr.slideobject)) {
                    el.makeGlider(attr.slideobject);
                } else {
                    // Free element
                    el.baseElement = el;
                }
                el.isDraggable = true;
            } else if (Type.isObject(coords[0]) && Type.isTransformationOrArray(coords[1])) {
                // Transformation
                // TODO less general specification of isObject
                el = new Callback(board, [0, 0], attr, arg1, arg2);
                el.addTransform(coords[0], coords[1]);
                el.isDraggable = false;
            } else {
                return false;
            }
        } else {
            el = new Callback(board, [0, 0], attr, arg1, arg2);
            el.addConstraint(coords);
        }

        el.handleSnapToGrid();
        el.handleSnapToPoints();
        el.handleAttractors();

        el.addParents(coords);
        return el;
    }

    public coordsConstructor(coords: any[] /*coords part of parents */, attr1?) {

        if (dbug(this))
            console.warn(`%c coordselements: INIT ${JSON.stringify(coords)}`, dbugColor, attr1)

        let isConstrained = false

        for (let i = 0; i < coords.length; i++) {
            if (Type.isFunction(coords[i]) || Type.isString(coords[i])) {
                isConstrained = true;
            }
        }

        if (!isConstrained) {
            if (Type.isNumber(coords[0]) && Type.isNumber(coords[1])) {

                if (Type.exists(attr1.slideobject)) {
                    // tbtb - attr1 is never a glider, so always false
                    throw new Error('huh?')
                //     this.makeGlider(attr1.slideobject);
                } else {
                    // Free element
                    this.baseElement = this;
                }
                this.isDraggable = true;
            } else if (Type.isObject(coords[0]) && Type.isTransformationOrArray(coords[1])) {
                // Transformation
                // TODO less general specification of isObject
                coords = [0, 0]
                this.addTransform(coords[0], coords[1]);
                this.isDraggable = false;
            } else {

                // nothing // return false;
            }
        } else {
            coords = [0, 0]
            this.addConstraint(coords);
        }

        this.handleSnapToGrid();
        this.handleSnapToPoints();
        this.handleAttractors();

        this.addParents(coords);
    }


}