# GLOWNATURA BACKEND - RENDER DEPLOYMENT GUIDE

**Version:** 5.1.0  
**Platform:** Render.com  
**Service Type:** Web Service  
**Estimated Time:** 15-20 minutes

---

## PREREQUISITES

Before deploying, ensure you have:

- ✅ GitHub/GitLab/Bitbucket account
- ✅ Render.com account (sign up at https://render.com)
- ✅ MongoDB Atlas database (free tier available)
- ✅ Cloudinary account for image uploads
- ✅ Brevo account for email services
- ✅ All environment variable values ready

---

## STEP-BY-STEP DEPLOYMENT

### Step 1: Prepare Your Repository

1. **Initialize Git (if not already done)**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - GlowNatura Backend v5.1.0"
   ```

2. **Create GitHub Repository**
   - Go to https://github.com/new
   - Create a new repository named `glownatura-backend`
   - **Do NOT initialize with README** (you already have one)

3. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/glownatura-backend.git
   git branch -M main
   git push -u origin main
   ```

---

### Step 2: Deploy to Render

#### Option A: Using render.yaml (Automatic - RECOMMENDED)

1. **Go to Render Dashboard**
   - Visit https://dashboard.render.com
   - Click "New +" → "Blueprint"

2. **Connect Repository**
   - Select "Connect a repository"
   - Choose your GitHub account
   - Select `glownatura-backend` repository
   - Click "Connect"

3. **Render will automatically detect `render.yaml`**
   - Service name: `glownatura-backend`
   - Environment: Node
   - Build command: `npm install`
   - Start command: `npm start`

4. **Click "Apply"**
   - Render will create the service
   - ⚠️ **DON'T DEPLOY YET** - You need to set environment variables first!

---

#### Option B: Manual Setup (Alternative)

1. **Go to Render Dashboard**
   - Visit https://dashboard.render.com
   - Click "New +" → "Web Service"

2. **Connect Repository**
   - Select "Connect a repository"
   - Choose your GitHub account
   - Select `glownatura-backend` repository

3. **Configure Service**
   - **Name:** `glownatura-backend`
   - **Region:** Ohio (or closest to your users)
   - **Branch:** `main`
   - **Root Directory:** (leave blank)
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free (or choose paid plan)

4. **Advanced Settings**
   - **Health Check Path:** `/health`
   - **Auto-Deploy:** Yes

---

### Step 3: Configure Environment Variables

⚠️ **CRITICAL:** Set these BEFORE first deployment!

1. **In Render Dashboard, go to your service**
2. **Click "Environment" tab**
3. **Add the following environment variables:**

#### Required Variables

```env
# Server Configuration
NODE_ENV=production
PORT=5000

# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/glownatura?retryWrites=true&w=majority

# JWT Configuration (Generate a secure 32+ character string)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long-here-production
JWT_EXPIRE=30d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Brevo Email Service
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=your-brevo-smtp-login
BREVO_SMTP_PASSWORD=your-brevo-smtp-password
BREVO_API_KEY=your-brevo-api-key
FROM_EMAIL=orders@glownaturas.com
FROM_NAME=GlowNaturas

# Admin Configuration
COMPANY_EMAIL_DOMAIN=glownatura.com

# Frontend URLs (Update after frontend deployment)
FRONTEND_URL=https://your-frontend.vercel.app
ADMIN_URL=https://your-admin.vercel.app
```

4. **Click "Save Changes"**

---

### Step 4: Generate Secure JWT Secret

```bash
# In PowerShell, generate a secure random string:
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

Copy the output and use it as your `JWT_SECRET`.

---

### Step 5: MongoDB Atlas Setup

If you don't have MongoDB Atlas set up:

1. **Go to https://www.mongodb.com/cloud/atlas**
2. **Create free account and cluster**
3. **Create database user**
   - Database Access → Add New Database User
   - Username: `glownatura_admin`
   - Password: (generate secure password)

4. **Whitelist Render's IP**
   - Network Access → Add IP Address
   - **Allow Access from Anywhere:** `0.0.0.0/0`
   - (Render uses dynamic IPs, so this is required)

5. **Get Connection String**
   - Clusters → Connect → Connect your application
   - Copy the connection string
   - Replace `<password>` with your database password
   - Replace `<dbname>` with `glownatura`

---

### Step 6: Deploy Your Service

1. **In Render Dashboard:**
   - Click "Manual Deploy" → "Deploy latest commit"
   - OR wait for auto-deploy (if enabled)

2. **Monitor Deployment**
   - Watch the build logs
   - Build time: ~2-3 minutes
   - Look for:
     ```
     ==> Build successful 🎉
     ==> Deploying...
     ==> Your service is live 🎉
     ```

3. **Check Health**
   - Once deployed, click on your service URL
   - Add `/health` to the URL
   - You should see:
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

---

### Step 7: Test Your Deployment

#### Test 1: Health Check
```bash
curl https://your-app-name.onrender.com/health
```

#### Test 2: Root Endpoint
```bash
curl https://your-app-name.onrender.com/
```

#### Test 3: Register Admin
```bash
curl -X POST https://your-app-name.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@glownatura.com",
    "password": "SecurePassword123!@#"
  }'
```

---

## POST-DEPLOYMENT STEPS

### 1. Update Frontend URLs

Once your frontend is deployed:

1. Go to Render Dashboard → Environment
2. Update:
   - `FRONTEND_URL`: Your Vercel/Netlify frontend URL
   - `ADMIN_URL`: Your admin panel URL
3. Click "Save Changes" (will trigger re-deploy)

### 2. Set Up Custom Domain (Optional)

1. In Render Dashboard → Settings
2. Click "Add Custom Domain"
3. Enter your domain: `api.glownaturas.com`
4. Add DNS records as shown:
   ```
   Type: CNAME
   Name: api
   Value: your-app-name.onrender.com
   ```

### 3. Enable CORS for Production

Your CORS is already configured in `src/middleware/cors.js` to use environment variables. Just ensure your frontend URLs are correct.

### 4. Monitor Your Application

- **Logs:** Render Dashboard → Logs
- **Metrics:** Render Dashboard → Metrics
- **Health Check:** Monitor `/health` endpoint
- **Uptime Monitoring:** Consider using UptimeRobot or Pingdom

---

## TROUBLESHOOTING

### Issue 1: Build Fails

**Error:** `npm ERR! Cannot find module`

**Solution:**
```bash
# Delete node_modules and package-lock.json locally
rm -rf node_modules package-lock.json
npm install
git add .
git commit -m "Fix dependencies"
git push
```

---

### Issue 2: Environment Variables Not Working

**Solution:**
1. Verify all variables are set in Render Dashboard
2. Check for typos in variable names
3. Re-deploy after adding/changing variables

---

### Issue 3: MongoDB Connection Failed

**Error:** `MongoServerError: bad auth`

**Solution:**
1. Verify MongoDB Atlas credentials
2. Check IP whitelist includes `0.0.0.0/0`
3. Ensure database user has read/write permissions
4. Verify connection string format

---

### Issue 4: Health Check Fails

**Solution:**
1. Check logs in Render Dashboard
2. Verify `PORT` environment variable is set to `5000`
3. Ensure server is starting correctly
4. Check for missing environment variables

---

### Issue 5: Free Tier Spin Down

⚠️ **Render Free Tier Limitation:**
- Services spin down after 15 minutes of inactivity
- First request after spin-down takes ~30-60 seconds

**Solutions:**
1. Upgrade to paid plan ($7/month for always-on)
2. Use a cron job to ping your API every 10 minutes
3. Use UptimeRobot free tier to keep service warm

---

## RENDER FREE TIER LIMITATIONS

- ✅ 750 hours/month free (enough for 1 service 24/7)
- ⚠️ Spins down after 15 min inactivity
- ✅ Custom domains supported
- ✅ Automatic HTTPS
- ⚠️ Limited to 512 MB RAM
- ⚠️ Shared CPU

**Recommended for:**
- Development
- Testing
- Low-traffic production apps

**Upgrade to Starter ($7/mo) for:**
- Always-on service
- More RAM (1 GB)
- Dedicated CPU

---

## MONITORING COMMANDS

### Check Service Status
```bash
# Health check
curl https://your-app.onrender.com/health

# Full server info
curl https://your-app.onrender.com/
```

### View Logs (via Render Dashboard)
1. Go to your service
2. Click "Logs" tab
3. Real-time log streaming

### Performance Monitoring
1. Go to your service
2. Click "Metrics" tab
3. View CPU, Memory, HTTP metrics

---

## SECURITY CHECKLIST

Before going to production:

- [x] All environment variables set as secrets
- [x] MongoDB IP whitelist configured
- [x] JWT secret is 32+ characters
- [x] CORS configured with actual frontend URLs
- [x] HTTPS enabled (automatic on Render)
- [x] Health check endpoint working
- [x] Rate limiting active
- [x] Input validation enabled
- [x] Winston logging configured
- [x] Graceful shutdown implemented

---

## BACKUP & ROLLBACK

### Create Manual Backup
```bash
# In Render Dashboard
1. Go to your service
2. Click "Manual Deploy"
3. Save the commit SHA for rollback
```

### Rollback to Previous Version
```bash
# In Render Dashboard
1. Go to "Deploys" tab
2. Find the working deployment
3. Click "Redeploy"
```

---

## COST ESTIMATION

### Free Tier (Current Setup)
- **Cost:** $0/month
- **Services:** 1 web service
- **Limitations:** Spins down after inactivity

### Recommended Production Setup
- **Web Service (Starter):** $7/month
- **PostgreSQL (if needed):** $7/month
- **Redis (if needed):** $5/month
- **Total:** $7-19/month

---

## DEPLOYMENT CHECKLIST

- [ ] Repository pushed to GitHub
- [ ] `render.yaml` file in root directory
- [ ] All environment variables ready
- [ ] MongoDB Atlas database created
- [ ] Cloudinary account set up
- [ ] Brevo email account configured
- [ ] Render account created
- [ ] Repository connected to Render
- [ ] Environment variables set in Render
- [ ] Service deployed successfully
- [ ] Health check passing
- [ ] Test API endpoints working
- [ ] Frontend URLs updated
- [ ] CORS configured correctly

---

## NEXT STEPS

1. ✅ Deploy backend to Render (you're here)
2. Deploy frontend to Vercel/Netlify
3. Deploy admin panel to Vercel/Netlify
4. Update environment URLs
5. Set up custom domain
6. Configure monitoring
7. Set up automated backups
8. Launch! 🚀

---

## SUPPORT & RESOURCES

- **Render Docs:** https://render.com/docs
- **MongoDB Atlas:** https://www.mongodb.com/docs/atlas/
- **Cloudinary:** https://cloudinary.com/documentation
- **Brevo:** https://developers.brevo.com/

---

**Your GlowNatura backend is production-ready!** 🎉

For any deployment issues, check the Render logs and refer to this guide.

