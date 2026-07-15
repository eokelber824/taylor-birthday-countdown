# Message storage setup (JSONBin.io)

Takes about 3 minutes. No Google auth, no deployments, works from GitHub Pages.

## 1. Create a free account

Go to [jsonbin.io](https://jsonbin.io) and sign up (free tier is plenty for ~100 messages).

## 2. Create a bin

1. Click **Create Bin**
2. Paste this as the contents:

```json
{
  "messages": []
}
```

3. Save — copy the **Bin ID** from the URL or bin page (looks like `67a1b2c3d4e5f6789012345`)

## 3. Create an access key

1. Go to **API Keys** in the sidebar
2. Click **Create Access Key**
3. Give it a name (e.g. `taylor-birthday`)
4. Enable **Read** and **Update** on your bin
5. Copy the access key

## 4. Connect the site

Paste into `messages-config.js`:

```js
window.MESSAGES_CONFIG = {
  binId: "your-bin-id-here",
  accessKey: "your-access-key-here",
};
```

Push to GitHub and bump `?v=` in `index.html`.

## 5. Test

Open: `https://eokelber824.github.io/taylor-birthday-countdown/?test=1`

- Green **"Message storage connected"** = working
- Submit a test message
- Click **Reveal messages** to see it on the page
- View/edit all messages anytime at [jsonbin.io](https://jsonbin.io) in your bin

## Notes

- Up to **100 messages** (enforced by the site)
- Messages are **hidden on the website** until the countdown hits zero
- The access key is visible in the page source — fine for low-stakes birthday notes, but don't reuse it elsewhere

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Red "not configured" | Fill in both `binId` and `accessKey` in `messages-config.js` |
| "Could not reach message storage" | Check bin ID and access key; key needs Read + Update |
| Submit works but reveal is empty | Use `?test=1` before the birthday, or wait until countdown hits zero |
