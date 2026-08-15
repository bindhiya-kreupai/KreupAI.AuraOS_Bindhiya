const http = require('http');

async function testApi() {
  try {
    // 1. Get dev-login token
    const loginRes = await fetch('http://localhost:3000/api/auth/dev-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'dev@auraos.local',
        tenantId: 'dev-tenant',
        userId: 'dev-user',
      })
    });
    
    const setCookieHeader = loginRes.headers.get('set-cookie');
    const cookies = setCookieHeader ? setCookieHeader.split(',').map(c => c.split(';')[0]).join('; ') : '';
    console.log('Got cookies:', cookies);

    if (!loginRes.ok) {
      console.log('Login failed:', await loginRes.text());
      return;
    }

    // 2. Test POST /api/automotive/sales-people
    const postRes = await fetch('http://localhost:3000/api/automotive/sales-people', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
      },
      body: JSON.stringify({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        department: 'sales',
        monthlySalesTarget: 100,
        yearlySalesTarget: 1200
      })
    });

    console.log('POST status:', postRes.status);
    console.log('POST response:', await postRes.text());

  } catch (error) {
    console.error('Test error:', error);
  }
}

testApi();
