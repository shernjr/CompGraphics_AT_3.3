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
          antialias: true,
          powerPreference: "high-performance"
      });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.physicallyCorrectLights = true;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        this.animate = this.animate.bind(this);
    }

    init() {
        this.addLights();
        this.addFloor();        

        this.objectManager = new ObjectManager(this.scene);
        this.collisionManager = new CollisionManager(this.scene);

        this.loadModels();
        //this.CreateTestBoxes();
        
        this.InteractionHandler = new InteractionHandler(this.renderer, this.camera, this.scene, this.controls, this.collisionManager);

        this.setupObjectSelection();

        this.animate();
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    loadModels() {
      // Store reference to 'this' for use in callbacks
      const app = this;
    
      // Helper function to find the root parent
      const getRootParent = (object) => {
        while (object.parent && object.parent.type !== 'Scene') {
          object = object.parent;
        }
        return object;
      };
    
      // Bathroom Cabinet
      this.objectManager.loadModel('bathroom cabinet', '/assets/models/bathroom_cabinet.glb', (model) => {
        console.log('bathroom cabinet model loaded');
        const texture = new THREE.TextureLoader().load('/assets/textures/aircraftpanels.jpg');
        const rootModel = getRootParent(model);
        
        rootModel.traverse((child) => {
          if (child.isMesh) {
            child.material.map = texture;
            child.material.needsUpdate = true;
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        
        rootModel.userData = {
          collidable: true,
          name: 'bathroom cabinet',
          boundingBox: app.calculateBoundingBox(rootModel)
        };
        
        rootModel.scale.set(1.2, 1.2, 1.2);
        rootModel.position.set(-0.5, -0.5, 0);
        app.scene.add(rootModel);
        app.collisionManager.registerCollidable(rootModel);
      });
    
      // Soap Dispenser
      this.objectManager.loadModel('soap dispenser', '/assets/models/soap_dispenser.glb', (model) => {
        console.log('soap dispenser model loaded');
        const rootModel = getRootParent(model);

        rootModel.traverse((child) => {
          if (child.isMesh) {
              child.castShadow = true;    // Will cast shadows
              child.receiveShadow = true; // Will receive shadows
          }
        });
        
        rootModel.userData = {
          collidable: true,
          name: 'soap dispenser',
          snapToFloor: true,
          boundingBox: app.calculateBoundingBox(rootModel)
        };
        
        rootModel.scale.set(0.05, 0.05, 0.05);
        rootModel.position.set(1, 0, 0);
        app.scene.add(rootModel);
        app.collisionManager.registerCollidable(rootModel);
      });
    
      // Electric Toothbrush
      this.objectManager.loadModel('electric toothbrush', '/assets/models/electric_toothbrush.glb', (model) => {
        console.log('electric toothbrush model loaded');
        const rootModel = getRootParent(model);

        rootModel.traverse((child) => {
          if (child.isMesh) {
              child.castShadow = true;    // Will cast shadows
              child.receiveShadow = true; // Will receive shadows
          }
      });
        
        rootModel.userData = {
          collidable: true,
          name: 'electric toothbrush',
          snapToFloor: true,
          boundingBox: app.calculateBoundingBox(rootModel)
        };
        
        rootModel.scale.set(2, 2, 2);
        rootModel.position.set(2, 0, 0);
        app.scene.add(rootModel);
        app.collisionManager.registerCollidable(rootModel);
      });
    
      // Mug
      this.objectManager.loadModel('mug', '/assets/models/mug.glb', (model) => {
        console.log('glass mug model loaded');
        const rootModel = getRootParent(model);
        const texture = new THREE.TextureLoader().load('/assets/textures/aircraftpanels.jpg');
        
        rootModel.traverse((child) => {
          if (child.isMesh) {
            child.material.map = texture;
            child.material.needsUpdate = true;
            child.material.roughness = 0.6;
            child.material.metalness = 0.1;
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        
        const boundingBox = app.calculateBoundingBox(rootModel);
        rootModel.userData = {
          collidable: true,
          name: 'mug',
          snapToFloor: true,
          boundingBox: boundingBox
        };
        
        rootModel.scale.set(1, 1, 1);
        rootModel.position.y = -boundingBox.offsetY;
        app.scene.add(rootModel);
        app.collisionManager.registerCollidable(rootModel);
      });
    
      // Standing Mirror
      this.objectManager.loadModel('antique_standing_mirror', '/assets/models/antique_standing_mirror.glb', (model) => {
        console.log('standing mirror model loaded');
        const rootModel = getRootParent(model);
        
        rootModel.traverse((child) => {
          if (child.isMesh) {
            child.material.needsUpdate = true;
            child.material.roughness = 0.7;
            child.material.metalness = 0.2;
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        
        const boundingBox = app.calculateBoundingBox(rootModel);
        rootModel.userData = {
          collidable: true,
          name: 'antique_standing_mirror',  // Fixed: was 'bathroom cabinet'
          boundingBox: boundingBox
        };
        
        rootModel.scale.set(1, 1, 1);  // Added scale
        rootModel.position.y = -boundingBox.offsetY;
        rootModel.position.set(1.5, 0, -1);
        app.scene.add(rootModel);
        app.collisionManager.registerCollidable(rootModel);
      });

      // Floor Lamp
      this.objectManager.loadModel('floor lamp', '/assets/models/japanesefloorlamp.glb', (model) => {
        console.log('floor lamp model loaded');
        const rootModel = getRootParent(model);

        // Create the lamp light (stronger and with better falloff)
        const lampLight = new THREE.PointLight(0xfff8e7, 5, 3, 2);
        lampLight.castShadow = true;
        lampLight.shadow.mapSize.width = 1024;
        lampLight.shadow.mapSize.height = 1024;
        lampLight.shadow.bias = -0.001;

        // Find the bulb mesh and configure materials
        rootModel.traverse((child) => {
            if (child.isMesh) {
                // Enable shadows for all parts
                child.castShadow = true;
                child.receiveShadow = true;

                // Configure bulb material (emissive)
                if (child.name === 'Circle.002' || child.material?.name === 'Glass Archviz.001') {
                    child.material = new THREE.MeshPhysicalMaterial({
                        emissive: 0xfff8e7,
                        emissiveIntensity: 100,
                        color: 0xfff8e7,
                        roughness: 0.1,
                        metalness: 0.0,
                        transparent: true,
                        opacity: 0.8
                    });
                    
                    // Attach light to bulb
                    lampLight.position.copy(child.position);
                    child.add(lampLight);
                }


            }
        });

        const boundingBox = app.calculateBoundingBox(rootModel);
        rootModel.userData = {
            collidable: true,
            name: 'floor lamp',
            boundingBox: boundingBox
        };

        rootModel.scale.set(1, 1, 1);
        rootModel.position.set(0.5, 0, -1);
        app.scene.add(rootModel);
        app.collisionManager.registerCollidable(rootModel);
        
        // Store reference to the light
        this.lampLight = lampLight;
      });
    }

    addLights() {
      // Ambient light - soft overall illumination
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
      this.scene.add(ambientLight);
  
      // Directional light - main sun light with shadows
      // const sunLight = new THREE.DirectionalLight(0xfff8e7, 1);
      // sunLight.position.set(5, 10, 5);
      // sunLight.castShadow = true;
      
      // // Shadow quality settings
      // sunLight.shadow.mapSize.width = 2048;
      // sunLight.shadow.mapSize.height = 2048;
      // sunLight.shadow.camera.near = 0.5;
      // sunLight.shadow.camera.far = 50;
      // sunLight.shadow.camera.left = -10;
      // sunLight.shadow.camera.right = 10;
      // sunLight.shadow.camera.top = 10;
      // sunLight.shadow.camera.bottom = -10;
      // sunLight.shadow.bias = -0.001;
      
      // this.scene.add(sunLight);
  
      // Lamp light - point light for the floor lamp
      this.lampLight = new THREE.PointLight(0xfff8e7, 2, 5, 2);
      this.lampLight.position.set(0.5, 1.5, -1); // Adjust to match lamp position
      this.lampLight.castShadow = true;
      
      // Point light shadow settings
      this.lampLight.shadow.mapSize.width = 1024;
      this.lampLight.shadow.mapSize.height = 1024;
      this.lampLight.shadow.camera.near = 0.1;
      this.lampLight.shadow.camera.far = 10;
      
      this.scene.add(this.lampLight);
  
      // Optional: Add subtle rim lighting
      const rimLight = new THREE.DirectionalLight(0xffffff, 0.5);
      rimLight.position.set(-5, 5, 5);
      this.scene.add(rimLight);
  }

    addFloor() {
      const textureLoader = new THREE.TextureLoader();
  
      // Load all needed textures
      const aoTexture = textureLoader.load('/assets/textures/tile+bump/tiles_0129_ao_1k.jpg'); // for floor diffuse
      const colorTexture = textureLoader.load('/assets/textures/tile+bump/tiles_0129_color_1k.jpg'); // for wall diffuse
      const normalTexture = textureLoader.load('/assets/textures/tile+bump/tiles_0129_normal_opengl_1k.png'); // normal map
  
      // Set repeating for textures
      aoTexture.wrapS = aoTexture.wrapT = THREE.RepeatWrapping;
      colorTexture.wrapS = colorTexture.wrapT = THREE.RepeatWrapping;
      normalTexture.wrapS = normalTexture.wrapT = THREE.RepeatWrapping;
  
      aoTexture.repeat.set(4, 4); // 4x4 tiles on the floor
      colorTexture.repeat.set(4, 4); // 4x4 tiles on the walls
      normalTexture.repeat.set(4, 4);      
  
      // Create floor material
      const floorMaterial = new THREE.MeshStandardMaterial({
        map: aoTexture,
        normalMap: normalTexture,
        normalScale: new THREE.Vector2(4, 4),
        roughness: 0.6,
      });          
  
      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(5, 5),
        floorMaterial
      );
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      floor.userData.isFloor = true;
      floor.name = 'floor';
      this.scene.add(floor);
  
      // Create wall material (clone to keep independent materials)
      const wallMaterial = new THREE.MeshStandardMaterial({
        map: colorTexture,
        normalMap: normalTexture,
        normalScale: new THREE.Vector2(2, 2), // ✨ also for walls
        roughness: 0.6,
      });
  
      // Back Wall (behind the vanity)
      const backWallGeometry = new THREE.PlaneGeometry(5, 3);
      const backWall = new THREE.Mesh(backWallGeometry, wallMaterial.clone());
      backWall.position.set(0, 1.5, -2.5);
      backWall.rotation.y = 0;
      backWall.receiveShadow = true;
      backWall.userData.isWall = true;
      this.scene.add(backWall);
  
      // Side Wall (left side)
      const sideWallGeometry = new THREE.PlaneGeometry(5, 3);
      const sideWall = new THREE.Mesh(sideWallGeometry, wallMaterial.clone());
      sideWall.position.set(-2.5, 1.5, 0);
      sideWall.rotation.y = Math.PI / 2;
      sideWall.receiveShadow = true;
      sideWall.userData.isWall = true;
      this.scene.add(sideWall);
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
            
            // Find the root parent object
            let root = selectedMesh;
            while (root.parent && root.parent.type !== 'Scene') {
                root = root.parent;
            }

            // Special handling for floor lamp
            if (root.userData && root.userData.name === 'floor lamp') {
                this.selectedObject = root;
                // The lamp light will automatically move with the lamp since it's parented to the bulb
                
                // Highlight the lamp if needed
                root.traverse(child => {
                    if (child.isMesh) {
                        child.material.emissive?.setHex(0x333333); // Slight highlight
                    }
                });
            } else {
                // Regular object selection
                this.selectedObject = root;
            }

            // Attach transform controls if available
            if (this.transformControls) {
                this.transformControls.attach(this.selectedObject);
                this.scene.add(this.transformControls);
            }

            // Show UI controls
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

  // Add this method to your App class (at the class level, not inside another method)
  calculateBoundingBox(object) {
    object.updateWorldMatrix(true, true);
    const box = new THREE.Box3().setFromObject(object);
    return {
      min: box.min,
      max: box.max,
      size: box.getSize(new THREE.Vector3()),
      height: box.max.y - box.min.y,
      offsetY: box.min.y
    };
  }
}