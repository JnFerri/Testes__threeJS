import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { PMREMGenerator } from 'three/src/extras/PMREMGenerator.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color('white')
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );


const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
const elemento = document.getElementById('localPost')
elemento.appendChild( renderer.domElement );
const controls = new OrbitControls( camera, renderer.domElement );
const loader = new GLTFLoader();
new THREE.WebGLRenderer({ antialias: true });

loader.load( '/assets/files_3d/exaustor gltf/exaustor.gltf', function ( gltf ) {
	const ambientLight = new THREE.AmbientLight(0xffffff, 1); // cor branca, intensidade 0.5
	scene.add(ambientLight);
	const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
	directionalLight.position.set(10, -10, 5);
	scene.add(directionalLight);

	const composer = new EffectComposer(renderer);

	const rgbeLoader = new RGBELoader();
const pmremGenerator = new PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

rgbeLoader.load('/assets/enviroments/warewouse.hdr', function (texture) {
    const envMap = pmremGenerator.fromEquirectangular(texture).texture;
    pmremGenerator.dispose();

    // Aplica o mapa de ambiente à cena
    scene.environment = envMap;
});

const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
composer.addPass(bloomPass);
composer.addPass(new RenderPass(scene, camera));

const colorCorrectionShader = {
    uniforms: {
        tDiffuse: { value: null },
        // Adicione outros uniforms se necessário
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        varying vec2 vUv;

        void main() {
            vec4 texture = texture2D(tDiffuse, vUv);

            // Aplicar correções de cor
            texture.rgb = pow(texture.rgb, vec3(0.9)); // Exemplo: ajuste de gama

            gl_FragColor = texture;
        }
    `
};

const correctionPass = new ShaderPass(colorCorrectionShader);
composer.addPass(correctionPass);
renderer.setPixelRatio(window.devicePixelRatio)
	gltf.scene.scale.set(1, 1, 1);
	var newWidth = 800; // Substitua com a nova largura desejada
	var newHeight = 600; // Substitua com a nova altura desejada
	
// Ajusta o tamanho do renderer
renderer.setSize(newWidth, newHeight);
	scene.add( gltf.scene );
	
	camera.position.z = 5;
	
	function animate() {
		requestAnimationFrame( animate );
		
		composer.render(scene, camera);
	}
	animate();
}, undefined, function ( error ) {

	console.error( error );

} );



