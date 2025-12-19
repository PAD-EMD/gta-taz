import { fetchBook } from './api.js';
import { cleanDirectory, loadTemplate } from './fileUtils.js';
import { generateIndexPage, generateArticlesPage, generatePageHtml, generateTutorielsPageAndWrite, generateGlossairePageAndWrite } from './pageGenerators.js';

async function pullBook() {

	cleanDirectory();

	const template = loadTemplate('gabarit-tuto.html');

	const book = await fetchBook(1);
	const pages = book.contents;

	await generatePageHtml(7, "glossaire", template);

	// for (const page of pages) {
	// 	await generatePageHtml(page.id, page.slug, template);
	// 	console.log('page.id =', page.id)
	// 	console.log('page.slug =', page.slug)
	// 	if(page.pages && page.pages.length){
	// 		for (const subPage of page.pages) {
	// 			await generatePageHtml(subPage.id, subPage.slug, template, page.name);
	// 		}
	// 	}
	// }

	// const indexTemplate = loadTemplate('index.html');
	// generateIndexPage(indexTemplate);

	// const articlesTemplate = loadTemplate('articles.html');
	// // generateArticlesPage(articlesTemplate);
	// generateTutorielsPageAndWrite(articlesTemplate);

	const glossaireTemplate = loadTemplate('glossaire.html');
	generateGlossairePageAndWrite(glossaireTemplate);

	console.log('✅ Documentation exportée');
}

pullBook();