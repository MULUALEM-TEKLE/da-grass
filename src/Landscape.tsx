import { useGLTF } from "@react-three/drei"

export function Landscape(props: any) {
	const { nodes } = useGLTF("/landscape.glb") as any
	return (
		<group {...props} dispose={null}>
			<mesh
				geometry={nodes.Landscape.geometry}
				material={nodes.Landscape.material}
				position={[-0.053, -0.079, 0.037]}
			/>
		</group>
	)
}

useGLTF.preload("/landscape.glb")
