import "../webgl.mock"    // load mocks for three.js, orbitcontrols, etc

import { createText } from "../../src/base/text.js"
import { Board } from "../../src/base/board.js"
import { Geometry } from "../../src/math/geometry.js";
import { JSXMath } from "../../src/math/math.js"


describe('crossproducts of some points and lines', () => {
    it('try the JSXMath crossproduct', () => {
        let a = [2, 3, 4]
        let b = [5, 6, 7]
        expect(JSXMath.crossProduct(a, b)).toEqual([-3, 6, -3])


    })
})

