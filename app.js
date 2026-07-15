import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

(function () {
  "use strict";

  // July 20, 2026 at 9:00 AM Pacific (PDT, UTC-7) = 16:00 UTC
  // Single fixed instant — same countdown for everyone, everywhere.
  const TARGET_MS = 1784563200000;

  const TITLE_COUNTDOWN = "Happy Birthday, Taylor";
  const TITLE_CELEBRATION = "It's Taylor's Birthday";

  const $ = (id) => document.getElementById(id);

  const els = {
    days: $("days"),
    hours: $("hours"),
    minutes: $("minutes"),
    seconds: $("seconds"),
    mainTitle: $("main-title"),
    mainSubtitle: $("main-subtitle"),
    localEventTime: $("local-event-time"),
    footerTime: $("footer-time"),
    confettiCanvas: $("confetti-canvas"),
    messageForm: $("message-form"),
    submitterName: $("submitter-name"),
    messageText: $("message-text"),
    submitBtn: $("submit-btn"),
    formStatus: $("form-status"),
    formHint: $("form-hint"),
    messagesSection: $("messages-section"),
    messagesList: $("messages-list"),
    messagesEmpty: $("messages-empty"),
  };

  let celebrationStarted = false;
  let db = null;
  let firebaseReady = false;

  function pad(n) {
    var num = Number(n);
    if (isNaN(num) || num < 0) return "00";
    return (num < 10 ? "0" : "") + Math.floor(num);
  }

  function formatLocalTime(ms) {
    try {
      return new Date(ms).toLocaleString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "short",
      });
    } catch (e) {
      return new Date(ms).toString();
    }
  }

  function updateLocalEventTime() {
    if (!els.localEventTime) return;
    els.localEventTime.textContent =
      "Where you are, that's " + formatLocalTime(TARGET_MS);
  }

  function updateFooterTime() {
    if (!els.footerTime) return;
    els.footerTime.textContent =
      "Your time now: " +
      formatLocalTime(Date.now()) +
      " · Celebration: " +
      formatLocalTime(TARGET_MS);
  }

  function fitTitleLine() {
    var title = els.mainTitle;
    if (!title || !title.parentElement) return;
    var wrap = title.parentElement;
    var maxSize = celebrationStarted ? 40 : 36;
    var minSize = 14;
    var size = maxSize;

    title.style.whiteSpace = "nowrap";
    title.style.display = "inline-block";
    title.style.fontSize = size + "px";

    var available = wrap.clientWidth;
    while (title.scrollWidth > available && size > minSize) {
      size -= 0.5;
      title.style.fontSize = size + "px";
    }
  }

  function getRemaining() {
    var diff = TARGET_MS - Date.now();
    if (diff <= 0) {
      return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    var totalSeconds = Math.floor(diff / 1000);
    var days = Math.floor(totalSeconds / 86400);
    var hours = Math.floor((totalSeconds % 86400) / 3600);
    var minutes = Math.floor((totalSeconds % 3600) / 60);
    var seconds = totalSeconds % 60;
    return { total: diff, days: days, hours: hours, minutes: minutes, seconds: seconds };
  }

  function tickUnit(el) {
    if (!el || !el.closest) return;
    var unit = el.closest(".countdown__unit");
    if (unit) {
      unit.classList.add("tick");
      setTimeout(function () {
        unit.classList.remove("tick");
      }, 200);
    }
  }

  function initConfetti() {
    var canvas = els.confettiCanvas;
    if (!canvas || !canvas.getContext) {
      return { burst: function () {} };
    }

    var ctx = canvas.getContext("2d");
    var particles = [];
    var animId = null;
    var cleanupTimer = null;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener("resize", resize);

    function stopConfetti() {
      if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
      }
      if (cleanupTimer) {
        clearTimeout(cleanupTimer);
        cleanupTimer = null;
      }
      particles = [];
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.style.display = "none";
    }

    function spawn(count) {
      var colors = ["#c9a87c", "#a67c52", "#f5ebe0", "#faf7f2", "#d4a574"];
      var centerX = canvas.width / 2;
      var centerY = canvas.height / 3;
      for (var i = 0; i < count; i++) {
        particles.push({
          x: centerX + (Math.random() - 0.5) * 100,
          y: centerY + (Math.random() - 0.5) * 60,
          w: 5 + Math.random() * 7,
          h: 3 + Math.random() * 5,
          color: colors[Math.floor(Math.random() * colors.length)],
          vx: (Math.random() - 0.5) * 8,
          vy: -3 - Math.random() * 6,
          rot: Math.random() * 360,
          vr: (Math.random() - 0.5) * 10,
        });
      }
    }

    function frame() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var alive = [];
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12;
        p.rot += p.vr;
        if (p.y < canvas.height + 60 && p.x > -60 && p.x < canvas.width + 60) {
          alive.push(p);
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rot * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        }
      }
      particles = alive;
      if (particles.length > 0) {
        animId = requestAnimationFrame(frame);
      } else {
        stopConfetti();
      }
    }

    return {
      burst: function () {
        stopConfetti();
        canvas.style.display = "block";
        spawn(80);
        animId = requestAnimationFrame(frame);
        cleanupTimer = setTimeout(stopConfetti, 4000);
      },
    };
  }

  var confetti = initConfetti();

  function showFormStatus(text, type) {
    if (!els.formStatus) return;
    els.formStatus.hidden = false;
    els.formStatus.textContent = text;
    els.formStatus.className = "form-status form-status--" + type;
  }

  function hideFormStatus() {
    if (els.formStatus) els.formStatus.hidden = true;
  }

  function initFirebase() {
    var config = window.FIREBASE_CONFIG;
    if (!config || !config.apiKey || config.apiKey === "YOUR_API_KEY") {
      console.warn("Firebase not configured — messages will not save.");
      return false;
    }
    try {
      var app = initializeApp(config);
      db = getFirestore(app);
      firebaseReady = true;
      return true;
    } catch (e) {
      console.error("Firebase init failed:", e);
      return false;
    }
  }

  async function submitMessage(name, message) {
    if (!firebaseReady || !db) {
      throw new Error("Message storage is not configured yet.");
    }
    await addDoc(collection(db, "messages"), {
      name: name.trim(),
      message: message.trim(),
      createdAt: serverTimestamp(),
    });
  }

  function renderMessages(docs) {
    if (!els.messagesList || !els.messagesSection) return;

    els.messagesList.innerHTML = "";

    if (docs.length === 0) {
      if (els.messagesEmpty) els.messagesEmpty.hidden = false;
      return;
    }

    if (els.messagesEmpty) els.messagesEmpty.hidden = true;

    docs.forEach(function (doc) {
      var data = doc.data();
      var li = document.createElement("li");
      li.className = "message-card";

      var text = document.createElement("p");
      text.className = "message-card__text";
      text.textContent = data.message || "";

      var author = document.createElement("p");
      author.className = "message-card__author";
      author.textContent = "— " + (data.name || "Anonymous");

      li.appendChild(text);
      li.appendChild(author);
      els.messagesList.appendChild(li);
    });
  }

  async function loadMessages() {
    if (!firebaseReady || !db) return;

    try {
      var q = query(collection(db, "messages"), orderBy("createdAt", "asc"));
      var snapshot = await getDocs(q);
      renderMessages(snapshot.docs);
    } catch (e) {
      console.error("Failed to load messages:", e);
    }
  }

  function revealMessages() {
    if (!els.messagesSection) return;
    els.messagesSection.hidden = false;
    if (els.formHint) {
      els.formHint.textContent = "Messages from friends and family:";
    }
    loadMessages();
  }

  function startCelebration() {
    if (celebrationStarted) return;
    celebrationStarted = true;
    document.body.classList.add("celebration-mode");

    if (els.mainTitle) els.mainTitle.textContent = TITLE_CELEBRATION;
    if (els.mainSubtitle) {
      els.mainSubtitle.innerHTML =
        "<strong>The wait is over.</strong> Wishing Taylor the happiest birthday.<br>" +
        '<span class="hero__local">Celebration started at ' +
        formatLocalTime(TARGET_MS) +
        "</span>";
    }

    if (els.days) els.days.textContent = "00";
    if (els.hours) els.hours.textContent = "00";
    if (els.minutes) els.minutes.textContent = "00";
    if (els.seconds) els.seconds.textContent = "00";

    confetti.burst();
    revealMessages();
    fitTitleLine();
  }

  var lastSecond = -1;

  function updateCountdown() {
    var r = getRemaining();

    if (r.total <= 0) {
      startCelebration();
      return;
    }

    if (els.days) els.days.textContent = pad(r.days);
    if (els.hours) els.hours.textContent = pad(r.hours);
    if (els.minutes) els.minutes.textContent = pad(r.minutes);
    if (els.seconds) els.seconds.textContent = pad(r.seconds);

    if (r.seconds !== lastSecond) {
      lastSecond = r.seconds;
      tickUnit(els.seconds);
    }
  }

  if (els.messageForm) {
    els.messageForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      hideFormStatus();

      var name = els.submitterName ? els.submitterName.value : "";
      var message = els.messageText ? els.messageText.value : "";

      if (!name.trim() || !message.trim()) {
        showFormStatus("Please enter your name and a message.", "error");
        return;
      }

      if (els.submitBtn) els.submitBtn.disabled = true;

      try {
        await submitMessage(name, message);
        showFormStatus("Message saved — it will appear when the countdown ends.", "success");
        if (els.messageForm) els.messageForm.reset();
      } catch (err) {
        showFormStatus(
          err.message || "Could not save message. Please try again.",
          "error"
        );
      } finally {
        if (els.submitBtn) els.submitBtn.disabled = false;
      }
    });
  }

  initFirebase();
  updateLocalEventTime();
  updateFooterTime();
  updateCountdown();
  fitTitleLine();

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(fitTitleLine);
  }

  window.addEventListener("resize", fitTitleLine);
  setInterval(updateCountdown, 250);
  setInterval(updateFooterTime, 1000);

  if (getRemaining().total <= 0) {
    startCelebration();
  }
})();
