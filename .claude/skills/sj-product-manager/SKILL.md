---
name: sj-product-manager
description: 'Expert AI Product Manager for transforming plain requirements or RFPs into comprehensive project documentation. Use when (1) Analyzing plain text requirements or RFP/RFQ/EOI documents, (2) Creating detailed requirement lists with mandatory/essential/good-to-have categorization, (3) Planning resource requirements considering AI-assisted development tools like Claude Code MAX, (4) Generating technical requirement specifications, (5) Creating Product Requirement Documents (PRD), (6) Developing solution design documents, (7) Building detailed proposal timelines and cost estimates, (8) Expanding vague requirements into comprehensive specifications, (9) Identifying implicit requirements and gaps in project requests.'
---

# SJ Product Manager

Expert AI Product Manager system for deep analysis of requirements and generation of comprehensive project documentation. Transforms plain requirements or RFP documents into complete, professional deliverables.

## Core Philosophy

**Deep Thinking First**: Before generating any output, analyze requirements thoroughly:

- What is explicitly stated?
- What is implied but not stated?
- What industry standards apply?
- What are common pitfalls in this domain?
- What would a senior product manager recommend?

## Reference Files

Load these references based on output type needed:

| Reference                            | When to Load                                                                      |
| ------------------------------------ | --------------------------------------------------------------------------------- |
| `references/requirement-analysis.md` | For requirement categorization, gap analysis, implicit requirement detection      |
| `references/resource-planning.md`    | For team composition, AI-assisted development considerations, skill matrix        |
| `references/technical-specs.md`      | For technical requirement templates, architecture decisions, tech stack selection |
| `references/prd-template.md`         | For PRD structure, user stories, acceptance criteria, success metrics             |
| `references/design-document.md`      | For system design, architecture diagrams, component specifications                |
| `references/timeline-costing.md`     | For estimation formulas, pricing models, milestone planning                       |

## Workflow Overview

```
INPUT ANALYSIS → DEEP THINKING → MULTI-ARTIFACT GENERATION
      ↓
┌─────────────────────────────────────────────────────────────────────┐
│  1. Requirement Analysis                                            │
│     • Parse input (plain text / RFP / RFQ)                         │
│     • Extract explicit requirements                                 │
│     • Identify implicit requirements                                │
│     • Categorize: Mandatory / Essential / Good-to-Have             │
│                                                                     │
│  2. Deep Expansion (For Plain Requirements)                        │
│     • Industry best practices injection                             │
│     • Common feature recommendations                                │
│     • Security/compliance considerations                            │
│     • Scalability and future-proofing                              │
│                                                                     │
│  3. Artifact Generation (6 Separate Documents)                     │
│     • Detailed Requirement List                                     │
│     • Resource Requirement                                          │
│     • Technical Requirement                                         │
│     • Product Requirement Document (PRD)                           │
│     • Design Document                                               │
│     • Timeline & Cost Proposal                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Output Artifacts

Generate **6 separate documents** as artifacts:

### 1. Detailed Requirement List (DOCX/MD)

**Filename**: `{project}_requirements.docx`

- Explicit requirements (from input)
- Implicit requirements (deduced)
- Industry-standard requirements
- Categorization: Mandatory | Essential | Good-to-Have
- Requirement traceability matrix

### 2. Resource Requirement (DOCX/MD)

**Filename**: `{project}_resources.docx`

- Team composition with AI-augmented roles
- Skill matrix requirements
- Claude Code MAX productivity considerations
- Resource allocation by phase
- External dependencies

### 3. Technical Requirement (DOCX/MD)

**Filename**: `{project}_technical.docx`

- Technology stack recommendations
- Architecture requirements
- Integration specifications
- Security requirements
- Performance benchmarks
- Compliance requirements

### 4. Product Requirement Document - PRD (DOCX/MD)

**Filename**: `{project}_prd.docx`

- Product vision and objectives
- User personas and journeys
- Feature specifications with user stories
- Acceptance criteria
- Success metrics and KPIs
- Out-of-scope items

### 5. Design Document (DOCX/MD)

**Filename**: `{project}_design.docx`

- System architecture
- Component specifications
- Data models and schemas
- API specifications
- UI/UX guidelines
- Security design

### 6. Timeline & Cost Proposal (DOCX/MD)

**Filename**: `{project}_proposal.docx`

- Project phases breakdown
- Milestone definitions
- Effort estimation
- Cost breakdown
- Risk-adjusted timeline
- Payment milestones

## Execution Instructions

### Step 1: Input Analysis

1. **Identify Input Type**:
   - Plain text requirement → Full expansion mode
   - RFP/RFQ document → Extraction and response mode
   - Feature request → Enhancement mode

2. **Extract Core Information**:
   ```
   PROJECT CONTEXT EXTRACTION
   ==========================
   • Project name/identifier
   • Domain/industry
   • Target users/audience
   • Scale expectations
   • Timeline expectations
   • Budget indicators
   • Compliance needs
   • Integration requirements
   ```

### Step 2: Requirement Expansion

For **plain requirements**, apply maximum thinking to expand:

```
EXPANSION CHECKLIST
===================
□ Core functional requirements
□ Authentication & authorization
□ User management
□ Data management
□ Reporting & analytics
□ Notification system
□ Audit trails
□ Backup & recovery
□ Mobile responsiveness
□ Accessibility (WCAG)
□ Localization (i18n)
□ Performance requirements
□ Security requirements
□ Compliance requirements
□ Integration touchpoints
□ Admin/management console
□ Documentation needs
□ Training requirements
□ Support requirements
□ Data migration needs
```

### Step 3: Generate Artifacts

**IMPORTANT**: Generate each artifact as a **separate file**. Use the docx skill for professional documents or markdown for technical teams.

**Artifact Generation Order**:

1. Requirements → Foundation for all other docs
2. Technical Requirements → Informs resources and design
3. PRD → Business perspective
4. Design Document → Technical blueprint
5. Resource Requirements → Team planning
6. Timeline & Cost → Commercial proposal

### Step 4: AI-Assisted Development Considerations

When planning resources, factor in:

```
AI PRODUCTIVITY MULTIPLIERS (Claude Code MAX)
=============================================
Task Type                    | Traditional | AI-Assisted | Multiplier
-----------------------------|-------------|-------------|------------
Boilerplate code             | 8 hrs       | 2 hrs       | 4x
API development              | 16 hrs      | 6 hrs       | 2.7x
Database schema              | 8 hrs       | 2 hrs       | 4x
Unit tests                   | 16 hrs      | 4 hrs       | 4x
Documentation                | 8 hrs       | 2 hrs       | 4x
Code review prep             | 4 hrs       | 1 hr        | 4x
Bug fixing (routine)         | 8 hrs       | 3 hrs       | 2.7x
Complex business logic       | 16 hrs      | 12 hrs      | 1.3x
UI component creation        | 12 hrs      | 4 hrs       | 3x
Integration development      | 20 hrs      | 10 hrs      | 2x

Average Productivity Gain: 2.5x - 3x
Recommended Team Size Reduction: 30-40%
Quality Improvement: Fewer bugs, better documentation
```

## Quality Standards

**Before Finalizing Each Artifact**:

- [ ] All explicit requirements addressed
- [ ] Implicit requirements identified and included
- [ ] Industry best practices incorporated
- [ ] No contradictions between artifacts
- [ ] Proper categorization (Mandatory/Essential/Good-to-Have)
- [ ] Realistic timelines and costs
- [ ] AI-augmented resource planning applied
- [ ] Professional formatting and structure

## Domain Adaptations

Adapt output based on detected domain:

| Domain         | Special Considerations                                     |
| -------------- | ---------------------------------------------------------- |
| **Healthcare** | HIPAA, patient data, EMR integration, audit trails         |
| **Finance**    | PCI-DSS, transaction security, regulatory compliance       |
| **Education**  | Student data protection, LMS integration, accessibility    |
| **E-commerce** | Payment gateways, inventory, scalability, fraud prevention |
| **Enterprise** | SSO, role-based access, multi-tenant, audit logs           |
| **Government** | Data localization, accessibility, transparency             |
| **SaaS**       | Multi-tenancy, subscription management, API-first          |

## Output Quality Checklist

For each generated artifact:

```
QUALITY GATES
=============
□ Document has clear structure and headers
□ Content is specific, not generic
□ Numbers and estimates are justified
□ Assumptions are documented
□ Risks are identified
□ Dependencies are listed
□ Acceptance criteria are measurable
□ Professional tone maintained
□ No placeholder text remaining
□ Cross-references between documents are consistent
```
