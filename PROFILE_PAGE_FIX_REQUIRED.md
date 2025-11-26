# 🔧 Profile Page Fix - Admin Panel

**Date**: November 26, 2025  
**Backend Version**: 5.2.1  
**Status**: ✅ **BACKEND FIXED - FRONTEND NEEDS IMPLEMENTATION**

---

## 🎯 **ISSUE IDENTIFIED**

### **Current Problems**:
1. ❌ **Profile page doesn't exist** (`/profile` → 404)
2. ❌ **Profile menu item doesn't navigate** (line 96-99 in admin-header)
3. ❌ **Change password errors** (now fixed on backend!)

### **Console Error**:
```
Change password error: { status: undefined, data: undefined, message: {...} }
```

**Root Cause**: Profile page missing + backend use case was missing (now fixed!)

---

## ✅ **BACKEND STATUS - FIXED & DEPLOYED**

### **Change Password Endpoint**: ✅ **WORKING**

**Endpoint**: `POST /api/auth/change-password`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword123"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "message": "Password changed successfully"
  }
}
```

**Error Responses**:

```json
// Missing fields (400)
{
  "success": false,
  "error": "Current password and new password are required"
}

// Password too short (400)
{
  "success": false,
  "error": "New password must be at least 8 characters long"
}

// Same password (400)
{
  "success": false,
  "error": "New password must be different from current password"
}

// Wrong current password (401)
{
  "success": false,
  "error": "Current password is incorrect"
}
```

---

## 🔧 **REQUIRED FRONTEND FIXES**

### **Fix 1: Add Profile Navigation**

**File**: `src/presentation/components/layout/admin-header/index.tsx`

**Line 96-99**, change from:
```typescript
<DropdownMenuItem>
  <User className="mr-2 h-4 w-4" />
  <span>Profile</span>
</DropdownMenuItem>
```

To:
```typescript
<DropdownMenuItem onClick={() => router.push('/profile')}>
  <User className="mr-2 h-4 w-4" />
  <span>Profile</span>
</DropdownMenuItem>
```

---

### **Fix 2: Create Profile Page**

**File**: `src/app/(dashboard)/profile/page.tsx` (NEW FILE)

```typescript
'use client'

import { useState } from 'react'
import { useAuth } from '@/presentation/context/auth.context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Label } from '@/presentation/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/presentation/components/ui/avatar'
import { Badge } from '@/presentation/components/ui/badge'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { AlertCircle, Check, Lock, Mail, User, Calendar } from 'lucide-react'
import { Alert, AlertDescription } from '@/presentation/components/ui/alert'
import { toast } from 'sonner'
import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/presentation/components/ui/dialog'
import { httpClient } from '@/infrastructure/api/client'
import { API_ENDPOINTS } from '@/infrastructure/config/api.config'

export default function ProfilePage() {
  const { user, loading: userLoading } = useAuth()
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordError, setPasswordError] = useState('')

  const handleChangePassword = async () => {
    setPasswordError('')

    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('All fields are required')
      return
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      setPasswordError('New password must be different from current password')
      return
    }

    setChangingPassword(true)

    try {
      const response: any = await httpClient.post(API_ENDPOINTS.auth.changePassword, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })

      if (response.success) {
        toast.success('Password changed successfully')
        setChangePasswordOpen(false)
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        })
      } else {
        setPasswordError(response.error || 'Failed to change password')
      }
    } catch (error: any) {
      console.error('Change password error:', error)
      setPasswordError(error.error || error.message || 'Failed to change password')
    } finally {
      setChangingPassword(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (userLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load profile. Please try refreshing the page.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Your personal information and account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label className="text-xs text-muted-foreground">Email Address</Label>
                  <p className="text-sm font-medium">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label className="text-xs text-muted-foreground">Role</Label>
                  <p className="text-sm font-medium capitalize">{user.role || 'Admin'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label className="text-xs text-muted-foreground">Member Since</Label>
                  <p className="text-sm font-medium">
                    {user.createdAt ? format(new Date(user.createdAt), 'MMMM dd, yyyy') : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label className="text-xs text-muted-foreground">Email Verified</Label>
                  <div className="mt-1">
                    {user.emailVerified ? (
                      <Badge variant="success" className="text-xs">
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">
                        Not Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label className="text-xs text-muted-foreground">Account Status</Label>
                  <div className="mt-1">
                    {user.active !== false ? (
                      <Badge className="text-xs bg-green-500">Active</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Inactive
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Card */}
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Manage your password and security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Lock className="mr-2 h-4 w-4" />
                  Change Password
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                  <DialogDescription>
                    Enter your current password and choose a new password. Your new password must be at least 8
                    characters long.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  {passwordError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{passwordError}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))
                      }
                      disabled={changingPassword}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                      disabled={changingPassword}
                    />
                    <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                      }
                      disabled={changingPassword}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setChangePasswordOpen(false)
                      setPasswordData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: '',
                      })
                      setPasswordError('')
                    }}
                    disabled={changingPassword}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleChangePassword} disabled={changingPassword}>
                    {changingPassword ? 'Changing...' : 'Change Password'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Alert>
              <Lock className="h-4 w-4" />
              <AlertDescription>
                Your password is encrypted and secure. We recommend changing your password regularly.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

---

### **Fix 3: Update Constants** (if needed)

**File**: `src/infrastructure/config/constants.ts`

Add to `ROUTES` object if not exists:
```typescript
export const ROUTES = {
  // ... existing routes
  PROFILE: '/profile',
}
```

---

## ✅ **TESTING CHECKLIST**

### **Profile Page**:
- [ ] Navigate to `/profile` - Page loads
- [ ] User name displays correctly
- [ ] User email displays correctly
- [ ] User role displays
- [ ] Member since date displays
- [ ] Email verified badge correct
- [ ] Account status badge correct

### **Change Password**:
- [ ] Click "Change Password" - Dialog opens
- [ ] All fields empty → Shows validation error
- [ ] Password < 8 chars → Shows error
- [ ] Passwords don't match → Shows error
- [ ] Wrong current password → Shows "Current password is incorrect"
- [ ] Correct passwords → Success toast, dialog closes
- [ ] After success → Can login with new password

### **Navigation**:
- [ ] Click Profile in header menu → Navigates to /profile
- [ ] Profile page loads with all user data

---

## 🎉 **SUMMARY**

### **Backend**: ✅ **FIXED & DEPLOYED**
- Change password use case created
- Proper validation (8+ chars, different from current)
- Secure bcrypt hashing
- Clear error messages
- Deployed to production

### **Frontend**: ⏳ **READY TO IMPLEMENT**
1. Add navigation to Profile menu item (1 line change)
2. Create `/profile` page (copy code above)
3. Test all functionality

**Estimated Time**: 30 minutes

---

**The backend is ready. Profile page implementation will give users a complete account management experience!** ✅


