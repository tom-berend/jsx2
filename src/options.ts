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
    but WITHOUT ANY WARRAN
    TY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License and
    the MIT License along with JSXGraph. If not, see <https://www.gnu.org/licenses/>
    and <https://opensource.org/licenses/MIT/>.
 */

/*global JXG:true define: true*/
/*jslint nomen: true plusplus: true*/

// import { JXG } from "./jxg.js";
// import { Board } from "./base/board.js";
import { JSXMath } from "./math/math.js";
import { Color } from "./utils/color.js";
import { Type } from "./utils/type.js";
import { OBJECT_TYPE, OBJECT_CLASS } from "./base/constants.js";
import {Board} from "./base/board.js";

import {
    BoardOptions, GeometryElementOptions, GridOptions, LayerOptions,
    NavbarOptions, PointOptions, TextOptions, LegendOptions,
    TickOptions, CurveOptions, PrecisionOptions, ConicOptions,
    HatchOptions, AngleOptions, ArcOptions, ArrowOptions,
    AxisOptions, CircumcirclesectorOptions, BisectorOptions,
    BisectorlinesOptions, InputOptions, LineOptions,
    BoxplotOptions, MeasurementOptions, LabelOptions,
    CardinalsplineOptions,
    ChartOptions,
    CircleOptions,
    CircumcircleOptions,
    CircumcirclearcOptions,
    CombOptions,
    ForeignobjectOptions,
    ImageOptions,
    ImplicitcurveOptions,
    IncircleOptions,
    InequalityOptions,
    IntegralOptions,
    IntersectionOptions,
    LocusOptions,
    MetapostsplineOptions,
    MirrorelementOptions,
    NonreflexangleOptions,
    NormalOptions,
    OrthogonalprojectionOptions,
    OtherintersectionOptions,
    ParallelOptions,
    ParallelogramOptions,
    ParallelpointOptions,
    PerpendicularOptions,
    PerpendicularsegmentOptions,
    PolygonOptions,
    PolygonalchainOptions,
    PrescribedangleOptions,
    ReflectionOptions,
    RegularpolygonOptions,
    RiemannsumOptions,
    SectorOptions,
    SemicircleOptions,
    SliderOptions,
    SlopefieldOptions,
    SlopetriangleOptions,
    SmartlabelangleOptions,
    SmartlabelcircleOptions,
    JcOptions,
    SmartlabelpointOptions,
    tangenttoOptions,
    TapemeasureOptions,
    TracecurveOptions,
    VectorfieldOptions,
    HtmlsliderOptions,
    GroupOptions,
    TurtleOptions,
    TangentOptions,
    StepfunctionOptions,
    SmartlabelpolygonOptions,
    SegmentOptions,
    ReflexangleOptions,
    InfoboxOptions,
    GliderOptions,
    FunctiongraphOptions,
    CheckboxOptions,
    ButtonOptions,
} from "./optionInterfaces.js"
import { MeasureMemoryOptions } from "vm";

/**
 * Options Namespace
 * @description These are the default options of the board and of all geometry elements.
 * @namespace
 * @name JXG.Options
 */



// NOTE: a class is a custom object which is slightly different from an object literal.
//   but there is no different for the static values, which ARE object literals.

export class Options {

    static dummyOption = {  // for debugging
        dummy: true,
        jc: { enabled: false }
    }

    static jc: JcOptions = {
        enabled: true,
        compile: true,
    }


    static layer: LayerOptions = {
        numlayers: 20, // only important in SVG
        unused9: 19,
        unused8: 18,
        unused7: 17,
        unused6: 16,
        unused5: 15,
        unused4: 14,
        unused3: 13,
        unused2: 12,
        unused1: 11,
        unused0: 10,
        text: 9,
        point: 9,
        glider: 9,
        arc: 8,
        line: 7,
        circle: 6,
        curve: 5,
        turtle: 5,
        polygon: 3,
        sector: 3,
        angle: 3,
        integral: 3,
        axis: 2,
        ticks: 2,
        grid: 1,
        image: 0,
        trace: 0,
        board: 0,
    }


    // TODO: GEONEXT ??  // static jc: JcOptions = {
    // TODO: GEONEXT ??  //     enabled: true,
    // TODO: GEONEXT ??  //     compile: true,
    // TODO: GEONEXT ??  // }

    /*
     * Options that are used directly within the board class
     */
    static board: BoardOptions = {
        animationDelay: 35,
        axis: false,
        boundingBox: [-5, 5, 5, -5],
        browserPan: false,
        clickDelay: 600,
        dblClickSuppressClick: false,
        defaultAxes: {
            x: {
                name: 'x',
                fixed: true,
                needsRegularUpdate: false,
                ticks: {
                    label: {
                        visible: 'inherit',
                        anchorX: 'middle',
                        anchorY: 'top',
                        fontSize: 12,
                        offset: [0, -3]
                    },
                    tickEndings: [0, 1],
                    majorTickEndings: [1, 1],
                    drawZero: false,
                    visible: 'inherit'
                }
            },
            y: {
                name: 'y',
                fixed: true,
                needsRegularUpdate: false,
                ticks: {
                    label: {
                        visible: 'inherit',
                        anchorX: 'right',
                        anchorY: 'middle',
                        fontSize: 12,
                        offset: [-6, 0]
                    },
                    tickEndings: [1, 0],
                    majorTickEndings: [1, 1],
                    drawZero: false,
                    visible: 'inherit',
                }
            }
        },
        document: null,
        drag: { enabled: true },
        fullscreen: {
            symbol: '<svg height="1em" width="1em" version="1.1" viewBox="10 10 18 18"><path fill="#666" d="m 10,16 2,0 0,-4 4,0 0,-2 L 10,10 l 0,6 0,0 z"></path><path fill="#666" d="m 20,10 0,2 4,0 0,4 2,0 L 26,10 l -6,0 0,0 z"></path><path fill="#666" d="m 24,24 -4,0 0,2 L 26,26 l 0,-6 -2,0 0,4 0,0 z"></path><path fill="#666" d="M 12,20 10,20 10,26 l 6,0 0,-2 -4,0 0,-4 0,0 z"></path></svg>',
            // symbol: '\u26f6', // '\u26f6' (not supported by MacOS),
            scale: 0.85,
            id: null
        },
        ignoreLabels: true,
        intl: { enabled: false, locale: '' },
        keepAspectRatio: false,
        keyboard: { enabled: true, dx: 10, dy: 10, panShift: true, panCtrl: false },
        logging: { enabled: false },
        minimizeReflow: 'none',
        maxBoundingBox: [-10000000, 10000000, 10000000, -10000000],
        // this didn't work.... maxBoundingBox: [Number.MIN_SAFE_INTEGER,Number.MAX_SAFE_INTEGER,Number.MAX_SAFE_INTEGER,Number.MIN_SAFE_INTEGER0], //Infinity,Infinity,Infinity,-Infinity],
        maxFrameRate: 40,
        maxNameLength: 1,
        moveTarget: null,
        offsetX: 0,
        offsetY: 0,
        pan: { enabled: true, needShift: true, needTwoFingers: false, },
        registerEvents: true,
        renderer: 'auto',
        resize: { enabled: true, throttle: 10, },
        screenshot: {
            scale: 1,
            type: 'png',
            symbol: '\u2318', //'\u22b9', //'\u26f6',
            css: 'background-color:#eeeeee; opacity:1.0; border:2px solid black; border-radius:10px; text-align:center',
            cssButton: 'padding: 4px 10px; border: solid #356AA0 1px; border-radius: 5px; position: absolute; right: 2ex; top: 2ex; background-color: rgba(255, 255, 255, 0.3);'
        },
        selection: {
            enabled: false, name: 'selectionPolygon', needShift: false, needCtrl: true, fillColor: '#ffff00',
            // immutable:
            visible: false, withLines: false, vertices: { visible: false, },
        },
        showClearTraces: false,
        showCopyright: true,
        showFullscreen: false,
        showInfobox: true,
        showLogo: false,
        showNavigation: true,
        showReload: false,
        showScreenshot: false,
        showZoom: true,
        takeFirst: false,
        takeSizeFromFile: false,
        theme: 'default',
        title: '',
        zoom: {
            enabled: true,
            factorX: 1.25,
            factorY: 1.25,
            wheel: true,
            needShift: true,
            center: 'auto',
            min: 0.0001,
            max: 10000.0,
            pinch: true,
            pinchHorizontal: true,
            pinchVertical: true,
            pinchSensitivity: 7,
        },
        zoomX: 1,
        zoomY: 1,
    }

    static navbar: NavbarOptions = {
        strokeColor: '#333333',
        fillColor: 'transparent', //#f5f5f5',
        highlightFillColor: '#aaaaaa',
        padding: '2px',
        position: 'absolute',
        fontSize: '14px',
        cursor: 'pointer',
        zIndex: '100',
        right: '5px',
        bottom: '5px'
    }


    static elements: GeometryElementOptions = {

        aria: { enabled: false, label: '', live: 'assertive', },
        cssClass: '',
        highlightCssClass: '',
        dash: 0,
        dashScale: false,
        draft: { draft: false, strokeColor: '#565656', fillColor: '#565656', strokeOpacity: 0.8, fillOpacity: 0.8, strokeWidth: 1, },
        dragToTopOfLayer: false,
        element3D: null,
        fillColor: Color.palette.red,
        fillOpacity: 1,
        fixed: false,
        frozen: false,
        gradient: null,
        gradientAngle: 0,
        gradientCX: 0.5,
        gradientCY: 0.5,
        gradientEndOffset: 1.0,
        gradientFX: 0.5,
        gradientFY: 0.5,
        gradientFR: 0.0,
        gradientR: 0.5,
        gradientSecondColor: '#ffffff',
        gradientSecondOpacity: 1,
        gradientStartOffset: 0.0,
        highlight: true,
        highlightFillColor: 'none',
        highlightFillOpacity: 1,
        highlightStrokeColor: '#c3d9ff',
        highlightStrokeOpacity: 1,
        highlightStrokeWidth: 2,
        isLabel: false,
        layer: 0,
        lineCap: 'butt',
        needsRegularUpdate: true,
        nonnegativeOnly: false,
        precision: 'inherit',
        priv: false,
        rotatable: true,
        scalable: true,
        shadow: { enabled: false, color: [0, 0, 0], opacity: 1, blur: 3, blend: 0.1, offset: [5, 5] },
        snapToGrid: false,
        strokeColor: Color.palette.blue,
        strokeOpacity: 1,
        strokeWidth: 2,
        tabindex: -1,
        trace: false,
        traceAttributes: {},
        transitionDuration: 100,
        transitionProperties: ['fill', 'fill-opacity', 'stroke', 'stroke-opacity', 'stroke-width'],
        visible: true,
        withLabel: false,
        ignoreForLabelAutoposition: false
    }

    static text: TextOptions = {
        fontSize: 12,
        fontUnit: 'px',
        formatNumber: false,
        digits: 2,
        intl: {
            enabled: 'inherit',
            options: {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
            }
        },
        parse: true,
        useCaja: false,
        isLabel: false,
        strokeColor: '#000000',
        highlightStrokeColor: '#000000',
        highlightStrokeOpacity: 0.666666,
        cssDefaultStyle: 'font-family: Arial, Helvetica, Geneva, sans-serif;',
        highlightCssDefaultStyle: 'font-family: Arial, Helvetica, Geneva, sans-serif;',
        cssStyle: '',
        highlightCssStyle: '',
        transitionProperties: ['color', 'opacity'],
        useASCIIMathML: false,
        useMathJax: false,
        useKatex: false,
        katexMacros: {},
        toFraction: false,
        display: 'html',
        anchor: null,
        anchorX: 'left',
        anchorY: 'middle',
        cssClass: 'JXGtext',
        highlightCssClass: 'JXGtext',
        dragArea: 'all',
        withLabel: false,
        rotate: 0,
        visible: true,
        snapSizeX: 1,
        snapSizeY: 1,
        attractors: []
    }


    static point: PointOptions = {
        withLabel: true,
        label: {},
        style: 5,
        face: 'o',
        size: 3,
        sizeUnit: 'screen',
        strokeWidth: 2,
        transitionProperties: ['fill', 'fill-opacity', 'stroke', 'stroke-opacity', 'stroke-width', 'width', 'height', 'rx', 'ry'],
        fillColor: Color.palette.red,
        strokeColor: Color.palette.red,
        highlightFillColor: '#c3d9ff',
        highlightStrokeColor: '#c3d9ff',
        zoom: false,
        showInfobox: 'inherit',
        infoboxDigits: 'auto',
        draft: { draft: false, strokeColor: '#565656', fillColor: '#565656', strokeOpacity: 0.8, fillOpacity: 0.8, strokeWidth: 1, },
        attractors: [],
        attractorUnit: 'user',
        attractorDistance: 0.0,
        snatchDistance: 0.0,
        snapToGrid: false,
        attractToGrid: false,
        snapSizeX: 1,
        snapSizeY: 1,
        snapToPoints: false,
        ignoredSnapToPoints: [],
    }

    static grid: GridOptions = {
        needsRegularUpdate: false,
        hasGrid: false,  // Used in standardoptions
        highlight: false,
        majorStep: 'auto',
        minorElements: 0,
        forceSquare: false,
        includeBoundaries: false,
        size: undefined,
        face: undefined,
        margin: undefined,
        drawZero: undefined,
        polygonVertices: undefined,
        major: { size: 5, margin: 0, drawZero: true, polygonVertices: 6 },
        minor: { visible: 'inherit', size: 3, face: 'point', margin: 0, drawZero: true, polygonVertices: 6 },
        snapToGrid: false,
        strokeColor: '#c0c0c0',
        strokeWidth: 1,
        strokeOpacity: 0.5,
        dash: 0,
        theme: 0,
        themes: [
            {
                // default values
            },

            {   // Theme 1: quadratic grid appearance with distance of major grid elements in x- and y-direction set to the primarily smaller one
                forceSquare: 'min',
                major: {
                    face: 'line'
                }
            },

            {   // Theme 2: lines and points in between
                major: {
                    face: 'line'
                },
                minor: {
                    size: 3,
                    face: 'point'
                },
                minorElements: 'auto'
            },

            {   // Theme 3: lines and thinner lines in between
                major: {
                    face: 'line'
                },
                minor: {
                    face: 'line',
                    strokeOpacity: 0.25
                },
                minorElements: 'auto'
            },

            {   // Theme 4: lines with grid of '+'s plotted in between
                major: {
                    face: 'line'
                },
                minor: {
                    face: '+',
                    size: '95%'
                },
                minorElements: 'auto'
            },

            {   // Theme 5: grid of '+'s and more points in between
                major: {
                    face: '+',
                    size: 10,
                    strokeOpacity: 1
                },
                minor: {
                    face: 'point',
                    size: 3
                },
                minorElements: 'auto'
            },

            {   // Theme 6: grid of circles with points in between
                major: {
                    face: 'circle',
                    size: 8,
                    fillColor: '#c0c0c0'
                },
                minor: {
                    face: 'point',
                    size: 3
                },
                minorElements: 'auto'
            },
        ],
        gridColor: 'black',    // tbtb added, called from useStandardOptions()
        gridOpacity: 1,
        gridDash: false,
        SnapSizeX: .1,
        SnapSizeY: .1,


    }
    static label: LabelOptions = {
        visible: 'inherit',
        strokeColor: '#000000',
        strokeOpacity: 1,
        highlightStrokeOpacity: 0.666666,
        highlightStrokeColor: '#000000',
        fixed: true,
        tabindex: null,
        position: 'urt',
        distance: 1.5,
        offset: [10, 10],
        autoPosition: false,
        autoPositionMinDistance: 12,
        autoPositionMaxDistance: 28,
        autoPositionWhitelist: [],

    }

    /* special legend options */
    static legend: LegendOptions = {
        style: 'vertical',
        labels: ['1', '2', '3', '4', '5', '6', '7', '8'],
        colors: ['#B02B2C', '#3F4C6B', '#C79810', '#D15600', '#FFFF88', '#c3d9ff', '#4096EE', '#008C00'],
        lineLength: 1,
        strokeOpacity: [1],
        rowHeight: 20,
        strokeWidth: 5,
        frozen: false,
    }









    /*
     *  Generic options used by {@link JXG.Ticks}
     */
    static ticks: TickOptions = {
        generateLabelText: null,
        generateLabelValue: null,
        drawLabels: false,
        label: { tabindex: null, layer: 7, highlight: false, autoPosition: false }, // line layer
        beautifulScientificTickLabels: false,
        useUnicodeMinus: true,
        anchor: 'left',
        drawZero: false,
        insertTicks: false,
        minTicksDistance: 10,
        minorHeight: 4,
        majorHeight: 10,
        tickEndings: [1, 1],
        majorTickEndings: [1, 1],
        ignoreInfiniteTickEndings: true,
        majorTicks: 1,
        minorTicks: 4,
        ticksPerLabel: false,
        scale: 1,
        scaleSymbol: '',
        labels: [],
        maxLabelLength: 5,
        precision: 3,
        digits: 3,
        ticksDistance: 1,
        face: '|',
        strokeOpacity: 1,
        strokeWidth: 1,
        strokeColor: '#000000',
        highlightStrokeColor: '#888888',
        fillColor: 'none',
        highlightFillColor: 'none',
        visible: 'inherit',
        includeBoundaries: false,
        type: 'linear',
        intl: {
            enabled: 'inherit',
            options: {}
        },

        // TODO implementation and documentation
        minorTicksInArrow: false,
        majorTicksInArrow: true,
        labelInArrow: true,
        minorTicksInMargin: false,
        majorTicksInMargin: true,
        labelInMargin: true,

        ignoreForLabelAutoposition: true,

        // close the meta tag
        /**#@-*/
    }

    /*
     *  Generic options used by {@link JXG.Hatch}
     */
    static hatch: HatchOptions = {
        drawLabels: false,
        drawZero: true,
        majorHeight: 20,
        anchor: 'middle',
        face: '|',
        strokeWidth: 2,
        strokeColor: Color.palette.blue,
        ticksDistance: 0.2
    }

    /**
     * Precision options, defining how close a pointer device (mouse, finger, pen) has to be
     * to an object such that the object is highlighted or can be dragged.
     * These values are board-wide and can be overwritten for individual elements by
     * changing their precision attribute.
     *
     * The default values are
     * <pre>
     * JXG.Options.precision: {
     *   touch: 30,
     *   touchMax: 100,
     *   mouse: 4,
     *   pen: 4,
     *   epsilon: 0.0001,
     *   hasPoint: 4
     * }
     * </pre>
     *
     * @type Object
     * @name JXG.Options#precision
     * @see JXG.GeometryElement#precision
     */
    static precision: PrecisionOptions = {
        touch: 30,
        touchMax: 100,
        mouse: 4,
        pen: 4,
        epsilon: 0.0001, // Unused
        hasPoint: 4
    }

    /* special angle options */
    static angle: AngleOptions = {
        withLabel: true,
        radius: 'auto',
        type: 'sector',
        orthoType: 'square',
        orthoSensitivity: 1.0,
        fillColor: Color.palette.orange,
        highlightFillColor: Color.palette.orange,
        strokeColor: Color.palette.orange,
        fillOpacity: 0.3,
        highlightFillOpacity: 0.3,
        radiuspoint: { withLabel: false, visible: false, name: '', },
        pointsquare: { withLabel: false, visible: false, name: '', },
        dot: { visible: false, strokeColor: 'none', fillColor: '#000000', size: 2, face: 'o', withLabel: false, name: '', },
        label: { position: 'top', offset: [0, 0], strokeColor: Color.palette.blue, },
        arc: { visible: false, fillColor: 'none', },
    }

    /* special arc options */
    static arc: ArcOptions = {
        selection: 'auto',
        hasInnerPoints: false,
        label: { anchorX: 'auto', anchorY: 'auto', },
        firstArrow: false,
        lastArrow: false,
        fillColor: 'none',
        highlightFillColor: 'none',
        strokeColor: Color.palette.blue,
        highlightStrokeColor: '#c3d9ff',
        useDirection: false,
        center: null,  // was {}
        radiusPoint: null, // was {}
        anglePoint: null, // was {}

        /**#@-*/
    }

    /* special arrow options */
    static arrow: ArrowOptions = {
        firstArrow: false,
        lastArrow: { type: 1, highlightSize: 6, size: 6 },
    }

    /* special arrowparallel options */
    static arrowparallel: ArrowOptions = {
        firstArrow: false,
        lastArrow: { type: 1, highlightSize: 6, size: 6 },
    }


    /* special axis options */
    static axis: AxisOptions = {
        name: '',                            // By default, do not generate names for axes.
        needsRegularUpdate: false,           // Axes only updated after zooming and moving of the origin.
        strokeWidth: 1,
        lastArrow: { type: 1, highlightSize: 8, size: 8 },
        strokeColor: '#666666',
        highlightStrokeWidth: 1,
        highlightStrokeColor: '#888888',
        position: 'static',
        anchor: '',
        anchorDist: '10%',
        ticksAutoPos: true,
        ticksAutoPosThreshold: '5%',
        withTicks: true,
        straightFirst: true,
        straightLast: true,
        margin: -4,
        withLabel: false,
        scalable: false,

        /**
         * Attributes for ticks of the axis.
         *
         * @type Ticks
         * @name Axis#ticks
         */
        ticks: {
            // [4,-15] seems to be a good offset for 12 point fonts
            label: { offset: [4, -15], parse: false, needsRegularUpdate: false, display: 'internal', visible: 'inherit', layer: 9, },
            visible: 'inherit',
            needsRegularUpdate: false,
            strokeWidth: 1,
            strokeColor: '#666666',
            highlightStrokeColor: '#888888',
            drawLabels: true,
            drawZero: false,
            insertTicks: true,
            minTicksDistance: 5,
            minorHeight: 10,          // if <0: full width and height
            majorHeight: -1,          // if <0: full width and height
            tickEndings: [0, 1],
            majorTickEndings: [1, 1],
            minorTicks: 4,
            ticksDistance: 1,         // TODO doc
            strokeOpacity: 0.25
        },
        point1: { needsRegularUpdate: false, visible: false, },    // Default values for point1 if created by line
        point2: { needsRegularUpdate: false, visible: false, },
        tabindex: -1,
        label: { position: 'lft', offset: [10, 10], },
        ignoreForLabelAutoposition: true

    }

    /* special options for angle bisector of 3 points */
    static bisector: BisectorOptions = {
        strokeColor: '#000000', // Bisector line
        point: {               // Bisector point
            visible: false,
            fixed: false,
            withLabel: false,
            name: '',
        }
    }

    /* special options for the 2 bisectors of 2 lines */
    static bisectorlines: BisectorlinesOptions = {
        line1: { strokeColor: '#000000', },
        line2: { strokeColor: '#000000', },
    }


    /* special options for boxplot curves */
    static boxplot: BoxplotOptions = {
        dir: 'vertical',
        smallWidth: 0.5,
        strokeWidth: 2,
        strokeColor: Color.palette.blue,
        fillColor: Color.palette.blue,
        fillOpacity: 0.2,
        highlightStrokeWidth: 2,
        highlightStrokeColor: Color.palette.blue,
        highlightFillColor: Color.palette.blue,
        highlightFillOpacity: 0.1
    }

    /* special button options */
    static button: ButtonOptions = {
        disabled: false,
        display: 'html'
    }

    /* special cardinal spline options */
    static cardinalspline: CardinalsplineOptions = {
        createPoints: true,
        isArrayOfCoordinates: true,
        points: {
            strokeOpacity: 0.05,
            fillOpacity: 0.05,
            highlightStrokeOpacity: 1.0,
            highlightFillOpacity: 1.0,
            withLabel: false,
            name: '',
            fixed: false
        }
    }

    /* special chart options */
    static chart: ChartOptions = {
        chartStyle: 'line',
        colors: ['#B02B2C', '#3F4C6B', '#C79810', '#D15600', '#FFFF88', '#c3d9ff', '#4096EE', '#008C00'],
        highlightcolors: [],
        fillColor: 'none',
        highlightonsector: false,
        highlightbysize: false,

        fillOpacity: 0.6,
        withLines: false,

        label: {}
    }

    /* special html slider options */
    static checkbox: CheckboxOptions = {
        disabled: false,
        checked: false,
        display: 'html'
    }

    /*special circle options */
    static circle: CircleOptions = {
        hasInnerPoints: false,

        fillColor: 'none',
        highlightFillColor: 'none',
        strokeColor: Color.palette.blue,
        highlightStrokeColor: '#c3d9ff',

        center: {
            visible: false,
            withLabel: false,
            fixed: false,
            fillColor: Color.palette.red,
            strokeColor: Color.palette.red,
            highlightFillColor: '#c3d9ff',
            highlightStrokeColor: '#c3d9ff',
            layer: 9,
            name: '',
        },
        point2: {
            fillColor: Color.palette.red,
            strokeColor: Color.palette.red,
            highlightFillColor: '#c3d9ff',
            highlightStrokeColor: '#c3d9ff',
            layer: 9,
            visible: false,
            withLabel: false,
            fixed: false,
            name: '',
        },
        label: { position: 'urt', }

        /**#@-*/
    }

    /* special options for circumcircle of 3 points */
    static circumcircle: CircumcircleOptions = {
        fillColor: 'none',
        highlightFillColor: 'none',
        strokeColor: Color.palette.blue,
        highlightStrokeColor: '#c3d9ff',
        center: {               // center point
            visible: false,
            fixed: false,
            withLabel: false,
            fillColor: Color.palette.red,
            strokeColor: Color.palette.red,
            highlightFillColor: '#c3d9ff',
            highlightStrokeColor: '#c3d9ff',
            name: ''
        }
        /**#@-*/
    }

    static circumcirclearc: CircumcirclearcOptions = {
        fillColor: 'none',
        highlightFillColor: 'none',
        strokeColor: Color.palette.blue,
        highlightStrokeColor: '#c3d9ff',
        useDirection: true,
        center: {
            visible: false,
            withLabel: false,
            fixed: false,
            name: '',
        }
        /**#@-*/
    }

    /* special options for circumcircle sector of 3 points */
    static circumcirclesector: CircumcirclesectorOptions = {
        useDirection: true,
        fillColor: Color.palette.yellow,
        highlightFillColor: Color.palette.yellow,
        fillOpacity: 0.3,
        highlightFillOpacity: 0.3,
        strokeColor: Color.palette.blue,
        highlightStrokeColor: '#c3d9ff',

        /**
         * Attributes for center point.
         *
         * @type Point
         * @name Circle#point
         */
        point: {
            visible: false,
            fixed: false,
            withLabel: false,
            name: '',
        }
        /**#@-*/
    }

    /* special options for comb */
    static comb: CombOptions = {
        frequency: 0.2,
        width: 0.4,
        angle: 1.04719755,    // Math.PI /3   // TS doesn't like Math (namespace) or computations here
        reverse: false,
        point1: { visible: false, withLabel: false, fixed: false, name: '', },
        point2: { visible: false, withLabel: false, fixed: false, name: '', },
        strokeWidth: 1,
        strokeColor: '#0000ff',
        fillColor: 'none'
    }

    /* special conic options */
    static conic: ConicOptions = {
        fillColor: 'none',
        highlightFillColor: 'none',
        strokeColor: Color.palette.blue,
        highlightStrokeColor: '#c3d9ff',
        foci: { fixed: false, visible: false, withLabel: false, name: '', },
        center: { visible: false, withLabel: false, name: '', },
        point: { withLabel: false, name: '', },
        line: { visible: false, },
    }


    /* special curve options */
    static curve: CurveOptions = {
        /**#@+
         * @visprop
         */

        strokeWidth: 1,
        strokeColor: Color.palette.blue,
        fillColor: 'none',
        fixed: true,
        curveType: null,
        doAdvancedPlot: true,
        doAdvancedPlotOld: false,
        firstArrow: false,
        handDrawing: false,
        label: { position: 'lft' },
        lastArrow: false,
        lineCap: 'round',
        numberPointsHigh: 1600,  // Number of points on curves after mouseUp
        numberPointsLow: 400,    // Number of points on curves after mousemove
        plotVersion: 2,
        recursionDepthHigh: 17,
        recursionDepthLow: 15
    }

    /* special foreignObject options */
    static foreignobject: ForeignobjectOptions = {
        fixed: true,
        visible: true,
        needsRegularUpdate: false,
        attractors: [],
        evaluateOnlyOnce: false
    }

    /* special functiongraph options */
    static functiongraph: FunctiongraphOptions = {
        /**#@+
         * @visprop
         */


        /**#@-*/
    }

    /* special glider options */
    static glider: GliderOptions = {
        /**#@+
         * @visprop
         */

        label: {}
        /**#@-*/
    }

    static group: GroupOptions = {
        needsRegularUpdate: true
    }

    /* special html slider options */
    static htmlslider: HtmlsliderOptions = {
        widthRange: 100,
        widthOut: 34,
        step: 0.01,
        frozen: true,
        isLabel: false,
        strokeColor: '#000000',
        display: 'html',
        anchorX: 'left',
        anchorY: 'middle',
        withLabel: false,
    }


    /* special image options */
    static image: ImageOptions = {
        imageString: null,
        fillOpacity: 1.0,
        highlightFillOpacity: 0.6,
        cssClass: 'JXGimage',
        highlightCssClass: 'JXGimageHighlight',
        rotate: 0,
        snapSizeX: 1,
        snapSizeY: 1,
        attractors: []
    }

    /* special implicitcurve options */
    static implicitcurve: ImplicitcurveOptions = {
        margin: 1,
        resolution_outer: 5,
        resolution_inner: 5,
        max_steps: 1024,
        alpha_0: 0.05,
        tol_u0: 0.000001,  // JSXMath.eps,
        tol_newton: 1.0e-7,
        tol_cusp: 0.05,
        tol_progress: 0.0001,
        qdt_box: 0.2,
        kappa_0: 0.2,
        delta_0: 0.05,
        h_initial: 0.1,
        h_critical: 0.001,
        h_max: 0.5,
        loop_dist: 0.09,
        loop_dir: 0.99,
        loop_detection: true
    }

    /* special options for incircle of 3 points */
    static incircle: IncircleOptions = {
        fillColor: 'none',
        highlightFillColor: 'none',
        strokeColor: Color.palette.blue,
        highlightStrokeColor: '#c3d9ff',
        center: {               // center point
            visible: false,
            fixed: false,
            withLabel: false,
            fillColor: Color.palette.red,
            strokeColor: Color.palette.red,
            highlightFillColor: '#c3d9ff',
            highlightStrokeColor: '#c3d9ff',
            name: ''
        }
    }

    static inequality: InequalityOptions = {
        fillColor: Color.palette.red,
        fillOpacity: 0.2,
        strokeColor: 'none',
        inverse: false
    }

    static infobox: InfoboxOptions = {
        distanceX: -20,
        distanceY: 25,
        intl: { enabled: 'inherit', options: {}, },
        fontSize: 12,
        isLabel: false,
        strokeColor: '#bbbbbb',
        display: 'html',             // 'html' or 'internal'
        anchorX: 'left',             //  'left', 'middle', or 'right': horizontal alignment
        //  of the text.
        anchorY: 'middle',           //  'top', 'middle', or 'bottom': vertical alignment
        //  of the text.
        cssClass: 'JXGinfobox',
        rotate: 0,                   // works for non-zero values only in combination
        // with display=='internal'
        visible: true,
        parse: false,
        transitionDuration: 0,
        needsRegularUpdate: false,
        tabindex: null,
        viewport: [0, 0, 0, 0],

        ignoreForLabelAutoposition: true
        /**#@-*/
    }

    /* special options for integral */
    static integral: IntegralOptions = {
        axis: 'x',        // 'x' or 'y'
        withLabel: true,    // Show integral value as text
        fixed: true,
        strokeWidth: 0,
        strokeOpacity: 0,
        fillColor: Color.palette.red,
        fillOpacity: 0.3,
        highlightFillColor: Color.palette.red,
        highlightFillOpacity: 0.2,
        curveLeft: {    // Start point
            visible: true,
            withLabel: false,
            color: Color.palette.red,
            fillOpacity: 0.8,
            layer: 9,
        },
        baseLeft: {    // Start point
            visible: false,
            fixed: false,
            withLabel: false,
            name: '',
        },
        curveRight: {      // End point
            visible: true,
            withLabel: false,
            color: Color.palette.red,
            fillOpacity: 0.8,
            layer: 9,
        },
        baseRight: {      // End point
            visible: false,
            fixed: false,
            withLabel: false,
            name: '',
        },
        label: {
            fontSize: 20,
            digits: 4,
            intl: {
                enabled: false,
                options: {},
            },
        },
    }



    /* special input options */
    static input: InputOptions = {
        disabled: false,
        maxlength: 524288,
        display: 'html',
    }

    /* special intersection point options */
    static intersection: IntersectionOptions = {
        alwaysIntersect: true
    }

    /* special line options */
    static line: LineOptions = {
        firstArrow: false,
        lastArrow: false,
        margin: 0,
        straightFirst: true,
        straightLast: true,
        fillColor: 'none',           // Important for VML on IE
        highlightFillColor: 'none',  // Important for VML on IE
        strokeColor: Color.palette.blue,
        highlightStrokeColor: '#c3d9ff',
        withTicks: false,
        point1: {                  // Default values for point1 if created by line
            fillColor: Color.palette.red,
            strokeColor: Color.palette.red,
            highlightFillColor: '#c3d9ff',
            highlightStrokeColor: '#c3d9ff',
            layer: 9,
            visible: false,
            withLabel: false,
            fixed: false,
            name: '',
        },
        point2: {                  // Default values for point2 if created by line
            fillColor: Color.palette.red,
            strokeColor: Color.palette.red,
            highlightFillColor: '#c3d9ff',
            highlightStrokeColor: '#c3d9ff',
            layer: 9,
            visible: false,
            withLabel: false,
            fixed: false,
            name: '',
        },
        ticks: {
            drawLabels: true,
            label: {
                offset: [4, -15] // This seems to be a good offset for 12 point fonts
            },
            drawZero: false,
            insertTicks: false,
            ticksDistance: 1,
            minTicksDistance: 50,
            minorHeight: 4,          // if <0: full width and height
            majorHeight: -1,         // if <0: full width and height
            minorTicks: 4,
            majorTicks: 1,
            strokeOpacity: 0.3,
            visible: 'inherit'
        },
        label: {
            position: 'llft',
        },
        snapToGrid: false,
        snapSizeX: 1,
        snapSizeY: 1,
        touchFirstPoint: false,
        touchLastPoint: false,
    }

    /* special options for locus curves */
    static locus: LocusOptions = {
        translateToOrigin: false,
        translateTo10: false,
        stretch: false,
        toOrigin: null,
        to10: null,
    }


    /* special measurement options */
    static measurement: MeasurementOptions = {
        baseUnit: '',
        units: {},
        showPrefix: true,
        showSuffix: true,
        prefix: '',
        suffix: '',
        dim: null,
        formatCoords: (self, x, y, z: string) => (parseFloat(z) !== 1) ? 'Infinit coords' : '(' + x + ', ' + y + ')',
        formatDirection: (self, x, y) => '(' + x + ', ' + y + ')'
    }

    /* special metapost spline options */
    static metapostspline: MetapostsplineOptions = {
        createPoints: true,
        isArrayOfCoordinates: true,
        points: {
            strokeOpacity: 0.5,
            fillOpacity: 0.5,
            highlightStrokeOpacity: 1.0,
            highlightFillOpacity: 1.0,
            withLabel: false,
            name: '',
            fixed: false,
        }
    }

    /* special mirrorelement options */
    static mirrorelement: MirrorelementOptions = {
        fixed: true,
        point: {},
        center: {},
        type: 'Euclidean'

    }

    /* special nonreflexangle options */
    static nonreflexangle: NonreflexangleOptions = {
    }

    // /* special options for Msector of 3 points */
    // msector: {
    //     strokeColor: '#000000', // Msector line
    //     point: {               // Msector point
    //         visible: false
    //         fixed: false
    //         withLabel: false
    //         name: ''
    //     }
    // }

    /* special options for normal lines */
    static normal: NormalOptions = {
        strokeColor: '#000000', //  normal line
        point: {
            visible: false,
            fixed: false,
            withLabel: false,
            name: '',
        }
    }

    /* special options for orthogonal projection points */
    static orthogonalprojection: OrthogonalprojectionOptions = {
    }

    /* special otherintersection point options */
    static otherintersection: OtherintersectionOptions = {
        alwaysIntersect: true,
        precision: 0.001
    }

    /* special options for parallel lines */
    static parallel: ParallelOptions = {
        strokeColor: '#000000', // Parallel line
        point: {
            visible: false,
            fixed: false,
            withLabel: false,
            name: '',
        },
        label: { position: 'llft', },
    }

    /* special parallelogram options */
    static parallelogram: ParallelogramOptions = {
        parallelpoint: {
            withLabel: false,
            name: '',
        },
    }

    /* special parallelpoint options */
    static parallelpoint: ParallelpointOptions = {
    }

    /* special perpendicular options */
    static perpendicular: PerpendicularOptions = {
        strokeColor: '#000000', // Perpendicular line
        straightFirst: true,
        straightLast: true,
    }

    /* special perpendicular options */
    static perpendicularsegment: PerpendicularsegmentOptions = {
        strokeColor: '#000000', // Perpendicular segment
        straightFirst: false,
        straightLast: false,
        point: {               // Perpendicular point
            visible: false,
            fixed: true,
            withLabel: false,
            name: '',
        }
    }

    /* special polygon options */
    static polygon: PolygonOptions = {
        hasInnerPoints: false,
        fillColor: Color.palette.yellow,
        highlightFillColor: Color.palette.yellow,
        fillOpacity: 0.3,
        highlightFillOpacity: 0.2,
        withLines: true,
        borders: {
            withLabel: false,
            strokeWidth: 1,
            highlightstrokeWidth: 1,
            // Polygon layer + 1
            layer: 5,
            label: { position: 'top', },
            visible: 'inherit',
        },
        highlightbyStrokeWidth: false,
        vertices: {
            layer: 9,
            withLabel: false,
            name: '',
            strokeColor: Color.palette.red,
            fillColor: Color.palette.red,
            fixed: false,
            visible: 'inherit',
        },
        label: {
            offset: [0, 0]
        }
    }

    /* special polygonal chain options
    */
    static polygonalchain: PolygonalchainOptions = {
        fillColor: 'none',
        highlightFillColor: 'none',
    }

    /* special prescribed angle options
    * Not yet implemented. But angle.setAngle(val) is implemented.

    */
    static prescribedangle: PrescribedangleOptions = {
        anglePoint: {
            size: 2,
            visible: false,
            withLabel: false,
        }
    }

    /* special reflection options */
    static reflection: ReflectionOptions = {
        fixed: true,
        center: {},
        type: 'Euclidean'
    }

    /* special reflexangle options */
    static reflexangle: ReflexangleOptions = {
        /**#@+
         * @visprop
         */

        /**#@-*/
    }

    /* special regular polygon options */
    static regularpolygon: RegularpolygonOptions = {
        hasInnerPoints: false,
        fillColor: Color.palette.yellow,
        highlightFillColor: Color.palette.yellow,
        fillOpacity: 0.3,
        highlightFillOpacity: 0.2,
        withLines: true,
        borders: {
            withLabel: false,
            strokeWidth: 1,
            highlightStrokeWidth: 1,
            // Polygon layer + 1
            layer: 5,
            label: {
                position: 'top',
            }
        },
        vertices: {
            layer: 9,
            withLabel: true,
            strokeColor: Color.palette.red,
            fillColor: Color.palette.red,
            fixed: false,
        },
        label: {
            offset: [0, 0]
        }
    }

    /* special options for riemann sums */
    static riemannsum: RiemannsumOptions = {
        /**#@+
         * @visprop
         */

        withLabel: false,
        fillOpacity: 0.3,
        fillColor: Color.palette.yellow

        /**#@-*/
    }

    /* special sector options */
    static sector: SectorOptions = {
        fillColor: Color.palette.yellow,
        highlightFillColor: Color.palette.yellow,
        fillOpacity: 0.3,
        highlightFillOpacity: 0.3,
        highlightOnSector: false,
        highlightstrokeWidth: 0,
        useDirection: false,
        selection: 'auto',
        arc: {
            visible: false,
            fillColor: 'none',
            withLabel: false,
            name: '',
            center: { visible: false, withLabel: false, name: '', },
            radiusPoint: { visible: false, withLabel: false, name: '', },
            anglePoint: { visible: false, withLabel: false, name: '', },
        },
        radiusPoint: { visible: false, withLabel: false, },
        center: { visible: false, withLabel: false, },
        anglePoint: { visible: false, withLabel: false, },
        label: {
            offset: [0, 0],
            anchorX: 'auto',
            anchorY: 'auto',
        }
    }

    /* special segment options */
    static segment: SegmentOptions = {
        label: {
            position: 'top'
        }
    }

    static semicircle: SemicircleOptions = {
        center: {
            visible: false,
            withLabel: false,
            fixed: false,
            fillColor: Color.palette.red,
            strokeColor: Color.palette.red,
            highlightFillColor: '#eeeeee',
            highlightStrokeColor: Color.palette.red,
            name: '',
        }
    }

    /* special slider options */
    static slider: SliderOptions = {
        snapWidth: -1,   // -1 = deactivated
        snapValues: [],
        snapValueDistance: 0.0,
        precision: 2,
        digits: 2,
        intl: {
            enabled: 'inherit',
            options: {},
        },
        firstArrow: false,
        lastArrow: false,
        withTicks: true,
        withLabel: true,
        suffixLabel: null,
        unitLabel: null,
        postLabel: null,
        layer: 9,
        showInfobox: false,
        name: '',
        visible: true,
        strokeColor: '#000000',
        highlightStrokeColor: '#888888',
        fillColor: '#ffffff',
        highlightFillColor: 'none',
        size: 6,
        point1: { needsRegularUpdate: false, showInfobox: false, withLabel: false, visible: false, fixed: true, frozen: 'inherit', name: '', },
        point2: { needsRegularUpdate: false, showInfobox: false, withLabel: false, visible: false, fixed: true, frozen: 'inherit', name: '', },
        baseline: {
            needsRegularUpdate: false,
            visible: 'inherit',
            fixed: true,
            scalable: false,
            tabindex: null,
            name: '',
            strokeWidth: 1,
            strokeColor: '#000000',
            highlightStrokeColor: '#888888',
        },

        /**
         * Attributes for the ticks of the base line of the slider.
         *
         * @type Ticks
         * @name Slider#ticks
         */
        ticks: {
            needsRegularUpdate: false,
            fixed: true,

            // Label drawing
            drawLabels: false,
            digits: 2,
            includeBoundaries: true,
            drawZero: true,
            label: {
                offset: [-4, -14],
                display: 'internal',
            },

            minTicksDistance: 30,
            insertTicks: true,
            ticksDistance: 1,     // Not necessary, since insertTicks = true
            minorHeight: 4,       // if <0: full width and height
            majorHeight: 5,        // if <0: full width and height
            minorTicks: 0,
            strokeOpacity: 1,
            strokeWidth: 1,
            tickEndings: [0, 1],
            majortickEndings: [0, 1],
            strokeColor: '#000000',
            visible: 'inherit',
        },
        highline: {
            strokeWidth: 3,
            visible: 'inherit',
            fixed: true,
            tabindex: null,
            name: '',
            strokeColor: '#000000',
            highlightStrokeColor: '#888888',
        },
        label: {
            visible: 'inherit',
            strokeColor: '#000000',
        },
        moveOnUp: true,
    }

    /* special vector field options */
    static slopefield: SlopefieldOptions = {
        strokeWidth: 0.5,
        highlightStrokeWidth: 0.5,
        highlightStrokeColor: Color.palette.blue,
        highlightStrokeOpacity: 0.8,

        /**
         * Set length of the vectors in user coordinates. This in contrast to vector fields, where this attribute just scales the vector.
         * @name scale
         * @memberOf Slopefield.prototype
         * @type {Number|Function}
         * @see Vectorfield.scale
         * @default 1
         */
        scale: 1,
        arrowhead: {
            enabled: false,
            size: 5,
            angle: Math.PI * 0.125,
        }
    }

    /* special options for slope triangle */
    static slopetriangle: SlopetriangleOptions = {
        fillColor: Color.palette.red,
        fillOpacity: 0.4,
        highlightFillColor: Color.palette.red,
        highlightFillOpacity: 0.3,
        borders: {
            lastArrow: {
                type: 1,
                size: 6,
            },
        },
        glider: { fixed: true, visible: false, withLabel: false, },
        baseline: { visible: false, withLabel: false, name: '', },
        basepoint: { visible: false, withLabel: false, name: '', },
        tangent: { visible: false, withLabel: false, name: '', },
        toppoint: { visible: false, withLabel: false, name: '', },
        label: {
            visible: true,
            position: 'first',
        }
    }

    /* special options for smartlabel of angle */
    static smartlabelangle: SmartlabelangleOptions = {
        cssClass: 'smart-label-solid smart-label-angle',
        highlightCssClass: 'smart-label-solid smart-label-angle',
        anchorX: 'left',
        anchorY: 'middle',
        unit: '',
        prefix: '',
        suffix: '',
        measure: 'deg',
        useMathJax: true,
    }

    /* special options for smartlabel of circle */
    static smartlabelcircle: SmartlabelcircleOptions = {
        cssClass: 'smart-label-solid smart-label-circle',
        highlightCssClass: 'smart-label-solid smart-label-circle',
        anchorX: 'middle',
        useMathJax: true,
        unit: '',
        prefix: '',
        suffix: '',
        measure: 'radius'
    }

    /* special options for smartlabel of line */
    static smartlabelline: SmartlabelangleOptions = {
        cssClass: 'smart-label-solid smart-label-line',
        highlightCssClass: 'smart-label-solid smart-label-line',
        anchorX: 'middle',
        useMathJax: true,
        unit: '',
        measure: 'length',
    }

    /* special options for smartlabel of point */
    static smartlabelpoint: SmartlabelpointOptions = {
        cssClass: 'smart-label-solid smart-label-point',
        highlightCssClass: 'smart-label-solid smart-label-point',
        anchorX: 'middle',
        anchorY: 'top',

        useMathJax: true,
        dir: 'row',

        unit: ''

        /**#@-*/
    }

    /* special options for smartlabel of polygon */
    static smartlabelpolygon: SmartlabelpolygonOptions = {
        cssClass: 'smart-label-solid smart-label-polygon',
        highlightCssClass: 'smart-label-solid smart-label-polygon',
        anchorX: 'middle',

        useMathJax: true,

        unit: '',
        measure: 'area',
    }

    /* special options for step functions */
    static stepfunction: StepfunctionOptions = {
        /**#@+
         * @visprop
         */

        /**#@-*/
    }

    /* special tangent options */
    static tangent: TangentOptions = {
    }

    /* special tangent options */
    static tangentto: tangenttoOptions = {
        polar: {
            visible: false,
            strokeWidth: 1,
            dash: 3,
        },
        point: {
            visible: false,
        },

    }

    /* special tape measure options */
    static tapemeasure: TapemeasureOptions = {
        strokeColor: '#000000',
        strokeWidth: 2,
        highlightStrokeColor: '#000000',
        withTicks: true,
        withLabel: true,
        rotate: 0,
        precision: 2,
        digits: 2,

        /**
         * Attributes for first helper point defining the tape measure position.
         *
         * @type Point
         * @name Tapemeasure#point1
         */
        point1: {
            visible: true,
            strokeColor: '#000000',
            fillColor: '#ffffff',
            fillOpacity: 0.0,
            highlightFillOpacity: 0.1,
            size: 6,
            snapToPoints: true,
            attractorUnit: 'screen',
            attractorDistance: 20,
            showInfobox: false,
            withLabel: false,
            name: '',
        },
        point2: {
            visible: true,
            strokeColor: '#000000',
            fillColor: '#ffffff',
            fillOpacity: 0.0,
            highlightFillOpacity: 0.1,
            size: 6,
            snapToPoints: true,
            attractorUnit: 'screen',
            attractorDistance: 20,
            showInfobox: false,
            withLabel: false,
            name: '',
        },
        ticks: {
            drawLabels: false,
            drawZero: true,
            insertTicks: true,
            ticksDistance: 0.1, // Ignored since insertTicks=true
            minorHeight: 8,
            majorHeight: 16,
            minorTicks: 4,
            tickEndings: [0, 1],
            majorTickEndings: [0, 1],
            strokeOpacity: 1,
            strokeWidth: 1,
            strokeColor: '#000000',
            visible: 'inherit',
            label: {
                anchorY: 'top',
                anchorX: 'middle',
                offset: [0, -10],
            },
        },
        label: {
            position: 'top',
        }
    }


    /* special options for trace curves */
    static tracecurve: TracecurveOptions = {
        strokeColor: '#000000',
        fillColor: 'none',
        numberPoints: 100,
    }

    /* special turtle options */
    static turtle: TurtleOptions = {
        strokeWidth: 1,
        fillColor: 'none',
        strokeColor: '#000000',
        arrow: {
            strokeWidth: 2,
            withLabel: false,
            strokeColor: Color.palette.red,
            lastArrow: true,
        }
    }

    /* special vector field options */
    static vectorfield: VectorfieldOptions = {
        strokeWidth: 0.5,
        highlightStrokeWidth: 0.5,
        highlightStrokeColor: Color.palette.blue,
        highlightStrokeOpacity: 0.8,
        scale: 1,
        arrowhead: {
            enabled: true,
            size: 5,
            angle: Math.PI * 0.125
        }
    }

    /**
     * Abbreviations of attributes. Setting the shortcut means setting abbreviated properties
     * to the same value.
     * It is used in {@link JXG.GeometryElement#setAttribute} and in
     * the constructor {@link JXG.GeometryElement}.
     * Attention: In Options.js abbreviations are not allowed.
     * @type Object
     * @name JXG.Options#shortcuts
     *
     */
    static shortcuts = {
        color: ['strokeColor', 'fillColor'],
        opacity: ['strokeOpacity', 'fillOpacity'],
        highlightColor: ['highlightStrokeColor', 'highlightFillColor'],
        highlightOpacity: ['highlightStrokeOpacity', 'highlightFillOpacity'],
        strokeWidth: ['strokeWidth', 'highlightStrokeWidth'],
    }


    /**
     * Holds all possible properties and the according validators for geometry elements.
     * A validator is either a function
     * which takes one parameter and returns true if the value is valid for the property,
     * or it is false if no validator is required.
     */
    static Validator() {
        var i
        let validatePixel = function (v) { return (/^[0-9]+px$/).test(v); }
        let validateDisplay = function (v) { return (v === 'html' || v === 'internal'); }
        let validateColor = function (v) { return Type.isString(v); }       // for now this should do it...
        let validatePointFace = (v) => { return Type.exists(this.normalizePointFace(v)); }
        let validateNumber = function (v) { return Type.isNumber(v, true, false); }
        let validateInteger = function (v) { return (Math.abs(v - Math.round(v)) < JSXMath.eps); }
        let validateNotNegativeInteger = function (v) { return validateInteger(v) && v >= 0; }
        let validatePositiveInteger = function (v) { return validateInteger(v) && v > 0; }
        // validateScreenCoords = function (v) {
        //     return v.length >= 2 && validateInteger(v[0]) && validateInteger(v[1]);
        // }
        let validateRenderer = function (v) { return (v === 'vml' || v === 'svg' || v === 'canvas' || v === 'no'); }
        let validatePositive = function (v) { return v > 0; }
        let validateNotNegative = function (v) { return v >= 0; }

        let v = {}
        let validators = {
            attractorDistance: validateNotNegative,
            color: validateColor,
            // defaultDistance: validateNumber,
            display: validateDisplay,
            doAdvancedPlot: false,
            // draft: false,
            drawLabels: false,
            drawZero: false,
            face: validatePointFace,
            factor: validateNumber,
            fillColor: validateColor,
            fillOpacity: validateNumber,
            firstArrow: false,
            fontSize: validateInteger,
            dash: validateInteger,
            gridX: validateNumber,
            gridY: validateNumber,
            // POI: Do we have to add something here?
            hasGrid: false,
            highlightFillColor: validateColor,
            highlightFillOpacity: validateNumber,
            highlightStrokeColor: validateColor,
            highlightStrokeOpacity: validateNumber,
            insertTicks: false,
            //: validateScreenCoords,
            lastArrow: false,
            layer: validateNotNegativeInteger,
            majorHeight: validateInteger,
            minorHeight: validateInteger,
            minorTicks: validateNotNegative,
            minTicksDistance: validatePositiveInteger,
            numberPointsHigh: validatePositiveInteger,
            numberPointsLow: validatePositiveInteger,
            opacity: validateNumber,
            radius: validateNumber,
            RDPsmoothing: false,
            renderer: validateRenderer,
            right: validatePixel,
            showCopyright: false,
            showInfobox: false,
            showNavigation: false,
            size: validateNotNegative, //validateInteger,
            snapSizeX: validatePositive,
            snapSizeY: validatePositive,
            snapWidth: validateNumber,
            snapToGrid: false,
            snatchDistance: validateNotNegative,
            straightFirst: false,
            straightLast: false,
            stretch: false,
            strokeColor: validateColor,
            strokeOpacity: validateNumber,
            strokeWidth: validateNotNegative, //validateInteger,
            takeFirst: false,
            takeSizeFromFile: false,
            to10: false,
            toOrigin: false,
            translateTo10: false,
            translateToOrigin: false,
            useASCIIMathML: false,
            useDirection: false,
            useMathJax: false,
            withLabel: false,
            withTicks: false,
            zoom: false,
        };

        // this seems like a redundant step but it makes sure that
        // all properties in the validator object have lower case names
        // and the validator object is easier to read.
        for (i in validators) {
            if (validators.hasOwnProperty(i)) {
                v[i.toLowerCase()] = validators[i];
            }
        }

        return v;
    }

    /**
     * All point faces can be defined with more than one name, e.g. a cross faced point can be given
     * by face equal to 'cross' or equal to 'x'. This method maps all possible values to fixed ones to
     * simplify if- and switch-clauses regarding point faces. The translation table is as follows:
     * <table>
     * <tr><th>Input</th><th>Output</th></tr>
     * <tr><td>cross</td><td>x</td></tr>
     * <tr><td>circle</td><td>o</td></tr>
     * <tr><td>square, []</td><td>[]</td></tr>
     * <tr><td>plus</td><td>+</td></tr>
     * <tr><td>minus</td><td>-</td></tr>
     * <tr><td>divide</td><td>|</td></tr>
     * <tr><td>diamond</td><td>&lt;&gt;</td></tr>
     * <tr><td>triangleup</td><td>^, a, A</td></tr>
     * <tr><td>triangledown</td><td>v</td></tr>
     * <tr><td>triangleleft</td><td>&lt;</td></tr>
     * <tr><td>triangleright</td><td>&gt;</td></tr>
     * </table>
     * @param {String} s A string which should determine a valid point face.
     * @returns {String} Returns a normalized string or undefined if the given string is not a valid
     * point face.
     */
    static normalizePointFace(s) {
        var map = {
            cross: 'x',
            x: 'x',
            circle: 'o',
            o: 'o',
            square: '[]',
            '[]': '[]',
            plus: '+',
            '+': '+',
            divide: '|',
            '|': '|',
            minus: '-',
            '-': '-',
            diamond: '<>',
            '<>': '<>',
            diamond2: '<<>>',
            '<<>>': '<<>>',
            triangleup: '^',
            A: '^',
            a: '^',
            '^': '^',
            triangledown: 'v',
            v: 'v',
            triangleleft: '<',
            '<': '<',
            triangleright: '>',
            '>': '>'
        };

        return map[s];
    };

    /**
     * Apply the options stored in this object to all objects on the given board.
     * @param {JXG.Board} board The board to which objects the options will be applied.
     */

    static useStandardOptions(board: Board) {
        console.warn('in userStandardOptions')
        var el, t, p, copyProps,
            o = this,   // make it easy if we move to individual elements
            boardHadGrid = board.hasGrid;

        board.options.grid.hasGrid = o.grid.hasGrid;
        board.options.grid.gridX = o.grid.gridX;
        board.options.grid.gridY = o.grid.gridY;
        // POI: Do we have to add something here?
        board.options.grid.gridColor = Options.grid.gridColor;
        board.options.grid.gridOpacity = o.grid.gridOpacity;
        board.options.grid.gridDash = o.grid.gridDash;
        board.options.grid.snapToGrid = o.grid.snapToGrid;
        board.options.grid.snapSizeX = o.grid.SnapSizeX;
        board.options.grid.snapSizeY = o.grid.SnapSizeY;
        //    board.takeSizeFromFile = o.takeSizeFromFile;

        copyProps = function (p, o) {
            p.visProp.fillcolor = o.fillColor;
            p.visProp.highlightFillColor = o.highlightFillColor;
            p.visProp.strokecolor = o.strokeColor;
            p.visProp.highlightStrokeColor = o.highlightStrokeColor;
        };

        for (el in board.objects) {
            if (board.objects.hasOwnProperty(el)) {
                p = board.objects[el];
                if (p.elementClass === OBJECT_CLASS.POINT) {
                    copyProps(p, o.point);
                } else if (p.elementClass === OBJECT_CLASS.LINE) {
                    copyProps(p, o.line);

                    for (t = 0; t < p.ticks.length; t++) {
                        p.ticks[t].majorTicks = o.line.ticks.majorTicks;
                        p.ticks[t].minTicksDistance = o.line.ticks.minTicksDistance;
                        p.ticks[t].visProp.minorheight = o.line.ticks.minorHeight;
                        p.ticks[t].visProp.majorheight = o.line.ticks.majorHeight;
                    }
                } else if (p.elementClass === OBJECT_CLASS.CIRCLE) {
                    copyProps(p, o.circle);
                } else if (p.type === OBJECT_TYPE.ANGLE) {
                    copyProps(p, o.angle);
                } else if (p.type === OBJECT_TYPE.ARC) {
                    copyProps(p, o.arc);
                } else if (p.type === OBJECT_TYPE.POLYGON) {
                    copyProps(p, o.polygon);
                } else if (p.type === OBJECT_TYPE.CONIC) {
                    copyProps(p, o.conic);
                } else if (p.type === OBJECT_TYPE.CURVE) {
                    copyProps(p, o.curve);
                } else if (p.type === OBJECT_TYPE.SECTOR) {
                    p.arc.visProp.fillcolor = o.sector.fillColor;
                    p.arc.visProp.highlightFillColor = o.sector.highlightFillColor;
                    p.arc.visProp.fillopacity = o.sector.fillOpacity;
                    p.arc.visProp.highlightFillOpacity = o.sector.highlightFillOpacity;
                }
            }
        }

        board.fullUpdate();
        if (boardHadGrid && !board.hasGrid) {
            board.removeGrids();
        } else if (!boardHadGrid && board.hasGrid) {
            board.create('grid', []);
        }
    };


    /**
     * Converts all color values to greyscale and calls useStandardOption to put them onto the board.
     * @param {JXG.Board} board The board to which objects the options will be applied.
     * @see JXG.useStandardOptions
     */
    static useBlackWhiteOptions(board: Board) {
        let o = this // JXG.Options;
        o.point.fillColor = Color.rgb2bw(o.point.fillColor);
        o.point.highlightFillColor = Color.rgb2bw(o.point.highlightFillColor);
        o.point.strokeColor = Color.rgb2bw(o.point.strokeColor);
        o.point.highlightStrokeColor = Color.rgb2bw(o.point.highlightStrokeColor);

        o.line.fillColor = Color.rgb2bw(o.line.fillColor);
        o.line.highlightFillColor = Color.rgb2bw(o.line.highlightFillColor);
        o.line.strokeColor = Color.rgb2bw(o.line.strokeColor);
        o.line.highlightStrokeColor = Color.rgb2bw(o.line.highlightStrokeColor);

        o.circle.fillColor = Color.rgb2bw(o.circle.fillColor);
        o.circle.highlightFillColor = Color.rgb2bw(o.circle.highlightFillColor);
        o.circle.strokeColor = Color.rgb2bw(o.circle.strokeColor);
        o.circle.highlightStrokeColor = Color.rgb2bw(o.circle.highlightStrokeColor);

        o.arc.fillColor = Color.rgb2bw(o.arc.fillColor);
        o.arc.highlightFillColor = Color.rgb2bw(o.arc.highlightFillColor);
        o.arc.strokeColor = Color.rgb2bw(o.arc.strokeColor);
        o.arc.highlightStrokeColor = Color.rgb2bw(o.arc.highlightStrokeColor);

        o.polygon.fillColor = Color.rgb2bw(o.polygon.fillColor);
        o.polygon.highlightFillColor = Color.rgb2bw(o.polygon.highlightFillColor);

        o.sector.fillColor = Color.rgb2bw(o.sector.fillColor);
        o.sector.highlightFillColor = Color.rgb2bw(o.sector.highlightFillColor);

        o.curve.strokeColor = Color.rgb2bw(o.curve.strokeColor);
        o.grid.gridColor = Color.rgb2bw(o.grid.gridColor);

        this.useStandardOptions(board);
    }

}
