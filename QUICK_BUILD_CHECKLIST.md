# GLOWNATURA ADMIN - QUICK BUILD CHECKLIST

Use this as your step-by-step guide. Check off each item as you complete it.

---

## SETUP (Complete First)

```bash
# 1. Create project
npx create-next-app@latest glownatura-admin --typescript --tailwind --app --use-npm --no-src

# 2. Install dependencies
cd glownatura-admin
npm install axios js-cookie react-hook-form @hookform/resolvers zod lucide-react sonner recharts
npm install -D @types/js-cookie

# 3. Install shadcn
npx shadcn@latest init
npx shadcn@latest add button input card table dialog tabs select checkbox badge textarea label separator breadcrumb dropdown-menu avatar sheet form toast tooltip popover scroll-area skeleton switch radio-group
```

---

## BUILD ORDER (Do in This Exact Order)

### STEP 1: Foundation (90 minutes)
- [ ] Create all folders (auth, dashboard pages, components, lib)
- [ ] Create `.env.local` with API_URL
- [ ] Create `lib/types/models.ts` (all interfaces from backend)
- [ ] Create `lib/types/api.ts` (ApiResponse, PaginatedResponse)
- [ ] Create `lib/api/client.ts` (axios with interceptors)
- [ ] Create all API modules (auth, products, categories, reviews, orders, media, settings, dashboard)
- [ ] Test API client connects to backend

**VALIDATION:** Run `npm run dev` - should start without errors

---

### STEP 2: Authentication (60 minutes)
- [ ] Create `lib/context/auth-context.tsx` (useAuth hook)
- [ ] Create `middleware.ts` (route protection)
- [ ] Update `app/layout.tsx` (wrap with AuthProvider, add Toaster)
- [ ] Create `app/(auth)/login/page.tsx` (login form)
- [ ] Update `app/globals.css` (add color variables)
- [ ] Test login with real backend credentials

**VALIDATION:** Login should work and redirect to dashboard

---

### STEP 3: Layout (60 minutes)
- [ ] Create `components/layout/admin-sidebar.tsx` (navigation menu)
- [ ] Create `components/layout/admin-header.tsx` (breadcrumbs, user menu)
- [ ] Create `app/(dashboard)/layout.tsx` (combine sidebar + header)
- [ ] Test navigation between pages
- [ ] Test logout button

**VALIDATION:** Should see sidebar and header, can navigate and logout

---

### STEP 4: Dashboard Page (90 minutes)
- [ ] Create `lib/hooks/use-dashboard.ts` (fetch stats from API)
- [ ] Create `components/dashboard/stats-cards.tsx` (4 stat cards)
- [ ] Create `components/dashboard/sales-chart.tsx` (recharts line chart)
- [ ] Create `components/dashboard/recent-activity.tsx` (recent orders table)
- [ ] Create `app/(dashboard)/page.tsx` (combine all components)
- [ ] Add loading skeletons

**VALIDATION:** Dashboard loads real data from backend

---

### STEP 5: Products - List (90 minutes)
- [ ] Create `lib/hooks/use-products.ts` (fetch products from API)
- [ ] Create `components/products/products-table.tsx` (data table)
- [ ] Create `components/products/product-filters.tsx` (search, category, status)
- [ ] Create `app/(dashboard)/products/page.tsx` (combine table + filters)
- [ ] Add pagination controls
- [ ] Add edit/delete buttons (functional)

**VALIDATION:** Products table shows real data, filters work, pagination works

---

### STEP 6: Products - Create/Edit (120 minutes)
- [ ] Create `lib/utils/validation.ts` (Zod schema for product)
- [ ] Create `components/products/product-form/index.tsx` (main form with tabs)
- [ ] Create `components/products/product-form/basic-info.tsx`
- [ ] Create `components/products/product-form/pricing.tsx`
- [ ] Create `components/products/product-form/inventory.tsx`
- [ ] Create `components/products/product-form/images.tsx` (with upload)
- [ ] Create `components/products/product-form/seo.tsx`
- [ ] Create `components/products/product-form/status.tsx`
- [ ] Create `app/(dashboard)/products/new/page.tsx` (create form)
- [ ] Create `app/(dashboard)/products/[id]/edit/page.tsx` (edit form)
- [ ] Connect form submit to API (create/update)
- [ ] Add SKU generation button
- [ ] Add image upload to Cloudinary

**VALIDATION:** Can create new product, edit existing product, upload images

---

### STEP 7: Categories (60 minutes)
- [ ] Create `lib/hooks/use-categories.ts`
- [ ] Create `components/categories/categories-table.tsx`
- [ ] Create `components/categories/category-dialog.tsx` (create/edit form)
- [ ] Create `app/(dashboard)/categories/page.tsx`
- [ ] Connect to API (create, update, delete)

**VALIDATION:** Can create, edit, delete categories

---

### STEP 8: Reviews (60 minutes)
- [ ] Create `lib/hooks/use-reviews.ts`
- [ ] Create `components/reviews/review-card.tsx`
- [ ] Create `components/reviews/reviews-grid.tsx` (with tabs)
- [ ] Create `app/(dashboard)/reviews/page.tsx`
- [ ] Add approve/reject/delete buttons (connect to API)

**VALIDATION:** Can approve, reject, delete reviews

---

### STEP 9: Orders - List (60 minutes)
- [ ] Create `lib/hooks/use-orders.ts`
- [ ] Create `components/orders/order-status-badge.tsx`
- [ ] Create `components/orders/orders-table.tsx` (with filters)
- [ ] Create `app/(dashboard)/orders/page.tsx`
- [ ] Add export button (connect to API)

**VALIDATION:** Orders table shows real data, filters work, export works

---

### STEP 10: Orders - Details (90 minutes)
- [ ] Create `app/(dashboard)/orders/[id]/page.tsx`
- [ ] Fetch order by ID
- [ ] Display customer info, items, payment, shipping
- [ ] Add "Confirm Payment" button (connect to API)
- [ ] Add "Update Status" dropdown (connect to API)
- [ ] Add "Cancel Order" button (connect to API)
- [ ] Add "Add Note" form (connect to API)
- [ ] Display order timeline

**VALIDATION:** Can view order details, update status, confirm payment, cancel order

---

### STEP 11: Media (90 minutes)
- [ ] Create `lib/hooks/use-media.ts`
- [ ] Create `components/media/upload-zone.tsx` (drag & drop)
- [ ] Create `components/media/media-card.tsx`
- [ ] Create `components/media/media-grid.tsx`
- [ ] Create `app/(dashboard)/media/page.tsx`
- [ ] Connect upload to Cloudinary via API
- [ ] Add delete functionality

**VALIDATION:** Can upload images, view media library, delete images

---

### STEP 12: Settings (90 minutes)
- [ ] Create `lib/hooks/use-settings.ts`
- [ ] Create `components/settings/store-settings.tsx`
- [ ] Create `components/settings/whatsapp-settings.tsx`
- [ ] Create `components/settings/email-templates.tsx`
- [ ] Create `components/settings/social-media.tsx`
- [ ] Create `app/(dashboard)/settings/page.tsx` (with tabs)
- [ ] Connect all forms to API

**VALIDATION:** Can update all settings, changes save to backend

---

### STEP 13: Polish (60 minutes)
- [ ] Add loading skeletons to all pages
- [ ] Add error boundaries
- [ ] Add empty states (when no data)
- [ ] Add confirmation dialogs for delete actions
- [ ] Test all toast notifications
- [ ] Test responsive design (mobile, tablet, desktop)
- [ ] Fix any TypeScript errors
- [ ] Fix any build errors

**VALIDATION:** `npm run build` succeeds with no errors

---

## TESTING CHECKLIST

### Authentication
- [ ] Can login with valid credentials
- [ ] Cannot login with invalid credentials
- [ ] Redirects to /login when not authenticated
- [ ] Can logout successfully
- [ ] Token persists after page refresh

### Products
- [ ] Products list loads real data
- [ ] Can filter by category
- [ ] Can filter by status
- [ ] Can search products
- [ ] Pagination works
- [ ] Can create new product
- [ ] Can edit existing product
- [ ] Can delete product
- [ ] Can upload product images
- [ ] SKU generation works

### Categories
- [ ] Categories list loads
- [ ] Can create category
- [ ] Can edit category
- [ ] Can delete category
- [ ] Can reorder categories

### Reviews
- [ ] Reviews list loads
- [ ] Can filter by status (all, pending, approved, rejected)
- [ ] Can approve review
- [ ] Can reject review
- [ ] Can delete review

### Orders
- [ ] Orders list loads
- [ ] Can filter by status
- [ ] Can search orders
- [ ] Can view order details
- [ ] Can confirm payment
- [ ] Can update order status
- [ ] Can cancel order
- [ ] Can add order notes
- [ ] Can export orders

### Media
- [ ] Can upload images
- [ ] Can view media library
- [ ] Can delete images
- [ ] Can copy image URL

### Settings
- [ ] Can update store info
- [ ] Can update WhatsApp settings
- [ ] Can update social media links
- [ ] Changes save to backend

### UI/UX
- [ ] Loading states show during API calls
- [ ] Error messages display on failures
- [ ] Success toasts show after actions
- [ ] Form validation works
- [ ] Responsive on mobile
- [ ] Responsive on tablet
- [ ] Dark mode toggle works (if implemented)

---

## COMMON ISSUES & FIXES

### Issue: "Cannot find module '@/components/...'"
**Fix:** Check `tsconfig.json` has correct path mapping

### Issue: "API calls return 401 Unauthorized"
**Fix:** Check JWT token is being sent in Authorization header

### Issue: "CORS error when calling API"
**Fix:** Backend CORS middleware must allow frontend origin

### Issue: "Images not uploading"
**Fix:** Check API endpoint, ensure FormData is sent correctly

### Issue: "Build fails with TypeScript errors"
**Fix:** Fix all type errors, ensure all interfaces are defined

### Issue: "Page is blank after login"
**Fix:** Check browser console for errors, verify API responses

---

## FINAL CHECKS BEFORE DELIVERY

- [ ] Run `npm run build` - must succeed
- [ ] Run `npm start` - app must start
- [ ] Test all pages - no console errors
- [ ] Test all forms - must submit to API
- [ ] Test all CRUD operations - must work
- [ ] Check mobile responsiveness
- [ ] Check all loading states
- [ ] Check all error messages
- [ ] Review code - no `any` types, no console.logs
- [ ] Test with real backend API

---

**REMEMBER:** This is NOT a mockup. Every button, every form, every table MUST connect to the real backend API and be fully functional.

