(function () {
  "use strict";

  var items = window.MEDIA_ITEMS || [];
  if (!items.length) return;

  var slideshowEl = document.getElementById("slideshow");
  var galleryEl = document.getElementById("gallery-grid");
  var lightboxEl = document.getElementById("lightbox");
  if (!slideshowEl || !galleryEl) return;

  var track = null;
  var offset = 0;
  var loopWidth = 0;
  var animId = null;
  var lastTime = 0;
  var pixelsPerSecond = 90;
  var nudgeUntil = 0;

  function createMediaElement(item, className, options) {
    options = options || {};
    if (item.type === "video") {
      var video = document.createElement("video");
      video.className = className;
      video.src = item.src;
      video.muted = true;
      video.playsInline = true;
      video.loop = true;
      video.autoplay = options.autoplay !== false;
      video.setAttribute("aria-label", item.alt || "Video");
      return video;
    }

    var img = document.createElement("img");
    img.className = className;
    img.src = item.src;
    img.alt = item.alt || "";
    img.loading = "eager";
    return img;
  }

  function slideWidth() {
    return window.innerWidth;
  }

  function appendSlides(target, list) {
    list.forEach(function (item) {
      var slide = document.createElement("div");
      slide.className = "slideshow__slide";
      slide.appendChild(createMediaElement(item, "slideshow__media"));
      target.appendChild(slide);
    });
  }

  function measureLoop() {
    if (!track) return;
    loopWidth = track.scrollWidth / 2;
  }

  function normalizeOffset() {
    if (loopWidth <= 0) return;
    while (offset <= -loopWidth) offset += loopWidth;
    while (offset > 0) offset -= loopWidth;
  }

  function applyTransform(smooth) {
    if (!track) return;
    track.style.transition = smooth ? "transform 0.45s ease" : "none";
    track.style.transform = "translate3d(" + offset + "px, 0, 0)";
  }

  function playSlideshowVideos() {
    if (!slideshowEl) return;
    slideshowEl.querySelectorAll("video").forEach(function (video) {
      video.play().catch(function () {});
    });
  }

  function pauseSlideshowVideos() {
    if (!slideshowEl) return;
    slideshowEl.querySelectorAll("video").forEach(function (video) {
      video.pause();
    });
  }

  function nudge(direction) {
    offset += direction * slideWidth();
    normalizeOffset();
    applyTransform(true);
    nudgeUntil = Date.now() + 500;
  }

  function tick(now) {
    if (!lastTime) lastTime = now;
    var delta = (now - lastTime) / 1000;
    lastTime = now;

    if (Date.now() > nudgeUntil) {
      offset -= pixelsPerSecond * delta;
      normalizeOffset();
      applyTransform(false);
    }

    animId = requestAnimationFrame(tick);
  }

  function buildSlideshow() {
    var viewport = document.createElement("div");
    viewport.className = "slideshow__viewport";

    track = document.createElement("div");
    track.className = "slideshow__track";
    track.id = "slideshow-track";

    appendSlides(track, items);
    appendSlides(track, items);

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

    viewport.appendChild(track);
    slideshowEl.appendChild(viewport);
    slideshowEl.appendChild(prev);
    slideshowEl.appendChild(next);

    prev.addEventListener("click", function () {
      nudge(1);
    });
    next.addEventListener("click", function () {
      nudge(-1);
    });

    window.addEventListener("resize", function () {
      measureLoop();
      normalizeOffset();
      applyTransform(false);
    });
  }

  function buildGallery() {
    items.forEach(function (item, index) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "gallery__item";
      button.setAttribute("aria-label", "View " + (item.alt || "media"));
      button.dataset.index = String(index);

      if (item.type === "video") {
        var video = createMediaElement(item, "gallery__thumb", { autoplay: false });
        video.controls = false;
        video.removeAttribute("loop");
        button.appendChild(video);
        var badge = document.createElement("span");
        badge.className = "gallery__badge";
        badge.textContent = "Video";
        button.appendChild(badge);
      } else {
        button.appendChild(createMediaElement(item, "gallery__thumb", { autoplay: false }));
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

    var content = createMediaElement(item, "lightbox__media", { autoplay: false });
    if (item.type === "video") {
      content.controls = true;
      content.muted = false;
      content.loop = false;
      content.autoplay = true;
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
    lightboxEl.querySelectorAll("video").forEach(function (video) {
      video.pause();
    });
    lightboxEl.hidden = true;
    lightboxEl.innerHTML = "";
    document.body.classList.remove("lightbox-open");
    playSlideshowVideos();
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeLightbox();
  });

  buildSlideshow();
  buildGallery();
  measureLoop();
  applyTransform(false);
  playSlideshowVideos();
  animId = requestAnimationFrame(tick);
})();
