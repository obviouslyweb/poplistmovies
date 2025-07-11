const menuButton = document.querySelector("#menuButton");
const menu = document.querySelector(".site-nav")

function toggleMenu() {
    console.log("Click registered");
    if (menu.classList.contains("hide")) {
        menu.classList.remove("hide");
    } else {
        menu.classList.add("hide");
    }
}

function handleResize() {
    console.log("Checking resize...")
    if (window.innerWidth > 600) {
        menu.classList.remove("hide");
    } else {
        menu.classList.add("hide");
    }
}

menuButton.addEventListener("click", toggleMenu);
window.addEventListener("resize", handleResize);