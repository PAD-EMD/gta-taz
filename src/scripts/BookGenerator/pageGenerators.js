import { fetchPage } from './api.js';
import { writeHtmlFile } from './fileUtils.js';
import { generateIndexHtmlPage, generateFullArticleHtmlPage, generateTutorielsPage, generateGlossairePage, generateArticlesPage } from './htmlGenerators.js';

export async function generateIndexPage(template) {
	const fullHtml = await generateIndexHtmlPage(template);
	writeHtmlFile('index.html', fullHtml);
}

export async function generateArticlesPageAndWrite(template) {
	const fullHtml = await generateArticlesPage(template);
	writeHtmlFile('articles.html', fullHtml);
}

export async function generateTutorielsPageAndWrite(template) {
	const fullHtml = await generateTutorielsPage(template);
	writeHtmlFile('tutoriels.html', fullHtml);
}

export async function generateGlossairePageAndWrite(template) {
	const fullHtml = await generateGlossairePage(template);
	writeHtmlFile('glossaire.html', fullHtml);
}


export async function generatePageHtml(pageId, pageSlug, template, parentPage = null) {
	const pageDetail = await fetchPage(pageId);
	// console.log('pageDetail', pageDetail.tags)
	pageDetail.tags.push({ name: parentPage, value: parentPage, order: pageDetail.tags.length });
	
	const fullHtml = await generateFullArticleHtmlPage(pageDetail, template);
	writeHtmlFile(`${pageSlug}.html`, fullHtml);
}
