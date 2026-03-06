jest.mock("../../src/renderer/webgl.js", () => ({
    WebGLRenderer: class WebGlRenderer {
        public render(): void {
            return;
        }
    }
}));


import { createText } from "../../src/base/text.js"
import { Board } from "../../src/base/board.js"
import { Geometry } from "../../src/math/geometry.js";


describe('calcStraight', () => {
    it('returns a line extended to space', () => {

    })
})