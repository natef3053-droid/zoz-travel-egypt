
const RAFThrottle = (fn) => {
    let ticking = false;
    return (...args) => {
        if (!ticking) {
            requestAnimationFrame(() => {
                fn(...args);
                ticking = false;
            });
            ticking = true;
        }
    };
};
const PharaonicDoor = (() => {
    let overlay;
    let video;
    let skip;
    let currentSrc = '';
    const sources = [
        { size: 1700, src: 'Wide Pharaonic gate.mp4' },
        { size: 900, src: 'Wide Pharaonic gate.mp4' },
        { size: 700, src: 'Long pharaonic gate.mp4' },
        { size: 400, src: 'Long pharaonic gate.mp4' }
    ];
    const getSource = () => {
        const width = window.innerWidth;
        return sources.reduce((acc, v) => width <= v.size ? v.src : acc, sources[sources.length - 1].src);
    };
    const updateSource = () => {
        const src = getSource();
        if (src !== currentSrc) {
            currentSrc = src;
            video.src = src;
            video.load();
        }
    };
    const hide = () => {
        if (!overlay) return;
        video.pause();
        video.currentTime = 0;
        gsap.to(overlay, {
            opacity: 0,
            duration: .9,
            ease: "power4.out",
            onComplete() {
                overlay.classList.add("hidden");
                document.body.style.overflow = "auto";
            }
        });
    };
    const init = () => {
        overlay = document.getElementById("video-overlay");
        video = document.getElementById("intro-video");
        skip = document.getElementById("skip-button");
        if (!video) return;
        updateSource();
        video.play().catch(hide);
        video.addEventListener("ended", hide);
        skip?.addEventListener("click", hide);
        window.addEventListener("resize", RAFThrottle(updateSource), { passive: true });
    };
    return { init };
})();
const HeaderModule = (() => {
    let header;
    let toggle;
    let overlay;
    let links;
    const onScroll = () => {
        header?.classList.toggle("is-scrolled", window.scrollY > 5);
    };
    const toggleMenu = () => {
        toggle.classList.toggle("active");
        overlay.classList.toggle("active");
        const active = overlay.classList.contains("active");
        links.forEach((link, i) => {
            link.style.animation = active
                ? `reveal .6s cubic-bezier(.4,0,.2,1) forwards ${i * .08}s`
                : '';
        });
    };
    const init = () => {
        header = document.querySelector(".main-header");
        toggle = document.getElementById("menu-toggle");
        overlay = document.getElementById("mobile-overlay");
        links = document.querySelectorAll(".m-nav-link");
        window.addEventListener("scroll", RAFThrottle(onScroll), { passive: true });
        if (!toggle || !overlay) return;
        toggle.addEventListener("click", toggleMenu);
        links.forEach(link => {
            link.addEventListener("click", () => {
                overlay.classList.remove("active");
                toggle.classList.remove("active");
            });
        });
    };
    return { init };
})();
const TripsSlider = (() => {
    let wrapper;
    let grid;
    let cards;
    let dotsContainer;
    let dots = [];
    let index = 0;
    let startX = 0;
    let currentX = 0;
    let velocity = 0;
    let lastX = 0;
    let lastTime = 0;
    let dragging = false;
    let autoplay;
    const visibleCards = () => {
        if (window.innerWidth > 1100) return 3;
        if (window.innerWidth > 768) return 2;
        return 1;
    };
    const metrics = () => {
        const cardWidth = cards[0].offsetWidth;
        const gap = parseInt(getComputedStyle(grid).gap) || 0;
        return {
            cardWidth,
            gap,
            slide: cardWidth + gap
        };
    };
    const clampIndex = (i) => {
        const max = cards.length - visibleCards();
        if (i < 0) return max;
        if (i > max) return 0;
        return i;
    };
    const moveTo = (i, inertia = 0) => {
        index = clampIndex(i);
        const { slide } = metrics();
        const x = -(index * slide);
        currentX = x;
        gsap.to(grid, {
            x,
            duration: .9 + Math.abs(inertia) * .002,
            ease: "expo.out",
            force3D: true
        });
        dots.forEach((d, n) => d.classList.toggle("active", n === index));
    };
    const start = (x) => {
        dragging = true;
        startX = x;
        lastX = x;
        velocity = 0;
        lastTime = performance.now();
        stopAuto();
    };
    const move = (x) => {
        if (!dragging) return;
        const now = performance.now();
        const delta = x - startX;
        velocity = (x - lastX) / (now - lastTime);
        lastX = x;
        lastTime = now;
        gsap.set(grid, {
            x: currentX + delta,
            force3D: true
        });
    };
    const end = (x) => {
        if (!dragging) return;
        dragging = false;
        const delta = x - startX;
        const threshold = 60;
        if (Math.abs(delta) > threshold || Math.abs(velocity) > .4) {
            if (delta < 0) moveTo(index + 1, velocity);
            else moveTo(index - 1, velocity);
        } else {
            moveTo(index);
        }
        startAuto();
    };
    const touchStart = e => start(e.touches[0].clientX);
    const touchMove = e => move(e.touches[0].clientX);
    const touchEnd = e => end(e.changedTouches[0].clientX);
    const mouseDown = e => start(e.clientX);
    const mouseMove = e => move(e.clientX);
    const mouseUp = e => end(e.clientX);
    const createDots = () => {
        dotsContainer.innerHTML = '';
        cards.forEach((_, i) => {
            const d = document.createElement("div");
            d.className = "slider-dot";
            if (i === 0) d.classList.add("active");
            d.addEventListener("click", () => {
                moveTo(i);
                restartAuto();
            });
            dotsContainer.appendChild(d);
        });
        dots = [...dotsContainer.children];
    };
    const startAuto = () => {
        stopAuto();
        autoplay = setInterval(() => {
            moveTo(index + 1);
        }, 5000);
    };
    const stopAuto = () => {
        if (autoplay) clearInterval(autoplay);
    };
    const restartAuto = () => {
        stopAuto();
        startAuto();
    };
    const resize = () => {
        gsap.set(grid, { clearProps: "x" });
        moveTo(index);
    };
    const init = () => {
        wrapper = document.querySelector(".trips-slider-wrapper");
        grid = document.querySelector(".trips-grid");
        cards = gsap.utils.toArray(".trip-card");
        dotsContainer = document.querySelector(".slider-dots");
        if (!wrapper || !grid || !cards.length || !dotsContainer) return;
        gsap.set(grid, { force3D: true });
        grid.style.willChange = "transform";
        createDots();
        wrapper.addEventListener("mouseenter", stopAuto);
        wrapper.addEventListener("mouseleave", startAuto);
        wrapper.addEventListener("touchstart", touchStart, { passive: true });
        wrapper.addEventListener("touchmove", touchMove, { passive: true });
        wrapper.addEventListener("touchend", touchEnd, { passive: true });
        wrapper.addEventListener("mousedown", mouseDown);
        window.addEventListener("mousemove", mouseMove);
        window.addEventListener("mouseup", mouseUp);
        window.addEventListener("resize", RAFThrottle(resize), { passive: true });
        startAuto();
    };
    return { init };
})();
document.addEventListener("DOMContentLoaded", () => {
    PharaonicDoor.init();
    HeaderModule.init();
    TripsSlider.init();
});

const FeedbackSlider = (() => {
    let container;
    let track;
    let slides;
    let pagination;
    let slideWidth = 0;
    let index = 0;
    let autoplay;
    let startX = 0;
    let currentX = 0;
    let velocity = 0;
    let lastX = 0;
    let lastTime = 0;
    let dragging = false;
    const metrics = () => {
        slideWidth = container.offsetWidth;
    };
    const layout = () => {
        slides = gsap.utils.toArray('.swiper-wrapper > .swiper-slide');
        gsap.set(track, {
            display: "flex",
            width: `${slides.length * 100}%`,
            force3D: true
        });
        gsap.set(slides, {
            width: slideWidth,
            flex: `0 0 ${slideWidth}px`
        });
        gsap.set(track, {
            x: -(index * slideWidth)
        });
    };
    const updateDots = () => {
        document.querySelectorAll('.dot').forEach((d, i) => {
            d.classList.toggle("active", i === index);
        });
    };
    const goTo = (i, inertia = 0) => {
        if (i < 0) i = slides.length - 1;
        if (i >= slides.length) i = 0;
        index = i;
        currentX = -(index * slideWidth);
        gsap.to(track, {
            x: currentX,
            duration: .9 + Math.abs(inertia) * .002,
            ease: "expo.out",
            force3D: true,
            onUpdate: updateDots
        });
    };
    const start = (x) => {
        dragging = true;
        startX = x;
        lastX = x;
        velocity = 0;
        lastTime = performance.now();
        stopAuto();
    };
    const move = (x) => {
        if (!dragging) return;
        const now = performance.now();
        const delta = x - startX;
        velocity = (x - lastX) / (now - lastTime);
        lastX = x;
        lastTime = now;
        gsap.set(track, {
            x: currentX + delta,
            force3D: true
        });
    };
    const end = (x) => {
        if (!dragging) return;
        dragging = false;
        const delta = x - startX;
        const threshold = 60;
        if (Math.abs(delta) > threshold || Math.abs(velocity) > .4) {
            if (delta < 0) goTo(index + 1, velocity);
            else goTo(index - 1, velocity);
        } else {
            goTo(index);
        }
        startAuto();
    };
    const touchStart = e => start(e.touches[0].clientX);
    const touchMove = e => move(e.touches[0].clientX);
    const touchEnd = e => end(e.changedTouches[0].clientX);
    const mouseDown = e => start(e.clientX);
    const mouseMove = e => move(e.clientX);
    const mouseUp = e => end(e.clientX);
    const createDots = () => {
        if (!pagination) return;
        pagination.innerHTML = '';
        slides.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.className = "dot";
            if (i === index) dot.classList.add("active");
            dot.addEventListener("click", () => {
                stopAuto();
                goTo(i);
                startAuto();
            });
            pagination.appendChild(dot);
        });
    };
    const startAuto = () => {
        stopAuto();
        autoplay = setInterval(() => {
            goTo(index + 1);
        }, 5000);
    };
    const stopAuto = () => {
        if (autoplay) clearInterval(autoplay);
    };
    const resize = () => {
        metrics();
        layout();
        goTo(index);
    };
    const interactions = () => {
        container.addEventListener("mouseenter", stopAuto);
        container.addEventListener("mouseleave", startAuto);
        container.addEventListener("touchstart", touchStart, { passive: true });
        container.addEventListener("touchmove", touchMove, { passive: true });
        container.addEventListener("touchend", touchEnd, { passive: true });
        container.addEventListener("mousedown", mouseDown);
        window.addEventListener("mousemove", mouseMove);
        window.addEventListener("mouseup", mouseUp);
    };
    const init = () => {
        container = document.querySelector('.swiper-container-feedback');
        track = document.querySelector('.swiper-wrapper');
        pagination = document.querySelector('.swiper-pagination');
        if (!container || !track) return;
        metrics();
        layout();
        createDots();
        interactions();
        startAuto();
        window.addEventListener("resize", RAFThrottle(resize), { passive: true });
        gsap.utils.toArray('.swiper-slide').forEach(slide => {
            gsap.from(slide, {
                scrollTrigger: {
                    trigger: slide,
                    start: "top 90%"
                },
                y: 30,
                opacity: 0,
                duration: 1,
                ease: "power3.out"
            });
        });
    };
    return { init };
})();
const FeedbackModals = (() => {
    const openModal = () => {
        const modal = document.getElementById("reviewModal");
        gsap.set(modal, { display: "flex" });
        gsap.fromTo(
            "#reviewModal .modal-content",
            { scale: .9, opacity: 0, y: 30 },
            { scale: 1, opacity: 1, y: 0, duration: .6, ease: "expo.out" }
        );
    };
    const closeModal = () => {
        const modal = document.getElementById("reviewModal");
        gsap.to("#reviewModal .modal-content", {
            scale: .9,
            opacity: 0,
            duration: .35,
            ease: "power2.in"
        });
        gsap.to(modal, {
            opacity: 0,
            duration: .4,
            onComplete() {
                modal.style.display = "none";
                gsap.set(modal, { opacity: 1 });
            }
        });
    };
    const openThanks = () => {
        const modal = document.getElementById("thanksModal");
        gsap.set(modal, { display: "flex" });
        gsap.fromTo(
            "#thanksModal .modal-content",
            { scale: .85, opacity: 0 },
            { scale: 1, opacity: 1, duration: .6, ease: "expo.out" }
        );
    };
    const closeThanks = () => {
        const modal = document.getElementById("thanksModal");
        gsap.to(modal, {
            opacity: 0,
            duration: .35,
            onComplete() {
                modal.style.display = "none";
                gsap.set(modal, { opacity: 1 });
            }
        });
    };
    return { openModal, closeModal, openThanks, closeThanks };
})();
const FeedbackForm = (() => {
    const init = () => {
        const form = document.querySelector('.modal-form');
        if (!form) return;
        form.addEventListener("submit", e => {
            e.preventDefault();
            const name = document.getElementById('reviewerName').value;
            const rating = document.getElementById('reviewerRating').value;
            const text = document.getElementById('reviewerText').value;
            const number = "201151532637";
            const msg =
                `*New Royal Review Received*%0A%0A*Name:* ${name}%0A*Rating:* ${rating}/5 STARS%0A*Review:* ${text}`;
            FeedbackModals.closeModal();
            FeedbackModals.openThanks();
            setTimeout(() => {
                window.open(`https://wa.me/${number}?text=${msg}`, "_blank");
                form.reset();
            }, 2000);
        });
    };
    return { init };
})();
document.addEventListener("DOMContentLoaded", () => {
    FeedbackSlider.init();
    FeedbackForm.init();
    window.openModal = FeedbackModals.openModal;
    window.closeModal = FeedbackModals.closeModal;
    window.openThanks = FeedbackModals.openThanks;
    window.closeThanks = FeedbackModals.closeThanks;
});

const GalleryModule = (() => {
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
    const RAFThrottle = (fn) => {
        let raf;
        return (...args) => {
            if (raf) return;
            raf = requestAnimationFrame(() => {
                fn(...args);
                raf = null;
            });
        };
    };
    const updateGridVisibility = () => {
        items.forEach((item, index) => {
            item.classList.toggle(
                'hidden-item',
                index >= initialVisible && !isExpanded
            );
        });
    };
    const setupDesktop = () => {
        stopAutoPlay();
        btn.style.display =
            items.length > initialVisible ? 'block' : 'none';
        updateGridVisibility();
        gsap.set(grid, { clearProps: "all" });
    };
    btn?.addEventListener('click', () => {
        isExpanded = !isExpanded;
        if (isExpanded) {
            items.forEach(item =>
                item.classList.remove('hidden-item')
            );
            btn.textContent = "SHOW LESS";
        } else {
            updateGridVisibility();
            btn.textContent = "SHOW MORE";
            document
                .getElementById('gallery')
                ?.scrollIntoView({ behavior: 'smooth' });
        }
    });
    let step = 0;
    let maxIndex = 0;
    let startX = 0;
    let currentX = 0;
    let lastX = 0;
    let velocity = 0;
    let lastTime = 0;
    let dragging = false;
    const updateDots = () => {
        const dots = gsap.utils.toArray('.gallery-dot');
        dots.forEach((dot, i) =>
            dot.classList.toggle('active', i === currentIndex)
        );
    };
    const goToSlide = (index, momentum = false) => {
        if (index < 0) index = 0;
        if (index > maxIndex) index = maxIndex;
        currentIndex = index;
        gsap.to(grid, {
            x: -currentIndex * step,
            duration: momentum ? 0.9 : 0.7,
            ease: "power3.out",
            onUpdate: updateDots
        });
    };
    const buildDots = () => {
        dotsContainer.innerHTML = '';
        items.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.classList.add('gallery-dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => {
                stopAutoPlay();
                goToSlide(i);
                startAutoPlay();
            });
            dotsContainer.appendChild(dot);
        });
    };
    const setupMobileSlider = () => {
        btn.style.display = 'none';
        items.forEach(item =>
            item.classList.remove('hidden-item')
        );
        const gap = 15;
        step = items[0].offsetWidth + gap;
        maxIndex = items.length - 1;
        buildDots();
        attachTouch();
    };
    const attachTouch = () => {
        if (!mask) return;
        mask.addEventListener('pointerdown', onStart);
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onEnd);
        window.addEventListener('pointercancel', onEnd);
    };
    const onStart = (e) => {
        stopAutoPlay();
        dragging = true;
        startX = e.clientX;
        lastX = startX;
        velocity = 0;
        lastTime = performance.now();
        gsap.killTweensOf(grid);
    };
    const onMove = (e) => {
        if (!dragging) return;
        currentX = e.clientX;
        const delta = currentX - startX;
        const now = performance.now();
        const dt = now - lastTime;
        velocity = (currentX - lastX) / dt;
        lastX = currentX;
        lastTime = now;
        let position = -currentIndex * step + delta;
        const max = 0;
        const min = -maxIndex * step;
        if (position > max)
            position *= 0.35;
        if (position < min)
            position = min + (position - min) * 0.35;
        gsap.set(grid, { x: position });
    };
    const onEnd = () => {
        if (!dragging) return;
        dragging = false;
        const momentum = velocity * 220;
        const currentPos = gsap.getProperty(grid, "x");
        const projected = currentPos + momentum;
        const index = Math.round(-projected / step);
        goToSlide(index, true);
        startAutoPlay();
    };
    const startAutoPlay = () => {
        stopAutoPlay();
        autoPlayTick = setInterval(() => {
            let next = currentIndex + 1;
            if (next > maxIndex)
                next = 0;
            goToSlide(next);
        }, 3200);
    };
    const stopAutoPlay = () => {
        clearInterval(autoPlayTick);
    };
    const initLightbox = () => {
        items.forEach(item => {
            const img = item.querySelector('img');
            img?.addEventListener('click', () => {
                lightboxImg.src = img.src;
                lightbox.style.display = 'flex';
                gsap.fromTo(
                    lightbox,
                    { opacity: 0, scale: 0.96 },
                    {
                        opacity: 1,
                        scale: 1,
                        duration: 0.55,
                        ease: "expo.out"
                    }
                );
            });
        });
        window.closeLightbox = () => {
            gsap.to(lightbox, {
                opacity: 0,
                scale: 0.96,
                duration: 0.45,
                ease: "expo.inOut",
                onComplete: () =>
                    lightbox.style.display = 'none'
            });
        };
    };
    const initGallery = () => {
        if (!grid || items.length === 0) return;
        if (window.innerWidth > 1024)
            setupDesktop();
        else {
            setupMobileSlider();
            startAutoPlay();
        }
    };
    const init = () => {
        initGallery();
        initLightbox();
        window.addEventListener(
            'resize',
            RAFThrottle(initGallery)
        );
    };
    return { init };
})();
document.addEventListener(
    "DOMContentLoaded",
    GalleryModule.init
);



document.querySelectorAll('.faq-toggle').forEach(btn => {
    btn.addEventListener('click', () => toggleFaq(btn));
});
function toggleFaq(element) {
    const parent = element.parentElement;
    document.querySelectorAll('.faq-item').forEach(item => { if (item !== parent) item.classList.remove('active'); });
    parent.classList.toggle('active');
}

const ContactModule = (() => {
    const initForm = () => {
        const form = document.querySelector('.ancient-form-content');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = form.querySelector('[name="name"]')?.value.trim() || "عميل";
            const email = form.querySelector('[type="email"]')?.value.trim() || "";
            const message = form.querySelector('textarea')?.value.trim() || "";
            const waNumber = '201151532637';
            
            const text = `Name: ${name}%0AEmail: ${email}%0AMessage: ${message}`;
            window.open(`https://wa.me/${waNumber}?text=${text}`, '_blank');
            form.reset();
        });
    };

    const initAnimations = () => {
        if (typeof gsap !== "undefined") {
            gsap.fromTo('.luxury-contact-card', { y: 0 }, { y: 10, duration: 3, ease: "sine.inOut", repeat: -1, yoyo: true });
        }
    };

    return { init: () => { initForm(); initAnimations(); } };
})();

const UIModule = (() => {
    const initScrollBtn = () => {
        const scrollBtn = document.getElementById('scrollToTop');
        if (!scrollBtn) return;

        window.addEventListener('scroll', () => {
            // يظهر الزرار بعد سكرول 400 بيكسل
            if (window.scrollY > 400) {
                scrollBtn.classList.add('is-visible');
            } else {
                scrollBtn.classList.remove('is-visible');
            }
        });

        scrollBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    };

    return { init: () => { initScrollBtn(); } };
})();

document.addEventListener("DOMContentLoaded", () => {
    ContactModule.init();
    UIModule.init();
});
