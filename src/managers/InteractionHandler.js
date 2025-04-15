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

    this.originalMaterials = new Map();
    this.highlightMaterial = new THREE.MeshStandardMaterial({ color: 0xffcc66 });

    // Create a ground plane for intersection
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

    this.updateMousePosition(event);

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    if (intersects.length > 0) {
      const selectedMesh = intersects[0].object;

      // Traverse up to the scene root
      let root = selectedMesh;
      while (root.parent && root.parent.type !== 'Scene') {
        root = root.parent;
      }

      this.selectedObject = root;
      this.isDragging = true;

      // Store original material
      if (!this.originalMaterials.has(this.selectedObject)) {
        this.originalMaterials.set(this.selectedObject, this.selectedObject.material);
      }

      // Highlight selection
      this.selectedObject.material = this.highlightMaterial;

      // Calculate offset for dragging
      const intersectionPoint = intersects[0].point;
      this.offset.copy(this.selectedObject.position).sub(intersectionPoint);

      this.lastMousePosition.set(event.clientX, event.clientY);
    }
  }

  onMouseMove(event) {
    if (this.isDragging && this.selectedObject) {
      this.updateMousePosition(event);

      // Raycast against the ground plane (y=0)
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersectionPoint = new THREE.Vector3();
      this.raycaster.ray.intersectPlane(this.groundPlane, intersectionPoint);

      if (intersectionPoint) {
        this.selectedObject.position.copy(intersectionPoint.add(this.offset));
      }
    }
  }

  onMouseUp() {
    if (this.isDragging && this.selectedObject) {
      // Restore original material
      if (this.originalMaterials.has(this.selectedObject)) {
        this.selectedObject.material = this.originalMaterials.get(this.selectedObject);
      }

      this.isDragging = false;
      //this.selectedObject = null;
    }
  }

  updateMousePosition(event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }
}
