const button = document.createElement("button");

button.addEventListener("click", handleClick);

function handleClick(e: MouseEvent) {
	console.log(e.target);
}
