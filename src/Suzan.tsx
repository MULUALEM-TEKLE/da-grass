/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.5.3 suzan.glb
*/

import { useGLTF } from "@react-three/drei"

export default function Model(props: any) {
	const { nodes } = useGLTF("/suzan.glb") as any
	return (
		<group {...props} dispose={null}>
			<mesh
				geometry={nodes.Suzanne.geometry}
				material={nodes.Suzanne.material}
				position={[-0.053, -0.079, 0.037]}
			/>
		</group>
	)
}

useGLTF.preload("/suzan.glb")
