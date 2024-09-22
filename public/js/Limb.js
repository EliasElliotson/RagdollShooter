import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class Limb {
    bodies = [];
    meshes = [];
    material;
    totalLength = 0;
    config;

    constructor(config) {
        this.material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
        this.config = config;

        for (let i = 0; i < config.length; i++) {
            const body = config[i];
            
            if (body.type === 'segment') {

                // Add the physics body
                const segmentShape = new CANNON.Cylinder(body.radius, body.radius, body.length * 2)
                const segment = new CANNON.Body({ mass: 1 })

                segment.addShape(segmentShape)
                segment.position.set(0, this.totalLength, 0)
                segment.updateMassProperties()

                this.totalLength += body.length * 2;
                this.bodies.push(segment);


                // Limb mesh
                const geometry = new THREE.CylinderGeometry(body.radius, body.radius, body.length * 2, 16, 1);
                const cube = new THREE.Mesh(geometry, this.material);
                
                this.meshes.push(cube);
            } else if (body.type === 'joint') {

                // Add the physics body
                const segmentShape = new CANNON.Sphere(body.radius)
                const segment = new CANNON.Body({ mass: 1 })

                segment.addShape(segmentShape)
                segment.position.set(0, this.totalLength - 0.5 + body.radius, 0)
                segment.updateMassProperties()

                this.totalLength += body.radius * 2;
                this.bodies.push(segment);


                // Limb mesh
                const geometry = new THREE.SphereGeometry( body.radius, 16, 8 );
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

        for (let i = 0; i < this.bodies.length - 1; i++) {
            const bodyA = this.bodies[i];
            const bodyB = this.bodies[i + 1];
            const configA = this.config[i];
            const configB = this.config[i + 1];

            let bodyAY = 0;
            let bodyBY = 0;

            if (configA.type === 'segment') {
                bodyAY += configA.length;
            }

            if (configB.type === 'segment') {
                bodyBY -= configB.length;
            }

            if (configA.type === 'joint') {
                bodyBY -= configA.radius;
            }

            if (configB.type === 'joint') {
                bodyAY += configB.radius;
            }

            const localPivotA = new CANNON.Vec3(bodyA.position.x, bodyAY, bodyA.position.z)
            const localPivotB = new CANNON.Vec3(bodyB.position.x, bodyBY, bodyB.position.z)
            const constraint = new CANNON.ConeTwistConstraint(bodyA, bodyB, {
                pivotA: localPivotA,
                pivotB: localPivotB,
                axisA: CANNON.Vec3.UNIT_Y,
                axisB: CANNON.Vec3.UNIT_Y,
                angle: Math.PI,
                twistAngle: Math.PI / 2,
            })

            world.addConstraint(constraint)
        }
    }
}
