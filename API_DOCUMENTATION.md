# GlowNaturas API Documentation

Complete API documentation with request/response examples for all endpoints.

## Base URL

```
http://localhost:5000/api
```

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {...}
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

---

## Authentication Endpoints

### 1. Register Admin

**POST** `/auth/register`

Register a new admin account. Only emails ending with @glownaturas.com are allowed.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@glownaturas.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful! Check your email for verification code."
}
```

**Validation Rules:**
- Name: 2-50 characters
- Email: Valid email ending with @glownaturas.com
- Password: Min 8 characters, at least 1 uppercase, 1 lowercase, 1 number

---

### 2. Verify Email

**POST** `/auth/verify-email`

Verify email with the 6-digit code sent to your email.

**Request Body:**
```json
{
  "email": "john@glownaturas.com",
  "code": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully!"
}
```

---

### 3. Login

**POST** `/auth/login`

Login with verified admin credentials.

**Request Body:**
```json
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
    "id": "60d5ec49f1b2c72b8c8e4f1a",
    "name": "Super Admin",
    "email": "admin@glownaturas.com",
    "role": "superadmin",
    "isEmailVerified": true
  }
}
```

---

### 4. Forgot Password

**POST** `/auth/forgot-password`

Request a password reset code.

**Request Body:**
```json
{
  "email": "john@glownaturas.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset code sent"
}
```

---

### 5. Reset Password

**POST** `/auth/reset-password`

Reset password using the 6-digit code.

**Request Body:**
```json
{
  "email": "john@glownaturas.com",
  "code": "123456",
  "newPassword": "NewSecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

---

### 6. Get Current Admin Profile

**GET** `/auth/me`

**Headers:** `Authorization: Bearer YOUR_TOKEN`

**Response:**
```json
{
  "success": true,
  "admin": {
    "id": "60d5ec49f1b2c72b8c8e4f1a",
    "name": "John Doe",
    "email": "john@glownaturas.com",
    "role": "admin",
    "isEmailVerified": true,
    "lastLogin": "2024-11-13T10:30:00.000Z"
  }
}
```

---

## Product Endpoints

### 1. Create Product

**POST** `/products`

**Headers:** `Authorization: Bearer YOUR_TOKEN`

**Request Body:**
```json
{
  "name": "Vitamin C Serum",
  "shortDescription": "Brightens and evens skin tone",
  "description": "Our premium Vitamin C serum contains 15% L-Ascorbic Acid...",
  "price": 8500,
  "comparePrice": 12000,
  "category": "60d5ec49f1b2c72b8c8e4f1b",
  "stock": 50,
  "sku": "GN-SERUM-001",
  "keywords": ["vitamin c", "brightening", "serum"],
  "ingredients": ["L-Ascorbic Acid 15%", "Vitamin E"],
  "concerns": ["dark spots", "dull skin"],
  "skinType": ["all", "dry", "combination"],
  "brand": "GlowNaturas",
  "status": "active",
  "featured": {
    "isFeatured": true,
    "featuredOrder": 1
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4f1c",
    "name": "Vitamin C Serum",
    "slug": "vitamin-c-serum",
    "price": 8500,
    "stock": 50,
    "status": "active",
    "createdAt": "2024-11-13T10:30:00.000Z"
  }
}
```

---

### 2. Get All Products

**GET** `/products`

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `search` - Search by name, description, keywords
- `category` - Filter by category ID
- `status` - Filter by status (active, inactive, draft)
- `featured` - Filter featured products (true/false)
- `skinType` - Filter by skin type
- `sort` - Sort field (e.g., -createdAt, price, name)

**Example:** `/products?page=1&limit=10&status=active&search=serum`

**Response:**
```json
{
  "success": true,
  "count": 10,
  "total": 50,
  "page": 1,
  "pages": 5,
  "data": [
    {
      "_id": "60d5ec49f1b2c72b8c8e4f1c",
      "name": "Vitamin C Serum",
      "slug": "vitamin-c-serum",
      "price": 8500,
      "comparePrice": 12000,
      "stock": 50,
      "category": {
        "_id": "60d5ec49f1b2c72b8c8e4f1b",
        "name": "Serums"
      },
      "status": "active",
      "averageRating": 4.5,
      "reviewCount": 12
    }
  ]
}
```

---

### 3. Get Single Product

**GET** `/products/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4f1c",
    "name": "Vitamin C Serum",
    "slug": "vitamin-c-serum",
    "shortDescription": "Brightens and evens skin tone",
    "description": "Full description...",
    "price": 8500,
    "comparePrice": 12000,
    "images": [],
    "category": {
      "_id": "60d5ec49f1b2c72b8c8e4f1b",
      "name": "Serums"
    },
    "stock": 50,
    "sku": "GN-SERUM-001",
    "keywords": ["vitamin c", "brightening"],
    "ingredients": ["L-Ascorbic Acid 15%"],
    "skinType": ["all"],
    "status": "active",
    "viewCount": 125,
    "orderCount": 45,
    "averageRating": 4.5,
    "reviewCount": 12,
    "reviews": []
  }
}
```

---

### 4. Generate SKU

**GET** `/products/generate-sku?categoryId=CATEGORY_ID`

**Headers:** `Authorization: Bearer YOUR_TOKEN`

**Response:**
```json
{
  "success": true,
  "sku": "GN-SERUM-003"
}
```

---

### 5. Get Low Stock Products

**GET** `/products/low-stock`

**Headers:** `Authorization: Bearer YOUR_TOKEN`

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "60d5ec49f1b2c72b8c8e4f1c",
      "name": "Vitamin C Serum",
      "stock": 8,
      "lowStockThreshold": 10,
      "category": {
        "name": "Serums"
      }
    }
  ]
}
```

---

## Category Endpoints

### 1. Create Category

**POST** `/categories`

**Headers:** `Authorization: Bearer YOUR_TOKEN`

**Request Body:**
```json
{
  "name": "Serums",
  "description": "Concentrated treatment serums",
  "displayOrder": 1,
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4f1b",
    "name": "Serums",
    "slug": "serums",
    "description": "Concentrated treatment serums",
    "displayOrder": 1,
    "isActive": true,
    "productCount": 0
  }
}
```

---

### 2. Get All Categories

**GET** `/categories`

**Query Parameters:**
- `isActive` - Filter by active status (true/false)

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "60d5ec49f1b2c72b8c8e4f1b",
      "name": "Serums",
      "slug": "serums",
      "displayOrder": 1,
      "isActive": true,
      "productCount": 12
    }
  ]
}
```

---

## Order Endpoints

### 1. Create Order

**POST** `/orders`

**Request Body:**
```json
{
  "customer": {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "+2348012345678",
    "address": "123 Main Street",
    "city": "Lagos",
    "state": "Lagos"
  },
  "items": [
    {
      "product": "60d5ec49f1b2c72b8c8e4f1c",
      "quantity": 2
    }
  ],
  "paymentMethod": "bank_transfer"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4f1d",
    "orderId": "GN-K8L9M0N1-AB2C",
    "customer": {
      "name": "Jane Doe",
      "email": "jane@example.com",
      "phone": "+2348012345678",
      "address": "123 Main Street",
      "city": "Lagos",
      "state": "Lagos"
    },
    "items": [
      {
        "product": "60d5ec49f1b2c72b8c8e4f1c",
        "productName": "Vitamin C Serum",
        "quantity": 2,
        "price": 8500,
        "subtotal": 17000
      }
    ],
    "subtotal": 17000,
    "shippingFee": 2000,
    "total": 19000,
    "paymentMethod": "bank_transfer",
    "paymentStatus": "pending",
    "status": "pending",
    "expiresAt": "2024-11-13T16:30:00.000Z"
  }
}
```

---

### 2. Get All Orders

**GET** `/orders`

**Headers:** `Authorization: Bearer YOUR_TOKEN`

**Query Parameters:**
- `page`, `limit`
- `status` - Filter by order status
- `paymentStatus` - Filter by payment status
- `email` - Filter by customer email
- `orderId` - Search by order ID

**Response:**
```json
{
  "success": true,
  "count": 10,
  "total": 100,
  "page": 1,
  "pages": 10,
  "data": [
    {
      "_id": "60d5ec49f1b2c72b8c8e4f1d",
      "orderId": "GN-K8L9M0N1-AB2C",
      "customer": {
        "name": "Jane Doe",
        "email": "jane@example.com"
      },
      "total": 19000,
      "status": "pending",
      "paymentStatus": "pending",
      "createdAt": "2024-11-13T10:30:00.000Z"
    }
  ]
}
```

---

### 3. Update Order Status

**PUT** `/orders/:id/status`

**Headers:** `Authorization: Bearer YOUR_TOKEN`

**Request Body:**
```json
{
  "status": "processing",
  "note": "Order confirmed and being prepared"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4f1d",
    "orderId": "GN-K8L9M0N1-AB2C",
    "status": "processing",
    "statusHistory": [
      {
        "status": "pending",
        "date": "2024-11-13T10:30:00.000Z",
        "by": "System"
      },
      {
        "status": "processing",
        "date": "2024-11-13T11:00:00.000Z",
        "by": "Super Admin",
        "note": "Order confirmed and being prepared"
      }
    ]
  }
}
```

---

## Dashboard Endpoints

### 1. Get Dashboard Statistics

**GET** `/dashboard/stats`

**Headers:** `Authorization: Bearer YOUR_TOKEN`

**Response:**
```json
{
  "success": true,
  "data": {
    "orders": {
      "total": 250,
      "pending": 15,
      "processing": 30,
      "completed": 180
    },
    "products": {
      "total": 50,
      "active": 45,
      "lowStock": 5
    },
    "reviews": {
      "total": 120,
      "pending": 8
    },
    "admins": {
      "total": 5,
      "active": 4
    },
    "revenue": {
      "total": 4500000,
      "paidOrders": 180
    }
  }
}
```

---

### 2. Get Recent Orders

**GET** `/dashboard/recent-orders?limit=10`

**Headers:** `Authorization: Bearer YOUR_TOKEN`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "60d5ec49f1b2c72b8c8e4f1d",
      "orderId": "GN-K8L9M0N1-AB2C",
      "customer": {
        "name": "Jane Doe"
      },
      "total": 19000,
      "status": "pending",
      "createdAt": "2024-11-13T10:30:00.000Z"
    }
  ]
}
```

---

## Media Endpoints

### 1. Upload Media

**POST** `/media`

**Headers:** 
- `Authorization: Bearer YOUR_TOKEN`
- `Content-Type: multipart/form-data`

**Form Data:**
- `file` - Image file (max 5MB, formats: JPEG, PNG, WebP)
- `folder` (optional) - Folder name (default: "general")
- `alt` (optional) - Alt text
- `caption` (optional) - Caption
- `tags` (optional) - Comma-separated tags

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4f1e",
    "filename": "1638360000000-123456789.jpg",
    "cloudinary": {
      "url": "https://res.cloudinary.com/glownaturas/image/upload/v1638360000/glownaturas/general/abc123.jpg",
      "publicId": "glownaturas/general/abc123",
      "format": "jpg",
      "width": 1920,
      "height": 1080,
      "size": 245678
    },
    "type": "image",
    "folder": "general"
  }
}
```

---

## Settings Endpoints

### 1. Get Settings

**GET** `/settings`

**Response:**
```json
{
  "success": true,
  "data": {
    "storeInfo": {
      "name": "GlowNaturas",
      "email": "orders@glownaturas.com",
      "phone": "+234 801 234 5678"
    },
    "whatsapp": {
      "number": "2348012345678",
      "showFloatButton": true,
      "floatPosition": "right",
      "welcomeMessage": "Hi! How can we help you?"
    },
    "socialMedia": {
      "facebook": "https://facebook.com/glownaturas",
      "instagram": "https://instagram.com/glownaturas"
    }
  }
}
```

---

### 2. Update WhatsApp Settings

**PUT** `/settings/whatsapp`

**Headers:** `Authorization: Bearer YOUR_TOKEN`

**Request Body:**
```json
{
  "number": "2348012345678",
  "showFloatButton": true,
  "floatPosition": "right",
  "welcomeMessage": "Hello! How can we assist you today?"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "whatsapp": {
      "number": "2348012345678",
      "showFloatButton": true,
      "floatPosition": "right",
      "welcomeMessage": "Hello! How can we assist you today?"
    }
  }
}
```

---

## Error Codes

| Status Code | Meaning |
|------------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid/missing token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Testing with Postman/Thunder Client

1. **Login first** to get your token:
   ```
   POST http://localhost:5000/api/auth/login
   Body: { "email": "admin@glownaturas.com", "password": "Admin123456" }
   ```

2. **Copy the token** from the response

3. **For protected routes**, add header:
   ```
   Authorization: Bearer YOUR_TOKEN_HERE
   ```

---

## Quick Start Testing Sequence

1. Start server: `npm run dev`
2. Seed database: `npm run seed`
3. Login: POST `/api/auth/login` with credentials from seed output
4. Copy token from response
5. Test protected endpoints with token

---

## Support

For issues or questions about the API, contact: admin@glownaturas.com

