import * as THREE from 'three';

export default class CollisionManager {
    constructor(scene) {
      this.scene = scene;
      this.collidableObjects = [];
    }
  
    registerCollidable(object) {
      // Only register if it's a root object and not already registered
      if (object.userData.collidable && 
          !object.parent?.userData?.collidable && 
          !this.collidableObjects.includes(object)) {
        this.collidableObjects.push(object);
        console.log(`Registered ${object.userData.name || 'object'} for collision`);
      }
    }
  
    unregisterCollidable(object) {
      const index = this.collidableObjects.indexOf(object);
      if (index !== -1) {
        this.collidableObjects.splice(index, 1);
      }
    }
  
    checkCollision(object) {
      object.updateWorldMatrix(true, true);
      const box = new THREE.Box3().setFromObject(object);
  
      for (const otherObject of this.collidableObjects) {
        if (otherObject === object) continue;
  
        otherObject.updateWorldMatrix(true, true);
        const otherBox = new THREE.Box3().setFromObject(otherObject);
        
        if (box.intersectsBox(otherBox)) {
          console.log(`Collision between ${object.userData.name} and ${otherObject.userData.name}`);
          return true;
        }
      }
      return false;
    }
  }