import * as THREE from 'three'
import { scene, camera, renderer, startwebgl } from './startwebgl.js';
startwebgl();

// @ts-ignore
import { SpriteText } from './three-spritetext.js'

var sprite = new SpriteText("SPRITE",.3,'black' )
scene.add(sprite)