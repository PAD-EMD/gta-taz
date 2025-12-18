import fs from 'fs';
import path from 'path';
import { DIR } from './config.js';

export function cleanDirectory() {
	if (fs.existsSync(DIR)) {
		fs.rmSync(DIR, { recursive: true, force: true });
		console.log(`🧹 Dossier ${DIR} nettoyé`);
	}
	
	const imagesDir = path.join(DIR, 'images');
	fs.mkdirSync(imagesDir, { recursive: true });
}

export function loadTemplate(fileName) {
	const templatePath = path.join('content', fileName);
	if (!fs.existsSync(templatePath)) {
		throw new Error(`Template not found: ${templatePath}`);
	}
	return fs.readFileSync(templatePath, 'utf8');
}

export function loadSnippet(fileName) {
	const snippetPath = path.join('content', fileName);
	if (!fs.existsSync(snippetPath)) {
		console.warn(`⚠️  Snippet not found: ${snippetPath}`);
		return '';
	}
	return fs.readFileSync(snippetPath, 'utf8');
}

export function writeHtmlFile(fileName, content) {
	fs.mkdirSync(DIR, { recursive: true });
	fs.writeFileSync(path.join(DIR, fileName), content);
	console.log(`📄 Généré: ${fileName}`);
}
