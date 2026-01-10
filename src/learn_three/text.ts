import * as THREE from 'three'
import { scene, camera, renderer, startwebgl } from './startwebgl.js';
startwebgl();

// @ts-ignore
import { SpriteText } from './three-spritetext.js'

let sprite = new SpriteText("SPRITE",.25,'black' )
scene.add(sprite)
sprite.position.set(9.5,9.5,0)

let s2 = sprite.clone()
scene.add(s2)
s2.position.set(8.5,8.5,0)