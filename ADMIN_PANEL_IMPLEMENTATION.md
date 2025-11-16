# Admin Panel Implementation Guide

**Target Application:** Admin Dashboard / Back Office System
**Authentication:** Required (JWT Token)
**Base URL:** `/api`

---

## Table of Contents
1. [Authentication Setup](#authentication-setup)
2. [Admin Panel Routes](#admin-panel-routes)
3. [API Implementation Examples](#api-implementation-examples)
4. [Error Handling](#error-handling)
5. [Best Practices](#best-practices)

---

## Authentication Setup

### Step 1: Store JWT Token

After successful login, store the token securely:

```javascript
// After login success
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const data = await response.json();

// Store token (choose one method)
localStorage.setItem('adminToken', data.token);  // Simple but less secure
// OR
sessionStorage.setItem('adminToken', data.token); // Clears on tab close
// OR use httpOnly cookies (most secure)
```

### Step 2: Create API Helper Function

```javascript
// utils/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('adminToken');

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    }
  };

  // Add token to protected routes
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Handle authentication errors
    if (response.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
```

### Step 3: Protected Route Component

```javascript
// components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';

export const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
```

---

## Admin Panel Routes

### 🔐 Authentication Routes

#### 1. **Login** (Public)
```javascript
POST /api/auth/login

// Request
{
  "email": "admin@glownatura.com",
  "password": "YourPassword123!"
}

// Response
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "123",
    "name": "Admin Name",
    "email": "admin@glownatura.com",
    "emailVerified": true
  }
}
```

**Frontend Usage:**
- Login page form submission
- Store token on success
- Redirect to dashboard
- Show error message on failure

---

#### 2. **Get Current Admin Profile** (Protected)
```javascript
GET /api/auth/me
Headers: { Authorization: "Bearer {token}" }

// Response
{
  "success": true,
  "data": {
    "id": "123",
    "name": "Admin Name",
    "email": "admin@glownatura.com",
    "emailVerified": true,
    "lastLogin": "2025-11-16T10:30:00Z"
  }
}
```

**Frontend Usage:**
- Check authentication status on app load
- Display admin info in header
- Verify token is still valid

---

#### 3. **Update Profile** (Protected)
```javascript
PUT /api/auth/profile
Headers: { Authorization: "Bearer {token}" }

// Request
{
  "name": "New Admin Name"
}
```

**Frontend Usage:**
- Profile settings page
- Update admin name

---

#### 4. **Change Password** (Protected)
```javascript
PUT /api/auth/change-password
Headers: { Authorization: "Bearer {token}" }

// Request
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

**Frontend Usage:**
- Security settings page
- Password change form

---

#### 5. **Logout** (Protected)
```javascript
POST /api/auth/logout
Headers: { Authorization: "Bearer {token}" }
```

**Frontend Usage:**
- Logout button click
- Clear local token
- Redirect to login

---

### 📊 Dashboard Routes (All Protected)

#### 1. **Get Dashboard Statistics**
```javascript
GET /api/dashboard/stats?period=month
Headers: { Authorization: "Bearer {token}" }

// Query Parameters
period: 'today' | 'week' | 'month' | 'year'

// Response
{
  "success": true,
  "data": {
    "totalRevenue": 15000,
    "totalOrders": 120,
    "pendingOrders": 15,
    "totalProducts": 50,
    "lowStockProducts": 5,
    "totalCustomers": 200,
    "totalReviews": 80,
    "pendingReviews": 10,
    "revenueChange": 12.5,  // % change
    "ordersChange": -5.2    // % change
  }
}
```

**Frontend Usage:**
- Dashboard homepage
- Statistics cards
- Comparison with previous period

---

#### 2. **Get Recent Orders**
```javascript
GET /api/dashboard/recent-orders?limit=10
Headers: { Authorization: "Bearer {token}" }

// Response
{
  "success": true,
  "data": [
    {
      "id": "order123",
      "orderNumber": "ORD-2025-001",
      "customer": { "name": "John Doe", "email": "john@example.com" },
      "total": 250,
      "status": "pending",
      "createdAt": "2025-11-16T10:00:00Z"
    }
  ]
}
```

**Frontend Usage:**
- Dashboard recent orders widget
- Quick order status overview

---

#### 3. **Get Top Products**
```javascript
GET /api/dashboard/top-products?period=month&limit=10
Headers: { Authorization: "Bearer {token}" }

// Response
{
  "success": true,
  "data": [
    {
      "product": {
        "id": "prod123",
        "name": "Natural Face Cream",
        "images": ["url"]
      },
      "totalSold": 45,
      "revenue": 2250
    }
  ]
}
```

**Frontend Usage:**
- Dashboard top products widget
- Best sellers analysis

---

#### 4. **Get Sales Data** (for charts)
```javascript
GET /api/dashboard/sales-data?period=month&groupBy=day
Headers: { Authorization: "Bearer {token}" }

// Query Parameters
period: 'week' | 'month' | 'year'
groupBy: 'day' | 'week' | 'month'

// Response
{
  "success": true,
  "data": {
    "labels": ["Nov 1", "Nov 2", "Nov 3", ...],
    "revenue": [1000, 1500, 1200, ...],
    "orders": [10, 15, 12, ...]
  }
}
```

**Frontend Usage:**
- Dashboard sales chart
- Revenue visualization
- Order trend analysis

---

### 📦 Product Management Routes

#### 1. **Get All Products** (with filters)
```javascript
GET /api/products?page=1&limit=20&status=active&category=cat123&search=cream&sort=createdAt&order=desc
Headers: { Authorization: "Bearer {token}" }

// Query Parameters (all optional)
{
  page: 1,           // Pagination
  limit: 20,         // Items per page
  status: 'active' | 'inactive',
  category: 'categoryId',
  search: 'search term',
  minPrice: 10,
  maxPrice: 100,
  inStock: true,
  sort: 'name' | 'price' | 'createdAt' | 'stock',
  order: 'asc' | 'desc'
}

// Response
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "prod123",
        "name": "Natural Face Cream",
        "description": "Organic face cream...",
        "price": 50,
        "compareAtPrice": 70,
        "sku": "GN-FC-001",
        "category": { "id": "cat123", "name": "Face Care" },
        "images": ["url1", "url2"],
        "stock": 25,
        "lowStockThreshold": 10,
        "status": "active",
        "featured": true,
        "tags": ["organic", "natural"],
        "createdAt": "2025-11-16T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalProducts": 50,
      "totalPages": 3
    }
  }
}
```

**Frontend Usage:**
- Product list page
- Filters sidebar
- Search bar
- Pagination controls
- Sort dropdown

---

#### 2. **Create Product** (Protected)
```javascript
POST /api/products
Headers: { Authorization: "Bearer {token}" }

// Request
{
  "name": "Natural Face Cream",
  "description": "Organic face cream for all skin types",
  "price": 50,
  "compareAtPrice": 70,
  "category": "cat123",
  "images": ["cloudinary_url_1", "cloudinary_url_2"],
  "stock": 100,
  "lowStockThreshold": 10,
  "status": "active",
  "featured": true,
  "tags": ["organic", "natural"],
  "seo": {
    "title": "Natural Face Cream - Organic Skincare",
    "description": "Best organic face cream...",
    "keywords": ["organic", "face cream", "natural"]
  }
}

// Response
{
  "success": true,
  "data": {
    "id": "prod123",
    "sku": "GN-FC-001",  // Auto-generated
    ...productData
  }
}
```

**Frontend Usage:**
- "Add New Product" form
- Image upload (use Media Library API first)
- Category selection dropdown
- Stock management
- SEO fields (optional)

---

#### 3. **Generate SKU** (Protected)
```javascript
GET /api/products/generate-sku
Headers: { Authorization: "Bearer {token}" }

// Response
{
  "success": true,
  "data": {
    "sku": "GN-PROD-001"
  }
}
```

**Frontend Usage:**
- Auto-fill SKU field in product form
- Call when creating new product

---

#### 4. **Get Low Stock Products** (Protected)
```javascript
GET /api/products/low-stock
Headers: { Authorization: "Bearer {token}" }

// Response
{
  "success": true,
  "data": [
    {
      "id": "prod123",
      "name": "Natural Face Cream",
      "sku": "GN-FC-001",
      "stock": 5,
      "lowStockThreshold": 10,
      "status": "active"
    }
  ]
}
```

**Frontend Usage:**
- Low stock alerts page
- Dashboard warning widget
- Inventory management

---

#### 5. **Update Product** (Protected)
```javascript
PUT /api/products/:id
Headers: { Authorization: "Bearer {token}" }

// Request (partial update allowed)
{
  "price": 55,
  "stock": 150
}
```

**Frontend Usage:**
- Edit product form
- Quick edit (price, stock)
- Update product status

---

#### 6. **Delete Product** (Protected)
```javascript
DELETE /api/products/:id
Headers: { Authorization: "Bearer {token}" }
```

**Frontend Usage:**
- Delete button with confirmation modal
- Bulk delete action

---

#### 7. **Bulk Update Product Status** (Protected)
```javascript
PUT /api/products/bulk/status
Headers: { Authorization: "Bearer {token}" }

// Request
{
  "productIds": ["prod1", "prod2", "prod3"],
  "status": "inactive"
}
```

**Frontend Usage:**
- Bulk actions dropdown
- Select multiple products
- Activate/deactivate in bulk

---

### 📁 Category Management Routes

#### 1. **Get All Categories**
```javascript
GET /api/categories
Headers: { Authorization: "Bearer {token}" }

// Response
{
  "success": true,
  "data": [
    {
      "id": "cat123",
      "name": "Face Care",
      "slug": "face-care",
      "description": "Natural face care products",
      "image": "url",
      "parent": null,  // or parent category ID
      "order": 1,
      "status": "active",
      "productCount": 25
    }
  ]
}
```

**Frontend Usage:**
- Category list page
- Category selection dropdown in products
- Navigation menu

---

#### 2. **Create Category** (Protected)
```javascript
POST /api/categories
Headers: { Authorization: "Bearer {token}" }

// Request
{
  "name": "Face Care",
  "description": "Natural face care products",
  "image": "cloudinary_url",
  "parent": null,  // or parent category ID for subcategories
  "status": "active",
  "seo": {
    "title": "Face Care Products",
    "description": "Natural organic face care",
    "keywords": ["face", "care", "organic"]
  }
}
```

**Frontend Usage:**
- "Add New Category" form
- Parent category selection
- Image upload

---

#### 3. **Update Category** (Protected)
```javascript
PUT /api/categories/:id
Headers: { Authorization: "Bearer {token}" }

// Request
{
  "name": "Updated Category Name",
  "status": "inactive"
}
```

**Frontend Usage:**
- Edit category form
- Status toggle

---

#### 4. **Delete Category** (Protected)
```javascript
DELETE /api/categories/:id
Headers: { Authorization: "Bearer {token}" }
```

**Frontend Usage:**
- Delete button with confirmation
- Warning if category has products

---

#### 5. **Reorder Categories** (Protected)
```javascript
PUT /api/categories/reorder
Headers: { Authorization: "Bearer {token}" }

// Request
{
  "categories": [
    { "id": "cat1", "order": 1 },
    { "id": "cat2", "order": 2 },
    { "id": "cat3", "order": 3 }
  ]
}
```

**Frontend Usage:**
- Drag & drop category reordering
- Category management page

---

### 🛒 Order Management Routes (All Protected)

#### 1. **Get All Orders**
```javascript
GET /api/orders?page=1&limit=20&status=pending&paymentStatus=paid&startDate=2025-11-01&endDate=2025-11-30&search=ORD-001
Headers: { Authorization: "Bearer {token}" }

// Query Parameters (all optional)
{
  page: 1,
  limit: 20,
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded',
  startDate: '2025-11-01',
  endDate: '2025-11-30',
  search: 'order number or customer name',
  sort: 'createdAt' | 'total' | 'status',
  order: 'asc' | 'desc'
}

// Response
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "order123",
        "orderNumber": "ORD-2025-001",
        "customer": {
          "name": "John Doe",
          "email": "john@example.com",
          "phone": "+1234567890",
          "whatsapp": "+1234567890"
        },
        "shippingAddress": {
          "street": "123 Main St",
          "city": "New York",
          "state": "NY",
          "zipCode": "10001",
          "country": "USA"
        },
        "items": [
          {
            "product": {
              "id": "prod123",
              "name": "Natural Face Cream",
              "images": ["url"]
            },
            "quantity": 2,
            "price": 50,
            "total": 100
          }
        ],
        "subtotal": 100,
        "shipping": 10,
        "tax": 5,
        "total": 115,
        "status": "pending",
        "paymentMethod": "bank_transfer",
        "paymentStatus": "pending",
        "notes": [
          {
            "admin": { "name": "Admin" },
            "note": "Customer requested express delivery",
            "createdAt": "2025-11-16T10:00:00Z"
          }
        ],
        "createdAt": "2025-11-16T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalOrders": 120,
      "totalPages": 6
    }
  }
}
```

**Frontend Usage:**
- Orders list page
- Filters (status, payment, date range)
- Search orders
- Pagination

---

#### 2. **Get Single Order**
```javascript
GET /api/orders/:id
Headers: { Authorization: "Bearer {token}" }

// Response - Same as order object above with full details
```

**Frontend Usage:**
- Order details page
- Order timeline
- Customer information display

---

#### 3. **Confirm Payment** (Protected)
```javascript
PUT /api/orders/:id/confirm-payment
Headers: { Authorization: "Bearer {token}" }

// Request
{
  "paymentProof": "cloudinary_url_of_receipt"  // optional
}

// Response
{
  "success": true,
  "data": {
    "paymentStatus": "paid",
    "paidAt": "2025-11-16T10:30:00Z"
  }
}
```

**Frontend Usage:**
- "Confirm Payment" button
- Upload payment proof option
- Auto-updates order status

---

#### 4. **Update Order Status** (Protected)
```javascript
PUT /api/orders/:id/status
Headers: { Authorization: "Bearer {token}" }

// Request
{
  "status": "processing",  // 'confirmed' | 'processing' | 'shipped' | 'delivered'
  "trackingNumber": "TRACK123456"  // required for 'shipped' status
}

// Response
{
  "success": true,
  "data": {
    "status": "shipped",
    "trackingNumber": "TRACK123456",
    "shippedAt": "2025-11-16T10:30:00Z"
  }
}
```

**Frontend Usage:**
- Order status dropdown
- Status update workflow
- Tracking number input for shipping
- Sends email notification to customer

---

#### 5. **Cancel Order** (Protected)
```javascript
PUT /api/orders/:id/cancel
Headers: { Authorization: "Bearer {token}" }

// Request
{
  "reason": "Customer requested cancellation"
}
```

**Frontend Usage:**
- "Cancel Order" button
- Cancellation reason input
- Confirmation modal

---

#### 6. **Add Order Note** (Protected)
```javascript
POST /api/orders/:id/notes
Headers: { Authorization: "Bearer {token}" }

// Request
{
  "note": "Customer called to confirm delivery address"
}
```

**Frontend Usage:**
- Order notes section
- Internal communication
- Activity log

---

#### 7. **Export Orders** (Protected)
```javascript
GET /api/orders/export?format=csv&startDate=2025-11-01&endDate=2025-11-30&status=delivered
Headers: { Authorization: "Bearer {token}" }

// Query Parameters
{
  format: 'csv' | 'excel',
  startDate: '2025-11-01',
  endDate: '2025-11-30',
  status: 'delivered'  // optional
}

// Response - File download
```

**Frontend Usage:**
- "Export Orders" button
- Date range picker
- Download CSV/Excel file

---

#### 8. **Request Refund** (Protected)
```javascript
POST /api/orders/:id/refund/request
Headers: { Authorization: "Bearer {token}" }

// Request
{
  "amount": 115,  // full or partial refund
  "reason": "Damaged product"
}
```

**Frontend Usage:**
- "Request Refund" button
- Refund amount input
- Reason selection/input

---

#### 9. **Process Refund** (Protected)
```javascript
PUT /api/orders/:id/refund/process
Headers: { Authorization: "Bearer {token}" }

// Request
{
  "status": "approved",  // 'approved' | 'rejected'
  "note": "Refund processed via bank transfer"
}
```

**Frontend Usage:**
- Refund approval workflow
- Admin notes on refund
- Updates payment status

---

### ⭐ Review Management Routes

#### 1. **Get All Reviews**
```javascript
GET /api/reviews?page=1&limit=20&status=pending&product=prod123&rating=5
Headers: { Authorization: "Bearer {token}" }

// Query Parameters
{
  page: 1,
  limit: 20,
  status: 'pending' | 'approved' | 'rejected',
  product: 'productId',
  rating: 1-5,
  sort: 'createdAt' | 'rating',
  order: 'asc' | 'desc'
}

// Response
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "rev123",
        "product": {
          "id": "prod123",
          "name": "Natural Face Cream",
          "images": ["url"]
        },
        "customer": {
          "name": "Jane Smith",
          "email": "jane@example.com"
        },
        "rating": 5,
        "title": "Amazing product!",
        "comment": "This cream is fantastic...",
        "status": "pending",
        "verified": true,
        "helpful": 10,
        "createdAt": "2025-11-16T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalReviews": 80,
      "totalPages": 4
    }
  }
}
```

**Frontend Usage:**
- Reviews moderation page
- Filter by status/product/rating
- Review list display

---

#### 2. **Approve/Reject Review** (Protected)
```javascript
PUT /api/reviews/:id/status
Headers: { Authorization: "Bearer {token}" }

// Request
{
  "status": "approved"  // 'approved' | 'rejected'
}
```

**Frontend Usage:**
- "Approve" / "Reject" buttons
- Quick moderation actions
- Bulk moderation

---

#### 3. **Delete Review** (Protected)
```javascript
DELETE /api/reviews/:id
Headers: { Authorization: "Bearer {token}" }
```

**Frontend Usage:**
- Delete button with confirmation
- Spam/inappropriate content removal

---

#### 4. **Bulk Update Review Status** (Protected)
```javascript
PUT /api/reviews/bulk/status
Headers: { Authorization: "Bearer {token}" }

// Request
{
  "reviewIds": ["rev1", "rev2", "rev3"],
  "status": "approved"
}
```

**Frontend Usage:**
- Select multiple reviews
- Bulk approve/reject action

---

### 🖼️ Media Library Routes (All Protected)

#### 1. **Upload Media**
```javascript
POST /api/media
Headers: {
  Authorization: "Bearer {token}",
  'Content-Type': 'multipart/form-data'
}

// Request (FormData)
const formData = new FormData();
formData.append('files', file1);
formData.append('files', file2);
// ... up to 10 files

// Response
{
  "success": true,
  "data": [
    {
      "id": "media123",
      "url": "https://res.cloudinary.com/.../image.jpg",
      "publicId": "glownatura/products/abc123",
      "filename": "face-cream.jpg",
      "size": 256000,
      "mimeType": "image/jpeg",
      "width": 1200,
      "height": 800,
      "createdAt": "2025-11-16T10:00:00Z"
    }
  ]
}
```

**Frontend Usage:**
- Image upload component (drag & drop)
- Product image upload
- Category image upload
- Max 10 files per upload
- Show upload progress

---

#### 2. **Get All Media**
```javascript
GET /api/media?page=1&limit=30&folder=products&tags=featured&unused=false
Headers: { Authorization: "Bearer {token}" }

// Query Parameters
{
  page: 1,
  limit: 30,
  folder: 'products' | 'categories' | 'banners',
  tags: 'featured',
  unused: true,  // show unused media only
  sort: 'createdAt' | 'filename' | 'size',
  order: 'asc' | 'desc'
}

// Response
{
  "success": true,
  "data": {
    "media": [
      {
        "id": "media123",
        "url": "https://cloudinary.../image.jpg",
        "filename": "face-cream.jpg",
        "size": 256000,
        "alt": "Natural Face Cream",
        "title": "Face Cream Product Photo",
        "folder": "products",
        "tags": ["featured", "bestseller"],
        "usedIn": [
          { "type": "product", "id": "prod123", "name": "Natural Face Cream" }
        ],
        "createdAt": "2025-11-16T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 30,
      "totalMedia": 150,
      "totalPages": 5
    }
  }
}
```

**Frontend Usage:**
- Media library grid view
- Filter by folder/tags
- Search media
- Show unused media

---

#### 3. **Update Media Metadata** (Protected)
```javascript
PUT /api/media/:id
Headers: { Authorization: "Bearer {token}" }

// Request
{
  "alt": "Natural Face Cream Product Photo",
  "title": "Face Cream",
  "folder": "products",
  "tags": ["featured", "bestseller"]
}
```

**Frontend Usage:**
- Edit media modal
- SEO optimization (alt text)
- Organization (folders, tags)

---

#### 4. **Delete Media** (Protected)
```javascript
DELETE /api/media/:id
Headers: { Authorization: "Bearer {token}" }
```

**Frontend Usage:**
- Delete button with confirmation
- Warning if media is in use

---

#### 5. **Bulk Delete Unused Media** (Protected)
```javascript
DELETE /api/media/bulk/unused
Headers: { Authorization: "Bearer {token}" }

// Response
{
  "success": true,
  "data": {
    "deleted": 25
  }
}
```

**Frontend Usage:**
- "Clean Up Unused Media" button
- Storage optimization
- Confirmation before deletion

---

### ⚙️ Settings Management Routes

#### 1. **Get Settings**
```javascript
GET /api/settings
Headers: { Authorization: "Bearer {token}" }

// Response
{
  "success": true,
  "data": {
    "storeInfo": {
      "name": "GlowNatura",
      "tagline": "Natural Beauty Products",
      "description": "Premium natural skincare",
      "logo": "cloudinary_url",
      "favicon": "cloudinary_url",
      "email": "info@glownatura.com",
      "phone": "+1234567890",
      "address": {
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "country": "USA"
      }
    },
    "whatsapp": {
      "enabled": true,
      "number": "+1234567890",
      "message": "Hello! I'm interested in your products."
    },
    "socialMedia": {
      "facebook": "https://facebook.com/glownatura",
      "instagram": "https://instagram.com/glownatura",
      "twitter": "https://twitter.com/glownatura",
      "youtube": "",
      "tiktok": ""
    },
    "shipping": {
      "freeShippingThreshold": 50,
      "defaultShippingCost": 10
    },
    "tax": {
      "enabled": true,
      "rate": 8.5
    },
    "currency": {
      "code": "USD",
      "symbol": "$"
    }
  }
}
```

**Frontend Usage:**
- Settings page (load all settings)
- Display current configuration

---

#### 2. **Update All Settings** (Protected)
```javascript
PUT /api/settings
Headers: { Authorization: "Bearer {token}" }

// Request - Send full settings object (same structure as response above)
```

**Frontend Usage:**
- "Save All Settings" button
- Settings page main form

---

#### 3. **Update Store Info** (Protected)
```javascript
PUT /api/settings/store-info
Headers: { Authorization: "Bearer {token}" }

// Request
{
  "name": "GlowNatura",
  "tagline": "Natural Beauty Products",
  "email": "info@glownatura.com",
  "phone": "+1234567890",
  "logo": "cloudinary_url"
}
```

**Frontend Usage:**
- Store information section
- Business details form

---

#### 4. **Update WhatsApp Settings** (Protected)
```javascript
PUT /api/settings/whatsapp
Headers: { Authorization: "Bearer {token}" }

// Request
{
  "enabled": true,
  "number": "+1234567890",
  "message": "Custom greeting message"
}
```

**Frontend Usage:**
- WhatsApp integration toggle
- Contact settings

---

#### 5. **Update Social Media** (Protected)
```javascript
PUT /api/settings/social-media
Headers: { Authorization: "Bearer {token}" }

// Request
{
  "facebook": "https://facebook.com/glownatura",
  "instagram": "https://instagram.com/glownatura",
  "twitter": "",
  "youtube": "",
  "tiktok": ""
}
```

**Frontend Usage:**
- Social media links form
- Footer configuration

---

### 📧 Email Template Management Routes (All Protected)

#### 1. **Get All Templates**
```javascript
GET /api/email-templates
Headers: { Authorization: "Bearer {token}" }

// Response
{
  "success": true,
  "data": [
    {
      "id": "template123",
      "type": "order-confirmation",
      "subject": "Order Confirmation - #{orderNumber}",
      "body": "HTML template content...",
      "variables": ["customerName", "orderNumber", "items", "total"],
      "isDefault": false,
      "updatedAt": "2025-11-16T10:00:00Z"
    }
  ]
}
```

**Frontend Usage:**
- Email templates list page
- Template selector

---

#### 2. **Get Template by Type**
```javascript
GET /api/email-templates/:type
Headers: { Authorization: "Bearer {token}" }

// Template types
'order-confirmation' | 'payment-confirmed' | 'order-shipped' |
'order-delivered' | 'order-cancelled' | 'refund-processed'
```

**Frontend Usage:**
- Template editor page
- Load specific template

---

#### 3. **Update Template** (Protected)
```javascript
PUT /api/email-templates/:type
Headers: { Authorization: "Bearer {token}" }

// Request
{
  "subject": "Your Order #{orderNumber} is Confirmed!",
  "body": "<html>...</html>"
}
```

**Frontend Usage:**
- Template editor save button
- Rich text editor for body
- Subject line input

---

#### 4. **Preview Template** (Protected)
```javascript
POST /api/email-templates/preview
Headers: { Authorization: "Bearer {token}" }

// Request
{
  "type": "order-confirmation",
  "sampleData": {
    "customerName": "John Doe",
    "orderNumber": "ORD-2025-001",
    "items": [...],
    "total": 115
  }
}

// Response
{
  "success": true,
  "data": {
    "html": "<html>Rendered preview...</html>"
  }
}
```

**Frontend Usage:**
- "Preview" button
- Modal showing rendered email
- Test with sample data

---

#### 5. **Send Test Email** (Protected)
```javascript
POST /api/email-templates/test-send
Headers: { Authorization: "Bearer {token}" }

// Request
{
  "type": "order-confirmation",
  "to": "admin@glownatura.com",
  "sampleData": {
    "customerName": "Test Customer",
    "orderNumber": "TEST-001"
  }
}
```

**Frontend Usage:**
- "Send Test" button
- Email input for recipient
- Success notification

---

#### 6. **Restore Default Template** (Protected)
```javascript
POST /api/email-templates/:type/restore
Headers: { Authorization: "Bearer {token}" }
```

**Frontend Usage:**
- "Restore Default" button
- Confirmation modal
- Resets to system default

---

## API Implementation Examples

### Example 1: Login Flow

```javascript
// pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../utils/api';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      // Store token
      localStorage.setItem('adminToken', data.token);

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};
```

---

### Example 2: Dashboard Stats

```javascript
// pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { apiRequest } from '../utils/api';

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    fetchStats();
  }, [period]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await apiRequest(`/dashboard/stats?period=${period}`);
      setStats(data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Dashboard</h1>

      <select value={period} onChange={(e) => setPeriod(e.target.value)}>
        <option value="today">Today</option>
        <option value="week">This Week</option>
        <option value="month">This Month</option>
        <option value="year">This Year</option>
      </select>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p>${stats.totalRevenue}</p>
          <span className={stats.revenueChange > 0 ? 'positive' : 'negative'}>
            {stats.revenueChange > 0 ? '+' : ''}{stats.revenueChange}%
          </span>
        </div>

        <div className="stat-card">
          <h3>Total Orders</h3>
          <p>{stats.totalOrders}</p>
          <span className={stats.ordersChange > 0 ? 'positive' : 'negative'}>
            {stats.ordersChange > 0 ? '+' : ''}{stats.ordersChange}%
          </span>
        </div>

        <div className="stat-card">
          <h3>Pending Orders</h3>
          <p>{stats.pendingOrders}</p>
        </div>

        <div className="stat-card">
          <h3>Low Stock Products</h3>
          <p>{stats.lowStockProducts}</p>
        </div>
      </div>
    </div>
  );
};
```

---

### Example 3: Product List with Filters

```javascript
// pages/Products.jsx
import { useEffect, useState } from 'react';
import { apiRequest } from '../utils/api';
import { useSearchParams } from 'react-router-dom';

export const Products = () => {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  // Get filter values from URL
  const page = searchParams.get('page') || 1;
  const status = searchParams.get('status') || '';
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';

  useEffect(() => {
    fetchProducts();
  }, [page, status, category, search]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page,
        limit: 20,
        ...(status && { status }),
        ...(category && { category }),
        ...(search && { search }),
      });

      const data = await apiRequest(`/products?${queryParams}`);
      setProducts(data.data.products);
      setPagination(data.data.pagination);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // Reset to page 1
    setSearchParams(newParams);
  };

  return (
    <div>
      <h1>Products</h1>

      {/* Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => updateFilter('search', e.target.value)}
        />

        <select
          value={status}
          onChange={(e) => updateFilter('status', e.target.value)}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        {/* Add category filter here */}
      </div>

      {/* Product List */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>SKU</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>
                  <img src={product.images[0]} alt={product.name} width="50" />
                </td>
                <td>{product.name}</td>
                <td>{product.sku}</td>
                <td>${product.price}</td>
                <td>{product.stock}</td>
                <td>{product.status}</td>
                <td>
                  <button onClick={() => editProduct(product.id)}>Edit</button>
                  <button onClick={() => deleteProduct(product.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      {pagination && (
        <div className="pagination">
          <button
            disabled={pagination.page === 1}
            onClick={() => updateFilter('page', pagination.page - 1)}
          >
            Previous
          </button>

          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <button
            disabled={pagination.page === pagination.totalPages}
            onClick={() => updateFilter('page', pagination.page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
```

---

### Example 4: Image Upload with Media Library

```javascript
// components/ImageUpload.jsx
import { useState } from 'react';
import { apiRequest } from '../utils/api';

export const ImageUpload = ({ onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);

    if (files.length > 10) {
      alert('Maximum 10 files allowed');
      return;
    }

    setUploading(true);
    const formData = new FormData();

    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const token = localStorage.getItem('adminToken');

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/media`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type for multipart/form-data
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Upload failed');
      }

      // Return uploaded image URLs
      const imageUrls = data.data.map(img => img.url);
      onUploadComplete(imageUrls);

    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="image-upload">
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileUpload}
        disabled={uploading}
      />
      {uploading && <div>Uploading... {progress}%</div>}
    </div>
  );
};
```

---

### Example 5: Update Order Status

```javascript
// components/OrderStatusUpdate.jsx
import { useState } from 'react';
import { apiRequest } from '../utils/api';

export const OrderStatusUpdate = ({ orderId, currentStatus, onUpdate }) => {
  const [status, setStatus] = useState(currentStatus);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const payload = { status };

      // Tracking number required for shipped status
      if (status === 'shipped') {
        if (!trackingNumber) {
          alert('Please enter tracking number');
          setLoading(false);
          return;
        }
        payload.trackingNumber = trackingNumber;
      }

      await apiRequest(`/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      alert('Order status updated successfully');
      onUpdate();
    } catch (error) {
      alert('Failed to update status: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        {statuses.map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      {status === 'shipped' && (
        <input
          type="text"
          placeholder="Tracking Number"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
        />
      )}

      <button onClick={handleUpdate} disabled={loading}>
        {loading ? 'Updating...' : 'Update Status'}
      </button>
    </div>
  );
};
```

---

## Error Handling

### Common Error Scenarios

```javascript
// utils/api.js - Enhanced error handling
export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('adminToken');

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    }
  };

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    // Handle different error codes
    switch (response.status) {
      case 401:
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('adminToken');
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');

      case 403:
        // Forbidden - email not verified or account locked
        if (data.error?.code === 'EMAIL_NOT_VERIFIED') {
          window.location.href = '/verify-email';
          throw new Error('Please verify your email first');
        }
        if (data.error?.code === 'ACCOUNT_LOCKED') {
          throw new Error('Account locked due to too many failed attempts');
        }
        throw new Error(data.error?.message || 'Access forbidden');

      case 404:
        throw new Error('Resource not found');

      case 409:
        // Conflict - duplicate resource
        throw new Error(data.error?.message || 'Resource already exists');

      case 429:
        // Rate limit exceeded
        throw new Error('Too many requests. Please try again later.');

      case 422:
      case 400:
        // Validation errors
        if (data.error?.details && Array.isArray(data.error.details)) {
          const errorMessages = data.error.details.map(d => d.msg).join(', ');
          throw new Error(errorMessages);
        }
        throw new Error(data.error?.message || 'Validation failed');

      case 500:
        throw new Error('Server error. Please try again later.');

      default:
        if (!response.ok) {
          throw new Error(data.error?.message || 'Request failed');
        }
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
```

---

## Best Practices

### 1. Token Management

```javascript
// Use axios interceptors or fetch wrapper for automatic token injection
// Refresh token before expiry (if implementing refresh tokens)
// Clear token on logout
// Handle token expiry gracefully
```

### 2. Loading States

```javascript
// Always show loading indicators during API calls
const [loading, setLoading] = useState(false);

// Disable buttons during submission
<button disabled={loading}>
  {loading ? 'Saving...' : 'Save'}
</button>
```

### 3. Error Messages

```javascript
// Show user-friendly error messages
const [error, setError] = useState('');

try {
  // API call
} catch (err) {
  setError(err.message);
  // Show toast notification
}
```

### 4. Form Validation

```javascript
// Validate on client-side before API call
// Server validates again (never trust client)
// Show field-specific errors
```

### 5. Pagination

```javascript
// Use URL query parameters for filters/pagination
// Persist user's filter choices
// Show total results count
```

### 6. Optimistic Updates

```javascript
// Update UI immediately, revert on error
const deleteProduct = async (id) => {
  // Remove from UI immediately
  setProducts(products.filter(p => p.id !== id));

  try {
    await apiRequest(`/products/${id}`, { method: 'DELETE' });
  } catch (error) {
    // Revert on error
    fetchProducts();
    alert('Failed to delete');
  }
};
```

### 7. Image Optimization

```javascript
// Compress images before upload
// Show thumbnails in lists
// Lazy load images
// Use Cloudinary transformations
```

---

## Admin Panel Pages Checklist

- [ ] **Login Page** - `/login`
- [ ] **Dashboard** - `/dashboard`
- [ ] **Products**
  - [ ] Product List - `/products`
  - [ ] Add Product - `/products/new`
  - [ ] Edit Product - `/products/:id/edit`
  - [ ] Low Stock - `/products/low-stock`
- [ ] **Categories**
  - [ ] Category List - `/categories`
  - [ ] Add Category - `/categories/new`
  - [ ] Edit Category - `/categories/:id/edit`
- [ ] **Orders**
  - [ ] Order List - `/orders`
  - [ ] Order Details - `/orders/:id`
- [ ] **Reviews**
  - [ ] Review List - `/reviews`
  - [ ] Pending Reviews - `/reviews/pending`
- [ ] **Media Library** - `/media`
- [ ] **Settings**
  - [ ] Store Info - `/settings/store`
  - [ ] WhatsApp - `/settings/whatsapp`
  - [ ] Social Media - `/settings/social`
  - [ ] Shipping & Tax - `/settings/shipping`
- [ ] **Email Templates** - `/email-templates`
- [ ] **Profile** - `/profile`

---

## Testing Your Implementation

### 1. Authentication Flow
```bash
# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@glownatura.com","password":"YourPassword123!"}'

# Test protected route
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Create Product
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "price": 50,
    "stock": 100,
    "status": "active"
  }'
```

### 3. Upload Image
```bash
curl -X POST http://localhost:5000/api/media \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "files=@/path/to/image.jpg"
```

---

**Last Updated:** 2025-11-16
**For:** Admin Panel Frontend Developers
**Backend API Version:** 1.0.0
