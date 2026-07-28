const http = require('http');

const req = http.request(
  {
    hostname: 'localhost',
    port: 3000,
    path: '/api/industry-aviation/pilot-training/pilots',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  },
  (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log(`Status: ${res.statusCode}`);
      console.log(`Body: ${data}`);
    });
  }
);

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(JSON.stringify({ 
  employeeId: 'Pilot-001',
  pilotId: 'Pilot-001',
  pilotType: 'COMMERCIAL',
  baseAirport: 'LHR',
  rank: 'first_officer',
  status: 'active',
  personalInfo: { firstName: 'Shan', lastName: 'Baskar' },
  licenses: [],
  flightHours: { total: 3 }
}));
req.end();
