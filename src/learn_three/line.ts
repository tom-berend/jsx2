// https://threejs.org/manual/#en/drawing-lines

import * as THREE from 'three'

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

var canvas = document.querySelector("canvas.webgl") as HTMLCanvasElement;
if (canvas == null) {
    throw new Error("Canvas not found");
}

var sizes = { width: window.innerWidth, height: window.innerHeight, };


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500);
camera.position.set(0, 0, 30);
camera.lookAt(0, 0, 0);
scene.add(camera);

var controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

var renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: canvas,
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//////////////////////////////////////


//create a blue LineBasicMaterial
const material = new THREE.LineBasicMaterial({ color: 0x00ffff });

// create a geometry with some vertices:
let points = [];
points.push(new THREE.Vector3(- 10, 0, 0));
points.push(new THREE.Vector3(0, 10, 0));
points.push(new THREE.Vector3(10, 0, 0));

const geometry = new THREE.BufferGeometry().setFromPoints(points);

//Now that we have points for two lines and a material, we can put them together to form a line.
const line = new THREE.Line(geometry, material);

scene.add(line);

points = points.map((p) => new THREE.Vector3(p.x + 1, p.y + 1, p.z+1));
console.log(points)

// lets try with two geometries
const geo1 = new THREE.BufferGeometry().setFromPoints([points[0], points[1]]);
const geo2 = new THREE.BufferGeometry().setFromPoints([points[1], points[2]]);
const line1 = new THREE.Line(geo1, material)
const line2 = new THREE.Line(geo2, material)

scene.add(line1, line2)


let animate = () => {
    controls.update();

    renderer.render(scene, camera);
    requestAnimationFrame(animate);

}
animate()