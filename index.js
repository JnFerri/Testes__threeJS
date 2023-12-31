import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { PMREMGenerator } from 'three';

const scene = new THREE.Scene();
scene.background = null

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );


const renderer = new THREE.WebGLRenderer({ antialias: true, alpha:true, },);
renderer.setSize( window.innerWidth, window.innerHeight );
const elemento = document.getElementById('localPost')
elemento.appendChild( renderer.domElement );

const controls = new OrbitControls( camera, renderer.domElement );


let targetPosition = new THREE.Vector4(); // Cria um novo vetor 3D
camera.getWorldDirection(targetPosition); // Obtém a direção da câmera
targetPosition = targetPosition.multiplyScalar(-1).add(camera.position); // Calcula a posição atual do alvo

// Agora, ajuste o alvo
targetPosition.y += 1; // Aumenta um pouco no eixo y (por exemplo, 1 unidade)
targetPosition.z += -1;

// Faz a câmera olhar para o novo alvo
camera.lookAt(targetPosition);
controls.target.copy(targetPosition)
controls.update()

const loader = new GLTFLoader();




loader.load( './public/assets/files_3d/exaustor_gltf/exaustor.gltf', function ( gltf ) {
    scene.add( gltf.scene );
    
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 1); // cor branca, intensidade 0.5
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(10, -10, 5);
    scene.add(directionalLight);

    const composer = new EffectComposer(renderer);

    const rgbeLoader = new RGBELoader();
    const pmremGenerator = new PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    rgbeLoader.load('./public/assets/enviroments/warewouse.hdr', function (texture) {
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

    const sharpenShader = {
        uniforms: {
            "tDiffuse": { value: null },
            "amount": { value: 0.5 }
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
            uniform float amount;
            varying vec2 vUv;
            void main() {
                vec2 uv = vUv;
                float strength = 1.0 + amount;
                // Definir os offsets para pixels vizinhos
                vec2 offset[9];
                offset[0] = vec2(-1.0, -1.0);
                offset[1] = vec2(0.0, -1.0);
                // ... (complete os outros offsets)
                // Calcule a nitidez
                vec4 color = texture2D(tDiffuse, uv);
                // ... (aplique a lógica de sharpen aqui)
                gl_FragColor = color;
            }
        `
    };
    const sharpenPass = new ShaderPass(sharpenShader);
composer.addPass(sharpenPass);

renderer.toneMapping = THREE.ReinhardToneMapping; // Ou outro algoritmo de sua escolha
renderer.toneMappingExposure = 3.0; // Ajuste conforme necessário

scene.traverse((obj) => {
    if (obj.material) {
      obj.material.needsUpdate = true;
    }
  });
    const correctionPass = new ShaderPass(colorCorrectionShader);
    composer.addPass(correctionPass);
    renderer.setPixelRatio(window.devicePixelRatio)
    gltf.scene.scale.set(1.3, 1.3, 1.3);

  
        
        camera.position.z = 4;
  
    
        
    function animate() {
        requestAnimationFrame( animate );
        renderer.setSize( elemento.offsetWidth , elemento.offsetHeight );
        composer.render(scene, camera);
        
        }

        animate();

}, undefined, function ( error ) {

	console.error( error );

} );



