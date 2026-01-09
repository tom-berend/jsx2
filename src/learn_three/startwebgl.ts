import * as THREE from 'three'
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};

export interface StartWebGLAttributes {
    background?: string

}


export const scene = new THREE.Scene();
const fov = 45;
const aspect = sizes.width / sizes.height
const near = 1;
const far = 500;
export const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

const canvas = document.querySelector("canvas.webgl") as HTMLCanvasElement;
if (canvas == null) { throw new Error("Canvas not found"); }
export const renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: canvas,
});

export function startwebgl(divId?: string, attributes?: StartWebGLAttributes) {

    // defaults
    divId = divId ?? 'canvas.webgl'
    attributes = Object.assign({
        background: '#ffffff'
    }, attributes)

    scene.background = new THREE.Color(attributes.background);


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

    camera.position.set(0, 0, 20);
    camera.lookAt(0, 0, 0);
    scene.add(camera);

    var controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;

    renderer.setSize(sizes.width, sizes.height);
    document.body.appendChild(renderer.domElement);

    let animate = () => {
        controls.update();

        renderer.render(scene, camera);
        requestAnimationFrame(animate);

    }
    animate()


}

