export default class CollisionManager {
    constructor(scene) {
      this.scene = scene;
      this.collidableObjects = [];  // Store references to collidable objects
    }
  
    // Register an object as collidable
    registerCollidable(object) {
      if (object.userData.collidable && !this.collidableObjects.includes(object)) {
        this.collidableObjects.push(object);
      }
    }
  
    // Unregister an object from collision checks
    unregisterCollidable(object) {
      const index = this.collidableObjects.indexOf(object);
      if (index !== -1) {
        this.collidableObjects.splice(index, 1);
      }
    }
  
    // Check if the object collides with any collidable object in the scene
    checkCollision(object) {
      const box = new THREE.Box3().setFromObject(object);
  
      // Check for intersection with all collidable objects
      for (let i = 0; i < this.collidableObjects.length; i++) {
        const otherObject = this.collidableObjects[i];
  
        // Skip the object itself or objects that are not collidable
        if (otherObject === object) continue;
  
        const otherBox = new THREE.Box3().setFromObject(otherObject);
        
        // If there's an intersection, return true
        if (box.intersectsBox(otherBox)) {
          return true;
        }
      }
  
      return false; // No collision
    }
  }
  