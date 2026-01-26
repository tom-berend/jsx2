let dbug = (elem) => false //elem && elem.id === 'jxgBoard1P3'
const dbugColor = `color:black;background-color:#ff80c0`;



import { Board } from "../base/board.js";
import { Point, createPoint } from "../base/point.js";
import { OBJECT_CLASS, OBJECT_TYPE, COORDS_BY } from "../base/constants.js";
import { Type } from "../utils/type.js";
import { LooseObject } from "../interfaces.js";
import { Geometry } from "../math/geometry.js";
import { Coords } from "../base/coords.js";
import { JSXMath } from "../math/math.js";
import { GeometryElement } from "../base/element.js";
import { Circle } from "../base/circle.js";
import { Curve } from "../base/curve.js";
import { Line } from "../base/line.js";

//tbtbtb
export class Glider extends Point {

    /**
     * Determines whether the element slides on a polygon if point is a glider.
     * @type Boolean
     * @default false
     * @private
     */
    onPolygon = false;

    /**
     * If the Glider is part of a constuction (like a Slider), this function will be set to represent a value
     * {@link Slider#createSlider} for example
     */
    Value: Function = () => { console.error('not initialized ????'); return 0 }

    setMax: Function = () => 0
    setMin: Function = () => 0
    setValue: Function = () => null

    baseline
    highline


    constructor(board: Board, coordinates: number[], attributes: LooseObject = {}) {
        super(board, coordinates, attributes)

        // a glider is just a point.  makeGlider() will attach it to an element to glide on

        this.otype = OBJECT_TYPE.GLIDER
        this.elementClass = OBJECT_CLASS.POINT

        this.elementUpdate = () => this.update();
        this.elementUpdateRenderer = () => this.updateRenderer();
        this.elementCreateLabel = () => this.createLabel()
        this.elementGetLabelAnchor = () => this.getLabelAnchor();
        this.elementGetTextAnchor = () => this.getTextAnchor();


        if (dbug(this))
            console.warn(`%c create Glider ${this.id}`, dbugColor, coordinates)

    }

    // /**
    //  * Convert the point to glider and update the construction.
    //  * To move the point visual onto the glider, a call of board update is necessary.
    //  * @param {String|Object} slide The object the point will be bound to.
    //  */
    makeGlider(slide: GeometryElement) {
        console.warn(`%c Glider.makeGlider from ${this.id}`, dbugColor, this, slide)


        console.assert(this.otype === OBJECT_TYPE.GLIDER)      // this should be created as a glider
        console.assert(Type.exists(this.board.select(slide)))  // slide object must exist


        this.otype = OBJECT_TYPE.GLIDER;
        this.elType = 'glider';

        var onPolygon = false,
            min, i, dist;


        if (slide.otype === OBJECT_TYPE.POLYGON) {
            // Search for the closest edge of the polygon.
            min = Number.MAX_VALUE;
            for (i = 0; i < slide['borders'].length; i++) {
                dist = Geometry.distPointLine(
                    this.coords.usrCoords,
                    slide['borders'][i].stdform
                );
                if (dist < min) {
                    min = dist;
                    slide = slide['borders'][i];
                }
            }
            onPolygon = true;
        }

        /* Gliders on Ticks are forbidden */
        if (!Type.exists(slide)) {
            throw new Error("JSXGraph: slide object undefined.");
        } else if (slide.otype === OBJECT_TYPE.TICKS) {
            throw new Error("JSXGraph: gliders on ticks are not possible.");
        }

        this.slideObject = slide;

        this.slideObjects.push(slide);
        this.addParents(slide);

        this.visProp['snapwidth'] = -1; // By default, deactivate snapWidth
        this.slideObject.addChild(this);
        this.isDraggable = true;
        this.onPolygon = this.onPolygon;

        this.generatePolynomial = function () {
            return this.slideObject.generatePolynomial(this);
        };

        // TODO: move to glider
        // // Determine the initial value of this.position
        this.updateGlider();
        this.needsUpdateFromParent = true;
        this.updateGliderFromParent();

        return this;
    }



    /**
     * Update of glider in case of dragging the glider or setting the postion of the glider.
     * The relative position of the glider has to be updated.
     *
     * In case of a glider on a line:
     * If the second point is an ideal point, then -1 < this.position < 1,
     * this.position==+/-1 equals point2, this.position==0 equals point1
     *
     * If the first point is an ideal point, then 0 < this.position < 2
     * this.position==0  or 2 equals point1, this.position==1 equals point2
     *
     * @private
     */
    updateGlider() {
        var i, d, v,
            p1c, p2c, poly, cc, pos,
            angle, sgn, alpha, beta,
            delta = 2.0 * Math.PI,
            cp, c, invMat,
            newCoords, newPos,
            doRound = false,
            ev_sw,
            snappedTo, snapValues,
            res, cu,
            slides = [],
            isTransformed;

        this.needsUpdateFromParent = false;

        if (dbug(this))
            console.warn(`%cGlider updateGlider`, dbugColor, this, this.slideObject)

        if (this.slideObject.elementClass === OBJECT_CLASS.CIRCLE) {
            let slide = this.slideObject as Circle  // hack - tells TS the type, but TS cannot verify

            if (this.evalVisProp('isgeonext')) {
                delta = 1.0;
            }
            newCoords = Geometry.projectPointToCircle(this, slide, this.board);
            newPos =
                Geometry.rad(
                    [slide.center.X() + 1.0, slide.center.Y()],
                    slide.center,
                    this
                ) / delta;
        } else if (this.slideObject.elementClass === OBJECT_CLASS.LINE) {
            let slide = this.slideObject as Line  // hack - tells TS the type, but TS cannot verify

            /*
             * onPolygon==true: the point is a slider on a segment and this segment is one of the
             * "borders" of a polygon.
             * This is a GEONExT feature.
             */
            if (this.onPolygon) {
                p1c = slide.point1.coords.usrCoords;
                p2c = slide.point2.coords.usrCoords;
                i = 1;
                d = p2c[i] - p1c[i];

                if (Math.abs(d) < JSXMath.eps) {
                    i = 2;
                    d = p2c[i] - p1c[i];
                }

                cc = Geometry.projectPointToLine(this, slide, this.board);
                pos = (cc.usrCoords[i] - p1c[i]) / d;
                poly = slide.parentPolygon;

                if (pos < 0) {
                    for (i = 0; i < poly.borders.length; i++) {
                        if (slide === poly.borders[i]) {
                            slide =
                                poly.borders[
                                (i - 1 + poly.borders.length) % poly.borders.length
                                ];
                            break;
                        }
                    }
                } else if (pos > 1.0) {
                    for (i = 0; i < poly.borders.length; i++) {
                        if (slide === poly.borders[i]) {
                            slide =
                                poly.borders[
                                (i + 1 + poly.borders.length) % poly.borders.length
                                ];
                            break;
                        }
                    }
                }

                // If the slide object has changed, save the change to the glider.
                if (slide.id !== this.slideObject.id) {
                    this.slideObject = slide;
                }
            }

            p1c = slide.point1.coords;
            p2c = slide.point2.coords;

            // Distance between the two defining points
            d = p1c.distance(COORDS_BY.USER, p2c);

            // The defining points are identical
            if (d < JSXMath.eps) {
                //this.coords.setCoordinates(COORDS_BY.USER, p1c);
                newCoords = p1c;
                doRound = true;
                newPos = 0.0;
            } else {
                newCoords = Geometry.projectPointToLine(this, slide, this.board);
                p1c = p1c.usrCoords.slice(0);
                p2c = p2c.usrCoords.slice(0);

                // The second point is an ideal point
                if (Math.abs(p2c[0]) < JSXMath.eps) {
                    i = 1;
                    d = p2c[i];

                    if (Math.abs(d) < JSXMath.eps) {
                        i = 2;
                        d = p2c[i];
                    }

                    d = (newCoords.usrCoords[i] - p1c[i]) / d;
                    sgn = d >= 0 ? 1 : -1;
                    d = Math.abs(d);
                    newPos = (sgn * d) / (d + 1);

                    // The first point is an ideal point
                } else if (Math.abs(p1c[0]) < JSXMath.eps) {
                    i = 1;
                    d = p1c[i];

                    if (Math.abs(d) < JSXMath.eps) {
                        i = 2;
                        d = p1c[i];
                    }

                    d = (newCoords.usrCoords[i] - p2c[i]) / d;

                    // 1.0 - d/(1-d);
                    if (d < 0.0) {
                        newPos = (1 - 2.0 * d) / (1.0 - d);
                    } else {
                        newPos = 1 / (d + 1);
                    }
                } else {
                    i = 1;
                    d = p2c[i] - p1c[i];

                    if (Math.abs(d) < JSXMath.eps) {
                        i = 2;
                        d = p2c[i] - p1c[i];
                    }
                    newPos = (newCoords.usrCoords[i] - p1c[i]) / d;
                }
            }

            // Snap the glider to snap values.
            snappedTo = this.findClosestSnapValue(newPos);
            if (snappedTo !== null) {
                snapValues = this.evalVisProp('snapvalues');
                newPos = (snapValues[snappedTo] - this._smin) / (this._smax - this._smin);
                this.elementUpdate();
            } else {
                // Snap the glider point of the slider into its appropriate position
                // First, recalculate the new value of this.position
                // Second, call update(fromParent==true) to make the positioning snappier.
                ev_sw = this.evalVisProp('snapwidth');
                if (
                    ev_sw > 0.0 && Math.abs(this._smax - this._smin) >= JSXMath.eps
                ) {
                    newPos = Math.max(Math.min(newPos, 1), 0);
                    // v = newPos * (this._smax - this._smin) + this._smin;
                    // v = Math.round(v / ev_sw) * ev_sw;
                    v = newPos * (this._smax - this._smin);
                    v = Math.round(v / ev_sw) * ev_sw + this._smin;
                    newPos = (v - this._smin) / (this._smax - this._smin);
                    this.elementUpdate();

                }
            }

            p1c = slide.point1.coords;
            if (
                !slide.evalVisProp('straightfirst') &&
                Math.abs(p1c.usrCoords[0]) > JSXMath.eps &&
                newPos < 0
            ) {
                newCoords = p1c;
                doRound = true;
                newPos = 0;
            }

            p2c = slide.point2.coords;
            if (
                !slide.evalVisProp('straightlast') &&
                Math.abs(p2c.usrCoords[0]) > JSXMath.eps &&
                newPos > 1
            ) {
                newCoords = p2c;
                doRound = true;
                newPos = 1;
            }

            // } else if (this.slideObject.otype === OBJECT_TYPE.TURTLE) {
            //     let slide = this.slideObject as Circle  // hack - tells TS the type, but TS cannot verify

            //     // In case, tohe point is a constrained glider.
            //     this.updateConstraint();
            //     res = Geometry.projectPointToTurtle(this, slide, this.board);
            //     newCoords = res[0];
            //     newPos = res[1]; // save position for the overwriting below

        } else if (this.slideObject.elementClass === OBJECT_CLASS.CURVE) {
            let slide = this.slideObject as Curve  // hack - tells TS the type, but TS cannot verify

            if (
                slide.otype === OBJECT_TYPE.ARC ||
                slide.otype === OBJECT_TYPE.SECTOR
            ) {
                newCoords = Geometry.projectPointToCircle(this, slide, this.board);

                angle = Geometry.rad(slide.radiuspoint, slide.center, this);
                alpha = 0.0;
                beta = Geometry.rad(slide.radiuspoint, slide.center, slide.anglepoint);
                newPos = angle;

                ev_sw = slide.evalVisProp('selection');
                if (
                    (ev_sw === "minor" && beta > Math.PI) ||
                    (ev_sw === "major" && beta < Math.PI)
                ) {
                    alpha = beta;
                    beta = 2 * Math.PI;
                }

                // Correct the position if we are outside of the sector/arc
                if (angle < alpha || angle > beta) {
                    newPos = beta;

                    if (
                        (angle < alpha && angle > alpha * 0.5) ||
                        (angle > beta && angle > beta * 0.5 + Math.PI)
                    ) {
                        newPos = alpha;
                    }

                    this.needsUpdateFromParent = true;
                    this.updateGliderFromParent();
                }

                delta = beta - alpha;
                // if (this.visProp.isgeonext) {
                //     delta = 1.0;
                // }
                if (Math.abs(delta) > JSXMath.eps) {
                    newPos /= delta;
                }
            } else {
                // In case, the point is a constrained glider.
                this.updateConstraint();

                // Handle the case if the curve comes from a transformation of a continuous curve.
                if (slide.transformations.length > 0) {
                    isTransformed = false;
                    // TODO this might buggy, see the recursion
                    // in line.js getCurveTangentDir
                    res = slide.getTransformationSource();
                    if (res[0]) {
                        isTransformed = res[0];
                        slides.push(slide);
                        slides.push(res[1]);
                    }
                    // Recurse
                    while (res[0] && Type.exists(res[1]._transformationSource)) {
                        res = res[1].getTransformationSource();
                        slides.push(res[1]);
                    }

                    cu = this.coords.usrCoords;
                    if (isTransformed) {
                        for (i = 0; i < slides.length; i++) {
                            slides[i].updateTransformMatrix();
                            invMat = JSXMath.inverse(slides[i].transformMat);
                            cu = JSXMath.matVecMult(invMat, cu);
                        }
                        cp = new Coords(COORDS_BY.USER, cu, this.board).usrCoords;
                        c = Geometry.projectCoordsToCurve(
                            cp[1],
                            cp[2],
                            this.position || 0,
                            slides[slides.length - 1],
                            this.board
                        );
                        // projectPointCurve() already would apply the transformation.
                        // Since we are projecting on the original curve, we have to do
                        // the transformations "by hand".
                        cu = c[0].usrCoords;
                        for (i = slides.length - 2; i >= 0; i--) {
                            cu = JSXMath.matVecMult(slides[i].transformMat, cu);
                        }
                        c[0] = new Coords(COORDS_BY.USER, cu, this.board);
                    } else {
                        slide.updateTransformMatrix();
                        invMat = JSXMath.inverse(slide.transformMat);
                        cu = JSXMath.matVecMult(invMat, cu);
                        cp = new Coords(COORDS_BY.USER, cu, this.board).usrCoords;
                        c = Geometry.projectCoordsToCurve(
                            cp[1],
                            cp[2],
                            this.position || 0,
                            slide,
                            this.board
                        );
                    }

                    newCoords = c[0];
                    newPos = c[1];
                } else {
                    res = Geometry.projectPointToCurve(this, slide, this.board);
                    newCoords = res[0];
                    newPos = res[1]; // save position for the overwriting below
                }
            }

        } else if (this.slideObject.elementClass === OBJECT_CLASS.POINT) {
            let slide = this.slideObject as Circle  // hack - tells TS the type, but TS cannot verify

            //this.coords.setCoordinates(COORDS_BY.USER, Geometry.projectPointToPoint(this, slide, this.board).usrCoords, false);
            newCoords = Geometry.projectPointToPoint(this, slide, this.board);
            newPos = this.position; // save position for the overwriting below

        } else {
            throw new Error(`shouldn't get here with class ${this.slideObject.elementClass}`)
        }


        this.coords.setCoordinates(COORDS_BY.USER, newCoords.usrCoords, doRound);
        this.position = newPos;
    }


    // /**
    //  * Update of a glider in case a parent element has been updated. That means the
    //  * relative position of the glider stays the same.
    //  * @private
    //  */
    updateGliderFromParent() {
        var p1c, p2c, r, lbda, c,
            slides: GeometryElement[] = [],
            res, i, isTransformed,
            baseangle, alpha, angle, beta,
            delta = 2.0 * Math.PI;

        if (!this.needsUpdateFromParent) {
            this.needsUpdateFromParent = true;
            return;
        }

        if (this.slideObject.elementClass === OBJECT_CLASS.CIRCLE) {
            let slide = this.slideObject as Circle      // hack - redefine slide for each case, explicitly setting type
            // warning - TS cannot verify this
            r = slide.Radius();
            if (this.evalVisProp('isgeonext')) {
                delta = 1.0;
            }
            c = [
                slide.center.X() + r * Math.cos(this.position * delta),
                slide.center.Y() + r * Math.sin(this.position * delta)
            ];

        } else if (this.slideObject.elementClass === OBJECT_CLASS.LINE) {
            let slide = this.slideObject as Circle      // hack - redefine slide for each case, explicitly setting type

            p1c = slide.point1.coords.usrCoords;
            p2c = slide.point2.coords.usrCoords;

            // If one of the defining points of the line does not exist,
            // the glider should disappear
            if (
                (p1c[0] === 0 && p1c[1] === 0 && p1c[2] === 0) ||
                (p2c[0] === 0 && p2c[1] === 0 && p2c[2] === 0)
            ) {
                c = [0, 0, 0];
                // The second point is an ideal point
            } else if (Math.abs(p2c[0]) < JSXMath.eps) {
                lbda = Math.min(Math.abs(this.position), 1 - JSXMath.eps);
                lbda /= 1.0 - lbda;

                if (this.position < 0) {
                    lbda = -lbda;
                }

                c = [
                    p1c[0] + lbda * p2c[0],
                    p1c[1] + lbda * p2c[1],
                    p1c[2] + lbda * p2c[2]
                ];
                // The first point is an ideal point
            } else if (Math.abs(p1c[0]) < JSXMath.eps) {
                lbda = Math.max(this.position, JSXMath.eps);
                lbda = Math.min(lbda, 2 - JSXMath.eps);

                if (lbda > 1) {
                    lbda = (lbda - 1) / (lbda - 2);
                } else {
                    lbda = (1 - lbda) / lbda;
                }

                c = [
                    p2c[0] + lbda * p1c[0],
                    p2c[1] + lbda * p1c[1],
                    p2c[2] + lbda * p1c[2]
                ];
            } else {
                lbda = this.position;
                c = [
                    p1c[0] + lbda * (p2c[0] - p1c[0]),
                    p1c[1] + lbda * (p2c[1] - p1c[1]),
                    p1c[2] + lbda * (p2c[2] - p1c[2])
                ];
            }

            // } else if (this.slideObject.otype === OBJECT_TYPE.TURTLE) {
            //     let slide = this.slideObject as Turtle      // hack - redefine slide for each case, explicitly setting type

            //     this.coords.setCoordinates(COORDS_BY.USER, [
            //         slide.Z(this.position),
            //         slide.X(this.position),
            //         slide.Y(this.position)
            //     ]);
            //     // In case, the point is a constrained glider.
            //     this.updateConstraint();
            //     c = Geometry.projectPointToTurtle(this, slide, this.board)[0].usrCoords;


        } else if (this.slideObject.elementClass === OBJECT_CLASS.CURVE) {
            let slide = this.slideObject as Curve      // hack - redefine slide for each case, explicitly setting type

            // Handle the case if the curve comes from a transformation of a continuous curve.
            isTransformed = false;
            res = slide.getTransformationSource();
            if (res[0]) {
                isTransformed = res[0];
                slides.push(slide);
                slides.push(res[1]);
            }
            // Recurse
            while (res[0] && Type.exists(res[1]._transformationSource)) {
                res = res[1].getTransformationSource();
                slides.push(res[1]);
            }
            if (isTransformed) {
                throw new Error('wire in transformation')
                // this.coords.setCoordinates(COORDS_BY.USER, [
                //     slides[slides.length - 1].Z(this.position),
                //     slides[slides.length - 1].X(this.position),
                //     slides[slides.length - 1].Y(this.position)
                // ]);
            } else {
                this.coords.setCoordinates(COORDS_BY.USER, [
                    slide.Z(this.position),
                    slide.X(this.position),
                    slide.Y(this.position)
                ]);
            }

            if (
                slide.otype === OBJECT_TYPE.ARC ||
                slide.otype === OBJECT_TYPE.SECTOR
            ) {
                baseangle = Geometry.rad(
                    [slide.center.X() + 1, slide.center.Y()],
                    slide.center,
                    slide.radiuspoint
                );

                alpha = 0.0;
                beta = Geometry.rad(slide.radiuspoint, slide.center, slide.anglepoint);

                if (
                    (slide.evalVisProp('selection') === "minor" && beta > Math.PI) ||
                    (slide.evalVisProp('selection') === "major" && beta < Math.PI)
                ) {
                    alpha = beta;
                    beta = 2 * Math.PI;
                }

                delta = beta - alpha;
                if (this.evalVisProp('isgeonext')) {
                    delta = 1.0;
                }
                angle = this.position * delta;

                // Correct the position if we are outside of the sector/arc
                if (angle < alpha || angle > beta) {
                    angle = beta;

                    if (
                        (angle < alpha && angle > alpha * 0.5) ||
                        (angle > beta && angle > beta * 0.5 + Math.PI)
                    ) {
                        angle = alpha;
                    }

                    this.position = angle;
                    if (Math.abs(delta) > JSXMath.eps) {
                        this.position /= delta;
                    }
                }

                // tbtb - probably a mistake.  curves don't have a radius
                // r = slide.Radius();
                // c = [
                //     slide.center.X() + r * Math.cos(this.position * delta + baseangle),
                //     slide.center.Y() + r * Math.sin(this.position * delta + baseangle)
                // ];


            } else {
                // In case, the point is a constrained glider.
                this.updateConstraint();

                if (isTransformed) {
                    c = Geometry.projectPointToCurve(
                        this,
                        slides[slides.length - 1],
                        this.board
                    )[0].usrCoords;
                    // projectPointCurve() already would do the transformation.
                    // But since we are projecting on the original curve, we have to do
                    // the transformation "by hand".
                    for (i = slides.length - 2; i >= 0; i--) {
                        c = new Coords(
                            COORDS_BY.USER,
                            JSXMath.matVecMult(slides[i].transformMat, c),
                            this.board
                        ).usrCoords;
                    }
                } else {
                    c = Geometry.projectPointToCurve(this, slide, this.board)[0].usrCoords;
                }
            }

        } else if (this.slideObject.otype === OBJECT_TYPE.POINT) {
            let slide = this.slideObject as Point      // hack - redefine slide for each case, explicitly setting type

            c = Geometry.projectPointToPoint(this, slide, this.board).usrCoords;
        }


        this.coords.setCoordinates(COORDS_BY.USER, c, false);
    }

    /**
 * Sets the position of a glider relative to the defining elements
 * of the {@link JXG.Point#slideObject}.
 * @param {Number} x
 * @returns {JXG.Point} Reference to the point element.
 */
    // TODO: move to Glider  // tbtb
    setGliderPosition(x) {
        if (this.otype === OBJECT_TYPE.GLIDER) {
            this.position = x;
            this.board.update();
        }

        return this;
    }

    /**
     * Remove the last slideObject. If there are more than one elements the point is bound to,
     * the second last element is the new active slideObject.
     */
    popSlideObject() {
        if (this.slideObjects.length > 0) {
            this.slideObjects.pop();

            // It may not be sufficient to remove the point from
            // the list of childElement. For complex dependencies
            // one may have to go to the list of ancestor and descendants.  A.W.
            // Yes indeed, see #51 on github bug tracker
            //   delete this.slideObject.childElements[this.id];
            this.slideObject.removeChild(this);

            if (this.slideObjects.length === 0) {
                this.otype = this._org_type;
                if (this.otype === OBJECT_TYPE.POINT) {
                    this.elType = "point";
                } else if (this.elementClass === OBJECT_CLASS.TEXT) {
                    this.elType = "text";
                } else if (this.otype === OBJECT_TYPE.IMAGE) {
                    this.elType = "image";
                } else if (this.otype === OBJECT_TYPE.FOREIGNOBJECT) {
                    this.elType = "foreignobject";
                }

                this.slideObject = null;
            } else {
                this.slideObject = this.slideObjects[this.slideObjects.length - 1];
            }
        }
    }


}

/**
 * @class A glider is a point bound to a line, circle or curve or even another point.
 * @pseudo
 * @description A glider is a point which lives on another geometric element like a line, circle, curve, turtle.
 * @name Glider
 * @augments JXG2.Point
 * @constructor
 * @type JXG2.Point
 * @throws {Exception} If the element cannot be constructed with the given parent objects an exception is thrown.
 * @param {Number_Number_Number_JXG.GeometryElement} z_,x_,y_,GlideObject Parent elements can be two or three elements of type number and the object the glider lives on.
 * The coordinates are completely optional. If not given the origin is used. If you provide two numbers for coordinates they will be interpreted as affine Euclidean
 * coordinates, otherwise they will be interpreted as homogeneous coordinates. In any case the point will be projected on the glide object.
 * @example
 * // Create a glider with user defined coordinates. If the coordinates are not on
 * // the circle (like in this case) the point will be projected onto the circle.
 * var p1 = board.create('point', [2.0, 2.0]);
 * var c1 = board.create('circle', [p1, 2.0]);
 * var p2 = board.create('glider', [2.0, 1.5, c1]);
 * </pre><div class="jxgbox" id="JXG4f65f32f-e50a-4b50-9b7c-f6ec41652930" style="width: 300px; height: 300px;"></div>
 * <script type="text/javascript">
 *   var gpex1_board = JXG2.JSXGraph.initBoard('JXG4f65f32f-e50a-4b50-9b7c-f6ec41652930', {boundingbox: [-1, 5, 5, -1], axis: true, showcopyright: false, shownavigation: false});
 *   var gpex1_p1 = gpex1_board.create('point', [2.0, 2.0]);
 *   var gpex1_c1 = gpex1_board.create('circle', [gpex1_p1, 2.0]);
 *   var gpex1_p2 = gpex1_board.create('glider', [2.0, 1.5, gpex1_c1]);
 * </script><pre>
 * @example
 * // Create a glider with default coordinates (1,0,0). Same premises as above.
 * var p1 = board.create('point', [2.0, 2.0]);
 * var c1 = board.create('circle', [p1, 2.0]);
 * var p2 = board.create('glider', [c1]);
 * </pre><div class="jxgbox" id="JXG4de7f181-631a-44b1-a12f-bc4d995609e8" style="width: 200px; height: 200px;"></div>
 * <script type="text/javascript">
 *   var gpex2_board = JXG2.JSXGraph.initBoard('JXG4de7f181-631a-44b1-a12f-bc4d995609e8', {boundingbox: [-1, 5, 5, -1], axis: true, showcopyright: false, shownavigation: false});
 *   var gpex2_p1 = gpex2_board.create('point', [2.0, 2.0]);
 *   var gpex2_c1 = gpex2_board.create('circle', [gpex2_p1, 2.0]);
 *   var gpex2_p2 = gpex2_board.create('glider', [gpex2_c1]);
 * </script><pre>
 *@example
 * //animate example 2
 * var p1 = board.create('point', [2.0, 2.0]);
 * var c1 = board.create('circle', [p1, 2.0]);
 * var p2 = board.create('glider', [c1]);
 * var button1 = board.create('button', [1, 7, 'start animation',function(){p2.startAnimation(1,4)}]);
 * var button2 = board.create('button', [1, 5, 'stop animation',function(){p2.stopAnimation()}]);
 * </pre><div class="jxgbox" id="JXG4de7f181-631a-44b1-a12f-bc4d133709e8" style="width: 200px; height: 200px;"></div>
 * <script type="text/javascript">
 *   var gpex3_board = JXG2.JSXGraph.initBoard('JXG4de7f181-631a-44b1-a12f-bc4d133709e8', {boundingbox: [-1, 10, 10, -1], axis: true, showcopyright: false, shownavigation: false});
 *   var gpex3_p1 = gpex3_board.create('point', [2.0, 2.0]);
 *   var gpex3_c1 = gpex3_board.create('circle', [gpex3_p1, 2.0]);
 *   var gpex3_p2 = gpex3_board.create('glider', [gpex3_c1]);
 *   gpex3_board.create('button', [1, 7, 'start animation',function(){gpex3_p2.startAnimation(1,4)}]);
 *   gpex3_board.create('button', [1, 5, 'stop animation',function(){gpex3_p2.stopAnimation()}]);
 * </script><pre>
 */
export function createGlider(board, parents, attributes) {
    let coords: number[]
    let attr = Type.copyAttributes(attributes, board.options, 'glider');

    if (parents.length === 1) {
        coords = [0, 0];
    } else {
        coords = parents.slice(0, 2);
    }

    let el = new Glider(board, coords, attr);    // really just a point
    el.makeGlider(parents[parents.length - 1]);  // convert it into a glider

    return el;
};

