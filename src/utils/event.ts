const dbug = false;
const dbugColor = `color:pink;background-color:darkblue`;

import { LooseObject } from "../interfaces.js";
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

/*global JXG2: true, define: true*/
/*jslint nomen: true, plusplus: true*/

/**
 * @fileoverview In this file the EventEmitter interface is defined.
 */

import { Type } from "./type.js";

type argVals = string | number | Boolean  // arguments for event handlers

/**
 * Event namespace
 * @namespace
 */

export class Events {
    /**
     * Holds the registered event handlers.
     */
    eventHandlers: LooseObject = {}

    /**
     * Events can be suspended to prevent endless loops.
     */
    suspended: LooseObject = {}

    /** initially this.trigger() */
    public triggerEventHandlers: Function = this.trigger


    constructor() {  /* nothing yet */ }

    /**
     * Triggers all event handlers of this element for a given event.
     * @param {Array} event
     * @param {Array} args The arguments passed onto the event handler
     * @returns Reference to the object.
     */
    trigger(event: string[], args: argVals[]) {
        let h, evt

        // if (event.includes('up'))
        //     console.warn(`%c event: trigger(event: ${JSON.stringify(event)}`, dbugColor, args)

        for (let j = 0; j < event.length; j++) {
            evt = this.eventHandlers[event[j]];

            if (!this.suspended[event[j]]) {
                this.suspended[event[j]] = true;
                if (evt) {

                    console.log(`%c event evt `, dbugColor, evt)
                    console.log(`%c event handler(context: ${JSON.stringify(evt[0].context.id)} `, dbugColor)


                    for (let i = 0; i < evt.length; i++) {
                        h = evt[i];
                        h.handler.apply(h.context, args);
                    }
                }

                this.suspended[event[j]] = false;
            }
        }

        return this;
    }

    /**
     * Register a new event handler. For a list of possible events see documentation
     * of the elements and objects implementing
     * the {@link EventEmitter} interface.
     *
     * As of version 1.5.0, it is only possible to access the element via "this" if the event listener
     * is supplied as regular JavaScript function and not as arrow function.
     *
     * @param {String} event
     * @param {Function} handler
     * @param {Object} [context] The context the handler will be called in, default is the element itself.
     * @returns Reference to the object.
     */
    on(event: string, handler: Function, context: Object = this) {
        if (dbug) console.warn(`%c event: on(event: ${event}`, dbugColor)

        if (!Type.isArray(this.eventHandlers[event])) {
            this.eventHandlers[event] = [];
        }

        context = Type.def(context, this);

        this.eventHandlers[event].push({
            handler: handler,
            context: context
        });

        return this;
    }

    /**
     * Unregister an event handler.
     * @param {String} event
     * @param {Function} [handler]
     * @returns Reference to the object.
     */
    off(event: string, handler: Function): object {
        var i;

        if (dbug) console.warn(`%c event: on(event: ${event}`, dbugColor)

        if (!event || !Type.isArray(this.eventHandlers[event])) {
            return this;
        }

        if (handler) {
            i = Type.indexOf(this.eventHandlers[event], handler, 'handler');
            if (i > -1) {
                this.eventHandlers[event].splice(i, 1);
            }

            if (this.eventHandlers[event].length === 0) {
                delete this.eventHandlers[event];
            }
        } else {
            delete this.eventHandlers[event];
        }

        return this;
    }

    /**
     * @description Implements the functionality from this interface in the given object.
     * All objects getting their event handling
     * capabilities from this method should document it by adding
     * the <tt>on, off, triggerEventHandlers</tt> via the
     * borrows tag as methods to their documentation:
     * <pre>@borrows JXG2.EventEmitter#on as this.on</pre>
     * @param {Object} o
     */
    eventify(o: LooseObject) {  // tbb Board | GeometryEvent
        if (dbug) console.warn(`%c event: eventify ${o.id}`, dbugColor)

        o.eventHandlers = {
            clicks: 0 // Needed to handle dblclicks
        };
        o.on = this.on;
        o.off = this.off;
        o.triggerEventHandlers = this.trigger;
        o.trigger = this.trigger;
        o.suspended = {};
    }
}

export let EventEmitter = new Events()   // TBTB - NO!! this is parent of GeometryElement

