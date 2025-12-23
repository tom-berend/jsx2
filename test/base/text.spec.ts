import { Text } from "../../src/base/text.js"
import { Board } from "../../src/base/board.js"


describe('poorMansTex() simple math rendering', () => {
    it('returns an object with keys in lower case', () => {
        document.body.innerHTML =
            `<!DOCTYPE html><html lang="en"><head></head><body><div id="box" class="jxgbox" style="width:500px; aspect-ratio: 1/1;"></div></body></html>`
        let b = new Board('box')
        let t = new Text(b, [])

        expect(t.poorMansTeX('hello')).toBe('hello')
        expect(t.poorMansTeX('x^2')).toBe('x<sup>2</sup>')   // superscript
        expect(t.poorMansTeX('x_2')).toBe('x<sub>2</sub>')   // subscript
        expect(t.poorMansTeX('x^a+b')).toBe('x<sup>a</sup>+b')   // b is next term
        expect(t.poorMansTeX('x^{a+b}')).toBe('x<sup>a+b</sup>')   // brackets a+b
        expect(t.poorMansTeX('a_{n_i}')).toBe('a<sub>n<sub>i</sub></sub>')  // nested subscripts
    });
})

