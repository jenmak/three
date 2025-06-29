import * as THREE from 'three';

interface MoonPhase {
  name: string;
  phase: number;
}

class ThreeApp {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private container: HTMLElement;
  private moonObjects: THREE.Group[] = [];
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private tooltip: HTMLElement;

  constructor() {
    this.container = document.getElementById('app') as HTMLElement;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.init();
  }

  private init(): void {
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000011);

    // Camera setup
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 12);
    this.camera.lookAt(0, 0, 0);

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.container.appendChild(this.renderer.domElement);

    // Create tooltip
    this.createTooltip();

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    this.scene.add(directionalLight);

    // Moon phase data
    const moonPhases: MoonPhase[] = [
      { name: 'New Moon', phase: 0 },
      { name: 'Waxing Crescent', phase: 1 },
      { name: 'First Quarter', phase: 2 },
      { name: 'Waxing Gibbous', phase: 3 },
      { name: 'Full Moon', phase: 4 },
      { name: 'Waning Gibbous', phase: 5 },
      { name: 'Third Quarter', phase: 6 },
      { name: 'Waning Crescent', phase: 7 }
    ];

    // Create moon phases in a circle
    const circleRadius = 6;
    moonPhases.forEach((phaseData, index) => {
      // Calculate position in circle
      // Start from top (New Moon) and go clockwise
      const angle = (index / 8) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * circleRadius;
      const y = Math.sin(angle) * circleRadius;

      const moonPhase = this.createMoonPhase(phaseData);
      moonPhase.position.set(x, y, 0);
      this.scene.add(moonPhase);
      this.moonObjects.push(moonPhase);
    });

    // Add mouse event listeners
    this.renderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this));

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate all moon phases slowly
      this.moonObjects.forEach((moon) => {
        moon.rotation.y += 0.005;
      });

      this.renderer.render(this.scene, this.camera);
    };

    animate();

    // Handle window resize
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  private createTooltip(): void {
    this.tooltip = document.createElement('div');
    this.tooltip.style.position = 'absolute';
    this.tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    this.tooltip.style.color = 'white';
    this.tooltip.style.padding = '8px 12px';
    this.tooltip.style.borderRadius = '4px';
    this.tooltip.style.fontFamily = 'Arial, sans-serif';
    this.tooltip.style.fontSize = '14px';
    this.tooltip.style.pointerEvents = 'none';
    this.tooltip.style.zIndex = '1000';
    this.tooltip.style.display = 'none';
    this.tooltip.style.transition = 'opacity 0.2s ease-in-out';
    this.container.appendChild(this.tooltip);
  }

  private onMouseMove(event: MouseEvent): void {
    // Calculate mouse position in normalized device coordinates
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the picking ray with the camera and mouse position
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Calculate objects intersecting the picking ray
    const intersects = this.raycaster.intersectObjects(this.moonObjects, true);

    if (intersects.length > 0) {
      // Find the moon group that was hit
      let moonGroup: THREE.Group | null = null;
      let current: THREE.Object3D | null = intersects[0].object;

      while (current && !current.userData.name) {
        current = current.parent;
      }

      if (current && current.userData.name) {
        moonGroup = current as THREE.Group;
      }

      if (moonGroup) {
        this.tooltip.textContent = moonGroup.userData.name;
        this.tooltip.style.display = 'block';
        this.tooltip.style.left = event.clientX + 10 + 'px';
        this.tooltip.style.top = event.clientY - 10 + 'px';
      }
    } else {
      this.tooltip.style.display = 'none';
    }
  }

  private createMoonPhase(phaseData: MoonPhase): THREE.Group {
    const { name, phase } = phaseData;
    const radius = 0.8;

    const moonGeometry = new THREE.SphereGeometry(radius, 32, 32);
    const moonMaterial = new THREE.MeshStandardMaterial({
      color: 0xf4f4f4,
      roughness: 0.8,
      metalness: 0.1
    });
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);

    // Create cut-out sphere for the shadow
    const cutGeometry = new THREE.SphereGeometry(radius * 0.9, 32, 32);
    const cutMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0
    });
    const cutSphere = new THREE.Mesh(cutGeometry, cutMaterial);

    // Calculate shadow position based on phase
    // Phase 0 = New Moon (completely dark)
    // Phase 4 = Full Moon (completely light)
    const angle = (phase / 12) * Math.PI * 2;
    const cutOffset = Math.cos(angle) * radius * 0.3;
    cutSphere.position.x = cutOffset;

    // Special cases
    if (phase === 0 || phase === 8) {
      // New Moon - make it dark
      moonMaterial.color.setHex(0x222222);
    } else if (phase === 4) {
      // Full Moon - no shadow
      cutSphere.visible = false;
    }

    const moonGroup = new THREE.Group();
    moonGroup.add(moon);
    moonGroup.add(cutSphere);

    // Store the name for hover detection
    moonGroup.userData = { name };

    return moonGroup;
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ThreeApp();
}); 