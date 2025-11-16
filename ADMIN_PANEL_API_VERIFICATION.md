# Admin Panel API Routes Verification Guide

This document provides a comprehensive mapping of all backend API routes for the GlowNaturas admin panel. Use this to verify that your admin panel frontend properly implements all available backend endpoints.

---

## Base URL Structure

All routes are prefixed with `/api/` and organized by resource:

```
/api/auth           - Authentication & Admin Management
/api/products       - Product Management
/api/categories     - Category Management
/api/orders         - Order Management
/api/reviews        - Review Management
/api/media          - Media Library Management
/api/dashboard      - Dashboard Analytics
/api/settings       - Store Settings
/api/email-templates - Email Template Management
/api/cart           - Shopping Cart (Customer-facing)
```

---

## 1. Authentication & Admin Management
**Base Route:** `/api/auth`

### Public Routes (No Authentication Required)

| Method | Endpoint | Description | Rate Limited |
|--------|----------|-------------|--------------|
| `POST` | `/api/auth/register` | Register new admin (company email only) | Yes (5/15min) |
| `POST` | `/api/auth/verify-email` | Verify admin email with token | No |
| `POST` | `/api/auth/resend-verification` | Resend verification email | Yes (5/15min) |
| `POST` | `/api/auth/login` | Admin login | Yes (5/15min) |
| `POST` | `/api/auth/forgot-password` | Request password reset | Yes (5/15min) |
| `POST` | `/api/auth/reset-password` | Reset password with token | No |

### Protected Routes (Require JWT Token)

| Method | Endpoint | Description | Audit Logged |
|--------|----------|-------------|--------------|
| `GET` | `/api/auth/me` | Get current admin profile | No |
| `PUT` | `/api/auth/profile` | Update admin profile | No |
| `PUT` | `/api/auth/change-password` | Change admin password | No |
| `POST` | `/api/auth/logout` | Logout admin session | Yes |

**Authentication Header Required:**
```
Authorization: Bearer <JWT_TOKEN>
```

---

## 2. Product Management
**Base Route:** `/api/products`

### Public Routes

| Method | Endpoint | Description | Validation |
|--------|----------|-------------|------------|
| `GET` | `/api/products` | Get all products (with filters) | validateGetProducts |
| `GET` | `/api/products/:id` | Get single product details | validateProductId |

**Query Parameters for GET /api/products:**
- `category` - Filter by category ID
- `status` - Filter by status (active/inactive)
- `search` - Search in name/description
- `minPrice` / `maxPrice` - Price range
- `inStock` - Boolean filter
- `page` / `limit` - Pagination
- `sort` - Sort field
- `order` - Sort order (asc/desc)

### Protected Admin Routes

| Method | Endpoint | Description | Audit Logged | Validation |
|--------|----------|-------------|--------------|------------|
| `POST` | `/api/products` | Create new product | Yes (create) | validateCreateProduct |
| `GET` | `/api/products/generate-sku` | Generate unique SKU | No | - |
| `GET` | `/api/products/low-stock` | Get low stock alerts | No | - |
| `PUT` | `/api/products/:id` | Update product | Yes (update) | validateUpdateProduct |
| `DELETE` | `/api/products/:id` | Delete product | Yes (delete) | validateProductId |
| `PUT` | `/api/products/bulk/status` | Bulk update product status | No | - |

**Product Fields:**
- `name` - Product name (required)
- `description` - Product description
- `price` - Product price (required)
- `compareAtPrice` - Original price for discounts
- `sku` - Stock Keeping Unit (auto-generated)
- `category` - Category ID reference
- `images` - Array of image URLs
- `stock` - Stock quantity
- `lowStockThreshold` - Alert threshold
- `status` - active/inactive
- `featured` - Boolean
- `tags` - Array of tags
- `seo` - SEO metadata (title, description, keywords)

---

## 3. Category Management
**Base Route:** `/api/categories`

### Public Routes

| Method | Endpoint | Description | Validation |
|--------|----------|-------------|------------|
| `GET` | `/api/categories` | Get all categories | - |
| `GET` | `/api/categories/:id` | Get single category | validateCategoryId |

### Protected Admin Routes

| Method | Endpoint | Description | Audit Logged | Validation |
|--------|----------|-------------|--------------|------------|
| `POST` | `/api/categories` | Create new category | No | validateCreateCategory |
| `PUT` | `/api/categories/:id` | Update category | No | validateUpdateCategory |
| `DELETE` | `/api/categories/:id` | Delete category | No | validateCategoryId |
| `PUT` | `/api/categories/reorder` | Reorder categories | No | - |

**Category Fields:**
- `name` - Category name (required)
- `slug` - URL-friendly name (auto-generated)
- `description` - Category description
- `image` - Category image URL
- `parent` - Parent category ID (for subcategories)
- `order` - Display order
- `status` - active/inactive
- `seo` - SEO metadata

---

## 4. Order Management
**Base Route:** `/api/orders`

### Public Routes

| Method | Endpoint | Description | Rate Limited | Validation |
|--------|----------|-------------|--------------|------------|
| `POST` | `/api/orders` | Create new order (customer) | Yes (10/hour) | validateCreateOrder |

### Protected Admin Routes

| Method | Endpoint | Description | Audit Logged | Validation |
|--------|----------|-------------|--------------|------------|
| `GET` | `/api/orders` | Get all orders (with filters) | No | validateGetOrders |
| `GET` | `/api/orders/export` | Export orders to CSV/Excel | No | - |
| `GET` | `/api/orders/:id` | Get single order details | No | validateGetOrder |
| `PUT` | `/api/orders/:id/confirm-payment` | Confirm payment received | Yes (update) | validateConfirmPayment |
| `PUT` | `/api/orders/:id/status` | Update order status | Yes (update) | validateUpdateOrderStatus |
| `PUT` | `/api/orders/:id/cancel` | Cancel order | Yes (update) | validateCancelOrder |
| `POST` | `/api/orders/:id/notes` | Add internal note to order | Yes (update) | validateAddOrderNote |
| `POST` | `/api/orders/:id/refund/request` | Request refund | Yes (create refund) | - |
| `PUT` | `/api/orders/:id/refund/process` | Process refund | Yes (update refund) | - |

**Query Parameters for GET /api/orders:**
- `status` - Filter by order status
- `paymentStatus` - Filter by payment status
- `startDate` / `endDate` - Date range
- `search` - Search by order number or customer info
- `page` / `limit` - Pagination
- `sort` - Sort field
- `order` - Sort order

**Order Status Flow:**
```
pending → confirmed → processing → shipped → delivered
                    ↘ cancelled
```

**Payment Status:**
- `pending` - Awaiting payment
- `paid` - Payment confirmed
- `failed` - Payment failed
- `refunded` - Refunded

**Order Fields:**
- `orderNumber` - Unique order number (auto-generated)
- `customer` - Customer information object
  - `name`, `email`, `phone`, `whatsapp`
- `shippingAddress` - Shipping address object
- `items` - Array of order items
  - `product`, `quantity`, `price`, `total`
- `subtotal` - Order subtotal
- `shipping` - Shipping cost
- `tax` - Tax amount
- `total` - Grand total
- `status` - Order status
- `paymentMethod` - Payment method
- `paymentStatus` - Payment status
- `notes` - Internal admin notes (array)
- `refund` - Refund information (if applicable)

---

## 5. Review Management
**Base Route:** `/api/reviews`

### Public Routes

| Method | Endpoint | Description | Rate Limited | Validation |
|--------|----------|-------------|--------------|------------|
| `POST` | `/api/reviews` | Submit product review (customer) | Yes (5/hour) | validateCreateReview |
| `GET` | `/api/reviews` | Get all reviews (approved only) | No | - |
| `GET` | `/api/reviews/:id` | Get single review | No | validateReviewId |

**Query Parameters for GET /api/reviews:**
- `product` - Filter by product ID
- `status` - Filter by status (for admin)
- `rating` - Filter by rating
- `page` / `limit` - Pagination

### Protected Admin Routes

| Method | Endpoint | Description | Audit Logged | Validation |
|--------|----------|-------------|--------------|------------|
| `PUT` | `/api/reviews/:id/status` | Approve/reject review | Yes (approve) | validateUpdateReviewStatus |
| `DELETE` | `/api/reviews/:id` | Delete review | Yes (delete) | validateReviewId |
| `PUT` | `/api/reviews/bulk/status` | Bulk approve/reject reviews | No | - |

**Review Status:**
- `pending` - Awaiting moderation
- `approved` - Published
- `rejected` - Rejected

**Review Fields:**
- `product` - Product ID reference (required)
- `customer` - Customer information
  - `name`, `email`
- `rating` - 1-5 stars (required)
- `title` - Review title
- `comment` - Review text (required)
- `status` - Review status
- `helpful` - Helpful count
- `verified` - Verified purchase flag

---

## 6. Media Library Management
**Base Route:** `/api/media`

### All Routes Protected (Admin Only)

| Method | Endpoint | Description | Audit Logged | File Upload |
|--------|----------|-------------|--------------|-------------|
| `POST` | `/api/media` | Upload media files | Yes (create) | Yes (max 10 files) |
| `GET` | `/api/media` | Get all media files | No | No |
| `GET` | `/api/media/:id` | Get single media file | No | No |
| `PUT` | `/api/media/:id` | Update media metadata | Yes (update) | No |
| `DELETE` | `/api/media/:id` | Delete media file | Yes (delete) | No |
| `DELETE` | `/api/media/bulk/unused` | Bulk delete unused media | Yes (delete) | No |

**Upload Specifications:**
- Max files per upload: 10
- Accepted formats: Images (jpg, jpeg, png, gif, webp)
- Storage: Cloudinary
- Max file size: 10MB (configurable)

**Media Fields:**
- `url` - Cloudinary URL (auto-generated)
- `publicId` - Cloudinary public ID
- `filename` - Original filename
- `size` - File size in bytes
- `mimeType` - MIME type
- `width` / `height` - Image dimensions
- `alt` - Alt text for SEO
- `title` - Media title
- `folder` - Organization folder
- `tags` - Array of tags
- `usedIn` - References (products, categories)

**Query Parameters for GET /api/media:**
- `folder` - Filter by folder
- `tags` - Filter by tags
- `unused` - Show unused media only
- `page` / `limit` - Pagination

---

## 7. Dashboard Analytics
**Base Route:** `/api/dashboard`

### All Routes Protected (Admin Only)

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| `GET` | `/api/dashboard/stats` | Get dashboard statistics | `period` (today, week, month, year) |
| `GET` | `/api/dashboard/recent-orders` | Get recent orders | `limit` (default: 10) |
| `GET` | `/api/dashboard/top-products` | Get top-selling products | `period`, `limit` (default: 10) |
| `GET` | `/api/dashboard/sales-data` | Get sales chart data | `period`, `groupBy` (day, week, month) |

**Dashboard Stats Response:**
```json
{
  "totalRevenue": 0,
  "totalOrders": 0,
  "pendingOrders": 0,
  "totalProducts": 0,
  "lowStockProducts": 0,
  "totalCustomers": 0,
  "totalReviews": 0,
  "pendingReviews": 0,
  "revenueChange": 0,    // % change vs previous period
  "ordersChange": 0      // % change vs previous period
}
```

**Sales Data Response:**
```json
{
  "labels": ["Jan", "Feb", "Mar", ...],
  "revenue": [1000, 1500, 2000, ...],
  "orders": [10, 15, 20, ...]
}
```

---

## 8. Store Settings Management
**Base Route:** `/api/settings`

### Public Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/settings` | Get all store settings (public fields only) |

### Protected Admin Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `PUT` | `/api/settings` | Update all settings |
| `PUT` | `/api/settings/store-info` | Update store information |
| `PUT` | `/api/settings/whatsapp` | Update WhatsApp settings |
| `PUT` | `/api/settings/email-templates` | Update email template settings |
| `PUT` | `/api/settings/social-media` | Update social media links |

**Settings Structure:**
```json
{
  "storeInfo": {
    "name": "GlowNatura",
    "tagline": "",
    "description": "",
    "logo": "",
    "favicon": "",
    "email": "",
    "phone": "",
    "address": {
      "street": "",
      "city": "",
      "state": "",
      "zipCode": "",
      "country": ""
    }
  },
  "whatsapp": {
    "enabled": true,
    "number": "",
    "message": "Hello! I'm interested in your products."
  },
  "socialMedia": {
    "facebook": "",
    "instagram": "",
    "twitter": "",
    "youtube": "",
    "tiktok": ""
  },
  "shipping": {
    "freeShippingThreshold": 0,
    "defaultShippingCost": 0
  },
  "tax": {
    "enabled": false,
    "rate": 0
  },
  "currency": {
    "code": "USD",
    "symbol": "$"
  }
}
```

---

## 9. Email Template Management
**Base Route:** `/api/email-templates`

### All Routes Protected (Admin Only)

| Method | Endpoint | Description | Audit Logged |
|--------|----------|-------------|--------------|
| `GET` | `/api/email-templates` | Get all email templates | No |
| `GET` | `/api/email-templates/:type` | Get template by type | No |
| `PUT` | `/api/email-templates/:type` | Update email template | Yes (update) |
| `POST` | `/api/email-templates/preview` | Preview template with data | No |
| `POST` | `/api/email-templates/test-send` | Send test email | No |
| `POST` | `/api/email-templates/:type/restore` | Restore default template | Yes (update) |

**Template Types:**
- `order-confirmation` - Order confirmation email
- `payment-confirmed` - Payment confirmation email
- `order-shipped` - Shipping notification email
- `order-delivered` - Delivery confirmation email
- `order-cancelled` - Cancellation notification email
- `refund-processed` - Refund confirmation email
- `welcome` - Welcome email (optional)
- `password-reset` - Password reset email (system)
- `email-verification` - Email verification (system)

**Template Fields:**
```json
{
  "type": "order-confirmation",
  "subject": "Order Confirmation - #{orderNumber}",
  "body": "HTML template with variables",
  "variables": ["customerName", "orderNumber", "items", "total"],
  "isDefault": false
}
```

**Available Variables (by template type):**
- Order emails: `{customerName}`, `{orderNumber}`, `{items}`, `{total}`, `{shippingAddress}`, `{trackingNumber}`
- Customer emails: `{customerName}`, `{email}`, `{resetLink}`, `{verificationLink}`

---

## 10. Shopping Cart (Customer-facing)
**Base Route:** `/api/cart`

### Public Routes (No Authentication)

| Method | Endpoint | Description | Validation |
|--------|----------|-------------|------------|
| `POST` | `/api/cart` | Add item to cart | validateAddToCart |
| `GET` | `/api/cart/:sessionId` | Get cart by session ID | - |
| `PUT` | `/api/cart/:sessionId/item/:itemId` | Update cart item quantity | validateUpdateCartItem |
| `DELETE` | `/api/cart/:sessionId/item/:itemId` | Remove item from cart | validateCartItemId |
| `DELETE` | `/api/cart/:sessionId` | Clear entire cart | - |

**Note:** Cart operations use `sessionId` for guest users (generated client-side). These are customer-facing routes that the admin panel typically doesn't need to interact with directly.

---

## Security & Validation Summary

### Rate Limiting

| Endpoint Pattern | Limit | Window |
|-----------------|-------|--------|
| `/api/auth/*` | 5 requests | 15 minutes |
| `/api/orders` (POST) | 10 requests | 1 hour |
| `/api/reviews` (POST) | 5 requests | 1 hour |
| All other routes | 100 requests | 15 minutes |

### Authentication Requirements

**Public Routes (No Auth):**
- Product browsing (`GET /api/products`)
- Category browsing (`GET /api/categories`)
- Review browsing (`GET /api/reviews`)
- Store settings (`GET /api/settings`)
- Customer cart operations
- Customer order creation
- Customer review submission
- Auth routes (register, login, password reset)

**Protected Routes (JWT Required):**
- All POST, PUT, DELETE operations (except customer-facing)
- Dashboard analytics
- Order management
- Review moderation
- Media library
- Settings management
- Email template management

### Input Validation

All routes implement:
- **Express Validator** - Schema-based validation
- **NoSQL Injection Prevention** - Sanitizes `$` operators
- **XSS Protection** - Strips malicious scripts
- **Request Payload Limits** - Max 10MB

### Audit Logging

The following actions are automatically logged:
- `create`, `update`, `delete` - Resource operations
- `approve`, `reject` - Review moderation
- `login`, `logout` - Authentication events

Logged information:
- Admin ID
- Action type
- Resource type
- Resource ID
- Changes (before/after)
- IP address
- User agent
- Timestamp

---

## Admin Panel Implementation Checklist

Use this checklist to verify your admin panel implementation:

### Authentication Module
- [ ] Registration form with company email validation
- [ ] Email verification flow
- [ ] Login form with rate limiting feedback
- [ ] Forgot password flow
- [ ] Reset password form
- [ ] Profile management page
- [ ] Change password functionality
- [ ] Logout functionality
- [ ] JWT token storage and refresh
- [ ] Handle expired token errors

### Dashboard Module
- [ ] Overview statistics cards
- [ ] Revenue vs previous period comparison
- [ ] Recent orders widget
- [ ] Top products widget
- [ ] Sales chart with period selection
- [ ] Low stock alerts
- [ ] Pending reviews count

### Product Management
- [ ] Product list with filters (status, category, stock, search)
- [ ] Create product form with image upload
- [ ] Edit product form
- [ ] Delete product with confirmation
- [ ] SKU auto-generation
- [ ] Low stock alerts page
- [ ] Bulk status update
- [ ] Product preview
- [ ] SEO metadata fields

### Category Management
- [ ] Category list
- [ ] Create category form
- [ ] Edit category form
- [ ] Delete category with confirmation
- [ ] Category reordering (drag & drop)
- [ ] Subcategory support
- [ ] Category image upload

### Order Management
- [ ] Order list with filters (status, payment, date, search)
- [ ] Order details page
- [ ] Payment confirmation
- [ ] Order status update
- [ ] Order cancellation
- [ ] Add internal notes
- [ ] Refund request
- [ ] Refund processing
- [ ] Export orders (CSV/Excel)
- [ ] Print order details
- [ ] Email customer notifications

### Review Management
- [ ] Review list with filters (status, product, rating)
- [ ] Approve/reject individual reviews
- [ ] Bulk approve/reject
- [ ] Delete reviews
- [ ] View product context
- [ ] Moderation dashboard

### Media Library
- [ ] Media grid view
- [ ] Upload multiple files (drag & drop)
- [ ] Edit media metadata (alt, title, tags)
- [ ] Delete media with confirmation
- [ ] Bulk delete unused media
- [ ] Filter by folder/tags
- [ ] Search media
- [ ] Copy URL to clipboard
- [ ] Media usage tracking

### Settings Management
- [ ] Store information form
- [ ] WhatsApp integration toggle
- [ ] Social media links
- [ ] Shipping settings
- [ ] Tax settings
- [ ] Currency settings
- [ ] Save confirmation feedback

### Email Template Management
- [ ] Template list by type
- [ ] Template editor (rich text or HTML)
- [ ] Preview template with sample data
- [ ] Send test email
- [ ] Restore default template
- [ ] Variable helper/documentation
- [ ] Subject line editing

### General UI/UX Requirements
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Loading states for API calls
- [ ] Error handling with user-friendly messages
- [ ] Success feedback (toasts/notifications)
- [ ] Form validation (client + server-side)
- [ ] Pagination for large datasets
- [ ] Search functionality
- [ ] Sorting options
- [ ] Filter persistence (query params)
- [ ] Breadcrumb navigation
- [ ] Sidebar menu with active state
- [ ] Header with admin profile dropdown
- [ ] 404 and error pages
- [ ] Unauthorized access handling
- [ ] Session expiry handling

### Security Implementation
- [ ] HTTPS enforcement
- [ ] JWT token secure storage (httpOnly cookies or secure localStorage)
- [ ] Token refresh mechanism
- [ ] CSRF protection
- [ ] XSS prevention (escape user input)
- [ ] Rate limiting feedback
- [ ] Account lockout notification
- [ ] Password strength indicator
- [ ] Email verification enforcement
- [ ] Audit log viewer (optional)

---

## Common HTTP Response Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| `200` | OK | Successful GET, PUT requests |
| `201` | Created | Successful POST (resource created) |
| `204` | No Content | Successful DELETE |
| `400` | Bad Request | Validation errors |
| `401` | Unauthorized | Missing/invalid token |
| `403` | Forbidden | Email not verified, account locked |
| `404` | Not Found | Resource doesn't exist |
| `409` | Conflict | Duplicate resource (email, SKU) |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Server-side error |

---

## Error Response Format

All errors follow this structure:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": []  // Optional array of validation errors
  }
}
```

**Common Error Codes:**
- `NO_TOKEN` - Authorization header missing
- `TOKEN_INVALID` - Malformed JWT token
- `TOKEN_EXPIRED` - Session expired
- `ADMIN_NOT_FOUND` - Admin account doesn't exist
- `EMAIL_NOT_VERIFIED` - Email verification required
- `ACCOUNT_LOCKED` - Account locked due to failed attempts
- `VALIDATION_ERROR` - Input validation failed
- `RESOURCE_NOT_FOUND` - Requested resource not found
- `DUPLICATE_RESOURCE` - Resource already exists

---

## Testing Your Admin Panel

### Manual Testing Checklist

1. **Authentication Flow**
   - Register with non-company email → Should fail
   - Register with company email → Should succeed
   - Login without verification → Should fail
   - Verify email → Should succeed
   - Login with verified account → Should succeed
   - Access protected route without token → Should redirect to login
   - Test password reset flow
   - Test account lockout (5 failed attempts)

2. **Product Management**
   - Create product without required fields → Should show validation errors
   - Create product with all fields → Should succeed
   - Upload product images → Should upload to Cloudinary
   - Edit product → Should update
   - Delete product → Should delete
   - Check low stock alert appears when stock < threshold

3. **Order Management**
   - View orders list → Should display all orders
   - Filter orders by status → Should filter correctly
   - Update order status → Should update and send email
   - Confirm payment → Should update payment status
   - Add order note → Should save note
   - Export orders → Should download file

4. **API Integration**
   - Check all API calls include Authorization header
   - Verify proper error handling (network errors, server errors)
   - Test pagination on large datasets
   - Verify search functionality
   - Test filters and sorting

### Automated Testing (Recommended)

```javascript
// Example: Test API call to get dashboard stats
const response = await fetch('/api/dashboard/stats?period=month', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

expect(response.status).toBe(200);
const data = await response.json();
expect(data).toHaveProperty('totalRevenue');
expect(data).toHaveProperty('totalOrders');
```

---

## Support & Documentation

- **Backend Repository:** /home/user/Backendglownaturas
- **Route Definitions:** `/src/routes/`
- **Controllers:** `/src/controllers/`
- **Models:** `/src/models/`
- **Middleware:** `/src/middleware/`
- **Validators:** `/src/validators/`

For questions or issues, refer to the controller implementations for exact request/response schemas.

---

**Last Updated:** 2025-11-16
**Backend Version:** 1.0.0
**API Version:** v1
