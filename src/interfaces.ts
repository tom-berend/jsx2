// some interfaces

export interface Dim { width: number, height: number }
export type SVGType =  'text' | 'line' | 'path' | 'rect' | 'ellipse' | 'polygon' | 'image' | 'foreignObject' | 'stop' | 'marker' | 'linearGradient' | 'radialGradient'

// TODO: this needs to be replace with real types
export interface LooseObject {
    [key: string]: any
}

