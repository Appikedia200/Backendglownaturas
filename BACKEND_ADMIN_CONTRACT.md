# BACKEND ↔ ADMIN PANEL CONTRACT

## What the Backend Expects from the Admin Panel

This document defines the **exact contract** between your Express.js backend and the Next.js admin panel.

---

## 1. AUTHENTICATION REQUIREMENTS

### What Backend Expects:

**Every Protected Request Must Include:**
```
Authorization: Bearer <JWT_TOKEN>
```

### How Admin Panel Must Handle This:

**Step 1: Login**
```typescript
// Admin panel calls
POST /api/auth/login
Body: { email: "admin@glownatura.com", password: "password123" }

// Backend returns
Response: {
  success: true,
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  data: { _id: "...", name: "John Doe", email: "..." }
}
```

**Step 2: Store Token**
```typescript
// Admin panel stores in cookie
Cookies.set('auth_token', response.token, { expires: 30 })
```

**Step 3: Send Token with Every Request**
```typescript
// Admin panel axios interceptor
apiClient.interceptors.request.use((config) => {
  const token = Cookies.get('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

**Step 4: Handle Token Expiry**
```typescript
// Admin panel axios interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

---

## 2. REQUEST FORMAT EXPECTATIONS

### Content-Type Headers

**For JSON Data (Most Requests):**
```
Content-Type: application/json
```

**For File Uploads (Images):**
```
Content-Type: multipart/form-data
```

### Request Body Format

**Backend Expects JSON:**
```javascript
// Admin panel sends
{
  "name": "Glow Serum",
  "price": 5000,
  "stock": 50
}

// NOT this
name=Glow+Serum&price=5000&stock=50
```

---

## 3. RESPONSE FORMAT FROM BACKEND

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message here",
  "errorCode": "VALIDATION_ERROR"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### What Admin Panel Must Do:

**Check Success Field:**
```typescript
const response = await apiClient.get('/api/products')

if (response.success) {
  setProducts(response.data)
  setPagination(response.pagination)
} else {
  toast.error(response.error)
}
```

---

## 4. QUERY PARAMETERS FOR FILTERING

### What Backend Accepts:

**Pagination:**
```
GET /api/products?page=1&limit=20
```

**Search:**
```
GET /api/products?search=serum
```

**Filtering:**
```
GET /api/products?category=skincare&status=active
```

**Sorting:**
```
GET /api/products?sortBy=price&order=desc
```

**Combined:**
```
GET /api/products?page=2&limit=10&category=skincare&search=glow&status=active
```

### How Admin Panel Must Send:

```typescript
const params = {
  page: 1,
  limit: 20,
  search: searchTerm,
  category: selectedCategory,
  status: selectedStatus
}

// Axios automatically converts to query string
const response = await apiClient.get('/api/products', { params })
```

---

## 5. FILE UPLOAD EXPECTATIONS

### What Backend Expects:

**FormData with File:**
```typescript
// Admin panel must send
const formData = new FormData()
formData.append('image', fileObject)
formData.append('title', 'Product Image')
formData.append('altText', 'Glow Serum Bottle')

// Send with multipart/form-data header
POST /api/media
Content-Type: multipart/form-data
Body: formData
```

### What Backend Returns:

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "cloudinaryUrl": "https://res.cloudinary.com/...",
    "cloudinaryPublicId": "glownatura/...",
    "fileSize": 245678,
    "mimeType": "image/jpeg",
    "width": 800,
    "height": 600
  }
}
```

### How Admin Panel Must Handle:

```typescript
const handleImageUpload = async (file: File) => {
  const formData = new FormData()
  formData.append('image', file)
  
  const response = await apiClient.post('/api/media', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  
  if (response.success) {
    // Use the Cloudinary URL
    setProductImage(response.data.cloudinaryUrl)
  }
}
```

---

## 6. COMPLETE API ENDPOINTS REFERENCE

### Authentication Endpoints

```
POST   /api/auth/login
Body:  { email: string, password: string }
Returns: { success: true, token: string, data: Admin }

POST   /api/auth/register
Body:  { name: string, email: string, password: string }
Returns: { success: true, message: string }

GET    /api/auth/me
Headers: Authorization: Bearer <token>
Returns: { success: true, data: Admin }

POST   /api/auth/logout
Headers: Authorization: Bearer <token>
Returns: { success: true, message: string }

PUT    /api/auth/profile
Headers: Authorization: Bearer <token>
Body:  { name: string }
Returns: { success: true, data: Admin }

PUT    /api/auth/change-password
Headers: Authorization: Bearer <token>
Body:  { currentPassword: string, newPassword: string }
Returns: { success: true, message: string }
```

### Product Endpoints

```
GET    /api/products
Query:  ?page=1&limit=20&search=...&category=...&status=...
Returns: PaginatedResponse<Product[]>

GET    /api/products/:id
Returns: { success: true, data: Product }

POST   /api/products
Headers: Authorization: Bearer <token>
Body:  { name, description, price, category, stock, ... }
Returns: { success: true, data: Product }

PUT    /api/products/:id
Headers: Authorization: Bearer <token>
Body:  { name, price, stock, ... }
Returns: { success: true, data: Product }

DELETE /api/products/:id
Headers: Authorization: Bearer <token>
Returns: { success: true, message: string }

POST   /api/products/generate-sku
Headers: Authorization: Bearer <token>
Body:  { categoryId?: string }
Returns: { success: true, data: { sku: string } }

GET    /api/products/low-stock
Headers: Authorization: Bearer <token>
Returns: { success: true, data: Product[] }
```

### Category Endpoints

```
GET    /api/categories
Returns: { success: true, data: Category[] }

GET    /api/categories/:id
Returns: { success: true, data: Category }

POST   /api/categories
Headers: Authorization: Bearer <token>
Body:  { name, description, image?, displayOrder, active }
Returns: { success: true, data: Category }

PUT    /api/categories/:id
Headers: Authorization: Bearer <token>
Body:  { name, description, displayOrder, active }
Returns: { success: true, data: Category }

DELETE /api/categories/:id
Headers: Authorization: Bearer <token>
Returns: { success: true, message: string }
```

### Review Endpoints

```
GET    /api/reviews
Query:  ?page=1&limit=20&status=...&product=...
Returns: PaginatedResponse<Review[]>

GET    /api/reviews/:id
Returns: { success: true, data: Review }

PUT    /api/reviews/:id/status
Headers: Authorization: Bearer <token>
Body:  { status: 'approved' | 'rejected' }
Returns: { success: true, data: Review }

DELETE /api/reviews/:id
Headers: Authorization: Bearer <token>
Returns: { success: true, message: string }
```

### Order Endpoints

```
GET    /api/orders
Query:  ?page=1&limit=20&status=...&search=...&startDate=...&endDate=...
Returns: PaginatedResponse<Order[]>

GET    /api/orders/:id
Returns: { success: true, data: Order }

POST   /api/orders
Body:  { customer, items, paymentMethod, shippingMethod, ... }
Returns: { success: true, data: Order }

PUT    /api/orders/:id/confirm-payment
Headers: Authorization: Bearer <token>
Body:  { transactionReference?, paidAmount, paymentProof? }
Returns: { success: true, data: Order }

PUT    /api/orders/:id/status
Headers: Authorization: Bearer <token>
Body:  { status, trackingNumber?, carrier?, estimatedDelivery? }
Returns: { success: true, data: Order }

PUT    /api/orders/:id/cancel
Headers: Authorization: Bearer <token>
Body:  { cancelReason: string }
Returns: { success: true, data: Order }

POST   /api/orders/:id/notes
Headers: Authorization: Bearer <token>
Body:  { note: string }
Returns: { success: true, data: Order }

GET    /api/orders/export
Headers: Authorization: Bearer <token>
Query:  ?status=...&startDate=...&endDate=...
Returns: CSV file download
```

### Media Endpoints

```
GET    /api/media
Query:  ?page=1&limit=50&search=...&tags=...
Returns: PaginatedResponse<Media[]>

GET    /api/media/:id
Returns: { success: true, data: Media }

POST   /api/media
Headers: Authorization: Bearer <token>, Content-Type: multipart/form-data
Body:  FormData with 'image' file
Returns: { success: true, data: Media }

PUT    /api/media/:id
Headers: Authorization: Bearer <token>
Body:  { title, altText, description, tags }
Returns: { success: true, data: Media }

DELETE /api/media/:id
Headers: Authorization: Bearer <token>
Returns: { success: true, message: string }
```

### Settings Endpoints

```
GET    /api/settings
Returns: { success: true, data: Settings }

PUT    /api/settings
Headers: Authorization: Bearer <token>
Body:  { store?, whatsapp?, social? }
Returns: { success: true, data: Settings }
```

### Email Template Endpoints

```
GET    /api/email-templates
Headers: Authorization: Bearer <token>
Returns: { success: true, data: EmailTemplate[] }

GET    /api/email-templates/:type
Returns: { success: true, data: EmailTemplate }

PUT    /api/email-templates/:id
Headers: Authorization: Bearer <token>
Body:  { subject, htmlContent, textContent }
Returns: { success: true, data: EmailTemplate }
```

### Dashboard Endpoints

```
GET    /api/dashboard/stats
Headers: Authorization: Bearer <token>
Returns: { success: true, data: DashboardStats }
```

---

## 7. ERROR HANDLING REQUIREMENTS

### HTTP Status Codes Backend Returns:

```
200 - Success (GET, PUT)
201 - Created (POST)
400 - Bad Request (validation errors)
401 - Unauthorized (missing/invalid token)
403 - Forbidden (insufficient permissions)
404 - Not Found (resource doesn't exist)
409 - Conflict (duplicate data)
429 - Too Many Requests (rate limited)
500 - Server Error
```

### What Admin Panel Must Do:

```typescript
try {
  const response = await apiClient.post('/api/products', data)
  
  if (response.success) {
    toast.success('Product created successfully')
    router.push('/products')
  }
  
} catch (error: any) {
  // Backend sends error in response.data.error
  const errorMessage = error.error || error.message || 'Something went wrong'
  
  if (error.errorCode === 'VALIDATION_ERROR') {
    // Show field-specific errors
    showValidationErrors(error.errors)
  } else {
    // Show general error toast
    toast.error(errorMessage)
  }
}
```

---

## 8. VALIDATION REQUIREMENTS

### What Backend Validates (You Don't Need To):

Backend already validates:
- Required fields
- Email format
- Password strength (min 8 chars)
- Company email domain (@glownatura.com)
- Product stock (non-negative)
- Price (positive number)
- SKU uniqueness
- Category existence
- File types (images only)
- File size (max 10MB)

### What Admin Panel Should Still Validate:

For better UX, validate before sending:
- Required fields (show red borders)
- Number formats (prevent letters in price)
- Email format (basic check)
- Password match (confirm password)
- File size (before upload)
- Image dimensions (if needed)

**But always rely on backend validation as final authority.**

---

## 9. DATA TYPES BACKEND EXPECTS

### Product Creation Example:

```typescript
// Backend expects exactly this structure
{
  name: string,                    // Required
  slug: string,                    // Auto-generated if not provided
  description: {
    short: string,                 // Required, min 10 chars
    full: string                   // Required, min 50 chars
  },
  price: number,                   // Required, positive
  salePrice: number,               // Optional, must be < price
  images: [                        // Required, min 1 image
    {
      url: string,                 // Cloudinary URL
      altText: string,
      isDefault: boolean
    }
  ],
  category: string,                // Required, valid ObjectId
  stock: number,                   // Required, >= 0
  sku: string,                     // Required, unique
  trackInventory: boolean,         // Default true
  keywords: string[],              // Optional
  ingredients: string[],           // Optional
  concerns: string[],              // Optional
  skinType: string[],              // Optional
  brand: string,                   // Optional
  seo: {                           // Optional
    title: string,
    description: string,
    keywords: string[]
  },
  featured: boolean,               // Default false
  status: 'active' | 'inactive' | 'draft'  // Default 'draft'
}
```

### Order Status Update Example:

```typescript
// Backend expects
{
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
  trackingNumber?: string,         // Required if status = 'shipped'
  carrier?: string,                // Optional
  estimatedDelivery?: Date         // Optional
}
```

---

## 10. WHAT ADMIN PANEL SHOULD NOT DO

### Don't Try To:

❌ **Validate JWT tokens** (backend does this)
❌ **Hash passwords** (backend does this)
❌ **Generate SKUs manually** (use API endpoint)
❌ **Calculate order totals** (backend does this)
❌ **Manage stock directly** (backend handles reservation/deduction)
❌ **Generate PDF receipts** (backend does this automatically)
❌ **Send emails** (backend does this automatically)
❌ **Delete files from Cloudinary** (backend does this via API)
❌ **Create slugs manually** (backend auto-generates)

### Do This Instead:

✅ **Call the appropriate API endpoint**
✅ **Trust backend responses**
✅ **Show backend error messages to user**
✅ **Handle loading and error states**
✅ **Provide good UX with validation feedback**

---

## 11. CRITICAL FLOW EXAMPLES

### Creating a Product (Complete Flow):

```typescript
// Step 1: Upload images first
const uploadedImages = []
for (const file of imageFiles) {
  const formData = new FormData()
  formData.append('image', file)
  
  const imageResponse = await apiClient.post('/api/media', formData)
  uploadedImages.push({
    url: imageResponse.data.cloudinaryUrl,
    altText: file.name,
    isDefault: uploadedImages.length === 0
  })
}

// Step 2: Generate SKU (optional, backend can auto-generate)
const skuResponse = await apiClient.post('/api/products/generate-sku', {
  categoryId: selectedCategory
})

// Step 3: Create product
const productData = {
  name: formData.name,
  description: {
    short: formData.shortDescription,
    full: formData.fullDescription
  },
  price: parseFloat(formData.price),
  salePrice: formData.salePrice ? parseFloat(formData.salePrice) : undefined,
  images: uploadedImages,
  category: selectedCategory,
  stock: parseInt(formData.stock),
  sku: skuResponse.data.sku,
  trackInventory: formData.trackInventory,
  keywords: formData.keywords.split(',').map(k => k.trim()),
  status: formData.status
}

const response = await apiClient.post('/api/products', productData)

if (response.success) {
  toast.success('Product created!')
  router.push('/products')
}
```

### Confirming Order Payment (Complete Flow):

```typescript
// Admin uploads payment proof (bank transfer screenshot)
const formData = new FormData()
formData.append('image', paymentProofFile)

const uploadResponse = await apiClient.post('/api/media', formData)

// Confirm payment with proof
const response = await apiClient.put(`/api/orders/${orderId}/confirm-payment`, {
  transactionReference: formData.transactionRef,
  paidAmount: parseFloat(formData.amount),
  paymentProof: uploadResponse.data.cloudinaryUrl
})

if (response.success) {
  // Backend automatically:
  // - Deducts reserved stock
  // - Generates PDF receipt
  // - Sends confirmation email to customer
  // - Updates order status to 'processing'
  
  toast.success('Payment confirmed! Customer notified via email.')
  refetchOrder()
}
```

### Updating Order Status (Complete Flow):

```typescript
// When status changes to "shipped"
const response = await apiClient.put(`/api/orders/${orderId}/status`, {
  status: 'shipped',
  trackingNumber: formData.trackingNumber,
  carrier: formData.carrier,
  estimatedDelivery: formData.estimatedDate
})

if (response.success) {
  // Backend automatically:
  // - Sends appropriate email (local/courier/pickup based on shipping method)
  // - Updates order timeline
  // - Logs admin action
  
  toast.success('Order status updated! Customer notified.')
  refetchOrder()
}
```

---

## 12. ENVIRONMENT VARIABLES ADMIN PANEL NEEDS

```env
# Required
NEXT_PUBLIC_API_URL=http://localhost:5000

# Optional (for production)
NEXT_PUBLIC_APP_NAME=GlowNatura Admin
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

**That's it!** Admin panel doesn't need:
- Database connection strings
- Cloudinary credentials
- Email API keys
- JWT secrets

**Backend handles all of that.**

---

## 13. SUMMARY: THE CONTRACT

### Admin Panel's Responsibilities:

1. ✅ Send JWT token with every protected request
2. ✅ Use correct HTTP methods (GET, POST, PUT, DELETE)
3. ✅ Send data in JSON format (except file uploads)
4. ✅ Handle backend responses correctly
5. ✅ Show loading states during API calls
6. ✅ Display backend error messages to users
7. ✅ Validate user input for better UX
8. ✅ Upload files as FormData
9. ✅ Handle token expiry (redirect to login)
10. ✅ Call correct API endpoints

### Backend's Responsibilities:

1. ✅ Validate all incoming data
2. ✅ Authenticate requests (verify JWT)
3. ✅ Authorize admin actions
4. ✅ Perform business logic (stock, totals, etc.)
5. ✅ Upload files to Cloudinary
6. ✅ Generate PDFs and emails
7. ✅ Send consistent response format
8. ✅ Handle errors gracefully
9. ✅ Log admin actions
10. ✅ Rate limit requests

---

## 14. QUICK CHECKLIST FOR EVERY FEATURE

When building any admin panel feature, ensure:

- [ ] API client sends Authorization header
- [ ] Request body matches backend expectations
- [ ] Response format is checked (success field)
- [ ] Loading state shows during API call
- [ ] Success message displays (toast)
- [ ] Error message displays (toast)
- [ ] Data refetches after mutations
- [ ] Form validation provides instant feedback
- [ ] File uploads use FormData
- [ ] Token expiry redirects to login

---

**This is the complete contract. Follow this, and the admin panel will work perfectly with the backend without complications.**

