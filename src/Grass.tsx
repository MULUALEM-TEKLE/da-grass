// Based on https://codepen.io/al-ro/pen/jJJygQ by al-ro, but rewritten in react-three-fiber
import { useRef, useMemo } from "react"
import * as THREE from "three"
import bladeDiffuse from "/blade_diffuse.jpg"
import bladeAlpha from "/blade_alpha.jpg"
import { useFrame, useLoader } from "@react-three/fiber"
import { fragmentSource, getVertexSource } from "./shader"
import { useGLTF } from "@react-three/drei"
import { useControls } from "leva"
import {
	applyHeightReduction,
	calculateHeightRange,
	selectGrassVertices,
	generateOrientationFromNormal,
	generateRandomOrientation,
} from "./GrassHelper"

type GrassProps = {
	bladeOptions?: {
		width: number
		height: number
		joints: number
	}
	reductionPoints?: THREE.Vector3[]
	reductionRadius?: number // Optional: define the radius around each point where grass height should be reduced
	modelUrl?: string
}

export const Grass = ({
	bladeOptions,
	reductionPoints = [],
	reductionRadius = 0,
	modelUrl = "/suzan.glb",
}: GrassProps): JSX.Element => {
	const materialRef = useRef<any>(null)

	const [texture, alphaMap] = useLoader(THREE.TextureLoader, [
		bladeDiffuse,
		bladeAlpha,
	])

	const { randomOffset, targetBlades } = useControls("Grass Options", {
		randomOffset: {
			value: -0.02,
			min: -0.5,
			max: 0.5,
			step: 0.01,
		},
		targetBlades: {
			value: 25000,
			min: 25000,
			max: 1500000,
			step: 1000,
		},
	})

	const baseGeometry = useMemo(() => {
		console.log("Recalculating baseGeometry with:", bladeOptions) // Add this line
		if (!bladeOptions) return
		const geo = new THREE.PlaneGeometry(
			bladeOptions?.width,
			bladeOptions?.height,
			1,
			bladeOptions?.joints
		)
		geo.translate(0, bladeOptions?.height / 2, 0)

		return geo
	}, [bladeOptions])

	const { nodes } = useGLTF(modelUrl) as any
	console.log(nodes)

	const surface = useMemo(() => {
		// Ensure the landscape node exists
		if (!nodes) {
			console.warn("Landscape node not found in GLTF model")
			return new THREE.BufferGeometry()
		}

		return nodes.Scene.children[0].geometry as any
	}, [nodes]) as any

	const attributeData = useMemo(() => {
		if (!surface || !surface.attributes.position) {
			console.warn("Geometry or position attribute not found")
			return {
				offsets: [],
				orientations: [],
				stretches: [],
				halfRootAngleSin: [],
				halfRootAngleCos: [],
			}
		}

		const positionArray = surface!.attributes.position.array as Float32Array
		const normalArray = surface!.attributes.normal
			? (surface!.attributes.normal.array as Float32Array)
			: null

		const { minHeight, maxHeight } = calculateHeightRange(positionArray)
		const blades = selectGrassVertices(
			positionArray,
			minHeight,
			maxHeight,
			targetBlades
		)

		const offsets = []
		const orientations = []
		const stretches = []
		const halfRootAngleSin = []
		const halfRootAngleCos = []

		for (let index of blades) {
			const baseIndex = index * 3
			const x = positionArray[baseIndex]
			const y = positionArray[baseIndex + 1]
			const z = positionArray[baseIndex + 2]

			// Add small random offset for less uniform look

			offsets.push(
				x - 0.05 + (Math.random() - 0.5) * randomOffset,
				y,
				z + (Math.random() - 0.5) * randomOffset
			)

			// Orientation based on normal if available, otherwise random
			if (normalArray) {
				const orientation = generateOrientationFromNormal(
					normalArray,
					baseIndex
				)
				orientations.push(...orientation)

				const angle = Math.acos(normalArray[baseIndex + 1]) // y component of normal
				halfRootAngleSin.push(Math.sin(0.5 * angle))
				halfRootAngleCos.push(Math.cos(0.5 * angle))
			} else {
				orientations.push(...generateRandomOrientation())
				let angle = Math.PI - Math.random() * (2 * Math.PI)
				halfRootAngleSin.push(Math.sin(0.5 * angle))
				halfRootAngleCos.push(Math.cos(0.5 * angle))
			}

			stretches.push(
				applyHeightReduction(
					x,
					y,
					z,
					reductionPoints,
					reductionRadius,
					minHeight,
					maxHeight
				)
			)
		}

		return {
			offsets,
			orientations,
			stretches,
			halfRootAngleSin,
			halfRootAngleCos,
		}
	}, [
		surface,
		calculateHeightRange,
		selectGrassVertices,
		generateOrientationFromNormal,
		generateRandomOrientation,
		applyHeightReduction,
		randomOffset,
		targetBlades,
	])

	useFrame((state) => {
		if (materialRef.current) {
			materialRef.current.uniforms.time.value = state.clock.elapsedTime / 10
		}
	})

	return (
		<>
			<group
				key={`grass-${bladeOptions?.width}-${bladeOptions?.height}-${targetBlades}`}
			>
				<mesh position={[0, -0.05, 0]} frustumCulled={false}>
					{/*// @ts-ignore */}
					<instancedBufferGeometry
						attach="geometry"
						index={baseGeometry?.index as any}
						attributes-position={baseGeometry?.attributes.position}
						attributes-uv={baseGeometry?.attributes.uv}
					>
						{
							<bufferGeometry
								index={baseGeometry?.index as any}
								attributes-position={baseGeometry?.attributes.position}
								attributes-uv={baseGeometry?.attributes.uv}
							/>
						}
						<instancedBufferAttribute
							attach="attributes-offset"
							args={[new Float32Array(attributeData.offsets), 3]}
						/>
						<instancedBufferAttribute
							attach="attributes-orientation"
							args={[new Float32Array(attributeData.orientations), 4]}
						/>
						<instancedBufferAttribute
							attach="attributes-stretch"
							args={[new Float32Array(attributeData.stretches), 1]}
						/>
						<instancedBufferAttribute
							attach="attributes-halfRootAngleSin"
							args={[new Float32Array(attributeData.halfRootAngleSin), 1]}
						/>
						<instancedBufferAttribute
							attach="attributes-halfRootAngleCos"
							args={[new Float32Array(attributeData.halfRootAngleCos), 1]}
						/>
					</instancedBufferGeometry>

					<rawShaderMaterial
						attach="material"
						ref={materialRef}
						{...{
							uniforms: {
								map: { value: texture },
								alphaMap: { value: alphaMap },
								time: { value: 0 }, // Type is inferred, no need for explicit type
							},
							// @ts-ignore
							vertexShader: getVertexSource(bladeOptions?.height),
							fragmentShader: fragmentSource,
							side: THREE.DoubleSide,
							glslVersion: THREE.GLSL3, // Recommended for modern WebGL support
						}}
					/>
				</mesh>
			</group>
		</>
	)
}

export default Grass
