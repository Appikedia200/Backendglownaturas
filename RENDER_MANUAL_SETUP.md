# RENDER MANUAL SETUP - STEP BY STEP

If you're getting errors with the Blueprint (render.yaml) approach, use this manual setup method instead.

---

## STEP 1: CREATE WEB SERVICE MANUALLY

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com
   - Click "New +" button (top right)
   - Select **"Web Service"** (NOT Blueprint)

2. **Connect Your Repository**
   - Click "Connect a repository"
   - Choose your GitHub account
   - Find and select: `glownatura-backend`
   - Click "Connect"

---

## STEP 2: CONFIGURE SERVICE SETTINGS

Fill in these fields EXACTLY as shown:

### Basic Settings
- **Name:** `glownatura-backend`
- **Region:** Ohio (US East)
- **Branch:** `main`
- **Root Directory:** (leave blank)

### Build Settings
- **Runtime:** Node
- **Build Command:** `npm install`
- **Start Command:** `npm start`

### Plan
- **Instance Type:** Free

---

## STEP 3: ADD ENVIRONMENT VARIABLES

**IMPORTANT:** Add these BEFORE clicking "Create Web Service"

Click "Advanced" button, then scroll to "Environment Variables"

### Add These Variables (One by One):

```
NODE_ENV=production
PORT=5000
JWT_EXPIRE=30d
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
FROM_EMAIL=orders@glownaturas.com
FROM_NAME=GlowNaturas
COMPANY_EMAIL_DOMAIN=glownatura.com
FRONTEND_URL=https://your-frontend.vercel.app
ADMIN_URL=https://your-admin.vercel.app
```

### Add These SECRET Variables:
(Click "Add Environment Variable" for each)

**MongoDB:**
- Key: `MONGODB_URI`
- Value: `your-mongodb-atlas-connection-string`

**JWT:**
- Key: `JWT_SECRET`
- Value: `(generate using the PowerShell script)`

**Cloudinary:**
- Key: `CLOUDINARY_CLOUD_NAME`
- Value: `your-cloud-name`

- Key: `CLOUDINARY_API_KEY`
- Value: `your-api-key`

- Key: `CLOUDINARY_API_SECRET`
- Value: `your-api-secret`

**Brevo Email:**
- Key: `BREVO_SMTP_USER`
- Value: `your-brevo-smtp-login`

- Key: `BREVO_SMTP_PASSWORD`
- Value: `your-brevo-smtp-password`

- Key: `BREVO_API_KEY`
- Value: `your-brevo-api-key`

---

## STEP 4: CONFIGURE ADVANCED SETTINGS

Still in the "Advanced" section:

### Health Check
- **Health Check Path:** `/health`

### Auto-Deploy
- **Auto-Deploy:** Yes (toggle ON)

---

## STEP 5: CREATE SERVICE

1. **Review all settings**
2. **Click "Create Web Service"** button at the bottom
3. **Wait for deployment** (2-3 minutes)

---

## STEP 6: VERIFY DEPLOYMENT

Once deployed:

1. Click on your service URL (something like: `glownatura-backend.onrender.com`)
2. Add `/health` to the URL
3. You should see:
```json
{
  "status": "healthy",
  "version": "5.1.0",
  "dependencies": {
    "mongodb": {
      "status": "connected"
    }
  }
}
```

---

## TROUBLESHOOTING

### If Build Fails:
1. Go to "Logs" tab
2. Look for the error message
3. Common issues:
   - Missing `package.json` (check GitHub)
   - Wrong Node version (add `"engines": {"node": ">=18.0.0"}` to package.json)

### If Deploy Fails:
1. Check "Environment" tab
2. Verify all required variables are set
3. Check MongoDB Atlas:
   - IP Whitelist: `0.0.0.0/0`
   - Database user has read/write permissions

### If Health Check Fails:
1. Verify `PORT=5000` in environment variables
2. Check logs for startup errors
3. Ensure `/health` endpoint exists in your code

---

## ALTERNATIVE: SKIP CARD VERIFICATION TEMPORARILY

If the card verification is blocking you:

1. **Use Manual Setup Above** (it might not require card immediately)
2. **Or contact Render Support:**
   - Email: support@render.com
   - Explain the issue with card verification
   - They can manually verify your account

---

## NEED HELP?

If you encounter specific errors:
1. Take a screenshot of the error
2. Copy the error message from Logs tab
3. Share it for specific troubleshooting

---

**This manual setup method bypasses the render.yaml Blueprint and often works better for first-time deployments.**

