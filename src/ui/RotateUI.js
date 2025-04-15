import * as THREE from 'three';

export default class RotateUI {
    constructor(onRotateChange) {
      this.panel = document.getElementById('rotate-controls');
      this.nameLabel = document.getElementById('selected-object-rotation-name');
      this.rotateX = document.getElementById('rotate-x');
      this.rotateY = document.getElementById('rotate-y');
      this.rotateZ = document.getElementById('rotate-z');
  
      this.onRotateChange = onRotateChange;
  
      this.rotateX.addEventListener('input', () => this.updateRotation());
      this.rotateY.addEventListener('input', () => this.updateRotation());
      this.rotateZ.addEventListener('input', () => this.updateRotation());
    }
  
    show(object) {
      this.currentObject = object;
      this.panel.style.display = 'block';
      this.nameLabel.textContent = `Selected: ${object.name}`;
  
      this.rotateX.value = THREE.MathUtils.radToDeg(object.rotation.x);
      this.rotateY.value = THREE.MathUtils.radToDeg(object.rotation.y);
      this.rotateZ.value = THREE.MathUtils.radToDeg(object.rotation.z);
    }
  
    hide() {
      this.currentObject = null;
      this.panel.style.display = 'none';
    }
  
    updateRotation() {
      if (this.currentObject) {
        this.currentObject.rotation.set(
          THREE.MathUtils.degToRad(parseFloat(this.rotateX.value)),
          THREE.MathUtils.degToRad(parseFloat(this.rotateY.value)),
          THREE.MathUtils.degToRad(parseFloat(this.rotateZ.value))
        );
        this.onRotateChange?.(this.currentObject);
      }
    }
  }
  