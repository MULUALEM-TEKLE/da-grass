import {
	EffectComposer,
	Bloom,
	DepthOfField,
	ChromaticAberration,
} from "@react-three/postprocessing"
import { Vector2 } from "three"
import { useControls } from "leva"

const PostProcessing = () => {
	const controls = useControls(
		"PostProcessing",
		{
			bloomThreshold: { value: 0.7, min: 0, max: 1 },
			bloomSmoothing: { value: 0.95, min: 0, max: 1 },
			bloomHeight: { value: 200, min: 100, max: 500 },
			focalLength: { value: 0.02, min: 0.01, max: 0.1 },
			bokehScale: { value: 2, min: 1, max: 5 },
			offset: { value: 0.001, min: 0, max: 0.01 },
			strength: { value: 0.2, min: 0, max: 1 },
			bloomEnabled: { value: false },
			depthOfFieldEnabled: { value: false },
			chromaticAberrationEnabled: { value: false },
		},
		{ collapsed: true }
	)

	return (
		<EffectComposer>
			{controls.bloomEnabled ? (
				<Bloom
					luminanceThreshold={controls.bloomThreshold}
					luminanceSmoothing={controls.bloomSmoothing}
					height={controls.bloomHeight}
				/>
			) : (
				<></>
			)}
			{controls.depthOfFieldEnabled ? (
				<DepthOfField
					focalLength={controls.focalLength}
					bokehScale={controls.bokehScale}
				/>
			) : (
				<></>
			)}
			{controls.chromaticAberrationEnabled ? (
				<ChromaticAberration
					offset={new Vector2(controls.offset, controls.offset)}
					// @ts-ignore
					strength={controls.strength}
				/>
			) : (
				<></>
			)}
		</EffectComposer>
	)
}

export default PostProcessing
