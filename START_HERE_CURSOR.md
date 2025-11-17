# CURSOR AI - START HERE

## YOUR MISSION

Build a **FULLY FUNCTIONAL** Next.js 15 admin dashboard for GlowNatura that connects to a live Express.js backend API.

**CRITICAL:** This is NOT a UI mockup. Every feature must work with real API integration.

---

## WHAT YOU'RE BUILDING

A complete admin panel with 8 pages:
1. Login (authentication with JWT)
2. Dashboard (real-time stats and charts)
3. Products (full CRUD with image upload)
4. Categories (create, edit, delete)
5. Reviews (approve, reject, delete)
6. Orders (view, update status, manage)
7. Media Library (upload, view, delete)
8. Settings (update store/WhatsApp/social)

---

## YOUR GUIDELINES

### 1. Read These Files First
- `ADMIN_PANEL_DEVELOPMENT_PROMPT.md` - Complete technical specification
- `CURSOR_IMPLEMENTATION_GUIDE.md` - Detailed step-by-step implementation
- `QUICK_BUILD_CHECKLIST.md` - Task checklist

### 2. Backend API
- **Base URL:** `http://localhost:5000` (development)
- **Backend is LIVE and RUNNING**
- **Authentication:** JWT tokens (store in cookies)
- **All endpoints documented** in `CURSOR_IMPLEMENTATION_GUIDE.md`

### 3. Technology Stack (EXACT)
- Next.js 15 (App Router)
- TypeScript (strict mode)
- Tailwind CSS v4
- shadcn/ui components
- React Hook Form + Zod
- Axios for API calls
- Sonner for toasts
- Recharts for charts

### 4. Build Order (FOLLOW THIS)
1. Setup project and install dependencies
2. Create API client and types
3. Build authentication system (FIRST)
4. Build layout (sidebar, header)
5. Build dashboard page
6. Build products module (list → create → edit)
7. Build categories module
8. Build reviews module
9. Build orders module
10. Build media module
11. Build settings module
12. Polish and test

### 5. Rules You MUST Follow
- **NO mock data** - Always fetch from API
- **NO dummy components** - Make everything functional
- **NO skipping error handling** - Every API call needs try/catch
- **NO skipping loading states** - Show skeletons while loading
- **NO inline styles** - Use Tailwind classes only
- **NO `any` types** - Use proper TypeScript interfaces
- **NO console.log** - Use proper error handling
- **ALL forms must submit to API**
- **ALL tables must load real data**
- **ALL CRUD operations must work**

---

## STEP-BY-STEP START

### Step 1: Create Project (5 minutes)
```bash
npx create-next-app@latest glownatura-admin --typescript --tailwind --app --use-npm --no-src
cd glownatura-admin
```

### Step 2: Install Dependencies (5 minutes)
```bash
# Core dependencies
npm install axios@1.6.5 js-cookie@3.0.5 react-hook-form@7.49.3 @hookform/resolvers@3.3.4 zod@3.22.4 lucide-react@0.309.0 sonner@1.3.1 recharts@2.10.3

# Type definitions
npm install -D @types/js-cookie@3.0.6

# shadcn/ui
npx shadcn@latest init
npx shadcn@latest add button input card table dialog tabs select checkbox badge textarea label separator breadcrumb dropdown-menu avatar sheet form toast tooltip popover scroll-area skeleton switch radio-group
```

### Step 3: Create Structure (10 minutes)
```bash
# Create all directories
mkdir -p app/\(auth\)/login
mkdir -p app/\(dashboard\)/products/new
mkdir -p app/\(dashboard\)/products/\[id\]/edit
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
```

### Step 4: Environment Variables (2 minutes)
Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=GlowNatura Admin
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### Step 5: Start Building (NOW)
Follow `CURSOR_IMPLEMENTATION_GUIDE.md` from Phase 3 onwards.

**Start with:** Backend Integration (API client, types, API modules)

---

## VALIDATION CHECKPOINTS

After each phase, verify:

**Phase 1-2 (Setup):**
- [ ] `npm run dev` starts without errors

**Phase 3-4 (Auth):**
- [ ] Can login with backend credentials
- [ ] Token stored in cookies
- [ ] Redirects to dashboard after login

**Phase 5 (Layout):**
- [ ] Sidebar visible with navigation
- [ ] Can navigate between pages
- [ ] Logout button works

**Phase 6 (Dashboard):**
- [ ] Stats load from API
- [ ] Chart displays real data
- [ ] No console errors

**Phase 7-12 (Modules):**
- [ ] Each page loads real data
- [ ] CRUD operations work
- [ ] Forms submit successfully
- [ ] Errors show toast notifications

**Phase 13 (Polish):**
- [ ] `npm run build` succeeds
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Responsive on mobile

---

## EXAMPLE: API Integration

Here's how EVERY API call should look:

```typescript
// lib/api/products.ts
import apiClient from './client'

export const productsApi = {
  getAll: async (params?: any) => {
    return apiClient.get('/api/products', { params })
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
}

// components/products/products-table.tsx
'use client'

import { useEffect, useState } from 'react'
import { productsApi } from '@/lib/api/products'
import { toast } from 'sonner'

export function ProductsTable() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await productsApi.getAll()
      setProducts(response.data)
    } catch (error: any) {
      toast.error(error.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await productsApi.delete(id)
      toast.success('Product deleted')
      fetchProducts() // Refetch
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete')
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <table>
      {products.map(product => (
        <tr key={product._id}>
          <td>{product.name}</td>
          <td>
            <button onClick={() => handleDelete(product._id)}>
              Delete
            </button>
          </td>
        </tr>
      ))}
    </table>
  )
}
```

**THIS is what EVERY component should do:**
1. Import API module
2. Call API on mount
3. Handle loading state
4. Handle errors with toast
5. Update UI with real data

---

## TESTING YOUR WORK

Before marking any phase complete, test:

1. **Does it connect to the backend?**
   - Open Network tab in browser DevTools
   - See API calls being made
   - See responses coming back

2. **Does it handle errors?**
   - Turn off backend server
   - Try an action
   - Should see error toast

3. **Does it show loading states?**
   - Slow down network in DevTools
   - Should see loading indicator

4. **Is the data real?**
   - Change something in the UI
   - Check MongoDB database
   - Should see the change

---

## COMMON MISTAKES TO AVOID

1. **Using mock data instead of API calls**
   ```typescript
   // WRONG
   const products = [
     { id: 1, name: 'Product 1' },
     { id: 2, name: 'Product 2' },
   ]
   
   // RIGHT
   const [products, setProducts] = useState([])
   useEffect(() => {
     productsApi.getAll().then(res => setProducts(res.data))
   }, [])
   ```

2. **Not handling loading states**
   ```typescript
   // WRONG
   return <div>{products.map(...)}</div>
   
   // RIGHT
   if (loading) return <Skeleton />
   return <div>{products.map(...)}</div>
   ```

3. **Not handling errors**
   ```typescript
   // WRONG
   const submit = async () => {
     await api.create(data)
   }
   
   // RIGHT
   const submit = async () => {
     try {
       await api.create(data)
       toast.success('Created!')
     } catch (error) {
       toast.error(error.message)
     }
   }
   ```

4. **Skipping TypeScript types**
   ```typescript
   // WRONG
   const [data, setData] = useState<any>()
   
   // RIGHT
   const [data, setData] = useState<Product[]>()
   ```

---

## YOUR SUCCESS CRITERIA

You've succeeded when:
- [ ] All 8 pages exist and are functional
- [ ] Login works with real backend
- [ ] Dashboard shows real stats from API
- [ ] Products: Can create, read, update, delete
- [ ] Categories: Can create, read, update, delete
- [ ] Reviews: Can approve, reject, delete
- [ ] Orders: Can view, update status
- [ ] Media: Can upload, view, delete
- [ ] Settings: Can update and save
- [ ] `npm run build` succeeds with zero errors
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Responsive design works
- [ ] All forms validate
- [ ] All API calls work
- [ ] Error handling works
- [ ] Loading states work

---

## NEED HELP?

If you're stuck:
1. Check `CURSOR_IMPLEMENTATION_GUIDE.md` for detailed code examples
2. Check `QUICK_BUILD_CHECKLIST.md` for step-by-step tasks
3. Check browser console for errors
4. Check Network tab for failed API calls
5. Verify backend is running on `http://localhost:5000`

---

## START NOW

1. Create the Next.js project
2. Install dependencies
3. Create directory structure
4. Follow `CURSOR_IMPLEMENTATION_GUIDE.md` Phase 3 onwards

**Build a production-ready admin panel that actually works.**

Good luck!

