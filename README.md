# Taylor's Birthday Countdown

A minimal, professional countdown to **Monday, July 20, 2026** — with birthday messages stored in a Google Sheet and revealed when the timer hits zero.

Hosted on GitHub Pages.

## Setup

### 1. Photo

Replace the placeholder image URL in `index.html` (`#hero-photo` `src`) with Taylor's photo URL.

### 2. Message storage (JSONBin.io — ~3 min)

See **[MESSAGES_SETUP.md](MESSAGES_SETUP.md)**. Create a free JSONBin account, make a bin, paste the ID and access key into `messages-config.js`, and push.

### 3. GitHub Pages

Already enabled from `main` / root. `.nojekyll` is included.

### 4. Test mode

Add `?test=1` to preview celebration, confetti, and messages before the birthday.

### 5. Cache busting

Bump `?v=` in `index.html` when you change CSS or JS.

## Countdown math

- **TARGET_MS**: `1784563200000` (July 20, 2026, 9:00 AM PDT = 16:00 UTC)

```bash
python3 test_countdown.py
```

## Local preview

```bash
python3 -m http.server 8080
```

Open http://localhost:8080
