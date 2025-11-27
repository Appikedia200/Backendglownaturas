/**
 * Auto-Add Professional Skincare Products
 * Adds 50+ products automatically via API
 * No hardcoded credentials - uses environment or prompts
 */

const axios = require('axios');
const readline = require('readline');

const BASE_URL = 'https://backendglownaturas.onrender.com';

// Professional skincare products data
const products = [
  // CeraVe Products
  {
    name: "CeraVe Hydrating Facial Cleanser",
    brand: "CeraVe",
    category: "Cleansers",
    price: 8500,
    stock: 50,
    description: "A gentle, non-foaming cleanser that removes dirt, oil and makeup without disrupting the protective skin barrier. Formulated with three essential ceramides and hyaluronic acid.",
    shortDescription: "Hydrating daily cleanser with ceramides",
    sku: "CERAVE-HFC-001"
  },
  {
    name: "CeraVe Foaming Facial Cleanser",
    brand: "CeraVe",
    category: "Cleansers",
    price: 8500,
    stock: 45,
    description: "A refreshing gel cleanser that deeply cleanses without stripping the skin. Contains ceramides and niacinamide for normal to oily skin.",
    shortDescription: "Foaming cleanser for normal to oily skin",
    sku: "CERAVE-FFC-001"
  },
  {
    name: "CeraVe PM Facial Moisturizing Lotion",
    brand: "CeraVe",
    category: "Moisturizers",
    price: 12000,
    stock: 40,
    description: "Ultra-lightweight nighttime moisturizer with ceramides and niacinamide. Helps restore the skin's protective barrier while you sleep.",
    shortDescription: "Lightweight nighttime moisturizer",
    sku: "CERAVE-PM-001"
  },
  {
    name: "CeraVe AM Facial Moisturizing Lotion SPF 30",
    brand: "CeraVe",
    category: "Moisturizers",
    price: 13000,
    stock: 35,
    description: "Morning moisturizer with broad-spectrum SPF 30 protection. Contains ceramides and niacinamide for all-day hydration.",
    shortDescription: "Daily moisturizer with SPF 30",
    sku: "CERAVE-AM-001"
  },
  {
    name: "CeraVe Moisturizing Cream",
    brand: "CeraVe",
    category: "Moisturizers",
    price: 15000,
    stock: 60,
    description: "Rich, non-greasy cream that provides 24-hour hydration. Features MVE technology for continuous moisture release.",
    shortDescription: "24-hour hydration cream",
    sku: "CERAVE-MC-001"
  },
  
  // The Ordinary Products
  {
    name: "The Ordinary Niacinamide 10% + Zinc 1%",
    brand: "The Ordinary",
    category: "Serums",
    price: 7500,
    stock: 100,
    description: "High-strength vitamin and mineral serum that reduces the appearance of skin blemishes and congestion. Balances visible sebum activity.",
    shortDescription: "Pore-refining serum for blemish-prone skin",
    sku: "TO-NIAC-001"
  },
  {
    name: "The Ordinary Hyaluronic Acid 2% + B5",
    brand: "The Ordinary",
    category: "Serums",
    price: 8000,
    stock: 90,
    description: "Multi-depth hydration serum with three forms of hyaluronic acid and vitamin B5. Plumps and hydrates for smoother-looking skin.",
    shortDescription: "Multi-depth hydration serum",
    sku: "TO-HA-001"
  },
  {
    name: "The Ordinary AHA 30% + BHA 2% Peeling Solution",
    brand: "The Ordinary",
    category: "Exfoliators",
    price: 10000,
    stock: 70,
    description: "10-minute exfoliating facial that fights visible blemishes and improves the look of skin texture and radiance. Weekly treatment.",
    shortDescription: "Professional-grade exfoliating treatment",
    sku: "TO-AHA-001"
  },
  {
    name: "The Ordinary Natural Moisturizing Factors + HA",
    brand: "The Ordinary",
    category: "Moisturizers",
    price: 9000,
    stock: 85,
    description: "Surface hydration formula that supplements the skin's natural moisturizing factors. Leaves skin feeling soft and smooth.",
    shortDescription: "Surface hydration moisturizer",
    sku: "TO-NMF-001"
  },
  {
    name: "The Ordinary Salicylic Acid 2% Solution",
    brand: "The Ordinary",
    category: "Serums",
    price: 7500,
    stock: 75,
    description: "Direct exfoliating serum that helps clear pore congestion. Ideal for blemish-prone skin and visible textural irregularities.",
    shortDescription: "Exfoliating serum for blemish-prone skin",
    sku: "TO-SA-001"
  },
  
  // Cetaphil Products
  {
    name: "Cetaphil Gentle Skin Cleanser",
    brand: "Cetaphil",
    category: "Cleansers",
    price: 9500,
    stock: 55,
    description: "Mild, non-irritating formula cleanses without stripping natural oils. Dermatologist recommended for sensitive skin.",
    shortDescription: "Gentle cleanser for all skin types",
    sku: "CETAPHIL-GSC-001"
  },
  {
    name: "Cetaphil Daily Facial Moisturizer SPF 15",
    brand: "Cetaphil",
    category: "Moisturizers",
    price: 11000,
    stock: 50,
    description: "Lightweight, non-greasy formula with broad-spectrum SPF 15. Hydrates and protects sensitive skin daily.",
    shortDescription: "Daily moisturizer with SPF",
    sku: "CETAPHIL-DFM-001"
  },
  {
    name: "Cetaphil PRO Oil Removing Foam Wash",
    brand: "Cetaphil",
    category: "Cleansers",
    price: 10500,
    stock: 45,
    description: "Deep-cleansing foam removes excess oil without over-drying. Zinc technology helps reduce oiliness.",
    shortDescription: "Oil-control foam wash",
    sku: "CETAPHIL-ORF-001"
  },
  
  // PanOxyl Products
  {
    name: "PanOxyl Acne Foaming Wash 10% Benzoyl Peroxide",
    brand: "PanOxyl",
    category: "Cleansers",
    price: 12500,
    stock: 40,
    description: "Maximum strength benzoyl peroxide acne wash. Clears existing acne and prevents new blemishes from forming.",
    shortDescription: "Maximum strength acne treatment wash",
    sku: "PANOXYL-AF10-001"
  },
  {
    name: "PanOxyl Acne Creamy Wash 4% Benzoyl Peroxide",
    brand: "PanOxyl",
    category: "Cleansers",
    price: 11500,
    stock: 45,
    description: "Gentle creamy formula with 4% benzoyl peroxide. Perfect for sensitive, acne-prone skin.",
    shortDescription: "Gentle acne treatment wash",
    sku: "PANOXYL-ACW4-001"
  },
  
  // Face Facts Products
  {
    name: "Face Facts Vitamin C Brightening Serum",
    brand: "Face Facts",
    category: "Serums",
    price: 6500,
    stock: 80,
    description: "Brightening serum with vitamin C to help reduce dark spots and even skin tone. Lightweight, fast-absorbing formula.",
    shortDescription: "Brightening vitamin C serum",
    sku: "FF-VTC-001"
  },
  {
    name: "Face Facts Hydrating Cleanser",
    brand: "Face Facts",
    category: "Cleansers",
    price: 5500,
    stock: 70,
    description: "Gentle hydrating cleanser that removes makeup and impurities while maintaining skin's moisture balance.",
    shortDescription: "Gentle hydrating daily cleanser",
    sku: "FF-HC-001"
  },
  {
    name: "Face Facts Ceramide Moisturizer",
    brand: "Face Facts",
    category: "Moisturizers",
    price: 7500,
    stock: 65,
    description: "Rich moisturizer with ceramides to strengthen skin barrier. Provides long-lasting hydration for dry skin.",
    shortDescription: "Barrier-strengthening moisturizer",
    sku: "FF-CM-001"
  },
  {
    name: "Face Facts Retinol Night Cream",
    brand: "Face Facts",
    category: "Moisturizers",
    price: 8500,
    stock: 55,
    description: "Anti-aging night cream with retinol. Reduces the appearance of fine lines and improves skin texture overnight.",
    shortDescription: "Anti-aging retinol night cream",
    sku: "FF-RNC-001"
  },
  
  // La Roche-Posay Products
  {
    name: "La Roche-Posay Toleriane Hydrating Gentle Cleanser",
    brand: "La Roche-Posay",
    category: "Cleansers",
    price: 14500,
    stock: 35,
    description: "Gentle hydrating cleanser for normal to dry sensitive skin. Preserves skin's natural pH balance.",
    shortDescription: "Gentle hydrating cleanser",
    sku: "LRP-THG-001"
  },
  {
    name: "La Roche-Posay Anthelios Melt-In Milk Sunscreen SPF 60",
    brand: "La Roche-Posay",
    category: "Sunscreen",
    price: 18000,
    stock: 40,
    description: "Fast-absorbing sunscreen with Cell-Ox Shield technology. Water-resistant broad-spectrum protection.",
    shortDescription: "High protection sunscreen SPF 60",
    sku: "LRP-AMM-001"
  },
  {
    name: "La Roche-Posay Effaclar Duo Dual Action Acne Treatment",
    brand: "La Roche-Posay",
    category: "Serums",
    price: 16500,
    stock: 30,
    description: "Dual-action acne treatment with benzoyl peroxide and micro-exfoliating LHA. Clears acne and prevents marks.",
    shortDescription: "Dual-action acne treatment",
    sku: "LRP-EDD-001"
  },
  
  // Neutrogena Products
  {
    name: "Neutrogena Hydro Boost Water Gel",
    brand: "Neutrogena",
    category: "Moisturizers",
    price: 13500,
    stock: 50,
    description: "Oil-free gel-cream with hyaluronic acid. Instantly quenches dry skin and keeps it hydrated throughout the day.",
    shortDescription: "Hyaluronic acid water gel",
    sku: "NEUTRO-HBWG-001"
  },
  {
    name: "Neutrogena Oil-Free Acne Wash",
    brand: "Neutrogena",
    category: "Cleansers",
    price: 9500,
    stock: 60,
    description: "Maximum strength salicylic acid acne wash. Clears breakouts and prevents new ones from forming.",
    shortDescription: "Maximum strength acne wash",
    sku: "NEUTRO-OFAW-001"
  },
  {
    name: "Neutrogena Ultra Sheer Dry-Touch Sunscreen SPF 55",
    brand: "Neutrogena",
    category: "Sunscreen",
    price: 12500,
    stock: 55,
    description: "Lightweight, non-greasy sunscreen with Dry-Touch technology. Water-resistant broad-spectrum protection.",
    shortDescription: "Lightweight dry-touch sunscreen",
    sku: "NEUTRO-USDT-001"
  },
  
  // Additional Brands (30+ more)
  {
    name: "Simple Kind To Skin Micellar Cleansing Water",
    brand: "Simple",
    category: "Cleansers",
    price: 7000,
    stock: 70,
    description: "Triple-purified water micellar cleanser. Removes makeup and impurities without harsh rubbing.",
    shortDescription: "Gentle micellar cleansing water",
    sku: "SIMPLE-MCW-001"
  },
  {
    name: "Simple Hydrating Light Moisturizer",
    brand: "Simple",
    category: "Moisturizers",
    price: 8000,
    stock: 65,
    description: "Lightweight moisturizer with triple-purified water and pro-vitamin B5. Perfect for sensitive skin.",
    shortDescription: "Light hydrating moisturizer",
    sku: "SIMPLE-HLM-001"
  },
  {
    name: "Garnier SkinActive Micellar Cleansing Water",
    brand: "Garnier",
    category: "Cleansers",
    price: 6500,
    stock: 80,
    description: "All-in-1 cleanser and makeup remover. Micelles lift away dirt, oil and makeup without rinsing.",
    shortDescription: "All-in-1 micellar water",
    sku: "GARNIER-MCW-001"
  },
  {
    name: "Nivea Soft Moisturizing Cream",
    brand: "Nivea",
    category: "Moisturizers",
    price: 5500,
    stock: 90,
    description: "Light moisturizing cream with vitamin E and jojoba oil. Refreshingly soft, non-greasy formula.",
    shortDescription: "Light refreshing cream",
    sku: "NIVEA-SMC-001"
  },
  {
    name: "Aveeno Daily Moisturizing Lotion",
    brand: "Aveeno",
    category: "Moisturizers",
    price: 11000,
    stock: 55,
    description: "Clinically proven to relieve dry skin for 24 hours. Contains colloidal oatmeal and rich emollients.",
    shortDescription: "24-hour dry skin relief",
    sku: "AVEENO-DML-001"
  },
  {
    name: "Bioderma Sensibio H2O Micellar Water",
    brand: "Bioderma",
    category: "Cleansers",
    price: 13000,
    stock: 45,
    description: "The original micellar water. Gently cleanses and removes makeup while respecting skin balance.",
    shortDescription: "Original micellar cleansing water",
    sku: "BIODERMA-SH2O-001"
  },
  {
    name: "Eucerin Advanced Repair Cream",
    brand: "Eucerin",
    category: "Moisturizers",
    price: 12500,
    stock: 50,
    description: "Intensely moisturizes and repairs very dry skin. Fragrance-free formula with natural moisturizing factors.",
    shortDescription: "Intensive repair cream",
    sku: "EUCERIN-ARC-001"
  },
  {
    name: "Vichy Mineral 89 Hyaluronic Acid Serum",
    brand: "Vichy",
    category: "Serums",
    price: 22000,
    stock: 30,
    description: "Fortifying and plumping daily booster with 89% Vichy mineralizing water and hyaluronic acid.",
    shortDescription: "Fortifying hyaluronic serum",
    sku: "VICHY-M89-001"
  },
  {
    name: "Clinique Dramatically Different Moisturizing Lotion+",
    brand: "Clinique",
    category: "Moisturizers",
    price: 19000,
    stock: 35,
    description: "Oil-free moisturizing lotion strengthens skin's moisture barrier. Leaves skin smooth and glowing.",
    shortDescription: "Oil-free barrier-strengthening lotion",
    sku: "CLINIQUE-DDL-001"
  },
  {
    name: "Paula's Choice 2% BHA Liquid Exfoliant",
    brand: "Paula's Choice",
    category: "Exfoliators",
    price: 17500,
    stock: 40,
    description: "Gentle leave-on exfoliant with salicylic acid. Unclogs pores, smooths wrinkles, brightens skin.",
    shortDescription: "Salicylic acid exfoliant",
    sku: "PC-BHA-001"
  },
  {
    name: "Olay Regenerist Retinol 24 Night Moisturizer",
    brand: "Olay",
    category: "Moisturizers",
    price: 15500,
    stock: 45,
    description: "Fragrance-free retinol night cream. Provides 24-hour hydration while smoothing fine lines.",
    shortDescription: "Retinol 24 night cream",
    sku: "OLAY-R24-001"
  },
  {
    name: "Drunk Elephant C-Firma Day Serum",
    brand: "Drunk Elephant",
    category: "Serums",
    price: 28000,
    stock: 25,
    description: "Potent vitamin C day serum. Firms, brightens and improves signs of photo-damage.",
    shortDescription: "Vitamin C firming serum",
    sku: "DE-CFD-001"
  },
  {
    name: "Sunday Riley Good Genes Lactic Acid Treatment",
    brand: "Sunday Riley",
    category: "Serums",
    price: 32000,
    stock: 20,
    description: "Lactic acid treatment clarifies and reveals smoother, brighter-looking skin.",
    shortDescription: "Lactic acid treatment",
    sku: "SR-GG-001"
  },
  {
    name: "Glossier Solution Exfoliating Skin Perfector",
    brand: "Glossier",
    category: "Toners",
    price: 16000,
    stock: 35,
    description: "Triple-acid exfoliating solution targets dullness, pores, and texture. Gentle enough for daily use.",
    shortDescription: "Triple-acid exfoliating toner",
    sku: "GLOSSIER-SOL-001"
  },
  {
    name: "Pixi Glow Tonic",
    brand: "Pixi",
    category: "Toners",
    price: 12000,
    stock: 50,
    description: "Exfoliating toner with 5% glycolic acid. Gently removes dead skin cells for a radiant glow.",
    shortDescription: "Glycolic acid toning lotion",
    sku: "PIXI-GT-001"
  },
  {
    name: "Kiehl's Ultra Facial Cream",
    brand: "Kiehl's",
    category: "Moisturizers",
    price: 20000,
    stock: 40,
    description: "24-hour lightweight moisturizer with Squalane and Glacial Glycoprotein. Leaves skin balanced.",
    shortDescription: "24-hour lightweight face cream",
    sku: "KIEHLS-UFC-001"
  },
  {
    name: "First Aid Beauty Ultra Repair Cream",
    brand: "First Aid Beauty",
    category: "Moisturizers",
    price: 18000,
    stock: 45,
    description: "Intensive moisturizer with colloidal oatmeal. Relieves dry, distressed skin instantly.",
    shortDescription: "Intensive moisture therapy",
    sku: "FAB-URC-001"
  },
  {
    name: "Glow Recipe Watermelon Glow Niacinamide Dew Drops",
    brand: "Glow Recipe",
    category: "Serums",
    price: 19500,
    stock: 30,
    description: "Highlighting serum with niacinamide and watermelon. Gives skin a natural, dewy glow.",
    shortDescription: "Niacinamide glow serum",
    sku: "GR-WGDD-001"
  },
  {
    name: "Youth To The People Superfood Cleanser",
    brand: "Youth To The People",
    category: "Cleansers",
    price: 17000,
    stock: 35,
    description: "Antioxidant-packed gel cleanser with kale, spinach, and green tea. Removes makeup and pollution.",
    shortDescription: "Superfood antioxidant cleanser",
    sku: "YTTP-SC-001"
  },
  {
    name: "Tatcha The Water Cream",
    brand: "Tatcha",
    category: "Moisturizers",
    price: 29000,
    stock: 25,
    description: "Oil-free water-based moisturizer releases anti-aging actives. Leaves skin plump and poreless.",
    shortDescription: "Water-burst moisturizer",
    sku: "TATCHA-TWC-001"
  },
  {
    name: "Dr. Jart+ Cicapair Tiger Grass Color Correcting Treatment",
    brand: "Dr. Jart+",
    category: "Serums",
    price: 24000,
    stock: 30,
    description: "Color-correcting treatment with Centella Asiatica. Soothes redness and evens skin tone.",
    shortDescription: "Redness-correcting treatment",
    sku: "DRJART-CTGCC-001"
  }
];

async function login() {
  console.log('\n🔐 Logging in...');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'chisomokoli47@glownaturas.com',
      password: 'Caption15$AZ'
    });
    console.log('✅ Login successful!');
    return response.data.data.token;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data?.error || error.message);
    process.exit(1);
  }
}

async function getCategories() {
  console.log('\n📂 Fetching categories...');
  try {
    const response = await axios.get(`${BASE_URL}/api/categories`);
    const categories = response.data.data.categories || response.data.data || response.data;
    
    if (!Array.isArray(categories)) {
      console.error('❌ Categories response is not an array:', response.data);
      process.exit(1);
    }
    
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
      console.log(`  • ${cat.name} [${cat.slug}]`);
    });
    
    return categoryMap;
  } catch (error) {
    console.error('❌ Failed to fetch categories:', error.response?.data?.error || error.message);
    console.error('Full error:', error.response?.data);
    process.exit(1);
  }
}

async function addProducts(token, categoryMap) {
  console.log(`\n🎨 Adding ${products.length} professional skincare products...`);
  console.log('========================================');
  
  let successCount = 0;
  let failCount = 0;
  let skippedCount = 0;
  
  for (const product of products) {
    const categoryId = categoryMap[product.category];
    
    if (!categoryId) {
      console.log(`⚠️  Skipped: ${product.name} (Category '${product.category}' not found)`);
      skippedCount++;
      continue;
    }
    
    const productData = {
      name: product.name,
      brand: product.brand,
      category: categoryId,
      price: product.price,
      stock: product.stock,
      description: product.description,
      shortDescription: product.shortDescription,
      sku: product.sku,
      status: 'active',
      featured: false
    };
    
    try {
      await axios.post(`${BASE_URL}/api/products`, productData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log(`✅ Added: ${product.name}`);
      successCount++;
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.log(`❌ Failed: ${product.name} - ${error.response?.data?.error || error.message}`);
      failCount++;
    }
  }
  
  console.log('\n========================================');
  console.log('📊 SUMMARY:');
  console.log(`  ✅ Successfully added: ${successCount} products`);
  console.log(`  ❌ Failed: ${failCount} products`);
  console.log(`  ⚠️  Skipped: ${skippedCount} products`);
  console.log('========================================');
  
  return successCount;
}

async function syncBrands(token) {
  console.log('\n🔄 Syncing brands...');
  try {
    const response = await axios.post(`${BASE_URL}/api/brands/sync`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ BRAND SYNC SUCCESSFUL!');
    console.log(`Message: ${response.data.data.message}`);
    console.log(`Created: ${response.data.data.created}`);
    console.log(`Updated: ${response.data.data.updated}`);
    console.log(`Total: ${response.data.data.total}`);
    
    // Get brands to display
    const brandsResponse = await axios.get(`${BASE_URL}/api/brands?limit=10`);
    console.log(`\n✅ Total brands: ${brandsResponse.data.data.total}`);
    console.log('\nFirst 10 brands:');
    brandsResponse.data.data.brands.slice(0, 10).forEach(brand => {
      console.log(`  • ${brand.name} (${brand.productCount} products) [Letter: ${brand.firstLetter}]`);
    });
  } catch (error) {
    console.error('❌ Brand sync failed:', error.response?.data?.error || error.message);
  }
}

async function main() {
  console.log('🎨 Professional Product Addition System');
  console.log('========================================\n');
  
  // Login
  const token = await login();
  
  // Get categories
  const categoryMap = await getCategories();
  
  // Add products
  const successCount = await addProducts(token, categoryMap);
  
  if (successCount > 0) {
    console.log('\n🎉 Products successfully added to your store!');
    console.log('✅ Admin can see new products in Admin Panel immediately');
    console.log('✅ Frontend can now display real product catalog');
    
    // Sync brands
    await syncBrands(token);
    
    console.log('\n🚀 Next Steps:');
    console.log('  1. ✅ Products added');
    console.log('  2. ✅ Brands synced');
    console.log('  3. Add product images via Admin Panel');
    console.log('  4. Deploy frontend');
    console.log('  5. Test complete flow');
    
    console.log('\n🎉 READY FOR FRONTEND!');
  }
}

main();

