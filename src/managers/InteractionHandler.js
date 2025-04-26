import * as THREE from 'three';

export default class InteractionHandler {
  constructor(renderer, camera, scene, controls, collisionManager) {
    this.renderer = renderer;
    this.camera = camera;
    this.scene = scene;
    this.controls = controls;
    this.collisionManager = collisionManager;

    this.selectedObject = null;
    this.isDragging = false;

    this.offset = new THREE.Vector3();
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.lastMousePosition = new THREE.Vector2();
    this.lastIntersectionPoint = new THREE.Vector3();

    this.originalMaterials = new Map();
    this.highlightMaterial = new THREE.MeshStandardMaterial({ color: 0xffcc66 });

    this.groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0); // y=0 plane

    window.addEventListener('keydown', this.onKeyDown.bind(this));
    window.addEventListener('keyup', this.onKeyUp.bind(this));

    this.renderer.domElement.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.renderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.renderer.domElement.addEventListener('mouseup', this.onMouseUp.bind(this));
  }

  onKeyDown(event) {
    if (event.shiftKey) {
      this.controls.enabled = false;
    }
  }

  onKeyUp(event) {
    if (!event.shiftKey) {
      this.controls.enabled = true;
    }
  }

  onMouseDown(event) {
    if (!event.shiftKey) return;
  
    this.updateRaycaster(event);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);
  
    if (intersects.length > 0) {
      let selectedObject = intersects[0].object;
      
      // Prevent floor from being selected
      if (selectedObject.userData.isFloor) return;
      
      // Find the root collidable parent
      while (selectedObject.parent && 
             !selectedObject.userData.collidable && 
             selectedObject.parent.type !== 'Scene') {
        selectedObject = selectedObject.parent;
      }
      
      if (selectedObject.userData.collidable) {
        this.selectedObject = selectedObject;
        this.isDragging = true;
        this.lastIntersectionPoint.copy(intersects[0].point);
        this.lastMousePosition.set(event.clientX, event.clientY);
      }
    }
  }

  onMouseMove(event) {
    if (!this.isDragging || !this.selectedObject) return;
  
    this.updateRaycaster(event);
    const newPoint = new THREE.Vector3();
  
    if (this.raycaster.ray.intersectPlane(this.groundPlane, newPoint)) {
      const delta = newPoint.clone().sub(this.lastIntersectionPoint);
      const originalPosition = this.selectedObject.position.clone();
      
      // Apply movement in small steps for better collision detection
      const steps = 5;
      for (let i = 0; i < steps; i++) {
        this.selectedObject.position.x += delta.x / steps;
        this.selectedObject.position.z += delta.z / steps;
        this.selectedObject.updateWorldMatrix(true, true);
  
        if (this.checkCollision(this.selectedObject)) {
          console.log("Collision detected at step", i);
          this.selectedObject.position.copy(originalPosition);
          break;
        }
      }
  
      if (this.selectedObject.userData.snapToFloor) {
        this.snapObjectToFloor(this.selectedObject);
      }
  
      this.lastIntersectionPoint.copy(newPoint);
    }
  }

  onMouseUp() {
    if (this.isDragging && this.selectedObject) {
      if (this.originalMaterials.has(this.selectedObject)) {
        this.selectedObject.material = this.originalMaterials.get(this.selectedObject);
      }
    }

    this.isDragging = false;
    this.selectedObject = null;
  }

  checkCollision(objectToMove) {
    objectToMove.updateWorldMatrix(true, true);
    const movingBox = new THREE.Box3().setFromObject(objectToMove);
    
    // Get all collidable objects EXCEPT the moving object and its children
    const objectsToCheck = this.collisionManager.collidableObjects.filter(obj => {
      return obj !== objectToMove && !objectToMove.children.includes(obj);
    });
  
    for (const obj of objectsToCheck) {
      obj.updateWorldMatrix(true, true);
      const objBox = new THREE.Box3().setFromObject(obj);
      
      if (movingBox.intersectsBox(objBox)) {
        console.log(`Collision between ${objectToMove.name} and ${obj.name}`);
        return true;
      }
    }
    return false;
  }

  updateRaycaster(event) {
    this.updateMousePosition(event);
    this.raycaster.setFromCamera(this.mouse, this.camera);
  }  

  updateMousePosition(event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  showBoundingBox(object) {
    const box = new THREE.Box3().setFromObject(object);
    const helper = new THREE.Box3Helper(box, 0xffff00);
    this.scene.add(helper);
    
    // Remove after 2 seconds
    setTimeout(() => {
      this.scene.remove(helper);
    }, 1);
  }

  // In InteractionHandler.js
  snapObjectToFloor(object) {
    if (!object.userData.boundingBox) {
      // Calculate bounding box if not already stored
      const box = new THREE.Box3().setFromObject(object);
      const height = box.max.y - box.min.y;
      object.userData.boundingBox = { 
        height, 
        offsetY: box.min.y 
      };
    }
    // Snap to floor based on the object's bounding box
    object.position.y = -object.userData.boundingBox.offsetY;
    
    // Force update the world matrix
    object.updateWorldMatrix(true, true);
  }
}
