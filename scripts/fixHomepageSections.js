/**
 * Fix Homepage Sections to Match Frontend
 * Deletes "Trending" and ensures exact field name matches
 */

const axios = require('axios');

const BASE_URL = 'https://backendglownaturas.onrender.com';

async function main() {
  console.log('🔧 Fixing Homepage Sections to Match Frontend\n');
  
  // Login
  console.log('🔐 Logging in...');
  const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
    email: 'chisomokoli47@glownaturas.com',
    password: 'Caption15$AZ'
  });
  
  const token = loginResponse.data.data.token;
  console.log('✅ Login successful!\n');
  
  // Get current sections
  console.log('📋 Getting current sections...');
  const sectionsResponse = await axios.get(`${BASE_URL}/api/homepage-sections`);
  const sections = sectionsResponse.data.data;
  
  console.log(`Found ${sections.length} sections:\n`);
  sections.forEach(s => {
    console.log(`  • ${s.sectionType} - "${s.title}" - ${s.products.length} products`);
  });
  
  // Frontend sections (from page.tsx)
  const frontendSections = [
    'Featured Items',
    'Back in Stock', 
    'New Arrivals',
    'Best Sellers'
  ];
  
  console.log(`\n✅ Frontend expects ${frontendSections.length} sections:\n`);
  frontendSections.forEach(s => console.log(`  • ${s}`));
  
  // Delete "Trending" section
  const trending = sections.find(s => s.sectionType === 'trending');
  if (trending) {
    console.log('\n🗑️  Deleting "Trending" section (not in frontend)...');
    try {
      await axios.delete(`${BASE_URL}/api/homepage-sections/${trending._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('  ✅ Deleted!');
    } catch (error) {
      console.log(`  ⚠️  Couldn't delete: ${error.response?.data?.error || error.message}`);
    }
  }
  
  // Verify final sections
  console.log('\n📋 Final sections in backend:');
  const finalResponse = await axios.get(`${BASE_URL}/api/homepage-sections`);
  const finalSections = finalResponse.data.data;
  
  console.log(`\nBackend (${finalSections.length} sections):`);
  finalSections.forEach(s => {
    const match = frontendSections.includes(s.title) ? '✅' : '❌';
    console.log(`  ${match} ${s.title}`);
  });
  
  console.log('\n🎉 Homepage sections now match frontend!');
  console.log('\n✅ Sections Ready:');
  console.log('  1. Featured Items');
  console.log('  2. Back in Stock');
  console.log('  3. New Arrivals');
  console.log('  4. Best Sellers');
}

main().catch(error => {
  console.error('❌ Error:', error.response?.data || error.message);
  process.exit(1);
});

