require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Settings = require('./models/Settings');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();
    
    console.log('Starting database seed...\n');
    
    await Admin.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Settings.deleteMany({});
    
    console.log('1. Creating default settings...');
    const settings = await Settings.create({
      singleton: true,
      storeInfo: {
        name: 'GlowNaturas',
        email: 'orders@glownaturas.com',
        phone: '+234 801 234 5678',
        address: '123 Beauty Street, Lagos, Nigeria'
      },
      whatsapp: {
        number: '2348012345678',
        showFloatButton: true,
        floatPosition: 'right',
        welcomeMessage: 'Hi! How can we help you with your skincare needs today?'
      },
      emailTemplates: {
        orderConfirmation: {
          subject: 'Order Confirmation - {{orderId}}',
          body: 'Thank you for your order!'
        },
        orderProcessing: {
          subject: 'Your Order is Being Processed - {{orderId}}',
          body: 'Your order {{orderId}} is now being processed.'
        },
        orderShipped: {
          subject: 'Your Order Has Been Shipped - {{orderId}}',
          body: 'Your order {{orderId}} has been shipped. Tracking: {{trackingNumber}}'
        },
        orderDelivered: {
          subject: 'Your Order Has Been Delivered - {{orderId}}',
          body: 'Your order {{orderId}} has been delivered. Thank you for shopping with us!'
        }
      },
      socialMedia: {
        facebook: 'https://facebook.com/glownaturas',
        instagram: 'https://instagram.com/glownaturas',
        twitter: 'https://twitter.com/glownaturas'
      }
    });
    console.log('Settings created successfully');
    
    console.log('\n2. Creating sample categories...');
    const categories = await Category.create([
      {
        name: 'Cleansers',
        description: 'Gentle cleansers for all skin types',
        displayOrder: 1,
        isActive: true
      },
      {
        name: 'Serums',
        description: 'Concentrated treatment serums',
        displayOrder: 2,
        isActive: true
      },
      {
        name: 'Moisturizers',
        description: 'Hydrating moisturizers and creams',
        displayOrder: 3,
        isActive: true
      },
      {
        name: 'Sunscreen',
        description: 'Sun protection products',
        displayOrder: 4,
        isActive: true
      },
      {
        name: 'Face Masks',
        description: 'Treatment and hydrating masks',
        displayOrder: 5,
        isActive: true
      }
    ]);
    console.log(`${categories.length} categories created`);
    
    console.log('\n3. Creating sample products...');
    const products = await Product.create([
      {
        name: 'Vitamin C Brightening Serum',
        shortDescription: 'Brightens and evens skin tone with powerful vitamin C',
        description: 'Our premium Vitamin C serum contains 15% L-Ascorbic Acid to brighten, even skin tone, and boost collagen production. Suitable for all skin types.',
        price: 8500,
        comparePrice: 12000,
        category: categories[1]._id,
        stock: 50,
        sku: 'GN-SERUM-001',
        trackInventory: true,
        lowStockThreshold: 10,
        keywords: ['vitamin c', 'brightening', 'serum', 'anti-aging'],
        ingredients: ['L-Ascorbic Acid 15%', 'Vitamin E', 'Ferulic Acid', 'Hyaluronic Acid'],
        concerns: ['dark spots', 'dull skin', 'uneven tone', 'fine lines'],
        skinType: ['all', 'dry', 'combination', 'oily'],
        brand: 'GlowNaturas',
        status: 'active',
        featured: {
          isFeatured: true,
          featuredOrder: 1
        }
      },
      {
        name: 'Niacinamide Pore Minimizer',
        shortDescription: 'Minimize pores and control oil with 10% Niacinamide',
        description: 'This powerful serum contains 10% Niacinamide to minimize pores, control oil production, and improve skin texture.',
        price: 7000,
        comparePrice: 9500,
        category: categories[1]._id,
        stock: 75,
        sku: 'GN-SERUM-002',
        trackInventory: true,
        lowStockThreshold: 15,
        keywords: ['niacinamide', 'pore minimizer', 'oil control'],
        ingredients: ['Niacinamide 10%', 'Zinc PCA', 'Hyaluronic Acid'],
        concerns: ['large pores', 'oily skin', 'acne'],
        skinType: ['oily', 'combination'],
        brand: 'GlowNaturas',
        status: 'active',
        featured: {
          isFeatured: true,
          featuredOrder: 2
        }
      },
      {
        name: 'Hyaluronic Acid Hydrating Serum',
        shortDescription: 'Deep hydration with multi-molecular weight HA',
        description: 'Multi-molecular weight Hyaluronic Acid penetrates different skin layers for maximum hydration and plumping effect.',
        price: 6500,
        category: categories[1]._id,
        stock: 100,
        sku: 'GN-SERUM-003',
        trackInventory: true,
        keywords: ['hyaluronic acid', 'hydration', 'plumping'],
        ingredients: ['Hyaluronic Acid Complex', 'Panthenol', 'Glycerin'],
        concerns: ['dehydration', 'fine lines', 'dryness'],
        skinType: ['all', 'dry', 'sensitive'],
        brand: 'GlowNaturas',
        status: 'active'
      },
      {
        name: 'Gentle Foaming Cleanser',
        shortDescription: 'pH-balanced gentle cleanser for daily use',
        description: 'Our gentle foaming cleanser removes impurities without stripping natural oils. Perfect for morning and evening cleanse.',
        price: 4500,
        category: categories[0]._id,
        stock: 120,
        sku: 'GN-CLEAN-001',
        trackInventory: true,
        keywords: ['cleanser', 'gentle', 'foaming', 'daily'],
        ingredients: ['Mild Surfactants', 'Aloe Vera', 'Chamomile Extract'],
        concerns: ['cleansing', 'makeup removal'],
        skinType: ['all', 'sensitive', 'dry'],
        brand: 'GlowNaturas',
        status: 'active'
      },
      {
        name: 'SPF 50 Sunscreen',
        shortDescription: 'Broad spectrum protection with no white cast',
        description: 'Lightweight, broad-spectrum SPF 50 sunscreen that protects against UVA and UVB rays without leaving a white cast.',
        price: 5500,
        category: categories[3]._id,
        stock: 80,
        sku: 'GN-SUN-001',
        trackInventory: true,
        keywords: ['sunscreen', 'spf 50', 'sun protection'],
        ingredients: ['Zinc Oxide', 'Titanium Dioxide', 'Vitamin E'],
        concerns: ['sun damage', 'aging prevention'],
        skinType: ['all', 'oily', 'combination'],
        brand: 'GlowNaturas',
        status: 'active',
        featured: {
          isFeatured: true,
          featuredOrder: 3
        }
      },
      {
        name: 'Hydrating Night Cream',
        shortDescription: 'Rich overnight moisturizer for deep hydration',
        description: 'Intensive overnight cream that deeply moisturizes and repairs skin while you sleep.',
        price: 9000,
        comparePrice: 12500,
        category: categories[2]._id,
        stock: 60,
        sku: 'GN-MOIST-001',
        trackInventory: true,
        keywords: ['night cream', 'moisturizer', 'hydrating', 'repair'],
        ingredients: ['Ceramides', 'Peptides', 'Shea Butter', 'Squalane'],
        concerns: ['dryness', 'aging', 'repair'],
        skinType: ['dry', 'normal'],
        brand: 'GlowNaturas',
        status: 'active'
      }
    ]);
    console.log(`${products.length} products created`);
    
    await Category.findByIdAndUpdate(categories[0]._id, { productCount: 1 });
    await Category.findByIdAndUpdate(categories[1]._id, { productCount: 3 });
    await Category.findByIdAndUpdate(categories[2]._id, { productCount: 1 });
    await Category.findByIdAndUpdate(categories[3]._id, { productCount: 1 });
    
    console.log('\n4. Creating superadmin account...');
    const superadmin = await Admin.create({
      name: 'Super Admin',
      email: 'admin@glownaturas.com',
      password: 'Admin123456',
      role: 'superadmin',
      isActive: true,
      isEmailVerified: true
    });
    console.log('Superadmin created:');
    console.log('  Email: admin@glownaturas.com');
    console.log('  Password: Admin123456');
    console.log('  (Change this password after first login!)');
    
    console.log('\n========================================');
    console.log('Database seeding completed successfully!');
    console.log('========================================');
    console.log('\nSummary:');
    console.log(`- ${categories.length} categories created`);
    console.log(`- ${products.length} products created`);
    console.log('- 1 superadmin account created');
    console.log('- Default settings configured');
    console.log('\nYou can now start the server with: npm run dev');
    console.log('========================================\n');
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();

