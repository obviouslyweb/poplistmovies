const menuButton = document.querySelector("#menuButton");

function toggleMenu() {
    console.log("Click registered");
    const menu = document.querySelector(".site-nav");
    if (menu.classList.contains("hide")) {
        menu.classList.remove("hide");
    } else {
        menu.classList.add("hide");
    }
}

function handleResize() {
    const menu = document.querySelector(".menu");
    if (window.innerWidth > 1000) {
        menu.classList.remove("hide");
    } else {
        menu.classList.add("hide");
    }
}

menuButton.addEventListener("click", toggleMenu);
window.addEventListener("resize", handleResize);