# Deployment guide — Backend & Frontend (Render/Heroku + Vercel/Netlify)

This file contains example configuration snippets and a short checklist to deploy the `MWT-PROJECT-FINAL` app: the backend (Node/Express) and the frontend (Vite/React).

---

## 1) Environment variables (required)
Set the following variables in your host’s UI (Render / Heroku / Vercel / Netlify). Do NOT store secrets in the repository.

- PORT — (host sets this automatically, don't hardcode)
- DATABASE_URL — MongoDB connection string (e.g. mongodb+srv://user:pass@cluster/yourdb)
- JWT_SECRET — JSON Web Token secret
- SESSION_SECRET — express-session secret
- STRIPE_SECRET_KEY (if using Stripe)
- CLOUDINARY_URL (if using Cloudinary)

Example `healthcare-portal-backend/.env.example` (do not commit real values):

```
PORT=5001
DATABASE_URL=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/yourdb
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
```

---

## 2) Backend: Render example (recommended)

Create a Render Web Service and point it to the `healthcare-portal-backend` folder.

- Build Command: `npm install`
- Start Command: `npm start` (package.json has `start: node server.js`)
- Environment: Add the variables listed above in the Render dashboard.

Optional `render.yaml` example (repo root):

```yaml
services:
  - type: web
    name: healthcare-backend
    env: node
    region: oregon
    plan: free
    repo: "https://github.com/SUBRAMANI408/MWT-PROJECT-FINAL"
    branch: main
    rootDir: healthcare-portal-backend
    buildCommand: npm install
    startCommand: npm start
```

After deploying, copy the backend URL (https://your-backend.onrender.com) for the frontend env.

---

## 3) Backend: Heroku quick example

1. Create a Heroku app and connect your GitHub repo (or use the Heroku CLI).
2. Ensure `package.json` has a `start` script (it does: `node server.js`).
3. Add Config Vars in the Heroku dashboard: `DATABASE_URL`, `JWT_SECRET`, `SESSION_SECRET`, etc.
4. Deploy via GitHub integration or `git push heroku main`.

You can add a `Procfile` in `healthcare-portal-backend/Procfile` with:

```
web: node server.js
```

---

## 4) Frontend: Vercel (recommended) or Netlify

Vercel (Vite):

- Import the repo in Vercel and set the project root to `healthcare-portal-frontend`.
- Build Command: `npm run build` (Vite)
- Output Directory: `dist`
- Add environment variable: `VITE_API_URL=https://your-backend-url`

Netlify (Vite):

- Connect repo and set build command to `npm run build` and publish directory to `dist`.
- Add env var in Site Settings → Build & deploy → Environment: `VITE_API_URL=https://your-backend-url`.

Example `healthcare-portal-frontend/netlify.toml` (optional):

```toml
[build]
  command = "npm run build"
  publish = "dist"

[context.production.environment]
  VITE_API_URL = "https://your-backend-url"
```

Example `healthcare-portal-frontend/vercel.json` (optional):

```json
{
  "builds": [
    { "src": "package.json", "use": "@vercel/static-build", "config": { "distDir": "dist" } }
  ]
}
```

---

## 5) CORS & PORT notes

- Your backend already uses `process.env.PORT || 5001` — hosts set `PORT` automatically.
- For security, restrict CORS in production:

```js
const cors = require('cors');
app.use(cors({ origin: 'https://your-frontend-url' }));
```

- For Socket.IO, update allowed origins to include your deployed frontend domain.

---

## 6) Post-deploy checks

- Visit the frontend production URL and open DevTools → Network to verify API calls go to your backend.
- If you see CORS errors, add the frontend origin to backend CORS config and redeploy.
- Check backend logs on the host (Render/Heroku) for errors and missing env vars.

---

## 7) Quick local commands (recap)

Backend:

```powershell
cd healthcare-portal-backend
npm install
cp .env.example .env   # fill with real values locally (Windows: copy)
npm run dev
```

Frontend (Vite):

```powershell
cd healthcare-portal-frontend
npm install
# ensure .env.local contains VITE_API_URL=http://localhost:5001
npm run dev
```

---

## 8) GitHub Actions: secrets required for automatic deploys

If you want the repository to auto-deploy when you push to `master`, add the following GitHub Secrets in the repository Settings → Secrets → Actions.

Backend (Heroku) secrets:
- HEROKU_API_KEY — Your Heroku account API key (from Heroku account settings).
- HEROKU_APP_NAME — The exact Heroku app name (e.g. my-healthcare-backend).
- HEROKU_EMAIL — The email associated with your Heroku account.

Frontend (Vercel) secrets:
- VERCEL_TOKEN — Personal token from Vercel (Account → Tokens).
- VERCEL_ORG_ID — Vercel organization ID for your account/project.
- VERCEL_PROJECT_ID — Vercel project ID for the frontend project.

Add these secrets and then push to `master` (or create a PR to `master`) — the workflows under `.github/workflows` will run and deploy.

## Alternative deployment providers

The repository includes workflows for Render (backend) and Netlify (frontend) as well. To use these instead of Heroku/Vercel, add these secrets:

Backend (Render) secrets:
- RENDER_API_KEY — Your Render API key (from Account Settings → API Keys).
- RENDER_SERVICE_ID — The service ID of your Render web service (found in the URL when viewing the service, or via the Render API).

Frontend (Netlify) secrets:
- NETLIFY_BUILD_HOOK — The full build hook URL from your Netlify site (Site Settings → Build & deploy → Build hooks → Add build hook).

How to get the secrets:
1. For Render:
   - Go to render.com → Account Settings → API Keys
   - Create a new API key, copy it (you won't see it again)
   - Go to your web service dashboard, the service ID is in the URL: `dashboard.render.com/web/srv-XXXXX`

2. For Netlify:
   - Go to app.netlify.com → Your site → Site settings → Build & deploy
   - Scroll to "Build hooks", click "Add build hook"
   - Name it (e.g., "GitHub Actions"), choose branch (master)
   - Copy the full hook URL (looks like `https://api.netlify.com/build_hooks/xxxxx`)

The workflows will trigger when you push changes to their respective folders:
- Changes in `healthcare-portal-backend/` trigger the Render deploy
- Changes in `healthcare-portal-frontend/` trigger the Netlify build
