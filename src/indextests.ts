import { Board } from "./base/board.js";
import JSXGraph from "./jsxgraph.js"


export class IndexTests {
    newBoard: Board
    oldBoard: any

    constructor() {

        this.initBoard()
        this.point()
        this.text()
        this.line()

    }

    initBoard() {
        this.newBoard = JSXGraph.initBoard(
            'box', {
            boundingBox: [-10, 10, 10, -10],
            // axis: true
        });
        this.oldBoard = (window as any).JXG.JSXGraph.initBoard(
            'box2', {
            boundingBox: [-10, 10, 10, -10],
            // axis: true
        });
    }

    point() {
        let a = this.newBoard.create('point', [1, 3])
        let a2 = this.newBoard.create('point', [() => a.X() + 1, () => a.Y() + 1], { name: 'new second',strokecolor:'blue' })

        let b = this.oldBoard.create('point', [1, 3])
        let b2 = this.oldBoard.create('point', [() => b.X() + 1, () => b.Y() + 1], { name: 'old second',strokecolor:'blue' })
    }
    text() {
        let a = this.newBoard.create('text', [2, 3, "test"], { name: 'foo', strokecolor: 'red' })
        let b = this.oldBoard.create('text', [2, 3, "test"], { name: 'foo', strokecolor: 'red' })
    }
    line() {
        // let p1 = this.newBoard.create('point',[-3,-3])
        // let p2 = this.newBoard.create('point',[-4,-3])
        // this.newBoard.create('segment', [p1,p2], { strokecolor: 'blue' })

        let a = this.newBoard.create('segment', [[-1, -1], [-2, -1]], { strokecolor: 'red' })
        let b = this.oldBoard.create('segment', [[-1, -1], [-2, -1]], { strokecolor: 'red' })

        this.newBoard.create('circle', [[-1, -1],[-2,-1]] , { strokecolor: 'green' })
        this.oldBoard.create('circle', [[-1, -1],[-2,-1]] , { strokecolor: 'green' })

    }

}