const menuButton = document.querySelector("#menuButton");
const nav = document.querySelector(".site-nav");
const headerFlex = document.querySelector("#header-flex");
const header = headerFlex.parentElement;

function toggleMenu() {
    console.log("Click registered");
    nav.classList.toggle("hide");
}

function handleResize() {
    const isMobile = window.innerWidth <= 600;

    console.log("Checking resize...");

    if (isMobile && nav.parentElement === headerFlex) {
        header.appendChild(nav);
        nav.classList.add("hide");
    }

    if (!isMobile && nav.parentElement !== headerFlex) {
        headerFlex.appendChild(nav);
        nav.classList.remove("hide");
    }
}

handleResize();

menuButton.addEventListener("click", toggleMenu);
window.addEventListener("resize", handleResize);