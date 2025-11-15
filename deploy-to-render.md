# QUICK START - DEPLOY TO RENDER

Follow these steps to deploy your GlowNatura backend to Render in under 15 minutes!

---

## STEP 1: PUSH TO GITHUB (5 minutes)

```bash
# If you haven't initialized Git yet:
git init
git add .
git commit -m "Ready for Render deployment - GlowNatura v5.1.0"

# Create repository on GitHub: https://github.com/new
# Name it: glownatura-backend

# Connect and push:
git remote add origin https://github.com/YOUR_USERNAME/glownatura-backend.git
git branch -M main
git push -u origin main
```

---

## STEP 2: DEPLOY TO RENDER (5 minutes)

### Option 1: Using Blueprint (Automatic - RECOMMENDED)

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Blueprint"**
3. Click **"Connect a repository"**
4. Select your GitHub account
5. Choose **`glownatura-backend`** repository
6. Click **"Connect"**
7. Render will detect `render.yaml` ✅
8. Click **"Apply"**

⚠️ **STOP! Don't deploy yet - set environment variables first!**

---

### Option 2: Manual Setup (Alternative)

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your `glownatura-backend` repository
4. Configure:
   - **Name:** `glownatura-backend`
   - **Region:** Ohio
   - **Branch:** `main`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free
5. Click **"Advanced"**
   - **Health Check Path:** `/health`
6. **STOP! Set environment variables before deploying!**

---

## STEP 3: SET ENVIRONMENT VARIABLES (5 minutes)

In Render Dashboard:

1. Go to your service
2. Click **"Environment"** tab
3. Click **"Add Environment Variable"**
4. Copy these variables (update with your values):

### REQUIRED VARIABLES

```env
NODE_ENV=production
PORT=5000

# MongoDB Atlas (get from MongoDB Atlas dashboard)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/glownatura?retryWrites=true&w=majority

# Generate JWT Secret (run this in PowerShell):
# -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
JWT_SECRET=paste-generated-secret-here-minimum-32-characters
JWT_EXPIRE=30d

# Cloudinary (from your Cloudinary dashboard)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Brevo Email (from your Brevo account)
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=your-brevo-login
BREVO_SMTP_PASSWORD=your-brevo-password
BREVO_API_KEY=your-brevo-api-key
FROM_EMAIL=orders@glownaturas.com
FROM_NAME=GlowNaturas

# Admin
COMPANY_EMAIL_DOMAIN=glownatura.com

# Frontend URLs (update after deploying frontend)
FRONTEND_URL=https://your-frontend.vercel.app
ADMIN_URL=https://your-admin.vercel.app
```

4. Click **"Save Changes"**

---

## STEP 4: DEPLOY! 🚀

1. Click **"Manual Deploy"** → **"Deploy latest commit"**
2. Wait 2-3 minutes for build to complete
3. Look for: **"Your service is live 🎉"**

---

## STEP 5: VERIFY DEPLOYMENT

### Test your API:

```bash
# Replace YOUR-APP-NAME with your Render service name
curl https://YOUR-APP-NAME.onrender.com/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "version": "5.1.0",
  "dependencies": {
    "mongodb": {
      "status": "connected",
      "connected": true
    }
  }
}
```

✅ **If you see this, your backend is live!**

---

## YOUR API URLS

After deployment, your API will be available at:

- **Base URL:** `https://your-app-name.onrender.com`
- **Health Check:** `https://your-app-name.onrender.com/health`
- **Auth API:** `https://your-app-name.onrender.com/api/auth`
- **Products API:** `https://your-app-name.onrender.com/api/products`
- **Orders API:** `https://your-app-name.onrender.com/api/orders`

---

## COMMON ISSUES & FIXES

### ❌ "No render.yaml found"
**Solution:** Make sure `render.yaml` is in the root directory and pushed to GitHub.

```bash
# Check if file exists:
ls render.yaml

# If not, it was created but not committed:
git add render.yaml
git commit -m "Add render.yaml"
git push
```

---

### ❌ Build fails
**Solution:** Check the build logs in Render Dashboard for specific errors.

Common fixes:
```bash
# Delete and reinstall dependencies locally:
rm -rf node_modules package-lock.json
npm install
git add .
git commit -m "Fix dependencies"
git push
```

---

### ❌ MongoDB connection fails
**Solution:** 
1. Go to MongoDB Atlas
2. Network Access → Add IP: `0.0.0.0/0`
3. Database Access → Verify user has read/write permissions
4. Double-check connection string in Render environment variables

---

### ❌ Service spins down (Free tier)
**Expected behavior:** Free tier services spin down after 15 min of inactivity.

**Solutions:**
1. Upgrade to Starter plan ($7/month) for always-on
2. Use UptimeRobot to ping your API every 10 minutes
3. Accept the 30-60 second cold start on first request

---

## WHAT TO CHOOSE IN RENDER?

| Your Need | Choose This |
|-----------|-------------|
| **Backend API (Node.js/Express)** | ✅ **Web Service** |
| Cron Jobs | Background Worker |
| Static Website (HTML/CSS/JS) | Static Site |
| Private API (internal only) | Private Service |

**For GlowNatura Backend → Choose WEB SERVICE ✅**

---

## NEXT STEPS

1. ✅ Backend deployed to Render
2. Update `FRONTEND_URL` and `ADMIN_URL` after deploying frontend
3. Test all API endpoints
4. Set up custom domain (optional)
5. Configure monitoring
6. Launch! 🚀

---

## NEED HELP?

Check the full guide: `RENDER_DEPLOYMENT_GUIDE.md`

**Your backend is ready for production!** 🎉

