import path from 'path';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';
import { api } from './api.js';
import { DIR, BOOKSTACK_API_URL, BOOKSTACK_TOKEN } from './config.js';

const streamPipeline = promisify(pipeline);

export async function downloadImage(imageUrl, filename) {
	if (!imageUrl) {
		console.warn(`❌ URL d'image vide, skip: ${filename}`);
		return '';
	}

	const cleanFilename = filename.replace(/[?#&=]/g, '_').replace(/__+/g, '_');

	const isExternalUrl = (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) 
		&& !imageUrl.includes(BOOKSTACK_API_URL.replace('/api', ''));

	try {
		let fullUrl;
		let requestConfig;

		if (isExternalUrl) {
			fullUrl = imageUrl;
			requestConfig = { responseType: 'stream' };
			// console.log(`🔄 Téléchargement image externe: ${fullUrl}`);
		} else {
			fullUrl = imageUrl.startsWith('http') ? imageUrl : `${BOOKSTACK_API_URL.replace('/api', '')}${imageUrl}`;
			requestConfig = {
				responseType: 'stream',
				headers: { Authorization: `Token ${BOOKSTACK_TOKEN}` }
			};
			// console.log(`🔄 Téléchargement: ${fullUrl}`);
		}
		
		const response = await api.get(fullUrl, requestConfig);
		
		const imagePath = path.join(DIR, 'images', cleanFilename);
		await streamPipeline(response.data, createWriteStream(imagePath));
		
		// console.log(`✅ Image téléchargée: ${cleanFilename}`);
		return `/book/images/${cleanFilename}`;
	} catch (error) {
		console.error(`❌ Erreur téléchargement image: ${imageUrl}`);
		console.error(`   Détails: ${error.message}`);
		console.error(`   Fichier: ${cleanFilename}`);
		return imageUrl;
	}
}

export function generateNewImage(imageSrc, imageId, doc) {
	const linkElement = doc.createElement('a');
	linkElement.setAttribute('data-fslightbox', 'gallery');
	linkElement.setAttribute('href', imageSrc);
	linkElement.setAttribute('class', 'image');
	linkElement.setAttribute('id', "image-" + imageId);

	const imgElementId = doc.createElement('div');
	imgElementId.setAttribute('class', 'id');
	imgElementId.innerHTML = imageId;
	
	const imgElement = doc.createElement('img');
	imgElement.setAttribute('src', imageSrc);
	
	linkElement.appendChild(imgElement);
	linkElement.appendChild(imgElementId);
	
	return linkElement;
}
