# 🍱 TiffinAI — Deploy Guide (15 minutes to live)

## What you have
- `index.html` — Full frontend (upload photo or type ingredients → get recipes)
- `api/analyze.js` — Serverless backend (calls Claude API)
- `vercel.json` — Deployment config
- Razorpay payment integrated (test mode ready)

---

## Step 1 — Push to GitHub (3 mins)

1. Go to github.com → New Repository → name it `tiffinai` → Create
2. On your computer, open terminal in this folder and run:

```bash
git init
git add .
git commit -m "TiffinAI v1 launch"
git remote add origin https://github.com/YOUR_USERNAME/tiffinai.git
git push -u origin main
```

---

## Step 2 — Deploy on Vercel (5 mins)

1. Go to vercel.com → Add New Project
2. Import your `tiffinai` GitHub repo
3. Click Deploy (it auto-detects config)
4. Your app is live at `tiffinai.vercel.app` 🎉

---

## Step 3 — Add your API key (2 mins)

In Vercel dashboard → Your Project → Settings → Environment Variables:

| Name | Value |
|------|-------|
| `ANTHROPIC_API_KEY` | `sk-ant-...your key here...` |

Then: Deployments → Redeploy (to pick up the env var)

---

## Step 4 — Add Razorpay key (2 mins)

In `index.html`, find line:
```js
const RAZORPAY_KEY = 'rzp_test_REPLACE_WITH_YOUR_KEY';
```

Replace with your Razorpay Test Key ID from:
razorpay.com → Settings → API Keys → Test Key ID

It looks like: `rzp_test_AbCdEfGhIjKlMn`

When you go live: switch to your Live Key ID (`rzp_live_...`)

---

## Step 5 — Test your app

1. Open your Vercel URL
2. Type some ingredients (e.g. "rice, dal, tomato, onion")
3. Click "Find Recipes from These Ingredients"
4. You should see 3 recipes! 🎉

For payment test:
- Click "Go Pro"
- Use Razorpay test card: `4111 1111 1111 1111`, any future date, any CVV

---

## Going Live Checklist

- [ ] Switch `rzp_test_` key to `rzp_live_` key in Razorpay dashboard
- [ ] Add custom domain (e.g. tiffinai.in) in Vercel → Settings → Domains
- [ ] Set up Razorpay webhook to verify payments server-side
- [ ] Add Google Analytics or Posthog for tracking

---

## Revenue Setup

### Razorpay Subscriptions (recommended upgrade)
Instead of one-time charges, use Razorpay Subscriptions API for recurring ₹199/mo billing.
Guide: https://razorpay.com/docs/payments/subscriptions

### Free tier limits
Currently set to 3 free searches (tracked in localStorage).
To change: edit `FREE_LIMIT = 3` in index.html

---

## File structure
```
tiffinai/
├── index.html        ← Full app UI
├── api/
│   └── analyze.js    ← Claude API backend
├── vercel.json       ← Deploy config
├── package.json      ← Project info
└── DEPLOY.md         ← This file
```

---

## Support
Built with Claude API (Anthropic) + Razorpay + Vercel
Total cost to run: ~₹0.50 per recipe generation (Claude API cost)
Profit per subscriber: ₹199 - ~₹15 API costs = ~₹184/mo per user 🔥
