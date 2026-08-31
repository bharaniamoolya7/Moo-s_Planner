# 🚀 Moo'splanner Deployment Guide

This guide provides step-by-step instructions for deploying the **Moo'splanner** application (Frontend & Backend).

---

## 🛠️ Project Structure
- `remtodo-frontend/`: React + Vite Frontend application
- `remtodo-backend/`: Java Spring Boot + MySQL Backend API

---

## 📦 Option 1: Frontend Deployment (Vercel or Netlify)

### A. Vercel Deployment (Recommended)
1. Push your code to GitHub / GitLab / Bitbucket.
2. Log into [Vercel](https://vercel.com) and click **Add New Project**.
3. Import your repository and set the **Root Directory** to `remtodo-frontend`.
4. Set the build settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add an Environment Variable:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://your-backend-url.onrender.com` (Your deployed Spring Boot backend URL)
6. Click **Deploy**. Vercel will automatically use `vercel.json` for single-page routing.

---

### B. Netlify Deployment
1. Log into [Netlify](https://netlify.com) and select **Add new site > Import an existing project**.
2. Connect your Git repository and choose `remtodo-frontend` as the base directory.
3. Build command: `npm run build` | Publish directory: `dist`.
4. Under **Environment Variables**, add `VITE_API_URL` pointing to your live backend URL.
5. Click **Deploy Site**. Netlify will use `netlify.toml` for redirects.

---

## 🐘 Option 2: Backend Deployment (Render, Railway, or Docker)

### A. Render.com Deployment (Free Tier Support)
1. Log into [Render](https://render.com).
2. Create a **New MySQL Database** (or PostgreSQL / Aiven MySQL). Copy the database connection details.
3. Create a **New Web Service** and select your repository.
4. Choose **Docker** as the Runtime (or Java Environment with `remtodo-backend` root directory).
5. Set Environment Variables:
   - `PORT`: `8085`
   - `SPRING_DATASOURCE_URL`: `jdbc:mysql://<your-db-host>:3306/<your-db-name>?useSSL=false&allowPublicKeyRetrieval=true`
   - `SPRING_DATASOURCE_USERNAME`: `<your-db-user>`
   - `SPRING_DATASOURCE_PASSWORD`: `<your-db-password>`
   - `ALLOWED_ORIGINS`: `https://your-vercel-app.vercel.app`
6. Click **Create Web Service**.

---

### B. Deploying with Docker (Any Cloud Provider)
A `Dockerfile` is provided in `remtodo-backend/Dockerfile`.

Build and run locally or on any cloud platform (AWS, GCP, DigitalOcean):
```bash
cd remtodo-backend
docker build -t moosplanner-backend .
docker run -p 8085:8085 -e SPRING_DATASOURCE_URL="jdbc:mysql://host:3306/db" moosplanner-backend
```

---

## ⚡ Local Production Build Test

To test the production build of the frontend locally:
```bash
cd remtodo-frontend
npm run build
npm run preview
```

Your app is now fully configured and ready for easy 1-click deployment! ♡
