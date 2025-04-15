export default class ScaleUI {
    constructor(onScaleChange) {
      this.panel = document.getElementById('scale-controls');
      this.nameLabel = document.getElementById('selected-object-name');
      this.scaleX = document.getElementById('scale-x');
      this.scaleY = document.getElementById('scale-y');
      this.scaleZ = document.getElementById('scale-z');
  
      this.onScaleChange = onScaleChange;
  
      this.scaleX.addEventListener('input', () => this.updateScale());
      this.scaleY.addEventListener('input', () => this.updateScale());
      this.scaleZ.addEventListener('input', () => this.updateScale());
    }
  
    show(object) {
      this.currentObject = object;
      this.panel.style.display = 'block';
      this.nameLabel.textContent = `Selected: ${object.name}`;
  
      this.scaleX.value = object.scale.x;
      this.scaleY.value = object.scale.y;
      this.scaleZ.value = object.scale.z;
    }
  
    hide() {
      this.currentObject = null;
      this.panel.style.display = 'none';
    }
  
    updateScale() {
      if (this.currentObject) {
        this.currentObject.scale.set(
          parseFloat(this.scaleX.value),
          parseFloat(this.scaleY.value),
          parseFloat(this.scaleZ.value)
        );
        this.onScaleChange?.(this.currentObject);
      }
    }
  }
  