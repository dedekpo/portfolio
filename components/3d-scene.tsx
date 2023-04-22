"use client";

import { Canvas } from "@react-three/fiber";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
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

	const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

	useEffect(() => {
		const handleMouseMove = (event: any) => {
			setMousePos({ x: event.clientX, y: event.clientY });
		};

		window.addEventListener("mousemove", handleMouseMove);

		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
		};
	}, []);

	useFrame(({ camera }, delta) => {
		myMesh.current.rotation.x += delta * 0.1;
		myMesh.current.rotation.z += delta * 0.1;

		const parallaxX = mousePos.x / window.innerWidth;
		const parallaxY = -mousePos.y / window.innerHeight;
		camera.position.x += (parallaxX - camera.position.x) * 0.1;
		camera.position.y += (parallaxY - camera.position.y) * 0.1;
	});

	return (
		<points ref={myMesh} rotation={[1, 5, 0]} scale={3}>
			<sphereGeometry args={[1, 64, 64]} />
			<pointsMaterial
				color="black"
				size={0.01}
				sizeAttenuation={false}
				opacity={0.4}
			/>
		</points>
	);
}
