import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export const DistortionBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.z = 7;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);

    // 2. Geometry: Organic Plane Mesh with GPU Vertex Shader Waves
    const planeGeo = new THREE.PlaneGeometry(14, 10, 48, 48);

    // Material: GPU Shader Wireframe (0% CPU overhead, 120fps smooth)
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uScrollFactor: { value: 0 },
        uColor: { value: new THREE.Color(0x43766c) },
        uOpacity: { value: 0.18 },
      },
      wireframe: true,
      transparent: true,
      vertexShader: `
        uniform float uTime;
        uniform float uScrollFactor;
        void main() {
          vec3 pos = position;
          float wave = sin(pos.x * 0.8 + uTime * 1.2 + uScrollFactor) * 0.35 +
                       cos(pos.y * 0.6 + uTime * 0.9) * 0.25;
          pos.z += wave;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uOpacity;
        void main() {
          gl_FragColor = vec4(uColor, uOpacity);
        }
      `,
    });

    const mesh = new THREE.Mesh(planeGeo, material);
    mesh.rotation.x = -Math.PI / 4;
    mesh.position.y = -1;
    scene.add(mesh);

    // Floating Particles (Spasial Nodes / Data points)
    const particleCount = 70;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 16;
      particlePositions[i + 1] = (Math.random() - 0.5) * 12;
      particlePositions[i + 2] = (Math.random() - 0.5) * 6;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xb19470,
      size: 0.045,
      transparent: true,
      opacity: 0.45,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xf8fae5, 1.2);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x76453b, 2.5, 20);
    pointLight.position.set(3, 4, 5);
    scene.add(pointLight);

    // 4. Scroll & Mouse Tracking
    let scrollY = window.scrollY;
    let targetScrollY = window.scrollY;
    let mouseX = 0;
    let mouseY = 0;

    const onScroll = () => {
      targetScrollY = window.scrollY;
    };

    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
    };

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("resize", onResize);

    // 5. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();
      scrollY += (targetScrollY - scrollY) * 0.08;

      // Update shader uniforms on GPU directly (Zero CPU array manipulation)
      material.uniforms.uTime.value = elapsedTime;
      material.uniforms.uScrollFactor.value = scrollY * 0.002;

      // Rotasi mesh halus
      mesh.rotation.z = Math.sin(elapsedTime * 0.15) * 0.08 + mouseX * 0.05;
      mesh.rotation.y = mouseY * 0.05;

      // Partikel mengambang
      particles.rotation.y = elapsedTime * 0.02 + scrollY * 0.0003;
      particles.rotation.x = elapsedTime * 0.01;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      planeGeo.dispose();
      material.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-85"
    />
  );
};
