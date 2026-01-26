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

/*global JXG2: true, define: true*/
/*jslint nomen: true, plusplus: true*/

/**
 * @fileoverview In this file the geometry object Arc is defined. Arc stores all
 * style and functional properties that are required to draw an arc on a board.
 */

import { Geometry } from "../math/geometry.js";
import { JSXMath } from "../math/math.js";
import { Coords } from "../base/coords.js";
import { Options } from "../options.js";
import { Curve } from "../base/curve.js";
import { Board } from "../base/board.js";
// import { CoordsElement } from "../base/coordselement.js";

import { Circle } from "../base/circle.js";
import { Type } from "../utils/type.js";
import { OBJECT_CLASS, OBJECT_TYPE, COORDS_BY } from "../base/constants.js";
import { Env } from "../utils/env.js";
import { Point } from "../base/point.js";

/**
 * @class An arc is a partial circumference line of a circle.
 * It is defined by a center, one point that
 * defines the radius, and a third point that defines the angle of the arc.
 * <p>
 * As a curve the arc has curve length 6.
 * @pseudo
 * @name Arc
 * @augments Curve
 * @constructor
 * @type JXG2.Curve
 * @throws {Error} If the element cannot be constructed with the given parent objects an exception is thrown.
 * @param {JXG2.Point_JXG.Point_JXG.Point} p1,p2,p3 The result will be an arc of a circle around p1 through p2. The arc is drawn
 * counter-clockwise from p2 to p3.
 * @example
 * // Create an arc out of three free points
 * var p1 = board.create('point', [2.0, 2.0]);
 * var p2 = board.create('point', [1.0, 0.5]);
 * var p3 = board.create('point', [3.5, 1.0]);
 *
 * var a = board.create('arc', [p1, p2, p3]);
 * board.create('text',[1,6,function(){return 'arclength: '+Math.round(a.Value()*100)/100}])
 * </pre><div class="jxgbox" id="JXG114ef584-4a5e-4686-8392-c97501befb5b" style="width: 300px; height: 300px;"></div>
 * <script type="text/javascript">
 * (function () {
 *   var board = JXG2.JSXGraph.initBoard('JXG114ef584-4a5e-4686-8392-c97501befb5b', {boundingbox: [-1, 7, 7, -1], axis: true, showcopyright: false, shownavigation: false}),
 *       p1 = board.create('point', [2.0, 2.0]),
 *       p2 = board.create('point', [1.0, 0.5]),
 *       p3 = board.create('point', [3.5, 1.0]),
 *
 *       a = board.create('arc', [p1, p2, p3]);
 *       board.create('text',[1,6,function(){return 'arclength: '+Math.round(a.Value()*100)/100}])
 * })();
 * </script><pre>
 *
 * @example
 * var t = board.create('transform', [2, 1.5], {type: 'scale'});
 * var a1 = board.create('arc', [[1, 1], [0, 1], [1, 0]], {strokeColor: 'red'});
 * var a2 = board.create('curve', [a1, t], {strokeColor: 'red'});
 *
 * </pre><div id="JXG1949da46-6339-11e8-9fb9-901b0e1b8723" class="jxgbox" style="width: 300px; height: 300px;"></div>
 * <script type="text/javascript">
 *     (function() {
 *         var board = JXG2.JSXGraph.initBoard('JXG1949da46-6339-11e8-9fb9-901b0e1b8723',
 *             {boundingbox: [-8, 8, 8,-8], axis: true, showcopyright: false, shownavigation: false});
 *     var t = board.create('transform', [2, 1.5], {type: 'scale'});
 *     var a1 = board.create('arc', [[1, 1], [0, 1], [1, 0]], {strokeColor: 'red'});
 *     var a2 = board.create('curve', [a1, t], {strokeColor: 'red'});
 *
 *     })();
 *
 * </script><pre>
 *
 */
export class Arc extends Curve { //Curve {
    point3: Point
    useDirection

    constructor(board: Board, points: Point[], attributes) {

        console.log(points)
        let attr = Type.initVisProps(Options.elements, Options.arc, attributes)
        super(board, [[0], [0], 0, 4], attr)

        this.visProp = Type.initVisProps(Options.board,Options.elements, Options.curve,Options.arc,attributes)

        this.elementUpdate = () => this.update();
        this.elementUpdateRenderer = () => this.updateRenderer();
        // this.elementCreateLabel = () => this.createLabel()
        this.elementGetLabelAnchor = () => this.getLabelAnchor();
        this.elementGetTextAnchor = () => this.getTextAnchor();



        /**
         * documented in JXG2.GeometryElement
         * @ignore
         */
        this.otype = OBJECT_TYPE.ARC;

        /**
         * Center of the arc.
         * @memberOf Arc.prototype
         * @name center
         * @type JXG2.Point
         */
        this.center = points[0];

        /**
         * Point defining the arc's radius.
         * @memberOf Arc.prototype
         * @name radiuspoint
         * @type JXG2.Point
         */
        this.radiuspoint = points[1];
        this.point2 = this.radiuspoint;

        /**
         * The point defining the arc's angle.
         * @memberOf Arc.prototype
         * @name anglepoint
         * @type JXG2.Point
         */
        this.anglepoint = points[2];
        this.point3 = this.anglepoint;

        // Add arc as child to defining points
        // or vice versa if the points are provided as coordinates
        if (Type.exists(this.center._is_new)) {
            this.addChild(this.center);
            delete this.center._is_new;
        } else {
            this.center.addChild(this);
        }
        if (Type.exists(this.radiuspoint._is_new)) {
            this.addChild(this.radiuspoint);
            delete this.radiuspoint._is_new;
        } else {
            this.radiuspoint.addChild(this);
        }
        if (Type.exists(this.anglepoint._is_new)) {
            this.addChild(this.anglepoint);
            delete this.anglepoint._is_new;
        } else {
            this.anglepoint.addChild(this);
        }

        // This attribute is necessary for circumCircleArcs
        this.useDirection = attr.usedirection; // This makes the attribute immutable


        // this.methodMap = Type.deepCopy(el.methodMap, {
        //     getRadius: "getRadius",
        //     radius: "Radius",
        //     Radius: "Radius",
        //     center: "center",
        //     radiuspoint: "radiuspoint",
        //     anglepoint: "anglepoint",
        //     Value: "Value",
        //     L: "L"
        // });

        this.setUpdateDataArray()  // copy updateDataArray to Curve


        this.elType = 'arc';
        this.setParents(points);

        this.prepareUpdate()
        this.update();
    }



    //  tbtb - copied next two functions from circle.js
    //  tbtb - where do they belong?  Radius() might be different
    /**
     * Updates this circle's {@link JXG2.Circle#quadraticform}.
     * @private
     */
    updateQuadraticform() {
        var m = this.center,
            mX = m.X(),
            mY = m.Y(),
            r = this.Radius();

        this.quadraticform = [
            [mX * mX + mY * mY - r * r, -mX, -mY],
            [-mX, 1, 0],
            [-mY, 0, 1]
        ];
    }

    /**
     * Updates the stdform derived from the position of the center and the circle's radius.
     * @private
     */
    updateStdform() {
        this.stdform[3] = 0.5;
        this.stdform[4] = this.Radius();
        this.stdform[1] = -this.center.coords.usrCoords[1];
        this.stdform[2] = -this.center.coords.usrCoords[2];
        if (!isFinite(this.stdform[4])) {
            this.stdform[0] = Type.exists(this.point2)
                ? -(
                    this.stdform[1] * this.point2.coords.usrCoords[1] +
                    this.stdform[2] * this.point2.coords.usrCoords[2]
                )
                : 0;
        }
        this.normalize();
    }



    // documented in JXG2.Curve
    /**
     * @class
     * @ignore
     */
    setUpdateDataArray() {
        this.updateDataArray = () => {
            var ar, phi, det,
                p0c, p1c, p2c,
                sgn = 1

            let A = this.radiuspoint
            let B = this.center
            let C = this.anglepoint

            let ev_s = this.evalVisProp('selection');

            phi = Geometry.rad(A, B, C);
            if ((ev_s === "minor" && phi > Math.PI) || (ev_s === "major" && phi < Math.PI)) {
                sgn = -1;
            }

            // This is true for circumCircleArcs. In that case there is
            // a fourth parent element: [center, point1, point3, point2]
            if (this.useDirection) {
                p0c = this.points[1].coords.usrCoords;
                p1c = this.points[3].coords.usrCoords;
                p2c = this.points[2].coords.usrCoords;
                det = (p0c[1] - p2c[1]) * (p0c[2] - p1c[2]) - (p0c[2] - p2c[2]) * (p0c[1] - p1c[1]);

                if (det < 0) {
                    this.radiuspoint = this.points[1];
                    this.anglepoint = this.points[2];
                } else {
                    this.radiuspoint = this.points[2];
                    this.anglepoint = this.points[1];
                }
            }

            let A_usr = A.coords.usrCoords;
            let B_usr = B.coords.usrCoords;
            let Cusr = C.coords.usrCoords;

            ar = Geometry.bezierArc(A_usr, B_usr, Cusr, false, sgn);

            this.dataX = ar[0];
            this.dataY = ar[1];

            this.bezierDegree = 3;

            this.updateStdform();
            this.updateQuadraticform();
        };
    }
    /**
     * Determines the arc's current radius. I.e. the distance between {@link Arc#center} and {@link Arc#radiuspoint}.
     * @memberOf Arc.prototype
     * @name Radius
     * @function
     * @returns {Number} The arc's radius
     */
    Radius() {
        return this.radiuspoint.Dist(this.center);
    };

    /**
     * @deprecated Use {@link Arc#Radius}
     * @memberOf Arc.prototype
     * @name getRadius
     * @function
     * @returns {Number}
     */
    getRadius() {
        Env.deprecated("Arc.getRadius()", "Arc.Radius()");
        return this.Radius();
    };

    /**
     * Returns the length of the arc or the value of the angle spanned by the arc.
     * @memberOf Arc.prototype
     * @name Value
     * @function
     * @param {String} [unit='length'] Unit of the returned values. Possible units are
     * <ul>
     * <li> 'length' (default): length of the arc line
     * <li> 'radians': angle spanned by the arc in radians
     * <li> 'degrees': angle spanned by the arc in degrees
     * <li> 'semicircle': angle spanned by the arc in radians as a multiple of &pi;, e.g. if the angle is 1.5&pi;, 1.5 will be returned.
     * <li> 'circle': angle spanned by the arc in radians as a multiple of 2&pi;
     * </ul>
     * It is sufficient to supply the first three characters of the unit, e.g. 'len'.
     * @param {Number} [rad=undefined] Value of angle which can be used instead of the generic one.
     * @returns {Number} The arc length or the angle value in various units.
     */
    Value(unit: string, rad?): number {
        let val: number;

        rad = rad || Geometry.rad(this.radiuspoint, this.center, this.anglepoint);

        unit = unit || 'length';
        unit = unit.toLocaleLowerCase();
        if (unit === '' || unit.indexOf('len') === 0) {
            val = rad * this.Radius();
        } else if (unit.indexOf('rad') === 0) {
            val = rad;
        } else if (unit.indexOf('deg') === 0) {
            val = rad * 180 / Math.PI;
        } else if (unit.indexOf('sem') === 0) {
            val = rad / Math.PI;
        } else if (unit.indexOf('cir') === 0) {
            val = rad * 0.5 / Math.PI;
        }

        return val;
    };

    /**
     * Arc length.
     * @memberOf Arc.prototype
     * @name L
     * @returns {Number} Length of the arc.
     * @see Arc#Value
     */
    L() {
        return this.Value('length');
    };

    // documented in geometry element
    hasPoint(x, y) {
        var dist,
            checkPoint,
            has,
            invMat,
            c,
            prec,
            type,
            r = this.Radius();

        if (this.evalVisProp('hasinnerpoints')) {
            return this.hasPointSector(x, y);
        }

        if (Type.isObject(this.evalVisProp('precision'))) {
            type = this.board._inputDevice;
            prec = this.evalVisProp('precision.' + type);
        } else {
            // 'inherit'
            prec = this.board.options.precision.hasPoint;
        }
        prec /= Math.min(Math.abs(this.board.unitX), Math.abs(this.board.unitY));
        checkPoint = new Coords(COORDS_BY.SCREEN, [x, y], this.board);

        if (this.transformations.length > 0) {
            // Transform the mouse/touch coordinates
            // back to the original position of the curve.
            this.updateTransformMatrix();
            invMat = JSXMath.inverse(this.transformMat);
            c = JSXMath.matVecMult(invMat, checkPoint.usrCoords);
            checkPoint = new Coords(COORDS_BY.USER, c, this.board);
        }

        dist = this.center.coords.distance(COORDS_BY.USER, checkPoint);
        has = Math.abs(dist - r) < prec;

        /**
         * At that point we know that the user has touched the circle line.
         * Now, we have to check, if the user has hit the arc path.
         */
        if (has) {
            has = Geometry.coordsOnArc(this, checkPoint);
        }
        return has;
    };

    /**
     * Checks whether (x,y) is within the sector defined by the arc.
     * @memberOf Arc.prototype
     * @name hasPointSector
     * @function
     * @param {Number} x Coordinate in x direction, screen coordinates.
     * @param {Number} y Coordinate in y direction, screen coordinates.
     * @returns {Boolean} True if (x,y) is within the sector defined by the arc, False otherwise.
     */
    hasPointSector(x, y) {
        var checkPoint = new Coords(COORDS_BY.SCREEN, [x, y], this.board),
            r = this.Radius(),
            dist = this.center.coords.distance(COORDS_BY.USER, checkPoint),
            has = dist < r;

        if (has) {
            has = Geometry.coordsOnArc(this, checkPoint);
        }
        return has;
    };

    // documented in geometry element
    getTextAnchor() {
        return this.center.coords;
    };

    // documented in geometry element
    /**
     * @class
     * @ignore
     */
    getLabelAnchor() {
        var coords,
            vec, vecx, vecy,
            len,
            pos = this.label.evalVisProp('position'),
            angle = Geometry.rad(this.radiuspoint, this.center, this.anglepoint),
            dx = 10 / this.board.unitX,
            dy = 10 / this.board.unitY,
            p2c = this.point2.coords.usrCoords,
            pmc = this.center.coords.usrCoords,
            bxminusax = p2c[1] - pmc[1],
            byminusay = p2c[2] - pmc[2],
            ev_s = this.evalVisProp('selection'),
            l_vp = this.label ? this.label.visProp : this.evalVisProp('label');

        // If this is uncommented, the angle label can not be dragged
        //if (Type.exists(this.label)) {
        //    this.label.relativeCoords = new Coords(COORDS_BY.SCREEN, [0, 0], this.board);
        //}

        if (
            !Type.isString(pos) ||
            (pos.indexOf('right') < 0 && pos.indexOf('left') < 0)
        ) {

            if ((ev_s === "minor" && angle > Math.PI) || (ev_s === "major" && angle < Math.PI)) {
                angle = -(2 * Math.PI - angle);
            }

            coords = new Coords(
                COORDS_BY.USER,
                [
                    pmc[1] + Math.cos(angle * 0.5) * bxminusax - Math.sin(angle * 0.5) * byminusay,
                    pmc[2] + Math.sin(angle * 0.5) * bxminusax + Math.cos(angle * 0.5) * byminusay
                ],
                this.board
            );

            vecx = coords.usrCoords[1] - pmc[1];
            vecy = coords.usrCoords[2] - pmc[2];

            len = Math.hypot(vecx, vecy);
            vecx = (vecx * (len + dx)) / len;
            vecy = (vecy * (len + dy)) / len;
            vec = [pmc[1] + vecx, pmc[2] + vecy];

            l_vp.position = Geometry.calcLabelQuadrant(Geometry.rad([1, 0], [0, 0], vec));

            return new Coords(COORDS_BY.USER, vec, this.board);
        } else {
            return this.getLabelPosition(pos, this.label.evalVisProp('distance'));
        }

    };

}


export function createArc(board, parents, attributes) {
    let points = Type.providePoints(board, parents, attributes, 'point');
    return new Arc(board, points, attributes)
}

/**
 * @class A semicircle is a special arc defined by two points. The arc hits both points.
 * @pseudo
 * @name Semicircle
 * @augments Arc
 * @constructor
 * @type Arc
 * @throws {Error} If the element cannot be constructed with the given parent objects an exception is thrown.
 * @param {JXG2.Point_JXG.Point} p1,p2 The result will be a composition of an arc drawn clockwise from <tt>p1</tt> and
 * <tt>p2</tt> and the midpoint of <tt>p1</tt> and <tt>p2</tt>.
 * @example
 * // Create an arc out of three free points
 * var p1 = board.create('point', [4.5, 2.0]);
 * var p2 = board.create('point', [1.0, 0.5]);
 *
 * var a = board.create('semicircle', [p1, p2]);
 * </pre><div class="jxgbox" id="JXG5385d349-75d7-4078-b732-9ae808db1b0e" style="width: 300px; height: 300px;"></div>
 * <script type="text/javascript">
 * (function () {
 *   var board = JXG2.JSXGraph.initBoard('JXG5385d349-75d7-4078-b732-9ae808db1b0e', {boundingbox: [-1, 7, 7, -1], axis: true, showcopyright: false, shownavigation: false}),
 *       p1 = board.create('point', [4.5, 2.0]),
 *       p2 = board.create('point', [1.0, 0.5]),
 *
 *       sc = board.create('semicircle', [p1, p2]);
 * })();
 * </script><pre>
 */
export function createSemicircle(board, parents, attributes) {
    var el, mp, attr, points;

    // we need 2 points
    points = Type.providePoints(board, parents, attributes, 'point');
    if (points === false || points.length !== 2) {
        throw new Error(
            "JSXGraph: Can't create Semicircle with parent types '" +
            typeof parents[0] +
            "' and '" +
            typeof parents[1] +
            "'." +
            "\nPossible parent types: [point,point]"
        );
    }

    attr = Type.copyAttributes(attributes, board.options, "semicircle", 'center');
    mp = board.create("midpoint", points, attr);
    mp.dump = false;

    attr = Type.copyAttributes(attributes, board.options, 'semicircle');
    el = board.create("arc", [mp, points[1], points[0]], attr);
    el.elType = 'semicircle';
    el.setParents([points[0].id, points[1].id]);
    el.subs = {
        midpoint: mp
    };
    el.inherits.push(mp);

    /**
     * The midpoint of the two defining points.
     * @memberOf Semicircle.prototype
     * @name midpoint
     * @type Midpoint
     */
    el.midpoint = el.center = mp;

    return el;
};


/**
 * @class A partial circum circle through three points.
 * @pseudo
 * @name CircumcircleArc
 * @augments Arc
 * @constructor
 * @type Arc
 * @throws {Error} If the element cannot be constructed with the given parent objects an exception is thrown.
 * @param {JXG2.Point_JXG.Point_JXG.Point} p1,p2,p3 The result will be a composition of an arc of the circumcircle of
 * <tt>p1</tt>, <tt>p2</tt>, and <tt>p3</tt> and the midpoint of the circumcircle of the three points. The arc is drawn
 * counter-clockwise from <tt>p1</tt> over <tt>p2</tt> to <tt>p3</tt>.
 * @example
 * // Create a circum circle arc out of three free points
 * var p1 = board.create('point', [2.0, 2.0]);
 * var p2 = board.create('point', [1.0, 0.5]);
 * var p3 = board.create('point', [3.5, 1.0]);
 *
 * var a = board.create('circumcirclearc', [p1, p2, p3]);
 * </pre><div class="jxgbox" id="JXG87125fd4-823a-41c1-88ef-d1a1369504e3" style="width: 300px; height: 300px;"></div>
 * <script type="text/javascript">
 * (function () {
 *   var board = JXG2.JSXGraph.initBoard('JXG87125fd4-823a-41c1-88ef-d1a1369504e3', {boundingbox: [-1, 7, 7, -1], axis: true, showcopyright: false, shownavigation: false}),
 *       p1 = board.create('point', [2.0, 2.0]),
 *       p2 = board.create('point', [1.0, 0.5]),
 *       p3 = board.create('point', [3.5, 1.0]),
 *
 *       cca = board.create('circumcirclearc', [p1, p2, p3]);
 * })();
 * </script><pre>
 */
export function createCircumcircleArc(board, parents, attributes) {
    var el, mp, attr, points;

    // We need three points
    points = Type.providePoints(board, parents, attributes, 'point');
    if (points === false || points.length !== 3) {
        throw new Error(
            "JSXGraph: create Circumcircle Arc with parent types '" +
            typeof parents[0] +
            "' and '" +
            typeof parents[1] +
            "' and '" +
            typeof parents[2] +
            "'." +
            "\nPossible parent types: [point,point,point]"
        );
    }

    attr = Type.copyAttributes(attributes, board.options, "circumcirclearc", 'center');
    mp = board.create("circumcenter", points, attr);
    mp.dump = false;

    attr = Type.copyAttributes(attributes, board.options, 'circumcirclearc');
    attr.usedirection = true;
    el = board.create("arc", [mp, points[0], points[2], points[1]], attr);

    el.elType = 'circumcirclearc';
    el.setParents([points[0].id, points[1].id, points[2].id]);
    el.subs = {
        center: mp
    };
    el.inherits.push(mp);

    /**
     * The midpoint of the circumcircle of the three points defining the circumcircle arc.
     * @memberOf CircumcircleArc.prototype
     * @name center
     * @type Circumcenter
     */
    el.center = mp;

    return el;
};


/**
 * @class A minor arc given by three points is that part of the circumference of a circle having
 * measure at most 180 degrees (pi radians). It is defined by a center, one point that
 * defines the radius, and a third point that defines the angle of the arc.
 * @pseudo
 * @name MinorArc
 * @augments Curve
 * @constructor
 * @type JXG2.Curve
 * @throws {Error} If the element cannot be constructed with the given parent objects an exception is thrown.
 * @param {JXG2.Point_JXG.Point_JXG.Point} p1,p2,p3 . Minor arc is an arc of a circle around p1 having measure less than or equal to
 * 180 degrees (pi radians) and starts at p2. The radius is determined by p2, the angle by p3.
 * @example
 * // Create an arc out of three free points
 * var p1 = board.create('point', [2.0, 2.0]);
 * var p2 = board.create('point', [1.0, 0.5]);
 * var p3 = board.create('point', [3.5, 1.0]);
 *
 * var a = board.create('arc', [p1, p2, p3]);
 * </pre><div class="jxgbox" id="JXG64ba7ca2-8728-45f3-96e5-3c7a4414de2f" style="width: 300px; height: 300px;"></div>
 * <script type="text/javascript">
 * (function () {
 *   var board = JXG2.JSXGraph.initBoard('JXG64ba7ca2-8728-45f3-96e5-3c7a4414de2f', {boundingbox: [-1, 7, 7, -1], axis: true, showcopyright: false, shownavigation: false}),
 *       p1 = board.create('point', [2.0, 2.0]),
 *       p2 = board.create('point', [1.0, 0.5]),
 *       p3 = board.create('point', [3.5, 1.0]),
 *
 *       a = board.create('minorarc', [p1, p2, p3]);
 * })();
 * </script><pre>
 */

export function createMinorArc(board, parents, attributes) {
    attributes.selection = 'minor';
    return createArc(board, parents, attributes);
};


/**
 * @class A major arc given by three points is that part of the circumference of a circle having
 * measure at least 180 degrees (pi radians). It is defined by a center, one point that
 * defines the radius, and a third point that defines the angle of the arc.
 * @pseudo
 * @name MajorArc
 * @augments Curve
 * @constructor
 * @type JXG2.Curve
 * @throws {Error} If the element cannot be constructed with the given parent objects an exception is thrown.
 * @param {JXG2.Point_JXG.Point_JXG.Point} p1,p2,p3 . Major arc is an arc of a circle around p1 having measure greater than or equal to
 * 180 degrees (pi radians) and starts at p2. The radius is determined by p2, the angle by p3.
 * @example
 * // Create an arc out of three free points
 * var p1 = board.create('point', [2.0, 2.0]);
 * var p2 = board.create('point', [1.0, 0.5]);
 * var p3 = board.create('point', [3.5, 1.0]);
 *
 * var a = board.create('majorarc', [p1, p2, p3]);
 * </pre><div class="jxgbox" id="JXG17a10d38-5629-40a4-b150-f41806edee9f" style="width: 300px; height: 300px;"></div>
 * <script type="text/javascript">
 * (function () {
 *   var board = JXG2.JSXGraph.initBoard('JXG17a10d38-5629-40a4-b150-f41806edee9f', {boundingbox: [-1, 7, 7, -1], axis: true, showcopyright: false, shownavigation: false}),
 *       p1 = board.create('point', [2.0, 2.0]),
 *       p2 = board.create('point', [1.0, 0.5]),
 *       p3 = board.create('point', [3.5, 1.0]),
 *
 *       a = board.create('majorarc', [p1, p2, p3]);
 * })();
 * </script><pre>
 */
export function createMajorArc(board, parents, attributes): Arc {
    attributes.selection = 'major';
    return createArc(board, parents, attributes);
};

