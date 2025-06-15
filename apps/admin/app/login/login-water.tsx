/* eslint-disable react/no-unknown-property */
// login-water.tsx
"use client";

import React, { useMemo, Suspense } from "react";
import { Canvas, useLoader, useFrame } from "@react-three/fiber";
import { Cloud, Environment, OrbitControls, Sky } from "@react-three/drei";
import {
  TextureLoader,
  RepeatWrapping,
  PlaneGeometry,
  Vector3,
  RGBAFormat,
  SRGBColorSpace,
} from "three";
import { Water } from "three-stdlib";

function Ocean() {
  const waterNormals = useLoader(TextureLoader, "/waternormals.jpeg");

  useMemo(() => {
    waterNormals.wrapS = waterNormals.wrapT = RepeatWrapping;
    waterNormals.repeat.set(2, 2); // 更大波浪
  }, [waterNormals]);

  const geometry = useMemo(() => new PlaneGeometry(10000, 10000), []);
  const sunDirection = useMemo(() => new Vector3(1, 1, 1).normalize(), []);

  const config = useMemo(
    () => ({
      textureWidth: 1024,
      textureHeight: 1024,
      waterNormals,
      sunDirection,
      sunColor: 0xffffff,
      waterColor: 0x1e90ff, // 更像海洋蓝
      distortionScale: 8.0, // 波浪起伏更强
      fog: false,
      format: RGBAFormat,
      colorSpace: SRGBColorSpace,
    }),
    [waterNormals, sunDirection]
  );

  const water = useMemo(() => new Water(geometry, config), [geometry, config]);

  useFrame((_, delta) => {
    if (water.material.uniforms?.time) {
      water.material.uniforms.time.value += delta;
    }
  });

  return <primitive object={water} rotation-x={-Math.PI / 2} />;
}

export default function App() {
  return (
    <Canvas
      camera={{ position: [0, 5, 100], fov: 55, near: 1, far: 20000 }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.5} />
      <pointLight decay={0} position={[100, 100, 100]} />
      <pointLight decay={0.5} position={[-100, -100, -100]} />
      <mesh position={[0, -2, 0]} scale={[20, 5, 20]}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial color="#7c5d3f" roughness={1} metalness={0.1} />
      </mesh>
      <Suspense fallback={null}>
        <directionalLight
          position={[500, 200, -500]}
          intensity={2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <Ocean />
        <Sky sunPosition={[100, 100, 20]} />
        <Cloud
          opacity={0.4}
          speed={0.3}
          segments={50}
          position={[-100, 30, -30]}
          color="skyblue"
          scale={[1.5, 1.5, 1.5]}
        />
        <Cloud
          opacity={0.3}
          speed={0.3}
          segments={50}
          position={[-60, 40, -30]}
          color="pink"
          scale={[2, 2, 2]}
        />
        <Cloud
          opacity={0.2}
          speed={0.25}
          segments={50}
          position={[0, 28, -20]}
          color="pink"
          scale={[1.5, 1.5, 1.5]}
        />
        <Cloud
          opacity={0.5}
          speed={0.35}
          segments={40}
          position={[85, 46, -20]}
          color="skyblue"
          scale={[1.5, 1.5, 1.5]}
        />
        <Cloud
          opacity={0.5}
          speed={0.35}
          segments={40}
          position={[45, 24, -20]}
          color="pink"
          scale={[2, 2, 2]}
        />
      </Suspense>
      <OrbitControls />
    </Canvas>
  );
}
