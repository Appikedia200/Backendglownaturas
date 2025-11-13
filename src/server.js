require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDatabase = require('./config/database');
const corsMiddleware = require('./middleware/cors');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const categoriesRoutes = require('./routes/categories');
const mediaRoutes = require('./routes/media');
const reviewsRoutes = require('./routes/reviews');
const ordersRoutes = require('./routes/orders');
const dashboardRoutes = require('./routes/dashboard');
const settingsRoutes = require('./routes/settings');

const app = express();

connectDatabase();

app.use(helmet());
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'GlowNaturas API - Complete Production System',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      categories: '/api/categories',
      media: '/api/media',
      reviews: '/api/reviews',
      orders: '/api/orders',
      dashboard: '/api/dashboard',
      settings: '/api/settings'
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settings', settingsRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('\n========================================');
  console.log(`GlowNaturas API - Production Ready`);
  console.log(`Port: ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log('========================================\n');
});

process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  process.exit(1);
});

