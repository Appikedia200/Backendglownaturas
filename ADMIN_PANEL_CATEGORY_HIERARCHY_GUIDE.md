# 🎯 **ADMIN PANEL: Hierarchical Category Management**

## **✅ BACKEND IS READY!**

The backend now supports hierarchical categories (Parent > Child relationships).

**Deployed:** https://backendglownaturas.onrender.com  
**New Field:** `parentCategory` (MongoDB ObjectId or null)

---

## **📊 HOW IT WORKS:**

```
PARENT CATEGORIES (parentCategory: null)
├── Face
│   ├── Cleansers (parentCategory: Face._id)
│   ├── Serums (parentCategory: Face._id)
│   ├── Moisturizers (parentCategory: Face._id)
│   └── Sunscreen (parentCategory: Face._id)
├── Body
│   ├── Body Lotion (parentCategory: Body._id)
│   └── Body Wash (parentCategory: Body._id)
└── Jewelry
    ├── Glasses (parentCategory: Jewelry._id)
    └── Watches (parentCategory: Jewelry._id)
```

---

## **🔧 ADMIN PANEL CHANGES REQUIRED:**

### **STEP 1: Update Category Entity**

**File:** `src/core/entities/category.entity.ts`

**ADD this field:**

```typescript
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentCategory?: string | null; // ✅ ADD THIS
  displayOrder: number;
  isActive: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}
```

---

### **STEP 2: Update Categories Page UI**

**File:** `src/app/(dashboard)/categories/page.tsx`

#### **2.1: Update formData state**

**FIND (around line 38):**
```typescript
const [formData, setFormData] = useState({
  name: '',
  slug: '',
  description: '',
  displayOrder: 1,
})
```

**REPLACE WITH:**
```typescript
const [formData, setFormData] = useState({
  name: '',
  slug: '',
  description: '',
  displayOrder: 1,
  parentCategory: null as string | null, // ✅ ADD THIS
})
```

---

#### **2.2: Update handleOpenDialog function**

**FIND (around line 50):**
```typescript
const handleOpenDialog = (category?: Category) => {
  if (category) {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      displayOrder: category.displayOrder,
    })
  } else {
    setEditingCategory(null)
    setFormData({
      name: '',
      slug: '',
      description: '',
      displayOrder: categories.length + 1,
    })
  }
  setDialogOpen(true)
}
```

**REPLACE WITH:**
```typescript
const handleOpenDialog = (category?: Category) => {
  if (category) {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      displayOrder: category.displayOrder,
      parentCategory: category.parentCategory || null, // ✅ ADD THIS
    })
  } else {
    setEditingCategory(null)
    setFormData({
      name: '',
      slug: '',
      description: '',
      displayOrder: categories.length + 1,
      parentCategory: null, // ✅ ADD THIS
    })
  }
  setDialogOpen(true)
}
```

---

#### **2.3: Update handleCloseDialog function**

**FIND (around line 71):**
```typescript
const handleCloseDialog = () => {
  setDialogOpen(false)
  setEditingCategory(null)
  setFormData({
    name: '',
    slug: '',
    description: '',
    displayOrder: 1,
  })
}
```

**REPLACE WITH:**
```typescript
const handleCloseDialog = () => {
  setDialogOpen(false)
  setEditingCategory(null)
  setFormData({
    name: '',
    slug: '',
    description: '',
    displayOrder: 1,
    parentCategory: null, // ✅ ADD THIS
  })
}
```

---

#### **2.4: Update handleSubmit function**

**FIND (around line 82):**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setSubmitting(true)

  try {
    // ✅ Prepare data - remove empty slug (let backend auto-generate)
    const dataToSend = {
      name: formData.name,
      description: formData.description || undefined,
      displayOrder: formData.displayOrder,
      ...(formData.slug ? { slug: formData.slug } : {}), // Only include slug if provided
    }
```

**REPLACE WITH:**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setSubmitting(true)

  try {
    // ✅ Prepare data - remove empty slug (let backend auto-generate)
    const dataToSend = {
      name: formData.name,
      description: formData.description || undefined,
      displayOrder: formData.displayOrder,
      parentCategory: formData.parentCategory || null, // ✅ ADD THIS
      ...(formData.slug ? { slug: formData.slug } : {}), // Only include slug if provided
    }
```

---

#### **2.5: ADD Parent Category Dropdown to Form**

**FIND the form (around line 229), AFTER the "Slug" input field:**

```typescript
<div className="space-y-2">
  <Label htmlFor="slug">Slug (auto-generated if empty)</Label>
  <Input
    id="slug"
    value={formData.slug}
    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
    placeholder="serums (auto-generated from name)"
  />
  <p className="text-xs text-muted-foreground">
    Leave empty to auto-generate from category name
  </p>
</div>
```

**ADD THIS DROPDOWN AFTER IT:**

```typescript
{/* ✅ NEW: Parent Category Selection */}
<div className="space-y-2">
  <Label htmlFor="parentCategory">Parent Category</Label>
  <select
    id="parentCategory"
    value={formData.parentCategory || ''}
    onChange={(e) => setFormData({ ...formData, parentCategory: e.target.value || null })}
    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
  >
    <option value="">None (Root Category)</option>
    {categories
      .filter(cat => !cat.parentCategory) // Only show root categories as options
      .map(cat => (
        <option key={cat._id} value={cat._id}>
          {cat.name}
        </option>
      ))}
  </select>
  <p className="text-xs text-muted-foreground">
    Select a parent category to create a subcategory
  </p>
</div>
```

---

#### **2.6: Update Table Display to Show Hierarchy**

**FIND the table rows (around line 183):**

```typescript
<TableBody>
  {filteredCategories.map((category) => (
    <TableRow key={category._id}>
      <TableCell className="font-medium">{category.name}</TableCell>
      <TableCell className="text-muted-foreground">{category.slug}</TableCell>
```

**REPLACE WITH:**

```typescript
<TableBody>
  {filteredCategories.map((category) => {
    const parentCat = categories.find(c => c._id === category.parentCategory)
    return (
      <TableRow key={category._id}>
        <TableCell className="font-medium">
          {category.parentCategory && '└─ '}
          {category.name}
          {parentCat && (
            <span className="text-xs text-muted-foreground ml-2">
              (child of {parentCat.name})
            </span>
          )}
        </TableCell>
        <TableCell className="text-muted-foreground">{category.slug}</TableCell>
```

---

## **📸 VISUAL EXAMPLE:**

### **Before:**
```
┌────────────────────────────────────────┐
│ Name          │ Slug          │ Order  │
├────────────────────────────────────────┤
│ Cleansers     │ cleansers     │ 1      │
│ Serums        │ serums        │ 2      │
│ Face          │ face          │ 3      │
└────────────────────────────────────────┘
```

### **After:**
```
┌─────────────────────────────────────────────────────┐
│ Name                        │ Slug       │ Order    │
├─────────────────────────────────────────────────────┤
│ Face                        │ face       │ 1        │
│ └─ Cleansers (child of Face)│ cleansers  │ 2        │
│ └─ Serums (child of Face)   │ serums     │ 3        │
│ Body                        │ body       │ 4        │
│ └─ Body Lotion (child...)   │ body-lotion│ 5        │
└─────────────────────────────────────────────────────┘
```

---

## **🧪 TESTING:**

### **Test 1: Create Parent Category**

1. Click "Add Category"
2. Name: "Face"
3. Parent Category: **None (Root Category)**
4. Click "Create"

**Expected:** Category created with `parentCategory: null`

---

### **Test 2: Create Child Category**

1. Click "Add Category"
2. Name: "Cleansers"
3. Parent Category: **Face** (select from dropdown)
4. Click "Create"

**Expected:** 
- Category created with `parentCategory: <Face._id>`
- Table shows: `└─ Cleansers (child of Face)`

---

### **Test 3: Edit Category to Change Parent**

1. Click "Edit" on "Cleansers"
2. Change Parent Category to: **Body**
3. Click "Update"

**Expected:** Cleansers now shows as child of Body

---

### **Test 4: Remove Parent (Make Root)**

1. Click "Edit" on "Cleansers"
2. Change Parent Category to: **None (Root Category)**
3. Click "Update"

**Expected:** Cleansers becomes a root category

---

## **✅ CHECKLIST:**

**Backend (✅ DONE):**
- [x] Add `parentCategory` field to Category model
- [x] Update product filtering for hierarchical categories
- [x] Add validation for `parentCategory` field
- [x] Run migration to create parent categories
- [x] Deploy to production

**Admin Panel (📋 TODO):**
- [ ] Update `category.entity.ts` with `parentCategory` field
- [ ] Update `formData` state to include `parentCategory`
- [ ] Update `handleOpenDialog` to populate `parentCategory`
- [ ] Update `handleCloseDialog` to reset `parentCategory`
- [ ] Update `handleSubmit` to send `parentCategory`
- [ ] Add Parent Category dropdown to form
- [ ] Update table to display hierarchy
- [ ] Test: Create parent category
- [ ] Test: Create child category
- [ ] Test: Edit category parent
- [ ] Test: Remove parent (make root)

---

## **🚨 IMPORTANT NOTES:**

### **1. Prevent Circular References:**

Don't allow a category to be its own parent!

```typescript
<select
  id="parentCategory"
  value={formData.parentCategory || ''}
  onChange={(e) => setFormData({ ...formData, parentCategory: e.target.value || null })}
>
  <option value="">None (Root Category)</option>
  {categories
    .filter(cat => !cat.parentCategory && cat._id !== editingCategory?._id) // ✅ Exclude self
    .map(cat => (
      <option key={cat._id} value={cat._id}>
        {cat.name}
      </option>
    ))}
</select>
```

---

### **2. Deleting Parent Categories:**

When deleting a parent category, you have 2 options:

**Option A:** Prevent deletion if it has children
```typescript
const handleDelete = async (id: string, name: string) => {
  const hasChildren = categories.some(cat => cat.parentCategory === id)
  if (hasChildren) {
    toast.error('Cannot delete category with subcategories. Remove subcategories first.')
    return
  }
  // ... proceed with deletion
}
```

**Option B:** Auto-convert children to root categories (recommended)
- Backend automatically sets `parentCategory: null` for orphaned categories

---

### **3. Product Creation:**

When creating products, admins should select the **most specific category**:

**Good:** Product → "Cleansers" (child category)  
**Bad:** Product → "Face" (parent category)

Parent categories are for **filtering/navigation** only!

---

## **📞 BACKEND API EXAMPLES:**

### **Create Root Category:**
```bash
POST /api/categories
{
  "name": "Face",
  "description": "All face care products",
  "parentCategory": null
}
```

### **Create Child Category:**
```bash
POST /api/categories
{
  "name": "Cleansers",
  "description": "Face cleansers",
  "parentCategory": "674a1b2c3d4e5f6g7h8i9j0k" // Face._id
}
```

### **Get All Categories (With Hierarchy):**
```bash
GET /api/categories

Response:
{
  "success": true,
  "data": {
    "categories": [
      {
        "_id": "674a...",
        "name": "Face",
        "slug": "face",
        "parentCategory": null,
        "productCount": 0
      },
      {
        "_id": "674b...",
        "name": "Cleansers",
        "slug": "cleansers",
        "parentCategory": "674a...", // Face._id
        "productCount": 13
      }
    ]
  }
}
```

---

## **🎯 SUMMARY:**

**What Changed:**
- Backend now supports `parentCategory` field
- Categories can be organized in 2 levels: Parent → Child
- Frontend filtering works automatically (Face shows all Face subcategories)

**What Admin Needs To Do:**
1. Update Admin Panel UI to add "Parent Category" dropdown
2. Display hierarchy in category table
3. Test creating parent and child categories

**Time Estimate:** 30-45 minutes for Admin Panel changes

---

**Questions?** Backend is deployed and ready! Admin Panel just needs the UI updates above! 🚀


