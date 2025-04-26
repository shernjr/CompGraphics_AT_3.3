import * as THREE from 'three';

export default class CollisionManager {
    constructor(scene) {
      this.scene = scene;
      this.collidableObjects = [];
    }
  
    registerCollidable(object) {
      if (object.userData.collidable && !this.collidableObjects.includes(object)) {
        this.collidableObjects.push(object);
        
        // Recursively register all children if they're meshes
        object.traverse(child => {
          if (child.isMesh && child.userData.collidable !== false) {
            this.collidableObjects.push(child);
          }
        });
      }
    }
  
    unregisterCollidable(object) {
      this.collidableObjects = this.collidableObjects.filter(obj => 
        obj !== object && !object.children.includes(obj)
      );
    }
  
    checkCollision(object) {
      object.updateWorldMatrix(true, true);
      const box = new THREE.Box3().setFromObject(object);
  
      for (const otherObject of this.collidableObjects) {
        if (otherObject === object) continue;
  
        otherObject.updateWorldMatrix(true, true);
        const otherBox = new THREE.Box3().setFromObject(otherObject);
        
        if (box.intersectsBox(otherBox)) {
          return true;
        }
      }
      return false;
    }
  }