// https://threejs.org/manual/#en/drawing-lines

import * as THREE from 'three'
import { scene, camera, renderer, startwebgl } from './startwebgl.js';

startwebgl();

let coordinates = []
coordinates.push([-5, -6]);
coordinates.push([-5, -7]);
coordinates.push([-4, -5]);
coordinates.push([-6, -6]);

// inner shape
let polyShape = new THREE.Shape(
    coordinates.map((coord) => new THREE.Vector2(coord[0], coord[1])))
const polyGeometry = new THREE.ShapeGeometry(polyShape);
let polygon = new THREE.Mesh(polyGeometry,
    new THREE.MeshBasicMaterial({ color: "yellow", side: THREE.DoubleSide }))

// border lines
let borders = [];
for (let i = 0; i < coordinates.length-1; i++) {
    borders.push(myLine(coordinates[i], coordinates[i + 1], 'blue', .007))
}
borders.push(myLine(coordinates[0], coordinates[coordinates.length-1], 'blue', .007))  // close polygon


// vertices
let vertexCoords = coordinates.slice()
let vertexMaterial = new THREE.MeshBasicMaterial({ color: 'darkorange' });

let vertices = vertexCoords.map((coord) => {
    let v = new THREE.Mesh(new THREE.SphereGeometry(.08, 6, 6), vertexMaterial)
    v.position.set(coord[0], coord[1], 0)
    return v;
})

scene.add(polygon, ...borders, ...vertices);


/////////////////////
let path = coordinates.map((p) => (p.x + 5, p.y + 5));


const arcShape = new THREE.Shape()
    .moveTo(5, 1)
    .lineTo(3, 1).lineTo(1, 7).lineTo(2, 3)


// .absarc( 1, 1, 4, 0, Math.PI * 2, false );
const geometry = new THREE.ShapeGeometry(arcShape);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
const mesh = new THREE.Mesh(geometry, material);
mesh.rotateX(.2)
mesh.rotateY(.2)
scene.add(mesh);



function myLine(start: number[], end: number[], color: string = 'blue', strokewidth: number = .05, opacity: number = 1) {
    console.log(start,end)
    let path = new THREE.LineCurve3(new THREE.Vector3(start[0], start[1], 0), new THREE.Vector3(end[0], end[1], 0))

    const geometry = new THREE.TubeGeometry(path, 1, strokewidth, 8, false);  // closed must be false
    const material = new THREE.MeshBasicMaterial({ color: color, opacity: 1, transparent: true });
    const mesh = new THREE.Mesh(geometry, material);
    return mesh
}
