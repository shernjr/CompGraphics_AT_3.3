import * as THREE from 'three';




export const scene = new THREE.Scene();
export const camera = new THREE.PerspectiveCamera(
    90, window.innerWidth / window.innerHeight, 0.1, 1000);
export const renderer = new THREE.WebGLRenderer({
    antialias: true,
});
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);
renderer.setAnimationLoop(() => update(clock.getDelta()));

window.addEventListener('resize', () => windowResize());
windowResize();



/**
 * Goal is to make a scene with models that can be moved around. Models have collision management or interaction that involves
 * their meshes. The scenario is customisable, objects are re-updated dynamically. Textures and normal maps/bump maps are included.
 */