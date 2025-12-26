# RabbitMQ Setup Guide for Async Processing

## Overview

RabbitMQ is a robust message broker that enables asynchronous processing, decoupling time-consuming tasks from API requests. This allows for better scalability, reliability, and user experience.

## Benefits

- **Improved Response Times**: Long-running tasks don't block API requests
- **Better Scalability**: Workers can scale independently from web servers
- **Reliability**: Jobs are persisted and retried on failure
- **Load Leveling**: Prevents system overload during traffic spikes
- **Async Processing**: Payroll, reports, exports run in background

## Performance Impact

**Without Async Processing:**
- Payroll API request: 30-60 seconds (timeout risk)
- Report generation: 20-90 seconds (blocks browser)
- Bulk operations: Minutes (poor UX)

**With RabbitMQ:**
- API responds immediately: < 100ms (job ID returned)
- Background processing: Scalable across multiple workers
- User notified when complete: Email or WebSocket

---

## Installation

### Linux (Ubuntu/Debian)

```bash
# Add RabbitMQ repository
curl -fsSL https://github.com/rabbitmq/signing-keys/releases/download/2.0/rabbitmq-release-signing-key.asc | sudo apt-key add -

# Add RabbitMQ apt repository
sudo add-apt-repository 'deb http://www.rabbitmq.com/debian/ testing main'

# Install RabbitMQ
sudo apt-get update
sudo apt-get install rabbitmq-server

# Start RabbitMQ
sudo systemctl start rabbitmq-server
sudo systemctl enable rabbitmq-server

# Enable management plugin
sudo rabbitmq-plugins enable rabbitmq_management

# Verify installation
sudo systemctl status rabbitmq-server
```

### macOS

```bash
# Using Homebrew
brew update
brew install rabbitmq

# Start RabbitMQ
brew services start rabbitmq

# Enable management plugin
rabbitmq-plugins enable rabbitmq_management

# Verify
brew services list | grep rabbitmq
```

### Docker

```bash
# Pull RabbitMQ with management plugin
docker pull rabbitmq:3-management

# Run RabbitMQ container
docker run -d \
  --name rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  -e RABBITMQ_DEFAULT_USER=admin \
  -e RABBITMQ_DEFAULT_PASS=your_password \
  rabbitmq:3-management

# Verify
docker logs rabbitmq
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'
services:
  rabbitmq:
    image: rabbitmq:3-management
    container_name: rabbitmq
    ports:
      - "5672:5672"   # AMQP port
      - "15672:15672" # Management UI
    environment:
      RABBITMQ_DEFAULT_USER: admin
      RABBITMQ_DEFAULT_PASS: password
      RABBITMQ_DEFAULT_VHOST: auraos
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    restart: unless-stopped

volumes:
  rabbitmq_data:
```

---

## Configuration

### 1. Create User and Virtual Host

```bash
# Create admin user
sudo rabbitmqctl add_user auraos_admin password123
sudo rabbitmqctl set_user_tags auraos_admin administrator

# Create virtual host for AuraOS
sudo rabbitmqctl add_vhost auraos

# Grant permissions
sudo rabbitmqctl set_permissions -p auraos auraos_admin ".*" ".*" ".*"

# Verify
sudo rabbitmqctl list_users
sudo rabbitmqctl list_vhosts
```

### 2. Update Environment Variables

```bash
# .env
RABBITMQ_URL=amqp://auraos_admin:password123@localhost:5672/auraos
RABBITMQ_ENABLED=true
```

### 3. Access Management UI

```
URL: http://localhost:15672
Username: admin (or auraos_admin)
Password: your_password
```

---

## Integration with AuraOS

### 1. Queue Structure

AuraOS uses the following queues:

```typescript
QUEUE_NAMES = {
  PAYROLL_PROCESSING: 'payroll.processing',
  REPORT_GENERATION: 'report.generation',
  EMAIL_NOTIFICATIONS: 'email.notifications',
  DATA_EXPORT: 'data.export',
  BULK_IMPORT: 'bulk.import',
  SCHEDULED_JOBS: 'scheduled.jobs',
}
```

### 2. Enqueue a Job

```typescript
import { queueService, QUEUE_NAMES } from '@/lib/queue';

// Enqueue payroll processing
const jobId = await queueService.enqueue(
  QUEUE_NAMES.PAYROLL_PROCESSING,
  'PAYROLL_PROCESSING',
  {
    companyId: 'company-123',
    month: '2024-12',
    countryCode: 'IN',
  }
);

// Return job ID to client
return { jobId, status: 'PROCESSING' };
```

### 3. Register Job Handler

```typescript
import { queueService } from '@/lib/queue';

// Register handler
queueService.registerHandler('PAYROLL_PROCESSING', async (job) => {
  // Process payroll
  const result = await calculatePayroll(job.data);

  return {
    success: true,
    data: result,
  };
});
```

### 4. Start Worker

```typescript
import { queueService, QUEUE_NAMES } from '@/lib/queue';

// Start consuming jobs
await queueService.startWorker(QUEUE_NAMES.PAYROLL_PROCESSING);
```

---

## Job Processing Flow

```
1. API Request
   ↓
2. Enqueue Job → RabbitMQ
   ↓
3. Return Job ID (Immediate Response)
   ↓
4. Worker picks up job
   ↓
5. Process job (payroll, report, etc.)
   ↓
6. Update job status in Redis
   ↓
7. Send notification (email/WebSocket)
```

---

## Scheduled Jobs

### Register Scheduled Job

```typescript
import { jobScheduler } from '@/lib/queue/scheduler';

jobScheduler.schedule({
  id: 'daily-payroll',
  name: 'Daily Payroll Processing',
  cronExpression: '0 2 * * *', // 2 AM daily
  queue: QUEUE_NAMES.PAYROLL_PROCESSING,
  jobType: 'DAILY_PAYROLL',
  data: {},
  enabled: true,
});
```

### Common Cron Expressions

```bash
# Every minute
* * * * *

# Every 5 minutes
*/5 * * * *

# Every hour
0 * * * *

# Daily at midnight
0 0 * * *

# Daily at 2 AM
0 2 * * *

# Every Monday at 8 AM
0 8 * * 1

# 1st day of every month
0 0 1 * *

# Last day of month
0 0 L * *

# Every weekday at 9 AM
0 9 * * 1-5
```

---

## Monitoring

### 1. Management UI

Access: `http://localhost:15672`

Features:
- Queue stats (messages, consumers)
- Message rates
- Connection monitoring
- Exchange details

### 2. API Endpoint

```bash
# Get queue and scheduled job stats
GET /api/v1/system/jobs?type=all
```

Response:
```json
{
  "queues": {
    "summary": {
      "totalQueues": 6,
      "totalPendingJobs": 45,
      "totalActiveConsumers": 3,
      "status": "OPERATIONAL"
    },
    "queues": [
      {
        "name": "payroll.processing",
        "messageCount": 12,
        "consumerCount": 1,
        "status": "ACTIVE"
      }
    ]
  },
  "scheduled": {
    "summary": {
      "totalJobs": 8,
      "enabledJobs": 3,
      "disabledJobs": 5
    },
    "jobs": [...]
  }
}
```

### 3. Job Status Tracking

```typescript
import { queueService } from '@/lib/queue';

// Get job status
const status = await queueService.getJobStatus(jobId);

console.log(status);
// {
//   id: 'job-123',
//   type: 'PAYROLL_PROCESSING',
//   status: 'COMPLETED',
//   result: { ... },
//   duration: 15000,
//   completedAt: '2024-12-26T10:30:00Z'
// }
```

---

## Use Cases

### 1. Async Payroll Processing

```typescript
// API Handler
export async function POST(request) {
  const data = await request.json();

  // Enqueue job
  const jobId = await queueService.enqueue(
    QUEUE_NAMES.PAYROLL_PROCESSING,
    'PAYROLL_PROCESSING',
    data
  );

  return NextResponse.json({
    success: true,
    data: { jobId, status: 'PROCESSING' },
  }, { status: 202 }); // Accepted
}

// Worker processes job in background
// User receives email when complete
```

### 2. Report Generation

```typescript
// Enqueue report generation
const jobId = await queueService.enqueue(
  QUEUE_NAMES.REPORT_GENERATION,
  'REPORT_GENERATION',
  {
    reportType: 'ATTENDANCE_SUMMARY',
    format: 'EXCEL',
    filters: {
      companyId: 'company-123',
      startDate: '2024-12-01',
      endDate: '2024-12-31',
    },
    userEmail: 'user@company.com',
  }
);

// User gets email with download link when ready
```

### 3. Bulk Data Import

```typescript
// Upload CSV → enqueue processing
const jobId = await queueService.enqueue(
  QUEUE_NAMES.BULK_IMPORT,
  'BULK_IMPORT_ATTENDANCE',
  {
    fileUrl: 's3://bucket/attendance.csv',
    companyId: 'company-123',
  }
);

// Worker processes 10,000+ records asynchronously
```

---

## Scaling Workers

### Single Worker (Development)

```typescript
// Start all workers in one process
import './lib/queue/jobs/payroll.job';
import './lib/queue/jobs/report.job';

await queueService.startWorker(QUEUE_NAMES.PAYROLL_PROCESSING);
await queueService.startWorker(QUEUE_NAMES.REPORT_GENERATION);
```

### Multiple Workers (Production)

```bash
# Worker process 1 - Payroll
node workers/payroll-worker.js

# Worker process 2 - Reports
node workers/report-worker.js

# Worker process 3 - Notifications
node workers/notification-worker.js
```

### Docker Deployment

```yaml
# docker-compose.yml
services:
  web:
    build: .
    environment:
      RABBITMQ_URL: amqp://rabbitmq:5672
    depends_on:
      - rabbitmq

  worker-payroll:
    build: .
    command: node workers/payroll-worker.js
    deploy:
      replicas: 3 # 3 payroll workers
    depends_on:
      - rabbitmq

  worker-reports:
    build: .
    command: node workers/report-worker.js
    deploy:
      replicas: 2 # 2 report workers
    depends_on:
      - rabbitmq

  rabbitmq:
    image: rabbitmq:3-management
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: payroll-worker
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: worker
        image: auraos-worker:latest
        command: ["node", "workers/payroll-worker.js"]
        env:
        - name: RABBITMQ_URL
          value: "amqp://rabbitmq:5672"
```

---

## Error Handling & Retries

### Automatic Retries

Jobs are automatically retried with exponential backoff:

```typescript
// Retry configuration
maxAttempts: 3
retryDelay: min(1000 * 2^attempts, 30000)

// Example:
Attempt 1: Immediate
Attempt 2: 2 seconds delay
Attempt 3: 4 seconds delay
Failed: After 3 attempts
```

### Dead Letter Queue (DLQ)

Failed jobs after max retries are moved to DLQ for manual investigation.

---

## Best Practices

1. **Idempotent Jobs**: Design jobs to be safely retried
2. **Job Timeout**: Set reasonable timeouts for long-running jobs
3. **Resource Limits**: Limit concurrent jobs to prevent resource exhaustion
4. **Monitoring**: Track job success/failure rates
5. **Graceful Shutdown**: Handle SIGTERM to finish current jobs
6. **Message Persistence**: Use durable queues and persistent messages
7. **Job Progress**: Update job status for long-running tasks
8. **Error Logging**: Log detailed error information for debugging

---

## Troubleshooting

### RabbitMQ Not Starting

```bash
# Check status
sudo systemctl status rabbitmq-server

# Check logs
sudo journalctl -u rabbitmq-server -f

# Check port
netstat -tlnp | grep 5672
```

### Connection Issues

```bash
# Test connection
telnet localhost 5672

# Check firewall
sudo ufw allow 5672
sudo ufw allow 15672

# Verify credentials
rabbitmqctl authenticate_user auraos_admin password123
```

### Queue Buildup

```bash
# Check queue depth
rabbitmqctl list_queues name messages consumers

# Purge queue (careful!)
rabbitmqctl purge_queue payroll.processing

# Add more workers
```

---

## Production Deployment

### AWS (Amazon MQ)

```bash
# Use managed RabbitMQ service
RABBITMQ_URL=amqps://username:password@b-xxx.mq.region.amazonaws.com:5671
```

### Azure (Azure Service Bus)

Alternative: Use Azure Service Bus with AMQP 1.0

### Google Cloud (Cloud Tasks)

Alternative: Use Google Cloud Tasks for similar functionality

---

## Resources

- [RabbitMQ Documentation](https://www.rabbitmq.com/documentation.html)
- [amqplib (Node.js client)](https://github.com/squaremo/amqp.node)
- [RabbitMQ Best Practices](https://www.cloudamqp.com/blog/part1-rabbitmq-best-practice.html)
- [Cron Expression Guide](https://crontab.guru/)

---

**Last Updated**: December 26, 2024
