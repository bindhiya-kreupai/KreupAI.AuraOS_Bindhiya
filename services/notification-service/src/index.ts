/**
 * Notification Service - Entry Point
 * Microservice for handling notifications (email, SMS, push)
 */

console.log('Notification Service - Starting...');

// Placeholder server
const PORT = process.env.PORT || 3003;

import { createServer } from 'http';

const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    service: 'notification-service',
    status: 'running',
    message: 'Notification service is operational (placeholder)',
  }));
});

server.listen(PORT, () => {
  console.log(`Notification service listening on port ${PORT}`);
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
