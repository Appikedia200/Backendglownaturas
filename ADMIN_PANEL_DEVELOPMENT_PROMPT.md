# GLOWNATURA ADMIN PANEL - PROFESSIONAL DEVELOPMENT PROMPT

**Project Type:** Next.js 15 Admin Dashboard (App Router)  
**Development Approach:** SDLC-Compliant, Zero-Error, Production-Ready  
**Architecture:** Component-Based, Type-Safe, API-Integrated  

---

## EXECUTIVE SUMMARY

Build a professional, full-stack Next.js 15 admin dashboard for GlowNatura skincare e-commerce platform. The admin panel must integrate seamlessly with the existing Express.js backend (v5.1.0) deployed on Render. Follow enterprise-grade development standards with complete type safety, error handling, and professional architecture.

---

## 1. TECHNOLOGY STACK (MANDATORY)

### Frontend Framework
- **Next.js:** 15.x (App Router, not Pages Router)
- **React:** 19.x (latest stable)
- **TypeScript:** 5.x (strict mode enabled)
- **Node Version:** 18.x or higher

### Styling & UI
- **Tailwind CSS:** v4.x (with CSS variables for theming)
- **UI Components:** shadcn/ui (latest version)
- **Icons:** lucide-react
- **Charts:** recharts (for dashboard analytics)
- **Fonts:** Inter (Google Fonts)

### Data & State Management
- **HTTP Client:** Axios (for API calls)
- **State Management:** React Context API + Custom Hooks
- **Form Handling:** React Hook Form + Zod validation
- **Toast Notifications:** sonner

### Development Tools
- **Package Manager:** npm (not yarn or pnpm)
- **Linting:** ESLint (Next.js config)
- **Formatting:** Prettier (integrated)
- **Git:** Conventional commits

---

## 2. PROJECT ARCHITECTURE

### Directory Structure (EXACT)

```
glownatura-admin/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth route group
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/              # Protected routes group
│   │   │   ├── layout.tsx            # Dashboard layout wrapper
│   │   │   ├── page.tsx              # Dashboard home
│   │   │   ├── products/
│   │   │   │   ├── page.tsx          # Products list
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx      # Create product
│   │   │   │   └── [id]/
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx  # Edit product
│   │   │   ├── categories/
│   │   │   │   └── page.tsx
│   │   │   ├── reviews/
│   │   │   │   └── page.tsx
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # Order details
│   │   │   ├── media/
│   │   │   │   └── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   ├── layout.tsx                # Root layout
│   │   ├── globals.css               # Global styles + theme
│   │   └── not-found.tsx             # 404 page
│   ├── components/
│   │   ├── layout/                   # Layout components
│   │   │   ├── admin-sidebar.tsx
│   │   │   ├── admin-header.tsx
│   │   │   └── breadcrumbs.tsx
│   │   ├── dashboard/                # Dashboard widgets
│   │   │   ├── stats-cards.tsx
│   │   │   ├── quick-actions.tsx
│   │   │   ├── sales-chart.tsx
│   │   │   └── recent-activity.tsx
│   │   ├── products/                 # Product components
│   │   │   ├── products-table.tsx
│   │   │   ├── product-form/
│   │   │   │   ├── index.tsx         # Main form
│   │   │   │   ├── basic-info.tsx
│   │   │   │   ├── pricing.tsx
│   │   │   │   ├── inventory.tsx
│   │   │   │   ├── images.tsx
│   │   │   │   ├── seo.tsx
│   │   │   │   └── status.tsx
│   │   │   └── product-filters.tsx
│   │   ├── categories/
│   │   │   ├── categories-table.tsx
│   │   │   └── category-dialog.tsx
│   │   ├── reviews/
│   │   │   ├── reviews-grid.tsx
│   │   │   └── review-card.tsx
│   │   ├── orders/
│   │   │   ├── orders-table.tsx
│   │   │   └── order-status-badge.tsx
│   │   ├── media/
│   │   │   ├── media-grid.tsx
│   │   │   ├── upload-zone.tsx
│   │   │   └── media-card.tsx
│   │   ├── settings/
│   │   │   ├── store-settings.tsx
│   │   │   ├── whatsapp-settings.tsx
│   │   │   ├── email-templates.tsx
│   │   │   └── social-media.tsx
│   │   ├── shared/                   # Shared components
│   │   │   ├── data-table.tsx
│   │   │   ├── loading-skeleton.tsx
│   │   │   ├── error-boundary.tsx
│   │   │   └── empty-state.tsx
│   │   └── ui/                       # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── card.tsx
│   │       ├── table.tsx
│   │       ├── dialog.tsx
│   │       ├── tabs.tsx
│   │       ├── select.tsx
│   │       ├── checkbox.tsx
│   │       ├── badge.tsx
│   │       ├── textarea.tsx
│   │       ├── label.tsx
│   │       └── ... (50+ more)
│   ├── lib/
│   │   ├── api/                      # API client
│   │   │   ├── client.ts             # Axios instance
│   │   │   ├── auth.ts               # Auth endpoints
│   │   │   ├── products.ts           # Product endpoints
│   │   │   ├── categories.ts
│   │   │   ├── reviews.ts
│   │   │   ├── orders.ts
│   │   │   ├── media.ts
│   │   │   └── settings.ts
│   │   ├── hooks/                    # Custom hooks
│   │   │   ├── use-auth.ts
│   │   │   ├── use-products.ts
│   │   │   ├── use-categories.ts
│   │   │   ├── use-reviews.ts
│   │   │   ├── use-orders.ts
│   │   │   ├── use-media.ts
│   │   │   └── use-toast.ts
│   │   ├── context/                  # React Context
│   │   │   ├── auth-context.tsx
│   │   │   └── theme-context.tsx
│   │   ├── utils/                    # Utility functions
│   │   │   ├── cn.ts                 # Class merger
│   │   │   ├── format.ts             # Date/number formatters
│   │   │   ├── validation.ts         # Form validators
│   │   │   └── constants.ts          # App constants
│   │   └── types/                    # TypeScript types
│   │       ├── api.ts                # API response types
│   │       ├── models.ts             # Data models
│   │       └── index.ts              # Type exports
│   ├── middleware.ts                 # Next.js middleware (auth)
│   └── env.ts                        # Environment variables validation
├── public/
│   ├── images/                       # Static images
│   └── icons/                        # App icons
├── .env.local                        # Environment variables
├── .env.example                      # Environment template
├── next.config.mjs                   # Next.js config
├── tailwind.config.ts                # Tailwind config
├── tsconfig.json                     # TypeScript config
├── components.json                   # shadcn/ui config
├── .eslintrc.json                    # ESLint config
├── .prettierrc                       # Prettier config
└── package.json                      # Dependencies
```

---

## 3. BACKEND API INTEGRATION

### API Base URL
```typescript
// Development
const API_URL = 'http://localhost:5000'

// Production (Render)
const API_URL = 'https://glownatura-backend.onrender.com'
```

### Authentication Flow
1. Admin registers with company email (@glownatura.com) - backend validates domain
2. Email verification required before first login
3. Admin logs in with verified email/password
4. Backend returns JWT token
5. Store token in httpOnly cookie (secure)
6. Attach token to all API requests via Authorization header
7. Middleware checks auth on protected routes
8. Auto-refresh token before expiry

### Admin Access Control
- **Single Role System:** All admins have the same "admin" role
- **Company Email Required:** Only @glownatura.com emails can register
- **Email Verification:** Must verify email before login
- **Equal Permissions:** All admins can access all features
- **Account Management:** Admins can activate/deactivate other admin accounts
- **No Hierarchy:** No superadmin or manager roles

### API Endpoints to Integrate

#### Auth Endpoints
```
POST   /api/auth/login                # Login
POST   /api/auth/register              # Register admin
POST   /api/auth/verify-email          # Email verification
POST   /api/auth/forgot-password       # Password reset request
POST   /api/auth/reset-password        # Reset password
GET    /api/auth/me                    # Get current admin
PUT    /api/auth/profile               # Update profile
PUT    /api/auth/change-password       # Change password
POST   /api/auth/logout                # Logout
```

#### Product Endpoints
```
GET    /api/products                   # Get all products (with filters)
GET    /api/products/:id               # Get single product
POST   /api/products                   # Create product
PUT    /api/products/:id               # Update product
DELETE /api/products/:id               # Delete product
PUT    /api/products/bulk/status       # Bulk update status
GET    /api/products/low-stock         # Get low stock products
POST   /api/products/generate-sku      # Generate SKU
```

#### Category Endpoints
```
GET    /api/categories                 # Get all categories
GET    /api/categories/:id             # Get single category
POST   /api/categories                 # Create category
PUT    /api/categories/:id             # Update category
DELETE /api/categories/:id             # Delete category
PUT    /api/categories/reorder         # Reorder categories
```

#### Review Endpoints
```
GET    /api/reviews                    # Get all reviews (with filters)
GET    /api/reviews/:id                # Get single review
POST   /api/reviews                    # Create review
PUT    /api/reviews/:id/status         # Update review status
DELETE /api/reviews/:id                # Delete review
PUT    /api/reviews/bulk/status        # Bulk update status
```

#### Order Endpoints
```
GET    /api/orders                     # Get all orders (with filters)
GET    /api/orders/:id                 # Get single order
POST   /api/orders                     # Create order
PUT    /api/orders/:id/confirm-payment # Confirm payment
PUT    /api/orders/:id/status          # Update order status
PUT    /api/orders/:id/cancel          # Cancel order
POST   /api/orders/:id/notes           # Add order note
GET    /api/orders/export              # Export orders CSV
POST   /api/orders/:id/refund/request  # Request refund
PUT    /api/orders/:id/refund/process  # Process refund
```

#### Media Endpoints
```
GET    /api/media                      # Get all media
GET    /api/media/:id                  # Get single media
POST   /api/media                      # Upload media
PUT    /api/media/:id                  # Update media
DELETE /api/media/:id                  # Delete media
DELETE /api/media/bulk/unused          # Delete unused media
```

#### Settings Endpoints
```
GET    /api/settings                   # Get settings
PUT    /api/settings                   # Update settings
```

#### Dashboard Endpoints
```
GET    /api/dashboard/stats            # Get dashboard statistics
```

---

## 4. TYPESCRIPT TYPES (COMPLETE)

### Core Models
```typescript
// src/lib/types/models.ts

export interface Admin {
  _id: string
  name: string
  email: string
  role: 'admin'
  active: boolean
  emailVerified: boolean
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Product {
  _id: string
  name: string
  slug: string
  description: {
    short: string
    full: string
  }
  price: number
  salePrice?: number
  images: Array<{
    url: string
    altText: string
    isDefault: boolean
  }>
  category: string | Category
  stock: number
  reservedStock: number
  availableStock: number
  sku: string
  trackInventory: boolean
  keywords: string[]
  ingredients: string[]
  concerns: string[]
  skinType: string[]
  brand: string
  seo: {
    title: string
    description: string
    keywords: string[]
  }
  featured: boolean
  backInStockNotification: boolean
  status: 'active' | 'inactive' | 'draft'
  views: number
  totalOrders: number
  averageRating: number
  totalReviews: number
  createdAt: Date
  updatedAt: Date
  createdBy: string | Admin
  updatedBy: string | Admin
}

export interface Category {
  _id: string
  name: string
  slug: string
  description?: string
  image?: string
  displayOrder: number
  active: boolean
  productCount: number
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
  helpfulCount: number
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
  notes: {
    customer?: string
    internal?: string
  }
  expiresAt?: Date
  cancelledAt?: Date
  cancelReason?: string
  createdAt: Date
  updatedAt: Date
}

export interface Media {
  _id: string
  title: string
  altText: string
  description?: string
  cloudinaryUrl: string
  cloudinaryPublicId: string
  cloudinaryFolder: string
  fileSize: number
  mimeType: string
  width: number
  height: number
  tags: string[]
  usedInProducts: string[]
  uploadedBy: string | Admin
  createdAt: Date
  updatedAt: Date
}

export interface Settings {
  _id: string
  store: {
    name: string
    email: string
    phone: string
    address: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  whatsapp: {
    enabled: boolean
    number: string
    message: string
  }
  social: {
    facebook?: string
    instagram?: string
    twitter?: string
    tiktok?: string
  }
  updatedAt: Date
}
```

### API Response Types
```typescript
// src/lib/types/api.ts

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  errorCode?: string
}

export interface PaginatedResponse<T> extends ApiResponse {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface LoginResponse {
  success: boolean
  token: string
  admin: Admin
}

export interface DashboardStats {
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  totalCustomers: number
  pendingReviews: number
  lowStockProducts: number
  recentOrders: Order[]
  salesTrend: Array<{
    date: string
    sales: number
  }>
}
```

---

## 5. DESIGN SPECIFICATIONS (FROM v0.dev)

### Color System (CSS Variables)
```css
/* src/app/globals.css */

@layer base {
  :root {
    /* Primary - Emerald Green */
    --primary: 166 76% 37%;              /* #059669 */
    --primary-foreground: 0 0% 100%;      /* White */
    
    /* Background - Cream/White */
    --background: 0 0% 100%;              /* White */
    --foreground: 160 2% 25%;             /* Dark gray-green */
    
    /* Card */
    --card: 0 0% 100%;
    --card-foreground: 160 2% 25%;
    
    /* Muted - Light gray */
    --muted: 120 1% 95%;
    --muted-foreground: 160 2% 45%;
    
    /* Accent - Light emerald */
    --accent: 166 2% 93%;
    --accent-foreground: 166 76% 37%;
    
    /* Destructive - Red */
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;
    
    /* Border */
    --border: 120 1% 90%;
    --input: 120 1% 90%;
    --ring: 166 76% 37%;
    
    /* Chart colors */
    --chart-1: 166 76% 37%;
    --chart-2: 120 60% 50%;
    --chart-3: 60 80% 50%;
    --chart-4: 200 70% 50%;
    --chart-5: 280 65% 60%;
    
    --radius: 0.5rem;
  }
  
  .dark {
    --background: 160 5% 10%;
    --foreground: 0 0% 95%;
    --primary: 166 76% 47%;
    --primary-foreground: 160 5% 10%;
    /* ... other dark mode values */
  }
}
```

### Typography
```typescript
// Font configuration
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})
```

### Component Styling Standards
- **Buttons:** `bg-primary text-primary-foreground hover:bg-primary/90`
- **Cards:** `bg-card border rounded-lg shadow-sm p-6`
- **Inputs:** `border-input focus-visible:ring-ring`
- **Badges:** 
  - Success: `bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`
  - Warning: `bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300`
  - Error: `bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300`

---

## 6. AUTHENTICATION IMPLEMENTATION

### Middleware (Required)
```typescript
// src/middleware.ts

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value
  const isAuthPage = request.nextUrl.pathname.startsWith('/login')
  const isProtectedPage = request.nextUrl.pathname.startsWith('/')

  if (!token && !isAuthPage && isProtectedPage) {
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

### Auth Context
```typescript
// src/lib/context/auth-context.tsx

'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { Admin } from '@/lib/types/models'
import { authApi } from '@/lib/api/auth'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

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
      setAdmin(response.admin)
      router.push('/')
    } else {
      throw new Error(response.error || 'Login failed')
    }
  }

  const logout = async () => {
    await authApi.logout()
    Cookies.remove('auth_token')
    setAdmin(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider 
      value={{ 
        admin, 
        loading, 
        login, 
        logout, 
        isAuthenticated: !!admin 
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

---

## 7. API CLIENT IMPLEMENTATION

### Base Client
```typescript
// src/lib/api/client.ts

import axios, { AxiosError, AxiosRequestConfig } from 'axios'
import Cookies from 'js-cookie'
import { toast } from 'sonner'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError<any>) => {
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

### Example API Module
```typescript
// src/lib/api/products.ts

import apiClient from './client'
import { Product, ApiResponse, PaginatedResponse } from '@/lib/types'

export const productsApi = {
  getAll: async (params?: {
    page?: number
    limit?: number
    category?: string
    status?: string
    search?: string
  }): Promise<PaginatedResponse<Product>> => {
    return apiClient.get('/api/products', { params })
  },

  getOne: async (id: string): Promise<ApiResponse<Product>> => {
    return apiClient.get(`/api/products/${id}`)
  },

  create: async (data: Partial<Product>): Promise<ApiResponse<Product>> => {
    return apiClient.post('/api/products', data)
  },

  update: async (id: string, data: Partial<Product>): Promise<ApiResponse<Product>> => {
    return apiClient.put(`/api/products/${id}`, data)
  },

  delete: async (id: string): Promise<ApiResponse> => {
    return apiClient.delete(`/api/products/${id}`)
  },

  generateSKU: async (categoryId?: string): Promise<ApiResponse<{ sku: string }>> => {
    return apiClient.post('/api/products/generate-sku', { categoryId })
  },

  getLowStock: async (): Promise<ApiResponse<Product[]>> => {
    return apiClient.get('/api/products/low-stock')
  },
}
```

---

## 8. FORM HANDLING WITH REACT HOOK FORM + ZOD

### Example: Product Form Validation
```typescript
// src/lib/validation.ts

import { z } from 'zod'

export const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.object({
    short: z.string().min(10, 'Short description must be at least 10 characters'),
    full: z.string().min(50, 'Full description must be at least 50 characters'),
  }),
  price: z.number().positive('Price must be positive'),
  salePrice: z.number().positive().optional(),
  category: z.string().min(1, 'Category is required'),
  stock: z.number().int().min(0, 'Stock must be non-negative'),
  sku: z.string().min(3, 'SKU must be at least 3 characters'),
  brand: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  status: z.enum(['active', 'inactive', 'draft']),
  featured: z.boolean(),
})

export type ProductFormData = z.infer<typeof productSchema>
```

### Example: Form Component
```typescript
// src/components/products/product-form/index.tsx

'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productSchema, ProductFormData } from '@/lib/validation'
import { productsApi } from '@/lib/api/products'
import { toast } from 'sonner'

export function ProductForm({ product }: { product?: Product }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product || {
      status: 'draft',
      featured: false,
    },
  })

  const onSubmit = async (data: ProductFormData) => {
    try {
      if (product) {
        await productsApi.update(product._id, data)
        toast.success('Product updated successfully')
      } else {
        await productsApi.create(data)
        toast.success('Product created successfully')
      }
      router.push('/products')
    } catch (error) {
      toast.error(error.message || 'Failed to save product')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Form fields */}
    </form>
  )
}
```

---

## 9. ENVIRONMENT VARIABLES

### .env.local (Development)
```env
# API
NEXT_PUBLIC_API_URL=http://localhost:5000

# App
NEXT_PUBLIC_APP_NAME=GlowNatura Admin
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### .env.production (Production)
```env
# API
NEXT_PUBLIC_API_URL=https://glownatura-backend.onrender.com

# App
NEXT_PUBLIC_APP_NAME=GlowNatura Admin
NEXT_PUBLIC_APP_URL=https://admin.glownatura.com
```

---

## 10. DEVELOPMENT WORKFLOW

### Initial Setup
```bash
# Create Next.js project
npx create-next-app@latest glownatura-admin --typescript --tailwind --app --use-npm

# Install dependencies
npm install axios react-hook-form @hookform/resolvers zod sonner lucide-react recharts js-cookie
npm install -D @types/js-cookie

# Install shadcn/ui
npx shadcn@latest init

# Add UI components
npx shadcn@latest add button input card table tabs dialog select checkbox badge textarea label separator breadcrumb tooltip popover
```

### Development Commands
```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint
npm run lint
```

---

## 11. CRITICAL REQUIREMENTS

### Must-Have Features
1. **Authentication:** Secure login with JWT, auto-logout on token expiry, company domain email required (@glownatura.com)
2. **Authorization:** Admin-only access (single role), all admins have equal permissions
3. **Error Handling:** Global error boundary, toast notifications for all actions
4. **Loading States:** Skeleton loaders for all data fetching
5. **Form Validation:** Zod schemas for all forms, show validation errors
6. **API Integration:** All CRUD operations connected to backend
7. **Image Upload:** Cloudinary integration for product/category images
8. **Responsive Design:** Mobile-first, works on all screen sizes
9. **Dark Mode:** Full dark mode support with theme toggle
10. **Type Safety:** 100% TypeScript, no `any` types

### Performance Requirements
- **First Load:** < 3 seconds
- **Route Transitions:** < 500ms
- **API Calls:** Show loading states, handle timeouts
- **Image Optimization:** Use Next.js Image component
- **Code Splitting:** Lazy load heavy components

### Security Requirements
- **XSS Protection:** Sanitize all user inputs
- **CSRF Protection:** Use SameSite cookies
- **SQL Injection:** Backend handles (admin only reads)
- **Secure Storage:** Never store sensitive data in localStorage
- **HTTPS Only:** Production must use HTTPS

---

## 12. TESTING STRATEGY

### Manual Testing Checklist
- [ ] Login/logout flow works
- [ ] All CRUD operations work for each entity
- [ ] Form validation shows errors correctly
- [ ] API errors display toast notifications
- [ ] Loading states show skeletons
- [ ] Pagination works on all tables
- [ ] Filters work correctly
- [ ] Image uploads work
- [ ] Dark mode toggle works
- [ ] Mobile responsive layout works
- [ ] Browser back button works correctly

---

## 13. DEPLOYMENT

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# Set environment variables in Vercel dashboard
NEXT_PUBLIC_API_URL=https://glownatura-backend.onrender.com
```

### Build Configuration
```javascript
// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
}

export default nextConfig
```

---

## 14. CODE QUALITY STANDARDS

### File Naming Conventions
- **Components:** PascalCase (e.g., `ProductForm.tsx`)
- **Utilities:** camelCase (e.g., `formatDate.ts`)
- **Types:** PascalCase (e.g., `ApiResponse`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `API_URL`)

### Component Structure
```typescript
// 1. Imports (grouped)
import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

// 2. Types/Interfaces
interface Props {
  title: string
  onSubmit: () => void
}

// 3. Component
export function MyComponent({ title, onSubmit }: Props) {
  // 3a. Hooks
  const router = useRouter()
  const [state, setState] = useState()

  // 3b. Functions
  const handleClick = () => {
    // ...
  }

  // 3c. Effects
  useEffect(() => {
    // ...
  }, [])

  // 3d. Render
  return (
    <div>
      {/* ... */}
    </div>
  )
}
```

### Error Handling Pattern
```typescript
try {
  const response = await apiCall()
  toast.success('Success message')
} catch (error) {
  console.error('Error:', error)
  toast.error(error.message || 'Something went wrong')
}
```

---

## 15. FINAL DELIVERABLES

1. **Fully Functional Admin Panel** with all pages implemented
2. **Backend Integration** - All API endpoints connected
3. **Type-Safe Codebase** - 100% TypeScript
4. **Professional UI** - Matches v0.dev design exactly
5. **Error-Free** - No console errors or warnings
6. **Documented Code** - Comments on complex logic
7. **README.md** - Setup instructions and architecture overview
8. **Deployed** - Live on Vercel (optional)

---

## 16. SUCCESS CRITERIA

- [ ] All 8 pages implemented and functional
- [ ] Authentication system working (login/logout)
- [ ] All CRUD operations connected to backend API
- [ ] Forms validate correctly with Zod
- [ ] Error handling shows user-friendly messages
- [ ] Loading states implemented everywhere
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Dark mode fully functional
- [ ] No TypeScript errors
- [ ] No console errors or warnings
- [ ] Build succeeds without errors
- [ ] Performance metrics pass (Core Web Vitals)

---

## EXECUTION INSTRUCTIONS FOR CURSOR AI

1. **Create project structure exactly as specified**
2. **Install all dependencies listed**
3. **Implement authentication first (critical path)**
4. **Build pages in this order:**
   - Login page
   - Dashboard home
   - Products (list, create, edit)
   - Categories
   - Reviews
   - Orders
   - Media
   - Settings
5. **Connect each page to backend API as you build**
6. **Test each feature after implementation**
7. **Fix any TypeScript errors immediately**
8. **Ensure responsive design at each step**
9. **Ask for clarification if any specification is unclear**
10. **Report progress after completing each major section**

---

**This prompt contains everything needed to build a production-ready admin panel with zero errors and perfect integration with the existing backend.**

