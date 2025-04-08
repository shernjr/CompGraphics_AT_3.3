import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default class ObjectManager {

    constructor(scene) {
        this.scene = scene;
        this.loader = new GLTFLoader();
        this.models = {};
    }

    loadModel(name, path, onLoaded) {
        this.loader.load(path, (gltf) => {const model = gltf.scene; model.name = name;
                //optionally store clone for reuse.
                this.models[name] = model; 
                onLoaded?.(model);

            },
                undefined, (error) => {console.error(`Error loading model ${name}:`, error);
            }
        );
    }

    placeClone(name, position, scale = 1) {
        const original = this.models[name];
        if (!original) {
            console.warn(`Model '${name}' not loaded yet.`);
        return;
        }
        const clone = original.clone();
        clone.position.copy(position);
        clone.scale.setScalar(scale);
        this.scene.add(clone);
        return clone;
    }
}

