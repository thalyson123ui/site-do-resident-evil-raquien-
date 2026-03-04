document.addEventListener('DOMContentLoaded', () => {
  /* ====== Hamburger / Mobile Nav ====== */
  const hamburger = document.getElementById('hamburger');
  const mainNav = document.getElementById('mainNav');
  if (hamburger && mainNav) {
    hamburger.addEventListener('click', (e) => {
      const opened = mainNav.classList.toggle('open');
      hamburger.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', opened);
      e.stopPropagation();
    });

    mainNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      mainNav.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }));

    document.addEventListener('click', (e) => {
      if (!mainNav.contains(e.target) && !hamburger.contains(e.target)) {
        mainNav.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }


  /* ====== Character synopsis modal ====== */
  const charModal = document.getElementById('charModal');
  if (charModal) {
    const titleEl = document.getElementById('modalTitle');
    const textEl = document.getElementById('modalText');
    const closeBtn = charModal.querySelector('.close-button');

    document.querySelectorAll('.personagens .card').forEach(card => {
      card.addEventListener('click', () => {
        const name = card.querySelector('h3')?.innerText || '';
        const synopsis = card.getAttribute('data-synopsis') || '';
        titleEl.textContent = name;
        textEl.textContent = synopsis;
        charModal.style.display = 'block';
        charModal.querySelector('.modal-content').classList.add('open');
      });
    });

    function closeCharModal() {
      charModal.style.display = 'none';
      charModal.querySelector('.modal-content').classList.remove('open');
    }

    closeBtn.addEventListener('click', closeCharModal);
    window.addEventListener('click', (event) => { if (event.target === charModal) closeCharModal(); });
  }

  /* ====== Image modal for lugares (gallery + pinch-to-zoom + keyboard) ====== */
  const imgModal = document.getElementById('imgModal');
  if (imgModal) {
    const modalImage = document.getElementById('modalImage');
    const modalCaption = document.getElementById('modalCaption');
    const imgClose = imgModal.querySelector('.img-close');
    const prevBtn = imgModal.querySelector('.img-prev');
    const nextBtn = imgModal.querySelector('.img-next');
    const imgList = Array.from(document.querySelectorAll('.lugares img'));

    let currentIndex = 0;
    let scale = 1;
    let initialDist = null;
    let baseScale = 1;

    function openImage(index) {
      const img = imgList[index];
      if (!img) return;
      modalImage.src = img.src;
      modalCaption.textContent = img.parentElement.querySelector('h1')?.innerText || '';
      imgModal.style.display = 'block';
      imgModal.querySelector('.img-modal-content').classList.add('open');
      currentIndex = index;
      scale = 1;
      modalImage.style.transform = 'scale(1)';
    }

    function closeImage() {
      imgModal.style.display = 'none';
      imgModal.querySelector('.img-modal-content').classList.remove('open');
      modalImage.src = '';
    }

    imgList.forEach((img, i) => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => openImage(i));
    });

    imgClose.addEventListener('click', closeImage);
    prevBtn.addEventListener('click', () => openImage((currentIndex - 1 + imgList.length) % imgList.length));
    nextBtn.addEventListener('click', () => openImage((currentIndex + 1) % imgList.length));

    window.addEventListener('keydown', (e) => {
      if (imgModal.style.display === 'block') {
        if (e.key === 'ArrowLeft') prevBtn.click();
        if (e.key === 'ArrowRight') nextBtn.click();
        if (e.key === 'Escape') closeImage();
      }
    });

    window.addEventListener('click', (event) => { if (event.target === imgModal) closeImage(); });

    /* Pinch to zoom handlers */
    function getDistance(touches) {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.hypot(dx, dy);
    }

    modalImage.addEventListener('touchstart', (ev) => {
      if (ev.touches.length === 2) {
        initialDist = getDistance(ev.touches);
        baseScale = scale || 1;
      }
    }, {passive: true});

    modalImage.addEventListener('touchmove', (ev) => {
      if (ev.touches.length === 2 && initialDist) {
        const dist = getDistance(ev.touches);
        const ratio = dist / initialDist;
        scale = Math.max(1, Math.min(4, baseScale * ratio));
        modalImage.style.transform = `scale(${scale})`;
        ev.preventDefault();
      }
    }, {passive: false});

    modalImage.addEventListener('touchend', (ev) => { if (ev.touches.length < 2) initialDist = null; });

    /* Double-tap to toggle zoom */
    let lastTap = 0;
    modalImage.addEventListener('touchend', (ev) => {
      const now = Date.now();
      if (now - lastTap < 300) {
        scale = scale > 1 ? 1 : 2;
        modalImage.style.transform = `scale(${scale})`;
      }
      lastTap = now;
    });
  }

  /* ====== Reveal on scroll (IntersectionObserver) ====== */
  const revealTargets = document.querySelectorAll('section, .card, .lugares .grid > div');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          entry.target.classList.add('reveal');
        }
      });
    }, { threshold: 0.12 });
    revealTargets.forEach(t => {
      // add initial hidden state
      if (!t.classList.contains('reveal')) t.classList.add('reveal');
      io.observe(t);
    });
  } else {
    // fallback: show all
    revealTargets.forEach(t => t.classList.add('in-view'));
  }

  /* Small flourish: pulse hero content briefly on load */
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    heroContent.classList.add('reveal');
    setTimeout(() => heroContent.classList.add('in-view'), 120);
  }
});
