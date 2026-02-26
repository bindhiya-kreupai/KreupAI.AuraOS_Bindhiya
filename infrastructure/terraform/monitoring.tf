################################################################################
# AuraOS Enterprise HCM — CloudWatch Monitoring & Alerting
#
# Provisions:
#   - SNS topics for alert routing
#   - CloudWatch dashboards (overview + service health)
#   - CloudWatch alarms: CPU, memory, error rate, latency P95, DB connections
#   - Log groups per service with retention policies
################################################################################

################################################################################
# SNS — Alert Topics
################################################################################

resource "aws_sns_topic" "critical_alerts" {
  name = "${local.name_prefix}-critical-alerts"
  tags = { Name = "${local.name_prefix}-critical-alerts", Severity = "critical" }
}

resource "aws_sns_topic" "warning_alerts" {
  name = "${local.name_prefix}-warning-alerts"
  tags = { Name = "${local.name_prefix}-warning-alerts", Severity = "warning" }
}

resource "aws_sns_topic_subscription" "critical_email" {
  topic_arn = aws_sns_topic.critical_alerts.arn
  protocol  = "email"
  endpoint  = "oncall@auraos.app"
}

resource "aws_sns_topic_subscription" "warning_email" {
  topic_arn = aws_sns_topic.warning_alerts.arn
  protocol  = "email"
  endpoint  = "platform-team@auraos.app"
}

################################################################################
# CloudWatch Log Groups — per service, 30-day retention (7 days for dev)
################################################################################

locals {
  log_retention_days = var.environment == "production" ? 90 : (var.environment == "staging" ? 30 : 7)
}

resource "aws_cloudwatch_log_group" "web" {
  name              = "/auraos/${var.environment}/web"
  retention_in_days = local.log_retention_days
  tags              = { Service = "web", Environment = var.environment }
}

resource "aws_cloudwatch_log_group" "api" {
  name              = "/auraos/${var.environment}/api"
  retention_in_days = local.log_retention_days
  tags              = { Service = "api", Environment = var.environment }
}

resource "aws_cloudwatch_log_group" "payroll_service" {
  name              = "/auraos/${var.environment}/payroll-service"
  retention_in_days = local.log_retention_days
  tags              = { Service = "payroll", Environment = var.environment }
}

resource "aws_cloudwatch_log_group" "hr_service" {
  name              = "/auraos/${var.environment}/hr-service"
  retention_in_days = local.log_retention_days
  tags              = { Service = "hr", Environment = var.environment }
}

resource "aws_cloudwatch_log_group" "leave_service" {
  name              = "/auraos/${var.environment}/leave-service"
  retention_in_days = local.log_retention_days
  tags              = { Service = "leave", Environment = var.environment }
}

resource "aws_cloudwatch_log_group" "attendance_service" {
  name              = "/auraos/${var.environment}/attendance-service"
  retention_in_days = local.log_retention_days
  tags              = { Service = "attendance", Environment = var.environment }
}

resource "aws_cloudwatch_log_group" "notification_service" {
  name              = "/auraos/${var.environment}/notification-service"
  retention_in_days = local.log_retention_days
  tags              = { Service = "notifications", Environment = var.environment }
}

################################################################################
# CloudWatch Alarms — ECS (CPU & Memory)
################################################################################

resource "aws_cloudwatch_metric_alarm" "ecs_cpu_high" {
  alarm_name          = "${local.name_prefix}-ecs-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = 60
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "ECS cluster CPU utilisation exceeded 80%"
  treat_missing_data  = "notBreaching"

  dimensions = {
    ClusterName = aws_ecs_cluster.main.name
  }

  alarm_actions = [aws_sns_topic.critical_alerts.arn]
  ok_actions    = [aws_sns_topic.warning_alerts.arn]

  tags = { Name = "${local.name_prefix}-ecs-cpu-high" }
}

resource "aws_cloudwatch_metric_alarm" "ecs_memory_high" {
  alarm_name          = "${local.name_prefix}-ecs-memory-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "MemoryUtilization"
  namespace           = "AWS/ECS"
  period              = 60
  statistic           = "Average"
  threshold           = 85
  alarm_description   = "ECS cluster memory utilisation exceeded 85%"
  treat_missing_data  = "notBreaching"

  dimensions = {
    ClusterName = aws_ecs_cluster.main.name
  }

  alarm_actions = [aws_sns_topic.critical_alerts.arn]
  ok_actions    = [aws_sns_topic.warning_alerts.arn]

  tags = { Name = "${local.name_prefix}-ecs-memory-high" }
}

################################################################################
# CloudWatch Alarms — ALB (Error Rate & Latency)
################################################################################

resource "aws_cloudwatch_metric_alarm" "alb_error_rate_high" {
  alarm_name          = "${local.name_prefix}-alb-error-rate-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 5
  threshold           = 1
  alarm_description   = "ALB 5xx error rate exceeded 1% over 5 minutes"
  treat_missing_data  = "notBreaching"

  metric_query {
    id          = "error_rate"
    expression  = "100 * m2 / (m1 + m2)"
    label       = "5xx Error Rate (%)"
    return_data = true
  }

  metric_query {
    id = "m1"
    metric {
      metric_name = "RequestCount"
      namespace   = "AWS/ApplicationELB"
      period      = 60
      stat        = "Sum"
      dimensions = {
        LoadBalancer = aws_lb.main.arn_suffix
      }
    }
  }

  metric_query {
    id = "m2"
    metric {
      metric_name = "HTTPCode_ELB_5XX_Count"
      namespace   = "AWS/ApplicationELB"
      period      = 60
      stat        = "Sum"
      dimensions = {
        LoadBalancer = aws_lb.main.arn_suffix
      }
    }
  }

  alarm_actions = [aws_sns_topic.critical_alerts.arn]
  ok_actions    = [aws_sns_topic.warning_alerts.arn]

  tags = { Name = "${local.name_prefix}-alb-error-rate-high" }
}

resource "aws_cloudwatch_metric_alarm" "alb_latency_p95_high" {
  alarm_name          = "${local.name_prefix}-alb-latency-p95-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "TargetResponseTime"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  extended_statistic  = "p95"
  threshold           = 2       # 2 seconds P95 latency threshold
  alarm_description   = "ALB target P95 response time exceeded 2 seconds"
  treat_missing_data  = "notBreaching"

  dimensions = {
    LoadBalancer = aws_lb.main.arn_suffix
  }

  alarm_actions = [aws_sns_topic.warning_alerts.arn]
  ok_actions    = [aws_sns_topic.warning_alerts.arn]

  tags = { Name = "${local.name_prefix}-alb-latency-p95-high" }
}

################################################################################
# CloudWatch Alarms — RDS (CPU, Storage, Connections)
################################################################################

resource "aws_cloudwatch_metric_alarm" "rds_cpu_high" {
  alarm_name          = "${local.name_prefix}-rds-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = 60
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "RDS CPU utilisation exceeded 80%"
  treat_missing_data  = "notBreaching"

  dimensions = { DBInstanceIdentifier = aws_db_instance.main.identifier }

  alarm_actions = [aws_sns_topic.critical_alerts.arn]

  tags = { Name = "${local.name_prefix}-rds-cpu-high" }
}

resource "aws_cloudwatch_metric_alarm" "rds_storage_low" {
  alarm_name          = "${local.name_prefix}-rds-storage-low"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 2
  metric_name         = "FreeStorageSpace"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 10737418240  # 10 GB in bytes
  alarm_description   = "RDS free storage space below 10 GB"
  treat_missing_data  = "notBreaching"

  dimensions = { DBInstanceIdentifier = aws_db_instance.main.identifier }

  alarm_actions = [aws_sns_topic.warning_alerts.arn]

  tags = { Name = "${local.name_prefix}-rds-storage-low" }
}

resource "aws_cloudwatch_metric_alarm" "rds_connections_high" {
  alarm_name          = "${local.name_prefix}-rds-connections-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "DatabaseConnections"
  namespace           = "AWS/RDS"
  period              = 60
  statistic           = "Average"
  threshold           = 500
  alarm_description   = "RDS connection count exceeded 500 — possible connection pool leak"
  treat_missing_data  = "notBreaching"

  dimensions = { DBInstanceIdentifier = aws_db_instance.main.identifier }

  alarm_actions = [aws_sns_topic.warning_alerts.arn]

  tags = { Name = "${local.name_prefix}-rds-connections-high" }
}

################################################################################
# CloudWatch Alarms — ElastiCache
################################################################################

resource "aws_cloudwatch_metric_alarm" "redis_cpu_high" {
  alarm_name          = "${local.name_prefix}-redis-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "EngineCPUUtilization"
  namespace           = "AWS/ElastiCache"
  period              = 60
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "Redis engine CPU utilisation exceeded 80%"
  treat_missing_data  = "notBreaching"

  dimensions = { ReplicationGroupId = aws_elasticache_replication_group.main.id }

  alarm_actions = [aws_sns_topic.warning_alerts.arn]

  tags = { Name = "${local.name_prefix}-redis-cpu-high" }
}

################################################################################
# CloudWatch Dashboard — Overview
################################################################################

resource "aws_cloudwatch_dashboard" "overview" {
  dashboard_name = "${local.name_prefix}-overview"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0; y = 0; width = 12; height = 6
        properties = {
          title  = "ECS CPU & Memory"
          period = 60
          stat   = "Average"
          metrics = [
            ["AWS/ECS", "CPUUtilization",    "ClusterName", aws_ecs_cluster.main.name],
            ["AWS/ECS", "MemoryUtilization", "ClusterName", aws_ecs_cluster.main.name],
          ]
          view = "timeSeries"
        }
      },
      {
        type   = "metric"
        x      = 12; y = 0; width = 12; height = 6
        properties = {
          title  = "ALB Request Count & 5xx Errors"
          period = 60
          metrics = [
            ["AWS/ApplicationELB", "RequestCount",          "LoadBalancer", aws_lb.main.arn_suffix],
            ["AWS/ApplicationELB", "HTTPCode_ELB_5XX_Count","LoadBalancer", aws_lb.main.arn_suffix],
          ]
          view = "timeSeries"
        }
      },
      {
        type   = "metric"
        x      = 0; y = 6; width = 12; height = 6
        properties = {
          title  = "ALB Latency (P50 / P95 / P99)"
          period = 60
          metrics = [
            ["AWS/ApplicationELB", "TargetResponseTime", "LoadBalancer", aws_lb.main.arn_suffix, { stat = "p50", label = "P50" }],
            ["AWS/ApplicationELB", "TargetResponseTime", "LoadBalancer", aws_lb.main.arn_suffix, { stat = "p95", label = "P95" }],
            ["AWS/ApplicationELB", "TargetResponseTime", "LoadBalancer", aws_lb.main.arn_suffix, { stat = "p99", label = "P99" }],
          ]
          view = "timeSeries"
        }
      },
      {
        type   = "metric"
        x      = 12; y = 6; width = 12; height = 6
        properties = {
          title  = "RDS CPU & Connections"
          period = 60
          metrics = [
            ["AWS/RDS", "CPUUtilization",      "DBInstanceIdentifier", aws_db_instance.main.identifier],
            ["AWS/RDS", "DatabaseConnections", "DBInstanceIdentifier", aws_db_instance.main.identifier],
          ]
          view = "timeSeries"
        }
      },
      {
        type   = "alarm"
        x      = 0; y = 12; width = 24; height = 4
        properties = {
          title  = "Active Alarms"
          alarms = [
            aws_cloudwatch_metric_alarm.ecs_cpu_high.arn,
            aws_cloudwatch_metric_alarm.ecs_memory_high.arn,
            aws_cloudwatch_metric_alarm.alb_error_rate_high.arn,
            aws_cloudwatch_metric_alarm.alb_latency_p95_high.arn,
            aws_cloudwatch_metric_alarm.rds_cpu_high.arn,
            aws_cloudwatch_metric_alarm.rds_storage_low.arn,
          ]
        }
      }
    ]
  })
}

################################################################################
# Outputs
################################################################################

output "critical_alerts_topic_arn" {
  value       = aws_sns_topic.critical_alerts.arn
  description = "SNS topic ARN for critical alerts"
}

output "warning_alerts_topic_arn" {
  value       = aws_sns_topic.warning_alerts.arn
  description = "SNS topic ARN for warning alerts"
}

output "dashboard_url" {
  value       = "https://${data.aws_region.current.name}.console.aws.amazon.com/cloudwatch/home?region=${data.aws_region.current.name}#dashboards:name=${aws_cloudwatch_dashboard.overview.dashboard_name}"
  description = "CloudWatch dashboard URL"
}
