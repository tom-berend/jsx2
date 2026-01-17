/* eslint-disable one-var */
import './jxg.js';
import { JXG2 } from './jxg.js';

import { Env } from './utils/env.js';

// import './base/constants.js';
// import './utils/type.js';
// import './utils/xml.js';
// import './utils/event.js';
// import './utils/expect.js';
// import './math/math.js';
// import './math/probfuncs.js';
// import './math/ia.js';
// import './math/extrapolate.js';
// import './math/qdt.js';
// import './math/bqdt.js';
// import './math/numerics.js';
// import './math/nlp.js';
// import './math/plot.js';
// import './math/implicitplot.js';
// import './math/metapost.js';
// import './math/statistics.js';
// import './math/geometry.js';
// import './math/clip.js';
// import './math/poly.js';
// import './math/complex.js';
// import './renderer/abstract.js';
// import './reader/file.jps';
// import './parser/geonext.js';
// import './base/board.js';
// import './options.js';
// import './jsxgraph.js';
// import './base/element.js';
// import './base/coords.js';
// import './base/coordselement.js';
// import './base/point.js';
// import './base/line.js';
// import './base/group.js';
// import './base/circle.js';
// import './element/conic.js';
// import './base/polygon.js';
// import './base/curve.js';
// import './element/arc.js';
// import './element/sector.js';
// import './base/composition.js';
// import './element/composition.js';
// import './element/grid.js';
// import './base/text.js';
// import './base/image.js';
// import './element/slider.js';
// import './element/measure.js';
// import './base/chart.js';
// import './base/transformation.js';
// import './base/turtle.js';
// import './utils/color.js';
// import './base/ticks.js';
// import './utils/zip.js';
// import './utils/base64.js';
// import './utils/uuid.js';
// import './utils/encoding.js';
// import './parser/datasource.js';
// import './parser/jessiecode.js';
// import './parser/prefix.js';
// import './parser/ca.js';
// import './utils/dump.js';
// import './renderer/svg.js';
// import './renderer/vml.js';
// import './renderer/canvas.js';
// import './renderer/no.js';
// import './element/comb.js';
// import './element/slopetriangle.js';
// import './element/checkbox.js';
// import './element/input.js';
// import './element/button.js';
// import './element/vectorfield.js';
// import './element/smartlabel.js';
// import './base/foreignobject.js';
// import './options3d.js';
// import './3d/view3d.js';
// import './3d/element3d.js';
// import './3d/box3d.js';
// import './3d/circle3d.js';
// import './3d/point3d.js';
// import './3d/curve3d.js';
// import './3d/linspace3d.js';
// import './3d/text3d.js';
// import './3d/ticks3d.js';
// import './3d/polygon3d.js';
// import './3d/face3d.js';
// import './3d/polyhedron3d.js';
// import './3d/sphere3d.js';
// import './3d/surface3d.js';
// import './parser/3dmodels.js';
// import './themes/mono_thin.js';

import { COORDS_BY } from './base/constants.js';

// The following exports are used to restore granular objects.
// This is consistent with 1.4.x when a UMD bundle is used with a SystemJS loader.
// Over time, the granular object can be made first-class objects and the JXG2 object
// will only exist in a UMD bundle. This should improve tree-shaking.

// Values
export const COORDS_BY_SCREEN = COORDS_BY.SCREEN;
export const COORDS_BY_USER = COORDS_BY.USER;
export const Dump = JXG2.Dump;
export const Expect = JXG2.Expect;
export const JSXGraph = JXG2.JSXGraph;
export const JSXMath = JXG2.JSXMath;
export const Options = JXG2.Options;
// export const boards = JXG2.boards;
export const elements = JXG2.elements;
export const palette = JXG2.palette;
export const paletteWong = JXG2.paletteWong;

// Classes
export const Board = JXG2.Board;
export const Chart = JXG2.Chart;
export const Circle = JXG2.Circle;
export const Complex = JXG2.Complex;
export const Composition = JXG2.Composition;
export const Coords = JXG2.Coords;
export const CoordsElement = JXG2.CoordsElement;
export const Curve = JXG2.Curve;
export const GeometryElement = JXG2.GeometryElement;
export const Group = JXG2.Group;
export const Image = JXG2.Image;
export const JessieCode = JXG2.JessieCode;
export const Prefix = JXG2.PrefixParser;
export const Line = JXG2.Line;
export const Point = JXG2.Point;
export const Polygon = JXG2.Polygon;
export const Text = JXG2.Text;
export const Ticks = JXG2.Ticks;
export const Transformation = JXG2.Transformation;
export const Turtle = JXG2.Turtle;
export const View3D = JXG2.View3D;

// Functions
// export const LMS2rgb = JXG2.LMS2rgb;
export const addEvent = JXG2.addEvent;
export const autoDigits = JXG2.autoDigits;
// export const autoHighlight = JXG2.autoHighlight;
export const bind = JXG2.bind;
export const capitalize = JXG2.capitalize;
export const clearVisPropOld = JXG2.clearVisPropOld;
export const clone = JXG2.clone;
export const cloneAndCopy = JXG2.cloneAndCopy;
export const cmpArrays = JXG2.cmpArrays;
export const coordsArrayToMatrix = JXG2.coordsArrayToMatrix;
export const copyAttributes = JXG2.copyAttributes;
export const createEvalFunction = JXG2.createEvalFunction;
export const createFunction = JXG2.createFunction;
export const createHTMLSlider = JXG2.createHTMLSlider;
// export const darkenColor = JXG2.darkenColor;
export const debug = JXG2.debug;
export const debugInt = JXG2.debugInt;
export const debugLine = JXG2.debugLine;
export const debugWST = JXG2.debugWST;
// export const deepCopy = Type.deepCopy
export const def = JXG2.def;
export const deprecated = JXG2.deprecated;
export const eliminateDuplicates = JXG2.eliminateDuplicates;
export const escapeHTML = JXG2.escapeHTML;
export const evalSlider = JXG2.evalSlider;
export const evaluate = JXG2.evaluate;
export const filterElements = JXG2.filterElements;
// export const getBoardByContainerId = JXG2.getBoardByContainerId;
export const getCSSTransformMatrix = JXG2.getCSSTransformMatrix;
export const getCSSTransform = JXG2.getCSSTransform;
export const getDimensions = JXG2.getDimensions;
export const getOffset = JXG2.getOffset;
export const getPosition = JXG2.getPosition;
export const getProp = JXG2.getProp;
// export const hex2rgb = JXG2.hex2rgb;
// export const hsv2rgb = JXG2.hsv2rgb;
export const isAndroid = JXG2.isAndroid;
export const isApple = JXG2.isApple;
export const isArray = JXG2.isArray;
export const isDesktop = JXG2.isDesktop;
export const isInArray = JXG2.isInArray;
export const isInObject = JXG2.isInObject;
export const isMetroApp = JXG2.isMetroApp;
export const isMobile = JXG2.isMobile;
export const isMozilla = JXG2.isMozilla;
export const isBoard = JXG2.isBoard;
export const isName = JXG2.isName;
export const isNode = JXG2.isNode;
export const isNumber = JXG2.isNumber;
export const isObject = JXG2.isObject;
export const isPoint = JXG2.isPoint;
export const isPoint3D = JXG2.isPoint3D;
export const isPointType = JXG2.isPointType;
export const isPointType3D = JXG2.isPointType3D;
export const isString = JXG2.isString;
export const isTouchDevice = JXG2.isTouchDevice;
export const isTransformationOrArray = JXG2.isTransformationOrArray;
export const isWebWorker = JXG2.isWebWorker;
export const isWebkitAndroid = JXG2.isWebkitAndroid;
export const isWebkitApple = JXG2.isWebkitApple;
export const keys = JXG2.keys;
// export const lightenColor = JXG2.lightenColor;
export const merge = JXG2.merge;
export const normalizePointFace = JXG2.normalizePointFace;
export const providePoints = JXG2.providePoints;
export const registerElement = JXG2.registerElement;
export const registerReader = JXG2.registerReader;
export const removeAllEvents = JXG2.removeAllEvents;
export const removeElementFromArray = JXG2.removeElementFromArray;
export const removeEvent = JXG2.removeEvent;
// export const rgb2LMS = JXG2.rgb2LMS;
// export const rgb2bw = JXG2.rgb2bw;
// export const rgb2cb = JXG2.rgb2cb;
// export const rgb2css = JXG2.rgb2css;
// export const rgb2hex = JXG2.rgb2hex;
// export const rgb2hsv = JXG2.rgb2hsv;
// export const rgbParser = JXG2.rgbParser;
// export const rgb2rgbo = JXG2.rgba2rgbo;
// export const rgb2rgba = JXG2.rgbo2rgba;
export const sanitizeHTML = JXG2.sanitizeHTML;
export const shortcut = JXG2.shortcut;
export const strBool = JXG2.str2Bool;
export const supportsCanvas = JXG2.supportsCanvas
export const supportsPointerEvents = JXG2.supportsPointerEvents;
export const supportsSVG = JXG2.supportsSVG;
export const supportsVML = JXG2.supportsVML;
export const swap = JXG2.swap;
export const timeChunk = JXG2.timedChunk;
export const toFixed = JXG2.toFixed;
export const toFullscreen = JXG2.toFullscreen;
export const toJSON = JXG2.toJSON;
export const trim = JXG2.trim;
export const trimNumber = JXG2.trimNumber;
export const truncate = JXG2.truncate;
export const unescapeHTML = JXG2.unescapeHTML;
export const uniqueArray = JXG2.uniqueArray;
export const useBlackWhiteOptions = JXG2.useBlackWhiteOptions;
export const useStandardOptions = JXG2.useStandardOptions;
export const warn = JXG2.warn;

// We're in the browser, export JXG2 to the global JXG2 symbol for backwards compatibility
// if (Env.isBrowser) {
    (window as any).JXG2 = JXG2;

    // In node there are two cases:
    // 1) jsxgraph is used without requirejs (e.g. as jsxgraphcore.js)
    // 2) jsxgraph is loaded using requirejs (e.g. the dev version)
    //
    // Nodejs compatibility is handled by webpack
    // OLD: in case 2) module is undefined, the export is set in src/jsxgraphnode.js using
    // the return value of this factory function
    // } else if (Env.isNode() && typeof module === 'object') {
    //     module.exports = JXG2;
// } else if (Env.isWebWorker()) {
    // (self as any).JXG2 = JXG2;
// }

// export default JXG2;
