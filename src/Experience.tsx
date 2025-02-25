import { Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Stars, Sky, Stage } from "@react-three/drei"

import { Bear } from "./Bear.tsx"

import { Landscape } from "./Landscape.tsx"

import Suzan from "./Suzan"
import { Grass } from "./Grass"
import { useControls } from "leva"
import PostProcessing from "./PostProcessing"

const defaultBladeOptions = {
	width: 0.01,
	height: 0.0025,
	joints: 3,
}

const Experience = () => {
	const modelOptions = {
		landscape: "landscape.glb",
		bear: "bear.glb",
		suzan: "suzan.glb",
	}

	const { selectedModel, width, height, joints } = useControls(
		"Model Options",
		{
			selectedModel: {
				value: "landscape.glb",
				options: modelOptions,
			},
			width: {
				value: defaultBladeOptions.width,
				min: 0.0025,
				max: 1,
				step: 0.0001,
			},
			height: {
				value: defaultBladeOptions.height,
				min: 0.025,
				max: 2,
				step: 0.00001,
			},
			joints: { value: defaultBladeOptions.joints, min: 1, max: 4, step: 1 },
		}
	)

	console.log("Blade Options:", { width, height, joints }) // Add this line

	return (
		<Canvas
			camera={{ position: [0, 0, 5] }}
			style={{ height: "100vh", width: "100vw" }}
		>
			<Suspense fallback={null}>
				<Sky sunPosition={[50, 50, 50]} />
				<Stage environment="city" intensity={0.5} />
				<ambientLight intensity={0.5} />
				<spotLight position={[10, 10, 10]} intensity={0.8} />
				<pointLight position={[-10, -10, -10]} intensity={0.5} />
				{selectedModel === "suzan.glb" && <Suzan />}
				{selectedModel === "bear.glb" && <Bear />}
				{selectedModel === "landscape.glb" && <Landscape />}
				<Grass
					bladeOptions={{ width, height, joints }}
					modelUrl={selectedModel}
				/>
				<OrbitControls /* autoRotate */ />
				<Stars
					radius={100}
					depth={50}
					count={5000}
					factor={4}
					saturation={0}
					fade
					speed={1}
				/>
				<PostProcessing />
			</Suspense>
		</Canvas>
	)
}

export default Experience
