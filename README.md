# GlowNaturas Backend API

Complete, production-ready e-commerce backend for GlowNaturas skincare products. Built with Node.js, Express, and MongoDB.

## Features

- **Complete Admin Management**: Registration, email verification, authentication, password reset
- **Product Management**: Full CRUD operations with advanced filtering, search, and inventory tracking
- **Category Management**: Organize products with drag-and-drop ordering
- **Media Library**: Cloudinary integration for image uploads and management
- **Review System**: Customer reviews with admin approval workflow
- **Order Management**: Complete order processing with status tracking and email notifications
- **Dashboard Analytics**: Real-time statistics and sales data
- **Settings Management**: Store info, WhatsApp integration, email templates, social media
- **Security**: JWT authentication, bcrypt password hashing, Helmet security headers
- **Email Notifications**: Automated emails via Brevo SMTP

## Tech Stack

- **Runtime**: Node.js v18+
- **Framework**: Express.js v4.18+
- **Database**: MongoDB + Mongoose v8+
- **Authentication**: JWT + Bcrypt
- **File Storage**: Cloudinary
- **Email**: Nodemailer + Brevo SMTP
- **Validation**: Express Validator
- **Security**: Helmet, CORS
- **Logging**: Morgan

## Prerequisites

Before you begin, ensure you have:

- Node.js v18.0.0 or higher
- npm v9.0.0 or higher
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account
- Brevo SMTP account

## Installation

1. **Clone or navigate to the project directory**

```bash
cd "Backend Championsupermarket"
```

2. **Install dependencies**

```bash
npm install
```

3. **Environment Variables**

Create a `.env` file in the root directory with the following variables:

```env
# Server
NODE_ENV=development
PORT=5000

# MongoDB Atlas
MONGODB_URI=your_mongodb_connection_string

# JWT Secret (Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET=your_64_character_hex_secret
JWT_EXPIRE=30d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# Brevo SMTP
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=your_brevo_user
BREVO_SMTP_PASSWORD=your_brevo_password
FROM_EMAIL=orders@glownaturas.com
FROM_NAME=GlowNaturas

# URLs
FRONTEND_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001

# Domain
ADMIN_EMAIL_DOMAIN=glownaturas.com
```

4. **Seed the database**

```bash
npm run seed
```

This will create:
- Sample categories (Cleansers, Serums, Moisturizers, etc.)
- Sample products
- Superadmin account (admin@glownaturas.com / Admin123456)
- Default settings

5. **Start the development server**

```bash
npm run dev
```

The API will be running at `http://localhost:5000`

## Project Structure

```
backend/
├── src/
│   ├── models/           # Mongoose models
│   │   ├── Admin.js
│   │   ├── Product.js
│   │   ├── Category.js
│   │   ├── Media.js
│   │   ├── Review.js
│   │   ├── Order.js
│   │   └── Settings.js
│   ├── routes/           # Express routes
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── categories.js
│   │   ├── media.js
│   │   ├── reviews.js
│   │   ├── orders.js
│   │   ├── dashboard.js
│   │   └── settings.js
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── config/          # Configuration files
│   ├── utils/           # Utility functions
│   ├── seed.js          # Database seeder
│   └── server.js        # Application entry point
├── uploads/             # Temporary file uploads
├── .env                 # Environment variables
├── .gitignore
├── package.json
└── README.md
```

## API Endpoints

### Authentication (`/api/auth`)

- `POST /register` - Register new admin
- `POST /verify-email` - Verify email with code
- `POST /resend-verification` - Resend verification code
- `POST /login` - Admin login
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password with code
- `GET /me` - Get current admin profile (protected)
- `PUT /update-password` - Update password (protected)
- `GET /admins` - Get all admins (superadmin only)
- `PUT /admins/:id/activate` - Toggle admin status (superadmin only)

### Products (`/api/products`)

- `POST /` - Create product (protected)
- `GET /` - Get all products (supports filtering, search, pagination)
- `GET /generate-sku` - Generate unique SKU (protected)
- `GET /low-stock` - Get low stock products (protected)
- `GET /:id` - Get single product
- `PUT /:id` - Update product (protected)
- `DELETE /:id` - Delete product (protected)
- `PUT /bulk/status` - Bulk update product status (protected)

### Categories (`/api/categories`)

- `POST /` - Create category (protected)
- `GET /` - Get all categories
- `GET /:id` - Get single category
- `PUT /:id` - Update category (protected)
- `DELETE /:id` - Delete category (protected)
- `PUT /reorder` - Reorder categories (protected)

### Media (`/api/media`)

- `POST /` - Upload media file (protected, multipart/form-data)
- `GET /` - Get all media (protected)
- `GET /:id` - Get single media (protected)
- `PUT /:id` - Update media metadata (protected)
- `DELETE /:id` - Delete media (protected)
- `POST /bulk-delete` - Bulk delete media (protected)

### Reviews (`/api/reviews`)

- `POST /` - Create review (public)
- `GET /` - Get all reviews
- `GET /:id` - Get single review
- `PUT /:id/status` - Update review status (protected)
- `DELETE /:id` - Delete review (protected)
- `PUT /bulk/status` - Bulk update review status (protected)

### Orders (`/api/orders`)

- `POST /` - Create order (public)
- `GET /` - Get all orders (protected)
- `GET /:id` - Get single order
- `PUT /:id/status` - Update order status (protected)
- `PUT /:id/payment-status` - Update payment status (protected)
- `PUT /:id/tracking` - Update tracking number (protected)
- `DELETE /:id` - Delete order (protected)

### Dashboard (`/api/dashboard`)

- `GET /stats` - Get dashboard statistics (protected)
- `GET /recent-orders` - Get recent orders (protected)
- `GET /top-products` - Get top selling products (protected)
- `GET /sales-data` - Get sales data by period (protected)

### Settings (`/api/settings`)

- `GET /` - Get all settings
- `PUT /` - Update all settings (protected)
- `PUT /store-info` - Update store info (protected)
- `PUT /whatsapp` - Update WhatsApp settings (protected)
- `PUT /email-templates` - Update email templates (protected)
- `PUT /social-media` - Update social media links (protected)

## Authentication

Protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

Get the token by logging in via `/api/auth/login`

## Error Handling

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

## Success Responses

All successful responses follow this format:

```json
{
  "success": true,
  "data": {...},
  "count": 10,
  "total": 100,
  "page": 1,
  "pages": 10
}
```

## Development Scripts

```bash
# Start development server with nodemon
npm run dev

# Start production server
npm start

# Seed database with sample data
npm run seed
```

## Security Features

- JWT-based authentication
- Password hashing with bcrypt (12 rounds)
- Helmet security headers
- CORS protection
- Email verification for new admins
- Domain-restricted admin emails (@glownaturas.com)
- Request validation with express-validator
- MongoDB injection protection

## Email Notifications

Automated emails are sent for:
- Admin email verification
- Password reset
- Order confirmation
- Order status updates (processing, shipped, delivered)

## File Upload

- Maximum file size: 5MB
- Allowed formats: JPEG, PNG, WebP
- Files are uploaded to Cloudinary
- Temporary files are automatically cleaned up

## Database Models

### Admin
- Email verification with 6-digit codes
- Role-based access (admin, superadmin)
- Password reset functionality
- Last login tracking

### Product
- Full inventory tracking
- SEO optimization fields
- Multiple images support
- Featured products
- Review aggregation
- Search indexing

### Category
- Hierarchical organization
- Display order sorting
- Product count tracking

### Media
- Cloudinary integration
- Metadata (alt, caption, tags)
- Usage tracking

### Review
- Star rating (1-5)
- Admin approval system
- Verified purchase flag
- Automatic rating calculation

### Order
- Auto-generated order IDs
- Status tracking history
- Multiple payment methods
- Shipping calculation
- Email notifications

### Settings
- Store information
- WhatsApp integration
- Email templates
- Social media links

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use a production MongoDB cluster
3. Set secure JWT_SECRET
4. Configure production URLs
5. Enable rate limiting (recommended)
6. Set up SSL/TLS
7. Configure process manager (PM2 recommended)

## Support

For issues or questions, contact: admin@glownaturas.com

## License

MIT License - GlowNaturas 2024

