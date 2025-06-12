/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unknown-property */
"use client";

import { RGBELoader } from "three-stdlib";
import { Canvas, useLoader } from "@react-three/fiber";
import {
  Center,
  Text3D,
  Environment,
  Lightformer,
  OrbitControls,
  MeshTransmissionMaterial,
} from "@react-three/drei";
import { Suspense } from "react";
import { useControls, Leva } from "leva";

const hdrUrl =
  "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/aerodynamics_workshop_1k.hdr";

export default function LoginBg() {
  const { ...config } = useControls({
    backside: true,
    backsideThickness: { value: 0.4, min: 0, max: 2 },
    samples: { value: 16, min: 1, max: 32, step: 1 },
    resolution: { value: 1024, min: 64, max: 2048, step: 64 },
    transmission: { value: 1, min: 0, max: 1 },
    clearcoat: { value: 1, min: 0.1, max: 1 },
    clearcoatRoughness: { value: 0.0, min: 0, max: 1 },
    thickness: { value: 0.3, min: 0, max: 5 },
    chromaticAberration: { value: 0.15, min: -5, max: 5 },
    anisotropy: { value: 0.25, min: 0, max: 1, step: 0.01 },
    roughness: { value: 0, min: 0, max: 1, step: 0.01 },
    distortion: { value: 2, min: 0, max: 4, step: 0.01 },
    distortionScale: { value: 0.1, min: 0.01, max: 1, step: 0.01 },
    temporalDistortion: { value: 0.1, min: 0, max: 1, step: 0.01 },
    ior: { value: 1.25, min: 0, max: 2, step: 0.01 },
    color: "#7ec3f6",
    shadow: "#94cbff",
    autoRotate: false,
  });

  return (
    <div style={{ height: "500px", width: "500px" }}>
      <Canvas
        shadows
        orthographic
        camera={{ position: [10, 20, 20], zoom: 40 }}
        gl={{ preserveDrawingBuffer: true }}
      >
        <Suspense fallback={null}>
          <Text rotation={[0, 1, 0]} position={[0, 0, 0]} config={config} />
        </Suspense>
        <OrbitControls
          autoRotate
          autoRotateSpeed={-0.1}
          zoomSpeed={0.25}
          minZoom={40}
          maxZoom={140}
          enablePan={false}
          dampingFactor={0.05}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 3}
        />
        <Environment resolution={32}>
          <group rotation={[-Math.PI / 4, -0.3, 0]}>
            <Lightformer
              intensity={20}
              rotation-x={Math.PI / 2}
              position={[0, 5, -9]}
              scale={[10, 10, 1]}
            />
            <Lightformer
              intensity={2}
              rotation-y={Math.PI / 2}
              position={[-5, 1, -1]}
              scale={[10, 2, 1]}
            />
            <Lightformer
              intensity={2}
              rotation-y={Math.PI / 2}
              position={[-5, -1, -1]}
              scale={[10, 2, 1]}
            />
            <Lightformer
              intensity={2}
              rotation-y={-Math.PI / 2}
              position={[10, 1, 0]}
              scale={[20, 2, 1]}
            />
            <Lightformer
              type="ring"
              intensity={2}
              rotation-y={Math.PI / 2}
              position={[-0.1, -1, -5]}
              scale={10}
            />
          </group>
        </Environment>
      </Canvas>
      <Leva hidden />
    </div>
  );
}

const Text = ({
  config,
  font = "/Inter_Medium_Regular.json",
  ...props
}: {
  config: {
    [key: string]: any;
  };
  font?: string;
  [key: string]: any;
}) => {
  const texture = useLoader(RGBELoader, hdrUrl);

  return (
    <group>
      <Center scale={[0.8, 1, 1]} front top {...props}>
        <Text3D
          castShadow
          bevelEnabled
          font={font}
          scale={5}
          letterSpacing={-0.03}
          height={0.25}
          bevelSize={0.01}
          bevelSegments={10}
          curveSegments={128}
          bevelThickness={0.01}
        >
          SKY
          <MeshTransmissionMaterial background={texture} {...config} />
        </Text3D>
      </Center>
    </group>
  );
};
