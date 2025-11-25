/**
 * Test script for bulk product status update
 * This simulates what the admin panel sends
 */

const API_URL = 'https://backendglownaturas.onrender.com';

async function testBulkStatus() {
  console.log('🧪 Testing Bulk Product Status Update\n');
  
  // First, get some products
  console.log('1️⃣ Fetching products...');
  const productsResponse = await fetch(`${API_URL}/api/products?limit=2`);
  const productsData = await productsResponse.json();
  
  if (!productsData.success || !productsData.data || productsData.data.length === 0) {
    console.error('❌ No products found. Please add products first.');
    return;
  }
  
  const productIds = productsData.data.map(p => p._id);
  console.log(`✅ Found ${productIds.length} products:`, productIds);
  
  // You need to replace this with actual login credentials
  const email = 'chisomokoli47@glownaturas.com';
  const password = 'Caption15$';
  
  console.log('\n2️⃣ Logging in...');
  const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const loginData = await loginResponse.json();
  
  if (!loginData.success) {
    console.error('❌ Login failed:', loginData.error);
    return;
  }
  
  const token = loginData.data.token;
  console.log('✅ Login successful');
  
  // Test bulk status update with productIds (admin panel format)
  console.log('\n3️⃣ Testing bulk status update with "productIds" field...');
  const bulkResponse = await fetch(`${API_URL}/api/products/bulk/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      productIds: productIds,  // Admin panel sends "productIds"
      status: 'active'
    })
  });
  
  const bulkData = await bulkResponse.json();
  
  console.log('\n📊 Response Status:', bulkResponse.status);
  console.log('📊 Response Data:', JSON.stringify(bulkData, null, 2));
  
  if (bulkData.success) {
    console.log('\n✅ SUCCESS! Bulk status update works!');
    console.log(`✅ Updated ${bulkData.data.count} products to ${bulkData.data.status}`);
  } else {
    console.log('\n❌ FAILED! Bulk status update failed!');
    console.log('❌ Error:', bulkData.error);
  }
}

// Run test
testBulkStatus().catch(console.error);

