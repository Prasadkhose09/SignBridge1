import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { Play } from 'lucide-react';
import { fetchDictionary } from '../services/api';

const SIGN_MODEL_MAP = {
    'hello': 'Hello.glb',
    'hi': 'Hi.glb',
    'thank you': 'Thank You.glb',
    'good evening': 'Good evening.glb',
    'how are u': 'How are u.glb',
    'i am fine': 'I am fine.glb',
    'i need water': 'I need water.glb'
};

const MODELS_PATH = '/models/';

const TextToSign = () => {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const [inputText, setInputText] = useState('');
    const [dictionary, setDictionary] = useState([]);
    const [loadingMsg, setLoadingMsg] = useState('Loading Remy Avatar...');
    const [isLoading, setIsLoading] = useState(true);

    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const rendererRef = useRef(null);
    const mixerRef = useRef(null);
    const currentModelRef = useRef(null);
    const clockRef = useRef(new THREE.Clock());

    useEffect(() => {
        // Load dictionary
        fetchDictionary().then(setDictionary);
    }, []);

    useEffect(() => {
        if (!containerRef.current || !canvasRef.current) return;
        
        let reqId;

        // Initialize Scene
        const width = containerRef.current.clientWidth || 800;
        const height = containerRef.current.clientHeight || 500;

        const scene = new THREE.Scene();
        sceneRef.current = scene;
        scene.background = new THREE.Color(0x111827);

        const floorGeo = new THREE.PlaneGeometry(20, 20);
        const floorMat = new THREE.MeshStandardMaterial({
            color: 0x1e293b,
            roughness: 0.9,
            metalness: 0.1
        });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0;
        floor.receiveShadow = true;
        scene.add(floor);

        const camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 10000);
        cameraRef.current = camera;
        camera.position.set(0, 1.0, 6.0);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true, alpha: true });
        rendererRef.current = renderer;
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
        keyLight.position.set(3, 5, 3);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.width = 1024;
        keyLight.shadow.mapSize.height = 1024;
        scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight(0x8b9dc3, 0.4);
        fillLight.position.set(-3, 3, -2);
        scene.add(fillLight);

        const rimLight = new THREE.DirectionalLight(0xa78bfa, 0.6);
        rimLight.position.set(0, 3, -4);
        scene.add(rimLight);

        const grid = new THREE.GridHelper(10, 20, 0x334155, 0x1e293b);
        grid.position.y = 0.001;
        scene.add(grid);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.target.set(0, 0, 0);
        controls.minDistance = 1;
        controls.maxDistance = 20;
        controls.enablePan = false;
        controls.update();

        const handleResize = () => {
            if (!containerRef.current) return;
            const w = containerRef.current.clientWidth;
            const h = containerRef.current.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        window.addEventListener('resize', handleResize);

        const animate = () => {
            reqId = requestAnimationFrame(animate);
            const delta = clockRef.current.getDelta();
            if (mixerRef.current) mixerRef.current.update(delta);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        loadIdleModel();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(reqId);
            renderer.dispose();
        };
    }, []);

    const clearCurrentModel = () => {
        if (mixerRef.current) {
            mixerRef.current.stopAllAction();
            mixerRef.current.uncacheRoot(mixerRef.current.getRoot());
            mixerRef.current = null;
        }
        if (currentModelRef.current) {
            sceneRef.current.remove(currentModelRef.current);
            currentModelRef.current.traverse((child) => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(m => m.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
            currentModelRef.current = null;
        }
    };

    const addModelToScene = (gltf) => {
        const model = gltf.scene;
        model.scale.set(0.9, 0.9, 0.9);
        model.position.set(0, -1.0, 0);
        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        sceneRef.current.add(model);
        currentModelRef.current = model;
    };

    const loadModel = (filename, onLoaded) => {
        const loader = new GLTFLoader();
        loader.setMeshoptDecoder(MeshoptDecoder);
        const url = MODELS_PATH + encodeURIComponent(filename);
        loader.load(
            url,
            (gltf) => onLoaded(gltf),
            (progress) => {
                if (progress.total > 0) {
                    const pct = Math.round((progress.loaded / progress.total) * 100);
                    setLoadingMsg(`Loading ${filename}... ${pct}%`);
                }
            },
            (error) => {
                console.error(error);
                setIsLoading(false);
            }
        );
    };

    const loadIdleModel = () => {
        setIsLoading(true);
        setLoadingMsg('Loading Remy Avatar...');
        loadModel('Remy.glb', (gltf) => {
            clearCurrentModel();
            addModelToScene(gltf);
            if (gltf.animations && gltf.animations.length > 0) {
                mixerRef.current = new THREE.AnimationMixer(currentModelRef.current);
                const idleAction = mixerRef.current.clipAction(gltf.animations[0]);
                idleAction.play();
            }
            setIsLoading(false);
        });
    };

    const playAnimation = (signName) => {
        if (!signName) return;
        const key = signName.toLowerCase().trim();
        const filename = SIGN_MODEL_MAP[key];

        if (!filename) {
            alert(`No animation for "${signName}" currently available.`);
            return;
        }

        setIsLoading(true);
        setLoadingMsg(`Performing: ${signName}...`);

        loadModel(filename, (gltf) => {
            clearCurrentModel();
            addModelToScene(gltf);

            if (gltf.animations && gltf.animations.length > 0) {
                mixerRef.current = new THREE.AnimationMixer(currentModelRef.current);
                const clip = gltf.animations[0];
                const action = mixerRef.current.clipAction(clip);
                action.setLoop(THREE.LoopOnce);
                action.clampWhenFinished = true;
                action.play();

                mixerRef.current.addEventListener('finished', () => {
                    setTimeout(() => loadIdleModel(), 500);
                });
            } else {
                setTimeout(() => loadIdleModel(), 3000);
            }
            setIsLoading(false);
        });
    };

    return (
        <div className="grid-layout">
            <div className="main-panel">
                <div className="avatar-wrapper" ref={containerRef}>
                    <canvas ref={canvasRef} className="avatar-canvas" style={{ width: '100%', height: '100%', display: 'block' }}></canvas>
                    {isLoading && (
                        <div className="avatar-loader">
                            <div className="spinner"></div>
                            <p>{loadingMsg}</p>
                        </div>
                    )}
                </div>

                <div className="input-section" style={{ marginTop: '1.5rem' }}>
                    <input 
                        type="text" 
                        className="text-input"
                        placeholder="Type a word or phrase (e.g. Hello, Thank You)..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') playAnimation(inputText);
                        }}
                    />
                    <button className="btn btn-primary" onClick={() => playAnimation(inputText)}>
                        <Play size={20} /> Play Sign
                    </button>
                </div>
            </div>

            <div className="results-panel">
                <div className="dictionary-section glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', margin: 0 }}>
                    <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem', textAlign: 'center' }}>Available Signs</h3>
                    <div className="tags-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {dictionary.map((sign, idx) => (
                            <span 
                                key={idx} 
                                className="sign-tag"
                                style={{ textAlign: 'center' }}
                                onClick={() => {
                                    setInputText(sign);
                                    playAnimation(sign);
                                }}
                            >
                                {sign}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TextToSign;
