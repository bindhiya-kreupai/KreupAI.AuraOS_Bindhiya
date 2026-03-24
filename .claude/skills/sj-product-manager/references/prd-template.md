# PRD (Product Requirement Document) Reference

## Table of Contents

1. PRD Purpose and Structure
2. Vision and Objectives
3. User Personas and Journeys
4. Feature Specifications
5. User Stories and Acceptance Criteria
6. PRD Document Template

---

## 1. PRD Purpose and Structure

### What Makes a Great PRD

```
PRD QUALITY CRITERIA
====================

CLARITY
• Unambiguous language
• Specific, measurable criteria
• No room for interpretation
• Clear scope boundaries

COMPLETENESS
• All features documented
• Edge cases addressed
• Error scenarios covered
• Success metrics defined

TRACEABILITY
• Requirements linked to business goals
• User stories linked to features
• Acceptance criteria testable
• Dependencies documented

ACTIONABILITY
• Development-ready specifications
• Clear priorities
• Realistic timelines
• Resource considerations
```

### PRD vs Other Documents

```
DOCUMENT RELATIONSHIP
=====================

PRD (Product Focus)
├── What to build
├── Why to build it
├── For whom
├── Success criteria
└── Business value

Technical Spec (Engineering Focus)
├── How to build it
├── Technology choices
├── Architecture
├── Security measures
└── Performance targets

Design Doc (Design Focus)
├── User experience
├── Visual design
├── Interaction patterns
├── Accessibility
└── Component library
```

---

## 2. Vision and Objectives

### Product Vision Framework

```
VISION STATEMENT TEMPLATE
=========================

FOR [target customer]
WHO [statement of need or opportunity]
THE [product name] IS A [product category]
THAT [key benefit, compelling reason to use]
UNLIKE [primary competitive alternative]
OUR PRODUCT [statement of primary differentiation]

EXAMPLE:
FOR small business owners
WHO struggle with inventory management
THE InventoryPro IS A cloud-based inventory system
THAT provides real-time stock visibility and automated reordering
UNLIKE traditional spreadsheet-based tracking
OUR PRODUCT uses AI to predict stock needs and prevent stockouts
```

### Business Objectives Framework

```
SMART OBJECTIVES
================

SPECIFIC
• What exactly will be achieved?
• Who is involved?
• Where will it happen?

MEASURABLE
• How will success be measured?
• What are the key metrics?
• What is the baseline?

ACHIEVABLE
• Is this realistic?
• Do we have the resources?
• What are the constraints?

RELEVANT
• Does this align with business goals?
• Is this the right time?
• Does this serve our users?

TIME-BOUND
• What is the deadline?
• What are the milestones?
• What is the timeline?

EXAMPLE OBJECTIVE:
"Increase user activation rate from 25% to 40% within 6 months
by implementing a guided onboarding flow and interactive tutorials,
measured by the percentage of new users completing their first
core action within 7 days of signup."
```

### Success Metrics (KPIs)

```
KPI CATEGORIES
==============

ACQUISITION METRICS
• Sign-up conversion rate
• Cost per acquisition (CPA)
• Traffic sources performance
• Landing page conversion

ACTIVATION METRICS
• Onboarding completion rate
• Time to first value
• Feature adoption rate
• Setup completion rate

ENGAGEMENT METRICS
• Daily/Monthly Active Users (DAU/MAU)
• Session duration
• Actions per session
• Feature usage frequency

RETENTION METRICS
• Day 1, 7, 30 retention
• Churn rate
• Customer lifetime value (CLV)
• Net Promoter Score (NPS)

REVENUE METRICS
• Monthly Recurring Revenue (MRR)
• Average Revenue Per User (ARPU)
• Conversion to paid
• Upgrade rate
```

---

## 3. User Personas and Journeys

### Persona Template

```
USER PERSONA TEMPLATE
=====================

PERSONA NAME: [Descriptive name like "Busy Manager Maria"]

DEMOGRAPHICS
• Age range: [e.g., 35-45]
• Role: [Job title/position]
• Industry: [Sector/vertical]
• Company size: [Small/Medium/Enterprise]

GOALS
• Primary goal: [What they want to achieve]
• Secondary goals: [Supporting objectives]

PAIN POINTS
• Current frustration 1
• Current frustration 2
• Current frustration 3

BEHAVIORS
• How they currently solve the problem
• Tools they currently use
• Preferred communication channels

MOTIVATIONS
• What drives their decisions
• What success looks like to them

OBJECTIONS
• Potential concerns about the solution
• Barriers to adoption

QUOTE
"[A representative quote that captures their mindset]"

SCENARIO
[A brief story of how they would use the product]
```

### User Journey Mapping

```
USER JOURNEY MAP TEMPLATE
=========================

JOURNEY: [Name of the journey, e.g., "First-time purchase"]
PERSONA: [Which persona this applies to]

STAGE 1: AWARENESS
├── Touchpoints: [How they discover us]
├── Actions: [What they do]
├── Thoughts: [What they're thinking]
├── Emotions: [How they feel]
└── Opportunities: [How we can improve]

STAGE 2: CONSIDERATION
├── Touchpoints: [Evaluation channels]
├── Actions: [Research activities]
├── Thoughts: [Questions they have]
├── Emotions: [Excitement/concerns]
└── Opportunities: [Support needed]

STAGE 3: DECISION
├── Touchpoints: [Conversion points]
├── Actions: [Purchase/signup steps]
├── Thoughts: [Final considerations]
├── Emotions: [Confidence level]
└── Opportunities: [Reduce friction]

STAGE 4: ONBOARDING
├── Touchpoints: [First-use experience]
├── Actions: [Setup steps]
├── Thoughts: [Learning curve concerns]
├── Emotions: [Early satisfaction]
└── Opportunities: [Accelerate success]

STAGE 5: RETENTION
├── Touchpoints: [Ongoing interactions]
├── Actions: [Regular usage patterns]
├── Thoughts: [Value perception]
├── Emotions: [Satisfaction/frustration]
└── Opportunities: [Deepen engagement]
```

---

## 4. Feature Specifications

### Feature Hierarchy

```
FEATURE ORGANIZATION
====================

EPIC (Large body of work)
└── FEATURE (Specific capability)
    └── USER STORY (User-facing functionality)
        └── ACCEPTANCE CRITERIA (Verification points)
            └── TASKS (Development work items)

EXAMPLE:
EPIC: User Management
├── FEATURE: User Registration
│   ├── USER STORY: As a new user, I can create an account
│   │   ├── AC: Email validation
│   │   ├── AC: Password requirements met
│   │   ├── AC: Confirmation email sent
│   │   └── AC: Profile created
│   └── USER STORY: As a new user, I can verify my email
│       ├── AC: Verification link works
│       ├── AC: Expires after 24 hours
│       └── AC: Can request new link
├── FEATURE: User Authentication
│   ├── USER STORY: As a user, I can log in
│   └── USER STORY: As a user, I can reset my password
└── FEATURE: User Profile
    ├── USER STORY: As a user, I can update my profile
    └── USER STORY: As a user, I can upload a profile picture
```

### Feature Specification Template

```
FEATURE SPECIFICATION
=====================

FEATURE ID: [FEAT-XXX]
FEATURE NAME: [Descriptive name]
EPIC: [Parent epic]
PRIORITY: [P0-Critical | P1-High | P2-Medium | P3-Low]
STATUS: [Draft | Review | Approved | In Development | Done]

OVERVIEW
--------
[2-3 sentence description of what this feature does and why it matters]

BUSINESS VALUE
--------------
• Problem solved: [What pain point this addresses]
• User benefit: [How users benefit]
• Business benefit: [How the business benefits]
• Success metric: [How we measure success]

USER STORIES
------------
[List of user stories with acceptance criteria - see next section]

FUNCTIONAL REQUIREMENTS
-----------------------
• [FR-001] Requirement description
• [FR-002] Requirement description
• [FR-003] Requirement description

NON-FUNCTIONAL REQUIREMENTS
---------------------------
• Performance: [Specific performance targets]
• Security: [Security considerations]
• Accessibility: [Accessibility requirements]

USER INTERFACE
--------------
• Wireframe reference: [Link to wireframes]
• Key interactions: [Main user interactions]
• States: [Different UI states - loading, empty, error, success]

EDGE CASES
----------
• [EC-001] What happens when [edge case scenario]
• [EC-002] What happens when [edge case scenario]

OUT OF SCOPE
------------
• [What is explicitly NOT included in this feature]

DEPENDENCIES
------------
• [Other features this depends on]
• [External systems required]

RELEASE CRITERIA
----------------
□ All acceptance criteria met
□ Performance targets achieved
□ Security review passed
□ Accessibility verified
□ Documentation complete
```

---

## 5. User Stories and Acceptance Criteria

### User Story Format

```
USER STORY FORMAT
=================

STANDARD FORMAT:
As a [type of user]
I want [an action or feature]
So that [benefit/value]

EXTENDED FORMAT:
As a [type of user]
I want [an action or feature]
So that [benefit/value]
Given [context/preconditions]
When [trigger/action]
Then [expected outcome]

EXAMPLE:
As a sales manager
I want to view a dashboard of my team's performance
So that I can identify coaching opportunities and celebrate wins
Given I am logged in and have a team assigned
When I navigate to the team dashboard
Then I see key metrics for each team member including
quota attainment, deals closed, and pipeline value
```

### Acceptance Criteria Standards

```
ACCEPTANCE CRITERIA GUIDELINES
==============================

CHARACTERISTICS OF GOOD AC:
• Specific and measurable
• Testable (pass/fail)
• Independent of implementation
• Written from user perspective
• Cover happy path and edge cases

FORMAT OPTIONS:

1. GIVEN-WHEN-THEN (Gherkin)
Given [precondition]
When [action]
Then [expected result]

2. CHECKLIST FORMAT
□ Criterion 1 is met
□ Criterion 2 is met
□ Criterion 3 is met

3. RULES FORMAT
Rule 1: [Condition] → [Outcome]
Rule 2: [Condition] → [Outcome]

EXAMPLE USER STORY WITH AC:
---------------------------
User Story: As a user, I can reset my password

Acceptance Criteria:
1. Given I am on the login page
   When I click "Forgot Password"
   Then I see a form to enter my email

2. Given I enter a registered email
   When I submit the form
   Then I receive a password reset email within 2 minutes
   And the email contains a secure reset link

3. Given I click the reset link within 24 hours
   When I enter a new password meeting requirements
   Then my password is updated
   And I am redirected to login

4. Given I click an expired reset link (>24 hours old)
   When the page loads
   Then I see an error message
   And I can request a new reset link

Edge Cases:
5. Given I enter an unregistered email
   When I submit the form
   Then I see a generic success message (security)
   And no email is sent

6. Given I request multiple reset links
   When I use an older link
   Then it is invalid (only latest link works)
```

### Priority and Estimation

```
PRIORITY MATRIX
===============

P0 - CRITICAL
• System cannot launch without it
• Legal/compliance requirement
• Core value proposition
Timeline: Must be in MVP

P1 - HIGH
• Major user pain point
• Significant business value
• Competitive necessity
Timeline: Phase 1 release

P2 - MEDIUM
• Improves user experience
• Moderate business value
• Common user request
Timeline: Phase 2 release

P3 - LOW
• Nice to have
• Limited user impact
• Future consideration
Timeline: Backlog

ESTIMATION SCALE (Story Points)
===============================
1 point  = Simple, well-understood, < 1 day
2 points = Straightforward, minor complexity, 1-2 days
3 points = Some complexity, < 1 week
5 points = Moderate complexity, ~1 week
8 points = Complex, multiple dependencies, 1-2 weeks
13 points = Very complex, consider breaking down
21+ points = Must be broken into smaller stories
```

---

## 6. PRD Document Template

### Complete PRD Structure

```
PRODUCT REQUIREMENTS DOCUMENT
=============================

1. DOCUMENT INFORMATION
   1.1 Version History
   1.2 Stakeholders
   1.3 Approval Status

2. EXECUTIVE SUMMARY
   2.1 Product Overview
   2.2 Problem Statement
   2.3 Proposed Solution
   2.4 Key Success Metrics

3. PRODUCT VISION & OBJECTIVES
   3.1 Vision Statement
   3.2 Business Objectives
   3.3 Success Metrics (KPIs)
   3.4 Target Market

4. USER PERSONAS
   4.1 Primary Persona
   4.2 Secondary Personas
   4.3 Anti-Personas (who this is NOT for)

5. USER JOURNEYS
   5.1 Primary User Journey
   5.2 Secondary Journeys
   5.3 Journey Maps

6. FEATURE SPECIFICATIONS
   6.1 Feature Overview (Prioritized List)
   6.2 Feature Details
       6.2.1 [Feature 1]
       6.2.2 [Feature 2]
       6.2.3 [Feature N]
   6.3 Feature Dependency Map

7. USER STORIES & ACCEPTANCE CRITERIA
   7.1 Epic 1
       7.1.1 User Stories
       7.1.2 Acceptance Criteria
   7.2 Epic 2
       [...]

8. SCOPE DEFINITION
   8.1 In Scope
   8.2 Out of Scope
   8.3 Future Considerations

9. CONSTRAINTS & ASSUMPTIONS
   9.1 Business Constraints
   9.2 Technical Constraints
   9.3 Assumptions
   9.4 Dependencies

10. RISKS & MITIGATIONS
    10.1 Product Risks
    10.2 Business Risks
    10.3 Mitigation Strategies

11. RELEASE PLAN
    11.1 MVP Definition
    11.2 Phase 1 Features
    11.3 Phase 2 Features
    11.4 Future Roadmap

12. APPENDICES
    A. Wireframes/Mockups
    B. User Research Findings
    C. Competitive Analysis
    D. Glossary
```

### PRD Quality Checklist

```
PRD REVIEW CHECKLIST
====================

COMPLETENESS
□ All features documented
□ All user stories have acceptance criteria
□ Edge cases addressed
□ Error scenarios covered
□ Success metrics defined

CLARITY
□ No ambiguous language
□ Technical terms defined in glossary
□ Visual aids where helpful
□ Examples provided for complex features

CONSISTENCY
□ Terminology consistent throughout
□ Priority scale used consistently
□ Format consistent across features
□ No conflicting requirements

TESTABILITY
□ All acceptance criteria are testable
□ Performance targets are measurable
□ Success metrics are quantifiable

TRACEABILITY
□ Features linked to business objectives
□ User stories linked to features
□ Dependencies documented

STAKEHOLDER ALIGNMENT
□ Reviewed by product team
□ Reviewed by engineering
□ Reviewed by design
□ Reviewed by business stakeholders
□ Sign-off obtained
```
