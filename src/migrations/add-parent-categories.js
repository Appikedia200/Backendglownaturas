/**
 * Migration Script: Add Parent Categories
 * 
 * This script creates parent categories (Face, Body, Jewelry) and links
 * existing categories as children to enable hierarchical filtering.
 * 
 * Run with: node src/migrations/add-parent-categories.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../infrastructure/database/mongodb/models/Category');
const Product = require('../infrastructure/database/mongodb/models/Product');

const PARENT_CATEGORIES = {
  face: {
    name: 'Face',
    description: 'All face care products',
    displayOrder: 1,
    isActive: true,
    children: ['cleansers', 'serums', 'moisturizers', 'sunscreen', 'face masks', 'toners', 'eye care', 'lip care']
  },
  body: {
    name: 'Body',
    description: 'Bath and body care products',
    displayOrder: 2,
    isActive: true,
    children: ['body lotion', 'body wash', 'body scrub', 'hand cream', 'foot care']
  },
  jewelry: {
    name: 'Jewelry',
    description: 'Fashion and luxury jewelry',
    displayOrder: 3,
    isActive: true,
    children: ['glasses', 'watches', 'necklaces', 'earrings', 'finger rings', 'bracelets']
  }
};

async function migrate() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Step 1: Create parent categories
    console.log('Step 1: Creating parent categories...');
    const parentCategories = {};
    
    for (const [key, data] of Object.entries(PARENT_CATEGORIES)) {
      // Check if parent category already exists
      let parent = await Category.findOne({ slug: key });
      
      if (!parent) {
        parent = await Category.create({
          name: data.name,
          description: data.description,
          displayOrder: data.displayOrder,
          isActive: data.isActive,
          parentCategory: null
        });
        console.log(`   ✅ Created parent category: ${parent.name} (${parent.slug})`);
      } else {
        console.log(`   ℹ️  Parent category already exists: ${parent.name} (${parent.slug})`);
      }
      
      parentCategories[key] = parent;
    }

    // Step 2: Link existing categories as children
    console.log('\nStep 2: Linking existing categories to parents...');
    let linkedCount = 0;
    
    for (const [key, parent] of Object.entries(parentCategories)) {
      const childNames = PARENT_CATEGORIES[key].children;
      
      for (const childName of childNames) {
        // Find category by name (case-insensitive)
        const child = await Category.findOne({ 
          name: { $regex: new RegExp(`^${childName}$`, 'i') } 
        });
        
        if (child && !child.parentCategory) {
          child.parentCategory = parent._id;
          await child.save();
          console.log(`   ✅ Linked "${child.name}" → "${parent.name}"`);
          linkedCount++;
        } else if (child && child.parentCategory) {
          console.log(`   ℹ️  "${child.name}" already has a parent`);
        } else {
          console.log(`   ⚠️  Category "${childName}" not found (will be linked when created)`);
        }
      }
    }

    // Step 3: Update product counts for all categories
    console.log('\nStep 3: Updating product counts...');
    const allCategories = await Category.find();
    
    for (const category of allCategories) {
      const count = await Product.countDocuments({ category: category._id, status: 'active' });
      category.productCount = count;
      await category.save();
      console.log(`   ✅ ${category.name}: ${count} products`);
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('✅ MIGRATION COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(50));
    console.log(`   Parent categories created: ${Object.keys(parentCategories).length}`);
    console.log(`   Child categories linked: ${linkedCount}`);
    console.log(`   Total categories: ${allCategories.length}`);
    console.log('\n✨ Frontend can now filter by parent categories (e.g., /api/products?category=face)');
    
  } catch (error) {
    console.error('\n❌ MIGRATION FAILED:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

// Run migration
migrate();

