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

If you want, I can add ready-to-use Render/Heroku/Vercel project manifests with instructions to connect them to the repo (I can also prepare screenshots or step-by-step UI clicks). Request which hosting provider you prefer and I'll prepare the exact steps to complete the deployment and set environment variables.
