import { fetchBook } from './api.js';
import { cleanDirectory, loadTemplate } from './fileUtils.js';
import { generateIndexPage, generateArticlesPageAndWrite, generatePageHtml, generateTutorielsPageAndWrite, generateGlossairePageAndWrite } from './pageGenerators.js';

async function pullBook() {

	cleanDirectory();

	const template = loadTemplate('gabarit-tuto.html');

	const book = await fetchBook(1);
	const pages = book.contents;

	await generatePageHtml(7, "glossaire", template);
	const glossaireTemplate = loadTemplate('glossaire.html');
	generateGlossairePageAndWrite(glossaireTemplate);

	for (const page of pages) {
		if(page.pages && page.pages.length){
			for (const subPage of page.pages) {
				await generatePageHtml(subPage.id, subPage.slug, template, page.name);
			}
		}
		// else{
			// if(page.id === 7) continue; // Glossaire déjà généré
			// await generatePageHtml(page.id, page.slug, template);
		// }
	}

	const indexTemplate = loadTemplate('index.html');
	generateIndexPage(indexTemplate);

	const articlesTemplate = loadTemplate('articles.html');
	generateArticlesPageAndWrite(articlesTemplate);
	
	generateTutorielsPageAndWrite(articlesTemplate);

	console.log('✅ Documentation exportée');
}

pullBook();