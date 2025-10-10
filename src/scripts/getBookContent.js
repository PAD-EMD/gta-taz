// scripts/pullBook.js
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';

import { JSDOM } from 'jsdom';
dotenv.config();

const streamPipeline = promisify(pipeline);

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
	
	// Créer le dossier images local
	const imagesDir = path.join(dir, 'images');
	fs.mkdirSync(imagesDir, { recursive: true });
}

async function downloadImage(imageUrl, filename) {
	try {
		// Construire l'URL complète si nécessaire
		const fullUrl = imageUrl.startsWith('http') ? imageUrl : `${BOOKSTACK_API_URL.replace('/api', '')}${imageUrl}`;
		
		const response = await api.get(fullUrl, {
			responseType: 'stream',
			headers: { Authorization: `Token ${BOOKSTACK_TOKEN}` }
		});
		
		const imagePath = path.join(dir, 'images', filename);
		await streamPipeline(response.data, createWriteStream(imagePath));
		
		console.log(`📸 Image téléchargée: ${filename}`);
		return `/book/images/${filename}`;
	} catch (error) {
		console.warn(`❌ Erreur téléchargement image: ${imageUrl}`, error.message);
		return imageUrl; // Retourner l'URL originale en cas d'erreur
	}
}

function loadTemplate() {
	const templatePath = path.join('content', 'gabarit-tuto.html');
	if (!fs.existsSync(templatePath)) {
		throw new Error(`Template not found: ${templatePath}`);
	}
	return fs.readFileSync(templatePath, 'utf8');
}

async function generateFullHtmlPage(pageData, template) {
	// Créer le DOM directement avec le template
	const dom = new JSDOM(template);
	const doc = dom.window.document;

	const tempDom = new JSDOM(pageData.html);
	const tempDoc = tempDom.window.document;
	
	const authorsElement = tempDoc.querySelector('.authors');
	const dateElement = tempDoc.querySelector('.date');

	let imageContainer = doc.querySelector('.rigth-article-content')
	imageContainer.innerHTML = '';
	
	// Remplacer le title
	const titleElement = doc.querySelector('title');
	if (titleElement) titleElement.textContent = pageData.name;
	
	// Remplacer le h1
	const h1Element = doc.querySelector('h1');
	if (h1Element) h1Element.textContent = pageData.name;
	
	const cleanContent = pageData.html.replace(/ id="[^"]*"/g, '');

	doc.querySelector('main').innerHTML = cleanContent;

	let images = doc.querySelectorAll('img')
	
	for (let i = 0; i < images.length; i++) {
		const image = images[i];
		const originalSrc = image.getAttribute("src");
		
		// Générer un nom de fichier unique
		const filename = `image-${pageData.id}-${i}-${path.basename(originalSrc) || 'image.jpg'}`;
		
		// Télécharger l'image en local
		const localImagePath = await downloadImage(originalSrc, filename);
		
		// Créer le nouvel élément avec le chemin local
		let newImage = generateNewImage(localImagePath, i + 1, doc);
		image.remove();
		imageContainer.appendChild(newImage);
	}


	if(dateElement && dateElement.innerHTML){
		let dateContainer = doc.querySelector(".title-container .details .date");
		dateContainer.innerHTML = dateElement.innerHTML;
	}

	if(dateElement && dateElement.innerHTML){
		let authorsContainer = doc.querySelector(".title-container .details .authors");
		authorsContainer.innerHTML = '';
		let authorsArray = authorsElement.innerHTML.split(",");

		for (let i = 0; i < authorsArray.length; i++) {
			const author = authorsArray[i];
			authorsContainer.innerHTML += "<li>" + author + "</li>";
		}
	}

	if(doc.querySelector('main .date')) doc.querySelector('main .date').remove();
	if(doc.querySelector('main .authors')) doc.querySelector('main .authors').remove();


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
	const fullHtml = await generateFullHtmlPage(pageDetail, template);
	
	fs.mkdirSync(dir, { recursive: true });
	fs.writeFileSync(path.join(dir, `${pageSlug}.html`), fullHtml);
	
	console.log(`📄 Généré: ${pageSlug}.html`);
}

pullBook();// scripts/pullBook.js


function generateNewImage(imageSrc, imageId, doc){
	// Créer le lien <a>
	const linkElement = doc.createElement('a');
	linkElement.setAttribute('data-fslightbox', 'gallery');
	linkElement.setAttribute('href', imageSrc);
	linkElement.setAttribute('class', 'image');
	linkElement.setAttribute('id', "image-" + imageId);

	const imgElementId = doc.createElement('div');
	imgElementId.setAttribute('class', 'id');
	imgElementId.innerHTML = imageId;
	
	// Créer l'image <img>
	const imgElement = doc.createElement('img');
	imgElement.setAttribute('src', imageSrc);
	
	// Ajouter l'image dans le lien
	linkElement.appendChild(imgElement);
	linkElement.appendChild(imgElementId);
	
	return linkElement;
}