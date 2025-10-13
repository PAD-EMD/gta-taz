import { defineConfig } from "vite";
import { resolve } from "path";
import glob from "fast-glob";

const inputs = {};
const htmlFiles = glob.sync("book/*.html");

htmlFiles.forEach((file) => {
	const name = file.replace(/^book|html$/g, "");
	inputs[name] = resolve(__dirname, file);
});

export default defineConfig({
	root: "book",
	resolve: {
		alias: {
			"@": resolve(__dirname, "src"),
		},
	},
	build: {
		outDir: "../dist",
		emptyOutDir: true,
		rollupOptions: {
			input: inputs,
		},
	},
	publicDir: "../public",
	base: "./", // relatif pour éviter les chemins cassés dans le build
});
