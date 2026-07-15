# Taylor's Birthday Countdown

A minimal, professional countdown to **Monday, July 20, 2026** — with birthday messages stored in a Google Sheet and revealed when the timer hits zero.

Hosted on GitHub Pages.

## Setup

### 1. Photo

Replace the placeholder image URL in `index.html` (`#hero-photo` `src`) with Taylor's photo URL.

### 2. Message storage (Google Sheets — ~5 min)

See **[MESSAGES_SETUP.md](MESSAGES_SETUP.md)** for the full walkthrough. Short version:

1. Create a Google Sheet
2. Paste `google-apps-script.gs` into **Extensions → Apps Script**
3. **Deploy → Web app** (Execute as: Me, Access: Anyone)
4. Paste the web app URL into `messages-config.js`
5. Push to GitHub

No Firebase, no database console, no security rules. Messages show up in your spreadsheet and on the site at zero.

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
