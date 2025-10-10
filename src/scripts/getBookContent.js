// scripts/pullBook.js
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

import { JSDOM } from 'jsdom';
dotenv.config();

var dir = 'book';

const BOOKSTACK_API_URL = 'https://emd.dad.ynh.fr/api';
const BOOKSTACK_TOKEN = process.env.BOOKSTACK_ID + ':' + process.env.BOOKSTACK_TOKEN;

const api = axios.create({
	baseURL: BOOKSTACK_API_URL,
	headers: { Authorization: `Token ${BOOKSTACK_TOKEN}` }
});

function cleanDirectory() {
	if (fs.existsSync(dir)) {
		fs.rmSync(dir, { recursive: true, force: true });
		console.log(`🧹 Dossier ${dir} nettoyé`);
	}
}

function loadTemplate() {
	const templatePath = path.join('content', 'gabarit-tuto.html');
	if (!fs.existsSync(templatePath)) {
		throw new Error(`Template not found: ${templatePath}`);
	}
	return fs.readFileSync(templatePath, 'utf8');
}

function generateFullHtmlPage(pageData, template) {
	// Créer le DOM directement avec le template
	const dom = new JSDOM(template);
	const doc = dom.window.document;
	
	// Remplacer le title
	const titleElement = doc.querySelector('title');
	if (titleElement) titleElement.textContent = pageData.name;
	
	// Remplacer le h1
	const h1Element = doc.querySelector('h1');
	if (h1Element) h1Element.textContent = pageData.name;

	// génère les tags
	const tagsContainer = doc.querySelector('.tags');
	
	const tagTemplate = doc.querySelector('.tags .flex-items');
	tagsContainer.innerHTML = ""; // Vider le conteneur

	if (tagsContainer && pageData.tags && pageData.tags.length > 0) {
		pageData.tags.forEach(tag => {
			// Cloner le template pour chaque tag
			const tagElement = tagTemplate.cloneNode(true);
			tagElement.querySelector("p").textContent = tag.name;
			tagsContainer.appendChild(tagElement);
		});
	}
	console.log("pageData.tags.length", pageData.tags.length)

	if(pageData.tags.length == 0) tagsContainer.parentNode.remove();

	
	// Remplacer le contenu dans colt4
	const colt4Element = doc.querySelector('.colt4');
	if (colt4Element) {
		// Nettoyer le contenu de BookStack des IDs
		const cleanContent = pageData.html.replace(/ id="[^"]*"/g, '');
		
		colt4Element.innerHTML = `
			<p>${pageData.description || ''}</p>
			${cleanContent}
		`;
	}
	
	// Ajouter meta description si nécessaire
	if (pageData.description) {
		const head = doc.querySelector('head');
		const metaDesc = doc.createElement('meta');
		metaDesc.setAttribute('name', 'description');
		metaDesc.setAttribute('content', pageData.description);
		head.appendChild(metaDesc);
	}
	
	// Supprimer tous les IDs contenant "bkmrk"
	const elems = doc.querySelectorAll('[id*="bkmrk"]');
	elems.forEach(element => element.removeAttribute("id"));
	
	return dom.serialize();
}

async function pullBook() {
	cleanDirectory();
	const template = loadTemplate();
	const book = (await api.get(`/books/1`)).data;
	const pages = book.contents;

	for (const page of pages) {
		await generatePageHtml(page.id, page.slug, template);

		if(page.pages && page.pages.length){
			for (const subPage of page.pages) {
				await generatePageHtml(subPage.id, subPage.slug, template);
			}
		}
	}

  console.log('✅ Documentation exportée');
}

async function generatePageHtml(pageId, pageSlug, template){
	const pageDetail = (await api.get(`/pages/${pageId}?html=true`)).data;
	// Generate full HTML page using template
	const fullHtml = generateFullHtmlPage(pageDetail, template);
	
	fs.mkdirSync(dir, { recursive: true });
	fs.writeFileSync(path.join(dir, `${pageSlug}.html`), fullHtml);
	
	console.log(`📄 Généré: ${pageSlug}.html`);
}

pullBook();// scripts/pullBook.js