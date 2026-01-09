// https://threejs.org/manual/#en/drawing-lines

import * as THREE from 'three'
import { scene, camera, renderer, startwebgl } from './startwebgl.js';
startwebgl();

//create a blue LineBasicMaterial
const material = new THREE.LineBasicMaterial({ color: '#000fff' });

// create a geometry with some vertices:
let points = [];
points.push(new THREE.Vector3(- 10, 0, 0));
points.push(new THREE.Vector3(0, 10, 0));
points.push(new THREE.Vector3(10, 0, 0));

const geometry = new THREE.BufferGeometry().setFromPoints(points);

//Now that we have points for two lines and a material, we can put them together to form a line.
const line = new THREE.Line(geometry, material);

scene.add(line);

points = points.map((p) => new THREE.Vector3(p.x + 1, p.y + 1, p.z + 1));
console.log(points)

// lets try with two geometries
const geo1 = new THREE.BufferGeometry().setFromPoints([points[0], points[1]]);
const geo2 = new THREE.BufferGeometry().setFromPoints([points[1], points[2]]);
const line1 = new THREE.Line(geo1, material)
const line2 = new THREE.Line(geo2, material)

scene.add(line1, line2)


// nothing further works...


// lets try with a Path
points = points.map((p) => new THREE.Vector3(p.x + 1, p.y + 1, p.z + 1));

const path = new THREE.Path();
path.moveTo(points[0].X, points[0].Y)
path.lineTo(points[1].X, points[1].Y)
path.lineTo(points[2].X, points[2].Y)

const pGeometry = new THREE.BufferGeometry().setFromPoints(path.getPoints());
const pMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
const pathLine = new THREE.Line(pGeometry, pMaterial);
scene.add(pathLine);


scene.add( pathLine)




///////// polygon /////

let polyPoints = []     // reuse points for 2D polygon
polyPoints.push(new THREE.Vector2(-5, -6));
polyPoints.push(new THREE.Vector2(-5, -7));
polyPoints.push(new THREE.Vector2(-4, -5));
polyPoints.push(new THREE.Vector2(-6, -6));


//  2D polygon
const polyShape = new THREE.Shape()
    .moveTo(polyPoints[0].X, polyPoints[0].Y)
    .lineTo(polyPoints[1].X, polyPoints[1].Y)
    .lineTo(polyPoints[2].X, polyPoints[2].Y)
    .lineTo(polyPoints[3].X, polyPoints[3].Y)
    .lineTo(polyPoints[0].X, polyPoints[0].Y)

const geoPoly = new THREE.ShapeGeometry(polyShape);
const matPoly = new THREE.MeshBasicMaterial({ color: 'blue', side: THREE.DoubleSide });
const mesPoly = new THREE.Mesh(geoPoly, matPoly);
scene.add(mesPoly);

renderer.render(scene, camera);

// //  2D circle
// const arcShape = new THREE.Shape()
//     .moveTo(5, 1).lineTo(6, 1).lineTo(6, 2)
//     .absarc(1, 1, 4, 0, Math.PI * 2, false);
// const geoHeart = new THREE.ShapeGeometry(arcShape);
// const matHeart = new THREE.MeshBasicMaterial({ color: 'blue', side: THREE.DoubleSide });
// const meshHeart = new THREE.Mesh(geoHeart, matHeart);
// scene.add(meshHeart);




// generate a shape from the points
let shape = new THREE.Shape();

shape.moveTo(points[0][0], points[0][1]);
for (let i = 0; i < points.length; i++)
    shape.lineTo(points[i][0], points[i][1]);
shape.lineTo(points[0][0], points[0][1]);    // close the polygon

let polyGeometry = new THREE.ShapeGeometry(shape)
let polyMaterial = new THREE.MeshBasicMaterial({ color: 'blue', side: THREE.DoubleSide })

let polyMesh = new THREE.Mesh(polyGeometry, polyMaterial)

scene.add(polyMesh);

camera.position.set(0, 0, 100);
camera.lookAt(0, 0, 0);

renderer.render(scene, camera);
