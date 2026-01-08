
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

window.addEventListener("resize", function () {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
window.addEventListener("dblclick", function () {
    if (document.fullscreenElement) {
        document.exitFullscreen();
    }
    else {
        canvas.requestFullscreen();
    }
});
var scene = new THREE.Scene();
var geometry = new THREE.BoxGeometry(1, 1, 1);
var material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
var mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

var camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.set(0, 0, 3);
scene.add(camera);
var controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
var renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
function frame() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
