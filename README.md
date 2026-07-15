# Taylor's Birthday Countdown

A minimal, professional countdown to **Monday, July 20, 2026 at 9:00 AM Pacific** — with birthday messages stored in Firebase and revealed when the timer hits zero.

Hosted on GitHub Pages.

## Setup

### 1. Photo

Replace the placeholder image URL in `index.html` (`#hero-photo` `src`) with Taylor's photo URL.

### 2. Firebase

1. Create a project at [Firebase Console](https://console.firebase.google.com/).
2. Add a **Web app** and copy the config into `firebase-config.js`.
3. Enable **Cloud Firestore** (start in production mode).
4. Deploy security rules from `firestore.rules`:

   ```bash
   firebase deploy --only firestore:rules
   ```

   Or paste the rules manually in Firebase Console → Firestore → Rules.

Rules enforce:
- Anyone can **create** messages (name + message, max lengths).
- Messages are **readable only after** July 20, 2026 9:00 AM Pacific (16:00 UTC).

### 3. GitHub Pages

1. Push `main` to GitHub.
2. Settings → Pages → Source: **Deploy from branch** → `main` / **root**.
3. Ensure `.nojekyll` is present (already included).

### 4. Cache busting

When you change CSS or JS, bump the `?v=` query string in `index.html`:

- `styles.css?v=1`
- `app.js?v=1`
- `firebase-config.js?v=1`

## Countdown math

- **TARGET_MS**: `1784563200000` (fixed UTC instant)
- **Event**: July 20, 2026, 9:00 AM PDT = 16:00 UTC
- Display time uses `toLocaleString` for the visitor's timezone only — countdown math never parses timezone offsets.

Run tests before deploy:

```bash
python3 test_countdown.py
```

## Local preview

```bash
python3 -m http.server 8080
```

Open http://localhost:8080
