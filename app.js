(function () {
  "use strict";

  // July 20, 2026 at 9:00 AM Pacific (PDT, UTC-7) = 16:00 UTC
  // Single fixed instant — same countdown for everyone, everywhere.
  const TARGET_MS = 1784563200000;

  const TITLE_COUNTDOWN =
    '<span class="emoji" aria-hidden="true">🎉</span> <span class="hero__title-text">Happy Birthday Taylor</span> <span class="emoji" aria-hidden="true">🎂</span>';
  const TITLE_CELEBRATION =
    '<span class="emoji" aria-hidden="true">🥳</span> <span class="hero__title-text">Happy Birthday Taylor!</span> <span class="emoji" aria-hidden="true">🎂</span> <span class="emoji" aria-hidden="true">✨</span>';
  const SUBTITLE_CELEBRATION =
    "The wait is over!!! Wishing Taylor the happiest birthday here at CISCO";

  function setMainTitle(html) {
    if (els.mainTitle) els.mainTitle.innerHTML = html;
  }

  const params = new URLSearchParams(window.location.search);
  const testMode = params.get("test") === "1";

  const SAMPLE_MESSAGES = [
    { name: "Alex", message: "Happy birthday, Taylor! Wishing you the most wonderful day." },
    { name: "Jordan", message: "Hope this year brings you everything you're hoping for." },
    { name: "Sam", message: "So grateful to know you — enjoy every moment today." },
  ];

  const $ = (id) => document.getElementById(id);

  const els = {
    days: $("days"),
    hours: $("hours"),
    minutes: $("minutes"),
    seconds: $("seconds"),
    mainTitle: $("main-title"),
    mainSubtitle: $("main-subtitle"),
    footerTime: $("footer-time"),
    confettiCanvas: $("confetti-canvas"),
    messageForm: $("message-form"),
    messageFormSection: $("message-form-section"),
    submitterName: $("submitter-name"),
    messageText: $("message-text"),
    submitBtn: $("submit-btn"),
    formStatus: $("form-status"),
    formHint: $("form-hint"),
    messagesSection: $("messages-section"),
    messagesList: $("messages-list"),
    messagesEmpty: $("messages-empty"),
    testPanel: $("test-panel"),
    testCelebration: $("test-celebration"),
    testMessages: $("test-messages"),
    testSample: $("test-sample"),
    testReset: $("test-reset"),
    testClear: $("test-clear"),
  };

  let celebrationStarted = false;
  let storageReady = false;
  var binId = "";
  var accessKey = "";
  var MAX_MESSAGES = 100;

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
      return { burst: function () {}, startContinuous: function () {}, stop: function () {} };
    }

    var ctx = canvas.getContext("2d");
    var particles = [];
    var animId = null;
    var spawnInterval = null;
    var continuousMode = false;
    var maxParticles = 55;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener("resize", resize);

    function stopConfetti() {
      continuousMode = false;
      if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
      }
      if (spawnInterval) {
        clearInterval(spawnInterval);
        spawnInterval = null;
      }
      particles = [];
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.style.display = "none";
    }

    function addParticle(opts) {
      particles.push({
        x: opts.x,
        y: opts.y,
        w: opts.w,
        h: opts.h,
        color: opts.color,
        vx: opts.vx,
        vy: opts.vy,
        rot: opts.rot,
        vr: opts.vr,
      });
    }

    function spawnBurst(count) {
      var colors = ["#d4849a", "#e8927c", "#d4a84b", "#7aab8e", "#ebe4f8", "#fde8d8"];
      var centerX = canvas.width / 2;
      var centerY = canvas.height / 3;
      for (var i = 0; i < count; i++) {
        addParticle({
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

    function spawnGentle(count) {
      var colors = ["#d4849a", "#e8927c", "#d4a84b", "#7aab8e", "#fde8d8"];
      for (var i = 0; i < count; i++) {
        addParticle({
          x: Math.random() * canvas.width,
          y: -10 - Math.random() * 30,
          w: 4 + Math.random() * 5,
          h: 2 + Math.random() * 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          vx: (Math.random() - 0.5) * 1.5,
          vy: 1 + Math.random() * 2,
          rot: Math.random() * 360,
          vr: (Math.random() - 0.5) * 4,
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
        p.vy += continuousMode ? 0.06 : 0.12;
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

      if (continuousMode || particles.length > 0) {
        animId = requestAnimationFrame(frame);
      } else {
        stopConfetti();
      }
    }

    function ensureAnimating() {
      canvas.style.display = "block";
      if (!animId) animId = requestAnimationFrame(frame);
    }

    return {
      burst: function () {
        spawnBurst(80);
        ensureAnimating();
      },
      startContinuous: function () {
        continuousMode = true;
        canvas.style.display = "block";
        spawnBurst(50);
        if (spawnInterval) clearInterval(spawnInterval);
        spawnInterval = setInterval(function () {
          if (particles.length < maxParticles) spawnGentle(3);
        }, 1100);
        ensureAnimating();
      },
      stop: function () {
        stopConfetti();
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

  function initStorage() {
    var config = window.MESSAGES_CONFIG || {};
    binId = config.binId || "";
    accessKey = config.accessKey || "";

    if (!binId || binId === "YOUR_BIN_ID" || !accessKey || accessKey === "YOUR_ACCESS_KEY") {
      if (els.submitBtn) els.submitBtn.disabled = true;
      return false;
    }

    storageReady = true;
    if (els.submitBtn) els.submitBtn.disabled = true;

    fetch(binUrl(), { headers: binHeaders() })
      .then(function (response) {
        if (!response.ok) throw new Error("Could not reach message storage.");
        return response.json();
      })
      .then(function () {
        if (els.submitBtn) els.submitBtn.disabled = false;
      })
      .catch(function (err) {
        console.error("Storage check failed:", err);
        if (els.submitBtn) els.submitBtn.disabled = true;
        storageReady = false;
      });

    return true;
  }

  function storageErrorMessage(err) {
    if (err && err.error === "locked") {
      return "Messages are locked until the birthday — use ?test=1 to preview reads.";
    }
    if (err && err.error === "limit") {
      return "Message limit reached (100 max).";
    }
    return err && err.message ? err.message : "Could not complete request. Please try again.";
  }

  function binHeaders() {
    return {
      "Content-Type": "application/json",
      "X-Access-Key": accessKey,
    };
  }

  function binUrl() {
    return "https://api.jsonbin.io/v3/b/" + binId + "/latest";
  }

  async function fetchBin() {
    var response = await fetch(binUrl(), { headers: binHeaders() });
    if (!response.ok) {
      throw new Error("Could not reach message storage — check bin ID and access key.");
    }
    var data = await response.json();
    return data.record || { messages: [] };
  }

  async function saveBin(record) {
    var response = await fetch("https://api.jsonbin.io/v3/b/" + binId, {
      method: "PUT",
      headers: binHeaders(),
      body: JSON.stringify(record),
    });
    if (!response.ok) {
      throw new Error("Could not save message — check access key has Update permission.");
    }
  }

  async function submitMessage(name, message) {
    if (!storageReady || !binId || !accessKey) {
      throw new Error("Message storage is not configured yet.");
    }

    var record = await fetchBin();
    var messages = record.messages || [];

    if (messages.length >= MAX_MESSAGES) {
      var limitErr = new Error("Message limit reached.");
      limitErr.error = "limit";
      throw limitErr;
    }

    messages.push({
      name: name.trim(),
      message: message.trim(),
      createdAt: new Date().toISOString(),
    });

    await saveBin({ messages: messages });
  }

  async function clearAllMessages() {
    if (!storageReady || !binId || !accessKey) {
      throw new Error("Message storage is not configured yet.");
    }
    await saveBin({ messages: [] });
    if (els.messagesList) els.messagesList.innerHTML = "";
    if (els.messagesEmpty) els.messagesEmpty.hidden = false;
  }

  async function loadMessages() {
    if (!storageReady || !binId || !accessKey) {
      if (els.formHint) {
        els.formHint.textContent =
          "Storage not configured — use Sample messages to preview the layout.";
      }
      return false;
    }

    if (!testMode && !celebrationStarted && getRemaining().total > 0) {
      if (els.formHint) {
        els.formHint.textContent =
          "Messages are locked until the birthday. Use ?test=1 to preview.";
      }
      return false;
    }

    try {
      var record = await fetchBin();
      renderMessageCards(record.messages || []);
      return true;
    } catch (e) {
      console.error("Failed to load messages:", e);
      if (els.formHint) {
        els.formHint.textContent = storageErrorMessage(e);
      }
      return false;
    }
  }

  function renderMessageCards(items) {
    if (!els.messagesList || !els.messagesSection) return;

    els.messagesList.innerHTML = "";

    if (items.length === 0) {
      if (els.messagesEmpty) els.messagesEmpty.hidden = false;
      return;
    }

    if (els.messagesEmpty) els.messagesEmpty.hidden = true;

    items.forEach(function (item) {
      var li = document.createElement("li");
      li.className = "message-card";

      var text = document.createElement("p");
      text.className = "message-card__text";
      text.textContent = item.message || "";

      var author = document.createElement("p");
      author.className = "message-card__author";
      author.textContent = "— " + (item.name || "Anonymous");

      li.appendChild(text);
      li.appendChild(author);
      els.messagesList.appendChild(li);
    });
  }

  function revealMessages() {
    if (!els.messagesSection) return;
    els.messagesSection.hidden = false;
    if (els.formHint) {
      els.formHint.textContent = "Messages from friends and family:";
    }
    loadMessages();
  }

  function startCelebration(preview) {
    if (celebrationStarted && !preview) return;
    celebrationStarted = true;
    document.body.classList.add("celebration-mode");

    if (els.mainTitle) setMainTitle(TITLE_CELEBRATION);
    if (els.mainSubtitle) {
      els.mainSubtitle.innerHTML =
        "<strong>" + SUBTITLE_CELEBRATION + "</strong>";
    }

    if (els.days) els.days.textContent = "00";
    if (els.hours) els.hours.textContent = "00";
    if (els.minutes) els.minutes.textContent = "00";
    if (els.seconds) els.seconds.textContent = "00";

    confetti.startContinuous();
    if (els.messageFormSection) els.messageFormSection.hidden = true;
    revealMessages();
    fitTitleLine();
  }

  function resetCelebration() {
    celebrationStarted = false;
    lastSecond = -1;
    document.body.classList.remove("celebration-mode");
    confetti.stop();

    if (els.mainTitle) setMainTitle(TITLE_COUNTDOWN);
    if (els.mainSubtitle) {
      els.mainSubtitle.innerHTML =
        "Celebrating <strong>Monday, July 20, 2026</strong>";
    }

    if (els.messagesSection) els.messagesSection.hidden = true;
    if (els.messageFormSection) els.messageFormSection.hidden = false;
    if (els.messagesList) els.messagesList.innerHTML = "";
    if (els.messagesEmpty) els.messagesEmpty.hidden = true;
    if (els.formHint) {
      els.formHint.textContent =
        "Your message will be revealed when the countdown reaches zero.";
    }

    updateCountdown();
    fitTitleLine();
  }

  function initTestPanel() {
    if (!testMode || !els.testPanel) return;
    els.testPanel.hidden = false;

    if (els.testCelebration) {
      els.testCelebration.addEventListener("click", function () {
        startCelebration(true);
      });
    }

    if (els.testMessages) {
      els.testMessages.addEventListener("click", function () {
        revealMessages();
      });
    }

    if (els.testSample) {
      els.testSample.addEventListener("click", function () {
        if (els.messagesSection) els.messagesSection.hidden = false;
        if (els.formHint) {
          els.formHint.textContent = "Previewing sample messages (test mode):";
        }
        renderMessageCards(SAMPLE_MESSAGES);
      });
    }

    if (els.testReset) {
      els.testReset.addEventListener("click", function () {
        resetCelebration();
      });
    }

    if (els.testClear) {
      els.testClear.addEventListener("click", async function () {
        if (
          !window.confirm(
            "Delete ALL submitted birthday messages? This cannot be undone."
          )
        ) {
          return;
        }
        try {
          await clearAllMessages();
          showFormStatus("All messages deleted.", "success");
        } catch (err) {
          showFormStatus(storageErrorMessage(err), "error");
        }
      });
    }
  }

  var lastSecond = -1;

  function updateCountdown() {
    if (celebrationStarted) return;

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

      if (celebrationStarted) return;

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
        showFormStatus(storageErrorMessage(err), "error");
      } finally {
        if (els.submitBtn) els.submitBtn.disabled = false;
      }
    });
  }

  initStorage();
  initTestPanel();
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
