# Message storage setup (Google Sheets)

Much simpler than Firebase for ~100 birthday messages. Everything lives in one Google Sheet you can open anytime.

## 1. Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a blank spreadsheet
3. Name it something like `Taylor Birthday Messages`

## 2. Add the script

1. In the sheet: **Extensions → Apps Script**
2. Delete any placeholder code
3. Paste the entire contents of `google-apps-script.gs` from this repo
4. Click **Save** (name the project `Taylor Messages`)

## 3. Deploy as a web app

1. Click **Deploy → New deployment**
2. Click the gear icon → select **Web app**
3. Settings:
   - **Execute as:** Me
   - **Who has access:** Anyone ← must say exactly **Anyone**, not "Anyone with Google account"
4. Click **Deploy**
5. Authorize when prompted (Google will warn it's unverified — that's normal for personal scripts; click Advanced → Go to …)
6. **Copy the Web app URL** (looks like `https://script.google.com/macros/s/...../exec`)

## 4. Connect the site

Paste your URL into `messages-config.js`:

```js
window.MESSAGES_API_URL = "https://script.google.com/macros/s/YOUR_ID/exec";
```

Push to GitHub and bump `?v=` in `index.html`.

## 5. Test

Open: `https://eokelber824.github.io/taylor-birthday-countdown/?test=1`

- You should see green **"Message storage connected"**
- Submit a test message
- Open your Google Sheet — the message should appear on the `Messages` tab
- Click **Reveal messages** in test mode to load them on the page

## Notes

- **Submit** works anytime (up to 100 messages)
- **Read on the website** is locked until July 20, 2026 9:00 AM Pacific (same as before)
- In `?test=1` mode, reads work early so you can preview
- You can always view messages directly in the Google Sheet

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Red "not configured" on site | Paste web app URL into `messages-config.js` |
| Submit fails | Redeploy script with **Who has access: Anyone** (create a new deployment version) |
| "Message load failed" / sign-in page | Same fix — access must be **Anyone**, then Deploy → Manage deployments → Edit → New version |
| Reveal messages fails before birthday | Expected — use `?test=1` or check the Sheet directly |
| "Message limit reached" | 100 message cap (adjust `MAX_MESSAGES` in the script if needed) |
