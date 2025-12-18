/*
    Copyright 2008-2025
        Matthias Ehmann,
        Michael Gerhaeuser,
        Carsten Miller,
        Bianca Valentin,
        Andreas Walter,
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


// using enum allows us to treat the class as an enforced type
// but enums generate ugly code


let major = 1,
    minor = 12,
    patch = 2,
    add = '' // 'dev' 'beta'

export const Version = major + '.' + minor + '.' + patch + (add ? '-' + add : '')

/**
 * Constant: the small gray version indicator in the top left corner of every JSXGraph board (if
 * showCopyright is not set to false on board creation).
 *
 * @name JXG2.licenseText
 * @type String
 */
export const LicenseText = "JSXGraph v" + Version + " \u00A9 jsxgraph.org"

    /**
     * JSXGraph logo: base64 data-URL of img/png/screen/jsxgraph-logo_black-square-solid.png
     *
     * @name JXG2.licenseLogo
     * @type String
     */
export const LicenseLogo = 'data:image/png;base64,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'



export enum COORDS_BY {
    /**  Constant: user coordinates relative to the coordinates system defined by the bounding box.  */
    SCREEN = 0x0001,
    /** Constant: screen coordinates in pixel relative to the upper left corner of the div element. */
    USER = 0x0002
}

export enum OBJECT_TYPE {
    // object types
    UNUSED, // don't want zero
    ARC,
    ARROW,
    AXIS,
    AXISPOINT,
    TICKS,
    CIRCLE,
    CONIC,
    CURVE,
    GLIDER,
    IMAGE,
    LINE,
    POINT,
    SLIDER, // unused
    CAS,
    GXTCAS,
    POLYGON,
    SECTOR,
    TEXT,
    ANGLE,
    INTERSECTION,
    TURTLE,
    VECTOR,
    OPROJECT,
    GRID,
    TANGENT,
    HTMLSLIDER,
    CHECKBOX,
    INPUT,
    BUTTON,
    TRANSFORMATION,
    FOREIGNOBJECT,

    VIEW3D,
    POINT3D,
    LINE3D,
    PLANE3D,
    CURVE3D,
    SURFACE3D,

    MEASUREMENT,

    INTERSECTION_LINE3D,
    SPHERE3D,
    CIRCLE3D,
    INTERSECTION_CIRCLE3D,
    TEXT3D,
    FACE3D,
    POLYHEDRON3D,
    POLYGON3D,

    NOTYETASSIGNED
}

// IMPORTANT:
// ----------
// For being able to differentiate between the (sketchometry specific) SPECIAL_OBJECT_TYPEs and
// (core specific) OBJECT_TYPEs, the non-sketchometry types MUST NOT be changed
// to values > 100.

export enum OBJECT_CLASS {
    // object classes
    UNUSED, // don't want zero
    POINT,
    LINE,
    CIRCLE,
    CURVE,
    AREA,
    OTHER,
    TEXT,
    _3D,
}


export enum BOARD_MODE {

    /**
     * Board is in no special mode, objects are highlighted on mouse over and objects may be
     * clicked to start drag&drop.
     * @type Number
     * @constant
     */
    NONE = 0x0000,

    /**
     * Board is in drag mode, objects aren't highlighted on mouse over and the object referenced in
     * {@link JXG2.Board#mouse} is updated on mouse movement.
     * @type Number
     * @constant
     */
    DRAG = 0x0001,

    /**
     * In this mode a mouse move changes the origin's screen coordinates.
     * @type Number
     * @constant
     */
    MOVE_ORIGIN = 0x0002,

    /**
     * Update is made with high quality, e.g. graphs are evaluated at much more points.
     * @type Number
     * @constant
     * @see JXG2.Board#updateQuality
     */
    ZOOM = 0x0011,
}

export enum BOARD_QUALITY {
    /**
     * Update is made with low quality, e.g. graphs are evaluated at a lesser amount of points.
     * @type Number
     * @constant
     * @see JXG2.Board#updateQuality
     */
    LOW = 0x1,
    HIGHLOW = 0x1,

    /**
     * Update is made with high quality, e.g. graphs are evaluated at much more points.
     * @type Number
     * @constant
     * @see JXG2.Board#updateQuality
     */
    HIGH = 0x2,
}



