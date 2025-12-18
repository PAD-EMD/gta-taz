import "./../styles/style.scss";
import "github-markdown-css";
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css"; // optional for styling

let tagElements, tagsContainer;
let pageLinks, pagesContainer;

window.onload = () => {
	setTimeout(() => {
		document.querySelector(".fade-layer").classList.add("hidden");
	}, 500);

	tagElements = document.querySelectorAll(".tag");
	pageLinks = document.querySelectorAll(".page");
	tagsContainer = document.querySelector(".tags-container");
	pagesContainer = document.querySelector(".pages-container");

	//?selected=Articles
	let params = new URLSearchParams(document.location.search);
	let selected = params.get("selected"); // is the string "Jonathan"

	tagElements.forEach((tag) => {
		tag.addEventListener("click", (event) => {
			let clickedTag = event.target;
			toggleTag(clickedTag);
		});

		if (selected == tag.innerHTML) {
			toggleTag(tag);
		}
	});
};

function toggleTag(clickedTag) {
	if (clickedTag.classList.contains("active")) {
		clickedTag.classList.remove("active");
		tagsContainer.classList.remove("tag-selected");
		pagesContainer.classList.remove("tag-selected");
	} else {
		tagElements.forEach((_tag) => {
			_tag.classList.remove("active");
		});

		clickedTag.classList.add("active");

		updatePageState(clickedTag.innerHTML);

		console.log("tagsContainer", tagsContainer);

		if (!tagsContainer.classList.contains("tag-selected")) {
			tagsContainer.classList.add("tag-selected");
			pagesContainer.classList.add("tag-selected");
		}
	}
}

function updatePageState(tag) {
	pageLinks.forEach((page) => {
		page.classList.contains(tag)
			? page.classList.add("active")
			: page.classList.remove("active");
	});
}

tippy(".info", {
	content: `Subversion est un projet mené par le PAD EMD de l\'ESAD d\'orléans. Pour plus de détails, consultez la section <a href="ok">À propos</a>.`,
});
