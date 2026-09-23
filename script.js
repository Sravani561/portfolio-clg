/* =========================
   HERO TYPING EFFECT
========================= */

const typingText = document.getElementById("typing-text");

const roles = [
    "Software Developer",
    "Web Developer",
    "AI/ML Enthusiast"
];

let roleIndex = 0;
let charIndex = 0;
let deleting = false;


function typeEffect() {

    if (!typingText) {
        return;
    }

    const currentRole = roles[roleIndex];

    if (!deleting) {

        typingText.textContent =
            currentRole.substring(0, charIndex + 1);

        charIndex++;

        if (charIndex === currentRole.length) {

            deleting = true;

            setTimeout(typeEffect, 1500);

            return;
        }

    } else {

        typingText.textContent =
            currentRole.substring(0, charIndex - 1);

        charIndex--;

        if (charIndex === 0) {

            deleting = false;

            roleIndex =
                (roleIndex + 1) % roles.length;
        }
    }

    const speed = deleting ? 60 : 100;

    setTimeout(typeEffect, speed);
}


typeEffect();


/* =========================
   NAVBAR ACTIVE LINK
========================= */

const navLinks = document.querySelectorAll(".nav-links a");

window.addEventListener("scroll", () => {

    let currentSection = "";

    document.querySelectorAll("section[id]").forEach(section => {

        const sectionTop = section.offsetTop - 150;
        const sectionHeight = section.offsetHeight;

        if (
            window.scrollY >= sectionTop &&
            window.scrollY < sectionTop + sectionHeight
        ) {
            currentSection = section.getAttribute("id");
        }

    });


    navLinks.forEach(link => {

        link.classList.remove("active");

        if (
            link.getAttribute("href") === "#" + currentSection
        ) {
            link.classList.add("active");
        }

    });

});
/* =========================================================
   CAMPUS UNITE PHOTO MODAL
========================================================= */

function openCampusUnite() {
    const modal = document.getElementById("campusUniteModal");

    if (modal) {
        modal.classList.add("active");
        document.body.style.overflow = "hidden";
    }
}


function closeCampusUnite() {
    const modal = document.getElementById("campusUniteModal");

    if (modal) {
        modal.classList.remove("active");
        document.body.style.overflow = "";
    }
}


/* Close when clicking outside the image */

document.addEventListener("click", function (event) {

    const modal = document.getElementById("campusUniteModal");

    if (
        modal &&
        event.target === modal
    ) {
        closeCampusUnite();
    }

});


/* Close with ESC key */

document.addEventListener("keydown", function (event) {

    if (event.key === "Escape") {
        closeCampusUnite();
    }

});

/* =========================================
   MYBHARAT GALLERY FUNCTIONS
========================================= */

function openMyBharatGallery() {
    const modal = document.getElementById("mybharatGallery");

    if (modal) {
        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }
}

function closeMyBharatGallery() {
    const modal = document.getElementById("mybharatGallery");

    if (modal) {
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }
}

document.addEventListener("click", function (event) {
    const modal = document.getElementById("mybharatGallery");

    if (modal && event.target === modal) {
        closeMyBharatGallery();
    }
});

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeMyBharatGallery();
    }
});
