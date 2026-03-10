import { Board } from "./base/board.js";
import { JSXGraph } from "./jsxgraph.js"
import { Type } from "./utils/type.js";
import { Coords } from "./base/coords.js"

import { createFunctiongraph } from "./base/curve.js";
import { createInequality } from "./element/composition.js";
import { Geometry } from "./math/geometry.js";
import { COORDS_BY } from "./base/constants.js";


export function runTests(which) {
    console.log('runTests')
    if (which)
        new IndexTests(which)
    else
        new IndexTests()
}

export let tests = [
    'axis', 'clip',/*'widgets', 'innerpoints',*/ 'text', 'point', 'line', 'circle', 'glider', 'polygon', 'curve', 'image', 'stroke', 'arc', 'mathml',
    'composition'
]



export class IndexTests {
    newBoard: Board
    oldBoard: any

    new = true   // turn on and off boards
    old = true
    webgl = true

    boards = []

    constructor(which?: string) {

        this.initBoard(which)

        if (which) {
            this[which]()
        } else {
            // this.axis()
            // this.widgets()
            // this.curve()
            this.text()
            // this.point()
            // this.line()
            // this.circle()
            // this.curve()
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
            attr['renderer'] = 'three'
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
    clip() {
        this.boards.map((board, nth) => {

            for (let i = 0; i < Math.PI; i += Math.PI / 32) {


                let line = board.create('line', [[0, 0], [Math.cos(i), Math.sin(i)]]);

                // quick test of line intersections while we are here
                let linez = board.create('line', [[-9, 9], [9, 9]], { color: 'olive' })  // top border
                let isect = Geometry.calculateLineIntersection(line.point1.coords, line.point2.coords, linez.point1.coords, linez.point2.coords,)
                if (nth !== 1 && !Number.isNaN(isect[0]))   // not for old jsxgraph
                    board.create('point', isect)
            }

            for (let i = -Math.PI; i < Math.PI; i += Math.PI / 16) {
                board.create('line', [[0, 20], [20 * Math.cos(i), 20 * Math.sin(i)]], { color: 'red' });
            }

            for (let i = -Math.PI; i < Math.PI; i += Math.PI / 16) {
                board.create('line', [[20, 20], [20 * Math.cos(i), 20 * Math.sin(i)]], { color: 'green' });
            }

        })
    }
    text() {
        this.boards.map((board) => {

            let a = board.create('point', [1, 3])
            board.create('text', [() => a.X(), () => a.Y() + 1, 'follows'])
            board.create('text', [-3, -3, `[${a.X()}, ${a.Y()}]`])

            // Create a button element at position [1,4].
            let p = board.create('point', [0.5, -5.5], { name: 'p1' });

            // Create a button element at position [1,2].
            var button1 = board.create('button', [2, -5, 'Change p1 with JavaScript', function () {
                p.moveTo([p.X(), p.Y() + 0.5], 100);
            }], {});
        })
    }

    point() {
        this.boards.map((board) => {
            let wave = 0

            let a = board.create('point', [1, 3])
            board.create('point', [() => a.X() + 1, () => a.Y() + 1], { name: 'locked to A', strokecolor: 'blue' })

            let b = board.create('point', [-2, 3], { strokecolor: 'green', strokewidth: 6, linecolor: 'red', opacity: () => wave, name: () => wave.toFixed(1) })
            setInterval(() => { (wave > 1) ? wave = 0 : wave += .1; board.update(b) }, 200);

            // Create a point using transformations
            let trans = board.create('transform', [2, 0.5], { type: 'scale' });
            let p3 = board.create('point', [a, trans], { name: 'transform point to A' });
        })
    }
    line() {
        this.boards.map((board) => {

            // evalVisProp straightFirst, straightLast
            // el.board.origin.coords, unitX, unitY
            // el.stdform ??
            // el.board.boundingbox
            // el.getSlope()
            //     projectPointToLine



            let testLine = board.create('line', [[0, -2], [20, 0]], { strokecolor: 'black' })

            let c1 = testLine.point1.coords //new Coords(COORDS_BY.USER,[0,0],board)
            let c2 = testLine.point2.coords //new Coords(COORDS_BY.USER,[1,0],board)
            Geometry.calcStraight(testLine, c1, c2)
            Geometry.calcLineDelimitingPoints(testLine, c1, c2)

            testLine.update()


            // board.create('segment', [[-3, -2], [-4, -2]], { strokecolor: 'green' })

            // let p1 = board.create('point', [-3, -3])
            // let p2 = board.create('point', [-4, -3])
            // board.create('segment', [p1, p2], { strokecolor: 'blue' })

            // let p3 = board.create('point', [-3, -4])
            // board.create('segment', [p2, p3], { strokecolor: 'green' })

            // let d = board.create('point', [1, 3])
            // let p5 = board.create('point', [() => d.X() - 1, () => d.Y() + 2], { name: 'locked to A', strokecolor: 'blue' })
            // board.create('segment', [d, p5], { strokecolor: 'green' })

            // // Create a line using point and coordinates/
            // // The second point will be fixed and invisible.
            // let e = board.create('point', [4.5, 2.0]);
            // let l1 = board.create('line', [e, [1.0, 1.0]]);

            // board.create('line', [[-1, -1], [-2, -1]], { strokecolor: 'red' })
            // board.create('arrow', [[-.5, -9.5], [-3, -9.5]])

            // let pl1 = board.create('point', [9.5, -9.5], { withlabel: false })
            // let pl2 = board.create('point', [3, -.5])
            // board.create('arrow', [pl1, pl2])

        })
    }
    glider() {
        this.boards.map((board) => {
            let l1 = board.create('segment', [[-8, 8], [0, 8]])
            let glid1 = board.create('glider', [l1])

            // let c1 = board.create('circle', [[-4, 6], [-4, 3]])
            // let glid2 = board.create('glider', [c1])

            // let c3 = board.create('curve', [(t) => t - Math.sin(t) + 1, (t) => 1 - Math.cos(t), 0, 2 * Math.PI]);
            // let glid3 = board.create('glider', [c3])

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

            ////// spline
            let p = [];
            p[0] = board.create('point', [-7, 7], { size: 4, face: 'o' });
            p[1] = board.create('point', [-5, 4], { size: 4, face: 'o' });
            p[2] = board.create('point', [-3, 5], { size: 4, face: 'o' });
            p[3] = board.create('point', [-1, 6], { size: 4, face: 'o' });
            board.create('spline', p, { strokeWidth: 3 });

            /////// cardinalSpline

            //Create array of points
            p = [];
            p.push(board.create('point', [4, 3]));
            p.push(board.create('point', [5, 7]));
            p.push(board.create('point', [9, 8]));
            p.push(board.create('point', [6, 6]));
            p.push(board.create('point', [7, 3]));
            // tension
            let tau = board.create('slider', [[2, 2.5], [8, 2.5], [0.001, 0.5, 1]], { name: 'tau' });
            board.create('cardinalspline', [p, function () { return tau.Value(); }], { strokeWidth: 3 });


            // createMetapostSpline
            // createRiemannsum
            // createTracecurve
            // createStepfunction
            // createDerivative

            // createCurveIntersection
            // createCurveUnion
            // createCurveDifference
            // createBoxPlot

        })
    }
    widgets() {
        this.boards.map((board) => {

            // let a = board.create('checkbox', [-8, 8, 'Checkbox'], {});
            // let b = board.create('point', [-8.3, 8.3], { name: () => a.Value() ? 'checked' : 'NOT checked', strokecolor: () => a.Value() ? 'red' : 'green', strokewidth: 10 })

            let button1 = board.create('button', [1, 2, 'Change Y']);


            // let p = board.create('point', [0.5, 0.5], { id: 'p1' });
            // let button1 = board.create('button', [1, 2, 'Change Y', () => p.moveTo([p.X(), p.Y() + 0.5], 100)]);
        })

    }
    innerpoints() {
        this.boards.map((board) => {

            // Only the edges of the polygon can be dragged
            var pg0 = board.create('polygon', [[1, 2], [3, 7], [-3, 1]], { fillColor: 'none' });

            var txt0 = board.create('text', [-5, 4, 'over!'], { fontSize: 16, visible: false });
            pg0.on('over', function () {
                txt0.setAttribute({ visible: true });
            })
            pg0.on('out', function () {
                txt0.setAttribute({ visible: false });
            })

            // With hasInnerPoints, the polygon can be dragged from any internal point
            var pg1 = board.create('polygon', [[1, -2], [3, -7], [-3, -1]], { fillColor: 'none', hasInnerPoints: true });

            var txt1 = board.create('text', [-5, -4, 'over!'], { fontSize: 16, visible: false });
            pg1.on('over', function () {
                txt1.setAttribute({ visible: true });
            })
            pg1.on('out', function () {
                txt1.setAttribute({ visible: false });
            })

        });

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
                board.create('segment', [[i - 9, - 9], [i - 2, 2]], { strokewidth: i, opacity: 1 - (i / 20) });  // mostly diagonal
                board.create('text', [i - 9, - 9.5, i.toString()])
            }
        })


    }
    arc() {
        this.boards.map((board) => {
            {
                // Create an arc out of three free points
                let p1 = board.create('point', [2.0, 2.0]);
                let p2 = board.create('point', [1.0, 0.5]);
                let p3 = board.create('point', [3.5, 1.0]);

                let a = board.create('arc', [p1, p2, p3]);
                board.create('text', [1, 6, function () { return 'arclength: ' + Math.round(a.Value() * 100) / 100 }])
                let p4 = board.create('point', [2.0, 3.5]);
                let p5 = board.create('point', [1.0, 2.0]);
                let p6 = board.create('point', [3.5, 2.5]);
                board.create('majorarc', [p4, p5, p6]);
            }
            {
                // Create a sector out of three free points
                let p1 = board.create('point', [-7.5, 5.0]),
                    p2 = board.create('point', [-7.0, 0.5]),
                    p3 = board.create('point', [-4.0, 3.0]),

                    a = board.create('sector', [p1, p2, p3]);
            }
        })

    }

    mathml() {
        this.boards.map((board) => {

            let htmlSt = `<div><math>
                        <mrow>
                        <mo>−<!-- − --></mo>
                        <mfrac>
                        <mn>1</mn>
                        <mn>3</mn>
                        </mfrac>
                        </mrow>
                       </math></div>`;

            let txt = board.create('text', [2, 2, htmlSt], { anchorX: 'middle', anchorY: 'middle', dragArea: 'all', fontSize: 32, fixed: false, display: 'html' });

            console.log('----------- about to update --------------')

            board.update();


        })
    }

    composition() {
        this.boards.map((board) => {

            let f1 = board.create('functiongraph', ['(8 - x/2) * 4 / 3'], {
                strokeColor: 'blue',
                strokeWidth: 3
            });

            let f2 = board.create('functiongraph', ['(20 - x) / 2'], {
                strokeColor: 'red',
                strokeWidth: 3
            });

            let in1 = board.create('inequality', [f1], { visible: false });
            let in2 = board.create('inequality', [f2], { visible: false });
            let clip = board.create('curveintersection', [in1, in2], {
                fillColor: 'yellow',
                fillOpacity: 0.5,
                highlightFillColor: 'yellow',
                highlightFillOpacity: 0.3
            });

        })
    }
}