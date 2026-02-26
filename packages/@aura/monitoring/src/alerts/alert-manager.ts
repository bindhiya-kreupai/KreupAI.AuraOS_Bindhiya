/**
 * Alert Manager
 *
 * Evaluates metrics against alert rules and dispatches notifications
 * via configured channels (email, Slack webhook, PagerDuty).
 *
 * @module @aura/monitoring
 */

import { randomUUID } from 'crypto';
import {
  Alert,
  AlertChannel,
  AlertRule,
  AlertSeverity,
  ChannelConfig,
  DEFAULT_ALERT_RULES,
  EmailChannelConfig,
  PagerDutyChannelConfig,
  SlackChannelConfig,
  WebhookChannelConfig,
} from './alert-types';

// ---------------------------------------------------------------------------
// AlertManager
// ---------------------------------------------------------------------------

export interface AlertManagerOptions {
  /** Channel configurations keyed by channel type */
  channels?: Partial<Record<AlertChannel, ChannelConfig>>;
  /** Whether to load default built-in rules on construction */
  loadDefaultRules?: boolean;
  /** Callback invoked whenever an alert fires (useful for tests) */
  onAlert?: (alert: Alert) => void;
}

/**
 * AlertManager
 *
 * Usage:
 *   const manager = new AlertManager({
 *     channels: {
 *       slack: { type: 'slack', webhookUrl: process.env.SLACK_WEBHOOK! },
 *       pagerduty: { type: 'pagerduty', integrationKey: process.env.PD_KEY! },
 *     },
 *     loadDefaultRules: true,
 *   });
 *
 *   // Evaluate metrics periodically
 *   const metrics = { 'aura.api.error.rate': 8.5 };
 *   await manager.evaluate(metrics);
 */
export class AlertManager {
  private rules = new Map<string, AlertRule>();
  private activeAlerts = new Map<string, Alert>();
  private cooldowns = new Map<string, Date>();
  private channels: Partial<Record<AlertChannel, ChannelConfig>>;
  private readonly options: AlertManagerOptions;

  constructor(options: AlertManagerOptions = {}) {
    this.options = options;
    this.channels = options.channels ?? {};

    if (options.loadDefaultRules !== false) {
      for (const rule of DEFAULT_ALERT_RULES) {
        this.rules.set(rule.id, rule);
      }
    }
  }

  // -------------------------------------------------------------------------
  // Rule management
  // -------------------------------------------------------------------------

  /**
   * Add or update an alert rule.
   */
  defineRule(rule: AlertRule): void {
    this.rules.set(rule.id, rule);
  }

  /**
   * Remove an alert rule.
   */
  removeRule(id: string): void {
    this.rules.delete(id);
  }

  getRules(): AlertRule[] {
    return Array.from(this.rules.values());
  }

  // -------------------------------------------------------------------------
  // Evaluation
  // -------------------------------------------------------------------------

  /**
   * Evaluate a snapshot of metrics against all registered rules.
   * Fires alerts for any rule whose threshold is breached.
   * Resolves previously active alerts if the threshold is no longer breached.
   *
   * @param metrics  Map of metric name → current numeric value
   */
  async evaluate(metrics: Record<string, number>): Promise<Alert[]> {
    const firedAlerts: Alert[] = [];

    for (const rule of this.rules.values()) {
      const currentValue = metrics[rule.metric];
      if (currentValue === undefined) continue;

      const isBreached = this.evaluateCondition(currentValue, rule.condition, rule.threshold);

      if (isBreached) {
        // Check cooldown
        if (this.isInCooldown(rule.id)) continue;

        const alert = this.buildAlert(rule, currentValue);
        await this.sendAlert(alert);
        firedAlerts.push(alert);

        this.activeAlerts.set(rule.id, alert);
        this.setCooldown(rule.id, rule.cooldownSeconds ?? 300);
      } else {
        // Resolve if previously active
        const existing = this.activeAlerts.get(rule.id);
        if (existing && existing.status === 'firing') {
          existing.status = 'resolved';
          existing.resolvedAt = new Date();
          this.activeAlerts.set(rule.id, existing);
          console.info(`[AlertManager] Resolved: ${rule.name}`);
        }
      }
    }

    return firedAlerts;
  }

  // -------------------------------------------------------------------------
  // Dispatch
  // -------------------------------------------------------------------------

  /**
   * Send an alert through all configured channels.
   */
  async sendAlert(alert: Alert): Promise<void> {
    console.warn(
      `[AlertManager] ALERT [${alert.severity.toUpperCase()}] ${alert.ruleName}: ` +
      `${alert.metric} = ${alert.currentValue} (threshold: ${alert.condition} ${alert.threshold})`
    );

    // Invoke test callback if provided
    this.options.onAlert?.(alert);

    const sendPromises = alert.channels.map((channel) =>
      this.dispatchToChannel(channel, alert).catch((err) =>
        console.error(`[AlertManager] Failed to send via ${channel}:`, err)
      )
    );

    await Promise.allSettled(sendPromises);
  }

  private async dispatchToChannel(channel: AlertChannel, alert: Alert): Promise<void> {
    const config = this.channels[channel];

    switch (channel) {
      case 'slack':
        await this.sendSlack(alert, config as SlackChannelConfig | undefined);
        break;

      case 'pagerduty':
        await this.sendPagerDuty(alert, config as PagerDutyChannelConfig | undefined);
        break;

      case 'email':
        await this.sendEmail(alert, config as EmailChannelConfig | undefined);
        break;

      case 'webhook':
        await this.sendWebhook(alert, config as WebhookChannelConfig | undefined);
        break;

      case 'log':
      default:
        this.logAlert(alert);
        break;
    }
  }

  // -------------------------------------------------------------------------
  // Channel implementations
  // -------------------------------------------------------------------------

  private async sendSlack(
    alert: Alert,
    config?: SlackChannelConfig
  ): Promise<void> {
    const webhookUrl = config?.webhookUrl ?? process.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl) {
      console.warn('[AlertManager] Slack webhook URL not configured');
      return;
    }

    const emoji = this.severityEmoji(alert.severity);
    const mention =
      alert.severity === 'critical' && config?.mentionOnCritical
        ? `${config.mentionOnCritical} `
        : '';

    const body = {
      channel: config?.channel ?? '#alerts',
      username: 'AuraOS Monitor',
      icon_emoji: ':bell:',
      text: `${mention}${emoji} *${alert.ruleName}*`,
      attachments: [
        {
          color: this.severityColor(alert.severity),
          fields: [
            { title: 'Metric', value: alert.metric, short: true },
            {
              title: 'Value',
              value: `${alert.currentValue} (threshold: ${alert.condition} ${alert.threshold})`,
              short: true,
            },
            { title: 'Severity', value: alert.severity.toUpperCase(), short: true },
            { title: 'Time', value: alert.triggeredAt.toISOString(), short: true },
          ],
          footer: `AuraOS | Alert ID: ${alert.alertId}`,
        },
      ],
    };

    // In production, use fetch/axios; here we log the payload for stub
    console.info(`[AlertManager:slack] Would POST to ${webhookUrl}:`, JSON.stringify(body));
    // Actual HTTP call stub:
    // await fetch(webhookUrl, { method: 'POST', body: JSON.stringify(body),
    //   headers: { 'Content-Type': 'application/json' } });
  }

  private async sendPagerDuty(
    alert: Alert,
    config?: PagerDutyChannelConfig
  ): Promise<void> {
    const integrationKey = config?.integrationKey ?? process.env.PAGERDUTY_INTEGRATION_KEY;
    if (!integrationKey) {
      console.warn('[AlertManager] PagerDuty integration key not configured');
      return;
    }

    const pdSeverityMap: Record<AlertSeverity, string> = {
      critical: 'critical',
      warning:  'warning',
      info:     'info',
    };

    const body = {
      routing_key: integrationKey,
      event_action: 'trigger',
      dedup_key: `auraos-alert-${alert.ruleId}`,
      payload: {
        summary: `[${alert.severity.toUpperCase()}] ${alert.ruleName}: ${alert.metric} = ${alert.currentValue}`,
        severity: pdSeverityMap[alert.severity],
        source: 'AuraOS',
        custom_details: {
          metric: alert.metric,
          currentValue: alert.currentValue,
          threshold: `${alert.condition} ${alert.threshold}`,
          alertId: alert.alertId,
        },
      },
    };

    // PagerDuty Events v2 API stub
    console.info('[AlertManager:pagerduty] Would POST to PD Events v2:', JSON.stringify(body));
    // await fetch('https://events.pagerduty.com/v2/enqueue', {
    //   method: 'POST', body: JSON.stringify(body),
    //   headers: { 'Content-Type': 'application/json' } });
  }

  private async sendEmail(
    alert: Alert,
    config?: EmailChannelConfig
  ): Promise<void> {
    const recipients = config?.recipients ?? [];
    if (recipients.length === 0) {
      const defaultRecipients = process.env.ALERT_EMAIL_RECIPIENTS;
      if (!defaultRecipients) {
        console.warn('[AlertManager] No email recipients configured');
        return;
      }
      recipients.push(...defaultRecipients.split(',').map((r) => r.trim()));
    }

    // Email send stub — integrate with @aura/notification or nodemailer in production
    console.info(
      `[AlertManager:email] Would send alert to ${recipients.join(', ')}: ${alert.ruleName}`
    );
  }

  private async sendWebhook(
    alert: Alert,
    config?: WebhookChannelConfig
  ): Promise<void> {
    if (!config?.url) {
      console.warn('[AlertManager] Webhook URL not configured');
      return;
    }

    console.info(`[AlertManager:webhook] Would POST to ${config.url}:`, JSON.stringify(alert));
    // await fetch(config.url, { method: config.method ?? 'POST',
    //   body: JSON.stringify(alert), headers: { 'Content-Type': 'application/json', ...config.headers } });
  }

  private logAlert(alert: Alert): void {
    const level = alert.severity === 'critical' ? 'error' : 'warn';
    console[level](
      `[Alert] [${alert.severity.toUpperCase()}] ${alert.ruleName}: ` +
        `${alert.metric} = ${alert.currentValue} (${alert.condition} ${alert.threshold})`
    );
  }

  // -------------------------------------------------------------------------
  // Query
  // -------------------------------------------------------------------------

  getActiveAlerts(): Alert[] {
    return Array.from(this.activeAlerts.values()).filter((a) => a.status === 'firing');
  }

  getAlertHistory(): Alert[] {
    return Array.from(this.activeAlerts.values());
  }

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  private evaluateCondition(
    value: number,
    condition: string,
    threshold: number
  ): boolean {
    switch (condition) {
      case '>':  return value > threshold;
      case '>=': return value >= threshold;
      case '<':  return value < threshold;
      case '<=': return value <= threshold;
      case '==': return value === threshold;
      case '!=': return value !== threshold;
      default:   return false;
    }
  }

  private buildAlert(rule: AlertRule, currentValue: number): Alert {
    return {
      alertId: randomUUID(),
      ruleId: rule.id,
      ruleName: rule.name,
      severity: rule.severity,
      metric: rule.metric,
      currentValue,
      threshold: rule.threshold,
      condition: rule.condition,
      triggeredAt: new Date(),
      status: 'firing',
      channels: rule.channels,
      message: `${rule.name}: ${rule.metric} is ${currentValue} (threshold: ${rule.condition} ${rule.threshold})`,
    };
  }

  private isInCooldown(ruleId: string): boolean {
    const cooldownUntil = this.cooldowns.get(ruleId);
    if (!cooldownUntil) return false;
    return new Date() < cooldownUntil;
  }

  private setCooldown(ruleId: string, seconds: number): void {
    const until = new Date(Date.now() + seconds * 1000);
    this.cooldowns.set(ruleId, until);
  }

  private severityColor(severity: AlertSeverity): string {
    return { critical: '#FF0000', warning: '#FFA500', info: '#0000FF' }[severity];
  }

  private severityEmoji(severity: AlertSeverity): string {
    return { critical: ':red_circle:', warning: ':warning:', info: ':information_source:' }[severity];
  }
}

// ---------------------------------------------------------------------------
// Singleton
// ---------------------------------------------------------------------------

let alertManagerInstance: AlertManager | null = null;

export function getAlertManager(options?: AlertManagerOptions): AlertManager {
  if (!alertManagerInstance) {
    alertManagerInstance = new AlertManager(options);
  }
  return alertManagerInstance;
}
