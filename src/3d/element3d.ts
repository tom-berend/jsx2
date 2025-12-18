/*
    Copyright 2008-2025
        Matthias Ehmann,
        Carsten Miller,
        Andreas Walter,
        Alfred Wassermann

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
/*global JXG2:true, define: true*/

import {JXG2} from "../jxg.js";
import {Type} from "../utils/type.js";

/**
 * Constructs a new GeometryElement3D object.
 * @class This is the basic class for 3D geometry elements like Point3D and Line3D.
 * @constructor
 * @augments JXG2.GeometryElement
 *
 * @param {string} elType
 */
JXG2.GeometryElement3D = function (view, elType) {
    this.elType = elType;

    /**
     * Pointer to the view3D in which the element is constructed
     * @type JXG2.View3D
     * @private
     */
    this.view = view;

    this.id = this.view.board.setId(this, elType);

    /**
     * Link to the 2D element(s) used to visualize the 3D element
     * in a view. In case, there are several 2D elements, it is an array.
     *
     * @type Array
     * @description JXG2.GeometryElement,Array
     * @private
     *
     * @example
     *   p.element2D;
     */
    this.element2D = null;

    /**
     * If this property exists (and is true) the element is a 3D element.
     *
     * @type Boolean
     * @private
     */
    this.is3D = true;

    this.zIndex = 0.0;

    this.view.objects[this.id] = this;

    if (this.name !== "") {
        this.view.elementsByName[this.name] = this;
    }
};

JXG2.extend(JXG2.GeometryElement3D.prototype, {

    setAttr2D: function(attr3D) {
        var attr2D = attr3D;

        attr2D.name = this.name;
        attr2D.element3d = this;
        attr2D.id = null; // The 2D element's id may not be controlled by the user.

        return attr2D;
    },

    // Documented in element.js
    setAttribute: function(attr) {
        var i, key, value, arg, pair,
        attributes = {};

        // Normalize the user input
        for (i = 0; i < arguments.length; i++) {
            arg = arguments[i];
            if (Type.isString(arg)) {
                // pairRaw is string of the form 'key:value'
                pair = arg.split(":");
                attributes[Type.trim(pair[0])] = Type.trim(pair[1]);
            } else if (!Type.isArray(arg)) {
                // pairRaw consists of objects of the form {key1:value1,key2:value2,...}
                JXG2.extend(attributes, arg);
            } else {
                // pairRaw consists of array [key,value]
                attributes[arg[0]] = arg[1];
            }
        }

        for (i in attributes) {
            if (attributes.hasOwnProperty(i)) {
                key = i.replace(/\s+/g, "").toLowerCase();
                value = attributes[i];
                switch (key) {
                    case "numberpointshigh":
                    case "stepsu":
                    case "stepsv":
                        if (Type.exists(this.visProp[key]) &&
                        (!JXG2.Validator[key] ||
                            (JXG2.Validator[key] && JXG2.Validator[key](value)) ||
                            (JXG2.Validator[key] &&
                                Type.isFunction(value) &&
                                JXG2.Validator[key](value())))
                        ) {
                            value =
                                value.toLowerCase && value.toLowerCase() === "false"
                                    ? false
                                    : value;
                            this._set(key, value);
                        }
                    break;
                    default:
                        if (Type.exists(this.element2D)) {
                            this.element2D.setAttribute(attributes);
                        }
                }
            }
        }
    },

    // Documented in element.js
    getAttribute: function(key) {
        var result;
        key = key.toLowerCase();

        switch (key) {
            case "numberpointshigh":
            case "stepsu":
            case "stepsv":
                result = this.visProp[key];
                break;
            default:
                if (Type.exists(this.element2D)) {
                    result = this.element2D.getAttribute(key);
                }
                break;
        }

        return result;
    },

    // Documented in element.js
    getAttributes: function() {
        var attr = {},
            i, key,
            attr3D = ['numberpointshigh', 'stepsu', 'stepsv'],
            le = attr3D.length;

        if (Type.exists(this.element2D)) {
            attr = Type.merge(this.element2D.getAttributes());
        }

        for (i = 0; i < le; i++) {
            key = attr3D[i];
            if (Type.exists(this.visProp[key])) {
                attr[key] = this.visProp[key];
            }
        }

        return attr;
    },

    // /**
    //  * Add transformations to this element.
    //  * @param {JXG2.GeometryElement} el
    //  * @param {JXG2.Transformation|Array} transform Either one {@link JXG2.Transformation}
    //  * or an array of {@link JXG2.Transformation}s.
    //  * @returns {JXG2.CoordsElement} Reference to itself.
    //  */
    addTransformGeneric: function (el, transform) {
        var i,
            list = Type.isArray(transform) ? transform : [transform],
            len = list.length;

        // There is only one baseElement possible
        if (this.transformations.length === 0) {
            this.baseElement = el;
        }

        for (i = 0; i < len; i++) {
            this.transformations.push(list[i]);
        }

        return this;
    },

    /**
     * Set position of the 2D element. This is a
     * callback function, executed in {@link JXG2.GeometryElement#setPosition}.
     * @param {JXG2.Transform} t transformation
     * @private
     * @see JXG2.GeometryElement#setPosition
     */
    setPosition2D: function(t) {
        /* stub */
    },

    /**
     * Project a 3D point to this element and update point.position.
     * @param {Array} p 3D position of the point (array of length 3)
     * @param {Array} params Changed in place to the new of the point in terms of the elements functions X, Y, Z.
     * For example for a surface, params will contain values (u,v) such that the new 3D position
     * p = [X(u, v), Z(u, v), Z(u, v)].
     * @returns {Array} 3D coordinates of the projected point with homogeneous coordinates of the form [1, x, y, z].
     */
    projectCoords: function(p, params) {
        /* stub */
    },

    // Documented in element.js
    remove: function() {}

});

export default JXG2.GeometryElement3D;
