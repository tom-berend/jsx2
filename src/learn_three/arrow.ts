
import * as THREE from 'three'
import { scene, camera, renderer, startwebgl } from './startwebgl.js';

startwebgl();


let [fx, fy, fz] = [0, 0, 0]  // arrowPoint
let [ix, iy, iz] = [4, 4, 4]  // tailPoint

scene.add(
    customArrow(
        fx, fy, fz,
        ix, iy, iz))


function customArrow(fx, fy, fz, ix, iy, iz, thickness = .1, arrowColor = 'black',lineColor = 'blue') {

        var headMaterial = new THREE.MeshBasicMaterial({ color: arrowColor });
        var lineMaterial = new THREE.MeshBasicMaterial({ color: lineColor });
        const ARROW_BODY = new THREE.CylinderGeometry(1, 1, 1, 12)
            .rotateX(Math.PI / 2)
            .translate(0, 0, 0.5);

        const ARROW_HEAD = new THREE.ConeGeometry(1, 1, 12)
            .rotateX(Math.PI / 2)
            .translate(0, 0, -0.5);


        var length = Math.sqrt((ix - fx) ** 2 + (iy - fy) ** 2 + (iz - fz) ** 2);

        var body = new THREE.Mesh(ARROW_BODY, lineMaterial);
        body.scale.set(thickness, thickness, length - 10 * thickness);

        var head = new THREE.Mesh(ARROW_HEAD, headMaterial);
        head.position.set(0, 0, length);
        head.scale.set(3 * thickness, 3 * thickness, 10 * thickness);

        var arrow = new THREE.Group();
        arrow.position.set(ix, iy, iz);
        arrow.lookAt(fx, fy, fz);
        arrow.add(body, head);

        return arrow;
    }

