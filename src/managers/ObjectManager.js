import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

export default class ObjectManager {
  constructor(scene) {
    this.scene = scene;
    this.loader = new GLTFLoader();
    
    // Set up Draco loader
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
    this.loader.setDRACOLoader(dracoLoader);
  }

  loadModel(name, path, onLoad) {
    this.loader.load(
      path,
      (gltf) => {
        const model = gltf.scene;
        model.name = name;
        onLoad(model);
      },
      undefined,
      (error) => {
        console.error(`Error loading model ${name}:`, error);
      }
    );
  }
}