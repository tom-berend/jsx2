import { Board } from '../../src/base/board.js';
import { createPoint,Point} from '../../src/base/point.js';
import { Type } from '../../src/utils/type';

describe('check a few isSomething() methods', () => {
    it('checks', () => {
        document.body.innerHTML =
            `<!DOCTYPE html><html lang="en"><head></head><body><div id="box" class="jxgbox" style="width:500px; aspect-ratio: 1/1;"></div></body></html>`

        let b = new Board('box')
        let p = createPoint(b, [0, 0])

        // adding a point also adds a label so we should see its id too
        expect(p.label).toBeTruthy()    // should not be null
        if (p.label)    //
            expect(Type.isId(b, p.label.id)).toBe(true)
    });
});
////////////////// prototype test
describe('some description', () => {
    it('some test', () => {
        let a = true
        expect(a).toEqual(true)
    });
});
