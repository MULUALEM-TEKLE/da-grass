import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import Experience from "./Experience"
import { Loader } from "@react-three/drei"

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<Experience />
		<Loader />
	</StrictMode>
)
