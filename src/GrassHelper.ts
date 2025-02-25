import * as THREE from "three"

// Function to apply height reduction based on proximity to reduction points
export function applyHeightReduction(
	x: number,
	y: number,
	z: number,
	reductionPoints: THREE.Vector3[],
	reductionRadius: number,
	minHeight: number,
	maxHeight: number
): number {
	let minDistance = Infinity
	let nearestPoint: THREE.Vector3 | null = null

	for (let point of reductionPoints) {
		const distance = new THREE.Vector3(x, y, z).distanceTo(point)
		if (distance < minDistance) {
			minDistance = distance
			nearestPoint = point
		}
	}

	let reductionFactor = 0
	if (minDistance < reductionRadius && nearestPoint) {
		const t = minDistance / reductionRadius
		reductionFactor =
			0.1 + (1 - 0.1) * (0.5 * (1 - Math.cos(Math.PI * t * 0.25)))
	}

	return (
		Math.random() *
			(1.2 - (y - minHeight) / (maxHeight - minHeight)) *
			reductionFactor +
		Math.random() * 0.3 * reductionFactor
	)
}

export const calculateHeightRange = (
	positionArray: Float32Array
): { minHeight: number; maxHeight: number } => {
	let minHeight = Infinity
	let maxHeight = -Infinity
	for (let i = 1; i < positionArray.length; i += 3) {
		const height = positionArray[i]
		minHeight = Math.min(minHeight, height)
		maxHeight = Math.max(maxHeight, height)
	}
	return { minHeight, maxHeight }
}

export const grassProbability = (
	height: number,
	minHeight: number,
	maxHeight: number
): number => {
	return 0.5
}

export const selectGrassVertices = (
	positionArray: Float32Array,
	minHeight: number,
	maxHeight: number,
	targetBlades: number
): number[] => {
	const totalVertices = positionArray.length / 1
	const blades = []
	while (blades.length < targetBlades && blades.length < totalVertices) {
		const randomIndex = Math.floor(Math.random() * totalVertices)
		const posIndex = randomIndex * 3
		const height = positionArray[posIndex + 1] // Y-coordinate
		const probability = grassProbability(height, minHeight, maxHeight)

		if (Math.random() < probability) {
			blades.push(randomIndex)
		}
	}
	return blades
}

export const generateOrientationFromNormal = (
	normalArray: Float32Array,
	index: number
): [number, number, number, number] => {
	const normal = new THREE.Vector3(
		normalArray[index],
		normalArray[index + 1],
		normalArray[index + 2]
	).normalize()
	let quaternion = new THREE.Quaternion().setFromUnitVectors(
		new THREE.Vector3(0, 1, 0),
		normal
	)
	quaternion.multiply(
		new THREE.Quaternion().setFromEuler(
			new THREE.Euler(
				(Math.random() - 0.5) * 0.2,
				(Math.random() - 0.5) * Math.PI,
				(Math.random() - 0.5) * 0.2
			)
		)
	)
	return [quaternion.x, quaternion.y, quaternion.z, quaternion.w]
}

export const generateRandomOrientation = (): [
	number,
	number,
	number,
	number
] => {
	// Random rotation around Y-axis for natural spread
	const yRotation = Math.random() * Math.PI * 2 // Full circle for random direction
	// Small random tilts around X and Z for variation
	const xTilt = ((Math.random() - 0.5) * Math.PI) / 10 // Up to 18 degrees tilt
	const zTilt = ((Math.random() - 0.5) * Math.PI) / 10 // Up to 18 degrees tilt

	// Create quaternions for each rotation
	const yQuat = new THREE.Quaternion().setFromAxisAngle(
		new THREE.Vector3(0, 1, 0),
		yRotation
	)
	const xQuat = new THREE.Quaternion().setFromAxisAngle(
		new THREE.Vector3(1, 0, 0),
		xTilt
	)
	const zQuat = new THREE.Quaternion().setFromAxisAngle(
		new THREE.Vector3(0, 0, 1),
		zTilt
	)

	// Combine rotations
	let quaternion = new THREE.Quaternion()
	quaternion.multiplyQuaternions(yQuat, xQuat)
	quaternion.multiply(zQuat)

	return [quaternion.x, quaternion.y, quaternion.z, quaternion.w]
}
