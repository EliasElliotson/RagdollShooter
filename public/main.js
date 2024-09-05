import * as THREE from 'three';
import * as CANNON from 'cannon-es'
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

/****************************************************************************************************************************************************
 * UTILITY STUFF
 ***************************************************************************************************************************************************/

function rotationBody(body) {
    body.setRotation = function (vec) {
        this.quaternion.setFromEuler(vec.x, vec.y, vec.z)
    }.bind(body);

    return body;
}


/****************************************.************************************************************************************************************
 * RENDERER STUFF
 ***************************************************************************************************************************************************/

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

// Rotating cube
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

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

// Initialize the box
const shape1 = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5))
const boxBody1 = rotationBody(new CANNON.Body({ mass: 1 }))
boxBody1.addShape(shape1)
boxBody1.position.set(0, 2, 0)
boxBody1.setRotation(new CANNON.Vec3(Math.PI / 4, Math.PI / 4, 0))
boxBody1.updateMassProperties()
world.addBody(boxBody1)

// Add the floor
const planeShape = new CANNON.Plane()
const planeBody = new CANNON.Body({ mass: 0, shape: planeShape })
planeBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0) // make it face up
planeBody.position.set(0, -2, 0);
planeBody.updateMassProperties()
world.addBody(planeBody)


/****************************************************************************************************************************************************
 * RUNNER STUFF
 ***************************************************************************************************************************************************/

function animate() {
    world.fixedStep();

    cube.position.copy(boxBody1.position);
    cube.quaternion.copy(boxBody1.quaternion);


    renderer.render(scene, camera);
}