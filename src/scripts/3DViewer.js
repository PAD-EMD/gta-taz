// import './style.css'
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import modelUrl from "/models3D/gta-light.glb?url";

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

// Camera
const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
);
camera.position.set(0, 2, 3);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.querySelector("#app").appendChild(renderer.domElement);

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 1;
controls.maxDistance = 20;

// Camera animation variables
let targetCameraPosition = null;
let targetControlsTarget = null;
const animationSpeed = 0.05;

// Lock vertical rotation - only horizontal rotation allowed
controls.minPolarAngle = Math.PI / 2;
controls.maxPolarAngle = Math.PI / 2;

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// On crée les objets sélectionnables dans leur groupe
var selectionables = new THREE.Group();
scene.add(selectionables);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
directionalLight.castShadow = true;
scene.add(directionalLight);

const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight2.position.set(-5, 5, -5);
scene.add(directionalLight2);

// Add geometric shapes around the center
// Pink cube
const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0xff69b4 });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.position.set(3, 0, 0);
cube.castShadow = true;
cube.name = "Target3";
scene.add(cube);
selectionables.add(cube);

// Sphere
const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0x4169e1 });
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.position.set(-3, 0, 0);
sphere.castShadow = true;
sphere.name = "Target2";
scene.add(sphere);
selectionables.add(sphere);

// Cylinder
const cylinderGeometry = new THREE.CylinderGeometry(0.5, 0.5, 2, 32);
const cylinderMaterial = new THREE.MeshStandardMaterial({ color: 0x32cd32 });
const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
cylinder.position.set(0, 0, 3);
cylinder.castShadow = true;
cylinder.name = "Target1";
scene.add(cylinder);
selectionables.add(cylinder);


// Load GLB model
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath(
	"https://www.gstatic.com/draco/versioned/decoders/1.5.6/"
);

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

loader.load(
	modelUrl,
	(gltf) => {
		const model = gltf.scene;

		// Center the model
		const box = new THREE.Box3().setFromObject(model);
		const center = box.getCenter(new THREE.Vector3());
		model.position.sub(center);

		// Adjust camera based on model size
		const size = box.getSize(new THREE.Vector3());
		const maxDim = Math.max(size.x, size.y, size.z);
		camera.position.set(0, maxDim * 0.5, maxDim * 0.3);
		controls.target.set(0, 0, 0);
		controls.update();

		scene.add(model);
		console.log("Model loaded successfully!");
	},
	(progress) => {
		console.log(
			"Loading progress:",
			((progress.loaded / progress.total) * 100).toFixed(2) + "%"
		);
	},
	(error) => {
		console.error("Error loading model:", error);
	}
);

// Handle window resize
window.addEventListener("resize", () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
});

renderer.domElement.addEventListener("click", onMouseClick);

// Animation loop
function animate() {
	requestAnimationFrame(animate);
	
	// Animate camera to target position
	if (targetCameraPosition) {
		camera.position.lerp(targetCameraPosition, animationSpeed);
		controls.target.lerp(targetControlsTarget, animationSpeed);
		
		// Stop animation when close enough
		if (camera.position.distanceTo(targetCameraPosition) < 0.01) {
			targetCameraPosition = null;
			targetControlsTarget = null;
		}
	}
	
	controls.update();
	renderer.render(scene, camera);
}

animate();

var raycaster = new THREE.Raycaster();

function focusOnObject(object) {
	// Calculate target position for camera (slightly away from object)
	const objectPosition = new THREE.Vector3();
	object.getWorldPosition(objectPosition);
	
	// Position camera at a nice angle from the object
	const offset = new THREE.Vector3(2, 1, 2);
	targetCameraPosition = objectPosition.clone().add(offset);
	targetControlsTarget = objectPosition.clone();
}

function getSelectionneLePlusProche(position) {
	// Mise à jour de la position du rayon à lancer.
	raycaster.setFromCamera(position, camera);
	// Obtenir la liste des intersections
	var selectionnes = raycaster.intersectObjects(selectionables.children);
	if (selectionnes.length) {
		return selectionnes[0].object;
	}
}

function onMouseClick(event) {
	var position = new THREE.Vector2();
	// On conserve la position de la souris dans l'espace de coordonnées
	// NDC (Normalized device coordinates).
	var domRect = renderer.domElement.getBoundingClientRect();
	position.x = ((event.clientX - domRect.left) / domRect.width) * 2 - 1;
	position.y = -((event.clientY - domRect.top) / domRect.height) * 2 + 1;

	var s = getSelectionneLePlusProche(position);
	if (s) {
		// Focus camera on clicked object
		focusOnObject(s);
		
		if(s.name === "Target1"){
			articleButton.classList.add("selected");
			changeActiveColor("#2A4F3E");
			setTimeout(() => {
				window.location.href = `/articles`;
			}, 1500);
		}
		if(s.name === "Target2"){
			tutorielsButton.classList.add("selected");
			changeActiveColor("#0F2E84");
			
			setTimeout(() => {
				window.location.href = `/tutoriels`;
			}, 1500);
		}
		if(s.name === "Target3"){
			glossaireButton.classList.add("selected");
			changeActiveColor("#4F2A2A");
			
			setTimeout(() => {
				window.location.href = `/glossaire`;
			}, 1500);
		}
	} 
}

let articleButton = document.getElementById("articles")
let tutorielsButton = document.getElementById("tutoriels")
let glossaireButton = document.getElementById("glossaire")


function changeActiveColor(color){
	// set on local storage a value
	localStorage.setItem("activeColor", color);

	// change a global css variablke color
	document.documentElement.style.setProperty('--active-color', color);
}