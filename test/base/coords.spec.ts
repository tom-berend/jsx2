import { Board } from "../../src/base/board.js";
import { COORDS_BY } from "../../src/base/constants.js";
import { Coords } from "../../src/base/coords.js";

describe('test the Coords constructor', () => {
    it('basic coordinates', () => {
        document.body.innerHTML =
            `<!DOCTYPE html><html lang="en"><head></head><body><div id="box" class="jxgbox" style="width:500px; aspect-ratio: 1/1;"></div></body></html>`

        let board = new Board('box')

        let coords = new Coords(COORDS_BY.USER, [1, 1], board)
        expect(coords.usrCoords).toEqual([1, 1, 1])
        expect(coords.scrCoords).toEqual([1, NaN, NaN])
        coords = new Coords(COORDS_BY.USER, [2, 3], board)
        expect(coords.usrCoords).toEqual([1, 2, 3])
        expect(coords.scrCoords).toEqual([1, NaN, NaN])
    });
});
