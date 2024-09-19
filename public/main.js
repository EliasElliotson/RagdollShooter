import * as THREE from 'three';
import * as CANNON from 'cannon-es'
import { Limb } from './js/Limb';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

/****************************************************************************************************************************************************
 * RENDERER STUFF
 ***************************************************************************************************************************************************/

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

// Plane floor
const planeGeometry = new THREE.PlaneGeometry(7, 7);
const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.position.y = -2;
plane.rotation.x = Math.PI / 2
scene.add(plane);

// Ambient light
const light = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(light);

// Hemisphere light
const light2 = new THREE.HemisphereLight(0xffffff, 0x000000, 1);
scene.add(light2);

// Pointer lock controls
const controls = new PointerLockControls(camera, document.body);
// controls.addEventListener('lock', () => { });
// controls.addEventListener('unlock', () => { });
document.addEventListener('click', () => { controls.lock(); })

camera.position.z = 5;


/****************************************************************************************************************************************************
 * PHYSICS STUFF
 ***************************************************************************************************************************************************/

// Initialize the physics world
const world = new CANNON.World({
    gravity: new CANNON.Vec3(0, -10, 0)
});

// Add the floor
const planeShape = new CANNON.Plane()
const planeBody = new CANNON.Body({ mass: 0, shape: planeShape })
planeBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
planeBody.position.set(0, -2, 0);
planeBody.updateMassProperties()
world.addBody(planeBody)

// Ragdoll limb
const limb = new Limb([
    {
        type: "segment",
        radius: 0.1,
        length: 0.5
    },
    {
        type: "segment",
        radius: 0.1,
        length: 0.5
    },
    {
        type: "segment",
        radius: 0.1,
        length: 0.5
    }
]);

limb.addBodies(world);
limb.addMeshes(scene)


/****************************************************************************************************************************************************
 * RUNNER STUFF
 ***************************************************************************************************************************************************/

function animate() {
    world.fixedStep();

    limb.updateMesh();


    renderer.render(scene, camera);
}