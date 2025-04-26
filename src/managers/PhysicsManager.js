import * as CANNON from 'cannon-es';

export default class PhysicsManager {
  constructor() {
    this.world = new CANNON.World();
    this.world.gravity.set(0, -9.82, 0); // Earth-like gravity
    
    this.objects = [];
  }

  addObject(object, mass, shapeType = 'box') {
    const material = new CANNON.Material();
    let shape;
  
    // Loop through meshes if the object contains multiple meshes
    const meshes = object.isGroup ? object.children : [object];
  
    meshes.forEach((mesh) => {
      if (!mesh.geometry) {
        console.warn('No geometry found for mesh:', mesh.name);
        return; // Skip if there's no geometry
      }
  
      let shape;
  
      // Create a physics shape for the object
      if (shapeType === 'box') {
        const size = mesh.geometry.parameters;
        shape = new CANNON.Box(new CANNON.Vec3(size.width / 2, size.height / 2, size.depth / 2));
      } else if (shapeType === 'sphere') {
        shape = new CANNON.Sphere(mesh.geometry.parameters.radius);
      }
  
      // Create a body with a given mass
      const body = new CANNON.Body({
        mass: mass, 
        position: new CANNON.Vec3(mesh.position.x, mesh.position.y, mesh.position.z),
        material: material
      });
  
      body.addShape(shape);
      this.world.addBody(body);
  
      this.objects.push({ object: mesh, body });
    });
  }
  

  updatePhysics() {
    this.world.step(1 / 60); // Update physics at 60 FPS

    // Sync object positions with physics bodies
    for (let i = 0; i < this.objects.length; i++) {
      const { object, body } = this.objects[i];
      object.position.copy(body.position);
      object.rotation.set(body.rotation.x, body.rotation.y, body.rotation.z);
    }
  }
}
