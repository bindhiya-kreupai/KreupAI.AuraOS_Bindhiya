# Requirement Analysis Reference

## Table of Contents

1. Input Classification
2. Requirement Extraction Framework
3. Gap Analysis Methodology
4. Implicit Requirement Detection
5. Categorization Guidelines
6. Requirement Document Template

---

## 1. Input Classification

### Input Type Detection

```
INPUT CLASSIFICATION MATRIX
===========================
Type              | Indicators                           | Analysis Mode
------------------|--------------------------------------|------------------
Plain Requirement | Informal language, brief description | Full Expansion
RFP/RFQ           | Formal structure, sections, criteria | Extraction + Response
Feature Request   | Specific enhancement, user story     | Enhancement Mode
Bug/Issue         | Problem statement, expected behavior | Fix Analysis
Enhancement       | Existing system, improvement request | Delta Analysis
```

### Processing Approach by Input Type

**Plain Requirement** (Maximum Expansion):

- Apply full expansion checklist
- Inject industry standards
- Add implicit requirements
- Recommend best practices
- Suggest scalability features

**RFP/RFQ Document**:

- Extract stated requirements
- Map to evaluation criteria
- Identify mandatory vs optional
- Note compliance requirements
- List submission requirements

**Feature Request**:

- Understand current state
- Define target state
- Identify dependencies
- Estimate impact scope

---

## 2. Requirement Extraction Framework

### Explicit Requirement Extraction

Parse input for:

```
EXTRACTION CATEGORIES
=====================
1. FUNCTIONAL REQUIREMENTS
   • User-facing features
   • Business processes
   • Data operations (CRUD)
   • Workflows and automation
   • Reporting and dashboards
   • Integrations

2. NON-FUNCTIONAL REQUIREMENTS
   • Performance (response time, throughput)
   • Scalability (users, data volume)
   • Security (authentication, authorization)
   • Availability (uptime, recovery)
   • Compliance (regulations, standards)

3. CONSTRAINTS
   • Technology constraints
   • Budget limitations
   • Timeline requirements
   • Resource availability
   • Existing system dependencies

4. ASSUMPTIONS
   • Infrastructure assumptions
   • User behavior assumptions
   • Data availability
   • Third-party service availability
```

### Requirement Parsing Patterns

| Pattern                        | Example                  | Extraction              |
| ------------------------------ | ------------------------ | ----------------------- |
| "must have" / "shall"          | "System must have login" | Mandatory               |
| "should" / "expected"          | "Should support reports" | Essential               |
| "nice to have" / "if possible" | "Nice to have dark mode" | Good-to-Have            |
| "compliance with"              | "Compliance with GDPR"   | Mandatory (Compliance)  |
| "integration with"             | "Integration with SAP"   | Integration Requirement |
| "within X seconds"             | "Load within 2 seconds"  | Performance Requirement |
| "support N users"              | "Support 10,000 users"   | Scalability Requirement |

---

## 3. Gap Analysis Methodology

### Standard Gap Categories

```
GAP IDENTIFICATION FRAMEWORK
============================

1. FUNCTIONAL GAPS
   □ Missing CRUD operations
   □ Incomplete workflows
   □ Missing user roles
   □ Undefined edge cases
   □ Missing error handling
   □ No offline capability mentioned

2. SECURITY GAPS
   □ No authentication method specified
   □ No authorization model
   □ No data encryption requirements
   □ No audit trail requirements
   □ No session management
   □ No password policy

3. INTEGRATION GAPS
   □ No API specifications
   □ Missing data format definitions
   □ No sync frequency defined
   □ No error handling for integrations
   □ Missing authentication for APIs

4. OPERATIONAL GAPS
   □ No backup requirements
   □ No disaster recovery plan
   □ No monitoring requirements
   □ No logging specifications
   □ No deployment strategy
   □ No maintenance window

5. USER EXPERIENCE GAPS
   □ No accessibility requirements
   □ No mobile responsiveness
   □ No localization needs
   □ No performance expectations
   □ No browser compatibility
```

### Gap Severity Classification

| Severity | Description                    | Action              |
| -------- | ------------------------------ | ------------------- |
| Critical | System cannot function without | Add as Mandatory    |
| High     | Major functionality impacted   | Add as Essential    |
| Medium   | User experience affected       | Add as Essential    |
| Low      | Enhancement opportunity        | Add as Good-to-Have |

---

## 4. Implicit Requirement Detection

### Domain-Based Implicit Requirements

**E-Commerce Domain**:

- Shopping cart persistence
- Inventory synchronization
- Payment gateway integration
- Order tracking
- Tax calculation
- Shipping integration
- Return/refund workflow

**Enterprise SaaS**:

- Multi-tenancy
- Role-based access control
- SSO integration
- Audit logging
- Data export/import
- API access
- White-labeling options

**Healthcare**:

- HIPAA compliance
- Patient consent management
- Data encryption at rest
- Access audit trails
- Emergency access override
- Data retention policies

**Finance**:

- PCI-DSS compliance
- Transaction logging
- Fraud detection hooks
- Reconciliation reports
- Regulatory reporting
- Data residency

### Universal Implicit Requirements

```
ALWAYS INCLUDE UNLESS EXPLICITLY EXCLUDED
==========================================
1. User Management
   • User registration
   • Profile management
   • Password reset
   • Account deactivation

2. Security Basics
   • HTTPS enforcement
   • Input validation
   • SQL injection prevention
   • XSS protection
   • CSRF protection

3. Data Management
   • Data backup
   • Data export
   • Data deletion
   • Audit trails

4. System Health
   • Health check endpoint
   • Error logging
   • Performance monitoring
   • Alerting mechanism

5. User Experience
   • Loading indicators
   • Error messages
   • Success confirmations
   • Form validation feedback
```

---

## 5. Categorization Guidelines

### MoSCoW Prioritization

```
CATEGORIZATION CRITERIA
=======================

MANDATORY (Must Have)
---------------------
• System cannot go live without it
• Legal/compliance requirement
• Core business process
• Security essentials
• Data integrity requirements

Examples:
- User authentication
- Core business transactions
- Regulatory compliance features
- Data backup mechanism

ESSENTIAL (Should Have)
-----------------------
• Important for user satisfaction
• Significant business value
• Common user expectations
• Operational efficiency

Examples:
- Advanced search
- Reporting dashboards
- Notification system
- Mobile responsiveness

GOOD-TO-HAVE (Could Have)
-------------------------
• Enhanced user experience
• Competitive advantage
• Future-proofing
• Nice features

Examples:
- Dark mode
- AI-powered suggestions
- Social login
- Advanced analytics
- Gamification elements

EXCLUDED (Won't Have)
---------------------
• Out of current scope
• Future phase consideration
• Budget constraints
• Technical limitations

Document explicitly to manage expectations
```

### Priority Scoring Matrix

| Factor               | Weight | Score (1-5) |
| -------------------- | ------ | ----------- |
| Business Value       | 30%    |             |
| User Impact          | 25%    |             |
| Technical Complexity | 15%    |             |
| Dependencies         | 15%    |             |
| Risk if Excluded     | 15%    |             |

**Priority Score** = Σ(Weight × Score)

---

## 6. Requirement Document Template

### Document Structure

```
DETAILED REQUIREMENTS DOCUMENT
==============================

1. DOCUMENT CONTROL
   • Version
   • Date
   • Author
   • Reviewers
   • Approval status

2. EXECUTIVE SUMMARY
   • Project overview
   • Key objectives
   • Scope summary
   • Critical success factors

3. REQUIREMENT SOURCES
   • Input documents analyzed
   • Stakeholder interviews
   • Industry standards applied
   • Assumptions made

4. FUNCTIONAL REQUIREMENTS
   4.1 Core Features (Mandatory)
   4.2 Supporting Features (Essential)
   4.3 Enhancement Features (Good-to-Have)

5. NON-FUNCTIONAL REQUIREMENTS
   5.1 Performance
   5.2 Security
   5.3 Scalability
   5.4 Availability
   5.5 Compliance

6. INTEGRATION REQUIREMENTS
   6.1 Internal Systems
   6.2 External Systems
   6.3 Third-party Services

7. DATA REQUIREMENTS
   7.1 Data Entities
   7.2 Data Migration
   7.3 Data Retention
   7.4 Data Privacy

8. USER INTERFACE REQUIREMENTS
   8.1 Accessibility
   8.2 Responsiveness
   8.3 Localization
   8.4 Branding

9. CONSTRAINTS AND ASSUMPTIONS
   9.1 Technical Constraints
   9.2 Business Constraints
   9.3 Assumptions

10. TRACEABILITY MATRIX
    • Requirement ID
    • Source
    • Priority
    • Status
    • Related Requirements

11. GLOSSARY

12. APPENDICES
```

### Requirement Entry Format

```
REQUIREMENT TEMPLATE
====================
ID: REQ-[MODULE]-[NUMBER]
Title: [Short descriptive title]
Category: Mandatory | Essential | Good-to-Have
Type: Functional | Non-Functional | Constraint

Description:
[Detailed description of the requirement]

Acceptance Criteria:
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

Source: [RFP Section / User Request / Industry Standard]
Dependencies: [Related requirement IDs]
Priority Score: [Calculated score]
Notes: [Additional context or considerations]
```
