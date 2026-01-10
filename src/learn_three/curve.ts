// https://threejs.org/manual/#en/drawing-lines

import * as THREE from 'three'
import { scene, camera, renderer, startwebgl } from './startwebgl.js';
startwebgl();

// class CustomSinCurve extends THREE.Curve {
// 	getPoint( t, optionalTarget = new THREE.Vector3() ) {
// 		const tx = t * 3 - 1.5;
// 		const ty = Math.sin( 2 * Math.PI * t );
// 		const tz = 0;
// 		return optionalTarget.set( tx, ty, tz );
// 	}
// }
// const path = new CustomSinCurve( 10 );


myLine([-2, 1], [2, 5], 'blue', .02)
myLine([-2, 0], [2, 4], 'red', .02)
myLine([-2, -1], [2, 3])
myLine([-2, -2], [2, 2], 'red', .1)
myLine([-2, -3], [2, 1], '#ffff00', .15)
myLine([-2, -4], [2, 0], 'crimson', .3)
myLine([-2, -5], [2, -1], 'blue', 1)  // missing??


function myLine(start: number[], end: number[], color: string = 'blue', strokewidth: number = .05, opacity: number = 1) {
    let path = new THREE.LineCurve3(new THREE.Vector3(start[0], start[1], 0), new THREE.Vector3(end[0], end[1], 0))

    const geometry = new THREE.TubeGeometry(path, 1, strokewidth, 8, true);
    const material = new THREE.MeshStandardMaterial({ color: color, opacity: .1, transparent: true});
    const mesh = new THREE.Mesh(geometry, material);
    mesh.material.depthWrite = false
    scene.add(mesh);
}

