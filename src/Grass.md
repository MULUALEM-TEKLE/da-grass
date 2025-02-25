# Grass Component Documentation

This document provides a detailed technical overview of the `Grass` component, which renders realistic grass based on a terrain mesh using React Three Fiber and Three.js.

## Overview

The `Grass` component leverages instanced rendering and custom shaders to efficiently render a large number of grass blades. It accepts a terrain mesh as input and distributes grass blades across its surface based on height and proximity to specified reduction points.

## Key Features

- **Instanced Rendering:** Efficiently renders thousands of grass blades with minimal performance impact.
- **Custom Shader:** Utilizes a vertex shader to animate grass blades and a fragment shader to control their appearance.
- **Height-Based Distribution:** Distributes grass blades more densely on lower terrain areas.
- **Reduction Points:** Allows specifying points where grass height should be reduced, creating natural variations.
- **Customization:** Offers options for controlling grass width, height, joints, and overall density.

## Implementation Details

### 1. Imports and Props

```typescript
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
```

The component imports necessary modules from React, Three.js, and React Three Fiber. It also defines `GrassProps` to accept customizable parameters.

### 2. Helper Functions

Several helper functions are used to calculate grass attributes and optimize performance:

- **`applyHeightReduction`**: Calculates a reduction factor for grass height based on proximity to reduction points. This creates variations in grass height near obstacles or specific areas.
- **`calculateHeightRange`**: Determines the minimum and maximum height of the terrain mesh. This is used for height-based grass distribution.
- **`grassProbability`**: Calculates the probability of placing a grass blade at a given vertex based on its height. Lower vertices have a higher probability.
- **`selectGrassVertices`**: Randomly selects vertices for grass placement based on the calculated probability.
- **`generateOrientationFromNormal`**: Generates a quaternion representing the orientation of a grass blade based on the terrain normal. This ensures that grass blades align with the terrain surface.
- **`generateRandomOrientation`**: Generates a random orientation for grass blades when terrain normals are not available.

### 3. `attributeData` Calculation

The `attributeData` function calculates the necessary attributes for each grass blade instance:

- **`offsets`**: The position of each grass blade.
- **`orientations`**: The rotation of each grass blade.
- **`stretches`**: The height scaling factor for each grass blade.
- **`halfRootAngleSin` and `halfRootAngleCos`**: Used for animating the grass blades in the shader.

These attributes are calculated based on the terrain geometry, height range, and reduction points.

### 4. Rendering

The component uses an `instancedBufferGeometry` and a `rawShaderMaterial` to render the grass blades. The `instancedBufferAttribute` is used to pass the calculated attributes to the shader. The shader then uses these attributes to position, rotate, and animate each grass blade instance.

## Usage

```typescript
// Example usage
<Grass
	bladeOptions={{ width: 0.2, height: 1, joints: 5 }}
	reductionPoints={[new THREE.Vector3(0, 0, 0)]}
	reductionRadius={2}
/>
```

You can customize the grass appearance and distribution by passing different values to the `bladeOptions`, `reductionPoints`, and `reductionRadius` props.

## Future Improvements

- Add support for different grass textures and colors.
- Implement wind animation.
- Optimize shader performance further.

## Shader Details

### Vertex Shader

The vertex shader is responsible for animating the grass blades. It uses a custom noise function to simulate wind and applies transformations based on the blade's orientation and stretch factor.

```glsl
const getVertexSource = (height: number): string => {
	console.log("Generating vertex shader with height:", height) // Add this line

	return (
		`

precision mediump float;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
in vec3 position;
in vec3 offset;
in vec2 uv;
in vec4 orientation;
in float halfRootAngleSin;
in float halfRootAngleCos;
in float stretch;
uniform float time;
out vec2 vUv;
out float frc;

//WEBGL-NOISE FROM https://github.com/stegu/webgl-noise

//Description : Array and textureless GLSL 2D simplex noise function. Author : Ian McEwan, Ashima Arts. Maintainer : stegu Lastmod : 20110822 (ijm) License : Copyright (C) 2011 Ashima Arts. All rights reserved. Distributed under the MIT License. See LICENSE file. https://github.com/ashima/webgl-noise https://github.com/stegu/webgl-noise

vec3 mod289(vec3 x) {return x - floor(x * (1.0 / 289.0)) * 289.0;} vec2 mod289(vec2 x) {return x - floor(x * (1.0 / 289.0)) * 289.0;} vec3 permute(vec3 x) {return mod289(((x*34.0)+1.0)*x);} float snoise(vec2 v){const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439); vec2 i  = floor(v + dot(v, C.yy) ); vec2 x0 = v -   i + dot(i, C.xx); vec2 i1; i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0); vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1; i = mod289(i); vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 )); vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0); m = m*m ; m = m*m ; vec3 x = 2.0 * fract(p * C.www) - 1.0; vec3 h = abs(x) - 0.5; vec3 ox = floor(x + 0.5); vec3 a0 = x - ox; m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h ); vec3 g; g.x  = a0.x  * x0.x  + h.x  * x0.y; g.yz = a0.yz * x12.xz + h.yz * x12.yw; return 130.0 * dot(m, g);}
//END NOISE

//https://www.geeks3d.com/20141201/how-to-rotate-a-vertex-by-a-quaternion-in-glsl/
vec3 rotateVectorByQuaternion( vec3 v, vec4 q){
  return 2.0 * cross(q.xyz, v * q.w + cross(q.xyz, v)) + v;
}

//https://en.wikipedia.org/wiki/Slerp
vec4 slerp(vec4 v0, vec4 v1, float t) {
  // Only unit quaternions are valid rotations.
  // Normalize to avoid undefined behavior.
  normalize(v0);
  normalize(v1);

  // Compute the cosine of the angle between the two vectors.
  float dot_ = dot(v0, v1);

  // If the dot product is negative, slerp won't take
  // the shorter path. Note that v1 and -v1 are equivalent when
  // the negation is applied to all four components. Fix by
  // reversing one quaternion.
  if (dot_ < 0.0) {
    v1 = -v1;
    dot_ = -dot_;
  }

  const float DOT_THRESHOLD = 0.9995;
  if (dot_ > DOT_THRESHOLD) {
    // If the inputs are too close for comfort, linearly interpolate
    // and normalize the result.

    vec4 result = t*(v1 - v0) + v0;
    normalize(result);
    return result;
  }

  // Since dot is in range [0, DOT_THRESHOLD], acos is safe
  float theta_0 = acos(dot_);       // theta_0 = angle between input vectors
  float theta = theta_0*t;          // theta = angle between v0 and result
  float sin_theta = sin(theta);     // compute this value only once
  float sin_theta_0 = sin(theta_0); // compute this value only once

  float s0 = cos(theta) - dot_ * sin_theta / sin_theta_0;  // == sin(theta_0 - theta) / sin(theta_0)
  float s1 = sin_theta / sin_theta_0;

  return (s0 * v0) + (s1 * v1);
}

void main() {

  //Relative position of vertex along the mesh Y direction
  frc = position.y/float(` +
		height +
		`);

  //Get wind data from simplex noise
  float noise = 1.0-(snoise(vec2((time-offset.x/50.0), (time-offset.z/50.0))));

  //Define the direction of an unbent blade of grass rotated around the Y axis
  vec4 direction = vec4(0.0, halfRootAngleSin, 0.0, halfRootAngleCos);

  //Interpolate between the unbent direction and the direction of growth calculated on the CPU.
  //Using the relative location of the vertex along the Y axis as the weight, we get a smooth bend
  direction = slerp(direction, orientation, frc);
  vec3 vPosition = vec3(position.x, position.y + position.y * stretch, position.z);
  vPosition = rotateVectorByQuaternion(vPosition, direction);

 //Apply wind
 float halfAngle = noise * 0.15;
  vPosition = rotateVectorByQuaternion(vPosition, normalize(vec4(sin(halfAngle), 0.0, -sin(halfAngle), cos(halfAngle))));

  //UV for texture
  vUv = uv;

  //Calculate final position of the vertex from the world offset and the above shenanigans
  gl_Position = projectionMatrix * modelViewMatrix * vec4(offset + vPosition, 1.0 );
}`
	)
}
```

### Fragment Shader

The fragment shader controls the appearance of the grass blades, including transparency and color blending.

```glsl
const fragmentSource: string = `

precision mediump float;
uniform sampler2D map;
uniform sampler2D alphaMap;
in vec2 vUv;
in float frc;
out vec4 fragColor;

void main() {
  //Get transparency information from alpha map
  float alpha = texture(alphaMap, vUv).r;
  //If transparent, don't draw
  if(alpha < 0.15){
    discard;
  }
  //Get colour data from texture
  vec4 col = vec4(texture(map, vUv));
  //Add more green towards root
  col = mix(vec4(.0, 0.6, 0.0, 1.0), col, frc);
  //Add a shadow towards root
  col = mix(vec4(.0, 0.1, 0.0, 1.0), col, frc);
  fragColor = col;
}`
```

## Conclusion

The `Grass` component provides a robust and efficient way to render realistic grass in a 3D scene using React Three Fiber and Three.js. The custom shader and instanced rendering techniques ensure that the component can handle a large number of grass blades with minimal performance impact.
