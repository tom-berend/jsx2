import * as THREE from 'three'
import { scene, camera, renderer, startwebgl } from './startwebgl.js';
startwebgl();

let geometry = new THREE.BoxGeometry(5, 5, 5);
let material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
let mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

function frame() {
    mesh.rotation.x += 0.01;
    mesh.rotation.y += 0.01;

    renderer.render(scene, camera);
    requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
