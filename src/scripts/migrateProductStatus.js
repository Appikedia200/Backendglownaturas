#!/usr/bin/env node
/**
 * Migrate Product Status Values
 * Converts old status values to new enum: ['draft', 'published', 'archived']
 * OLD: active, inactive, draft
 * NEW: published, archived, draft
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../infrastructure/database/mongodb/models/Product');
const logger = require('../config/logger');

async function migrateProductStatus() {
  try {
    console.log('\n🔄 Starting Product Status Migration...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Find all products
    const products = await Product.find().select('name status');
    console.log(`\n📦 Found ${products.length} products`);
    
    if (products.length === 0) {
      console.log('   No products to migrate');
      process.exit(0);
    }
    
    // Count products by status
    const statusCounts = {};
    products.forEach(p => {
      statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
    });
    
    console.log('\n📊 Current Status Distribution:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   - ${status}: ${count} products`);
    });
    
    // Migration mapping
    const statusMapping = {
      'active': 'published',
      'inactive': 'archived',
      'draft': 'draft'
    };
    
    console.log('\n🔄 Migrating...');
    let migrated = 0;
    let unchanged = 0;
    
    for (const product of products) {
      const oldStatus = product.status;
      const newStatus = statusMapping[oldStatus] || oldStatus;
      
      // Only update if status needs to change
      if (oldStatus !== newStatus && !['draft', 'published', 'archived'].includes(oldStatus)) {
        await Product.updateOne(
          { _id: product._id },
          { $set: { status: newStatus } },
          { runValidators: false } // Skip validation temporarily
        );
        console.log(`   ✅ ${product.name}: "${oldStatus}" → "${newStatus}"`);
        migrated++;
      } else {
        unchanged++;
      }
    }
    
    console.log('\n✅ Migration Complete!');
    console.log(`   - Migrated: ${migrated} products`);
    console.log(`   - Unchanged: ${unchanged} products`);
    
    // Verify migration
    console.log('\n🔍 Verifying...');
    const verifyProducts = await Product.find().select('status');
    const newStatusCounts = {};
    verifyProducts.forEach(p => {
      newStatusCounts[p.status] = (newStatusCounts[p.status] || 0) + 1;
    });
    
    console.log('\n📊 New Status Distribution:');
    Object.entries(newStatusCounts).forEach(([status, count]) => {
      console.log(`   - ${status}: ${count} products`);
    });
    
    // Check for invalid statuses
    const invalidStatuses = Object.keys(newStatusCounts).filter(
      s => !['draft', 'published', 'archived'].includes(s)
    );
    
    if (invalidStatuses.length > 0) {
      console.log('\n⚠️  WARNING: Found invalid statuses:', invalidStatuses.join(', '));
    } else {
      console.log('\n✅ All products have valid statuses!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    logger.error('Product status migration failed', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

// Run migration
migrateProductStatus();

