// scripts/pullBook.js
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
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
	let html = template;
	
	// Replace title in head and h1
	html = html.replace(/<title>.*?<\/title>/, `<title>${pageData.name}</title>`);
	html = html.replace(/<h1>.*?<\/h1>/, `<h1>${pageData.name}</h1>`);
	
	// Replace main content in colt4 div
	const contentRegex = /(<div class="colt4">)(.*?)(<div class="colt5">)/s;
	
	const newContent = `$1
		<p>${pageData.description || ''}</p>
		${pageData.html}
	$3`;

	html = html.replace(contentRegex, newContent);
	
	// Update meta description
	if (pageData.description) {
		html = html.replace(
			/<meta name="viewport"[^>]*>/,
			`$&\n        <meta name="description" content="${pageData.description}">`
		);
	}
	
	return html;
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