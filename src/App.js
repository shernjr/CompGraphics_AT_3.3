import * as THREE from 'three';
import {OrbitControls} from '../lib/OrbitControls.js';
import ObjectManager from '../src/managers/ObjectManager.js';

export default class App {
    constructor() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf0f0f0);

        this.camera = new THREE.PerspectiveCamera (75, window.innerWidth / window.innerHeight, 
            0.1, 1000);

        this.camera.position.set(0, 2, 5);

        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('three-canvas'),
            antialias: true
        })
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        this.animate = this.animate.bind(this);
    }

    init() {
        this.addLights();
        this.addFloor();

        this.objectManager = new ObjectManager(this.scene);

        this.objectManager.loadModel('bathroom vanity', '/assets/models/bathroom_vanity.glb', () => {console.log('Model loaded');});

        this.setupClickToPlace();

        this.animate();
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    addLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 10, 7.5);
        this.scene.add(directionalLight);
    }

    addFloor() {
        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(10, 10),
            new THREE.MeshStandardMaterial({ color: 0xe0e0e0 })
        );

        floor.rotation.x = -Math.PI / 2;
        this.scene.add(floor);
    }

    animate() {
        requestAnimationFrame(this.animate);
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    setupClickToPlace() {
        this.renderer.domElement.addEventListener('click', (event) => {
          const mouse = new THREE.Vector2(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1
          );
    
          const raycaster = new THREE.Raycaster();
          raycaster.setFromCamera(mouse, this.camera);
    
          const intersects = raycaster.intersectObjects(this.scene.children, true);
          if (intersects.length > 0) {
            const point = intersects[0].point;
    
            // Place the cup at the clicked point
            this.objectManager.placeClone('cup', point, 0.5);
          }
        });
      }
}