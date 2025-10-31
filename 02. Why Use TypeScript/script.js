const button = document.createElement("button");

button.addEventListener("click", (e) => {
	console.log(e.target);
});

function handleClick(e) {
	console.log(e.anyTarget); // undefined. Our code has a bug. But
}
