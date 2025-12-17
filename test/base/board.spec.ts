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


describe('check a few isSomething() methods from Type', () => {
    it('checks', () => {
        document.body.innerHTML =
            `<!DOCTYPE html><html lang="en"><head></head><body><div id="box" class="jxgbox" style="width:500px; aspect-ratio: 1/1;"></div></body></html>`

        let b = new Board('box')
        expect(Type.isId(b, 'foo')).toBe(false)

        let p = createPoint(b, [0, 0])
        expect(Type.isId(b, p.id)).toBe(true)

        // adding a point also adds a label so we should see its id too
        expect(p.label).toBeTruthy()    // should not be null
        if (p.label)    //
            expect(Type.isId(b, p.label.id)).toBe(true)

        expect(Type.isPoint(b)).toBe(false)
        expect(Type.isPoint(p)).toBe(true)
    });
});
