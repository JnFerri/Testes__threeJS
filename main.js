import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xcccccc)
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );


const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
const elemento = document.getElementById('localPost')
elemento.appendChild( renderer.domElement );
const controls = new OrbitControls( camera, renderer.domElement );
const loader = new GLTFLoader();

loader.load( '/assets/files_3d/exaustor gltf/exaustor.gltf', function ( gltf ) {
	const ambientLight = new THREE.AmbientLight(0xffffff, 1); // cor branca, intensidade 0.5
	scene.add(ambientLight);
	const directionalLight = new THREE.DirectionalLight(0xffffff, 3); // cor branca, intensidade 1
directionalLight.position.set(10, -5, -10); // posição da luz
directionalLight.target.position.set(-5, 0, 0)
scene.add(directionalLight);
scene.add(directionalLight.target)
	gltf.scene.scale.set(20, 20, 20);
	var newWidth = 800; // Substitua com a nova largura desejada
var newHeight = 600; // Substitua com a nova altura desejada

// Ajusta o tamanho do renderer
renderer.setSize(newWidth, newHeight);
	scene.add( gltf.scene );

}, undefined, function ( error ) {

	console.error( error );

} );

camera.position.z = 5;

function animate() {
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}
animate();


