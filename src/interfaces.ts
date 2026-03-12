// some interfaces
import { GeometryElement } from "./base/element.js"

export type Constructor<T = {}> = new (...args: any[]) => T  // for mixins.  Constructor is something that can be instantiated

export interface ComposeInterface { }

/** cache to speed rendering in webGL */
export interface VisPropCache {
    // these are optional
    point1?: number[]   // just the coordinates
    point2?: number[]

    visible: boolean
    strokewidth: number
    color: string
    opacity: number
    other: LooseObject
}

export enum VisPropModified {
    FALSE = 0b0000,
    VISIBLE = 0b0001,
    POSITION = 0b0010,
    MATERIAL = 0b0100,
    REBUILD = 0b1000
}


export type basicVisProps = {

    strokecolor?: string
    opacity?: number
    fontsize?: number
    strokewidth?: number
    visible?: boolean,
    font?: string
    /** fontweight 100 = thin, 900 = heavy */
    fontweight?: number

    // shadow: false,
    // transitionduration: 0,
    // top: -100000,
    // left: -100000,
    // firstarrow?: boolean,
    // lastarrow?: boolean
    // linecap: "",

    // tabindex: -100000,
    // cssclass ?: string
    // cssdefaultstyle ?: string
    //     cssstyle?: string,
}

export interface Dim { width: number, height: number }
export type SVGType = 'text' | 'line' | 'path' | 'rect' | 'ellipse' | 'polygon' | 'image' | 'foreignObject' | 'stop' | 'marker' | 'linearGradient' | 'radialGradient'

// TODO: this needs to be replace with real types
export interface LooseObject { [key: string]: any }
export interface ElementObject { [key: string]: GeometryElement }

export interface ElementInterface {

}

export interface ShortcutAttributes {
    // these are the 'shortcuts' in options.js.  we don't define them, but TypeScript needs to know they exist

    /** color is a shortcut for  ['strokeColor', 'fillColor']  */
    color?: string | Function
    /** opacity is a shortcut for ['strokeOpacity', 'fillOpacity']  */
    opacity?: number | Function
    /** highlightColor is a shortcut for ['highlightStrokeColor', 'highlightFillColor']  */
    highlightColor?: string | Function
    /** highlightOpacity is a shortcut for ['highlightStrokeOpacity', 'highlightFillOpacity'] */
    highlightOpacity?: number | Function
    /** strokeWidth is a shortcut for ['strokeWidth', 'highlightStrokeWidth'] */
    strokeWidth?: number | Function
    /** the name of the object used in labels */

    name?: string | Function  // CAN'T FIND THIS AT ALL !?!
    /** size of the element in px */
    size?: number | Function  // CAN'T FIND THIS for POINT3D - not on inheritance path
    /** label attributes eg:  {position: 'top', offset: 10}  */
    label?: string | Function
    /** use Katex for math notation */
    useKatex?: Boolean
    // /** why is this not in Line3D ?? */
    // lastArrow?: Boolean | Object
    // /** why is this not in ParallelPoint ?? */
    parallelpoint?: ImportAttributes
}

