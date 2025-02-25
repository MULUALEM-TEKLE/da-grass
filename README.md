# da grass by xar `=)`

This repository contains a project that leverages React, TypeScript, and Vite to create a 3D scene with realistic grass rendering using React Three Fiber and Three.js. The project includes custom shaders and instanced rendering to efficiently handle a large number of grass blades.

## Reminder

If you find this project useful, consider supporting me by buying me a coffee at [Ko-fi](https://ko-fi.com/X7X616PGB7).

## Key Features

- **Realistic Grass Rendering:** Utilizes custom shaders and instanced rendering to efficiently render thousands of grass blades.
- **Height-Based Distribution:** Distributes grass blades more densely on lower terrain areas.
- **Reduction Points:** Allows specifying points where grass height should be reduced, creating natural variations.
- **Customization:** Offers options for controlling grass width, height, joints, and overall density.
- **Interactive 3D Scene:** Built with React Three Fiber and Three.js, providing an interactive 3D experience.

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- pnpm (package manager)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/MULUALEM-TEKLE/da-grass.git
   cd da-grass
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Start the development server:
   ```bash
   pnpm run dev
   ```

## Project Structure

- **src/:** Contains the source code for the project.

  - **Grass.tsx:** The main component for rendering grass.
  - **GrassHelper.ts:** Helper functions for grass rendering.
  - **shader.ts:** Custom shaders for grass animation and appearance.
  - **Experience.tsx:** The main experience component.
  - **Landscape.tsx:** Component for rendering the landscape.
  - **Bear.tsx:** Component for rendering a bear model.
  - **Suzan.tsx:** Component for rendering a Suzan model.
  - **PostProcessing.tsx:** Post-processing effects.

- **public/:** Contains static assets like textures and models.

  - **blade_diffuse.jpg:** Texture for grass blades.
  - **blade_alpha.jpg:** Alpha map for grass blades.
  - **bear.glb:** Bear model.
  - **suzan.glb:** Suzan model.
  - **landscape.glb:** Landscape model.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
	languageOptions: {
		// other options...
		parserOptions: {
			project: ["./tsconfig.node.json", "./tsconfig.app.json"],
			tsconfigRootDir: import.meta.dirname,
		},
	},
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from "eslint-plugin-react"

export default tseslint.config({
	// Set the react version
	settings: { react: { version: "18.3" } },
	plugins: {
		// Add the react plugin
		react,
	},
	rules: {
		// other rules...
		// Enable its recommended rules
		...react.configs.recommended.rules,
		...react.configs["jsx-runtime"].rules,
	},
})
```
