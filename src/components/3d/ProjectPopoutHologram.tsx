import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface ProjectPopoutHologramProps {
  projectId: string; // e.g. "brin-plant-health-cnn" or "kpknl-dams-monitoring"
  category?: string;
  isHovered?: boolean;
}

export const ProjectPopoutHologram: React.FC<ProjectPopoutHologramProps> = ({
  projectId,
  isHovered = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const mouseOffsetRef = useRef({ x: 0, y: 0 });
  const [isGrabbed, setIsGrabbed] = useState(false);

  const isBrin = projectId.includes("brin") || projectId.includes("plant") || projectId.includes("cnn");

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 460;
    const height = mount.clientHeight || 420;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 100);
    // Eye-level table perspective matching Robin Noguier's exact product shot
    camera.position.set(0, 0.08, 5.4);
    camera.lookAt(0, 0.02, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    mount.appendChild(renderer.domElement);

    // 2. Lighting Rig - Studio Product Lighting (Key, Fill, Rim, Top)
    const ambientLight = new THREE.AmbientLight(0xfff8f2, 1.5);
    scene.add(ambientLight);

    // Key light from top-left (creates clear light/shadow curvature on the dome)
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(4, 5, 3.5);
    scene.add(keyLight);

    // Warm bounce fill light from below-left
    const fillLight = new THREE.DirectionalLight(0xffdec7, 1.2);
    fillLight.position.set(-3, -1, 2);
    scene.add(fillLight);

    // Rim light from behind-top-right (highlights the edge of the pebble)
    const rimLight = new THREE.DirectionalLight(0xff8c73, 2.2);
    rimLight.position.set(-4, 3, -3);
    scene.add(rimLight);

    // Core holographic emission light
    const corePointLight = new THREE.PointLight(isBrin ? 0x10b981 : 0x38bdf8, 2.8, 5);
    corePointLight.position.set(0, 0.6, 0.4);
    scene.add(corePointLight);

    // 3. Realistic Contact Shadow Floor
    const shadowCanvas = document.createElement("canvas");
    shadowCanvas.width = 512;
    shadowCanvas.height = 256;
    const shadowCtx = shadowCanvas.getContext("2d");
    if (shadowCtx) {
      const grad = shadowCtx.createRadialGradient(256, 128, 15, 256, 128, 200);
      grad.addColorStop(0, "rgba(25, 15, 12, 0.8)");
      grad.addColorStop(0.3, "rgba(55, 32, 25, 0.45)");
      grad.addColorStop(0.65, "rgba(75, 45, 35, 0.12)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
      shadowCtx.fillStyle = grad;
      shadowCtx.beginPath();
      shadowCtx.ellipse(256, 128, 210, 95, 0, 0, Math.PI * 2);
      shadowCtx.fill();
    }
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    const shadowGeo = new THREE.PlaneGeometry(2.8, 1.4);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.set(0.05, -0.22, 0.12);
    scene.add(shadowMesh);

    // 4. Main Product Container Group
    const productGroup = new THREE.Group();
    productGroup.scale.set(0.44, 0.44, 0.44);
    scene.add(productGroup);

    // Disposables store
    const disposables: { dispose: () => void }[] = [shadowGeo, shadowMat, shadowTexture];

    let floatingHoloGroup: THREE.Group | null = null;
    let scanRingMesh: THREE.Mesh | null = null;
    let dataParticles: THREE.Points | null = null;

    if (isBrin) {
      /* ========================================================
       * BRIN: Smart Multispectral Agro-Sensor Pebble
       * Horizontal elongated pebble (Google Nest Mini side-profile)
       * + Emerging 3D NDVI Botanical Hologram popping out from the top
       * ======================================================== */

      // A. Lower Base Casing (Matte Coral/Terracotta silicone base)
      const baseGeo = new THREE.CylinderGeometry(1.2, 1.05, 0.28, 64);
      const baseMat = new THREE.MeshStandardMaterial({
        color: 0xc44f3b, // Warm matte coral base
        roughness: 0.6,
        metalness: 0.05,
      });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.y = -0.16;
      baseMesh.scale.set(1.4, 0.85, 1.15);
      productGroup.add(baseMesh);
      disposables.push(baseGeo, baseMat);

      // Microphone/Volume Switch on the lower right side (like in Robin Noguier's photo!)
      const switchGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.03, 24);
      switchGeo.rotateZ(Math.PI / 2);
      const switchMat = new THREE.MeshStandardMaterial({ color: 0xa83d2a, roughness: 0.5 });
      const switchMesh = new THREE.Mesh(switchGeo, switchMat);
      switchMesh.position.set(1.42, -0.16, 0.35);
      productGroup.add(switchMesh);
      disposables.push(switchGeo, switchMat);

      // White Power Cable trailing out to the right (Robin Noguier signature detail!)
      const cordCurve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(1.48, -0.16, 0),
        new THREE.Vector3(1.9, -0.17, 0.05),
        new THREE.Vector3(2.4, -0.22, -0.05),
        new THREE.Vector3(3.0, -0.28, -0.1)
      );
      const cordGeo = new THREE.TubeGeometry(cordCurve, 32, 0.045, 16, false);
      const cordMat = new THREE.MeshStandardMaterial({
        color: 0xfafafa,
        roughness: 0.2,
        metalness: 0.05,
      });
      const cordMesh = new THREE.Mesh(cordGeo, cordMat);
      productGroup.add(cordMesh);
      disposables.push(cordGeo, cordMat);

      // B. Upper Domed Top (Coral Fabric Texture - Solid and smooth like the Nest Mini)
      const domeGeo = new THREE.SphereGeometry(1.2, 64, 32, 0, Math.PI * 2, 0, Math.PI * 0.5);
      const domeMat = new THREE.MeshStandardMaterial({
        color: 0xeb5b42, // Vibrant Google Home Mini coral red
        roughness: 0.85,
        metalness: 0.02,
      });
      const domeMesh = new THREE.Mesh(domeGeo, domeMat);
      domeMesh.position.y = -0.04;
      domeMesh.scale.set(1.4, 0.44, 1.15); // Squashed ellipsoidal curvature
      productGroup.add(domeMesh);
      disposables.push(domeGeo, domeMat);

      // Optical Multispectral Sensor Aperture (Center Lens)
      const lensBezelGeo = new THREE.TorusGeometry(0.36, 0.03, 16, 48);
      lensBezelGeo.rotateX(Math.PI / 2);
      const lensBezelMat = new THREE.MeshStandardMaterial({
        color: 0x1f2937,
        roughness: 0.2,
        metalness: 0.9,
      });
      const lensBezelMesh = new THREE.Mesh(lensBezelGeo, lensBezelMat);
      lensBezelMesh.position.set(0, 0.4, 0);
      productGroup.add(lensBezelMesh);
      disposables.push(lensBezelGeo, lensBezelMat);

      const lensGeo = new THREE.SphereGeometry(0.34, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.25);
      const lensMat = new THREE.MeshPhysicalMaterial({
        color: 0x064e3b,
        roughness: 0.05,
        transmission: 0.85,
        transparent: true,
        opacity: 0.9,
      });
      const lensMesh = new THREE.Mesh(lensGeo, lensMat);
      lensMesh.position.set(0, 0.38, 0);
      productGroup.add(lensMesh);
      disposables.push(lensGeo, lensMat);

      // Glowing NDVI Optical Ring
      const ringGeo = new THREE.RingGeometry(0.16, 0.2, 36);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.95,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.set(0, 0.41, 0);
      productGroup.add(ringMesh);
      disposables.push(ringGeo, ringMat);

      // C. THE POPPING-OUT 3D HOLOGRAM: Stylized 3D Botanical Plant Leaf emerging UPWARDS
      floatingHoloGroup = new THREE.Group();
      floatingHoloGroup.position.set(0, 0.85, 0);
      productGroup.add(floatingHoloGroup);

      // 1. Central Holographic Crystal Leaf
      const leafShape = new THREE.Shape();
      leafShape.moveTo(0, 0);
      leafShape.bezierCurveTo(0.42, 0.35, 0.55, 0.95, 0, 1.45);
      leafShape.bezierCurveTo(-0.55, 0.95, -0.42, 0.35, 0, 0);

      const extrudeSettings = { depth: 0.05, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.02, bevelThickness: 0.02 };
      const leafGeo = new THREE.ExtrudeGeometry(leafShape, extrudeSettings);
      leafGeo.center();

      const leafMat = new THREE.MeshPhysicalMaterial({
        color: 0x10b981,
        roughness: 0.15,
        transmission: 0.75,
        thickness: 0.5,
        transparent: true,
        opacity: 0.85,
        emissive: 0x059669,
        emissiveIntensity: 0.3,
      });
      const leafMesh = new THREE.Mesh(leafGeo, leafMat);
      leafMesh.rotation.set(-0.15, 0, 0);
      floatingHoloGroup.add(leafMesh);
      disposables.push(leafGeo, leafMat);

      // Leaf wireframe matrix overlay
      const leafWireMat = new THREE.MeshBasicMaterial({
        color: 0x6ee7b7,
        wireframe: true,
        transparent: true,
        opacity: 0.8,
      });
      const leafWireMesh = new THREE.Mesh(leafGeo, leafWireMat);
      leafWireMesh.rotation.set(-0.15, 0, 0);
      leafWireMesh.scale.set(1.02, 1.02, 1.02);
      floatingHoloGroup.add(leafWireMesh);
      disposables.push(leafWireMat);

      // Second angled auxiliary leaf
      const leaf2Mesh = leafMesh.clone();
      leaf2Mesh.scale.set(0.65, 0.65, 0.65);
      leaf2Mesh.rotation.set(-0.25, 0.6, -0.35);
      leaf2Mesh.position.set(0.45, -0.15, 0.15);
      floatingHoloGroup.add(leaf2Mesh);

      // 2. Sweeping Holographic Laser Ring (NDVI Spectral Scanner)
      const scanRingGeo = new THREE.TorusGeometry(0.9, 0.015, 12, 48);
      scanRingGeo.rotateX(Math.PI / 2);
      const scanRingMat = new THREE.MeshBasicMaterial({
        color: 0x34d399,
        transparent: true,
        opacity: 0.85,
      });
      scanRingMesh = new THREE.Mesh(scanRingGeo, scanRingMat);
      floatingHoloGroup.add(scanRingMesh);
      disposables.push(scanRingGeo, scanRingMat);

      // 3. Floating Quantum NDVI Data Particles
      const particleCount = 55;
      const particleGeo = new THREE.BufferGeometry();
      const pPositions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount * 3; i += 3) {
        pPositions[i] = (Math.random() - 0.5) * 1.8;
        pPositions[i + 1] = Math.random() * 1.5 - 0.1;
        pPositions[i + 2] = (Math.random() - 0.5) * 1.8;
      }
      particleGeo.setAttribute("position", new THREE.BufferAttribute(pPositions, 3));
      const particleMat = new THREE.PointsMaterial({
        color: 0xa7f3d0,
        size: 0.05,
        transparent: true,
        opacity: 0.9,
      });
      dataParticles = new THREE.Points(particleGeo, particleMat);
      floatingHoloGroup.add(dataParticles);
      disposables.push(particleGeo, particleMat);

    } else {
      /* ========================================================
       * KPKNL: 3D Holographic Enterprise Terminal & Data Prism
       * Isometric floating glass pedestal with emerging analytical cube & telemetry
       * ======================================================== */

      // A. Floating Sleek Console Base
      const baseGeo = new THREE.CylinderGeometry(1.25, 1.1, 0.28, 64);
      const baseMat = new THREE.MeshStandardMaterial({
        color: 0x243833,
        roughness: 0.35,
        metalness: 0.4,
      });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.y = -0.3;
      baseMesh.scale.set(1.25, 1.0, 1.05);
      productGroup.add(baseMesh);
      disposables.push(baseGeo, baseMat);

      // Terracotta Accent Trim Ring
      const trimGeo = new THREE.TorusGeometry(1.18, 0.025, 12, 48);
      trimGeo.rotateX(Math.PI / 2);
      const trimMat = new THREE.MeshStandardMaterial({ color: 0xe06d53, roughness: 0.3, metalness: 0.6 });
      const trimMesh = new THREE.Mesh(trimGeo, trimMat);
      trimMesh.position.y = -0.16;
      trimMesh.scale.set(1.25, 1.0, 1.05);
      productGroup.add(trimMesh);
      disposables.push(trimGeo, trimMat);

      // Glass Top Surface
      const glassGeo = new THREE.CylinderGeometry(1.15, 1.15, 0.04, 48);
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0x0f172a,
        roughness: 0.1,
        transmission: 0.85,
        thickness: 0.3,
        transparent: true,
        opacity: 0.9,
      });
      const glassMesh = new THREE.Mesh(glassGeo, glassMat);
      glassMesh.position.y = -0.14;
      glassMesh.scale.set(1.25, 1.0, 1.05);
      productGroup.add(glassMesh);
      disposables.push(glassGeo, glassMat);

      // B. POPPING-OUT 3D HOLOGRAM: Enterprise Data Matrix Cube & Bar Charts
      floatingHoloGroup = new THREE.Group();
      floatingHoloGroup.position.set(0, 0.48, 0);
      productGroup.add(floatingHoloGroup);

      // Outer Hologram Data Matrix Box
      const boxGeo = new THREE.BoxGeometry(0.85, 0.85, 0.85);
      const boxMat = new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        wireframe: false,
        roughness: 0.1,
        transmission: 0.82,
        transparent: true,
        opacity: 0.55,
      });
      const boxMesh = new THREE.Mesh(boxGeo, boxMat);
      floatingHoloGroup.add(boxMesh);
      disposables.push(boxGeo, boxMat);

      // Wireframe Grid Lattice Overlay
      const boxWireMat = new THREE.MeshBasicMaterial({
        color: 0x93c5fd,
        wireframe: true,
        transparent: true,
        opacity: 0.85,
      });
      const boxWireMesh = new THREE.Mesh(boxGeo, boxWireMat);
      boxWireMesh.scale.set(1.01, 1.01, 1.01);
      floatingHoloGroup.add(boxWireMesh);
      disposables.push(boxWireMat);

      // 3D Internal Metric Bars (Holographic Activity Telemetry)
      const barHeights = [0.3, 0.55, 0.72, 0.45];
      const barColors = [0xe06d53, 0x34d399, 0x38bdf8, 0xfbbf24];
      const barPositions = [
        [-0.2, -0.2],
        [0.2, -0.2],
        [0.2, 0.2],
        [-0.2, 0.2],
      ];

      barPositions.forEach((pos, idx) => {
        const h = barHeights[idx];
        const barGeo = new THREE.BoxGeometry(0.12, h, 0.12);
        const barMat = new THREE.MeshStandardMaterial({
          color: barColors[idx],
          roughness: 0.3,
          metalness: 0.2,
          emissive: barColors[idx],
          emissiveIntensity: 0.25,
        });
        const barMesh = new THREE.Mesh(barGeo, barMat);
        barMesh.position.set(pos[0], -0.42 + h / 2, pos[1]);
        floatingHoloGroup?.add(barMesh);
        disposables.push(barGeo, barMat);
      });

      // Orbiting Equatorial Telemetry Ring
      const ringGeo = new THREE.TorusGeometry(0.95, 0.018, 16, 48);
      ringGeo.rotateX(Math.PI / 3);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.75 });
      scanRingMesh = new THREE.Mesh(ringGeo, ringMat);
      floatingHoloGroup.add(scanRingMesh);
      disposables.push(ringGeo, ringMat);

      // Floating Data Particles
      const pCount = 50;
      const pGeo = new THREE.BufferGeometry();
      const pPos = new Float32Array(pCount * 3);
      for (let i = 0; i < pCount * 3; i += 3) {
        pPos[i] = (Math.random() - 0.5) * 2.2;
        pPos[i + 1] = (Math.random() - 0.5) * 1.8;
        pPos[i + 2] = (Math.random() - 0.5) * 2.2;
      }
      pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
      const pMat = new THREE.PointsMaterial({ color: 0xbae6fd, size: 0.04, transparent: true, opacity: 0.85 });
      dataParticles = new THREE.Points(pGeo, pMat);
      floatingHoloGroup.add(dataParticles);
      disposables.push(pGeo, pMat);
    }

    // 5. Initial Rotation & Angle Alignment (Matching Robin Noguier's perspective)
    productGroup.rotation.set(0.08, -0.25, 0.02);

    // 6. Interactive Mouse Drag & Parallax Handling
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      setIsGrabbed(true);
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      // Normalized offset (-1 to 1) for subtle ambient parallax
      const normX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const normY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      mouseOffsetRef.current = { x: normX, y: normY };

      if (!isDraggingRef.current) return;

      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      productGroup.rotation.y += deltaX * 0.008;
      productGroup.rotation.x += deltaY * 0.008;
      // Clamp X rotation to prevent flipping upside down
      productGroup.rotation.x = Math.max(-0.6, Math.min(0.8, productGroup.rotation.x));

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      setIsGrabbed(false);
    };

    // Touch support for mobile devices
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        setIsGrabbed(true);
        previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - previousMousePositionRef.current.x;
      const deltaY = e.touches[0].clientY - previousMousePositionRef.current.y;
      productGroup.rotation.y += deltaX * 0.008;
      productGroup.rotation.x += deltaY * 0.008;
      previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const handleTouchEnd = () => {
      isDraggingRef.current = false;
      setIsGrabbed(false);
    };

    mount.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    mount.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);

    // Resize Handler
    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth || 460;
      const h = mount.clientHeight || 420;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // 7. Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Subtle ambient hover bobbing and scale reaction
      const hoverBob = Math.sin(elapsedTime * 1.8) * 0.03;
      productGroup.position.y = hoverBob;

      const baseScale = 0.44;
      const targetScale = isHovered ? baseScale * 1.05 : baseScale;
      productGroup.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.08);

      // Contact shadow responds to elevation
      shadowMesh.scale.set(baseScale - hoverBob * 0.3, baseScale - hoverBob * 0.3, 1);
      shadowMat.opacity = 0.88 - hoverBob * 0.6;

      // Subtle mouse parallax when not dragging
      if (!isDraggingRef.current) {
        const targetRotY = -0.22 + mouseOffsetRef.current.x * 0.18;
        const targetRotX = 0.04 - mouseOffsetRef.current.y * 0.12;
        productGroup.rotation.y += (targetRotY - productGroup.rotation.y) * 0.05;
        productGroup.rotation.x += (targetRotX - productGroup.rotation.x) * 0.05;
      }

      // Hologram internal animations
      if (floatingHoloGroup) {
        floatingHoloGroup.rotation.y = elapsedTime * 0.35;
        floatingHoloGroup.position.y = (isBrin ? 0.55 : 0.35) + Math.sin(elapsedTime * 2.5) * 0.05;
      }

      if (scanRingMesh) {
        if (isBrin) {
          // Sweeping vertical laser disc
          scanRingMesh.position.y = Math.sin(elapsedTime * 3.0) * 0.45;
          scanRingMesh.rotation.z = elapsedTime * 0.5;
        } else {
          scanRingMesh.rotation.z = elapsedTime * 0.4;
          scanRingMesh.rotation.y = Math.sin(elapsedTime * 0.8) * 0.3;
        }
      }

      if (dataParticles) {
        dataParticles.rotation.y = -elapsedTime * 0.18;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      mount.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      mount.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("resize", handleResize);

      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      disposables.forEach((d) => d.dispose());
    };
  }, [projectId, isBrin]);

  return (
    <div
      ref={mountRef}
      className={`w-full h-[360px] sm:h-[420px] lg:h-[480px] flex items-center justify-center select-none ${
        isGrabbed ? "cursor-grabbing" : "cursor-grab"
      }`}
      title="3D Pop-Out Hologram // Drag to rotate and inspect"
    />
  );
};
