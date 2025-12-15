// svg renderer
import { SVGRenderer } from "../../src/renderer/svg.js"

document.body.innerHTML =
    `<!DOCTYPE html><html lang="en"><head></head><body><div id="box" class="jxgbox" style="width:500px; aspect-ratio: 1/1;"></div></body></html>`

let svg = new SVGRenderer('box', { width: 100, height: 100 })
let node = svg.createPrim('ellipse', 'box2')

describe('testing points', () => {
    // afterEach(() => {
    //     document.getElementsByTagName('html')[0].innerHTML = '';
    // });

    it('does is create a primitive?', () => {
        expect(node.id).toBe('box_box2')  // unique name
        expect(node.style.position).toBe('absolute')
    });

    it('can we append it to box?', () => {
        svg.appendChildPrim(node, 5)   // level 5
        let node2 = document.getElementById('box_box2')
        expect(node2).toBeDefined()

    })

})
