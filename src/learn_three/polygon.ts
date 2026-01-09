// https://threejs.org/manual/#en/drawing-lines

import * as THREE from 'three'
import { scene, camera, renderer, startwebgl } from './startwebgl.js';
// @ts-ignore
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
// @ts-ignore
import { Line2 } from 'three/addons/lines/Line2.js';
// @ts-ignore
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';

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
let closed = coordinates.slice()
closed.push(coordinates[0])
let borderShape = new THREE.BufferGeometry().setFromPoints(
    closed.map((coord) => new THREE.Vector3(coord[0], coord[1], 0)))  // 3D !!
let borders = new THREE.Line(borderShape, new THREE.LineBasicMaterial({ color: 'blue' }))

// vertices
let vertexCoords = coordinates.slice()
let vertexMaterial = new THREE.MeshBasicMaterial({ color: 'darkorange' });

let vertices = vertexCoords.map((coord) => {
    let v = new THREE.Mesh(new THREE.SphereGeometry(.08, 6, 6), vertexMaterial)
    v.position.set(coord[0], coord[1], 0)
    return v;
})

scene.add(polygon, borders,...vertices);
