import { Board } from "./base/board.js";
import { JSXGraph } from "./jsxgraph.js"
import { Type } from "./utils/type.js";

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
        // this.circle()
        // this.curve()
        // this.widgets()
        // this.image()
        this.polygon()
    }

    initBoard() {
        let attr = {
            boundingBox: [-10, 10, 10, -10],
            // axis: true,
            shownavigation: false,
            showcopyright: false,
            showinfobox: false,
        }

        if (this.new)
            this.boards.push(JSXGraph.initBoard(
                'box', attr));

        if (this.old)
            this.boards.push((window as any).JXG.JSXGraph.initBoard(
                'box2', attr));

    }

    point() {
        this.boards.map((board) => {
            let a = board.create('point', [1, 3])
            board.create('point', [() => a.X() + 1, () => a.Y() + 1], { name: 'locked to A', strokecolor: 'blue' })
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

            // circle and radius
            board.create('line', [[-1, -1], [-2, -1]], { strokecolor: 'red' })
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
