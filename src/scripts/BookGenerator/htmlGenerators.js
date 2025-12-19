import path from 'path';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import { state, DOWNLOAD_IMAGES } from './config.js';
import { downloadImage, generateNewImage } from './imageUtils.js';
import { loadSnippet } from './fileUtils.js';

export async function generateIndexHtmlPage(template) {
	const dom = new JSDOM(template);
	const doc = dom.window.document;

	const headerSnippet = loadSnippet('nav.html');
	const body = doc.querySelector('body');
	body.innerHTML = headerSnippet + body.innerHTML;

	return dom.serialize();
}

export async function generateTutorielsPage(template) {
	const dom = new JSDOM(template);
	const doc = dom.window.document;

	const headerSnippet = loadSnippet('nav.html');
	const body = doc.querySelector('body');
	body.innerHTML = headerSnippet + body.innerHTML;

	const headSnippet = loadSnippet('sub-page-style.html');
	const head = doc.querySelector('head');
	head.innerHTML = head.innerHTML + headSnippet;

	const tagsContainer = doc.querySelector(".tags-container");
	const pagesContainer = doc.querySelector(".pages-container");
	
	const uniqueTags = [...new Set(state.tags.map(tag => tag.name))]
		.map(name => state.tags.find(tag => tag.name === name));
		
	uniqueTags.forEach(tag => {
		const tagElement = doc.createElement('span');
		tagElement.textContent = tag.name;
		tagElement.className = 'tag';
		tagsContainer.appendChild(tagElement);
	});

	state.pages.forEach(page => {
		const pageElement = doc.createElement('a');
		pageElement.setAttribute('href', page.slug + ".html");
		pageElement.setAttribute('target', '_blank');
		pageElement.innerHTML = page.title;
		pageElement.className = 'page';

		page.tags.forEach(tag => {
			pageElement.className += ' ' + tag.name;
		})

		pagesContainer.appendChild(pageElement);
	});

	return dom.serialize();
}

export async function generateArticlesPage(template) {
	const dom = new JSDOM(template);
	const doc = dom.window.document;
	
	// get glossaire page in state.pages
	const headerSnippet = loadSnippet('nav.html');
	const body = doc.querySelector('body');
	body.innerHTML = headerSnippet + body.innerHTML;

	const headSnippet = loadSnippet('sub-page-style.html');
	const head = doc.querySelector('head');
	head.innerHTML = head.innerHTML + headSnippet;

	return dom.serialize();

}

export async function generateGlossairePage(template) {
	const dom = new JSDOM(template);
	const doc = dom.window.document;

	// get glossaire page in state.pages
	const headerSnippet = loadSnippet('nav.html');
	const body = doc.querySelector('body');
	body.innerHTML = headerSnippet + body.innerHTML;

	const headSnippet = loadSnippet('sub-page-style.html');
	const head = doc.querySelector('head');
	head.innerHTML = head.innerHTML + headSnippet;

	const glossairePages = state.pages.filter(page => page.title == "Glossaire");
	
	const glossaireContainer = doc.querySelector(".glossaire-container");

	const tempDom = new JSDOM(glossairePages[0].content);
	const paragraphs = tempDom.window.document.querySelectorAll('p');

	glossaireContainer.innerHTML = '';

	const ul = doc.createElement('ul');
	ul.className = 'glossaire-list';

	let glossaireArray = [];

	paragraphs.forEach(paragraph => {
		if (paragraph.textContent.trim()) {
			const li = doc.createElement('li');
			li.className = 'glossaire-term';
			li.innerHTML = paragraph.innerHTML;
			
			const strongTags = li.querySelectorAll('strong');
			
			let glossaireElement = {
				term: strongTags[0] ? strongTags[0].textContent : '',
				definition: li.textContent.replace(strongTags[0] ? strongTags[0].textContent : '', '').trim()
			};

			glossaireArray.push(glossaireElement);

			strongTags.forEach(strong => {
				const br = doc.createElement('br');
				strong.parentNode.insertBefore(br, strong.nextSibling);
			});

			

			
			ul.appendChild(li);
		}
	});


	glossaireArray.sort((a, b) => a.term.localeCompare(b.term));

	fs.writeFileSync('./book/glossaire.json', JSON.stringify(glossaireArray, null, 2), 'utf-8');


	glossaireContainer.appendChild(ul);

	return dom.serialize();
}


/**
 * Generate a html page for all article and tutoriel pages
 * @param {*} pageData 
 * @param {*} template 
 * @returns 
 */
export async function generateFullArticleHtmlPage(pageData, template) {
	const dom = new JSDOM(template, {
		virtualConsole: new (await import('jsdom')).VirtualConsole()
	});
	const doc = dom.window.document;
	
	const headerSnippet = loadSnippet('nav.html');
	const body = doc.querySelector('body');
	body.innerHTML = headerSnippet + body.innerHTML;

	const headSnippet = loadSnippet('sub-page-style.html');
	const head = doc.querySelector('head');
	head.innerHTML = head.innerHTML + headSnippet;

	state.pages.push({
		title: pageData.name,
		slug: pageData.slug,
		tags: pageData.tags,
		parent: pageData.parent || null,
	})

	console.log('pageData.parent =', pageData.parent)

	if(pageData.name === "Glossaire"){
		state.pages[state.pages.length -1].content = pageData.html;
	}

	for (let i = 0; i < pageData.tags.length; i++) {
		const pageTag = pageData.tags[i];
		state.tags.push(pageTag);
	}

	const tempDom = new JSDOM(pageData.html);
	const tempDoc = tempDom.window.document;
	
	const authorsElement = tempDoc.querySelector('.authors');
	const dateElement = tempDoc.querySelector('.date');

	let imageContainer = doc.querySelector('.rigth-article-content')
	imageContainer.innerHTML = '';
	
	const titleElement = doc.querySelector('title');
	if (titleElement) titleElement.textContent = pageData.name;
	
	const h1Element = doc.querySelector('h1');
	if (h1Element) h1Element.textContent = pageData.name;
	
	const cleanContent = pageData.html.replace(/ id="[^"]*"/g, '');
	doc.querySelector('main').innerHTML = cleanContent;

	let images = doc.querySelectorAll('img')
	
	if (DOWNLOAD_IMAGES) {
		for (let i = 0; i < images.length; i++) {
			const image = images[i];
			const originalSrc = image.getAttribute("src");
			
			if (!originalSrc) {
				console.warn(`⚠️  Image ${i} sans attribut src, ignorée`);
				image.remove();
				continue;
			}
			
			const filename = `image-${pageData.id}-${i}-${path.basename(originalSrc) || 'image.jpg'}`;
			
			let localImagePath = await downloadImage(originalSrc, filename);
			
			if (!localImagePath) {
				console.warn(`⚠️  Échec téléchargement de l'image ${i}, ignorée`);
				image.remove();
				continue;
			}
			
			localImagePath = localImagePath.replace("/book", "");
			
			let newImage = generateNewImage(localImagePath, i + 1, doc);
			image.remove();
			imageContainer.appendChild(newImage);
		}
	} else {
		console.log('⏭️  Téléchargement des images désactivé');
		images.forEach(img => img.remove());
	}

	let eraseDate = true;

	if(dateElement && dateElement.innerHTML){
		let dateContainer = doc.querySelector(".title-container .details .date");
		dateContainer.innerHTML = dateElement.innerHTML;
		eraseDate = false;
	}

	if(dateElement && dateElement.innerHTML){
		let authorsContainer = doc.querySelector(".title-container .details .authors");
		authorsContainer.innerHTML = '';
		let authorsArray = authorsElement.innerHTML.split(",");

		for (let i = 0; i < authorsArray.length; i++) {
			const author = authorsArray[i];
			authorsContainer.innerHTML += "<li>" + author + "</li>";
		}		
		eraseDate = false;
	}

	doc.querySelector(".title-container .details .date").remove();
	doc.querySelector(".title-container .details .authors").remove();

	if(doc.querySelector('main .date')) doc.querySelector('main .date').remove();
	if(doc.querySelector('main .authors')) doc.querySelector('main .authors').remove();

	if (pageData.description) {
		const head = doc.querySelector('head');
		const metaDesc = doc.createElement('meta');
		metaDesc.setAttribute('name', 'description');
		metaDesc.setAttribute('content', pageData.description);
		head.appendChild(metaDesc);
	}
	
	const elems = doc.querySelectorAll('[id*="bkmrk"]');
	elems.forEach(element => element.removeAttribute("id"));
	
	return dom.serialize();
}
