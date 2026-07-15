# Firebase setup for birthday messages

The site cannot save messages until `firebase-config.js` has your real Firebase project values (it currently has placeholders).

## 1. Create the Firebase project

1. Open [Firebase Console](https://console.firebase.google.com/)
2. **Add project** → name it `taylor-birthday-countdown` (or any name)
3. Disable Google Analytics if you want (optional)

## 2. Enable Firestore

1. In the left menu: **Build → Firestore Database**
2. Click **Create database**
3. Choose **Start in production mode**
4. Pick a region close to you (e.g. `us-west1`)

## 3. Add a web app

1. Project **Settings** (gear icon) → **Your apps**
2. Click the **Web** icon (`</>`)
3. App nickname: `taylor-birthday-countdown`
4. Copy the `firebaseConfig` object

Paste the values into `firebase-config.js`:

```js
window.FIREBASE_CONFIG = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
};
```

## 4. Deploy security rules

In Firebase Console → **Firestore → Rules**, paste the contents of `firestore.rules` and click **Publish**.

Or with Firebase CLI:

```bash
firebase deploy --only firestore:rules
```

## 5. Allow your GitHub Pages domain

1. Firebase Console → **Build → Authentication**
2. Open the **Settings** tab → **Authorized domains**
3. Click **Add domain**
4. Add: `eokelber824.github.io`

## 6. Push the config to GitHub

```bash
git add firebase-config.js
git commit -m "Add Firebase config"
git push
```

Bump `?v=` on `firebase-config.js` in `index.html` after changes.

## Test it

1. Open the site with `?test=1`
2. Submit a message via the form — you should see a green success message
3. Click **Reveal messages** — reads are blocked until July 20 unless you temporarily change the read rule to `allow read: if true` for testing

## Troubleshooting

| Error | Fix |
|-------|-----|
| "Message storage is not configured yet" | Fill in `firebase-config.js` and push |
| `permission-denied` on submit | Publish `firestore.rules` |
| `permission-denied` on read (before birthday) | Expected — reads open on July 20 at 9am Pacific |
| Works locally but not on GitHub Pages | Add `eokelber824.github.io` to Authorized domains |
