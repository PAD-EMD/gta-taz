import { defineConfig } from "vite";
import { resolve } from "path";
import glob from "fast-glob";

export default defineConfig(({ command }) => {
    const inputs = {};
    
    if (command === 'build') {
        const htmlFiles = glob.sync("book/*.html");
        console.log("Fichiers HTML trouvés:", htmlFiles);

        htmlFiles.forEach((file) => {
            const name = file.replace("book/", "").replace(".html", "");
            inputs[name] = resolve(__dirname, file);
        });

        if (Object.keys(inputs).length === 0) {
            console.warn("Aucun fichier HTML trouvé dans book/, utilisation d'index par défaut");
            inputs.index = resolve(__dirname, "book/index.html");
        }

        console.log("Inputs générés:", inputs);
    } else {
        inputs.index = resolve(__dirname, "book/index.html");
        console.log("Mode dev: utilisation d'index.html uniquement");
    }

    return {
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
    };
});
