# Environment Variables Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/glownatura

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-change-this
JWT_EXPIRE=7d

# Email Configuration (Brevo/Sendinblue)
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=your-brevo-email@example.com
BREVO_SMTP_PASSWORD=your-brevo-smtp-password
FROM_EMAIL=noreply@glownatura.com
FROM_NAME=GlowNaturas

# Company Configuration
COMPANY_EMAIL_DOMAIN=glownatura.com

# URLs
FRONTEND_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001

# Bank Details (for order emails)
BANK_NAME=First Bank Nigeria
ACCOUNT_NUMBER=1234567890

# WhatsApp
WHATSAPP_NUMBER=+2348012345678

# Store Information
STORE_EMAIL=orders@glownatura.com

# Security Configuration (Optional - Defaults in config/security.config.js)
MAX_LOGIN_ATTEMPTS=5
ACCOUNT_LOCK_HOURS=2
BCRYPT_ROUNDS=12
```

## Required Variables

The following environment variables are **required** for the application to start:

- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret key (minimum 32 characters)
- `BREVO_SMTP_HOST` - Email SMTP host
- `BREVO_SMTP_USER` - Email SMTP username
- `BREVO_SMTP_PASSWORD` - Email SMTP password
- `FROM_EMAIL` - Sender email address
- `FROM_NAME` - Sender name
- `ADMIN_URL` - Admin frontend URL
- `FRONTEND_URL` - Customer frontend URL
- `COMPANY_EMAIL_DOMAIN` - Company email domain for admin registration

## Optional Variables

The following variables have defaults defined in `src/config/security.config.js`:

- `MAX_LOGIN_ATTEMPTS` - Maximum failed login attempts before account lock (default: 5)
- `ACCOUNT_LOCK_HOURS` - Hours to lock account after max attempts (default: 2)
- `BCRYPT_ROUNDS` - Bcrypt hashing rounds (default: 12)
- `JWT_EXPIRE` - JWT token expiration (default: 7d)

## Security Notes

1. **JWT_SECRET** must be at least 32 characters long
2. Never commit your `.env` file to version control
3. Use strong, unique values for all secrets in production
4. Rotate secrets regularly in production environments


