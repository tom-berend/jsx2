import { Board } from "./base/board.js";
import { JSXGraph } from "./jsxgraph.js"

// import * as THREE from 'three';
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


export class IndexTests {
    newBoard: Board
    oldBoard: any

    old = true  // turn on and off boards
    new = true
    three = false
    webgl = false

    boards = []

    constructor() {

        this.initBoard()

        this.point()
        this.text()
        this.line()
        this.curve()
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
            board.create('text', [2, 7, "test"], { strokecolor: 'red' })
        })
    }
    line() {
        this.boards.map((board) => {
            let p1 = board.create('point', [-3, -3])
            let p2 = board.create('point', [-4, -3])
            board.create('segment', [p1, p2], { strokecolor: 'blue' })

            // circle and radius
            board.create('line', [[-1, -1], [-2, -1]], { strokecolor: 'red' })
            board.create('circle', [[-1, -1], [-2, -1]], { strokecolor: 'green' })
        })
    }
    curve() {
        this.boards.map((board) => {
            board.create('curve', [(t) => t - Math.sin(t), (t) => 1 - Math.cos(t), 0, 2 * Math.PI]);
        })
    }
    widgets() {
        this.boards.map((board) => {
            let a = board.create('checkbox', [-8, 8, 'Checkbox'], {});
            let b = board.create('point', [-8.3, 8.3], { name: 'is checked', fillcolor: () => a.Value() ? 'red' : 'green' })
        })
    }

}



// if (this.three) {

//     // const scene = new THREE.Scene();
//     // const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

//     // let canvasRef = document.getElementById("canvas3") as HTMLCanvasElement;
//     // const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvasRef });
//     // renderer.setSize(canvasRef.width, canvasRef.height) //window.innerWidth, window.innerHeight);

//     // const geometry = new THREE.BoxGeometry(1, 1, 1);
//     // const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
//     // const cube = new THREE.Mesh(geometry, material);
//     // scene.add(cube);

//     // camera.position.z = 3;

//     // let animate = () => {
//     //     cube.rotation.x += 0.01;
//     //     cube.rotation.y += 0.01;
//     //     renderer.render(scene, camera);
//     // }
//     // renderer.setAnimationLoop(animate);
// }

// if (this.webgl) {
//     const gl = (document.getElementById('canvas4') as HTMLCanvasElement).getContext('webgl');
//     gl.clearColor(1, 0, 0, 1);  // red
//     gl.clear(gl.COLOR_BUFFER_BIT);
// }
