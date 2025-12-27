#!/usr/bin/env node

/**
 * Performance Dashboard Generator
 * Week 9-10: Performance Testing
 *
 * Generates an HTML dashboard from k6 JSON results
 *
 * Usage:
 *   node scripts/generate-dashboard.js results/20240127_120000
 *   node scripts/generate-dashboard.js results/20240127_120000 --output dashboard.html
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const resultsDir = args[0];
const outputFile = args.includes('--output')
  ? args[args.indexOf('--output') + 1]
  : path.join(resultsDir, 'dashboard.html');

if (!resultsDir) {
  console.error('Usage: node generate-dashboard.js <results-directory> [--output <file>]');
  process.exit(1);
}

if (!fs.existsSync(resultsDir)) {
  console.error(`Results directory not found: ${resultsDir}`);
  process.exit(1);
}

console.log('Generating performance dashboard...');
console.log(`Results directory: ${resultsDir}`);
console.log(`Output file: ${outputFile}`);

// Find all JSON result files
const jsonDir = path.join(resultsDir, 'json');
const jsonFiles = fs.existsSync(jsonDir)
  ? fs.readdirSync(jsonDir).filter(f => f.endsWith('.json'))
  : [];

if (jsonFiles.length === 0) {
  console.error('No JSON result files found in results directory');
  process.exit(1);
}

console.log(`Found ${jsonFiles.length} test result files`);

// Parse all results
const testResults = [];

for (const file of jsonFiles) {
  const filePath = path.join(jsonDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');

  // k6 outputs NDJSON (newline-delimited JSON), parse last line for summary
  const lines = content.trim().split('\n');
  const metrics = {};

  // Parse all metrics from NDJSON
  for (const line of lines) {
    try {
      const data = JSON.parse(line);
      if (data.type === 'Point') {
        const metricName = data.metric;
        if (!metrics[metricName]) {
          metrics[metricName] = {
            values: [],
            type: data.data.type
          };
        }
        metrics[metricName].values.push(data.data.value);
      }
    } catch (e) {
      // Skip invalid JSON lines
    }
  }

  // Calculate statistics
  const calculateStats = (values) => {
    if (!values || values.length === 0) return null;

    values.sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const min = values[0];
    const max = values[values.length - 1];
    const p50 = values[Math.floor(values.length * 0.50)];
    const p90 = values[Math.floor(values.length * 0.90)];
    const p95 = values[Math.floor(values.length * 0.95)];
    const p99 = values[Math.floor(values.length * 0.99)];

    return { avg, min, max, p50, p90, p95, p99, count: values.length };
  };

  const processedMetrics = {};
  for (const [name, data] of Object.entries(metrics)) {
    processedMetrics[name] = calculateStats(data.values);
  }

  testResults.push({
    name: file.replace('.json', '').replace(/-\d{8}_\d{6}/, ''),
    file: file,
    metrics: processedMetrics
  });
}

// Generate HTML dashboard
const html = generateDashboardHTML(testResults, resultsDir);

// Write to file
fs.writeFileSync(outputFile, html);

console.log(`✓ Dashboard generated: ${outputFile}`);
console.log(`  Open in browser: file://${path.resolve(outputFile)}`);

/**
 * Generate HTML dashboard
 */
function generateDashboardHTML(results, resultsDir) {
  const timestamp = new Date().toISOString();

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AuraOS Performance Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: #f5f7fa;
            color: #2c3e50;
            padding: 20px;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
        }

        header {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }

        h1 {
            color: #1a202c;
            font-size: 32px;
            margin-bottom: 10px;
        }

        .subtitle {
            color: #718096;
            font-size: 14px;
        }

        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .summary-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .summary-card .label {
            color: #718096;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }

        .summary-card .value {
            font-size: 32px;
            font-weight: 600;
            color: #1a202c;
        }

        .summary-card.success .value {
            color: #48bb78;
        }

        .summary-card.error .value {
            color: #f56565;
        }

        .test-results {
            display: grid;
            gap: 20px;
        }

        .test-card {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            overflow: hidden;
        }

        .test-header {
            background: #edf2f7;
            padding: 20px;
            border-bottom: 1px solid #e2e8f0;
        }

        .test-name {
            font-size: 20px;
            font-weight: 600;
            color: #1a202c;
        }

        .test-body {
            padding: 20px;
        }

        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
        }

        .metric {
            padding: 15px;
            background: #f7fafc;
            border-radius: 6px;
            border-left: 4px solid #4299e1;
        }

        .metric.good {
            border-left-color: #48bb78;
        }

        .metric.warning {
            border-left-color: #ed8936;
        }

        .metric.error {
            border-left-color: #f56565;
        }

        .metric-name {
            font-size: 12px;
            color: #718096;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
        }

        .metric-value {
            font-size: 24px;
            font-weight: 600;
            color: #1a202c;
            margin-bottom: 10px;
        }

        .metric-stats {
            display: flex;
            gap: 15px;
            font-size: 11px;
            color: #718096;
        }

        .metric-stats span {
            display: flex;
            flex-direction: column;
        }

        .metric-stats .stat-label {
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 2px;
        }

        .metric-stats .stat-value {
            font-weight: 600;
            color: #2d3748;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }

        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
        }

        th {
            background: #f7fafc;
            font-weight: 600;
            color: #2d3748;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .badge.success {
            background: #c6f6d5;
            color: #22543d;
        }

        .badge.warning {
            background: #feebc8;
            color: #7c2d12;
        }

        .badge.error {
            background: #fed7d7;
            color: #742a2a;
        }

        footer {
            margin-top: 40px;
            padding: 20px;
            text-align: center;
            color: #718096;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🚀 AuraOS Performance Dashboard</h1>
            <p class="subtitle">Generated ${timestamp} | Results: ${resultsDir}</p>
        </header>

        ${generateSummarySection(results)}

        <div class="test-results">
            ${results.map(test => generateTestSection(test)).join('\n')}
        </div>

        <footer>
            AuraOS HCM Platform - Performance Testing Suite
        </footer>
    </div>
</body>
</html>`;
}

/**
 * Generate summary section
 */
function generateSummarySection(results) {
  const totalTests = results.length;
  const totalRequests = results.reduce((sum, test) => {
    return sum + (test.metrics.http_reqs?.count || 0);
  }, 0);

  const avgDuration = results.reduce((sum, test) => {
    return sum + (test.metrics.http_req_duration?.avg || 0);
  }, 0) / totalTests;

  const totalErrors = results.reduce((sum, test) => {
    return sum + (test.metrics.http_req_failed?.count || 0);
  }, 0);

  return `
    <div class="summary">
        <div class="summary-card">
            <div class="label">Total Tests</div>
            <div class="value">${totalTests}</div>
        </div>
        <div class="summary-card">
            <div class="label">Total Requests</div>
            <div class="value">${totalRequests.toLocaleString()}</div>
        </div>
        <div class="summary-card success">
            <div class="label">Avg Response Time</div>
            <div class="value">${avgDuration.toFixed(0)}ms</div>
        </div>
        <div class="summary-card ${totalErrors > 0 ? 'error' : 'success'}">
            <div class="label">Total Errors</div>
            <div class="value">${totalErrors}</div>
        </div>
    </div>
  `;
}

/**
 * Generate test section
 */
function generateTestSection(test) {
  const keyMetrics = [
    { name: 'http_req_duration', label: 'Request Duration', unit: 'ms', threshold: 500 },
    { name: 'http_req_waiting', label: 'Time to First Byte', unit: 'ms', threshold: 300 },
    { name: 'http_req_failed', label: 'Failed Requests', unit: '%', threshold: 1, isRate: true },
    { name: 'http_reqs', label: 'Total Requests', unit: '', threshold: null, isCount: true },
  ];

  return `
    <div class="test-card">
        <div class="test-header">
            <div class="test-name">${formatTestName(test.name)}</div>
        </div>
        <div class="test-body">
            <div class="metrics-grid">
                ${keyMetrics.map(metric => generateMetricCard(test, metric)).join('\n')}
            </div>

            ${generateMetricsTable(test)}
        </div>
    </div>
  `;
}

/**
 * Generate metric card
 */
function generateMetricCard(test, metricDef) {
  const metric = test.metrics[metricDef.name];
  if (!metric) return '';

  let value, status;

  if (metricDef.isCount) {
    value = metric.count.toLocaleString();
    status = 'good';
  } else if (metricDef.isRate) {
    value = ((metric.avg || 0) * 100).toFixed(2);
    status = value < metricDef.threshold ? 'good' : 'error';
  } else {
    value = (metric.p95 || metric.avg || 0).toFixed(0);
    status = value < metricDef.threshold ? 'good' : value < metricDef.threshold * 1.5 ? 'warning' : 'error';
  }

  return `
    <div class="metric ${status}">
        <div class="metric-name">${metricDef.label}</div>
        <div class="metric-value">${value}${metricDef.unit}</div>
        ${!metricDef.isCount ? `
        <div class="metric-stats">
            <span>
                <span class="stat-label">Avg</span>
                <span class="stat-value">${(metric.avg || 0).toFixed(0)}${metricDef.unit}</span>
            </span>
            <span>
                <span class="stat-label">P95</span>
                <span class="stat-value">${(metric.p95 || 0).toFixed(0)}${metricDef.unit}</span>
            </span>
            <span>
                <span class="stat-label">P99</span>
                <span class="stat-value">${(metric.p99 || 0).toFixed(0)}${metricDef.unit}</span>
            </span>
        </div>
        ` : ''}
    </div>
  `;
}

/**
 * Generate metrics table
 */
function generateMetricsTable(test) {
  const allMetrics = Object.entries(test.metrics)
    .filter(([name]) => !name.startsWith('http_req'))
    .sort(([a], [b]) => a.localeCompare(b));

  if (allMetrics.length === 0) return '';

  return `
    <table>
        <thead>
            <tr>
                <th>Metric</th>
                <th>Avg</th>
                <th>Min</th>
                <th>Max</th>
                <th>P95</th>
                <th>P99</th>
                <th>Count</th>
            </tr>
        </thead>
        <tbody>
            ${allMetrics.map(([name, stats]) => `
                <tr>
                    <td><code>${name}</code></td>
                    <td>${(stats.avg || 0).toFixed(2)}</td>
                    <td>${(stats.min || 0).toFixed(2)}</td>
                    <td>${(stats.max || 0).toFixed(2)}</td>
                    <td>${(stats.p95 || 0).toFixed(2)}</td>
                    <td>${(stats.p99 || 0).toFixed(2)}</td>
                    <td>${(stats.count || 0).toLocaleString()}</td>
                </tr>
            `).join('\n')}
        </tbody>
    </table>
  `;
}

/**
 * Format test name for display
 */
function formatTestName(name) {
  return name
    .replace(/-/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}
