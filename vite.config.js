import { defineConfig } from "vite";
import { resolve } from "path";
import glob from "fast-glob";

// Créer les inputs pour les fichiers HTML
const inputs = {};
const htmlFiles = glob.sync("book/*.html");

console.log("Fichiers HTML trouvés:", htmlFiles);

htmlFiles.forEach((file) => {
    // Extraire le nom du fichier sans l'extension
    const name = file.replace("book/", "").replace(".html", "");
    inputs[name] = resolve(__dirname, file);
});

// Ajouter un point d'entrée par défaut si aucun fichier HTML n'est trouvé
if (Object.keys(inputs).length === 0) {
    console.warn("Aucun fichier HTML trouvé dans book/, utilisation d'index par défaut");
    inputs.index = resolve(__dirname, "book/index.html");
}

console.log("Inputs générés:", inputs);

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
    base: "./",
});
