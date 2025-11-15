# PRE-DEPLOYMENT CHECKLIST - GLOWNATURA BACKEND

Complete this checklist before deploying to Render to ensure a smooth deployment.

---

## 1. CODE PREPARATION

- [x] All code committed to Git
- [x] `render.yaml` file created in root directory
- [x] `.gitignore` properly configured (`.env` excluded)
- [x] `package.json` has correct `start` script
- [x] No `console.*` statements (all using Winston)
- [x] All security features enabled
- [x] Health check endpoint working (`/health`)

**Verify:**
```bash
# Check if render.yaml exists
ls render.yaml

# Check package.json start script
Get-Content package.json | Select-String "start"

# Test health endpoint locally
curl http://localhost:5000/health
```

---

## 2. GITHUB REPOSITORY

- [ ] GitHub account created
- [ ] New repository created: `glownatura-backend`
- [ ] Repository is public or Render has access
- [ ] Code pushed to `main` branch
- [ ] All files committed (except `.env`)

**Commands:**
```bash
git init
git add .
git commit -m "Deploy GlowNatura Backend v5.1.0 to Render"
git remote add origin https://github.com/YOUR_USERNAME/glownatura-backend.git
git branch -M main
git push -u origin main
```

---

## 3. MONGODB ATLAS SETUP

- [ ] MongoDB Atlas account created (https://www.mongodb.com/cloud/atlas)
- [ ] Free cluster created
- [ ] Database user created with username/password
- [ ] IP whitelist set to `0.0.0.0/0` (allow all)
- [ ] Database name: `glownatura`
- [ ] Connection string copied

**Get Connection String:**
1. MongoDB Atlas → Clusters → Connect
2. Choose "Connect your application"
3. Copy connection string
4. Replace `<password>` with your database password
5. Replace `myFirstDatabase` with `glownatura`

**Example:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/glownatura?retryWrites=true&w=majority
```

---

## 4. CLOUDINARY SETUP

- [ ] Cloudinary account created (https://cloudinary.com)
- [ ] Cloud name noted
- [ ] API Key copied
- [ ] API Secret copied

**Get Credentials:**
1. Go to https://cloudinary.com/console
2. Copy these values from Dashboard:
   - Cloud name
   - API Key
   - API Secret

---

## 5. BREVO EMAIL SETUP

- [ ] Brevo account created (https://www.brevo.com)
- [ ] SMTP credentials created
- [ ] API key generated
- [ ] Sender email verified

**Get Credentials:**
1. Go to https://app.brevo.com
2. Settings → SMTP & API
3. Copy:
   - SMTP Server: `smtp-relay.brevo.com`
   - Port: `587`
   - Login (username)
   - Password
   - API Key (create new if needed)

---

## 6. ENVIRONMENT VARIABLES READY

- [ ] `JWT_SECRET` generated (64 characters)
- [ ] `MONGODB_URI` from Atlas
- [ ] `CLOUDINARY_*` credentials
- [ ] `BREVO_SMTP_*` credentials
- [ ] `FROM_EMAIL` decided
- [ ] `COMPANY_EMAIL_DOMAIN` confirmed
- [ ] `FRONTEND_URL` prepared (or placeholder)
- [ ] `ADMIN_URL` prepared (or placeholder)

**Generate JWT Secret:**
```bash
# Run this PowerShell script:
.\generate-jwt-secret.ps1

# Or run this command:
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

---

## 7. RENDER ACCOUNT

- [ ] Render account created (https://render.com)
- [ ] GitHub connected to Render
- [ ] Payment method added (even for free tier)
- [ ] Dashboard accessible

**Sign Up:**
1. Go to https://render.com
2. Click "Get Started"
3. Sign up with GitHub
4. Verify email

---

## 8. DEPLOYMENT PREPARATION

- [ ] `deploy-to-render.md` guide reviewed
- [ ] `RENDER_DEPLOYMENT_GUIDE.md` read
- [ ] All credentials documented securely
- [ ] Deployment time allocated (15-20 minutes)
- [ ] Backup of local `.env` file created

---

## 9. POST-DEPLOYMENT CHECKLIST

After deployment, verify:

- [ ] Service deployed successfully
- [ ] Health check passing (`/health` returns `"status": "healthy"`)
- [ ] MongoDB connected (`"mongodb": {"status": "connected"}`)
- [ ] No errors in Render logs
- [ ] Root endpoint accessible
- [ ] Can register admin user
- [ ] Email sending works (check spam folder)
- [ ] Image upload to Cloudinary works
- [ ] All API endpoints responding

**Test Commands:**
```bash
# Replace YOUR-APP-NAME with your Render service name
curl https://YOUR-APP-NAME.onrender.com/health
curl https://YOUR-APP-NAME.onrender.com/

# Test registration
curl -X POST https://YOUR-APP-NAME.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@glownatura.com","password":"Test123!@#"}'
```

---

## 10. FINAL VERIFICATION

- [ ] API base URL noted and shared with frontend team
- [ ] Admin can login successfully
- [ ] Products can be created
- [ ] Orders can be placed
- [ ] Emails are being sent
- [ ] CORS working with frontend
- [ ] Rate limiting active
- [ ] Logs being generated

---

## QUICK START COMMAND

Once everything above is checked, run:

```bash
# 1. Commit everything
git add .
git commit -m "Ready for production deployment"
git push

# 2. Generate JWT secret
.\generate-jwt-secret.ps1

# 3. Follow deploy-to-render.md guide
```

---

## TROUBLESHOOTING RESOURCES

If you encounter issues:

1. **Build Fails:** Check `RENDER_DEPLOYMENT_GUIDE.md` → Troubleshooting
2. **MongoDB Error:** Verify IP whitelist and credentials
3. **Environment Variables:** Double-check all variable names (case-sensitive)
4. **Logs:** Render Dashboard → Logs tab for real-time errors

---

## SUPPORT CONTACTS

- **Render Support:** https://render.com/docs/support
- **MongoDB Atlas Support:** https://www.mongodb.com/support
- **Cloudinary Support:** https://support.cloudinary.com
- **Brevo Support:** https://www.brevo.com/support/

---

## ESTIMATED COSTS

### Free Tier (First Month)
- Render Web Service: **FREE** (with limitations)
- MongoDB Atlas: **FREE** (512MB storage)
- Cloudinary: **FREE** (25 credits/month)
- Brevo: **FREE** (300 emails/day)
- **Total: $0/month** ✅

### Recommended Production (After Launch)
- Render Starter: **$7/month**
- MongoDB Atlas M0: **FREE**
- Cloudinary: **$0-89/month** (pay-as-you-go)
- Brevo: **$0-25/month** (based on emails)
- **Total: ~$7-40/month**

---

## READY TO DEPLOY?

✅ If all items above are checked, you're ready!

**Next Steps:**
1. Open `deploy-to-render.md`
2. Follow the 5-step guide
3. Deploy in under 15 minutes
4. Your API will be live! 🚀

---

**Good luck with your deployment!** 🎉

If you need help, refer to the comprehensive `RENDER_DEPLOYMENT_GUIDE.md`.

