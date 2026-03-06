import * as THREE from 'three'
import { scene, camera, renderer, startwebgl } from './startwebgl.js';
startwebgl();

// https://discourse.threejs.org/t/an-example-of-text-to-canvas-to-texture-to-material-to-mesh-not-too-difficult/13757



let message = 'Hello World'
let fontHeight = 40
let fontFamily = 'system-ui'    // Arial, Courier, Times, system-ui
let color = 'white'
let padding = 10
let backgroundColor = 'blue'
let border = 0
let borderColor = '#e11B22'
let fontStyle = 'italic'
let fontWeight = '400'   // or 'bold', 'normal'

////////////////////

// create Canvas and Context
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

let fontSpecifier = `${fontWeight} ${fontStyle} ${fontHeight}px ${fontFamily}`

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
    ctx.strokeStyle = borderColor
    ctx.lineWidth = border
    ctx.beginPath()
    ctx.moveTo(0,0)

    // border must be fully inside the box, so use border/2
    ctx.lineTo(border/2, border/2)   // if you start at (0,0), you will leave a patch of background
    ctx.lineTo(canvas.width-border+border/2, border/2)
    ctx.lineTo(canvas.width-border+border/2, canvas.height-border+border/2)
    ctx.lineTo(border/2, canvas.height-border/2)
    ctx.lineTo(border/2, border/2)
    ctx.stroke()
}

// create Texture
const texture = new THREE.CanvasTexture(canvas);

let px2Unit = 70

// apply to Material
const material = new THREE.MeshBasicMaterial({ map: texture });
const mesh = new THREE.Mesh(new THREE.PlaneGeometry(canvas.width / px2Unit, canvas.height / px2Unit), material);
scene.add(mesh);


//////////////////////////////////
fontHeight /= 2 // div by five to roughly match webGL canvas 10x10


// 1. Create the button element
let b = document.createElement('button');

// 2. Set the button's text content
b.innerText = message;
b.style.color = color
b.style.fontSize = `${fontHeight}px`
b.style.backgroundColor = backgroundColor
b.style.border = border.toString()
b.style.fontStyle = fontStyle
b.style.fontFamily = fontFamily
b.style.fontWeight = fontWeight.toString()
b.style.border = `${border}px solid ${borderColor}`

// 3. Add an event listener
b.addEventListener('click', () => {
    alert('Dynamically created button clicked!');
});

// 4. Find the container and append the new button to the page
const container = document.getElementById('buttonContainer');
container.appendChild(b);