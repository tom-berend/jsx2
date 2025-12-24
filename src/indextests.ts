import { Board } from "./base/board.js";
import { JSXGraph } from "./jsxgraph.js"


export class IndexTests {
    newBoard: Board
    oldBoard: any

    old = true  // turn on and off boards
    new = true

    boards = []

    constructor() {

        this.new = true
        this.old = true

        this.initBoard()

        this.point()
        this.text()
        // this.line()
        this.widgets()
    }

    initBoard() {
        if (this.new)
            this.boards.push(JSXGraph.initBoard(
                'box', {
                boundingBox: [-10, 10, 10, -10],
                // axis: true
            }));

        if (this.old)
            this.boards.push((window as any).JXG.JSXGraph.initBoard(
                'box2', {
                boundingBox: [-10, 10, 10, -10],
                // axis: true
            }));
    }

    point() {
        this.boards.map((board) => {
            let a = board.create('point', [1, 3])
            board.create('point', [() => a.X() + 1, () => a.Y() + 1], { name: 'new second', strokecolor: 'blue' })
        })
    }
    text() {
        this.boards.map((board) => {
            board.create('text', [2, 7, "test"], {  strokecolor: 'red' })
        })
    }
    line() {
        this.boards.map((board) => {
            let p1 = board.create('point', [-3, -3])
            let p2 = board.create('point', [-4, -3])
            board.create('segment', [p1, p2], { strokecolor: 'blue' })

            // circle and radius
            board.create('segment', [[-1, -1], [-2, -1]], { strokecolor: 'red' })
            board.create('circle', [[-1, -1], [-2, -1]], { strokecolor: 'green' })
        })
    }
    widgets() {
        this.boards.map((board) => {
             board.create('checkbox', [-8, 8, 'Checkbox'], {});
        })
    }

    }