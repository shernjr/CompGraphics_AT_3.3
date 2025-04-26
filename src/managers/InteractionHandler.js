import * as THREE from 'three';

export default class InteractionHandler {
  constructor(renderer, camera, scene, controls) {
    this.renderer = renderer;
    this.camera = camera;
    this.scene = scene;
    this.controls = controls;

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
    
      while (selectedObject.parent && selectedObject.parent.type !== 'Scene') {
        selectedObject = selectedObject.parent;
      }
    
      this.selectedObject = selectedObject;
      this.isDragging = true;
      this.lastIntersectionPoint.copy(intersects[0].point);
      this.lastMousePosition.set(event.clientX, event.clientY);
    }
    
  }

  onMouseMove(event) {
    if (!this.isDragging || !this.selectedObject) return;
  
    // Move along the XZ ground plane
    this.updateRaycaster(event);
    const newPoint = new THREE.Vector3();
  
    if (this.raycaster.ray.intersectPlane(this.groundPlane, newPoint)) {
      const delta = new THREE.Vector3().subVectors(newPoint, this.lastIntersectionPoint);
      this.selectedObject.position.x += delta.x;
      this.selectedObject.position.z += delta.z;
  
      // Keep object on the floor
      if (this.selectedObject.userData.snapToFloor) {
        // Only calculate bounding box once at the beginning to prevent issues
        if (!this.selectedObject.userData.boundingBox) {
          const box = new THREE.Box3().setFromObject(this.selectedObject);
          const height = box.max.y - box.min.y;
          this.selectedObject.userData.boundingBox = { height, offsetY: box.min.y };  // Store the height and offset
        }
  
        // Set the position based on the bounding box offset
        this.selectedObject.position.y = -this.selectedObject.userData.boundingBox.offsetY;
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

  updateRaycaster(event) {
    this.updateMousePosition(event);
    this.raycaster.setFromCamera(this.mouse, this.camera);
  }  

  updateMousePosition(event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }
}
