# GlowNaturas API Testing Guide

Complete guide for testing all API endpoints using Postman, Thunder Client, or cURL.

## Prerequisites

1. Server is running: `npm run dev`
2. Database is seeded: `npm run seed`
3. You have a REST client (Postman, Thunder Client, Insomnia, or cURL)

## Default Credentials

After seeding, use these credentials to login:

```
Email: admin@glownaturas.com
Password: Admin123456
```

## Testing Workflow

### Step 1: Get Authentication Token

First, login to get your JWT token:

**Request:**
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@glownaturas.com",
  "password": "Admin123456"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "...",
    "name": "Super Admin",
    "email": "admin@glownaturas.com",
    "role": "superadmin"
  }
}
```

**Copy the token** - you'll need it for protected endpoints.

---

### Step 2: Test Protected Endpoints

For all protected endpoints, add this header:

```
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## Test Scenarios

### Scenario 1: Complete Admin Registration Flow

**1.1 Register New Admin**
```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Test Admin",
  "email": "test@glownaturas.com",
  "password": "TestPass123"
}
```

**1.2 Check Email** (simulated)
- In production, check your email for the 6-digit code
- In development, check server console logs

**1.3 Verify Email**
```http
POST http://localhost:5000/api/auth/verify-email
Content-Type: application/json

{
  "email": "test@glownaturas.com",
  "code": "123456"
}
```

**1.4 Login**
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@glownaturas.com",
  "password": "TestPass123"
}
```

---

### Scenario 2: Product Management

**2.1 Get All Products**
```http
GET http://localhost:5000/api/products
```

**2.2 Filter Products**
```http
GET http://localhost:5000/api/products?status=active&category=CATEGORY_ID&featured=true
```

**2.3 Search Products**
```http
GET http://localhost:5000/api/products?search=vitamin
```

**2.4 Get Single Product**
```http
GET http://localhost:5000/api/products/PRODUCT_ID
```

**2.5 Generate SKU**
```http
GET http://localhost:5000/api/products/generate-sku?categoryId=CATEGORY_ID
Authorization: Bearer YOUR_TOKEN
```

**2.6 Create Product**
```http
POST http://localhost:5000/api/products
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "New Test Product",
  "description": "Test product description",
  "price": 5000,
  "category": "CATEGORY_ID",
  "stock": 100,
  "sku": "GN-TEST-001",
  "status": "active"
}
```

**2.7 Update Product**
```http
PUT http://localhost:5000/api/products/PRODUCT_ID
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Updated Product Name",
  "price": 6000,
  "stock": 90
}
```

**2.8 Delete Product**
```http
DELETE http://localhost:5000/api/products/PRODUCT_ID
Authorization: Bearer YOUR_TOKEN
```

---

### Scenario 3: Category Management

**3.1 Get All Categories**
```http
GET http://localhost:5000/api/categories
```

**3.2 Create Category**
```http
POST http://localhost:5000/api/categories
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Test Category",
  "description": "Test category description",
  "displayOrder": 10,
  "isActive": true
}
```

**3.3 Update Category**
```http
PUT http://localhost:5000/api/categories/CATEGORY_ID
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Updated Category Name",
  "displayOrder": 5
}
```

**3.4 Reorder Categories**
```http
PUT http://localhost:5000/api/categories/reorder
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "categories": [
    { "id": "CATEGORY_ID_1", "order": 1 },
    { "id": "CATEGORY_ID_2", "order": 2 }
  ]
}
```

---

### Scenario 4: Order Processing

**4.1 Create Order (Public Endpoint)**
```http
POST http://localhost:5000/api/orders
Content-Type: application/json

{
  "customer": {
    "name": "Jane Doe",
    "email": "customer@example.com",
    "phone": "+2348012345678",
    "address": "123 Main Street",
    "city": "Lagos",
    "state": "Lagos"
  },
  "items": [
    {
      "product": "PRODUCT_ID",
      "quantity": 2
    }
  ],
  "paymentMethod": "bank_transfer"
}
```

**4.2 Get All Orders**
```http
GET http://localhost:5000/api/orders
Authorization: Bearer YOUR_TOKEN
```

**4.3 Get Single Order**
```http
GET http://localhost:5000/api/orders/ORDER_ID
```

**4.4 Update Order Status**
```http
PUT http://localhost:5000/api/orders/ORDER_ID/status
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "status": "processing",
  "note": "Order confirmed and being prepared"
}
```

**4.5 Update Payment Status**
```http
PUT http://localhost:5000/api/orders/ORDER_ID/payment-status
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "paymentStatus": "paid"
}
```

**4.6 Add Tracking Number**
```http
PUT http://localhost:5000/api/orders/ORDER_ID/tracking
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "trackingNumber": "TRK123456789"
}
```

---

### Scenario 5: Review Management

**5.1 Create Review (Public Endpoint)**
```http
POST http://localhost:5000/api/reviews
Content-Type: application/json

{
  "product": "PRODUCT_ID",
  "customer": {
    "name": "John Customer",
    "email": "john@example.com"
  },
  "rating": 5,
  "title": "Excellent product!",
  "comment": "This serum really works! My skin looks brighter.",
  "isVerifiedPurchase": true
}
```

**5.2 Get All Reviews**
```http
GET http://localhost:5000/api/reviews?status=pending
```

**5.3 Approve Review**
```http
PUT http://localhost:5000/api/reviews/REVIEW_ID/status
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "status": "approved"
}
```

**5.4 Bulk Approve Reviews**
```http
PUT http://localhost:5000/api/reviews/bulk/status
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "reviewIds": ["REVIEW_ID_1", "REVIEW_ID_2"],
  "status": "approved"
}
```

---

### Scenario 6: Media Upload

**6.1 Upload Image**
```http
POST http://localhost:5000/api/media
Authorization: Bearer YOUR_TOKEN
Content-Type: multipart/form-data

file: [Select image file]
folder: products
alt: Product image
caption: Beautiful skincare product
tags: serum,vitamin-c
```

**Note:** Use form-data in Postman:
- Key: `file` | Type: File | Value: Select your image
- Key: `folder` | Type: Text | Value: products
- Key: `alt` | Type: Text | Value: Product image
- Key: `caption` | Type: Text | Value: Description
- Key: `tags` | Type: Text | Value: tag1,tag2

**6.2 Get All Media**
```http
GET http://localhost:5000/api/media?folder=products
Authorization: Bearer YOUR_TOKEN
```

**6.3 Update Media Metadata**
```http
PUT http://localhost:5000/api/media/MEDIA_ID
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "alt": "Updated alt text",
  "caption": "Updated caption",
  "tags": ["new-tag-1", "new-tag-2"]
}
```

**6.4 Delete Media**
```http
DELETE http://localhost:5000/api/media/MEDIA_ID
Authorization: Bearer YOUR_TOKEN
```

---

### Scenario 7: Dashboard Analytics

**7.1 Get Dashboard Stats**
```http
GET http://localhost:5000/api/dashboard/stats
Authorization: Bearer YOUR_TOKEN
```

**7.2 Get Recent Orders**
```http
GET http://localhost:5000/api/dashboard/recent-orders?limit=10
Authorization: Bearer YOUR_TOKEN
```

**7.3 Get Top Products**
```http
GET http://localhost:5000/api/dashboard/top-products?limit=5
Authorization: Bearer YOUR_TOKEN
```

**7.4 Get Sales Data**
```http
GET http://localhost:5000/api/dashboard/sales-data?period=month
Authorization: Bearer YOUR_TOKEN
```

---

### Scenario 8: Settings Management

**8.1 Get Settings**
```http
GET http://localhost:5000/api/settings
```

**8.2 Update WhatsApp Settings**
```http
PUT http://localhost:5000/api/settings/whatsapp
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "number": "2348012345678",
  "showFloatButton": true,
  "floatPosition": "right",
  "welcomeMessage": "Hello! How can we assist you?"
}
```

**8.3 Update Store Info**
```http
PUT http://localhost:5000/api/settings/store-info
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "GlowNaturas",
  "email": "orders@glownaturas.com",
  "phone": "+234 801 234 5678",
  "address": "123 Beauty Street, Lagos"
}
```

---

## Testing with cURL

### Login with cURL
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@glownaturas.com","password":"Admin123456"}'
```

### Get Products with cURL
```bash
curl http://localhost:5000/api/products
```

### Create Product with cURL
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Test Product",
    "description": "Test description",
    "price": 5000,
    "category": "CATEGORY_ID",
    "stock": 100,
    "status": "active"
  }'
```

---

## Common Issues and Solutions

### Issue 1: "Not authorized to access this route"
**Solution:** Make sure you're including the Authorization header with a valid token.

### Issue 2: "Invalid or expired verification code"
**Solution:** Verification codes expire after 24 hours (or 1 hour for password reset). Request a new code.

### Issue 3: "Only @glownaturas.com email addresses are allowed"
**Solution:** Admin emails must end with @glownaturas.com. Change the domain in `.env` if needed.

### Issue 4: "Category not found"
**Solution:** Get valid category IDs first: `GET /api/categories`

### Issue 5: Image upload fails
**Solution:** 
- Check file size (max 5MB)
- Verify file type (JPEG, PNG, WebP only)
- Use multipart/form-data
- Ensure Cloudinary credentials are correct

---

## Performance Testing

### Test Pagination
```http
GET http://localhost:5000/api/products?page=1&limit=10
GET http://localhost:5000/api/products?page=2&limit=10
```

### Test Search
```http
GET http://localhost:5000/api/products?search=serum
GET http://localhost:5000/api/products?search=vitamin
```

### Test Filtering
```http
GET http://localhost:5000/api/products?status=active&featured=true
GET http://localhost:5000/api/products?category=CATEGORY_ID&skinType=oily
```

---

## Security Testing

### Test Invalid Token
```http
GET http://localhost:5000/api/dashboard/stats
Authorization: Bearer invalid_token
```
**Expected:** 401 Unauthorized

### Test Missing Token
```http
GET http://localhost:5000/api/dashboard/stats
```
**Expected:** 401 Unauthorized

### Test Role-Based Access
```http
GET http://localhost:5000/api/auth/admins
Authorization: Bearer ADMIN_TOKEN
```
**Expected:** 403 Forbidden (if not superadmin)

---

## Automation Testing

For automated testing, consider using:
- **Jest** + **Supertest** for unit/integration tests
- **Postman Collection Runner** for API tests
- **Newman** for CLI-based Postman tests

---

## Support

If you encounter any issues during testing, check:
1. Server logs in the terminal
2. MongoDB connection status
3. Environment variables in `.env`
4. API documentation in `API_DOCUMENTATION.md`

For further assistance: admin@glownaturas.com

