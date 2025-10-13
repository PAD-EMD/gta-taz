import "./../styles/style.scss";

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

	tagElements.forEach((tag) => {
		tag.addEventListener("click", (event) => {
			let clickedTag = event.target;
			console.log(clickedTag.classList);

			if (clickedTag.classList.contains("active")) {
				clickedTag.classList.remove("active");
				tagsContainer.classList.remove("tag-selected");
				pagesContainer.classList.remove("tag-selected");
			} else {
				tagElements.forEach((_tag) => {
					_tag.classList.remove("active");
				});

				clickedTag.classList.add("active");

				updatePageState(tag.innerHTML);

				console.log("tagsContainer", tagsContainer);

				if (!tagsContainer.classList.contains("tag-selected")) {
					tagsContainer.classList.add("tag-selected");
					pagesContainer.classList.add("tag-selected");
				}
			}
		});
	});
};

function updatePageState(tag) {
	pageLinks.forEach((page) => {
		page.classList.contains(tag)
			? page.classList.add("active")
			: page.classList.remove("active");
	});
}


