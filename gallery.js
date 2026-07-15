(function () {
  "use strict";

  var items = window.MEDIA_ITEMS || [];
  if (!items.length) return;

  var slideshowEl = document.getElementById("slideshow");
  var galleryEl = document.getElementById("gallery-grid");
  var lightboxEl = document.getElementById("lightbox");
  if (!slideshowEl || !galleryEl) return;

  var currentIndex = 0;
  var timer = null;
  var SLIDE_MS = 5000;

  function createMediaElement(item, className) {
    if (item.type === "video") {
      var video = document.createElement("video");
      video.className = className;
      video.src = item.src;
      video.muted = true;
      video.playsInline = true;
      video.loop = true;
      video.setAttribute("aria-label", item.alt || "Video");
      return video;
    }

    var img = document.createElement("img");
    img.className = className;
    img.src = item.src;
    img.alt = item.alt || "";
    img.loading = "lazy";
    return img;
  }

  function buildSlideshow() {
    var track = document.createElement("div");
    track.className = "slideshow__track";
    track.id = "slideshow-track";

    items.forEach(function (item, index) {
      var slide = document.createElement("div");
      slide.className = "slideshow__slide" + (index === 0 ? " is-active" : "");
      slide.appendChild(createMediaElement(item, "slideshow__media"));
      track.appendChild(slide);
    });

    var prev = document.createElement("button");
    prev.type = "button";
    prev.className = "slideshow__nav slideshow__nav--prev";
    prev.setAttribute("aria-label", "Previous slide");
    prev.textContent = "‹";

    var next = document.createElement("button");
    next.type = "button";
    next.className = "slideshow__nav slideshow__nav--next";
    next.setAttribute("aria-label", "Next slide");
    next.textContent = "›";

    var dots = document.createElement("div");
    dots.className = "slideshow__dots";
    dots.id = "slideshow-dots";

    items.forEach(function (_, index) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "slideshow__dot" + (index === 0 ? " is-active" : "");
      dot.setAttribute("aria-label", "Go to slide " + (index + 1));
      dot.dataset.index = String(index);
      dots.appendChild(dot);
    });

    slideshowEl.appendChild(track);
    slideshowEl.appendChild(prev);
    slideshowEl.appendChild(next);
    slideshowEl.appendChild(dots);

    prev.addEventListener("click", function () {
      goToSlide(currentIndex - 1);
    });
    next.addEventListener("click", function () {
      goToSlide(currentIndex + 1);
    });
    dots.addEventListener("click", function (e) {
      var btn = e.target.closest(".slideshow__dot");
      if (!btn) return;
      goToSlide(Number(btn.dataset.index));
    });
  }

  function getSlides() {
    return slideshowEl.querySelectorAll(".slideshow__slide");
  }

  function getDots() {
    return slideshowEl.querySelectorAll(".slideshow__dot");
  }

  function pauseAllVideos() {
    slideshowEl.querySelectorAll("video").forEach(function (video) {
      video.pause();
    });
    if (lightboxEl) {
      lightboxEl.querySelectorAll("video").forEach(function (video) {
        video.pause();
      });
    }
  }

  function playActiveVideo() {
    var active = getSlides()[currentIndex];
    if (!active) return;
    var video = active.querySelector("video");
    if (video) {
      video.play().catch(function () {});
    }
  }

  function goToSlide(index) {
    var slides = getSlides();
    var dots = getDots();
    if (!slides.length) return;

    pauseAllVideos();
    currentIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, i) {
      slide.classList.toggle("is-active", i === currentIndex);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === currentIndex);
    });

    playActiveVideo();
    restartTimer();
  }

  function restartTimer() {
    if (timer) clearInterval(timer);
    var activeItem = items[currentIndex];
    if (activeItem && activeItem.type === "video") return;

    timer = setInterval(function () {
      goToSlide(currentIndex + 1);
    }, SLIDE_MS);
  }

  function buildGallery() {
    items.forEach(function (item, index) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "gallery__item";
      button.setAttribute("aria-label", "View " + (item.alt || "media"));
      button.dataset.index = String(index);

      if (item.type === "video") {
        var video = createMediaElement(item, "gallery__thumb");
        video.controls = false;
        video.removeAttribute("loop");
        button.appendChild(video);
        var badge = document.createElement("span");
        badge.className = "gallery__badge";
        badge.textContent = "Video";
        button.appendChild(badge);
      } else {
        button.appendChild(createMediaElement(item, "gallery__thumb"));
      }

      galleryEl.appendChild(button);
    });

    galleryEl.addEventListener("click", function (e) {
      var btn = e.target.closest(".gallery__item");
      if (!btn || !lightboxEl) return;
      openLightbox(Number(btn.dataset.index));
    });
  }

  function openLightbox(index) {
    var item = items[index];
    if (!item) return;

    lightboxEl.innerHTML = "";
    lightboxEl.hidden = false;
    document.body.classList.add("lightbox-open");

    var content = createMediaElement(item, "lightbox__media");
    if (item.type === "video") {
      content.controls = true;
      content.muted = false;
      content.loop = false;
    }

    var close = document.createElement("button");
    close.type = "button";
    close.className = "lightbox__close";
    close.setAttribute("aria-label", "Close");
    close.textContent = "×";

    close.addEventListener("click", closeLightbox);
    lightboxEl.addEventListener("click", function (e) {
      if (e.target === lightboxEl) closeLightbox();
    });

    lightboxEl.appendChild(content);
    lightboxEl.appendChild(close);

    if (item.type === "video") {
      content.play().catch(function () {});
    }
  }

  function closeLightbox() {
    if (!lightboxEl) return;
    pauseAllVideos();
    lightboxEl.hidden = true;
    lightboxEl.innerHTML = "";
    document.body.classList.remove("lightbox-open");
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeLightbox();
  });

  buildSlideshow();
  buildGallery();
  playActiveVideo();
  restartTimer();
})();
