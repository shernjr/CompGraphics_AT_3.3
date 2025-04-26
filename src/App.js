import * as THREE from 'three';
import ScaleUI from '../src/ui/ScaleUI.js';
import RotateUI from '../src/ui/RotateUI.js';
import { TextureLoader, RepeatWrapping } from 'three';
import {OrbitControls} from '../lib/OrbitControls.js';
import ObjectManager from '../src/managers/ObjectManager.js';
import InteractionHandler from './managers/InteractionHandler.js';
import CollisionManager from '../src/managers/CollisionManager.js';

export default class App {
    constructor() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);

        this.selectedObject = null;
        this.ScaleUI = new ScaleUI();
        this.RotateUI = new RotateUI();

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
        this.collisionManager = new CollisionManager(this.scene);

        this.loadModels();
        
        this.InteractionHandler = new InteractionHandler(this.renderer, this.camera, this.scene, this.controls);

        this.setupObjectSelection();

        this.animate();
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    loadModels() {
      this.objectManager.loadModel('bathroom cabinet', '/assets/models/bathroom_cabinet.glb', (model) => {
        console.log('bathroom cabinet model loaded');
    
        const texture = new THREE.TextureLoader().load('/assets/textures/aircraftpanels.jpg');
    
        model.traverse((child) => {
            if (child.isMesh) {
                child.material.map = texture; // Assign the texture to the material's map
                child.material.needsUpdate = true; // Ensure the material is updated
            }
        });
    
        model.userData.collidable = true;
        model.scale.set(1.2, 1.2, 1.2);
        model.position.set(0.5, -0.5, 0);
        this.scene.add(model);
        this.collisionManager.registerCollidable(model);
    });
    

      this.objectManager.loadModel('soap dispenser', '/assets/models/soap_dispenser.glb', (model) => {
        console.log('soap dispenser model loaded');
        model.userData.collidable = true;
        model.userData.snapToFloor = true;
        model.scale.set(0.05, 0.05, 0.05);
        model.position.set(1, 0, 0);
        this.scene.add(model);
        this.collisionManager.registerCollidable(model);
      });

      this.objectManager.loadModel('electric toothbrush', '/assets/models/electric_toothbrush.glb', (model) => {
        console.log('electric toothbrush model loaded');
        model.userData.snapToFloor = true;
        model.scale.set(2, 2, 2);
        model.position.set(2, 0, 0);
        this.scene.add(model);
        this.collisionManager.registerCollidable(model);
      });

      this.objectManager.loadModel('mug', '/assets/models/mug.glb', (model) => {
        console.log('glass mug model loaded');
        model.userData.snapToFloor = true;
        model.scale.set(1, 1, 1);          
      
        // Load texture
        const texture = new THREE.TextureLoader().load('/assets/textures/aircraftpanels.jpg');
      
        // Wait for all transforms to apply before computing bounding box
        model.updateWorldMatrix(true, true);
        const box = new THREE.Box3().setFromObject(model);
        const height = box.max.y - box.min.y;
        const offsetY = box.min.y;
        model.userData.boundingBox = { height, offsetY };
      
        // Position mug on the floor
        model.position.y = -offsetY;
      
        // Apply texture
        model.traverse((child) => {
          if (child.isMesh) {
            child.material.map = texture;
            child.material.needsUpdate = true;
            child.material.roughness = 0.6;
            child.material.metalness = 0.1;
          }
        });
      
        this.scene.add(model);
        this.collisionManager.registerCollidable(model);
      });
    }

    addLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const sunLight = new THREE.DirectionalLight(0xffffff, 1);
        sunLight.position.set(5, 10, 5); // above and to the side
        sunLight.castShadow = true;
        this.scene.add(sunLight);
    }

    addFloor() {

      const texture = new THREE.TextureLoader().load('/assets/textures/tile.jpg');
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(4, 4); // Adjust tiling density

        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(5, 5),
            new THREE.MeshStandardMaterial({ map: texture, roughness: 0.1 })
        );

        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        floor.userData.isFloor = true;
        floor.name = 'floor';
        this.scene.add(floor);

        // Back Wall (behind the vanity)
        const backWallGeometry = new THREE.PlaneGeometry(5, 3);
        //const wallTexture = new THREE.TextureLoader().load('/assets/textures/wall.jpg');
        const wallMaterial = new THREE.MeshStandardMaterial({ map: texture });

        const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
        backWall.position.set(0, 1.5, -2.5); // adjust z to move it behind furniture
        backWall.rotation.y = 0; // face forward
        this.scene.add(backWall);

        // Side Wall (left side)
        const sideWallGeometry = new THREE.PlaneGeometry(5, 3);
        const sideWall = new THREE.Mesh(sideWallGeometry, wallMaterial.clone());
        sideWall.position.set(-2.5, 1.5, 0);
        sideWall.rotation.y = Math.PI / 2; // rotate 90° to face inward
        this.scene.add(sideWall);

        backWall.userData.isWall = true;
        sideWall.userData.isWall = true;
    }

    setupObjectSelection() {
      this.renderer.domElement.addEventListener('click', (event) => {
        const mouse = new THREE.Vector2(
          (event.clientX / window.innerWidth) * 2 - 1,
          -(event.clientY / window.innerHeight) * 2 + 1
        );
    
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);
    
        const intersects = raycaster.intersectObjects(this.scene.children, true);
    
        if (intersects.length > 0) {
          const selectedMesh = intersects[0].object;
    
          let root = selectedMesh;
          while (root.parent && root.parent.type !== 'Scene') {
            root = root.parent;
          }
    
          this.selectedObject = root;
    
          // Attach transform controls if you're using them (optional)
          if (this.transformControls) {
            this.transformControls.attach(this.selectedObject);
            this.scene.add(this.transformControls);
          }
    
          // Use ScaleUI to handle the UI side
          this.ScaleUI.show(root);
          this.RotateUI.show(root);
        }
      });
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
}