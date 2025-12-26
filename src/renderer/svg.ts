const dbug = (elem?/*: GeometryElement*/) => false;//   elem && elem.id === 'jxgBoard1P1Label';
const dbugColor = `color:blue;background-color:#ffc0c0`;

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
/*jslint nomen: true, plusplus: true, newcap:true*/

// import { JXG2 } from "../jxg.js";
import { Options } from "../options.js";
import { AbstractRenderer } from "./abstract.js";
import { OBJECT_CLASS, OBJECT_TYPE } from "../base/constants.js";
import { Type } from "../utils/type.js";
import { Color } from "../utils/color.js";
import { Base64 } from "../utils/base64.js";
import { Numerics } from "../math/numerics.js";
// import { LayerOptions } from "../optionInterfaces.js";
// import {GeometryElement} from "../base/element.js";
import { Board } from "../base/board.js";
import { Env } from "../utils/env.js"
import { GeometryElement } from "../base/element.js";
import { Text } from "../base/text.js"
import { Dim, SVGType } from "../interfaces.js"


/**
 * Uses SVG to implement the rendering methods defined in {@link JXG2.AbstractRenderer}.
 * @class JXG2.SVGRenderer
 * @augments JXG2.AbstractRenderer
 * @param {Node} container Reference to a DOM node containing the board.
 * @param {Object} dim The dimensions of the board
 * @param {Number} dim.width
 * @param {Number} dim.height
 * @see JXG2.AbstractRenderer
 */





export class SVGRenderer extends AbstractRenderer {


    // docstring in AbstractRenderer
    type = "svg";

    isSafari: boolean


    defs: any

    foreignObjLayer: any

    layers: Node[]

    touchpoints: HTMLElement[] = []

    suspendHandle: number // id for suspendRedraw  //https://developer.mozilla.org/en-US/docs/Web/API/SVGSVGElement


    /**
     * The xlink namespace. This is used for images.
     * @see http://www.w3.org/TR/xlink/
     * @default http://www.w3.org/1999/xlink
     */
    xlinkNamespace = "http://www.w3.org/1999/xlink";


    constructor(containerName: string | HTMLDivElement, dim: Dim) {  // width height
        super()

        if (dbug()) console.log(`%c svg: constructor(container:${containerName},dim:'${JSON.stringify(dim)}'`, dbugColor)


        // https://stackoverflow.com/questions/7944460/detect-safari-browser
        this.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

        if (typeof containerName == 'string') {
            let container = document.getElementById(containerName) as HTMLDivElement
            if (container) {
                this.container = container;
            } else {
                throw new Error(`Could not find HTML container element '${container}`)
            }
        } else {
            this.container = containerName
        }

        // check once here instead of in every call
        this.assertNonNullish(this.container, `expected container with id: '${containerName}'`)

        // prepare the div container and the svg root node for use with JSXGraph
        this.container.style.userSelect = "none";

        this.container.style.overflow = "hidden";
        if (this.container.style.position === "") {
            this.container.style.position = "relative";
        }

        this.svgRoot = this.container.ownerDocument.createElementNS(this.svgNamespace, "svg");
        (this.svgRoot as SVGSVGElement).style.overflow = "hidden";
        (this.svgRoot as SVGSVGElement).style.display = "block";
        this.resize(dim.width, dim.height);

        //this.svgRoot.setAttributeNS(null, 'shape-rendering', 'crispEdge'); //'optimizeQuality'); //geometricPrecision');

        this.jsxAppendChild(this.container, this.svgRoot) // this.container.appendChild(this.svgRoot);


        /**
         * The <tt>defs</tt> element is a container element to reference reusable SVG elements.
         * @type Node
         * @see https://www.w3.org/TR/SVG2/struct.html#DefsElement
         */
        this.defs = this.container.ownerDocument.createElementNS(this.svgNamespace, "defs");
        this.jsxAppendChild(this.svgRoot, this.defs) // this.svgRoot.appendChild(this.defs);


        /* Default shadow filter */
        this.defs.appendChild(this.createShadowFilter(this.uniqName('f1'), 'none', 1, 0.1, 3, [5, 5]));

        /**
         * JSXGraph uses a layer system to sort the elements on the board. This puts certain types of elements in front
         * of other types of elements. For the order used see {@link Options.layer}. The number of layers is documented
         * there, too. The higher the number, the "more on top" are the elements on this layer.
         * @type Array
         */
        this.layers = [];
        for (let i = 0; i < Options['layer'].numlayers; i++) {
            this.layers[i] = this.container.ownerDocument.createElementNS(this.svgNamespace, 'g');
            this.svgRoot.appendChild(this.layers[i]);
        }

        try {
            this.foreignObjLayer = this.container.ownerDocument.createElementNS(
                this.svgNamespace,
                "foreignObject"
            );
            this.foreignObjLayer.setAttribute("display", "none");
            this.foreignObjLayer.setAttribute("x", 0);
            this.foreignObjLayer.setAttribute("y", 0);
            this.foreignObjLayer.setAttribute("width", "100%");
            this.foreignObjLayer.setAttribute("height", "100%");
            this.foreignObjLayer.setAttribute("id", this.uniqName('foreignObj'));
            this.svgRoot.appendChild(this.foreignObjLayer);
            this.supportsForeignObject = true;
        } catch (e) {
            this.supportsForeignObject = false;
        }


    }

    /** TypeScript magic - see https://mariusschulz.com/blog/assertion-functions-in-typescript */
    assertNonNullish<TValue>(value: TValue, message: string): asserts value is NonNullable<TValue> {
        if (value === null || value === undefined) {
            throw Error(message);
        }
    }

    /**
     * Filters are used to apply shadows.
     * @type Node
     * @see https://www.w3.org/TR/SVG2/struct.html#DefsElement
     */
    /**
     * Create an SVG shadow filter. If the object's RGB color is [r,g,b], it's opacity is op, and
     * the parameter color is given as [r', g', b'] with opacity op'
     * the shadow will have RGB color [blend*r + r', blend*g + g', blend*b + b'] and the opacity will be equal to op * op'.
     * Further, blur and offset can be adjusted.
     *
     * The shadow color is [r*ble
     * @param {String} id Node is of the filter.
     * @param {Array|String} rgb RGB value for the blend color or the string 'none' for default values. Default 'black'.
     * @param {Number} opacity Value between 0 and 1, default is 1.
     * @param {Number} blend  Value between 0 and 1, default is 0.1.
     * @param {Number} blur  Default: 3
     * @param {Array} offset [dx, dy]. Default is [5,5].
     * @returns DOM node to be added to this.defs.
     * @private
     */
    createShadowFilter(id: string, rgb, opacity: number, blend: number, blur: number, offset: number[] = [5, 5]) {
        var feOffset, feColor, feGaussianBlur, feBlend, mat;

        this.assertNonNullish(this.container, 'expected container')

        let filter = this.container.ownerDocument.createElementNS(this.svgNamespace, 'filter')

        filter.setAttributeNS(null, 'id', id);
        filter.setAttributeNS(null, 'width', '300%');
        filter.setAttributeNS(null, 'height', '300%');
        filter.setAttributeNS(null, 'filterUnits', 'userSpaceOnUse');

        feOffset = this.container.ownerDocument.createElementNS(this.svgNamespace, 'feOffset');
        feOffset.setAttributeNS(null, 'in', 'SourceGraphic'); // b/w: SourceAlpha, Color: SourceGraphic
        feOffset.setAttributeNS(null, 'result', 'offOut');
        feOffset.setAttributeNS(null, 'dx', offset[0]);
        feOffset.setAttributeNS(null, 'dy', offset[1]);
        filter.appendChild(feOffset);

        feColor = this.container.ownerDocument.createElementNS(this.svgNamespace, 'feColorMatrix');
        feColor.setAttributeNS(null, 'in', 'offOut');
        feColor.setAttributeNS(null, 'result', 'colorOut');
        feColor.setAttributeNS(null, 'type', 'matrix');
        // See https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feColorMatrix
        if (rgb === 'none' || !Array.isArray(rgb) || rgb.length < 3) {
            feColor.setAttributeNS(null, 'values', '0.1 0 0 0 0  0 0.1 0 0 0  0 0 0.1 0 0  0 0 0 ' + opacity + ' 0');
        } else {
            rgb[0] /= 255;
            rgb[1] /= 255;
            rgb[2] /= 255;
            mat = blend + ' 0 0 0 ' + rgb[0] +
                '  0 ' + blend + ' 0 0 ' + rgb[1] +
                '  0 0 ' + blend + ' 0 ' + rgb[2] +
                '  0 0 0 ' + opacity + ' 0';
            feColor.setAttributeNS(null, 'values', mat);
        }
        filter.appendChild(feColor);

        feGaussianBlur = this.container.ownerDocument.createElementNS(this.svgNamespace, 'feGaussianBlur');
        feGaussianBlur.setAttributeNS(null, 'in', 'colorOut');
        feGaussianBlur.setAttributeNS(null, 'result', 'blurOut');
        feGaussianBlur.setAttributeNS(null, 'stdDeviation', blur);
        filter.appendChild(feGaussianBlur);

        feBlend = this.container.ownerDocument.createElementNS(this.svgNamespace, 'feBlend');
        feBlend.setAttributeNS(null, 'in', 'SourceGraphic');
        feBlend.setAttributeNS(null, 'in2', 'blurOut');
        feBlend.setAttributeNS(null, 'mode', 'normal');
        filter.appendChild(feBlend);

        return filter;
    };

    /**
     * Create a "unique" string id from the arguments of the function.
     * Concatenate all arguments by "_".
     * "Unique" is achieved by simply prepending the container id.
     * Do not escape the string.
     *
     * If the id is used in an "url()" call it must be eascaped.
     *
     * @params {String} one or strings which will be concatenated.
     * @return {String}
     * @private
     */
    uniqName(id: string): string {
        this.assertNonNullish(this.container, 'expected container')

        return this.container.id + '_' +
            Array.prototype.slice.call(arguments).join('_');
    };

    /**
     * Combine arguments to a string, joined by empty string.
     * The container id needs to be escaped, as it may contain URI-unsafe characters
     *
     * @params {String} str variable number of strings
     * @returns String
     * @see JXG2.SVGRenderer#toURL
     * @private
     * @example
     * this.toStr('aaa', '_', 'bbb', 'TriangleEnd')
     * // Output:
     * // xxx_bbbTriangleEnd
     */
    toStr(...args): string {
        // ES6 would be [...arguments].join()
        var str = Array.prototype.slice.call(arguments).join('');
        // Mask special symbols like '/' and '\' in id
        if (Type.exists(encodeURIComponent)) {
            str = encodeURIComponent(str);
        }
        return str;
    };

    /**
     * Combine arguments to an URL string of the form
     * url(#...)
     * Masks the container id. Calls {@link JXG2.SVGRenderer#toStr}.
     *
     * @params {String} str variable number of strings
     * @returns URL string
     * @see JXG2.SVGRenderer#toStr
     * @private
     * @example
     * this.toURL('aaa', '_', 'bbb', 'TriangleEnd')
     * // Output:
     * // url(#xxx_bbbTriangleEnd)
     */
    toURL(...args: any[]) {
        return 'url(#' +
            this.toStr.apply(this, args) + // Pass the arguments to toStr
            ')';
    };



    /* ******************************** *
     *  This renderer does not need to
     *  override draw/update* methods
     *  since it provides draw/update*Prim
     *  methods except for some cases like
     *  internal texts or images.
     * ******************************** */

    /* ********* Arrow head related stuff *********** */

    /**
     * Creates an arrow DOM node. Arrows are displayed in SVG with a <em>marker</em> tag.
     * @private
     * @param {JXG2.GeometryElement} el A JSXGraph element, preferably one that can have an arrow attached.
     * @param {String} [idAppendix=''] A string that is added to the node's id.
     * @returns {Node} Reference to the node added to the DOM.
     */
    _createArrowHead(el, idAppendix, type) {
        var node2,
            node3,
            id = el.id + "Triangle",
            //type = null,
            v,
            h;

        if (Type.exists(idAppendix)) {
            id += idAppendix;
        }
        if (Type.exists(type)) {
            id += type;
        }
        node2 = this.createPrim("marker", id);

        // 'context-stroke': property is inherited from line or curve
        if (Env.isWebkitApple()) {
            // 2025: Safari does not support 'context-stroke'
            node2.setAttributeNS(null, 'fill', el.evalVisProp('strokecolor'));
            node2.setAttributeNS(null, 'stroke', el.evalVisProp('strokecolor'));
        } else {
            node2.setAttributeNS(null, 'fill', 'context-stroke');
            node2.setAttributeNS(null, 'stroke', 'context-stroke');
        }

        // node2.setAttributeNS(null, 'fill-opacity', 'context-stroke'); // Not available
        // node2.setAttributeNS(null, 'stroke-opacity', 'context-stroke');
        node2.setAttributeNS(null, 'stroke-width', 0); // this is the stroke-width of the arrow head.
        // Should be zero to simplify the calculations

        node2.setAttributeNS(null, 'orient', 'auto');
        node2.setAttributeNS(null, 'markerUnits', 'strokeWidth'); // 'strokeWidth' 'userSpaceOnUse');

        /*
           Types 1, 2:
           The arrow head is an isosceles triangle with base length 10 and height 10.

           Type 3:
           A rectangle

           Types 4, 5, 6:
           Defined by Bezier curves from mp_arrowheads.html

           In any case but type 3 the arrow head is 10 units long,
           type 3 is 10 units high.
           These 10 units are scaled to strokeWidth * arrowSize pixels, see
           this._setArrowWidth().

           See also abstractRenderer.updateLine() where the line path is shortened accordingly.

           Changes here are also necessary in setArrowWidth().

           So far, lines with arrow heads are shortenend to avoid overlapping of
           arrow head and line. This is not the case for curves, yet.
           Therefore, the offset refX has to be adapted to the path type.
        */
        this.assertNonNullish(this.container, 'expected container')

        node3 = this.container.ownerDocument.createElementNS(this.svgNamespace, "path");
        h = 5;
        if (idAppendix === "Start") {
            // First arrow
            v = 0;
            if (type === 2) {
                node3.setAttributeNS(null, "d", "M 10,0 L 0,5 L 10,10 L 5,5 z");
            } else if (type === 3) {
                node3.setAttributeNS(null, "d", "M 0,0 L 3.33,0 L 3.33,10 L 0,10 z");
            } else if (type === 4) {
                // insetRatio:0.8 tipAngle:45 wingCurve:15 tailCurve:0
                h = 3.31;
                node3.setAttributeNS(
                    null,
                    "d",
                    "M 0.00,3.31 C 3.53,3.84 7.13,4.50 10.00,6.63 C 9.33,5.52 8.67,4.42 8.00,3.31 C 8.67,2.21 9.33,1.10 10.00,0.00 C 7.13,2.13 3.53,2.79 0.00,3.31"
                );
            } else if (type === 5) {
                // insetRatio:0.9 tipAngle:40 wingCurve:5 tailCurve:15
                h = 3.28;
                node3.setAttributeNS(
                    null,
                    "d",
                    "M 0.00,3.28 C 3.39,4.19 6.81,5.07 10.00,6.55 C 9.38,5.56 9.00,4.44 9.00,3.28 C 9.00,2.11 9.38,0.99 10.00,0.00 C 6.81,1.49 3.39,2.37 0.00,3.28"
                );
            } else if (type === 6) {
                // insetRatio:0.9 tipAngle:35 wingCurve:5 tailCurve:0
                h = 2.84;
                node3.setAttributeNS(
                    null,
                    "d",
                    "M 0.00,2.84 C 3.39,3.59 6.79,4.35 10.00,5.68 C 9.67,4.73 9.33,3.78 9.00,2.84 C 9.33,1.89 9.67,0.95 10.00,0.00 C 6.79,1.33 3.39,2.09 0.00,2.84"
                );
            } else if (type === 7) {
                // insetRatio:0.9 tipAngle:60 wingCurve:30 tailCurve:0
                h = 5.2;
                node3.setAttributeNS(
                    null,
                    "d",
                    "M 0.00,5.20 C 4.04,5.20 7.99,6.92 10.00,10.39 M 10.00,0.00 C 7.99,3.47 4.04,5.20 0.00,5.20"
                );
            } else {
                // type == 1 or > 6
                node3.setAttributeNS(null, "d", "M 10,0 L 0,5 L 10,10 z");
            }
            if (
                // !Type.exists(el.rendNode.getTotalLength) &&
                el.elementClass === OBJECT_CLASS.LINE
            ) {
                if (type === 2) {
                    v = 4.9;
                } else if (type === 3) {
                    v = 3.3;
                } else if (type === 4 || type === 5 || type === 6) {
                    v = 6.66;
                } else if (type === 7) {
                    v = 0.0;
                } else {
                    v = 10.0;
                }
            }
        } else {
            // Last arrow
            v = 10.0;
            if (type === 2) {
                node3.setAttributeNS(null, "d", "M 0,0 L 10,5 L 0,10 L 5,5 z");
            } else if (type === 3) {
                v = 3.3;
                node3.setAttributeNS(null, "d", "M 0,0 L 3.33,0 L 3.33,10 L 0,10 z");
            } else if (type === 4) {
                // insetRatio:0.8 tipAngle:45 wingCurve:15 tailCurve:0
                h = 3.31;
                node3.setAttributeNS(
                    null,
                    "d",
                    "M 10.00,3.31 C 6.47,3.84 2.87,4.50 0.00,6.63 C 0.67,5.52 1.33,4.42 2.00,3.31 C 1.33,2.21 0.67,1.10 0.00,0.00 C 2.87,2.13 6.47,2.79 10.00,3.31"
                );
            } else if (type === 5) {
                // insetRatio:0.9 tipAngle:40 wingCurve:5 tailCurve:15
                h = 3.28;
                node3.setAttributeNS(
                    null,
                    "d",
                    "M 10.00,3.28 C 6.61,4.19 3.19,5.07 0.00,6.55 C 0.62,5.56 1.00,4.44 1.00,3.28 C 1.00,2.11 0.62,0.99 0.00,0.00 C 3.19,1.49 6.61,2.37 10.00,3.28"
                );
            } else if (type === 6) {
                // insetRatio:0.9 tipAngle:35 wingCurve:5 tailCurve:0
                h = 2.84;
                node3.setAttributeNS(
                    null,
                    "d",
                    "M 10.00,2.84 C 6.61,3.59 3.21,4.35 0.00,5.68 C 0.33,4.73 0.67,3.78 1.00,2.84 C 0.67,1.89 0.33,0.95 0.00,0.00 C 3.21,1.33 6.61,2.09 10.00,2.84"
                );
            } else if (type === 7) {
                // insetRatio:0.9 tipAngle:60 wingCurve:30 tailCurve:0
                h = 5.2;
                node3.setAttributeNS(
                    null,
                    "d",
                    "M 10.00,5.20 C 5.96,5.20 2.01,6.92 0.00,10.39 M 0.00,0.00 C 2.01,3.47 5.96,5.20 10.00,5.20"
                );
            } else {
                // type == 1 or > 6
                node3.setAttributeNS(null, "d", "M 0,0 L 10,5 L 0,10 z");
            }
            if (
                // !Type.exists(el.rendNode.getTotalLength) &&
                el.elementClass === OBJECT_CLASS.LINE
            ) {
                if (type === 2) {
                    v = 5.1;
                } else if (type === 3) {
                    v = 0.02;
                } else if (type === 4 || type === 5 || type === 6) {
                    v = 3.33;
                } else if (type === 7) {
                    v = 10.0;
                } else {
                    v = 0.05;
                }
            }
        }
        if (type === 7) {
            node2.setAttributeNS(null, "fill", "none");
            node2.setAttributeNS(null, "stroke-width", 1); // this is the stroke-width of the arrow head.
        }
        node2.setAttributeNS(null, "refY", h);
        node2.setAttributeNS(null, "refX", v);

        node2.appendChild(node3);
        return node2;
    }

    /**
     * Updates color of an arrow DOM node.
     * @param {Node} node The arrow node.
     * @param {String} color Color value in a HTML compatible format, e.g. <tt>#00ff00</tt> or <tt>green</tt> for green.
     * @param {Number} opacity
     * @param {JXG2.GeometryElement} el The element the arrows are to be attached to
     */
    _setArrowColor(node, color, opacity, el, type) {
        if (node) {
            if (Type.isString(color)) {
                if (type !== 7) {
                    this._setAttribute(function () {
                        if (Env.isWebkitApple()) {
                            // 2025: Safari does not support 'context-stroke'
                            node.setAttributeNS(null, 'fill', color);
                        } else {
                            node.setAttributeNS(null, 'fill', 'context-stroke');
                        }
                    }, el.visPropOld.fillcolor);
                } else {
                    this._setAttribute(function () {
                        node.setAttributeNS(null, 'fill', 'none');
                        if (Env.isWebkitApple()) {
                            node.setAttributeNS(null, 'stroke', color);
                        } else {
                            node.setAttributeNS(null, 'stroke', 'context-stroke');
                        }
                    }, el.visPropOld.fillcolor);
                }
            }

            if (this.isSafari) {
                // Necessary, since Safari is the new IE (11.2024)
                el.rendNode.parentNode.insertBefore(el.rendNode, el.rendNode);
            }
        }
    }
    /**
     * Updates width of an arrow DOM node. Used in
     * @param {Node} node The arrow node.
     * @param {Number} width
     * @param {Node} parentNode Used in IE only
     */
    _setArrowWidth(node, width, parentNode, size) {
        var s, d;

        if (node) {
            // if (width === 0) {
            //     // display:none does not work well in webkit
            //     node.setAttributeNS(null, 'display', 'none');
            // } else {
            s = width;
            d = s * size;
            node.setAttributeNS(null, "viewBox", 0 + " " + 0 + " " + s * 10 + " " + s * 10);
            node.setAttributeNS(null, "markerHeight", d);
            node.setAttributeNS(null, "markerWidth", d);
            node.setAttributeNS(null, "display", "inherit");
            // }

            if (this.isSafari) {
                // Necessary, since Safari is the new IE (11.2024)
                parentNode.parentNode.insertBefore(parentNode, parentNode);
            }
        }
    }

    /* ********* Line related stuff *********** */

    /**
     * Update {@link Ticks} on a {@link JXG2.Line}. This method is only a stub and has to be implemented
     * in any descendant renderer class.
     * @param {JXG2.Ticks} el Reference of a ticks object that has to be updated.
     * @see Line
     * @see Ticks
     * @see JXG2.Line
     * @see JXG2.Ticks
     * @see JXG2.AbstractRenderer#drawTicks
     */
    updateTicks(ticks) {
        var i,
            j,
            c,
            node,
            x,
            y,
            tickStr = "",
            len = ticks.ticks.length,
            len2,
            str,
            isReal = true;

        for (i = 0; i < len; i++) {
            c = ticks.ticks[i];
            x = c[0];
            y = c[1];

            len2 = x.length;
            str = " M " + x[0] + " " + y[0];
            if (!Type.isNumber(x[0])) {
                isReal = false;
            }
            for (j = 1; isReal && j < len2; ++j) {
                if (Type.isNumber(x[j])) {
                    str += " L " + x[j] + " " + y[j];
                } else {
                    isReal = false;
                }
            }
            if (isReal) {
                tickStr += str;
            }
        }

        node = ticks.rendNode;

        if (!Type.exists(node)) {
            node = this.createPrim("path", ticks.id);
            this.appendChildPrim(node, ticks.evalVisProp('layer'));
            ticks.rendNode = node;
        }

        node.setAttributeNS(null, "stroke", ticks.evalVisProp('strokecolor'));
        node.setAttributeNS(null, "fill", "none");
        // node.setAttributeNS(null, 'fill', ticks.evalVisProp('fillcolor'));
        // node.setAttributeNS(null, 'fill-opacity', ticks.evalVisProp('fillopacity'));
        node.setAttributeNS(
            null,
            "stroke-opacity",
            ticks.evalVisProp('strokeopacity')
        );
        node.setAttributeNS(null, "stroke-width", ticks.evalVisProp('strokewidth'));
        this.updatePathPrim(node, tickStr, ticks.board);
    }

    /* ********* Text related stuff *********** */

    /**
     * Shows a small copyright notice in the top left corner of the board.
     * @param {String} str The copyright notice itself
     * @param {Number} fontsize Size of the font the copyright notice is written in
     * @see JXG2.AbstractRenderer#displayLogo
     * @see Text#fontSize
     */
    displayCopyright(str: string, fontsize: number) {
        var node, t,
            x = 4 + 1.8 * fontsize,
            y = 6 + fontsize,
            alpha = 0.2;

        this.assertNonNullish(this.container, 'expected container')

        if (dbug()) console.log(`%c svg: displayCopyright(str: ${str},fontsize: ${fontsize})`, dbugColor)

        node = this.createPrim("text", 'licenseText');
        node.setAttributeNS(null, 'x', x + 'px');
        node.setAttributeNS(null, 'y', y + 'px');
        node.setAttributeNS(null, 'style', 'font-family:Arial,Helvetica,sans-serif; font-size:' +
            fontsize + 'px; opacity:' + alpha + ';');
        // fill:#356AA0;
        node.setAttributeNS(null, 'aria-hidden', 'true');

        t = this.container.ownerDocument.createTextNode(str);
        this.jsxAppendChild(node, t)  // node.appendChild(t);
        this.appendChildPrim(node, 0);
    }

    /**
     * Shows a small JSXGraph logo in the top left corner of the board.
     * @param {String} str The data-URL of the logo
     * @param {Number} fontsize Size of the font the copyright notice is written in
     * @see JXG2.AbstractRenderer#displayCopyright
     * @see Text#fontSize
     */
    displayLogo(str: string, fontsize: number) {
        var node,
            s = 1.5 * fontsize,
            alpha = 0.2;

        node = this.createPrim("image", 'licenseLogo');
        node.setAttributeNS(null, 'x', '5px');
        node.setAttributeNS(null, 'y', '5px');
        node.setAttributeNS(null, 'width', s + 'px');
        node.setAttributeNS(null, 'height', s + 'px');
        node.setAttributeNS(null, "preserveAspectRatio", "none");
        node.setAttributeNS(null, 'style', 'opacity:' + alpha + ';');
        node.setAttributeNS(null, 'aria-hidden', 'true');

        node.setAttributeNS(this.xlinkNamespace, "xlink:href", str);
        this.appendChildPrim(node, 0);
    }

    /**
     * An internal text is a {@link JXG2.Text} element which is drawn using only
     * the given renderer but no HTML. This method is only a stub, the drawing
     * is done in the special renderers.
     * @param {JXG2.Text} el Reference to a {@link JXG2.Text} object
     * @see Text
     * @see JXG2.Text
     * @see JXG2.AbstractRenderer#updateInternalText
     * @see JXG2.AbstractRenderer#drawText
     * @see JXG2.AbstractRenderer#updateText
     * @see JXG2.AbstractRenderer#updateTextStyle
     */
    drawInternalText(el: GeometryElement) {
        // console.log('drawInternalText', el)
        var node = this.createPrim("text", el.id);

        if (dbug(el)) console.log(`%c svg: drawInternalText(el) ${el.id}`, dbugColor, el)


        // node.setAttributeNS(null, "style", "alignment-baseline:middle"); // Not yet supported by Firefox
        // Preserve spaces
        //node.setAttributeNS("http://www.w3.org/XML/1998/namespace", "space", "preserve");
        node.style.whiteSpace = "nowrap";

        el.rendNodeText = this.container.ownerDocument.createTextNode("");
        node.appendChild(el.rendNodeText);
        this.appendChildPrim(node, el.evalVisProp('layer'));

        return node;
    }

    /**
     * Updates visual properties of an already existing {@link JXG2.Text} element.
     * @param {JXG2.Text} el Reference to an {@link JXG2.Text} object, that has to be updated.
     * @see Text
     * @see JXG2.Text
     * @see JXG2.AbstractRenderer#drawInternalText
     * @see JXG2.AbstractRenderer#drawText
     * @see JXG2.AbstractRenderer#updateText
     * @see JXG2.AbstractRenderer#updateTextStyle
     */
    updateInternalText(el: Text) {
        var content = el.plaintext,
            v, css,
            ev_ax = el.getAnchorX(),
            ev_ay = el.getAnchorY();

        if (dbug(el)) console.log(`%c svg: updateInternalText(${el.id})`, dbugColor)


        css = el.evalVisProp('cssclass');
        if (el.rendNode.getAttributeNS(null, "class") !== css) {
            el.rendNode.setAttributeNS(null, "class", css);
            el.needsSizeUpdate = true;
        }

        if (!isNaN(el.coords.scrCoords[1] + el.coords.scrCoords[2])) {
            // Horizontal
            v = el.coords.scrCoords[1];
            if (el.visPropOld.left !== ev_ax + v) {
                el.rendNode.setAttributeNS(null, "x", v + "px");

                if (dbug(el)) console.log(`%c svg: updateInternalText/[x,y] x:${v + 'px'}`, dbugColor, el)

                if (ev_ax === "left") {
                    el.rendNode.setAttributeNS(null, "text-anchor", "start");
                } else if (ev_ax === "right") {
                    el.rendNode.setAttributeNS(null, "text-anchor", "end");
                } else if (ev_ax === "middle") {
                    el.rendNode.setAttributeNS(null, "text-anchor", "middle");
                }
                el.visPropOld.left = ev_ax + v;
            }

            // Vertical
            v = el.coords.scrCoords[2];
            if (el.visPropOld.top !== ev_ay + v) {
                el.rendNode.setAttributeNS(null, "y", v + this.vOffsetText * 0.5 + "px");

                if (dbug(el)) console.log(`%c svg: updateInternalText/[x,y] y:${v + this.vOffsetText * 0.5 + 'px'}`, dbugColor, el)

                // Not supported by IE, edge
                // el.rendNode.setAttributeNS(null, "dy", "0");
                // if (ev_ay === "bottom") {
                //     el.rendNode.setAttributeNS(null, 'dominant-baseline', 'text-after-edge');
                // } else if (ev_ay === "top") {
                //     el.rendNode.setAttributeNS(null, 'dominant-baseline', 'text-before-edge');
                // } else if (ev_ay === "middle") {
                //     el.rendNode.setAttributeNS(null, 'dominant-baseline', 'middle');
                // }

                if (ev_ay === "bottom") {
                    el.rendNode.setAttributeNS(null, "dy", "0");
                    el.rendNode.setAttributeNS(null, 'dominant-baseline', 'auto');
                } else if (ev_ay === "top") {
                    el.rendNode.setAttributeNS(null, "dy", "1.6ex");
                    el.rendNode.setAttributeNS(null, 'dominant-baseline', 'auto');
                } else if (ev_ay === "middle") {
                    el.rendNode.setAttributeNS(null, "dy", "0.6ex");
                    el.rendNode.setAttributeNS(null, 'dominant-baseline', 'auto');
                }
                el.visPropOld.top = ev_ay + v;
            }
        }
        if (el.htmlStr !== content) {
            el.rendNodeText.data = content;
            el.htmlStr = content;
        }
        this.transformRect(el, el.transformations);
    }

    /**
     * Set color and opacity of internal texts.
     * @private
     * @see JXG2.AbstractRenderer#updateTextStyle
     * @see JXG2.AbstractRenderer#updateInternalTextStyle
     */
    updateInternalTextStyle(el: GeometryElement, strokeColor: string, strokeOpacity: number) {
        this.setObjectFillColor(el, strokeColor, strokeOpacity);
    }

    /* ********* Image related stuff *********** */

    /**
     * Draws an {@link JXG2.Image} on a board; This is just a template that has to be implemented by special
     * renderers.
     * @param {JXG2.Image} el Reference to the image object that is to be drawn
     * @see Image
     * @see JXG2.Image
     * @see JXG2.AbstractRenderer#updateImage
     */
    drawImage(el: GeometryElement) {
        var node = this.createPrim("image", el.id);

        node.setAttributeNS(null, "preserveAspectRatio", "none");
        this.appendChildPrim(node, el.evalVisProp('layer'));
        el.rendNode = node;

        this.updateImage(el);
    }

    /**
     * Applies transformations on images and text elements. This method has to implemented in
     * all descendant classes where text and image transformations are to be supported.
     * <p>
     * Only affine transformation are supported, no proper projective transformations. This means, the
     * respective entries of the transformation matrix are simply ignored.
     *
     * @param {JXG2.Image|JXG2.Text} el A {@link JXG2.Image} or {@link JXG2.Text} object.
     * @param {Array} transformations An array of {@link JXG2.Transformation} objects. This is usually the
     * transformations property of the given element <tt>el</tt>.
     */
    transformRect(el, t) {
        var s, m, node,
            str = "",
            cx, cy,
            len = t.length;

        if (dbug(el)) console.log(`%c svg: transformRect(el,t)' ${el.id}`, dbugColor, el)
        if (t.length > 0 && dbug(el)) console.log(`%c svg: ${JSON.stringify(t)}`, dbugColor)

        if (len > 0) {
            node = el.rendNode;
            m = this.joinTransforms(el, t);
            s = [m[1][1], m[2][1], m[1][2], m[2][2], m[1][0], m[2][0]].join(",");
            if (s.indexOf('NaN') === -1) {
                str += " matrix(" + s + ") ";
                if (el.elementClass === OBJECT_CLASS.TEXT && el.visProp.display === 'html') {
                    node.style.transform = str;
                    cx = -el.coords.scrCoords[1];
                    cy = -el.coords.scrCoords[2];
                    switch (el.evalVisProp('anchorx')) {
                        case 'right': cx += el.size[0]; break;
                        case 'middle': cx += el.size[0] * 0.5; break;
                    }
                    switch (el.evalVisProp('anchory')) {
                        case 'bottom': cy += el.size[1]; break;
                        case 'middle': cy += el.size[1] * 0.5; break;
                    }
                    node.style['transform-origin'] = (cx) + 'px ' + (cy) + 'px';
                } else {
                    // Images and texts with display:'internal'
                    node.setAttributeNS(null, "transform", str);
                }
            }
        }
    }

    /**
     * If the URL of the image is provided by a function the URL has to be updated during updateImage()
     * @param {JXG2.Image} el Reference to an image object.
     * @see JXG2.AbstractRenderer#updateImage
     */
    updateImageURL(el) {
        var url = el.eval(el.url);

        if (el._src !== url) {
            el.imgIsLoaded = false;
            el.rendNode.setAttributeNS(this.xlinkNamespace, "xlink:href", url);
            el._src = url;

            return true;
        }

        return false;
    }

    // Already documented in JXG2.AbstractRenderer
    updateImageStyle(el, doHighlight) {
        var css = el.evalVisProp(
            doHighlight ? 'highlightcssclass' : 'cssclass'
        );

        el.rendNode.setAttributeNS(null, "class", css);
    }

    // Already documented in JXG2.AbstractRenderer
    drawForeignObject(el) {
        el.rendNode = this.appendChildPrim(
            this.createPrim("foreignObject", el.id),
            el.evalVisProp('layer')
        );

        this.appendNodesToElement(el, "foreignObject");
        this.updateForeignObject(el);
    }

    // Already documented in JXG2.AbstractRenderer
    updateForeignObject(el) {
        if (el._useUserSize) {
            el.rendNode.style.overflow = "hidden";
        } else {
            el.rendNode.style.overflow = "visible";
        }

        this.updateRectPrim(
            el.rendNode,
            el.coords.scrCoords[1],
            el.coords.scrCoords[2] - el.size[1],
            el.size[0],
            el.size[1]
        );

        if (el.evalVisProp('evaluateOnlyOnce') !== true || !el.renderedOnce) {
            el.rendNode.innerHTML = el.content;
            el.renderedOnce = true;
        }
        this._updateVisual(el, { stroke: true, dash: true }, true);
    }

    /* ********* Render primitive objects *********** */

    /**
    * Stores the rendering nodes.
    * the <tt>createPrim</tt> method.
    * @param {JXG2.GeometryElement} el A JSXGraph element.
    * @param {String} type The XML node name. Only used in VMLRenderer.
    */
    // Already documented in JXG2.AbstractRenderer
    appendNodesToElement(el, type: string) {
        if (type === "shape" || type === "path" || type === 'polygon') {
            el.rendNodePath = this.getElementById(el.id + "_path");
        }
        el.rendNodeFill = this.getElementById(el.id + "_fill");
        el.rendNodeStroke = this.getElementById(el.id + "_stroke");
        el.rendNodeShadow = this.getElementById(el.id + "_shadow");
        el.rendNode = this.getElementById(el.id);
    }


    /**
     * Appends a node to a specific layer level.
     * @param {Node} node A DOM tree node.
     * @param {Number} level The layer the node is attached to. This is the index of the layer in
     * {@link JXG2.SVGRenderer#layer} or the <tt>z-index</tt> style property of the node in SVGRenderer.
     */
    appendChildPrim(node: Node, level: number = 0) {  // trace nodes have level not set

        if (dbug()) console.log(`%c svg: appendChildPrim: node:${node.nodeName}, level:${level},'`, dbugColor)

        if (typeof level !== 'number') {      // someone is misbehaving
            console.warn('level is not a number', (typeof level))
            level = 0
        }

        if (!Type.exists(level)) {
            level = 0;
        } else if (level >= Options['layer'].numlayers) {
            level = Options['layer'].numlayers - 1;
        }
        this.jsxAppendChild(this.layers[level], node) // this.layers[level].appendChild(node);
        return node;
    }


    /**
     * Creates a node of a given type with a given id.
     * @param  type The type of the node to create.
     * @param  id Set the id attribute to this.
     * @returns {Node} Reference to the created node.
     */
    createPrim(type: SVGType, id: string): HTMLElement {
        if (dbug()) console.warn(`%c svg: createPrim(type:${type},id:'${id}'`, dbugColor)

        let node = this.container.ownerDocument.createElementNS(this.svgNamespace, type) as HTMLElement
        node.setAttributeNS(null, "id", this.uniqName(id));
        node.style.position = "absolute";
        if (type === "path") {
            node.setAttributeNS(null, "stroke-linecap", "round");
            node.setAttributeNS(null, "stroke-linejoin", "round");
            node.setAttributeNS(null, "fill-rule", "evenodd");
        }

        return node;
    }

    /**
     * Removes an element node.
     * @param {Node} node The node to remove.
     */
    remove(shape) {
        if (Type.exists(shape) && Type.exists(shape.parentNode)) {
            shape.parentNode.removeChild(shape);
        }
    }

    /**
     * Move element into new layer. This is trivial for canvas, but needs more effort in SVG.
     * Does not work dynamically, i.e. if level is a function.
     *
     * @param  el Element which is put into different layer
     * @param  value Layer number
     * @private
     */
    setLayer(el/*: GeometryElement*/, level: number) {
        if (!Type.exists(level)) {
            level = 0;
        } else if (level >= Options.layer.numlayers) {
            level = Options.layer.numlayers - 1;
        }

        this.layers[level].appendChild(el.rendNode);
    }

    /**
     * Can be used to create the nodes to display arrows. This is an abstract method which has to be implemented
     * in any descendant renderer.
     * @param {JXG2.GeometryElement} el The element the arrows are to be attached to.
     * @param {Object} arrowData Data concerning possible arrow heads
    *
     */
    makeArrows(el/*: GeometryElement*/, a) {
        var node2, str,
            ev_fa = a.evFirst,
            ev_la = a.evLast;

        this.assertNonNullish(el.rendNode, 'expected node')
        this.assertNonNullish(el.rendNode.parentNode, 'expected node')
        this.assertNonNullish(this.container, 'expected container')

        if (this.isSafari && el.visPropCalc.visible && (ev_fa || ev_la)) {
            // Necessary, since Safari is the new IE (11.2024)
            el.rendNode.parentNode.insertBefore(el.rendNode, el.rendNode);
            return;
        }

        // We can not compare against visPropOld if there is need for a new arrow head,
        // since here visPropOld and ev_fa / ev_la already have the same value.
        // This has been set in _updateVisual.
        //
        node2 = el.rendNodeTriangleStart;
        if (ev_fa) {
            str = this.toStr(this.container.id, '_', el.id, 'TriangleStart', a.typeFirst);

            // If we try to set the same arrow head as is already set, we can bail out now
            if (!Type.exists(node2) || node2.id !== str) {
                node2 = this.container.ownerDocument.getElementById(str);
                // Check if the marker already exists.
                // If not, create a new marker
                if (node2 === null) {
                    node2 = this._createArrowHead(el, "Start", a.typeFirst);
                    this.defs.appendChild(node2);
                }
                el.rendNodeTriangleStart = node2;
                el.rendNode.setAttributeNS(null, "marker-start", this.toURL(str));
            }
        } else {
            if (Type.exists(node2)) {
                this.remove(node2);
                el.rendNodeTriangleStart = null;
            }
            el.rendNode.setAttributeNS(null, "marker-start", '');
        }

        node2 = el.rendNodeTriangleEnd;
        if (ev_la) {
            str = this.toStr(this.container.id, '_', el.id, 'TriangleEnd', a.typeLast);

            // If we try to set the same arrow head as is already set, we can bail out now
            if (!Type.exists(node2) || node2.id !== str) {
                node2 = this.container.ownerDocument.getElementById(str);
                // Check if the marker already exists.
                // If not, create a new marker
                if (node2 === null) {
                    node2 = this._createArrowHead(el, "End", a.typeLast);
                    this.defs.appendChild(node2);
                }
                el.rendNodeTriangleEnd = node2;
                el.rendNode.setAttributeNS(null, "marker-end", this.toURL(str));
            }
        } else {
            if (Type.exists(node2)) {
                this.remove(node2);
                el.rendNodeTriangleEnd = null;
            }

            el.rendNode.setAttributeNS(null, "marker-end", '');
        }
    }

    /**
     * Updates an ellipse node primitive. This is an abstract method which has to be implemented in all renderers
     * that use the <tt>createPrim</tt> method.
     * @param {Node} node Reference to the node.
     * @param {Number} x Centre X coordinate
     * @param {Number} y Centre Y coordinate
     * @param {Number} rx The x-axis radius.
     * @param {Number} ry The y-axis radius.
     */
    updateEllipsePrim(node: HTMLElement, x: number, y: number, rx: number, ry: number) {
        var huge = 1000000;

        if (dbug()) console.log(`%c svg: updateEllipsePrim(node, x:${x}, y:${y}, rx:${rx}, ry:${ry} )`, dbugColor, node)

        huge = 200000; // IE
        // webkit does not like huge values if the object is dashed
        // iE doesn't like huge values above 216000
        x = Math.abs(x) < huge ? x : (huge * x) / Math.abs(x);
        y = Math.abs(y) < huge ? y : (huge * y) / Math.abs(y);
        rx = Math.abs(rx) < huge ? rx : (huge * rx) / Math.abs(rx);
        ry = Math.abs(ry) < huge ? ry : (huge * ry) / Math.abs(ry);

        node.setAttributeNS(null, "cx", x.toString());
        node.setAttributeNS(null, "cy", y.toString());
        node.setAttributeNS(null, "rx", Math.abs(rx).toString());
        node.setAttributeNS(null, "ry", Math.abs(ry).toString());
    }

    /**
     * Refreshes a line node. This is an abstract method which has to be implemented in all renderers that use
     * the <tt>createPrim</tt> method.
     * @param {Node} node The node to be refreshed.
     * @param {Number} p1x The first point's x coordinate.
     * @param {Number} p1y The first point's y coordinate.
     * @param {Number} p2x The second point's x coordinate.
     * @param {Number} p2y The second point's y coordinate.
     * @param {JXG2.Board} board
     */
    updateLinePrim(node, p1x, p1y, p2x, p2y) {
        var huge = 1000000;

        huge = 200000; //IE
        if (!isNaN(p1x + p1y + p2x + p2y)) {
            // webkit does not like huge values if the object is dashed
            // IE doesn't like huge values above 216000
            p1x = Math.abs(p1x) < huge ? p1x : (huge * p1x) / Math.abs(p1x);
            p1y = Math.abs(p1y) < huge ? p1y : (huge * p1y) / Math.abs(p1y);
            p2x = Math.abs(p2x) < huge ? p2x : (huge * p2x) / Math.abs(p2x);
            p2y = Math.abs(p2y) < huge ? p2y : (huge * p2y) / Math.abs(p2y);

            node.setAttributeNS(null, "x1", p1x);
            node.setAttributeNS(null, "y1", p1y);
            node.setAttributeNS(null, "x2", p2x);
            node.setAttributeNS(null, "y2", p2y);
        }
    }

    /**
     * Updates a path element. This is an abstract method which has to be implemented in all renderers that use
     * the <tt>createPrim</tt> method.
     * @param {Node} node The path node.
     * @param {String} pathString A string formatted like e.g. <em>'M 1,2 L 3,1 L5,5'</em>. The format of the string
     * depends on the rendering engine.
     * @param {JXG2.Board} board Reference to the element's board.
     */
    updatePathPrim(node, pointString, board: Board) {
        if (pointString === "") {
            pointString = "M 0 0";
        }
        node.setAttributeNS(null, "d", pointString);
    }

    /**
     * Builds a path data string to draw a point with a face other than <em>rect</em> and <em>circle</em>. Since
     * the format of such a string usually depends on the renderer this method
     * is only an abstract method. Therefore, it has to be implemented in the descendant renderer itself unless
     * the renderer does not use the createPrim interface but the draw* interfaces to paint.
     * @param {JXG2.Point} el The point element
     * @param {Number} size A positive number describing the size. Usually the half of the width and height of
     * the drawn point.
     * @param {String} type A string describing the point's face. This method only accepts the shortcut version of
     * each possible face: <tt>x, +, |, -, [], <>, <<>>,^, v, >, < </tt>
     */
    updatePathStringPoint(el, size, type) {
        var s = "",
            scr = el.coords.scrCoords,
            sqrt32 = size * Math.sqrt(3) * 0.5,
            s05 = size * 0.5;

        if (type === "x") {
            s =
                " M " +
                (scr[1] - size) +
                " " +
                (scr[2] - size) +
                " L " +
                (scr[1] + size) +
                " " +
                (scr[2] + size) +
                " M " +
                (scr[1] + size) +
                " " +
                (scr[2] - size) +
                " L " +
                (scr[1] - size) +
                " " +
                (scr[2] + size);
        } else if (type === "+") {
            s =
                " M " +
                (scr[1] - size) +
                " " +
                scr[2] +
                " L " +
                (scr[1] + size) +
                " " +
                scr[2] +
                " M " +
                scr[1] +
                " " +
                (scr[2] - size) +
                " L " +
                scr[1] +
                " " +
                (scr[2] + size);
        } else if (type === "|") {
            s =
                " M " +
                scr[1] +
                " " +
                (scr[2] - size) +
                " L " +
                scr[1] +
                " " +
                (scr[2] + size);
        } else if (type === "-") {
            s =
                " M " +
                (scr[1] - size) +
                " " +
                scr[2] +
                " L " +
                (scr[1] + size) +
                " " +
                scr[2];
        } else if (type === "<>" || type === "<<>>") {
            if (type === "<<>>") {
                size *= 1.41;
            }
            s =
                " M " +
                (scr[1] - size) +
                " " +
                scr[2] +
                " L " +
                scr[1] +
                " " +
                (scr[2] + size) +
                " L " +
                (scr[1] + size) +
                " " +
                scr[2] +
                " L " +
                scr[1] +
                " " +
                (scr[2] - size) +
                " Z ";
        } else if (type === "^") {
            s =
                " M " +
                scr[1] +
                " " +
                (scr[2] - size) +
                " L " +
                (scr[1] - sqrt32) +
                " " +
                (scr[2] + s05) +
                " L " +
                (scr[1] + sqrt32) +
                " " +
                (scr[2] + s05) +
                " Z "; // close path
        } else if (type === "v") {
            s =
                " M " +
                scr[1] +
                " " +
                (scr[2] + size) +
                " L " +
                (scr[1] - sqrt32) +
                " " +
                (scr[2] - s05) +
                " L " +
                (scr[1] + sqrt32) +
                " " +
                (scr[2] - s05) +
                " Z ";
        } else if (type === ">") {
            s =
                " M " +
                (scr[1] + size) +
                " " +
                scr[2] +
                " L " +
                (scr[1] - s05) +
                " " +
                (scr[2] - sqrt32) +
                " L " +
                (scr[1] - s05) +
                " " +
                (scr[2] + sqrt32) +
                " Z ";
        } else if (type === "<") {
            s =
                " M " +
                (scr[1] - size) +
                " " +
                scr[2] +
                " L " +
                (scr[1] + s05) +
                " " +
                (scr[2] - sqrt32) +
                " L " +
                (scr[1] + s05) +
                " " +
                (scr[2] + sqrt32) +
                " Z ";
        }
        return s;
    }

    /**
     * Builds a path data string from a {@link JXG2.Curve} element. Since the path data strings heavily depend on the
     * underlying rendering technique this method is just a stub. Although such a path string is of no use for the
     * CanvasRenderer, this method is used there to draw a path directly.
     * @param {JXG2.GeometryElement} el
     */
    updatePathStringPrim(el) {
        var i,
            scr,
            len,
            symbm = " M ",
            symbl = " L ",
            symbc = " C ",
            nextSymb = symbm,
            maxSize = 5000.0,
            pStr = "";

        if (el.numberPoints <= 0) {
            return "";
        }

        len = Math.min(el.points.length, el.numberPoints);

        if (el.bezierDegree === 1) {
            for (i = 0; i < len; i++) {
                scr = el.points[i].scrCoords;
                if (isNaN(scr[1]) || isNaN(scr[2])) {
                    // PenUp
                    nextSymb = symbm;
                } else {
                    // Chrome has problems with values being too far away.
                    scr[1] = Math.max(Math.min(scr[1], maxSize), -maxSize);
                    scr[2] = Math.max(Math.min(scr[2], maxSize), -maxSize);

                    // Attention: first coordinate may be inaccurate if far way
                    //pStr += [nextSymb, scr[1], ' ', scr[2]].join('');
                    pStr += nextSymb + scr[1] + " " + scr[2]; // Seems to be faster now (webkit and firefox)
                    nextSymb = symbl;
                }
            }
        } else if (el.bezierDegree === 3) {
            i = 0;
            while (i < len) {
                scr = el.points[i].scrCoords;
                if (isNaN(scr[1]) || isNaN(scr[2])) {
                    // PenUp
                    nextSymb = symbm;
                } else {
                    pStr += nextSymb + scr[1] + " " + scr[2];
                    if (nextSymb === symbc) {
                        i += 1;
                        scr = el.points[i].scrCoords;
                        pStr += " " + scr[1] + " " + scr[2];
                        i += 1;
                        scr = el.points[i].scrCoords;
                        pStr += " " + scr[1] + " " + scr[2];
                    }
                    nextSymb = symbc;
                }
                i += 1;
            }
        }
        return pStr;
    }

    /**
     * Builds a path data string from a {@link JXG2.Curve} element such that the curve looks like hand drawn. Since
     * the path data strings heavily depend on the underlying rendering technique this method is just a stub.
     * Although such a path string is of no use for the CanvasRenderer, this method is used there to draw a path
     * directly.
     * @param  {JXG2.GeometryElement} el
     */
    updatePathStringBezierPrim(el) {
        var i, j, k,
            scr,
            lx, ly,
            len,
            symbm = " M ",
            symbl = " C ",
            nextSymb = symbm,
            maxSize = 5000.0,
            pStr = "",
            f = el.evalVisProp('strokewidth'),
            isNoPlot = el.evalVisProp('curvetype') !== "plot";

        if (el.numberPoints <= 0) {
            return "";
        }

        if (isNoPlot && el.board.options.curve.RDPsmoothing) {
            el.points = Numerics.RamerDouglasPeucker(el.points, 0.5);
        }

        len = Math.min(el.points.length, el.numberPoints);
        for (j = 1; j < 3; j++) {
            nextSymb = symbm;
            for (i = 0; i < len; i++) {
                scr = el.points[i].scrCoords;

                if (isNaN(scr[1]) || isNaN(scr[2])) {
                    // PenUp
                    nextSymb = symbm;
                } else {
                    // Chrome has problems with values being too far away.
                    scr[1] = Math.max(Math.min(scr[1], maxSize), -maxSize);
                    scr[2] = Math.max(Math.min(scr[2], maxSize), -maxSize);

                    // Attention: first coordinate may be inaccurate if far way
                    if (nextSymb === symbm) {
                        //pStr += [nextSymb, scr[1], ' ', scr[2]].join('');
                        pStr += nextSymb + scr[1] + " " + scr[2]; // Seems to be faster now (webkit and firefox)
                    } else {
                        k = 2 * j;
                        pStr += [
                            nextSymb,
                            lx + (scr[1] - lx) * 0.333 + f * (k * Math.random() - j),
                            " ",
                            ly + (scr[2] - ly) * 0.333 + f * (k * Math.random() - j),
                            " ",
                            lx + (scr[1] - lx) * 0.666 + f * (k * Math.random() - j),
                            " ",
                            ly + (scr[2] - ly) * 0.666 + f * (k * Math.random() - j),
                            " ",
                            scr[1],
                            " ",
                            scr[2]
                        ].join("");
                    }

                    nextSymb = symbl;
                    lx = scr[1];
                    ly = scr[2];
                }
            }
        }
        return pStr;
    }

    /**
     * Update a polygon primitive.
     * @param {Node} node
     * @param {JXG2.Polygon} el A JSXGraph element of type {@link JXG2.Polygon}
     */
    updatePolygonPrim(node, el) {
        var i,
            pStr = "",
            scrCoords,
            len = el.vertices.length;

        node.setAttributeNS(null, "stroke", "none");
        node.setAttributeNS(null, "fill-rule", "evenodd");
        if (el.elType === "polygonalchain") {
            len++;
        }

        for (i = 0; i < len - 1; i++) {
            if (el.vertices[i].isReal) {
                scrCoords = el.vertices[i].coords.scrCoords;
                pStr = pStr + scrCoords[1] + "," + scrCoords[2];
            } else {
                node.setAttributeNS(null, "points", "");
                return;
            }

            if (i < len - 2) {
                pStr += " ";
            }
        }
        if (pStr.indexOf("NaN") === -1) {
            node.setAttributeNS(null, "points", pStr);
        }
    }

    /**
     * Update a rectangle primitive. This is used only for points with face of type 'rect'.
     * @param {Node} node The node yearning to be updated.
     * @param {Number} x x coordinate of the top left vertex.
     * @param {Number} y y coordinate of the top left vertex.
     * @param {Number} w Width of the rectangle.
     * @param {Number} h The rectangle's height.
     */
    updateRectPrim(node, x, y, w, h) {
        node.setAttributeNS(null, "x", x);
        node.setAttributeNS(null, "y", y);
        node.setAttributeNS(null, "width", w);
        node.setAttributeNS(null, "height", h);
    }

    /* ********* Set attributes *********** */

    /**
     * Call user-defined function to set visual attributes.
     * If "testAttribute" is the empty string, the function
     * is called immediately, otherwise it is called in a timeOut.
     *
     * This is necessary to realize smooth transitions but avoid transitions
     * when first creating the objects.
     *
     * Usually, the string in testAttribute is the visPropOld attribute
     * of the values which are set.
     *
     * @param {Function} setFunc       Some function which usually sets some attributes
     * @param {String} testAttribute If this string is the empty string  the function is called immediately,
     *                               otherwise it is called in a setImeout.
     * @see JXG2.SVGRenderer#setObjectFillColor
     * @see JXG2.SVGRenderer#setObjectStrokeColor
     * @see JXG2.SVGRenderer#_setArrowColor
     * @private
     */
    _setAttribute(setFunc, testAttribute) {
        if (testAttribute === "") {
            setFunc();
        } else {
            window.setTimeout(setFunc, 1);
        }
    }

    /**
    * Shows or hides an element on the canvas; Only a stub, requires implementation in the derived renderer.
    * @param {JXG2.GeometryElement} el Reference to the object that has to appear.
    * @param {Boolean} show true to show the element, false to hide the element.
    */

    display(el/*: GeometryElement*/, show: boolean) {
        if (el) {
            el.visPropOld.visible = show;
        }

        ///////////////////// tbtb - this was in svg.js, but above code implement in abstract.js
        var node;

        if (el && el.rendNode) {
            el.visPropOld.visible = show;
            node = el.rendNode;
            if (show) {
                node.setAttributeNS(null, "display", "inline");
                node.style.visibility = "inherit";
            } else {
                node.setAttributeNS(null, "display", "none");
                node.style.visibility = "hidden";
            }
        }
    }

    /**
     * Hides an element on the canvas; Only a stub, requires implementation in the derived renderer.
     *
     * Please use JXG2.AbstractRenderer#display instead
     * @param {JXG2.GeometryElement} el Reference to the geometry element that has to disappear.
     * @see JXG2.AbstractRenderer#show
     * @deprecated
     */
    hide(el) {
        Env.deprecated("Board.renderer.hide()", "Board.renderer.display()");
        this.display(el, false);
    }

    /**
     * Set ARIA related properties of an element. The attribute "aria" of an element contains at least the
     * properties "enabled", "label", and "live". Additionally, all available properties from
     * {@link https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA} may be set.
     * <p>
     * In JSXGraph, the available properties are used without the leading 'aria-'.
     * For example, the value of the JSXGraph attribute 'aria.label' will be set to the
     * HTML attribute 'aria-label'.
     *
     * @param {JXG2.GeometryElement} el Reference of the object that wants new
     *        ARIA attributes.
     */
    setARIA(el) {
        // This method is only called in abstractRenderer._updateVisual() if aria.enabled == true.
        var key, k, v;

        // this.setPropertyPrim(el.rendNode, 'aria-label', el.evalVisProp('aria.label'));
        // this.setPropertyPrim(el.rendNode, 'aria-live', el.evalVisProp('aria.live'));
        for (key in el.visProp.aria) {
            if (el.visProp.aria.hasOwnProperty(key) && key !== 'enabled') {
                k = 'aria.' + key;
                v = el.evalVisProp('aria.' + key);
                if (el.visPropOld[k] !== v) {
                    this.setPropertyPrim(el.rendNode, 'aria-' + key, v);
                    el.visPropOld[k] = v;
                }
            }
        }
    }

    /**
     * Sets the buffering as recommended by SVGWG. Until now only Opera supports this and will be ignored by other
     * browsers. Although this feature is only supported by SVG we have this method in {@link JXG2.AbstractRenderer}
     * because it is called from outside the renderer.
     * @param {Node} node The SVG DOM Node which buffering type to update.
     * @param {String} type Either 'auto', 'dynamic', or 'static'. For an explanation see
     *   {@link https://www.w3.org/TR/SVGTiny12/painting.html#BufferedRenderingProperty}.
     */
    setBuffering(el, type) {
        el.rendNode.setAttribute("buffered-rendering", type);
    }

    /**
     * Sets CSS classes for elements (relevant for SVG only).
     *
     * @param {JXG2.GeometryElement} el Reference of the object that wants a
     *         new set of CSS classes.
     * @param {String} cssClass String containing a space separated list of CSS classes.
     */
    setCssClass(el, cssClass) {
        if (el.visPropOld.cssclass !== cssClass) {
            this.setPropertyPrim(el.rendNode, 'class', cssClass);
            el.visPropOld.cssclass = cssClass;
        }
    }

    /**
     * Sets an element's dash style.
     * @param {JXG2.GeometryElement} el An JSXGraph element.
     */
    setDashStyle(el) {
        var dashStyle = el.evalVisProp('dash'),
            ds = el.evalVisProp('dashscale'),
            sw = ds ? 0.5 * el.evalVisProp('strokewidth') : 1,
            node = el.rendNode;

        if (dashStyle > 0) {
            node.setAttributeNS(null, "stroke-dasharray",
                // sw could distinguish highlighting or not.
                // But it seems to preferable to ignore this.
                this.dashArray[dashStyle - 1].map(function (x) { return x * sw; }).join(',')
            );
        } else {
            if (node.hasAttributeNS(null, "stroke-dasharray")) {
                node.removeAttributeNS(null, "stroke-dasharray");
            }
        }
    }

    /**
     * Sets up nodes for rendering a gradient fill.
     * @param {JXG2.GeometryElement}  el Reference of the object which gets the gradient
     */
    setGradient(el) {
        var fillNode = el.rendNode,
            node, node2, node3,
            ev_g = el.evalVisProp('gradient');


        if (ev_g === "linear" || ev_g === "radial") {
            if (ev_g === "linear")
                node = this.createPrim("linearGradient", el.id + "_gradient");
            else
                node = this.createPrim("radialGradient", el.id + "_gradient");

            node2 = this.createPrim("stop", el.id + "_gradient1");
            node3 = this.createPrim("stop", el.id + "_gradient2");
            node.appendChild(node2);
            node.appendChild(node3);
            this.defs.appendChild(node);

            this.assertNonNullish(this.container, 'expected container')
            fillNode.setAttributeNS(
                null,
                'style',
                // "fill:url(#" + this.container.id + "_" + el.id + "_gradient)"
                'fill:' + this.toURL(this.container.id + '_' + el.id + '_gradient')
            );
            el.gradNode1 = node2;
            el.gradNode2 = node3;
            el.gradNode = node;
        } else {
            fillNode.removeAttributeNS(null, "style");
        }
    }

    /**
     * Update the line endings (linecap) of a straight line from its attribute
     * 'linecap'.
     * Possible values for the attribute 'linecap' are: 'butt', 'round', 'square'.
     * The default value is 'butt'. Not available for VML renderer.
     *
     * @param {JXG2.Line} element A arbitrary line.
     * @see Line
     * @see JXG2.Line
     * @see JXG2.AbstractRenderer#updateLine
     */
    setLineCap(el) {
        var capStyle = el.evalVisProp('linecap');

        if (
            capStyle === undefined ||
            capStyle === "" ||
            el.visPropOld.linecap === capStyle ||
            !Type.exists(el.rendNode)
        ) {
            return;
        }

        this.setPropertyPrim(el.rendNode, "stroke-linecap", capStyle);
        el.visPropOld.linecap = capStyle;
    }

    /**
     * Sets an objects fill color.
     * @param {JXG2.GeometryElement} el Reference of the object that wants a new fill color.
     * @param {String} color Color in a HTML/CSS compatible format. If you don't want any fill color at all, choose
     * 'none'.
     * @param {Number} opacity Opacity of the fill color. Must be between 0 and 1.
     */
    setObjectFillColor(el/*: GeometryElement*/, color: string, opacity: number, rendNode?: HTMLElement) {
        var node, c, rgbo, oo,
            rgba = color,
            o = opacity,
            grad = el.evalVisProp('gradient');

        o = o > 0 ? o : 0;

        // TODO  save gradient and gradientangle
        if (
            el.visPropOld.fillcolor === rgba &&
            el.visPropOld.fillopacity === o &&
            grad === null
        ) {
            return;
        }
        if (Type.exists(rgba) && rgba !== 'none') {
            if (rgba.length !== 9) {
                // RGB, not RGBA
                c = rgba;
                oo = o;
            } else {
                // True RGBA, not RGB
                rgbo = Color.rgba2rgbo(rgba);
                c = rgbo[0];
                oo = o * rgbo[1];
            }

            if (rendNode === undefined) {
                node = el.rendNode;
            } else {
                node = rendNode;
            }

            if (c !== "none" && c !== "" && c !== false) {
                this._setAttribute(function () {
                    node.setAttributeNS(null, "fill", c);
                }, el.visPropOld.fillcolor);
            }

            if (el.otype === OBJECT_TYPE.IMAGE) {
                this._setAttribute(function () {
                    node.setAttributeNS(null, "opacity", oo);
                }, el.visPropOld.fillopacity);
                //node.style['opacity'] = oo;  // This would overwrite values set by CSS class.
            } else {
                if (c === "none") {
                    // This is done only for non-images
                    // because images have no fill color.
                    oo = 0;
                    // This is necessary if there is a foreignObject below.
                    node.setAttributeNS(null, "pointer-events", "visibleStroke");
                } else {
                    // This is the default
                    node.setAttributeNS(null, "pointer-events", "visiblePainted");
                }
                this._setAttribute(function () {
                    node.setAttributeNS(null, "fill-opacity", oo);
                }, el.visPropOld.fillopacity);
            }

            if (grad === "linear" || grad === "radial") {
                this.updateGradient(el);
            }
        }
        el.visPropOld.fillcolor = rgba;
        el.visPropOld.fillopacity = o;
    }

    /**
     * Changes an objects stroke color to the given color.
     * @param {JXG2.GeometryElement} el Reference of the {@link JXG2.GeometryElement} that gets a new stroke
     * color.
     * @param {String} color Color value in a HTML compatible format, e.g. <strong>#00ff00</strong> or
     * <strong>green</strong> for green.
     * @param {Number} opacity Opacity of the fill color. Must be between 0 and 1.
     */
    setObjectStrokeColor(el, color, opacity) {
        if (dbug(el)) console.warn(`%c svg: setObjectSrokeColor(el, color:${color},opacity:'${opacity}'`, dbugColor)

        var rgba = color,
            c, rgbo,
            o = opacity,
            oo, node;

        o = o > 0 ? o : 0;

        if (el.visPropOld.strokecolor === rgba && el.visPropOld.strokeopacity === o) {
            return;
        }

        if (Type.exists(rgba) && rgba !== false) {
            if (rgba.length !== 9) {
                // RGB, not RGBA
                c = rgba;
                oo = o;
            } else {
                // True RGBA, not RGB
                rgbo = Color.rgba2rgbo(rgba);
                c = rgbo[0];
                oo = o * rgbo[1];
            }

            node = el.rendNode;

            if (el.elementClass === OBJECT_CLASS.TEXT) {
                if (el.evalVisProp('display') === "html") {
                    this._setAttribute(function () {
                        node.style.color = c;
                        node.style.opacity = oo;
                    }, el.visPropOld.strokecolor);
                } else {
                    this._setAttribute(function () {
                        node.setAttributeNS(null, "style", "fill:" + c);
                        node.setAttributeNS(null, "style", "fill-opacity:" + oo);
                    }, el.visPropOld.strokecolor);
                }
            } else {
                this._setAttribute(function () {
                    node.setAttributeNS(null, "stroke", c);
                    node.setAttributeNS(null, "stroke-opacity", oo);
                }, el.visPropOld.strokecolor);
            }

            if (
                el.elementClass === OBJECT_CLASS.CURVE ||
                el.elementClass === OBJECT_CLASS.LINE
            ) {
                if (el.evalVisProp('firstarrow')) {
                    this._setArrowColor(
                        el.rendNodeTriangleStart,
                        c, oo, el,
                        el.visPropCalc.typeFirst
                    );
                }

                if (el.evalVisProp('lastarrow')) {
                    this._setArrowColor(
                        el.rendNodeTriangleEnd,
                        c, oo, el,
                        el.visPropCalc.typeLast
                    );
                }
            }
        }

        el.visPropOld.strokecolor = rgba;
        el.visPropOld.strokeopacity = o;
    }

    /**
     * Sets an element's stroke width.
     * @param {JXG2.GeometryElement} el Reference to the geometry element.
     * @param {Number} width The new stroke width to be assigned to the element.
     */
    setObjectStrokeWidth(el, width) {
        var node,
            w = width;

        if (isNaN(w) || el.visPropOld.strokewidth === w) {
            return;
        }

        node = el.rendNode;
        this.setPropertyPrim(node, "stroked", "true");
        if (Type.exists(w)) {
            this.setPropertyPrim(node, "stroke-width", w + "px");

            // if (el.elementClass === Const.OBJECT_CLASS_CURVE ||
            // el.elementClass === Const.OBJECT_CLASS_LINE) {
            //     if (el.evalVisProp('firstarrow')) {
            //         this._setArrowWidth(el.rendNodeTriangleStart, w, el.rendNode);
            //     }
            //
            //     if (el.evalVisProp('lastarrow')) {
            //         this._setArrowWidth(el.rendNodeTriangleEnd, w, el.rendNode);
            //     }
            // }
        }
        el.visPropOld.strokewidth = w;
    }

    /**
     * Sets the transition duration (in milliseconds) for fill color and stroke
     * color and opacity.
     * @param {JXG2.GeometryElement} el Reference of the object that wants a
     *         new transition duration.
     * @param {Number} duration (Optional) duration in milliseconds. If not given,
     *        element.visProp.transitionDuration is taken. This is the default.
     */
    setObjectTransition(el/*: GeometryElement*/, duration?: number) {
        var node, props,
            transitionArr: string[] = [],
            transitionStr,
            i,
            len = 0,
            nodes = ["rendNode", "rendNodeTriangleStart", "rendNodeTriangleEnd"];

        if (duration === undefined) {
            duration = el.evalVisProp('transitionduration');
        }

        props = el.evalVisProp('transitionproperties');
        if (duration === el.visPropOld.transitionduration &&
            props === el.visPropOld.transitionproperties) {
            return;
        }

        // if (
        //     el.elementClass === Const.OBJECT_CLASS_TEXT &&
        //     el.evalVisProp('display') === "html"
        // ) {
        //     // transitionStr = " color " + duration + "ms," +
        //     //     " opacity " + duration + "ms";
        //     transitionStr = " all " + duration + "ms ease";
        // } else {
        //     transitionStr =
        //         " fill " + duration + "ms," +
        //         " fill-opacity " + duration + "ms," +
        //         " stroke " + duration + "ms," +
        //         " stroke-opacity " + duration + "ms," +
        //         " stroke-width " + duration + "ms," +
        //         " width " + duration + "ms," +
        //         " height " + duration + "ms," +
        //         " rx " + duration + "ms," +
        //         " ry " + duration + "ms";
        // }

        if (Type.exists(props)) {
            len = props.length;
        }
        for (i = 0; i < len; i++) {
            transitionArr.push(props[i] + ' ' + duration + 'ms');
        }
        transitionStr = transitionArr.join(', ');

        len = nodes.length;
        for (i = 0; i < len; ++i) {
            if (el[nodes[i]]) {
                node = el[nodes[i]];
                node.style.transition = transitionStr;
            }
        }

        el.visPropOld.transitionduration = duration;
        el.visPropOld.transitionproperties = props;
    }

    /**
     * Sets the shadow properties to a geometry element. This method is only a stub, it is implemented in the actual
     * renderers.
     * @param {JXG2.GeometryElement} el Reference to a geometry object, that should get a shadow
     */
    setShadow(el) {
        var ev_s = el.evalVisProp('shadow'),
            ev_s_json, c, b, bl, o, op, id, node,
            use_board_filter = true,
            show = false;

        ev_s_json = JSON.stringify(ev_s);
        if (ev_s_json === el.visPropOld.shadow) {
            return;
        }

        if (typeof ev_s === 'boolean') {
            use_board_filter = true;
            show = ev_s;
            c = 'none';
            b = 3;
            bl = 0.1;
            o = [5, 5];
            op = 1;
        } else {
            if (el.evalVisProp('shadow.enabled')) {
                use_board_filter = false;
                show = true;
                c = Color.rgbParser(el.evalVisProp('shadow.color'));
                b = el.evalVisProp('shadow.blur');
                bl = el.evalVisProp('shadow.blend');
                o = el.evalVisProp('shadow.offset');
                op = el.evalVisProp('shadow.opacity');
            } else {
                show = false;
            }
        }

        if (Type.exists(el.rendNode)) {
            if (show) {
                this.assertNonNullish(this.container, 'expected container')
                if (use_board_filter) {
                    el.rendNode.setAttributeNS(null, 'filter', this.toURL(this.container.id + '_' + 'f1'));
                    // 'url(#' + this.container.id + '_' + 'f1)');
                } else {
                    node = this.container.ownerDocument.getElementById(id);
                    if (node) {
                        this.defs.removeChild(node);
                    }
                    id = el.rendNode.id + '_' + 'f1';
                    this.defs.appendChild(this.createShadowFilter(id, c, op, bl, b, o));
                    el.rendNode.setAttributeNS(null, 'filter', this.toURL(id));
                    // 'url(#' + id + ')');
                }
            } else {
                el.rendNode.removeAttributeNS(null, 'filter');
            }
        }

        el.visPropOld.shadow = ev_s_json;
    }

    /**
     * Set the attribute `tabindex` to the attribute `tabindex` of an element.
     * This is only relevant for the SVG renderer.
     *
     * @param {JXG2.GeometryElement} el
     */
    setTabindex(el) {
        var val;
        if (el.board.attr.keyboard.enabled && Type.exists(el.rendNode)) {
            val = el.evalVisProp('tabindex');
            if (!el.visPropCalc.visible /* || el.evalVisProp('fixed') */) {
                val = null;
            }
            if (val !== el.visPropOld.tabindex) {
                el.rendNode.setAttribute("tabindex", val);
                el.visPropOld.tabindex = val;
            }
        }
    }

    /**
     * Sets a node's attribute.
     * @param {Node} node The node that is to be updated.
     * @param {String} key Name of the attribute.
     * @param {String} val New value for the attribute.
     */
    setPropertyPrim(node, key, val) {
        if (key === "stroked") {
            return;
        }
        node.setAttributeNS(null, key, val);
    }

    /**
     * Shows a hidden element on the canvas; Only a stub, requires implementation in the derived renderer.
     *
     * Please use JXG2.AbstractRenderer#display instead
     * @param {JXG2.GeometryElement} el Reference to the object that has to appear.
     * @see JXG2.AbstractRenderer#hide
     * @deprecated
     */
    show(el) {
        Env.deprecated("Board.renderer.show()", "Board.renderer.display()");
        this.display(el, true);
        // var node;
        //
        // if (el && el.rendNode) {
        //     node = el.rendNode;
        //     node.setAttributeNS(null, 'display', 'inline');
        //     node.style.visibility = "inherit";
        // }
    }

    /**
     * Updates the gradient fill.
     * @param {JXG2.GeometryElement} el An JSXGraph element with an area that can be filled.
     */
    updateGradient(el) {
        var col,
            op,
            node2 = el.gradNode1,
            node3 = el.gradNode2,
            ev_g = el.evalVisProp('gradient');

        if (!Type.exists(node2) || !Type.exists(node3)) {
            return;
        }

        op = el.evalVisProp('fillopacity');
        op = op > 0 ? op : 0;
        col = el.evalVisProp('fillcolor');

        node2.setAttributeNS(null, "style", "stop-color:" + col + ";stop-opacity:" + op);
        node3.setAttributeNS(
            null,
            "style",
            "stop-color:" +
            el.evalVisProp('gradientsecondcolor') +
            ";stop-opacity:" +
            el.evalVisProp('gradientsecondopacity')
        );
        node2.setAttributeNS(
            null,
            "offset",
            el.evalVisProp('gradientstartoffset') * 100 + "%"
        );
        node3.setAttributeNS(
            null,
            "offset",
            el.evalVisProp('gradientendoffset') * 100 + "%"
        );
        if (ev_g === "linear") {
            this.updateGradientAngle(el.gradNode, el.evalVisProp('gradientangle'));
        } else if (ev_g === "radial") {
            this.updateGradientCircle(
                el.gradNode,
                el.evalVisProp('gradientcx'),
                el.evalVisProp('gradientcy'),
                el.evalVisProp('gradientr'),
                el.evalVisProp('gradientfx'),
                el.evalVisProp('gradientfy'),
                el.evalVisProp('gradientfr')
            );
        }
    }

    /**
     * Set the gradient angle for linear color gradients.
     *
     * @private
     * @param {SVGnode} node SVG gradient node of an arbitrary JSXGraph element.
     * @param {Number} radians angle value in radians. 0 is horizontal from left to right, Pi/4 is vertical from top to bottom.
     */
    updateGradientAngle(node, radians) {
        // Angles:
        // 0: ->
        // 90: down
        // 180: <-
        // 90: up
        var f = 1.0,
            co = Math.cos(radians),
            si = Math.sin(radians);

        if (Math.abs(co) > Math.abs(si)) {
            f /= Math.abs(co);
        } else {
            f /= Math.abs(si);
        }

        if (co >= 0) {
            node.setAttributeNS(null, "x1", 0);
            node.setAttributeNS(null, "x2", co * f);
        } else {
            node.setAttributeNS(null, "x1", -co * f);
            node.setAttributeNS(null, "x2", 0);
        }
        if (si >= 0) {
            node.setAttributeNS(null, "y1", 0);
            node.setAttributeNS(null, "y2", si * f);
        } else {
            node.setAttributeNS(null, "y1", -si * f);
            node.setAttributeNS(null, "y2", 0);
        }
    }

    /**
     * Set circles for radial color gradients.
     *
     * @private
     * @param {SVGnode} node SVG gradient node
     * @param {Number} cx SVG value cx (value between 0 and 1)
     * @param {Number} cy  SVG value cy (value between 0 and 1)
     * @param {Number} r  SVG value r (value between 0 and 1)
     * @param {Number} fx  SVG value fx (value between 0 and 1)
     * @param {Number} fy  SVG value fy (value between 0 and 1)
     * @param {Number} fr  SVG value fr (value between 0 and 1)
     */
    updateGradientCircle(node, cx, cy, r, fx, fy, fr) {
        node.setAttributeNS(null, "cx", cx * 100 + "%"); // Center first color
        node.setAttributeNS(null, "cy", cy * 100 + "%");
        node.setAttributeNS(null, "r", r * 100 + "%");
        node.setAttributeNS(null, "fx", fx * 100 + "%"); // Center second color / focal point
        node.setAttributeNS(null, "fy", fy * 100 + "%");
        node.setAttributeNS(null, "fr", fr * 100 + "%");
    }

    /* ********* Renderer control *********** */

    /**
      * Stop redraw. This method is called before every update, so a non-vector-graphics based renderer can use this
      * method to delete the contents of the drawing panel. This is an abstract method every descendant renderer
      * should implement, if appropriate.
      * @see JXG2.AbstractRenderer#unsuspendRedraw
      */
    suspendRedraw() {
        // It seems to be important for the Linux version of firefox
        this.suspendHandle = (this.svgRoot as SVGSVGElement).suspendRedraw(10000);
    }

    /**
     * Restart redraw. This method is called after updating all the rendering node attributes.
     * @see JXG2.AbstractRenderer#suspendRedraw
     */
    unsuspendRedraw() {
        (this.svgRoot as SVGSVGElement).unsuspendRedraw(this.suspendHandle);

    }

    /**
     * Resizes the rendering element
     * @param {Number} w New width
     * @param {Number} h New height
     */
    resize(w: number, h: number) {
        this.assertNonNullish(this.svgRoot, "Expected a node")

        this.svgRoot.setAttribute("width", w.toString());
        this.svgRoot.setAttribute("height", h.toString());
    }

    /**
     * Create crosshair elements (Fadenkreuz) for presentations.
     * @param {Number} n Number of crosshairs.
     */
    createTouchpoints(n) {
        var i, na1, na2, node;
        this.touchpoints = [];
        for (i = 0; i < n; i++) {
            na1 = "touchpoint1_" + i;
            node = this.createPrim("path", na1);
            this.appendChildPrim(node, 19);
            node.setAttributeNS(null, "d", "M 0 0");
            this.touchpoints.push(node);

            this.setPropertyPrim(node, "stroked", "true");
            this.setPropertyPrim(node, "stroke-width", "1px");
            node.setAttributeNS(null, "stroke", "#000000");
            node.setAttributeNS(null, "stroke-opacity", 1.0);
            node.setAttributeNS(null, "display", "none");

            na2 = "touchpoint2_" + i;
            node = this.createPrim("ellipse", na2);
            this.appendChildPrim(node, 19);
            this.updateEllipsePrim(node, 0, 0, 0, 0);
            this.touchpoints.push(node);

            this.setPropertyPrim(node, "stroked", "true");
            this.setPropertyPrim(node, "stroke-width", "1px");
            node.setAttributeNS(null, "stroke", "#000000");
            node.setAttributeNS(null, "stroke-opacity", 1.0);
            node.setAttributeNS(null, "fill", "#ffffff");
            node.setAttributeNS(null, "fill-opacity", 0.0);

            node.setAttributeNS(null, "display", "none");
        }
    }

    /**
     * Show a specific crosshair.
     * @param {Number} i Number of the crosshair to show
     */
    showTouchpoint(i) {
        if (this.touchpoints && i >= 0 && 2 * i < this.touchpoints.length) {
            this.touchpoints[2 * i].setAttributeNS(null, "display", "inline");
            this.touchpoints[2 * i + 1].setAttributeNS(null, "display", "inline");
        }
    }

    /**
     * Hide a specific crosshair.
     * @param {Number} i Number of the crosshair to show
     */
    hideTouchpoint(i) {
        if (this.touchpoints && i >= 0 && 2 * i < this.touchpoints.length) {
            this.touchpoints[2 * i].setAttributeNS(null, "display", "none");
            this.touchpoints[2 * i + 1].setAttributeNS(null, "display", "none");
        }
    }

    /**
     * Move a specific crosshair.
     * @param {Number} i Number of the crosshair to show
     * @param {Array} pos New positon in screen coordinates
     */
    updateTouchpoint(i, pos) {
        var x,
            y,
            d = 37;

        if (this.touchpoints && i >= 0 && 2 * i < this.touchpoints.length) {
            x = pos[0];
            y = pos[1];

            this.touchpoints[2 * i].setAttributeNS(
                null,
                "d",
                "M " +
                (x - d) +
                " " +
                y +
                " " +
                "L " +
                (x + d) +
                " " +
                y +
                " " +
                "M " +
                x +
                " " +
                (y - d) +
                " " +
                "L " +
                x +
                " " +
                (y + d)
            );
            this.updateEllipsePrim(this.touchpoints[2 * i + 1], pos[0], pos[1], 25, 25);
        }
    }

    /* ********* Dump related stuff *********** */

    /**
     * Walk recursively through the DOM subtree of a node and collect all
     * value attributes together with the id of that node.
     * <b>Attention:</b> Only values of nodes having a valid id are taken.
     * @param  {Node} node   root node of DOM subtree that will be searched recursively.
     * @return {Array}      Array with entries of the form [id, value]
     * @private
     */
    _getValuesOfDOMElements(node) {
        var values: any[] = [];
        if (node.nodeType === 1) {
            node = node.firstChild;
            while (node) {
                if (node.id !== undefined && node.value !== undefined) {
                    values.push([node.id, node.value]);
                }
                Type.concat(values, this._getValuesOfDOMElements(node));
                node = node.nextSibling;
            }
        }
        return values;
    }

    // _getDataUri(url, callback) {
    //     var image = new Image();
    //     image.onload = function () {
    //         var canvas = document.createElement("canvas");
    //         canvas.width = this.naturalWidth; // or 'width' if you want a special/scaled size
    //         canvas.height = this.naturalHeight; // or 'height' if you want a special/scaled size
    //         canvas.getContext("2d").drawImage(this, 0, 0);
    //         callback(canvas.toDataURL("image/png"));
    //         canvas.remove();
    //     };
    //     image.src = url;
    // }

    _getImgDataURL(svgRoot) {
        var images, len, canvas, ctx, ur, i;

        images = svgRoot.getElementsByTagName("image");
        len = images.length;
        if (len > 0) {
            canvas = document.createElement("canvas");
            //img = new Image();
            for (i = 0; i < len; i++) {
                images[i].setAttribute("crossorigin", "anonymous");
                //img.src = images[i].href;
                //img.onload = function() {
                // img.crossOrigin = "anonymous";
                ctx = canvas.getContext("2d");
                canvas.width = images[i].getAttribute("width");
                canvas.height = images[i].getAttribute("height");
                try {
                    ctx.drawImage(images[i], 0, 0, canvas.width, canvas.height);

                    // If the image is not png, the format must be specified here
                    ur = canvas.toDataURL();
                    images[i].setAttribute("xlink:href", ur);
                } catch (err) {
                    console.log("CORS problem! Image can not be used", err);
                }
            }
            //canvas.remove();
        }
        return true;
    }

    /**
     * Return a data URI of the SVG code representing the construction.
     * The SVG code of the construction is base64 encoded. The return string starts
     * with "data:image/svg+xml;base64,...".
     *
     * @param {Boolean} ignoreTexts If true, the foreignObject tag is set to display=none.
     * This is necessary for older versions of Safari. Default: false
     * @returns {String}  data URI string
     *
     * @example
     * var A = board.create('point', [2, 2]);
     *
     * var txt = board.renderer.dumpToDataURI(false);
     * // txt consists of a string of the form
     * // data:image/svg+xml;base64,PHN2Zy. base64 encoded SVG..+PC9zdmc+
     * // Behind the comma, there is the base64 encoded SVG code
     * // which is decoded with atob().
     * // The call of decodeURIComponent(escape(...)) is necessary
     * // to handle unicode strings correctly.
     * var ar = txt.split(',');
     * document.getElementById('output').value = decodeURIComponent(escape(atob(ar[1])));
     *
     * </pre><div id="JXG1bad4bec-6d08-4ce0-9b7f-d817e8dd762d" class="jxgbox" style="width: 300px; height: 300px;"></div>
     * <textarea id="output2023" rows="5" cols="50"></textarea>
     * <script type="text/javascript">
     *     (function() {
     *         var board = JXG2.JSXGraph.initBoard('JXG1bad4bec-6d08-4ce0-9b7f-d817e8dd762d',
     *             {boundingbox: [-8, 8, 8,-8], axis: true, showcopyright: false, shownavigation: false});
     *     var A = board.create('point', [2, 2]);
     *
     *     var txt = board.renderer.dumpToDataURI(false);
     *     // txt consists of a string of the form
     *     // data:image/svg+xml;base64,PHN2Zy. base64 encoded SVG..+PC9zdmc+
     *     // Behind the comma, there is the base64 encoded SVG code
     *     // which is decoded with atob().
     *     // The call of decodeURIComponent(escape(...)) is necessary
     *     // to handle unicode strings correctly.
     *     var ar = txt.split(',');
     *     document.getElementById('output2023').value = decodeURIComponent(escape(atob(ar[1])));
     *
     *     })();
     *
     * </script><pre>
     *
     */
    dumpToDataURI(ignoreTexts) {
        let
            btoa = window.btoa || Base64.encode,
            svg, i, len,
            values = [];

        var svgRoot = this.svgRoot
        this.assertNonNullish(svgRoot, "Expected a node")

        // Move all HTML tags (beside the SVG root) of the container
        // to the foreignObject element inside of the svgRoot node
        // Problem:
        // input values are not copied. This can be verified by looking at an innerHTML output
        // of an input element. Therefore, we do it "by hand".

        this.assertNonNullish(this.container, "Expected a node")
        if (this.container.hasChildNodes() && Type.exists(this.foreignObjLayer)) {
            if (!ignoreTexts) {
                this.foreignObjLayer.setAttribute("display", "inline");
            }
            while (svgRoot.nextSibling) {
                // Copy all value attributes
                Type.concat(values, this._getValuesOfDOMElements(svgRoot.nextSibling));
                this.foreignObjLayer.appendChild(svgRoot.nextSibling);
            }
        }

        this._getImgDataURL(svgRoot);


        // Convert the SVG graphic into a string containing SVG code
        svgRoot.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        svg = new XMLSerializer().serializeToString(svgRoot);

        if (ignoreTexts !== true) {
            // Handle SVG texts
            // Insert all value attributes back into the svg string
            len = values.length;
            for (i = 0; i < len; i++) {
                svg = svg.replace(
                    'id="' + values[i][0] + '"',
                    'id="' + values[i][0] + '" value="' + values[i][1] + '"'
                );
            }
        }

        // if (false) {
        //     // Debug: use example svg image
        //     svg = '<svg xmlns="http://www.w3.org/2000/svg" version="1.0" width="220" height="220"><rect width="66" height="30" x="21" y="32" stroke="#204a87" stroke-width="2" fill="none" /></svg>';
        // }

        // In IE we have to remove the namespace again.
        // Since 2024 we have to check if the namespace attribute appears twice in one tag, because
        // there might by a svg inside of the svg, e.g. the screenshot icon.
        if (this.isSafari &&
            (svg.match(/xmlns="http:\/\/www.w3.org\/2000\/svg"\s+xmlns="http:\/\/www.w3.org\/2000\/svg"/g) || []).length > 1
        ) {
            svg = svg.replace(/xmlns="http:\/\/www.w3.org\/2000\/svg"\s+xmlns="http:\/\/www.w3.org\/2000\/svg"/g, "");
        }

        // Safari fails if the svg string contains a "&nbsp;"
        // Obsolete with Safari 12+
        svg = svg.replace(/&nbsp;/g, " ");
        // Replacing &quot;s might be necessary for older Safari versions
        // svg = svg.replace(/url\(&quot;(.*)&quot;\)/g, "url($1)"); // Bug: does not replace matching &quot;s
        // svg = svg.replace(/&quot;/g, "");

        // Move all HTML tags back from
        // the foreignObject element to the container
        if (Type.exists(this.foreignObjLayer) && this.foreignObjLayer.hasChildNodes()) {
            // Restore all HTML elements
            while (this.foreignObjLayer.firstChild) {
                this.assertNonNullish(this.container, "Expected a node")
                this.container.appendChild(this.foreignObjLayer.firstChild);
            }
            this.foreignObjLayer.setAttribute("display", "none");
        }

        return "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));
    }

    /**
     * Convert the SVG construction into an HTML canvas image.
     * This works for all SVG supporting browsers. Implemented as Promise.
     * <p>
     * Might fail if any text element or foreign object element contains SVG. This
     * is the case e.g. for the default fullscreen symbol.
     * <p>
     * For IE, it is realized as function.
     * It works from version 9, with the exception that HTML texts
     * are ignored on IE. The drawing is done with a delay of
     * 200 ms. Otherwise there would be problems with IE.
     *
     * @param {String} canvasId Id of an HTML canvas element
     * @param {Number} w Width in pixel of the dumped image, i.e. of the canvas tag.
     * @param {Number} h Height in pixel of the dumped image, i.e. of the canvas tag.
     * @param {Boolean} ignoreTexts If true, the foreignObject tag is taken out from the SVG root.
     * This is necessary for older versions of Safari. Default: false
     * @returns {Promise}  Promise object
     *
     * @example
     * 	board.renderer.dumpToCanvas('canvas').then(function() { console.log('done'); });
     *
     * @example
     *  // IE 11 example:
     * 	board.renderer.dumpToCanvas('canvas');
     * 	setTimeout(function() { console.log('done'); } 400);
     */
    dumpToCanvas(canvasId, w, h, ignoreTexts): Promise<unknown> {
        var svg, tmpImg,
            cv, ctx

        this.assertNonNullish(this.container, "Expected a node")
        let doc = this.container.ownerDocument;

        // Prepare the canvas element
        cv = doc.getElementById(canvasId);

        // Clear the canvas
        /* eslint-disable no-self-assign */
        cv.width = cv.width;
        /* eslint-enable no-self-assign */

        ctx = cv.getContext("2d");
        if (w !== undefined && h !== undefined) {
            cv.style.width = parseFloat(w) + "px";
            cv.style.height = parseFloat(h) + "px";
            // Scale twice the CSS size to make the image crisp
            // cv.setAttribute('width', 2 * parseFloat(wOrg));
            // cv.setAttribute('height', 2 * parseFloat(hOrg));
            // ctx.scale(2 * wOrg / w, 2 * hOrg / h);
            cv.setAttribute("width", parseFloat(w));
            cv.setAttribute("height", parseFloat(h));
        }

        // Display the SVG string as data-uri in an HTML img.
        /**
         * @type {Image}
         * @ignore
         * {ignore}
         */
        tmpImg = new Image();
        svg = this.dumpToDataURI(ignoreTexts);
        tmpImg.src = svg;

        // Finally, draw the HTML img in the canvas.
        if (!("Promise" in window)) {
            /**
             * @function
             * @ignore
             */
            tmpImg.onload = function () {
                // IE needs a pause...
                // Seems to be broken
                window.setTimeout(function () {
                    try {
                        ctx.drawImage(tmpImg, 0, 0, w, h);
                    } catch (err) {
                        console.log("screenshots not longer supported on IE");
                    }
                }, 200);
            };
            return new Promise(() => { });     // TODO:  this is wrong, but caller expects a promise...
        }

        return new Promise(function (resolve, reject) {
            try {
                tmpImg.onload = function () {
                    ctx.drawImage(tmpImg, 0, 0, w, h);
                    this.resolve();
                };
            } catch (e) {
                reject(e);
            }
        });
    }

    /**
     * Display SVG image in html img-tag which enables
     * easy download for the user.
     *
     * Support:
     * <ul>
     * <li> IE: No
     * <li> Edge: full
     * <li> Firefox: full
     * <li> Chrome: full
     * <li> Safari: full (No text support in versions prior to 12).
     * </ul>
     *
     * @param {JXG2.Board} board Link to the board.
     * @param {String} imgId Optional id of an img object. If given and different from the empty string,
     * the screenshot is copied to this img object. The width and height will be set to the values of the
     * JSXGraph container.
     * @param {Boolean} ignoreTexts If set to true, the foreignObject is taken out of the
     *  SVGRoot and texts are not displayed. This is mandatory for Safari. Default: false
     * @return {Object}       the svg renderer object
     */
    screenshot(board, imgId, ignoreTexts) {
        var node,
            // cPos,
            // cssTxt,
            canvas, id, img,
            button, buttonText,
            w, h,
            bas = board.attr.screenshot,
            navbar, navbarDisplay, insert,
            newImg = false,
            _copyCanvasToImg,
            isDebug = false;

        this.assertNonNullish(this.container, "Expected a node")
        let doc = this.container.ownerDocument
        this.assertNonNullish(doc, "Expected a node")
        let parent = this.container.parentNode
        this.assertNonNullish(parent, "Expected a node")

        if (this.type === "no") {
            return this;
        }

        this.assertNonNullish(this.container.getBoundingClientRect(), "Expected a node")
        w = bas.scale * this.container.getBoundingClientRect().width;
        h = bas.scale * this.container.getBoundingClientRect().height;

        if (imgId === undefined || imgId === "") {
            newImg = true;
            img = new Image(); //doc.createElement('img');
            img.style.width = w + "px";
            img.style.height = h + "px";
        } else {
            newImg = false;
            img = doc.getElementById(imgId);
        }
        // img.crossOrigin = 'anonymous';

        // Create div which contains canvas element and close button
        if (newImg) {
            node = doc.createElement("div");
            node.style.cssText = bas.css;
            node.style.width = w + "px";
            node.style.height = h + "px";

            this.assertNonNullish(this.container, "Expected a node")
            node.style.zIndex = this.container.style.zIndex + 120;

            // Try to position the div exactly over the JSXGraph board
            node.style.position = "absolute";
            node.style.top = this.container.offsetTop + "px";
            node.style.left = this.container.offsetLeft + "px";
        }

        if (!isDebug) {
            // Create canvas element and add it to the DOM
            // It will be removed after the image has been stored.
            canvas = doc.createElement("canvas");
            id = Math.random().toString(36).slice(2, 7);
            canvas.setAttribute("id", id);
            canvas.setAttribute("width", w);
            canvas.setAttribute("height", h);
            canvas.style.width = w + "px";
            canvas.style.height = w + "px";
            canvas.style.display = "none";

            this.assertNonNullish(parent, "Expected a node")
            this.assertNonNullish(parent, "Expected a node")
            parent.appendChild(canvas);
        } else {
            // Debug: use canvas element 'jxgbox_canvas' from jsxdev/dump.html
            id = "jxgbox_canvas";
            canvas = doc.getElementById(id);
        }

        if (newImg) {
            // Create close button
            button = doc.createElement("span");
            buttonText = doc.createTextNode("\u2716");
            button.style.cssText = bas.cssButton;
            button.appendChild(buttonText);
            button.onclick = function () {
                node.parentNode.removeChild(node);
            };

            // Add all nodes
            node.appendChild(img);
            node.appendChild(button);

            this.assertNonNullish(this.container, "Expected a container")
            this.assertNonNullish(parent, "Expected a node")

            parent.insertBefore(node, this.container.nextSibling);
        }

        // Hide navigation bar in board
        navbar = doc.getElementById(this.uniqName('navigationbar'));
        if (Type.exists(navbar)) {
            navbarDisplay = navbar.style.display;
            navbar.style.display = "none";
            insert = this.removeToInsertLater(navbar);
        }

        _copyCanvasToImg = function () {
            // Show image in img tag
            img.src = canvas.toDataURL("image/png");

            // Remove canvas node
            if (!isDebug && parent !== null) {
                parent.removeChild(canvas);
            }
        };

        // Create screenshot in image element
        // if ("Promise" in window) {

        this.dumpToCanvas(id, w, h, ignoreTexts).then(_copyCanvasToImg);

        // } else {
        //     // IE
        //     this.dumpToCanvas(id, w, h, ignoreTexts);
        //     window.setTimeout(_copyCanvasToImg, 200);
        // }

        // Reinsert navigation bar in board
        if (Type.exists(navbar)) {
            navbar.style.display = navbarDisplay;
            insert();
        }

        return this;

    }

    /** proxy for appendChild, enables debugging and mocks */
    jsxAppendChild(parent: Node, child: Node) {
        // console.warn('appendChild',parent,child)
        parent.appendChild(child)
    }

}