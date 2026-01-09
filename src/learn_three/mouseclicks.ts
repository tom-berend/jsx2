import * as THREE from 'three'
import { scene, camera, renderer, startwebgl } from './startwebgl.js';
startwebgl();

///////// capture clicks //////////

window.addEventListener("click", onClick);
let points = []

function onClick(event) {
    // click coordinates
    let x = event.clientX - innerWidth / 2
    let y = innerHeight / 2 - event.clientY

    console.log('click', event.clientX, event.clientY, innerWidth, innerHeight, x, y)

    // draw a black circle to indicate dot position
    let point = new THREE.Mesh(
        new THREE.CircleGeometry(5),
        new THREE.MeshBasicMaterial({ color: 'black' })
    )
    point.position.set(x, y, 0);
    scene.add(point);


    // add the point to the list of points
    points.push(new THREE.Vector2(x, y));
}
