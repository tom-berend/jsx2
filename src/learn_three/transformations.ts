// https://threejs.org/manual/#en/drawing-lines

import * as THREE from 'three'
import { scene, camera, renderer, startwebgl } from './startwebgl.js';
startwebgl();


interface WebGL { lineCurve3?: any, geometry?: any, material?: any, mesh?: any }

let el: { webGL: WebGL } = { webGL: {} }

el = newLine([0, 0, 0], [1, 1, 0])

let i = 0


setInterval(() => {
    i += .1
    let position ={ x: Math.cos(i), y: Math.sin(i), z: 1 }

    moveLine([position.x, position.y, position.z])
    rotateLine(el, position)
    scaleLine(el,i%10)
}, 100);



function newLine(start, end) {

    let strokewidth = .02
    let opacity = 1
    let color = 'blue'

    el.webGL.lineCurve3 = new THREE.LineCurve3(new THREE.Vector3(start[1], start[2], 0), new THREE.Vector3(end[1], end[2], 0))

    el.webGL.geometry = new THREE.TubeGeometry(el.webGL.lineCurve3, 1, strokewidth, 8, false);  // closed must be false
    el.webGL.material = new THREE.MeshBasicMaterial({ color: color, opacity: opacity, transparent: true });
    el.webGL.mesh = new THREE.Mesh(el.webGL.geometry, el.webGL.material);
    // el.webGL.mesh.visible = el.evalVisProp('visible')
    scene.add(el.webGL.mesh);
    return el
}

function moveLine(start) {

    el.webGL.mesh.position.x = start[0]
    el.webGL.mesh.position.y = start[1]
    el.webGL.mesh.position.z = start[2]
}

function scaleLine(el, length) {
    el.webGL.mesh.scale.x = length
}

function rotateLine(el, point: { x: number, y: number, z: number }) {

    let zAngle = Math.atan2(point.y, point.x)  // plane angle in radians
    let yAngle = Math.atan2(point.z, Math.sqrt(point.x*point.x + point.y*point.y))  // elevation angle in radians

    const axis1 = new THREE.Vector3(0, 0, 1); // Rotate around z for standard JSX position (fix this for floating boards)
    const axis2 = new THREE.Vector3(1, 1, 0).normalize(); // Rotate around y for elevation  (fix this for floating boards)
    const q1 = new THREE.Quaternion().setFromAxisAngle(axis1.normalize(), zAngle);
    const q2 = new THREE.Quaternion().setFromAxisAngle(axis2.normalize(), -yAngle);

   el.webGL.mesh.quaternion.copy(q1.multiply(q2));

}