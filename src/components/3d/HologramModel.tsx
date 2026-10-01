import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface HologramModelProps {
  type?: "crystal" | "cube" | "mesh" | "sphere";
  isHovered?: boolean;
}

export const HologramModel: React.FC<HologramModelProps> = ({ type = "crystal", isHovered = false }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const hoverRef = useRef(isHovered);

  useEffect(() => {
    hoverRef.current = isHovered;
  }, [isHovered]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 160;
    const height = mount.clientHeight || 160;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 10);
    camera.position.z = 2.8;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Geometry based on type
    let geometry: THREE.BufferGeometry;
    if (type === "cube") {
      geometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
    } else if (type === "sphere") {
      geometry = new THREE.SphereGeometry(0.85, 24, 24);
    } else {
      // Default: Icosahedron / Crystal
      geometry = new THREE.IcosahedronGeometry(0.9, 0);
    }

    // Outer wireframe/glass crystal
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x43766c,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });
    const wireMesh = new THREE.Mesh(geometry, wireMat);
    scene.add(wireMesh);

    // Inner glowing core
    const innerGeo = new THREE.OctahedronGeometry(0.45, 0);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x76453b,
      wireframe: false,
      transparent: true,
      opacity: 0.65,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    scene.add(innerMesh);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      const speedMultiplier = hoverRef.current ? 3.0 : 1.0;
      wireMesh.rotation.x += 0.008 * speedMultiplier;
      wireMesh.rotation.y += 0.012 * speedMultiplier;

      innerMesh.rotation.x -= 0.015 * speedMultiplier;
      innerMesh.rotation.y -= 0.018 * speedMultiplier;

      const scale = hoverRef.current ? 1.08 : 1.0;
      wireMesh.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometry.dispose();
      wireMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
    };
  }, [type]);

  return (
    <div
      ref={mountRef}
      className="w-32 h-32 md:w-36 md:h-36 flex items-center justify-center transition-transform duration-300"
      aria-label="3D Hologram Preview"
    />
  );
};
