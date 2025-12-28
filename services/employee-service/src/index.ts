/**
 * Employee Service - Entry Point
 * Microservice for handling employee management
 */

console.log('Employee Service - Starting...');

// Placeholder server
const PORT = process.env.PORT || 3002;

import { createServer } from 'http';

const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    service: 'employee-service',
    status: 'running',
    message: 'Employee service is operational (placeholder)',
  }));
});

server.listen(PORT, () => {
  console.log(`Employee service listening on port ${PORT}`);
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
