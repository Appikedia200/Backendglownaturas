# GlowNaturas Backend - Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites

- Node.js v18+ installed
- MongoDB Atlas account (or connection string)
- Terminal access

---

## Step 1: Install Dependencies

```bash
npm install
```

**Expected Output:** All packages installed successfully

---

## Step 2: Configure Environment

The `.env` file is already configured with your credentials. Verify it contains:

- ✅ MongoDB URI
- ✅ JWT Secret
- ✅ Cloudinary credentials
- ✅ Brevo SMTP credentials

**No action needed** - already configured!

---

## Step 3: Seed Database

```bash
npm run seed
```

**What this does:**
- Creates 5 product categories
- Creates 6 sample products
- Creates superadmin account
- Sets up default settings

**Credentials created:**
```
Email: admin@glownaturas.com
Password: Admin123456
```

**⚠️ Change this password after first login!**

---

## Step 4: Start Development Server

```bash
npm run dev
```

**Server will start at:** `http://localhost:5000`

**You'll see:**
```
========================================
GlowNaturas API - Production Ready
Port: 5000
Environment: development
URL: http://localhost:5000
========================================

MongoDB Connected: cluster0.wcdkzxx.mongodb.net
Database: glownatura
Cloudinary configured
```

---

## Step 5: Test the API

### Option A: Browser

Open browser and go to: `http://localhost:5000`

**Expected response:**
```json
{
  "success": true,
  "message": "GlowNaturas API - Complete Production System",
  "version": "1.0.0",
  "endpoints": { ... }
}
```

### Option B: cURL

```bash
curl http://localhost:5000
```

### Option C: Test Login

**Using PowerShell:**
```powershell
$body = @{
    email = "admin@glownaturas.com"
    password = "Admin123456"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:5000/api/auth/login -Method POST -Body $body -ContentType "application/json"
```

**Using cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@glownaturas.com","password":"Admin123456"}'
```

**Expected:** You'll receive a JWT token!

---

## Step 6: Import to API Client

### Postman/Thunder Client

**Base URL:** `http://localhost:5000`

**Quick Test Requests:**

1. **Login** (POST `/api/auth/login`)
   ```json
   {
     "email": "admin@glownaturas.com",
     "password": "Admin123456"
   }
   ```

2. **Get Products** (GET `/api/products`)
   - No auth required

3. **Get Dashboard Stats** (GET `/api/dashboard/stats`)
   - Requires: `Authorization: Bearer YOUR_TOKEN`

---

## Project Structure

```
Backend Championsupermarket/
├── src/
│   ├── models/          # Database models (7 files)
│   ├── routes/          # API routes (8 files)
│   ├── controllers/     # Business logic (8 files)
│   ├── middleware/      # Auth, validation, etc (5 files)
│   ├── config/          # Configurations (4 files)
│   ├── utils/           # Helper functions (4 files)
│   ├── server.js        # Main application
│   └── seed.js          # Database seeder
├── uploads/             # Temporary file storage
├── .env                 # Environment variables
├── package.json
├── README.md
├── API_DOCUMENTATION.md
├── TESTING_GUIDE.md
└── DEPLOYMENT.md
```

---

## Available Scripts

```bash
# Start development server (with nodemon)
npm run dev

# Start production server
npm start

# Seed database
npm run seed
```

---

## API Endpoints Overview

### Public Endpoints (No Auth Required)
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET /api/products` - List products
- `GET /api/products/:id` - Get product
- `GET /api/categories` - List categories
- `POST /api/orders` - Create order
- `POST /api/reviews` - Submit review
- `GET /api/settings` - Get settings

### Protected Endpoints (Auth Required)
- `GET /api/dashboard/*` - Dashboard stats
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `POST /api/media` - Upload media
- `PUT /api/orders/:id/status` - Update order
- All admin management endpoints

---

## Common Tasks

### Create a New Product

1. **Get category ID:**
   ```
   GET http://localhost:5000/api/categories
   ```

2. **Generate SKU (optional):**
   ```
   GET http://localhost:5000/api/products/generate-sku?categoryId=CATEGORY_ID
   Headers: Authorization: Bearer TOKEN
   ```

3. **Create product:**
   ```
   POST http://localhost:5000/api/products
   Headers: Authorization: Bearer TOKEN
   Body: {
     "name": "Product Name",
     "description": "Description",
     "price": 5000,
     "category": "CATEGORY_ID",
     "stock": 100,
     "status": "active"
   }
   ```

### Process an Order

1. **Customer creates order:**
   ```
   POST http://localhost:5000/api/orders
   Body: { customer info, items, payment method }
   ```

2. **Admin updates status:**
   ```
   PUT http://localhost:5000/api/orders/ORDER_ID/status
   Headers: Authorization: Bearer TOKEN
   Body: { "status": "processing" }
   ```

3. **Admin marks as paid:**
   ```
   PUT http://localhost:5000/api/orders/ORDER_ID/payment-status
   Headers: Authorization: Bearer TOKEN
   Body: { "paymentStatus": "paid" }
   ```

### Upload Product Image

1. **Upload to media library:**
   ```
   POST http://localhost:5000/api/media
   Headers: Authorization: Bearer TOKEN
   Content-Type: multipart/form-data
   Form Data:
     file: [select image]
     folder: products
     alt: Product image
   ```

2. **Get media ID from response**

3. **Add to product:**
   ```
   PUT http://localhost:5000/api/products/PRODUCT_ID
   Headers: Authorization: Bearer TOKEN
   Body: {
     "images": [
       {
         "mediaId": "MEDIA_ID",
         "isPrimary": true,
         "order": 0
       }
     ]
   }
   ```

---

## Troubleshooting

### Server won't start
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Kill process if needed (Windows)
taskkill /PID <PID> /F

# Or use different port
# Edit .env: PORT=5001
```

### Database connection error
```bash
# Verify MongoDB URI in .env
# Check MongoDB Atlas network access
# Ensure IP is whitelisted (0.0.0.0/0 for testing)
```

### JWT secret error
```bash
# Generate new secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Update JWT_SECRET in .env
```

### Cloudinary upload fails
```bash
# Verify credentials in .env:
# - CLOUDINARY_CLOUD_NAME
# - CLOUDINARY_API_KEY
# - CLOUDINARY_API_SECRET
```

---

## Next Steps

1. ✅ **Read API Documentation:** `API_DOCUMENTATION.md`
2. ✅ **Try Testing Guide:** `TESTING_GUIDE.md`
3. ✅ **Plan Deployment:** `DEPLOYMENT.md`
4. ✅ **Connect Frontend:** Use the JWT token from login
5. ✅ **Customize:** Add your own products, categories, settings

---

## Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Main documentation |
| `API_DOCUMENTATION.md` | Complete API reference |
| `TESTING_GUIDE.md` | Testing scenarios |
| `DEPLOYMENT.md` | Production deployment |
| `QUICK_START.md` | This file |

---

## Support

- **Documentation:** Check the markdown files
- **Issues:** Review error messages carefully
- **Questions:** admin@glownaturas.com

---

## Success Indicators

✅ Server starts without errors
✅ MongoDB connects successfully
✅ Cloudinary configured
✅ Login returns JWT token
✅ Products endpoint returns data
✅ Dashboard shows statistics

**If all checks pass, you're ready to integrate with frontend!**

---

**Happy Coding! 🚀**

