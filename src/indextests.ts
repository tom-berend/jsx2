import { Board } from "./base/board.js";
import { JSXGraph } from "./jsxgraph.js"
import { Type } from "./utils/type.js";

// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


export function runTests(which) {
    console.log('runTests')
    if (which)
        new IndexTests(which)
    else
        new IndexTests()
}


export class IndexTests {
    newBoard: Board
    oldBoard: any

    old = true  // turn on and off boards
    new = true
    webgl = false

    boards = []

    constructor(which?: string) {


        this.initBoard()

        if (which) {
            switch (which) {
                case 'point':
                    this.point(); break;
                case 'text':
                    this.text(); break;
                case 'line':
                    this.line(); break;
                case 'circle':
                    this.circle(); break;
                case 'polygon':
                    this.polygon(); break;
            }
        } else {
            this.polygon()

            // this.point()
            // this.text()
            // this.line()
            // this.circle()
            // this.curve()
            // this.widgets()
            // this.image()
            // this.polygon()
        }
    }


    initBoard() {
        console.log('initBoard')
        let attr = {
            boundingBox: [-10, 10, 10, -10],
            axis: true,
            shownavigation: false,
            showcopyright: false,
            showinfobox: false
        }

        if (this.new)
            this.boards.push(JSXGraph.initBoard('box1', attr));

        if (this.old)
            this.boards.push((window as any).JXG.JSXGraph.initBoard('box2', attr));

        if (this.webgl) {
            attr['renderer'] = 'webgl'
            this.boards.push(JSXGraph.initBoard('box3', attr));
        }
    }

    point() {
        this.boards.map((board) => {
            let a = board.create('point', [1, 3])
            board.create('point', [() => a.X() + 1, () => a.Y() + 1], { name: 'locked to A', strokecolor: 'blue' })

            let wave = () => new Date().getSeconds()
            board.create('point', [-2, 3], { strokecolor: 'green', strokewidth: 6, linecolor: 'red', opacity: ((wave() % 10) / 10), name: () => wave() })

            // Create a point using transformations
            let trans = board.create('transform', [2, 0.5], { type: 'scale' });
            let p3 = board.create('point', [a, trans], { name: 'transform point to A' });
        })
    }
    text() {
        console.log('text')
        this.boards.map((board) => {
            board.create('text', [2, 7, "test"], { strokecolor: 'red' })
        })
    }
    line() {
        this.boards.map((board) => {
            board.create('segment', [[-3, -2], [-4, -2]], { strokecolor: 'green' })

            let p1 = board.create('point', [-3, -3])
            let p2 = board.create('point', [-4, -3])
            board.create('segment', [p1, p2], { strokecolor: 'blue' })

            let p3 = board.create('point', [-3, -4])
            board.create('segment', [p2, p3], { strokecolor: 'green' })

            let d = board.create('point', [1, 3])
            let p5 = board.create('point', [() => d.X() - 1, () => d.Y() + 2], { name: 'locked to A', strokecolor: 'blue' })
            board.create('segment', [d, p5], { strokecolor: 'green' })

            // Create a line using point and coordinates/
            // The second point will be fixed and invisible.
            let e = board.create('point', [4.5, 2.0]);
            let l1 = board.create('line', [e, [1.0, 1.0]]);

            board.create('line', [[-1, -1], [-2, -1]], { strokecolor: 'red' })
            board.create('arrow',[[-.5, -9.5], [-3, -9.5]])

            let pl1 = board.create('point', [9.5, -9.5],{withlabel:false})
            let pl2 = board.create('point', [3, -.5])
            board.create('arrow',[pl1,pl2])

        })
    }
    circle() {
        this.boards.map((board) => {
            board.create('circle', [[-1, -1], [-2, -1]], { strokecolor: 'green' })
        })
    }

    curve() {
        this.boards.map((board) => {
            board.create('curve', [(t) => t - Math.sin(t), (t) => 1 - Math.cos(t), 0, 2 * Math.PI]);
            board.create('functiongraph', [(x) => Math.sin(x * 2), -8, 8])
        })
    }
    widgets() {
        this.boards.map((board) => {
            let a = board.create('checkbox', [-8, 8, 'Checkbox'], {});
            let b = board.create('point', [-8.3, 8.3], { name: 'is checked', fillcolor: () => a.Value() ? 'red' : 'green' })
        })
    }
    image() {
        this.boards.map((board) => {
            board.create('image', ['space-invader.png', [-9, -8], [3, 3]]);
        })
    }
    polygon() {
        this.boards.map((board) => {

            var p1 = board.create('point', [-5, -6]);
            var p2 = board.create('point', [-5, -7]);
            var p3 = board.create('point', [-4, -5]);
            var p4 = board.create('point', [-6, -6]);

            var pol = board.create('polygon', [p1, p2, p3, p4]);

        })
    }
}


