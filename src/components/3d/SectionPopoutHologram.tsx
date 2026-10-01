import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export type SectionHologramType =
  | "cover"
  | "projects"
  | "experience"
  | "credentials"
  | "skills"
  | "contact";

interface SectionPopoutHologramProps {
  type: SectionHologramType;
  projectId?: string; // used when type === "projects"
  isHovered?: boolean;
}

export const SectionPopoutHologram: React.FC<SectionPopoutHologramProps> = ({
  type,
  projectId = "brin-plant-health-cnn",
  isHovered = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const mouseOffsetRef = useRef({ x: 0, y: 0 });
  const [isGrabbed, setIsGrabbed] = useState(false);

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

    // 2. Lighting Rig - Studio Product Lighting
    const ambientLight = new THREE.AmbientLight(0xfff8f2, 1.5);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(4, 5, 3.5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffdec7, 1.2);
    fillLight.position.set(-3, -1, 2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xff8c73, 2.2);
    rimLight.position.set(-4, 3, -3);
    scene.add(rimLight);

    // Dynamic accent color based on section
    const accentColors: Record<SectionHologramType, number> = {
      cover: 0xe06d53,
      projects: projectId.includes("kpknl") ? 0x38bdf8 : 0x10b981,
      experience: 0x43766c,
      credentials: 0xb19470,
      skills: 0x3b82f6,
      contact: 0xe06d53,
    };
    const accentColor = accentColors[type] || 0xe06d53;

    const corePointLight = new THREE.PointLight(accentColor, 2.8, 5);
    corePointLight.position.set(0, 0.6, 0.4);
    scene.add(corePointLight);

    // 3. Realistic Contact Shadow Floor
    const shadowCanvas = document.createElement("canvas");
    shadowCanvas.width = 512;
    shadowCanvas.height = 256;
    const shadowCtx = shadowCanvas.getContext("2d");
    if (shadowCtx) {
      const grad = shadowCtx.createRadialGradient(256, 128, 10, 256, 128, 195);
      grad.addColorStop(0, "rgba(35, 25, 20, 0.48)");
      grad.addColorStop(0.35, "rgba(55, 38, 30, 0.24)");
      grad.addColorStop(0.7, "rgba(75, 50, 40, 0.07)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
      shadowCtx.fillStyle = grad;
      shadowCtx.beginPath();
      shadowCtx.ellipse(256, 128, 205, 90, 0, 0, Math.PI * 2);
      shadowCtx.fill();
    }
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    const shadowGeo = new THREE.PlaneGeometry(2.8, 1.4);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      opacity: 0.72,
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

    const disposables: { dispose: () => void }[] = [shadowGeo, shadowMat, shadowTexture];

    let floatingHoloGroup: THREE.Group | null = null;
    let scanRingMesh: THREE.Mesh | null = null;
    let dataParticles: THREE.Points | null = null;

    if (type === "projects") {
      const isBrin = projectId.includes("brin") || projectId.includes("plant") || projectId.includes("cnn");

      if (isBrin) {
        /* ================= BRIN: Smart Agro-Sensor Pebble ================= */
        const baseGeo = new THREE.CylinderGeometry(1.2, 1.05, 0.28, 64);
        const baseMat = new THREE.MeshStandardMaterial({ color: 0xc44f3b, roughness: 0.6, metalness: 0.05 });
        const baseMesh = new THREE.Mesh(baseGeo, baseMat);
        baseMesh.position.y = -0.16;
        baseMesh.scale.set(1.4, 0.85, 1.15);
        productGroup.add(baseMesh);
        disposables.push(baseGeo, baseMat);

        const switchGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.03, 24);
        switchGeo.rotateZ(Math.PI / 2);
        const switchMat = new THREE.MeshStandardMaterial({ color: 0xa83d2a, roughness: 0.5 });
        const switchMesh = new THREE.Mesh(switchGeo, switchMat);
        switchMesh.position.set(1.42, -0.16, 0.35);
        productGroup.add(switchMesh);
        disposables.push(switchGeo, switchMat);

        const cordCurve = new THREE.CubicBezierCurve3(
          new THREE.Vector3(1.48, -0.16, 0),
          new THREE.Vector3(1.9, -0.17, 0.05),
          new THREE.Vector3(2.4, -0.22, -0.05),
          new THREE.Vector3(3.0, -0.28, -0.1)
        );
        const cordGeo = new THREE.TubeGeometry(cordCurve, 32, 0.045, 16, false);
        const cordMat = new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.2, metalness: 0.05 });
        const cordMesh = new THREE.Mesh(cordGeo, cordMat);
        productGroup.add(cordMesh);
        disposables.push(cordGeo, cordMat);

        const domeGeo = new THREE.SphereGeometry(1.2, 64, 32, 0, Math.PI * 2, 0, Math.PI * 0.5);
        const domeMat = new THREE.MeshStandardMaterial({ color: 0xeb5b42, roughness: 0.85, metalness: 0.02 });
        const domeMesh = new THREE.Mesh(domeGeo, domeMat);
        domeMesh.position.y = -0.04;
        domeMesh.scale.set(1.4, 0.44, 1.15);
        productGroup.add(domeMesh);
        disposables.push(domeGeo, domeMat);

        const lensBezelGeo = new THREE.TorusGeometry(0.36, 0.03, 16, 48);
        lensBezelGeo.rotateX(Math.PI / 2);
        const lensBezelMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.2, metalness: 0.9 });
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

        const ringGeo = new THREE.RingGeometry(0.16, 0.2, 36);
        ringGeo.rotateX(-Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide, transparent: true, opacity: 0.95 });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.position.set(0, 0.41, 0);
        productGroup.add(ringMesh);
        disposables.push(ringGeo, ringMat);

        floatingHoloGroup = new THREE.Group();
        floatingHoloGroup.position.set(0, 0.85, 0);
        productGroup.add(floatingHoloGroup);

        const leafShape = new THREE.Shape();
        leafShape.moveTo(0, 0);
        leafShape.bezierCurveTo(0.42, 0.35, 0.55, 0.95, 0, 1.45);
        leafShape.bezierCurveTo(-0.55, 0.95, -0.42, 0.35, 0, 0);
        const leafGeo = new THREE.ExtrudeGeometry(leafShape, { depth: 0.05, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.02, bevelThickness: 0.02 });
        leafGeo.center();

        const leafMat = new THREE.MeshPhysicalMaterial({
          color: 0x10b981,
          roughness: 0.15,
          transmission: 0.75,
          transparent: true,
          opacity: 0.85,
          emissive: 0x059669,
          emissiveIntensity: 0.3,
        });
        const leafMesh = new THREE.Mesh(leafGeo, leafMat);
        leafMesh.rotation.set(-0.15, 0, 0);
        floatingHoloGroup.add(leafMesh);
        disposables.push(leafGeo, leafMat);

        const leafWireMat = new THREE.MeshBasicMaterial({ color: 0x6ee7b7, wireframe: true, transparent: true, opacity: 0.8 });
        const leafWireMesh = new THREE.Mesh(leafGeo, leafWireMat);
        leafWireMesh.rotation.set(-0.15, 0, 0);
        leafWireMesh.scale.set(1.02, 1.02, 1.02);
        floatingHoloGroup.add(leafWireMesh);
        disposables.push(leafWireMat);

        const scanRingGeo = new THREE.TorusGeometry(0.9, 0.015, 12, 48);
        scanRingGeo.rotateX(Math.PI / 2);
        const scanRingMat = new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.85 });
        scanRingMesh = new THREE.Mesh(scanRingGeo, scanRingMat);
        floatingHoloGroup.add(scanRingMesh);
        disposables.push(scanRingGeo, scanRingMat);

        const pCount = 55;
        const pGeo = new THREE.BufferGeometry();
        const pPositions = new Float32Array(pCount * 3);
        for (let i = 0; i < pCount * 3; i += 3) {
          pPositions[i] = (Math.random() - 0.5) * 1.8;
          pPositions[i + 1] = Math.random() * 1.5 - 0.1;
          pPositions[i + 2] = (Math.random() - 0.5) * 1.8;
        }
        pGeo.setAttribute("position", new THREE.BufferAttribute(pPositions, 3));
        const pMat = new THREE.PointsMaterial({ color: 0xa7f3d0, size: 0.05, transparent: true, opacity: 0.9 });
        dataParticles = new THREE.Points(pGeo, pMat);
        floatingHoloGroup.add(dataParticles);
        disposables.push(pGeo, pMat);

      } else {
        /* ================= KPKNL: Enterprise Terminal & Data Prism ================= */
        const baseGeo = new THREE.CylinderGeometry(1.25, 1.1, 0.28, 64);
        const baseMat = new THREE.MeshStandardMaterial({ color: 0x243833, roughness: 0.35, metalness: 0.4 });
        const baseMesh = new THREE.Mesh(baseGeo, baseMat);
        baseMesh.position.y = -0.3;
        baseMesh.scale.set(1.25, 1.0, 1.05);
        productGroup.add(baseMesh);
        disposables.push(baseGeo, baseMat);

        const trimGeo = new THREE.TorusGeometry(1.18, 0.025, 12, 48);
        trimGeo.rotateX(Math.PI / 2);
        const trimMat = new THREE.MeshStandardMaterial({ color: 0xe06d53, roughness: 0.3, metalness: 0.6 });
        const trimMesh = new THREE.Mesh(trimGeo, trimMat);
        trimMesh.position.y = -0.16;
        trimMesh.scale.set(1.25, 1.0, 1.05);
        productGroup.add(trimMesh);
        disposables.push(trimGeo, trimMat);

        const glassGeo = new THREE.CylinderGeometry(1.15, 1.15, 0.04, 48);
        const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x0f172a, roughness: 0.1, transmission: 0.85, thickness: 0.3, transparent: true, opacity: 0.9 });
        const glassMesh = new THREE.Mesh(glassGeo, glassMat);
        glassMesh.position.y = -0.14;
        glassMesh.scale.set(1.25, 1.0, 1.05);
        productGroup.add(glassMesh);
        disposables.push(glassGeo, glassMat);

        floatingHoloGroup = new THREE.Group();
        floatingHoloGroup.position.set(0, 0.48, 0);
        productGroup.add(floatingHoloGroup);

        const boxGeo = new THREE.BoxGeometry(0.85, 0.85, 0.85);
        const boxMat = new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, roughness: 0.1, transmission: 0.82, transparent: true, opacity: 0.55 });
        const boxMesh = new THREE.Mesh(boxGeo, boxMat);
        floatingHoloGroup.add(boxMesh);
        disposables.push(boxGeo, boxMat);

        const boxWireMat = new THREE.MeshBasicMaterial({ color: 0x93c5fd, wireframe: true, transparent: true, opacity: 0.85 });
        const boxWireMesh = new THREE.Mesh(boxGeo, boxWireMat);
        boxWireMesh.scale.set(1.01, 1.01, 1.01);
        floatingHoloGroup.add(boxWireMesh);
        disposables.push(boxWireMat);

        const barHeights = [0.3, 0.55, 0.72, 0.45];
        const barColors = [0xe06d53, 0x34d399, 0x38bdf8, 0xfbbf24];
        const barPositions = [[-0.2, -0.2], [0.2, -0.2], [0.2, 0.2], [-0.2, 0.2]];
        barPositions.forEach((pos, idx) => {
          const h = barHeights[idx];
          const barGeo = new THREE.BoxGeometry(0.12, h, 0.12);
          const barMat = new THREE.MeshStandardMaterial({ color: barColors[idx], roughness: 0.3, metalness: 0.2, emissive: barColors[idx], emissiveIntensity: 0.25 });
          const barMesh = new THREE.Mesh(barGeo, barMat);
          barMesh.position.set(pos[0], -0.42 + h / 2, pos[1]);
          floatingHoloGroup?.add(barMesh);
          disposables.push(barGeo, barMat);
        });

        const ringGeo = new THREE.TorusGeometry(0.95, 0.018, 16, 48);
        ringGeo.rotateX(Math.PI / 3);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.75 });
        scanRingMesh = new THREE.Mesh(ringGeo, ringMat);
        floatingHoloGroup.add(scanRingMesh);
        disposables.push(ringGeo, ringMat);
      }

    } else if (type === "cover") {
      /* ================= COVER: Spatial Geo-Sphere & Orbital Telemetry ================= */
      const baseGeo = new THREE.CylinderGeometry(1.2, 1.05, 0.28, 64);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x344640, roughness: 0.6, metalness: 0.1 });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.y = -0.16;
      baseMesh.scale.set(1.4, 0.85, 1.15);
      productGroup.add(baseMesh);
      disposables.push(baseGeo, baseMat);

      const domeGeo = new THREE.SphereGeometry(1.2, 64, 32, 0, Math.PI * 2, 0, Math.PI * 0.5);
      const domeMat = new THREE.MeshStandardMaterial({ color: 0x435c55, roughness: 0.7, metalness: 0.05 });
      const domeMesh = new THREE.Mesh(domeGeo, domeMat);
      domeMesh.position.y = -0.16;
      domeMesh.scale.set(1.4, 0.44, 1.15);
      productGroup.add(domeMesh);
      disposables.push(domeGeo, domeMat);

      const rimGeo = new THREE.TorusGeometry(1.2, 0.024, 16, 64);
      rimGeo.rotateX(Math.PI / 2);
      const rimMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.25, metalness: 0.7 });
      const rimMesh = new THREE.Mesh(rimGeo, rimMat);
      rimMesh.position.y = -0.06;
      rimMesh.scale.set(1.4, 1.0, 1.15);
      productGroup.add(rimMesh);
      disposables.push(rimGeo, rimMat);

      floatingHoloGroup = new THREE.Group();
      floatingHoloGroup.position.set(0, 0.48, 0);
      productGroup.add(floatingHoloGroup);

      // Glowing Geo-Sphere
      const sphereGeo = new THREE.SphereGeometry(0.82, 32, 32);
      const sphereMat = new THREE.MeshPhysicalMaterial({
        color: 0x43766c,
        roughness: 0.15,
        transmission: 0.75,
        thickness: 0.4,
        transparent: true,
        opacity: 0.85,
      });
      const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
      floatingHoloGroup.add(sphereMesh);
      disposables.push(sphereGeo, sphereMat);

      // Wireframe Latitude Grid
      const wireMat = new THREE.MeshBasicMaterial({ color: 0xb19470, wireframe: true, transparent: true, opacity: 0.75 });
      const wireMesh = new THREE.Mesh(sphereGeo, wireMat);
      wireMesh.scale.set(1.01, 1.01, 1.01);
      floatingHoloGroup.add(wireMesh);
      disposables.push(wireMat);

      // Orbiting Equatorial Ring
      const ringGeo = new THREE.TorusGeometry(1.15, 0.02, 16, 64);
      ringGeo.rotateX(Math.PI / 3);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xe06d53, transparent: true, opacity: 0.85 });
      scanRingMesh = new THREE.Mesh(ringGeo, ringMat);
      floatingHoloGroup.add(scanRingMesh);
      disposables.push(ringGeo, ringMat);

      // Orbiting Geo-Nodes
      const pCount = 45;
      const pGeo = new THREE.BufferGeometry();
      const pPos = new Float32Array(pCount * 3);
      for (let i = 0; i < pCount * 3; i += 3) {
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = 1.1 + Math.random() * 0.3;
        pPos[i] = r * Math.sin(phi) * Math.cos(theta);
        pPos[i + 1] = r * Math.sin(phi) * Math.sin(theta);
        pPos[i + 2] = r * Math.cos(phi);
      }
      pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
      const pMat = new THREE.PointsMaterial({ color: 0xf8fae5, size: 0.045, transparent: true, opacity: 0.9 });
      dataParticles = new THREE.Points(pGeo, pMat);
      floatingHoloGroup.add(dataParticles);
      disposables.push(pGeo, pMat);

    } else if (type === "experience") {
      /* ================= EXPERIENCE: Neural Synapse Torus Knot ================= */
      const baseGeo = new THREE.CylinderGeometry(1.2, 1.05, 0.28, 64);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x2e423b, roughness: 0.6, metalness: 0.1 });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.y = -0.16;
      baseMesh.scale.set(1.4, 0.85, 1.15);
      productGroup.add(baseMesh);
      disposables.push(baseGeo, baseMat);

      const domeGeo = new THREE.SphereGeometry(1.2, 64, 32, 0, Math.PI * 2, 0, Math.PI * 0.5);
      const domeMat = new THREE.MeshStandardMaterial({ color: 0x3d594f, roughness: 0.7, metalness: 0.05 });
      const domeMesh = new THREE.Mesh(domeGeo, domeMat);
      domeMesh.position.y = -0.16;
      domeMesh.scale.set(1.4, 0.44, 1.15);
      productGroup.add(domeMesh);
      disposables.push(domeGeo, domeMat);

      const rimGeo = new THREE.TorusGeometry(1.2, 0.024, 16, 64);
      rimGeo.rotateX(Math.PI / 2);
      const rimMat = new THREE.MeshStandardMaterial({ color: 0xe07a5f, roughness: 0.25, metalness: 0.65 });
      const rimMesh = new THREE.Mesh(rimGeo, rimMat);
      rimMesh.position.y = -0.06;
      rimMesh.scale.set(1.4, 1.0, 1.15);
      productGroup.add(rimMesh);
      disposables.push(rimGeo, rimMat);

      floatingHoloGroup = new THREE.Group();
      floatingHoloGroup.position.set(0, 0.48, 0);
      productGroup.add(floatingHoloGroup);

      // Neural Knot
      const knotGeo = new THREE.TorusKnotGeometry(0.62, 0.17, 80, 16);
      const knotMat = new THREE.MeshPhysicalMaterial({
        color: 0x43766c,
        roughness: 0.2,
        transmission: 0.7,
        transparent: true,
        opacity: 0.8,
        emissive: 0x2a4e47,
        emissiveIntensity: 0.3,
      });
      const knotMesh = new THREE.Mesh(knotGeo, knotMat);
      floatingHoloGroup.add(knotMesh);
      disposables.push(knotGeo, knotMat);

      const knotWireMat = new THREE.MeshBasicMaterial({ color: 0xb19470, wireframe: true, transparent: true, opacity: 0.7 });
      const knotWireMesh = new THREE.Mesh(knotGeo, knotWireMat);
      knotWireMesh.scale.set(1.02, 1.02, 1.02);
      floatingHoloGroup.add(knotWireMesh);
      disposables.push(knotWireMat);

      const ringGeo = new THREE.TorusGeometry(1.1, 0.02, 16, 48);
      ringGeo.rotateX(Math.PI / 4);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.8 });
      scanRingMesh = new THREE.Mesh(ringGeo, ringMat);
      floatingHoloGroup.add(scanRingMesh);
      disposables.push(ringGeo, ringMat);

    } else if (type === "credentials") {
      /* ================= CREDENTIALS: Verified BNSP Data Shield ================= */
      const baseGeo = new THREE.CylinderGeometry(1.2, 1.05, 0.28, 64);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x733f30, roughness: 0.6, metalness: 0.1 });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.y = -0.16;
      baseMesh.scale.set(1.4, 0.85, 1.15);
      productGroup.add(baseMesh);
      disposables.push(baseGeo, baseMat);

      const domeGeo = new THREE.SphereGeometry(1.2, 64, 32, 0, Math.PI * 2, 0, Math.PI * 0.5);
      const domeMat = new THREE.MeshStandardMaterial({ color: 0x94503e, roughness: 0.7, metalness: 0.05 });
      const domeMesh = new THREE.Mesh(domeGeo, domeMat);
      domeMesh.position.y = -0.16;
      domeMesh.scale.set(1.4, 0.44, 1.15);
      productGroup.add(domeMesh);
      disposables.push(domeGeo, domeMat);

      const rimGeo = new THREE.TorusGeometry(1.2, 0.024, 16, 64);
      rimGeo.rotateX(Math.PI / 2);
      const rimMat = new THREE.MeshStandardMaterial({ color: 0xdfb175, roughness: 0.2, metalness: 0.75 });
      const rimMesh = new THREE.Mesh(rimGeo, rimMat);
      rimMesh.position.y = -0.06;
      rimMesh.scale.set(1.4, 1.0, 1.15);
      productGroup.add(rimMesh);
      disposables.push(rimGeo, rimMat);

      floatingHoloGroup = new THREE.Group();
      floatingHoloGroup.position.set(0, 0.5, 0);
      productGroup.add(floatingHoloGroup);

      // Octahedral Shield
      const octGeo = new THREE.OctahedronGeometry(0.82, 1);
      const octMat = new THREE.MeshPhysicalMaterial({
        color: 0xb19470,
        roughness: 0.15,
        metalness: 0.45,
        transmission: 0.65,
        transparent: true,
        opacity: 0.85,
        emissive: 0x8c7150,
        emissiveIntensity: 0.25,
      });
      const octMesh = new THREE.Mesh(octGeo, octMat);
      floatingHoloGroup.add(octMesh);
      disposables.push(octGeo, octMat);

      const octWireMat = new THREE.MeshBasicMaterial({ color: 0xf8fae5, wireframe: true, transparent: true, opacity: 0.8 });
      const octWireMesh = new THREE.Mesh(octGeo, octWireMat);
      octWireMesh.scale.set(1.02, 1.02, 1.02);
      floatingHoloGroup.add(octWireMesh);
      disposables.push(octWireMat);

      const ringGeo = new THREE.TorusGeometry(1.15, 0.02, 16, 48);
      ringGeo.rotateX(Math.PI / 3);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xe06d53, transparent: true, opacity: 0.85 });
      scanRingMesh = new THREE.Mesh(ringGeo, ringMat);
      floatingHoloGroup.add(scanRingMesh);
      disposables.push(ringGeo, ringMat);

    } else if (type === "skills") {
      /* ================= SKILLS: Tensor Matrix Cube Lattice ================= */
      const baseGeo = new THREE.CylinderGeometry(1.2, 1.05, 0.28, 64);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x243545, roughness: 0.6, metalness: 0.1 });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.y = -0.16;
      baseMesh.scale.set(1.4, 0.85, 1.15);
      productGroup.add(baseMesh);
      disposables.push(baseGeo, baseMat);

      const domeGeo = new THREE.SphereGeometry(1.2, 64, 32, 0, Math.PI * 2, 0, Math.PI * 0.5);
      const domeMat = new THREE.MeshStandardMaterial({ color: 0x31465b, roughness: 0.7, metalness: 0.05 });
      const domeMesh = new THREE.Mesh(domeGeo, domeMat);
      domeMesh.position.y = -0.16;
      domeMesh.scale.set(1.4, 0.44, 1.15);
      productGroup.add(domeMesh);
      disposables.push(domeGeo, domeMat);

      const rimGeo = new THREE.TorusGeometry(1.2, 0.024, 16, 64);
      rimGeo.rotateX(Math.PI / 2);
      const rimMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.2, metalness: 0.7 });
      const rimMesh = new THREE.Mesh(rimGeo, rimMat);
      rimMesh.position.y = -0.06;
      rimMesh.scale.set(1.4, 1.0, 1.15);
      productGroup.add(rimMesh);
      disposables.push(rimGeo, rimMat);

      floatingHoloGroup = new THREE.Group();
      floatingHoloGroup.position.set(0, 0.5, 0);
      productGroup.add(floatingHoloGroup);

      const cubeGeo = new THREE.BoxGeometry(0.85, 0.85, 0.85);
      const cubeMat = new THREE.MeshPhysicalMaterial({
        color: 0x3b82f6,
        roughness: 0.1,
        transmission: 0.8,
        transparent: true,
        opacity: 0.65,
      });
      const cubeMesh = new THREE.Mesh(cubeGeo, cubeMat);
      floatingHoloGroup.add(cubeMesh);
      disposables.push(cubeGeo, cubeMat);

      const cubeWireMat = new THREE.MeshBasicMaterial({ color: 0x93c5fd, wireframe: true, transparent: true, opacity: 0.9 });
      const cubeWireMesh = new THREE.Mesh(cubeGeo, cubeWireMat);
      cubeWireMesh.scale.set(1.02, 1.02, 1.02);
      floatingHoloGroup.add(cubeWireMesh);
      disposables.push(cubeWireMat);

      const innerIcoGeo = new THREE.IcosahedronGeometry(0.4, 0);
      const innerIcoMat = new THREE.MeshStandardMaterial({ color: 0xe06d53, emissive: 0xe06d53, emissiveIntensity: 0.4 });
      const innerIcoMesh = new THREE.Mesh(innerIcoGeo, innerIcoMat);
      floatingHoloGroup.add(innerIcoMesh);
      disposables.push(innerIcoGeo, innerIcoMat);

      const ringGeo = new THREE.TorusGeometry(1.15, 0.02, 16, 48);
      ringGeo.rotateX(Math.PI / 2.5);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85 });
      scanRingMesh = new THREE.Mesh(ringGeo, ringMat);
      floatingHoloGroup.add(scanRingMesh);
      disposables.push(ringGeo, ringMat);

    } else {
      /* ================= CONTACT: Signal Radar Beacon ================= */
      const baseGeo = new THREE.CylinderGeometry(1.2, 1.05, 0.28, 64);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x993d2b, roughness: 0.6, metalness: 0.1 });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.y = -0.16;
      baseMesh.scale.set(1.4, 0.85, 1.15);
      productGroup.add(baseMesh);
      disposables.push(baseGeo, baseMat);

      const domeGeo = new THREE.SphereGeometry(1.2, 64, 32, 0, Math.PI * 2, 0, Math.PI * 0.5);
      const domeMat = new THREE.MeshStandardMaterial({ color: 0xb84b36, roughness: 0.7, metalness: 0.05 });
      const domeMesh = new THREE.Mesh(domeGeo, domeMat);
      domeMesh.position.y = -0.16;
      domeMesh.scale.set(1.4, 0.44, 1.15);
      productGroup.add(domeMesh);
      disposables.push(domeGeo, domeMat);

      const rimGeo = new THREE.TorusGeometry(1.2, 0.024, 16, 64);
      rimGeo.rotateX(Math.PI / 2);
      const rimMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.25, metalness: 0.7 });
      const rimMesh = new THREE.Mesh(rimGeo, rimMat);
      rimMesh.position.y = -0.06;
      rimMesh.scale.set(1.4, 1.0, 1.15);
      productGroup.add(rimMesh);
      disposables.push(rimGeo, rimMat);

      floatingHoloGroup = new THREE.Group();
      floatingHoloGroup.position.set(0, 0.48, 0);
      productGroup.add(floatingHoloGroup);

      const coneGeo = new THREE.ConeGeometry(0.72, 1.2, 24, 4, true);
      const coneMat = new THREE.MeshPhysicalMaterial({
        color: 0xe06d53,
        roughness: 0.2,
        transmission: 0.7,
        transparent: true,
        opacity: 0.75,
        side: THREE.DoubleSide,
      });
      const coneMesh = new THREE.Mesh(coneGeo, coneMat);
      floatingHoloGroup.add(coneMesh);
      disposables.push(coneGeo, coneMat);

      const coneWireMat = new THREE.MeshBasicMaterial({ color: 0xffa08c, wireframe: true, transparent: true, opacity: 0.85 });
      const coneWireMesh = new THREE.Mesh(coneGeo, coneWireMat);
      coneWireMesh.scale.set(1.02, 1.02, 1.02);
      floatingHoloGroup.add(coneWireMesh);
      disposables.push(coneWireMat);

      const ringGeo = new THREE.TorusGeometry(1.15, 0.02, 16, 48);
      ringGeo.rotateX(Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.85 });
      scanRingMesh = new THREE.Mesh(ringGeo, ringMat);
      floatingHoloGroup.add(scanRingMesh);
      disposables.push(ringGeo, ringMat);
    }

    // 5. Initial Rotation & Angle Alignment
    productGroup.rotation.set(0.04, -0.22, 0.02);

    // 6. Interactive Mouse Drag & Parallax Handling
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      setIsGrabbed(true);
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const normY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      mouseOffsetRef.current = { x: normX, y: normY };

      if (!isDraggingRef.current) return;

      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      productGroup.rotation.y += deltaX * 0.008;
      productGroup.rotation.x += deltaY * 0.008;
      productGroup.rotation.x = Math.max(-0.5, Math.min(0.6, productGroup.rotation.x));

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      setIsGrabbed(false);
    };

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

      const hoverBob = Math.sin(elapsedTime * 1.8) * 0.03;
      productGroup.position.y = hoverBob;

      const baseScale = 0.44;
      const targetScale = isHovered ? baseScale * 1.05 : baseScale;
      productGroup.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.08);

      shadowMesh.scale.set(baseScale - hoverBob * 0.3, baseScale - hoverBob * 0.3, 1);
      shadowMat.opacity = 0.88 - hoverBob * 0.6;

      if (!isDraggingRef.current) {
        const targetRotY = -0.22 + mouseOffsetRef.current.x * 0.18;
        const targetRotX = 0.04 - mouseOffsetRef.current.y * 0.12;
        productGroup.rotation.y += (targetRotY - productGroup.rotation.y) * 0.05;
        productGroup.rotation.x += (targetRotX - productGroup.rotation.x) * 0.05;
      }

      if (floatingHoloGroup) {
        floatingHoloGroup.rotation.y = elapsedTime * 0.35;
        floatingHoloGroup.position.y = (type === "projects" ? 0.85 : 0.48) + Math.sin(elapsedTime * 2.5) * 0.04;
      }

      if (scanRingMesh) {
        scanRingMesh.rotation.z = elapsedTime * 0.4;
        scanRingMesh.rotation.y = Math.sin(elapsedTime * 0.8) * 0.25;
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
  }, [type, projectId, isHovered]);

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
