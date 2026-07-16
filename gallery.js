(function () {
  "use strict";

  var MEDIA_BASE = "/taylor-birthday-countdown/media/";

  var items = [
    {
      type: "image",
      src: MEDIA_BASE + "img-9990.png",
      alt: "Friends gathered for a birthday dinner",
      width: 1024,
      height: 768,
    },
    {
      type: "image",
      src: MEDIA_BASE + "dscn0311.png",
      alt: "Group photo at an outdoor patio",
      width: 1024,
      height: 768,
    },
    {
      type: "image",
      src: MEDIA_BASE + "img-9535.png",
      alt: "Friends together at a lounge",
      width: 768,
      height: 1024,
    },
    {
      type: "image",
      src: MEDIA_BASE + "outdoor-lunch.png",
      alt: "Group lunch together at an outdoor picnic table",
      width: 768,
      height: 1024,
    },
    {
      type: "image",
      src: MEDIA_BASE + "patio-selfie.png",
      alt: "Group selfie on an outdoor patio",
      width: 1024,
      height: 768,
    },
    {
      type: "image",
      src: MEDIA_BASE + "bowlero.png",
      alt: "Friends posing outside Bowlero",
      width: 768,
      height: 1024,
    },
    {
      type: "image",
      src: MEDIA_BASE + "img-1866.jpg",
      alt: "Group celebrating together outdoors",
      width: 4032,
      height: 3024,
    },
    {
      type: "image",
      src: MEDIA_BASE + "restaurant-table.png",
      alt: "Friends gathered around a restaurant table",
      width: 1024,
      height: 768,
    },
    {
      type: "video",
      src: MEDIA_BASE + "img-9481.mov",
      alt: "Birthday celebration video",
    },
  ];

  var slideshowEl = document.getElementById("slideshow");
  var galleryEl = document.getElementById("gallery-grid");
  var lightboxEl = document.getElementById("lightbox");

  if (!slideshowEl || !galleryEl || !items.length) {
    return;
  }

  if (window.__GALLERY_READY__) {
    return;
  }
  window.__GALLERY_READY__ = true;

  slideshowEl.innerHTML = "";
  galleryEl.innerHTML = "";

  var currentIndex = 0;
  var timer = null;
  var IMAGE_SLIDE_MS = 5000;
  var VIDEO_SLIDE_MS = 7000;

  function isPortrait(item) {
    return item.height > item.width;
  }

  function slideDuration(index) {
    return items[index] && items[index].type === "video" ? VIDEO_SLIDE_MS : IMAGE_SLIDE_MS;
  }

  function getSlides() {
    return slideshowEl.querySelectorAll(".slideshow__slide");
  }

  function getDots() {
    return slideshowEl.querySelectorAll(".slideshow__dot");
  }

  function updateSlideshowLayout(index) {
    var item = items[index];
    if (!item) return;

    var portrait = item.width > 0 && item.height > 0 ? isPortrait(item) : false;
    slideshowEl.classList.toggle("slideshow--portrait", portrait);
    slideshowEl.classList.toggle("slideshow--landscape", !portrait);
  }

  function createMediaElement(item, className, options) {
    options = options || {};

    if (item.type === "video") {
      var video = document.createElement("video");
      video.className = className;
      video.src = item.src;
      video.muted = true;
      video.playsInline = true;
      video.loop = true;
      video.preload = options.preload || "metadata";
      video.setAttribute("aria-label", item.alt || "Video");
      return video;
    }

    var img = document.createElement("img");
    img.className = className;
    img.src = item.src;
    img.alt = item.alt || "";
    img.loading = options.loading || "lazy";
    img.decoding = "async";
    return img;
  }

  function buildSlideshow() {
    var track = document.createElement("div");
    track.className = "slideshow__track";

    items.forEach(function (item, index) {
      var slide = document.createElement("div");
      slide.className = "slideshow__slide" + (index === 0 ? " is-active" : "");
      slide.appendChild(createMediaElement(item, "slideshow__media", { loading: "eager" }));
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
    var slide = getSlides()[currentIndex];
    if (!slide) return;
    var video = slide.querySelector("video");
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

    updateSlideshowLayout(currentIndex);
    playActiveVideo();
    scheduleNext();
  }

  function scheduleNext() {
    if (timer) clearTimeout(timer);
    timer = setTimeout(function () {
      goToSlide(currentIndex + 1);
    }, slideDuration(currentIndex));
  }

  function buildGallery() {
    items.forEach(function (item, index) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "gallery__item";
      button.setAttribute("aria-label", "View " + (item.alt || "media"));
      button.dataset.index = String(index);

      if (item.width > 0 && item.height > 0) {
        button.style.aspectRatio = item.width + " / " + item.height;
        button.dataset.orientation = isPortrait(item) ? "portrait" : "landscape";
      }

      if (item.type === "video") {
        var video = createMediaElement(item, "gallery__thumb", { preload: "metadata" });
        video.controls = false;
        video.removeAttribute("loop");
        button.appendChild(video);
        var badge = document.createElement("span");
        badge.className = "gallery__badge";
        badge.textContent = "Video";
        button.appendChild(badge);
      } else {
        button.appendChild(createMediaElement(item, "gallery__thumb", { loading: "eager" }));
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

    var content = createMediaElement(item, "lightbox__media", { loading: "eager" });
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
    playActiveVideo();
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeLightbox();
  });

  buildSlideshow();
  buildGallery();
  updateSlideshowLayout(0);
  playActiveVideo();
  scheduleNext();

  window.addEventListener("pageshow", function (event) {
    if (!event.persisted) return;
    if (!galleryEl.children.length || !slideshowEl.querySelector(".slideshow__slide")) {
      window.location.reload();
    }
  });
})();
