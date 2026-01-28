// some interfaces
import { GeometryElement } from "./base/element.js"


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

