# QUICK TEST GUIDE - GlowNatura Auth System v5.0

## 🚀 QUICK START TESTING

### 1️⃣ REGISTRATION
```powershell
$body = @{
    name = "Your Name"
    email = "youremail@glownatura.com"
    password = "yourpassword123"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:5000/api/auth/register `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

**Expected:** Success message + verification email sent

---

### 2️⃣ EMAIL VERIFICATION
Check your email inbox for the verification link and click it.

**OR** Use resend endpoint:
```powershell
$body = @{
    email = "youremail@glownatura.com"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:5000/api/auth/resend-verification `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

---

### 3️⃣ LOGIN
```powershell
$body = @{
    email = "youremail@glownatura.com"
    password = "yourpassword123"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri http://localhost:5000/api/auth/login `
    -Method POST `
    -Body $body `
    -ContentType "application/json" | ConvertFrom-Json

# Save token for protected routes
$token = $response.token
Write-Host "Token: $token"
```

**Expected:** JWT token + admin data

---

### 4️⃣ GET CURRENT ADMIN (Protected)
```powershell
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-WebRequest -Uri http://localhost:5000/api/auth/me `
    -Method GET `
    -Headers $headers
```

---

### 5️⃣ UPDATE PROFILE (Protected)
```powershell
$headers = @{
    Authorization = "Bearer $token"
}

$body = @{
    name = "New Name"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:5000/api/auth/profile `
    -Method PUT `
    -Headers $headers `
    -Body $body `
    -ContentType "application/json"
```

---

### 6️⃣ CHANGE PASSWORD (Protected)
```powershell
$headers = @{
    Authorization = "Bearer $token"
}

$body = @{
    currentPassword = "yourpassword123"
    newPassword = "newpassword456"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:5000/api/auth/change-password `
    -Method PUT `
    -Headers $headers `
    -Body $body `
    -ContentType "application/json"
```

---

### 7️⃣ FORGOT PASSWORD
```powershell
$body = @{
    email = "youremail@glownatura.com"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:5000/api/auth/forgot-password `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

**Expected:** Success message + reset email sent

---

### 8️⃣ RESET PASSWORD
```powershell
$body = @{
    token = "TOKEN_FROM_EMAIL"
    newPassword = "resetpassword789"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:5000/api/auth/reset-password `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

---

### 9️⃣ LOGOUT (Protected)
```powershell
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-WebRequest -Uri http://localhost:5000/api/auth/logout `
    -Method POST `
    -Headers $headers
```

---

## 🧪 TESTING EDGE CASES

### Invalid Email Domain
```powershell
$body = @{
    name = "Test User"
    email = "test@gmail.com"
    password = "password123"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:5000/api/auth/register `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```
**Expected:** Error - "Please use your company email address"

---

### Login Before Verification
```powershell
# Register, then immediately try to login
$body = @{
    email = "unverified@glownatura.com"
    password = "password123"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:5000/api/auth/login `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```
**Expected:** Error - "Please verify your email"

---

### Invalid Token (Protected Route)
```powershell
$headers = @{
    Authorization = "Bearer invalid.token.here"
}

Invoke-WebRequest -Uri http://localhost:5000/api/auth/me `
    -Method GET `
    -Headers $headers
```
**Expected:** 401 - "Not authorized. Invalid token."

---

### Account Locking (5 Failed Attempts)
```powershell
# Try wrong password 6 times
for ($i = 1; $i -le 6; $i++) {
    $body = @{
        email = "youremail@glownatura.com"
        password = "wrongpassword"
    } | ConvertTo-Json
    
    Write-Host "Attempt $i"
    Invoke-WebRequest -Uri http://localhost:5000/api/auth/login `
        -Method POST `
        -Body $body `
        -ContentType "application/json" -ErrorAction SilentlyContinue
    
    Start-Sleep -Milliseconds 500
}
```
**Expected:** After 5th attempt - "Too many authentication attempts"

---

## 📊 CHECK LOGS

### View Application Logs
```powershell
Get-Content "logs\combined-2025-11-14.log" -Tail 50
```

### View Error Logs
```powershell
Get-Content "logs\error-2025-11-14.log" -Tail 20
```

### Search Logs
```powershell
Get-Content "logs\combined-2025-11-14.log" | Select-String "login"
```

---

## 🔍 CHECK DATABASE

### View All Admins
```powershell
node -e "require('dotenv').config(); const mongoose = require('mongoose'); const Admin = require('./src/models/Admin'); mongoose.connect(process.env.MONGODB_URI).then(async () => { const admins = await Admin.find().select('-password'); console.log(JSON.stringify(admins, null, 2)); process.exit(0); });"
```

### Check Admin Audit Logs
```powershell
node -e "require('dotenv').config(); const mongoose = require('mongoose'); const AdminLog = require('./src/models/AdminLog'); mongoose.connect(process.env.MONGODB_URI).then(async () => { const logs = await AdminLog.find().sort({createdAt: -1}).limit(10).populate('admin', 'name email'); console.log(JSON.stringify(logs, null, 2)); process.exit(0); });"
```

---

## 🎯 EXPECTED RESULTS

| Test | HTTP Status | Success Field |
|------|-------------|---------------|
| Registration | 201 | true |
| Login (verified) | 200 | true |
| Login (unverified) | 401 | false |
| Protected + valid token | 200 | true |
| Protected + no token | 401 | false |
| Protected + invalid token | 401 | false |
| Update profile | 200 | true |
| Change password | 200 | true |
| Forgot password | 200 | true |
| Reset password | 200 | true |
| Logout | 200 | true |

---

## ⚠️ IMPORTANT NOTES

1. **Rate Limiting:** Auth endpoints limited to 5 requests per 15 minutes
2. **Company Email:** Only @glownatura.com emails allowed (configurable in .env)
3. **Email Verification:** Required before login
4. **Account Lock:** 5 failed attempts = 2-hour lock
5. **Token Expiry:** JWT = 7 days, Verification = 24h, Reset = 1h

---

## 🆘 TROUBLESHOOTING

### "Too many authentication attempts"
**Cause:** Rate limiter active  
**Solution:** Wait 15 minutes or restart server (development only)

### "Please verify your email"
**Cause:** Email not verified  
**Solution:** Check email for verification link or use resend endpoint

### "Account temporarily locked"
**Cause:** 5 failed login attempts  
**Solution:** Wait 2 hours or use forgot password to unlock

### "Not authorized"
**Cause:** Invalid/expired JWT token  
**Solution:** Login again to get new token

---

## 📚 ADDITIONAL RESOURCES

- Full Documentation: `COMPLETE_AUTH_IMPLEMENTATION_v5.0.md`
- Test Report: `TESTING_REPORT_v5.0.md`
- API Reference: `API_DOCUMENTATION.md`
- Server Code: `src/controllers/authController.js`

---

**Happy Testing! 🚀**

