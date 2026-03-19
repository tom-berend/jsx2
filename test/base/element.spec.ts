import "../webgl.mock"    // load mocks for three.js, orbitcontrols, etc

import { GeometryElement } from "../../src/base/element.js";
import { Board } from "../../src/base/board.js";
import { COORDS_BY } from "../../src/base/constants.js";
import { createPoint } from "../../src/base/point.js";
import { Coords } from "../../src/base/coords.js";
import { Options } from "../../src/options.js"
import { Type } from "../../src/utils/type.js"


describe('test evalVisProp', () => {
    it('case, a.b, highlighted, etc', () => {
        document.body.innerHTML =
            `<!DOCTYPE html><html lang="en"><head></head><body><div id="box" class="jxgbox" style="width:500px; aspect-ratio: 1/1;"></div></body></html>`

        let board = new Board('box')
        let p1 = createPoint(board, [0, 0], {
            anchor: null, aria: { enabled: false },
            sTrokecoLOR: 'mystery', oPacity: .5, draft: { strokecolor: 'mystery2' }
        })  // case errors


        expect(p1.evalVisProp('strokecolor')).toEqual('mystery')
        expect(p1.evalVisProp('stRokeColor')).toEqual('mystery')  // case error
        expect(p1.evalVisProp('opacity')).toEqual(.5)

        // nested properties
        expect(p1.evalVisProp('draft.strokecolor')).toEqual('mystery2')

        // throw error if unknown visProp
        let t1 = () => p1.evalVisProp('unknown')     // need to defer execution
        expect(t1).toThrow(`Unknown VisProp 'unknown'`)
        let t2 = () => p1.evalVisProp('draft.unknown')     // need to defer execution
        expect(t2).toThrow(`Unknown VisProp 'draft.unknown'`)

        // visProp 'inherit' looks at descendents
        // create group
        expect(Options.point['showInfobox']).toEqual('inherit')
        expect(p1.evalVisProp('showInfobox')).toEqual(.5)


    });
});
