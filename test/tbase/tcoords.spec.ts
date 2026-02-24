import { TElement, Tinterface, TPosition } from "../../src/tbase/tinterface.js"
import { TCoords } from "../../src/tbase/tcoords.js"
import { COORDS_BY_USER } from "../../src/index.js";
import { Board } from "../../src/base/board.js"


////////////////// prototype test
describe('env type suite description', () => {
    it('test description', () => {
        let a = 0
        expect(a).toBe(0)
    });
});


describe('conversions between usrCoords and scrCoords', () => {
    let board = { origin: { scrCoords: [100, 200, 0] }, unitX: 8, unitY: 5 } as Board   // mockup of board object

    it('converts', () => {
        expect(board.origin.scrCoords).toEqual([100, 200, 0])  // check our board is working

        // simple test at usrCoords [0,0]
        let c = new TCoords(COORDS_BY_USER, [0, 0], board)
        expect(c.usrCoords).toEqual([0, 0, 0])
        expect(c.scrCoords).toEqual([100, 200, 0])

        // test at usrCoords [1,0]
        c = new TCoords(COORDS_BY_USER, [1, 0], board)
        expect(c.usrCoords).toEqual([1, 0, 0])
        expect(c.scrCoords).toEqual([108, 200, 0])

        c = new TCoords(COORDS_BY_USER, [0, 1], board)
        expect(c.usrCoords).toEqual([0, 1, 0])
        expect(c.scrCoords).toEqual([100, 205, 0])

    })
})