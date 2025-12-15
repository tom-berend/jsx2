////////////////// prototype test
describe('board suite description', () => {
    it('test description', () => {
        let a = 0
        expect(a).toBe(0)
    });
});
//
//
import { Board } from "../../src/base/board.js";
import { COORDS_BY } from "../../src/base/constants.js";
import { Coords } from "../../src/base/coords.js";

////////////////// prototype test
describe('board creation', () => {
    it('test description', () => {
        document.body.innerHTML =
        `<!DOCTYPE html><html lang="en"><head></head><body><div id="box" class="jxgbox" style="width:500px; aspect-ratio: 1/1;"></div></body></html>`

        let b = new Board('box')
        expect(b.container).toBe('box')
    });

});

////////////////// prototype test
describe('generate names', () => {
    it('generates A,B,C for points', () => {
        document.body.innerHTML =
        `<!DOCTYPE html><html lang="en"><head></head><body><div id="box" class="jxgbox" style="width:500px; aspect-ratio: 1/1;"></div></body></html>`

        let b = new Board('box')
        let p = b.create('point',[2,3])
        // expect(p.name).toBe('A')

        let ptName = b.generateName(p)
        // expect ptName

    });

});
