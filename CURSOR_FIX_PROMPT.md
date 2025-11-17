# COMPREHENSIVE ADMIN PANEL FIX PROMPT FOR CURSOR

**CRITICAL INSTRUCTION:** This admin panel is a **FRONTEND ONLY** application. It displays data and makes API calls to the backend. The admin panel does NOT have its own business logic, authentication system, or database. ALL data comes from the backend API at `https://backendglownaturas.onrender.com/api`.

---

## 🎯 PRIMARY OBJECTIVE

Fix the GlowNaturas Admin Panel to properly integrate with the existing backend API. The backend is already complete and deployed. Your job is to make the frontend match the backend's exact specifications.

---

## 🔴 CRITICAL AUTHENTICATION FLOW MISMATCH (MUST FIX FIRST)

### CURRENT SITUATION (WRONG):
The admin panel implements a **2-step OTP login flow** and **OTP-based email verification**, but the backend does NOT support this!

### BACKEND'S ACTUAL AUTHENTICATION FLOW:

#### 1. Registration Flow:
```typescript
// REQUEST
POST /api/auth/register
{
  "name": "Admin Name",
  "email": "admin@glownatura.com",
  "password": "Password123!"
}

// RESPONSE
{
  "success": true,
  "message": "Registration successful! Please check your email to verify your account.",
  "data": {
    "email": "admin@glownatura.com",
    "emailVerified": false
  }
}
```

**What happens:**
- Backend creates admin account with `emailVerified: false`
- Backend sends an email with a **VERIFICATION LINK** containing a **TOKEN** (NOT an OTP code!)
- Email example: "Click here: http://admin-url/verify-email?token=abc123xyz..."

#### 2. Email Verification Flow:
```typescript
// REQUEST (from URL parameter)
POST /api/auth/verify-email
{
  "token": "abc123xyz..."  // ← TOKEN from email link, NOT OTP code!
}

// RESPONSE
{
  "success": true,
  "message": "Email verified successfully! You can now login.",
  "data": {
    "_id": "...",
    "name": "Admin Name",
    "email": "admin@glownatura.com",
    "emailVerified": true
  },
  "token": "jwt_token_here"
}
```

**What the admin panel should do:**
1. Get `token` from URL query parameter: `?token=abc123xyz`
2. Send `{ token }` to `/api/auth/verify-email`
3. Show success message
4. Redirect to login

#### 3. Login Flow (NO OTP!):
```typescript
// REQUEST
POST /api/auth/login
{
  "email": "admin@glownatura.com",
  "password": "Password123!"
}

// RESPONSE (SUCCESS)
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Admin Name",
    "email": "admin@glownatura.com",
    "emailVerified": true,
    "lastLogin": "2025-11-16T..."
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

// RESPONSE (EMAIL NOT VERIFIED)
{
  "success": false,
  "error": "Please verify your email before logging in. Check your inbox for the verification link.",
  "errorCode": "EMAIL_NOT_VERIFIED"
}

// RESPONSE (ACCOUNT LOCKED)
{
  "success": false,
  "error": "Too many authentication attempts, please try again later.",
  "errorCode": "ACCOUNT_LOCKED"
}
```

**What the admin panel should do:**
1. Simple login form: email + password (NO 2-step OTP!)
2. Send to `/api/auth/login`
3. If `errorCode === "EMAIL_NOT_VERIFIED"`, show message: "Please verify your email first. Check your inbox."
4. If successful, store `token` in cookie and redirect to dashboard
5. NO OTP step!

---

### REQUIRED CHANGES TO AUTHENTICATION FILES:

#### File: `src/app/(auth)/register/page.tsx`
**Status:** ✅ Mostly correct, but needs toast fix

**Changes needed:**
```typescript
// CURRENT (Line 50):
toast.success('Account created! Check your email for verification code.')

// CHANGE TO:
toast.success('Account created! Check your email for verification link.')
```

---

#### File: `src/app/(auth)/verify-email/page.tsx`
**Status:** ❌ COMPLETELY WRONG - Expects OTP, backend expects TOKEN

**Required changes:**
1. Remove OTP input field
2. Get `token` from URL query parameter
3. Automatically verify on page load
4. Show loading state while verifying
5. Show success/error message
6. Redirect to login on success

**Complete rewrite required:**
```typescript
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { httpClient } from '@/infrastructure/api/client'
import { API_ENDPOINTS } from '@/infrastructure/config/api.config'

type VerificationState = 'loading' | 'success' | 'error'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [state, setState] = useState<VerificationState>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')

    if (!token) {
      setState('error')
      setMessage('Invalid verification link. Please check your email for the correct link.')
      return
    }

    verifyEmail(token)
  }, [searchParams])

  const verifyEmail = async (token: string) => {
    try {
      const response: any = await httpClient.post(API_ENDPOINTS.auth.verifyEmail, {
        token
      })

      if (response.success) {
        setState('success')
        setMessage('Email verified successfully! Redirecting to login...')

        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      }
    } catch (error: any) {
      setState('error')
      setMessage(error.error || 'Verification failed. The link may be invalid or expired.')
    }
  }

  return (
    <Card>
      <CardHeader className="space-y-4 text-center">
        <div className="flex justify-center">
          <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
            state === 'loading' ? 'bg-blue-100' :
            state === 'success' ? 'bg-green-100' :
            'bg-red-100'
          }`}>
            {state === 'loading' && <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />}
            {state === 'success' && <CheckCircle2 className="h-6 w-6 text-green-600" />}
            {state === 'error' && <XCircle className="h-6 w-6 text-red-600" />}
          </div>
        </div>
        <div className="space-y-2">
          <CardTitle className="text-2xl">
            {state === 'loading' && 'Verifying Email'}
            {state === 'success' && 'Email Verified'}
            {state === 'error' && 'Verification Failed'}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {state === 'error' && (
          <div className="space-y-4">
            <Button
              onClick={() => router.push('/register')}
              className="w-full"
              variant="outline"
            >
              Register Again
            </Button>
            <div className="text-center">
              <Link
                href="/login"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Back to login
              </Link>
            </div>
          </div>
        )}

        {state === 'success' && (
          <Button
            onClick={() => router.push('/login')}
            className="w-full"
          >
            Continue to Login
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
```

---

#### File: `src/app/(auth)/login/page.tsx`
**Status:** ❌ COMPLETELY WRONG - Implements 2-step OTP, backend doesn't support it

**Required changes:**
1. Remove 2-step OTP flow completely
2. Remove `verifyOtp` API call
3. Simple login: email + password → JWT token
4. Handle `EMAIL_NOT_VERIFIED` error specifically
5. Remove device ID tracking (backend doesn't use it)
6. Remove "Remember this device" checkbox (not needed)

**Complete rewrite required:**
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import Cookies from 'js-cookie'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Label } from '@/presentation/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/components/ui/card'
import { httpClient } from '@/infrastructure/api/client'
import { API_ENDPOINTS } from '@/infrastructure/config/api.config'
import { AUTH_TOKEN_KEY } from '@/infrastructure/config/constants'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)

    try {
      const response: any = await httpClient.post(API_ENDPOINTS.auth.login, {
        email: formData.email,
        password: formData.password,
      })

      if (response.success && response.token) {
        // Store token in cookie (expires in 7 days by default)
        Cookies.set(AUTH_TOKEN_KEY, response.token, { expires: 7 })

        toast.success('Login successful!')
        router.push('/')
      }
    } catch (error: any) {
      // Handle specific error codes
      if (error.errorCode === 'EMAIL_NOT_VERIFIED') {
        toast.error(
          'Please verify your email first. Check your inbox for the verification link.',
          { duration: 5000 }
        )
      } else if (error.errorCode === 'ACCOUNT_LOCKED') {
        toast.error(
          'Account locked due to too many failed attempts. Please try again later.',
          { duration: 5000 }
        )
      } else {
        toast.error(error.error || 'Invalid email or password')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="space-y-4 text-center">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <CardTitle className="text-2xl">GlowNatura Admin</CardTitle>
          <CardDescription>Sign in to manage your store</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@glownatura.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              disabled={loading}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary font-medium hover:underline">
              Register now
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
```

---

#### File: `src/infrastructure/config/api.config.ts`
**Status:** ⚠️ Has wrong endpoints

**Changes needed:**
```typescript
// REMOVE these (backend doesn't have them):
verifyOtp: '/api/auth/verify-otp',  // ❌ Delete this

// KEEP these (backend has them):
login: '/api/auth/login',                     // ✅ Correct
register: '/api/auth/register',               // ✅ Correct
verifyEmail: '/api/auth/verify-email',        // ✅ Correct
resendVerification: '/api/auth/resend-verification',  // ✅ Add this
forgotPassword: '/api/auth/forgot-password',  // ✅ Correct
resetPassword: '/api/auth/reset-password',    // ✅ Correct
```

**Complete auth section:**
```typescript
auth: {
  login: '/api/auth/login',
  logout: '/api/auth/logout',
  me: '/api/auth/me',
  register: '/api/auth/register',
  verifyEmail: '/api/auth/verify-email',
  resendVerification: '/api/auth/resend-verification',
  forgotPassword: '/api/auth/forgot-password',
  resetPassword: '/api/auth/reset-password',
  changePassword: '/api/auth/change-password',
  updateProfile: '/api/auth/profile',
},
```

---

## 🔴 CRITICAL BUG FIXES (HTTP Methods)

### Issue: Wrong HTTP Methods in Repository Files

The backend uses **PUT** for updates, but the admin panel uses **PATCH** and **POST** in some places.

#### File: `src/infrastructure/repositories/order.repository.impl.ts`

**Line 19-21 - WRONG:**
```typescript
async updateStatus(id: string, status: OrderStatus): Promise<ApiResponse<Order>> {
  return httpClient.patch<ApiResponse<Order>>(API_ENDPOINTS.orders.updateStatus(id), { status })
}
```

**FIX - Use PUT and add tracking number support:**
```typescript
async updateStatus(
  id: string,
  status: OrderStatus,
  trackingNumber?: string
): Promise<ApiResponse<Order>> {
  const payload: any = { status }

  // Tracking number required for shipped status
  if (status === 'shipped' && trackingNumber) {
    payload.trackingNumber = trackingNumber
  }

  return httpClient.put<ApiResponse<Order>>(
    API_ENDPOINTS.orders.updateStatus(id),
    payload
  )
}
```

**Line 27-29 - WRONG:**
```typescript
async cancel(id: string, reason: string): Promise<ApiResponse<Order>> {
  return httpClient.post<ApiResponse<Order>>(API_ENDPOINTS.orders.cancel(id), { reason })
}
```

**FIX - Use PUT:**
```typescript
async cancel(id: string, reason: string): Promise<ApiResponse<Order>> {
  return httpClient.put<ApiResponse<Order>>(API_ENDPOINTS.orders.cancel(id), { reason })
}
```

**ADD MISSING METHODS:**
```typescript
async addNote(id: string, note: string): Promise<ApiResponse<Order>> {
  return httpClient.post<ApiResponse<Order>>(API_ENDPOINTS.orders.addNote(id), { note })
}

async export(params?: QueryParams): Promise<Blob> {
  const queryString = params ? new URLSearchParams(params as Record<string, string>).toString() : ''
  const url = `${API_ENDPOINTS.orders.export}${queryString ? `?${queryString}` : ''}`
  return httpClient.get<Blob>(url)
}
```

---

#### File: `src/infrastructure/repositories/review.repository.impl.ts`

**Line 19-21 - WRONG:**
```typescript
async updateStatus(id: string, status: ReviewStatus): Promise<ApiResponse<Review>> {
  return httpClient.patch<ApiResponse<Review>>(API_ENDPOINTS.reviews.updateStatus(id), { status })
}
```

**FIX - Use PUT:**
```typescript
async updateStatus(id: string, status: ReviewStatus): Promise<ApiResponse<Review>> {
  return httpClient.put<ApiResponse<Review>>(API_ENDPOINTS.reviews.updateStatus(id), { status })
}
```

**Line 27-29 - WRONG:**
```typescript
async bulkUpdateStatus(ids: string[], status: ReviewStatus): Promise<ApiResponse<void>> {
  return httpClient.post<ApiResponse<void>>(API_ENDPOINTS.reviews.bulkStatus, { ids, status })
}
```

**FIX - Use PUT and correct parameter name:**
```typescript
async bulkUpdateStatus(reviewIds: string[], status: ReviewStatus): Promise<ApiResponse<void>> {
  return httpClient.put<ApiResponse<void>>(
    API_ENDPOINTS.reviews.bulkStatus,
    { reviewIds, status }  // Backend expects reviewIds, not ids
  )
}
```

---

## 🟡 MISSING FEATURES (Must Implement)

### 1. Product Edit Page
**File to create:** `src/app/(dashboard)/products/[id]/edit/page.tsx`

**Backend endpoint:** `PUT /api/products/:id` ✅ Already exists

**What it needs:**
1. Fetch product by ID on page load
2. Pre-fill form with existing product data
3. Allow editing all fields (name, description, price, images, category, etc.)
4. Handle image management (add new, remove existing, reorder)
5. Call `PUT /api/products/:id` with updated data
6. Show success message and redirect to products list

**Example structure:**
```typescript
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ProductRepositoryImpl } from '@/infrastructure/repositories/product.repository.impl'
import { toast } from 'sonner'

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  const [loading, setLoading] = useState(true)
  const [product, setProduct] = useState(null)

  useEffect(() => {
    fetchProduct()
  }, [productId])

  const fetchProduct = async () => {
    try {
      const repo = new ProductRepositoryImpl()
      const response = await repo.findById(productId)

      if (response.success) {
        setProduct(response.data)
      }
    } catch (error: any) {
      toast.error(error.error || 'Failed to load product')
      router.push('/products')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (updatedData: any) => {
    try {
      const repo = new ProductRepositoryImpl()
      const response = await repo.update(productId, updatedData)

      if (response.success) {
        toast.success('Product updated successfully')
        router.push('/products')
      }
    } catch (error: any) {
      toast.error(error.error || 'Failed to update product')
    }
  }

  if (loading) return <div>Loading...</div>
  if (!product) return <div>Product not found</div>

  return (
    <div>
      <h1>Edit Product</h1>
      {/* Reuse ProductForm component from /products/new, pre-filled with product data */}
    </div>
  )
}
```

---

### 2. Complete Media Library Page
**File to update:** `src/app/(dashboard)/media/page.tsx`

**Current status:** Placeholder only

**Backend endpoints available:**
- `GET /api/media?page=1&limit=30&folder=products&tags=featured` - List media
- `POST /api/media` - Upload (already used in product forms)
- `PUT /api/media/:id` - Update metadata
- `DELETE /api/media/:id` - Delete single
- `DELETE /api/media/bulk/unused` - Bulk delete

**What it needs:**
1. **Upload section:**
   - Drag & drop file upload
   - Multiple file support (max 10)
   - Upload progress indicator
   - Preview thumbnails

2. **Media grid:**
   - Display all uploaded media in grid
   - Pagination (30 per page)
   - Search/filter by folder, tags
   - Image preview on hover/click

3. **Actions per image:**
   - Copy URL to clipboard
   - Edit metadata (alt text, title, tags, folder)
   - Delete with confirmation
   - Show where image is used (products, categories)

4. **Bulk actions:**
   - Select multiple images
   - Bulk delete unused media

**Example query params:**
```typescript
?page=1&limit=30&folder=products&tags=featured&unused=false&sort=createdAt&order=desc
```

---

### 3. Dashboard Analytics Widgets

**File to update:** `src/app/(dashboard)/page.tsx`

**Backend endpoints available:**
- `GET /api/dashboard/stats?period=month` ✅ Already used
- `GET /api/dashboard/recent-orders?limit=10` ❌ Not implemented
- `GET /api/dashboard/top-products?period=month&limit=10` ❌ Not implemented
- `GET /api/dashboard/sales-data?period=month&groupBy=day` ❌ Not implemented

**What to add:**

1. **Period selector:**
```typescript
<select value={period} onChange={(e) => setPeriod(e.target.value)}>
  <option value="today">Today</option>
  <option value="week">This Week</option>
  <option value="month">This Month</option>
  <option value="year">This Year</option>
</select>
```

2. **Recent Orders Widget:**
```typescript
const { data: recentOrders } = await httpClient.get(
  `/api/dashboard/recent-orders?limit=10`
)

// Display: Order number, customer name, total, status, date
```

3. **Top Products Widget:**
```typescript
const { data: topProducts } = await httpClient.get(
  `/api/dashboard/top-products?period=${period}&limit=10`
)

// Display: Product name, total sold, revenue
```

4. **Sales Chart:**
```typescript
const { data: salesData } = await httpClient.get(
  `/api/dashboard/sales-data?period=${period}&groupBy=day`
)

// Use recharts library (already installed) to display:
// - Line chart for revenue over time
// - Bar chart for orders count
// Data format: { labels: [...], revenue: [...], orders: [...] }
```

5. **Revenue Change Indicator:**
```typescript
// Backend already returns revenueChange and ordersChange in stats
const stats = await httpClient.get(`/api/dashboard/stats?period=${period}`)

// Display:
{stats.revenueChange > 0 ? (
  <span className="text-green-600">
    ↑ {stats.revenueChange}% vs previous period
  </span>
) : (
  <span className="text-red-600">
    ↓ {stats.revenueChange}% vs previous period
  </span>
)}
```

---

### 4. Complete Settings Page

**File to update:** `src/app/(dashboard)/settings/page.tsx`

**Current implementation:** Only basic store info (name, email, phone, address)

**Backend structure:**
```typescript
{
  storeInfo: {
    name, tagline, description, logo, favicon, email, phone,
    address: { street, city, state, zipCode, country }
  },
  whatsapp: { enabled, number, message },
  socialMedia: { facebook, instagram, twitter, youtube, tiktok },
  shipping: { freeShippingThreshold, defaultShippingCost },
  tax: { enabled, rate },
  currency: { code, symbol }
}
```

**Add these sections:**

1. **WhatsApp Integration:**
```typescript
<Card>
  <CardHeader>
    <CardTitle>WhatsApp Integration</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          checked={settings.whatsapp?.enabled}
          onCheckedChange={(checked) => updateWhatsApp('enabled', checked)}
        />
        <Label>Enable WhatsApp Chat Widget</Label>
      </div>

      <Input
        label="WhatsApp Number (with country code)"
        placeholder="+2348012345678"
        value={settings.whatsapp?.number}
        onChange={(e) => updateWhatsApp('number', e.target.value)}
      />

      <Textarea
        label="Default Message"
        placeholder="Hello! I'm interested in your products."
        value={settings.whatsapp?.message}
        onChange={(e) => updateWhatsApp('message', e.target.value)}
      />
    </div>
  </CardContent>
</Card>
```

2. **Social Media Links:**
```typescript
<Card>
  <CardHeader>
    <CardTitle>Social Media</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <Input label="Facebook URL" value={settings.socialMedia?.facebook} />
    <Input label="Instagram URL" value={settings.socialMedia?.instagram} />
    <Input label="Twitter URL" value={settings.socialMedia?.twitter} />
    <Input label="YouTube URL" value={settings.socialMedia?.youtube} />
    <Input label="TikTok URL" value={settings.socialMedia?.tiktok} />
  </CardContent>
</Card>
```

3. **Shipping & Tax:**
```typescript
<Card>
  <CardHeader>
    <CardTitle>Shipping & Tax</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <Input
      type="number"
      label="Free Shipping Threshold (₦)"
      value={settings.shipping?.freeShippingThreshold}
    />
    <Input
      type="number"
      label="Default Shipping Cost (₦)"
      value={settings.shipping?.defaultShippingCost}
    />
    <Checkbox label="Enable Tax" checked={settings.tax?.enabled} />
    <Input
      type="number"
      label="Tax Rate (%)"
      value={settings.tax?.rate}
      disabled={!settings.tax?.enabled}
    />
  </CardContent>
</Card>
```

4. **Currency Settings:**
```typescript
<Card>
  <CardHeader>
    <CardTitle>Currency</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <Select
      label="Currency Code"
      value={settings.currency?.code}
    >
      <option value="NGN">NGN - Nigerian Naira</option>
      <option value="USD">USD - US Dollar</option>
      <option value="EUR">EUR - Euro</option>
      <option value="GBP">GBP - British Pound</option>
    </Select>
    <Input
      label="Currency Symbol"
      value={settings.currency?.symbol}
      placeholder="₦"
    />
  </CardContent>
</Card>
```

---

### 5. Email Template Management

**Files to create:**
- `src/app/(dashboard)/settings/email-templates/page.tsx` - List all templates
- `src/app/(dashboard)/settings/email-templates/[type]/page.tsx` - Edit template

**Backend endpoints:**
- `GET /api/email-templates` - List all
- `GET /api/email-templates/:type` - Get specific template
- `PUT /api/email-templates/:type` - Update template (⚠️ Note: `:type` not `:id`)
- `POST /api/email-templates/preview` - Preview with sample data
- `POST /api/email-templates/test-send` - Send test email
- `POST /api/email-templates/:type/restore` - Restore default

**Template types:**
- `order-confirmation`
- `payment-confirmed`
- `order-shipped`
- `order-delivered`
- `order-cancelled`
- `refund-processed`

**Fix API config:**
```typescript
// WRONG:
emailTemplates: {
  update: (id: string) => `/api/email-templates/${id}`,
}

// CORRECT:
emailTemplates: {
  list: '/api/email-templates',
  get: (type: string) => `/api/email-templates/${type}`,
  update: (type: string) => `/api/email-templates/${type}`,
  preview: '/api/email-templates/preview',
  testSend: '/api/email-templates/test-send',
  restore: (type: string) => `/api/email-templates/${type}/restore`,
}
```

**List page example:**
```typescript
export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState([])

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    const response = await httpClient.get('/api/email-templates')
    setTemplates(response.data)
  }

  return (
    <div className="grid gap-4">
      {templates.map(template => (
        <Card key={template.type}>
          <CardHeader>
            <CardTitle>{template.type}</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href={`/settings/email-templates/${template.type}`}>
              Edit Template
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

**Edit page example:**
```typescript
export default function EditEmailTemplatePage() {
  const params = useParams()
  const templateType = params.type as string

  const [template, setTemplate] = useState({
    subject: '',
    body: ''
  })

  const handleSave = async () => {
    await httpClient.put(`/api/email-templates/${templateType}`, template)
    toast.success('Template updated')
  }

  const handlePreview = async () => {
    const response = await httpClient.post('/api/email-templates/preview', {
      type: templateType,
      sampleData: { /* ... */ }
    })
    // Show preview in modal
  }

  const handleTestSend = async () => {
    await httpClient.post('/api/email-templates/test-send', {
      type: templateType,
      to: 'test@example.com',
      sampleData: { /* ... */ }
    })
    toast.success('Test email sent')
  }

  const handleRestore = async () => {
    await httpClient.post(`/api/email-templates/${templateType}/restore`)
    toast.success('Template restored to default')
    fetchTemplate()
  }

  return (
    <div>
      <Input label="Subject" value={template.subject} />
      <Textarea label="Body (HTML)" value={template.body} rows={20} />

      <div className="flex gap-2">
        <Button onClick={handleSave}>Save</Button>
        <Button onClick={handlePreview} variant="outline">Preview</Button>
        <Button onClick={handleTestSend} variant="outline">Send Test</Button>
        <Button onClick={handleRestore} variant="destructive">Restore Default</Button>
      </div>
    </div>
  )
}
```

---

### 6. Order Management Enhancements

**File to update:** `src/app/(dashboard)/orders/[id]/page.tsx`

**Add these features:**

1. **Add Order Note:**
```typescript
const handleAddNote = async (note: string) => {
  const repo = new OrderRepositoryImpl()
  await repo.addNote(orderId, note)
  toast.success('Note added')
  refetchOrder()
}

// UI:
<div>
  <Textarea placeholder="Add internal note..." value={note} />
  <Button onClick={() => handleAddNote(note)}>Add Note</Button>

  <div className="mt-4">
    <h3>Order Notes</h3>
    {order.notes?.map(note => (
      <div key={note.createdAt}>
        <p>{note.note}</p>
        <small>{note.admin.name} - {formatDate(note.createdAt)}</small>
      </div>
    ))}
  </div>
</div>
```

2. **Tracking Number for Shipped Status:**
```typescript
const handleUpdateStatus = async (status: string, trackingNumber?: string) => {
  const repo = new OrderRepositoryImpl()
  await repo.updateStatus(orderId, status, trackingNumber)
  toast.success('Order status updated')
}

// UI:
{status === 'shipped' && (
  <Input
    label="Tracking Number"
    placeholder="Enter tracking number"
    value={trackingNumber}
    onChange={(e) => setTrackingNumber(e.target.value)}
  />
)}
```

3. **Export Orders Button (in orders list page):**
```typescript
const handleExport = async () => {
  const repo = new OrderRepositoryImpl()
  const blob = await repo.export({ status, startDate, endDate })

  // Download file
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `orders-${new Date().toISOString()}.csv`
  a.click()
}

// UI:
<Button onClick={handleExport}>
  <Download className="mr-2 h-4 w-4" />
  Export Orders
</Button>
```

4. **Refund Workflow:**
```typescript
const handleRequestRefund = async (amount: number, reason: string) => {
  await httpClient.post(`/api/orders/${orderId}/refund/request`, {
    amount,
    reason
  })
  toast.success('Refund requested')
}

const handleProcessRefund = async (status: 'approved' | 'rejected', note: string) => {
  await httpClient.put(`/api/orders/${orderId}/refund/process`, {
    status,
    note
  })
  toast.success(`Refund ${status}`)
}
```

---

## 📋 GENERAL GUIDELINES

### 1. NEVER Implement Business Logic in Frontend

**WRONG:**
```typescript
// ❌ Don't generate SKU in frontend
const sku = `GN-${category}-${Date.now()}`
```

**CORRECT:**
```typescript
// ✅ Call backend API
const response = await httpClient.get('/api/products/generate-sku')
const sku = response.data.sku
```

**WRONG:**
```typescript
// ❌ Don't calculate totals in frontend
const total = subtotal + shipping + tax
```

**CORRECT:**
```typescript
// ✅ Backend returns calculated totals
const order = await httpClient.post('/api/orders', orderData)
// order.total, order.subtotal, order.shipping, order.tax all from backend
```

---

### 2. Always Handle Backend Errors Properly

**Required error handling pattern:**
```typescript
try {
  const response = await httpClient.post('/api/endpoint', data)

  if (response.success) {
    toast.success('Action successful')
    // Update UI
  }
} catch (error: any) {
  // error.error contains the message from backend
  // error.errorCode contains specific error codes

  if (error.errorCode === 'SPECIFIC_CODE') {
    toast.error('Specific error message')
  } else {
    toast.error(error.error || 'Operation failed')
  }
}
```

---

### 3. Backend API Response Format

**All backend responses follow this structure:**

**Success:**
```typescript
{
  success: true,
  data: { ... },           // The actual data
  message?: string         // Optional success message
}
```

**Error:**
```typescript
{
  success: false,
  error: "Error message",  // Human-readable error
  errorCode?: string       // Specific error code (EMAIL_NOT_VERIFIED, ACCOUNT_LOCKED, etc.)
}
```

**Paginated:**
```typescript
{
  success: true,
  data: {
    items: [...],          // Array of items (products, orders, etc.)
    pagination: {
      page: 1,
      limit: 20,
      totalItems: 100,
      totalPages: 5
    }
  }
}
```

---

### 4. Common Query Parameters

**Pagination:**
```
?page=1&limit=20
```

**Filtering:**
```
?status=active&category=cat123&search=cream
```

**Sorting:**
```
?sort=createdAt&order=desc
```

**Date Range:**
```
?startDate=2025-11-01&endDate=2025-11-30
```

**Example combined:**
```
GET /api/products?page=1&limit=20&status=active&category=cat123&search=cream&sort=price&order=asc
```

---

### 5. Email Sending Mechanism

**What powers email sending:**

1. **Backend Configuration:**
   - Uses Nodemailer library
   - SMTP service: Brevo (formerly Sendinblue)
   - Configuration file: `/src/config/email.js`

2. **Environment Variables Required:**
```env
BREVO_SMTP_HOST=smtp-relay.sendinblue.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=your_brevo_email
BREVO_SMTP_PASSWORD=your_brevo_password
FROM_NAME=GlowNatura
FROM_EMAIL=noreply@glownatura.com
```

3. **Email Templates:**
   - Email verification: Sent when admin registers
   - Password reset: Sent when admin requests password reset
   - Order confirmation: Sent to customers when order is created
   - Order status updates: Sent when order status changes

4. **How it works:**
   - Admin registers → Backend creates account
   - Backend generates verification TOKEN (not OTP code!)
   - Backend calls `emailService.sendVerificationEmail()`
   - Email sent via Brevo SMTP with verification link
   - Admin clicks link → Frontend gets token from URL
   - Frontend sends token to `/api/auth/verify-email`
   - Backend verifies token and marks email as verified

**If emails are not being sent:**
- Check backend logs: `/logs/combined.log`
- Verify Brevo SMTP credentials in `.env`
- Check Brevo dashboard for sending limits
- Verify `FROM_EMAIL` is authorized in Brevo

---

## 📊 IMPLEMENTATION PRIORITY

### Phase 1: Critical Fixes (Day 1)
1. ✅ Fix authentication flow (register, verify email, login)
2. ✅ Fix HTTP method bugs (PUT instead of PATCH/POST)
3. ✅ Fix API config endpoints

### Phase 2: Core Features (Days 2-3)
4. ✅ Build product edit page
5. ✅ Complete media library
6. ✅ Add order management features (notes, export, tracking)

### Phase 3: Analytics & Settings (Days 4-5)
7. ✅ Add dashboard analytics widgets
8. ✅ Complete settings sections
9. ✅ Build email template management

### Phase 4: Polish (Day 6)
10. ✅ Add profile management page
11. ✅ Add bulk actions for products
12. ✅ End-to-end testing

---

## ✅ TESTING CHECKLIST

After making changes, test these flows:

### Authentication:
- [ ] Register new admin → Check email for verification link
- [ ] Click verification link → Should verify and redirect to login
- [ ] Login with verified account → Should succeed
- [ ] Login with unverified account → Should show error
- [ ] Login with wrong password 5 times → Account should lock
- [ ] Forgot password → Should receive reset email
- [ ] Reset password → Should succeed

### Products:
- [ ] Create product with images → Should upload to backend/Cloudinary
- [ ] Edit product → Should update (when page is built)
- [ ] Delete product → Should delete
- [ ] Generate SKU → Should call backend API
- [ ] View low stock products → Should show correct list

### Orders:
- [ ] View all orders → Should list with filters
- [ ] View order details → Should show full info
- [ ] Update order status → Should succeed
- [ ] Add order note → Should succeed (when built)
- [ ] Export orders → Should download CSV (when built)

### Reviews:
- [ ] Approve review → Should update status
- [ ] Reject review → Should update status
- [ ] Delete review → Should delete
- [ ] Bulk approve → Should update multiple

### Dashboard:
- [ ] View dashboard → Should show real stats (not hardcoded data)
- [ ] Change period → Should update stats (when built)
- [ ] View recent orders → Should show list (when built)
- [ ] View sales chart → Should display data (when built)

### Settings:
- [ ] Update store info → Should save
- [ ] Update WhatsApp settings → Should save (when built)
- [ ] Update social media → Should save (when built)

### Media Library:
- [ ] Upload images → Should upload to backend
- [ ] View all media → Should show grid (when built)
- [ ] Delete media → Should delete (when built)

---

## 🎯 SUCCESS CRITERIA

The admin panel is complete when:

1. ✅ Authentication works exactly like the backend (TOKEN-based verification, direct login)
2. ✅ All HTTP methods match backend specs (PUT, not PATCH/POST)
3. ✅ All missing features are implemented
4. ✅ No frontend business logic (all calculations done by backend)
5. ✅ All error handling is robust
6. ✅ All API calls use correct endpoints
7. ✅ No hardcoded data (everything from backend API)
8. ✅ Loading states shown during API calls
9. ✅ Success/error toast notifications for all actions
10. ✅ Responsive design works on all devices

---

## 🚨 CRITICAL REMINDERS

1. **This is a FRONTEND ONLY application**
   - NO business logic in frontend
   - NO database access from frontend
   - NO authentication logic in frontend
   - ALL data comes from backend API

2. **Backend API is the source of truth**
   - Backend defines the data structure
   - Backend calculates totals, generates SKUs, handles validation
   - Frontend only displays and submits data

3. **Email sending happens in backend**
   - Frontend doesn't send emails
   - Frontend calls backend API
   - Backend sends emails via Brevo SMTP

4. **Authentication flow:**
   - Register → Backend sends verification EMAIL with TOKEN link
   - Verify → Frontend gets TOKEN from URL and sends to backend
   - Login → Simple email + password → Backend returns JWT
   - NO OTP codes, NO 2-step verification

5. **HTTP methods matter:**
   - Use PUT for updates (not PATCH)
   - Use POST for creates
   - Use DELETE for deletes
   - Use GET for fetches

---

**GOOD LUCK! Follow this prompt exactly and the admin panel will work perfectly with the backend.**
