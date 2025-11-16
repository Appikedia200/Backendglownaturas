# Customer Frontend Implementation Guide

**Target Application:** E-commerce Website / Customer-Facing Store
**Authentication:** NOT Required (Guest/Public Access)
**Base URL:** `/api`

---

## Table of Contents
1. [API Setup](#api-setup)
2. [Customer Frontend Routes](#customer-frontend-routes)
3. [API Implementation Examples](#api-implementation-examples)
4. [Shopping Cart Management](#shopping-cart-management)
5. [Best Practices](#best-practices)

---

## API Setup

### Create API Helper Function

```javascript
// utils/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const customerApi = async (endpoint, options = {}) => {
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    }
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
```

### Session Management (for Cart)

```javascript
// utils/session.js
export const getSessionId = () => {
  let sessionId = localStorage.getItem('sessionId');

  if (!sessionId) {
    // Generate unique session ID for guest users
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('sessionId', sessionId);
  }

  return sessionId;
};
```

---

## Customer Frontend Routes

### 🛍️ Product Browsing (Public)

#### 1. **Browse All Products**
```javascript
GET /api/products?page=1&limit=12&category=cat123&search=cream&minPrice=10&maxPrice=100&sort=price&order=asc

// Query Parameters (all optional)
{
  page: 1,              // Current page
  limit: 12,            // Products per page
  category: 'cat123',   // Filter by category
  search: 'cream',      // Search term
  minPrice: 10,         // Min price filter
  maxPrice: 100,        // Max price filter
  inStock: true,        // Only in-stock products
  featured: true,       // Only featured products
  sort: 'price' | 'name' | 'createdAt' | 'popularity',
  order: 'asc' | 'desc'
}

// Response
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "prod123",
        "name": "Natural Face Cream",
        "description": "Organic face cream for all skin types",
        "price": 50,
        "compareAtPrice": 70,  // Original price (for discount display)
        "sku": "GN-FC-001",
        "category": {
          "id": "cat123",
          "name": "Face Care",
          "slug": "face-care"
        },
        "images": [
          "https://res.cloudinary.com/.../image1.jpg",
          "https://res.cloudinary.com/.../image2.jpg"
        ],
        "stock": 25,
        "status": "active",
        "featured": true,
        "tags": ["organic", "natural"],
        "averageRating": 4.5,
        "reviewCount": 20
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 12,
      "totalProducts": 50,
      "totalPages": 5
    }
  }
}
```

**Frontend Usage:**
- Product listing page (`/products`)
- Category pages (`/category/face-care`)
- Search results page (`/search?q=cream`)
- Homepage featured products
- Product grid display
- Filters sidebar
- Pagination controls
- Sort dropdown

---

#### 2. **Get Single Product**
```javascript
GET /api/products/:id

// Response
{
  "success": true,
  "data": {
    "id": "prod123",
    "name": "Natural Face Cream",
    "description": "Detailed product description...",
    "price": 50,
    "compareAtPrice": 70,
    "sku": "GN-FC-001",
    "category": {
      "id": "cat123",
      "name": "Face Care",
      "slug": "face-care"
    },
    "images": ["url1", "url2", "url3"],
    "stock": 25,
    "status": "active",
    "featured": true,
    "tags": ["organic", "natural", "vegan"],
    "averageRating": 4.5,
    "reviewCount": 20,
    "seo": {
      "title": "Natural Face Cream - Organic Skincare",
      "description": "Best organic face cream for all skin types",
      "keywords": ["organic", "face cream", "natural skincare"]
    },
    "relatedProducts": [
      {
        "id": "prod124",
        "name": "Face Serum",
        "price": 40,
        "images": ["url"]
      }
    ]
  }
}
```

**Frontend Usage:**
- Product detail page (`/product/:id`)
- Image gallery
- Price display with discount
- Stock availability
- Add to cart button
- Product description
- Related products
- Review section
- SEO meta tags

---

### 📂 Category Browsing (Public)

#### 1. **Get All Categories**
```javascript
GET /api/categories

// Response
{
  "success": true,
  "data": [
    {
      "id": "cat123",
      "name": "Face Care",
      "slug": "face-care",
      "description": "Natural face care products",
      "image": "https://res.cloudinary.com/.../category.jpg",
      "parent": null,
      "order": 1,
      "status": "active",
      "productCount": 25,
      "children": [
        {
          "id": "cat124",
          "name": "Cleansers",
          "slug": "cleansers",
          "productCount": 8
        }
      ]
    }
  ]
}
```

**Frontend Usage:**
- Navigation menu
- Category dropdown
- Homepage category grid
- Sidebar navigation
- Mega menu
- Footer links

---

#### 2. **Get Single Category**
```javascript
GET /api/categories/:id

// Response - Same as category object above
```

**Frontend Usage:**
- Category landing page
- Category banner image
- Category description
- Breadcrumb navigation

---

### 🛒 Shopping Cart (Public - No Auth Required)

#### 1. **Add Item to Cart**
```javascript
POST /api/cart

// Request
{
  "sessionId": "session_123abc",  // From getSessionId()
  "productId": "prod123",
  "quantity": 2
}

// Response
{
  "success": true,
  "data": {
    "sessionId": "session_123abc",
    "items": [
      {
        "id": "item1",
        "product": {
          "id": "prod123",
          "name": "Natural Face Cream",
          "price": 50,
          "images": ["url"],
          "stock": 25
        },
        "quantity": 2,
        "price": 50,
        "total": 100
      }
    ],
    "subtotal": 100,
    "itemCount": 2,
    "updatedAt": "2025-11-16T10:00:00Z"
  }
}
```

**Frontend Usage:**
- "Add to Cart" button click
- Update cart count badge in header
- Show success notification
- Check stock availability first
- Disable button if out of stock

---

#### 2. **Get Cart**
```javascript
GET /api/cart/:sessionId

// Response
{
  "success": true,
  "data": {
    "sessionId": "session_123abc",
    "items": [
      {
        "id": "item1",
        "product": {
          "id": "prod123",
          "name": "Natural Face Cream",
          "price": 50,
          "images": ["url"],
          "stock": 25
        },
        "quantity": 2,
        "price": 50,
        "total": 100
      }
    ],
    "subtotal": 100,
    "itemCount": 2,
    "updatedAt": "2025-11-16T10:00:00Z"
  }
}
```

**Frontend Usage:**
- Cart page (`/cart`)
- Cart dropdown/sidebar
- Cart count badge (itemCount)
- Display cart items
- Calculate totals
- Load on app initialization

---

#### 3. **Update Cart Item Quantity**
```javascript
PUT /api/cart/:sessionId/item/:itemId

// Request
{
  "quantity": 3
}

// Response - Returns updated cart object
```

**Frontend Usage:**
- Quantity selector (+ / - buttons)
- Direct quantity input
- Update subtotal in real-time
- Validate against stock

---

#### 4. **Remove Item from Cart**
```javascript
DELETE /api/cart/:sessionId/item/:itemId

// Response - Returns updated cart object
```

**Frontend Usage:**
- "Remove" button on cart items
- Confirmation modal (optional)
- Update cart count

---

#### 5. **Clear Entire Cart**
```javascript
DELETE /api/cart/:sessionId

// Response
{
  "success": true,
  "message": "Cart cleared"
}
```

**Frontend Usage:**
- "Clear Cart" button
- After successful order (auto-clear)
- Confirmation required

---

### 📝 Order Creation (Public)

#### **Create Order**
```javascript
POST /api/orders

// Request
{
  "customer": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "whatsapp": "+1234567890"  // optional
  },
  "shippingAddress": {
    "street": "123 Main St, Apt 4B",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "items": [
    {
      "productId": "prod123",
      "quantity": 2,
      "price": 50  // Current price at checkout
    }
  ],
  "paymentMethod": "bank_transfer",  // 'bank_transfer' | 'cash_on_delivery' | 'credit_card'
  "specialInstructions": "Please call before delivery"  // optional
}

// Response
{
  "success": true,
  "data": {
    "id": "order123",
    "orderNumber": "ORD-2025-001",
    "customer": { ... },
    "shippingAddress": { ... },
    "items": [ ... ],
    "subtotal": 100,
    "shipping": 10,
    "tax": 5,
    "total": 115,
    "status": "pending",
    "paymentMethod": "bank_transfer",
    "paymentStatus": "pending",
    "paymentInstructions": {
      "bankName": "Example Bank",
      "accountNumber": "123456789",
      "accountName": "GlowNatura LLC"
    },
    "createdAt": "2025-11-16T10:00:00Z",
    "estimatedDelivery": "2025-11-20T00:00:00Z"
  }
}
```

**Frontend Usage:**
- Checkout page (`/checkout`)
- Customer information form
- Shipping address form
- Payment method selection
- Order summary
- Terms & conditions checkbox
- Order confirmation page
- Email confirmation sent automatically
- Clear cart after success
- Display payment instructions

**Important Notes:**
- Rate limited to 10 requests per hour per IP
- Validates stock availability
- Calculates shipping and tax automatically
- Generates unique order number
- Sends confirmation email to customer
- Reduces product stock automatically

---

### ⭐ Product Reviews (Public)

#### 1. **Get Product Reviews**
```javascript
GET /api/reviews?product=prod123&page=1&limit=10&rating=5

// Query Parameters
{
  product: 'prod123',   // Required - filter by product
  page: 1,
  limit: 10,
  rating: 5,            // Optional - filter by rating
  sort: 'createdAt' | 'helpful',
  order: 'desc'
}

// Response
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "rev123",
        "product": "prod123",
        "customer": {
          "name": "Jane Smith",
          "email": "j***@example.com"  // Partially hidden
        },
        "rating": 5,
        "title": "Amazing product!",
        "comment": "This cream is fantastic. My skin feels so smooth...",
        "status": "approved",
        "verified": true,  // Verified purchase
        "helpful": 10,     // Helpful count
        "createdAt": "2025-11-16T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalReviews": 20,
      "totalPages": 2
    },
    "summary": {
      "averageRating": 4.5,
      "totalReviews": 20,
      "ratingDistribution": {
        "5": 12,
        "4": 5,
        "3": 2,
        "2": 1,
        "1": 0
      }
    }
  }
}
```

**Frontend Usage:**
- Product detail page reviews section
- Star rating display
- Review list
- Rating distribution chart
- "Most helpful" sorting
- Pagination

---

#### 2. **Submit Product Review**
```javascript
POST /api/reviews

// Request
{
  "productId": "prod123",
  "customer": {
    "name": "Jane Smith",
    "email": "jane@example.com"
  },
  "rating": 5,           // 1-5 stars (required)
  "title": "Amazing product!",
  "comment": "This cream is fantastic. My skin feels so smooth and hydrated."
}

// Response
{
  "success": true,
  "data": {
    "id": "rev123",
    "status": "pending",  // Awaits admin approval
    "message": "Thank you for your review! It will be published after moderation."
  }
}
```

**Frontend Usage:**
- Review submission form
- Star rating input
- Title and comment fields
- Email for verification
- "Write a Review" button
- Success message after submission
- Pending moderation notice

**Important Notes:**
- Rate limited to 5 requests per hour
- Review status is "pending" by default
- Requires admin approval before showing
- Email validation required
- Duplicate review prevention (same email + product)

---

### ⚙️ Store Settings (Public - Read Only)

#### **Get Store Settings**
```javascript
GET /api/settings

// Response
{
  "success": true,
  "data": {
    "storeInfo": {
      "name": "GlowNatura",
      "tagline": "Natural Beauty Products",
      "description": "Premium natural skincare products",
      "logo": "https://res.cloudinary.com/.../logo.png",
      "favicon": "https://res.cloudinary.com/.../favicon.ico",
      "email": "info@glownatura.com",
      "phone": "+1234567890",
      "address": {
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "country": "USA"
      }
    },
    "whatsapp": {
      "enabled": true,
      "number": "+1234567890",
      "message": "Hello! I'm interested in your products."
    },
    "socialMedia": {
      "facebook": "https://facebook.com/glownatura",
      "instagram": "https://instagram.com/glownatura",
      "twitter": "https://twitter.com/glownatura",
      "youtube": "",
      "tiktok": ""
    },
    "shipping": {
      "freeShippingThreshold": 50,
      "defaultShippingCost": 10
    },
    "tax": {
      "enabled": true,
      "rate": 8.5
    },
    "currency": {
      "code": "USD",
      "symbol": "$"
    }
  }
}
```

**Frontend Usage:**
- Site-wide configuration
- Header logo
- Footer contact info
- WhatsApp chat widget
- Social media links
- Shipping calculator
- Tax calculator
- Currency display
- Meta tags (logo, site name)
- Contact page information

**Load Once:**
- Fetch on app initialization
- Store in global state (Redux/Context)
- Use throughout the app

---

## API Implementation Examples

### Example 1: Product Listing Page

```javascript
// pages/Products.jsx
import { useEffect, useState } from 'react';
import { customerApi } from '../utils/api';
import { useSearchParams } from 'react-router-dom';

export const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const page = searchParams.get('page') || 1;
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sort = searchParams.get('sort') || 'createdAt';

  useEffect(() => {
    fetchProducts();
  }, [page, category, search, minPrice, maxPrice, sort]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 12,
        sort,
        order: 'desc',
        ...(category && { category }),
        ...(search && { search }),
        ...(minPrice && { minPrice }),
        ...(maxPrice && { maxPrice }),
      });

      const data = await customerApi(`/products?${params}`);
      setProducts(data.data.products);
      setPagination(data.data.pagination);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  return (
    <div className="products-page">
      {/* Filters */}
      <aside className="filters">
        <h3>Filters</h3>

        <div className="filter-group">
          <label>Search</label>
          <input
            type="text"
            value={search}
            onChange={(e) => updateFilter('search', e.target.value)}
            placeholder="Search products..."
          />
        </div>

        <div className="filter-group">
          <label>Price Range</label>
          <input
            type="number"
            value={minPrice}
            onChange={(e) => updateFilter('minPrice', e.target.value)}
            placeholder="Min"
          />
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => updateFilter('maxPrice', e.target.value)}
            placeholder="Max"
          />
        </div>

        <div className="filter-group">
          <label>Sort By</label>
          <select value={sort} onChange={(e) => updateFilter('sort', e.target.value)}>
            <option value="createdAt">Newest</option>
            <option value="price">Price: Low to High</option>
            <option value="name">Name: A-Z</option>
          </select>
        </div>
      </aside>

      {/* Product Grid */}
      <main className="products-grid">
        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            <div className="grid">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {pagination && (
              <div className="pagination">
                <button
                  disabled={pagination.page === 1}
                  onClick={() => updateFilter('page', pagination.page - 1)}
                >
                  Previous
                </button>
                <span>Page {pagination.page} of {pagination.totalPages}</span>
                <button
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => updateFilter('page', pagination.page + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

// ProductCard Component
const ProductCard = ({ product }) => {
  return (
    <div className="product-card">
      <a href={`/product/${product.id}`}>
        <img src={product.images[0]} alt={product.name} />
        {product.compareAtPrice && (
          <span className="sale-badge">Sale</span>
        )}
        <h3>{product.name}</h3>
        <div className="rating">
          ⭐ {product.averageRating} ({product.reviewCount})
        </div>
        <div className="price">
          <span className="current-price">${product.price}</span>
          {product.compareAtPrice && (
            <span className="original-price">${product.compareAtPrice}</span>
          )}
        </div>
        {product.stock === 0 && <span className="out-of-stock">Out of Stock</span>}
      </a>
    </div>
  );
};
```

---

### Example 2: Product Detail Page

```javascript
// pages/ProductDetail.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { customerApi } from '../utils/api';
import { getSessionId } from '../utils/session';

export const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const data = await customerApi(`/products/${id}`);
      setProduct(data.data);
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (quantity > product.stock) {
      alert('Not enough stock available');
      return;
    }

    setAddingToCart(true);
    try {
      const sessionId = getSessionId();
      await customerApi('/cart', {
        method: 'POST',
        body: JSON.stringify({
          sessionId,
          productId: product.id,
          quantity
        })
      });

      alert('Added to cart!');
      // Update cart count in header (use state management)
    } catch (error) {
      alert('Failed to add to cart: ' + error.message);
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <div className="product-detail">
      {/* Image Gallery */}
      <div className="image-gallery">
        <img src={product.images[0]} alt={product.name} />
        <div className="thumbnails">
          {product.images.map((img, i) => (
            <img key={i} src={img} alt={`${product.name} ${i + 1}`} />
          ))}
        </div>
      </div>

      {/* Product Info */}
      <div className="product-info">
        <h1>{product.name}</h1>

        <div className="rating">
          ⭐ {product.averageRating} ({product.reviewCount} reviews)
        </div>

        <div className="price">
          <span className="current">${product.price}</span>
          {product.compareAtPrice && (
            <>
              <span className="original">${product.compareAtPrice}</span>
              <span className="discount">
                Save {Math.round((1 - product.price / product.compareAtPrice) * 100)}%
              </span>
            </>
          )}
        </div>

        <p className="description">{product.description}</p>

        <div className="stock-info">
          {product.stock > 0 ? (
            <span className="in-stock">In Stock ({product.stock} available)</span>
          ) : (
            <span className="out-of-stock">Out of Stock</span>
          )}
        </div>

        {/* Quantity Selector */}
        {product.stock > 0 && (
          <div className="quantity-selector">
            <label>Quantity:</label>
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              max={product.stock}
            />
            <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>+</button>
          </div>
        )}

        {/* Add to Cart Button */}
        <button
          className="add-to-cart"
          onClick={handleAddToCart}
          disabled={product.stock === 0 || addingToCart}
        >
          {addingToCart ? 'Adding...' : 'Add to Cart'}
        </button>

        {/* Product Details */}
        <div className="product-meta">
          <p><strong>SKU:</strong> {product.sku}</p>
          <p><strong>Category:</strong> {product.category.name}</p>
          <p>
            <strong>Tags:</strong> {product.tags.join(', ')}
          </p>
        </div>
      </div>

      {/* Related Products */}
      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <section className="related-products">
          <h2>You May Also Like</h2>
          <div className="grid">
            {product.relatedProducts.map(related => (
              <ProductCard key={related.id} product={related} />
            ))}
          </div>
        </section>
      )}

      {/* Reviews Section */}
      <ProductReviews productId={product.id} />
    </div>
  );
};
```

---

### Example 3: Shopping Cart

```javascript
// pages/Cart.jsx
import { useEffect, useState } from 'react';
import { customerApi } from '../utils/api';
import { getSessionId } from '../utils/session';
import { useNavigate } from 'react-router-dom';

export const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const sessionId = getSessionId();
      const data = await customerApi(`/cart/${sessionId}`);
      setCart(data.data);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      setCart({ items: [], subtotal: 0, itemCount: 0 });
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      const sessionId = getSessionId();
      const data = await customerApi(`/cart/${sessionId}/item/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity: newQuantity })
      });
      setCart(data.data);
    } catch (error) {
      alert('Failed to update quantity: ' + error.message);
    }
  };

  const removeItem = async (itemId) => {
    if (!confirm('Remove this item from cart?')) return;

    try {
      const sessionId = getSessionId();
      const data = await customerApi(`/cart/${sessionId}/item/${itemId}`, {
        method: 'DELETE'
      });
      setCart(data.data);
    } catch (error) {
      alert('Failed to remove item: ' + error.message);
    }
  };

  const clearCart = async () => {
    if (!confirm('Clear entire cart?')) return;

    try {
      const sessionId = getSessionId();
      await customerApi(`/cart/${sessionId}`, { method: 'DELETE' });
      setCart({ items: [], subtotal: 0, itemCount: 0 });
    } catch (error) {
      alert('Failed to clear cart: ' + error.message);
    }
  };

  if (loading) return <div>Loading cart...</div>;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="empty-cart">
        <h2>Your cart is empty</h2>
        <button onClick={() => navigate('/products')}>Continue Shopping</button>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Shopping Cart ({cart.itemCount} items)</h1>

      <div className="cart-items">
        {cart.items.map(item => (
          <div key={item.id} className="cart-item">
            <img src={item.product.images[0]} alt={item.product.name} />
            <div className="item-details">
              <h3>{item.product.name}</h3>
              <p className="price">${item.price}</p>
              {item.quantity > item.product.stock && (
                <p className="error">Only {item.product.stock} available</p>
              )}
            </div>

            <div className="quantity-controls">
              <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
              <span>{item.quantity}</span>
              <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
            </div>

            <div className="item-total">
              ${item.total}
            </div>

            <button onClick={() => removeItem(item.id)} className="remove-btn">
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <h3>Order Summary</h3>
        <div className="summary-line">
          <span>Subtotal:</span>
          <span>${cart.subtotal}</span>
        </div>
        <div className="summary-line">
          <span>Shipping:</span>
          <span>Calculated at checkout</span>
        </div>
        <div className="summary-total">
          <span>Total:</span>
          <span>${cart.subtotal}</span>
        </div>

        <button className="checkout-btn" onClick={() => navigate('/checkout')}>
          Proceed to Checkout
        </button>

        <button className="clear-cart-btn" onClick={clearCart}>
          Clear Cart
        </button>
      </div>
    </div>
  );
};
```

---

### Example 4: Checkout & Order Creation

```javascript
// pages/Checkout.jsx
import { useState, useEffect } from 'react';
import { customerApi } from '../utils/api';
import { getSessionId } from '../utils/session';
import { useNavigate } from 'react-router-dom';

export const Checkout = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customer: {
      name: '',
      email: '',
      phone: '',
      whatsapp: ''
    },
    shippingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA'
    },
    paymentMethod: 'bank_transfer',
    specialInstructions: ''
  });

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const sessionId = getSessionId();
      const data = await customerApi(`/cart/${sessionId}`);
      setCart(data.data);

      if (data.data.items.length === 0) {
        alert('Your cart is empty');
        navigate('/products');
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    }
  };

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare order data
      const orderData = {
        customer: formData.customer,
        shippingAddress: formData.shippingAddress,
        items: cart.items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.price
        })),
        paymentMethod: formData.paymentMethod,
        specialInstructions: formData.specialInstructions
      };

      const data = await customerApi('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData)
      });

      // Clear cart
      const sessionId = getSessionId();
      await customerApi(`/cart/${sessionId}`, { method: 'DELETE' });

      // Redirect to order confirmation
      navigate(`/order-confirmation/${data.data.orderNumber}`);
    } catch (error) {
      alert('Failed to create order: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!cart) return <div>Loading...</div>;

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>

      <form onSubmit={handleSubmit}>
        {/* Customer Information */}
        <section className="checkout-section">
          <h2>Customer Information</h2>
          <input
            type="text"
            placeholder="Full Name"
            value={formData.customer.name}
            onChange={(e) => handleInputChange('customer', 'name', e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.customer.email}
            onChange={(e) => handleInputChange('customer', 'email', e.target.value)}
            required
          />
          <input
            type="tel"
            placeholder="Phone"
            value={formData.customer.phone}
            onChange={(e) => handleInputChange('customer', 'phone', e.target.value)}
            required
          />
          <input
            type="tel"
            placeholder="WhatsApp (optional)"
            value={formData.customer.whatsapp}
            onChange={(e) => handleInputChange('customer', 'whatsapp', e.target.value)}
          />
        </section>

        {/* Shipping Address */}
        <section className="checkout-section">
          <h2>Shipping Address</h2>
          <input
            type="text"
            placeholder="Street Address"
            value={formData.shippingAddress.street}
            onChange={(e) => handleInputChange('shippingAddress', 'street', e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="City"
            value={formData.shippingAddress.city}
            onChange={(e) => handleInputChange('shippingAddress', 'city', e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="State"
            value={formData.shippingAddress.state}
            onChange={(e) => handleInputChange('shippingAddress', 'state', e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Zip Code"
            value={formData.shippingAddress.zipCode}
            onChange={(e) => handleInputChange('shippingAddress', 'zipCode', e.target.value)}
            required
          />
        </section>

        {/* Payment Method */}
        <section className="checkout-section">
          <h2>Payment Method</h2>
          <select
            value={formData.paymentMethod}
            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
          >
            <option value="bank_transfer">Bank Transfer</option>
            <option value="cash_on_delivery">Cash on Delivery</option>
          </select>
        </section>

        {/* Order Summary */}
        <section className="checkout-section order-summary">
          <h2>Order Summary</h2>
          {cart.items.map(item => (
            <div key={item.id} className="order-item">
              <span>{item.product.name} x {item.quantity}</span>
              <span>${item.total}</span>
            </div>
          ))}
          <div className="order-total">
            <strong>Total: ${cart.subtotal}</strong>
          </div>
        </section>

        <button type="submit" disabled={loading} className="place-order-btn">
          {loading ? 'Processing...' : 'Place Order'}
        </button>
      </form>
    </div>
  );
};
```

---

### Example 5: Product Reviews Display

```javascript
// components/ProductReviews.jsx
import { useEffect, useState } from 'react';
import { customerApi } from '../utils/api';

export const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await customerApi(`/reviews?product=${productId}&limit=10`);
      setReviews(data.data.reviews);
      setSummary(data.data.summary);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="product-reviews">
      <h2>Customer Reviews</h2>

      {summary && (
        <div className="review-summary">
          <div className="average-rating">
            <span className="rating-number">{summary.averageRating}</span>
            <div className="stars">⭐⭐⭐⭐⭐</div>
            <span className="review-count">
              Based on {summary.totalReviews} reviews
            </span>
          </div>

          <div className="rating-distribution">
            {[5, 4, 3, 2, 1].map(rating => (
              <div key={rating} className="rating-bar">
                <span>{rating} ⭐</span>
                <div className="bar">
                  <div
                    className="fill"
                    style={{
                      width: `${(summary.ratingDistribution[rating] / summary.totalReviews) * 100}%`
                    }}
                  />
                </div>
                <span>{summary.ratingDistribution[rating]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button onClick={() => setShowReviewForm(!showReviewForm)}>
        Write a Review
      </button>

      {showReviewForm && (
        <ReviewForm productId={productId} onSubmit={() => {
          setShowReviewForm(false);
          fetchReviews();
        }} />
      )}

      <div className="reviews-list">
        {reviews.map(review => (
          <div key={review.id} className="review">
            <div className="review-header">
              <div className="stars">
                {'⭐'.repeat(review.rating)}
              </div>
              <span className="review-date">
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h4>{review.title}</h4>
            <p>{review.comment}</p>
            <div className="review-footer">
              <span className="reviewer-name">{review.customer.name}</span>
              {review.verified && <span className="verified-badge">✓ Verified Purchase</span>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// Review Submission Form
const ReviewForm = ({ productId, onSubmit }) => {
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    comment: '',
    customerName: '',
    customerEmail: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await customerApi('/reviews', {
        method: 'POST',
        body: JSON.stringify({
          productId,
          customer: {
            name: formData.customerName,
            email: formData.customerEmail
          },
          rating: formData.rating,
          title: formData.title,
          comment: formData.comment
        })
      });

      alert('Thank you for your review! It will be published after moderation.');
      onSubmit();
    } catch (error) {
      alert('Failed to submit review: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <h3>Write a Review</h3>

      <div className="form-group">
        <label>Rating</label>
        <select
          value={formData.rating}
          onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
          required
        >
          <option value="5">5 Stars - Excellent</option>
          <option value="4">4 Stars - Good</option>
          <option value="3">3 Stars - Average</option>
          <option value="2">2 Stars - Poor</option>
          <option value="1">1 Star - Terrible</option>
        </select>
      </div>

      <input
        type="text"
        placeholder="Review Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
      />

      <textarea
        placeholder="Your Review"
        value={formData.comment}
        onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
        required
        rows="5"
      />

      <input
        type="text"
        placeholder="Your Name"
        value={formData.customerName}
        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
        required
      />

      <input
        type="email"
        placeholder="Your Email"
        value={formData.customerEmail}
        onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
        required
      />

      <button type="submit" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
};
```

---

## Shopping Cart Management

### Best Practices for Cart State

```javascript
// context/CartContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { customerApi } from '../utils/api';
import { getSessionId } from '../utils/session';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const sessionId = getSessionId();
      const data = await customerApi(`/cart/${sessionId}`);
      setCart(data.data);
    } catch (error) {
      console.error('Failed to load cart:', error);
      setCart({ items: [], subtotal: 0, itemCount: 0 });
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      const sessionId = getSessionId();
      const data = await customerApi('/cart', {
        method: 'POST',
        body: JSON.stringify({ sessionId, productId, quantity })
      });
      setCart(data.data);
      return true;
    } catch (error) {
      console.error('Failed to add to cart:', error);
      return false;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const sessionId = getSessionId();
      const data = await customerApi(`/cart/${sessionId}/item/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity })
      });
      setCart(data.data);
      return true;
    } catch (error) {
      console.error('Failed to update quantity:', error);
      return false;
    }
  };

  const removeItem = async (itemId) => {
    try {
      const sessionId = getSessionId();
      const data = await customerApi(`/cart/${sessionId}/item/${itemId}`, {
        method: 'DELETE'
      });
      setCart(data.data);
      return true;
    } catch (error) {
      console.error('Failed to remove item:', error);
      return false;
    }
  };

  const clearCart = async () => {
    try {
      const sessionId = getSessionId();
      await customerApi(`/cart/${sessionId}`, { method: 'DELETE' });
      setCart({ items: [], subtotal: 0, itemCount: 0 });
      return true;
    } catch (error) {
      console.error('Failed to clear cart:', error);
      return false;
    }
  };

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
      refreshCart: loadCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
```

**Usage in Components:**
```javascript
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart, cart } = useCart();

  const handleAddToCart = async () => {
    const success = await addToCart(product.id, 1);
    if (success) {
      alert('Added to cart!');
    }
  };

  return (
    <div>
      <h3>{product.name}</h3>
      <button onClick={handleAddToCart}>Add to Cart</button>
      <span className="cart-count">{cart?.itemCount || 0}</span>
    </div>
  );
};
```

---

## Best Practices

### 1. SEO Optimization

```javascript
// Use product data for SEO meta tags
import { Helmet } from 'react-helmet';

const ProductDetail = ({ product }) => (
  <>
    <Helmet>
      <title>{product.seo.title || product.name} | GlowNatura</title>
      <meta name="description" content={product.seo.description || product.description} />
      <meta name="keywords" content={product.seo.keywords.join(', ')} />
      <meta property="og:title" content={product.name} />
      <meta property="og:description" content={product.description} />
      <meta property="og:image" content={product.images[0]} />
      <meta property="og:price:amount" content={product.price} />
    </Helmet>
    {/* Rest of component */}
  </>
);
```

### 2. Image Optimization

```javascript
// Use Cloudinary transformations for responsive images
const getOptimizedImage = (url, width = 800) => {
  // Cloudinary URL transformation
  return url.replace('/upload/', `/upload/w_${width},q_auto,f_auto/`);
};

<img
  src={getOptimizedImage(product.images[0], 400)}
  srcSet={`
    ${getOptimizedImage(product.images[0], 400)} 400w,
    ${getOptimizedImage(product.images[0], 800)} 800w,
    ${getOptimizedImage(product.images[0], 1200)} 1200w
  `}
  alt={product.name}
/>
```

### 3. Loading States

```javascript
// Always show skeleton/loading states
const ProductSkeleton = () => (
  <div className="skeleton">
    <div className="skeleton-image" />
    <div className="skeleton-text" />
    <div className="skeleton-text short" />
  </div>
);

{loading ? <ProductSkeleton /> : <ProductCard product={product} />}
```

### 4. Error Boundaries

```javascript
// Wrap components in error boundaries
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <h2>Something went wrong. Please refresh the page.</h2>;
    }
    return this.props.children;
  }
}
```

### 5. Rate Limiting Awareness

```javascript
// Handle rate limit errors gracefully
try {
  await customerApi('/reviews', { method: 'POST', body: ... });
} catch (error) {
  if (error.message.includes('Too many requests')) {
    alert('You have submitted too many reviews. Please try again later.');
  } else {
    alert('Failed to submit review: ' + error.message);
  }
}
```

---

## Customer Frontend Pages Checklist

- [ ] **Homepage** - `/`
  - [ ] Featured products
  - [ ] Category showcase
  - [ ] Hero banner
  - [ ] Newsletter signup
- [ ] **Product Listing** - `/products`
- [ ] **Category Page** - `/category/:slug`
- [ ] **Search Results** - `/search?q=query`
- [ ] **Product Detail** - `/product/:id`
- [ ] **Shopping Cart** - `/cart`
- [ ] **Checkout** - `/checkout`
- [ ] **Order Confirmation** - `/order-confirmation/:orderNumber`
- [ ] **About Us** - `/about`
- [ ] **Contact** - `/contact`
- [ ] **Terms & Conditions** - `/terms`
- [ ] **Privacy Policy** - `/privacy`

---

**Last Updated:** 2025-11-16
**For:** Customer Frontend Developers
**Backend API Version:** 1.0.0
