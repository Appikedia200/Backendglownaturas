/**
 * Seed Default Homepage Sections
 * Creates the 5 main homepage sections for admin control
 * @version 5.2.0
 * 
 * Run: node src/scripts/seedHomepageSections.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const HomepageSection = require('../infrastructure/database/mongodb/models/HomepageSection');
const logger = require('../config/logger');

const defaultSections = [
  {
    sectionType: 'featured',
    title: 'Featured Items',
    subtitle: 'Hand-picked products just for you',
    products: [],
    displayOrder: 1,
    isActive: true,
    autoUpdate: false,
    maxProducts: 8
  },
  {
    sectionType: 'new_arrivals',
    title: 'New Arrivals',
    subtitle: 'Latest additions to our collection',
    products: [],
    displayOrder: 2,
    isActive: true,
    autoUpdate: true, // Can auto-populate with recently added products
    maxProducts: 8
  },
  {
    sectionType: 'back_in_stock',
    title: 'Back in Stock',
    subtitle: 'Popular items now available again',
    products: [],
    displayOrder: 3,
    isActive: true,
    autoUpdate: false,
    maxProducts: 8
  },
  {
    sectionType: 'trending',
    title: 'Trending Now',
    subtitle: 'What everyone is buying',
    products: [],
    displayOrder: 4,
    isActive: true,
    autoUpdate: true, // Can auto-populate with most viewed products
    maxProducts: 8
  },
  {
    sectionType: 'best_sellers',
    title: 'Best Sellers',
    subtitle: 'Our most popular products',
    products: [],
    displayOrder: 5,
    isActive: true,
    autoUpdate: true, // Can auto-populate with top-selling products
    maxProducts: 8
  }
];

async function seedHomepageSections() {
  try {
    // Connect to database
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_URL;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in environment variables');
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    console.log('🌱 Seeding homepage sections...\n');

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const sectionData of defaultSections) {
      const existing = await HomepageSection.findOne({ sectionType: sectionData.sectionType });

      if (existing) {
        console.log(`⏩ Section '${sectionData.sectionType}' already exists - SKIPPED`);
        skipped++;
      } else {
        await HomepageSection.create(sectionData);
        console.log(`✅ Created section: ${sectionData.title} (${sectionData.sectionType})`);
        created++;
      }
    }

    console.log('\n📊 SEED SUMMARY:');
    console.log(`✅ Created: ${created} sections`);
    console.log(`⏩ Skipped: ${skipped} sections (already exist)`);
    console.log(`📦 Total: ${defaultSections.length} sections\n`);

    console.log('✨ Homepage sections seeded successfully!');
    console.log('\n📝 NEXT STEPS:');
    console.log('1. Go to Admin Panel → Homepage Sections');
    console.log('2. Add products to each section');
    console.log('3. Adjust display order if needed');
    console.log('4. Toggle sections active/inactive as required\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding homepage sections:', error.message);
    logger.error('Homepage sections seed failed', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

// Run seeder
seedHomepageSections();

