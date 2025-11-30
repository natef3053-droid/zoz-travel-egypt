
document.addEventListener('DOMContentLoaded', () => {
  const initAOS = () => {
    AOS.init({
      duration: 800,
      once: true
    });
  };

  const handleFaqAccordion = () => {
    const faqItems = document.querySelectorAll('.faq-question');
    faqItems.forEach(item => {
      item.addEventListener('click', () => {
        const answer = item.nextElementSibling;
        const activeQuestion = document.querySelector('.faq-question.active');

        if (activeQuestion && activeQuestion !== item) {
          activeQuestion.classList.remove('active');
          activeQuestion.nextElementSibling.style.maxHeight = '0';
        }

        item.classList.toggle('active');
        if (item.classList.contains('active')) {
          answer.style.maxHeight = answer.scrollHeight + 'px';
        } else {
          answer.style.maxHeight = '0';
        }
      });
    });
  };

  const initGallerySlider = () => {
    const gallerySlider = document.querySelector('.gallery-slider');
    const galleryDotsContainer = document.querySelector('.gallery-dots');
    const gallerySlides = document.querySelectorAll('.gallery-slide');

    if (!gallerySlider || !galleryDotsContainer || gallerySlides.length === 0) return;

    let slideIndex = 0;
    let autoPlayInterval;

    const createDots = () => {
      gallerySlides.forEach((_, index) => {
        const dot = document.createElement('span');
        dot.classList.add('gallery-dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => {
          goToSlide(index);
        });
        galleryDotsContainer.appendChild(dot);
      });
    };

    const updateDots = () => {
      const dots = document.querySelectorAll('.gallery-dot');
      dots.forEach(dot => dot.classList.remove('active'));
      if (dots[slideIndex]) {
        dots[slideIndex].classList.add('active');
      }
    };

    const goToSlide = (index) => {
      slideIndex = index;
      gallerySlider.style.transform = `translateX(${-slideIndex * 100}%)`;
      updateDots();
    };

    const startAutoPlay = () => {
      stopAutoPlay();
      autoPlayInterval = setInterval(() => {
        slideIndex = (slideIndex + 1) % gallerySlides.length;
        goToSlide(slideIndex);
      }, 3000);
    };

    const stopAutoPlay = () => {
      clearInterval(autoPlayInterval);
    };

    const handleModal = () => {
      const modal = document.getElementById('image-modal');
      const modalImage = document.getElementById('modal-image');
      const closeModal = document.querySelector('.close-modal');

      gallerySlides.forEach(slide => {
        slide.addEventListener('click', () => {
          if (modal && modalImage) {
            modal.style.display = 'flex';
            modalImage.src = slide.src;
          }
        });
      });

      if (closeModal) {
        closeModal.addEventListener('click', () => {
          modal.style.display = 'none';
        });
      }

      window.addEventListener('click', (event) => {
        if (event.target === modal) {
          modal.style.display = 'none';
        }
      });
    };

    createDots();
    startAutoPlay();
    handleModal();

    gallerySlider.addEventListener('mouseenter', stopAutoPlay);
    gallerySlider.addEventListener('mouseleave', startAutoPlay);
  };

  const handleScrollToTop = () => {
    const scrollToTopButton = document.getElementById('scroll-to-top');
    if (!scrollToTopButton) return;

    window.addEventListener('scroll', () => {
      scrollToTopButton.classList.toggle('show', window.scrollY > 300);
    });

    scrollToTopButton.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  };

  const handleBookingForm = () => {
    const bookingForm = document.querySelector('.booking-form');
    if (!bookingForm) return;

    bookingForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const formInputs = bookingForm.querySelectorAll('input[required]');
      let isValid = true;
      formInputs.forEach(input => {
        if (input.value.trim() === '') {
          input.setCustomValidity("Please fill out this field.");
          isValid = false;
        } else {
          input.setCustomValidity("");
        }
      });

      if (isValid) {
        const formData = new FormData(bookingForm);
        const data = Object.fromEntries(formData.entries());

        const pageTitle = document.title;
        const tripName = pageTitle.replace(/ - رحلة/i, '').trim();

        const whatsappMessage =
          `New Tour Booking! ✈️\n\n` +
          `Trip Name: ${tripName}\n\n` +
          `---\n\n` +
          `Full Name: ${data.fullName}\n` +
          `Email: ${data.email}\n` +
          `Phone Number: ${data.phone}\n` +
          `Number of Guests: ${data.guests}\n` +
          `Preferred Date: ${data.date}\n` +
          `Preferred Pickup Time: ${data.pickupTime || 'Not specified'}\n` +
          `Hotel Name: ${data.hotelName || 'Not specified'}\n\n` +
          `---\n\n` +
          `Special Requests / Notes:\n` +
          `${data.specialRequests || 'N/A'}`;

        const phoneNumber = '201151532637';
        const whatsappLink = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(whatsappMessage)}`;
        window.open(whatsappLink, '_blank');
      } else {
        bookingForm.reportValidity();
      }
    });
  };

  const initLazyLoading = () => {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          obs.unobserve(img);
        }
      });
    }, {
      rootMargin: '0px 0px 100px 0px'
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      observer.observe(img);
    });
  };

  initAOS();
  handleFaqAccordion();
  initGallerySlider();
  handleScrollToTop();
  handleBookingForm();
  initLazyLoading();
});
