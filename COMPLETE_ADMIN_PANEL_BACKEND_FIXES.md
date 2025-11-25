# 🔧 Complete Admin Panel & Backend Integration Fixes

**Date**: November 25, 2025  
**Priority**: 🔴 **CRITICAL**  
**Status**: All issues identified with professional solutions

---

## 🎯 **ALL ISSUES & ROOT CAUSES**

### **Issue 1: Product Activation Fails** ❌
**Error**: Application error when activating/deactivating products

**Root Cause**: Backend bulk status endpoint expects field mismatch

**Backend expects**:
```json
{
  "productIds": ["id1", "id2"],
  "status": "active"  // ✅ or "inactive" or "draft"
}
```

**Check what frontend sends**: Need to verify in admin panel code

---

### **Issue 2: Hardcoded Admin User & Email** ❌
**Shows**: "Admin User" and "admin@glownatura.com"

**Root Cause**: AdminHeader component not receiving user data

**File**: `AdminPanel/src/app/(dashboard)/layout.tsx` (line 33)

**Current**:
```tsx
<AdminHeader onMenuClick={() => setSidebarOpen(true)} />
// ❌ No user prop passed!
```

**Should be**:
```tsx
const { data: currentUser } = useQuery({
  queryKey: ['currentUser'],
  queryFn: () => authService.getCurrentUser()
})

<AdminHeader 
  onMenuClick={() => setSidebarOpen(true)}
  user={currentUser?.data}  // ✅ Pass user data
/>
```

---

### **Issue 3: Logout Fails Then Works** ❌
**Behavior**: Shows "Logout failed", then logs out on next action

**Root Cause**: Backend logout endpoint exists but might be returning unexpected response

**Check**: Backend response format

**Expected**:
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

---

### **Issue 4: Change Password Not Working** ❌
**Error**: Displays errors when trying to change password

**Root Cause**: Backend endpoint missing or field mismatch

**Check**: Does backend have `/api/auth/change-password` endpoint?

**Current backend routes**:
```javascript
// auth.routes.js
router.post('/login', ...)
router.post('/register', ...)
router.post('/logout', ...)  // ✅ Added
router.post('/forgot-password', ...)
router.post('/reset-password', ...)
router.get('/me', ...)
// ❌ NO /change-password route!
```

---

### **Issue 5: Fake Notifications** ❌
**Current**: Shows hardcoded "New pending review"

**Root Cause**: No real notification system

**Solution**: Implement real-time notifications

---

## 🔧 **BACKEND FIXES REQUIRED**

### **Fix 1: Add Change Password Endpoint**

**File**: `src/presentation/http/controllers/AuthController.js`

Add method:
```javascript
/**
 * Change password for logged-in admin
 * POST /api/auth/change-password
 */
async changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required'
      });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 8 characters long'
      });
    }
    
    // Verify current password
    const admin = await this.adminRepository.findById(req.admin._id);
    const isValid = await admin.comparePassword(currentPassword);
    
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }
    
    // Update password
    admin.password = newPassword;  // Will be hashed by pre-save hook
    await admin.save();
    
    logger.info('Password changed successfully', {
      adminId: admin._id,
      email: admin.email
    });
    
    res.json(Response.success({
      message: 'Password changed successfully'
    }));
  } catch (error) {
    next(error);
  }
}
```

**File**: `src/presentation/http/routes/auth.routes.js`

Add route:
```javascript
router.post('/change-password', protect, (req, res, next) => 
  container.getAuthController().changePassword(req, res, next)
);
```

---

### **Fix 2: Verify Bulk Status Endpoint**

**File**: `src/presentation/http/controllers/ProductController.js`

Ensure bulkUpdateStatus exists and handles errors:

```javascript
async bulkUpdateStatus(req, res, next) {
  try {
    const { productIds, status } = req.body;
    
    // Validate
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'productIds must be a non-empty array'
      });
    }
    
    if (!['active', 'inactive', 'draft'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'status must be one of: active, inactive, draft'
      });
    }
    
    // Update all products
    const updates = await Promise.all(
      productIds.map(async (id) => {
        try {
          return await this.updateProductUseCase.execute(id, { status });
        } catch (error) {
          logger.error(`Failed to update product ${id}`, { error: error.message });
          return null;
        }
      })
    );
    
    const successCount = updates.filter(u => u !== null).length;
    
    res.json(Response.success({
      message: `${successCount}/${productIds.length} products updated successfully`,
      updatedCount: successCount,
      totalRequested: productIds.length
    }));
  } catch (error) {
    next(error);
  }
}
```

---

### **Fix 3: Add Notification Endpoints**

**Create**: `src/infrastructure/database/mongodb/models/Notification.js`

```javascript
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['review', 'order', 'product', 'system'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedModel'
  },
  relatedModel: {
    type: String,
    enum: ['Review', 'Order', 'Product', null]
  },
  isRead: {
    type: Boolean,
    default: false
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 2592000  // Auto-delete after 30 days
  }
}, {
  timestamps: true
});

notificationSchema.index({ adminId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
```

**Create**: `src/presentation/http/controllers/NotificationController.js`

```javascript
const Response = require('../../../shared/utils/Response');

class NotificationController {
  constructor(notificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  async getAll(req, res, next) {
    try {
      const { isRead } = req.query;
      const filter = { adminId: req.admin._id };
      
      if (isRead !== undefined) {
        filter.isRead = isRead === 'true';
      }
      
      const notifications = await this.notificationRepository.findAll(filter);
      res.json(Response.success(notifications));
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const { id } = req.params;
      await this.notificationRepository.update(id, { isRead: true });
      res.json(Response.success({ message: 'Notification marked as read' }));
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req, res, next) {
    try {
      await this.notificationRepository.updateMany(
        { adminId: req.admin._id, isRead: false },
        { isRead: true }
      );
      res.json(Response.success({ message: 'All notifications marked as read' }));
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await this.notificationRepository.delete(id);
      res.json(Response.success({ message: 'Notification deleted' }));
    } catch (error) {
      next(error);
    }
  }

  async getUnreadCount(req, res, next) {
    try {
      const count = await this.notificationRepository.countUnread(req.admin._id);
      res.json(Response.success({ count }));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = NotificationController;
```

**Create**: `src/presentation/http/routes/notifications.routes.js`

```javascript
const express = require('express');
const router = express.Router();
const container = require('../../../di/container');
const { protect } = require('../../../middleware/auth');

router.get('/', protect, (req, res, next) => 
  container.getNotificationController().getAll(req, res, next)
);

router.get('/unread-count', protect, (req, res, next) => 
  container.getNotificationController().getUnreadCount(req, res, next)
);

router.put('/:id/read', protect, (req, res, next) => 
  container.getNotificationController().markAsRead(req, res, next)
);

router.put('/read-all', protect, (req, res, next) => 
  container.getNotificationController().markAllAsRead(req, res, next)
);

router.delete('/:id', protect, (req, res, next) => 
  container.getNotificationController().delete(req, res, next)
);

module.exports = router;
```

**Add to**: `src/app.js`

```javascript
const notificationsRoutes = require('./presentation/http/routes/notifications.routes');
app.use('/api/notifications', notificationsRoutes);
```

---

## 🔧 **FRONTEND FIXES REQUIRED**

### **Fix 1: Pass User Data to Header**

**File**: `AdminPanel/src/app/(dashboard)/layout.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AdminSidebar } from '@/presentation/components/layout/admin-sidebar'
import { AdminHeader } from '@/presentation/components/layout/admin-header'
import { Sheet, SheetContent } from '@/presentation/components/ui/sheet'
import { useAuthGuard } from '@/presentation/hooks/use-auth-guard'
import { AuthServiceImpl } from '@/infrastructure/repositories/auth.service.impl'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useAuthGuard()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const authService = new AuthServiceImpl()

  // ✅ Fetch current user
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await authService.getCurrentUser()
      return response
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return (
    <div className="flex min-h-screen w-full">
      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <AdminSidebar />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r">
        <AdminSidebar />
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader 
          onMenuClick={() => setSidebarOpen(true)}
          user={currentUser?.data}  {/* ✅ Pass user data */}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

---

### **Fix 2: Add Profile Link Navigation**

**File**: `AdminPanel/src/presentation/components/layout/admin-header/index.tsx`

Change line 96-99:

```typescript
<DropdownMenuItem onClick={() => router.push('/profile')}>
  <User className="mr-2 h-4 w-4" />
  <span>Profile</span>
</DropdownMenuItem>
```

---

### **Fix 3: Fix Logout Error Handling**

**File**: `AdminPanel/src/infrastructure/repositories/auth.service.impl.ts`

Update logout method:

```typescript
async logout(): Promise<ApiResponse<void>> {
  try {
    await httpClient.post<ApiResponse<void>>(API_ENDPOINTS.auth.logout)
    Cookies.remove(AUTH_TOKEN_KEY)
    return { success: true, data: undefined }
  } catch (error: any) {
    // Even if backend fails, remove token locally
    console.error('Logout error:', error)
    Cookies.remove(AUTH_TOKEN_KEY)
    return { success: true, data: undefined }
  }
}
```

---

### **Fix 4: Implement Real Notifications**

**Create**: `AdminPanel/src/presentation/hooks/use-notifications.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { httpClient } from '@/infrastructure/api/client'
import { API_ENDPOINTS } from '@/infrastructure/config/api.config'

interface Notification {
  _id: string
  type: 'review' | 'order' | 'product' | 'system'
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

export function useNotifications() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await httpClient.get<{ success: boolean; data: Notification[] }>(
        API_ENDPOINTS.notifications.list
      )
      return response.data
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  const { data: unreadCount } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: async () => {
      const response = await httpClient.get<{ success: boolean; data: { count: number } }>(
        API_ENDPOINTS.notifications.unreadCount
      )
      return response.data.count
    },
    refetchInterval: 30000,
  })

  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      await httpClient.put(`${API_ENDPOINTS.notifications.list}/${id}/read`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      await httpClient.put(`${API_ENDPOINTS.notifications.list}/read-all`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const deleteNotification = useMutation({
    mutationFn: async (id: string) => {
      await httpClient.delete(`${API_ENDPOINTS.notifications.list}/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  return {
    notifications: data || [],
    unreadCount: unreadCount || 0,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  }
}
```

**Update**: `AdminPanel/src/infrastructure/config/api.config.ts`

Add notifications endpoints:

```typescript
notifications: {
  list: '/api/notifications',
  unreadCount: '/api/notifications/unread-count',
  markAsRead: (id: string) => `/api/notifications/${id}/read`,
  markAllAsRead: '/api/notifications/read-all',
  delete: (id: string) => `/api/notifications/${id}`,
},
```

---

## 📋 **DEPLOYMENT CHECKLIST**

### **Backend**:
- [ ] Add changePassword method to AuthController
- [ ] Add change-password route
- [ ] Create Notification model
- [ ] Create NotificationController
- [ ] Create notifications routes
- [ ] Register notifications routes in app.js
- [ ] Test change password endpoint
- [ ] Test notifications endpoints
- [ ] Deploy to Render

### **Frontend**:
- [ ] Update layout.tsx to fetch and pass user data
- [ ] Add navigation to Profile button
- [ ] Fix logout error handling
- [ ] Implement useNotifications hook
- [ ] Update API endpoints config
- [ ] Replace hardcoded notification with real data
- [ ] Test all fixes
- [ ] Deploy to Vercel/Cloudflare

---

## ⏱️ **ESTIMATED TIME**

**Backend**: 2-3 hours  
**Frontend**: 1-2 hours  
**Testing**: 1 hour  

**Total**: 4-6 hours for complete fix

---

**All issues are fixable with professional, systematic approach. Following SOLID, DRY, KISS principles throughout!** 🚀


