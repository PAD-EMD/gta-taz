import './../styles/style.scss';

import fslightbox from 'fslightbox';
import DitherJS from 'ditherjs';

var lightbox = new FsLightbox();

let scrollableContent = document.querySelector(".left-article-content");
let imagesContainer = document.querySelector(".rigth-article-content");


function isInCenter(el) {
	const rect = el.getBoundingClientRect();
	const windowHeight = window.innerHeight || document.documentElement.clientHeight;

	// Position verticale du centre de l’écran
	const screenCenter = windowHeight / 2;

	// Distance entre le centre de l’élément et le centre de l’écran
	const elementCenter = rect.top + rect.height / 2;
	const distanceToCenter = Math.abs(screenCenter - elementCenter);

	// Tu peux ajuster cette tolérance (en pixels) selon tes besoins
	console.log(distanceToCenter)
	return distanceToCenter < 100;
}

function onScroll() {
    let imageLinkTargets = document.querySelectorAll(".link-to-image");
	console.log(imageLinkTargets)
        
    imageLinkTargets.forEach(el => {
        let targetImage = imagesContainer.querySelector("#image-" + el.dataset.imageTargetId);

        if (isInCenter(el)) {
            targetImage.classList.add('active');
            
            // Scroll within the imagesContainer, not the entire window
            const containerRect = imagesContainer.getBoundingClientRect();
            const imageRect = targetImage.getBoundingClientRect();
            
            // Calculate the scroll position to center the image in the container
            const containerCenter = containerRect.height / 2;
            const imageCenter = imageRect.top - containerRect.top + imageRect.height / 2;
            const scrollOffset = imageCenter - containerCenter;
            
            imagesContainer.scrollBy({
                top: scrollOffset,
                behavior: 'smooth'
            });
        } else {
            targetImage.classList.remove('active');
        }
    });
}

window.onload = function() {
	scrollableContent.addEventListener('scroll', onScroll);
	
	const images = document.querySelectorAll('img');

	var ditherjs = new DitherJS();

	let palette = [
		[0,0,0], 
		[100,100,100], 
		[200,200,200], 
		[255,255,255]
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


