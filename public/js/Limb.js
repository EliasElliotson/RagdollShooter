import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class Limb {
    bodies = [];
    meshes = [];
    material;
    totalLength = 0;

    constructor(config) {
        this.material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });

        for (let i = 0; i < config.length; i++) {
            const body = config[i];
            
            if (body.type === 'segment') {

                // Add the physics body
                const segmentShape = new CANNON.Box(new CANNON.Vec3(body.radius, body.length, body.radius))
                const segment = new CANNON.Body({ mass: 1 })

                this.totalLength += body.length * 2;

                segment.addShape(segmentShape)
                segment.position.set(0, 2 + this.totalLength, 0)
                segment.updateMassProperties()

                this.bodies.push(segment);


                // Limb mesh
                const geometry = new THREE.BoxGeometry(body.radius * 2, body.length * 2, body.radius * 2);
                const cube = new THREE.Mesh(geometry, this.material);
                
                this.meshes.push(cube);
            }
        }
    }

    updateMesh() {
        for (let i = 0; i < this.bodies.length; i++) {
            const body = this.bodies[i];
            const mesh = this.meshes[i];

            mesh.position.copy(body.position);
            mesh.quaternion.copy(body.quaternion);
        }
    }

    addMeshes(scene) {
        for (let mesh of this.meshes) {
            scene.add(mesh);
        }
    }

    addBodies(world) {
        for (let body of this.bodies) {
            world.addBody(body);
        }
    }
}

/*
{
    type: "joint", "segment",
    radius: number,
    length: number
}
*/