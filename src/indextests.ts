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

export let tests = ['axis', 'text', 'point', 'line', 'circle', 'glider', 'polygon', 'curve', 'image', 'stroke', 'arc']


export class IndexTests {
    newBoard: Board
    oldBoard: any

    old = true  // turn on and off boards
    new = true
    webgl = false

    boards = []

    constructor(which?: string) {


        this.initBoard(which)

        if (which) {
            this[which]()
        } else {
            this.axis()
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



    initBoard(which: string) {
        let showAxis = ['axis'].includes(which)

        let attr = {
            boundingBox: [-10, 10, 10, -10],
            axis: showAxis,
            shownavigation: showAxis,
            showcopyright: showAxis,
            showinfobox: showAxis
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

    axis() {
        this.boards.map((board) => {

            // Create an axis providing two coords pairs.
            let p1 = board.create('point', [0, 3]);
            let p2 = board.create('point', [1, 3]);
            let l1 = board.create('line', [p1, p2]);
            let t = board.create('hatch', [l1, 3]);
        })
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
            board.create('arrow', [[-.5, -9.5], [-3, -9.5]])

            let pl1 = board.create('point', [9.5, -9.5], { withlabel: false })
            let pl2 = board.create('point', [3, -.5])
            board.create('arrow', [pl1, pl2])

        })
    }
    glider() {
        this.boards.map((board) => {
            let l1 = board.create('segment', [[-8, 8], [0, 8]])
            let glid1 = board.create('glider', [l1])

            let c1 = board.create('circle', [[-4, 6], [-4, 3]])
            let glid2 = board.create('glider', [c1])

            let c3 = board.create('curve', [(t) => t - Math.sin(t) + 1, (t) => 1 - Math.cos(t), 0, 2 * Math.PI]);
            let glid3 = board.create('glider', [c3])

            // Create a slider with values between 1 and 10, initial position is 5.
            let s = board.create('slider', [[-5, -2], [3, -2], [1, 5, 10]]);
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
            board.create('functiongraph', [(x) => Math.sin(x * 2) - 3, -8, 8])
            let f = (x, y) => 1 / 16 * x ** 2 + y ** 2 - 1;
            let c = board.create('implicitcurve', [f], {
                strokeWidth: 3,
                strokeColor: 'red',
                strokeOpacity: 0.8
            });
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

            let polyBuild = (x, y, attr) => {
                let p1 = board.create('point', [x, y - 1]);
                let p2 = board.create('point', [x, y - 2]);
                let p3 = board.create('point', [x + 1, y]);
                let p4 = board.create('point', [x - 1, y - 1]);

                board.create('polygon', [p1, p2, p3, p4], attr);
            }
            polyBuild(-5, -5, {})
            polyBuild(-5, 0, { borders: { strokecolor: 'black', strokewidth: 3 } })
            polyBuild(-5, 5, { vertices: { strokecolor: 'pink', strokewidth: 3 } })
        })
    }
    stroke() {
        this.boards.map((board) => {
            for (let i = 0; i < 15; i++) {
                board.create('point', [i - 9, 8], { strokewidth: i })
                board.create('text', [i - 9, 7 - (i / 4), 'Aa'], { fontsize: 2 * i })
                board.create('segment', [[i - 9, - 9], [i - 2, 2]], { strokewidth: i });  // mostly diagonal
                board.create('text', [i - 9, - 9.5, i.toString()])
            }
        })


    }
    arc() {
        this.boards.map((board) => {
            // Create an arc out of three free points
            var p1 = board.create('point', [2.0, 2.0]);
            var p2 = board.create('point', [1.0, 0.5]);
            var p3 = board.create('point', [3.5, 1.0]);

            var a = board.create('arc', [p1, p2, p3]);
            board.create('text', [1, 6, function () { return 'arclength: ' + Math.round(a.Value() * 100) / 100 }])
        })

    }

}