
document.addEventListener("DOMContentLoaded", () => {
    const debounce = (func, delay = 100) => {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => func.apply(this, args), delay);
        };
    };

    /* Header & Mobile Menu */
    const menuToggle = document.getElementById("menu-toggle");
    const mobileOverlay = document.getElementById("mobile-overlay");
    const closeMenu = () => {
        menuToggle.classList.remove("active");
        mobileOverlay.classList.remove("active");
        document.body.style.overflow = "";
    };
    const openMenu = () => {
        menuToggle.classList.add("active");
        mobileOverlay.classList.add("active");
        document.body.style.overflow = "hidden";
    };
    if (menuToggle && mobileOverlay) {
        menuToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            mobileOverlay.classList.contains("active") ? closeMenu() : openMenu();
        });
        mobileOverlay.addEventListener("click", (e) => {
            if (e.target.tagName === "A") closeMenu();
        });
        document.addEventListener("click", (e) => {
            if (!mobileOverlay.contains(e.target) && !menuToggle.contains(e.target)) {
                closeMenu();
            }
        });
    }

    /* Reveal Animations */
    const revealElements = document.querySelectorAll(
        ".card, .timeline-item, .inclusions-card"
    );
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
            if (el.classList.contains("inclusions-card")) {
                const items = el.querySelectorAll(".inclusions-list-item");
                items.forEach((item, index) => {
                    setTimeout(() => {
                        item.style.opacity = "1";
                        item.style.transform = "translateX(0)";
                    }, index * 70);
                });
            }
            revealObserver.unobserve(el);
        });
    }, {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    });
    revealElements.forEach(el => {
        el.style.opacity = "0";
        el.style.transform = "translateY(40px)";
        revealObserver.observe(el);
    });

    /* Cards Hover Interaction */
    const cards = document.querySelectorAll(".card");
    if (window.innerWidth > 1024) {
        cards.forEach(card => {
            card.addEventListener("mousemove", (e) => {
                const { left, top, width, height } = card.getBoundingClientRect();
                const x = (e.clientX - left) / width - 0.5;
                const y = (e.clientY - top) / height - 0.5;
                card.style.transform =
                    `perspective(1000px) rotateY(${x * 10}deg) rotateX(${y * -10}deg) translateY(-8px)`;
                card.style.boxShadow = "0 20px 40px rgba(0,0,0,0.15)";
            });
            card.addEventListener("mouseleave", () => {
                card.style.transform =
                    "perspective(1000px) rotateY(0deg) rotateX(0deg) translateY(0)";
                card.style.boxShadow = "none";
            });
        });
    }

    /* Timeline Touch Interaction */
    const timelineItems = document.querySelectorAll(".timeline-item");
    timelineItems.forEach(item => {
        item.addEventListener("touchstart", () => {
            item.classList.add("active-touch");
        }, { passive: true });
        item.addEventListener("touchend", () => {
            setTimeout(() => item.classList.remove("active-touch"), 300);
        }, { passive: true });
    });

    /* Inclusions Cards Touch */
    const inclusionCards = document.querySelectorAll(".inclusions-card");
    inclusionCards.forEach(card => {
        const items = card.querySelectorAll(".inclusions-list-item");
        items.forEach(li => {
            li.style.opacity = "0";
            li.style.transform = "translateX(-15px)";
            li.style.transition = "all 0.6s cubic-bezier(0.23,1,0.32,1)";
        });
        card.addEventListener("touchstart", () => {
            card.style.transform = "scale(0.98) translateY(-5px)";
        }, { passive: true });
        card.addEventListener("touchend", () => {
            card.style.transform = "translateY(0) scale(1)";
        }, { passive: true });
    });

    /* Buttons Interaction */
    const buttons = document.querySelectorAll(".btn");
    buttons.forEach(btn => {
        btn.addEventListener("mouseenter", () => {
            btn.style.transition = "all 0.4s cubic-bezier(0.175,0.885,0.32,1.275)";
        });
    });

    /* Gallery Slider & Modal */
    const gallerySlider = document.querySelector(".gallery-slider");
    const galleryDotsContainer = document.querySelector(".gallery-dots");
    const gallerySlides = document.querySelectorAll(".gallery-slide");
    const modal = document.getElementById("image-modal");
    const modalImage = document.getElementById("modal-image");
    const closeModal = document.querySelector(".close-modal");
    if (gallerySlider && gallerySlides.length) {
        let slideIndex = 0;
        let autoPlayInterval;
        const createDots = () => {
            gallerySlides.forEach((_, index) => {
                const dot = document.createElement("span");
                dot.classList.add("gallery-dot");
                if (index === 0) dot.classList.add("active");
                dot.addEventListener("click", () => goToSlide(index));
                galleryDotsContainer.appendChild(dot);
            });
        };
        const updateDots = () => {
            const dots = document.querySelectorAll(".gallery-dot");
            dots.forEach(dot => dot.classList.remove("active"));
            if (dots[slideIndex]) dots[slideIndex].classList.add("active");
        };
        const goToSlide = (index) => {
            slideIndex = index;
            gallerySlider.style.transform =
                `translateX(${-slideIndex * 100}%)`;
            updateDots();
        };
        const startAutoPlay = () => {
            stopAutoPlay();
            autoPlayInterval = setInterval(() => {
                slideIndex = (slideIndex + 1) % gallerySlides.length;
                goToSlide(slideIndex);
            }, 3000);
        };
        const stopAutoPlay = () => clearInterval(autoPlayInterval);
        gallerySlides.forEach(slide => {
            slide.addEventListener("click", () => {
                modal.style.display = "flex";
                modalImage.src = slide.src;
                stopAutoPlay();
            });
        });
        closeModal.addEventListener("click", () => {
            modal.style.display = "none";
            startAutoPlay();
        });
        window.addEventListener("click", (e) => {
            if (e.target === modal) {
                modal.style.display = "none";
                startAutoPlay();
            }
        });
        createDots();
        startAutoPlay();
        gallerySlider.addEventListener("mouseenter", stopAutoPlay);
        gallerySlider.addEventListener("mouseleave", startAutoPlay);
    }

    /* Booking Form */
    const form = document.querySelector(".booking-form");
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const btn = form.querySelector(".btn");
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            const tripName = document.title.split("|")[0].trim();
            const message =
                `*New Kingdom Discovery Booking* 🏺\n` +
                `---------------------------\n` +
                `🏰 *Adventure:* ${tripName}\n` +
                `👤 *Guest:* ${data.fullName}\n` +
                `📞 *Contact:* ${data.phone}\n` +
                `👥 *Size:* ${data.guests} Persons\n` +
                `📅 *Date:* ${data.date}\n` +
                `---------------------------\n` +
                `✉️ Sent from your professional portal.`;
            const whatsappLink =
                `https://wa.me/201151532637?text=${encodeURIComponent(message)}`;
            const originalText = btn.innerHTML;
            btn.innerHTML = "Processing... 🕊️";
            setTimeout(() => {
                window.open(whatsappLink, "_blank");
                btn.innerHTML = "Request Sent!";
                setTimeout(() => {
                    btn.innerHTML = originalText;
                }, 3000);
            }, 800);
        });
    }

    /* Back To Top */
    const backToTopBtn = document.getElementById("backToTop");
    if (backToTopBtn) {
        const handleScroll = debounce(() => {
            if (window.pageYOffset > 400) {
                backToTopBtn.classList.add("show");
            } else {
                backToTopBtn.classList.remove("show");
            }
        }, 50);
        window.addEventListener("scroll", handleScroll);
        backToTopBtn.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }
});

function toggleFaq(element) {
    const parent = element.parentElement;
    const allItems = document.querySelectorAll(".faq-item");
    allItems.forEach(item => {
        if (item !== parent && item.classList.contains("active")) {
            item.classList.remove("active");
        }
    });
    parent.classList.toggle("active");
}