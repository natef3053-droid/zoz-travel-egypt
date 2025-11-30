    document.addEventListener('DOMContentLoaded', () => {
    const videoOverlay = document.getElementById('video-overlay');
    const introVideo = document.getElementById('intro-video');
    const skipButton = document.getElementById('skip-button');
    const header = document.querySelector('.main-header');
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    const hamburgerIcon = document.getElementById('hamburgerIcon');
    const navOverlay = document.getElementById('navOverlay');
    const closeNavBtn = document.getElementById('closeNav');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav__link');
    const contactForm = document.getElementById('contactForm');
    const toggleButton = document.getElementById('toggle-reviews');
    const hiddenCards = document.querySelectorAll('.review-card--hidden');
    const faqItems = document.querySelectorAll('.faq-item');
    const gallerySwiper = document.querySelector('.gallery-slider');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeLightboxBtn = document.querySelector('.close');

    const videoSources = [
        { size: 400, src: 'Long pharaonic gate.mp4' },
        { size: 600, src: 'Long pharaonic gate.mp4' },
        { size: 900, src: 'Wide Pharaonic gate.mp4' },
        { size: 1200, src: 'Wide Pharaonic gate.mp4' }
    ];

    let currentVideoSrc = '';
    const setVideoSource = () => {
        let newVideoSrc = videoSources[videoSources.length - 1].src;
        for (const video of videoSources) {
            if (window.innerWidth <= video.size) {
                newVideoSrc = video.src;
                break;
            }
        }

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

    const toggleNavModal = () => {
        navOverlay.classList.toggle('active');
    };

    const closeNavModal = () => {
        navOverlay.classList.remove('active');
    };

    const closeLightbox = () => {
        lightbox.style.display = 'none';
        lightboxImg.src = '';
    };

    const handleContactForm = (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const subject = document.querySelector('input[name="subject"]').value;
        const message = document.getElementById('message').value;
        const formSuccess = document.getElementById('formSuccess');

        if (!name || !message) {
            document.getElementById('formError').textContent = 'Please fill out all required fields: Name and Message.';
            return;
        }

        let whatsappMessage = `Hello, I would like to contact you about a new inquiry.\n\n`;
        whatsappMessage += `Full Name: ${name}\n`;
        whatsappMessage += `Email: ${email || 'N/A'}\n`;
        whatsappMessage += `Subject: ${subject || 'N/A'}\n`;
        whatsappMessage += `Message: ${message}`;

        const encodedMessage = encodeURIComponent(whatsappMessage);
        const phoneNumber = '+201151532637';
        const whatsappLink = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`;

        formSuccess.textContent = 'Redirecting to WhatsApp...';
        document.getElementById('formError').textContent = '';

        window.open(whatsappLink, '_blank');
    };

    const handleReviewsToggle = () => {
        const allVisible = hiddenCards.length > 0 && !hiddenCards[0].classList.contains('review-card--hidden');

        hiddenCards.forEach(card => {
            card.classList.toggle('review-card--hidden');
        });

        if (allVisible) {
            toggleButton.textContent = 'View All Reviews';
        } else {
            toggleButton.textContent = 'Hide Extra Reviews'; 
        }
    };

    // الدالة المُعدَّلة لقسم الأسئلة الشائعة (العودة للمنطق الأساسي)
    const handleFaqAccordion = (item) => {
        const isActive = item.classList.contains('active');
        // إزالة الكلاس النشط من جميع العناصر أولاً
        faqItems.forEach(faq => faq.classList.remove('active'));
        // إضافة الكلاس النشط للعنصر الذي تم النقر عليه فقط
        if (!isActive) {
          item.classList.add('active');
        }
    };

    const lazyLoadImages = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                observer.unobserve(img);
            }
        });
    };
    
    const init = () => {
        setVideoSource();
        introVideo.play().catch(error => {
            console.error("Video play failed, hiding video overlay:", error);
            hideVideo();
        });
        
        AOS.init({ duration: 800, once: true });
        
        let swiperInstance = null;
        const swiperParams = {
            slidesPerView: 1,
            slidesPerGroup: 1,
            centeredSlides: false,
            spaceBetween: 20,
            loop: true,
            autoplay: {
                delay: 3000,
                disableOnInteraction: false
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            breakpoints: {
                992: {
                    enabled: false,
                    slidesPerView: 'auto',
                    spaceBetween: 0
                }
            }
        };
        
        if (gallerySwiper) {
            if (typeof Swiper !== 'undefined') {
                 swiperInstance = new Swiper(gallerySwiper, swiperParams);
            }
        }
        
        const observer = new IntersectionObserver(lazyLoadImages, { rootMargin: '0px 0px 200px 0px' });
        document.querySelectorAll('img[data-src]').forEach(img => observer.observe(img));
    };
    
    init();

    introVideo.addEventListener('ended', hideVideo);
    skipButton.addEventListener('click', hideVideo);
    window.addEventListener('resize', setVideoSource);

    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
        scrollTopBtn.classList.toggle('visible', window.scrollY > 300);
    });

    if (hamburgerIcon) hamburgerIcon.addEventListener('click', toggleNavModal);
    if (closeNavBtn) closeNavBtn.addEventListener('click', closeNavModal);
    if (navOverlay) {
        document.addEventListener('click', (event) => {
            const isClickInsideNav = navOverlay.contains(event.target);
            const isClickOnHamburger = hamburgerIcon.contains(event.target);
            if (!isClickInsideNav && !isClickOnHamburger && navOverlay.classList.contains('active')) {
                closeNavModal();
            }
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') closeNavModal();
        });
    }

    mobileNavLinks.forEach(link => link.addEventListener('click', closeNavModal));
    if (contactForm) contactForm.addEventListener('submit', handleContactForm);
    
    if (toggleButton) toggleButton.addEventListener('click', handleReviewsToggle);
    
    faqItems.forEach(item => {
        item.querySelector('.faq-question').addEventListener('click', () => handleFaqAccordion(item));
    });

    const galleryItems = document.querySelectorAll('.gallery-item img');
    if (galleryItems) {
        galleryItems.forEach(item => {
            item.addEventListener('click', (e) => {
                if(lightbox && lightboxImg) {
                    lightbox.style.display = 'flex';
                    lightboxImg.src = e.target.src;
                    lightboxImg.alt = e.target.alt;
                }
            });
        });
    }
    
    if (closeLightboxBtn) closeLightboxBtn.addEventListener('click', closeLightbox);
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.style.display === 'flex') closeLightbox();
        });
    }

    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});





















