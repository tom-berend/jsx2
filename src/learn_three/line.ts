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


////////////  creating lines from TUBES //////////

myLine([-2, 1], [2, 5], 'red', .004)
myLine([-2, 1], [2, 5], 'blue', .007)
myLine([-2, 0], [2, 4], 'red', .02)
myLine([-2, -1], [2, 3], 'blue', .03)
myLine([-2, -2], [2, 2], 'red', .05)
myLine([-2, -3], [2, 1], 'green', .07)
myLine([-2, -4], [2, 0], 'crimson', .1)
myLine([-2, -5], [2, -1], 'blue', .13)



function myLine(start: number[], end: number[], color: string = 'blue', strokewidth: number = .05, opacity: number = 1) {
    let path = new THREE.LineCurve3(new THREE.Vector3(start[0], start[1], 0), new THREE.Vector3(end[0], end[1], 0))

    const geometry = new THREE.TubeGeometry(path, 1, strokewidth, 8, false);  // closed must be false
    const material = new THREE.MeshBasicMaterial({ color: color, opacity: opacity, transparent: true });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
}
