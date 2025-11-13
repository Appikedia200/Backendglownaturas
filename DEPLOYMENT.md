# GlowNaturas Backend Deployment Guide

Complete guide for deploying the GlowNaturas backend to production.

## Pre-Deployment Checklist

- [ ] All features tested locally
- [ ] Environment variables configured
- [ ] Database backup created
- [ ] SSL/TLS certificates ready
- [ ] Domain name configured
- [ ] Email service tested
- [ ] Cloudinary storage tested
- [ ] Performance optimized

---

## Deployment Options

### Option 1: Heroku (Recommended for Quick Deploy)

#### 1. Install Heroku CLI
```bash
npm install -g heroku
```

#### 2. Login to Heroku
```bash
heroku login
```

#### 3. Create Heroku App
```bash
heroku create glownatura-api
```

#### 4. Set Environment Variables
```bash
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI="your_mongodb_uri"
heroku config:set JWT_SECRET="your_jwt_secret"
heroku config:set CLOUDINARY_CLOUD_NAME="your_cloud_name"
heroku config:set CLOUDINARY_API_KEY="your_api_key"
heroku config:set CLOUDINARY_API_SECRET="your_api_secret"
heroku config:set BREVO_SMTP_HOST="smtp-relay.brevo.com"
heroku config:set BREVO_SMTP_PORT=587
heroku config:set BREVO_SMTP_USER="your_smtp_user"
heroku config:set BREVO_SMTP_PASSWORD="your_smtp_password"
heroku config:set FROM_EMAIL="orders@glownaturas.com"
heroku config:set FROM_NAME="GlowNaturas"
heroku config:set FRONTEND_URL="https://glownaturas.com"
heroku config:set ADMIN_URL="https://admin.glownaturas.com"
heroku config:set ADMIN_EMAIL_DOMAIN="glownaturas.com"
```

#### 5. Deploy
```bash
git init
git add .
git commit -m "Initial deployment"
git push heroku main
```

#### 6. Seed Database (First Time Only)
```bash
heroku run npm run seed
```

---

### Option 2: DigitalOcean/Linode VPS

#### 1. Server Setup
```bash
# SSH into your server
ssh root@your_server_ip

# Update system
apt update && apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Install PM2
npm install -g pm2

# Install Nginx
apt install -y nginx

# Install Certbot for SSL
apt install -y certbot python3-certbot-nginx
```

#### 2. Clone Repository
```bash
cd /var/www
git clone your_repository_url glownatura-backend
cd glownatura-backend
npm install --production
```

#### 3. Create Environment File
```bash
nano .env
```

Paste your production environment variables.

#### 4. Setup PM2
```bash
# Start the application
pm2 start src/server.js --name glownatura-api

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

#### 5. Configure Nginx
```bash
nano /etc/nginx/sites-available/glownatura-api
```

```nginx
server {
    listen 80;
    server_name api.glownaturas.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/glownatura-api /etc/nginx/sites-enabled/

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx
```

#### 6. Setup SSL with Let's Encrypt
```bash
certbot --nginx -d api.glownaturas.com
```

---

### Option 3: AWS EC2

#### 1. Launch EC2 Instance
- AMI: Ubuntu Server 22.04 LTS
- Instance Type: t2.small or larger
- Security Group: Allow ports 22, 80, 443

#### 2. Connect and Setup
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip

# Follow same steps as DigitalOcean/Linode (Option 2)
```

#### 3. Configure AWS Security Group
- Inbound Rules:
  - SSH (22) from your IP
  - HTTP (80) from anywhere
  - HTTPS (443) from anywhere

---

### Option 4: Vercel (Serverless)

#### 1. Create vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/server.js"
    }
  ]
}
```

#### 2. Install Vercel CLI
```bash
npm install -g vercel
```

#### 3. Deploy
```bash
vercel
```

#### 4. Set Environment Variables
Use Vercel dashboard to set all environment variables.

**Note:** Vercel has serverless limitations. Consider this for low-traffic APIs only.

---

## Database Configuration

### MongoDB Atlas Production Setup

1. **Create Production Cluster**
   - Go to MongoDB Atlas dashboard
   - Create new cluster or use existing
   - Select appropriate tier (M10 or higher for production)

2. **Configure IP Whitelist**
   - Add your server IP
   - For development: 0.0.0.0/0 (not recommended for production)

3. **Create Database User**
   - Strong password
   - Read/Write permissions

4. **Connection String**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/glownatura?retryWrites=true&w=majority
   ```

5. **Backup Strategy**
   - Enable automated backups in Atlas
   - Set backup retention period (7+ days)

---

## Security Hardening

### 1. Environment Variables
```bash
# Generate new JWT secret for production
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. Helmet Configuration (Already included)
The backend already uses Helmet for security headers.

### 3. Rate Limiting (Optional)
Install and configure express-rate-limit:

```bash
npm install express-rate-limit
```

Add to `src/server.js`:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 4. CORS Configuration
Update allowed origins in `.env`:
```env
FRONTEND_URL=https://glownaturas.com
ADMIN_URL=https://admin.glownaturas.com
```

### 5. HTTPS Only
Ensure all traffic uses HTTPS in production.

---

## Performance Optimization

### 1. Enable Compression
```bash
npm install compression
```

Add to `src/server.js`:
```javascript
const compression = require('compression');
app.use(compression());
```

### 2. Database Indexing
Indexes are already defined in models. Verify in MongoDB:
```javascript
db.products.getIndexes()
db.orders.getIndexes()
```

### 3. Cloudinary Optimization
- Use auto format: `f_auto`
- Use auto quality: `q_auto`
- Enable lazy loading on frontend

### 4. Caching Strategy
Consider adding Redis for:
- Session storage
- API response caching
- Rate limiting data

---

## Monitoring and Logging

### 1. PM2 Monitoring
```bash
# View logs
pm2 logs glownatura-api

# Monitor resources
pm2 monit

# View status
pm2 status
```

### 2. Log Management
Consider services like:
- **Papertrail**
- **Loggly**
- **CloudWatch** (if on AWS)

### 3. Error Tracking
Integrate Sentry for error tracking:

```bash
npm install @sentry/node
```

Add to `src/server.js`:
```javascript
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});

app.use(Sentry.Handlers.errorHandler());
```

### 4. Uptime Monitoring
Use services like:
- **UptimeRobot** (free)
- **Pingdom**
- **StatusCake**

---

## Backup Strategy

### 1. Database Backups
```bash
# Manual MongoDB backup
mongodump --uri="mongodb+srv://..." --out=/backups/

# Automated backups (cron job)
0 2 * * * /usr/bin/mongodump --uri="$MONGODB_URI" --out=/backups/$(date +\%Y\%m\%d)
```

### 2. Media Backups
Cloudinary handles media backups automatically.

### 3. Code Backups
- Push to Git regularly
- Tag releases
- Maintain separate production branch

---

## CI/CD Pipeline (Optional)

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Deploy to Heroku
      uses: akhileshns/heroku-deploy@v3.12.12
      with:
        heroku_api_key: ${{secrets.HEROKU_API_KEY}}
        heroku_app_name: "glownatura-api"
        heroku_email: "your@email.com"
```

---

## Post-Deployment Checklist

- [ ] Verify server is running
- [ ] Test API endpoints
- [ ] Verify database connection
- [ ] Test file uploads (Cloudinary)
- [ ] Test email notifications
- [ ] Verify SSL certificate
- [ ] Check CORS settings
- [ ] Monitor server resources
- [ ] Setup automated backups
- [ ] Configure monitoring/alerts
- [ ] Update DNS records
- [ ] Test from frontend
- [ ] Load testing
- [ ] Security audit

---

## Maintenance

### Regular Tasks

**Daily:**
- Monitor error logs
- Check server resources
- Review API usage

**Weekly:**
- Review security logs
- Check database size
- Monitor slow queries

**Monthly:**
- Update dependencies
- Review and rotate logs
- Security audit
- Performance review

### Updates

```bash
# Update dependencies
npm update

# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

---

## Rollback Procedure

### If deployment fails:

#### PM2 (VPS)
```bash
pm2 stop glownatura-api
git checkout previous-commit
npm install
pm2 restart glownatura-api
```

#### Heroku
```bash
heroku releases
heroku rollback v42
```

---

## Support and Troubleshooting

### Common Issues

**Issue: Cannot connect to MongoDB**
- Check IP whitelist in MongoDB Atlas
- Verify connection string
- Check network connectivity

**Issue: Email not sending**
- Verify Brevo credentials
- Check email service status
- Review SMTP settings

**Issue: High CPU usage**
- Check for infinite loops
- Review database queries
- Monitor slow endpoints

**Issue: Out of memory**
- Increase server RAM
- Check for memory leaks
- Optimize database queries

---

## Production Environment Variables Template

```env
NODE_ENV=production
PORT=5000

MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_secure_production_jwt_secret
JWT_EXPIRE=30d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=your_smtp_user
BREVO_SMTP_PASSWORD=your_smtp_password
FROM_EMAIL=orders@glownaturas.com
FROM_NAME=GlowNaturas

FRONTEND_URL=https://glownaturas.com
ADMIN_URL=https://admin.glownaturas.com
ADMIN_EMAIL_DOMAIN=glownaturas.com

# Optional: Monitoring
SENTRY_DSN=your_sentry_dsn
```

---

## Cost Estimates

### Low Traffic (< 10k requests/month)
- Heroku Hobby: $7/month
- MongoDB Atlas M0: Free
- Cloudinary Free: Free
- **Total: ~$7/month**

### Medium Traffic (< 100k requests/month)
- DigitalOcean Droplet: $12/month
- MongoDB Atlas M10: $60/month
- Cloudinary Plus: $89/month
- **Total: ~$161/month**

### High Traffic (> 1M requests/month)
- AWS EC2 t3.medium: $30/month
- MongoDB Atlas M30: $235/month
- Cloudinary Advanced: $249/month
- Load Balancer: $15/month
- **Total: ~$529/month**

---

## Final Notes

- Always test in staging before production
- Keep documentation updated
- Monitor costs regularly
- Have a disaster recovery plan
- Maintain separate development/staging/production environments

For deployment assistance: admin@glownaturas.com

