import './../styles/style.scss';

import fslightbox from 'fslightbox';

var lightbox = new FsLightbox();
lightbox.props.sources = ["/Image.jpg", "/Image.png"];
lightbox.open();
lightbox.close();
lightbox.open(1); // Opens the lightbox at the slide number 2.