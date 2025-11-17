# CURSOR PROMPT - Configuration Fixes (CORRECTED)

**Date:** November 17, 2025
**Context:** Backend is DEPLOYED on Render. Admin panel runs locally and calls deployed backend.

---

## 🎯 CURRENT SETUP

- ✅ **Backend:** Deployed on Render at `https://backendglownaturas.onrender.com`
- 🔧 **Admin Panel:** Runs locally on `http://localhost:3001` (not deployed yet)
- ✅ **Backend SMTP:** Configured correctly with Brevo

---

## 🔴 ISSUES TO FIX

### Issue #1: Backend ADMIN_URL Points to Wrong URL

**File:** `/home/user/Backendglownaturas/.env` (Line 25)

**Current (WRONG):**
```env
ADMIN_URL=https://admin-panel-j98.pages.dev
```

**Change to:**
```env
ADMIN_URL=http://localhost:3001
```

**Why:**
- Admin panel is NOT hosted yet - it runs locally on port 3001
- When backend sends verification emails, the link should point to local admin panel
- Email verification link will be: `http://localhost:3001/verify-email?token=...`
- This allows you to test registration locally

**Later (when admin panel is deployed):**
- Update this to the actual hosted URL
- Also update in Render dashboard environment variables

---

### Issue #2: Admin Panel - Wrong Default Backend URL

**File:** `/home/user/AdminPanel/src/infrastructure/config/constants.ts` (Line 3)

**Current (WRONG):**
```typescript
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
```

**Change to:**
```typescript
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backendglownaturas.onrender.com'
```

**Why:**
- Backend is deployed on Render, not running locally
- Admin panel should call Render backend
- Fallback URL should be the deployed Render URL
- Current fallback `localhost:3000` is completely wrong

---

### Issue #3: Admin Panel - Create Environment File

**File:** `/home/user/AdminPanel/.env.local` (CREATE THIS FILE)

**Create with:**
```env
# Backend API URL - deployed Render backend
NEXT_PUBLIC_API_URL=https://backendglownaturas.onrender.com

# Node Environment
NODE_ENV=development
```

**Why:**
- Explicitly sets backend URL to deployed Render instance
- Admin panel will call the live backend
- File is gitignored - won't be committed
- `.env.local` is Next.js convention for local development overrides

---

## 📝 SUMMARY OF CHANGES

### Total: 2 file edits + 1 file creation

**1. Edit:** `/home/user/Backendglownaturas/.env` (Line 25)
```diff
- ADMIN_URL=https://admin-panel-j98.pages.dev
+ ADMIN_URL=http://localhost:3001
```

**2. Edit:** `/home/user/AdminPanel/src/infrastructure/config/constants.ts` (Line 3)
```diff
- export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
+ export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backendglownaturas.onrender.com'
```

**3. Create:** `/home/user/AdminPanel/.env.local`
```env
NEXT_PUBLIC_API_URL=https://backendglownaturas.onrender.com
NODE_ENV=development
```

---

## ⚠️ IMPORTANT: Update Render Environment Variable

**After making these changes, you MUST update Render:**

1. Go to: https://dashboard.render.com/
2. Select your backend service (Backendglownaturas)
3. Click **Environment** tab
4. Find or add: `ADMIN_URL`
5. Set value to: `http://localhost:3001`
6. Click **Save**
7. **Restart** the backend service

**Why this is critical:**
- Render deployment overrides the `.env` file
- Environment variables in Render dashboard take precedence
- Without updating Render, verification emails will still have wrong URL

---

## 🧪 HOW TO TEST

### Step 1: Start Admin Panel Locally
```bash
cd /home/user/AdminPanel
npm install  # if not already done
npm run dev
```
**Should show:** Running on http://localhost:3001

### Step 2: Test Registration Flow
1. Open browser: `http://localhost:3001/register`
2. Fill registration form:
   - Name: Test Admin
   - Email: your-email@example.com
   - Password: Test123456
3. Click "Create account"
4. **Backend (on Render) creates account and sends email**
5. **Check email inbox** for email from `hello@glownaturas.com`
6. Email should contain link: `http://localhost:3001/verify-email?token=...`
7. Click link → Opens your local admin panel
8. Email verified → Redirected to login
9. Login with credentials
10. Dashboard loads

### Expected Flow:
```
Local Admin Panel (localhost:3001)
        ↓ (registration request)
Backend on Render (backendglownaturas.onrender.com)
        ↓ (creates account)
        ↓ (sends email via Brevo)
Email to User (from hello@glownaturas.com)
        ↓ (contains verification link)
User clicks link → http://localhost:3001/verify-email?token=...
        ↓
Local Admin Panel verifies email
        ↓ (sends verification to backend)
Backend on Render (marks email as verified)
        ↓
User can now login
```

---

## 🔍 VERIFICATION CHECKLIST

After making changes:

**Local Changes:**
- [ ] Backend `.env` has `ADMIN_URL=http://localhost:3001`
- [ ] Admin panel `constants.ts` fallback is Render URL
- [ ] Admin panel `.env.local` created with Render backend URL

**Render Dashboard:**
- [ ] Updated `ADMIN_URL` environment variable to `http://localhost:3001`
- [ ] Restarted backend service on Render

**Brevo Dashboard:**
- [ ] Verified `hello@glownaturas.com` is authorized sender

**Testing:**
- [ ] Admin panel starts on localhost:3001
- [ ] Registration creates account (check backend Render logs)
- [ ] Verification email received
- [ ] Email contains `localhost:3001` link
- [ ] Clicking link verifies email
- [ ] Login works after verification

---

## 🚨 CRITICAL: Brevo Sender Verification

**You MUST verify `hello@glownaturas.com` in Brevo:**

1. Login to Brevo: https://app.brevo.com/
2. Go to: **Settings** → **Senders & IP**
3. Check if `hello@glownaturas.com` is listed

**If NOT verified:**
- Click "Add a Sender"
- Enter: `hello@glownaturas.com`
- Brevo sends verification email to that address
- Click verification link in email
- Wait for approval (usually instant)

**Without this, emails will NOT be sent!**

---

## 🐛 TROUBLESHOOTING

### "Registration failed" or "Access denied"
- ✅ Check admin panel is calling Render backend (check browser Network tab)
- ✅ Verify Render backend is running (visit `https://backendglownaturas.onrender.com/`)
- ✅ Check `.env.local` has correct Render URL

### "No verification email received"
- ✅ Check `hello@glownaturas.com` is verified in Brevo
- ✅ Check spam/junk folder
- ✅ Check Render backend logs for email errors
- ✅ Verify Brevo SMTP credentials in Render environment variables

### "Verification link is broken"
- ✅ Check email source - what URL does it contain?
- ✅ Verify Render has `ADMIN_URL=http://localhost:3001`
- ✅ Restart Render backend after changing environment variable

### "Cannot connect to backend"
- ✅ Verify Render backend is awake (first request may be slow)
- ✅ Check admin panel is using `https://backendglownaturas.onrender.com`
- ✅ Open browser console for CORS or network errors

---

## 🎯 SIMPLIFIED PROMPT FOR CURSOR

```
Please make these 3 changes:

1. Edit /home/user/Backendglownaturas/.env line 25:
   Change ADMIN_URL from: https://admin-panel-j98.pages.dev
   To: http://localhost:3001

2. Edit /home/user/AdminPanel/src/infrastructure/config/constants.ts line 3:
   Change the fallback from: 'http://localhost:3000'
   To: 'https://backendglownaturas.onrender.com'

3. Create /home/user/AdminPanel/.env.local with:
   NEXT_PUBLIC_API_URL=https://backendglownaturas.onrender.com
   NODE_ENV=development

The backend is deployed on Render. Admin panel runs locally and calls the deployed backend.
```

---

## 📊 ARCHITECTURE OVERVIEW

```
┌─────────────────────────────┐
│ Admin Panel (Local)         │
│ http://localhost:3001       │
│                             │
│ - Registration form         │
│ - Email verification page   │
│ - Login page                │
│ - Dashboard                 │
└──────────┬──────────────────┘
           │
           │ API Calls (HTTPS)
           │
           ↓
┌─────────────────────────────┐
│ Backend (Render)            │
│ backendglownaturas.onrender │
│                             │
│ - User registration         │
│ - Send emails via Brevo     │
│ - Email verification        │
│ - Authentication            │
└──────────┬──────────────────┘
           │
           │ SMTP
           │
           ↓
┌─────────────────────────────┐
│ Brevo Email Service         │
│                             │
│ - Sends from:               │
│   hello@glownaturas.com     │
│                             │
│ - Email contains link:      │
│   localhost:3001/verify...  │
└─────────────────────────────┘
```

---

## 🚀 LATER: When Admin Panel is Deployed

When you deploy admin panel to Cloudflare Pages/Vercel:

**Update Backend (Render Dashboard):**
```env
ADMIN_URL=https://your-admin-panel-url.com
```

**Admin panel will automatically use Render backend because:**
- Environment variable is set
- Fallback is also Render URL
- No changes needed to admin panel code

---

## ✅ FINAL CHECKLIST

Before testing:

**Code Changes (Cursor will do):**
- [ ] Backend .env updated with localhost:3001
- [ ] Admin panel constants.ts updated with Render URL
- [ ] Admin panel .env.local created with Render URL

**Manual Steps (You must do):**
- [ ] Update ADMIN_URL in Render dashboard to localhost:3001
- [ ] Restart Render backend service
- [ ] Verify hello@glownaturas.com in Brevo dashboard
- [ ] Start admin panel locally: `npm run dev`

**Testing:**
- [ ] Register test account
- [ ] Receive email
- [ ] Click verification link
- [ ] Email verified
- [ ] Login successful

---

**Status:** Ready for implementation
**Priority:** High - blocks testing
**Time:** 5 minutes (3 changes + Render update)
