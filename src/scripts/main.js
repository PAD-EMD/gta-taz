import 'simplebar'; // or "import SimpleBar from 'simplebar';" if you want to use it manually.
import 'simplebar/dist/simplebar.css';

// You will need a ResizeObserver polyfill for browsers that don't support it! (iOS Safari, Edge, ...)
import ResizeObserver from 'resize-observer-polyfill';
window.ResizeObserver = ResizeObserver;

import 'github-markdown-css';
import './../styles/style.scss';
import fslightbox from 'fslightbox';
import DitherJS from 'ditherjs';


var lightbox = new FsLightbox();

let scrollableContent = document.querySelector(".left-article-content");
let imagesContainer = document.querySelector(".rigth-article-content");

let imageLinkTargets = document.querySelectorAll(".link-to-image");

function onScroll() {
    if (imageLinkTargets.length === 0) return;
    
    // Trouver l'élément le plus proche du centre
    let closestElement = null;
    let smallestDistance = Infinity;
    
    imageLinkTargets.forEach(el => {
        const rect = el.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        const screenCenter = windowHeight / 3;
        const elementCenter = rect.top + rect.height / 2;
        const distanceToCenter = Math.abs(screenCenter - elementCenter);
        
        if (distanceToCenter < smallestDistance) {
            smallestDistance = distanceToCenter;
            closestElement = el;
        }
    });
    
    // Désactiver toutes les images d'abord
    imageLinkTargets.forEach(el => {
        let targetImage = imagesContainer.querySelector("#image-" + el.dataset.imageTargetId);
        if (targetImage) {
            targetImage.classList.remove('active');
        }

		el.classList.remove('active');
    });
    
    // Activer uniquement l'image correspondant à l'élément le plus proche
    if (closestElement && smallestDistance < document.body.offsetHeight) {
        let targetImage = imagesContainer.querySelector("#image-" + closestElement.dataset.imageTargetId);
        
        if (targetImage) {
			closestElement.classList.add('active');
            targetImage.classList.add('active');
            
            // Scroll vers cette image dans le container
            const containerRect = imagesContainer.getBoundingClientRect();
            const imageRect = targetImage.getBoundingClientRect();
            
            const containerCenter = containerRect.height / 2;
            const imageCenter = imageRect.top - containerRect.top + imageRect.height / 2;
            const scrollOffset = imageCenter - containerCenter;
            
            imagesContainer.scrollBy({
                top: scrollOffset,
                behavior: 'smooth'
            });
        }
    }
}

window.onload = function() {
    setTimeout(() => {
        document.querySelector(".fade-layer").classList.add("hidden");
    }, 500);

	imageLinkTargets = document.querySelectorAll(".link-to-image");
	for (let i = 0; i < imageLinkTargets.length; i++) {
		const imageLinkTarget = imageLinkTargets[i];
		
		imageLinkTarget.innerHTML += " (" + imageLinkTarget.dataset.imageTargetId + ") "

		imageLinkTarget.addEventListener('click', ()=>{
		});
	}

	scrollableContent.addEventListener('scroll', onScroll);
	
	const images = document.querySelectorAll('img');

	var ditherjs = new DitherJS();

	let palette = [
		[0,0,0], 
		[100,100,100], 
		[200,200,200]
		// [255,255,255]
	]

	images.forEach(img => {
		img.parentNode.appendChild(img.cloneNode(true));
		
		ditherjs.dither(img, {
			"step": 2, // The step for the pixel quantization n = 1,2,3...
			"palette": palette, // an array of colors as rgb arrays
			"algorithm": "atkinson" // one of ["ordered", "diffusion", "atkinson"]
		});
	});
}


