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

	try {
		const fullUrl = imageUrl.startsWith('http') ? imageUrl : `${BOOKSTACK_API_URL.replace('/api', '')}${imageUrl}`;
		
		console.log(`🔄 Téléchargement: ${fullUrl}`);
		
		const response = await api.get(fullUrl, {
			responseType: 'stream',
			headers: { Authorization: `Token ${BOOKSTACK_TOKEN}` }
		});
		
		const imagePath = path.join(DIR, 'images', filename);
		await streamPipeline(response.data, createWriteStream(imagePath));
		
		console.log(`✅ Image téléchargée: ${filename}`);
		return `/book/images/${filename}`;
	} catch (error) {
		console.error(`❌ Erreur téléchargement image: ${imageUrl}`);
		console.error(`   Détails: ${error.message}`);
		console.error(`   Fichier: ${filename}`);
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
