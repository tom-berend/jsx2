import * as THREE from 'three'

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

var canvas = document.querySelector("canvas.webgl") as HTMLCanvasElement;
if (canvas == null) {
    throw new Error("Canvas not found");
}

var sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500);
camera.position.set(0, 0, 3);
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

///////////////////////////

var geometry = new THREE.BoxGeometry(1, 1, 1);
var material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
var mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

function frame() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
