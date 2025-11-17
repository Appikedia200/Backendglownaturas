# CURSOR PROMPT - Final Configuration Fixes

**Date:** November 17, 2025
**Status:** Ready for implementation
**Context:** Backend SMTP is configured correctly. Admin panel needs environment setup for local development.

---

## ✅ BACKGROUND - What's Already Working

### Backend Email System (Brevo SMTP):
- ✅ Brevo SMTP API configured correctly using Nodemailer
- ✅ Email configuration in `/src/config/email.js`
- ✅ SMTP credentials set: `smtp-relay.brevo.com:587`
- ✅ Sender email: `hello@glownaturas.com`
- ✅ Verification emails will be sent from this address

**No changes needed to backend email code - it's perfect!**

---

## 🎯 WHAT YOU NEED TO FIX

There are **3 configuration files** that need updates for local development:

---

## FIX #1: Backend Environment Configuration

### File: `/home/user/Backendglownaturas/.env`

**Issue:**
- Line 25 has wrong ADMIN_URL (points to non-existent hosted URL)
- Admin panel is NOT hosted yet - it runs locally on port 3001

**Current (WRONG):**
```env
ADMIN_URL=https://admin-panel-j98.pages.dev
```

**Change to:**
```env
ADMIN_URL=http://localhost:3001
```

**Why:**
- Admin panel development server runs on port 3001 (see AdminPanel package.json: `"dev": "next dev --port 3001"`)
- When user registers, backend sends verification email with link like: `${ADMIN_URL}/verify-email?token=abc123`
- Currently sends: `https://admin-panel-j98.pages.dev/verify-email?token=...` (broken - doesn't exist)
- Should send: `http://localhost:3001/verify-email?token=...` (works locally)

**Impact:**
- Registration emails will have working verification links
- Links will open admin panel running on user's localhost

---

## FIX #2: Admin Panel Environment File (CREATE NEW FILE)

### File: `/home/user/AdminPanel/.env.local` (CREATE THIS FILE)

**Issue:**
- Admin panel has NO environment file
- Doesn't know where backend API is located
- Will use wrong fallback URL

**Create this file with:**
```env
# Backend API URL - points to local backend
NEXT_PUBLIC_API_URL=http://localhost:5000

# Node Environment
NODE_ENV=development
```

**Why:**
- Backend runs on port 5000 (see Backend .env: `PORT=5000`)
- Admin panel needs to call backend APIs
- File MUST be named `.env.local` (Next.js convention for local development)
- This file is gitignored - won't be committed

**Impact:**
- Admin panel will connect to backend running on localhost:5000
- All API calls (register, login, etc.) will work

---

## FIX #3: Admin Panel Constants Fallback URL

### File: `/home/user/AdminPanel/src/infrastructure/config/constants.ts`

**Issue:**
- Line 3 has wrong fallback URL for backend API
- Says `localhost:3000` but backend runs on `localhost:5000`

**Current (Line 3):**
```typescript
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
```

**Change to:**
```typescript
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
```

**Why:**
- Backend runs on port 5000, not 3000
- If environment variable is missing, it should fallback to correct port
- Safety measure in case .env.local isn't loaded

**Impact:**
- Admin panel will have correct default backend URL
- Prevents connection errors if env file is missing

---

## 📝 SUMMARY OF ALL CHANGES

### Total: 2 file edits + 1 file creation

**1. Edit:** `/home/user/Backendglownaturas/.env`
```diff
- ADMIN_URL=https://admin-panel-j98.pages.dev
+ ADMIN_URL=http://localhost:3001
```

**2. Create:** `/home/user/AdminPanel/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NODE_ENV=development
```

**3. Edit:** `/home/user/AdminPanel/src/infrastructure/config/constants.ts`
```diff
- export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
+ export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
```

---

## ⚠️ IMPORTANT: Brevo Sender Email Verification

**Action Required by User (NOT Cursor):**

The user needs to verify `hello@glownaturas.com` in Brevo dashboard:

1. Go to: https://app.brevo.com/
2. Navigate to: **Settings** → **Senders & IP**
3. Check if `hello@glownaturas.com` is listed and verified

**If NOT listed:**
- Click "Add a Sender"
- Add: `hello@glownaturas.com`
- Brevo will send verification email
- User must click verification link

**Alternative:**
- Set up domain authentication for `glownaturas.com`
- This allows sending from ANY @glownaturas.com email

**If user already has verified sender (e.g., orders@glownaturas.com):**
- Can temporarily use that in backend .env: `FROM_EMAIL=orders@glownaturas.com`

---

## 🧪 HOW TO TEST AFTER CHANGES

### Step 1: Install dependencies (if not already)
```bash
# Backend
cd /home/user/Backendglownaturas
npm install

# Admin Panel
cd /home/user/AdminPanel
npm install
```

### Step 2: Start Backend
```bash
cd /home/user/Backendglownaturas
npm run dev
```
**Should show:** Server running on http://localhost:5000

### Step 3: Start Admin Panel (in new terminal)
```bash
cd /home/user/AdminPanel
npm run dev
```
**Should show:** Server running on http://localhost:3001

### Step 4: Test Registration Flow
1. Open browser: `http://localhost:3001/register`
2. Fill in registration form:
   - Name: Test Admin
   - Email: test@youremail.com
   - Password: Test123456
   - Confirm Password: Test123456
3. Click "Create account"
4. **Should see:** Success message "Check your email for the verification link"
5. **Check email inbox** for email from `hello@glownaturas.com`
6. Email should contain link: `http://localhost:3001/verify-email?token=...`
7. **Click link** → Should open admin panel and verify email
8. **Redirected to login** page
9. **Login** with email and password
10. **Should see:** Dashboard loads successfully

### Expected Results:
- ✅ Registration creates account
- ✅ Email sent from `hello@glownaturas.com`
- ✅ Email received in inbox
- ✅ Verification link points to `localhost:3001`
- ✅ Clicking link verifies email
- ✅ Login works
- ✅ Dashboard accessible

---

## 🔍 TROUBLESHOOTING

### If registration shows "access denied":
- Check backend is running on port 5000
- Check admin panel is calling correct backend URL
- Verify `.env.local` file exists in AdminPanel

### If no email received:
- Check `hello@glownaturas.com` is verified in Brevo
- Check backend .env has correct Brevo credentials
- Check backend logs for email errors
- Check spam/junk folder

### If verification link broken:
- Verify backend .env has `ADMIN_URL=http://localhost:3001`
- Check email source to see what URL was sent

### If admin panel can't connect to backend:
- Verify admin panel `.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:5000`
- Check constants.ts fallback is `localhost:5000`
- Verify backend is running and accessible

---

## 📌 PORTS REFERENCE

**Backend:**
- Development: `http://localhost:5000`
- Production: `https://backendglownaturas.onrender.com`

**Admin Panel:**
- Development: `http://localhost:3001`
- Production: (Not hosted yet - will be hosted later)

**Customer Frontend:**
- Development: `http://localhost:3000`
- Production: `https://glownaturas.com`

---

## 🚀 LATER: When Admin Panel is Hosted

When the user deploys admin panel to Cloudflare Pages/Vercel:

**1. Update Backend .env (or Render environment variables):**
```env
ADMIN_URL=https://admin.glownaturas.com  # Actual hosted URL
```

**2. Admin Panel .env for production:**
```env
NEXT_PUBLIC_API_URL=https://backendglownaturas.onrender.com
NODE_ENV=production
```

**3. Update Render deployment:**
- Add ADMIN_URL environment variable in Render dashboard
- Restart backend service

---

## ✅ VERIFICATION CHECKLIST

After making changes, verify:

- [ ] Backend .env has `ADMIN_URL=http://localhost:3001`
- [ ] Admin panel `.env.local` exists with correct backend URL
- [ ] Admin panel constants.ts has fallback `localhost:5000`
- [ ] Backend starts successfully on port 5000
- [ ] Admin panel starts successfully on port 3001
- [ ] Registration creates account (check backend logs)
- [ ] Verification email sent (check email inbox)
- [ ] Email from `hello@glownaturas.com`
- [ ] Verification link points to `localhost:3001`
- [ ] Clicking link verifies email
- [ ] Login works after verification
- [ ] Dashboard loads after login

---

## 🎯 WHAT CURSOR SHOULD DO

**Please make these 3 changes:**

1. **Edit** `/home/user/Backendglownaturas/.env` line 25:
   - Change `ADMIN_URL` from `https://admin-panel-j98.pages.dev` to `http://localhost:3001`

2. **Create** `/home/user/AdminPanel/.env.local`:
   - Add `NEXT_PUBLIC_API_URL=http://localhost:5000`
   - Add `NODE_ENV=development`

3. **Edit** `/home/user/AdminPanel/src/infrastructure/config/constants.ts` line 3:
   - Change fallback from `http://localhost:3000` to `http://localhost:5000`

**That's it!** These are the only changes needed for local development testing.

---

**Status:** Ready for implementation
**Priority:** High - blocks user from testing registration
**Complexity:** Low - simple configuration changes
**Time Estimate:** 2 minutes

---

## 📧 NOTE TO USER

After Cursor makes these changes:
1. Verify `hello@glownaturas.com` is authorized in Brevo dashboard
2. Start both backend and admin panel
3. Test registration flow end-to-end
4. If email doesn't arrive, check Brevo sender verification

The backend SMTP code is perfect - no code changes needed, just Brevo dashboard verification!
