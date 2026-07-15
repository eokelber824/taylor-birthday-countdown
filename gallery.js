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
  var IMAGE_SLIDE_MS = 5000;
  var VIDEO_SLIDE_MS = 7000;
  var SLIDESHOW_MAX_WIDTH = 960;
  var SLIDESHOW_DESKTOP_BREAKPOINT = 768;
  var SLIDESHOW_MOBILE_MAX_HEIGHT_RATIO = 0.38;
  var SLIDESHOW_DESKTOP_LANDSCAPE_MAX_HEIGHT_RATIO = 0.55;
  var SLIDESHOW_DESKTOP_PORTRAIT_MAX_HEIGHT_RATIO = 0.58;

  function slideDuration(index) {
    var item = items[index];
    return item && item.type === "video" ? VIDEO_SLIDE_MS : IMAGE_SLIDE_MS;
  }

  function readElementDimensions(el) {
    if (!el) return null;
    if (el.tagName === "IMG" && el.naturalWidth > 0) {
      return { width: el.naturalWidth, height: el.naturalHeight };
    }
    if (el.tagName === "VIDEO" && el.videoWidth > 0) {
      return { width: el.videoWidth, height: el.videoHeight };
    }
    return null;
  }

  function getItemDimensions(item, el) {
    if (item.width > 0 && item.height > 0) {
      return { width: item.width, height: item.height };
    }
    var fromEl = readElementDimensions(el);
    if (fromEl) {
      item.width = fromEl.width;
      item.height = fromEl.height;
      return fromEl;
    }
    return null;
  }

  function isPortrait(dims) {
    return dims.height > dims.width;
  }

  function isDesktopViewport() {
    return window.innerWidth >= SLIDESHOW_DESKTOP_BREAKPOINT;
  }

  function getSlideshowLimits(natWidth, natHeight) {
    var desktop = isDesktopViewport();
    var portrait = isPortrait({ width: natWidth, height: natHeight });
    var sidePadding = desktop ? 48 : 32;
    var viewportW = Math.max(window.innerWidth || 0, 320);
    var viewportH = Math.max(window.innerHeight || 0, 480);
    var maxW = Math.max(240, Math.min(SLIDESHOW_MAX_WIDTH, viewportW - sidePadding));
    var heightRatio = desktop
      ? portrait
        ? SLIDESHOW_DESKTOP_PORTRAIT_MAX_HEIGHT_RATIO
        : SLIDESHOW_DESKTOP_LANDSCAPE_MAX_HEIGHT_RATIO
      : SLIDESHOW_MOBILE_MAX_HEIGHT_RATIO;
    var maxH = Math.max(180, Math.round(viewportH * heightRatio));

    return {
      maxW: maxW,
      maxH: maxH,
      desktop: desktop,
      portrait: portrait,
    };
  }

  function computeDisplaySize(natWidth, natHeight) {
    if (!natWidth || !natHeight) {
      return { width: 320, height: 240 };
    }

    var limits = getSlideshowLimits(natWidth, natHeight);
    var scale;

    if (limits.desktop && !limits.portrait) {
      scale = limits.maxW / natWidth;
      if (natHeight * scale > limits.maxH) {
        scale = limits.maxH / natHeight;
      }
    } else {
      scale = Math.min(limits.maxW / natWidth, limits.maxH / natHeight);
    }

    if (!isFinite(scale) || scale <= 0) {
      scale = 0.3;
    }

    return {
      width: Math.max(240, Math.round(natWidth * scale)),
      height: Math.max(180, Math.round(natHeight * scale)),
    };
  }

  function updateSlideshowLayout(index) {
    var item = items[index];
    if (!item) return;

    var slide = getSlides()[index];
    var media = slide ? slide.querySelector(".slideshow__media") : null;
    var dims = getItemDimensions(item, media);
    if (!dims) {
      dims = { width: 4, height: 3 };
    }

    var size = computeDisplaySize(dims.width, dims.height);
    slideshowEl.style.setProperty("--slideshow-aspect", dims.width + " / " + dims.height);
    slideshowEl.style.width = size.width + "px";
    slideshowEl.style.height = size.height + "px";
    slideshowEl.dataset.orientation = isPortrait(dims) ? "portrait" : "landscape";
    slideshowEl.dataset.viewport = isDesktopViewport() ? "desktop" : "mobile";
  }

  function applyIntrinsicSize(el, item) {
    var dims = getItemDimensions(item, el);
    if (!dims) return;

    el.width = dims.width;
    el.height = dims.height;
    el.setAttribute("width", String(dims.width));
    el.setAttribute("height", String(dims.height));
  }

  function applyGalleryAspect(button, item) {
    var dims = getItemDimensions(item);
    if (!dims) return;
    button.style.aspectRatio = dims.width + " / " + dims.height;
    button.dataset.orientation = isPortrait(dims) ? "portrait" : "landscape";
  }

  function onMediaReady(item, el, index) {
    applyIntrinsicSize(el, item);
    applyGalleryAspect(
      galleryEl.querySelector('.gallery__item[data-index="' + index + '"]'),
      item
    );
    if (index === currentIndex) {
      updateSlideshowLayout(index);
    }
  }

  function bindMediaReady(item, el, index) {
    if (item.type === "video") {
      el.addEventListener("loadedmetadata", function () {
        onMediaReady(item, el, index);
      });
      if (el.readyState >= 1) onMediaReady(item, el, index);
      return;
    }

    el.addEventListener("load", function () {
      onMediaReady(item, el, index);
    });
    if (el.complete) onMediaReady(item, el, index);
  }

  function createMediaElement(item, className) {
    if (item.type === "video") {
      var video = document.createElement("video");
      video.className = className;
      video.src = item.src;
      video.muted = true;
      video.playsInline = true;
      video.loop = true;
      video.preload = "metadata";
      video.setAttribute("aria-label", item.alt || "Video");
      return video;
    }

    var img = document.createElement("img");
    img.className = className;
    img.src = item.src;
    img.alt = item.alt || "";
    img.loading = indexOfItem(item) === 0 ? "eager" : "lazy";
    img.decoding = "async";
    return img;
  }

  function indexOfItem(item) {
    return items.indexOf(item);
  }

  function buildSlideshow() {
    var track = document.createElement("div");
    track.className = "slideshow__track";
    track.id = "slideshow-track";

    items.forEach(function (item, index) {
      var slide = document.createElement("div");
      slide.className = "slideshow__slide" + (index === 0 ? " is-active" : "");
      var media = createMediaElement(item, "slideshow__media");
      bindMediaReady(item, media, index);
      slide.appendChild(media);
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

    window.addEventListener("resize", function () {
      window.requestAnimationFrame(function () {
        updateSlideshowLayout(currentIndex);
      });
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
      applyGalleryAspect(button, item);

      if (item.type === "video") {
        var video = createMediaElement(item, "gallery__thumb");
        video.controls = false;
        video.removeAttribute("loop");
        bindMediaReady(item, video, index);
        button.appendChild(video);
        var badge = document.createElement("span");
        badge.className = "gallery__badge";
        badge.textContent = "Video";
        button.appendChild(badge);
      } else {
        var thumb = createMediaElement(item, "gallery__thumb");
        bindMediaReady(item, thumb, index);
        button.appendChild(thumb);
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
    applyIntrinsicSize(content, item);
    bindMediaReady(item, content, index);

    if (item.type === "video") {
      content.controls = true;
      content.muted = false;
      content.loop = false;
    }

    var dims = getItemDimensions(item, content);
    if (dims) {
      lightboxEl.dataset.orientation = isPortrait(dims) ? "portrait" : "landscape";
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
    lightboxEl.removeAttribute("data-orientation");
    document.body.classList.remove("lightbox-open");
    playActiveVideo();
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeLightbox();
  });

  buildSlideshow();
  buildGallery();
  updateSlideshowLayout(0);
  window.requestAnimationFrame(function () {
    updateSlideshowLayout(currentIndex);
  });
  window.addEventListener("load", function () {
    updateSlideshowLayout(currentIndex);
  });
  playActiveVideo();
  scheduleNext();
})();
