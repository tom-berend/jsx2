import * as THREE from 'three'
import { scene, camera, renderer, startwebgl } from './startwebgl.js';
startwebgl();

// https://discourse.threejs.org/t/an-example-of-text-to-canvas-to-texture-to-material-to-mesh-not-too-difficult/13757



let message = 'Hello'
let fontHeight = 140
let font = 'system-ui'    // Arial, Courier, Times, system-ui
let color = 'blue'
let padding = 10
let backgroundColor = 'pink'
let border = 10
let borderColor = 'blue'

////////////////////

// create Canvas and Context
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

let fontSpecifier = `${fontHeight}px ${font}`
fontSpecifier = "italic bold 20pt Courier"

//  measure text
ctx.font = fontSpecifier
ctx.textAlign = "center"
let text = ctx.measureText(message);
console.log('text width', text.width)

// create button
canvas.width = text.width + (padding * 2) + (border * 2)
canvas.height = text.fontBoundingBoxAscent + text.fontBoundingBoxDescent + (padding * 2) + (border * 2)
ctx.fillStyle = backgroundColor;
ctx.fillRect(0, 0, canvas.width, canvas.height);

// draw text
ctx.fillStyle = color
ctx.font = fontSpecifier
ctx.fillText(message, padding + border, padding + border + text.fontBoundingBoxAscent);

// draw Border
if (border > 0) {
    ctx.beginPath()
    ctx.strokeStyle = borderColor
    ctx.lineWidth = border

    ctx.moveTo(0, 0)
    ctx.lineTo(canvas.width, 0)
    ctx.lineTo(canvas.width, canvas.height)
    ctx.lineTo(0, canvas.height)
    ctx.lineTo(0, 0)
    ctx.stroke()
}

// create Texture
const texture = new THREE.CanvasTexture(canvas);

let px2Unit = 70

// 4. Apply to Material
const material = new THREE.MeshBasicMaterial({ map: texture });
const mesh = new THREE.Mesh(new THREE.PlaneGeometry(canvas.width / px2Unit, canvas.height / px2Unit), material);
scene.add(mesh);