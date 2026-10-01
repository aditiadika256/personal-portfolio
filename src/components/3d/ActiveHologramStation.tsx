import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface ActiveHologramStationProps {
  sectionId: string;
  projectType?: "crystal" | "cube" | "mesh" | "sphere";
  title?: string;
  subtitle?: string;
  className?: string;
  compact?: boolean;
}

export const ActiveHologramStation: React.FC<ActiveHologramStationProps> = ({
  sectionId,
  projectType = "crystal",
  title,
  subtitle,
  className = "",
  compact = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 240;
    const height = mount.clientHeight || 240;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 4.2;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Group for all holographic geometry
    const holoGroup = new THREE.Group();
    scene.add(holoGroup);

    // 2. Select Geometry according to Section & Project
    let primaryGeo: THREE.BufferGeometry;
    let secondaryGeo: THREE.BufferGeometry;

    if (sectionId === "projects") {
      if (projectType === "cube") {
        // KPKNL Enterprise DAMS: Data Cube Matrix
        primaryGeo = new THREE.BoxGeometry(1.5, 1.5, 1.5, 3, 3, 3);
        secondaryGeo = new THREE.OctahedronGeometry(0.8, 1);
      } else {
        // BRIN NDVI Plant Health: Spectral Botanical Crystal / Icosahedron
        primaryGeo = new THREE.IcosahedronGeometry(1.3, 1);
        secondaryGeo = new THREE.DodecahedronGeometry(0.75, 0);
      }
    } else if (sectionId === "experience") {
      // Research & Experience: Neural Synapse Torus Knot
      primaryGeo = new THREE.TorusKnotGeometry(0.9, 0.28, 64, 12);
      secondaryGeo = new THREE.SphereGeometry(0.5, 12, 12);
    } else if (sectionId === "credentials") {
      // Credentials: BNSP Data Scientist Shield / Octahedron
      primaryGeo = new THREE.OctahedronGeometry(1.4, 2);
      secondaryGeo = new THREE.RingGeometry(1.6, 1.7, 32);
    } else if (sectionId === "skills") {
      // Skill Matrix: Multidimensional Tensor Lattice
      primaryGeo = new THREE.BoxGeometry(1.4, 1.4, 1.4, 4, 4, 4);
      secondaryGeo = new THREE.IcosahedronGeometry(0.6, 0);
    } else if (sectionId === "contact") {
      // Contact: Signal Radar Beacon
      primaryGeo = new THREE.ConeGeometry(1.2, 1.8, 16, 4, true);
      secondaryGeo = new THREE.RingGeometry(1.3, 1.4, 32);
    } else {
      // Cover / Overview: Planetary Spatial Geo-Sphere
      primaryGeo = new THREE.SphereGeometry(1.25, 24, 24);
      secondaryGeo = new THREE.RingGeometry(1.6, 1.75, 36);
    }

    // Outer Primary Hologram Material (Forest Green)
    const primaryMat = new THREE.MeshBasicMaterial({
      color: 0x43766c,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });
    const primaryMesh = new THREE.Mesh(primaryGeo, primaryMat);
    holoGroup.add(primaryMesh);

    // Inner Glowing Core Material (Terracotta / Bronze)
    const secondaryMat = new THREE.MeshBasicMaterial({
      color: 0x76453b,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
    });
    const secondaryMesh = new THREE.Mesh(secondaryGeo, secondaryMat);
    holoGroup.add(secondaryMesh);

    // Orbiting Equatorial Ring (Bronze)
    const ringGeo = new THREE.TorusGeometry(1.7, 0.015, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xb19470,
      transparent: true,
      opacity: 0.7,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 3;
    holoGroup.add(ringMesh);

    // Floating Quantum Hologram Particles
    const particleCount = 40;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 3.4;
      particlePositions[i + 1] = (Math.random() - 0.5) * 3.4;
      particlePositions[i + 2] = (Math.random() - 0.5) * 3.4;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xb19470,
      size: 0.04,
      transparent: true,
      opacity: 0.75,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    holoGroup.add(particles);

    // Mouse Interaction
    const handleMouseMove = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
      mouseRef.current.targetX = x;
      mouseRef.current.targetY = y;
    };

    mount.addEventListener("mousemove", handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth || 240;
      const h = mount.clientHeight || 240;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // Animation Loop
    let animationId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse lerp
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;

      // Holographic rotations
      primaryMesh.rotation.y = elapsedTime * 0.4 + mouseRef.current.x * 0.6;
      primaryMesh.rotation.x = elapsedTime * 0.25 - mouseRef.current.y * 0.6;

      secondaryMesh.rotation.y = -elapsedTime * 0.6;
      secondaryMesh.rotation.z = elapsedTime * 0.35;

      ringMesh.rotation.z = elapsedTime * 0.3;
      ringMesh.rotation.y = Math.sin(elapsedTime * 0.5) * 0.2;

      particles.rotation.y = -elapsedTime * 0.15;

      // Pulse breathing
      const pulse = 1.0 + Math.sin(elapsedTime * 2.0) * 0.04;
      primaryMesh.scale.set(pulse, pulse, pulse);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      mount.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      primaryGeo.dispose();
      secondaryGeo.dispose();
      ringGeo.dispose();
      particleGeo.dispose();
      primaryMat.dispose();
      secondaryMat.dispose();
      ringMat.dispose();
      particleMat.dispose();
    };
  }, [sectionId, projectType]);

  const defaultTitle =
    title ||
    (sectionId === "projects"
      ? "3D HOLOGRAM // ACTIVE PROJECT"
      : sectionId === "experience"
      ? "3D HOLOGRAM // NEURAL LATTICE"
      : sectionId === "credentials"
      ? "3D HOLOGRAM // CERTIFIED SHIELD"
      : sectionId === "skills"
      ? "3D HOLOGRAM // TENSOR MATRIX"
      : sectionId === "contact"
      ? "3D HOLOGRAM // RADAR BEACON"
      : "3D HOLOGRAM // SPATIAL GEO-NODE");

  const defaultSubtitle =
    subtitle ||
    (sectionId === "projects"
      ? projectType === "cube"
        ? "ISOMETRIC DATA SYSTEM"
        : "NDVI MULTISPECTRAL SCAN"
      : "SYNAPSE TELEMETRY ONLINE");

  return (
    <div
      className={`relative card-glass rounded-2xl p-3 border border-bronze/40 overflow-hidden shadow-card transition-all duration-500 hover:border-bronze ${className}`}
    >
      {/* Laser Scanning Beam */}
      <div className="hologram-scanline" />

      {/* Futuristic Corner Crosshairs */}
      <span className="absolute top-2 left-2 text-[10px] font-mono text-bronze/60 leading-none select-none">
        +
      </span>
      <span className="absolute top-2 right-2 text-[10px] font-mono text-bronze/60 leading-none select-none">
        +
      </span>
      <span className="absolute bottom-2 left-2 text-[10px] font-mono text-bronze/60 leading-none select-none">
        +
      </span>
      <span className="absolute bottom-2 right-2 text-[10px] font-mono text-bronze/60 leading-none select-none">
        +
      </span>

      {/* Hologram Header HUD */}
      <div className="flex items-center justify-between border-b border-bronze/25 pb-2 px-1 text-[10px] font-mono uppercase tracking-wider text-forest-dark/80">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="font-semibold text-terracotta">{defaultTitle}</span>
        </div>
        <span className="text-bronze-dark hidden sm:inline">{defaultSubtitle}</span>
      </div>

      {/* 3D WebGL Canvas Container */}
      <div
        ref={mountRef}
        className={`w-full ${compact ? "h-36 sm:h-44" : "h-52 sm:h-64"} flex items-center justify-center cursor-grab active:cursor-grabbing`}
        title="Interactive 3D Hologram (Gerakkan mouse untuk memutar)"
      />

      {/* Telemetry Footer */}
      <div className="flex items-center justify-between border-t border-bronze/20 pt-2 px-1 text-[9px] font-mono text-bronze-dark">
        <span>FREQ: 60Hz // OPTICAL: ON</span>
        <span className="text-forest-dark font-medium">INTERACTIVE 3D NODE</span>
      </div>
    </div>
  );
};
