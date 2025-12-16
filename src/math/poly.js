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

/*global JXG: true, define: true*/
/*jslint nomen: true, plusplus: true*/

/**
 * @fileoverview In this file the namespace Math.Poly is defined, which holds algorithms to create and
 * manipulate polynomials.
 */

import {JXG} from "../jxg.js";
import {JSXMath} from "./math.js";
import {Type} from "../utils/type.js";

/**
 * The Geometry.Poly namespace holds algorithms to create and manipulate polynomials.
 * @name Geometry.Poly
 * @exports JXG.JSXMath.Poly as Geometry.Poly
 * @namespace
 */
JXG.JSXMath.Poly = {};

/**
 * Define a polynomial ring over R.
 * @class
 * @name Geometry.Poly.Ring
 * @param {Array} variables List of indeterminates.
 */
JXG.JSXMath.Poly.Ring = function (variables) {
    /**
     * A list of variables in this polynomial ring.
     * @type Array
     */
    this.vars = variables;
};

JXG.extend(
    JXG.JSXMath.Poly.Ring.prototype,
    /** @lends Geometry.Poly.Ring.prototype */ {
        // nothing yet.
    }
);

/**
 * Define a monomial over the polynomial ring <tt>ring</tt>.
 * @class
 * @name Geometry.Poly.Monomial
 * @param {Geometry.Poly.Ring} ring
 * @param {Number} coefficient
 * @param {Array} exponents An array of exponents, corresponding to ring
 */
JXG.JSXMath.Poly.Monomial = function (ring, coefficient, exponents) {
    var i;

    if (!Type.exists(ring)) {
        throw new Error("JSXGraph error: In Geometry.Poly.monomial missing parameter 'ring'.");
    }

    if (!Type.isArray(exponents)) {
        exponents = [];
    }

    exponents = exponents.slice(0, ring.vars.length);

    for (i = exponents.length; i < ring.vars.length; i++) {
        exponents.push(0);
    }

    /**
     * A polynomial ring.
     * @type Geometry.Poly.Ring
     */
    this.ring = ring;

    /**
     * The monomial's coefficient
     * @type Number
     */
    this.coefficient = coefficient || 0;

    /**
     * Exponent vector, the order depends on the order of the variables
     * in the ring definition.
     * @type Array
     */
    this.exponents = Type.deepCopy(exponents);
};

JXG.extend(
    JXG.JSXMath.Poly.Monomial.prototype,
    /** @lends Geometry.Poly.Monomial.prototype */ {
        /**
         * Creates a deep copy of the monomial.
         *
         * @returns {Geometry.Poly.Monomial}
         *
         * @memberof Geometry.Poly.Monomial
         */
        copy: function () {
            return new JXG.JSXMath.Poly.Monomial(this.ring, this.coefficient, this.exponents);
        },

        /**
         * Print the monomial.
         * @returns {String} String representation of the monomial

         * @memberof Geometry.Poly.Monomial
         */
        print: function () {
            var s = [],
                i;

            for (i = 0; i < this.ring.vars.length; i++) {
                s.push(this.ring.vars[i] + "^" + this.exponents[i]);
            }

            return this.coefficient + "*" + s.join("*");
        }
    }
);

/**
 * A polynomial is a sum of monomials.
 * @class
 * @name Geometry.Poly.Polynomial
 * @param {Geometry.Poly.Ring} ring A polynomial ring.
 * @param {String} str TODO String representation of the polynomial, will be parsed.
 */
JXG.JSXMath.Poly.Polynomial = function (ring, str) {
    var parse = function () {},
        mons;

    if (!Type.exists(ring)) {
        throw new Error(
            "JSXGraph error: In Geometry.Poly.polynomial missing parameter 'ring'."
        );
    }

    if (Type.exists(str) && Type.isString(str)) {
        mons = parse(str);
    } else {
        mons = [];
    }

    /**
     * A polynomial ring.
     * @type Geometry.Poly.Ring
     */
    this.ring = ring;

    /**
     * List of monomials.
     * @type Array
     */
    this.monomials = mons;
};

JXG.extend(
    JXG.JSXMath.Poly.Polynomial.prototype,
    /** @lends Geometry.Poly.Polynomial.prototype */ {
        /**
         * Find a monomial with the given signature, i.e. exponent vector.
         * @param {Array} sig An array of numbers
         * @returns {Number} The index of the first monomial with the given signature, or -1
         * if no monomial could be found.
         * @memberof Geometry.Poly.Polynomial
         */
        findSignature: function (sig) {
            var i;

            for (i = 0; i < this.monomials.length; i++) {
                if (Type.cmpArrays(this.monomials[i].exponents, sig)) {
                    return i;
                }
            }

            return -1;
        },

        /**
         * Adds a monomial to the polynomial. Checks the existing monomials for the added
         * monomial's signature and just adds the coefficient if one is found.
         * @param {Geometry.Poly.Monomial} m
         * @param {Number} factor Either <tt>1</tt> or <tt>-1</tt>.
         * @memberof Geometry.Poly.Polynomial
         */
        addSubMonomial: function (m, factor) {
            var i;

            i = this.findSignature(m.exponents);
            if (i > -1) {
                this.monomials[i].coefficient += factor * m.coefficient;
            } else {
                m.coefficient *= factor;
                this.monomials.push(m);
            }
        },

        /**
         * Adds another polynomial or monomial to this one and merges them by checking for the
         * signature of each new monomial in the existing monomials.
         * @param {Geometry.Poly.Polynomial|Geometry.Poly.Monomial} mp
         * @memberof Geometry.Poly.Polynomial
         */
        add: function (mp) {
            var i;

            if (Type.exists(mp) && mp.ring === this.ring) {
                if (Type.isArray(mp.exponents)) {
                    // mp is a monomial
                    this.addSubMonomial(mp, 1);
                } else {
                    // mp is a polynomial
                    for (i = 0; i < mp.monomials.length; i++) {
                        this.addSubMonomial(mp.monomials[i], 1);
                    }
                }
            } else {
                throw new Error(
                    "JSXGraph error: In Geometry.Poly.polynomial.add either summand is undefined or rings don't match."
                );
            }
        },

        /**
         * Subtracts another polynomial or monomial from this one and merges them by checking for the
         * signature of each new monomial in the existing monomials.
         * @param {Geometry.Poly.Polynomial|Geometry.Poly.Monomial} mp
         * @memberof Geometry.Poly.Polynomial
         */
        sub: function (mp) {
            var i;

            if (Type.exists(mp) && mp.ring === this.ring) {
                if (Type.isArray(mp.exponents)) {
                    // mp is a monomial
                    this.addSubMonomial(mp, -1);
                } else {
                    // mp is a polynomial
                    for (i = 0; i < mp.monomials.length; i++) {
                        this.addSubMonomial(mp.monomials[i], -1);
                    }
                }
            } else {
                throw new Error(
                    "JSXGraph error: In Geometry.Poly.polynomial.sub either summand is undefined or rings don't match."
                );
            }
        },

        /**
         * Creates a deep copy of the polynomial.
         * @returns {Geometry.Poly.Polynomial}
         * @memberof Geometry.Poly.Polynomial
         */
        copy: function () {
            var i, p;

            p = new JXG.JSXMath.Poly.Polynomial(this.ring);

            for (i = 0; i < this.monomials.length; i++) {
                p.monomials.push(this.monomials[i].copy());
            }
            return p;
        },

        /**
         * Prints the polynomial.
         * @returns {String} A string representation of the polynomial.
         * @memberof Geometry.Poly.Polynomial
         */
        print: function () {
            var s = [],
                i;

            for (i = 0; i < this.monomials.length; i++) {
                s.push("(" + this.monomials[i].print() + ")");
            }

            return s.join("+");
        }
    }
);

export default JXG.JSXMath.Poly;
