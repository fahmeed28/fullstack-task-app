// Quick script to check if backend is running
// Run with: node check-backend.js

const API_URL = process.env.VITE_API_URL || 'http://localhost:8000/api';

async function checkBackend() {
  console.log(`Checking backend at: ${API_URL.replace('/api', '')}...\n`);
  
  try {
    const response = await fetch(`${API_URL.replace('/api', '')}/up`, {
      method: 'GET',
    });
    
    if (response.ok) {
      console.log('✅ Backend is running!');
      console.log(`✅ Health check endpoint responded: ${response.status}`);
    } else {
      console.log(`⚠️  Backend responded but with status: ${response.status}`);
    }
  } catch (error) {
    console.log('❌ Backend is NOT running or not accessible');
    console.log(`\nError: ${error.message}`);
    console.log(`\nPlease run: cd ../backend && php artisan serve`);
  }
  
  // Try to test the login endpoint
  console.log(`\nTesting login endpoint at: ${API_URL}/login...`);
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email: 'test@test.com', password: 'test' }),
    });
    
    const data = await response.json();
    console.log(`✅ Login endpoint is accessible (Status: ${response.status})`);
    if (response.status === 401 || response.status === 404) {
      console.log('✅ This is expected - endpoint is working, just invalid credentials');
    }
  } catch (error) {
    console.log(`❌ Cannot reach login endpoint: ${error.message}`);
  }
}

checkBackend();

