import { watchElement } from "../jsxgraph.js"
const dbug = (elem) => elem && elem['id'] && elem.id == watchElement
const dbugColor = `color:blue;background-color:#d0d0ff`;

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
/*jslint nomen: true, plusplus: true, newcap:true, unparam: true*/
/*eslint no-unused-vars: "off"*/

/**
 * @fileoverview JSXGraph can use various technologies to render the contents of a construction, e.g.
 * SVG, VML, and HTML5 Canvas. To accomplish this, The rendering and the logic and control mechanisms
 * are completely separated from each other. Every rendering technology has it's own class, called
 * Renderer, e.g. SVGRenderer for SVG, the same for VML and Canvas. The common base for all available
 * renderers is the class AbstractRenderer.
 */

import { AbstractRenderer } from "./abstract.js";
import { Dim, SVGType } from "../interfaces.js"
import { Line } from "../base/line.js"
import { Text } from "../base/text.js"
import { Point } from "../base/point.js"
import { Options } from "../options.js"
import { GeometryElement } from "../base/element.js";
import { Type } from "../utils/type.js"
import { COORDS_BY, OBJECT_TYPE } from "../base/constants.js";
import { Coords } from "../base/coords.js"
import { Board } from "../base/board.js";
import { Geometry } from "../math/geometry.js";
import { JSXMath } from "../math/math.js";
import { Curve } from "../base/curve.js"

import * as THREE from 'three'
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// @ts-ignore
import { SpriteText } from './three-spritetext.js'
import { createEllipse } from "../element/conic.js";
import { elements } from "../index.js";
// import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';

/**
 * This renderer draws using ThreeJS.
 *
 * @class JXG2.ThreeRenderer
 * @augments JXG2.AbstractRenderer
 * @see JXG2.AbstractRenderer
 */




export class ThreeRenderer extends AbstractRenderer {

    /**
     * This is used to easily determine which renderer we are using
     * @example if (board.renderer.type === 'vml') {
     *     // do something
     * }
     */
    type = 'webgl';

    static container: HTMLDivElement | null = null    // may have several JSXBoards in a single container
    public canvasRoot
    public canvasId
    public canvasNamespace
    public context

    public scene
    public renderer
    public camera
    public enableOrbital = true
    public orbitalControls = null

    public svgLayer

    public webcanvas    // canvas for WebGL
    /**
     * The xlink namespace. This is used for images.
     * @see http://www.w3.org/TR/xlink/
     * @default http://www.w3.org/1999/xlink
     */
    xlinkNamespace = "http://www.w3.org/1999/xlink";


    negOffsetPlate = -.2   // plate is extra distance behind zero
    constructor(containerName: string | HTMLDivElement, dim: Dim) {  // width height
        super()

        if (this.container === null)     // static but may be null
            if (typeof containerName == 'string') {
                this.container = document.getElementById(containerName) as HTMLDivElement
                if (this.container) {
                    this.container = this.container;
                } else {
                    throw new Error(`Could not find HTML container element '${this.container}`)
                }
            } else {
                this.container = containerName
            }

        this.container.style.overflow = 'hidden';
        if (this.container.style.position === "") {
            this.container.style.position = 'relative';
        }



        this.canvas = this.container.ownerDocument.createElementNS(this.svgNamespace, "svg");
        this.canvas.id = `svg_canvas`;
        (this.canvas as SVGSVGElement).style.overflow = "hidden";
        (this.canvas as SVGSVGElement).style.display = "block";
        (this.canvas as SVGSVGElement).style.position = "absolute";
        (this.canvas as SVGSVGElement).style.left = "0px";
        (this.canvas as SVGSVGElement).style.top = "0px";
        this.resize(dim.width, dim.height);
        this.jsxAppendChild(this.container, this.canvas) // this.container.appendChild(this.svgRoot);

        this.svgLayer = this.container.ownerDocument.createElementNS(this.svgNamespace, 'g');
        this.canvas.appendChild(this.svgLayer);



        this.webcanvas = this.container.ownerDocument.createElement("canvas") as HTMLCanvasElement
        this.webcanvas.id = 'webgl_canvas'
        this.container.appendChild(this.webcanvas)
        this.webcanvas.width = this.container.clientWidth
        this.webcanvas.height = this.container.clientHeight
        this.webcanvas.style.position = "absolute";
        this.webcanvas.style.left = "0px";
        this.webcanvas.style.top = "0px";



        console.log(this.webcanvas)

        if (!this.renderer) {  // not yet initialized
            this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, canvas: this.webcanvas });
            this.renderer.setSize(this.webcanvas.clientWidth, this.webcanvas.clientHeight)

            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color('lightblue');

            this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            this.camera.position.z = 13;

            // const camera = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 1000);
            // camera.position.z = 10;


            if (this.enableOrbital) {
                this.orbitalControls = new OrbitControls(this.camera, this.webcanvas);
                this.orbitalControls.enableDamping = true;
            }
        }
        ////////////////////

        let groundGeometry = new THREE.BoxGeometry(20, 20, this.negOffsetPlate);
        let groundMaterial = new THREE.MeshBasicMaterial({ color: 'white' });
        groundMaterial.transparent = true
        groundMaterial.opacity = .9


        let ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.receiveShadow = true;
        ground.position.x = 0;
        ground.position.y = 0;
        ground.position.z = - 0.3; // stuff at z=0 will float above this
        this.scene.add(ground)


        let animate = () => {
            if (this.enableOrbital)
                this.orbitalControls.update();

            this.renderer.render(this.scene, this.camera);
            requestAnimationFrame(animate);

        }
        animate()


        return;

    }

    /* ********* Calculate relative sizes *********** */


    // eventually this should account for the size of the board.
    // currently set for a 10x10 board
    calcLineStrokeWidth(n: number) {
        if (n <= 0) return 0;
        return (Math.round(n) * 0.019)
    }

    // eventually this should account for the size of the board.
    // currently set for a 10x10 board
    calcPointStrokeWidth(n: number) {
        if (n < 0) return 0;
        return (((Math.sqrt(Math.round(2 * n) + 4))) * 0.07)  // point of strokewith zero still shows
        // point grows twice as fast because pixel added left and right
    }

    // eventually this should account for the size of the board.
    // currently set for a 10x10 board
    calcTextFontSize(n: number) {
        if (n <= 1) return 0;
        return ((Math.round(n) + 7) * .035)

    }


    /* ********* Button related stuff *********** */

    drawbutton(el: Text) {


    }
    updateButtonStyle(el: Text) {

    }



    /* ********* Point related stuff *********** */

    drawPoint(el: Point) {
        if (dbug(el))
            console.warn(`%c webgl: drawPoint(${el.id})`, dbugColor, el.visProp)

        // really naive
        if (!el.evalVisProp('visible'))
            return;


        let coord = el.Coords(false)

        let color = el.evalVisProp('strokecolor')

        let pointMaterial = new THREE.MeshBasicMaterial({ color: color });
        pointMaterial.transparent = true
        pointMaterial.opacity = 1
        let strokewidth = this.calcPointStrokeWidth(parseInt(el.evalVisProp('strokewidth')))

        let v = new THREE.Mesh(new THREE.SphereGeometry(strokewidth, 8, 8), pointMaterial)

        v.position.set(coord[0], coord[1], 0)

        this.scene.add(v)
        return



        var prim: SVGType
        // Sometimes el is not a real point and lacks the methods of a JXG2.Point instance,
        // in these cases to not use el directly.
        let face = Options.normalizePointFace(el.evalVisProp('face'));

        // Determine how the point looks like
        if (face === "o") {
            prim = "ellipse";
        } else if (face === "[]") {
            prim = "rect";
        } else {
            // cross/x, diamond/<>, triangleup/A/^, triangledown/v, triangleleft/<,
            // triangleright/>, plus/+, |, -
            prim = "path";
        }

        if (dbug(el)) console.log(`%c abstract: drawPoint(el)`, dbugColor)

        // el.rendNode = this.appendChildPrim(
        //     this.createPrim(prim, el.id),
        //     el.evalVisProp('layer')
        // );
        let layer = el.evalVisProp('layer')
        let tempPrim = this.createPrim(prim, el.id)
        el.rendNode = this.appendChildPrim(tempPrim, layer)


        this.appendNodesToElement(el, prim);   // updates el with characteristics of various nodes

        // Adjust visual properties
        this._updateVisual(el, { dash: true, shadow: true }, true);

        // By now we only created the xml nodes and set some styles, in updatePoint
        // the attributes are filled with data.
        this.updatePoint(el);

    }

    updatePoint(el: Point) { console.log(`three: updatePoint not yet implemented`) }

    changePointStyle(el: Point) { console.log(`three: changePointStyle not yet implemented`) }

    /* ********* Line related stuff *********** */

    drawLine(el: Line) {

        this.updateLinePrim(el, el.point1.coords, el.point2.coords, el.board)
    }



    // drawTicks(el) { console.log(`three: drawTicks not yet implemented`) }

    updateTicks(el: GeometryElement) {
        if (dbug(el))
            console.warn(`%c webgl: updateTicks(${el.id})`, dbugColor, el.ticks)

        let visible = el.evalVisProp('visible')
        let strokewidth = this.calcLineStrokeWidth(parseInt(el.evalVisProp('strokewidth')))
        let color = el.evalVisProp('strokecolor')
        let opacity = (el.evalVisProp('opacity') == undefined) ? 1 : el.evalVisProp('opacity');


        let isReal = true;
        let tickStr = '';



        for (let i = 0; i < el.ticks.length; i++) {
            let c = el.ticks[i];
            let x = c[0];
            let y = c[1];

            let len2 = x.length;
            // let str = " M " + x[0] + " " + y[0];    // starting point
            if (!Type.isNumber(x[0])) {
                isReal = false;
            }
            for (let j = 1; isReal && j < len2; ++j) {
                if (Type.isNumber(x[j])) {
                    if (x[j] !== x[0] || y[j] !== y[0]) {

                        // have to convert from scrCoords to usrCoord
                        let start = new Coords(COORDS_BY.SCREEN, [x[0], y[0]], el.board)
                        let end = new Coords(COORDS_BY.SCREEN, [x[j], y[j]], el.board)
                        let y1 = start.usrCoords.slice(1)
                        let y2 = end.usrCoords.slice(1)

                        let path = new THREE.LineCurve3(new THREE.Vector3(y1[0], y1[1], this.negOffsetPlate), new THREE.Vector3(y2[0], y2[1], this.negOffsetPlate))
                        const geometry = new THREE.TubeGeometry(path, 1, strokewidth, 8, false);
                        const material = new THREE.MeshBasicMaterial({ color: color });
                        const mesh = new THREE.Mesh(geometry, material);
                        this.scene.add(mesh);
                        // str += " L " + x[j] + " " + y[j];    // line to
                    }
                } else {
                    isReal = false;
                }
            }
            // if (isReal) {
            //     tickStr += str;
            // }


        }
    }

    /* ********* Curve related stuff *********** */

    /**
     * Draws a {@link JXG2.Curve} on the {@link JXG2.Board}.
     * @param {JXG2.Curve} el Reference to a graph object, that has to be plotted.
     * @see Curve
     * @see JXG2.Curve
     * @see JXG2.AbstractRenderer#updateCurve
     */
    drawCurve(el) {

        this.updateCurve(el);
    }

    /**
     * Updates visual appearance of the renderer element assigned to the given {@link JXG2.Curve}.
     * @param {JXG2.Curve} el Reference to a {@link JXG2.Curve} object, that has to be updated.
     * @see Curve
     * @see JXG2.Curve
     * @see JXG2.AbstractRenderer#drawCurve
     */
    updateCurve(el: Curve) {
        if (dbug(el))
            console.warn(`%cwebgl updateCurve `, dbugColor, el.points, el.points[0].usrCoords, el.points.length)

        let strokewidth = this.calcLineStrokeWidth(parseInt(el.evalVisProp('strokewidth')))
        let color = el.evalVisProp('strokecolor')
        let opacity = (el.evalVisProp('opacity') == undefined) ? 1 : el.evalVisProp('opacity');

        const material = new THREE.MeshBasicMaterial({ color: color, opacity: opacity, transparent: true });

        for (let i = 0; i < el.points.length - 2; i++) {
            let start = el.points[i].usrCoords
            let end = el.points[i + 1].usrCoords

            let path = new THREE.LineCurve3(new THREE.Vector3(start[1], start[2], 0), new THREE.Vector3(end[1], end[2], 0))

            const geometry = new THREE.TubeGeometry(path, 1, strokewidth, 8, false);  // closed must be false
            const mesh = new THREE.Mesh(geometry, material);
            this.scene.add(mesh);
        }

    }

    /* ********* Circle related stuff *********** */

    drawEllipse(el) { console.log(`three: drawEllipse not yet implemented`) }

    updateEllipse(el) { console.log(`three: updateEllipse not yet implemented`) }

    /* ********* Polygon related stuff *********** */

    drawPolygon(el) { console.log(`three: drawPolygon not yet implemented`) }

    updatePolygon(el) { console.log(`three: updatePolygon not yet implemented`) }

    /* ********* Text related stuff *********** */

    displayCopyright(str, fontsize) { }

    drawInternalText(el) { console.log(`three: drawInternalText not yet implemented`) }

    updateInternalText(el) { console.log(`three: updateInternalText not yet implemented`) }

    updateText(el) {


        if (dbug(el))
            console.warn(`%c three: updateText(${el.id}) ${el.htmlStr} at ${JSON.stringify(el.coords.usrCoords)}`, dbugColor)

        let coord = el.Coords(false)
        let content = el.plaintext
        // console.log('default', JSON.stringify(coord), content)

        // if (el.visProp["islabel"] && Type.exists(el.visProp["anchor"])) {
        //     console.log(el)
        //     let anchor = el.visProp['anchor']
        //     console.log('anchor', anchor)
        //     coord = anchor.coords.usrCoords

        //     if (typeof el.content == 'string')
        //         content = el.content

        //     console.log('label', JSON.stringify(coord), content)
        // }


        let fontSize = this.calcTextFontSize(parseInt(el.evalVisProp('fontsize')))
        let fontFace = 'system-ui';


        if (fontSize > 0) {
            el.rendNode = new SpriteText(content, { fontsize: fontSize })
            this.scene.add(el.rendNode)
            el.rendNode.position.set(coord[0], coord[1], .2)
        }
    }




    updateInternalTextStyle(el, strokeColor, strokeOpacity) { }

    /* ********* Image related stuff *********** */

    drawImage(el) { console.log(`three: drawImage not yet implemented`) }

    updateImage(el) { console.log(`three: updateImage not yet implemented`) }

    updateImageURL(el) { console.log(`three: updateImageURL not yet implemented`) }

    /* ********* Render primitive objects *********** */

    appendChildPrim(node, level) {

    }

    appendNodesToElement(el, type) { }

    remove(node) { }

    makeArrows(el) { console.log(`three: makeArrows not yet implemented`) }

    updateEllipsePrim(node, x, y, rx, ry) { }

    updateLinePrim(el: GeometryElement, c1: Coords, c2: Coords, board: Board) {
        let node = el.rendNode

        console.log(`%c WEBGL updateLinePrim(${el.id}, [${c1.usrCoords[1]}, ${c1.usrCoords[2]}], [${c2.usrCoords[1]}, ${c2.usrCoords[2]}])`, dbugColor)

        const clipped = Geometry.cohenSutherlandLineClipping(c1, c2)

        if (clipped === null) {        // line is entirely out of viewport
            return
        }

        if (Number.isNaN(c1.usrCoords[1]) || Number.isNaN(c2.usrCoords)) {
            return
        }

        let start = clipped[0].usrCoords
        let end = clipped[1].usrCoords

        if (Math.abs(start[1] - end[1]) < JSXMath.eps && Math.abs(start[2] - end[2]) < JSXMath.eps) {
            // console.log(`%c clipping returns tiny line`, dbugColor, clipped)
            return
        }

        let visible = el.evalVisProp('visible')
        let strokewidth = this.calcLineStrokeWidth(parseInt(el.evalVisProp('strokewidth')))
        let color = el.evalVisProp('strokecolor')
        let opacity = (el.evalVisProp('opacity') == undefined) ? 1 : el.evalVisProp('opacity');

        if (this.isModifiedVisPropCache(el, visible, strokewidth, color, opacity, start, end)) {

            if (Type.exists(el.webGL.mesh)) {
                console.log(el.webGL.mesh)
                this.scene.remove(el.webGL.mesh);
                // el.webGL.lineCurve3.dispose();
                el.webGL.geometry.dispose();
                el.webGL.material.dispose();
                el.webGL.mesh = el.webGL.lineCurve3 = el.webGL.geometry = el.webGL.material = undefined
            }

            el.webGL.lineCurve3 = new THREE.LineCurve3(new THREE.Vector3(start[1], start[2], 0), new THREE.Vector3(end[1], end[2], 0))

            el.webGL.geometry = new THREE.TubeGeometry(el.webGL.lineCurve3, 1, strokewidth, 8, false);  // closed must be false
            el.webGL.material = new THREE.MeshBasicMaterial({ color: color, opacity: opacity, transparent: true });
            el.webGL.mesh = new THREE.Mesh(el.webGL.geometry, el.webGL.material);
            this.scene.add(el.webGL.mesh);
        }
        else {
            console.log(`%c Avoided an unnecessary refreesh`, 'background-color:yellow;')
        }

    }
    clip(value: number, min: number, max: number): number {
        console.assert(min < max)
        if (value < min) value = min
        if (value > max) value = max
        return value
    }

    updatePathPrim(node, pathString, board) { }

    updatePathStringPoint(el, size, type) { }

    updatePathStringPrim(el) { console.log(`three: updatePathStringPrim not yet implemented`) }

    updatePathStringBezierPrim(el) { console.log(`three: updatePathStringBezierPrim not yet implemented`) }

    updatePolygonPrim(node, el) { }

    updateRectPrim(node, x, y, w, h) { }

    setPropertyPrim(node, key, val) { }

    /* ********* Set attributes *********** */

    show(el) { console.log(`three: show not yet implemented`) }

    hide(el) { console.log(`three: hide not yet implemented`) }

    setBuffering(node, type) { }

    setDashStyle(el) { console.log(`three: setDashStyle not yet implemented`) }

    setDraft(el) { console.log(`three: setDraft not yet implemented`) }

    removeDraft(el) { console.log(`three: removeDraft not yet implemented`) }

    setGradient(el) { console.log(`three: setGradient not yet implemented`) }

    updateGradient(el) { console.log(`three: updateGradient not yet implemented`) }

    setObjectTransition(el, duration) { }

    setObjectFillColor(el, color, opacity) { }

    setObjectStrokeColor(el, color, opacity) { }

    setObjectStrokeWidth(el, width) { }

    setShadow(el) { console.log(`three: setShadow not yet implemented`) }


    /* ********* Renderer control *********** */

    suspendRedraw() { }

    unsuspendRedraw() { }

    drawNavigationBar(board) { }

    /**
    * Resizes the rendering element
    * @param {Number} w New width
    * @param {Number} h New height
    */
    resize(w: number, h: number) {
        this.canvas.setAttribute("width", w.toString());
        this.canvas.setAttribute("height", h.toString());
    }


    _setArrowWidth(el) { console.log(`three: _setArrowWidth not yet implemented`) }


    setLineCap(el: GeometryElement) {
        // not implemented.  if useful then  https://discourse.threejs.org/t/end-caps-of-tubegeometry/9655/6
    }


    transformRect(el) { console.log(`three: transformRect not yet implemented`) }

    displayLogo(str: string, fontsize: number) {
        // exactly the same as SVG, displays on outside
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
        this.jsxAppendChild(this.svgLayer, node)

    }



    drawForeignObject(el) { console.log(`three: drawForeignObject not yet implemented`) }
    updateForeignObject(el: any) { }


    createPrim(type: SVGType, id: string): HTMLElement {
        // if (dbug()) console.warn(`%c svg: createPrim(type:${type},id:'${id}'`, dbugColor)
        // same as SVG, used for HTML primitives
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

    display(el: GeometryElement, show: boolean) {
        var node;

        if (el && el.rendNode) {
            el.visPropOld.visible = show;
            el.rendNode.visible = show
        }

    }




    setCssClass(el) { console.log(`three: setCssClass not yet implemented`) }
    setARIA(el) { console.log(`three: setARIA not yet implemented`) }
    setLayer(el: any, level: any) { }
    createTouchpoints(n: any) { }
    showTouchpoint(i: any) { }
    hideTouchpoint(i: any) { }
    updateTouchpoint(i: any, pos: any) { }


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
        return this.container.id + '_' +
            Array.prototype.slice.call(arguments).join('_');
    };


    setTabindex(el: any) { }
    screenshot(board: any, imgId: any, ignoreTexts: any) { }
    dumpToCanvas(canvasId: any, w: any, h: any, _ignoreTexts: any) { }
    dumpToDataURI(_ignoreTexts: any) { }



}


