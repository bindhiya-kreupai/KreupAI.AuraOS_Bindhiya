/**
 * Payroll Service - Entry Point
 * Microservice for handling payroll processing
 */

console.log('Payroll Service - Starting...');

// Placeholder server
const PORT = process.env.PORT || 3005;

import { createServer } from 'http';

const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    service: 'payroll-service',
    status: 'running',
    message: 'Payroll service is operational (placeholder)',
  }));
});

server.listen(PORT, () => {
  console.log(`Payroll service listening on port ${PORT}`);
});

// Graceful shutdown
const signals = ['SIGINT', 'SIGTERM'];
signals.forEach((signal) => {
  process.on(signal, async () => {
    console.log(`Received ${signal}, shutting down gracefully...`);
    server.close();
    process.exit(0);
  });
});
