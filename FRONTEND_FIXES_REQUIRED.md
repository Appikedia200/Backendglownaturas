# 🔧 ADMIN PANEL FIXES REQUIRED

## Date: November 21, 2025

## 🎯 BACKEND STATUS: ✅ ALL FIXED

The backend is now fully functional. All issues have been resolved:
- ✅ Email templates return correct `type` field
- ✅ Media upload accepts `image` field name
- ✅ Product status migrated to correct enum (`published`, `draft`, `archived`)
- ✅ All CRUD operations working

---

## ❌ FRONTEND ISSUES TO FIX

### Issue 1: React Error #31 (Hydration Mismatch)

**Error in Console:**
```
Uncaught Error: Minified React error #31
```

**Root Cause:**
- Server-side rendered HTML doesn't match client-side React output
- Usually caused by:
  - Using `Math.random()` or `Date.now()` in component rendering
  - Browser-only APIs (localStorage, window) used during SSR
  - Mismatched HTML tags or attributes

**How to Fix:**
1. Find components using `localStorage` or `window` without checking `typeof window !== 'undefined'`
2. Wrap browser-only code in `useEffect()`:

```typescript
// ❌ WRONG
const token = localStorage.getItem('token');

// ✅ CORRECT
const [token, setToken] = useState<string | null>(null);
useEffect(() => {
  setToken(localStorage.getItem('token'));
}, []);
```

3. Check all components for hydration mismatches using React DevTools

---

### Issue 2: HTTP 500 Error on Media Upload

**Error in Console:**
```
Upload error: Object { error: {...}, errorCode: "HTTP 500" }
```

**Root Cause:**
- Frontend was sending file with field name `file`
- Backend was expecting field name `image`

**Status: ✅ FIXED IN BACKEND**

**What Frontend Should Do:**
- Verify media upload is sending `FormData` with field name `image`:

```typescript
const formData = new FormData();
formData.append('image', file); // ✅ Must be 'image', not 'file'
```

**Expected Response:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "...",
      "cloudinaryUrl": "https://res.cloudinary.com/...",
      "cloudinaryPublicId": "glownatura/...",
      "filename": "product-image.jpg",
      "originalName": "my-product.jpg",
      "fileSize": 1024000,
      "mimeType": "image/jpeg"
    }
  ]
}
```

---

### Issue 3: Products Page Application Error

**Symptoms:**
- Products page shows "Application error: a client-side exception has occurred"
- Browser console shows React error #31

**Root Causes:**
1. **Product Status Values Changed:**
   - OLD: `active`, `inactive`, `draft`
   - NEW: `published`, `archived`, `draft`
   
2. **Frontend Expects Old Values:**
   - Filter dropdowns still use "Active"/"Inactive"
   - Status badges expect old values

**How to Fix:**

1. **Update Status Constants:**
```typescript
// src/shared/constants/product.ts
export const PRODUCT_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived'
} as const;

export const PRODUCT_STATUS_LABELS = {
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived'
};
```

2. **Update Status Filter Dropdown:**
```typescript
// OLD
<option value="active">Active</option>
<option value="inactive">Inactive</option>

// NEW
<option value="published">Published</option>
<option value="archived">Archived</option>
<option value="draft">Draft</option>
```

3. **Update Status Badge Component:**
```typescript
// src/components/ProductStatusBadge.tsx
function getStatusColor(status: string) {
  switch (status) {
    case 'published': return 'green';
    case 'draft': return 'yellow';
    case 'archived': return 'gray';
    default: return 'gray';
  }
}
```

4. **Update Activate/Deactivate Functions:**
```typescript
// OLD
async function activateProduct(id: string) {
  await api.put(`/products/${id}`, { status: 'active' });
}

// NEW
async function activateProduct(id: string) {
  await api.put(`/products/${id}`, { status: 'published' });
}

async function deactivateProduct(id: string) {
  await api.put(`/products/${id}`, { status: 'archived' });
}
```

---

### Issue 4: Authentication Token Handling

**Current Issue:**
- Some pages are trying to fetch data before authentication check completes
- Causes 401 errors that crash the page

**How to Fix:**

1. **Add Loading State to Protected Routes:**
```typescript
// src/app/(protected)/layout.tsx
export default function ProtectedLayout({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get('auth_token');
      if (!token) {
        router.push('/login');
        return;
      }
      
      try {
        await api.get('/auth/me'); // Verify token
        setIsAuthenticated(true);
      } catch (error) {
        Cookies.remove('auth_token');
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!isAuthenticated) {
    return null;
  }
  
  return <>{children}</>;
}
```

2. **Don't Fetch Data Until Auth is Confirmed:**
```typescript
// src/app/(protected)/products/page.tsx
export default function ProductsPage() {
  const [isAuthReady, setIsAuthReady] = useState(false);
  
  useEffect(() => {
    // Only set auth ready after layout confirms authentication
    setIsAuthReady(true);
  }, []);
  
  // Don't fetch products until auth is ready
  const { data, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    enabled: isAuthReady // ✅ Wait for auth
  });
  
  // ...
}
```

---

### Issue 5: API Base URL Configuration

**Verify Environment Variables:**
```env
# .env.local (for development)
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# .env.production (for Vercel)
NEXT_PUBLIC_API_URL=https://backendglownaturas.onrender.com/api
```

**Verify API Client:**
```typescript
// src/infrastructure/api/client.ts
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to all requests
apiClient.interceptors.request.use((config) => {
  const token = Cookies.get('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 🧪 TESTING CHECKLIST

After implementing fixes, test:

### Products Page:
- [ ] Page loads without errors
- [ ] Products list displays correctly
- [ ] Can create new product
- [ ] Can update product details
- [ ] Can change status (Draft → Published → Archived)
- [ ] Status badge shows correct color
- [ ] Filter by status works
- [ ] Can delete product

### Media Upload:
- [ ] Can upload JPEG/PNG/GIF/WebP
- [ ] Upload shows progress
- [ ] Uploaded image appears in media library
- [ ] Can copy image URL
- [ ] Can delete image
- [ ] Validation rejects files > 5MB
- [ ] Validation rejects non-image files

### Email Templates:
- [ ] Templates list loads (should show 7 templates)
- [ ] Can click template to view details
- [ ] Can edit template subject/body
- [ ] Can save template changes

### Categories:
- [ ] Categories list loads
- [ ] Can create category
- [ ] Can update category
- [ ] Can delete category

### Reviews:
- [ ] Reviews list loads
- [ ] Can approve/reject review
- [ ] Can delete review

### Orders:
- [ ] Orders list loads
- [ ] Can view order details
- [ ] Can update order status
- [ ] Status change triggers email (check backend logs)

---

## 🚀 BACKEND API DOCUMENTATION

### Base URL (Production):
```
https://backendglownaturas.onrender.com/api
```

### Authentication:
All protected endpoints require:
```
Authorization: Bearer <JWT_TOKEN>
```

### Product Endpoints:

#### GET /api/products
```typescript
// Query params
{
  page?: number;          // Default: 1
  limit?: number;         // Default: 20
  category?: string;      // Category ID
  status?: 'draft' | 'published' | 'archived';
  featured?: boolean;
  search?: string;
  sortBy?: 'createdAt' | 'price' | 'name';
  sortOrder?: 'asc' | 'desc';
}

// Response
{
  success: true,
  data: Product[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    pages: number,
    hasNext: boolean,
    hasPrev: boolean
  }
}
```

#### POST /api/products (Protected)
```typescript
// Request body
{
  name: string;
  description: string;
  price: number;
  category: string; // Category ID
  stockQuantity: number;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  images?: string[]; // Cloudinary URLs
  // ... other fields
}

// Response
{
  success: true,
  data: Product
}
```

#### PUT /api/products/:id (Protected)
```typescript
// Request body (all fields optional)
{
  name?: string;
  status?: 'draft' | 'published' | 'archived';
  price?: number;
  // ... other fields
}

// Response
{
  success: true,
  data: Product
}
```

#### DELETE /api/products/:id (Protected)
```typescript
// Response
{
  success: true,
  data: {
    message: 'Product deleted successfully'
  }
}
```

### Media Endpoints:

#### POST /api/media (Protected)
```typescript
// Content-Type: multipart/form-data
// Form field: 'image' (not 'file')

// Response
{
  success: true,
  count: 1,
  data: [{
    _id: string,
    cloudinaryUrl: string,
    cloudinaryPublicId: string,
    filename: string,
    originalName: string,
    fileSize: number,
    mimeType: string,
    width: number,
    height: number
  }]
}
```

#### GET /api/media (Protected)
```typescript
// Query params
{
  page?: number;
  limit?: number;
  search?: string;
}

// Response
{
  success: true,
  data: {
    media: Media[],
    pagination: {...}
  }
}
```

#### DELETE /api/media/:id (Protected)
```typescript
// Response
{
  success: true,
  data: {
    message: 'Media deleted successfully'
  }
}
```

---

## 📞 BACKEND SUPPORT

Backend repository: https://github.com/Appikedia200/Backendglownaturas.git
Backend URL: https://backendglownaturas.onrender.com
Health Check: https://backendglownaturas.onrender.com/health

All backend issues have been resolved. Any remaining errors are frontend-only.

---

## ✅ BACKEND CHANGES SUMMARY

### What Changed:
1. ✅ Product status enum: `active` → `published`
2. ✅ Media upload field: `file` → `image`
3. ✅ Email templates include `type` field
4. ✅ All validation aligned with models

### What Frontend Needs to Update:
1. ❌ Product status values (active/inactive → published/archived)
2. ❌ React hydration errors (#31)
3. ❌ Authentication flow (add loading states)
4. ❌ API calls (wait for auth before fetching)

---

**Last Updated:** November 21, 2025
**Backend Version:** 5.1.0
**Status:** ✅ Backend Ready | ❌ Frontend Needs Fixes

