document.addEventListener("DOMContentLoaded", () => {

  /* ================================
     Skip Link Focus Management
  =================================*/
  const skipLink = $(".skip-link");

  if (skipLink) {
    skipLink.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.querySelector("#hero");
      if (target) {
        target.focus();
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  }



  /* ================================
     Theme Toggle (Dark/Light Mode)
  =================================*/
  const themeToggle = $("#themeToggle");
  const htmlElement = document.documentElement;

  // Inicializar o tema
  const initTheme = () => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldUseDark = savedTheme === "dark" || (!savedTheme && prefersDark);

    if (shouldUseDark) {
      htmlElement.classList.remove("light-mode");
      updateThemeIcon();
    } else {
      htmlElement.classList.add("light-mode");
      updateThemeIcon();
    }
  };

  // Atualizar o ícone do botão
  const updateThemeIcon = () => {
    if (themeToggle) {
      const isLightMode = htmlElement.classList.contains("light-mode");
      themeToggle.textContent = isLightMode ? "🌙" : "☀️";
      themeToggle.setAttribute("aria-label", isLightMode ? "Ativar modo escuro" : "Ativar modo claro");
    }
  };

  // Toggle do tema
  const toggleTheme = () => {
    htmlElement.classList.toggle("light-mode");
    const isLightMode = htmlElement.classList.contains("light-mode");
    localStorage.setItem("theme", isLightMode ? "light" : "dark");
    updateThemeIcon();
  };

  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }

  // Inicializar o tema ao carregar
  initTheme();

  // Listener para mudanças de preferência do sistema
  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
      if (!localStorage.getItem("theme")) {
        initTheme();
      }
    });
  }


  /* ================================
     Mobile Menu
  =================================*/
  const hamburger = $("#hamburger");
  const mainNav = $("#mainNav");

  if (hamburger && mainNav) {

    const closeMenu = () => {
      mainNav.classList.remove("open");
      hamburger.classList.remove("open");
      hamburger.setAttribute("aria-expanded", "false");
    };

    const toggleMenu = (e) => {
      const opened = mainNav.classList.toggle("open");
      hamburger.classList.toggle("open");
      hamburger.setAttribute("aria-expanded", opened);
      e.stopPropagation();
    };

    hamburger.addEventListener("click", toggleMenu);

    $$("a", mainNav).forEach(link =>
      link.addEventListener("click", closeMenu)
    );

    document.addEventListener("click", (e) => {
      if (!mainNav.contains(e.target) && !hamburger.contains(e.target)) {
        closeMenu();
      }
    });

  }



  /* ================================
     Character Modal
  =================================*/
  const charModal = $("#charModal");

  if (charModal) {

    const modalTitle = $("#modalTitle");
    const modalText = $("#modalText");
    const closeBtn = $(".close-button", charModal);
    const modalContent = $(".modal-content", charModal);

    const openModal = (name, synopsis) => {
      modalTitle.textContent = name;
      modalText.textContent = synopsis;

      charModal.style.display = "block";
      modalContent.classList.add("open");
    };

    const closeModal = () => {
      charModal.style.display = "none";
      modalContent.classList.remove("open");
    };

    $$(".personagens .card").forEach(card => {
      card.addEventListener("click", () => {

        const name = $("h3", card)?.innerText || "";
        const synopsis = card.dataset.synopsis || "";

        openModal(name, synopsis);

      });
    });

    closeBtn.addEventListener("click", closeModal);

    window.addEventListener("click", (e) => {
      if (e.target === charModal) closeModal();
    });

  }



  /* ================================
     Image Gallery Modal
  =================================*/
  const imgModal = $("#imgModal");

  if (imgModal) {

    const modalImage = $("#modalImage");
    const modalCaption = $("#modalCaption");

    const closeBtn = $(".img-close", imgModal);
    const prevBtn = $(".img-prev", imgModal);
    const nextBtn = $(".img-next", imgModal);

    const imgList = $$(".lugares img");

    let currentIndex = 0;
    let scale = 1;

    const openImage = (index) => {

      const img = imgList[index];
      if (!img) return;

      modalImage.src = img.src;
      modalCaption.textContent =
        img.parentElement.querySelector("h1")?.innerText || "";

      imgModal.style.display = "block";
      $(".img-modal-content", imgModal).classList.add("open");

      currentIndex = index;
      scale = 1;
      modalImage.style.transform = "scale(1)";
    };

    const closeImage = () => {

      imgModal.style.display = "none";
      $(".img-modal-content", imgModal).classList.remove("open");

      modalImage.src = "";

    };

    imgList.forEach((img, i) => {

      img.style.cursor = "zoom-in";

      img.addEventListener("click", () => openImage(i));

    });


    const showPrev = () =>
      openImage((currentIndex - 1 + imgList.length) % imgList.length);

    const showNext = () =>
      openImage((currentIndex + 1) % imgList.length);

    prevBtn.addEventListener("click", showPrev);
    nextBtn.addEventListener("click", showNext);
    closeBtn.addEventListener("click", closeImage);



    /* Keyboard navigation */
    window.addEventListener("keydown", (e) => {

      if (imgModal.style.display !== "block") return;

      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
      if (e.key === "Escape") closeImage();
      if (e.key === "Home") openImage(0);
      if (e.key === "End") openImage(imgList.length - 1);

    });



    /* Click outside modal */
    window.addEventListener("click", (e) => {

      if (e.target === imgModal) closeImage();

    });



    /* ================================
       Pinch to Zoom
    =================================*/
    let initialDist = null;
    let baseScale = 1;

    const getDistance = (touches) => {

      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;

      return Math.hypot(dx, dy);

    };


    modalImage.addEventListener("touchstart", (e) => {

      if (e.touches.length === 2) {

        initialDist = getDistance(e.touches);
        baseScale = scale;

      }

    }, { passive: true });



    modalImage.addEventListener("touchmove", (e) => {

      if (e.touches.length === 2 && initialDist) {

        const dist = getDistance(e.touches);
        const ratio = dist / initialDist;

        scale = Math.max(1, Math.min(4, baseScale * ratio));

        modalImage.style.transform = `scale(${scale})`;

        e.preventDefault();

      }

    }, { passive: false });



    modalImage.addEventListener("touchend", () => {

      initialDist = null;

    });



    /* Double tap zoom */
    let lastTap = 0;

    modalImage.addEventListener("touchend", () => {

      const now = Date.now();

      if (now - lastTap < 300) {

        scale = scale > 1 ? 1 : 2;

        modalImage.style.transform = `scale(${scale})`;

      }

      lastTap = now;

    });

  }



  /* ================================
     Scroll Reveal Animation
  =================================*/
  const revealTargets = $$("section, .card, .lugares .grid > div");

  if ("IntersectionObserver" in window) {

    const observer = new IntersectionObserver((entries) => {

      entries.forEach(entry => {

        if (entry.isIntersecting) {

          entry.target.classList.add("in-view");

        }

      });

    }, { threshold: 0.12 });

    revealTargets.forEach(el => {

      el.classList.add("reveal");
      observer.observe(el);

    });

  } else {

    revealTargets.forEach(el => el.classList.add("in-view"));

  }



  /* ================================
     Background Music
  =================================*/
  const bgMusic = document.getElementById('bgMusic');
  const musicToggle = document.getElementById('musicToggle');

  if (bgMusic && musicToggle) {
    // update icon based on state
    const updateIcon = () => {
      if (bgMusic.paused) {
        musicToggle.textContent = '🔊';
        musicToggle.classList.remove('playing');
      } else {
        musicToggle.textContent = '🔈';
        musicToggle.classList.add('playing');
      }
    };

    musicToggle.addEventListener('click', () => {
      if (bgMusic.paused) {
        bgMusic.play().catch(() => {
          // autoplay may be blocked; ignore
        });
      } else {
        bgMusic.pause();
      }
      updateIcon();
    });

    // make sure icon matches initial state
    updateIcon();

    // pause when page hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        bgMusic.pause();
        updateIcon();
      }
    });
  }

  /* ================================
     Hero Animation
  =================================*/
  const heroContent = $(".hero-content");

  if (heroContent) {

    heroContent.classList.add("reveal");

    setTimeout(() => {

      heroContent.classList.add("in-view");

    }, 120);

  }

});