import React, { useEffect, useRef, useState, memo } from 'react';

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { PCDLoader } from 'three/examples/jsm/loaders/PCDLoader';

import { debounce } from './utils';

const PCD_FILES = [
  'models/scan_001.pcd',
  'models/scan_002.pcd',
  'models/scan_003.pcd',
  'models/scan_004.pcd',
  'models/scan_005.pcd',
  'models/scan_006.pcd',
  'models/scan_007.pcd',
  'models/scan_008.pcd',
  'models/scan_009.pcd',
  'models/scan_010.pcd',
  'models/scan_011.pcd',
  'models/scan_012.pcd',
];

const PointCloudViewer: React.FC = () => {
  const [currentFrame, setCurrentFrame] = useState<number>(0);
  const meshRef = useRef<any>();
  const sceneRef = useRef(new THREE.Scene());
  const cameraRef = useRef(new THREE.PerspectiveCamera(40, 800 / 600, 1, 10000));
  const rendererRef = useRef(new THREE.WebGLRenderer());
  const controlsRef = useRef(new OrbitControls(cameraRef.current, rendererRef.current.domElement));

  useEffect(() => {
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const renderer = rendererRef.current;

    camera.position.set(0, -1, 0);
    camera.rotation.set(0, 0, 0);

    renderer.setSize(800, 600);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    scene.add(new THREE.AxesHelper(20));

    loadPointCloud();

    animate();

    return () => {
      scene.children.forEach((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          object.material.dispose();
        }
      });
      renderer.dispose();
    };
  }, [currentFrame]);

  const handleSliderChange = (value: number) => {
    setCurrentFrame(value);
    loadPointCloud();
  };

  const debouncedHandleSliderChange = debounce(handleSliderChange, 200);

  const handleNavigationControlsDebounced = (e: any) => {
    const target = e.target as HTMLInputElement;
    debouncedHandleSliderChange(parseInt(target.value, 10));
  };

  const loadPointCloud = () => {
    const loader = new PCDLoader();
    loader.load(
      PCD_FILES[currentFrame],
      (points) => {
        if (meshRef.current) {
          sceneRef.current.remove(meshRef.current);
        }
        const mesh = new THREE.Points(
          points.geometry,
          new THREE.PointsMaterial({ size: 0.1 })
        );
        meshRef.current = mesh;
        sceneRef.current.add(mesh);
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
      },
      (error) => {
        console.error('Error occurred', error);
      }
    );
  };

  const animate = () => {
    requestAnimationFrame(animate);
    controlsRef.current.update();
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  };

  return (
    <div>
      <input 
        type='range' 
        min={0} 
        max={PCD_FILES.length - 1} 
        value={currentFrame} 
        onInput={handleNavigationControlsDebounced} 
      />
    </div>
  );
};

export default memo(PointCloudViewer);
