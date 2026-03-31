
/*---------------------- Pharaonic door -------------------------*/
document.addEventListener('DOMContentLoaded', () => {
    const videoOverlay = document.getElementById('video-overlay');
    const introVideo = document.getElementById('intro-video');
    const skipButton = document.getElementById('skip-button');

    const videoSources = [
        { size: 1700, src: '/Wide Pharaonic gate.mp4' },
        { size: 900, src: '/Wide Pharaonic gate.mp4' },
        { size: 700, src: '/Long pharaonic gate.mp4' },
        { size: 400, src: '/Long pharaonic gate.mp4' }
    ];

    let currentVideoSrc = '';

    const setVideoSource = () => {
        const newVideoSrc = videoSources.reduce((acc, video) => {
            return window.innerWidth <= video.size ? video.src : acc;
        }, videoSources[videoSources.length - 1].src);

        if (newVideoSrc !== currentVideoSrc) {
            introVideo.src = newVideoSrc;
            introVideo.load();
            currentVideoSrc = newVideoSrc;
        }
    };

    const hideVideo = () => {
        if (videoOverlay) {
            introVideo.pause();
            introVideo.currentTime = 0;
            videoOverlay.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
    };

    const initVideo = () => {
        setVideoSource();
        introVideo.play().catch(hideVideo);
    };

    initVideo();
    introVideo.addEventListener('ended', hideVideo);
    skipButton.addEventListener('click', hideVideo);
    window.addEventListener('resize', setVideoSource);
});

/*---------------------------- Header --------------------------------*/
document.addEventListener("DOMContentLoaded", () => {
    const header = document.querySelector(".main-header");
    const menuToggle = document.getElementById('menu-toggle');
    const mobileOverlay = document.getElementById('mobile-overlay');
    const mobileLinks = document.querySelectorAll('.m-nav-link');

    window.addEventListener("scroll", () => {
        header?.classList.toggle("is-scrolled", window.scrollY > 5);
    });

    if (menuToggle && mobileOverlay) {
        const toggleMenu = () => {
            menuToggle.classList.toggle('active');
            mobileOverlay.classList.toggle('active');
            mobileLinks.forEach((link, i) => {
                link.style.animation = mobileOverlay.classList.contains('active')
                    ? `reveal .6s cubic-bezier(.4,0,.2,1) forwards ${i * 0.08}s`
                    : '';
            });
        };

        menuToggle.addEventListener('click', toggleMenu);

        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileOverlay.classList.remove('active');
                menuToggle.classList.remove('active');
            });
        });
    }
});

/*------------------------------------------ Trips Section -------------------------------------------------*/

document.addEventListener("DOMContentLoaded", () => {
    const wrapper = document.querySelector(".trips-slider-wrapper");
    const grid = document.querySelector(".trips-grid");
    const cards = gsap.utils.toArray(".trip-card");
    const dotsContainer = document.querySelector(".slider-dots");

    if (wrapper && grid && cards.length > 0 && dotsContainer) {
        let currentIndex = 0;
        let autoPlayInterval;

        dotsContainer.innerHTML = "";
        cards.forEach((_, i) => {
            const dot = document.createElement("div");
            dot.classList.add("slider-dot");
            if (i === 0) dot.classList.add("active");
            dot.addEventListener("click", () => {
                goToSlide(i);
                restartAutoPlay();
            });
            dotsContainer.appendChild(dot);
        });

        const dots = document.querySelectorAll(".slider-dot");

        const goToSlide = (index) => {
            const visibleCards = window.innerWidth > 1100 ? 3 : (window.innerWidth > 768 ? 2 : 1);
            const maxIndex = cards.length - visibleCards;

            if (index > maxIndex) index = 0;
            if (index < 0) index = maxIndex;

            currentIndex = index;
            const cardWidth = cards[0].offsetWidth;
            const gap = parseInt(window.getComputedStyle(grid).gap) || 0;
            const xOffset = -(currentIndex * (cardWidth + gap));

            gsap.to(grid, {
                x: xOffset,
                duration: 1,
                ease: "power3.out",
                onComplete: () => {
                    dots.forEach((d, i) => d.classList.toggle("active", i === currentIndex));
                }
            });
        };

        function startAutoPlay() {
            stopAutoPlay();
            autoPlayInterval = setInterval(() => {
                goToSlide(currentIndex + 1);
            }, 5000);
        }

        function stopAutoPlay() {
            clearInterval(autoPlayInterval);
        }

        function restartAutoPlay() {
            stopAutoPlay();
            startAutoPlay();
        }

        wrapper.addEventListener("mouseenter", stopAutoPlay);
        wrapper.addEventListener("mouseleave", startAutoPlay);
        wrapper.addEventListener("touchstart", stopAutoPlay, { passive: true });
        wrapper.addEventListener("touchend", startAutoPlay);

        startAutoPlay();

        window.addEventListener("resize", () => {
            gsap.set(grid, { clearProps: "x" });
            goToSlide(currentIndex);
        });

    }
});

/*------------------------------------ Section Feedback Styles ------------------------------------*/

document.addEventListener("DOMContentLoaded", () => {
    const track = document.querySelector('.swiper-wrapper');
    const container = document.querySelector('.swiper-container-feedback');
    const pagination = document.querySelector('.swiper-pagination');
    const feedbackForm = document.querySelector('.modal-form');

    let currentIndex = 0;
    let autoPlayTimer;

    function initSlider() {
        if (!container) return;
        const slides = document.querySelectorAll('.swiper-wrapper > .swiper-slide');
        const slideWidth = container.offsetWidth;

        gsap.set(track, { 
            display: 'flex', 
            width: `${slides.length * 100}%`, 
            x: -(currentIndex * slideWidth) 
        });
        
        gsap.set(slides, { 
            width: slideWidth, 
            flex: `0 0 ${slideWidth}px` 
        });

        if (pagination) {
            pagination.innerHTML = '';
            slides.forEach((_, i) => {
                const dot = document.createElement('div');
                dot.classList.add('dot');
                if (i === currentIndex) dot.classList.add('active');
                dot.addEventListener('click', () => { 
                    stopAutoPlay(); 
                    goToSlide(i); 
                    startAutoPlay(); 
                });
                pagination.appendChild(dot);
            });
        }
    }

    function goToSlide(index) {
        const slides = document.querySelectorAll('.swiper-wrapper > .swiper-slide');
        const slideWidth = container.offsetWidth;
        
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;
        
        currentIndex = index;

        gsap.to(track, {
            x: -(currentIndex * slideWidth),
            duration: 1.2,
            ease: "power2.out",
            onUpdate: () => {
                document.querySelectorAll('.dot').forEach((dot, i) => {
                    dot.classList.toggle('active', i === currentIndex);
                });
            }
        });
    }

    if (feedbackForm) {
        feedbackForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('reviewerName').value;
            const rating = document.getElementById('reviewerRating').value;
            const text = document.getElementById('reviewerText').value;
            const myNumber = "201151532637";

            const whatsappMsg = `*New Royal Review Received*%0A%0A*Name:* ${name}%0A*Rating:* ${rating}/5 STARS%0A*Review:* ${text}`;

            closeModal();
            openThanks();

            setTimeout(() => {
                window.open(`https://wa.me/${myNumber}?text=${whatsappMsg}`, '_blank');
                feedbackForm.reset();
            }, 2000);
        });
    }

    function startAutoPlay() { 
        stopAutoPlay(); 
        autoPlayTimer = setInterval(() => goToSlide(currentIndex + 1), 5000); 
    }

    function stopAutoPlay() { 
        clearInterval(autoPlayTimer); 
    }

    window.openModal = () => {
        gsap.set("#reviewModal", { display: "flex" });
        gsap.fromTo("#reviewModal .modal-content", { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" });
    };

    window.closeModal = () => {
        gsap.to("#reviewModal", { opacity: 0, duration: 0.4, onComplete: () => { 
            document.getElementById("reviewModal").style.display = "none"; 
            gsap.set("#reviewModal", { opacity: 1 }); 
        }});
    };

    window.openThanks = () => {
        gsap.set("#thanksModal", { display: "flex" });
        gsap.fromTo("#thanksModal .modal-content", { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: "power2.out" });
    };

    window.closeThanks = () => {
        gsap.to("#thanksModal", { opacity: 0, duration: 0.4, onComplete: () => { 
            document.getElementById("thanksModal").style.display = "none"; 
            gsap.set("#thanksModal", { opacity: 1 }); 
        }});
    };

    gsap.utils.toArray('.swiper-slide').forEach(slide => {
        gsap.from(slide, {
            scrollTrigger: { trigger: slide, start: "top 90%" },
            y: 30,
            opacity: 0,
            duration: 1,
            ease: "power2.out"
        });
    });

    window.addEventListener('resize', initSlider);
    initSlider();
    startAutoPlay();
});

/*---------------------- Section Gallery Styles ---------------------------*/

document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById('galleryGrid');
    const mask = document.querySelector('.gallery-mask');
    const items = gsap.utils.toArray('.gallery-item');
    const dotsContainer = document.querySelector('.gallery-dots');
    const btn = document.getElementById('loadMoreBtn');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const initialVisible = 10;

    let currentIndex = 0;
    let isExpanded = false;
    let autoPlayTick;

    const initGallery = () => {
        stopAutoPlay();
        if (!grid || items.length === 0) return;

        if (window.innerWidth > 1024) {
            btn.style.display = items.length > initialVisible ? 'block' : 'none';
            updateGridVisibility();
            gsap.set(grid, { clearProps: "all" });
        } else {
            btn.style.display = 'none';
            items.forEach(item => item.classList.remove('hidden-item'));
            setupMobileSlider();
            startAutoPlay();
        }
    };

    const updateGridVisibility = () => {
        items.forEach((item, index) => item.classList.toggle('hidden-item', index >= initialVisible && !isExpanded));
    };

    btn?.addEventListener('click', () => {
        isExpanded = !isExpanded;
        if (isExpanded) {
            items.forEach(item => item.classList.remove('hidden-item'));
            btn.textContent = 'SHOW LESS';
        } else {
            updateGridVisibility();
            btn.textContent = 'SHOW MORE';
            document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' });
        }
    });

    const setupMobileSlider = () => {
        const gap = 15;
        const step = items[0].offsetWidth + gap;

        dotsContainer.innerHTML = '';
        items.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.classList.add('gallery-dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => { stopAutoPlay(); goToSlide(i); startAutoPlay(); });
            dotsContainer.appendChild(dot);
        });
    };

    const goToSlide = (index) => {
        const gap = 15;
        const step = items[0].offsetWidth + gap;
        const maxIndex = items.length - 1;
        currentIndex = index > maxIndex ? 0 : index;
        gsap.to(grid, { x: -currentIndex * step, duration: 0.7, ease: "power2.inOut", onUpdate: updateDots });
    };

    const updateDots = () => {
        const dots = gsap.utils.toArray('.gallery-dot');
        dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
    };

    const startAutoPlay = () => { stopAutoPlay(); autoPlayTick = setInterval(() => goToSlide(currentIndex + 1), 3000); };
    const stopAutoPlay = () => clearInterval(autoPlayTick);

    items.forEach(item => {
        const img = item.querySelector('img');
        img?.addEventListener('click', () => {
            lightboxImg.src = img.src;
            lightbox.style.display = 'flex';
            gsap.fromTo(lightbox, { opacity: 0 }, { opacity: 1, duration: 0.4 });
        });
    });

    window.closeLightbox = () => {
        gsap.to(lightbox, { opacity: 0, duration: 0.3, onComplete: () => lightbox.style.display = 'none' });
    };

    window.addEventListener('resize', initGallery);
    initGallery();
});

/*--------------------------------------------------- FAQ SECTION ------------------------------------------------*/
document.querySelectorAll('.faq-toggle').forEach(btn => {
    btn.addEventListener('click', () => toggleFaq(btn));
});
function toggleFaq(element) {
    const parent = element.parentElement;
    document.querySelectorAll('.faq-item').forEach(item => { if (item !== parent) item.classList.remove('active'); });
    parent.classList.toggle('active');
}

/*---------------------------------------- QUICK CONTACT SECTION ----------------------------------------------*/
document.addEventListener("DOMContentLoaded", () => {
    const contactForm = document.querySelector('.ancient-form-content');
    if (contactForm) {
        contactForm.addEventListener('submit', e => {
            e.preventDefault();
            const name = contactForm.querySelector('input[name="name"]')?.value.trim() ||
            contactForm.querySelector('input[type="text"]').value.trim();
            const email = contactForm.querySelector('input[type="email"]')?.value.trim();
            const message = contactForm.querySelector('textarea')?.value.trim();
            const waNumber = '201151532637';
            const emailPart = email ? `%0AEmail: ${email}` : '';
            const text = `Name: ${name}${emailPart}%0AMessage: ${message}`;
            window.open(`https://wa.me/${waNumber}?text=${text}`, '_blank');
            contactForm.reset();
        });
    }

    const scrollBtn = document.getElementById('scrollTopBtn');
    const toggleScrollBtn = () => scrollBtn?.classList.toggle('show', window.scrollY > 600);
    scrollBtn?.addEventListener('click', e => { e.preventDefault(); gsap.to(window, { scrollTo: 0, duration: 1.2, ease: 'power2.inOut' }); });
    window.addEventListener('scroll', toggleScrollBtn);
    window.addEventListener('load', toggleScrollBtn);

    gsap.fromTo('.luxury-contact-card', { y: 0 }, { y: 10, repeat: -1, yoyo: true, ease: 'sine.inOut', duration: 3 });
    gsap.fromTo('.integrated-footer', { y: 0 }, { y: 5, repeat: -1, yoyo: true, ease: 'sine.inOut', duration: 4 });
});

/*------------------ Section UI Components & Scroll Button ------------------*/
const backToTopBtn = document.getElementById("scrollToTop");
const toggleScrollButton = () => backToTopBtn?.classList.toggle("is-visible", window.scrollY > 400);
window.addEventListener("scroll", toggleScrollButton);
backToTopBtn?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

