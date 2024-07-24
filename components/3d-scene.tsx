"use client";

import { Canvas } from "@react-three/fiber";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Points } from "three";

export default function Scene3D() {
  return (
    <div className="absolute top-0 -z-10 w-full h-screen">
      <Canvas>
        <ParticlesCircle />
      </Canvas>
    </div>
  );
}

function ParticlesCircle() {
  const myMesh = useRef<Points>(null!);

  useFrame((_, delta) => {
    myMesh.current.rotation.x += delta * 0.1;
    myMesh.current.rotation.z += delta * 0.1;
  });

  return (
    <points ref={myMesh} rotation={[1, 5, 0]} scale={3}>
      <sphereGeometry args={[1, 64, 64]} />
      <pointsMaterial
        color="black"
        size={0.008}
        sizeAttenuation={true}
        opacity={0.1}
      />
    </points>
  );
}
