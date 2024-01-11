import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { PCDLoader } from 'three/examples/jsm/loaders/PCDLoader';

const PCD_FILES = [
  'models/scan_010.pcd',
  'models/scan_011.pcd',
  'models/scan_012.pcd',
];

enum NavigationControls {
  NEXT = "next",
  PREV = "prev"
};

const NAVIGATION_LABELS = {
  NEXT: "Next",
  PREV: "Previous"
};

class PointCloudViewer {
  private mesh: THREE.Points | undefined;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private currentFrame: number = 0;
  private readonly pcdFiles: string[];
  private static readonly FRAME_RESOLUTIONS = {
    WIDTH: 800,
    HEIGHT: 600,
  };

  constructor(pcdFiles: string[]) {
    this.pcdFiles = pcdFiles;
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(40, PointCloudViewer.FRAME_RESOLUTIONS.WIDTH / PointCloudViewer.FRAME_RESOLUTIONS.HEIGHT, 1, 10000);
    this.camera.position.set(1, 0, 0);
    
    this.renderer = new THREE.WebGLRenderer();

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.init();
    this.animate();
  }

  private init(): void {
    this.renderer.setSize(PointCloudViewer.FRAME_RESOLUTIONS.WIDTH, PointCloudViewer.FRAME_RESOLUTIONS.HEIGHT);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(this.renderer.domElement);

    this.scene.add(new THREE.AxesHelper(20));

    this.loadPointCloud();

    this.addNavigationControls();
  }

  private addNavigationControls(): void {
    const prevButton: HTMLButtonElement = document.createElement('button');
    prevButton.textContent = NAVIGATION_LABELS.PREV;
    prevButton.addEventListener('click', () => this.handleNavigationControl(NavigationControls.PREV));
    
    const container: HTMLDivElement = document.createElement('div');
    container.classList.add('container');
    container.appendChild(prevButton);

    const nextButton: HTMLButtonElement = document.createElement('button');
    nextButton.textContent = NAVIGATION_LABELS.NEXT;
    nextButton.addEventListener('click', () => this.handleNavigationControl(NavigationControls.NEXT));
    container.appendChild(nextButton);
    
    document.body.appendChild(container);
  }

  private handleNavigationControl(actionType: (NavigationControls.NEXT | NavigationControls.PREV)): void {
    switch(actionType) {
      case NavigationControls.NEXT:
        if (this.currentFrame === this.pcdFiles.length - 1) {
          return;
        }
        this.switchFrame(1);
        break;
      case NavigationControls.PREV:
        if (this.currentFrame === 0) {
          return;
        }
        this.switchFrame(-1);
    }
  }

  private loadPointCloud(): void {
    const loader = new PCDLoader();
    loader.load(
      this.pcdFiles[this.currentFrame],
      (points: any) => {
        if (this.mesh) {
          this.scene.remove(this.mesh);
        }
        this.mesh = new THREE.Points(points.geometry, new THREE.PointsMaterial({ size: 0.1 }));
        this.scene.add(this.mesh);
      },
      (xhr: ProgressEvent) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
      },
      (error: any) => {
        console.error('Error occured', error);
      }
    );
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  private switchFrame(delta: number): void {
    this.currentFrame = (this.currentFrame + delta + this.pcdFiles.length) % this.pcdFiles.length;
    this.loadPointCloud();
  }
}

const pointCloudViewer = new PointCloudViewer(PCD_FILES);
