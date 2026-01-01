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

/*global JXG2: true, define: true, DOMParser: true, ActiveXObject: true*/
/*jslint nomen: true, plusplus: true*/

import { Type } from "./type.js";

/**
 * Holds browser independent xml parsing routines. Won't work in environments other than browsers.
 * @namespace
 */
export class XML {
    /**
     * Cleans out unneccessary whitespaces in a chunk of xml.
     * @param {Object} el
     */
    static cleanWhitespace(el: DocumentFragment | ChildNode) {
        var cur = el.firstChild;

        while (Type.exists(cur)) {
            if (cur.nodeType === 3 && !/\S/.test(cur.nodeValue)) {
                el.removeChild(cur);
            } else if (cur.nodeType === 1) {
                this.cleanWhitespace(cur);
            }
            cur = cur.nextSibling;
        }
    }

    /**
     * Converts a given string into a XML tree.
     * @param {String} str
     * @returns {Object} The xml tree represented by the root node.
     */
    static parse(str: string) {
        var parser: DOMParser, tree

        // DOMParser is a function in all browsers, except older IE and Safari.
        parser = new DOMParser();
        tree = parser.parseFromString(str, "text/xml");
        XML.cleanWhitespace(tree);

        return tree;
    }
};
