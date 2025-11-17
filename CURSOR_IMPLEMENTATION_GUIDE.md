# GLOWNATURA ADMIN PANEL - CURSOR IMPLEMENTATION GUIDE

**IMPORTANT:** This is NOT a mockup. Build a fully functional, production-ready admin dashboard that connects to the live backend API.

---

## PHASE 1: PROJECT SETUP (30 minutes)

### Step 1.1: Create Next.js Project
```bash
npx create-next-app@latest glownatura-admin --typescript --tailwind --app --use-npm --no-src

# When prompted:
# - Would you like to use TypeScript? YES
# - Would you like to use ESLint? YES
# - Would you like to use Tailwind CSS? YES
# - Would you like to use `src/` directory? NO
# - Would you like to use App Router? YES
# - Would you like to customize the default import alias? NO
```

### Step 1.2: Install Required Dependencies
```bash
cd glownatura-admin

# Core dependencies
npm install axios@1.6.5 js-cookie@3.0.5 react-hook-form@7.49.3 @hookform/resolvers@3.3.4 zod@3.22.4

# UI dependencies
npm install lucide-react@0.309.0 sonner@1.3.1 recharts@2.10.3

# Type definitions
npm install -D @types/js-cookie@3.0.6

# shadcn/ui CLI
npx shadcn@latest init


```

### Step 1.3: Install All shadcn/ui Components
```bash
npx shadcn@latest add button input card table dialog tabs select checkbox badge textarea label separator breadcrumb dropdown-menu avatar sheet form toast tooltip popover scroll-area skeleton switch radio-group
```

---

## PHASE 2: PROJECT STRUCTURE SETUP (20 minutes)

### Step 2.1: Create Directory Structure
```bash
# Create all directories
mkdir -p app/\(auth\)/login
mkdir -p app/\(dashboard\)/products/new app/\(dashboard\)/products/\[id\]/edit
mkdir -p app/\(dashboard\)/categories
mkdir -p app/\(dashboard\)/reviews
mkdir -p app/\(dashboard\)/orders/\[id\]
mkdir -p app/\(dashboard\)/media
mkdir -p app/\(dashboard\)/settings

mkdir -p components/layout
mkdir -p components/dashboard
mkdir -p components/products/product-form
mkdir -p components/categories
mkdir -p components/reviews
mkdir -p components/orders
mkdir -p components/media
mkdir -p components/settings
mkdir -p components/shared

mkdir -p lib/api
mkdir -p lib/hooks
mkdir -p lib/context
mkdir -p lib/utils
mkdir -p lib/types

mkdir -p public/images
```

### Step 2.2: Create Environment Files
Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=GlowNatura Admin
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

Create `.env.example`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=GlowNatura Admin
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

---

## PHASE 3: BACKEND INTEGRATION SETUP (40 minutes)

### Step 3.1: Create TypeScript Types
Create `lib/types/models.ts` with ALL backend model interfaces:
- Admin interface (with _id, name, email, role: 'admin', emailVerified, etc.)
- Product interface (with ALL fields from backend Product model)
- Category interface (with ALL fields from backend Category model)
- Review interface (with ALL fields from backend Review model)
- Order interface (with ALL fields from backend Order model)
- Media interface (with ALL fields from backend Media model)
- Settings interface (with ALL fields from backend Settings model)

Create `lib/types/api.ts` with:
- ApiResponse<T> interface
- PaginatedResponse<T> interface
- LoginResponse interface
- DashboardStats interface

### Step 3.2: Create API Client
Create `lib/api/client.ts`:
```typescript
import axios from 'axios'
import Cookies from 'js-cookie'
import { toast } from 'sonner'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

// Add request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error || 'An error occurred'
    
    if (error.response?.status === 401) {
      Cookies.remove('auth_token')
      window.location.href = '/login'
      toast.error('Session expired. Please login again.')
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.')
    }
    
    return Promise.reject(error.response?.data || error.message)
  }
)

export default apiClient
```

### Step 3.3: Create API Modules

**CRITICAL:** Each API module MUST connect to the real backend endpoints.

Create `lib/api/auth.ts`:
```typescript
import apiClient from './client'

export const authApi = {
  login: async (email: string, password: string) => {
    return apiClient.post('/api/auth/login', { email, password })
  },
  
  register: async (name: string, email: string, password: string) => {
    return apiClient.post('/api/auth/register', { name, email, password })
  },
  
  getMe: async () => {
    return apiClient.get('/api/auth/me')
  },
  
  logout: async () => {
    return apiClient.post('/api/auth/logout')
  },
  
  updateProfile: async (name: string) => {
    return apiClient.put('/api/auth/profile', { name })
  },
  
  changePassword: async (currentPassword: string, newPassword: string) => {
    return apiClient.put('/api/auth/change-password', { currentPassword, newPassword })
  },
}
```

Create `lib/api/products.ts`:
```typescript
import apiClient from './client'

export const productsApi = {
  getAll: async (params?: any) => {
    return apiClient.get('/api/products', { params })
  },
  
  getOne: async (id: string) => {
    return apiClient.get(`/api/products/${id}`)
  },
  
  create: async (data: any) => {
    return apiClient.post('/api/products', data)
  },
  
  update: async (id: string, data: any) => {
    return apiClient.put(`/api/products/${id}`, data)
  },
  
  delete: async (id: string) => {
    return apiClient.delete(`/api/products/${id}`)
  },
  
  generateSKU: async (categoryId?: string) => {
    return apiClient.post('/api/products/generate-sku', { categoryId })
  },
  
  getLowStock: async () => {
    return apiClient.get('/api/products/low-stock')
  },
}
```

Create similar modules for:
- `lib/api/categories.ts` (connect to /api/categories endpoints)
- `lib/api/reviews.ts` (connect to /api/reviews endpoints)
- `lib/api/orders.ts` (connect to /api/orders endpoints)
- `lib/api/media.ts` (connect to /api/media endpoints)
- `lib/api/settings.ts` (connect to /api/settings endpoints)
- `lib/api/dashboard.ts` (connect to /api/dashboard endpoints)

---

## PHASE 4: AUTHENTICATION SYSTEM (60 minutes)

### Step 4.1: Create Auth Context
Create `lib/context/auth-context.tsx`:
```typescript
'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { authApi } from '@/lib/api/auth'
import { Admin } from '@/lib/types/models'

interface AuthContextType {
  admin: Admin | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = Cookies.get('auth_token')
      if (token) {
        const response = await authApi.getMe()
        if (response.success) {
          setAdmin(response.data)
        }
      }
    } catch (error) {
      Cookies.remove('auth_token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password)
    if (response.success) {
      Cookies.set('auth_token', response.token, { expires: 30 })
      setAdmin(response.data)
      router.push('/')
    } else {
      throw new Error(response.error || 'Login failed')
    }
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } finally {
      Cookies.remove('auth_token')
      setAdmin(null)
      router.push('/login')
    }
  }

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout, isAuthenticated: !!admin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
```

### Step 4.2: Create Middleware
Create `middleware.ts` in the root:
```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value
  const isAuthPage = request.nextUrl.pathname.startsWith('/login')
  const isProtectedPage = !request.nextUrl.pathname.startsWith('/login')

  if (!token && isProtectedPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images).*)'],
}
```

### Step 4.3: Create Login Page
Create `app/(auth)/login/page.tsx`:
```typescript
'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/context/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await login(email, password)
      toast.success('Login successful')
    } catch (error: any) {
      toast.error(error.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">GlowNatura Admin</h1>
          <p className="text-muted-foreground">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@glownatura.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
```

---

## PHASE 5: LAYOUT COMPONENTS (60 minutes)

### Step 5.1: Create Sidebar
Create `components/layout/admin-sidebar.tsx`:
- Logo at top
- Navigation menu items (Dashboard, Products, Categories, Reviews, Orders, Media, Settings)
- Use lucide-react icons
- Highlight active route
- Logout button at bottom
- MUST be functional with real navigation using Next.js Link

### Step 5.2: Create Header
Create `components/layout/admin-header.tsx`:
- Breadcrumbs showing current page
- Search bar (functional)
- User avatar with dropdown menu (Profile, Logout)
- MUST connect to useAuth hook

### Step 5.3: Create Dashboard Layout
Create `app/(dashboard)/layout.tsx`:
- Wrap with AuthProvider
- Include Sidebar and Header
- Protect routes with auth check
- Show loading state while checking auth

---

## PHASE 6: DASHBOARD PAGE (90 minutes)

### Step 6.1: Create Dashboard API Hook
Create `lib/hooks/use-dashboard.ts`:
```typescript
import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api/client'

export function useDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/api/dashboard/stats')
      setStats(response.data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { stats, loading, error, refetch: fetchStats }
}
```

### Step 6.2: Create Stats Cards Component
Create `components/dashboard/stats-cards.tsx`:
- 4 cards showing: Total Products, Total Revenue, Pending Reviews, Low Stock
- Use real data from useDashboard hook
- Show loading skeleton while fetching
- Display percentage changes with color indicators

### Step 6.3: Create Sales Chart Component
Create `components/dashboard/sales-chart.tsx`:
- Use recharts library
- LineChart showing sales trend
- Use real data from API
- Responsive container

### Step 6.4: Create Recent Activity Component
Create `components/dashboard/recent-activity.tsx`:
- Table showing recent orders
- Fetch from API
- Link to order details
- Status badges

### Step 6.5: Create Dashboard Page
Create `app/(dashboard)/page.tsx`:
- Combine all dashboard components
- Use useDashboard hook for data
- Show loading states
- Handle errors

---

## PHASE 7: PRODUCTS MODULE (180 minutes)

### Step 7.1: Create Products Hook
Create `lib/hooks/use-products.ts`:
```typescript
import { useState, useEffect } from 'react'
import { productsApi } from '@/lib/api/products'
import { Product } from '@/lib/types/models'

export function useProducts(params?: any) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<any>(null)

  useEffect(() => {
    fetchProducts()
  }, [JSON.stringify(params)])

  const fetchProducts = async () => {
    try {
      const response = await productsApi.getAll(params)
      setProducts(response.data)
      setPagination(response.pagination)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return { products, loading, pagination, refetch: fetchProducts }
}
```

### Step 7.2: Create Products Table
Create `components/products/products-table.tsx`:
- Data table with columns: Image, Name, Category, Price, Stock, Status, Actions
- Use useProducts hook
- Pagination controls
- Edit and Delete buttons (functional)
- Show loading skeleton
- Color-coded stock badges (green >50, yellow 10-50, red <10)

### Step 7.3: Create Product Filters
Create `components/products/product-filters.tsx`:
- Search input (functional, calls API)
- Category dropdown (fetch from API)
- Status filter
- Apply button that updates parent component

### Step 7.4: Create Products List Page
Create `app/(dashboard)/products/page.tsx`:
- Combine ProductsTable and ProductFilters
- Header with "Add Product" button
- Handle filter changes and refetch data

### Step 7.5: Create Product Form
Create `components/products/product-form/index.tsx`:
- Tabs for: Basic Info, Pricing, Inventory, Images, SEO, Status
- Use react-hook-form with zod validation
- All fields must match backend Product model
- Generate SKU button (calls API)
- Image upload to Cloudinary (calls media API)
- Save button (calls create/update API)
- Show validation errors
- Show loading state while submitting

Create sub-components:
- `basic-info.tsx`: Name, Description, Category (fetch from API), Brand, Keywords
- `pricing.tsx`: Price, Sale Price
- `inventory.tsx`: Stock, SKU (with generate button), Track Inventory toggle
- `images.tsx`: Upload area, image grid, set default image
- `seo.tsx`: SEO Title, Description, Keywords
- `status.tsx`: Status dropdown, Featured toggle, Publish button

### Step 7.6: Create New Product Page
Create `app/(dashboard)/products/new/page.tsx`:
- Use ProductForm component
- Submit calls productsApi.create()
- Redirect to products list on success

### Step 7.7: Create Edit Product Page
Create `app/(dashboard)/products/[id]/edit/page.tsx`:
- Fetch product by ID on mount
- Pre-fill ProductForm with product data
- Submit calls productsApi.update()
- Redirect to products list on success

---

## PHASE 8: CATEGORIES MODULE (60 minutes)

### Step 8.1: Create Categories Hook
Create `lib/hooks/use-categories.ts` (similar to use-products)

### Step 8.2: Create Categories Table
Create `components/categories/categories-table.tsx`:
- Columns: Name, Slug, Product Count, Display Order, Active Status, Actions
- Inline edit/delete buttons
- Sortable by display order

### Step 8.3: Create Category Dialog
Create `components/categories/category-dialog.tsx`:
- Form for create/edit category
- Fields: Name, Description, Image (upload), Display Order, Active toggle
- Submit calls categoriesApi.create() or update()
- Close dialog on success

### Step 8.4: Create Categories Page
Create `app/(dashboard)/categories/page.tsx`:
- CategoriesTable component
- "Add Category" button opens CategoryDialog
- Fetch data from API
- Refetch after create/update/delete

---

## PHASE 9: REVIEWS MODULE (60 minutes)

### Step 9.1: Create Reviews Hook
Create `lib/hooks/use-reviews.ts`

### Step 9.2: Create Review Card
Create `components/reviews/review-card.tsx`:
- Display: Star rating, Customer name, Product name, Review text, Date, Verified badge
- Approve/Reject/Delete buttons
- Buttons call reviewsApi endpoints

### Step 9.3: Create Reviews Grid
Create `components/reviews/reviews-grid.tsx`:
- Grid of ReviewCard components
- Tabs: All, Approved, Pending, Rejected
- Fetch based on selected tab

### Step 9.4: Create Reviews Page
Create `app/(dashboard)/reviews/page.tsx`:
- ReviewsGrid component
- Refetch after status change

---

## PHASE 10: ORDERS MODULE (120 minutes)

### Step 10.1: Create Orders Hook
Create `lib/hooks/use-orders.ts`

### Step 10.2: Create Order Status Badge
Create `components/orders/order-status-badge.tsx`:
- Color-coded badges for different statuses
- pending=gray, processing=blue, shipped=orange, delivered=green, cancelled=red

### Step 10.3: Create Orders Table
Create `components/orders/orders-table.tsx`:
- Columns: Order ID, Customer, Date, Amount, Status, Actions
- Click row to view details
- Filters: Status, Date range, Search
- Export button (calls ordersApi.export())

### Step 10.4: Create Orders List Page
Create `app/(dashboard)/orders/page.tsx`:
- OrdersTable component
- Filters bar

### Step 10.5: Create Order Details Page
Create `app/(dashboard)/orders/[id]/page.tsx`:
- Fetch order by ID
- Display: Customer info, Items list, Payment details, Shipping info, Order timeline
- Actions: Confirm Payment, Update Status, Cancel Order, Add Note
- Each action calls respective API endpoint
- Show order notes
- Show status history

---

## PHASE 11: MEDIA MODULE (90 minutes)

### Step 11.1: Create Media Hook
Create `lib/hooks/use-media.ts`

### Step 11.2: Create Upload Zone
Create `components/media/upload-zone.tsx`:
- Drag and drop area
- File input button
- Upload to Cloudinary via mediaApi.upload()
- Show upload progress
- Multiple file support

### Step 11.3: Create Media Card
Create `components/media/media-card.tsx`:
- Image thumbnail
- Filename, size, date
- Actions: Copy URL, Delete
- Hover overlay with actions

### Step 11.4: Create Media Grid
Create `components/media/media-grid.tsx`:
- Grid of MediaCard components
- Responsive (2-3-4 columns)
- Search and filter

### Step 11.5: Create Media Page
Create `app/(dashboard)/media/page.tsx`:
- UploadZone at top
- MediaGrid below
- Refetch after upload/delete

---

## PHASE 12: SETTINGS MODULE (90 minutes)

### Step 12.1: Create Settings Hook
Create `lib/hooks/use-settings.ts`

### Step 12.2: Create Store Settings Component
Create `components/settings/store-settings.tsx`:
- Form with: Store Name, Email, Phone, Address, City, State, Postal Code, Country
- This information appears on: Order receipts, Email footers, Frontend contact page
- Submit calls settingsApi.update()
- Show success toast after saving

### Step 12.3: Create WhatsApp Settings Component
Create `components/settings/whatsapp-settings.tsx`:
- Form with: 
  - Enable/Disable toggle (shows/hides WhatsApp button on frontend)
  - WhatsApp Number (with country code, e.g., +234...)
  - Default Message (pre-filled text when customer clicks button)
- Live preview showing how the button will appear
- Submit calls settingsApi.update()
- Note: Button position on frontend is controlled by frontend code, not here

### Step 12.4: Create Email Templates Component
Create `components/settings/email-templates.tsx`:
- List of all email templates:
  - Order Created (Payment Pending)
  - Payment Confirmed
  - Order Shipped (Local Delivery)
  - Order Shipped (Courier)
  - Order Shipped (Pickup)
  - Order Delivered
  - Order Cancelled
- Each template has: Edit button, Preview button
- Edit dialog shows: Subject line, HTML content editor, Available variables
- Preview tab shows how email will look
- Submit calls emailTemplatesApi.update()

### Step 12.5: Create Social Media Component
Create `components/settings/social-media.tsx`:
- Form with: Facebook URL, Instagram URL, Twitter URL, TikTok URL
- These links appear in: Frontend footer, Email templates
- Each field has "Test Link" button to open in new tab
- Submit calls settingsApi.update()

### Step 12.6: Create Settings Page
Create `app/(dashboard)/settings/page.tsx`:
- Tabs: Store Info, WhatsApp, Email Templates, Social Media
- Each tab shows respective component
- Fetch settings on mount
- Save button updates settings via API

---

## PHASE 13: STYLING & THEME (60 minutes)

### Step 13.1: Update globals.css
Add the exact color variables from the prompt:
```css
@layer base {
  :root {
    --primary: 166 76% 37%;
    --primary-foreground: 0 0% 100%;
    --background: 0 0% 100%;
    --foreground: 160 2% 25%;
    /* ... all other variables from prompt */
  }
  
  .dark {
    /* ... dark mode variables */
  }
}
```

### Step 13.2: Update Root Layout
Update `app/layout.tsx`:
- Add Inter font
- Wrap with AuthProvider
- Add Toaster from sonner
- Set metadata

### Step 13.3: Create Theme Provider
Create `lib/context/theme-context.tsx`:
- Dark mode toggle functionality
- Persist theme in localStorage

---

## PHASE 14: ERROR HANDLING & LOADING STATES (60 minutes)

### Step 14.1: Create Loading Skeletons
Create `components/shared/loading-skeleton.tsx`:
- Table skeleton
- Card skeleton
- Form skeleton

### Step 14.2: Create Error Boundary
Create `components/shared/error-boundary.tsx`:
- Catch React errors
- Display error message
- Retry button

### Step 14.3: Create Empty State
Create `components/shared/empty-state.tsx`:
- Display when no data
- Icon, message, action button

### Step 14.4: Add Loading States
Add loading states to ALL pages:
- Show skeleton while fetching
- Disable buttons while submitting
- Show progress indicators for uploads

---

## PHASE 15: TESTING & VALIDATION (60 minutes)

### Step 15.1: Test All API Endpoints
For EACH module, test:
- GET all items (with filters)
- GET single item
- CREATE new item
- UPDATE existing item
- DELETE item

### Step 15.2: Test Authentication
- Login with valid credentials
- Login with invalid credentials
- Logout functionality
- Protected route access
- Token expiry handling

### Step 15.3: Test Forms
- Required field validation
- Data type validation
- Submit success
- Submit error handling
- Field error messages

### Step 15.4: Test Responsive Design
- Mobile view (320px - 768px)
- Tablet view (768px - 1024px)
- Desktop view (1024px+)

---

## PHASE 16: OPTIMIZATION (30 minutes)

### Step 16.1: Add Next.js Image Optimization
Replace all <img> tags with Next.js Image component

### Step 16.2: Add Loading.tsx Files
Create loading.tsx in each route for automatic loading UI

### Step 16.3: Add Error.tsx Files
Create error.tsx in each route for error handling

### Step 16.4: Optimize API Calls
- Add request debouncing for search
- Add caching where appropriate
- Reduce unnecessary re-renders

---

## CRITICAL REQUIREMENTS CHECKLIST

### Functionality Requirements
- [ ] All forms MUST submit to real backend API
- [ ] All data MUST be fetched from real backend API
- [ ] Authentication MUST work with JWT tokens
- [ ] Image uploads MUST work with Cloudinary
- [ ] All CRUD operations MUST be functional
- [ ] Pagination MUST work correctly
- [ ] Filters MUST actually filter data via API
- [ ] Search MUST query backend API
- [ ] Error messages MUST display to users
- [ ] Loading states MUST show during API calls

### UI Requirements
- [ ] Match the v0.dev design colors exactly
- [ ] Responsive on all screen sizes
- [ ] Loading skeletons for all data fetching
- [ ] Toast notifications for all actions
- [ ] Form validation with error messages
- [ ] Confirmation dialogs for delete actions

### Code Quality Requirements
- [ ] TypeScript strict mode enabled
- [ ] No `any` types (use proper interfaces)
- [ ] No console.log (use proper error handling)
- [ ] No hardcoded data (fetch from API)
- [ ] Consistent file naming
- [ ] Consistent code formatting

---

## FINAL DELIVERY CHECKLIST

- [ ] All 8 pages are implemented
- [ ] Login page works with backend
- [ ] Dashboard shows real statistics
- [ ] Products CRUD works completely
- [ ] Categories CRUD works completely
- [ ] Reviews management works
- [ ] Orders management works
- [ ] Media upload/delete works
- [ ] Settings update works
- [ ] No TypeScript errors
- [ ] No build errors
- [ ] `npm run build` succeeds
- [ ] App runs without errors
- [ ] All API calls work with backend

---

## COMMON MISTAKES TO AVOID

1. **DO NOT use mock data** - Always fetch from API
2. **DO NOT create dummy components** - Make them functional
3. **DO NOT skip error handling** - Every API call needs try/catch
4. **DO NOT skip loading states** - Users need feedback
5. **DO NOT use inline styles** - Use Tailwind classes
6. **DO NOT hardcode URLs** - Use environment variables
7. **DO NOT skip TypeScript types** - Type everything properly
8. **DO NOT create fake forms** - Forms must submit to API
9. **DO NOT skip validation** - Validate all form inputs
10. **DO NOT ignore the design** - Match the v0.dev design

---

## BACKEND API REFERENCE

### Base URL
- Development: `http://localhost:5000`
- Production: `https://glownatura-backend.onrender.com`

### Authentication
All protected endpoints require:
```
Authorization: Bearer <JWT_TOKEN>
```

### Response Format
Success:
```json
{
  "success": true,
  "data": { ... }
}
```

Error:
```json
{
  "success": false,
  "error": "Error message",
  "errorCode": "ERROR_CODE"
}
```

Paginated:
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

**BUILD A FULLY FUNCTIONAL ADMIN PANEL, NOT A MOCKUP. EVERY FEATURE MUST CONNECT TO THE REAL BACKEND API.**

