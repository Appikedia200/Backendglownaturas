# Admin Panel Frontend - Backend Integration Guide

**Backend URL**: `https://backendglownaturas.onrender.com/api`  
**Last Updated**: November 21, 2025  
**Backend Version**: 5.1.0

---

## 🎯 CRITICAL CHANGES REQUIRED

### 1. Product Status Values

**Change all instances of product status from**:
```typescript
status: 'published' | 'archived' | 'draft'
```

**To**:
```typescript
status: 'active' | 'inactive' | 'draft'
```

**Where to update**:
- TypeScript type definitions (`src/shared/types/`)
- Zod validation schemas
- Status dropdowns/filters
- Status badge components
- Activate/Deactivate button logic

**Example**:
```typescript
// ❌ OLD - Remove this
status: 'published'  // Wrong

// ✅ NEW - Use this
status: 'active'     // Correct
```

---

### 2. Product Description Structure

Backend uses **flat structure**, not nested.

**Change from**:
```typescript
description: {
  short: string
  full: string
}
```

**To**:
```typescript
description: string              // Full description
shortDescription: string         // Short description (optional)
```

**API Request Example**:
```json
{
  "name": "Vitamin C Serum",
  "description": "This serum brightens your skin and reduces dark spots...",
  "shortDescription": "Brightening serum for glowing skin",
  "price": 2500,
  "status": "active"
}
```

---

### 3. Product Images Structure

Backend stores **media references**, not raw URLs.

**Change from**:
```typescript
images: Array<{
  url: string
  altText: string
  isDefault: boolean
}>
```

**To**:
```typescript
images: Array<{
  mediaId: string      // MongoDB ObjectId
  isPrimary: boolean   // Not "isDefault"
  order: number
}>
```

**Workflow**:
1. Upload image to `/api/media` → Get back `mediaId`
2. Use that `mediaId` when creating/updating product
3. Backend will populate full media details when you fetch products

---

### 4. Media Upload Field Name

**Change FormData field from**:
```typescript
formData.append('file', imageFile)  // ❌ Wrong
```

**To**:
```typescript
formData.append('image', imageFile)  // ✅ Correct
```

---

### 5. Product Price Field

Backend uses **`comparePrice`**, not `salePrice`.

**Change from**:
```typescript
salePrice: number
```

**To**:
```typescript
comparePrice: number  // Original price for comparison
```

---

## 📋 COMPLETE TYPE DEFINITIONS

Copy these exact TypeScript interfaces:

```typescript
// src/shared/types/models.ts

export interface Product {
  _id: string
  name: string
  slug: string
  description: string              // ✅ Flat field
  shortDescription?: string        // ✅ Flat field
  price: number
  comparePrice?: number            // ✅ Not salePrice
  images: Array<{
    mediaId: string                // ✅ Reference
    isPrimary: boolean             // ✅ Not isDefault
    order: number
  }>
  category: string | Category
  stock: number
  reservedStock?: number
  sku: string
  trackInventory: boolean
  keywords?: string[]
  ingredients?: string[]
  concerns?: string[]
  skinType?: string[]
  brand?: string
  seo?: {
    metaTitle: string
    metaDescription: string
    keywords: string[]
  }
  featured: boolean
  status: 'active' | 'inactive' | 'draft'  // ✅ Critical
  viewCount?: number
  totalOrders?: number
  averageRating?: number
  totalReviews?: number
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  _id: string
  name: string
  slug: string
  description?: string
  image?: string
  displayOrder: number
  active: boolean              // ✅ Use this
  productCount?: number
  createdAt: Date
  updatedAt: Date
}

export interface Admin {
  _id: string
  name: string
  email: string
  role: 'admin' | 'superadmin'
  active: boolean              // ✅ Use this
  emailVerified: boolean
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Media {
  _id: string
  filename: string
  originalName: string
  cloudinaryUrl: string        // ✅ Full URL to display
  cloudinaryPublicId: string
  fileSize: number
  mimeType: string
  width?: number
  height?: number
  altText?: string
  title?: string
  uploadedBy: string
  createdAt: Date
  updatedAt: Date
}

export interface Order {
  _id: string
  orderId: string
  customer: {
    name: string
    email: string
    phone: string
    address: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  items: Array<{
    product: string | Product
    name: string
    quantity: number
    price: number
  }>
  subtotal: number
  tax: number
  discount: number
  shippingFee: number
  total: number
  paymentMethod: 'Cash on Delivery' | 'Bank Transfer' | 'Card Payment'
  paymentStatus: 'pending' | 'paid' | 'refunded'
  paymentDetails?: {
    transactionReference?: string
    paidAt?: Date
    paidAmount?: number
    paymentProof?: string
  }
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  shipping: {
    method: 'local_delivery' | 'courier_delivery' | 'pickup'
    carrier?: string
    trackingNumber?: string
    trackingUrl?: string
    estimatedDelivery?: Date
    shippedAt?: Date
    deliveredAt?: Date
  }
  notes?: {
    customer?: string
    internal?: string
  }
  expiresAt?: Date
  cancelledAt?: Date
  cancelReason?: string
  createdAt: Date
  updatedAt: Date
}

export interface Review {
  _id: string
  product: string | Product
  order?: string
  customerName: string
  customerEmail: string
  rating: 1 | 2 | 3 | 4 | 5
  title?: string
  comment?: string
  status: 'pending' | 'approved' | 'rejected'
  verifiedPurchase: boolean
  helpfulCount?: number
  createdAt: Date
  updatedAt: Date
}

export interface Settings {
  _id: string
  whatsapp?: {
    phoneNumber: string
    enabled: boolean
  }
  shipping?: {
    freeShippingThreshold: number
    localDeliveryFee: number
    courierDeliveryFee: number
  }
  tax?: {
    enabled: boolean
    rate: number
  }
  updatedBy: string
  updatedAt: Date
}

export interface EmailTemplate {
  _id: string
  templateType: string
  name: string
  subject: string
  htmlContent: string
  variables: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

---

## 🔧 CODE EXAMPLES

### Example 1: Create Product

```typescript
async function createProduct(formData: ProductFormData) {
  // Step 1: Upload images first
  const uploadedImages = await Promise.all(
    formData.imageFiles.map(async (file, index) => {
      const imageFormData = new FormData()
      imageFormData.append('image', file)  // ✅ Use 'image'
      
      const response = await fetch('/api/media', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: imageFormData
      })
      
      const result = await response.json()
      const media = result.data[0]
      
      return {
        mediaId: media._id,
        isPrimary: index === 0,
        order: index
      }
    })
  )
  
  // Step 2: Create product with image references
  const productData = {
    name: formData.name,
    description: formData.description,           // ✅ Flat
    shortDescription: formData.shortDescription, // ✅ Flat
    price: formData.price,
    comparePrice: formData.comparePrice,         // ✅ Not salePrice
    images: uploadedImages,                      // ✅ References
    category: formData.category,
    stock: formData.stock,
    sku: formData.sku,
    trackInventory: formData.trackInventory,
    status: formData.status,                     // ✅ 'active'|'inactive'|'draft'
    featured: formData.featured,
    keywords: formData.keywords,
    brand: formData.brand
  }
  
  const response = await fetch('/api/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(productData)
  })
  
  return await response.json()
}
```

### Example 2: Toggle Product Status

```typescript
async function toggleProductStatus(productId: string, currentStatus: string) {
  const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
  
  const response = await fetch(`/api/products/${productId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status: newStatus })
  })
  
  return await response.json()
}
```

### Example 3: Status Badge Component

```tsx
function ProductStatusBadge({ status }: { status: string }) {
  const statusConfig = {
    active: { label: 'Active', className: 'bg-green-100 text-green-800' },
    inactive: { label: 'Inactive', className: 'bg-gray-100 text-gray-800' },
    draft: { label: 'Draft', className: 'bg-yellow-100 text-yellow-800' }
  }
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
  
  return (
    <span className={`px-2 py-1 rounded text-xs ${config.className}`}>
      {config.label}
    </span>
  )
}
```

### Example 4: Status Filter

```tsx
<select name="status" value={filters.status} onChange={handleChange}>
  <option value="">All Statuses</option>
  <option value="active">Active</option>
  <option value="inactive">Inactive</option>
  <option value="draft">Draft</option>
</select>
```

---

## 🧪 TESTING CHECKLIST

After making changes, test these flows:

### Products
- [ ] Create product with images
- [ ] Update product status (Active ↔ Inactive)
- [ ] Filter products by status
- [ ] Status badge displays correctly
- [ ] Images display properly

### Categories
- [ ] Create category
- [ ] Toggle category active/inactive
- [ ] List categories shows active status

### Media
- [ ] Upload single image
- [ ] Upload multiple images
- [ ] Images appear in media library
- [ ] Delete image works

### Settings
- [ ] Update WhatsApp settings
- [ ] Save changes successfully

### Authentication
- [ ] Login works
- [ ] Dashboard shows correct admin name
- [ ] Logout works

---

## ⚠️ COMMON ISSUES

### Issue 1: "Upload failed - No file provided"
**Solution**: Change FormData field from `'file'` to `'image'`

### Issue 2: Product status validation fails
**Solution**: Use `'active'`, `'inactive'`, `'draft'` (not `'published'` or `'archived'`)

### Issue 3: Images not displaying
**Solution**: Ensure you're sending `mediaId` references, not raw URLs

### Issue 4: 401 Unauthorized errors
**Solution**: Check that token is being sent in `Authorization: Bearer <token>` header

---

## 📞 BACKEND SUPPORT

If you encounter any issues:

1. **Check response structure**: All responses follow `{ success: boolean, data: any, error?: string }`
2. **Check console errors**: Look for validation errors in response
3. **Verify enum values**: Make sure you're using exact values listed above
4. **Test endpoints**: Use Postman/Thunder Client with sample requests above

---

## ✅ SUMMARY OF CHANGES

| Change | Old Value | New Value |
|--------|-----------|-----------|
| Product status enum | `'published'` | `'active'` |
| Product status enum | `'archived'` | `'inactive'` |
| Description structure | Nested object | Flat fields |
| Price field | `salePrice` | `comparePrice` |
| Image structure | URL objects | Reference objects |
| Image field | `isDefault` | `isPrimary` |
| Upload field name | `'file'` | `'image'` |

---

## 🎨 **NEW FEATURE: Homepage Sections API**

### **Overview**
Backend now provides complete control over homepage sections (Featured, New Arrivals, Back in Stock, etc.)

### **Available Sections**:
- `featured` - Featured Items
- `new_arrivals` - New Arrivals  
- `back_in_stock` - Back in Stock
- `trending` - Trending Now
- `best_sellers` - Best Sellers

### **Public API Endpoints** (Frontend):

#### **Get All Sections**
```typescript
GET /api/homepage-sections?isActive=true

// Response
{
  "success": true,
  "data": [
    {
      "sectionType": "featured",
      "title": "Featured Items",
      "subtitle": "Hand-picked products just for you",
      "products": [
        {
          "_id": "673d2e8a1b4c5d6e7f8a9b0c",
          "name": "CeraVe Moisturizing Lotion",
          "slug": "cerave-moisturizing-lotion-16oz",
          "price": 5000,
          "comparePrice": 8000,
          "stock": 100,
          "status": "active",
          "images": [
            {
              "mediaId": {
                "cloudinaryUrl": "https://res.cloudinary.com/.../cerave-lotion.jpg",
                "filename": "CeraVe Moisturizing Lotion",
                "altText": "CeraVe Lotion"
              },
              "isPrimary": true,
              "order": 0
            }
          ],
          "category": {
            "name": "Moisturizers",
            "slug": "moisturizers"
          }
        }
        // ... more products
      ],
      "displayOrder": 1,
      "isActive": true,
      "maxProducts": 8
    }
    // ... more sections
  ]
}
```

#### **Get Specific Section**
```typescript
GET /api/homepage-sections/featured

// Returns single section with populated products
{
  "success": true,
  "data": {
    "sectionType": "featured",
    "title": "Featured Items",
    "subtitle": "Hand-picked products just for you",
    "products": [ /* array of populated products */ ],
    "displayOrder": 1,
    "isActive": true,
    "maxProducts": 8,
    "createdAt": "2025-11-25T10:00:00.000Z",
    "updatedAt": "2025-11-25T12:30:00.000Z"
  }
}
```

### **Frontend Implementation Example**:

#### **Homepage Component**:
```typescript
// Fetch all active sections
const { data: sections } = await fetch('/api/homepage-sections?isActive=true')
  .then(res => res.json());

// Render each section
{sections.map(section => (
  <section key={section.sectionType} className="py-12">
    <h2>{section.title}</h2>
    <p>{section.subtitle}</p>
    
    {/* Product carousel/grid */}
    <div className="grid grid-cols-4 gap-4">
      {section.products.slice(0, section.maxProducts).map(product => (
        <ProductCard 
          key={product._id}
          product={product}
          image={product.images.find(img => img.isPrimary)?.mediaId?.cloudinaryUrl}
        />
      ))}
    </div>
  </section>
))}
```

#### **Image Carousel (Auto-rotating)**:
```typescript
function ProductCarousel({ products }: { products: Product[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Auto-rotate every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [products.length]);
  
  return (
    <div className="relative">
      {products.map((product, index) => (
        <div 
          key={product._id}
          className={index === currentIndex ? 'block' : 'hidden'}
        >
          <img 
            src={product.images[0]?.mediaId?.cloudinaryUrl} 
            alt={product.name}
          />
          <h3>{product.name}</h3>
          <p>₦{product.price.toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
```

### **Benefits**:
✅ Admin controls which products appear on homepage  
✅ No hardcoded product lists in frontend  
✅ Dynamic product showcases  
✅ Rotating images/carousels  
✅ SEO-friendly product featuring  
✅ Easy A/B testing of products

---

**Backend is ready and fully tested. Make these changes and everything will work perfectly!** 🚀

