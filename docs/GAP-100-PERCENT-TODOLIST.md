# KreupAI AuraOS - Complete 100% GAP Closure Todolist

> **Goal**: Close ALL identified gaps to achieve 100% feature parity with industry leaders AND enterprise-grade infrastructure
> **Total Tasks**: 487 completed + 1,696 enterprise-grade = **2,183 items** across 31 sections
> **Created**: January 2025
> **Updated**: February 2026 (Enterprise Grade Upgrade v4.12)
> **Architecture Reference**: [aura-architecture.md](./aura-architecture.md) v4.7
> **Backend Inventory**: 656 API routes | 207 Prisma models | 170+ services | 10 microservices
> **Enterprise Benchmark**: Workday | SAP SuccessFactors | Oracle HCM | Ceridian Dayforce | Darwinbox | UKG | ADP
> **Compliance Targets**: SOC 2 Type II | ISO 27001 | GDPR | UAE PDPL | KSA PDPL | HIPAA | SOX | ACA | ERISA

---

## SECTION 1: FRONTEND (189 Tasks) — COMPLETED

---

### 1.1 Dashboard & Home Experience (32 Tasks)

#### 1.1.1 Personalized Dashboard Widgets

- [x] Install `react-grid-layout` or `@dnd-kit/core` + `@dnd-kit/sortable` packages
- [x] Create `/apps/web/src/components/dashboard/DraggableWidgetGrid.tsx` - grid container with drag-drop
- [x] Create `/apps/web/src/components/dashboard/WidgetWrapper.tsx` - individual widget wrapper with resize handles
- [x] Create `/apps/web/src/components/dashboard/WidgetConfigPanel.tsx` - widget add/remove sidebar
- [x] Create `/apps/web/src/components/dashboard/widgets/AttendanceWidget.tsx` - clock status, hours today
- [x] Create `/apps/web/src/components/dashboard/widgets/LeaveBalanceWidget.tsx` - leave balance breakdown
- [x] Create `/apps/web/src/components/dashboard/widgets/TeamWidget.tsx` - direct reports, who's out
- [x] Create `/apps/web/src/components/dashboard/widgets/ApprovalWidget.tsx` - pending approval count + list
- [x] Create `/apps/web/src/components/dashboard/widgets/TasksWidget.tsx` - pending tasks and reminders
- [x] Create `/apps/web/src/components/dashboard/widgets/CalendarWidget.tsx` - upcoming events mini-calendar
- [x] Create `/apps/web/src/components/dashboard/widgets/AnnouncementsWidget.tsx` - company announcements
- [x] Create `/apps/web/src/components/dashboard/widgets/MetricsWidget.tsx` - key HR metrics summary
- [x] Create `/apps/web/src/components/dashboard/widgets/BirthdayWidget.tsx` - birthdays & anniversaries
- [x] Create `/apps/web/src/components/dashboard/widgets/QuickLinksWidget.tsx` - personalized shortcuts
- [x] Create `/apps/web/src/stores/dashboard-store.ts` - widget layout, preferences, visibility state
- [x] Create `POST /api/v1/user/dashboard-preferences` - save layout to backend
- [x] Create `GET /api/v1/user/dashboard-preferences` - load saved layout

#### 1.1.2 AI-Powered Insights Feed

- [x] Create `/apps/web/src/components/dashboard/AIInsightsPanel.tsx` - insights container
- [x] Create `/apps/web/src/components/dashboard/InsightCard.tsx` - individual insight card
- [x] Create `/apps/web/src/hooks/useAIInsights.ts` - fetch and cache insights
- [x] Add turnover risk insight type (employees likely to leave)
- [x] Add performance trend insight type (team performance direction)
- [x] Add compliance alert insight type (expiring certifications, missing docs)
- [x] Add training recommendation insight type (skill gaps detected)

#### 1.1.3 Global Search (Command Palette)

- [x] Install `cmdk` package for command palette UI
- [x] Create `/apps/web/src/components/search/GlobalSearchCommand.tsx` - command palette
- [x] Create `/apps/web/src/components/search/SearchResults.tsx` - categorized results
- [x] Create `/apps/web/src/hooks/useGlobalSearch.ts` - debounced search hook
- [x] Create `/apps/web/src/stores/search-store.ts` - recent searches, filters
- [x] Implement employee search category
- [x] Implement module/page search category
- [x] Implement document search category
- [x] Add keyboard shortcut listener (Cmd+K / Ctrl+K)

#### 1.1.4 Dark Mode Support

- [x] Create `/apps/web/src/stores/theme-store.ts` - theme state (light/dark/system)
- [x] Update `tailwind.config.ts` to support `darkMode: 'class'`
- [x] Create theme toggle component in header
- [x] Update all component styles to support dark variants

---

### 1.2 Employee Self-Service Portal (36 Tasks)

#### 1.2.1 Document Vault

- [x] Create `/apps/web/src/app/dashboard/(modules)/my-documents/page.tsx`
- [x] Create `/apps/web/src/components/documents/DocumentVault.tsx` - main container
- [x] Create `/apps/web/src/components/documents/DocumentUploader.tsx` - drag-drop upload
- [x] Create `/apps/web/src/components/documents/DocumentViewer.tsx` - preview pane
- [x] Create `/apps/web/src/components/documents/DocumentCategories.tsx` - folder tree
- [x] Create `/apps/web/src/components/documents/DocumentSearch.tsx` - search within docs
- [x] Create `/apps/web/src/services/documentService.ts` - CRUD operations
- [x] Create `/apps/web/src/hooks/useDocuments.ts` - React Query hooks
- [x] Implement drag-drop file upload with progress bar
- [x] Implement document preview (PDF, images, office files)
- [x] Implement folder/category organization
- [x] Implement document versioning display

#### 1.2.2 Tax Documents Viewer

- [x] Create `/apps/web/src/app/dashboard/(modules)/tax-documents/page.tsx`
- [x] Create `/apps/web/src/components/tax/TaxDocumentsList.tsx` - list by year
- [x] Create `/apps/web/src/components/tax/TaxDocumentViewer.tsx` - PDF viewer
- [x] Create `/apps/web/src/components/tax/TaxYearSelector.tsx` - year dropdown
- [x] Support W-2 document display
- [x] Support 1099 document display
- [x] Support Form 16 (India) document display
- [x] Implement download functionality for each document

#### 1.2.3 Benefits Enrollment Wizard

- [x] Create `/apps/web/src/app/dashboard/(modules)/benefits-enrollment/page.tsx`
- [x] Create `/apps/web/src/components/benefits/BenefitsEnrollmentWizard.tsx` - multi-step wizard
- [x] Create `/apps/web/src/components/benefits/steps/PlanSelection.tsx` - plan picker
- [x] Create `/apps/web/src/components/benefits/steps/CoverageLevel.tsx` - coverage tier
- [x] Create `/apps/web/src/components/benefits/steps/DependentSelection.tsx` - add dependents
- [x] Create `/apps/web/src/components/benefits/steps/CostSummary.tsx` - premium breakdown
- [x] Create `/apps/web/src/components/benefits/steps/Confirmation.tsx` - review & submit
- [x] Create `/apps/web/src/components/benefits/PlanComparisonTable.tsx` - side-by-side compare
- [x] Create `/apps/web/src/components/benefits/OpenEnrollmentBanner.tsx` - enrollment period alert
- [x] Create `/apps/web/src/services/benefitsService.ts`
- [x] Create `/apps/web/src/hooks/useBenefits.ts`

#### 1.2.4 Life Event Manager

- [x] Create `/apps/web/src/components/life-events/LifeEventManager.tsx` - event type selector
- [x] Create `/apps/web/src/components/life-events/LifeEventWizard.tsx` - event form wizard
- [x] Create `/apps/web/src/components/life-events/LifeEventDocUpload.tsx` - supporting docs
- [x] Implement marriage/divorce event flow with benefit changes
- [x] Implement birth/adoption event flow
- [x] Implement death of dependent event flow
- [x] Implement address change event flow
- [x] Implement loss of coverage event flow

#### 1.2.5 Dependent Management

- [x] Create `/apps/web/src/components/dependents/DependentManager.tsx` - list view
- [x] Create `/apps/web/src/components/dependents/DependentForm.tsx` - add/edit form
- [x] Create `/apps/web/src/components/dependents/DependentCard.tsx` - individual card
- [x] Implement SSN field with masking (show last 4 only)
- [x] Implement relationship type selector
- [x] Implement benefit eligibility indicator

#### 1.2.6 Career Interests & Internal Marketplace

- [x] Create `/apps/web/src/components/career/CareerInterestsProfile.tsx` - interests form
- [x] Create `/apps/web/src/components/career/InternalJobMarketplace.tsx` - job listings
- [x] Create `/apps/web/src/components/career/InternalApplicationForm.tsx` - apply flow

#### 1.2.7 Enhanced Employee Profile

- [x] Enhance profile editor with all fields (address, bank, emergency)
- [x] Add skills/certifications self-update section
- [x] Add profile completeness indicator
- [x] Add profile photo upload with crop

---

### 1.3 Manager Experience (34 Tasks)

#### 1.3.1 One-on-One Meeting Tracker

- [x] Create `/apps/web/src/app/dashboard/(modules)/one-on-ones/page.tsx`
- [x] Create `/apps/web/src/components/one-on-ones/OneOnOneTracker.tsx` - main view
- [x] Create `/apps/web/src/components/one-on-ones/MeetingScheduler.tsx` - schedule new
- [x] Create `/apps/web/src/components/one-on-ones/MeetingNotes.tsx` - rich text notes
- [x] Create `/apps/web/src/components/one-on-ones/ActionItems.tsx` - action items with status
- [x] Create `/apps/web/src/components/one-on-ones/MeetingHistory.tsx` - past meetings timeline
- [x] Create `/apps/web/src/components/one-on-ones/AgendaTemplates.tsx` - reusable agendas
- [x] Create `/apps/web/src/services/oneOnOneService.ts`
- [x] Create `/apps/web/src/hooks/useOneOnOnes.ts`

#### 1.3.2 Team Capacity Planner

- [x] Create `/apps/web/src/components/manager/TeamCapacityPlanner.tsx` - main view
- [x] Create `/apps/web/src/components/manager/CapacityCalendar.tsx` - visual calendar
- [x] Create `/apps/web/src/components/manager/CapacityBar.tsx` - utilization bar per person
- [x] Create `/apps/web/src/components/manager/WorkloadDistribution.tsx` - workload chart
- [x] Integrate with leave data for availability
- [x] Show team utilization percentage

#### 1.3.3 Compensation Planner

- [x] Create `/apps/web/src/app/dashboard/(modules)/compensation-planning/page.tsx`
- [x] Create `/apps/web/src/components/compensation/CompensationPlanner.tsx` - main planner
- [x] Create `/apps/web/src/components/compensation/SalaryReview.tsx` - individual review
- [x] Create `/apps/web/src/components/compensation/BudgetAllocation.tsx` - budget splitter
- [x] Create `/apps/web/src/components/compensation/BenchmarkComparison.tsx` - market comparison
- [x] Create `/apps/web/src/components/compensation/CompReviewHistory.tsx` - review history
- [x] Implement budget pool allocation logic
- [x] Implement merit increase calculator

#### 1.3.4 Unified Approval Center

- [x] Create `/apps/web/src/app/dashboard/(modules)/approvals/page.tsx`
- [x] Create `/apps/web/src/components/approvals/UnifiedApprovalCenter.tsx` - unified list
- [x] Create `/apps/web/src/components/approvals/ApprovalCard.tsx` - single approval
- [x] Create `/apps/web/src/components/approvals/ApprovalFilters.tsx` - filter by type/date
- [x] Create `/apps/web/src/components/approvals/BulkApproval.tsx` - select & approve many
- [x] Create `/apps/web/src/components/approvals/ApprovalHistory.tsx` - past decisions
- [x] Create `/apps/web/src/services/approvalService.ts`
- [x] Create `/apps/web/src/hooks/useApprovals.ts`
- [x] Support leave request approvals
- [x] Support expense claim approvals
- [x] Support timesheet approvals
- [x] Support requisition approvals
- [x] Support document approvals

#### 1.3.5 Performance Calibration Tool

- [x] Create `/apps/web/src/components/performance/PerformanceCalibration.tsx` - main
- [x] Create `/apps/web/src/components/performance/CalibrationMatrix.tsx` - 9-box grid
- [x] Create `/apps/web/src/components/performance/EmployeePlacement.tsx` - drag to place
- [x] Implement drag-drop employee placement on 9-box grid
- [x] Implement bell curve distribution view

#### 1.3.6 Team Analytics Dashboard

- [x] Create `/apps/web/src/components/manager/TeamAnalyticsDashboard.tsx`
- [x] Add team headcount trend chart
- [x] Add team attrition rate metric
- [x] Add team performance distribution chart
- [x] Add team leave utilization chart
- [x] Add team overtime hours chart

---

### 1.4 Recruitment & Talent Acquisition (30 Tasks)

#### 1.4.1 AI Resume Parser

- [x] Create `/apps/web/src/components/recruitment/AIResumeParser.tsx` - upload + parse
- [x] Create `/apps/web/src/components/recruitment/ParsedResumeView.tsx` - structured view
- [x] Create `/apps/web/src/components/recruitment/ResumeMatchScore.tsx` - match percentage
- [x] Support PDF upload and parsing
- [x] Support DOCX upload and parsing
- [x] Display parsed fields: name, contact, experience, education, skills

#### 1.4.2 Interview Scheduler

- [x] Create `/apps/web/src/components/recruitment/InterviewScheduler.tsx` - main scheduler
- [x] Create `/apps/web/src/components/recruitment/CalendarSlotPicker.tsx` - time slot grid
- [x] Create `/apps/web/src/components/recruitment/InterviewerAvailability.tsx` - availability view
- [x] Create `/apps/web/src/components/recruitment/InterviewConfirmation.tsx` - confirmation email
- [x] Integrate Google Calendar API for slot checking
- [x] Integrate Outlook Calendar API for slot checking
- [x] Send calendar invites on scheduling

#### 1.4.3 Video Interview Integration

- [x] Create `/apps/web/src/components/recruitment/VideoInterviewRoom.tsx` - video room
- [x] Create `/apps/web/src/components/recruitment/InterviewRecording.tsx` - record/playback
- [x] Integrate with Zoom or WebRTC for video

#### 1.4.4 E-Signature Integration

- [x] Create `/apps/web/src/components/recruitment/ESignaturePortal.tsx` - signing UI
- [x] Create `/apps/web/src/components/recruitment/OfferLetterPreview.tsx` - letter preview
- [x] Integrate DocuSign SDK for embedded signing
- [x] Implement signing status tracking

#### 1.4.5 Background Check Integration

- [x] Create `/apps/web/src/components/recruitment/BackgroundCheckPortal.tsx` - check status
- [x] Create `/apps/web/src/components/recruitment/BackgroundCheckResults.tsx` - results view
- [x] Integrate Checkr or Sterling API
- [x] Show real-time check status updates

#### 1.4.6 Career Site Builder

- [x] Create `/apps/web/src/app/dashboard/(modules)/career-site/page.tsx`
- [x] Create `/apps/web/src/components/career-site/CareerSiteBuilder.tsx` - builder UI
- [x] Create `/apps/web/src/components/career-site/JobListingEditor.tsx` - edit listings
- [x] Create `/apps/web/src/components/career-site/BrandingCustomizer.tsx` - colors/logo
- [x] Create `/apps/web/src/components/career-site/PreviewPane.tsx` - live preview

#### 1.4.7 Employee Referral Portal

- [x] Create `/apps/web/src/components/recruitment/ReferralPortal.tsx` - submit referral
- [x] Create `/apps/web/src/components/recruitment/ReferralTracking.tsx` - track status
- [x] Create `/apps/web/src/components/recruitment/ReferralRewards.tsx` - rewards earned

#### 1.4.8 Candidate Communication Hub

- [x] Create `/apps/web/src/components/recruitment/CandidateCommunicationHub.tsx`
- [x] Implement email thread view per candidate
- [x] Implement SMS messaging interface
- [x] Implement template-based messaging

#### 1.4.9 AI Candidate Matching

- [x] Create `/apps/web/src/components/recruitment/AICandidateMatching.tsx`
- [x] Show ranked candidate list with match scores
- [x] Show skill-match breakdown visualization

---

### 1.5 Performance Management (24 Tasks)

#### 1.5.1 Continuous Feedback

- [x] Create `/apps/web/src/components/performance/ContinuousFeedback.tsx` - feedback hub
- [x] Create `/apps/web/src/components/performance/FeedbackForm.tsx` - give feedback
- [x] Create `/apps/web/src/components/performance/FeedbackFeed.tsx` - activity feed
- [x] Create `/apps/web/src/components/performance/FeedbackFilters.tsx` - filter by type
- [x] Implement praise feedback type
- [x] Implement constructive feedback type
- [x] Implement suggestion feedback type
- [x] Implement anonymous feedback option
- [x] Create `/apps/web/src/services/feedbackService.ts`
- [x] Create `/apps/web/src/hooks/useFeedback.ts`

#### 1.5.2 Real-Time Recognition (Kudos)

- [x] Create `/apps/web/src/components/recognition/RecognitionWall.tsx` - public feed
- [x] Create `/apps/web/src/components/recognition/GiveRecognition.tsx` - give form
- [x] Create `/apps/web/src/components/recognition/RecognitionBadges.tsx` - badge gallery
- [x] Create `/apps/web/src/components/recognition/RecognitionLeaderboard.tsx` - leaderboard
- [x] Implement points/rewards accumulation system
- [x] Map to company core values

#### 1.5.3 Goal Alignment Visualization

- [x] Create `/apps/web/src/components/performance/GoalAlignmentTree.tsx` - tree view
- [x] Use ReactFlow for goal hierarchy visualization
- [x] Show company → department → team → individual cascading goals
- [x] Implement goal progress indicators on each node

#### 1.5.4 Skills Gap Analysis

- [x] Create `/apps/web/src/components/skills/SkillsGapAnalysis.tsx` - gap overview
- [x] Create `/apps/web/src/components/skills/SkillRadarChart.tsx` - radar comparison
- [x] Create `/apps/web/src/components/skills/SkillGapRecommendations.tsx` - learning links
- [x] Show current vs required skill levels per role

#### 1.5.5 Check-in Templates & 1:1 Notes

- [x] Create `/apps/web/src/components/performance/CheckInTemplates.tsx` - template library
- [x] Create `/apps/web/src/components/performance/OneOnOneNotes.tsx` - shared notes
- [x] Create `/apps/web/src/components/performance/PraiseWall.tsx` - public praise

---

### 1.6 Learning & Development (25 Tasks)

#### 1.6.1 Learning Paths

- [x] Create `/apps/web/src/app/dashboard/(modules)/learning-paths/page.tsx`
- [x] Create `/apps/web/src/components/learning/LearningPaths.tsx` - path catalog
- [x] Create `/apps/web/src/components/learning/PathProgress.tsx` - progress tracker
- [x] Create `/apps/web/src/components/learning/PathBuilder.tsx` - admin path builder
- [x] Create `/apps/web/src/components/learning/PathEnrollment.tsx` - enroll in path
- [x] Create `/apps/web/src/services/learningService.ts`
- [x] Create `/apps/web/src/hooks/useLearning.ts`

#### 1.6.2 Video Player with Tracking

- [x] Create `/apps/web/src/components/learning/VideoPlayer.tsx` - custom player
- [x] Implement progress tracking (last position, % complete)
- [x] Implement bookmarks and notes at timestamps
- [x] Implement resume from last position
- [x] Implement playback speed control

#### 1.6.3 Quiz/Assessment Builder

- [x] Create `/apps/web/src/components/learning/QuizBuilder.tsx` - admin builder
- [x] Create `/apps/web/src/components/learning/QuizTaker.tsx` - take quiz
- [x] Create `/apps/web/src/components/learning/QuizResults.tsx` - results view
- [x] Implement multiple choice question type
- [x] Implement true/false question type
- [x] Implement short answer question type
- [x] Implement matching question type
- [x] Implement scoring and pass/fail logic

#### 1.6.4 AI Learning Recommendations

- [x] Create `/apps/web/src/components/learning/AILearningRecommendations.tsx`
- [x] Show personalized recommendations based on role and skill gaps
- [x] Show trending courses in organization

#### 1.6.5 External Content Integration

- [x] Create `/apps/web/src/components/learning/ExternalContentIntegration.tsx`
- [x] Support LinkedIn Learning embed
- [x] Support Udemy course links
- [x] Track external course completion

#### 1.6.6 Mentorship Matching

- [x] Create `/apps/web/src/app/dashboard/(modules)/mentorship/page.tsx`
- [x] Create `/apps/web/src/components/mentorship/MentorMatching.tsx` - matching UI
- [x] Create `/apps/web/src/components/mentorship/MentorProfile.tsx` - mentor details
- [x] Create `/apps/web/src/components/mentorship/MentorshipPrograms.tsx` - programs list
- [x] Implement skill-based matching algorithm display

#### 1.6.7 Learning Community

- [x] Create `/apps/web/src/components/learning/LearningCommunity.tsx` - discussion forum
- [x] Implement course-specific discussion threads

---

### 1.7 Compensation & Benefits (22 Tasks)

#### 1.7.1 Total Compensation Statement

- [x] Create `/apps/web/src/components/compensation/TotalCompensationStatement.tsx`
- [x] Show base salary, bonus, equity, benefits value breakdown
- [x] Implement visual pie/bar chart for compensation mix
- [x] Generate downloadable PDF statement

#### 1.7.2 Salary Benchmarking UI

- [x] Create `/apps/web/src/components/compensation/SalaryBenchmarking.tsx`
- [x] Show market percentile position (25th, 50th, 75th)
- [x] Show job-specific salary ranges
- [x] Show geographic adjustments

#### 1.7.3 Equity Management

- [x] Create `/apps/web/src/components/compensation/EquityManagement.tsx`
- [x] Show vesting schedule with timeline
- [x] Show grant history
- [x] Show current equity value (if public/valued)

#### 1.7.4 Bonus Calculation Wizard

- [x] Create `/apps/web/src/components/compensation/BonusCalculationWizard.tsx`
- [x] Implement target bonus calculation
- [x] Implement performance multiplier
- [x] Implement proration for mid-year hires

#### 1.7.5 HSA/FSA Management

- [x] Create `/apps/web/src/components/benefits/HSAFSAManagement.tsx`
- [x] Show account balance
- [x] Show contribution history
- [x] Show eligible expenses

#### 1.7.6 Retirement Dashboard

- [x] Create `/apps/web/src/components/benefits/RetirementDashboard.tsx`
- [x] Show 401k/EPF contribution summary
- [x] Show employer match details
- [x] Show investment allocation

#### 1.7.7 Wellness Program Tracker

- [x] Create `/apps/web/src/components/benefits/WellnessTracker.tsx`
- [x] Show wellness challenges and participation
- [x] Show wellness rewards/points

#### 1.7.8 Perks Marketplace

- [x] Create `/apps/web/src/components/benefits/PerksMarketplace.tsx`
- [x] Show available perks catalog
- [x] Implement perk redemption flow

#### 1.7.9 Expense Reimbursement

- [x] Create `/apps/web/src/components/compensation/ExpenseReimbursement.tsx`
- [x] Create expense submission form with receipt upload
- [x] Show expense claim status tracking
- [x] Show reimbursement history

---

### 1.8 Time & Attendance Advanced (18 Tasks)

#### 1.8.1 Geofencing/GPS Tracking

- [x] Create `/apps/web/src/components/time-attendance/GeofencingGPS.tsx`
- [x] Implement browser geolocation API integration
- [x] Show map with geofence boundaries
- [x] Validate clock-in within geofence radius
- [x] Show GPS coordinates on attendance record

#### 1.8.2 Biometric Integration

- [x] Create `/apps/web/src/components/time-attendance/BiometricIntegration.tsx`
- [x] Implement Web Authentication API (fingerprint/face on supported devices)
- [x] Show biometric device status

#### 1.8.3 Project Time Tracking

- [x] Create `/apps/web/src/components/time-attendance/ProjectTimeTracker.tsx`
- [x] Create `/apps/web/src/components/time-attendance/ProjectSelector.tsx`
- [x] Create `/apps/web/src/components/time-attendance/TimerWidget.tsx`
- [x] Implement start/stop timer per project/task
- [x] Implement manual time entry
- [x] Show weekly timesheet view by project

#### 1.8.4 Visual Schedule Builder

- [x] Create `/apps/web/src/components/time-attendance/VisualScheduleBuilder.tsx`
- [x] Implement drag-drop shift assignment on calendar grid
- [x] Show team schedule overview (week/month)
- [x] Implement copy previous week/template

#### 1.8.5 Labor Cost Forecasting

- [x] Create `/apps/web/src/components/time-attendance/LaborCostForecasting.tsx`
- [x] Show projected labor costs based on schedule
- [x] Show overtime cost projections
- [x] Compare actual vs budgeted labor costs

#### 1.8.6 Break Compliance & PTO

- [x] Create `/apps/web/src/components/time-attendance/BreakComplianceTracker.tsx`
- [x] Enhance PTO accrual calculator with carry-forward logic
- [x] Show break compliance warnings

---

### 1.9 Analytics & Reporting (24 Tasks)

#### 1.9.1 Pre-built HR Dashboards

- [x] Create `/apps/web/src/components/analytics/HRDashboard.tsx` - executive overview
- [x] Add headcount by department chart
- [x] Add hiring funnel chart
- [x] Add attrition trend chart
- [x] Add compensation distribution chart
- [x] Add leave utilization chart

#### 1.9.2 Custom Report Builder

- [x] Create `/apps/web/src/app/dashboard/(modules)/report-builder/page.tsx`
- [x] Create `/apps/web/src/components/reports/CustomReportBuilder.tsx` - main builder
- [x] Create `/apps/web/src/components/reports/DataSourceSelector.tsx` - pick data source
- [x] Create `/apps/web/src/components/reports/ColumnPicker.tsx` - select columns
- [x] Create `/apps/web/src/components/reports/FilterBuilder.tsx` - add conditions
- [x] Create `/apps/web/src/components/reports/ChartSelector.tsx` - chart type picker
- [x] Create `/apps/web/src/components/reports/ReportPreview.tsx` - live preview

#### 1.9.3 Scheduled Report Delivery

- [x] Create `/apps/web/src/components/reports/ReportScheduler.tsx` - schedule config
- [x] Create `/apps/web/src/components/reports/RecipientSelector.tsx` - pick recipients
- [x] Implement cron expression builder UI
- [x] Support PDF, Excel, CSV export formats

#### 1.9.4 People Analytics

- [x] Create `/apps/web/src/app/dashboard/(modules)/people-analytics/page.tsx`
- [x] Create `/apps/web/src/components/analytics/TurnoverAnalysis.tsx`
- [x] Create `/apps/web/src/components/analytics/DEIDashboard.tsx`
- [x] Create `/apps/web/src/components/analytics/HeadcountPlanning.tsx`
- [x] Create `/apps/web/src/components/analytics/CompensationAnalytics.tsx`
- [x] Create `/apps/web/src/components/analytics/PredictiveAnalytics.tsx`
- [x] Create `/apps/web/src/components/analytics/RealTimeMetrics.tsx`

---

### 1.10 Admin & Configuration (22 Tasks)

#### 1.10.1 Permission Matrix Editor

- [x] Create `/apps/web/src/components/admin/PermissionMatrixEditor.tsx`
- [x] Implement role × resource permission grid
- [x] Implement inline toggle for each permission
- [x] Support custom role creation

#### 1.10.2 Visual Workflow Designer

- [x] Create `/apps/web/src/app/dashboard/(modules)/workflow-designer/page.tsx`
- [x] Create `/apps/web/src/components/workflow/WorkflowDesigner.tsx` - main canvas
- [x] Create `/apps/web/src/components/workflow/WorkflowCanvas.tsx` - ReactFlow canvas
- [x] Create `/apps/web/src/components/workflow/NodePalette.tsx` - node types sidebar
- [x] Create `/apps/web/src/components/workflow/NodeEditor.tsx` - node config panel
- [x] Implement Start/End node types
- [x] Implement Approval node type
- [x] Implement Condition/Branch node type
- [x] Implement Email notification node type
- [x] Implement Webhook node type
- [x] Implement Wait/Delay node type

#### 1.10.3 Form Builder

- [x] Create `/apps/web/src/app/dashboard/(modules)/form-builder/page.tsx`
- [x] Create `/apps/web/src/components/forms/FormBuilder.tsx` - drag-drop builder
- [x] Create `/apps/web/src/components/forms/FieldPalette.tsx` - field types list
- [x] Create `/apps/web/src/components/forms/FormPreview.tsx` - live preview
- [x] Create `/apps/web/src/components/forms/ValidationRules.tsx` - rules config
- [x] Support all field types: text, number, date, email, dropdown, radio, checkbox, file, signature, calculated

#### 1.10.4 Data Import Wizard

- [x] Create `/apps/web/src/components/admin/DataImportWizard.tsx` - multi-step import
- [x] Create `/apps/web/src/components/admin/CSVMapper.tsx` - column mapping
- [x] Create `/apps/web/src/components/admin/ImportValidation.tsx` - error display
- [x] Create `/apps/web/src/components/admin/ImportProgress.tsx` - progress bar

#### 1.10.5 Integration Marketplace

- [x] Create `/apps/web/src/app/dashboard/(modules)/integrations/page.tsx`
- [x] Create `/apps/web/src/components/integrations/IntegrationMarketplace.tsx`
- [x] Create `/apps/web/src/components/integrations/IntegrationCard.tsx`
- [x] Create `/apps/web/src/components/integrations/ConnectionWizard.tsx`
- [x] Create `/apps/web/src/components/integrations/SyncStatus.tsx`

#### 1.10.6 Branding & White-labeling

- [x] Create `/apps/web/src/components/admin/BrandingCustomizer.tsx`
- [x] Implement logo upload
- [x] Implement primary/secondary color picker
- [x] Implement custom favicon upload

#### 1.10.7 API Key Management

- [x] Create `/apps/web/src/components/admin/APIKeyManagement.tsx`
- [x] Create `/apps/web/src/components/admin/APIKeyForm.tsx`
- [x] Implement key generation with scopes
- [x] Implement key expiration settings
- [x] Show usage statistics per key

---

### 1.11 Mobile Experience (16 Tasks)

#### 1.11.1 Core Mobile Screens

- [x] Create `/apps/mobile/src/screens/ClockInOut.tsx` - clock with GPS
- [x] Create `/apps/mobile/src/screens/LeaveRequest.tsx` - submit leave
- [x] Create `/apps/mobile/src/screens/Approvals.tsx` - approve/reject
- [x] Create `/apps/mobile/src/screens/Directory.tsx` - employee directory
- [x] Create `/apps/mobile/src/screens/Paystubs.tsx` - view pay stubs
- [x] Create `/apps/mobile/src/screens/Profile.tsx` - view/edit profile
- [x] Create `/apps/mobile/src/screens/Notifications.tsx` - notification center
- [x] Create `/apps/mobile/src/screens/Dashboard.tsx` - mobile home

#### 1.11.2 Mobile Infrastructure

- [x] Create `/apps/mobile/src/components/OfflineSync.tsx` - offline queue
- [x] Create `/apps/mobile/src/services/offlineStorage.ts` - local storage
- [x] Implement push notification registration (FCM/APNs)
- [x] Implement deep linking for notifications
- [x] Implement biometric authentication (fingerprint/face)
- [x] Implement GPS location capture for attendance
- [x] Implement pull-to-refresh across all screens
- [x] Implement bottom tab navigation

---

## SECTION 2: BACKEND (143 Tasks) — COMPLETED

> **Codebase Audit (Feb 2026)**: Backend has grown far beyond these 143 v1.0 tasks.
> Actual inventory: **656 API routes** | **207 Prisma models** (4 schema files) | **170+ service files** across 25+ categories |
> **17 middleware** | **13 auth modules** | **10 microservices** | **7 monitoring modules** | **6 queue workers** |
> GraphQL endpoint + OpenAPI/Swagger | Compliance services (WPS, GOSI, Nitaqat, EOSB, India PF/ESI/TDS) |
> AI/ML services (attrition prediction, resume parsing, sentiment analysis, workforce analytics) |
> Agentic AI framework (hr-agent, recruitment-agent, analytics-agent).
> See **Section 16** for enterprise backend platform gaps still needed.

---

### 2.1 Core API Infrastructure (12 Tasks)

#### 2.1.1 Webhook System

- [x] Create `/apps/web/src/lib/services/webhookService.ts` - core service
- [x] Create `POST /api/v1/webhooks` - register webhook
- [x] Create `GET /api/v1/webhooks` - list webhooks
- [x] Create `GET /api/v1/webhooks/[id]` - get webhook details
- [x] Create `PUT /api/v1/webhooks/[id]` - update webhook
- [x] Create `DELETE /api/v1/webhooks/[id]` - delete webhook
- [x] Create `GET /api/v1/webhooks/[id]/logs` - delivery logs
- [x] Create `POST /api/v1/webhooks/[id]/test` - test delivery
- [x] Implement webhook event dispatcher (publish events on CRUD actions)
- [x] Implement webhook retry logic (exponential backoff)
- [x] Implement webhook secret verification (HMAC signing)
- [x] Implement webhook event types: employee.created, employee.updated, payroll.completed, leave.approved, etc.

#### 2.1.2 Event Streaming Enhancement

- [x] Create `/apps/web/src/lib/events/eventBus.ts` - enhanced event bus
- [x] Implement event persistence (store events in DB for replay)
- [x] Implement event subscription management
- [x] Implement dead letter queue for failed events

#### 2.1.3 API Analytics

- [x] Create `GET /api/v1/admin/api-analytics` - API usage stats
- [x] Track request count per endpoint
- [x] Track average response time per endpoint
- [x] Track error rates per endpoint

---

### 2.2 Employee Self-Service APIs (18 Tasks)

> **Codebase Audit (Feb 2026)**: All 18 v1.0 ESS tasks exist and work — documents, tax docs, dependents,
> life events, emergency contacts, and total compensation APIs are implemented. However, enterprise ESS
> portals (Workday, SAP SF, Darwinbox) offer 50+ self-service features. Critical gaps: no expense/reimbursement
> APIs, no IT helpdesk/ticketing, no profile change request workflows (bank/address), no employee directory
> search, no salary advance/loan APIs, no wellness programs, no letter request flow for employees.
> See **Section 17** for full enterprise ESS API gaps.

#### 2.2.1 Document Management APIs

- [x] Create `/apps/web/src/lib/services/documentService.ts`
- [x] Create `GET /api/v1/documents` - list all documents (with pagination, filters)
- [x] Create `POST /api/v1/documents` - upload document (multipart/form-data)
- [x] Create `GET /api/v1/documents/[id]` - get document metadata
- [x] Create `GET /api/v1/documents/[id]/download` - download file
- [x] Create `DELETE /api/v1/documents/[id]` - soft delete document
- [x] Create `GET /api/v1/employees/[id]/documents` - employee's documents
- [x] Implement S3 upload with pre-signed URLs
- [x] Implement virus scanning on upload (ClamAV integration)
- [x] Implement document versioning

#### 2.2.2 Tax Documents APIs

- [x] Create `/apps/web/src/lib/services/taxDocumentService.ts`
- [x] Create `GET /api/v1/tax-documents` - list tax documents by year
- [x] Create `GET /api/v1/tax-documents/[id]` - get tax document
- [x] Create `GET /api/v1/tax-documents/[id]/download` - download PDF
- [x] Create `POST /api/v1/tax-documents/generate` - trigger generation (admin)

#### 2.2.3 Dependent APIs

- [x] Create `/apps/web/src/lib/services/dependentService.ts`
- [x] Create `GET /api/v1/dependents` - list dependents
- [x] Create `POST /api/v1/dependents` - add dependent
- [x] Create `GET /api/v1/dependents/[id]` - get dependent details
- [x] Create `PUT /api/v1/dependents/[id]` - update dependent
- [x] Create `DELETE /api/v1/dependents/[id]` - remove dependent
- [x] Implement SSN encryption at rest (AES-256)

#### 2.2.4 Life Event APIs

- [x] Create `/apps/web/src/lib/services/lifeEventService.ts`
- [x] Create `GET /api/v1/life-events` - list life events
- [x] Create `POST /api/v1/life-events` - report life event
- [x] Create `GET /api/v1/life-events/[id]` - get event details
- [x] Create `PUT /api/v1/life-events/[id]/approve` - approve event (admin)
- [x] Trigger benefit re-enrollment on qualifying events

#### 2.2.5 Emergency Contacts APIs

- [x] Create `GET /api/v1/employees/[id]/emergency-contacts` - list contacts
- [x] Create `POST /api/v1/employees/[id]/emergency-contacts` - add contact
- [x] Create `PUT /api/v1/employees/[id]/emergency-contacts/[contactId]` - update
- [x] Create `DELETE /api/v1/employees/[id]/emergency-contacts/[contactId]` - delete

#### 2.2.6 Total Compensation API

- [x] Create `GET /api/v1/employees/[id]/total-compensation` - full comp breakdown
- [x] Include base salary, bonus, equity, benefits value, perks value

---

### 2.3 Benefits APIs (14 Tasks)

> **Codebase Audit (Feb 2026)**: Benefits implementation is significantly richer than these 14 tasks suggest.
> **Actual inventory**: 11 API routes | 12 Prisma models (BenefitPlan, BenefitEnrollment, BenefitClaim,
> Dependent, HealthcareProvider, QualifyingEvent, EnrollmentWindow, PremiumRate, PremiumDeduction,
> HSAFSAAccount, HSAFSATransaction, EmployeeBenefit) | 12 frontend components including HSAFSAManagement
> (1700+ lines with investment tracking, tax savings calculator, spending analytics) and RetirementDashboard
> (1600+ lines with vesting, Roth vs Traditional, scenario projections, catch-up contributions).
> Eligibility rules engine supports 3 rule types. Seed data covers health, dental, vision, 401k plans.
> **Critical gaps**: No claims processing workflow API, no COBRA/continuation coverage, no life insurance/AD&D
> management, no benefits compliance reporting (ACA/ERISA), no provider directory search API, no benefits
> tax document generation (1095-B, Form 8889). See **Section 18** for full enterprise benefits gaps.

- [x] Create `/apps/web/src/lib/services/benefitsService.ts`
- [x] Create `GET /api/v1/benefits/plans` - available benefit plans
- [x] Create `GET /api/v1/benefits/plans/[id]` - plan details with coverage options
- [x] Create `GET /api/v1/benefits/enrollment` - current enrollments for employee
- [x] Create `POST /api/v1/benefits/enrollment` - enroll in plan
- [x] Create `PUT /api/v1/benefits/enrollment/[id]` - update enrollment
- [x] Create `DELETE /api/v1/benefits/enrollment/[id]` - cancel enrollment
- [x] Create `GET /api/v1/benefits/enrollment/status` - enrollment period status
- [x] Create `POST /api/v1/benefits/open-enrollment` - initiate open enrollment (admin)
- [x] Create `GET /api/v1/benefits/cost-comparison` - compare plan costs
- [x] Create `GET /api/v1/benefits/hsa-fsa` - HSA/FSA balance and transactions
- [x] Create `POST /api/v1/benefits/hsa-fsa/contribution` - update contribution
- [x] Create `POST /api/v1/benefits/life-event` - qualifying life event trigger
- [x] Implement eligibility rules engine (waiting period, employment type)

---

### 2.4 Payroll APIs Advanced (14 Tasks)

> **CODEBASE AUDIT NOTE (v3.3):** These 14 v1.0 tasks are ALL complete and represent a fraction of actual implementation.
> **Actual codebase inventory**: 38 API routes (15 v1 + 20 core + 6 salary/tax + 9 compensation + 2 payslip) | 14 Prisma models (PayrollRun, Payslip, EmployeeSalaryStructure, TaxDeclaration, PayrollAdjustment, StatutoryPayment, Garnishment, TaxDocument, SalaryComponent, CompensationBand, ExpenseClaim, HSAFSAAccount, PayrollConfiguration + more) | 11 frontend components (TotalCompensationStatement 45KB, BonusCalculationWizard 62KB, EquityManagement 66KB, SalaryBenchmarking 40KB + 7 more) | 3 service layers (PayrollService 414 lines + Enhanced PayrollService 951 lines + Mobile) | 2 BullMQ background jobs | Multi-country support (IN, AE, SA, QA, KW, BH, OM) | Statutory compliance (PF, ESI, PT, TDS, GOSI, WPS) | Indian OLD/NEW tax regime support | 463-line compensation seed data.
> **Enterprise gaps vs ADP/Ceridian Dayforce/Workday**: No multi-currency global payroll, no payroll simulation/what-if, no earned wage access (EWA), no pay equity analysis engine, no workers' compensation, no commission/tip management, no payroll integration hub (ADP/Ceridian connectors), no SOX compliance controls, no payroll reversal/void, no global payroll aggregation.
> **See Section 19** for 42 enterprise payroll tasks.

- [x] Create `GET /api/v1/payroll/tax-documents` - W2/1099 list
- [x] Create `POST /api/v1/payroll/tax-documents/generate` - generate tax docs
- [x] Create `POST /api/v1/payroll/off-cycle` - off-cycle payroll run
- [x] Create `GET /api/v1/payroll/garnishments` - wage garnishment list
- [x] Create `POST /api/v1/payroll/garnishments` - add garnishment
- [x] Create `POST /api/v1/payroll/retroactive` - retroactive pay calculation
- [x] Create `GET /api/v1/payroll/year-end` - year-end processing status
- [x] Create `POST /api/v1/payroll/year-end/process` - trigger year-end
- [x] Create `POST /api/v1/payroll/direct-deposit/verify` - verify bank account (Plaid)
- [x] Create `GET /api/v1/payroll/tax-filing-status` - filing status
- [x] Create `GET /api/v1/payroll/pay-stubs/[id]/download` - download PDF pay stub
- [x] Implement batch payroll calculation job (BullMQ)
- [x] Implement tax calculation engine per jurisdiction
- [x] Implement garnishment deduction priority ordering

---

### 2.5 Recruitment APIs (16 Tasks)

> **CODEBASE AUDIT NOTE (v3.3):** These 16 v1.0 tasks are ALL complete and represent a fraction of actual implementation.
> **Actual codebase inventory**: 43 API routes (11 core + 9 v1 + 5 AI/automation + 6 job-related + 14 onboarding) | 17 Prisma models (JobPosting, Candidate, CandidateApplication, Interview, InterviewFeedback, JobOffer, BackgroundCheck, JobRequisition, OnboardingProgram, OnboardingInstance, OnboardingTask, JobFunction, JobFamily, JobProfile, JobRole, Assessment, AssessmentSubmission) | 20 React components (11,973 lines — AICandidateMatching 1,238 lines, ESignaturePortal 1,078 lines, CandidateCommunicationHub 1,084 lines, InterviewRecording 980 lines, VideoInterviewRoom 642 lines + 15 more) | RecruitmentAgentService 965 lines with AI scoring (Skills 40% + Experience 30% + Education 15% + Culture Fit 15%) | 14 onboarding routes | Background check portal with vendor integration | Referral portal with rewards tracking.
> **Enterprise gaps vs Greenhouse/Lever/iCIMS/Workday Recruiting**: No talent CRM / pipeline nurturing, no job board syndication (Indeed/LinkedIn/Glassdoor), no assessment platform integration (HackerRank/Codility), no DEI/EEO-1 reporting, no internal mobility marketplace, no recruiting spend/budget tracking, no agency/vendor portal, no offer benchmarking, no candidate experience surveys, no structured scorecard templates.
> **See Section 20** for 48 enterprise recruitment tasks.

- [x] Create `POST /api/v1/recruitment/resume/parse` - AI resume parsing
- [x] Create `POST /api/v1/recruitment/candidates/match` - AI candidate matching
- [x] Create `GET /api/v1/recruitment/interviews/schedule` - available slots
- [x] Create `POST /api/v1/recruitment/interviews/schedule` - book interview
- [x] Create `PUT /api/v1/recruitment/interviews/[id]/reschedule` - reschedule
- [x] Create `POST /api/v1/recruitment/offers/e-sign` - initiate e-signature
- [x] Create `GET /api/v1/recruitment/offers/[id]/signing-status` - signing status
- [x] Create `POST /api/v1/recruitment/background-check` - initiate check
- [x] Create `GET /api/v1/recruitment/background-check/[id]` - check status
- [x] Create `GET /api/v1/recruitment/referrals` - list referrals
- [x] Create `POST /api/v1/recruitment/referrals` - submit referral
- [x] Create `GET /api/v1/recruitment/career-site` - career site config
- [x] Create `PUT /api/v1/recruitment/career-site` - update career site
- [x] Implement resume parsing with AI/ML (OpenAI or custom model)
- [x] Implement candidate scoring algorithm
- [x] Implement calendar integration service for scheduling

---

### 2.6 Performance APIs (14 Tasks)

- [x] Create `/apps/web/src/lib/services/feedbackService.ts`
- [x] Create `GET /api/v1/feedback` - list all feedback (with filters)
- [x] Create `POST /api/v1/feedback` - submit feedback
- [x] Create `GET /api/v1/feedback/received` - received feedback
- [x] Create `GET /api/v1/feedback/given` - given feedback
- [x] Create `GET /api/v1/recognition` - recognition feed
- [x] Create `POST /api/v1/recognition` - give recognition
- [x] Create `GET /api/v1/recognition/leaderboard` - points leaderboard
- [x] Create `GET /api/v1/performance/goals/alignment` - goal tree
- [x] Create `POST /api/v1/performance/calibration` - calibration session
- [x] Create `GET /api/v1/performance/calibration/[id]` - get session
- [x] Create `GET /api/v1/performance/one-on-ones` - list 1:1 meetings
- [x] Create `POST /api/v1/performance/one-on-ones` - schedule 1:1
- [x] Create `GET /api/v1/performance/skills-gap` - skills gap analysis

---

### 2.7 Learning APIs (14 Tasks)

> **CODEBASE AUDIT NOTE (v3.4):** These 14 v1.0 tasks are ALL complete and represent a fraction of actual implementation.
> **Actual codebase inventory**: 34 API routes (~3,000 lines: 8 core learning + 11 v1 learning + 14 competency library + 1 AI learning) | 33+ Prisma models (13 core L&D models + 20+ competency library models in separate schema-competency.prisma 358 lines — CompetencyCategory, CompetencyCatalog, ProficiencyFramework, ProficiencyLevel, JobRole, SkillAssessment, GapAnalysis, DevelopmentPlan, DevelopmentActivity, DevelopmentMilestone + more) | 15 frontend components (7,000 lines — AILearningRecommendations 850L, QuizBuilder 877L, QuizResults 714L, VideoPlayer 788L, SkillsGapAnalysis 548L, PathBuilder 465L + 9 more) | 2 service layers (LearningPathsService 190L + CompetencyLibraryService 682L) | Industry-specific training routes (aviation, manufacturing, health & safety) | AI recommendations (role-based, skill-gap, career-path, peer-popular, AI-suggested) | Full quiz engine with 4 question types.
> **Enterprise gaps vs Cornerstone OnDemand/Docebo/Workday Learning/SAP SuccessFactors Learning**: No SCORM 1.2/2004 runtime or xAPI LRS, no learning experience platform (LXP) with social learning, no compliance training engine (auto-assign mandatory, regulatory tracking), no external content integrations (LinkedIn Learning, Udemy, Coursera), no gamification system, no training ROI analytics, no virtual classroom integration (Zoom/Teams).
> **See Section 21** for 46 enterprise learning tasks.

- [x] Create `/apps/web/src/lib/services/learningService.ts`
- [x] Create `GET /api/v1/learning/paths` - list learning paths
- [x] Create `GET /api/v1/learning/paths/[id]` - path details
- [x] Create `POST /api/v1/learning/paths` - create path (admin)
- [x] Create `POST /api/v1/learning/paths/[id]/enroll` - enroll in path
- [x] Create `POST /api/v1/learning/paths/recommend` - AI recommendations
- [x] Create `POST /api/v1/learning/progress/track` - track progress
- [x] Create `GET /api/v1/learning/progress` - get progress
- [x] Create `GET /api/v1/learning/assessments` - list assessments
- [x] Create `POST /api/v1/learning/assessments` - create assessment
- [x] Create `POST /api/v1/learning/assessments/[id]/submit` - submit answers
- [x] Create `POST /api/v1/learning/certificates/generate` - generate cert
- [x] Create `GET /api/v1/learning/mentorship` - mentorship matches
- [x] Create `POST /api/v1/learning/mentorship` - request mentor

---

### 2.8 Time & Attendance APIs (12 Tasks)

> **CODEBASE AUDIT NOTE (v3.4):** These 12 v1.0 tasks are ALL complete and represent a tiny fraction of actual implementation.
> **Actual codebase inventory**: 98+ API routes (~11,000 lines — 30 attendance/time-tracking + 9 shift management + 20+ leave & absence + 9 overtime/comp-off + 3 timesheet + 2 schedules + 2 project/labor-cost + 2 AI forecasting + legacy routes) | 21 Prisma models (~2,800 lines — AttendancePunch, AttendanceRecord, Shift, ShiftAssignment, ShiftRoster, ShiftSwapRequest, OvertimeRequest, CompOffRequest, AttendanceRegularization, LeavePolicy, LeaveBalance, LeaveRequest, LeaveEncashment, LeaveAccrual, LeaveCarryForward, CompOffEarned, GeofenceLocation, ProjectTimeEntry + 3 more) | 10+ services (~2,800 lines — AttendanceService 853L, ShiftManagementService 390L, OvertimeService 384L, TimeTrackingService 282L, attendance-client.ts 409L, types.ts 514L + scheduling microservice) | 10+ frontend components (BiometricIntegration, BreakComplianceTracker, GeofencingGPS, LaborCostForecasting, VisualScheduleBuilder, ProjectTimeTracker + more) | 3+ background jobs (leave accrual, payroll, reporting) + RabbitMQ queue | 7 shift types (incl. Ramadan) | 9 leave types (incl. Hajj, Maternity 180d) | Multi-level approval workflows | Field force tracking | AI leave forecasting.
> **Enterprise gaps vs UKG/Kronos/ADP Workforce/Ceridian Dayforce/Replicon**: No AI-powered auto-scheduling, no predictive scheduling law compliance (SF/NYC/OR), no FMLA eligibility tracking, no FLSA compliance engine, no workforce analytics dashboard (absence cost, labor utilization), no union/CBA rule engine, no multi-modal biometric with liveness detection, no advanced absence pattern ML analysis.
> **See Section 22** for 40 enterprise time & attendance tasks.

- [x] Create `POST /api/v1/attendance/geofence/validate` - validate location
- [x] Create `GET /api/v1/attendance/geofences` - list geofence locations
- [x] Create `POST /api/v1/attendance/geofences` - create geofence (admin)
- [x] Create `GET /api/v1/attendance/projects` - list projects
- [x] Create `POST /api/v1/attendance/projects/time-entry` - log project time
- [x] Create `GET /api/v1/attendance/projects/timesheet` - weekly timesheet
- [x] Create `GET /api/v1/attendance/schedules` - get schedules
- [x] Create `POST /api/v1/attendance/schedules` - create schedule
- [x] Create `PUT /api/v1/attendance/schedules/[id]` - update schedule
- [x] Create `GET /api/v1/attendance/labor-cost/forecast` - cost forecast
- [x] Create `GET /api/v1/attendance/break-compliance` - compliance report
- [x] Create `POST /api/v1/attendance/biometric/verify` - biometric check

---

### 2.9 Analytics APIs (14 Tasks)

> **CODEBASE AUDIT NOTE (v3.5):** These 14 v1.0 tasks are ALL complete and represent a fraction of actual implementation.
> **Actual codebase inventory**: 48 API routes (26 analytics + 12 reports + 6 dashboards + 3 predictive models + module-specific) | 9 Prisma models (ReportDefinition, ReportExecution, DashboardWidget, PredictiveModel, Prediction, AnalyticsCache, AuditLog, AIAgentConversation, AIAgentMessage) | 26 frontend components (119KB — CustomReportBuilder 16KB, PeopleAnalytics 21KB, ReportScheduler 14KB, DraggableWidgetGrid, 10 dashboard widgets) | 9 core services (~3,000 lines — AnalyticsService 667L, ReportService 628L, DashboardService 200L, AttritionPredictionService 828L, WorkforceAnalyticsService 847L, SentimentAnalysis, PerformancePrediction) | 18+ AI routes (attrition, sentiment, anomaly, coaching, org-health, workforce, leave-forecasting, job-matching) | 23 predefined report templates (payroll, attendance, leave, headcount, GOSI) | 9 chart types (BAR, LINE, PIE, DONUT, AREA, SCATTER, RADAR, FUNNEL, GAUGE) | 5-step CustomReportBuilder wizard | PredictiveModel ML pipeline with training/retraining | 23 module-specific analytics endpoints.
> **Enterprise gaps vs Visier/Workday People Analytics/One Model/Crunchr/Tableau**: No data warehouse / ETL pipeline, no self-service BI with drag-and-drop visualization builder, no natural language querying (NLQ), no external benchmarking (industry/geo/size), no organizational network analysis (ONA), no workforce scenario modeling (RIF/reorg/M&A what-if), no compensation modeling, no automated narrative generation (NLG), no compliance/audit analytics dashboards.
> **See Section 23** for 44 enterprise analytics tasks.

- [x] Create `/apps/web/src/lib/services/analyticsService.ts`
- [x] Create `GET /api/v1/analytics/headcount` - headcount metrics
- [x] Create `GET /api/v1/analytics/turnover` - turnover analysis
- [x] Create `GET /api/v1/analytics/diversity` - DEI metrics
- [x] Create `GET /api/v1/analytics/compensation` - comp analytics
- [x] Create `GET /api/v1/analytics/people` - people analytics overview
- [x] Create `GET /api/v1/analytics/predictive` - predictive insights
- [x] Create `POST /api/v1/analytics/reports/custom` - run custom report
- [x] Create `GET /api/v1/analytics/reports/custom` - list saved reports
- [x] Create `POST /api/v1/analytics/reports/schedule` - schedule report
- [x] Create `GET /api/v1/analytics/real-time` - real-time metrics
- [x] Implement data aggregation service
- [x] Implement report generation engine (PDF/Excel export)
- [x] Implement scheduled report delivery via email

---

### 2.10 Admin & Workflow APIs (15 Tasks)

> **AUDIT NOTE (Feb 2026)**: Deep codebase audit reveals a comprehensive admin platform foundation:
>
> - **15 admin API route files** across 9 sub-domains (workflows, forms, permissions, API keys, branding, data-import, audit-log, ai-config, api-analytics)
> - **WorkflowDesigner** 425-line drag-and-drop canvas + **WorkflowService** 711-line enterprise service + standalone microservice engine with BullMQ worker
> - **Prisma models**: `WorkflowDefinition` (nodes/edges JSON, triggers: MANUAL/EVENT/SCHEDULED), `WorkflowInstance` (status tracking), `Webhook` + `WebhookLog`, `APIKey` (SHA-256 hash, scopes), `AuditLog` (63 action types, 4 severity levels)
> - **RBAC**: 6 roles (SUPER_ADMIN → EMPLOYEE), 29 resources, permission matrix with 10 granular actions
> - **Multi-tenant middleware** (306 lines): `validateTenantAccess`, `addTenantFilter`, super-admin bypass, violation logging
> - **API key module** (424 lines): SHA-256 hashing, timing-safe verification, scope-based permissions, `aura_` prefix
> - **Webhook system**: HMAC signing, retry config, custom headers, delivery tracking, test endpoint, microservice queue worker
> - **Audit service** (500 lines): 63 actions, severity levels, suspicious activity flagging, SOC 2 compliance fields
> - **Form builder** (353 lines): 11 field types incl. signature/file, approval workflow linking
> - **Branding customizer**: logo (4 variants), 12 color tokens, typography, layout, email templates, login page, custom CSS, draft→publish workflow
> - **Integration registry** (862 lines): 7 integrations (SAP HCM, QuickBooks, Greenhouse, WPS Bank, GOSI, Slack, Azure AD) with field mappings, rate limits, country support
> - **12 module-specific settings routes** (payroll, benefits, recruitment, security, engagement, etc.)
> - **CRITICAL GAPS**: Many admin routes return hardcoded/mock data (api-keys, branding, forms, permissions). AuditService.search() returns empty (Redis only, not DB). WorkflowService.getWorkflowById() returns null. Form builder has no Prisma model. No BPMN 2.0, no ABAC, no tenant provisioning, no custom field engine, no i18n engine, no iPaaS event bus.
> - **Enterprise gaps filled in Section 24 below** (50 tasks)

#### 2.10.1 Workflow APIs

- [x] Create `/apps/web/src/lib/services/workflowService.ts`
- [x] Create `GET /api/v1/admin/workflows` - list workflow definitions
- [x] Create `POST /api/v1/admin/workflows` - create workflow
- [x] Create `GET /api/v1/admin/workflows/[id]` - get workflow
- [x] Create `PUT /api/v1/admin/workflows/[id]` - update workflow
- [x] Create `DELETE /api/v1/admin/workflows/[id]` - delete workflow
- [x] Create `POST /api/v1/admin/workflows/[id]/execute` - trigger workflow
- [x] Implement workflow execution engine

#### 2.10.2 Form Builder APIs

- [x] Create `GET /api/v1/admin/forms` - list custom forms
- [x] Create `POST /api/v1/admin/forms` - create form
- [x] Create `GET /api/v1/admin/forms/[id]` - get form schema
- [x] Create `POST /api/v1/admin/forms/[id]/submit` - submit form data

#### 2.10.3 Other Admin APIs

- [x] Create `GET /api/v1/admin/permissions/matrix` - permission matrix
- [x] Create `PUT /api/v1/admin/permissions/matrix` - update permissions
- [x] Create `POST /api/v1/admin/data-import` - bulk import with validation
- [x] Create `GET /api/v1/admin/data-import/[id]/status` - import status
- [x] Create `GET /api/v1/admin/api-keys` - list API keys
- [x] Create `POST /api/v1/admin/api-keys` - generate key
- [x] Create `DELETE /api/v1/admin/api-keys/[id]` - revoke key
- [x] Create `GET /api/v1/admin/branding` - get branding config
- [x] Create `PUT /api/v1/admin/branding` - update branding
- [x] Create `GET /api/v1/admin/audit-log/export` - export audit log

---

### 2.11 Database Schema (20 Tasks)

> **AUDIT NOTE (Feb 2026)**: Deep Prisma schema audit reveals a massive but architecturally immature database layer:
>
> - **Schema**: Single monolithic `schema.prisma` at **5,941 lines** — no prisma-merge or schema splitting
> - **207 Prisma models**, 31 enums, 180 relations, 465 `@@index`, 60 `@@unique`, 115 `Json` fields across 69 models
> - **Model verification**: 23 of 24 listed models EXIST. Only `LifeEvent` bare is missing (exists as `EmployeeLifeEvent` + `LifeEventType` split)
> - **Multi-tenant**: 118/207 models have `tenantId` (57%) — lookup/master tables correctly excluded, but `CostCenter`/`JobFunction`/`JobFamily`/`JobProfile` missing tenantId
> - **47 seed files** (22 numbered + 15 domain + 4 scripts + 2 in prisma/ + barrel exports)
> - **Connection pool**: Environment-aware (dev:10/staging:15/prod:20), PgBouncer guide, health check via `pg_stat_activity`
> - **Slow query logging**: `$use` middleware warns at >100ms (prod) / >50ms (dev)
> - **Migration**: `add_gap_analysis_models` DOES NOT EXIST — bundled into massive catch-all `20260221000000_add_new_hcm_models`. Only 6 total migrations for 207 models
> - **CRITICAL GAPS**: (1) NO soft delete anywhere — zero `deletedAt`/`isDeleted` in active schema, (2) NO `@@map` — PascalCase table names in PostgreSQL instead of snake_case, (3) NO `$extends` Prisma client extensions, (4) NO Row-Level Security (RLS) at database level, (5) NO PostgreSQL audit triggers, (6) 54 models with zero indexes, (7) `createdBy`/`updatedBy` only on 37 of 207 models, (8) NO table partitioning for high-volume tables, (9) schema-index divergence (separate SQL file), (10) NO form/branding Prisma models
> - **Enterprise gaps filled in Section 25 below** (46 tasks)

#### 2.11.1 New Prisma Models

- [x] Add `EmployeeDocument` model to schema.prisma
- [x] Add `TaxDocument` model to schema.prisma
- [x] Add `Dependent` model to schema.prisma
- [x] Add `LifeEvent` model to schema.prisma
- [x] Add `BenefitEnrollment` model to schema.prisma
- [x] Add `ContinuousFeedback` model to schema.prisma
- [x] Add `Recognition` model to schema.prisma
- [x] Add `OneOnOneMeeting` model to schema.prisma
- [x] Add `OneOnOneNote` model to schema.prisma
- [x] Add `OneOnOneActionItem` model to schema.prisma
- [x] Add `LearningPath` model to schema.prisma
- [x] Add `LearningPathEnrollment` model to schema.prisma
- [x] Add `LearningProgress` model to schema.prisma
- [x] Add `Assessment` and `AssessmentSubmission` models
- [x] Add `Webhook` model to schema.prisma
- [x] Add `WebhookLog` model to schema.prisma
- [x] Add `CustomReport` model to schema.prisma
- [x] Add `WorkflowDefinition` model to schema.prisma
- [x] Add `WorkflowInstance` model to schema.prisma
- [x] Add `ProjectTimeEntry` model to schema.prisma
- [x] Add `GeofenceLocation` model to schema.prisma
- [x] Add `ExpenseClaim` model to schema.prisma
- [x] Add `APIKey` model to schema.prisma
- [x] Run `prisma migrate dev --name add_gap_analysis_models`
- [x] Run `prisma generate` to update client

---

### 2.12 Background Jobs/Workers (10 Tasks)

> **AUDIT NOTE (Feb 2026)**: Deep codebase audit reveals a comprehensive but largely mock job/queue infrastructure:
>
> - **10 job files** ALL EXIST but ALL are **mock-only** — zero DB queries, hardcoded data (e.g., payroll hardcodes 55 employees), every file re-declares `JobResult` interface (no shared base type)
> - **Dual queue stacks**: (1) RabbitMQ via `amqplib` in main web app — `rabbitmq.ts` 373L, `messaging.service.ts` 320L, `queue.service.ts` 117L (deprecated wrapper), 6 queues + 3 DLQ sinks, 24h TTL, max 10K messages, 3-retry with DLQ move; (2) BullMQ v5 in 3 microservices — 4 workers (metrics-aggregation concurrency:5, report-generation:3, webhook-delivery:10 with rate limiter 100/s, workflow-execution:10 with DAG walking)
> - **node-cron scheduler** (547L): 8 registered cron jobs (daily payroll, monthly payroll init, daily leave accrual, hourly attendance, weekly reports, monthly statutory, cache warmup every 6h, daily DB cleanup). In-process execution + best-effort RabbitMQ dispatch. Scheduler API at `/api/scheduler` with start/stop/trigger/pause/resume
> - **Two EventBus implementations**: Local `eventBus.ts` (346L, wildcard sub, in-memory DLQ with retry, 1K event history) + Domain `@aura/events` (143L, typed DomainEvent with correlationId/causationId, 10K event store). 23 domain events defined (9 employee, 5 leave, 7 payroll)
> - **@aura/messaging package**: QueueManager with 10 queue configs (notifications email/sms/push, documents generate/process, payroll calculate/export, events audit, 3 DLQ sinks)
> - **Phase 3 init chain**: `initializePhase3Services()` → messaging → search → events → scheduler with SIGINT/SIGTERM graceful shutdown
> - **CRITICAL GAPS**: (1) All 10 job files are mock stubs — no real processing, (2) No BullMQ dashboard (Bull Board), (3) No distributed cron locking — all instances fire simultaneously, (4) DLQ sinks have no consumer workers, (5) No job priority enforcement, (6) No job deduplication, (7) Scheduler state is in-memory only — lost on restart, (8) Two parallel queue stacks (RabbitMQ + BullMQ) with impedance mismatch, (9) No Prometheus/metrics for queue depth, (10) No alerting on job failures
> - **Enterprise gaps filled in Section 26 below** (38 tasks)

- [x] Create `/apps/web/src/lib/jobs/payrollProcessingJob.ts`
- [x] Create `/apps/web/src/lib/jobs/taxDocumentGenerationJob.ts`
- [x] Create `/apps/web/src/lib/jobs/reportGenerationJob.ts`
- [x] Create `/apps/web/src/lib/jobs/webhookDeliveryJob.ts`
- [x] Create `/apps/web/src/lib/jobs/dataSyncJob.ts`
- [x] Create `/apps/web/src/lib/jobs/leaveAccrualJob.ts`
- [x] Create `/apps/web/src/lib/jobs/anniversaryReminderJob.ts`
- [x] Create `/apps/web/src/lib/jobs/complianceCheckJob.ts`
- [x] Create `/apps/web/src/lib/jobs/aiRecommendationJob.ts`
- [x] Create `/apps/web/src/lib/jobs/dataRetentionJob.ts`
- [x] Set up BullMQ or similar job queue infrastructure
- [x] Create job scheduler for cron-based jobs

---

### 2.13 New Microservices (18 Tasks)

> **AUDIT NOTE (Feb 2026)**: Deep codebase audit reveals 10 microservices in `/services/` — 6 functional, 4 pure stubs:
>
> - **auth-service** (port 3001): Most mature — Fastify 4.25, bcrypt/JWT/MFA(speakeasy)/OAuth2/SAML, dd-trace APM, @fastify/rate-limit via Redis, health/ready/live endpoints checking DB+Redis, typed config (93L), gRPC deps declared but zero `.proto` files, graceful shutdown with SIGINT/SIGTERM
> - **integration-service** (port 3008): Fastify 4.26, webhook CRUD (72L) + integrations CRUD (74L), HMAC-SHA256 signing, BullMQ webhook worker (concurrency:10, rate:100/s). **All Slack/Teams/Calendar calls are TODO stubs** — zero actual API calls
> - **analytics-service** (port 3007): Fastify 4.26, metrics+reports (4 inline endpoints), BullMQ workers (metrics:5, reports:3). **metricsService TODO: real DB queries**, reportService TODO: pdfkit/exceljs stubs
> - **workflow-service** (port 3010): Fastify 4.26, DAG engine (260L) with 7 node types, BullMQ execution worker (concurrency:10). **In-memory Map store — state lost on restart**
> - **ai-service** (port 3000 — **PORT COLLISION with web app**): predictiveService (335L) with attrition risk model, resume parsing, recommendations. **OpenAI calls are TODO stubs**
> - **scheduling-service** (port 3009): scheduleService (206L) + shiftService (247L) with conflict detection. **In-memory Map store — state lost on restart**
> - **employee-service** (port 3002): **PURE STUB** — raw `http.createServer` 34L, returns static JSON on all routes, zero routing/logic despite declaring Prisma/Elasticsearch/Fastify/Redis deps
> - **notification-service** (port 3003): **PURE STUB** — raw `http.createServer` 34L, declares amqplib/nodemailer/twilio/firebase-admin but none wired
> - **document-service** (port 3004): **PURE STUB** — raw `http.createServer` 34L, declares @aws-sdk/client-s3/clamscan but none wired
> - **payroll-service** (port 3005): **PURE STUB** — raw `http.createServer` 34L, declares decimal.js/Prisma but none wired
> - **Shared packages**: @aura/messaging (RabbitMQ — BUILT but ZERO services import it), @aura/events (EventBus — BUILT but in-memory only), @aura/monitoring (MetricsCollector — console.debug mock), @aura/database, @aura/auth, @aura/search
> - **Infrastructure**: Kong API gateway (auth-service only enabled), Istio gateway (canary split, mTLS STRICT, auth-service only), K8s manifests (auth-service only — HPA 3-10 replicas, PDB), docker-compose (all 10 services), empty Terraform/Ansible/Helm
> - **CRITICAL GAPS**: (1) 4 stub services with zero implementation, (2) All 3rd-party integration calls are TODO stubs, (3) No gRPC despite deps, (4) No cross-service messaging wired, (5) No circuit breakers, (6) 9/10 lack dependency health checks, (7) 5/10 have no graceful shutdown, (8) Only auth-service has K8s/Istio/Kong, (9) Port collision ai-service:3000, (10) In-memory state in scheduling+workflow services, (11) No service-to-service auth, (12) No Helm charts, empty IaC
> - **Enterprise gaps filled in Section 27 below** (38 tasks)

#### 2.13.1 Integration Service

- [x] Create `/services/integration-service/package.json`
- [x] Create `/services/integration-service/src/index.ts` (Fastify entry)
- [x] Create `/services/integration-service/src/routes/webhooks.ts`
- [x] Create `/services/integration-service/src/routes/integrations.ts`
- [x] Create `/services/integration-service/src/services/webhookService.ts`
- [x] Create `/services/integration-service/src/services/slackService.ts`
- [x] Create `/services/integration-service/src/services/teamsService.ts`
- [x] Create `/services/integration-service/src/services/calendarService.ts`
- [x] Create `/services/integration-service/src/workers/webhookDeliveryWorker.ts`
- [x] Create `/services/integration-service/Dockerfile`

#### 2.13.2 Analytics Service

- [x] Create `/services/analytics-service/package.json`
- [x] Create `/services/analytics-service/src/index.ts`
- [x] Create `/services/analytics-service/src/services/metricsService.ts`
- [x] Create `/services/analytics-service/src/services/reportService.ts`
- [x] Create `/services/analytics-service/src/workers/reportGenerationWorker.ts`
- [x] Create `/services/analytics-service/src/workers/metricsAggregationWorker.ts`
- [x] Create `/services/analytics-service/Dockerfile`

#### 2.13.3 Workflow Service

- [x] Create `/services/workflow-service/package.json`
- [x] Create `/services/workflow-service/src/index.ts`
- [x] Create `/services/workflow-service/src/services/workflowEngine.ts`
- [x] Create `/services/workflow-service/src/services/approvalService.ts`
- [x] Create `/services/workflow-service/src/workers/workflowExecutionWorker.ts`
- [x] Create `/services/workflow-service/Dockerfile`

#### 2.13.4 Scheduling Service

- [x] Create `/services/scheduling-service/package.json`
- [x] Create `/services/scheduling-service/src/index.ts`
- [x] Create `/services/scheduling-service/src/services/scheduleService.ts`
- [x] Create `/services/scheduling-service/src/services/shiftService.ts`
- [x] Create `/services/scheduling-service/Dockerfile`

#### 2.13.5 AI Service

- [x] Create `/services/ai-service/package.json`
- [x] Create `/services/ai-service/src/index.ts`
- [x] Create `/services/ai-service/src/services/resumeParsingService.ts`
- [x] Create `/services/ai-service/src/services/recommendationService.ts`
- [x] Create `/services/ai-service/src/services/predictiveService.ts`
- [x] Create `/services/ai-service/Dockerfile`

---

## SECTION 3: SEEDS & DATA (206 Tasks) — 78 COMPLETED + 128 ENTERPRISE UPGRADE

> **AUDIT NOTE (Feb 2026)**: Deep audit reveals 40 seed files + 3 scripts (12,127 total lines) with critical structural problems:
>
> - **Master seed orchestrator** (`prisma/seed.ts` 943L): Seeds ~60-70 of 207 models (30%). Sequential execution, no transaction wrappers, no rollback. Uses `@ts-ignore` in places. Password "Admin@123" stored in plain text.
> - **CRITICAL: 14 of 15 named Section 3 seeds target Prisma models that DO NOT EXIST** — `HolidayCalendar`, `TaxJurisdiction`, `IndustryCode`, `JobClassification`, `ComplianceRule`, `DocumentTemplate`, `EmailTemplate`, `ReportTemplate`, `ApprovalChain`, `BreakRule`, `OvertimeRule`, `IntegrationConfig`, `WorkflowTemplate` — ALL WILL FAIL at runtime. Only `NotificationTemplate` exists in schema.
> - **None of the 15 named seeds are called from `seed.ts`** — they're orphaned standalone functions with no orchestration wiring
> - **Numbered seeds (01-22)**: 22 files with numbering collisions (19×2, 20×2, 21×2). employment-history seed is a stub that writes nothing. 14-geo-masters.seed.ts is strongest (832L, ~700 states+cities across 23 countries)
> - **Data quality**: US 2024 tax brackets accurate (IRS Rev. Proc. 2023-34), UK rates correct, India New Regime correct, UAE/Saudi VAT correct. HRK (Croatian Kuna) obsolete — Croatia adopted EUR. SWIFT codes incomplete (HSBC="HSBC"). Floating holidays stored as pattern strings with no runtime resolver.
> - **Coverage gaps**: Only 17 of ~250 ISO countries seeded. Kuwait missing entirely (major GCC market). No Saudi GOSI rates, no UAE WPS config, no India PF/ESI/Professional Tax slabs, no GCC EOSB formulas. No ISIC/NIC/NACE industry codes. No demo employee population (only 1 admin user). Zero data migration/import/anonymization tools.
> - **Model coverage**: ~60-70 of 207 Prisma models seeded (~30%). Missing seed data for: all GCC compliance models, all India statutory models, all advanced recruitment (Candidate/Application/Interview), all AI/analytics, all reporting infrastructure.
> - **Enterprise gaps filled in Section 28 below** (44 tasks)

---

### 3.1 New Seed Files (52 Tasks)

#### 3.1.1 Holiday Calendars

- [x] Create `/packages/@aura/database/src/seeds/holiday-calendars.seed.ts`
- [x] Add US federal holidays (11 holidays + observance rules)
- [x] Add US state-specific holidays (CA, NY, TX, etc.)
- [x] Add UK bank holidays (8 holidays)
- [x] Add India national holidays (gazetted + restricted)
- [x] Add UAE holidays (public + private sector)
- [x] Add Canada holidays (federal + provincial)
- [x] Add Australia holidays (national + state)
- [x] Add Germany holidays (federal + state)
- [x] Add France holidays (national)
- [x] Add Singapore holidays
- [x] Add Japan holidays
- [x] Implement floating holiday calculation (e.g., Thanksgiving = 4th Thursday November)
- [x] Implement weekend fallback rules (Saturday→Friday, Sunday→Monday)

#### 3.1.2 Tax Jurisdictions

- [x] Create `/packages/@aura/database/src/seeds/tax-jurisdictions.seed.ts`
- [x] Add US federal income tax brackets (single, married, head of household)
- [x] Add US state income tax rates (all 50 states + DC)
- [x] Add US FICA (Social Security + Medicare) rates
- [x] Add US FUTA (federal unemployment) rate
- [x] Add US state unemployment (SUTA) rates
- [x] Add UK income tax bands (basic, higher, additional)
- [x] Add UK National Insurance rates
- [x] Add India income tax slabs (old regime + new regime)
- [x] Add India EPF/ESI rates
- [x] Add UAE tax rules (no personal income tax, VAT 5%)
- [x] Add GST/VAT configurations for applicable countries
- [x] Add professional tax (India state-level)

#### 3.1.3 Compliance Rules

- [x] Create `/packages/@aura/database/src/seeds/compliance-rules.seed.ts`
- [x] Add US FLSA overtime rules (weekly > 40 hours = 1.5x)
- [x] Add California overtime rules (daily > 8 hours = 1.5x, > 12 hours = 2x)
- [x] Add California meal break rules (30 min after 5 hours)
- [x] Add California rest break rules (10 min every 4 hours)
- [x] Add US FMLA leave rules (12 weeks unpaid)
- [x] Add US minimum wage (federal + state-level)
- [x] Add US sick leave mandates (state-level)
- [x] Add UK working time regulations (48 hours/week max)
- [x] Add UK statutory sick pay rules
- [x] Add India Shops & Establishments Act rules
- [x] Add India Maternity Benefit Act rules
- [x] Add UAE labor law rules (work hours, leave)
- [x] Add notice period requirements by jurisdiction

#### 3.1.4 Document Templates

- [x] Create `/packages/@aura/database/src/seeds/document-templates.seed.ts`
- [x] Add standard offer letter template (US)
- [x] Add offer letter template (India)
- [x] Add offer letter template (UK)
- [x] Add employment contract template (permanent)
- [x] Add employment contract template (fixed-term)
- [x] Add NDA/confidentiality agreement template
- [x] Add non-compete agreement template
- [x] Add termination letter template (voluntary)
- [x] Add termination letter template (involuntary)
- [x] Add experience/relieving letter template
- [x] Add policy acknowledgment form template
- [x] Add probation confirmation letter template

#### 3.1.5 Email Templates

- [x] Create/Enhance `/packages/@aura/database/src/seeds/email-templates.seed.ts`
- [x] Add welcome email (new hire)
- [x] Add onboarding day-1 email
- [x] Add onboarding week-1 checklist email
- [x] Add leave request notification (to manager)
- [x] Add leave approved/rejected notification
- [x] Add performance review initiation email
- [x] Add performance review reminder email
- [x] Add recognition received notification
- [x] Add birthday/anniversary greeting email
- [x] Add payroll processed notification
- [x] Add password reset email
- [x] Add account locked notification
- [x] Add benefits enrollment reminder
- [x] Add document expiry warning

#### 3.1.6 Report Templates

- [x] Create `/packages/@aura/database/src/seeds/report-templates.seed.ts`
- [x] Add headcount report template (by dept, location, type)
- [x] Add turnover/attrition report template
- [x] Add compensation summary report template
- [x] Add attendance summary report template
- [x] Add leave balance report template
- [x] Add performance rating distribution template
- [x] Add recruitment pipeline report template
- [x] Add training completion report template
- [x] Add diversity metrics report template
- [x] Add compliance audit report template

#### 3.1.7 Workflow Templates

> **v1.0 Baseline** (9 tasks — completed): 8 basic workflow templates seeded.
> **Enterprise Gap**: Architecture specifies 10 HCM workflows — missing payroll approval, recruitment pipeline, salary revision, grievance resolution, travel request, performance review. Enterprise HCM requires 20+ workflow templates with conditional routing, SLA escalation, multi-country variants, and compliance workflows (DSAR, visa processing, benefits enrollment). Workday ships 50+ pre-built workflow templates. SAP SuccessFactors includes 30+ approval templates with configurable routing rules.

- [x] Create `/packages/@aura/database/src/seeds/workflow-templates.seed.ts`
- [x] Add employee onboarding workflow (IT setup → docs → orientation → training)
- [x] Add employee offboarding workflow (exit interview → asset return → access revoke)
- [x] Add leave approval workflow (employee → manager → HR optional)
- [x] Add expense approval workflow (employee → manager → finance)
- [x] Add job requisition workflow (manager → HR → budget approval)
- [x] Add promotion workflow (manager → HR → comp review → approval)
- [x] Add transfer workflow (current manager → HR → new manager)
- [x] Add probation confirmation workflow (manager → HR → confirmation letter)
- [ ] Add payroll approval workflow (Payroll Officer → Finance Manager → CFO; conditional routing: standard payroll auto-approve if variance <2%, off-cycle requires VP Finance; parallel: payroll report + GL posting approval; SLA: 24hr per step with auto-escalation; rollback step if rejected; audit trail per approver with timestamp + IP + comments)
- [ ] Add recruitment pipeline workflow (Screening → Phone screen → Technical interview → Panel interview → Hiring manager decision → Offer approval → Background check → Offer extension → Acceptance; configurable interview rounds per job level; parallel interviewer feedback collection; scorecard aggregation; offer approval routing by salary band: <$100K manager, <$200K VP, >$200K C-suite; diversity checkpoint gate)
- [ ] Add salary revision workflow (Manager nomination → HR compensation review → Market data validation → Compensation committee → CFO approval → Employee communication; budget impact calculation at each step; equity analysis gate: flag if revision creates pay gap >5%; effective date scheduling; letter generation on approval; retroactive pay calculation trigger)
- [ ] Add grievance resolution workflow (Employee submission → HR acknowledgment within 24hr → Case assignment → Investigation with witness interviews → Committee review → Resolution → Employee appeal option → Final decision; confidentiality controls per step; mandatory documentation; SLA: resolution within 15 business days; external mediator escalation path)
- [ ] Add travel request workflow (Employee → Manager approval → Finance budget check → Travel desk booking → Pre-trip compliance check → Trip → Post-trip expense reconciliation; per-diem calculation by destination country; advance payment trigger; travel policy validation: class of travel by employee level; visa requirement check for international travel)
- [ ] Add performance review workflow (Self-assessment → Manager review → Skip-level calibration → HR normalization → Final rating → Employee acknowledgment → Development plan; calibration matrix: 9-box grid forced distribution; bell curve validation per department; compensation linkage trigger; PIP auto-initiation for consecutive low ratings; 360-feedback collection as parallel sub-workflow)
- [ ] Add DSAR (Data Subject Access Request) workflow (Request receipt → Identity verification → DPO assessment → Data inventory search across all systems → Data compilation → Legal review → Response delivery within 30 days; GDPR Article 15/17 compliance; automated data discovery across microservices; redaction of third-party PII; audit trail for regulatory evidence; extension notification if >30 days needed)
- [ ] Add visa/immigration processing workflow (Employee/PRO request → Document checklist per visa type × country → Document collection → Government portal submission → Status tracking → Approval/Rejection → Visa stamping → Medical/Emirates ID/IQAMA; country-specific variants: UAE residence visa, Saudi IQAMA, Qatar QID, Bahrain CPR; renewal reminder 90 days before expiry; dependent visa sub-workflow; cancellation workflow on termination)
- [ ] Add benefits enrollment workflow (Open enrollment window announcement → Employee plan selection → Dependent addition with documentation → HR review → Carrier/TPA sync → Confirmation with ID cards; life event triggers: marriage, birth, divorce with 30-day window; cost calculator showing employee vs employer contribution; plan comparison tool; auto-enrollment for mandatory benefits; COBRA trigger on termination for US employees)
- [ ] Add contract renewal workflow (System alert 90 days before expiry → Manager review of terms → HR terms update → Legal review for changes → Employee notification → Acceptance/Negotiation → Digital signature → Updated records; auto-renewal option for standard contracts; probation-to-permanent conversion variant; fixed-term to permanent conversion; salary adjustment trigger on renewal)
- [ ] Add loan/salary advance approval workflow (Employee request with amount + reason → Manager endorsement → HR policy validation → Finance approval with repayment schedule → Payroll deduction setup → Disbursement; loan-against-EOSB variant for GCC; policy limits: max 3 months salary, max 2 active loans; EMI calculation and payroll integration; early repayment option)
- [ ] Add conditional routing rules seed data per workflow template (threshold-based routing: leave >5 days needs HR, expense >$5K needs VP, salary revision >15% needs CHRO; role-based escalation: skip-level if manager unavailable >48hr; delegation rules: out-of-office auto-delegate to specified backup; parallel approval: all approvers vs any approver vs majority; SLA timeout actions: auto-approve, auto-reject, escalate, notify; country-specific routing overrides per workflow)

#### 3.1.8 Skills Taxonomy

> **v1.0 Baseline** (8 tasks — completed): Basic skills categories with proficiency levels and job family mapping.
> **Enterprise Gap**: Only 5 broad categories seeded. No ESCO v1.1 (13,890 skills) or O\*NET crosswalk. No emerging tech skills (AI/ML, cloud, cybersecurity). No GCC-specific skills (Arabic business, Islamic finance, oil & gas). No skill decay metadata, no verification methods, no multilingual names. Enterprise HCM platforms like Workday Skills Cloud have 50,000+ skills with AI-powered taxonomy. Cornerstone/Degreed maintain real-time skill graphs with adjacency data and market demand signals.

- [x] Create `/packages/@aura/database/src/seeds/skills-taxonomy.seed.ts`
- [x] Add technical skills category (programming languages, frameworks, tools)
- [x] Add soft skills category (communication, leadership, teamwork)
- [x] Add management skills category (delegation, coaching, strategy)
- [x] Add industry-specific skills (healthcare, finance, manufacturing)
- [x] Add certifications (PMP, AWS, CPA, PHR, SHRM)
- [x] Add proficiency levels (beginner, intermediate, advanced, expert)
- [x] Map skills to job families/roles
- [ ] Add emerging technology skills category (AI/ML: prompt engineering, MLOps, NLP, computer vision; Cloud: AWS Solutions Architect, Azure DevOps, GCP, Kubernetes, Terraform; Cybersecurity: penetration testing, SOC analysis, incident response, zero trust; Data: data engineering, data science, analytics engineering, dbt, Spark; Low-code: Power Platform, OutSystems, Mendix; each with proficiency descriptors and certification mapping)
- [ ] Add GCC/MENA-specific skills category (Arabic business communication, Islamic finance & Sharia compliance, oil & gas operations management, construction project management, free zone regulatory knowledge, PRO/government relations, Arabic-English translation, hospitality management, real estate regulatory compliance, Emiratisation/Saudization program management; each tagged with relevant GCC countries)
- [ ] Add compliance & regulatory skills category (SOX compliance administration, GDPR data protection, HIPAA privacy & security, OSHA safety management, WPS administration, GOSI/SIO filing, labor law per jurisdiction, AML/KYC compliance, trade compliance & sanctions screening, environmental/ESG reporting; with mandatory renewal periods and regulatory body references)
- [ ] Add skill proficiency assessment criteria per level (beginner: performs supervised tasks with guidance, can follow documented procedures; intermediate: works independently, troubleshoots common issues, mentors beginners; advanced: designs solutions, leads initiatives, mentors intermediate; expert: industry recognition, publishes/speaks, shapes organizational strategy, innovates; each level with observable behaviors, evidence requirements, and assessment methods per skill type)
- [ ] Add skill decay/shelf-life metadata (technology skills: 18-36 months half-life; compliance certifications: 12 months mandatory renewal; language skills: 60+ months with regular use; domain expertise: 36-60 months; leadership/soft skills: 48+ months; auto-flag stale skills for reassessment based on last verification date; decay curve model: exponential vs linear per skill type; re-certification trigger notifications)
- [ ] Add skill verification methods seed data (self-assessment: employee rates own proficiency with evidence; manager validation: manager confirms/adjusts with calibration; peer endorsement: 3+ peer endorsements for credibility; certification exam: link to external cert body with expiry tracking; practical assessment: hands-on project/simulation evaluation; portfolio review: work samples demonstrating skill application; AI-assisted assessment: automated skill inference from project history and code contributions)
- [ ] Add multilingual skill names and descriptions (all skills with translations in: English (en), Arabic (ar), Hindi (hi), Urdu (ur), Tagalog (tl), Malayalam (ml), Tamil (ta), French (fr); RTL rendering flags for Arabic/Urdu; transliteration for search: "برمجة" ↔ "programming"; regional skill name variants: "CV" vs "resume", "PTO" vs "annual leave"; Unicode normalization for search matching)
- [ ] Add skill-to-competency framework mapping (map each skill to organizational competency model: technical competencies, behavioral competencies, leadership competencies per level; competency-based job profiles: required vs preferred skills per role; gap analysis enablement: employee skills vs role requirements; development path: skills needed to reach next career level; succession planning input: critical skills for key positions)
- [ ] Add ESCO/O*NET crosswalk mapping data (map internal skills taxonomy to ESCO v1.1 occupations and skills; map to O*NET SOC codes and knowledge/skills/abilities; enable international skill recognition and mobility; support cross-border talent matching for GCC expat workforce; import ESCO skill relationships: essential vs optional per occupation; enable regulatory reporting with standard skill classifications)
- [ ] Add skill adjacency and learning path graph data (related skills: React → TypeScript → Node.js → GraphQL; prerequisite chains: SQL → Data Modeling → Database Design → Data Architecture; learning path sequences: Junior Dev → Mid Dev → Senior Dev → Architect with skill milestones; AI recommendation input: "employees with Skill A typically learn Skill B next"; market demand signals: high/medium/low demand per skill per region; skill cluster groupings for workforce planning)

#### 3.1.9 Notification Templates

> **v1.0 Baseline** (4 tasks — completed): Push, SMS, and in-app templates only.
> **Enterprise Gap**: EMAIL templates are entirely missing — the most critical notification channel for enterprise HR. No WhatsApp Business templates (essential for MENA/India where 90%+ workforce uses WhatsApp). No multi-language templates. No compliance/legal notification templates. No onboarding drip sequences. No payroll-specific templates. No escalation templates. Enterprise HCM platforms deliver 100+ pre-built notification templates across 5+ channels with localization in 20+ languages. SAP SuccessFactors has 200+ event-driven notification templates. Workday ships 150+ configurable notification types.

- [x] Create `/packages/@aura/database/src/seeds/notification-templates.seed.ts`
- [x] Add push notification templates (approval needed, approved, reminder)
- [x] Add SMS templates (clock-in reminder, emergency, OTP)
- [x] Add in-app notification templates (all events)
- [ ] Add email notification templates — HTML + plain text with company branding (welcome email with credentials, payslip delivery with PDF attachment, approval request with action buttons, approval outcome with details, password reset with secure link, leave balance reminder, contract expiry warning at 90/60/30 days, performance review due, policy update requiring acknowledgment, birthday/work anniversary, probation completion, increment/promotion letter, exit clearance status; each with subject line, preview text, header image slot, CTA button, footer with unsubscribe; Handlebars/Mustache template variables: `{{employee.firstName}}`, `{{company.logo}}`, `{{action.url}}`, `{{deadline.formatted}}`)
- [ ] Add WhatsApp Business notification templates (pre-approved by Meta Business API: payslip ready for download, shift reminder with clock-in link, approval needed with approve/reject buttons, document uploaded confirmation, salary credited notification, leave approval/rejection, interview scheduled, offer letter ready; each with template variables per WhatsApp HSM format; language variants: English, Arabic, Hindi; character limits per WhatsApp policy; media message templates for document delivery; quick reply button templates)
- [ ] Add multi-language notification template variants (all templates translated in: English (en), Arabic (ar), Hindi (hi), Urdu (ur), Tagalog (tl), French (fr); RTL layout variants for Arabic/Urdu with mirrored button alignment; dynamic language selection per user preference setting; fallback to English if translation missing; date/time/currency formatting per locale: "25 Feb 2026" vs "٢٥ فبراير ٢٠٢٦" vs "25 फ़रवरी 2026"; gender-aware templates for gendered languages)
- [ ] Add compliance & legal notification templates (data breach notification per GDPR Article 33/34 — within 72 hours with incident details; DSAR acknowledgment — within 48 hours with reference number; policy change requiring consent — with accept/reject and deadline; mandatory training assignment — with completion deadline and consequences; compliance deadline reminder at 30/15/7/1 days; probation extension notice with legal basis; PIP notification with improvement plan; termination notice with notice period details and exit checklist link; non-compete reminder on exit; each with legal review approval flag and regulatory reference)
- [ ] Add escalation notification templates (SLA breach warning: "Approval pending >24 hours — action required"; overdue approval escalation to skip-level: "Your direct report has not acted on {{request.type}} for {{hours}} hours"; pending action reminder sequence at 24hr/48hr/72hr with increasing urgency; auto-escalation to HR for items pending >5 business days; manager absence notification: "{{manager.name}} is OOO — approvals delegated to {{delegate.name}}"; critical system alert for HR admins; payroll deadline warning for finance team)
- [ ] Add digest & batch notification templates (daily approval summary: pending count by type with direct links; weekly HR dashboard: new hires, exits, pending actions, compliance items; monthly compliance report: training completion rates, policy acknowledgments, certification expiries; payroll processing summary: employees processed, exceptions, variance alerts; leave balance monthly reminder: remaining balance with use-it-or-lose-it warning; quarterly performance check-in reminder; each with configurable frequency and unsubscribe option per digest type)
- [ ] Add system & infrastructure notification templates (scheduled maintenance window: 72hr/24hr/1hr advance notice with expected downtime; emergency downtime: immediate notification with estimated restoration; security incident: account locked, suspicious login from new device/location, MFA challenge; new feature announcement: with changelog link and opt-in for beta; password expiry warning at 14/7/3/1 days; session timeout warning at 5 minutes; MFA enrollment reminder for unenrolled users; storage quota warning at 80%/90%/95%; API rate limit approaching for integration partners)
- [ ] Add onboarding notification drip sequence templates (day -7: pre-boarding welcome with document upload checklist; day -3: IT equipment and access setup confirmation; day -1: first day logistics — time, location, dress code, contact person; day 1: orientation schedule with virtual/in-person details; day 3: buddy introduction and team welcome; day 7: first week check-in survey; day 14: training progress reminder; day 30: 30-day milestone with manager check-in prompt; day 60: feedback request and development plan; day 90: probation review notification with self-assessment form; each with timezone-aware scheduling and skip-weekend logic)
- [ ] Add recruitment notification templates (application received: confirmation with job title and expected timeline; application status update: moved to next stage / on hold / rejected with feedback option; interview invitation: date, time, format, interviewer names, preparation tips, calendar invite attachment; interview reminder: 24hr and 1hr before with join link for virtual; panel feedback request: with scorecard link and 48hr deadline; offer letter: with digital acceptance link and expiry date; offer acceptance: with joining details and pre-boarding checklist; background check initiated/completed: with status and estimated timeline; joining date confirmation: with day-1 checklist and required documents)
- [ ] Add payroll notification templates (payslip available: with month, net pay amount, download link; salary credited: with bank last-4-digits, amount, credit date; tax form available: Form 16 (India), W-2 (US), P60 (UK) with download link; bonus processed: with bonus type, amount, tax deduction breakdown; increment letter: with new CTC, effective date, PDF download; full & final settlement: with component breakdown and timeline; salary advance approved/disbursed: with repayment schedule; overtime payment processed: with hours and rate breakdown; reimbursement processed: with claim ID, approved amount, payment date)
- [ ] Add notification template variable system and validation (define standard template variables: `{{employee.firstName}}`, `{{employee.lastName}}`, `{{employee.employeeId}}`, `{{manager.name}}`, `{{company.name}}`, `{{company.logo}}`, `{{action.url}}`, `{{action.label}}`, `{{deadline.date}}`, `{{deadline.daysRemaining}}`, `{{amount.formatted}}`, `{{currency.symbol}}`; fallback values for each variable; variable validation: reject template if undefined variable used; preview rendering with sample data; character count validation per channel: SMS 160, push 100, WhatsApp 1024; template versioning with rollback)
- [ ] Add notification priority and channel routing rules (P0 Critical: security breach, system down — ALL channels simultaneously including phone call; P1 Urgent: approval SLA breach, payroll deadline — push + email + SMS; P2 Standard: payslip ready, leave approved — email + in-app; P3 Informational: announcements, tips, birthday — in-app + weekly digest; channel fallback chain: push fails → SMS → email; quiet hours respect per timezone: no P2/P3 between 10pm-7am; DND override for P0 only; per-user channel preference override)

#### 3.1.10 Industry Codes

> **v1.0 Baseline** (3 tasks — completed): NAICS top 3 levels + SIC major groups only.
> **Enterprise Gap**: US-centric only — missing ISIC Rev.4 (used by ALL GCC governments for commercial licensing), NACE Rev.2 (EU standard), NIC 2008 (India — mandatory for GST, EPFO, ESIC registration). No cross-concordance tables between systems. No Arabic/Hindi translations. Architecture specifies ISIC Rev.4, NAICS, NACE, NIC with concordance. Enterprise HCM platforms maintain 5+ classification systems with full hierarchy and cross-mapping.

- [x] Create `/packages/@aura/database/src/seeds/industry-codes.seed.ts`
- [x] Add NAICS codes (top 3 levels)
- [x] Add SIC codes (major groups)
- [ ] Expand NAICS to full 6-level hierarchy (20 sectors → 99 subsectors → 311 industry groups → 709 NAICS industries → 1,057 national industries; include 2022 revision updates; add sector descriptions and examples; flag regulated industries: financial services, healthcare, defense, energy; enable industry-based compliance rule assignment)
- [ ] Add ISIC Rev.4 industry codes — full hierarchy (21 sections A-U → 88 divisions → 238 groups → 419 classes; mandatory for GCC commercial licensing: UAE DED, Saudi CR, Bahrain MOIC, Qatar QFC; ISIC-to-NAICS concordance table; ISIC-to-SIC concordance; activity descriptions in English and Arabic; used by UN, World Bank, ILO for international reporting)
- [ ] Add NACE Rev.2 industry codes — EU standard (21 sections → 88 divisions → 272 groups → 615 classes; mandatory for EU entity registration and Eurostat reporting; NACE-to-ISIC concordance; NACE-to-NAICS concordance; required for EU Pay Transparency Directive sector benchmarks; multilingual labels per EU official languages)
- [ ] Add India NIC 2008 industry codes (21 sections → 88 divisions → 238 groups → 456 classes; mandatory for: GST registration, EPFO establishment code, ESIC registration, Shops & Establishments license; NIC-to-ISIC Rev.4 concordance; NIC-to-NAICS mapping; descriptions in English and Hindi; industry-specific labor law applicability mapping: Factories Act, Shops Act, IT/ITES exemptions)
- [ ] Add GCC commercial license category mapping (UAE: DED activity codes per emirate, DIFC activity list, ADGM permitted activities, free zone-specific activity catalogs; Saudi: CR activity codes per ISIC, Nitaqat sector classifications; Bahrain: MOIC activity codes; Qatar: QFC activity list; Oman: MOCI business activities; Kuwait: MOCI license types; map each to ISIC Rev.4 parent code; include license requirement flags per activity)
- [ ] Add industry-specific compliance rule mapping (map industries to applicable regulations: financial services → AML/KYC/SOX; healthcare → HIPAA/FDA; defense → ITAR/EAR; energy → NERC/OSHA; construction → OSHA/GCC safety codes; food service → HACCP/FDA; education → FERPA; map industries to mandatory training requirements; map industries to specific labor law provisions per jurisdiction)
- [ ] Add cross-system concordance engine seed data (NAICS↔ISIC↔NACE↔NIC↔SIC complete mapping tables; many-to-many relationships where classifications don't align 1:1; confidence scores for fuzzy mappings; version tracking: NAICS 2022, ISIC Rev.4, NACE Rev.2, NIC 2008; migration path for code changes between revisions; enable automatic industry code translation when employee transfers between countries)
- [ ] Add multilingual industry names and search aliases (all codes with translations in English, Arabic, Hindi, French; industry search aliases: "IT" → "Information Technology", "F&B" → "Food and Beverage", "O&G" → "Oil and Gas"; Arabic industry names for GCC government portal compliance; Unicode-normalized search index; commonly-used abbreviations per region)

#### 3.1.11 Job Classifications

> **v1.0 Baseline** (3 tasks — completed): O\*NET SOC codes + ISCO-08 codes only.
> **Enterprise Gap**: No EEO-1 job categories (legally required for US employers with 100+ employees — EEOC mandate). No FLSA exemption status classifications (determines overtime eligibility — critical for US payroll). No GCC-specific classifications (MOHRE occupation codes for UAE, HRSD for Saudi — required for visa/work permit applications). No India NCS codes. No mapping to internal job levels/grades/salary bands. Architecture specifies EEO-1 categories, FLSA statuses, visa/permit catalogs as required reference data.

- [x] Create `/packages/@aura/database/src/seeds/job-classifications.seed.ts`
- [x] Add O\*NET SOC codes (major groups + detailed)
- [x] Add ISCO-08 codes (international classification)
- [ ] Add EEO-1 job categories and reporting codes (10 EEO-1 Component 1 categories: Executive/Senior Officials, First/Mid Officials & Managers, Professionals, Technicians, Sales Workers, Administrative Support, Craft Workers, Operatives, Laborers, Service Workers; required for employers 100+ or federal contractors 50+; map each to SOC code ranges; include gender × race/ethnicity matrix for headcount reporting; EEOC e-filing format alignment; annual filing deadline September)
- [ ] Add FLSA exemption status classifications (Exempt: Executive, Administrative, Professional, Computer Employee, Outside Sales — with salary threshold $35,568/year minimum; Non-Exempt: eligible for overtime; Highly Compensated Employee: $107,432+; state-specific thresholds: CA $66,560, NY $58,500, WA $67,724.80; map to SOC codes and job levels; salary basis test criteria per exemption type; duties test checklists per category; auto-flag misclassification risk)
- [ ] Add GCC-specific occupation codes (UAE MOHRE: occupation codes required for all work permit applications, map to ISCO-08; Saudi HRSD: occupation codes for Nitaqat compliance, Saudization job categories with nationalization quotas per sector; Bahrain LMRA: occupation codes for flexi-permit and work permit; Qatar MADLSA: occupation codes for QID applications; Oman MOL: occupation codes; each with Arabic names, visa eligibility flags, and minimum salary requirements per occupation)
- [ ] Add India National Classification of Occupations (NCO 2015) (10 major groups → 43 sub-major → 130 minor → 580 unit groups; required for EPFO establishment registration, ESIC contribution records, apprenticeship reporting; NCO-to-ISCO-08 concordance; NCO-to-SOC mapping; descriptions in English and Hindi; skill level classification per NCO group; state-specific minimum wage mapping per occupation)
- [ ] Add job classification-to-salary band mapping (map each classification system to internal salary bands/grades: junior/mid/senior/lead/principal/executive; market-referenced salary ranges per classification × country × industry; compensation benchmarking enablement: "Senior Software Engineer (SOC 15-1252) in UAE → AED 25,000-45,000"; cost-of-living adjustment factors per location; currency-aware ranges with auto-conversion)
- [ ] Add visa/work permit occupation code mapping (map internal job titles to immigration-approved occupation codes per country: UAE → MOHRE codes, Saudi → HRSD codes, US → H-1B specialty occupation SOC codes (LCA requirement), UK → SOC codes for Skilled Worker visa, EU Blue Card → ISCO qualifications; minimum salary thresholds per visa type × occupation; occupation shortage list mapping per country; auto-populate visa application forms from job classification)
- [ ] Add job classification hierarchy and career path mapping (map classifications to career path levels: individual contributor track vs management track; define progression paths: Junior → Mid → Senior → Staff → Principal; competency requirements per level per classification; promotion eligibility criteria from classification metadata; lateral move compatibility: which classifications have transferable skills; succession planning input data per critical classification)
- [ ] Add cross-system classification concordance (SOC↔ISCO-08↔NCO↔MOHRE↔HRSD complete mapping tables; many-to-many with confidence scores; EEO-1↔SOC required mapping for US reporting; classification-to-FLSA exemption default mapping; enable auto-translation of job classification when employee transfers between jurisdictions; version tracking per classification system revision)

#### 3.1.12 Overtime Rules

> **v1.0 Baseline** (3 tasks — completed): Basic multipliers + weekly/daily thresholds only.
> **Enterprise Gap**: No FLSA exempt/non-exempt classification linkage (determines OT eligibility — foundational for US payroll). No California-specific rules (daily OT after 8hr, double time after 12hr, 7th consecutive day rules). No EU Working Time Directive compliance (48-hour max, 11-hour rest). No GCC-specific rules (UAE: max 2hr OT/day, 25% normal/50% night premium, Ramadan reduced hours). No India Factories Act rules (state-wise OT limits, double-rate OT). No predictive scheduling premium rules. Architecture specifies FLSA, EU WTD, GCC country-specific, India Factories Act, and predictive scheduling as required compliance rules.

- [x] Create `/packages/@aura/database/src/seeds/overtime-rules.seed.ts`
- [x] Add overtime multipliers by jurisdiction
- [x] Add weekly/daily threshold configurations
- [ ] Add US FLSA overtime rules with state overrides (federal: 1.5× after 40hr/week for non-exempt; California: 1.5× after 8hr/day AND 40hr/week, 2× after 12hr/day, 1.5× first 8hr on 7th consecutive day then 2×; Colorado: 1.5× after 12hr/day or 40hr/week; Alaska: 1.5× after 8hr/day or 40hr/week; state minimum wage for OT base calculation per state; include FLSA exemption status linkage: exempt employees excluded; white-collar exemption salary thresholds; comp time rules for public sector; record-keeping requirements per FLSA Section 11(c))
- [ ] Add EU Working Time Directive overtime rules (48-hour maximum average working week including OT calculated over 17-week reference period; mandatory 11-hour rest between shifts; mandatory 24-hour uninterrupted rest per 7-day period; night worker limit: 8 hours per 24-hour period; opt-out provisions per member state: UK individual opt-out, France 35hr base; country-specific OT premiums: Germany 25-50%, France 25% first 8hr then 50%, Spain 75% cap; works council/union agreement overrides; annual maximum OT hours per country)
- [ ] Add GCC overtime rules per country (UAE: max 2hr OT/day, 25% premium for daytime OT, 50% premium for night OT (9PM-4AM), Friday work = 50% premium or day off, Ramadan: 6hr workday maximum for private sector, no OT allowed during Ramadan unless essential services; Saudi: max 720 OT hours/year, 150% premium for OT, Ramadan: 6hr/day max; Bahrain: 25% premium, max 2hr/day; Qatar: 25% premium with 2hr/day cap, summer outdoor work ban; Oman: 25% premium, Friday work = 100% premium; Kuwait: 25% premium for daytime, 50% for night/holiday; each with prayer time exclusion from working hours)
- [ ] Add India overtime rules per state and act (Factories Act: 2× OT rate mandatory, max 50hr OT per quarter, max 48hr/week, state-specific limits; Shops & Establishments: varies by state — Maharashtra: 2× after 9hr/day, Karnataka: 2× after 48hr/week; IT/ITES exemption from some OT provisions; female employee restrictions by state with recent relaxations; spread-over limit: 10.5hr including rest; weekly off compensation: 2× for working on rest day; interstate migrant worker specific provisions; Occupational Safety Code 2020 provisions where enacted)
- [ ] Add predictive scheduling overtime/premium rules (San Francisco FWWO: 2-week advance notice, premium pay for last-minute changes; New York City Fair Workweek: 72hr notice for fast food, 2-week for retail; Oregon: 7-day advance, 14-day for large employers; Chicago Fair Workweek: 10-day advance, premium for changes within 10 days; Seattle: 14-day advance, premium pay for schedule changes; right to rest: 10-hour rest between closing and opening shift; access to hours: offer existing employees before hiring new; clopening penalty pay: 1.5× for shifts <11hr apart; per-city enforcement and penalty structures)
- [ ] Add comp-off / TOIL (time off in lieu) rules per jurisdiction (US public sector: comp time accrual at 1.5× for FLSA non-exempt, 240hr cap (480hr for public safety); EU: country-specific TOIL rules vs monetary payment; GCC: Friday work can be compensated with day off instead of premium (UAE Article 70); India: compensatory off within 3 days of working on rest day; banked hours tracking with expiry; manager approval workflow for TOIL election vs cash payment; TOIL balance reporting and carry-forward rules per jurisdiction)
- [ ] Add seasonal and religious calendar overtime adjustments (GCC Ramadan: auto-apply 6hr/day maximum, no OT except essential services, adjust OT calculation base; summer outdoor work ban rules: UAE/Qatar/Saudi 12:30PM-3:00PM June-September, violation penalties; EU summer time working adjustments; India festival overtime premiums by state; seasonal industry rules: agriculture, hospitality, retail with extended OT allowances during peak; auto-calendar integration with holiday engine for jurisdiction-specific adjustments)
- [ ] Add cumulative OT safety thresholds and alerts (WHO/ILO recommendation: >55hr/week increases health risk; fatigue risk management: alert when employee exceeds X consecutive OT days; department OT budget tracking: alert at 80%/90%/100% of budget; individual OT cap enforcement per contract; OT cost projection dashboard input data; OT pattern analysis enablement: identify chronic OT departments for headcount planning; mandatory rest enforcement after extended OT periods; OT trend reporting by team/department/location)

#### 3.1.13 Break Rules

> **v1.0 Baseline** (3 tasks — completed): Basic meal + rest break rules by jurisdiction.
> **Enterprise Gap**: No California-specific penalty pay for missed breaks ($1hr premium per violation). No lactation/nursing break rules (US PUMP Act federal mandate, UAE labor law). No prayer break rules (GCC — 2-3 prayer times during work hours, constitutionally protected). No Ramadan-specific adjustments (GCC — reduced hours, mandatory iftar break). No EU rest period compliance (11-hour minimum between shifts). No India Factories Act break rules. No minor/young worker enhanced breaks. No outdoor heat break rules (GCC midday work ban). Architecture specifies CA meal/rest, WA, MA, OR break compliance as required.

- [x] Create `/packages/@aura/database/src/seeds/break-rules.seed.ts`
- [x] Add meal break rules by jurisdiction
- [x] Add rest break rules by jurisdiction
- [ ] Add US state-specific break penalty and waiver rules (California: 30min unpaid meal after 5hr, second meal after 10hr, 10min paid rest per 4hr, $1hr premium penalty per missed break per day; Washington: 30min meal after 5hr, 10min rest per 4hr; Oregon: 30min meal after 6hr, 10min rest per 4hr; Massachusetts: 30min meal after 6hr; New York: 30min meal for shifts >6hr spanning noon; Colorado: 30min meal after 5hr, 10min rest per 4hr; on-duty meal break waiver conditions per state; auto-schedule break insertion in shift planning; break compliance monitoring and violation alerting)
- [ ] Add lactation/nursing break rules (US PUMP Act: reasonable break time for nursing employees for 1 year after birth, private non-bathroom space required, applies to all FLSA-covered employees; California: beyond PUMP — additional state protections; New York: 30min paid per 3hr shift; UAE: Article 30 — 2 breaks of 30min each for 18 months after birth; India: Maternity Benefit Act — 2 nursing breaks per day until child is 15 months; EU: per member state implementation; break room facility requirements; break time tracking for compliance evidence; manager notification workflow)
- [ ] Add GCC prayer break rules (constitutionally/legally protected prayer times during work hours; 5 daily prayers: Fajr, Dhuhr, Asr, Maghrib, Isha — 2-3 fall during standard work hours; recommended 15-20 minutes per prayer; prayer room facility requirement per labor law; prayer times shift daily based on solar position — integrate with prayer time API per city; Friday Jumu'ah prayer: 45-60 minutes, often mandatory; non-Muslim employees: equivalent rest period; Ramadan: Taraweeh consideration for night shifts; prayer break auto-calculation in time tracking to exclude from working hours)
- [ ] Add Ramadan-specific break and schedule adjustments (UAE: max 6hr/day during Ramadan for private sector, 2hr reduction from normal schedule; Saudi: max 6hr/day during Ramadan; Bahrain/Kuwait/Qatar/Oman: similar reductions per labor law; Iftar break: mandatory break at sunset for fasting employees; Suhoor consideration for night shifts; non-Muslim employees: reduced hours apply to all per most GCC labor laws; Ramadan schedule templates: common patterns 9AM-2PM, 10AM-3PM; auto-activate based on Hijri calendar with government announcement override; Eid al-Fitr holiday transition rules)
- [ ] Add EU rest period and break compliance rules (Working Time Directive: 11-hour minimum uninterrupted rest between working days; 24-hour uninterrupted rest per 7-day period (or 48hr per 14 days); 20-minute break after 6 hours continuous work; night worker health assessment right; country-specific enhancements: France 20min after 6hr, Germany 30min after 6hr + 15min after 9hr, Spain 15min after 6hr; transport/healthcare/hospitality sector derogations; compensatory rest for unavoidable derogations; break tracking for Working Time Directive compliance reporting)
- [ ] Add India break rules per state and act (Factories Act Section 55: 30min rest after 5hr continuous work, spread-over not exceeding 10.5hr including rest; Shops & Establishments: varies by state — Maharashtra: 1hr meal after 5hr, Karnataka: 30min after 5hr; female employee rest period provisions; night shift additional rest requirements where permitted; canteen break provisions for establishments 250+ workers; creche facility break for female employees per Factories Act Section 48; weekly rest day rules per state; interval between shifts minimum requirements)
- [ ] Add minor/young worker enhanced break rules (US FLSA child labor: 14-15 year olds max 3hr on school day, 8hr non-school, 30min break after 5hr, no work before 7AM or after 7PM (9PM summer); EU Young Workers Directive: 30min break after 4.5hr, 12hr rest between shifts, 2 consecutive rest days per week; UAE: no employment under 15, 15-18 limited to 6hr/day with 1hr break after 4hr; India: Child Labour Act 14+ limited hours with mandatory breaks; GCC: country-specific minor worker protections; enhanced break monitoring and compliance alerting for underage workers)
- [ ] Add outdoor heat/weather break rules (GCC midday work ban: UAE/Qatar/Saudi outdoor work prohibited 12:30PM-3:00PM June 15-September 15, violation penalties AED 5,000+ per worker; OSHA heat illness prevention: water, rest, shade requirements; California Heat Illness Prevention: shade access, cool-down rest periods when temp >80°F; Washington outdoor heat exposure rules; India: state-specific heat wave work restrictions; construction industry mandatory hydration breaks; heat index-based automatic break scheduling; weather API integration for real-time threshold monitoring; break compliance documentation for government inspection)

#### 3.1.14 Approval Chains

> **v1.0 Baseline** (4 tasks — completed): Only 3 basic approval chains (leave, expense, requisition).
> **Enterprise Gap**: Enterprise HCM requires 15+ approval chain types with conditional routing, amount-based thresholds, delegation rules, escalation SLAs, and parallel approval support. Missing: payroll, hiring, salary revision, travel, asset request, PO, document, timesheet, benefits enrollment chains. No threshold-based routing (expense >$5K needs VP). No delegation rules (auto-delegate when OOO). No SLA escalation. No country-specific variants. Workday ships 25+ configurable approval chains. SAP SuccessFactors has role-based approval routing with unlimited levels.

- [x] Create `/packages/@aura/database/src/seeds/approval-chains.seed.ts`
- [x] Add default leave approval chain
- [x] Add default expense approval chain
- [x] Add default requisition approval chain
- [ ] Add payroll approval chain (Payroll Officer prepares → Finance Manager reviews variance report → CFO final approval for runs >$X; auto-approve for regular payroll within ±2% of previous month; off-cycle payroll requires VP Finance + HR Head; supplemental payroll: direct manager + finance; international payroll: country payroll lead → regional controller → global payroll head; GL posting auto-triggered on final approval; audit trail with reviewer comments mandatory)
- [ ] Add hiring approval chain with budget gates (Recruiter creates req → Hiring Manager approves role → HR validates headcount budget → Finance confirms budget allocation → VP approval for roles above Band X; conditional: internal transfer = skip finance; executive hiring (VP+): CEO + Board Compensation Committee; contractor/temp hiring: separate chain with procurement; offer approval: recruiter → hiring manager → HR comp review → finance (if above band midpoint); each step with SLA and auto-reminder at 50%/80% of SLA)
- [ ] Add salary revision and compensation approval chain (Manager nominates → HR Compensation Analyst validates market data and equity → Compensation Committee reviews batch → CFO approves budget impact; conditional: <5% increase = manager + HR only; 5-15% increase = add VP; >15% or off-cycle = add CHRO + CFO; equity adjustment: HR + Legal review; promotion-linked revision: combine with promotion chain; country-specific: GCC revision during visa renewal requires PRO notification; retroactive pay calculation auto-triggered on approval)
- [ ] Add travel and expense pre-approval chain (Employee submits → Manager approves → Finance validates budget → Travel Desk books; conditional: domestic travel = manager only; international = add VP; executive travel = CFO; per-diem validation against company policy rates; advance payment auto-trigger for approved international travel; group travel: single approval for group with attendee list; recurring travel: blanket approval for monthly trips; conference/training: add L&D manager approval step)
- [ ] Add document and letter request approval chain (Employee requests → HR reviews template → Manager countersigns where required → HR issues; salary certificate: HR auto-approve within 24hr SLA; experience letter: HR + reporting manager; NOC (No Objection Certificate): HR + department head for GCC; visa support letter: HR + PRO; employment verification: HR auto-approve with standard template; reference letter: manager + HR; each with digital signature and company stamp integration; SLA: routine documents <48hr, legal documents <5 business days)
- [ ] Add timesheet and overtime approval chain (Employee submits weekly → Manager reviews and approves → HR validates compliance; overtime pre-approval: employee requests → manager approves before OT worked; overtime post-approval: auto-generate approval request for unplanned OT; project-based timesheet: add project manager approval step; client-billable time: add client account manager; contractor timesheet: add procurement/vendor manager step; batch approval: manager can approve all team timesheets in single action; compliance check: auto-flag if timesheet violates labor law thresholds)
- [ ] Add benefits enrollment and change approval chain (Employee selects plan → HR Benefits Specialist reviews eligibility → Finance validates cost → Auto-sync to carrier; life event change: employee submits evidence → HR validates within 30-day window; mid-year change: add Benefits Manager approval; executive benefits: add Compensation Committee; dependent addition: HR validates relationship documentation; COBRA election: auto-trigger on qualifying event, HR oversight; open enrollment: batch approval for standard elections, individual review for exceptions)
- [ ] Add conditional routing and threshold rules seed data (amount-based: expense <$500 auto-approve, $500-$5K manager, $5K-$25K VP, >$25K CFO; headcount-based: team <5 = manager only, 5-20 = add HR, >20 = add VP; grade-based: approval of peers requires skip-level; department-based: legal/compliance requests add Chief Compliance Officer; entity-based: subsidiary requests add holding company controller; project-based: R&D expenses add CTO; configurable per tenant with inheritance from parent org unit)
- [ ] Add delegation and out-of-office rules seed data (auto-delegation: when approver sets OOO status, pending approvals route to designated delegate; delegation by type: manager delegates leave approvals to team lead but retains expense approvals; time-bound delegation: delegate authority for specific date range only; delegation chain: if delegate also OOO, escalate to skip-level; delegation notification: both delegator and delegate informed; delegation audit trail: all delegated approvals clearly marked; emergency delegation: HR admin can force-delegate for departed/unavailable managers; delegation limits: delegate cannot approve own requests or requests from their direct reports)
- [ ] Add SLA escalation rules seed data (per approval type: leave=24hr, expense=48hr, payroll=12hr, hiring=72hr, salary revision=5 business days; escalation path: reminder at 50% SLA → urgent reminder at 80% → auto-escalate to skip-level at 100% → HR admin notification at 150%; business hours only SLA calculation with timezone awareness; SLA pause during weekends/holidays per location; SLA metrics: track average approval time, SLA breach rate, escalation frequency; SLA dashboard for HR operations; configurable per tenant and per approval type)

#### 3.1.15 Integration Configs

> **v1.0 Baseline** (4 tasks — completed): Only Slack, Teams, Google Workspace messaging configs.
> **Enterprise Gap**: Architecture documents 7 connectors (SAP HCM, QuickBooks, Greenhouse, WPS Bank, GOSI, Slack, Azure AD) with 862 lines of integration registry — but seeds only have 3 messaging integrations. Missing ALL critical business integrations: accounting (QuickBooks, Xero, SAP), ATS (Greenhouse, Workable), government portals (MOHRE, GOSI, WPS), SSO/directory (Azure AD, Okta), payroll providers (ADP, Ceridian), banking (ACH, SWIFT, WPS). Enterprise customers require 20+ pre-configured integration connectors with field mappings, auth templates, and rate limits.

- [x] Create `/packages/@aura/database/src/seeds/integration-configs.seed.ts`
- [x] Add Slack integration config template
- [x] Add Teams integration config template
- [x] Add Google Workspace config template
- [ ] Add Azure AD / Microsoft Entra ID SSO and directory sync config (OAuth 2.0 + OIDC configuration template with tenant ID, client ID, redirect URIs; SCIM 2.0 provisioning: auto-create/update/deactivate users on directory changes; group-to-role mapping: Azure AD groups → AuraOS roles; attribute mapping: displayName→fullName, mail→email, department→departmentId, jobTitle→positionTitle; sync schedule: incremental every 15min, full sync nightly; conditional access policy integration; multi-tenant Azure AD for SaaS customers; MFA enforcement pass-through)
- [ ] Add Okta SSO and lifecycle management config (OIDC/SAML configuration template; SCIM 2.0 provisioning with attribute mapping; Okta Lifecycle Management: joiner-mover-leaver automation; Okta group → AuraOS role mapping; MFA policy pass-through; Okta Workflows integration for custom automation; session management: SSO session timeout sync; Okta System Log → AuraOS audit trail sync for security events; universal directory attribute sync)
- [ ] Add QuickBooks Online accounting integration config (OAuth 2.0 REST API template with company ID; GL journal entry sync: payroll → expense accounts, liabilities, tax payable; chart of accounts mapping: AuraOS payroll components → QB accounts; vendor sync: employee reimbursements as vendor payments; invoice sync for contractor payments; bank feed reconciliation; multi-currency support with exchange rate sync; sync schedule: real-time for payroll posting, daily for reconciliation; error handling: retry policy, duplicate detection, reconciliation report)
- [ ] Add Xero accounting integration config (OAuth 2.0 API template with organization ID; payroll journal posting: mapping salary components to Xero tracking categories; bank transaction sync for salary payments; employee-to-contact sync for reimbursements; leave sync: AuraOS leave → Xero payroll calendar; tax rate mapping per jurisdiction; multi-org support for group companies; Xero payroll API integration for AU/NZ/UK; file attachment sync for payslip PDFs; webhook subscription for real-time updates)
- [ ] Add SAP HCM / SAP SuccessFactors integration config (OData API configuration template; employee master data sync: SAP PA → AuraOS employee records with field mapping for infotypes 0000-0999; organizational management sync: SAP OM → AuraOS org structure; payroll results import: SAP payroll clusters → AuraOS payslip display; time management sync: AuraOS attendance → SAP time evaluation; position management sync; compensation data exchange; middleware: SAP CPI / BTP Integration Suite config; RFC/BAPI call templates for legacy SAP ECC; error handling with SAP IDoc monitoring)
- [ ] Add Greenhouse / Workable ATS integration config (Greenhouse: API key + webhook config; candidate-to-employee conversion: Greenhouse offer → AuraOS new hire with field mapping (name, email, department, start date, salary, position); job requisition sync: AuraOS approved req → Greenhouse job posting; interview schedule sync; offer letter data exchange; stage change webhooks for real-time pipeline updates; Workable: OAuth 2.0 config; similar candidate sync; custom field mapping per ATS; source tracking for recruitment analytics; EEOC/OFCCP data collection sync)
- [ ] Add UAE WPS (Wage Protection System) bank integration config (WPS SIF file format template per Central Bank specifications; bank agent codes for all authorized WPS banks: Emirates NBD, FAB, ADCB, RAK Bank, DIB, Mashreq, ADIB, CBD; payment file field mapping: employee ID → MOL number, bank code → routing, salary → net amount; file generation schedule: before 15th of month; validation rules: employee count match, total amount reconciliation; MOHRE submission tracking; WPS compliance report generation; multi-file support for split payroll)
- [ ] Add Saudi GOSI / India EPFO government portal integration config (GOSI: contribution file format, employer registration ID, employee GOSI number mapping, contribution calculation validation, monthly filing template, annual wage update; EPFO: ECR (Electronic Challan cum Return) file format, establishment code, UAN mapping, contribution calculation per PF/EPS/EDLI/admin, monthly ECR filing template; ESIC: contribution file format per state, IP number mapping; auto-generation of government-mandated file formats; submission tracking with acknowledgment numbers; filing deadline monitoring with alerts)
- [ ] Add ADP / Ceridian payroll provider integration config (ADP: API configuration for Workforce Now and RUN platforms; employee demographic sync; payroll data export: earnings, deductions, taxes per pay period; tax filing status sync; benefits enrollment sync; ADP reporting integration; Ceridian Dayforce: REST API config; bidirectional employee sync; payroll import/export with Dayforce calculation engine; time and attendance sync; field mapping templates per provider and country; API rate limits and retry policies per provider)
- [ ] Add banking and payment gateway integration configs (ACH/NACHA file format for US direct deposit; SWIFT MT103 for international wire transfers; SEPA credit transfer for EU payments; India NEFT/RTGS/IMPS configuration per bank with IFSC codes; GCC bank transfer formats per country; payment file encryption and secure transmission (SFTP/AS2); bank reconciliation file import; multi-bank support: generate separate files per bank; payment status tracking via bank API; check printing template for manual payments; positive pay file generation for fraud prevention)
- [ ] Add HRMS migration connector templates (pre-built field mapping templates for migration from: BambooHR, Workday, SAP SuccessFactors, Oracle HCM Cloud, Namely, Gusto, Zenefits, PeopleHR, greytHR, Keka, Darwinbox, ZenHR; data extraction API configs per source system; field-by-field mapping with transformation rules: date formats, name parsing, address normalization, currency conversion; data validation rules per entity: employee, department, position, leave balance, attendance history; migration staging area configuration; rollback and comparison reports; incremental migration support for phased go-live)
- [x] Add Google Workspace config template

---

### 3.2 Seed Enhancements (42 Tasks)

#### 3.2.1 Countries Enhancement

> **v1.0 Baseline** (10 tasks — completed): Basic country metadata for 50+ countries — fiscal year, tax ID format, address/phone/postal formats, work hours, OT threshold, minimum wage, mandatory benefits.
> **Enterprise Gap**: No data sovereignty classification (GDPR adequacy, UAE PDPL, KSA PDPL — determines where PII can be stored/processed, critical for multi-region SaaS). No social security totalization agreements (bilateral agreements affecting expat contributions — GCC/India/US workers cross-border). No employment law defaults per country (at-will vs fixed-term, notice periods, probation limits, termination/severance rules). No mandatory pension/retirement schemes. No tax treaty data. Workday maintains 200+ country profiles with 50+ attributes each. SAP SuccessFactors has per-country "legal entity" templates covering all statutory defaults.

- [x] Add fiscal year start date to all 14 countries
- [x] Add tax ID format (SSN, PAN, NIN, etc.) to all countries
- [x] Add address format configuration to all countries
- [x] Add phone number format to all countries
- [x] Add postal code format/regex to all countries
- [x] Add standard work hours per week to all countries
- [x] Add overtime threshold to all countries
- [x] Add minimum wage data to all countries
- [x] Add mandatory benefits list to all countries
- [x] Expand country list from 14 to 50+ countries (add EU, ASEAN, LATAM)
- [ ] Add data sovereignty and privacy classification per country (GDPR adequacy decision status: adequate, not adequate, pending; UAE PDPL scope and DPA registration requirements; KSA PDPL data localization mandate; India DPDP Act 2023 significant data fiduciary obligations; cross-border transfer mechanisms per country: SCCs, BCRs, adequacy; data residency requirements: which countries mandate PII stored locally; cloud region mapping: which cloud zones satisfy each country's requirements; data classification impact: employee PII, payroll data, health data per sensitivity tier; essential for multi-region deployment architecture decisions)
- [ ] Add social security totalization agreements mapping (bilateral agreements that prevent double social security taxation for expats; UAE-India: no formal agreement — both countries deduct; US-UK: totalization since 1985; US-India: no agreement — dual contribution; GCC-India: limited arrangements; EU mutual recognition; impact on payroll: determines whether to deduct home or host country social security; certificate of coverage (CoC) requirements per agreement; contribution refund eligibility for short-term assignments; critical for GCC expat workforce where 80%+ are foreign nationals)
- [ ] Add employment contract type requirements per country (US: at-will employment default, no mandatory contract; UAE: limited (fixed-term) only since 2022, 3-year max renewable; Saudi: definite or indefinite, Saudization constraints; India: appointment letter mandatory, varies by state Shops & Establishments Act; UK: written statement of terms within 2 months; EU: written contract per Transparent and Predictable Working Conditions Directive 2019/1152; contract templates required per country; probation period limits: UAE 6 months, Saudi 90 days extendable to 180, India per state, EU per member state; non-compete enforceability per jurisdiction)
- [ ] Add notice period and termination rules per country (US: at-will = no notice required unless contractual; UAE: 30-90 days per contract, unlimited contracts have specific rules; Saudi: 60 days for indefinite, or per contract; India: per state Shops & Establishments Act, typically 30 days; UK: statutory minimum 1 week per year of service up to 12 weeks; Germany: 4 weeks to 7 months based on tenure; France: 1-3 months based on seniority; garden leave provisions per country; termination for cause vs without cause differences; severance/EOSB calculation rules cross-referenced; wrongful termination protections per jurisdiction)
- [ ] Add mandatory pension and retirement scheme per country (US: no mandatory employer pension, 401(k) optional, Social Security mandatory; UAE: no pension for private sector, EOSB instead; Saudi: GOSI retirement scheme; India: EPF mandatory >20 employees, NPS optional; UK: auto-enrollment workplace pension minimum 8% (3% employer); Germany: state pension + occupational; Australia: Superannuation 11.5%; France: AGIRC-ARRCO complementary pension; contribution rates and ceilings per scheme; retirement age per country; early retirement provisions; portability rules for cross-border transfers)
- [ ] Add statutory paid leave minimums and public holiday rules per country (UAE: 30 days annual + 10 public holidays; Saudi: 21 days (0-5yr), 30 days (5+yr) + ~12 public holidays; India: 15-21 days earned leave per state + 15-17 gazetted holidays; US: no federal mandate, market practice 15-20 days PTO; UK: 28 days statutory including bank holidays; EU: minimum 20 working days per Working Time Directive; Australia: 20 days; maternity/paternity minimums per country; bereavement leave per jurisdiction; study/exam leave where mandated; Hajj leave for GCC Muslim employees; national service leave where applicable)
- [ ] Add tax treaty and double taxation avoidance data (DTAA agreements per country pair; tax residency rules: 183-day rule variations; PE (Permanent Establishment) risk thresholds; foreign tax credit eligibility; tax equalization policy support data: home vs host country tax comparison; shadow payroll requirements for international assignees; treaty withholding rates for dividends, interest, royalties; certificate of residency requirements; impact on payroll: which country has taxing rights; critical for companies with international assignees and remote workers across borders)
- [ ] Add labor court jurisdiction and dispute resolution data per country (US: EEOC filing, DOL complaints, state labor boards; UAE: MOHRE complaint then labor court; Saudi: labor court direct filing; India: labor court per state, Industrial Disputes Act; UK: Employment Tribunal, ACAS early conciliation mandatory; EU: per member state labor courts; statute of limitations for claims per country; mandatory arbitration vs court per jurisdiction; common dispute categories and resolution timelines; legal representation requirements; settlement frameworks and severance negotiation norms)
- [ ] Add immigration and work authorization framework per country (UAE: residence visa types, free zone vs mainland, dependent visa rules, Emirates ID; Saudi: IQAMA types, Saudization requirements per sector, exit/re-entry visa; India: employment visa for foreigners, FRRO registration; US: H-1B, L-1, O-1, TN, E-2 visa types with prevailing wage requirements; UK: Skilled Worker visa, sponsorship license; EU Blue Card; work permit processing time per country; document requirements per visa type; renewal timelines and expiry alerts; dependent work authorization rules; nationality-based restrictions per country)

#### 3.2.2 Leave Types Enhancement

> **v1.0 Baseline** (6 tasks — completed): Basic leave policy rules — carry forward, encashment, probation eligibility, document requirements, negative balance, sandwich rule.
> **Enterprise Gap**: Architecture shows 9 leave types (PL, SL, CL, ML, PTL, CO, LWP, BL, Hajj) but seed leave rules don't cover GCC-specific types (Hajj 30-day once, Umrah, national service), US-specific types (FMLA 12/26 weeks with eligibility criteria, USERRA military, jury duty, voting per state), India-specific types (26-week maternity, child care leave, earned leave accrual rules per state), or EU leave types (parental per member state, study leave). No accrual engine rule configuration. No half-day/quarter-day granularity. No leave interaction rules (e.g., FMLA runs concurrent). No gender-specific leave rules. Workday manages 50+ leave type configurations per country with complex accrual/eligibility/interaction rules.

- [x] Add carry forward rules (max days, expiry period)
- [x] Add encashment rules (eligible types, max days)
- [x] Add probation eligibility (which leave types available during probation)
- [x] Add document requirements (medical certificate for sick leave > X days)
- [x] Add negative balance policy (allow/deny, max negative days)
- [x] Add sandwich rule configuration (weekend between leave days)
- [ ] Add GCC-specific leave types seed data (Hajj leave: 30 days once for Muslim employees per UAE Article 87 / Saudi Article 53, unpaid for <2 years service; Umrah leave: 3-5 days per company policy; UAE compassionate leave: 3-5 days per Article 32; Saudi Iddah leave: 4 months 10 days for Muslim widows per Article 160; UAE study leave: 10 days/year for employees with 2+ years tenure per Article 73; national service leave: UAE national service with job protection; GCC-specific sick leave tiers: UAE 90 days per year (15 full + 30 half + 45 unpaid per Article 31); Saudi: 30 full + 60 at 75% + 30 unpaid; Bahrain/Kuwait/Oman/Qatar per labor law; each with eligibility, documentation, and approval requirements)
- [ ] Add US-specific leave types and compliance rules (FMLA: 12 weeks/year for eligible employees — 1,250hr worked, 50+ employees within 75 miles, serious health condition/birth/adoption/military family; FMLA military caregiver: 26 weeks; intermittent FMLA tracking in hourly increments; state FMLA extensions: CA CFRA, NJ FLA, NY PFL, WA PFML, OR OFLA, MA PFML; USERRA military leave: reinstatement rights, up to 5 years; jury duty: varies by state — CA unlimited, NY unlimited, some states 3-5 days paid; voting leave: per state law — 2-4 hours paid in most states; bereavement: no federal mandate, typically 3-5 days, OR/IL mandate; domestic violence leave: CA/IL/NJ/OR; bone marrow/organ donor leave: per state)
- [ ] Add India-specific leave types per state and act (earned leave: 15 days/year under Factories Act, 12 days under S&E in most states, 1 day per 20 days worked; sick leave: 7-12 days per state; casual leave: 7-12 days per state; maternity leave: 26 weeks for first two children, 12 weeks for third+ per Maternity Benefit Act 2017; paternity leave: 15 days for central government employees (no private sector mandate); child care leave: 730 days total for central govt female employees for up to 2 children; adoption leave: 12 weeks per Maternity Benefit Act; earned leave accumulation caps per state; leave prefix/suffix holiday rules per state; leave encashment at exit per state; LTC/LTA leave per company policy)
- [ ] Add EU-specific leave types per member state (parental leave: EU Directive minimum 4 months per parent, 2 months non-transferable — country-specific: Germany 36 months, France 3 years, Sweden 480 days shared; study leave/training leave: France DIF/CPF, Germany Bildungsurlaub 5 days/year; sabbatical: Belgium career break, France congé sabbatique after 36 months; force majeure: short-term emergency leave; caretaker leave: 5 days/year per EU Directive 2019/1158; time off for dependents: UK emergency; special occasion leave per country; public duty leave: UK magistrate/jury; notice period garden leave where applicable)
- [ ] Add accrual engine rule configuration seed data (accrual methods: monthly flat, biweekly, per-pay-period, annual front-load, hourly accumulation; pro-rata rules: mid-month join = proportional accrual, round up/down/nearest; tenure-based accrual tiers: 0-2yr = 15 days, 2-5yr = 20 days, 5-10yr = 25 days, 10+ = 30 days; accrual timing: beginning of month, end of month, on hire anniversary; accrual cap: stop accruing at max balance; waiting period: no accrual during first X months; accrual acceleration: bonus days for perfect attendance; negative accrual prevention: don't accrue if on extended leave; accrual recalculation triggers: promotion, transfer, tenure milestone)
- [ ] Add leave type interaction and concurrency rules (FMLA runs concurrent with employer sick/STD — not additive; workers' comp leave runs concurrent with FMLA where qualifying; STD/LTD integration: sick leave exhausted → STD kicks in → LTD after 90-180 days; maternity leave hierarchy: company maternity → state mandated → FMLA remainder; military leave: USERRA protections on top of employer leave; comp-off auto-conversion: OT worked → TOIL balance generated automatically; leave type substitution: allow using PL when sick leave exhausted; leave type blocking: cannot take casual leave adjacent to public holiday in some jurisdictions; sandwich rule interaction with different leave types)
- [ ] Add half-day, quarter-day, and hourly leave granularity configuration (half-day leave: first half (AM) / second half (PM) with cutoff time per shift; quarter-day leave: 2-hour blocks for flexible work; hourly leave tracking: required for FMLA intermittent tracking in US (15-minute increments); minimum leave unit per leave type: annual = half-day, sick = hourly (for FMLA), casual = full-day; comp-off usage: can be taken in half-day units; leave deduction calculation: half-day = 0.5 from balance, hourly = actual hours / standard hours; impact on payroll: partial day deduction for LWP; impact on attendance: half-day leave + half-day present = full attendance day; shift-based half-day calculation for non-standard shifts)
- [ ] Add gender-specific and life-event leave rules (maternity leave per country with pay percentage and eligibility: UAE 60 days full + 45 days half, Saudi 10 weeks, India 26 weeks full pay; paternity leave per country: UAE 5 days, Saudi 3 days, India 15 days central govt; adoption leave equalization per jurisdiction; surrogacy leave where recognized; miscarriage leave: India 6 weeks per Maternity Benefit Act, UAE per medical certificate; IVF treatment leave: per company policy template; gender-affirming care leave: emerging best practice; parental leave gender neutralization for EU compliance; childcare emergency leave: per jurisdiction; elder care leave: Japan 93 days, US under FMLA qualifying; configure per country with override per company policy)
- [ ] Add leave balance auto-conversion and year-end processing rules (year-end carry forward processing: cap at max carry forward, expire excess; carry forward expiry: use-it-or-lose-it by Q1/Q2 deadline per policy; auto-encashment trigger: convert excess above carry cap to cash at year-end; pro-rata calculation for mid-year joiners and leavers; leave balance impact on full & final settlement: encash all earned leave balance; leave forfeiture rules: resigned during notice = forfeit remaining leave in some jurisdictions vs mandatory encashment; negative balance recovery: deduct from final settlement; leave balance transfer between entities on inter-company transfer; leave year alignment: calendar year vs fiscal year vs hire anniversary per policy; balance snapshot for audit/reporting at year-end)
- [ ] Add leave request validation and conflict detection rules (blackout period configuration: no leave during month-end close, peak season, audit period; minimum team coverage: at least 50% team present, auto-reject if coverage drops below threshold; consecutive leave limit: max 10 consecutive days without VP approval; return-from-leave requirements: fitness certificate for medical leave >X days; advance notice requirements: annual leave 14 days advance, sick leave same-day with certificate within 3 days; leave overlap detection: flag if overlaps with mandatory training, performance review, or team event; manager approval auto-redirect: if manager on leave, route to skip-level; public holiday adjacent leave policy: weekend + leave + holiday creates extended absence alert; leave fraud detection: pattern analysis for Monday/Friday clustering)

#### 3.2.3 Seed Runner Update

> **v1.0 Baseline** (3 tasks — completed): Basic seed runner with correct order, idempotency, versioning.
> **Enterprise Gap**: No environment-specific seed profiles (DEV gets full demo data, STAGING gets sanitized production-like, PROD gets only reference data, TEST gets minimal for CI). No parallel execution for independent datasets. No rollback on failure. No dependency graph resolution (auto-order by FK relationships). No tenant-aware seeding for multi-tenant SaaS. No execution audit trail. No performance benchmarking. Section 28.1 in enterprise GAP covers schema-seed alignment and orchestration at production scale — 3.2.3 covers the foundational runner upgrades needed before Section 28 can be implemented.

- [x] Update seed runner to include all new seed files in correct order
- [x] Add idempotency checks (don't duplicate on re-run)
- [x] Add seed versioning for incremental updates
- [ ] Add environment-specific seed profiles (MINIMAL: reference data only — countries, currencies, industry codes, compliance rules; STANDARD: MINIMAL + leave types, break rules, OT rules, approval chains, notification templates; FULL: STANDARD + demo employees, org structure, performance data, recruitment pipeline; TEST: MINIMAL + factory-generated test data for CI; DEMO: FULL + polished sample data for sales demos; profile selection via `SEED_PROFILE` env var; each profile with documented data set size and expected execution time; prevent accidental FULL/DEMO seed in production)
- [ ] Add dependency graph resolution and parallel execution (analyze Prisma schema FK relationships to build directed acyclic graph of seed dependencies; topological sort for execution order: countries → states → cities → employees → leave balances; identify independent seed modules for parallel execution: countries and currencies can run simultaneously; parallel execution pool with configurable concurrency: default 4 workers; dependency validation: fail-fast if required parent seed not yet executed; circular dependency detection with clear error messages; execution plan visualization for debugging)
- [ ] Add transaction wrappers with rollback and retry (wrap each seed module in `prisma.$transaction()` for atomic commit/rollback; configurable transaction timeout per module: small seeds 30s, large seeds 5min; retry logic: transient DB errors retry 3× with exponential backoff; partial failure handling: rollback failed module, continue with independent modules, skip dependents; savepoint support for large seeds: rollback to last savepoint on failure; seed state tracking table: record which modules completed, which failed, which skipped; resume-from-failure: re-run only failed and skipped modules)
- [ ] Add tenant-aware multi-tenant seeding (separate reference data seeds (shared across tenants) from tenant-specific seeds (per-tenant); reference data: countries, currencies, industry codes — seeded once in shared schema; tenant data: org structure, leave policies, approval chains, notification templates — seeded per tenant; tenant seed template: configurable per tenant with country/industry-specific data selection; new tenant provisioning: auto-seed reference data + selected tenant template; tenant data isolation validation: verify no cross-tenant data leakage after seeding; tenant-specific demo data: "UAE Manufacturing" vs "India IT Services" vs "US Healthcare" presets)
- [ ] Add seed execution audit trail and monitoring (log every seed execution: timestamp, profile, modules executed, records created/updated/skipped, duration per module, total duration; store audit trail in database for compliance evidence; execution dashboard: last seed run, record counts per model, data freshness per module; diff report: compare current DB state vs expected seed state per profile; drift detection: flag models where actual count deviates from expected; seed execution alerts: notify on failure via email/Slack; execution history with rollback points for data recovery)
- [ ] Add seed data validation and integrity checks (pre-seed validation: verify Prisma schema matches expected models before seeding; post-seed validation: verify record counts, FK integrity, unique constraint satisfaction; data quality checks: validate email formats, ISO codes, date ranges, required fields non-null; cross-reference validation: every FK value has matching parent record; business rule validation: every country has currency, every leave type has at least one rule, every approval chain has at least 2 steps; validation report: pass/fail per check with specific violation details; fail-fast mode vs warning mode configurable)
- [ ] Add seed performance benchmarking and optimization (measure and record execution time per seed module per run; baseline benchmarks: MINIMAL <10s, STANDARD <30s, FULL <5min, DEMO <10min; performance regression detection: alert if module >2× slower than baseline; batch insert optimization: use `createMany` for bulk inserts instead of individual `create` calls; connection pool tuning for seed workload: increase pool size during seeding; index management: drop non-essential indexes before bulk seed, rebuild after; progress reporting: real-time progress bar with ETA per module; memory usage monitoring: alert if seed process exceeds 512MB)
- [ ] Add seed data export and snapshot management (export current seed state as JSON/SQL for backup before re-seeding; snapshot management: save named snapshots, restore to previous snapshot; seed data diffing: compare two snapshots to identify changes; baseline snapshot per version: "v1.0 baseline", "v2.0 enterprise baseline"; snapshot-based testing: seed from snapshot for deterministic test data; export for external tools: generate CSV/Excel for data review by business analysts; seed data documentation auto-generation: create data dictionary from actual seeded data with sample values and counts)

---

### 3.3 Seed Data Expansion (26 Tasks)

#### 3.3.1 Geographic Data

> **v1.0 Baseline** (6 tasks — completed): US 50 states + territories, India 28 states + 8 UTs, UK counties, Canada provinces, major cities for top 20, timezone per state.
> **Enterprise Gap**: No GCC geographic granularity — UAE emirates with free zone data (DIFC, DMCC, JAFZA, ADGM each have distinct labor laws, visa rules, and tax treatments), Saudi regions with economic cities, Bahrain/Qatar/Oman/Kuwait governorates. No ISO 3166-2 subdivision codes (international standard). No tax jurisdiction hierarchy (US: federal→state→county→city; India: state→district for professional tax). No geofence coordinates for office locations (required for attendance geofencing). No labor law jurisdiction mapping. No cost-of-living index. Architecture specifies ISO 3166 (249 + subdivisions), IANA timezones (400+), UN M49 regions.

- [x] Expand states/provinces data for US (all 50 + territories)
- [x] Add states/provinces for India (all 28 states + 8 UTs)
- [x] Add states/provinces for UK (counties)
- [x] Add states/provinces for Canada (provinces + territories)
- [x] Add major cities for top 20 countries
- [x] Add timezone data per state/province
- [ ] Add UAE emirates and free zone geographic hierarchy (7 emirates: Abu Dhabi, Dubai, Sharjah, Ajman, Umm Al Quwain, Ras Al Khaimah, Fujairah; each with mainland vs free zone distinction; free zone catalog per emirate: Dubai — DIFC (financial services, own courts/law), DMCC (commodities, 19K+ companies), JAFZA (logistics, 8K+ companies), DAFZA (airport, aviation), Dubai Internet City, Dubai Media City, Dubai Healthcare City, Dubai Silicon Oasis; Abu Dhabi — ADGM (financial, own legal system), Masdar City, KIZAD, twofour54; each free zone with: applicable labor law variant, visa authority, license types, minimum salary requirements, WPS bank codes; critical because GCC free zones have DIFFERENT labor laws than mainland)
- [ ] Add Saudi regions, economic cities, and Nitaqat zones (13 administrative regions: Riyadh, Makkah, Madinah, Eastern, Asir, Tabuk, Hail, Northern Borders, Jazan, Najran, Al-Baha, Al-Jouf, Qassim; economic cities: KAEC (King Abdullah Economic City), Neom, The Red Sea, Jazan Economic City; each with HRSD office jurisdiction; Nitaqat zone classification per region: Platinum/Green High/Green Mid/Green Low/Yellow/Red affects Saudization requirements; industrial zones and free zones with special labor provisions; Saudi Vision 2030 special economic zone regulations; regional minimum wage variations)
- [ ] Add GCC states/provinces for remaining countries (Bahrain: 4 governorates — Capital, Muharraq, Northern, Southern; Qatar: 8 municipalities — Doha, Al Rayyan, Al Wakrah, Al Khor, Umm Salal, Al Daayen, Al Shamal, Al Shahaniya; Oman: 11 governorates — Muscat, Dhofar, Musandam, Al Buraimi, Ad Dakhiliyah, Al Batinah North, Al Batinah South, Ash Sharqiyah North, Ash Sharqiyah South, Ad Dhahirah, Al Wusta; Kuwait: 6 governorates — Capital, Hawalli, Farwaniya, Mubarak Al-Kabeer, Ahmadi, Jahra; each with labor office jurisdiction, social insurance office, and municipality codes for business licensing)
- [ ] Add ISO 3166-2 subdivision codes for all seeded countries (standardize all state/province entries with ISO 3166-2 codes: US-CA, US-NY, IN-MH, IN-KA, AE-DU, AE-AZ, SA-01, GB-ENG; required for international reporting, tax jurisdiction identification, and cross-border payroll compliance; add subdivision type classification: state, province, emirate, region, governorate, territory, county; add parent-child hierarchy: country → region → state → district → city; enable address validation against ISO subdivision codes; support external system mapping: SWIFT uses ISO 3166-2 for beneficiary bank routing)
- [ ] Add tax jurisdiction hierarchy mapping per country (US: federal → state (50) → county (3,100+) → city/local (35,000+ taxing authorities) for income tax, payroll tax withholding; India: central → state → district for professional tax, LWF; Germany: federal → Bundesland → Gemeinde for church tax, solidarity surcharge; UAE: emirate-level for economic substance regulations; Saudi: region-level for GOSI office assignment; UK: HMRC region for PAYE; map each geographic unit to applicable tax authorities and filing jurisdictions; enable auto-determination of tax jurisdiction from employee address)
- [ ] Add geofence and office location coordinate data (GPS coordinates (latitude/longitude) for company office locations per tenant; geofence radius configuration per location: default 200m, configurable 50m-2km; multiple geofence zones per office: main building, parking lot, campus perimeter; office classification: HQ, branch, warehouse, remote hub, client site; office-to-shift mapping: which shifts operate from which location; multi-floor/zone support for large campuses; WiFi SSID and IP range as secondary verification for indoor geofencing; integration with attendance module for clock-in validation; location capacity for workspace booking; office closure calendar per location)
- [ ] Add cost-of-living and compensation geography index per city/region (cost-of-living index per metro area relative to national average: Dubai 115, Abu Dhabi 110, Riyadh 95, Mumbai 85, Bangalore 80, London 130, NYC 140, SF 150; housing cost multiplier per city; compensation geo-differential: percentage adjustment for location-based pay; tier classification: Tier 1 metro, Tier 2 city, Tier 3 rural per country; remote work location adjustment rules; relocation package calculation input; update frequency: annual from Mercer/ECA/Numbeo benchmarks; currency-adjusted comparisons; enable pay equity analysis controlling for geography)
- [ ] Add labor law jurisdiction mapping per geographic unit (map each state/province/emirate/free zone to applicable labor laws and regulatory bodies; US: FLSA federal + state laws (CA DFEH, NY DOL, TX TWC); India: applicable state S&E Act, Factories Act, labor court jurisdiction; UAE: mainland = MOHRE, DIFC = DIFC Employment Law 2, ADGM = ADGM Employment Regulations; Saudi: HRSD office per region; determine which overtime rules, break rules, leave minimums, termination rules apply based on employee's work location; auto-assign compliance rules to employee based on location; handle employees who work across multiple jurisdictions)
- [ ] Add address validation and formatting rules per country (address field structure per country: US = street, city, state, ZIP; UAE = building, street, area, emirate, PO Box; India = flat, street, locality, city, district, state, PIN; Saudi = building, street, district, city, postal code; UK = house number, street, city, county, postcode; Japan = postal code, prefecture, city, district, block, building; field validation regex per country: US ZIP = 5+4, UK postcode pattern, India PIN = 6 digits; mandatory vs optional fields per country; address line concatenation format for payslip/letters; PO Box handling for GCC; Makani number support for UAE)

#### 3.3.2 Currency Expansion

> **v1.0 Baseline** (4 tasks — completed): 50+ currencies, static exchange rates, formatting rules, country mapping.
> **Enterprise Gap**: Only 50 of 180 ISO 4217 currencies — need complete coverage. Only STATIC exchange rates — no live rate source configuration, no historical rates (required for payroll back-dating and expense report conversion at booking date rate), no rate update automation. No multi-currency payroll configuration (base vs payment vs reporting currency). No currency rounding rules per jurisdiction (GCC fils rounding). No stale rate detection. Architecture specifies ISO 4217 (180 + decimal rules), exchange rate sources (ECB, Fed), and rate update schedules.

- [x] Expand from 10 to 50+ currencies
- [x] Add exchange rate seed (static reference rates)
- [x] Add currency formatting rules (symbol position, decimals)
- [x] Add currency to country mapping
- [ ] Expand to complete ISO 4217 coverage (180 active currency codes + 4 precious metals XAU/XAG/XPT/XPD + supranational SDR/XDR; include: all GCC currencies with Central Bank references — AED/SAR/BHD/QAR/OMR/KWD; all EU currencies pre/post-Euro with conversion rates locked at adoption; all major Asian currencies: INR, CNY, JPY, KRW, SGD, MYD, THB, PHP, IDR, VND, BDT, PKR, LKR, NPR; African currencies for expanding markets; deprecated currencies with successor mapping: HRK→EUR, LTL→EUR; minor unit precision per ISO: BHD/KWD/OMR use 3 decimal places, JPY/KRW use 0; currency status: active, deprecated, restricted)
- [ ] Add live exchange rate source configuration (configure multiple rate providers: ECB (European Central Bank) daily reference rates — free, 30+ currencies; US Federal Reserve H.10 — 26 currencies; Open Exchange Rates API — 170+ currencies with API key; Fixer.io — 170+ currencies; XE.com — premium with intraday rates; Central Bank feeds per country: UAE Central Bank, RBI (India), BoE (UK), SNB (Switzerland); provider priority chain: primary → fallback → manual; API key and authentication config per provider; rate fetch schedule: daily at configurable time per provider; health monitoring: alert if provider fails >24hrs)
- [ ] Add historical exchange rate data and rate versioning (seed baseline historical rates for last 12 months for top 30 currency pairs; rate versioning table: effective_date, rate, source, previous_rate, change_percentage; support for payroll back-dating: apply rate effective at payroll period end date, not today's rate; expense report conversion: use rate on transaction date per GAAP/IFRS policy; support rate locking: lock rate for payroll cycle at a specific date; month-end closing rates for financial reporting; average rate calculation: monthly/quarterly weighted average for P&L; historical rate interpolation for dates between published rates; rate archival: retain 7 years minimum for audit compliance)
- [ ] Add multi-currency payroll and reporting configuration (three-currency model per employee: base currency (contract/salary currency, e.g., AED), payment currency (bank account currency, may differ for cross-border), reporting currency (company reporting currency, e.g., USD); conversion rules: base→payment at mid-market rate minus spread; base→reporting at month-end closing rate; intercompany billing currency for shared services; cost center reporting in local vs group currency; multi-currency payslip: show amounts in both base and payment currency; currency of hire vs current work location currency for international transfers; shadow payroll multi-currency handling)
- [ ] Add currency rounding rules per jurisdiction (GCC: UAE fils (0.01), Bahrain/Kuwait 3 decimal places (0.001), Saudi halalas (0.01), Oman baisa (0.001), Qatar dirhams (0.01); Japan/Korea: no decimal places, round to nearest integer; India: round to nearest rupee for payroll, 2 decimals for accounting; Swiss franc: rounding to 0.05 for cash transactions; EU: 2 decimals standard, some countries have specific payroll rounding rules; rounding method per context: ROUND_HALF_UP for payroll, ROUND_HALF_EVEN (banker's rounding) for accounting; cumulative rounding adjustment: ensure monthly salary components round correctly across pay periods; rounding audit trail for compliance)
- [ ] Add stale rate detection and alerting configuration (stale threshold per currency pair: major pairs (EUR/USD, GBP/USD) = 24hr, minor pairs = 48hr, exotic pairs = 72hr; alert channels: email finance team, Slack notification, in-app warning banner; auto-actions on stale rate: block payroll processing using stale rates, flag expense reports for manual review; weekend/holiday tolerance: don't alert for expected non-publishing days; rate anomaly detection: alert if rate moves >5% in 24hr (potential data error); dashboard: rate freshness heatmap showing all active currencies; escalation: if stale >1 week, block all FX-dependent operations until manual rate entry; compliance report: rate source and freshness audit trail for external auditors)
- [ ] Add currency restriction and capital control data per country (countries with exchange controls: India RBI FEMA regulations for outward remittance limits; China SAFE approval for capital account; Nigeria CBN restrictions; Argentina BCRA controls; Egypt CBE controls; GCC: generally free movement but reporting thresholds; impact on payroll: cross-border salary payment compliance; impact on expat remittance: monthly transfer limits per country; required documentation per country: purpose of payment, beneficiary declaration; sanctioned countries: OFAC/EU sanctions list affecting currency transfers; correspondent banking restrictions; enable compliance checks before international payment processing)
- [ ] Add currency display and UX localization rules (currency symbol placement: AED 5,000 vs 5,000 AED vs ₹5,000 per locale; thousand separator: comma (US/UK), period (Germany), space (France/India lakh system); negative format: -$500 vs ($500) vs $500- per locale; Indian numbering system: lakhs and crores (₹5,00,000 = 5 lakh) vs international (₹500,000); Arabic numeral display: option to show ٥٬٠٠٠ درهم for Arabic locale; compact display: $1.2M, ₹5Cr, AED 3.5K for dashboard charts; multi-currency display: side-by-side with conversion indicator; color coding: red for negative, green for positive per cultural norm; accessibility: screen reader currency name pronunciation per locale)

---

## SECTION 4: BACKEND-UI INTEGRATION (183 Tasks) — 77 COMPLETED + 106 ENTERPRISE UPGRADE

---

### 4.1 Frontend Service Layer (31 Tasks)

> **v1.0 Baseline** (21 tasks — completed): 21 service files created with basic CRUD methods.
> **Enterprise Gap**: No centralized API client abstraction (interceptors, auth token refresh, tenant header injection, correlation IDs). No standardized error handling (typed errors, error boundary integration, retry on 5xx). No offline mutation queue. No chunked file upload with resume. No bulk operation pattern. No request/response logging for audit. Architecture specifies: TanStack Query for all API data, automatic cache invalidation, optimistic updates, service-per-module pattern. Enterprise frontends require resilient service layers that handle auth failures, network errors, multi-tenant context, and offline scenarios gracefully.

#### 4.1.1 Missing Service Files

- [x] Create `/apps/web/src/services/documentService.ts` (uploadDocument, getDocuments, downloadDocument, deleteDocument)
- [x] Create `/apps/web/src/services/benefitsService.ts` (getPlans, enroll, getStatus, updateCoverage, comparePlans)
- [x] Create `/apps/web/src/services/analyticsService.ts` (getHeadcount, getTurnover, getCompAnalytics, runReport)
- [x] Create `/apps/web/src/services/compensationService.ts` (getTotalComp, getBenchmark, runReview)
- [x] Create `/apps/web/src/services/feedbackService.ts` (submit, getReceived, getGiven, submitRecognition)
- [x] Create `/apps/web/src/services/learningService.ts` (getPaths, enroll, trackProgress, getRecommendations)
- [x] Create `/apps/web/src/services/workflowService.ts` (getApprovals, approve, reject, getPending)
- [x] Create `/apps/web/src/services/oneOnOneService.ts` (schedule, getNotes, addNotes, getHistory)
- [x] Create `/apps/web/src/services/webhookService.ts` (create, list, test, getLogs)
- [x] Create `/apps/web/src/services/reportService.ts` (createReport, runReport, scheduleReport)
- [x] Create `/apps/web/src/services/taxDocumentService.ts` (list, download, getByYear)
- [x] Create `/apps/web/src/services/dependentService.ts` (list, add, update, remove)
- [x] Create `/apps/web/src/services/lifeEventService.ts` (report, getEvents)
- [x] Create `/apps/web/src/services/recognitionService.ts` (give, getFeed, getLeaderboard)
- [x] Create `/apps/web/src/services/geofenceService.ts` (validate, getLocations)
- [x] Create `/apps/web/src/services/projectTimeService.ts` (logTime, getTimesheet)
- [x] Create `/apps/web/src/services/scheduleService.ts` (getSchedule, createSchedule)
- [x] Create `/apps/web/src/services/integrationService.ts` (list, connect, sync)
- [x] Create `/apps/web/src/services/formBuilderService.ts` (create, get, submit)
- [x] Create `/apps/web/src/services/importService.ts` (upload, map, validate, execute)
- [x] Create `/apps/web/src/services/apiKeyService.ts` (generate, list, revoke)

#### 4.1.2 Enterprise Service Infrastructure

- [ ] Create centralized API client with interceptors (`/apps/web/src/lib/api/client.ts` — Axios instance with: request interceptor to auto-inject Authorization Bearer token, X-Tenant-ID header, X-Correlation-ID (UUID per request), Accept-Language from user preference, X-Timezone from user locale; response interceptor for: 401 → trigger silent token refresh then retry original request, 403 → redirect to access denied, 429 → respect Retry-After header with exponential backoff, 5xx → retry up to 3× with jitter; global error serialization into typed `ApiError {code, message, details, correlationId}`; request/response timing metrics for performance monitoring; configurable base URL per environment)
- [ ] Create service error handling and typed error framework (`/apps/web/src/lib/api/errors.ts` — typed error classes: `ValidationError` (422 with field-level errors), `AuthenticationError` (401), `AuthorizationError` (403), `NotFoundError` (404), `ConflictError` (409 for optimistic locking), `RateLimitError` (429), `ServerError` (5xx); error-to-toast mapping: auto-show user-friendly toast per error type; error boundary integration: catch unhandled API errors at route level; Sentry error reporting: auto-capture with request context, user ID, tenant ID; error recovery actions per type: retry button for server errors, login redirect for auth errors)
- [ ] Create offline mutation queue service (`/apps/web/src/lib/api/offlineQueue.ts` — detect network status via `navigator.onLine` + periodic ping; queue mutations when offline: store action type, payload, timestamp, retry count in IndexedDB; sync queue on reconnection: replay mutations in order with conflict detection; conflict resolution strategy: last-write-wins for simple updates, manual review for complex conflicts; queue status UI: "3 pending actions" indicator in header; max queue size: 100 actions, alert user when approaching limit; stale action cleanup: discard queued actions older than 24hr; critical action bypass: never queue payroll submission or approval actions — block with "You are offline" message instead)
- [ ] Create chunked file upload service with progress and resume (`/apps/web/src/lib/api/uploadService.ts` — chunk large files into 5MB parts for upload; parallel chunk upload: 3 concurrent chunks for optimal throughput; upload progress tracking: per-file percentage with speed and ETA; resume on failure: track uploaded chunks, resume from last successful; file validation before upload: type, size limit per document category (payslip PDF max 5MB, ID scan max 10MB, bulk import CSV max 100MB); virus scan integration: hold file in quarantine until ClamAV clear; upload cancellation: abort pending chunks, cleanup server-side partial; multi-file upload: batch upload with individual progress per file)
- [ ] Create bulk operation service pattern (`/apps/web/src/lib/api/bulkService.ts` — generic bulk operation framework: `bulkCreate<T>`, `bulkUpdate<T>`, `bulkDelete<T>` with configurable batch size; server-sent events (SSE) for long-running bulk ops: real-time progress updates with records processed/failed/remaining; partial failure handling: continue processing on individual record errors, collect error report; dry-run mode: validate all records without committing, return preview of changes; rate limiting: configurable records-per-second to avoid overwhelming backend; result download: generate CSV/Excel report of bulk operation results with success/failure per row; undo capability: store pre-change snapshots for bulk rollback within time window)
- [ ] Create request/response audit logging service (`/apps/web/src/lib/api/auditLogger.ts` — log all mutation API calls: endpoint, method, payload summary (no PII in logs), response status, duration, user ID, tenant ID, timestamp; sanitize sensitive fields before logging: mask password, SSN, bank account in request payload; log storage: send to backend audit endpoint in batches (every 30s or 50 entries); sensitive operation enhanced logging: payroll submission, employee termination, salary change, role change — include before/after values; compliance mode: log ALL API calls including reads for SOC 2/ISO 27001 evidence; session replay integration: correlate API calls with user actions for incident investigation; configurable log level per tenant/module)
- [ ] Create multi-tenant service context manager (`/apps/web/src/lib/api/tenantContext.ts` — tenant context provider: inject current tenant ID into all service calls; tenant switching: admin users can switch between tenants without re-login; cross-tenant data isolation: validate every response contains only current tenant data; tenant-specific API base URL: route to correct microservice instance per tenant for dedicated deployments; tenant configuration cache: store tenant-specific settings (feature flags, branding, locale) in memory with TTL; tenant health check: verify tenant is active/accessible before API calls; super-admin context: access all tenants with explicit tenant selection)
- [ ] Create API response caching strategy service (`/apps/web/src/lib/api/cacheStrategy.ts` — define cache policy per endpoint: reference data (countries, currencies) = 24hr, employee list = 5min, user profile = 10min, real-time data (attendance) = no cache; cache storage: TanStack Query cache for server state, localStorage for reference data; cache versioning: bust cache on app version update; conditional requests: ETag/If-None-Match support for 304 responses to reduce bandwidth; cache warming: prefetch commonly-accessed data on login (user profile, team list, pending approvals); shared cache for reference data across components; cache size monitoring: evict least-recently-used when cache exceeds 50MB)
- [ ] Create service health check and circuit breaker (`/apps/web/src/lib/api/healthCheck.ts` — periodic backend health ping: check API gateway health every 60s; service degradation detection: if latency P95 >3s, show "System running slowly" banner; circuit breaker per service: after 5 consecutive failures, stop calling that service for 30s, show cached/fallback data; backend maintenance detection: if API returns 503 with Retry-After, show maintenance banner with countdown; feature-level degradation: if payroll-service is down, show "Payroll temporarily unavailable" but rest of app works; health dashboard for admins: real-time status of all backend services; auto-recovery: re-enable circuit after cool-down period with gradual traffic increase)
- [ ] Create API versioning and backward compatibility service (`/apps/web/src/lib/api/versioning.ts` — API version negotiation: send Accept-Version header, handle version mismatch gracefully; deprecated endpoint detection: if API returns Sunset header, log warning and show admin notification; response schema migration: transform legacy response formats to current frontend expectations; feature detection: probe backend capabilities before using new endpoints (graceful degradation for older API versions); frontend-backend version compatibility matrix: warn if frontend is >2 versions ahead of backend; auto-update prompt: "A new version is available" when frontend detects it's outdated; API changelog integration: show "What's new" for API changes affecting user workflows)

---

### 4.2 React Query Hooks (34 Tasks)

> **CORRECTION 2026-06-03 (#95)**: The original "NOT INSTALLED" claim is **STALE**.
> Verified: `apps/web/package.json` ships `"@tanstack/react-query": "^5.8.4"` and `"@tanstack/react-query-devtools": "^5.91.3"`. `QueryClientProvider` wiring + per-module cache TTLs should be re-audited against today's tree before scoring this as a P0 blocker. Deeper-level enterprise findings below (optimistic updates, prefetch on hover, etc.) may still be valid.
>
> **v1.0 Baseline** (14 tasks — completed): 14 React Query hook files created for module data.
> **Enterprise Gap — Original P0 audit (likely stale)**: `@tanstack/react-query` was claimed NOT to be in `apps/web/package.json` — only installed in mobile app (`apps/mobile`). **No `QueryClientProvider`** wraps the app — `apps/web/src/app/layout.tsx` only contains `<Toaster>`. ALL 9 hook files importing `useQuery`/`useMutation` will **FAIL AT RUNTIME**. 11 of 20 hook files (`useAIInsights`, `useApprovals`, `useBenefits`, `useCompetencyLibrary`, `useDocuments`, `useFeedback`, `useGlobalSearch`, `useLearning`, `useOneOnOnes`, `useSocket`, `useSocketEvent`) don't import React Query at all — using custom state or mock data. `useInfiniteQuery` not used anywhere. Zero `prefetchQuery` calls. Zero optimistic updates (`onMutate` pattern). `ErrorBoundary` component exists but has NO `QueryErrorResetBoundary` integration. WebSocket hooks (`useSocket`, `useSocketEvent`) are completely separate from React Query cache. Query key factories exist per-file but NOT centralized. No `persistQueryClient` for offline. Architecture specifies: automatic cache invalidation, optimistic updates, background refetching, prefetching on hover, per-entity TTL tuning (attendance=60s, dashboard=120s, permissions=300s, employee=600s, orgChart=1800s, config=3600s). **Benchmark**: Workday uses aggressive prefetch + offline-first; SAP SuccessFactors uses Suspense streaming; Darwinbox uses WebSocket-driven cache invalidation.

- [x] Create `/apps/web/src/hooks/useDocuments.ts` (useDocumentsList, useDocumentUpload, useDocumentDelete)
- [x] Create `/apps/web/src/hooks/useBenefits.ts` (useAvailablePlans, useEnrollment, useEnrollMutation)
- [x] Create `/apps/web/src/hooks/useAnalytics.ts` (useHeadcount, useTurnover, useCustomReport)
- [x] Create `/apps/web/src/hooks/useCompensation.ts` (useTotalComp, useBenchmark, useCompReview)
- [x] Create `/apps/web/src/hooks/useFeedback.ts` (useFeedbackList, useFeedbackSubmit, useRecognitions)
- [x] Create `/apps/web/src/hooks/useLearning.ts` (usePaths, useEnrollment, useProgress)
- [x] Create `/apps/web/src/hooks/useWorkflow.ts` (useApprovals, useApproveMutation, usePendingActions)
- [x] Create `/apps/web/src/hooks/useOneOnOnes.ts` (useMeetings, useNotes, useActionItems)
- [x] Create `/apps/web/src/hooks/useWebhooks.ts` (useWebhookList, useWebhookCreate, useWebhookLogs)
- [x] Create `/apps/web/src/hooks/useReports.ts` (useReportList, useReportRun, useReportSchedule)
- [x] Create `/apps/web/src/hooks/useDependents.ts` (useDependentList, useAddDependent)
- [x] Create `/apps/web/src/hooks/useLifeEvents.ts` (useLifeEvents, useReportEvent)
- [x] Create `/apps/web/src/hooks/useRecognition.ts` (useFeed, useGiveRecognition, useLeaderboard)
- [x] Create `/apps/web/src/hooks/useSchedule.ts` (useSchedules, useCreateSchedule)
- [ ] Create query key factory and cache management pattern (`/apps/web/src/lib/queryKeys.ts` — standardized query key factory: `queryKeys.employees.list(filters)`, `queryKeys.employees.detail(id)`, `queryKeys.leaves.list(employeeId)`; consistent key hierarchy enables precise cache invalidation: invalidate all employee queries on employee update; cross-module cache invalidation: employee name change invalidates approvals, org chart, team views; cache time configuration per query type: reference data = Infinity, lists = 5min, details = 10min; stale time tuning per module: attendance = 30s, payroll = 5min, analytics = 15min; query key DevTools inspector for debugging)
- [ ] Create optimistic update patterns for all mutation hooks (approval actions: immediately update status in list before server confirms; leave request submission: add to calendar immediately, rollback on server error; recognition/feedback: show in feed immediately; profile updates: reflect changes instantly; pattern: `onMutate` → snapshot + optimistic data → `onError` → rollback to snapshot → `onSettled` → invalidate; configurable per mutation: enable/disable optimistic per action; conflict detection: if server returns different data than optimistic, show diff to user; rollback notification: "Action failed — changes have been reverted")
- [ ] Create prefetch on hover and navigation patterns (`/apps/web/src/hooks/usePrefetch.ts` — prefetch employee detail when hovering name link in list; prefetch next page when scroll reaches 80% of current page; prefetch route data on sidebar link hover with 200ms debounce; prefetch approval details when approval list loads; router-level prefetch: preload data for likely next navigation; configurable prefetch priority: high (user profile, approvals) vs low (analytics, reports); prefetch budget: max 5 concurrent prefetch requests; cancel prefetch if user navigates away before hover completes)
- [ ] Create infinite scroll and cursor-based pagination hooks (`/apps/web/src/hooks/useInfiniteList.ts` — generic infinite scroll hook wrapping TanStack Query `useInfiniteQuery`; cursor-based pagination: server returns `nextCursor` for efficient deep pagination; virtual scrolling integration with `react-window` for 10K+ row lists; load-more trigger: intersection observer at 3 items from bottom; page size configuration per list: employee directory = 50, audit log = 100, notifications = 20; scroll position restoration on back navigation; total count display without loading all records; empty state and end-of-list detection)
- [ ] Create real-time subscription hooks combining React Query + WebSocket (`/apps/web/src/hooks/useRealtimeQuery.ts` — subscribe to WebSocket events that invalidate specific React Query caches; example: `approval.completed` WebSocket event → invalidate `queryKeys.approvals.list()` → auto-refetch; `attendance.update` → invalidate team attendance query; `notification.new` → increment notification count in Zustand store AND invalidate notification list query; selective revalidation: only refetch queries visible on current page; batch invalidation: collect events for 500ms then invalidate once; unsubscribe on component unmount to prevent memory leaks)
- [ ] Create global query error boundary and retry configuration (`/apps/web/src/providers/QueryErrorBoundary.tsx` — React Error Boundary that catches unhandled React Query errors at route level; error UI per error type: network error = "Check your connection" with retry button, 403 = "You don't have access", 500 = "Something went wrong — we've been notified"; retry configuration: 3 retries for GET with exponential backoff (1s, 2s, 4s), 0 retries for mutations (user must explicitly retry); retry exclusions: never retry 401/403/404; global `onError` callback: send to Sentry with React Query context; per-query retry override: some queries need more/fewer retries)
- [ ] Create query DevTools and performance monitoring (`/apps/web/src/lib/queryMonitor.ts` — TanStack Query DevTools integration for development: show all active queries, cache state, refetch count; performance metrics: track query duration P50/P95/P99 per endpoint; slow query alerting: flag queries >2s to performance monitoring; cache hit rate tracking: measure effectiveness of caching strategy; refetch count monitoring: detect excessive refetching indicating misconfigured stale times; query waterfall visualization: show dependent query chains; bundle only in development: tree-shake DevTools from production build)
- [ ] Create data synchronization and conflict resolution hooks (`/apps/web/src/hooks/useOptimisticSync.ts` — handle stale data scenarios: user edits employee form while another user changes the same record; ETag-based conflict detection: send If-Match header, handle 409 Conflict; merge strategies per field type: last-write-wins for text fields, additive for tags/skills, manual review for salary/role changes; conflict resolution UI: show side-by-side diff with "Keep mine" / "Accept theirs" / "Merge" options; version vector for offline edits: detect conflicts when syncing offline queue; auto-retry with latest data for non-conflicting changes; audit trail of conflict resolutions for compliance)

#### 4.2.3 Critical Infrastructure Gaps (NEW — Codebase Audit Findings)

- [ ] **P0 BLOCKER**: Install `@tanstack/react-query` v5+ and configure QueryClientProvider (`apps/web/package.json` is MISSING `@tanstack/react-query` — only `apps/mobile` has it at `^5.8.4`; `apps/web/src/app/layout.tsx` has NO `QueryClientProvider` — only wraps `<Toaster>`; ALL 9 existing hook files importing `useQuery`/`useMutation` FAIL AT RUNTIME; create `/apps/web/src/providers/QueryProvider.tsx` with `new QueryClient({ defaultOptions: { queries: { staleTime: 5 * 60 * 1000, gcTime: 30 * 60 * 1000, retry: 3, refetchOnWindowFocus: true, structuralSharing: true }, mutations: { retry: 0 } } })`; wrap app in `<QueryClientProvider>`; add `<ReactQueryDevtools>` for development; install `@tanstack/react-query-devtools` as devDependency)
- [ ] **P0**: Migrate 11 non-React-Query hooks to proper useQuery/useMutation patterns (`useAIInsights.ts`, `useApprovals.ts`, `useBenefits.ts`, `useCompetencyLibrary.ts`, `useDocuments.ts`, `useFeedback.ts`, `useGlobalSearch.ts`, `useLearning.ts`, `useOneOnOnes.ts` — these 9 hooks use custom state/mock data instead of React Query; `useSocket.ts` and `useSocketEvent.ts` use raw WebSocket state — need React Query integration layer; audit each hook: replace `useState` + `useEffect` fetch patterns with `useQuery`; replace manual loading/error states with React Query's built-in states; ensure proper cache invalidation replaces manual refetch; maintain backward-compatible hook signatures during migration)
- [ ] **P0**: Create missing core HCM module React Query hooks — no hooks exist for the most critical modules: Employee CRUD (`useEmployees.ts` — list, detail, create, update, terminate, rehire — the #1 most-used entity), Leave Management (`useLeave.ts` — balance, request, approve, calendar, accrual), Attendance/Time (`useAttendance.ts` — clock in/out, timesheet, overtime, regularization), Payroll (`usePayroll.ts` — payslips, runs, components, statutory), Org Chart (`useOrgChart.ts` — hierarchy, reporting lines, department tree), Performance (`usePerformance.ts` — reviews, goals, KPIs, ratings, PIP), Recruitment (`useRecruitment.ts` — jobs, applicants, pipeline, offers), Onboarding (`useOnboarding.ts` — checklists, tasks, progress), Travel & Expense (`useTravel.ts` — requests, approvals, claims), Grievance (`useGrievance.ts` — cases, escalation, resolution); each hook must follow established pattern: query key factory + useQuery + useMutation + invalidation
- [ ] Create typed API response wrappers and pagination types (`/apps/web/src/types/api.ts` — `PaginatedResponse<T>` with `{ data: T[], meta: { page, limit, total, totalPages, hasNext, hasPrev } }`, `CursorPaginatedResponse<T>` with `{ data: T[], nextCursor, prevCursor, hasMore }`, `ApiSuccessResponse<T>` with `{ success: true, data: T, message? }`, `ApiErrorResponse` with `{ success: false, error: { code, message, details?, field? } }`, `MutationResponse<T>` with `{ data: T, message }`, `BulkOperationResponse` with `{ succeeded: number, failed: number, errors: [] }`; all hooks must return these typed wrappers; use Zod runtime validation on API responses in development mode to catch backend contract violations early)
- [ ] Configure per-module staleTime and gcTime aligned with architecture cache TTL strategy (architecture doc specifies: `attendanceToday: 60s`, `dashboardMetrics: 120s`, `permissions: 300s`, `leaveBalance: 300s`, `listItems: 900s`, `employeeProfile: 600s`, `orgChart: 1800s`, `translations: 3600s`, `tenantConfig: 3600s`; create `/apps/web/src/lib/queryConfig.ts` with per-query-key staleTime/gcTime overrides; current hooks use React Query defaults (0ms staleTime) causing excessive refetching; reference data like countries, currencies, skills taxonomy = `staleTime: Infinity, gcTime: 24h`; user session data like notifications, approvals = `staleTime: 30s`; real-time data like attendance, dashboard = `staleTime: 0, refetchInterval: 30s`)
- [ ] Create `persistQueryClient` for offline-first capability (`/apps/web/src/providers/QueryPersistProvider.tsx` — install `@tanstack/query-persist-client-core` + `@tanstack/query-sync-storage-persister`; persist reference data to localStorage: countries, currencies, skills, industry codes, leave types, job classifications; persist user profile and org chart to IndexedDB via `createAsyncStoragePersister` for large datasets; selective persistence: only persist GET queries matching specific key prefixes; max storage budget: 10MB localStorage + 50MB IndexedDB; cache version header: invalidate persisted cache on app version update; encryption for sensitive persisted data: employee PII, salary data; restore cached data on app load for instant-display-while-revalidate pattern)
- [ ] Create dependent query patterns for cascading data loads (`/apps/web/src/hooks/useDependentQuery.ts` — typed wrapper for `enabled: !!parentData` pattern; cascading chains: country → states/provinces → cities → tax jurisdictions; employee → leave balance + documents + dependents + performance + attendance; department → teams → employees → headcount; org hierarchy → approval chains → delegation rules; parallel dependent queries: load employee tabs concurrently once employee detail resolves; loading waterfall UI: show skeleton per tab that resolves independently; error isolation: one failed dependent query doesn't block siblings; prefetch siblings: when employee detail loads, prefetch all tab data in parallel)
- [ ] Create centralized mutation success/error/settlement handlers (`/apps/web/src/lib/mutationDefaults.ts` — global `MutationCache` `onError`: toast notification with error message + Sentry capture with React Query context (query key, variables, endpoint); global `onSuccess`: optional audit event dispatch for compliance-sensitive mutations (salary changes, role changes, terminations); global `onSettled`: clear loading states, track mutation duration for performance monitoring; per-module overrides: approval mutations trigger WebSocket broadcast to affected users; payroll mutations require double-confirmation modal; delete mutations require typed confirmation ("type DELETE to confirm"); bulk mutation progress: show "Processing 45/100..." with cancel capability)
- [ ] Integrate React Suspense boundaries with React Query (`/apps/web/src/hooks/useSuspenseQueries.ts` — create `useSuspenseQuery` wrappers for critical-path data: employee profile, org chart, user permissions; route-level `<Suspense>` boundaries in Next.js App Router with streaming SSR; nested Suspense: page shell loads instantly → sidebar data streams → main content streams → widgets stream; fallback UI per Suspense boundary: skeleton loaders matching final layout; error boundaries per Suspense boundary: `<ErrorBoundary>` wrapping `<Suspense>` for granular error recovery; `startTransition` for non-urgent data updates to prevent UI jank; preload critical data in route `generateMetadata` or `loading.tsx` for SSR)
- [ ] Create request deduplication and batching configuration (`/apps/web/src/lib/queryBatching.ts` — structural sharing enabled by default: prevent re-renders when data shape matches; request deduplication: concurrent identical queries share single network request via React Query's built-in dedup; create batch hooks for bulk operations: `useBatchEmployeeProfiles(ids: string[])` collects individual profile requests within 50ms window and sends single batch API call; `useBatchLeaveBalances(employeeIds: string[])` for team views; DataLoader pattern: aggregate detail requests from list components; configurable batch size: max 100 items per batch request; batch timeout: 50ms collection window before dispatching; fallback to individual requests if batch endpoint unavailable)
- [ ] Create cross-module cache invalidation dependency map (`/apps/web/src/lib/queryInvalidationMap.ts` — architecture requires cascading invalidation: employee name change → invalidate approvals list, org chart, team views, reports, directory; leave approval → invalidate leave balance, team calendar, manager dashboard, attendance summary; payroll run completion → invalidate compensation view, benefits enrollment, tax documents; role/department change → invalidate org chart, approval chains, reporting hierarchy, access permissions; define invalidation graph as typed config: `{ trigger: 'employee.update', invalidates: ['approvals.list', 'orgChart', 'team.*', 'reports.*'] }`; batch invalidation: collect triggers for 500ms then invalidate once; selective invalidation: only invalidate queries currently mounted/visible; audit log: track invalidation cascades for debugging)
- [ ] Create query retry and fallback strategies per HTTP error type (`/apps/web/src/lib/queryRetryConfig.ts` — never retry 401 Unauthorized: redirect to login via auth interceptor; never retry 403 Forbidden: show "Insufficient Permissions" with role requirement hint; never retry 404 Not Found: show entity-specific "not found" message; never retry 422 Validation Error: show field-level validation errors; retry 408/429: respect `Retry-After` header with jitter; retry 500/502/503: exponential backoff 1s→2s→4s with 3 max retries; retry network errors: 5 retries with 2s→4s→8s→16s→30s backoff; circuit breaker: after 5 consecutive failures on same endpoint within 60s, stop retrying for 30s and show "Service temporarily unavailable" with manual retry; fallback to cached data: on network error, return stale cached data with "Showing cached data — last updated X minutes ago" banner; per-query retry override: critical queries like auth/permissions get more retries than analytics)

---

### 4.3 State Management (Zustand Stores) (25 Tasks)

> **CORRECTION 2026-06-03 (#95)**: The original "NOT INSTALLED" claim is **STALE**.
> Verified: `apps/web/package.json` ships `"zustand": "^4.4.7"`. Re-audit needed for the deeper findings (which 4 stores still use React Context vs Zustand, broken `ThemeToggle` import, missing `persist` versioning, etc.) before scoring as P0.
>
> **v1.0 Baseline** (7 tasks — completed): 7 store files created for notifications, approvals, preferences, offline, search, dashboard, theme.
> **Enterprise Gap — Original audit (likely stale)**: `zustand` was claimed NOT to be in `apps/web/package.json` — undeclared dependency, only listed in mobile app (`^4.4.7`). **Only 4 of 8 store files actually use Zustand** (`approval-store.ts`, `notification-store.ts`, `offline-store.ts`, `user-preferences-store.ts`). **4 stores use React Context + useState instead** (`activity-store.tsx`, `dashboard-store.ts`, `search-store.ts`, `theme-store.ts`) — architectural inconsistency, architecture doc specifies Zustand as the client state tool. **Broken import**: `ThemeToggle.tsx` imports `useThemeStore` and `ThemeMode` from `@/stores/theme-store` but these exports DON'T EXIST in web — they only exist in the mobile app's `theme.store.ts`. Only 2 stores use `persist` middleware (`offline-store`, `user-preferences-store`) — neither has `version` or `migrate` options. Zero `devtools` middleware. Zero `immer` middleware. Zero `subscribeWithSelector`. Zero selector usage — all stores return FULL state object on every call (causes unnecessary re-renders). `stores/index.ts` barrel only exports `activity-store` — all other stores lack barrel exports. localStorage key naming inconsistent: Zustand persist uses `aura-` (hyphens), manual stores use `aura_` (underscores). No auth/session store for web (mobile has `auth.store.ts`). No permission/RBAC store. No cross-tab sync. No tenant context. **Benchmark**: Workday uses centralized Zustand with persist + devtools + selectors; SAP SuccessFactors uses fine-grained subscriptions; Darwinbox uses tenant-scoped state isolation.

- [x] Create `/apps/web/src/stores/notification-store.ts` (notifications[], unreadCount, markAsRead, clearAll)
- [x] Create `/apps/web/src/stores/approval-store.ts` (pendingApprovals[], count, refresh)
- [x] Create `/apps/web/src/stores/user-preferences-store.ts` (theme, language, dashboardLayout)
- [x] Create `/apps/web/src/stores/offline-store.ts` (isOnline, pendingActions[], sync)
- [x] Create `/apps/web/src/stores/search-store.ts` (recentSearches, results, filters)
- [x] Create `/apps/web/src/stores/dashboard-store.ts` (widgets[], layout, addWidget, removeWidget)
- [x] Create `/apps/web/src/stores/theme-store.ts` (mode: light/dark/system, setMode)
- [ ] Create localStorage persistence middleware with encryption (`/apps/web/src/lib/stores/persistMiddleware.ts` — Zustand `persist` middleware for selected stores: user-preferences, theme, dashboard-layout, recent-searches; encrypted storage for sensitive state: AES-256-GCM encryption of persisted data using session-derived key; storage quota management: monitor localStorage usage, evict oldest entries when approaching 5MB limit; serialization versioning: version number in stored state, migration function when schema changes; selective persistence: only persist specific slices of store, not entire state; cross-domain isolation: prefix storage keys with tenant ID for multi-tenant; clear on logout: wipe all persisted state on user signout)
- [ ] Create cross-tab state synchronization (`/apps/web/src/lib/stores/crossTabSync.ts` — BroadcastChannel API for cross-tab Zustand sync: theme change in Tab A instantly reflects in Tab B; sync targets: theme, language, notification read status, approval count; conflict handling: most recent change wins based on timestamp; leader election: one tab manages WebSocket connection, broadcasts to others; tab awareness: track open tabs for "active session" indicator; session termination broadcast: if one tab receives 401, all tabs redirect to login; new tab initialization: inherit state from existing tab instead of fresh fetch)
- [ ] Create tenant context store for multi-tenant operations (`/apps/web/src/stores/tenant-store.ts` — current tenant: ID, name, config, branding, feature flags, subscription tier; tenant switching for admin users: dropdown in header, API context switch, full state reset and refetch; tenant list: user's accessible tenants with roles per tenant; tenant-specific configuration cache: locale, date format, currency, leave policies, approval rules; tenant branding state: logo, colors, custom CSS applied dynamically; tenant health: active/suspended/maintenance status; impersonation context: super-admin browsing as specific tenant with visual indicator)
- [ ] Create state schema migration framework (`/apps/web/src/lib/stores/migration.ts` — version each persisted store schema: `{version: 3, state: {...}}`; migration functions: `v1→v2: rename oldField → newField`, `v2→v3: add defaultValue for newField`; sequential migration: if stored v1 and current is v3, run v1→v2 then v2→v3; failed migration handling: wipe corrupted state and re-initialize from server; migration testing: unit test each migration path; deprecation warnings: log when old schema versions are encountered; backup before migration: store pre-migration state for rollback capability)
- [ ] Create breadcrumb and wizard navigation store (`/apps/web/src/stores/navigation-store.ts` — multi-step wizard state: current step, completed steps, step data, validation status per step; navigation breadcrumb: track page hierarchy for breadcrumb UI; back navigation with state restoration: return to form with previously entered data intact; unsaved changes warning: track dirty state across all active forms, prompt on navigation; deep link support: serialize wizard state into URL for bookmarking mid-wizard; wizard timeout: warn after 30min inactivity on long forms like benefits enrollment; step-level analytics: track time spent per step, abandonment point for UX optimization)
- [ ] Create Zustand DevTools and state monitoring (`/apps/web/src/lib/stores/devtools.ts` — Redux DevTools integration for all Zustand stores via `devtools` middleware; action labeling: human-readable labels for all state mutations; time-travel debugging: step through state changes in DevTools; state snapshot export/import for bug reproduction; production state monitoring: sanitized state metrics sent to monitoring (store sizes, update frequency, no PII); performance tracking: alert if any store update takes >16ms (causes frame drop); tree-shake all DevTools code from production bundle)

#### 4.3.2 Critical Infrastructure Gaps (NEW — Codebase Audit Findings)

- [ ] **P0 BLOCKER**: Add `zustand` to `apps/web/package.json` dependencies — currently NOT declared in web app package.json (only `apps/mobile/package.json` has `"zustand": "^4.4.7"`); the 4 Zustand store files (`approval-store.ts`, `notification-store.ts`, `offline-store.ts`, `user-preferences-store.ts`) resolve zustand through workspace hoisting which is fragile and breaks on clean installs; install `zustand@^5.0.0` (latest v5 with improved TypeScript, `useShallow`, smaller bundle) as explicit dependency; also install `@redux-devtools/extension` as devDependency for DevTools integration
- [ ] **P0**: Migrate 4 React Context stores to Zustand for architectural consistency — `activity-store.tsx` (uses `ActivityProvider` + `useActivity` via React Context + useState), `dashboard-store.ts` (uses `DashboardProvider` + `useDashboard`), `search-store.ts` (uses `SearchProvider` + `useSearch`), `theme-store.ts` (uses `ThemeProvider` + `useTheme`) — all 4 use React Context + useState pattern instead of Zustand, contradicting architecture doc which specifies "client_state: tool: Zustand" for all client state; migrate each to `create()` with `persist` middleware replacing manual localStorage read/write in useEffect; maintain backward-compatible hook names; remove Provider wrappers from `app-layout.tsx` since Zustand stores don't need providers; update consumers to import from new Zustand stores
- [ ] **P0**: Fix broken `ThemeToggle.tsx` import — `apps/web/src/components/theme/ThemeToggle.tsx` imports `useThemeStore` and `ThemeMode` from `@/stores/theme-store`, but web `theme-store.ts` only exports `ThemeProvider` and `useTheme` (React Context pattern); these named exports (`useThemeStore`, `ThemeMode`) only exist in the mobile app's `theme.store.ts`; this is a copy-paste error causing either build failure or runtime crash; fix: after migrating theme-store to Zustand (task above), export `useThemeStore` as alias for the Zustand hook and `ThemeMode` type; audit ALL cross-import issues between web and mobile stores
- [ ] Create auth/session store for web app (`/apps/web/src/stores/auth-store.ts` — mobile app has `auth.store.ts` with full auth state but web app has NONE; implement: `user` (profile, role, permissions), `token`/`refreshToken` (stored in httpOnly cookie or memory, NOT localStorage for security), `isAuthenticated`, `isLoading`, `tenantId`, `impersonatedBy`; actions: `login(credentials)`, `logout()`, `refreshSession()`, `switchTenant(tenantId)`, `startImpersonation(userId)`, `stopImpersonation()`; auto-refresh token 5 minutes before expiry; clear all stores on logout; emit WebSocket disconnect on logout; redirect to login on 401; persist minimal session state: `lastTenantId`, `loginMethod` — but NEVER persist tokens in localStorage)
- [ ] Create permission/RBAC store (`/apps/web/src/stores/permission-store.ts` — loaded once on auth, refreshed on role change; state: `permissions: Set<string>`, `roles: string[]`, `featureFlags: Record<string, boolean>`, `restrictions: { ipAllowlist?, timeWindow?, geoFence? }`; computed helpers: `hasPermission(permission: string): boolean`, `hasAnyPermission(permissions: string[]): boolean`, `hasAllPermissions(permissions: string[]): boolean`, `hasRole(role: string): boolean`, `isFeatureEnabled(flag: string): boolean`; actions: `loadPermissions()` — fetch from `/api/v1/auth/permissions`, `clearPermissions()`; React hook: `usePermission('employees.salary.view')` returns `{ allowed: boolean, loading: boolean }`; integrate with React Query: permissions fetched via useQuery with 5min staleTime, invalidated on role change event via WebSocket)
- [ ] Add selector patterns to all Zustand stores — currently ALL 4 Zustand stores are consumed as `const { field1, field2, action } = useStore()` which returns the FULL state object on every render, causing unnecessary re-renders when unrelated fields change; migrate to selector pattern: `const count = useNotificationStore(state => state.unreadCount)`, `const theme = useThemeStore(state => state.mode)`; for multi-field selections use `useShallow` from Zustand v5: `const { count, isOpen } = useNotificationStore(useShallow(state => ({ count: state.unreadCount, isOpen: state.isOpen })))`; create eslint rule to warn on selector-less store usage; document selector patterns in `/apps/web/src/stores/README.md`; benchmark: re-render count before vs after selector migration
- [ ] Create comprehensive barrel exports in `stores/index.ts` — currently `stores/index.ts` ONLY re-exports `ActivityProvider`, `useActivity`, `ActivityItem`, `FavoriteItem` from `activity-store`; all other stores (`approval-store`, `notification-store`, `offline-store`, `user-preferences-store`, `dashboard-store`, `search-store`, `theme-store`) lack barrel exports; consumers import by full path; create proper barrel: re-export all store hooks, types, and actions; organize exports by category: auth stores, UI stores, data stores; add JSDoc per export for IDE autocompletion; tree-shaking safe: use named exports only, no default exports
- [ ] Standardize localStorage key naming convention — current inconsistency: Zustand `persist` stores use `aura-offline-store` / `aura-user-preferences` (hyphenated), manual stores use `aura_recent_activity` / `aura_favorites` / `aura_dashboard_preferences` / `aura_recent_searches` / `aura_theme` (underscored); standardize ALL keys to format: `aura:{tenant}:{store}` (e.g., `aura:t1:theme`, `aura:t1:preferences`, `aura:t1:offline-queue`); tenant prefix enables multi-tenant state isolation in same browser; add `STORAGE_KEYS` constant object in `/apps/web/src/lib/stores/storageKeys.ts` — single source of truth for all localStorage keys; migration script: read old keys → write to new keys → delete old keys on first app load
- [ ] Add `version` and `migrate` options to all persisted Zustand stores — `offline-store.ts` uses `persist` with only `{ name: 'aura-offline-store' }` — NO version, NO migrate function; `user-preferences-store.ts` same: `persist` with only `{ name: 'aura-user-preferences' }` — NO version, NO migrate; if state shape changes in a release (add/rename/remove fields), users with old persisted state will get corrupted state or crashes; add `version: 1` and `migrate(persistedState, version)` function to every `persist()` call; create shared `createMigration` utility: `createMigration({ 1: (state) => ({ ...state, newField: defaultValue }), 2: (state) => { const { removedField, ...rest } = state; return rest; } })`; log migration events to analytics; test every migration path with unit tests
- [ ] Create store hydration guard for SSR/SSG compatibility (`/apps/web/src/lib/stores/useHydration.ts` — Next.js App Router renders on server first where localStorage doesn't exist; only `activity-store.tsx` has an `isHydrated` guard — the 2 Zustand `persist` stores and 3 manual localStorage stores have NO hydration protection; this causes hydration mismatch: server renders with default state, client renders with persisted state → React hydration error flicker; create `useHydration()` hook that returns `false` on server/first render and `true` after mount; Zustand v5 `persist` has built-in `onRehydrateStorage` callback — use it for all persisted stores; create `<HydrationGuard>` wrapper component: renders children only after all stores are hydrated; prevent flash of default theme: apply theme class in `<head>` script before React hydrates)
- [ ] Create form dirty state tracking store (`/apps/web/src/stores/form-store.ts` — track unsaved changes across ALL active forms in the app; state: `dirtyForms: Map<formId, { isDirty: boolean, fields: string[], lastModified: Date }>`; actions: `registerForm(formId)`, `markDirty(formId, fieldName)`, `markClean(formId)`, `unregisterForm(formId)`, `hasAnyDirtyForms(): boolean`, `getDirtyFormIds(): string[]`; integrate with `beforeunload` event: warn "You have unsaved changes" if any form is dirty; integrate with Next.js router: intercept navigation if dirty forms exist; auto-save integration: trigger auto-save draft after 30s of idle dirty state; persist draft data to localStorage per form; clear drafts on successful submit; show "Restored from draft" banner when loading form with persisted draft)
- [ ] Create computed/derived state patterns with `subscribeWithSelector` (`/apps/web/src/lib/stores/computedStore.ts` — Zustand stores currently have no derived/computed values; create patterns for: `notification-store`: computed `hasUrgentNotifications` derived from notifications array filter; `approval-store`: computed `overdueApprovals` derived from pendingApprovals where requestedAt > SLA threshold; `offline-store`: computed `pendingCount`, `oldestPendingAge`, `hasCriticalPending` (payroll/termination mutations); `permission-store`: computed `isAdmin`, `isManager`, `canApproveLeave`, `canViewSalary` derived from permissions set; use `subscribeWithSelector` middleware for efficient derived state subscriptions; create `createComputedStore` factory that auto-derives computed fields from state; pattern: components subscribe to computed values only — never raw arrays — preventing re-render on unrelated array mutations)

---

### 4.4 Real-Time WebSocket Layer (34 Tasks)

> **CORRECTION 2026-06-03 (#95)**: The "NOT INSTALLED" claim is **STALE**.
> Verified: `apps/web/package.json` ships `"socket.io": "^4.7.4"` and `"socket.io-client": "^4.8.3"`. The deeper findings (server never initialized, SocketProvider not mounted, JWT auth missing, event name mismatch, no namespaces, no Redis adapter for horizontal scale) need fresh re-audit but cannot be assumed valid as-written.
>
> **v1.0 Baseline** (14 tasks — completed): 4 WebSocket library files + SocketProvider + 2 hooks + 7 event type stubs created. Files exist but are non-functional.
> **Enterprise Gap — Original audit (likely stale)**: claimed `socket.io` and `socket.io-client` were NOT INSTALLED — neither package appears in ANY `package.json` across the monorepo (root, web, mobile, services) despite line 1555 marking it as `[x]` done. **Two incompatible protocol implementations**: `server.ts` imports from `socket.io` (Socket.IO framing protocol) while `socket-client.ts` uses browser-native `WebSocket` API — these CANNOT communicate because Socket.IO uses a custom protocol layer atop WebSocket. **`wsServer.initialize(httpServer)` is NEVER CALLED** — the Socket.IO server singleton exists but `this.io` is always `null`, all emit methods exit early. **`SocketProvider` is NOT MOUNTED** in any application layout (`layout.tsx` only wraps `<Toaster>`) — ALL hooks (`useSocket`, `useSocketEvent`) are permanently non-functional (isConnected always false). **NO JWT authentication** — `server.ts` accepts `socket.handshake.auth.userId` from client without ANY token verification, allowing complete identity spoofing. **Event type mismatch**: `socket-events.ts` defines `notification.new`, `approval.pending` etc. but `server.ts` uses different hardcoded string `'notification'` — event constants are NOT imported by actual server or client. **Presence never broadcasts** — `isUserOnline()` tracks connections but connect/disconnect never emit presence events to other users. Reconnection is linear (3s, 6s, 9s) not exponential. No client-side heartbeat. No event ACK. No rate limiting. No Zod runtime validation. No namespaces. No binary support. **Benchmark**: Workday uses Socket.IO with Redis adapter + JWT auth + guaranteed delivery; SAP SuccessFactors uses SSE fallback; Darwinbox uses WebSocket with tenant namespace isolation.

#### 4.4.1 WebSocket Infrastructure

- [x] Install `socket.io` and `socket.io-client` packages
- [x] Create `/apps/web/src/lib/websocket/socket-server.ts` - server setup
- [x] Create `/apps/web/src/lib/websocket/socket-client.ts` - client connection
- [x] Create `/apps/web/src/lib/websocket/socket-events.ts` - event type definitions
- [x] Create `/apps/web/src/providers/SocketProvider.tsx` - React context
- [x] Create `/apps/web/src/hooks/useSocket.ts` - subscription hook
- [x] Create `/apps/web/src/hooks/useSocketEvent.ts` - listen to specific event

#### 4.4.2 WebSocket Events

- [x] Implement `notification.new` event (new notification arrives)
- [x] Implement `approval.pending` event (new approval needed)
- [x] Implement `approval.completed` event (approval decision made)
- [x] Implement `attendance.update` event (team member clocked in/out)
- [x] Implement `leave.status_change` event (leave approved/rejected)
- [x] Implement `chat.message` event (new message received)
- [x] Implement `presence.update` event (user online/offline)

#### 4.4.3 Enterprise WebSocket Infrastructure

- [ ] Implement reconnection strategy with exponential backoff (initial delay 1s, max delay 30s, jitter to prevent thundering herd; max reconnection attempts: 20 then show "Connection lost" banner; connection state machine: connecting → connected → disconnecting → disconnected → reconnecting; visual indicator: green dot = connected, yellow = reconnecting, red = disconnected; auto-reconnect on: network change event, tab becoming visible, wake from sleep; re-subscribe to all rooms/channels on reconnect; replay missed events: request events since last received event ID on reconnect)
- [ ] Implement connection health monitoring and heartbeat (client-side ping every 30s; server-side pong timeout: 10s before marking connection dead; connection quality metrics: latency, dropped messages, reconnection frequency; adaptive ping interval: increase to 60s when app is in background tab; health dashboard for admins: concurrent connections per tenant, average latency; connection upgrade: fall back from WebSocket to long-polling if WS blocked by corporate proxy; bandwidth estimation: track bytes sent/received per session for capacity planning)
- [ ] Implement room and channel management for multi-tenant isolation (automatic room assignment on connect: `tenant:{tenantId}`, `user:{userId}`, `department:{deptId}`, `team:{managerId}`; manager room: receive events for all direct reports; HR room: receive events for all employees in jurisdiction; admin room: system-level events; dynamic room join/leave: join project room when assigned, leave when removed; room-level permissions: only managers receive `salary.change` events; cross-room event routing: company announcement → all rooms in tenant; room member count tracking for presence features)
- [ ] Implement offline event buffer and guaranteed delivery (server-side: buffer events per user when disconnected, max 1000 events per user, 24hr retention; client-side: request buffered events on reconnect via `socket.emit('sync', {lastEventId})`; event ordering: monotonically increasing event IDs per tenant; duplicate detection: client tracks last 100 event IDs, skip duplicates; critical event guarantee: approvals, payroll, compliance events stored in persistent queue (Redis/DB), not just memory; delivery acknowledgment: client ACKs event receipt, server retries unACKed critical events; event compaction: if 10 `attendance.update` events buffered for same employee, deliver only latest)
- [ ] Implement WebSocket authentication and token lifecycle (authenticate on connect: send JWT in handshake auth; token refresh: when JWT expires during active connection, silently refresh via HTTP and re-authenticate socket; force disconnect on: logout, password change, role change, account deactivation; connection limit per user: max 5 concurrent connections (browser tabs), reject additional with error message; IP-based rate limiting: max 10 connections per IP per minute to prevent abuse; tenant suspension: force-disconnect all connections for suspended tenant; audit trail: log connection events — connect, disconnect, room join/leave with IP and device info)
- [ ] Implement WebSocket horizontal scaling with Redis adapter (Socket.IO Redis adapter: enable multi-server WebSocket with shared state via Redis pub/sub; sticky sessions: configure load balancer for WebSocket affinity or use Redis adapter for stateless; room state in Redis: room membership survives server restart; cross-server event delivery: event published on Server A delivered to clients on Server B via Redis; connection distribution monitoring: balanced connections across servers; graceful server drain: migrate connections before server shutdown during deployment; capacity testing: verify 10K concurrent connections per server, 50K per cluster)
- [ ] Implement event schema versioning and type safety (TypeScript interfaces for all WebSocket events: `ApprovalPendingEvent`, `AttendanceUpdateEvent` etc.; event versioning: `{version: 2, type: 'approval.pending', payload: {...}}`; backward compatibility: server sends events in client's supported version; event validation: Zod schema validation on both client and server; unknown event handling: log and ignore unrecognized events gracefully; event catalog: documented list of all events with payload schemas, publish/subscribe mapping; code generation: auto-generate TypeScript types from event schema definitions)
- [ ] Implement real-time analytics and monitoring events (add enterprise events: `payroll.processing_started`, `payroll.processing_completed`, `payroll.error`; `import.progress` with percentage and records processed; `report.generation_progress` for long-running reports; `system.maintenance_scheduled` for advance warning; `compliance.deadline_approaching` for time-sensitive compliance items; `workflow.sla_breach` for escalation-worthy delays; event rate limiting: max 10 events/second per client to prevent UI flooding; event prioritization: critical events skip rate limiter; event aggregation: batch low-priority events and deliver every 5s)

#### 4.4.4 Critical Infrastructure Gaps (NEW — Codebase Audit Findings)

- [ ] **P0 BLOCKER**: Install `socket.io` v4+ and `socket.io-client` in appropriate packages — NEITHER package exists in ANY `package.json` across the entire monorepo (root, `apps/web`, `apps/mobile`, all services); GAP line 1555 marks `[x] Install socket.io and socket.io-client` as done — this is FALSE; `pnpm-lock.yaml` has zero entries for socket.io; `node_modules/socket.io` does not exist; install `socket.io@^4.7` in the server package (Next.js API or standalone server); install `socket.io-client@^4.7` in `apps/web/package.json`; verify versions are compatible; add to CI dependency check
- [ ] **P0 BLOCKER**: Resolve protocol incompatibility between server and client — `server.ts` uses Socket.IO server (`import { Server } from 'socket.io'`) which speaks the Socket.IO framing protocol; `socket-client.ts` uses browser-native `new WebSocket(url)` which speaks raw WebSocket protocol — these CANNOT communicate (Socket.IO adds engine.io packet framing, session IDs, auto-reconnect negotiation that native WebSocket doesn't understand); SOLUTION: rewrite `socket-client.ts` to use `import { io } from 'socket.io-client'` matching the server; update `SocketProvider.tsx` to create Socket.IO client instead of native WebSocket; update `useSocket.ts` and `useSocketEvent.ts` to use Socket.IO client API (`socket.on`, `socket.emit`, `socket.connected`); remove dead native WebSocket `SocketClient` class; alternatively, if Socket.IO is rejected, rewrite server to use `ws` library with native WebSocket — but Socket.IO is recommended for built-in rooms, namespaces, reconnection, ACK
- [ ] **P0 BLOCKER**: Bootstrap WebSocket server and wire into application — `wsServer.initialize(httpServer)` is NEVER CALLED anywhere; the `WebSocketServer` singleton from `server.ts` is instantiated but `this.io` remains `null` forever; all emit methods (`notifyUser`, `notifyCompany`, `broadcast`) exit early with warning log; SOLUTIONS: (A) Create Next.js custom server in `apps/web/server.ts` that creates HTTP server → passes to `wsServer.initialize()` → starts Next.js on same port; (B) Create standalone Socket.IO server in `services/realtime-service/` running on separate port (e.g., 3001) — better for horizontal scaling; (C) Use Next.js API route with `pages/api/socket.ts` pattern for App Router compatibility; whichever approach: ensure the `NEXT_PUBLIC_WS_URL` env variable points to correct server; add health check endpoint `/api/v1/ws/health`; add to docker-compose and deployment manifests
- [ ] **P0 BLOCKER**: Mount `SocketProvider` in application layout — `SocketProvider` from `apps/web/src/providers/SocketProvider.tsx` is NOT rendered in any layout; `apps/web/src/app/layout.tsx` only wraps `<Toaster>` — no `<SocketProvider>`; ALL downstream hooks (`useSocket`, `useSocketEvent`) are permanently non-functional because `useSocketContext()` returns default empty values; `isConnected` is always `false`; FIX: wrap app in `<SocketProvider url={process.env.NEXT_PUBLIC_WS_URL} autoConnect={true}>` in root layout or authenticated layout; ensure provider only mounts on client side (`'use client'`); connect after auth: pass JWT token to SocketProvider once user authenticates; disconnect on logout
- [ ] **P0**: Implement JWT authentication middleware on WebSocket connections — current `server.ts` accepts `socket.handshake.auth.userId` from client WITHOUT ANY TOKEN VERIFICATION; any malicious client can connect with `{ userId: 'admin-123' }` and receive all admin notifications; CRITICAL SECURITY VULNERABILITY; implement `io.use((socket, next) => { const token = socket.handshake.auth.token; try { const decoded = verifyJWT(token); socket.data.userId = decoded.sub; socket.data.tenantId = decoded.tenantId; socket.data.roles = decoded.roles; next(); } catch { next(new Error('Authentication failed')); } })` middleware; on token expiry during active connection: emit `auth.token_expired` event → client refreshes token via HTTP → client emits `auth.refresh` with new token → server re-verifies; force disconnect on: logout event, password change, account suspension, role change (force re-auth to pick up new permissions)
- [ ] **P0**: Unify event type system across server and client — `socket-events.ts` defines 20 typed events (`SOCKET_EVENTS.NOTIFICATION_NEW = 'notification.new'`, `APPROVAL_PENDING = 'approval.pending'`, etc.) with typed payloads (`NotificationPayload`, `ApprovalPayload`, etc.); BUT `server.ts` uses its own `NotificationType` enum with different event names (generic `'notification'` for all types); `socket-client.ts` doesn't import `SOCKET_EVENTS` at all — uses raw string parsing; `useSocketEvent.ts` accepts raw `string` event names; FIX: make `socket-events.ts` the SINGLE SOURCE OF TRUTH imported by server, client, provider, and hooks; create shared package `@aura/websocket-events` if server and client are separate packages; add TypeScript generics: `useSocketEvent<'notification.new'>` auto-types the payload as `NotificationPayload`; enforce exhaustive event handling
- [ ] Implement event acknowledgment and delivery guarantee patterns — currently ALL WebSocket communication is fire-and-forget; no callback-based ACK used anywhere; for enterprise: critical events (approval decisions, payroll notifications, compliance alerts) MUST have delivery confirmation; implement Socket.IO ACK pattern: `socket.emit('approval.completed', data, (ack) => { if (ack.received) markDelivered(); })` on server; `socket.on('approval.completed', (data, callback) => { processEvent(data); callback({ received: true }); })` on client; create delivery status tracking: `{ eventId, userId, status: 'sent'|'delivered'|'read', sentAt, deliveredAt, readAt }` stored in Redis/DB; retry unACKed critical events 3 times with 5s intervals; fallback to push notification if WebSocket delivery fails after all retries; dead letter queue for permanently undeliverable events
- [ ] Implement client-side heartbeat scheduler and connection quality monitoring — server `server.ts` responds to `ping` but NEVER INITIATES pings and has NO timeout detection; client `socket-client.ts` has NO periodic ping; implement client-side: `setInterval(() => socket.emit('ping', { timestamp: Date.now() }), 30000)` — measure RTT from pong response; adaptive interval: 30s when active, 60s when tab backgrounded (use `document.visibilityState`); connection quality score: RTT < 100ms = excellent, < 500ms = good, < 2000ms = poor, > 2000ms = critical; server-side: track last ping per socket, disconnect if no ping received for 90s; emit `connection.quality` event to client when degraded; display connection indicator in UI: green/yellow/red dot in header
- [ ] Implement WebSocket rate limiting and abuse protection — ZERO rate limiting on WebSocket connections or events; HTTP rate limits (`rate-limit.ts`, `advanced-rate-limit.ts`) do NOT apply to WebSocket; implement: connection rate limit: max 5 connections per user (browser tabs), max 10 per IP per minute; event emission rate limit: max 30 events/second per client (prevent flood); per-event-type limits: `chat.message` max 5/second, `chat.typing` max 1/second; suspicious pattern detection: rapid connect/disconnect cycling, sending to non-joined rooms; IP blocklist for known bad actors; gradual backoff: warn at 80% of limit, throttle at 90%, disconnect at 100%; log rate limit violations for security audit
- [ ] Implement presence system with broadcasting and status — `server.ts` tracks `connectedClients` Map and has `isUserOnline(userId)` but NEVER BROADCASTS presence changes; connect/disconnect events are logged but not emitted to other users; implement: on connect → emit `presence.online` to tenant room with `{ userId, status: 'online', deviceType, lastActiveAt }`; on disconnect → wait 5s grace period (handles page refresh) → emit `presence.offline`; support statuses: `online`, `away` (idle > 5min), `busy` (in meeting/focus mode), `offline`; server-side presence store in Redis: `HSET presence:{tenantId} {userId} {status,lastActiveAt,deviceType}`; presence query API: `GET /api/v1/presence?userIds=1,2,3` for initial page load; `lastSeen` timestamp for offline users; team presence widget: show online/away/offline for direct reports
- [ ] Implement WebSocket namespace separation per module — everything currently uses default `/` namespace; implement namespaces for isolation and independent scaling: `/notifications` for real-time alerts, `/chat` for messaging, `/presence` for online status, `/collaboration` for real-time document co-editing, `/admin` for system events; each namespace can have independent: authentication middleware (chat may require different permissions than admin), rate limits, connection limits; namespace-level metrics: connections per namespace, events per second per namespace; lazy connection: only connect to `/chat` namespace when user opens messaging module; namespace discovery: client queries available namespaces from server config
- [ ] Add Zod runtime validation on WebSocket event payloads — `socket-events.ts` has TypeScript interfaces but ZERO runtime validation; malformed or tampered payloads accepted silently; implement: create Zod schemas for every event payload: `const NotificationPayloadSchema = z.object({ id: z.string().uuid(), type: z.nativeEnum(NotificationType), title: z.string().max(200), ... })`; server-side: validate outbound payloads before emit (catch bugs), validate inbound payloads on receive (prevent injection); client-side: validate received payloads before processing; on validation failure: log schema violation with event details to monitoring, skip processing, don't crash; share schemas between server and client via `@aura/websocket-events` package; generate TypeScript types FROM Zod schemas (single source of truth): `type NotificationPayload = z.infer<typeof NotificationPayloadSchema>`

---

### 4.5 Form Validation Schemas (26 Tasks)

> **CORRECTION 2026-06-03 (#95)**: The "NOT INSTALLED" claim is **STALE**.
> Verified: `apps/web/package.json` ships `"react-hook-form": "^7.71.2"` and `"@hookform/resolvers": "^5.2.2"`. The deeper findings (schema duplication, password rule inconsistency, missing GCC identity validators) are independent of installation status and still worth executing on.
>
> **v1.0 Baseline** (8 tasks — completed): 8 Zod schemas in `lib/validation/` + extensive schemas in `lib/validators/` and inline in API routes.
> **Enterprise Gap — Original audit (likely stale on install state)**: claimed `react-hook-form` and `@hookform/resolvers` were NOT INSTALLED — architecture doc specifies "form_state: tool: React Hook Form + Zod" but neither package is in `apps/web/package.json`; all form state managed via `useState` + manual `z.parse()` calls; no `zodResolver`, no `useForm`, no `FormProvider`. **Massive schema duplication**: `createEmployeeSchema` independently defined in 4+ files (`lib/validation/schemas.ts`, `api/core-hr/employees/route.ts`, `api/v1/employees/route.ts`, `(modules)/core-hr/employees/page.tsx`) with DIFFERING CONSTRAINTS — no single source of truth. **Password validation inconsistency**: 3 different rules — `schemas.ts` requires special chars, `password-reset/route.ts` doesn't require special chars, `user-management.ts` only requires min 8 chars. **Country-specific validators NOT Zod-integrated**: India PAN/Aadhaar/UAN and Saudi/Qatar IBAN are imperative static methods in compliance services, not available as Zod refinements. **Missing validators**: No UAE TRN, no Saudi National ID, no UAE Emirates ID, no Bahrain CPR, no Kuwait Civil ID. **SSN inconsistency**: `dependent.schema.ts` validates SSN format with regex, but `api/benefits/dependents/route.ts` accepts `z.string().optional()` with NO format check. **File upload uses raw if-checks** not Zod. **No `beforeunload`/dirty detection** anywhere. **No form auto-save**. `createProtectedRoute` wrapper with Zod exists but is underused — most of 125+ API route files do inline `safeParse`. **No shared validation package** in `packages/` workspace. **Benchmark**: Workday uses centralized schema registry with country-specific validation plugins; SAP SuccessFactors uses configurable validation rules per legal entity; Darwinbox uses shared Zod schemas with react-hook-form + zodResolver.

- [x] Create `/apps/web/src/lib/validation/benefitsEnrollment.schema.ts` (Zod schema)
- [x] Create `/apps/web/src/lib/validation/dependent.schema.ts`
- [x] Create `/apps/web/src/lib/validation/lifeEvent.schema.ts`
- [x] Create `/apps/web/src/lib/validation/feedback.schema.ts`
- [x] Create `/apps/web/src/lib/validation/recognition.schema.ts`
- [x] Create `/apps/web/src/lib/validation/customReport.schema.ts`
- [x] Create `/apps/web/src/lib/validation/workflowDefinition.schema.ts`
- [x] Create `/apps/web/src/lib/validation/webhook.schema.ts`
- [ ] Create shared validation schema package for frontend-backend reuse (`/packages/@aura/validation/` — shared Zod schemas importable by both frontend and backend; employee schema: name, email, phone with country-specific format validation; leave request schema: date range, leave type, with dynamic rules per policy; expense schema: amount with currency validation, receipt file requirements; publish as internal npm package or monorepo shared package; schema versioning: backward-compatible changes only, major version for breaking changes; auto-generate OpenAPI spec from Zod schemas for API documentation; type inference: `z.infer<typeof schema>` for both frontend form types and backend request types)
- [ ] Create unsaved changes detection and browser prompt middleware (`/apps/web/src/lib/validation/unsavedChanges.ts` — hook into React Hook Form `formState.isDirty`; browser beforeunload prompt: "You have unsaved changes" when navigating away from dirty form; Next.js route change interception: confirm dialog on sidebar navigation; auto-detect which fields changed and show summary in confirm dialog; exclude auto-saved fields from dirty detection; integration with wizard/stepper: track dirty state per step; whitelist safe navigations: don't prompt when clicking "Cancel" or "Discard"; persist dirty state in sessionStorage: recover on accidental tab close and reopen)
- [ ] Create auto-save draft functionality for long forms (`/apps/web/src/lib/validation/autosave.ts` — auto-save form state every 30s for forms tagged as "long" (benefits enrollment, expense report, employee onboarding); storage: save to backend draft API, fallback to IndexedDB if offline; draft recovery: on form mount, check for existing draft and offer "Resume from draft?" prompt; draft TTL: 7 days, auto-cleanup expired drafts; draft versioning: save multiple draft versions, allow reverting; draft sharing: generate shareable draft link for multi-user form completion; draft-to-submission: clear draft on successful form submission; draft indicator: "Draft saved 2 minutes ago" in form header)
- [ ] Create progressive validation configuration (`/apps/web/src/lib/validation/progressiveValidation.ts` — field-level validation on blur: validate individual field when user tabs out; form-level validation on submit: full form validation with scroll to first error; cross-field validation: salary range validation, date range consistency, dependent relationships; async validation: check email uniqueness, employee ID uniqueness, Emirates ID format via backend API; validation debouncing: 300ms delay for async validations to reduce API calls; validation priority: show most critical error first; accessibility: associate error messages with fields via aria-describedby; internationalization: error messages from i18n keys, not hardcoded English)
- [ ] Create dynamic validation rules based on tenant/country configuration (`/apps/web/src/lib/validation/dynamicRules.ts` — load validation rules from tenant configuration at runtime: phone format per country, tax ID format per jurisdiction, required fields per entity type; country-specific validators: UAE Emirates ID format, India PAN/Aadhaar format, US SSN format, Saudi IQAMA format; field visibility rules: show/hide fields based on country (e.g., GOSI number only for Saudi entities); conditional validation: salary requires currency, international address requires country; custom validation rules from admin configuration: per-tenant custom required fields, regex patterns, value ranges; hot-reload: validation rules update without page refresh when admin changes configuration)
- [ ] Create file upload validation schemas (`/apps/web/src/lib/validation/fileValidation.ts` — file type validation per document category: ID scan = JPEG/PNG/PDF max 10MB, payslip = PDF max 5MB, bulk import = CSV/XLSX max 100MB, profile photo = JPEG/PNG max 2MB; file content validation: verify magic bytes match extension (prevent .exe renamed to .pdf); image dimension validation: profile photo min 200×200, max 4000×4000; PDF page count validation: policy documents max 100 pages; filename sanitization: strip special characters, enforce max length; duplicate detection: warn if same filename already uploaded for entity; virus scan pre-validation: client-side basic checks, server-side ClamAV for deep scan)

#### 4.5.2 Critical Infrastructure Gaps (NEW — Codebase Audit Findings)

- [ ] **P0 BLOCKER**: Install `react-hook-form` and `@hookform/resolvers` and create form infrastructure — architecture doc specifies `form_state: tool: React Hook Form + Zod` with `zodResolver` but NEITHER `react-hook-form` NOR `@hookform/resolvers` is in `apps/web/package.json`; ALL frontend forms use `useState` + manual `z.parse()` calls (found in `employees/page.tsx`, `departments/page.tsx`, `document-management/page.tsx`); install `react-hook-form@^7.50+` and `@hookform/resolvers@^3.3+`; create `/apps/web/src/lib/forms/FormWrapper.tsx` — generic `<FormWrapper schema={employeeSchema} onSubmit={handler}>` component using `useForm({ resolver: zodResolver(schema), mode: 'onBlur' })`; create `useFormWithSchema(schema)` custom hook wrapping `useForm + zodResolver`; migrate all 3 existing form pages from useState to react-hook-form; add `FormProvider` for nested form components; add `DevTool` from `@hookform/devtools` in development mode
- [ ] **P0**: Deduplicate and centralize ALL Zod schemas — `createEmployeeSchema` is defined INDEPENDENTLY in 4+ files with DIFFERING CONSTRAINTS: `lib/validation/schemas.ts` (22 schemas), `lib/validators/user-management.ts` (14 schemas), `lib/validators/master-data.ts` (12 schemas), `lib/validators/competency-library.ts` (21 schemas), PLUS 100+ inline schemas in individual API route files and service files; SOLUTION: create entity-centric schema files in `/packages/@aura/validation/src/` — `employee.schema.ts`, `leave.schema.ts`, `payroll.schema.ts`, `attendance.schema.ts`, etc.; export base schema + variants: `employeeBaseSchema`, `createEmployeeSchema = employeeBaseSchema.required()`, `updateEmployeeSchema = employeeBaseSchema.partial()`, `employeeQuerySchema`; ALL API routes and frontend forms import from this single package; create migration script to identify and reconcile differing field constraints across duplicates; add CI lint rule: no inline `z.object()` in API route files — must import from `@aura/validation`
- [ ] **P0**: Standardize password validation across entire codebase — THREE different password rules found: (1) `lib/validation/schemas.ts` `patterns.password` requires uppercase + lowercase + digit + special char via `/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/`, min 8; (2) `api/auth/password-reset/reset/route.ts` `ResetSchema` uses `/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/` — NO special char required; (3) `lib/validators/user-management.ts` `ChangePasswordSchema` only requires `min(8)` — NO complexity checks; ALSO `lib/auth/password.ts` `validatePasswordStrength()` is a separate imperative function not integrated with Zod; CREATE single `passwordSchema` in `@aura/validation` with configurable complexity per `CreatePasswordPolicySchema` settings (which exists in `user-management.ts` with `minLength 6-32`, `requireUppercase`, `requireLowercase`, `requireNumbers`, `requireSpecialChars`, `expiryDays`, `historyCount`); DELETE all other password schemas and the imperative function; add password breach check via k-anonymity HaveIBeenPwned API
- [ ] Create GCC/MENA and international identity document validators as Zod refinements (`/packages/@aura/validation/src/identity.schema.ts` — integrate existing imperative validators + add missing ones; India: PAN `/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/` with category validation (currently in `india-statutory.service.ts` as static method — wrap as `z.string().refine(validatePAN)`), Aadhaar 12-digit with Verhoeff checksum, UAN 12-digit; UAE: Emirates ID `/^784-[0-9]{4}-[0-9]{7}-[0-9]{1}$/` with check digit (MISSING entirely), TRN (Tax Registration Number) 15-digit (MISSING); Saudi: National ID 10-digit starting with 1 (Saudi) or 2 (non-Saudi) (MISSING), IQAMA format; Qatar: QID 11-digit; Bahrain: CPR 9-digit `YYMMDD-NNN`; Kuwait: Civil ID 12-digit; Oman: Civil Number; US: SSN with proper format `/^\d{3}-\d{2}-\d{4}$/` (unify with `dependent.schema.ts`); UK: National Insurance Number; make all composable: `identitySchema.uae.emiratesId`, `identitySchema.india.pan`, etc.)
- [ ] Create IBAN validation schema covering ALL GCC + international banks (`/packages/@aura/validation/src/banking.schema.ts` — existing validators cover only Qatar (`/^QA[0-9]{2}[A-Z0-9]{25}$/`) and Saudi (`/^SA\d{2}[A-Z0-9]{20}$/`) as imperative methods; add: UAE IBAN `/^AE\d{2}\d{3}\d{16}$/` (23 chars), Bahrain `/^BH\d{2}[A-Z]{4}\d{14}$/`, Kuwait `/^KW\d{2}[A-Z]{4}\d{22}$/`, Oman `/^OM\d{2}\d{3}\d{16}$/`, India IFSC `/^[A-Z]{4}0[A-Z0-9]{6}$/`; implement ISO 7064 Mod 97 check digit validation for ALL IBANs; add SWIFT/BIC code validation `/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/`; US ABA routing number with check digit; create `bankingSchema.iban(country?)` factory that applies correct format per country; auto-detect country from first 2 chars; validate against IBAN registry for country-specific BBAN structure)
- [ ] Create address and postal code validation per country (`/packages/@aura/validation/src/address.schema.ts` — current address fields are just `z.string().max()` with no format validation; create structured address schema per country: US — ZIP `/^\d{5}(-\d{4})?$/`, state 2-char enum; UK — postcode `/^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i`; India — PIN `/^\d{6}$/` with state mapping; UAE — PO Box `/^\d{1,6}$/` + emirate enum; Saudi — postal code `/^\d{5}$/`; Germany/France — `/^\d{5}$/`; address component validation: building/street required, city required, state/province per country, postal code format per country; addressSchema factory: `createAddressSchema('UAE')` returns UAE-specific fields + validation; Google Maps/Places integration hook: auto-fill and validate address components; PO Box vs street address: UAE/GCC commonly use PO Box, not street address)
- [ ] Create phone number validation per country with format display (`/packages/@aura/validation/src/phone.schema.ts` — current `patterns.phone` is only E.164 `/^\+?[1-9]\d{1,14}$/` which accepts any number; create per-country validators: UAE mobile `/^(?:\+971|0)5[0-9]\d{7}$/`, UAE landline `/^(?:\+971|0)[2-9]\d{7}$/`; India `/^(?:\+91|0)?[6-9]\d{9}$/`; US `/^(?:\+1)?\d{10}$/`; Saudi `/^(?:\+966|0)5\d{8}$/`; UK `/^(?:\+44|0)7\d{9}$/`; validate operator prefix: UAE 050=Etisalat, 055/052=Du; auto-format display: `+971 50 123 4567`, `+91 98765 43210`; create `phoneSchema(country)` factory; detect country from prefix; emergency number exclusion: reject 911, 999, 112 as employee phone numbers)
- [ ] Migrate `createProtectedRoute` wrapper to all API routes — excellent Zod integration pattern exists in `lib/api/route-wrapper.ts` with `createProtectedRoute(handler, { bodySchema, querySchema })` that auto-validates and returns 400 on `ZodError`; BUT most of 125+ API route files do inline `safeParse`/`parse` instead; benefits of migration: consistent error response format, automatic validation before handler runs, TypeScript inference of validated body type, single error handling path; create migration script: identify all routes using inline `z.parse()`/`safeParse()`; migrate in batches per module: auth routes → core-hr → payroll → leave → attendance → benefits; add eslint rule: warn on raw `z.parse()` in route files (must use wrapper); measure: before migration = N different error formats, after = 1 consistent format
- [ ] Create reusable date range validation utilities (`/packages/@aura/validation/src/dateRange.schema.ts` — scattered `.refine()` cross-field date checks across codebase (`leave/apply/route.ts`: startDate <= endDate, `shifts/assign/route.ts`: startDate <= endDate, `user-management.ts`: delegation end > start); create composable utilities: `dateRangeSchema()` returning `z.object({ startDate, endDate }).refine(end >= start)`; `futureDateSchema()` — must be after today; `businessDaysOnly(country)` — exclude weekends per country (Fri-Sat for GCC, Sat-Sun for US/EU); `maxDurationSchema(days)` — leave request max 30 days; `overlapDetection(existingRanges)` — check if new range overlaps existing (leave overlap, shift overlap); timezone-aware: store in UTC, validate in user's timezone; Hijri calendar support: validate Hijri date ranges for GCC Islamic leave types (Hajj, Iddah); fiscal year boundaries: prevent cross-fiscal-year ranges where not allowed)
- [ ] Create environment-specific validation strictness (`/packages/@aura/validation/src/config.ts` — production schemas should enforce ALL constraints strictly; development/staging can be lenient for testing; create `createSchemaWithMode(mode: 'strict' | 'lenient')` factory; strict mode: email must be verified domain, phone must pass carrier lookup, IBAN must pass check digit, SSN must pass checksum; lenient mode: accept test values — `test@example.com`, `+1-555-0100` (reserved test numbers), `000-00-0000` (test SSN); env detection: `process.env.NODE_ENV === 'production'` auto-selects strict; configurable per-tenant: some tenants in "migration mode" with lenient validation during data import; validation audit: log all lenient-mode passes that would fail strict — clean up before go-live; seeding scripts: always use lenient mode)
- [ ] Create form error analytics and validation telemetry (`/apps/web/src/lib/validation/validationTelemetry.ts` — track which fields users most frequently fail validation on: email format 23%, phone format 18%, date range 12%; track time-to-correct: average time between validation error and successful submission per field; track abandonment: forms where user encounters validation error and never submits; track by country: India users struggle with date format (MM/DD vs DD/MM), UAE users struggle with phone format; send anonymized telemetry to analytics service; generate monthly validation UX report for product team; top 10 validation friction points → prioritize UX improvements; A/B test: inline validation hints vs tooltip vs below-field → measure error rate reduction; track schema version: did a schema change increase/decrease validation failures)
- [ ] Create cross-field and cross-entity validation orchestrator (`/packages/@aura/validation/src/crossFieldValidation.ts` — beyond single-field Zod schemas, enterprise forms need multi-field and multi-entity validation; salary validation: base + allowances + deductions must equal gross; leave validation: requested dates must not overlap existing approved leaves for same employee; shift assignment: employee cannot be assigned overlapping shifts; benefits enrollment: dependent ages must qualify for selected plan; expense claims: total claimed must not exceed policy limits per category; payroll run: all employees must have active bank accounts before payroll run; recruitment: offer salary must be within approved band for grade + location; create `ValidationOrchestrator` class: accepts field-level schemas + cross-field rules + async entity checks; returns unified error map; async validators cached: don't re-check email uniqueness if email field unchanged; validation dependency graph: if country changes → re-validate phone, address, tax ID, postal code)

---

### 4.6 Third-Party Integrations (33 Tasks)

> **CORRECTION 2026-06-03 (#95)**: The "no SDKs installed" claim is **partially stale**.
> Verified: `nodemailer ^6.9.7` IS in `apps/web/package.json`. The SDK absence in `apps/web` is by design — the integration concerns moved to dedicated microservices: `services/integration-service`, `services/notification-service`, `services/document-service` all carry third-party SDKs. The other criticisms (DocuSign HMAC verification commented out, no Slack signing secret verification, demo-endpoint hardcoding) are **independent of installation status** and remain valid action items.
>
> **v1.0 Baseline** (13 tasks — completed): 10 integration library files (Slack, Teams, DocuSign, Calendar) + 3 API routes created. Code is REAL but uses raw `axios` instead of official SDKs.
> **Enterprise Gap — Original audit (mixed accuracy)**: claimed no third-party SDK packages installed — `@slack/web-api`, `@microsoft/microsoft-graph-client`, `docusign-esign`, `googleapis` ALL absent from `apps/web/package.json`; every integration uses raw `axios` HTTP calls; microservice `slackService.ts` has `// TODO: Implement with @slack/web-api` comments confirming SDKs were never installed. **`nodemailer` not in package.json** — dynamically imported (`await import('nodemailer')`) — will fail on clean install. **Slack/Teams OAuth callback routes are STUBS** — return hardcoded mock tokens; only Google/Microsoft/Okta SSO callbacks are real (full CSRF, user provisioning, session). **DocuSign hardcoded to DEMO endpoint** — `https://demo.docusign.net/restapi` with no production URL switch. **DocuSign webhook HMAC verification COMMENTED OUT** — reads `x-docusign-signature-1` header but verification code is disabled. **No Slack signing secret verification** anywhere — inbound Slack events accepted without any auth. **Integration connection service is STUB** — `logActivity()`, `getHealthMetrics()`, `startSyncJob()` all have "In production, save to database" comments; health metrics return hardcoded `{ status: 'HEALTHY', uptime: 99.9 }`. **Microservice integration layer is stubs** — `CalendarService`, `SlackService`, `TeamsService` in `services/integration-service/` all have TODO on every method. **No SMS/WhatsApp** integration. **No payment gateway**. **No S3/file storage client** (env config exists but no AWS SDK). **No SAML 2.0/SCIM 2.0** (only metadata in registry). **No external API rate limit handling** (internal rate limits implemented but not for respecting Slack/Google/DocuSign quotas). **Positive**: connector framework types/registry are well-designed; `WebhookService` has real HMAC signing + BullMQ delivery worker with exponential backoff; OAuth2 state is Redis-backed with CSRF protection; Teams has real token refresh. **Benchmark**: Workday uses SDK-first integrations with automated health checks; SAP uses Integration Suite with pre-built connectors + SCIM; Darwinbox uses middleware abstraction layer with rate limit respect.

#### 4.6.1 Slack Integration

- [x] Create `/apps/web/src/lib/integrations/slack/client.ts` - Slack Web API client
- [x] Create `/apps/web/src/lib/integrations/slack/oauth.ts` - OAuth 2.0 flow
- [x] Create `/apps/web/src/lib/integrations/slack/messages.ts` - message posting
- [x] Create `GET/POST /api/v1/integrations/slack/oauth/callback` - OAuth callback

#### 4.6.2 Microsoft Teams Integration

- [x] Create `/apps/web/src/lib/integrations/teams/client.ts` - Graph API client
- [x] Create `/apps/web/src/lib/integrations/teams/oauth.ts` - Azure AD OAuth
- [x] Create `/apps/web/src/lib/integrations/teams/cards.ts` - adaptive cards
- [x] Create `GET/POST /api/v1/integrations/teams/oauth/callback` - OAuth callback

#### 4.6.3 DocuSign Integration

- [x] Create `/apps/web/src/lib/integrations/docusign/client.ts` - DocuSign client
- [x] Create `/apps/web/src/lib/integrations/docusign/envelopes.ts` - envelope management
- [x] Create `POST /api/v1/integrations/docusign/webhook` - signing webhook

#### 4.6.4 Calendar Integration

- [x] Create `/apps/web/src/lib/integrations/calendar/google.ts` - Google Calendar API
- [x] Create `/apps/web/src/lib/integrations/calendar/outlook.ts` - Microsoft Graph Calendar

#### 4.6.5 Enterprise Integration Infrastructure

- [ ] Create integration abstraction layer and connector framework (`/apps/web/src/lib/integrations/framework/connector.ts` — generic `IntegrationConnector` interface: `connect()`, `disconnect()`, `sync()`, `healthCheck()`, `getStatus()`; connector registry: register/discover available connectors dynamically; connection lifecycle management: connect → authenticate → configure → sync → monitor → disconnect; field mapping engine: configurable source↔target field mappings per connector; data transformation pipeline: transform data between AuraOS format and external system format; connector versioning: support multiple API versions per integration; connector marketplace UI: browse, install, configure integrations from admin panel)
- [ ] Create OAuth token management and refresh service (`/apps/web/src/lib/integrations/framework/oauth.ts` — centralized OAuth token storage: encrypted tokens per integration per tenant; automatic token refresh: refresh 5 minutes before expiry; refresh failure handling: notify admin, queue pending sync operations; re-authorization flow: if refresh fails, prompt admin to re-authorize with original consent screen; token scope management: request minimum required scopes, track scope changes; token revocation on disconnect: properly revoke tokens when integration is disabled; multi-account support: connect multiple Slack workspaces or Teams tenants; PKCE support for public clients)
- [ ] Create integration health monitoring and status dashboard (`/apps/web/src/lib/integrations/framework/healthMonitor.ts` — periodic health check per active integration: every 5 minutes for critical (payroll, calendar), every 30 minutes for standard; health check methods: API ping, token validity check, recent sync success rate; status indicators: healthy (green), degraded (yellow), down (red), disconnected (gray); integration dashboard page: all integrations with status, last sync time, error count; alerting: email/Slack notification when integration goes unhealthy; auto-recovery: retry failed syncs on integration recovery; SLA tracking per integration: uptime percentage, mean time to recovery)
- [ ] Create webhook signature verification service (`/apps/web/src/lib/integrations/framework/webhookVerifier.ts` — HMAC-SHA256 signature verification for incoming webhooks: Slack signing secret, DocuSign HMAC, Teams HMAC; replay attack prevention: reject webhooks older than 5 minutes using timestamp validation; IP whitelist validation: verify webhook origin IP against provider's published ranges; payload size limit: reject webhooks >1MB to prevent DoS; idempotency handling: deduplicate webhooks using unique event ID; webhook event logging: log all received webhooks for debugging and audit; failure handling: return 200 immediately, process asynchronously to avoid timeout; dead letter queue for failed webhook processing)
- [ ] Create integration sync engine with conflict resolution (`/apps/web/src/lib/integrations/framework/syncEngine.ts` — bidirectional sync: push AuraOS changes to external systems AND pull external changes into AuraOS; sync modes: real-time (webhook-triggered), scheduled (cron), manual (admin-triggered); conflict resolution per field: AuraOS-wins, external-wins, most-recent-wins, manual review; delta sync: only sync records changed since last sync timestamp; full sync: periodic full reconciliation to catch missed deltas; sync audit trail: log every record synced with before/after values; retry queue: failed sync items retried with exponential backoff; sync progress UI: real-time progress bar for bulk sync operations)
- [ ] Create integration rate limit handling and throttling (`/apps/web/src/lib/integrations/framework/rateLimiter.ts` — respect external API rate limits: parse X-RateLimit-Remaining and Retry-After headers; pre-emptive throttling: slow down before hitting limits based on remaining quota; per-integration rate limit configuration: Slack 1 msg/sec, Google Calendar 10 req/sec, DocuSign 1000 req/hr; request queuing: when approaching limit, queue requests and drain at safe rate; burst handling: allow short bursts for bulk operations within overall rate budget; rate limit monitoring: dashboard showing current usage vs limits per integration; rate limit exceeded alerting: notify admin when consistently hitting limits — may need to upgrade API tier)
- [ ] Create integration error handling and user notification service (`/apps/web/src/lib/integrations/framework/errorHandler.ts` — categorize integration errors: auth failure (re-authorize needed), permission denied (scope insufficient), data validation (fix data and retry), rate limit (auto-retry later), server error (provider issue, wait); user-visible error notifications: "Calendar sync failed — click to reconnect" for recoverable errors; admin error dashboard: error trends per integration, most common errors, resolution suggestions; error escalation: if error persists >1hr for critical integration, email tenant admin; auto-disable: suspend integration after 100 consecutive failures, require manual re-enable; error context: include relevant records, timestamps, and request/response for debugging)
- [ ] Create integration audit trail and compliance logging (`/apps/web/src/lib/integrations/framework/auditTrail.ts` — log all data flowing through integrations: what data was sent/received, when, by which user/system, for which employee; PII tracking: flag when PII (name, email, salary, SSN) is sent to external systems; data residency compliance: verify data is not sent to integrations hosted in restricted regions; GDPR right to erasure: when employee data is deleted, trigger deletion in all connected integrations; integration access review: quarterly report of which integrations have access to which data categories; consent tracking: record user consent for data sharing with each integration; retention policy: auto-purge integration sync logs older than configurable period per compliance requirement)

#### 4.6.6 Critical Infrastructure Gaps (NEW — Codebase Audit Findings)

- [ ] **P0 BLOCKER**: Install official third-party SDK packages — ALL integrations use raw `axios` HTTP calls instead of official SDKs; `@slack/web-api` NOT in package.json (microservice has `// TODO: Implement with @slack/web-api` comments), `@microsoft/microsoft-graph-client` NOT installed (using raw `axios` against `graph.microsoft.com/v1.0`), `docusign-esign` NOT installed, `googleapis` NOT installed, `nodemailer` NOT in package.json (dynamically imported via `await import('nodemailer')` — will fail on clean install); install: `@slack/web-api@^6.9`, `@slack/events-api@^3.0` (for event verification), `@microsoft/microsoft-graph-client@^3.0`, `docusign-esign@^7.0`, `googleapis@^130`, `nodemailer@^6.9`; migrate `SlackClient` from raw axios to `WebClient`, migrate `TeamsClient` to `Client.init()`, migrate `DocuSignClient` to `ApiClient`, migrate calendar clients to official SDKs; benefits: built-in rate limiting, auto-retry, type safety, pagination helpers, token management
- [ ] **P0**: Fix Slack and Teams OAuth callback routes — currently STUBS returning hardcoded mock tokens; `api/v1/integrations/slack/oauth/callback/route.ts` returns a fake bot-token-shaped placeholder (starts with the standard 4-char Slack bot-token prefix) instead of calling `exchangeSlackCode()`; `api/v1/integrations/teams/oauth/callback/route.ts` same — mock token; CONTRAST: Google/Microsoft/Okta SSO callbacks (`api/auth/callback/`) are FULLY REAL with Redis-backed CSRF state verification via `oauth2StateService.verifyState()`, token exchange, user auto-provisioning via `userProvisioningService`, httpOnly cookie session creation; FIX: replicate the SSO callback pattern for integration-specific OAuth: verify CSRF state, exchange code via existing `exchangeSlackCode()`/`exchangeTeamsCode()`, encrypt and store tokens per tenant in DB via Prisma, redirect to integration settings page with success status; also implement token refresh scheduling: check token expiry every 5 min, refresh Teams tokens proactively (Slack Bot tokens don't expire)
- [ ] **P0**: Enable DocuSign webhook HMAC verification and switch to production endpoint — TWO critical issues: (1) HMAC verification is COMMENTED OUT — `api/v1/integrations/docusign/webhook/route.ts` reads `x-docusign-signature-1` header but the `verifyDocuSignSignature()` call is disabled; any HTTP client can forge DocuSign webhook events; UNCOMMENT and enforce HMAC-SHA256 verification using `DOCUSIGN_CONNECT_KEY`; reject requests with missing/invalid signatures with 401; (2) DocuSign client hardcoded to DEMO URL `https://demo.docusign.net/restapi` — no production URL switch; create environment-based URL: `process.env.DOCUSIGN_BASE_URL || (isProduction ? 'https://na4.docusign.net/restapi' : 'https://demo.docusign.net/restapi')`; also: DocuSign event handlers are `console.log` only — wire `envelope-completed` to update document status in Prisma, trigger notification to signers, update compliance records
- [ ] **P0**: Implement Slack signing secret verification for inbound events — ZERO verification of Slack webhook/event payloads anywhere in codebase; Slack sends `x-slack-signature` and `x-slack-request-timestamp` headers that MUST be verified using `SLACK_SIGNING_SECRET`; without this, any attacker can forge Slack events (notifications, interactive component callbacks, slash commands); implement: `verifySlackSignature(req)` — compute `HMAC-SHA256('v0:' + timestamp + ':' + rawBody, SLACK_SIGNING_SECRET)` → compare with `x-slack-signature`; reject if timestamp > 5 minutes old (replay attack prevention); apply to ALL Slack-facing routes; use `@slack/events-api` SDK's built-in verification middleware if SDK is installed; add `SLACK_SIGNING_SECRET` to env config
- [ ] Create production email service with multi-transport and fallback — current `email.service.ts` uses `nodemailer` via dynamic import (not in package.json); only supports SMTP; in development mode falls back to console.log; implement multi-transport email service: primary = SendGrid API (`@sendgrid/mail`) for high deliverability + tracking; fallback = AWS SES (`@aws-sdk/client-ses`) if SendGrid fails; tertiary = SMTP (nodemailer) as last resort; features: email template engine (Handlebars or React Email) for branded HTML emails; email tracking: open rates, click rates, bounce rates per template; unsubscribe management: per-employee email preferences, CAN-SPAM compliance footer; bounce handling: process SendGrid/SES webhooks for hard/soft bounces, auto-suppress hard bounces; rate limiting: max 500 emails/hour per tenant; email queue: use existing RabbitMQ `email.notifications` queue with retry; locale-aware: send emails in employee's preferred language
- [ ] Create SMS and WhatsApp Business integration — ZERO SMS/WhatsApp implementation in codebase; critical for GCC market where WhatsApp is primary communication channel; implement: Twilio as primary provider (`twilio` npm package) for SMS + WhatsApp Business API; fallback provider: Vonage/Nexmo for regions where Twilio coverage is poor; SMS use cases: OTP/MFA verification, attendance clock-in confirmation, payroll processed notification, emergency alerts; WhatsApp Business use cases: leave approval notifications, payslip delivery, document signing reminders, onboarding task reminders; template management: WhatsApp requires pre-approved message templates — create template registry with approval status tracking; delivery tracking: sent/delivered/read status per message; opt-in management: employees must opt-in for WhatsApp per PDPL/GDPR; cost tracking: SMS/WhatsApp per-message cost attributed to tenant for billing
- [ ] Create S3/Azure Blob file storage client and service — `apps/web/src/lib/config/env.ts` declares `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET` as optional env vars but NO actual S3 client code exists; `@aws-sdk/client-s3` not in package.json; implement: storage abstraction layer `StorageProvider` with implementations for AWS S3, Azure Blob Storage, Google Cloud Storage, and local filesystem (development); pre-signed upload URLs for direct browser-to-S3 uploads (bypass server for large files); folder structure: `{tenantId}/{module}/{entityId}/{filename}`; content-type detection and enforcement; virus scanning via S3 event → Lambda → ClamAV; lifecycle rules: auto-archive to S3 Glacier after 1 year; data residency: configure per-tenant bucket region (UAE data stays in me-south-1); encryption: SSE-S3 or SSE-KMS with tenant-specific keys; document preview generation: trigger Lambda for PDF thumbnail, image resize on upload
- [ ] Implement SAML 2.0 and SCIM 2.0 provisioning — `IntegrationRegistryService` catalogs Azure AD as `int_azure_ad` with SAML/OIDC features and SCIM provisioning listed as "premium" — but it's METADATA ONLY with zero implementation; enterprise SSO requires SAML 2.0 for: Azure AD, Okta, OneLogin, PingFederate, ADFS; implement: install `saml2-js` or `@node-saml/node-saml`; create `/api/v1/auth/saml/metadata` endpoint (SP metadata XML); create `/api/v1/auth/saml/callback` endpoint (assertion consumer service); IdP metadata import: parse IdP XML to extract certificate, SSO URL, SLO URL; attribute mapping: configurable map of SAML attributes → AuraOS user fields; JIT provisioning: auto-create user on first SAML login; SCIM 2.0: create `/api/v1/scim/Users` and `/api/v1/scim/Groups` endpoints per RFC 7644; SCIM operations: Create, Read, Replace, Delete, Search with filter support; Azure AD auto-provisioning: create/update/deactivate users automatically via SCIM; Okta SCIM integration; test with SAML tracer browser extension
- [ ] Wire integration connection service to database persistence — `IntegrationConnectionService` in `apps/web/src/lib/services/integrations/connection.service.ts` has "In production, save to database" and "In production, fetch from database" comments on EVERY method; `connectIntegration()` encrypts credentials with base64 (mock encryption); `getHealthMetrics()` returns hardcoded `{ status: 'HEALTHY', uptime: 99.9 }`; `logActivity()` is in-memory only; `startSyncJob()` is stub; FIX: create Prisma models: `Integration`, `IntegrationConnection`, `IntegrationCredential` (encrypted), `IntegrationSyncJob`, `IntegrationLog`; replace mock encryption with AES-256-GCM using tenant-specific key from KMS; implement real `getHealthMetrics()` aggregating from log table; implement real `logActivity()` persisting to IntegrationLog table; add database indexes for tenant+integration+status queries
- [ ] Implement microservice integration clients from stubs — `services/integration-service/` has stub service files: `CalendarService` (all methods return empty/mock), `SlackService` (every method has `// TODO: Implement with @slack/web-api`), `TeamsService` (same TODO pattern); `WebhookService.deliver()` HTTP call is TODO; FIX: implement real API calls using SDKs (once installed per task above); wire microservice to main app: ensure `services/integration-service/` Fastify server starts on port 3008 and is reachable from `apps/web`; implement service-to-service auth (JWT or mTLS); health endpoint per microservice; Docker compose entry with proper env variables
- [ ] Create external API rate limit respecting and quota management — internal rate limiting is comprehensive (Redis sliding window, distributed rate limiting, 8 presets) but ZERO handling of external API quotas; `IntegrationAction` type has `rateLimit: { requests, period }` field but it's metadata-only — no enforcement code; implement: parse `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `Retry-After` response headers from Slack, Google, Microsoft, DocuSign; pre-emptive throttling: when remaining < 10% of limit, switch to queued mode; per-integration rate config: Slack Tier 1 = 1msg/sec, Google Calendar = 10req/sec/user, DocuSign = 1000req/hour, Microsoft Graph = 10000req/10min; request queue with priority: user-initiated requests > background sync > bulk operations; rate limit dashboard: real-time usage vs quota per integration per tenant; quota exceeded alerting: notify admin when approaching limits; automatic API tier upgrade recommendation based on usage patterns
- [ ] Create integration test suite and sandbox management — no integration testing framework; DocuSign permanently on demo URL; Slack/Teams callbacks return mock tokens; implement: integration sandbox environment per provider — DocuSign sandbox, Slack test workspace, Microsoft Graph test tenant; automated integration tests: test OAuth flow end-to-end, test message sending, test webhook receipt + verification, test token refresh; mock server: create local mock server mimicking Slack/Teams/DocuSign APIs for CI pipeline (use `msw` or `nock`); integration health test: scheduled job that runs basic connectivity test per active integration and reports to monitoring; test data isolation: integration tests use separate test tenant and clean up after; contract testing: verify API response shapes match expected schemas; integration regression suite: run on every deployment before enabling integration routes

---

## ============================================================

## ENTERPRISE GRADE SECTIONS (NEW — February 2026)

## ============================================================

---

## SECTION 5: ENTERPRISE INFRASTRUCTURE (92 Tasks)

> **Backend Audit Note**: Partial infrastructure already exists — Sentry monitoring, APM, query monitoring (7 files in `lib/monitoring/`),
> 6 queue workers (`lib/queue/`), 5 repository patterns (`lib/repositories/`), Redis caching in multiple services,
> BullMQ job scheduling (10 job files in `lib/jobs/`), WebSocket real-time via `lib/realtime/`.
> Tasks below represent GAPS beyond what exists.

> Reference: [aura-architecture.md](./aura-architecture.md) v2.0 — Sections on DR/BCP, Event-Driven Architecture, Service Resilience, Caching, Real-time, Workflow Engine, Batch Processing

---

### 5.1 Disaster Recovery & Business Continuity (14 Tasks)

#### 5.1.1 Multi-Region Database Replication

- [ ] Configure PostgreSQL streaming replication to secondary region (RPO < 1 hour)
- [ ] Implement automated failover with Patroni or AWS RDS Multi-AZ
- [ ] Create cross-region read replicas for analytics queries
- [ ] Set up automated database backups with PITR (Point-In-Time Recovery)
- [ ] Implement backup verification cron job (daily restore test to staging)

#### 5.1.2 Failover & Recovery

- [ ] Implement health check endpoints for all microservices (`/healthz`, `/readyz`, `/livez`)
- [ ] Configure DNS-based failover (Route 53 / Azure Traffic Manager)
- [ ] Create runbook for manual failover procedures
- [ ] Implement automated RTO testing (target: < 4 hours)
- [ ] Create data integrity verification scripts post-failover

#### 5.1.3 Backup Strategy

- [ ] Implement tiered backup schedule (hourly incremental, daily full, weekly archive)
- [ ] Configure blob storage backup for documents/attachments (S3 cross-region replication)
- [ ] Implement Redis snapshot + AOF persistence for cache data
- [ ] Create disaster recovery drill schedule (quarterly) with documented procedures

---

### 5.2 Event-Driven Architecture & CQRS (18 Tasks)

#### 5.2.1 Event Bus Infrastructure

- [ ] Set up Kafka/RabbitMQ cluster with HA (3-node minimum)
- [ ] Create `/packages/@aura/events/src/eventBus.ts` - unified event publishing interface
- [ ] Create `/packages/@aura/events/src/eventSchema.ts` - event envelope schema (CloudEvents spec)
- [ ] Implement event serialization/deserialization with Avro or JSON Schema
- [ ] Implement event versioning strategy (schema evolution without breaking consumers)
- [ ] Create dead letter queue (DLQ) for each event topic
- [ ] Implement DLQ monitoring and alerting

#### 5.2.2 Domain Events

- [ ] Define and publish `employee.hired` / `employee.terminated` / `employee.transferred` events
- [ ] Define and publish `payroll.calculated` / `payroll.approved` / `payroll.disbursed` events
- [ ] Define and publish `leave.requested` / `leave.approved` / `leave.cancelled` events
- [ ] Define and publish `attendance.clockIn` / `attendance.clockOut` / `attendance.anomaly` events
- [ ] Define and publish `performance.reviewStarted` / `performance.reviewCompleted` events
- [ ] Define and publish `compliance.violation` / `compliance.resolved` events

#### 5.2.3 CQRS Implementation

- [ ] Create read-optimized materialized views for dashboard analytics
- [ ] Implement event sourcing for audit-critical entities (payroll, leave, compensation)
- [ ] Create event replay mechanism for rebuilding read models
- [ ] Implement eventual consistency monitoring (lag tracking between write and read models)
- [ ] Create saga orchestrator for cross-service transactions (e.g., onboarding saga)

---

### 5.3 Service Resilience & Fault Tolerance (16 Tasks)

#### 5.3.1 Circuit Breaker Pattern

- [ ] Implement circuit breaker for all inter-service HTTP calls (using `opossum` or `cockatiel`)
- [ ] Configure per-service circuit breaker thresholds (failure rate, timeout, half-open attempts)
- [ ] Implement circuit breaker state dashboard (open/closed/half-open per service)
- [ ] Add circuit breaker metrics to Prometheus/Datadog

#### 5.3.2 Retry & Timeout Policies

- [ ] Implement exponential backoff with jitter for all external API calls
- [ ] Configure per-service timeout budgets (total request timeout = sum of downstream timeouts)
- [ ] Implement idempotency keys for all POST/PUT operations (prevent duplicate processing)
- [ ] Create idempotency key store in Redis with TTL

#### 5.3.3 Rate Limiting & Throttling

- [ ] Implement API gateway rate limiting (per tenant, per user, per endpoint)
- [ ] Implement tenant-level resource quotas (max API calls/hour, max storage, max employees)
- [ ] Create rate limit response headers (X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset)
- [ ] Implement adaptive rate limiting (burst allowance with token bucket algorithm)

#### 5.3.4 Graceful Degradation

- [ ] Implement feature flags for graceful feature degradation (LaunchDarkly/Unleash/config-based)
- [ ] Create fallback responses for non-critical service failures (cached data, default values)
- [ ] Implement bulkhead pattern (isolate thread pools per service dependency)
- [ ] Create service dependency map with criticality levels (critical/important/nice-to-have)

---

### 5.4 Caching Strategy (12 Tasks)

#### 5.4.1 Multi-Layer Cache

- [ ] Configure Redis cluster for distributed caching (3-node HA)
- [ ] Implement cache-aside pattern for configuration data (TTL: 5 min)
- [ ] Implement cache-aside for employee profile data (TTL: 2 min, invalidate on update)
- [ ] Implement cache-aside for org chart / hierarchy data (TTL: 10 min)
- [ ] Implement HTTP cache headers (ETag, Cache-Control, Last-Modified) for API responses

#### 5.4.2 Cache Invalidation

- [ ] Implement event-driven cache invalidation (subscribe to domain events → purge cache)
- [ ] Implement tenant-scoped cache keys (prevent cross-tenant cache leakage)
- [ ] Create cache warm-up strategy for critical paths (pre-load on deploy)
- [ ] Implement cache hit/miss ratio monitoring and alerting

#### 5.4.3 Browser & CDN Caching

- [ ] Configure CDN caching for static assets (fonts, images, JS bundles) with immutable headers
- [ ] Implement service worker caching for offline-first PWA support
- [ ] Implement stale-while-revalidate pattern for non-critical API data

---

### 5.5 Batch Processing & Job Queue Architecture (14 Tasks)

#### 5.5.1 Job Queue Infrastructure

- [ ] Configure BullMQ with Redis for production (dedicated Redis instance for job queues)
- [ ] Implement job queue monitoring dashboard (Bull Board or custom admin UI)
- [ ] Create job priority levels (critical: payroll, high: notifications, normal: reports, low: analytics)
- [ ] Implement job concurrency limits per queue (prevent resource exhaustion)
- [ ] Implement dead letter handling for failed jobs (max retries: 3, alert on DLQ)

#### 5.5.2 Payroll Batch Processing

- [ ] Implement multi-tenant payroll batch processor (process all tenants in parallel, employees in batch)
- [ ] Implement payroll calculation checkpointing (resume from last checkpoint on failure)
- [ ] Implement payroll dry-run mode (calculate without persisting, for preview/verification)
- [ ] Implement payroll rollback capability (reverse a processed payroll run)

#### 5.5.3 Scheduled Jobs

- [ ] Implement leave accrual batch job (monthly, with proration logic)
- [ ] Implement probation expiry notification job (daily check, auto-confirm or alert)
- [ ] Implement document expiry scanning job (weekly, flag expiring visas/certifications/contracts)
- [ ] Implement data archival job (archive terminated employees after configurable retention period)
- [ ] Implement exchange rate sync job (daily fetch from ECB/Open Exchange Rates API)

---

### 5.6 Real-Time Architecture Enhancement (8 Tasks)

#### 5.6.1 WebSocket Scaling

- [ ] Implement Redis adapter for Socket.IO (multi-instance WebSocket scaling)
- [ ] Implement connection authentication (JWT validation on WebSocket handshake)
- [ ] Implement room-based subscriptions (per-tenant, per-department, per-team rooms)
- [ ] Implement WebSocket connection monitoring (active connections, memory usage, reconnection rate)

#### 5.6.2 Server-Sent Events (SSE)

- [ ] Implement SSE endpoint for long-running operations (payroll processing progress, import progress)
- [ ] Implement SSE for real-time dashboard metric updates (headcount, attendance live count)
- [ ] Implement connection keepalive and auto-reconnection with exponential backoff
- [ ] Implement SSE message replay (client sends Last-Event-ID, server replays missed events)

---

### 5.7 Workflow Engine Enhancement (10 Tasks)

#### 5.7.1 Production Workflow Engine

- [ ] Implement state machine engine with persistence (store workflow state in DB)
- [ ] Implement parallel execution branches (AND-split/AND-join)
- [ ] Implement conditional branching with expression evaluation (e.g., `employee.tenure > 1 year`)
- [ ] Implement SLA timers (auto-escalate if approval not received within X hours)
- [ ] Implement delegation (auto-delegate to backup approver when primary is on leave)

#### 5.7.2 Pre-Built HCM Workflows

- [ ] Implement configurable onboarding workflow (IT provisioning → document collection → orientation → training)
- [ ] Implement configurable offboarding workflow (exit interview → asset return → access revocation → final settlement)
- [ ] Implement configurable salary revision workflow (manager recommendation → HR review → budget check → approval)
- [ ] Implement configurable grievance workflow (submission → assignment → investigation → resolution → appeal)
- [ ] Implement configurable probation confirmation workflow (manager review → HR review → confirmation/extension/termination)

---

## SECTION 6: MENA/APAC COMPLIANCE (68 Tasks)

> **Backend Audit Note**: Significant compliance backend already exists — `lib/services/compliance/` contains:
> WPS service, GOSI service, Nitaqat service, EOSB calculator, India PF/ESI/TDS services,
> Bahrain/Kuwait/Oman/Qatar compliance services, Saudization service.
> Prisma models include: `WpsFile`, `WpsRecord`, `GosiContribution`, `NitaqatCategory`, `EosbCalculation`,
> plus visa, immigration, and PRO task models. Tasks below are for FULL compliance (edge cases, reporting, validation rules).

> Reference: [03-LABOUR-LAW-COMPLIANCE.md](./hr-gap-analysis/03-LABOUR-LAW-COMPLIANCE.md), [00-EXECUTIVE-SUMMARY.md](./hr-gap-analysis/00-EXECUTIVE-SUMMARY.md)

---

### 6.1 UAE Compliance (20 Tasks)

#### 6.1.1 WPS Integration (P0 — Revenue Blocking)

- [ ] Create `/services/payroll-service/src/integrations/wps/` - WPS module
- [ ] Implement WPS SIF file generation (Standard Information File format)
- [ ] Implement WPS API-driven submission (new Dec 2025 upgrade format)
- [ ] Implement WPS response parsing and reconciliation
- [ ] Create WPS submission dashboard (status tracking, error resolution)
- [ ] Create `POST /api/v1/payroll/wps/generate` - generate WPS file
- [ ] Create `POST /api/v1/payroll/wps/submit` - submit to WPS
- [ ] Create `GET /api/v1/payroll/wps/status` - check submission status
- [ ] Implement WPS validation rules (bank routing, IBAN verification, agent codes)

#### 6.1.2 EOSB Calculator (End of Service Benefits)

- [ ] Implement UAE EOSB calculation engine (21 days/year for first 5 years, 30 days/year thereafter)
- [ ] Implement EOSB for unlimited vs limited contracts
- [ ] Implement EOSB pro-rata for partial years
- [ ] Create EOSB projection report for HR planning
- [ ] Create `GET /api/v1/employees/[id]/eosb/calculate` - calculate EOSB

#### 6.1.3 Emiratisation Tracking

- [ ] Create Emiratisation compliance dashboard (current ratio, target ratio, gap)
- [ ] Implement Emiratisation quota tracking (2% annual increase for 20-49 employees)
- [ ] Implement MOHRE reporting format generation
- [ ] Create alert system for non-compliance risk (threshold warnings)

#### 6.1.4 UAE Labor Law Rules

- [ ] Implement UAE working hours rules (8 hours/day, 48 hours/week, Ramadan reduction)
- [ ] Implement UAE annual leave rules (30 calendar days after 1 year)
- [ ] Implement UAE maternity/paternity leave rules (60 days maternity, 5 days paternity)

---

### 6.2 KSA Compliance (16 Tasks)

#### 6.2.1 GOSI Integration (P0 — Revenue Blocking)

- [ ] Create `/services/payroll-service/src/integrations/gosi/` - GOSI module
- [ ] Implement GOSI contribution calculation (Saudi: 22%, Non-Saudi: 2% employer)
- [ ] Implement GOSI online submission API integration
- [ ] Implement GOSI reconciliation and reporting
- [ ] Create `POST /api/v1/payroll/gosi/calculate` - calculate GOSI contributions
- [ ] Create `POST /api/v1/payroll/gosi/submit` - submit to GOSI
- [ ] Create `GET /api/v1/payroll/gosi/status` - submission status

#### 6.2.2 Saudization (Nitaqat) Tracking

- [ ] Implement Nitaqat zone calculation (Platinum, Green High/Mid/Low, Yellow, Red)
- [ ] Create Saudization compliance dashboard with zone indicator
- [ ] Implement Saudization ratio tracking per entity/branch
- [ ] Create HRSD (Human Resources & Social Development) report generation

#### 6.2.3 KSA Labor Law Rules

- [ ] Implement KSA working hours rules (8 hours/day, 48 hours/week, Ramadan: 6 hours)
- [ ] Implement KSA annual leave rules (21 days after 1 year, 30 days after 5 years)
- [ ] Implement KSA EOSB rules (half month per year for first 5 years, full month thereafter)
- [ ] Implement authenticated employment contract generation (per Oct 2025 requirement)
- [ ] Implement KSA Social Insurance Law calculations (new July 2025 rates)

---

### 6.3 GCC Countries (12 Tasks)

#### 6.3.1 Bahrain

- [ ] Implement SIO (Social Insurance Organization) contribution calculation
- [ ] Implement Bahrain new end-of-service benefit system (Mar 2024)
- [ ] Implement Bahrain labor law rules (work hours, leave entitlements)

#### 6.3.2 Qatar

- [ ] Implement Qatar end-of-service gratuity calculation
- [ ] Implement Qatar WPS file generation
- [ ] Implement Qatar labor law rules (48 hours/week, 3 weeks annual leave)

#### 6.3.3 Oman

- [ ] Implement Oman social security (PASI) contribution calculation
- [ ] Implement Oman EOSB calculation
- [ ] Implement Oman labor law rules (45 hours/week, 30 days annual leave)

#### 6.3.4 Kuwait

- [ ] Implement Kuwait PIFSS (Public Institution for Social Security) calculation
- [ ] Implement Kuwait EOSB calculation
- [ ] Implement Kuwait labor law rules (48 hours/week, 30 days annual leave)

---

### 6.4 India Statutory Compliance (20 Tasks)

#### 6.4.1 PF/ESI/TDS (P0 for India Market)

- [ ] Create `/services/payroll-service/src/integrations/india/` - India compliance module
- [ ] Implement EPF (Employees' Provident Fund) contribution calculation (12% employee + 12% employer)
- [ ] Implement EPF ECR (Electronic Challan cum Return) file generation
- [ ] Implement ESI (Employees' State Insurance) calculation (0.75% employee + 3.25% employer)
- [ ] Implement ESI contribution file generation
- [ ] Implement TDS (Tax Deducted at Source) calculation with old/new tax regime support
- [ ] Implement Form 16 generation (annual tax certificate)
- [ ] Implement Form 24Q filing (quarterly TDS return)
- [ ] Create `POST /api/v1/payroll/india/pf/generate-ecr` - generate PF file
- [ ] Create `POST /api/v1/payroll/india/esi/generate` - generate ESI file
- [ ] Create `POST /api/v1/payroll/india/tds/calculate` - calculate TDS

#### 6.4.2 Professional Tax

- [ ] Implement state-wise professional tax calculation (Maharashtra, Karnataka, etc.)
- [ ] Implement professional tax slab management per state

#### 6.4.3 India New Labour Codes (Active Nov 2025)

- [ ] Implement Code on Wages (minimum wages, payment of wages, bonus)
- [ ] Implement Code on Social Security (PF/ESI consolidated rules)
- [ ] Implement Code on Industrial Relations (standing orders, ID Act, Trade Unions)
- [ ] Implement Code on Occupational Safety (working conditions, health)
- [ ] Implement new wage definition (basic + DA must be >= 50% of CTC)
- [ ] Implement gratuity calculation under new code
- [ ] Implement leave encashment rules under new code

---

## SECTION 7: AI/ML & ADVANCED ANALYTICS (52 Tasks)

> **Backend Audit Note**: AI/ML services already exist — `services/ai-service/` with resume parsing, recommendation,
> and predictive services. `lib/services/ai/` contains: attrition prediction, resume parser, sentiment analysis,
> workforce analytics. Agentic AI framework at `lib/services/agentic-ai/` with hr-agent, recruitment-agent,
> analytics-agent, and agent orchestrator. Tasks below are for ADVANCED capabilities beyond current implementation.

> Reference: [07-AI-ML-STRATEGY.md](./hr-gap-analysis/07-AI-ML-STRATEGY.md), [aura-architecture.md](./aura-architecture.md) v2.0

---

### 7.1 Predictive Analytics Engine (14 Tasks)

#### 7.1.1 Attrition Prediction

- [ ] Create ML pipeline for attrition risk scoring (features: tenure, performance, compensation ratio, skip-level, engagement)
- [ ] Implement attrition risk score per employee (low/medium/high/critical)
- [ ] Create attrition risk dashboard with drill-down by department, manager, location
- [ ] Implement retention recommendation engine (suggest interventions per risk factor)
- [ ] Create `GET /api/v1/analytics/attrition/predict` - get predictions
- [ ] Create `GET /api/v1/analytics/attrition/risk-factors` - top risk factors

#### 7.1.2 Workforce Planning

- [ ] Implement headcount forecasting model (trend analysis + seasonality + growth plans)
- [ ] Implement hiring demand prediction per department/role
- [ ] Implement skills demand forecasting (future skill requirements based on business goals)
- [ ] Create workforce planning scenario builder (what-if analysis: growth, attrition, restructuring)

#### 7.1.3 Performance Prediction

- [ ] Implement performance trend prediction (identify high-potential and at-risk employees)
- [ ] Implement team performance clustering (identify high/low performing teams)
- [ ] Implement promotion readiness scoring
- [ ] Create compensation equity analysis (identify pay gaps across gender, ethnicity, tenure)

---

### 7.2 Agentic AI (18 Tasks)

> Target: Match Darwinbox/Oracle autonomous HR agent capabilities

#### 7.2.1 HR AI Chatbot

- [ ] Create `/apps/web/src/components/ai/AIChatbot.tsx` - floating chat widget
- [ ] Create `/services/ai-service/src/services/chatbotService.ts` - LLM orchestration
- [ ] Implement natural language leave request (e.g., "I need 3 days off next week")
- [ ] Implement natural language policy queries (e.g., "What's the maternity leave policy?")
- [ ] Implement natural language attendance queries (e.g., "What time did I clock in today?")
- [ ] Implement multi-turn conversation with context retention
- [ ] Implement RAG (Retrieval Augmented Generation) over company policies and knowledge base
- [ ] Create `POST /api/v1/ai/chat` - chat endpoint with streaming response

#### 7.2.2 Autonomous HR Agents

- [ ] Implement onboarding agent (auto-trigger tasks, send reminders, track completion)
- [ ] Implement compliance agent (auto-detect expiring documents, trigger renewal workflows)
- [ ] Implement payroll anomaly agent (detect unusual payroll changes, flag for review)
- [ ] Implement attendance anomaly agent (detect unusual patterns, proxy punching, ghost employees)
- [ ] Implement recruitment agent (auto-screen resumes, schedule interviews, send updates)

#### 7.2.3 AI-Powered Document Processing

- [ ] Implement OCR for document verification (passport, visa, ID card extraction)
- [ ] Implement smart document classification (auto-categorize uploaded documents)
- [ ] Implement AI-powered contract analysis (extract key terms, expiry dates, obligations)
- [ ] Implement multilingual document processing (Arabic + English OCR)
- [ ] Create `POST /api/v1/ai/document/process` - document processing endpoint

---

### 7.3 Advanced Analytics (20 Tasks)

#### 7.3.1 Executive Analytics Dashboard

- [ ] Create C-suite dashboard with configurable KPIs (cost per employee, revenue per employee, etc.)
- [ ] Implement org-wide heatmap (performance × engagement × attrition risk)
- [ ] Implement bench strength analysis (succession pipeline depth per critical role)
- [ ] Implement span of control analysis (manager-to-report ratios across org)
- [ ] Implement new hire quality metrics (time to productivity, 90-day retention, manager satisfaction)

#### 7.3.2 Skills Ontology & Semantic Search

- [ ] Implement skills ontology graph (hierarchical skills taxonomy with relationships)
- [ ] Implement semantic skill search (fuzzy matching, synonym resolution — "React" ≈ "ReactJS" ≈ "React.js")
- [ ] Implement skill adjacency recommendations (suggest related skills to learn)
- [ ] Implement skills-based internal mobility matching (match employees to open roles by skill fit)
- [ ] Create `GET /api/v1/skills/search` - semantic skill search endpoint

#### 7.3.3 Compensation Intelligence

- [ ] Implement real-time market compensation data integration (Mercer/Payscale/Glassdoor APIs)
- [ ] Implement pay equity analysis with intersectional demographics
- [ ] Implement total cost of workforce modeling (fully loaded cost projections)
- [ ] Implement compensation scenario modeling (budget impact of across-the-board increases)
- [ ] Create `GET /api/v1/analytics/compensation/equity` - pay equity report

#### 7.3.4 Engagement Analytics

- [ ] Implement pulse survey engine (configurable frequency, anonymous responses)
- [ ] Implement eNPS (Employee Net Promoter Score) tracking and trend analysis
- [ ] Implement sentiment analysis on feedback and survey responses (NLP-based)
- [ ] Implement engagement driver identification (correlation analysis: what drives engagement?)
- [ ] Create `GET /api/v1/analytics/engagement/score` - engagement metrics

---

## SECTION 8: SECURITY, COMPLIANCE & DATA GOVERNANCE (76 Tasks)

> Reference: [aura-architecture.md](./aura-architecture.md) v2.0 — Security Architecture, Data Governance, Secrets Management

---

### 8.1 Advanced Security (18 Tasks)

#### 8.1.1 Authentication Hardening

- [ ] Implement adaptive MFA (risk-based: new device, new location, sensitive operation → require MFA)
- [ ] Implement passwordless authentication option (WebAuthn / FIDO2 passkeys)
- [ ] Implement SSO with SAML 2.0 provider support (Okta, Azure AD, OneLogin)
- [ ] Implement SSO with OpenID Connect provider support
- [ ] Implement session management (concurrent session limits, device tracking, remote logout)
- [ ] Implement brute force protection (account lockout after N failed attempts, progressive delays)

#### 8.1.2 Authorization Enhancement

- [ ] Implement Attribute-Based Access Control (ABAC) in addition to RBAC
- [ ] Implement field-level security (restrict access to sensitive fields like salary, SSN per role)
- [ ] Implement data-level security (employees can only see their own data, managers see team data)
- [ ] Implement API scope-based authorization (OAuth 2.0 scopes per API key)
- [ ] Implement delegation of authority (temporary access grants for acting managers)

#### 8.1.3 Security Monitoring

- [ ] Implement security event logging (SIEM-compatible format: authentication, authorization, data access)
- [ ] Implement anomaly detection for access patterns (unusual login times, bulk data exports)
- [ ] Implement API abuse detection (unusual API call patterns, credential stuffing detection)
- [ ] Create security incident response workflow (auto-lock account → notify security team → investigate)
- [ ] Implement vulnerability scanning pipeline (Snyk/Trivy for dependencies, SonarQube for code)
- [ ] Implement penetration testing schedule (quarterly with documented remediation tracking)
- [ ] Create security compliance dashboard (SOC 2 control status, audit evidence collection)

---

### 8.2 Data Governance & Privacy (20 Tasks)

#### 8.2.1 Data Classification

- [ ] Implement 4-tier data classification (Restricted, Confidential, Internal, Public) in data catalog
- [ ] Tag all database fields with classification level
- [ ] Implement classification-based access controls (Restricted = need-to-know basis only)
- [ ] Create data classification audit report

#### 8.2.2 PII Protection

- [ ] Implement PII field detection and auto-tagging across all models
- [ ] Implement PII encryption at rest for all Restricted fields (AES-256-GCM)
- [ ] Implement PII masking in API responses based on caller role (mask SSN, bank account, etc.)
- [ ] Implement PII masking in log output (prevent PII from appearing in application logs)
- [ ] Implement PII tokenization for external system integrations

#### 8.2.3 GDPR / UAE PDPL / KSA PDPL Compliance

- [ ] Implement Data Subject Access Request (DSAR) workflow and API
- [ ] Implement Right to Erasure (data deletion workflow with cascading cleanup)
- [ ] Implement data portability export (machine-readable employee data export)
- [ ] Implement consent management (track consent for data processing purposes)
- [ ] Implement data processing register (document all processing activities per GDPR Article 30)
- [ ] Implement data retention policies per entity type (configurable per tenant/jurisdiction)
- [ ] Create `POST /api/v1/privacy/dsar` - submit DSAR request
- [ ] Create `GET /api/v1/privacy/export/[employeeId]` - data portability export

#### 8.2.4 Audit Trail

- [ ] Implement immutable audit log for all data changes (who, what, when, before/after values)
- [ ] Implement audit log search and filtering (by user, entity, date range, action type)
- [ ] Implement audit log export in SOC 2 / ISO 27001 compatible format

---

### 8.3 Secrets Management (8 Tasks)

- [ ] Set up HashiCorp Vault (or AWS Secrets Manager / Azure Key Vault) for secrets storage
- [ ] Migrate all hardcoded secrets from environment variables to secrets manager
- [ ] Implement automatic secret rotation for database credentials (90-day cycle)
- [ ] Implement automatic secret rotation for API keys and service tokens
- [ ] Implement secrets access audit logging (who accessed which secret, when)
- [ ] Implement secrets injection into containers at runtime (no secrets in Docker images)
- [ ] Create emergency secret rotation runbook (for incident response)
- [ ] Implement secrets caching with TTL (prevent excessive calls to secrets manager)

---

### 8.4 Multi-Tenancy Hardening (12 Tasks)

#### 8.4.1 Tenant Isolation

- [ ] Implement Row-Level Security (RLS) policies on all PostgreSQL tables
- [ ] Implement tenant context middleware (extract tenantId from JWT, set on every DB query)
- [ ] Implement tenant isolation testing (automated tests verifying no cross-tenant data leakage)
- [ ] Implement tenant-scoped file storage (S3 prefix / separate containers per tenant)
- [ ] Implement tenant-scoped cache keys (Redis namespace per tenant)

#### 8.4.2 Tenant Management

- [ ] Create tenant provisioning workflow (create schema, seed data, configure defaults)
- [ ] Create tenant deprovisioning workflow (data export → archival → cleanup)
- [ ] Implement tenant configuration inheritance (global defaults → tenant overrides)
- [ ] Implement tenant feature flags (enable/disable modules per tenant)
- [ ] Implement tenant resource quotas (max employees, max storage, max API calls)
- [ ] Create tenant health monitoring dashboard (resource usage, error rates per tenant)
- [ ] Implement tenant data migration tools (for tenant mergers/acquisitions)

---

### 8.5 API Security & Governance (18 Tasks)

#### 8.5.1 API Gateway

- [ ] Configure API gateway (Kong / AWS API Gateway) with authentication, rate limiting, logging
- [ ] Implement API versioning strategy (URL-based: `/api/v1/`, `/api/v2/`)
- [ ] Implement API deprecation workflow (sunset headers, migration guides, minimum 6-month notice)
- [ ] Implement request/response validation middleware (JSON Schema validation)
- [ ] Implement request correlation IDs (trace requests across services)

#### 8.5.2 API Documentation

- [ ] Generate OpenAPI 3.0 specification for all endpoints
- [ ] Create interactive API documentation portal (Swagger UI / Redoc)
- [ ] Implement API changelog (track breaking and non-breaking changes)
- [ ] Create API SDK generation pipeline (TypeScript, Python, Java client SDKs)

#### 8.5.3 API Monitoring

- [ ] Implement API latency tracking per endpoint (P50, P95, P99)
- [ ] Implement API error rate monitoring with alerting
- [ ] Implement API usage analytics per tenant and API key
- [ ] Implement API SLA monitoring (99.9% availability target)
- [ ] Create API status page (public-facing service status)

#### 8.5.4 Webhook Security

- [ ] Implement webhook payload signing (HMAC-SHA256 with per-webhook secret)
- [ ] Implement webhook IP whitelisting (optional per webhook)
- [ ] Implement webhook mutual TLS (mTLS) support for enterprise customers
- [ ] Implement webhook replay protection (timestamp validation, nonce tracking)

---

## SECTION 9: DEVOPS, TESTING & OBSERVABILITY (90 Tasks)

> **Backend Audit Note**: Monitoring infrastructure partially exists — `lib/monitoring/` has Sentry integration,
> APM service, query monitor, and performance tracking. Docker/Docker Compose files exist for all 10 microservices.
> OpenAPI/Swagger documentation endpoint exists. However, CI/CD pipelines, comprehensive test suites,
> and SLA/SLO tracking are NOT yet implemented.

> Reference: [aura-architecture.md](./aura-architecture.md) v2.0 — DevOps, CI/CD, Testing Strategy, SLA/SLO/SLI, Monitoring

---

### 9.1 CI/CD Pipeline (16 Tasks)

#### 9.1.1 Build Pipeline

- [ ] Create multi-stage CI pipeline (lint → type-check → unit test → integration test → build → security scan)
- [ ] Implement parallelized test execution (split test suites across CI workers)
- [ ] Implement Docker image building with multi-stage builds (slim production images)
- [ ] Implement container image scanning (Trivy/Snyk for known vulnerabilities)
- [ ] Implement dependency audit in CI (npm audit / pnpm audit on every PR)

#### 9.1.2 Deployment Pipeline

- [ ] Implement blue-green deployment strategy (zero-downtime deployments)
- [ ] Implement canary deployment capability (route 5% → 25% → 100% of traffic)
- [ ] Implement automated rollback on deployment failure (health check failure → instant rollback)
- [ ] Implement database migration safety (backward-compatible migrations, no downtime)
- [ ] Implement environment promotion workflow (dev → staging → UAT → production)

#### 9.1.3 Infrastructure as Code

- [ ] Create Terraform/Pulumi modules for complete infrastructure provisioning
- [ ] Implement infrastructure drift detection (periodic plan comparison)
- [ ] Create separate IaC modules for: networking, databases, compute, monitoring, security
- [ ] Implement environment cloning (create staging from production snapshot)

#### 9.1.4 Release Management

- [ ] Implement semantic versioning with automated changelog generation
- [ ] Implement release branch strategy (release/v1.x, hotfix branches)

---

### 9.2 Testing Strategy (26 Tasks)

#### 9.2.1 Unit Testing

- [ ] Achieve 80%+ code coverage for all backend services
- [ ] Achieve 70%+ code coverage for frontend components (React Testing Library)
- [ ] Implement mutation testing for critical business logic (payroll, EOSB, tax calculations)
- [ ] Create test data factories for each domain entity (employee, payroll, leave, attendance)

#### 9.2.2 Integration Testing

- [ ] Create integration test suite for all API endpoints (supertest + test database)
- [ ] Implement database integration tests with transaction rollback (clean state per test)
- [ ] Implement service-to-service integration tests (verify event publishing/consuming)
- [ ] Create integration tests for all external integrations (WPS, GOSI, PF, ESI) with mocks

#### 9.2.3 End-to-End Testing

- [ ] Set up Playwright for E2E testing infrastructure
- [ ] Create E2E tests for critical user journeys: employee onboarding
- [ ] Create E2E tests for critical user journeys: payroll processing
- [ ] Create E2E tests for critical user journeys: leave request and approval
- [ ] Create E2E tests for critical user journeys: performance review cycle
- [ ] Create E2E tests for critical user journeys: benefits enrollment
- [ ] Implement visual regression testing (Playwright screenshots / Percy)
- [ ] Implement accessibility testing (axe-core integration in E2E suite, WCAG 2.1 AA compliance)

#### 9.2.4 Performance Testing

- [ ] Create load test suite with k6 or Artillery
- [ ] Load test payroll processing (target: 10,000 employees in < 2 hours)
- [ ] Load test API endpoints (target: P95 < 500ms at 1000 concurrent users)
- [ ] Load test WebSocket connections (target: 10,000 concurrent connections)
- [ ] Implement performance regression detection in CI (compare against baseline)

#### 9.2.5 Security Testing

- [ ] Implement OWASP ZAP scanning in CI pipeline (DAST)
- [ ] Implement SAST (static analysis) with SonarQube or Semgrep
- [ ] Create security test cases for OWASP Top 10 (injection, XSS, CSRF, etc.)
- [ ] Implement dependency vulnerability scanning with auto-PR for updates
- [ ] Implement secrets scanning in git history (prevent committed secrets)

---

### 9.3 Observability Stack (22 Tasks)

#### 9.3.1 Distributed Tracing

- [ ] Implement OpenTelemetry SDK across all services
- [ ] Configure trace propagation across HTTP, message queue, and database calls
- [ ] Set up trace backend (Jaeger / Datadog APM / AWS X-Ray)
- [ ] Implement custom span attributes for HCM context (tenantId, employeeId, moduleId)
- [ ] Create trace-based debugging dashboards (slowest endpoints, error traces)

#### 9.3.2 Metrics Collection

- [ ] Implement custom Prometheus metrics for business KPIs (payroll runs/day, leave requests/hour)
- [ ] Implement service-level metrics (request rate, error rate, duration per service)
- [ ] Implement infrastructure metrics collection (CPU, memory, disk, network per container)
- [ ] Create Grafana dashboards for: system health, business metrics, SLA tracking
- [ ] Implement metric-based auto-scaling rules (scale on request rate / queue depth)

#### 9.3.3 Log Management

- [ ] Implement structured JSON logging across all services (timestamp, level, traceId, tenantId, message)
- [ ] Configure log shipping to centralized platform (ELK Stack / Datadog / CloudWatch)
- [ ] Implement log-based alerting for critical errors (5xx spike, unhandled exceptions)
- [ ] Implement log retention policies (hot: 30 days, warm: 90 days, cold: 1 year)
- [ ] Implement PII scrubbing in logs (auto-redact sensitive fields before shipping)

#### 9.3.4 Alerting & Incident Response

- [ ] Define alert rules for all SLOs (error budget burn rate alerting)
- [ ] Configure PagerDuty/Opsgenie integration for critical alerts
- [ ] Implement alert routing (payroll alerts → payroll team, security alerts → security team)
- [ ] Create incident response runbooks for top 10 failure scenarios
- [ ] Implement post-incident review process (blameless postmortems)
- [ ] Create status page integration (Statuspage.io / Instatus) for customer-facing status
- [ ] Implement SLA reporting dashboard (monthly uptime, P95 latency, incident count)

---

### 9.4 SLA/SLO/SLI Definitions (10 Tasks)

#### 9.4.1 Service Level Indicators (SLIs)

- [ ] Define and instrument SLI: API availability (successful responses / total responses)
- [ ] Define and instrument SLI: API latency (P95 response time per endpoint category)
- [ ] Define and instrument SLI: Payroll processing time (end-to-end per employee count)
- [ ] Define and instrument SLI: Data freshness (time between event and read model update)

#### 9.4.2 Service Level Objectives (SLOs)

- [ ] Set SLO: API availability ≥ 99.9% (allows ~43 min downtime/month)
- [ ] Set SLO: API P95 latency ≤ 500ms for read operations
- [ ] Set SLO: API P95 latency ≤ 2000ms for write operations
- [ ] Set SLO: Payroll processing ≤ 2 hours for 10,000 employees

#### 9.4.3 Error Budget & Reporting

- [ ] Implement error budget tracking (remaining downtime budget per month)
- [ ] Create monthly SLA compliance report (auto-generated, per-tenant)

---

### 9.5 Frontend Architecture Hardening (16 Tasks)

#### 9.5.1 Performance Optimization

- [ ] Implement route-based code splitting (dynamic imports for each module page)
- [ ] Implement tree-shaking audit (verify no dead code in production bundles)
- [ ] Implement bundle size monitoring in CI (fail build if bundle exceeds threshold)
- [ ] Implement image optimization pipeline (WebP/AVIF conversion, responsive images)
- [ ] Implement Core Web Vitals monitoring (LCP, FID, CLS) with RUM (Real User Monitoring)

#### 9.5.2 Error Handling

- [ ] Implement global error boundary with user-friendly error pages
- [ ] Implement Sentry or Datadog RUM for frontend error tracking
- [ ] Implement automatic error grouping and alerting
- [ ] Implement retry logic for failed API calls in React Query (with exponential backoff)

#### 9.5.3 Accessibility (WCAG 2.1 AA)

- [ ] Audit and fix all pages for keyboard navigation
- [ ] Audit and fix all pages for screen reader compatibility (ARIA labels, landmarks)
- [ ] Implement high contrast mode support
- [ ] Implement focus management for modals, drawers, and dynamic content
- [ ] Implement skip-to-content links and focus trapping

#### 9.5.4 Internationalization Enhancement

- [ ] Implement full Arabic RTL layout testing across all pages
- [ ] Implement date/time localization (Hijri calendar support for MENA)
- [ ] Implement number formatting localization (Arabic-Indic numerals option)

---

## SECTION 10: GLOBAL HR OPERATIONS — CORE HCM MODULES (124 Tasks)

> Critical enterprise HCM modules missing from v1.0 and v2.0. These are table-stakes features required by every enterprise customer (Workday, SAP SuccessFactors, Oracle HCM, Darwinbox all include these).
>
> **Backend Audit Note**: Partial backend exists for several modules:
>
> - **Position Management**: Prisma models (`Position`, `PositionHistory`) and API routes at `/api/v1/positions/` exist
> - **Exit Management**: Routes at `/api/v1/exit-management/` and models (`ExitInterview`, `ExitChecklist`) exist
> - **Asset Management**: Routes at `/api/v1/asset-management/` and models (`Asset`, `AssetAssignment`) exist
> - **Letter Generation**: `lib/services/letterGeneration/` service and templates exist
> - **Visa/Immigration**: Prisma models (`VisaDetail`, `ImmigrationRecord`, `ProTask`) and compliance services exist
>   Tasks below are for FULL enterprise-grade implementation beyond basic CRUD.

---

### 10.1 Succession Planning & Talent Review (14 Tasks)

#### 10.1.1 Succession Planning UI

- [ ] Create `/apps/web/src/app/dashboard/(modules)/succession-planning/page.tsx`
- [ ] Create `/apps/web/src/components/succession/SuccessionDashboard.tsx` - critical role overview
- [ ] Create `/apps/web/src/components/succession/CriticalRoleIdentifier.tsx` - flag critical positions
- [ ] Create `/apps/web/src/components/succession/SuccessorPool.tsx` - potential successors per role
- [ ] Create `/apps/web/src/components/succession/ReadinessAssessment.tsx` - ready now / 1-2 years / 3+ years
- [ ] Create `/apps/web/src/components/succession/TalentReviewBoard.tsx` - drag-drop 9-box with succession context
- [ ] Create `/apps/web/src/components/succession/DevelopmentPlanBuilder.tsx` - close readiness gaps

#### 10.1.2 Succession APIs & Service

- [ ] Create `/apps/web/src/lib/services/successionService.ts`
- [ ] Create `GET /api/v1/succession/critical-roles` - list critical roles with pipeline depth
- [ ] Create `POST /api/v1/succession/critical-roles` - designate critical role
- [ ] Create `GET /api/v1/succession/pools/[roleId]` - get successor pool for role
- [ ] Create `POST /api/v1/succession/pools/[roleId]/candidates` - add successor candidate
- [ ] Create `GET /api/v1/succession/readiness-report` - org-wide bench strength report
- [ ] Create `/packages/@aura/database/src/seeds/succession-planning.seed.ts` - readiness levels, pipeline templates

---

### 10.2 Organization Management & Position Control (16 Tasks)

#### 10.2.1 Position Management

- [ ] Create `/apps/web/src/app/dashboard/(modules)/position-management/page.tsx`
- [ ] Create `/apps/web/src/components/organization/PositionManager.tsx` - position lifecycle (create/fill/freeze/close)
- [ ] Create `/apps/web/src/components/organization/PositionBudgetTracker.tsx` - budgeted vs filled vs vacant
- [ ] Create `/apps/web/src/components/organization/PositionHistoryTimeline.tsx` - who held this position when
- [ ] Create `/apps/web/src/components/organization/OrgRedesignTool.tsx` - restructure simulator (what-if)
- [ ] Create `/apps/web/src/components/organization/MatrixOrgViewer.tsx` - solid-line + dotted-line reporting

#### 10.2.2 Position APIs

- [ ] Create `/apps/web/src/lib/services/positionService.ts`
- [ ] Create `GET /api/v1/positions` - list positions with status (budgeted/filled/vacant/frozen)
- [ ] Create `POST /api/v1/positions` - create position (requires budget approval)
- [ ] Create `PUT /api/v1/positions/[id]` - update position details
- [ ] Create `POST /api/v1/positions/[id]/freeze` - freeze position (hiring freeze)
- [ ] Create `POST /api/v1/positions/[id]/close` - close position permanently
- [ ] Create `GET /api/v1/positions/vacancy-report` - org-wide vacancy report
- [ ] Create `GET /api/v1/positions/headcount-budget` - budgeted vs actual headcount
- [ ] Add `Position` model to schema.prisma (budgeted, filled_by, department, cost_center, grade)
- [ ] Create `/packages/@aura/database/src/seeds/position-management.seed.ts`

---

### 10.3 Employee Relations & Case Management (14 Tasks)

#### 10.3.1 Case Management UI

- [ ] Create `/apps/web/src/app/dashboard/(modules)/employee-relations/page.tsx`
- [ ] Create `/apps/web/src/components/employee-relations/CaseManagement.tsx` - case list with filters
- [ ] Create `/apps/web/src/components/employee-relations/CaseCreator.tsx` - new case wizard (grievance, disciplinary, investigation)
- [ ] Create `/apps/web/src/components/employee-relations/CaseTimeline.tsx` - chronological case history
- [ ] Create `/apps/web/src/components/employee-relations/DisciplinaryTracker.tsx` - warning levels (verbal → written → final → termination)
- [ ] Create `/apps/web/src/components/employee-relations/InvestigationBoard.tsx` - investigation workflow with evidence
- [ ] Create `/apps/web/src/components/employee-relations/GrievancePortal.tsx` - employee-facing grievance submission

#### 10.3.2 Employee Relations APIs

- [ ] Create `/apps/web/src/lib/services/employeeRelationsService.ts`
- [ ] Create `GET /api/v1/employee-relations/cases` - list cases (filtered by type, status, severity)
- [ ] Create `POST /api/v1/employee-relations/cases` - create case
- [ ] Create `PUT /api/v1/employee-relations/cases/[id]` - update case (add notes, change status)
- [ ] Create `POST /api/v1/employee-relations/cases/[id]/escalate` - escalate case
- [ ] Add `EmployeeRelationsCase`, `CaseNote`, `DisciplinaryAction` models to schema.prisma
- [ ] Create `/packages/@aura/database/src/seeds/employee-relations.seed.ts` - case types, severity levels, escalation rules

---

### 10.4 Global Mobility & Immigration/Visa Management (18 Tasks)

> Critical for MENA market — every GCC customer requires visa/immigration tracking

#### 10.4.1 Visa & Work Permit Management

- [ ] Create `/apps/web/src/app/dashboard/(modules)/immigration/page.tsx`
- [ ] Create `/apps/web/src/components/immigration/VisaDashboard.tsx` - visa status overview with expiry alerts
- [ ] Create `/apps/web/src/components/immigration/VisaTracker.tsx` - per-employee visa lifecycle (new/renew/cancel)
- [ ] Create `/apps/web/src/components/immigration/WorkPermitManager.tsx` - work permit tracking
- [ ] Create `/apps/web/src/components/immigration/DocumentExpiryCalendar.tsx` - calendar of upcoming expirations
- [ ] Create `/apps/web/src/components/immigration/PROTaskBoard.tsx` - PRO (Public Relations Officer) task management
- [ ] Create `/apps/web/src/components/immigration/ExpatriateManager.tsx` - expatriate assignment lifecycle

#### 10.4.2 Immigration APIs

- [ ] Create `/apps/web/src/lib/services/immigrationService.ts`
- [ ] Create `GET /api/v1/immigration/visas` - list all visas with status and expiry
- [ ] Create `POST /api/v1/immigration/visas` - create visa record
- [ ] Create `PUT /api/v1/immigration/visas/[id]` - update visa (renew, cancel)
- [ ] Create `GET /api/v1/immigration/expiring` - list documents expiring in next N days
- [ ] Create `GET /api/v1/immigration/pro-tasks` - list pending PRO tasks
- [ ] Create `POST /api/v1/immigration/pro-tasks` - create PRO task
- [ ] Implement visa expiry reminder job (auto-alert 90/60/30 days before expiry)
- [ ] Add `Visa`, `WorkPermit`, `PROTask`, `ExpatriateAssignment` models to schema.prisma
- [ ] Create `/packages/@aura/database/src/seeds/immigration.seed.ts` - visa types per GCC country, document types
- [ ] Implement MOHRE e-channel integration stub (UAE visa processing)

---

### 10.5 Exit Management & Full Settlement (14 Tasks)

#### 10.5.1 Exit Management UI

- [ ] Create `/apps/web/src/app/dashboard/(modules)/exit-management/page.tsx`
- [ ] Create `/apps/web/src/components/exit/ExitDashboard.tsx` - active separations with status
- [ ] Create `/apps/web/src/components/exit/ResignationPortal.tsx` - employee self-service resignation submission
- [ ] Create `/apps/web/src/components/exit/ExitInterviewForm.tsx` - structured exit interview questionnaire
- [ ] Create `/apps/web/src/components/exit/ExitChecklist.tsx` - clearance checklist (IT, finance, admin, manager)
- [ ] Create `/apps/web/src/components/exit/FullFinalSettlement.tsx` - F&F calculation display
- [ ] Create `/apps/web/src/components/exit/KnowledgeTransferTracker.tsx` - handover task tracking

#### 10.5.2 Exit Management APIs

- [ ] Create `/apps/web/src/lib/services/exitService.ts`
- [ ] Create `POST /api/v1/exit/resign` - submit resignation
- [ ] Create `GET /api/v1/exit/[id]/checklist` - get clearance checklist status
- [ ] Create `PUT /api/v1/exit/[id]/checklist/[itemId]` - mark clearance item complete
- [ ] Create `GET /api/v1/exit/[id]/settlement` - calculate full & final settlement
- [ ] Create `POST /api/v1/exit/[id]/settlement/approve` - approve F&F settlement
- [ ] Add `ExitRequest`, `ExitChecklist`, `ExitInterview`, `FullFinalSettlement` models to schema.prisma
- [ ] Create `/packages/@aura/database/src/seeds/exit-management.seed.ts` - exit reasons, checklist templates, rehire eligibility rules

---

### 10.6 Multi-Entity / Legal Entity Management (10 Tasks)

#### 10.6.1 Legal Entity Management

- [ ] Create `/apps/web/src/app/dashboard/(modules)/legal-entities/page.tsx`
- [ ] Create `/apps/web/src/components/organization/LegalEntityManager.tsx` - entity CRUD with jurisdiction config
- [ ] Create `/apps/web/src/components/organization/InterCompanyTransfer.tsx` - transfer between legal entities
- [ ] Create `/apps/web/src/components/organization/ConsolidatedDashboard.tsx` - cross-entity headcount and cost view

#### 10.6.2 Legal Entity APIs

- [ ] Create `/apps/web/src/lib/services/legalEntityService.ts`
- [ ] Create `GET /api/v1/legal-entities` - list legal entities with jurisdiction info
- [ ] Create `POST /api/v1/legal-entities` - create legal entity
- [ ] Create `POST /api/v1/legal-entities/transfer` - initiate inter-company transfer
- [ ] Create `GET /api/v1/legal-entities/consolidated-report` - cross-entity consolidated report
- [ ] Add `LegalEntity`, `InterCompanyTransfer` models to schema.prisma

---

### 10.7 Letter & Document Generation Engine (12 Tasks)

#### 10.7.1 Template Engine UI

- [ ] Create `/apps/web/src/app/dashboard/(modules)/letter-templates/page.tsx`
- [ ] Create `/apps/web/src/components/letters/LetterTemplateBuilder.tsx` - WYSIWYG template editor with variable placeholders
- [ ] Create `/apps/web/src/components/letters/VariableSelector.tsx` - insert {{employee.name}}, {{salary}}, etc.
- [ ] Create `/apps/web/src/components/letters/BulkLetterGenerator.tsx` - generate letters for multiple employees
- [ ] Create `/apps/web/src/components/letters/LetterPreviewPanel.tsx` - live preview with employee data
- [ ] Create `/apps/web/src/components/letters/DigitalSignatureField.tsx` - authorized signatory e-sign

#### 10.7.2 Letter Generation APIs

- [ ] Create `/apps/web/src/lib/services/letterGenerationService.ts`
- [ ] Create `GET /api/v1/letters/templates` - list letter templates
- [ ] Create `POST /api/v1/letters/templates` - create/update template
- [ ] Create `POST /api/v1/letters/generate` - generate letter for employee (PDF output)
- [ ] Create `POST /api/v1/letters/bulk-generate` - bulk generate for employee list
- [ ] Create `POST /api/v1/letters/[id]/sign` - digitally sign generated letter

---

### 10.8 Asset Management (10 Tasks)

#### 10.8.1 IT & Physical Asset Tracking

- [ ] Create `/apps/web/src/app/dashboard/(modules)/asset-management/page.tsx`
- [ ] Create `/apps/web/src/components/assets/AssetInventory.tsx` - master asset list with status
- [ ] Create `/apps/web/src/components/assets/AssetAssignment.tsx` - assign/reclaim assets to employees
- [ ] Create `/apps/web/src/components/assets/AssetRecoveryChecklist.tsx` - offboarding asset recovery

#### 10.8.2 Asset APIs

- [ ] Create `/apps/web/src/lib/services/assetService.ts`
- [ ] Create `GET /api/v1/assets` - list assets with assignment status
- [ ] Create `POST /api/v1/assets/assign` - assign asset to employee
- [ ] Create `POST /api/v1/assets/reclaim` - reclaim asset (on exit/transfer)
- [ ] Create `GET /api/v1/employees/[id]/assets` - list assets assigned to employee
- [ ] Add `Asset`, `AssetAssignment` models to schema.prisma

---

### 10.9 Policy & Compliance Management (10 Tasks)

#### 10.9.1 Policy Management UI

- [ ] Create `/apps/web/src/app/dashboard/(modules)/policy-management/page.tsx`
- [ ] Create `/apps/web/src/components/policy/PolicyLibrary.tsx` - version-controlled policy documents
- [ ] Create `/apps/web/src/components/policy/PolicyEditor.tsx` - rich text policy editor with versioning
- [ ] Create `/apps/web/src/components/policy/PolicyAcknowledgment.tsx` - employee acknowledgment tracking
- [ ] Create `/apps/web/src/components/policy/ComplianceCalendar.tsx` - regulatory deadlines and filing dates

#### 10.9.2 Policy APIs

- [ ] Create `/apps/web/src/lib/services/policyService.ts`
- [ ] Create `GET /api/v1/policies` - list active policies with version info
- [ ] Create `POST /api/v1/policies` - create/update policy (creates new version)
- [ ] Create `POST /api/v1/policies/[id]/acknowledge` - employee acknowledges policy
- [ ] Create `GET /api/v1/policies/[id]/acknowledgment-status` - acknowledgment completion report

---

### 10.10 Budget & Headcount Planning (6 Tasks)

- [ ] Create `/apps/web/src/components/planning/HeadcountBudgetPlanner.tsx` - annual headcount plan by department
- [ ] Create `/apps/web/src/components/planning/PositionApprovalWorkflow.tsx` - new position request → budget check → approval
- [ ] Create `/apps/web/src/components/planning/VacancyTracker.tsx` - open positions with time-to-fill tracking
- [ ] Create `GET /api/v1/planning/headcount-budget` - budgeted vs actual by department/entity
- [ ] Create `POST /api/v1/planning/position-request` - request new headcount
- [ ] Create `GET /api/v1/planning/vacancy-aging` - vacancy aging report (days open per position)

---

## SECTION 11: ADVANCED PAYROLL ENGINE (48 Tasks)

> Core payroll features missing for enterprise customers. Every production HCM requires these for payroll processing beyond basic salary calculation.

---

### 11.1 Multi-Component Salary Structure (10 Tasks)

#### 11.1.1 Salary Structure Builder

- [ ] Create `/apps/web/src/app/dashboard/(modules)/salary-structures/page.tsx`
- [ ] Create `/apps/web/src/components/payroll/SalaryStructureBuilder.tsx` - define components (basic, HRA, DA, transport, etc.)
- [ ] Create `/apps/web/src/components/payroll/ComponentRuleEngine.tsx` - formula builder per component (% of basic, fixed, slab-based)
- [ ] Create `/apps/web/src/components/payroll/CTCBreakdownSimulator.tsx` - CTC to take-home simulator

#### 11.1.2 Salary Structure APIs

- [ ] Create `/apps/web/src/lib/services/salaryStructureService.ts`
- [ ] Create `GET /api/v1/payroll/salary-structures` - list salary structures
- [ ] Create `POST /api/v1/payroll/salary-structures` - create salary structure with components
- [ ] Create `POST /api/v1/payroll/salary-structures/simulate` - simulate CTC to net pay breakdown
- [ ] Add `SalaryStructure`, `SalaryComponent`, `SalaryComponentRule` models to schema.prisma
- [ ] Create `/packages/@aura/database/src/seeds/salary-structures.seed.ts` - standard structures per country

---

### 11.2 Salary Advance & Loan Management (10 Tasks)

#### 11.2.1 Loan Management UI

- [ ] Create `/apps/web/src/app/dashboard/(modules)/loans/page.tsx`
- [ ] Create `/apps/web/src/components/payroll/LoanApplication.tsx` - employee loan request form
- [ ] Create `/apps/web/src/components/payroll/LoanDashboard.tsx` - active loans, EMI schedule, balance
- [ ] Create `/apps/web/src/components/payroll/SalaryAdvanceRequest.tsx` - quick salary advance request

#### 11.2.2 Loan APIs

- [ ] Create `/apps/web/src/lib/services/loanService.ts`
- [ ] Create `POST /api/v1/payroll/loans/apply` - apply for loan/advance
- [ ] Create `GET /api/v1/payroll/loans` - list active loans with EMI schedule
- [ ] Create `GET /api/v1/payroll/loans/[id]` - loan details with repayment history
- [ ] Create `POST /api/v1/payroll/loans/[id]/close` - early closure/settlement
- [ ] Add `Loan`, `LoanRepayment` models to schema.prisma (loan type, principal, interest, EMI, tenure)

---

### 11.3 Arrears & Retroactive Calculation (8 Tasks)

- [ ] Create `/apps/web/src/components/payroll/ArrearsCalculator.tsx` - calculate arrears for backdated changes
- [ ] Create `/apps/web/src/components/payroll/RetroactiveAdjustment.tsx` - preview and apply retro adjustments
- [ ] Create `POST /api/v1/payroll/arrears/calculate` - calculate arrears for date range
- [ ] Create `POST /api/v1/payroll/arrears/apply` - apply arrears to next payroll run
- [ ] Implement automatic arrears detection (salary revision with effective date in past)
- [ ] Implement arrears tax recalculation (Section 89 relief for India, similar for other jurisdictions)
- [ ] Implement multi-month arrears splitting (distribute across months for tax efficiency)
- [ ] Create arrears audit trail (before/after comparison per component per month)

---

### 11.4 Full & Final Settlement Engine (10 Tasks)

- [ ] Create `/apps/web/src/components/payroll/FullFinalCalculator.tsx` - comprehensive F&F calculation
- [ ] Implement F&F component: unpaid salary (pro-rated to last working day)
- [ ] Implement F&F component: leave encashment (earned leave balance × daily rate)
- [ ] Implement F&F component: EOSB/gratuity calculation (per jurisdiction rules)
- [ ] Implement F&F component: bonus pro-rata (target bonus × months served / 12)
- [ ] Implement F&F component: loan recovery (outstanding loan deduction)
- [ ] Implement F&F component: notice period recovery/waiver
- [ ] Implement F&F component: tax computation on F&F payment
- [ ] Create `POST /api/v1/payroll/full-final/calculate/[employeeId]` - calculate full F&F
- [ ] Create `POST /api/v1/payroll/full-final/process/[employeeId]` - process F&F payment

---

### 11.5 GL Posting & Accounting Integration (10 Tasks)

#### 11.5.1 Journal Entry Generation

- [ ] Create `/apps/web/src/components/payroll/GLPostingDashboard.tsx` - payroll journal entries view
- [ ] Create `/apps/web/src/components/payroll/AccountMappingConfig.tsx` - map salary components to GL accounts
- [ ] Create `/apps/web/src/components/payroll/CostCenterAllocation.tsx` - allocate costs across cost centers

#### 11.5.2 Accounting APIs

- [ ] Create `/apps/web/src/lib/services/glPostingService.ts`
- [ ] Create `POST /api/v1/payroll/gl-entries/generate` - generate journal entries from payroll run
- [ ] Create `GET /api/v1/payroll/gl-entries/[payrollRunId]` - view journal entries for a run
- [ ] Create `POST /api/v1/payroll/gl-entries/export` - export to accounting system (QuickBooks, Xero, SAP, Tally)
- [ ] Create `GET /api/v1/payroll/account-mapping` - get account mapping configuration
- [ ] Create `PUT /api/v1/payroll/account-mapping` - update account mapping
- [ ] Add `GLJournalEntry`, `AccountMapping`, `CostCenterAllocation` models to schema.prisma

---

## SECTION 12: ADVANCED TIME & SHIFT MANAGEMENT (28 Tasks)

> Beyond basic scheduling — features required by manufacturing, healthcare, hospitality, and retail customers

---

### 12.1 Auto-Scheduling Engine (8 Tasks)

- [ ] Create `/apps/web/src/components/scheduling/AutoScheduler.tsx` - constraint-based auto-schedule generator
- [ ] Create `/apps/web/src/components/scheduling/ScheduleConstraints.tsx` - define rules (min rest hours, max consecutive shifts, skill requirements)
- [ ] Create `/apps/web/src/components/scheduling/ScheduleOptimizer.tsx` - optimize for cost, fairness, coverage
- [ ] Create `POST /api/v1/scheduling/auto-generate` - generate optimal schedule
- [ ] Create `POST /api/v1/scheduling/validate` - validate schedule against labor law constraints
- [ ] Implement minimum rest period enforcement (11 hours between shifts — UAE/EU requirement)
- [ ] Implement skill-based scheduling (ensure qualified staff per shift)
- [ ] Implement fairness balancing (equalize undesirable shifts across team)

---

### 12.2 Shift Swap & Open Shift Marketplace (8 Tasks)

- [ ] Create `/apps/web/src/components/scheduling/ShiftSwapPortal.tsx` - request shift swap with colleague
- [ ] Create `/apps/web/src/components/scheduling/OpenShiftBoard.tsx` - unclaimed shifts employees can pick up
- [ ] Create `/apps/web/src/components/scheduling/SwapApproval.tsx` - manager approval for swaps
- [ ] Create `POST /api/v1/scheduling/shift-swap/request` - request shift swap
- [ ] Create `POST /api/v1/scheduling/shift-swap/[id]/approve` - approve swap
- [ ] Create `GET /api/v1/scheduling/open-shifts` - list available open shifts
- [ ] Create `POST /api/v1/scheduling/open-shifts/[id]/claim` - claim open shift
- [ ] Implement swap eligibility validation (skills, certifications, max hours check)

---

### 12.3 Compensatory Off (Comp-Off) Management (6 Tasks)

- [ ] Create `/apps/web/src/components/time-attendance/CompOffManager.tsx` - comp-off balance and request
- [ ] Create `POST /api/v1/attendance/comp-off/earn` - earn comp-off for working on holiday/overtime
- [ ] Create `POST /api/v1/attendance/comp-off/request` - request comp-off leave
- [ ] Create `GET /api/v1/attendance/comp-off/balance` - comp-off balance with expiry dates
- [ ] Implement comp-off auto-credit (work on public holiday → auto-earn 1 comp-off)
- [ ] Implement comp-off expiry (configurable: 30/60/90 days from earn date)

---

### 12.4 Leave Encashment Processing (6 Tasks)

- [ ] Create `/apps/web/src/components/leave/LeaveEncashment.tsx` - encashment request and calculation
- [ ] Create `POST /api/v1/leave/encashment/calculate` - calculate encashment amount
- [ ] Create `POST /api/v1/leave/encashment/request` - submit encashment request
- [ ] Create `POST /api/v1/leave/encashment/process` - process approved encashment (add to payroll)
- [ ] Implement configurable encashment rules per leave type (max days, frequency: annual/exit-only)
- [ ] Implement encashment tax calculation per jurisdiction

---

## SECTION 13: EMPLOYEE ENGAGEMENT & COMMUNICATION (36 Tasks)

> Match SAP Qualtrics, Culture Amp, and Darwinbox Engage capabilities

---

### 13.1 Pulse Survey Engine (12 Tasks)

#### 13.1.1 Survey Builder

- [ ] Create `/apps/web/src/app/dashboard/(modules)/surveys/page.tsx`
- [ ] Create `/apps/web/src/components/surveys/SurveyBuilder.tsx` - drag-drop survey builder
- [ ] Create `/apps/web/src/components/surveys/QuestionLibrary.tsx` - pre-built question bank (engagement, eNPS, pulse)
- [ ] Create `/apps/web/src/components/surveys/SurveyDistributor.tsx` - schedule, audience selection, anonymous toggle
- [ ] Create `/apps/web/src/components/surveys/SurveyResponseView.tsx` - take survey (employee view)
- [ ] Create `/apps/web/src/components/surveys/SurveyAnalytics.tsx` - response analytics with heatmaps

#### 13.1.2 Survey APIs

- [ ] Create `/apps/web/src/lib/services/surveyService.ts`
- [ ] Create `POST /api/v1/surveys` - create survey
- [ ] Create `POST /api/v1/surveys/[id]/distribute` - send survey to audience
- [ ] Create `POST /api/v1/surveys/[id]/respond` - submit response (anonymous option)
- [ ] Create `GET /api/v1/surveys/[id]/analytics` - response analytics and trends
- [ ] Add `Survey`, `SurveyQuestion`, `SurveyResponse` models to schema.prisma

---

### 13.2 eNPS & Engagement Score Tracking (8 Tasks)

- [ ] Create `/apps/web/src/components/engagement/ENPSTracker.tsx` - eNPS score trend over time
- [ ] Create `/apps/web/src/components/engagement/EngagementScorecard.tsx` - department-wise engagement scores
- [ ] Create `/apps/web/src/components/engagement/EngagementDrivers.tsx` - top engagement drivers analysis
- [ ] Create `/apps/web/src/components/engagement/ActionPlanBuilder.tsx` - improvement action plans per department
- [ ] Create `GET /api/v1/engagement/enps` - current eNPS with trend
- [ ] Create `GET /api/v1/engagement/scores` - engagement scores by department/location
- [ ] Create `GET /api/v1/engagement/drivers` - engagement driver analysis
- [ ] Implement automated pulse survey scheduling (configurable: weekly, bi-weekly, monthly)

---

### 13.3 Internal Communication Hub (10 Tasks)

#### 13.3.1 Communication Tools

- [ ] Create `/apps/web/src/components/communication/AnnouncementBoard.tsx` - company-wide announcements with targeting
- [ ] Create `/apps/web/src/components/communication/SuggestionBox.tsx` - anonymous suggestion submission
- [ ] Create `/apps/web/src/components/communication/TownHallManager.tsx` - schedule all-hands, Q&A collection
- [ ] Create `/apps/web/src/components/communication/EmployeeDirectory.tsx` - searchable directory with org context

#### 13.3.2 Communication APIs

- [ ] Create `/apps/web/src/lib/services/communicationService.ts`
- [ ] Create `POST /api/v1/communication/announcements` - post announcement (target by department, location, etc.)
- [ ] Create `GET /api/v1/communication/announcements` - list announcements for employee
- [ ] Create `POST /api/v1/communication/suggestions` - submit anonymous suggestion
- [ ] Create `GET /api/v1/communication/suggestions` - list suggestions (admin view)
- [ ] Add `Announcement`, `Suggestion`, `TownHall` models to schema.prisma

---

### 13.4 Employee Journey & Lifecycle Automation (6 Tasks)

- [ ] Create `/apps/web/src/components/journey/EmployeeJourneyMap.tsx` - visual lifecycle (hire → onboard → perform → grow → exit)
- [ ] Create `/apps/web/src/components/journey/MilestoneTracker.tsx` - auto-trigger actions at milestones (90-day check-in, 1-year anniversary, etc.)
- [ ] Implement automated probation review trigger (N days before probation end)
- [ ] Implement automated work anniversary celebration (notification + recognition)
- [ ] Implement automated birthday greeting workflow
- [ ] Implement new hire 30/60/90 day check-in survey automation

---

## SECTION 14: STATUTORY REPORTS & GOVERNMENT FILINGS (24 Tasks)

> Production-critical: every payroll run must generate correct statutory reports for the jurisdiction

---

### 14.1 UAE Statutory Reports (8 Tasks)

- [ ] Create `/apps/web/src/components/reports/statutory/UAEMOHREReport.tsx` - MOHRE headcount & salary report
- [ ] Create `POST /api/v1/reports/statutory/uae/mohre` - generate MOHRE report
- [ ] Create `POST /api/v1/reports/statutory/uae/wps-reconciliation` - WPS payment reconciliation report
- [ ] Create `POST /api/v1/reports/statutory/uae/eosb-provision` - EOSB provision report (monthly accrual)
- [ ] Create `POST /api/v1/reports/statutory/uae/gratuity-liability` - total gratuity liability report
- [ ] Create `POST /api/v1/reports/statutory/uae/emiratisation` - Emiratisation compliance report
- [ ] Create `POST /api/v1/reports/statutory/uae/labor-cost` - departmental labor cost report
- [ ] Implement report scheduling for recurring statutory filing deadlines

---

### 14.2 KSA Statutory Reports (6 Tasks)

- [ ] Create `POST /api/v1/reports/statutory/ksa/gosi-reconciliation` - GOSI contribution reconciliation
- [ ] Create `POST /api/v1/reports/statutory/ksa/hrsd` - HRSD compliance report
- [ ] Create `POST /api/v1/reports/statutory/ksa/nitaqat` - Nitaqat (Saudization) report
- [ ] Create `POST /api/v1/reports/statutory/ksa/eosb-provision` - KSA EOSB provision report
- [ ] Create `POST /api/v1/reports/statutory/ksa/wage-protection` - KSA Wage Protection System report
- [ ] Implement Mudad platform integration stub (KSA wage protection)

---

### 14.3 India Statutory Reports (10 Tasks)

- [ ] Create `POST /api/v1/reports/statutory/india/form-16` - annual Form 16 generation
- [ ] Create `POST /api/v1/reports/statutory/india/form-24q` - quarterly TDS return
- [ ] Create `POST /api/v1/reports/statutory/india/pf-ecr` - monthly PF ECR file
- [ ] Create `POST /api/v1/reports/statutory/india/esi-return` - half-yearly ESI return
- [ ] Create `POST /api/v1/reports/statutory/india/professional-tax` - monthly PT challan
- [ ] Create `POST /api/v1/reports/statutory/india/form-12ba` - perquisites statement
- [ ] Create `POST /api/v1/reports/statutory/india/gratuity-provision` - gratuity liability report
- [ ] Create `POST /api/v1/reports/statutory/india/shops-establishment` - state-wise compliance report
- [ ] Create `POST /api/v1/reports/statutory/india/bonus-calculation` - statutory bonus calculation report
- [ ] Implement India ITR filing data export (integration with Traces/income tax portal)

---

## SECTION 15: ENTERPRISE MOBILE EXPERIENCE (96 Tasks)

> The v1.0 mobile app (Section 1.11) delivers 8 basic screens. Enterprise customers expect mobile parity with web for all daily-use features. Workday Mobile, Darwinbox Mobile, SAP SuccessFactors Mobile, and BambooHR Mobile all deliver 30+ functional modules on mobile. Current state: 25 screens, 9 services, 1 shared component, 0 custom hooks, 0 tests.

---

### 15.1 Shared Component Library (14 Tasks)

> Currently only 1 component exists (OfflineSync.tsx). 5 component directories are scaffolded but empty.

#### 15.1.1 Common UI Components

- [ ] Create `/apps/mobile/src/components/common/Button.tsx` - primary, secondary, outline, danger, loading states
- [ ] Create `/apps/mobile/src/components/common/Card.tsx` - elevated card with shadow, border variants
- [ ] Create `/apps/mobile/src/components/common/Badge.tsx` - status badges (approved, pending, rejected, etc.)
- [ ] Create `/apps/mobile/src/components/common/Avatar.tsx` - employee photo with fallback initials
- [ ] Create `/apps/mobile/src/components/common/EmptyState.tsx` - illustrated empty state with action button
- [ ] Create `/apps/mobile/src/components/common/LoadingScreen.tsx` - skeleton loaders per screen type
- [ ] Create `/apps/mobile/src/components/common/ErrorBoundary.tsx` - crash boundary with retry and report
- [ ] Create `/apps/mobile/src/components/common/BottomSheet.tsx` - reusable bottom sheet (actions, filters, details)
- [ ] Create `/apps/mobile/src/components/common/SearchBar.tsx` - search input with debounce and recent searches
- [ ] Create `/apps/mobile/src/components/common/StatusTimeline.tsx` - vertical timeline for request/process status

#### 15.1.2 Form Components

- [ ] Create `/apps/mobile/src/components/forms/FormInput.tsx` - text input with validation, error states, RTL
- [ ] Create `/apps/mobile/src/components/forms/FormDatePicker.tsx` - date picker with Hijri calendar support
- [ ] Create `/apps/mobile/src/components/forms/FormDropdown.tsx` - searchable dropdown with multi-select
- [ ] Create `/apps/mobile/src/components/forms/FormFileUpload.tsx` - file/image picker with camera capture

---

### 15.2 Enterprise Mobile Screens — Manager Experience (16 Tasks)

> Managers represent 15-20% of users but drive 80%+ of approvals. Mobile manager experience is critical.

#### 15.2.1 Unified Approval Center (Mobile)

- [ ] Create `/apps/mobile/src/screens/approvals/ApprovalCenterScreen.tsx` - unified multi-type approval list
- [ ] Create `/apps/mobile/src/screens/approvals/ApprovalDetailScreen.tsx` - detailed view with approve/reject/request-info
- [ ] Implement swipe-to-approve/reject gesture on approval cards
- [ ] Implement batch approval (select multiple → approve/reject all)
- [ ] Support approval types: leave, expense, timesheet, requisition, overtime, comp-off, loan, resignation

#### 15.2.2 Team Management (Mobile)

- [ ] Create `/apps/mobile/src/screens/team/TeamDashboardScreen.tsx` - my team overview (who's in, who's out, pending actions)
- [ ] Create `/apps/mobile/src/screens/team/TeamAttendanceScreen.tsx` - team attendance heatmap for today/week
- [ ] Create `/apps/mobile/src/screens/team/TeamLeaveCalendarScreen.tsx` - team leave calendar (who's off when)
- [ ] Create `/apps/mobile/src/screens/team/EmployeeQuickViewScreen.tsx` - employee summary card (role, tenure, leave balance, performance)
- [ ] Add team tab to MainNavigator for manager role (show/hide based on user.role)

#### 15.2.3 Manager Quick Actions

- [ ] Create `/apps/mobile/src/screens/manager/QuickFeedbackScreen.tsx` - give feedback to direct report
- [ ] Create `/apps/mobile/src/screens/manager/OneOnOneNotesScreen.tsx` - 1:1 meeting notes on mobile
- [ ] Create `/apps/mobile/src/screens/manager/RecognitionScreen.tsx` - give kudos/recognition
- [ ] Create `/apps/mobile/src/services/team.service.ts` - team data, approvals, attendance
- [ ] Create `/apps/mobile/src/services/feedback.service.ts` - feedback and recognition
- [ ] Create `/apps/mobile/src/stores/team.store.ts` - team state management

---

### 15.3 Enterprise Mobile Screens — Employee Self-Service (20 Tasks)

> Employees expect to do everything from their phone that they can do on web for daily tasks.

#### 15.3.1 Expense & Reimbursement

- [ ] Create `/apps/mobile/src/screens/expenses/ExpenseSubmitScreen.tsx` - submit expense with receipt photo capture
- [ ] Create `/apps/mobile/src/screens/expenses/ExpenseListScreen.tsx` - expense claim history with status
- [ ] Create `/apps/mobile/src/services/expense.service.ts` - expense submission and tracking
- [ ] Implement camera receipt capture with auto-crop and OCR amount extraction

#### 15.3.2 Documents & Letters

- [ ] Create `/apps/mobile/src/screens/documents/DocumentVaultScreen.tsx` - access all HR documents
- [ ] Create `/apps/mobile/src/screens/documents/PayslipDownloadScreen.tsx` - download payslip PDFs
- [ ] Create `/apps/mobile/src/screens/documents/TaxDocumentsScreen.tsx` - tax documents (Form 16, W-2)
- [ ] Create `/apps/mobile/src/services/document.service.ts` - document listing and download

#### 15.3.3 Benefits

- [ ] Create `/apps/mobile/src/screens/benefits/BenefitsOverviewScreen.tsx` - current benefits summary
- [ ] Create `/apps/mobile/src/screens/benefits/BenefitCardScreen.tsx` - digital benefit ID card
- [ ] Create `/apps/mobile/src/services/benefits.service.ts` - benefits data

#### 15.3.4 Request Hub

- [ ] Create `/apps/mobile/src/screens/requests/RequestHubScreen.tsx` - all request types in one place
- [ ] Create `/apps/mobile/src/screens/requests/OvertimeRequestScreen.tsx` - submit overtime request
- [ ] Create `/apps/mobile/src/screens/requests/CompOffRequestScreen.tsx` - request compensatory off
- [ ] Create `/apps/mobile/src/screens/requests/LoanRequestScreen.tsx` - salary advance/loan request
- [ ] Create `/apps/mobile/src/screens/requests/ResignationScreen.tsx` - self-service resignation submission
- [ ] Create `/apps/mobile/src/screens/requests/AssetRequestScreen.tsx` - request IT/office assets

#### 15.3.5 Company & Social

- [ ] Create `/apps/mobile/src/screens/social/AnnouncementsScreen.tsx` - company announcements feed
- [ ] Create `/apps/mobile/src/screens/social/EventsCalendarScreen.tsx` - company events & holidays
- [ ] Create `/apps/mobile/src/screens/social/RecognitionWallScreen.tsx` - public recognition feed

---

### 15.4 Enterprise Mobile Screens — Specialized (14 Tasks)

#### 15.4.1 Shift Workers

- [ ] Create `/apps/mobile/src/screens/shifts/ShiftScheduleScreen.tsx` - view my shift schedule (week/month)
- [ ] Create `/apps/mobile/src/screens/shifts/ShiftSwapScreen.tsx` - request shift swap with colleagues
- [ ] Create `/apps/mobile/src/screens/shifts/OpenShiftScreen.tsx` - browse and claim open shifts
- [ ] Create `/apps/mobile/src/services/shift.service.ts` - shift schedule and swap

#### 15.4.2 Learning & Development

- [ ] Create `/apps/mobile/src/screens/learning/LearningHomeScreen.tsx` - assigned courses and progress
- [ ] Create `/apps/mobile/src/screens/learning/CoursePlayerScreen.tsx` - video player with progress tracking
- [ ] Create `/apps/mobile/src/screens/learning/QuizScreen.tsx` - take quiz/assessment on mobile
- [ ] Create `/apps/mobile/src/services/learning.service.ts` - learning paths and progress

#### 15.4.3 Surveys & Engagement

- [ ] Create `/apps/mobile/src/screens/surveys/SurveyListScreen.tsx` - pending surveys list
- [ ] Create `/apps/mobile/src/screens/surveys/SurveyResponseScreen.tsx` - take pulse survey on mobile
- [ ] Create `/apps/mobile/src/services/survey.service.ts` - survey data and submission

#### 15.4.4 Visa & Document Alerts (MENA)

- [ ] Create `/apps/mobile/src/screens/immigration/VisaStatusScreen.tsx` - visa/ID expiry status
- [ ] Create `/apps/mobile/src/screens/immigration/DocumentExpiryScreen.tsx` - document renewal alerts
- [ ] Implement push notification for visa/document expiry alerts (90/60/30 day warnings)

---

### 15.5 Mobile Infrastructure Hardening (18 Tasks)

> Current infrastructure has gaps: no hooks, no tests, no crash reporting, no analytics, no force-update.

#### 15.5.1 Custom Hooks

- [ ] Create `/apps/mobile/src/hooks/useAuth.ts` - authentication state and actions
- [ ] Create `/apps/mobile/src/hooks/useLocation.ts` - location tracking with permission handling
- [ ] Create `/apps/mobile/src/hooks/useNetwork.ts` - network status monitoring (online/offline)
- [ ] Create `/apps/mobile/src/hooks/useBiometric.ts` - biometric availability and authentication
- [ ] Create `/apps/mobile/src/hooks/useNotifications.ts` - push notification subscription and handling
- [ ] Create `/apps/mobile/src/hooks/useRefreshOnFocus.ts` - auto-refresh data when screen comes to focus

#### 15.5.2 Security & Compliance

- [ ] Implement app PIN/pattern lock (secondary authentication after biometric)
- [ ] Implement screenshot prevention on sensitive screens (payslip, salary, bank details)
- [ ] Implement root/jailbreak detection (warn or block on compromised devices)
- [ ] Implement certificate pinning for API calls (prevent MITM attacks)
- [ ] Implement session timeout (auto-lock after N minutes of inactivity)
- [ ] Implement secure clipboard handling (clear sensitive data from clipboard after timeout)

#### 15.5.3 App Lifecycle

- [ ] Implement force update mechanism (check min app version against server, block outdated apps)
- [ ] Implement app review prompt (after N positive actions, prompt for App Store/Play Store review)
- [ ] Implement crash reporting integration (Sentry or Firebase Crashlytics)
- [ ] Implement usage analytics (screen views, feature usage per role — privacy-compliant)
- [ ] Implement deep linking for all major screens (navigate directly from email/notification links)
- [ ] Implement app widget support: iOS widget for quick clock-in, Android widget for leave balance

---

### 15.6 Mobile Testing & Quality (8 Tasks)

> Currently 0 test files exist despite Jest being configured.

- [ ] Create unit tests for all 9+ services (API, auth, attendance, leave, payroll, location, notification, offline)
- [ ] Create unit tests for all Zustand stores (auth, theme, team)
- [ ] Create component tests for shared component library (Button, Card, Badge, etc.)
- [ ] Create integration tests for navigation flows (auth flow, main tab flow)
- [ ] Create E2E tests with Detox for critical paths: login → clock in → apply leave → view payslip
- [ ] Implement accessibility testing (screen reader compatibility, touch target sizes, contrast ratios)
- [ ] Implement RTL layout testing for Arabic locale across all screens
- [ ] Implement performance testing (app startup time < 2s, screen transition < 300ms, list scroll 60fps)

---

### 15.7 Mobile Offline & Performance (6 Tasks)

> OfflineSync.tsx exists but offline support needs to cover all critical actions.

- [ ] Implement offline-first data caching for dashboard, leave balance, payslip history (read from cache, sync in background)
- [ ] Implement offline queue for all write operations: leave request, expense submit, feedback, clock-in
- [ ] Implement conflict resolution strategy for offline edits (last-write-wins with user notification)
- [ ] Implement image/receipt compression before upload (reduce bandwidth on slow networks)
- [ ] Implement list virtualization for large datasets (employee directory, approval list, expense history)
- [ ] Implement background sync (sync pending actions when app is in background using expo-background-fetch)

---

## Section 16: ENTERPRISE BACKEND PLATFORM (78 Tasks)

> **Context**: Deep codebase audit reveals 656 API routes, 207 Prisma models, 170+ services, 17 middleware,
> 13 auth modules, and 10 microservices already exist. However, critical enterprise-grade backend platform
> capabilities are missing — these are cross-cutting services that every enterprise module depends on.

---

### 16.1 Bulk Data Operations Framework (10 Tasks)

> Enterprise customers routinely import/export 10,000+ records. No bulk operation framework exists.

- [ ] Create `/apps/web/src/lib/services/bulk/bulkOperationService.ts` - generic bulk pipeline (parse → validate → transform → upsert → report)
- [ ] Create `POST /api/v1/bulk/employees/import` - bulk employee import from CSV/Excel with field mapping UI
- [ ] Create `POST /api/v1/bulk/attendance/import` - bulk attendance import (biometric device exports, CSV)
- [ ] Create `POST /api/v1/bulk/payroll/adjustments` - bulk salary revision, bonus allocation, deduction changes
- [ ] Create `POST /api/v1/bulk/leave/balance-adjustments` - bulk leave balance credit/debit (year-end carry-forward)
- [ ] Create `GET /api/v1/bulk/operations/{id}/status` - async job tracking (progress %, row-level errors, download result)
- [ ] Create `POST /api/v1/bulk/operations/{id}/rollback` - rollback a completed bulk operation (with audit trail)
- [ ] Create `/apps/web/src/lib/services/bulk/csvParser.ts` - streaming CSV parser with encoding detection (UTF-8, Windows-1256 Arabic)
- [ ] Create `/apps/web/src/lib/services/bulk/excelParser.ts` - Excel parser with multi-sheet support and formula evaluation
- [ ] Create `/apps/web/src/lib/services/bulk/validationEngine.ts` - row-level validation with customizable rules per entity type

---

### 16.2 Enterprise Search Infrastructure (8 Tasks)

> Current search is database-backed LIKE/ILIKE. Enterprise customers with 50K+ employees need full-text search.

- [ ] Create `/apps/web/src/lib/services/search/searchService.ts` - search abstraction layer (Elasticsearch/Meilisearch/Typesense)
- [ ] Create `GET /api/v1/search/global` - unified global search across employees, documents, policies, tickets
- [ ] Create `/apps/web/src/lib/services/search/indexingService.ts` - background index sync (Prisma hooks → search engine)
- [ ] Create `GET /api/v1/search/employees` - employee search with fuzzy matching, phonetic search (Arabic/Hindi names)
- [ ] Create `GET /api/v1/search/documents` - document full-text search (PDF/Word content extraction)
- [ ] Create `GET /api/v1/search/facets` - dynamic faceted filters (department, location, status, date range)
- [ ] Create `POST /api/v1/search/saved-filters` - save and share search filter templates per user/role
- [ ] Create `/apps/web/src/lib/services/search/searchAnalytics.ts` - track popular queries, zero-result queries, click-through rates

---

### 16.3 Report Generation Engine (10 Tasks)

> Reports currently render client-side. Enterprise needs async server-side generation for 100K+ row reports.

- [ ] Create `/apps/web/src/lib/services/reports/reportEngine.ts` - async report generation orchestrator
- [ ] Create `/apps/web/src/lib/services/reports/pdfRenderer.ts` - PDF generation (Puppeteer/Playwright) with company branding, headers/footers
- [ ] Create `/apps/web/src/lib/services/reports/excelRenderer.ts` - Excel generation with pivot tables, charts, multi-sheet, conditional formatting
- [ ] Create `POST /api/v1/reports/generate` - trigger async report generation with template ID and parameters
- [ ] Create `GET /api/v1/reports/{id}/status` - poll report generation status (queued → processing → complete/failed)
- [ ] Create `GET /api/v1/reports/{id}/download` - download generated report (signed URL with expiry)
- [ ] Create `POST /api/v1/reports/schedule` - schedule recurring reports (daily headcount, weekly attendance, monthly payroll summary)
- [ ] Create `GET /api/v1/reports/templates` - list available report templates with required parameters
- [ ] Create `POST /api/v1/reports/templates` - create custom report template (select columns, grouping, filters, aggregations)
- [ ] Create `/apps/web/src/lib/services/reports/reportAccessControl.ts` - per-role, per-entity report visibility (managers see only their team)

---

### 16.4 Notification Orchestration Engine (10 Tasks)

> Notification service exists but is basic email only. Enterprise needs multi-channel with preference center.

- [ ] Create `/apps/web/src/lib/services/notifications/orchestrator.ts` - multi-channel delivery orchestrator (email → SMS → push → in-app fallback chain)
- [ ] Create `GET /api/v1/notifications/preferences` - user notification preference center (per-event channel selection)
- [ ] Create `PUT /api/v1/notifications/preferences` - update notification preferences (opt-in/opt-out per channel per event type)
- [ ] Create `/apps/web/src/lib/services/notifications/templateEngine.ts` - notification template engine with i18n (English, Arabic, Hindi)
- [ ] Create `/apps/web/src/lib/services/notifications/smsGateway.ts` - SMS gateway abstraction (Twilio, MessageBird, local providers)
- [ ] Create `/apps/web/src/lib/services/notifications/whatsappService.ts` - WhatsApp Business API integration (payslip delivery, approval notifications)
- [ ] Create `POST /api/v1/notifications/schedule` - scheduled notifications with timezone awareness
- [ ] Create `POST /api/v1/notifications/digest` - daily/weekly digest builder (batch pending approvals, announcements)
- [ ] Create `GET /api/v1/notifications/analytics` - delivery rates, open rates, bounce rates per channel
- [ ] Create `/apps/web/src/lib/services/notifications/escalationService.ts` - auto-escalate unread critical notifications (approval → manager → skip-level)

---

### 16.5 Document Processing Pipeline (8 Tasks)

> File upload exists but no processing pipeline. Enterprise needs OCR, scanning, watermarking.

- [ ] Create `/apps/web/src/lib/services/documents/storageAbstraction.ts` - cloud-agnostic storage (S3/Azure Blob/GCS/MinIO with single interface)
- [ ] Create `/apps/web/src/lib/services/documents/virusScanService.ts` - virus/malware scanning on every upload (ClamAV integration)
- [ ] Create `/apps/web/src/lib/services/documents/ocrService.ts` - OCR pipeline for scanned documents (Tesseract/Google Vision) — extract text for search indexing
- [ ] Create `/apps/web/src/lib/services/documents/watermarkService.ts` - dynamic watermarking on payslips, offer letters, salary certificates (employee name + timestamp)
- [ ] Create `/apps/web/src/lib/services/documents/thumbnailService.ts` - image/PDF thumbnail generation for document vault preview
- [ ] Create `POST /api/v1/documents/signed-url` - pre-signed URL generation with configurable expiry (5 min default)
- [ ] Create `/apps/web/src/lib/services/documents/quotaService.ts` - per-tenant storage quota tracking and enforcement
- [ ] Create `/apps/web/src/lib/services/documents/retentionService.ts` - document retention policy enforcement (auto-archive after N years, legal hold)

---

### 16.6 Audit Trail & Change Data Capture (8 Tasks)

> Basic audit logging exists but no field-level change tracking or compliance export.

- [ ] Create `/apps/web/src/lib/services/audit/auditTrailService.ts` - immutable, append-only audit log (tamper-evident with hash chain)
- [ ] Create `/apps/web/src/lib/middleware/fieldChangeTracker.ts` - Prisma middleware for automatic field-level change tracking on sensitive models
- [ ] Create `GET /api/v1/audit/trail` - search audit logs with filters (entity, user, action, date range, field changed)
- [ ] Create `GET /api/v1/audit/entity/{type}/{id}/history` - complete change history for any entity (who changed what, when, old→new value)
- [ ] Create `POST /api/v1/audit/export` - export audit logs for compliance (SOC 2, ISO 27001 evidence packages)
- [ ] Create `/apps/web/src/lib/services/audit/retentionPolicy.ts` - audit log retention (7 years for payroll, 3 years for general, configurable per regulation)
- [ ] Create `/apps/web/src/lib/services/audit/gdprErasure.ts` - right to erasure implementation (pseudonymize PII in audit trail while preserving action log)
- [ ] Create `/apps/web/src/lib/services/audit/anomalyDetection.ts` - detect suspicious audit patterns (mass data export, bulk deletion, off-hours access)

---

### 16.7 Database Performance & Scalability (8 Tasks)

> 207 Prisma models with 6 migrations. No partitioning, read replicas, or archival strategy.

- [ ] Create `/apps/web/src/lib/database/readReplicaConfig.ts` - read replica routing (analytics/reports → read replica, writes → primary)
- [ ] Create database partitioning strategy for high-volume tables: `attendance_records`, `payroll_transactions`, `audit_logs` (by date/tenant)
- [ ] Create `/apps/web/src/lib/database/queryMonitor.ts` - slow query detection and alerting (queries > 500ms → alert, > 2s → critical)
- [ ] Create `/apps/web/src/lib/database/connectionPoolOptimizer.ts` - dynamic connection pool sizing based on load (PgBouncer or Prisma pool tuning)
- [ ] Create `/apps/web/src/lib/database/migrationStrategy.ts` - zero-downtime migration patterns (expand-contract for schema changes)
- [ ] Create `/apps/web/src/lib/database/dataArchivalService.ts` - move data older than N years to cold storage (archive tables or S3 Parquet)
- [ ] Create `/apps/web/src/lib/database/seedDataManager.ts` - production seed management (reference data versioning, tenant onboarding seeds)
- [ ] Create `/apps/web/src/lib/database/backupVerification.ts` - automated backup verification (restore test to staging, validate row counts weekly)

---

### 16.8 Inter-Service Communication (8 Tasks)

> 10 microservices exist but communicate via HTTP only. Enterprise needs async messaging and saga patterns.

- [ ] Create `/services/shared/src/messaging/messageQueue.ts` - message queue abstraction (RabbitMQ/Amazon SQS/Redis Streams)
- [ ] Create `/services/shared/src/messaging/eventBus.ts` - domain event bus for cross-service events (employee.hired, payroll.processed, leave.approved)
- [ ] Create `/services/shared/src/messaging/sagaOrchestrator.ts` - saga pattern for distributed transactions (e.g., termination: disable access → process F&F → notify → archive)
- [ ] Create `/services/shared/src/grpc/serviceDefinitions.ts` - gRPC protobuf definitions for high-throughput internal calls (payroll calculations, attendance sync)
- [ ] Create `/services/shared/src/discovery/serviceRegistry.ts` - service registry with health checks (Consul/etcd compatible)
- [ ] Create `/services/shared/src/tracing/correlationId.ts` - request correlation ID propagation across all services (for distributed tracing)
- [ ] Create `/services/shared/src/resilience/circuitBreaker.ts` - per-service circuit breaker with configurable thresholds
- [ ] Create `/services/shared/src/messaging/deadLetterQueue.ts` - DLQ handler with retry strategy and alerting on poison messages

---

### 16.9 Configuration & Feature Management (8 Tasks)

> No feature flag system. Enterprise multi-tenant needs per-tenant feature toggles.

- [ ] Create `/apps/web/src/lib/services/config/featureFlagService.ts` - feature flag service (API-compatible with LaunchDarkly/Unleash)
- [ ] Create `GET /api/v1/config/features` - list feature flags with current state per tenant
- [ ] Create `PUT /api/v1/config/features/{flag}` - toggle feature flag (per-tenant or global, with gradual rollout %)
- [ ] Create `/apps/web/src/lib/services/config/runtimeConfig.ts` - runtime configuration management (change without redeploy: payroll cutoff dates, approval thresholds)
- [ ] Create `GET /api/v1/config/tenant/{id}` - tenant-specific configuration (enabled modules, branding, locale defaults)
- [ ] Create `PUT /api/v1/config/tenant/{id}` - update tenant configuration with audit trail
- [ ] Create `/apps/web/src/lib/services/config/configAudit.ts` - configuration change audit trail (who changed what config, when, old→new)
- [ ] Create `/apps/web/src/lib/services/config/abTestingService.ts` - A/B testing framework for UI features (random assignment, metrics tracking)

---

### 16.10 Data Migration & HRMS Import Tools (8 Tasks)

> No tooling for migrating data from other HRMS platforms. Every enterprise deal requires data migration.

- [ ] Create `/apps/web/src/lib/services/migration/migrationOrchestrator.ts` - end-to-end data migration pipeline (extract → map → validate → load → verify)
- [ ] Create `/apps/web/src/lib/services/migration/adapters/workdayAdapter.ts` - Workday data export format parser
- [ ] Create `/apps/web/src/lib/services/migration/adapters/sapAdapter.ts` - SAP SuccessFactors data export format parser
- [ ] Create `/apps/web/src/lib/services/migration/adapters/bambooAdapter.ts` - BambooHR API data extractor
- [ ] Create `/apps/web/src/lib/services/migration/adapters/genericCsvAdapter.ts` - generic CSV/Excel adapter with interactive field mapping
- [ ] Create `/apps/web/src/lib/services/migration/fieldMapper.ts` - intelligent field mapping suggestions (fuzzy match source→target columns)
- [ ] Create `/apps/web/src/lib/services/migration/dataValidator.ts` - pre-migration validation (referential integrity, mandatory fields, duplicate detection)
- [ ] Create `POST /api/v1/migration/dry-run` - dry-run migration (validate and report issues without writing) + `POST /api/v1/migration/execute` (actual migration with rollback support)

---

## Section 17: ENTERPRISE EMPLOYEE SELF-SERVICE APIs (76 Tasks)

> **Context**: Section 2.2 covered 18 basic ESS API tasks (all completed). However, enterprise ESS portals
> (Workday, SAP SuccessFactors, Oracle HCM, Darwinbox) provide 50+ self-service capabilities.
> Deep codebase audit identified critical gaps — expense management is completely absent, there is no
> helpdesk/ticketing, no profile change workflows, no employee directory search, no loan self-service.
> These are table-stakes features for any enterprise deal.

---

### 17.1 Expense & Reimbursement APIs (14 Tasks)

> **Status**: Completely missing — 0 endpoints exist. Every enterprise HCM includes expense management.

- [ ] Create `/apps/web/src/lib/services/expense/expenseService.ts` - expense management service (CRUD, approval, policy enforcement)
- [ ] Create `POST /api/v1/expenses` - submit expense claim (amount, category, date, description, project/cost center)
- [ ] Create `GET /api/v1/expenses` - list my expenses (with filters: status, date range, category, amount range)
- [ ] Create `GET /api/v1/expenses/[id]` - get expense details with receipt images and approval chain
- [ ] Create `PUT /api/v1/expenses/[id]` - update draft expense (before submission)
- [ ] Create `DELETE /api/v1/expenses/[id]` - delete draft expense
- [ ] Create `POST /api/v1/expenses/[id]/submit` - submit for approval (triggers multi-level approval workflow)
- [ ] Create `PUT /api/v1/expenses/[id]/approve` - approve expense (manager/finance)
- [ ] Create `PUT /api/v1/expenses/[id]/reject` - reject with reason
- [ ] Create `POST /api/v1/expenses/receipt-upload` - upload receipt with OCR auto-fill (extract amount, vendor, date from image)
- [ ] Create `GET /api/v1/expenses/policies` - expense policies (per-diem rates, max amounts per category, receipt requirements)
- [ ] Create `POST /api/v1/expenses/mileage` - mileage/kilometer reimbursement claim (distance × rate per company policy)
- [ ] Create `GET /api/v1/expenses/analytics` - personal expense analytics (monthly totals, category breakdown, YTD)
- [ ] Create `/apps/web/src/lib/services/expense/duplicateDetector.ts` - detect duplicate expenses (same amount, date, vendor within N days)

---

### 17.2 Employee Profile Change Request APIs (12 Tasks)

> **Status**: Employee data can be READ but there's no maker-checker workflow for sensitive field changes.
> Enterprise platforms require approval for bank details, address, and personal info changes.

- [ ] Create `/apps/web/src/lib/services/changeRequest/changeRequestService.ts` - generic change request service (any employee field, with approval workflow)
- [ ] Create `POST /api/v1/change-requests` - create change request (field name, old value, new value, supporting documents)
- [ ] Create `GET /api/v1/change-requests` - list my change requests (with filters: status, field, date)
- [ ] Create `GET /api/v1/change-requests/[id]` - request details with approval chain and audit trail
- [ ] Create `PUT /api/v1/change-requests/[id]/approve` - approve change request (HR/manager)
- [ ] Create `PUT /api/v1/change-requests/[id]/reject` - reject with reason
- [ ] Create `POST /api/v1/employees/[id]/bank-details` - bank account change request (IBAN/account number, bank name — requires verification + maker-checker)
- [ ] Create `POST /api/v1/employees/[id]/address` - address change request (with document proof for government compliance — visa address must match)
- [ ] Create `POST /api/v1/employees/[id]/personal-info` - personal info change request (name, marital status, nationality — requires document proof)
- [ ] Create `PUT /api/v1/employees/[id]/contact-preferences` - communication preference management (email/SMS/push opt-in per notification type)
- [ ] Create `PUT /api/v1/employees/[id]/disability-accommodations` - accessibility needs and reasonable accommodation requests (confidential, HR-only visibility)
- [ ] Implement maker-checker workflow for all sensitive field changes (bank details, SSN/CPR/Emirates ID, name change) — dual approval with audit trail

---

### 17.3 IT Service Desk / HR Helpdesk APIs (12 Tasks)

> **Status**: Completely missing — 0 endpoints. Enterprise ESS portals include helpdesk for IT, HR, Payroll, and Facilities requests.

- [ ] Create `/apps/web/src/lib/services/helpdesk/helpdeskService.ts` - helpdesk ticket management service (CRUD, assignment, SLA tracking)
- [ ] Create `POST /api/v1/helpdesk/tickets` - create ticket (category, priority, subject, description, attachments)
- [ ] Create `GET /api/v1/helpdesk/tickets` - list my tickets (with filters: status, category, priority, date range)
- [ ] Create `GET /api/v1/helpdesk/tickets/[id]` - ticket details with full conversation thread and SLA countdown
- [ ] Create `PUT /api/v1/helpdesk/tickets/[id]` - update ticket (add info, change priority)
- [ ] Create `POST /api/v1/helpdesk/tickets/[id]/comments` - add comment/reply to ticket (employee or agent)
- [ ] Create `POST /api/v1/helpdesk/tickets/[id]/close` - close ticket with resolution summary
- [ ] Create `POST /api/v1/helpdesk/tickets/[id]/reopen` - reopen if not resolved
- [ ] Create `GET /api/v1/helpdesk/categories` - ticket categories with sub-categories (IT: hardware/software/access, HR: policy/payroll/benefits, Facilities: workspace/parking/security)
- [ ] Create `GET /api/v1/helpdesk/knowledge-base` - search FAQ/knowledge base articles before creating ticket (deflection)
- [ ] Create `POST /api/v1/helpdesk/tickets/[id]/escalate` - escalate ticket to next tier with reason
- [ ] Create `/apps/web/src/lib/services/helpdesk/slaService.ts` - SLA tracking per category/priority (response time, resolution time, breach alerts)

---

### 17.4 Employee Directory & Org Chart APIs (8 Tasks)

> **Status**: Basic org-chart endpoint exists but no searchable employee directory, no skill-based search, no public profiles.

- [ ] Create `/apps/web/src/lib/services/directory/directoryService.ts` - employee directory service (search, filter, privacy controls)
- [ ] Create `GET /api/v1/directory` - employee directory with search/filters (name, department, location, job title, skills) — respects privacy settings
- [ ] Create `GET /api/v1/directory/search` - fuzzy search across employees (phonetic matching for Arabic/Hindi names, partial name matching)
- [ ] Create `GET /api/v1/directory/[id]/profile` - public profile view (name, title, department, location, contact — only fields employee has made visible)
- [ ] Create `GET /api/v1/org-chart/[departmentId]` - department org chart with drill-down capability
- [ ] Create `GET /api/v1/org-chart/reporting-line/[employeeId]` - full reporting chain (employee → manager → skip-level → CEO)
- [ ] Create `GET /api/v1/directory/birthdays` - upcoming birthdays this week/month (for team celebration — opt-in only)
- [ ] Create `GET /api/v1/directory/work-anniversaries` - upcoming work anniversaries this week/month (for recognition)

---

### 17.5 Salary Advance & Loan Self-Service APIs (8 Tasks)

> **Status**: Completely missing — 0 endpoints. Common in MENA/India HCM platforms.
> Employees regularly request salary advances and company loans (housing, personal, emergency).

- [ ] Create `/apps/web/src/lib/services/loan/loanService.ts` - salary advance and loan management (request, approval, repayment schedule, payroll deduction)
- [ ] Create `POST /api/v1/loans/request` - request salary advance or company loan (type, amount, reason, repayment tenure)
- [ ] Create `GET /api/v1/loans` - list my active loans and advances (outstanding balance, next EMI, remaining tenure)
- [ ] Create `GET /api/v1/loans/[id]` - loan details with full repayment schedule and payment history
- [ ] Create `PUT /api/v1/loans/[id]/approve` - approve loan request (manager → HR → finance multi-level)
- [ ] Create `GET /api/v1/loans/[id]/repayment-schedule` - detailed EMI schedule with principal/interest breakdown
- [ ] Create `POST /api/v1/loans/[id]/prepay` - prepayment request (partial or full early settlement)
- [ ] Create `GET /api/v1/loans/eligibility` - check loan eligibility (based on tenure, salary, existing loans, company policy)

---

### 17.6 Wellness & Health Program APIs (8 Tasks)

> **Status**: Engagement services exist (wellness.service.ts, gamification.service.ts) but no ESS-facing APIs for wellness programs.

- [ ] Create `GET /api/v1/wellness/programs` - available wellness programs (gym subsidy, mental health, smoking cessation, nutrition)
- [ ] Create `POST /api/v1/wellness/programs/[id]/enroll` - enroll in wellness program
- [ ] Create `GET /api/v1/wellness/challenges` - wellness challenges (step challenge, hydration, meditation) with leaderboards
- [ ] Create `POST /api/v1/wellness/challenges/[id]/join` - join wellness challenge
- [ ] Create `POST /api/v1/wellness/challenges/[id]/log` - log daily progress (steps, activity, meals)
- [ ] Create `POST /api/v1/wellness/health-screening/book` - book health screening appointment (annual checkup, eye test, dental)
- [ ] Create `GET /api/v1/wellness/eap` - Employee Assistance Program information and confidential referral request
- [ ] Create `GET /api/v1/wellness/my-dashboard` - personal wellness dashboard (programs enrolled, challenge progress, health screening history)

---

### 17.7 Enhanced Document & Letter Self-Service APIs (8 Tasks)

> **Status**: Letter creation and issuance exist but employees cannot self-request letters.
> No digital signature, no email delivery, no verification QR code on letters.

- [ ] Create `POST /api/v1/letters/request` - employee self-request letter (salary certificate, NOC, experience letter, bank letter, visa letter, employment verification)
- [ ] Create `GET /api/v1/letters/available-types` - list letter types available for self-request per employee role/status
- [ ] Create `POST /api/v1/letters/[id]/digital-sign` - apply digital signature to issued letter (authorized signatory from HR)
- [ ] Create `POST /api/v1/letters/[id]/email-delivery` - email letter to employee or third party (bank, embassy, landlord) with watermark
- [ ] Create `GET /api/v1/letters/[id]/verification` - letter verification endpoint (QR code on letter → verify authenticity with unique code)
- [ ] Create `POST /api/v1/documents/bulk-upload` - bulk document upload (onboarding: passport, visa, degree, photos all at once)
- [ ] Create `POST /api/v1/documents/[id]/share` - share document with HR/manager (employee controls who sees their personal documents)
- [ ] Implement e-signing integration abstraction (`/apps/web/src/lib/services/documents/eSignService.ts` — DocuSign, Adobe Sign, or local provider)

---

### 17.8 ESS Notification & Task Aggregation APIs (6 Tasks)

> **Status**: Notifications exist but no unified task aggregator or combined calendar.
> Enterprise ESS portals show a single "My Tasks" view across all modules.

- [ ] Create `GET /api/v1/my-tasks` - unified pending tasks aggregator (pending approvals, incomplete onboarding tasks, expiring documents, pending training, performance review due, declaration deadlines)
- [ ] Create `GET /api/v1/my-calendar` - combined calendar view (approved leaves, public holidays, upcoming meetings, training sessions, performance review dates, birthday/anniversary reminders)
- [ ] Create `GET /api/v1/announcements` - company-wide announcements with read/unread status and priority levels
- [ ] Create `POST /api/v1/announcements/[id]/acknowledge` - acknowledge mandatory announcement (compliance: policy changes, safety alerts require employee acknowledgment)
- [ ] Create `GET /api/v1/my-summary` - ESS dashboard summary API (leave balance, next paydate, pending tasks count, recent payslip, attendance status today)
- [ ] Create `GET /api/v1/quick-actions` - role-based quick action shortcuts (employee: apply leave, view payslip, request letter; manager: approve pending, view team; HR: onboard, process payroll)

---

## Section 18: ENTERPRISE BENEFITS & INSURANCE APIs (62 Tasks)

> **Context**: Section 2.3 covered 14 basic benefits API tasks (all completed). The codebase has grown to
> 11 API routes, 12 Prisma models, and 12 frontend components (including 1700-line HSA/FSA manager and
> 1600-line retirement dashboard). However, enterprise benefits platforms (Workday Benefits, SAP Benefits,
> Zenefits, Gusto, Benefitfocus) require deeper claims processing, COBRA administration, life insurance
> management, compliance reporting, and provider network integration. These are regulatory requirements
> and deal-breakers for enterprise sales in the US/MENA markets.

---

### 18.1 Benefits Claims Processing APIs (10 Tasks)

> **Status**: BenefitClaim model exists with ICD/CPT codes, but NO claims workflow APIs.
> Enterprise customers need employees to submit claims and track status through adjudication.

- [ ] Create `/apps/web/src/lib/services/benefits/claimsService.ts` - claims processing service (submission, adjudication, payment, appeal)
- [ ] Create `POST /api/v1/benefits/claims` - employee submit claim (service date, provider, amount, diagnosis codes, receipt/EOB upload)
- [ ] Create `GET /api/v1/benefits/claims` - list my claims (with filters: status, date range, plan, provider, amount range)
- [ ] Create `GET /api/v1/benefits/claims/[id]` - claim detail with adjudication breakdown (deductible applied, coinsurance, copay, employee responsibility)
- [ ] Create `PUT /api/v1/benefits/claims/[id]/review` - HR/admin review claim (approve, deny, request additional info)
- [ ] Create `POST /api/v1/benefits/claims/[id]/appeal` - employee appeal a denied claim (reason, supporting documents)
- [ ] Create `GET /api/v1/benefits/claims/eob/[id]` - generate Explanation of Benefits PDF (what was billed, what plan paid, what employee owes)
- [ ] Create `/apps/web/src/lib/services/benefits/adjudicationEngine.ts` - auto-adjudication rules (in-network vs out-of-network, deductible tracking, OOP max enforcement, pre-auth requirements)
- [ ] Create `GET /api/v1/benefits/claims/summary` - claims summary dashboard (YTD claims, deductible progress, OOP max progress, by category)
- [ ] Create `/apps/web/src/lib/services/benefits/coordinationOfBenefits.ts` - COB logic when employee has multiple coverages (primary/secondary payer determination)

---

### 18.2 COBRA / Continuation Coverage APIs (8 Tasks)

> **Status**: Completely missing — 0 implementation. COBRA is a US federal requirement.
> Every US enterprise with 20+ employees MUST offer COBRA. MENA equivalent: end-of-service benefits continuation.

- [ ] Create `/apps/web/src/lib/services/benefits/cobraService.ts` - COBRA administration (eligibility, election, premium tracking, termination)
- [ ] Create `POST /api/v1/benefits/cobra/qualifying-events` - record COBRA qualifying event (termination, hours reduction, death, divorce, Medicare entitlement)
- [ ] Create `GET /api/v1/benefits/cobra/eligible` - list COBRA-eligible employees and dependents with election deadlines
- [ ] Create `POST /api/v1/benefits/cobra/elect` - employee/dependent elects COBRA coverage (within 60-day window)
- [ ] Create `GET /api/v1/benefits/cobra/[id]` - COBRA enrollment details (coverage, premium, payment status, expiration date)
- [ ] Create `POST /api/v1/benefits/cobra/[id]/payment` - record COBRA premium payment (track 30-day grace period)
- [ ] Create `POST /api/v1/benefits/cobra/[id]/terminate` - terminate COBRA coverage (non-payment, max period reached, new coverage obtained)
- [ ] Create `/apps/web/src/lib/services/benefits/cobraNoticeGenerator.ts` - auto-generate COBRA notices (initial notice, election notice, termination notice per DOL requirements)

---

### 18.3 Life Insurance & AD&D APIs (8 Tasks)

> **Status**: BenefitPlan model supports "life" category but no dedicated management.
> Enterprise platforms separate life insurance with beneficiary designation, EOI, salary multiplier calculations.

- [ ] Create `/apps/web/src/lib/services/benefits/lifeInsuranceService.ts` - life insurance management (basic life, supplemental, dependent life, AD&D)
- [ ] Create `GET /api/v1/benefits/life-insurance` - employee's life insurance coverage (basic + supplemental + AD&D, coverage amounts, beneficiaries)
- [ ] Create `POST /api/v1/benefits/life-insurance/supplemental` - enroll/change supplemental life coverage (with salary multiplier options: 1x, 2x, 3x salary)
- [ ] Create `POST /api/v1/benefits/life-insurance/beneficiary` - designate/update beneficiaries (primary + contingent, percentage allocation must total 100%)
- [ ] Create `GET /api/v1/benefits/life-insurance/beneficiary` - view current beneficiary designations with relationship and allocation
- [ ] Create `POST /api/v1/benefits/life-insurance/eoi` - submit Evidence of Insurability for amounts above guaranteed issue (medical questionnaire, approval workflow)
- [ ] Create `GET /api/v1/benefits/life-insurance/imputed-income` - calculate imputed income for employer-paid coverage above $50K (IRS requirement)
- [ ] Create `POST /api/v1/benefits/life-insurance/dependent` - enroll/change dependent life coverage (spouse, children — flat amount options)

---

### 18.4 Benefits Compliance & Tax Reporting APIs (8 Tasks)

> **Status**: No compliance reporting exists. US enterprise requires ACA reporting (1095-B/C),
> ERISA compliance, Section 125 cafeteria plan documentation. MENA requires EOSB benefits reporting.

- [ ] Create `/apps/web/src/lib/services/benefits/complianceService.ts` - benefits compliance engine (ACA, ERISA, HIPAA, Section 125)
- [ ] Create `POST /api/v1/benefits/compliance/aca/generate-1095` - generate IRS Form 1095-B/C for all eligible employees (annual ACA reporting)
- [ ] Create `GET /api/v1/benefits/compliance/aca/status` - ACA compliance dashboard (full-time employees tracked, coverage offer status, affordability test results)
- [ ] Create `POST /api/v1/benefits/compliance/hsa/generate-8889` - generate IRS Form 8889 for HSA contributors (contributions, distributions, excess contributions)
- [ ] Create `GET /api/v1/benefits/compliance/erisa/spd-tracker` - Summary Plan Description distribution tracking (who received, acknowledgment dates)
- [ ] Create `POST /api/v1/benefits/compliance/section-125` - Section 125 cafeteria plan election changes (only on qualifying life events or open enrollment)
- [ ] Create `GET /api/v1/benefits/compliance/audit-report` - benefits compliance audit report (enrollment verification, premium accuracy, eligibility validation)
- [ ] Create `GET /api/v1/benefits/compliance/nondiscrimination` - nondiscrimination testing results (Section 105(h), Section 125, 401(k) ADP/ACP tests)

---

### 18.5 Provider Directory & Care Navigation APIs (8 Tasks)

> **Status**: HealthcareProvider model exists with NPI, specialty, network status, languages, ratings.
> But NO API endpoints expose provider search to employees.

- [ ] Create `GET /api/v1/benefits/providers` - search provider directory (by specialty, location, network status, accepting new patients, language, rating)
- [ ] Create `GET /api/v1/benefits/providers/[id]` - provider detail (address, phone, office hours, network status, patient rating, languages spoken)
- [ ] Create `GET /api/v1/benefits/providers/near-me` - geo-search providers within radius (lat/lng + radius, sorted by distance)
- [ ] Create `GET /api/v1/benefits/care-cost-estimate` - estimate care cost for a procedure (in-network vs out-of-network, based on employee's plan, deductible status)
- [ ] Create `GET /api/v1/benefits/formulary` - prescription drug formulary lookup (drug name → tier, copay, prior auth required, step therapy, quantity limits)
- [ ] Create `GET /api/v1/benefits/telemedicine/providers` - telemedicine provider list with availability and specialties
- [ ] Create `POST /api/v1/benefits/telemedicine/book` - book telemedicine appointment (integrate with virtual visit vendor)
- [ ] Create `GET /api/v1/benefits/network/[planId]` - network summary for a plan (in-network provider count by specialty, coverage area map data)

---

### 18.6 Advanced Eligibility & Dependent Management APIs (10 Tasks)

> **Status**: Eligibility engine supports only 3 rules (waiting period, employment type, hours per week).
> Enterprise needs 10+ rule types. Dependent verification exists in model but no API workflow.

- [ ] Extend eligibility engine with rule type: `age` (minimum/maximum age for plan enrollment)
- [ ] Extend eligibility engine with rule type: `job_classification` (union vs non-union, exempt vs non-exempt)
- [ ] Extend eligibility engine with rule type: `salary_grade` (benefits tier based on pay grade/level)
- [ ] Extend eligibility engine with rule type: `location` (state/country-based plan availability — critical for multi-state/multi-country)
- [ ] Extend eligibility engine with rule type: `probation_status` (no benefits until probation confirmed)
- [ ] Create `POST /api/v1/benefits/dependents/[id]/verify` - dependent verification workflow (upload birth certificate, marriage certificate, student enrollment — status: pending → verified → rejected)
- [ ] Create `GET /api/v1/benefits/dependents/verification-status` - dependent verification dashboard (who needs verification, deadline, missing documents)
- [ ] Create `/apps/web/src/lib/services/benefits/dependentAudit.ts` - dependent audit service (annual dependent eligibility audit — remove ineligible dependents: overage children, divorced spouses)
- [ ] Create `GET /api/v1/benefits/eligibility/matrix` - eligibility matrix view (all plans × all rule types × pass/fail per employee — visual grid for HR)
- [ ] Create `POST /api/v1/benefits/dependents/[id]/student-certification` - annual student status certification for dependent children 19-26 (required for continued coverage)

---

### 18.7 Benefits Analytics & Statement APIs (6 Tasks)

> **Status**: Frontend has analytics in HSAFSAManagement and RetirementDashboard, but no dedicated analytics API.

- [ ] Create `GET /api/v1/benefits/analytics/utilization` - benefits utilization report (enrollment rate by plan, claims per employee, high-cost claimants — anonymized)
- [ ] Create `GET /api/v1/benefits/analytics/cost` - benefits cost analytics (employer cost per employee, trend YoY, cost by plan type, projected renewal rates)
- [ ] Create `POST /api/v1/benefits/statement/generate` - generate Total Benefits Statement PDF for employee (salary + bonus + benefits value + retirement match + PTO value)
- [ ] Create `GET /api/v1/benefits/analytics/enrollment-trends` - enrollment trend analytics (plan popularity, coverage level distribution, opt-out rates, new hire enrollment rates)
- [ ] Create `GET /api/v1/benefits/analytics/wellness-roi` - wellness program ROI (claims reduction, absenteeism impact, participation vs non-participation health costs)
- [ ] Create `GET /api/v1/benefits/analytics/benchmarking` - benefits benchmarking data (compare offering vs industry standards by company size/industry/region)

---

### 18.8 Pension & End-of-Service Benefits APIs (4 Tasks)

> **Status**: EOSB calculator exists for MENA. India PF in Section 6. No general pension/defined benefit tracking.
> MENA customers need gratuity + pension, India needs PF/gratuity, US needs 401k (partially done via RetirementDashboard).

- [ ] Create `GET /api/v1/benefits/pension/projection` - pension/gratuity projection (years of service × last salary × multiplier per country regulation)
- [ ] Create `GET /api/v1/benefits/pension/statement` - pension statement (accrued benefit, vested amount, projected retirement income, early retirement penalty)
- [ ] Create `POST /api/v1/benefits/retirement/contribution-change` - API for 401k/pension contribution rate change (validate against IRS limits: $23,500 for 2025, $31,000 with catch-up)
- [ ] Create `GET /api/v1/benefits/retirement/vesting-status` - detailed vesting status (vested %, cliff/graded schedule, next vesting milestone date, forfeitable amount)

---

## Section 19: ENTERPRISE PAYROLL ENGINE APIs (42 Tasks)

> **Audit Context**: Codebase has 38 payroll API routes, 14 Prisma models, 951-line enhanced PayrollService, multi-country support (7 countries), statutory compliance (PF/ESI/TDS/GOSI/WPS).
> **Gap Analysis**: Missing global payroll operations, pay equity analysis, advanced commission/tip/shift differential engine, payroll integration hub, and SOX-level compliance controls.
> **Benchmarked Against**: ADP Workforce Now, Ceridian Dayforce, Workday Payroll, SAP SuccessFactors, Ramco, greytHR.

---

### 19.1 Global Payroll Operations APIs (10 Tasks)

> **Status**: Current system supports 7 countries individually. No global payroll consolidation, simulation, or multi-currency processing.
> ADP GlobalView and Ceridian Dayforce Global both offer consolidated multi-country payroll with FX conversion.

- [ ] Create `POST /api/v1/payroll/global/run` - global payroll orchestrator (trigger payroll across multiple countries/entities simultaneously, parallel processing, unified status dashboard)
- [ ] Create `GET /api/v1/payroll/global/consolidation` - global payroll consolidation (aggregate payroll costs across countries, convert to reporting currency, intercompany cost allocation)
- [ ] Create `POST /api/v1/payroll/simulation` - payroll what-if simulation (model salary changes, new hires, terminations, tax law changes before processing — no actual payslip generation)
- [ ] Create `POST /api/v1/payroll/reversal` - payroll reversal/void (reverse a processed payrun, generate reversal journal entries, recalculate affected statutory payments, handle partial reversals)
- [ ] Create `POST /api/v1/payroll/costing` - payroll cost allocation engine (allocate payroll costs to cost centers, projects, GL accounts — support split allocation by percentage or hours)
- [ ] Create `GET /api/v1/payroll/calendar` - global payroll calendar (pay periods, cutoff dates, processing windows, bank holidays by country — export to ICS/Google Calendar)
- [ ] Create `POST /api/v1/payroll/fx-conversion` - multi-currency FX processing (daily/monthly FX rates, source rates from ECB/OANDA, lock rates for pay period, variance tracking)
- [ ] Create `POST /api/v1/payroll/earned-wage-access` - earned wage access (EWA) / on-demand pay (calculate available earned wages, process early disbursement, deduct from next payroll — like DailyPay/Earnin)
- [ ] Create `GET /api/v1/payroll/country-adapter/[countryCode]` - country-specific payroll adapter configuration (tax tables, statutory rates, rounding rules, pay component mapping per jurisdiction)
- [ ] Create `POST /api/v1/payroll/data-export` - payroll data export (generate ADP format, Ceridian format, SAP format, generic CSV/XML — for external payroll provider handoff)

---

### 19.2 Pay Equity & Compensation Analytics APIs (8 Tasks)

> **Status**: SalaryBenchmarking component exists (40KB). No backend pay equity analysis engine.
> US Pay Transparency laws (CA SB 1162, CO EPEWA, NY Pay Transparency) require pay range disclosure and equity analysis.
> EU Pay Transparency Directive (2023/970) mandates gender pay gap reporting for 100+ employee companies by 2026.

- [ ] Create `GET /api/v1/payroll/pay-equity/analysis` - pay equity analysis engine (gender, race, age, disability pay gap analysis using regression, controlling for job level, location, tenure, performance)
- [ ] Create `GET /api/v1/payroll/pay-equity/eeoc-report` - EEOC/OFCCP compliance report (Component-1 EEO data, compensation by job category and demographics, adverse impact analysis)
- [ ] Create `GET /api/v1/payroll/pay-equity/band-violations` - pay band violation detection (employees below min or above max of their grade, compression alerts, inversion detection between levels)
- [ ] Create `GET /api/v1/payroll/pay-equity/compa-ratio` - compa-ratio analysis by demographics (compa-ratio distribution by gender/ethnicity/age, highlight statistically significant disparities)
- [ ] Create `GET /api/v1/payroll/pay-equity/range-penetration` - salary range penetration analytics (quartile placement analysis, time-in-range progression, identify employees stuck at bottom of range)
- [ ] Create `POST /api/v1/payroll/pay-equity/market-data-import` - market data integration (import from Mercer, Radford, Payscale, Salary.com — map to internal job codes, aging factors, geo differentials)
- [ ] Create `GET /api/v1/payroll/pay-equity/executive-comp` - executive compensation report (SEC proxy table format, total comp vs peer group, say-on-pay analysis, CEO-to-median-worker ratio)
- [ ] Create `GET /api/v1/payroll/pay-equity/transparency-compliance` - pay transparency compliance (US state-by-state requirements, EU directive status, job posting salary range validation, audit trail)

---

### 19.3 Advanced Deduction & Earnings Engine APIs (8 Tasks)

> **Status**: Basic garnishments exist with priority ordering. No commission engine, tip management, shift differential, or workers' comp.
> ADP and Ceridian both support 200+ earning/deduction types with complex calculation rules.

- [ ] Create `POST /api/v1/payroll/commission/calculate` - commission calculation engine (tiered rates, accelerators, draws, clawbacks, team splits, quota attainment — support monthly/quarterly/annual cycles)
- [ ] Create `POST /api/v1/payroll/tips/process` - tip management & tip credit (tip pooling rules, tip credit calculation per FLSA, cash vs credit card tips, auto-gratuity handling for hospitality/F&B)
- [ ] Create `POST /api/v1/payroll/shift-differential` - shift differential pay rules engine (night/weekend/holiday premium calculations, configurable rates by shift type/day/location, overlap handling)
- [ ] Create `POST /api/v1/payroll/per-diem` - per diem & travel pay (GSA rates by city, taxable vs non-taxable portions, partial day calculations, substantiation rules, international per diem)
- [ ] Create `POST /api/v1/payroll/workers-comp/premium` - workers' compensation premium calculation (experience mod rate, classification codes, payroll-based premium, audit-ready reporting)
- [ ] Create `GET /api/v1/payroll/union-dues` - union dues & collective bargaining deductions (CBA rule engine, initiation fees, monthly dues, special assessments, agency shop fees)
- [ ] Create `POST /api/v1/payroll/garnishment/multi-jurisdiction` - multi-jurisdiction garnishment priority engine (federal vs state priority rules, Consumer Credit Protection Act limits, disposable earnings calculation, simultaneous order handling)
- [ ] Create `GET /api/v1/payroll/deduction-management` - voluntary deduction management portal (employee-configurable deductions, loan repayments, charity, stock purchase, parking/transit — with start/stop/change workflows)

---

### 19.4 Payroll Integration Hub APIs (8 Tasks)

> **Status**: Bank file generation (NEFT format) exists. No connectors to external payroll/accounting systems.
> Enterprise customers need payroll data flowing to ERP (SAP, Oracle), accounting (QuickBooks, Xero), banking (ACH/SWIFT/SEPA), and government portals.

- [ ] Create `POST /api/v1/payroll/integration/gl-journal` - GL journal posting (generate journal entries for SAP, Oracle Financials, QuickBooks, Xero, NetSuite — configurable GL account mapping per pay component)
- [ ] Create `POST /api/v1/payroll/integration/bank-file/generate` - multi-format bank file generation (ACH/NACHA for US, SWIFT MT103 for international, SEPA SCT for EU, WPS SIF for UAE, NEFT/RTGS for India — with validation)
- [ ] Create `POST /api/v1/payroll/integration/adp-connector` - ADP payroll connector (import/export employee data, pay data, tax data — ADP SmartCompliance format, REST API integration)
- [ ] Create `POST /api/v1/payroll/integration/benefits-remittance` - benefits carrier premium remittance (generate carrier-specific remittance files, reconcile premiums vs deductions, handle retroactive adjustments)
- [ ] Create `POST /api/v1/payroll/integration/time-import` - time & attendance data pipeline (import approved timesheets, map to pay codes, handle exceptions, calculate overtime per jurisdiction rules)
- [ ] Create `POST /api/v1/payroll/integration/government-filing` - government portal e-filing (e-file W2/941/940 to SSA/IRS, GOSI to Saudi portal, WPS to UAE, PF/ESI to Indian portals — with acknowledgment tracking)
- [ ] Create `POST /api/v1/payroll/integration/open-banking` - open banking payment initiation (initiate salary payments via PSD2/Open Banking APIs, real-time payment status, failed payment retry logic)
- [ ] Create `GET /api/v1/payroll/integration/connector-health` - integration connector health dashboard (status of all active connectors, last sync timestamps, error rates, retry queues, data validation results)

---

### 19.5 Payroll Audit & Compliance APIs (8 Tasks)

> **Status**: Basic audit logging exists. No SOX-level payroll controls, variance analysis, or compliance testing.
> Enterprise customers (especially publicly traded) need SOX-compliant payroll controls and comprehensive audit trails.

- [ ] Create `GET /api/v1/payroll/audit/sox-controls` - SOX payroll control testing (segregation of duties verification, access control review, payroll change authorization audit, processing control validation)
- [ ] Create `GET /api/v1/payroll/audit/variance-analysis` - payroll variance analysis & anomaly detection (period-over-period variance by employee/department, flag outliers >10% change, new/terminated employee impact, ML-based anomaly scoring)
- [ ] Create `GET /api/v1/payroll/audit/duplicate-detection` - duplicate payment detection (identify potential duplicate payments across pay periods, same amount/same employee/close dates, bank account mismatches)
- [ ] Create `POST /api/v1/payroll/audit/reconciliation` - automated payroll reconciliation (compare calculated vs processed vs paid amounts, bank statement reconciliation, statutory payment matching, exception workflow)
- [ ] Create `GET /api/v1/payroll/audit/jurisdiction-compliance` - multi-jurisdiction compliance engine (minimum wage validation by location, overtime rule validation, meal/rest break compliance, predictive scheduling)
- [ ] Create `POST /api/v1/payroll/audit/report-generate` - payroll audit report generator (generate SOX evidence packages, create reconciliation reports, produce statutory compliance certificates, export to PDF/Excel)
- [ ] Create `GET /api/v1/payroll/audit/internal-controls` - internal controls documentation (control matrix, risk assessment, testing schedule, finding tracker, remediation status — COSO framework alignment)
- [ ] Create `GET /api/v1/payroll/audit/change-history` - comprehensive payroll change history (every salary change, deduction modification, tax form update — with before/after values, approver, timestamp, IP address)

---

## Section 20: ENTERPRISE RECRUITMENT & TALENT ACQUISITION APIs (48 Tasks)

> **Audit Context**: Codebase has 43 recruitment API routes, 17 Prisma models, 20 React components (11,973 lines), AI-powered RecruitmentAgentService (965 lines), video interview room, e-signature portal, 14 onboarding routes.
> **Gap Analysis**: Missing talent CRM/nurturing, job board syndication, assessment platform integrations, DEI analytics, internal mobility, recruiting operations/budget tracking.
> **Benchmarked Against**: Greenhouse, Lever, iCIMS, Workday Recruiting, SmartRecruiters, Ashby, Gem.

---

### 20.1 Talent CRM & Pipeline Nurturing APIs (10 Tasks)

> **Status**: Candidate model exists but is application-centric. No passive candidate tracking, nurture campaigns, or talent communities.
> Gem, Beamery, and Phenom all provide talent CRM. Greenhouse has CRM add-on. This is table stakes for enterprise recruiting.

- [ ] Create `POST /api/v1/recruitment/talent-pool` - talent pool management (create pools by skill/role/location, add passive candidates, track engagement score, pool size analytics)
- [ ] Create `POST /api/v1/recruitment/talent-pool/nurture-campaign` - candidate nurture campaigns (drip email sequences, trigger-based follow-ups, content personalization, open/click tracking, A/B testing)
- [ ] Create `GET /api/v1/recruitment/talent-pool/community` - talent community portal (public-facing talent community registration, interest-based groups, event invitations, job alert subscriptions)
- [ ] Create `GET /api/v1/recruitment/talent-pool/[id]/engagement-score` - candidate relationship scoring (engagement recency, email opens, event attendance, application history, referral connections — decay over time)
- [ ] Create `POST /api/v1/recruitment/talent-pool/re-engage` - re-engagement automation (identify cold candidates, trigger re-engagement campaigns, "new roles matching your profile" notifications)
- [ ] Create `GET /api/v1/recruitment/source-attribution` - candidate source attribution analytics (first-touch vs last-touch vs multi-touch attribution, source quality ranking, cost-per-qualified-candidate by channel)
- [ ] Create `GET /api/v1/recruitment/talent-pipeline/forecast` - talent pipeline forecasting (predict time-to-fill by role type, identify pipeline gaps, recommend sourcing effort needed, seasonal hiring patterns)
- [ ] Create `POST /api/v1/recruitment/candidate/enrich` - candidate profile enrichment (pull data from LinkedIn, GitHub, Stack Overflow — with consent, enrich skills, verify employment history, add social profiles)
- [ ] Create `POST /api/v1/recruitment/candidate/consent` - candidate consent & preference center (GDPR consent management, communication preferences, data retention opt-in/out, right to erasure requests)
- [ ] Create `POST /api/v1/recruitment/talent-pool/silver-medalist` - silver medalist tracking & reactivation (tag runner-up candidates, auto-notify when matching roles open, fast-track application for known candidates)

---

### 20.2 Job Distribution & Employer Branding APIs (8 Tasks)

> **Status**: Career site config endpoint exists but no job board syndication.
> SmartRecruiters, Lever, and Greenhouse all provide one-click multi-board posting. This is expected by every recruiting team.

- [ ] Create `POST /api/v1/recruitment/job-distribution/syndicate` - multi-channel job board syndication (push to Indeed, LinkedIn, Glassdoor, ZipRecruiter, Monster, Google for Jobs — HRXML/JSON-LD format, per-board budget allocation)
- [ ] Create `POST /api/v1/recruitment/career-site/builder` - career site builder (drag-and-drop page builder, branded templates, team spotlight sections, office photos, culture videos, benefits highlights)
- [ ] Create `POST /api/v1/recruitment/employer-brand/content` - employer brand content management (employee testimonials, team culture posts, awards/certifications, Glassdoor review responses, social proof)
- [ ] Create `GET /api/v1/recruitment/job-distribution/analytics` - job ad performance analytics (impressions, clicks, applies, cost-per-click, cost-per-application by board, apply conversion rate, best-performing copy)
- [ ] Create `GET /api/v1/recruitment/job-distribution/cost-per-hire` - cost-per-hire by channel tracking (total spend by source, source-to-hire conversion, ROI per channel, budget utilization, recommended reallocation)
- [ ] Create `POST /api/v1/recruitment/job-posting/seo-optimize` - SEO-optimized job listings (generate schema.org JobPosting markup, keyword optimization, mobile-friendly formatting, Google for Jobs compliance)
- [ ] Create `POST /api/v1/recruitment/social-recruiting/campaign` - social media recruiting campaigns (LinkedIn sponsored posts, Facebook/Instagram job ads, employee advocacy sharing, campaign ROI tracking)
- [ ] Create `POST /api/v1/recruitment/career-site/testimonials` - employee testimonial & video integration (record/upload video testimonials, day-in-the-life content, team culture showcase, auto-embed on career site)

---

### 20.3 Advanced Assessment & Selection APIs (8 Tasks)

> **Status**: Assessment model exists. AI candidate matching (1,238-line component) with scoring algorithm. No external assessment platform integration.
> Greenhouse and Lever both integrate with HackerRank, Codility, HireVue, TestGorilla. Structured scorecards are standard.

- [ ] Create `POST /api/v1/recruitment/assessment/platform-integration` - assessment platform integration (HackerRank, Codility, HireVue, TestGorilla, Criteria Corp — auto-send assessments at pipeline stage, pull results back)
- [ ] Create `POST /api/v1/recruitment/interview/scorecard-template` - structured interview scorecard templates (per-role rubrics, competency-based questions, rating scales, must-have vs nice-to-have criteria, calibrated anchors)
- [ ] Create `POST /api/v1/recruitment/interview/calibration` - interview calibration tools (calibrate interviewers against gold-standard candidates, inter-rater reliability scoring, bias detection, training recommendations)
- [ ] Create `POST /api/v1/recruitment/interview/debrief` - panel debrief & consensus scoring (structured debrief form, individual scores → group discussion → final recommendation, dissent tracking, hire committee workflow)
- [ ] Create `POST /api/v1/recruitment/assessment/builder` - skills-based assessment builder (create custom assessments with question bank, time limits, coding challenges, case studies, auto-grading with rubrics)
- [ ] Create `POST /api/v1/recruitment/reference-check/automated` - automated reference checking (send reference questionnaires via email, structured feedback collection, summarize across references, fraud detection)
- [ ] Create `POST /api/v1/recruitment/assessment/cognitive-personality` - cognitive & personality assessment integration (Hogan, DISC, Predictive Index, CliftonStrengths — consent workflow, results interpretation, role fit mapping)
- [ ] Create `GET /api/v1/recruitment/assessment/analytics` - assessment analytics & validity tracking (predictive validity of each assessment vs on-job performance, adverse impact analysis, assessment completion rates, time-to-complete)

---

### 20.4 Diversity, Equity & Inclusion (DEI) in Hiring APIs (8 Tasks)

> **Status**: Compliance settings exist (GDPR, EEO flag). No DEI analytics, blind screening, or adverse impact analysis.
> US EEOC requires EEO-1 reporting. OFCCP mandates adverse impact tracking. EU mandates gender balance reporting. India mandates PwD tracking.

- [ ] Create `GET /api/v1/recruitment/dei/eeo-1-report` - EEO-1 report generation (Component 1 data by job category, race, ethnicity, sex — export in EEOC e-file format, historical trend analysis)
- [ ] Create `GET /api/v1/recruitment/dei/pipeline-diversity` - diversity pipeline analytics dashboard (funnel breakdown by gender/ethnicity/veteran/disability at each stage, identify drop-off points, benchmark vs goals)
- [ ] Create `POST /api/v1/recruitment/dei/blind-screening` - blind resume screening mode (redact name, gender indicators, university names, photos, age — configurable redaction rules per organization policy)
- [ ] Create `POST /api/v1/recruitment/dei/job-description-analyzer` - inclusive job description analyzer (flag gendered language, exclusionary requirements, readability score, suggest inclusive alternatives — powered by NLP)
- [ ] Create `POST /api/v1/recruitment/dei/diverse-slate` - diverse slate requirements enforcement (Rooney Rule / Mansfield Rule compliance, minimum diverse candidate threshold per requisition, automatic alerts, waiver workflow)
- [ ] Create `POST /api/v1/recruitment/dei/accommodation-request` - accommodation request management (candidate accessibility needs, interview accommodation tracking, ADA compliance, follow-up documentation)
- [ ] Create `GET /api/v1/recruitment/dei/metrics` - DEI metrics & goal tracking (diversity hiring rate by department/role, representation vs availability, goal attainment, year-over-year improvement trends)
- [ ] Create `GET /api/v1/recruitment/dei/adverse-impact` - adverse impact analysis (4/5ths rule calculation at each pipeline stage, statistically significant disparities, remediation recommendations, litigation risk scoring)

---

### 20.5 Internal Mobility & Rehire APIs (6 Tasks)

> **Status**: No internal mobility features found. No rehire eligibility management.
> Workday and Oracle HCM both have internal talent marketplace. This is critical for retention and reducing external hiring costs.

- [ ] Create `GET /api/v1/recruitment/internal-marketplace` - internal job marketplace (internal-only job postings, employee eligibility rules — min tenure/performance, manager visibility/approval, confidential browsing mode)
- [ ] Create `POST /api/v1/recruitment/internal-transfer` - internal transfer workflow (transfer request, manager-to-manager negotiation, comp adjustment, transition timeline, knowledge handoff checklist)
- [ ] Create `GET /api/v1/recruitment/rehire/eligibility/[employeeId]` - rehire eligibility management (check exit reason, blacklist status, final rating, clearance status, no-rehire flags, manager override capability)
- [ ] Create `GET /api/v1/recruitment/gig-marketplace` - gig/project marketplace (short-term internal projects, cross-functional rotation opportunities, skill development gigs, manager-posted assignments)
- [ ] Create `GET /api/v1/recruitment/career-path/suggestions/[employeeId]` - career path suggestions (based on skills, interests, performance trajectory, available internal openings — AI-powered next-role recommendations)
- [ ] Create `POST /api/v1/recruitment/internal-candidate/priority` - internal candidate priority routing (auto-flag internal applicants, priority review SLA, manager notification, internal-first policy enforcement)

---

### 20.6 Recruitment Operations & Analytics APIs (8 Tasks)

> **Status**: Basic recruitment analytics endpoint exists. RecruitmentAgentService has pipeline analytics. No budget tracking, vendor management, or SLA enforcement.
> Enterprise recruiting teams need operational metrics, budget control, and agency management.

- [ ] Create `GET /api/v1/recruitment/operations/budget` - recruiting spend & budget tracking (budget by department/requisition, actual vs planned spend, cost-per-hire breakdown, vendor invoicing, forecast remaining budget)
- [ ] Create `POST /api/v1/recruitment/operations/agency-portal` - agency/vendor portal & fee management (agency submission portal, fee schedules, placement tracking, invoice management, agency performance scorecard)
- [ ] Create `GET /api/v1/recruitment/operations/sla` - SLA management & time-to-fill targets (define SLA by role type/level, track actual vs target, escalation triggers, aging requisition alerts, bottleneck identification)
- [ ] Create `POST /api/v1/recruitment/offers/approval-workflow` - offer approval workflow engine (multi-level approvals based on comp band/level/equity, automatic routing, delegation, out-of-band comp exception escalation)
- [ ] Create `GET /api/v1/recruitment/offers/benchmarking` - offer benchmarking against market data (compare proposed offer vs market percentile, internal equity check, total comp comparison, counter-offer guidance)
- [ ] Create `POST /api/v1/recruitment/candidate-experience/survey` - candidate experience surveys (NPS at each stage, post-interview feedback, post-rejection survey, Glassdoor review request, sentiment analysis)
- [ ] Create `GET /api/v1/recruitment/operations/capacity-planning` - recruiting capacity planning (recruiter workload, req-to-recruiter ratio, interview load per hiring manager, predicted hiring velocity, team bandwidth forecast)
- [ ] Create `GET /api/v1/recruitment/analytics/funnel-conversion` - recruitment funnel conversion analytics (stage-by-stage conversion rates, drop-off analysis, source quality comparison, time-in-stage distribution, offer acceptance rate trend)

---

## Section 21: ENTERPRISE LEARNING & DEVELOPMENT APIs (46 Tasks)

> **Audit Context**: Codebase has 34 L&D API routes, 33+ Prisma models (including full competency library schema), 15 frontend components (7,000 lines), AI-powered recommendations, quiz engine, video player, competency framework with gap analysis.
> **Gap Analysis**: Missing SCORM/xAPI runtime, learning experience platform (LXP), compliance training engine, external content integrations, gamification, training ROI analytics, virtual classroom.
> **Benchmarked Against**: Cornerstone OnDemand, Docebo, Workday Learning, SAP SuccessFactors Learning, TalentLMS, Absorb LMS, 360Learning.

---

### 21.1 SCORM/xAPI Content Runtime APIs (8 Tasks)

> **Status**: Course model exists with modules and content types. No SCORM/xAPI runtime or content packaging support.
> Cornerstone and Docebo both support SCORM 1.2, SCORM 2004, xAPI (Tin Can), cmi5, and AICC natively. Enterprise L&D teams require this for 3rd-party content compatibility.

- [ ] Create `POST /api/v1/learning/content/scorm/upload` - SCORM package upload & hosting (accept SCORM 1.2 and 2004 ZIP packages, extract manifest, validate structure, host content assets, register with LMS)
- [ ] Create `POST /api/v1/learning/content/scorm/launch/[courseId]` - SCORM runtime launcher (initialize SCORM API, handle SetValue/GetValue calls, cmi.core tracking, session bookmark, completion/success status)
- [ ] Create `POST /api/v1/learning/content/xapi/statements` - xAPI Learning Record Store (LRS) (receive xAPI statements in JSON-LD format, validate actor/verb/object, store immutable records, support Statement Forwarding)
- [ ] Create `GET /api/v1/learning/content/xapi/statements` - xAPI statement query (filter by agent, verb, activity, time range — ADL specification compliant, support pagination with more token)
- [ ] Create `POST /api/v1/learning/content/validate` - content package validation (validate SCORM manifest, check required files, verify content structure, report errors/warnings before publish)
- [ ] Create `POST /api/v1/learning/content/version` - content version management (track versions per course, compare completion rates across versions, rollback capability, A/B test different versions)
- [ ] Create `GET /api/v1/learning/content/[id]/bookmark` - bookmark & resume tracking (save learner position per content type — video timestamp, page number, quiz question — multi-device sync via server state)
- [ ] Create `POST /api/v1/learning/content/cmi5/launch` - cmi5 content integration (next-gen xAPI profile for LMS-launched content, session management, moveOn criteria, satisfied statement tracking)

---

### 21.2 Learning Experience Platform (LXP) APIs (8 Tasks)

> **Status**: AILearningRecommendations component exists (850 lines). No social learning, user-generated content, or content curation features.
> Degreed, EdCast, and Cornerstone Xplor are LXP leaders. Social learning and user-generated content are key differentiators for knowledge-driven organizations.

- [ ] Create `GET /api/v1/learning/lxp/feed` - AI-curated learning feed (personalized content stream based on role, skills, interests, peer activity, trending topics — Netflix-style recommendation with category lanes)
- [ ] Create `POST /api/v1/learning/lxp/social/post` - social learning posts (comments, likes, shares on courses, discussion forums per learning path, Q&A threads, mentor responses — notification integration)
- [ ] Create `POST /api/v1/learning/lxp/ugc/create` - user-generated content (employees create articles, record videos, build playlists, share resources — moderation workflow, quality rating, featured content)
- [ ] Create `POST /api/v1/learning/lxp/curation/external` - external content curation (curate articles, videos, podcasts from web — auto-tag with skills, summarize with AI, add to learning paths)
- [ ] Create `POST /api/v1/learning/lxp/playlist` - learning playlists & collections (create themed playlists mixing internal/external content, share with team, collaborative playlists, clone & customize)
- [ ] Create `GET /api/v1/learning/lxp/peer-recommendations` - peer recommendations (surface "people like you also learned" content, team trending, department popular, manager recommended — collaborative filtering)
- [ ] Create `POST /api/v1/learning/lxp/taxonomy` - content tagging & taxonomy (skill-based taxonomy, auto-tag content using NLP, custom tags, topic clustering, knowledge graph of content relationships)
- [ ] Create `GET /api/v1/learning/lxp/trending` - trending content algorithms (time-weighted engagement scoring, viral coefficient, completion rate boost, freshness factor — configurable algorithm weights)

---

### 21.3 Compliance Training Engine APIs (8 Tasks)

> **Status**: Industry-specific training routes exist (aviation, manufacturing, health & safety). No mandatory training assignment engine or regulatory compliance tracking.
> SOX, HIPAA, OSHA, GDPR, anti-harassment, data privacy — every enterprise needs automated compliance training. Cornerstone and SAP SuccessFactors both have robust compliance training management.

- [ ] Create `POST /api/v1/learning/compliance/rule` - mandatory training assignment rules (auto-assign training on hire, role change, promotion, annual recurrence — rule engine with conditions: department, role, location, grade)
- [ ] Create `POST /api/v1/learning/compliance/auto-assign` - auto-assign engine trigger (execute rules on employee events: onboarding, transfer, promotion, new regulation — batch assign with deadline calculation)
- [ ] Create `GET /api/v1/learning/compliance/tracker` - regulatory compliance tracker (SOX, HIPAA, OSHA, GDPR, anti-harassment by jurisdiction — completion %, overdue count, risk score per regulation)
- [ ] Create `POST /api/v1/learning/compliance/deadline-enforce` - training deadline enforcement & escalation (progressive reminders: 7d, 3d, 1d, overdue — escalation to manager, HR, skip-level, automatic access restriction for critical compliance)
- [ ] Create `POST /api/v1/learning/compliance/recertification` - recertification reminder engine (track certification expiry, auto-schedule recertification courses, grace period management, lapse notification chain)
- [ ] Create `GET /api/v1/learning/compliance/audit-report` - compliance audit report (auditor-ready report: who completed what, when, score, certificate — export PDF/Excel, filter by regulation/department/period)
- [ ] Create `POST /api/v1/learning/compliance/certificate/auto-generate` - auto-generate completion certificates (template-based PDF generation with QR verification code, digital signature, unique certificate ID, blockchain hash optional)
- [ ] Create `POST /api/v1/learning/compliance/manager-escalation` - manager notification for non-compliance (dashboard showing team compliance status, overdue training, risk employees — automated weekly digest email)

---

### 21.4 External Content Integration APIs (6 Tasks)

> **Status**: ExternalContentIntegration component exists (80 lines stub). No actual integrations with LinkedIn Learning, Udemy, Coursera, or other content providers.
> Enterprise L&D teams already have LinkedIn Learning, Udemy Business, or Coursera subscriptions. Integration is table stakes for an enterprise LMS.

- [ ] Create `POST /api/v1/learning/integration/linkedin-learning` - LinkedIn Learning catalog sync (OAuth integration, catalog import via API, SSO launch, completion tracking callback, content search within AuraOS)
- [ ] Create `POST /api/v1/learning/integration/udemy-business` - Udemy Business integration (API key auth, course catalog sync, user provisioning, progress sync, custom learning path with Udemy courses)
- [ ] Create `POST /api/v1/learning/integration/coursera` - Coursera for Business connector (enterprise API integration, program assignment, completion certificate import, grade sync)
- [ ] Create `POST /api/v1/learning/integration/generic-lti` - LTI 1.3 tool integration (Learning Tools Interoperability standard, launch external tools, grade passback, deep linking — works with any LTI-compliant tool)
- [ ] Create `GET /api/v1/learning/integration/content-aggregation` - content aggregation dashboard (unified catalog across internal + all external providers, de-duplicate, unified search, cost tracking per provider)
- [ ] Create `POST /api/v1/learning/integration/sso-launch` - SSO launch & progress tracking (SAML/OIDC-based SSO to external platforms, track time spent, capture completion events, unified transcript)

---

### 21.5 Gamification & Engagement APIs (8 Tasks)

> **Status**: PathProgress component has streak counter and badges. No backend gamification engine.
> Docebo and TalentLMS both have gamification. Points, badges, and leaderboards increase course completion rates by 40-60%.

- [ ] Create `POST /api/v1/learning/gamification/points` - points system engine (award points for: course completion, quiz score, streak maintenance, peer help, content creation — configurable point values per activity type)
- [ ] Create `POST /api/v1/learning/gamification/badge/award` - badge & achievement system (define badge criteria, auto-award on trigger, badge gallery, rare badge tracking, shareable badges with Open Badges v3.0 standard)
- [ ] Create `GET /api/v1/learning/gamification/leaderboard` - leaderboards (team, department, organization, global — weekly/monthly/all-time, configurable ranking algorithm, opt-out for privacy)
- [ ] Create `POST /api/v1/learning/gamification/challenge` - learning challenges & competitions (time-bound challenges, team vs team, individual goals, prize integration, challenge templates)
- [ ] Create `POST /api/v1/learning/gamification/streak` - learning streaks & habits (daily/weekly streak tracking, streak freeze tokens, personalized reminders, streak milestones with bonus points)
- [ ] Create `POST /api/v1/learning/micro-learning/module` - micro-learning modules (5-minute bite-sized lessons, spaced repetition scheduling, mobile-first format, push notification delivery, flashcard-style review)
- [ ] Create `POST /api/v1/learning/gamification/social-recognition` - social recognition for learning (shout-outs for completions, skill badge sharing to company feed, peer endorsements, manager kudos)
- [ ] Create `GET /api/v1/learning/gamification/rewards-catalog` - rewards catalog (redeem points for: company swag, extra PTO, gift cards, charity donations, learning budget credits — configurable per tenant)

---

### 21.6 Learning Analytics & ROI APIs (8 Tasks)

> **Status**: Basic learning analytics endpoint exists (completion rates, top courses). No ROI measurement or skill improvement correlation.
> Workday Learning and Cornerstone both provide training ROI. CLOs need data showing learning → performance → business impact.

- [ ] Create `GET /api/v1/learning/analytics/roi` - training ROI measurement engine (cost per training hour, cost per completion, productivity impact estimate, performance improvement correlation, turnover reduction attribution)
- [ ] Create `GET /api/v1/learning/analytics/skill-improvement` - skill improvement correlation (pre/post assessment comparison, skill rating change over time, gap closure rate, time-to-competency by learning path)
- [ ] Create `GET /api/v1/learning/analytics/path-effectiveness` - learning path effectiveness scoring (completion rate, avg time, assessment scores, learner satisfaction, on-job application rating — ranked by business impact)
- [ ] Create `GET /api/v1/learning/analytics/budget` - L&D budget utilization tracking (budget allocation by department/category, spend vs plan, cost per learner, external content costs, instructor costs, venue costs)
- [ ] Create `GET /api/v1/learning/analytics/time-to-competency` - time-to-competency metrics (from enrollment to proficiency by role/skill, benchmark against industry, identify fast-track patterns, optimize path sequencing)
- [ ] Create `GET /api/v1/learning/analytics/manager-dashboard` - manager team learning dashboard (team completion status, overdue training, skill coverage map, recommended actions, comparative team benchmarks)
- [ ] Create `GET /api/v1/learning/analytics/content-effectiveness` - content effectiveness analytics (engagement metrics per content type, drop-off analysis, A/B test results, learner feedback sentiment, revision recommendations)
- [ ] Create `GET /api/v1/learning/analytics/succession-readiness` - succession-linked learning (connect learning completion to succession pipeline readiness, leadership development progress, high-potential development tracking)

---

## Section 22: ENTERPRISE TIME & ATTENDANCE APIs (40 Tasks)

> **Audit Context**: Codebase has 98+ API routes (~11,000 lines), 21 Prisma models, 10+ services (2,800 lines), full shift/leave/overtime management, geofencing, biometrics, field force tracking, Ramadan shifts, scheduling microservice, RabbitMQ queue, AI leave forecasting.
> **Gap Analysis**: Missing AI-powered auto-scheduling, predictive scheduling law compliance, FMLA tracking, FLSA engine, workforce analytics dashboard, union/CBA rule engine, advanced biometric with liveness detection.
> **Benchmarked Against**: UKG (Kronos), ADP Workforce Now, Ceridian Dayforce, Replicon, Deputy, When I Work, Humanity.

---

### 22.1 AI-Powered Scheduling Engine APIs (8 Tasks)

> **Status**: VisualScheduleBuilder component exists. Shift management with rosters, assignments, and swap requests. No AI/ML-driven auto-scheduling or optimization.
> UKG (Kronos) and Ceridian Dayforce both have AI-driven workforce scheduling. Deputy and When I Work offer demand-based auto-scheduling.

- [ ] Create `POST /api/v1/attendance/scheduling/auto-generate` - AI auto-schedule generation (forecast demand from historical patterns + events + seasonality, optimize for: minimum cost, maximum coverage, fair distribution, skill requirements, employee preferences)
- [ ] Create `POST /api/v1/attendance/scheduling/demand-forecast` - demand forecasting engine (time-series analysis of historical foot traffic, sales volume, call volume — integrate weather, events, holidays for adjustment factors)
- [ ] Create `POST /api/v1/attendance/scheduling/fatigue-check` - fatigue management rules (maximum consecutive hours, mandatory rest periods between shifts, weekly hour caps, clopening prevention — per jurisdiction rules)
- [ ] Create `POST /api/v1/attendance/scheduling/skill-match` - skill-based shift assignment (match shift requirements to employee skills/certifications, handle minimum staffing by skill type, cross-training utilization)
- [ ] Create `GET /api/v1/attendance/scheduling/fairness-score` - fair scheduling metrics (equitable distribution of preferred/unpreferred shifts, weekend rotation fairness, overtime distribution, holiday assignment balance)
- [ ] Create `POST /api/v1/attendance/scheduling/preference-collect` - schedule preference collection (employee availability submission, shift preferences, blackout dates, preferred hours, recurring patterns — optimization input)
- [ ] Create `POST /api/v1/attendance/scheduling/what-if` - schedule what-if scenario modeling (model impact of: adding headcount, reducing hours, changing shift patterns, seasonal adjustments — cost/coverage simulation)
- [ ] Create `POST /api/v1/attendance/scheduling/business-demand` - business demand data integration (import POS data, call center volume, patient census, production orders — correlate with staffing needs)

---

### 22.2 Advanced Labor Compliance Engine APIs (8 Tasks)

> **Status**: LabourLawService exists for country-specific regulations. Break compliance tracker. No predictive scheduling law or FLSA engine.
> US has 10+ cities/states with predictive scheduling laws. EU Working Time Directive, India Shops & Establishments Act, UAE Labour Law all have complex rules.

- [ ] Create `GET /api/v1/attendance/compliance/predictive-scheduling` - predictive scheduling law compliance (SF Fair Scheduling, NYC Fair Workweek, OR SB 828, Chicago, Seattle, Philadelphia — advance notice requirements, right-to-rest, schedule change penalties)
- [ ] Create `POST /api/v1/attendance/compliance/flsa-check` - FLSA compliance engine (exempt vs non-exempt classification, salary basis test, duties test, overtime eligibility, minimum wage by jurisdiction, tip credit calculation)
- [ ] Create `GET /api/v1/attendance/compliance/international` - international labor law rules (EU Working Time Directive: 48-hour max, 11-hour rest; India: Shops & Establishments Act; UAE Labour Law: 8-hour day, Friday rest; MENA: prayer time breaks)
- [ ] Create `GET /api/v1/attendance/compliance/pay-rules` - pay rule library per jurisdiction (overtime calculation variants: daily OT, weekly OT, 7th-day premium, double-time, holiday premium — by state/country with effective dates)
- [ ] Create `GET /api/v1/attendance/compliance/meal-rest-break` - meal & rest break compliance (CA 30-min meal/10-min rest, WA, MA, OR rules — auto-detect violations, calculate premium pay for missed breaks)
- [ ] Create `GET /api/v1/attendance/compliance/clopening` - clopening protection (minimum time between shifts: 10-11 hours depending on jurisdiction, auto-flag violations, schedule penalty calculation)
- [ ] Create `GET /api/v1/attendance/compliance/child-labor` - child labor hour restrictions (age-based work hour limits by state, school-day vs non-school-day, prohibited hazardous work, work permit tracking)
- [ ] Create `GET /api/v1/attendance/compliance/overtime-rules` - overtime rules engine (daily OT: CA, AK, NV, CO; weekly OT: federal FLSA; bi-weekly: some CBA; 7th consecutive day: CA; pyramiding prevention — by jurisdiction)

---

### 22.3 Workforce Analytics & Real-Time Dashboard APIs (8 Tasks)

> **Status**: Attendance stats and anomaly detection exist. AI leave forecasting. No comprehensive workforce analytics dashboard.
> UKG InTouch and ADP Workforce Now provide real-time workforce dashboards. This is the command center for operations managers.

- [ ] Create `GET /api/v1/attendance/analytics/realtime-dashboard` - real-time headcount dashboard (present, absent, late, WFH, on-leave, on-field — by department/location/shift, auto-refresh, configurable alerts for understaffing)
- [ ] Create `GET /api/v1/attendance/analytics/absence-cost` - absence cost analysis (direct costs: replacement labor, overtime backfill; indirect costs: productivity loss, manager time — annualized per employee/department, benchmark vs industry)
- [ ] Create `GET /api/v1/attendance/analytics/labor-utilization` - labor utilization metrics (productive hours / available hours, billable %, idle time analysis, overstaffing/understaffing detection, optimal staffing recommendations)
- [ ] Create `GET /api/v1/attendance/analytics/overtime-forecast` - overtime trend analysis & cost forecasting (trend by department/role, predict next month cost, identify chronic OT departments, recommend headcount changes)
- [ ] Create `GET /api/v1/attendance/analytics/department-benchmark` - department comparison benchmarks (attendance rate, avg hours, OT%, leave utilization, late arrival % — rank departments, identify best practices)
- [ ] Create `GET /api/v1/attendance/analytics/absence-patterns` - absence pattern ML analysis (Bradford Factor calculation, day-of-week patterns, pre/post holiday patterns, seasonal trends, peer group comparison, risk scoring)
- [ ] Create `GET /api/v1/attendance/analytics/predictive-absence` - predictive absence risk scoring (ML model: predict which employees are at risk of unplanned absence based on historical patterns, tenure, engagement score, team dynamics)
- [ ] Create `POST /api/v1/attendance/analytics/kpi-builder` - custom KPI builder for workforce metrics (define custom formulas combining attendance, leave, OT, productivity data — schedule automated reports, threshold alerts)

---

### 22.4 FMLA & Extended Leave Management APIs (8 Tasks)

> **Status**: Leave management is comprehensive (20+ routes, accrual, carry-forward, encashment). No FMLA-specific tracking or disability integration.
> US employers with 50+ employees MUST track FMLA. ADA accommodation is federally mandated. These are legal requirements, not optional features.

- [ ] Create `GET /api/v1/attendance/fmla/eligibility/[employeeId]` - FMLA eligibility tracker (verify 1,250 hours worked in 12 months, 12 months employment, 50+ employees within 75 miles — auto-calculate available weeks: 12/26 depending on reason)
- [ ] Create `POST /api/v1/attendance/fmla/intermittent` - intermittent FMLA tracking (track sporadic absences against FMLA entitlement, calculate hours used, forecast exhaustion date, handle reduced schedule leave)
- [ ] Create `POST /api/v1/attendance/fmla/military-leave` - military leave USERRA compliance (rights to reinstatement, health benefit continuation, seniority accrual, no discharge penalty period, escalating employment protection)
- [ ] Create `POST /api/v1/attendance/ada/accommodation` - ADA reasonable accommodation tracking (request intake, interactive process documentation, accommodation types, job modification tracking, medical certification, undue hardship analysis)
- [ ] Create `POST /api/v1/attendance/extended-leave/return-to-work` - return-to-work workflow (fitness-for-duty certification, modified duty assignment, gradual return schedule, ergonomic assessment, manager notification chain)
- [ ] Create `POST /api/v1/attendance/disability/short-term` - short-term disability integration (STD carrier data exchange, elimination period tracking, benefit calculation, return-to-work coordination, claim status sync)
- [ ] Create `GET /api/v1/attendance/leave/entitlement-simulation` - leave entitlement simulation (what-if modeling for policy changes: new accrual rates, carry-forward limits, pro-rata rules — impact analysis before rollout)
- [ ] Create `GET /api/v1/attendance/leave/global-absence-calendar` - global absence calendar (company-wide view of all absences, holidays, planned leaves — capacity planning, identify staffing risk dates, department overlap alerts)

---

### 22.5 Advanced Biometric & Identity APIs (4 Tasks)

> **Status**: BiometricIntegration component with fingerprint and face recognition device management. No multi-modal biometric or liveness detection.
> Enterprise deployments need anti-spoofing for buddy punching prevention. Contactless biometric became standard post-COVID.

- [ ] Create `POST /api/v1/attendance/biometric/multi-modal` - multi-modal biometric (combine face + fingerprint + iris for higher accuracy, configurable required modalities per security level, fallback chain)
- [ ] Create `POST /api/v1/attendance/biometric/liveness-detection` - liveness detection / anti-spoofing (detect photo attacks, video replay, 3D mask attacks — challenge-response: blink, head turn, random gesture)
- [ ] Create `POST /api/v1/attendance/biometric/contactless` - contactless biometric (thermal face scan, palm vein recognition, voice recognition — hygiene-friendly, COVID-safe, no-touch enrollment)
- [ ] Create `GET /api/v1/attendance/biometric/device-management` - device provisioning & health monitoring (device inventory, firmware updates, connection status, enrollment stats, error rate monitoring, auto-failover to alternate device)

---

### 22.6 Union & Collective Bargaining Support APIs (4 Tasks)

> **Status**: No union/CBA features found. Shift management and overtime management exist but without union rules.
> Manufacturing, healthcare, hospitality, and government sectors require CBA compliance. UKG has dedicated union management.

- [ ] Create `POST /api/v1/attendance/union/cba-rules` - CBA rule engine (define complex union rules: overtime allocation by seniority, minimum call-in hours, shift bidding rights, guaranteed hours, premium pay triggers)
- [ ] Create `POST /api/v1/attendance/union/seniority-scheduling` - seniority-based scheduling & overtime (allocate preferred shifts by seniority rank, overtime distribution in seniority order, bumping rights enforcement)
- [ ] Create `GET /api/v1/attendance/union/reports` - union reporting exports (generate union-required reports: hours by classification, overtime distribution, grievance-related time data, CBA compliance certification)
- [ ] Create `POST /api/v1/attendance/union/grievance` - grievance tracking for time/attendance disputes (file grievance, attach evidence, track resolution steps, arbitration escalation, outcome recording, pattern analysis)

---

## Section 23: ENTERPRISE ANALYTICS & PEOPLE INTELLIGENCE APIs (44 Tasks)

> **Audit Context**: Codebase has 48 analytics API routes, 9 Prisma models, 26 frontend components (119KB), 9 core services (~3,000 lines), 18+ AI routes (attrition 828L, workforce 847L, sentiment, performance prediction), 23 predefined report templates, 5-step custom report builder, predictive ML pipeline with training/retraining.
> **Gap Analysis**: Missing data warehouse/ETL, self-service BI with NLQ, external benchmarking, organizational network analysis (ONA), workforce scenario modeling, automated narrative generation, compliance audit analytics.
> **Benchmarked Against**: Visier, Workday People Analytics, One Model, Crunchr, SAP SuccessFactors People Analytics, Tableau HR, Power BI HR Templates.

---

### 23.1 Data Platform & ETL Engine APIs (8 Tasks)

> **Status**: AnalyticsCache model exists for caching. Module-specific analytics endpoints pull from live data. No data warehouse, ETL pipeline, or CDC for analytical workloads.
> Visier and One Model both ingest data from multiple HRIS/ATS/LMS sources into a unified analytics data model. Enterprise analytics MUST separate OLTP from OLAP workloads.

- [ ] Create `POST /api/v1/analytics/data-platform/etl/configure` - ETL pipeline configuration (define source connections: ADP, Workday, SAP, BambooHR, Greenhouse — schema mapping, transformation rules, sync frequency, incremental vs full load)
- [ ] Create `POST /api/v1/analytics/data-platform/etl/run` - ETL pipeline execution (trigger data extraction, apply transformations, load into analytics data store — track row counts, error rates, duration, last successful sync)
- [ ] Create `POST /api/v1/analytics/data-platform/cdc/configure` - change data capture configuration (capture real-time changes from operational DB, stream to analytics layer — Debezium/CDC pattern, event filtering, schema evolution handling)
- [ ] Create `GET /api/v1/analytics/data-platform/catalog` - data catalog & metadata management (browse available datasets, field descriptions, data types, relationships, freshness, quality score — searchable metadata dictionary)
- [ ] Create `POST /api/v1/analytics/data-platform/quality/rules` - data quality rules & profiling (define validation rules: completeness, uniqueness, range, format — run profiling, track quality scores over time, alert on degradation)
- [ ] Create `GET /api/v1/analytics/data-platform/lineage/[datasetId]` - data lineage tracking (trace data from source system → ETL → analytics model → report/dashboard — impact analysis for schema changes, audit trail)
- [ ] Create `POST /api/v1/analytics/data-platform/storage/tier` - data lake storage tiers (hot: last 90 days for real-time dashboards; warm: 1-3 years for trending; cold: 3+ years for compliance — automatic tier migration, compression)
- [ ] Create `POST /api/v1/analytics/data-platform/stream` - real-time event streaming (Kafka/CDC event stream for analytics, materialized views for real-time dashboards, event sourcing for audit-grade analytics, exactly-once processing)

---

### 23.2 Self-Service BI & Visualization APIs (8 Tasks)

> **Status**: CustomReportBuilder with 5-step wizard exists. 9 chart types. No drag-and-drop visualization builder, pivot tables, or natural language querying.
> Visier and Workday both offer ask-a-question-in-plain-English NLQ. Power BI and Tableau provide drag-and-drop exploration. Enterprise analytics users expect self-service.

- [ ] Create `POST /api/v1/analytics/bi/visualization/build` - drag-and-drop visualization builder (select dataset → drag dimensions/measures → auto-suggest chart type → apply filters → save as widget — Tableau/Power BI-style exploration)
- [ ] Create `POST /api/v1/analytics/bi/pivot` - pivot table / cross-tab analysis (select rows, columns, values, filters — support pivot, unpivot, subtotals, grand totals, conditional formatting, export to Excel)
- [ ] Create `POST /api/v1/analytics/bi/nlq` - natural language querying (NLQ) ("What is the turnover rate in Engineering?" → parse intent → generate query → return visualization — powered by LLM with HR domain context)
- [ ] Create `POST /api/v1/analytics/bi/sql-ide` - ad-hoc SQL/query IDE for power users (write SQL against analytics data model, query validation, execution plan preview, result visualization, save as named query)
- [ ] Create `POST /api/v1/analytics/bi/embed` - embeddable analytics widgets (generate iframe/embed codes for external portals, SSO token authentication, responsive sizing, theme customization, data filtering via URL params)
- [ ] Create `GET /api/v1/analytics/bi/mobile` - mobile analytics dashboard (responsive charts optimized for mobile, swipe between metrics, push notifications for threshold breaches, offline caching of key metrics)
- [ ] Create `POST /api/v1/analytics/bi/drill-down` - interactive drill-down & slice-and-dice (click chart element → drill into detail → filter by dimension → compare segments — breadcrumb navigation, undo/redo)
- [ ] Create `POST /api/v1/analytics/bi/narrative` - automated narrative generation (NLG) (AI generates plain-English summary of analytics: "Turnover in Engineering increased 15% MoM, driven by 3 senior departures" — auto-update, configurable tone)

---

### 23.3 Advanced People Modeling APIs (8 Tasks)

> **Status**: AttritionPredictionService (828L) with risk scoring. WorkforceAnalyticsService (847L) with headcount forecasting. No what-if scenario modeling or strategic workforce planning.
> Visier's scenario modeling and Workday Adaptive Planning are key differentiators for enterprise people analytics. CHROs need "what happens if..." capabilities.

- [ ] Create `POST /api/v1/analytics/modeling/workforce-scenario` - workforce scenario modeling (model RIF scenarios: select departments/roles/%, project cost savings, severance, productivity impact, rehire timeline — compare 3-5 scenarios side-by-side)
- [ ] Create `POST /api/v1/analytics/modeling/labor-cost` - labor cost optimization modeling (identify overstaffed/understaffed areas, model contractor-to-FTE conversion, optimize shift staffing, project savings from automation)
- [ ] Create `POST /api/v1/analytics/modeling/compensation` - compensation modeling (merit increase scenarios: pool allocation by department/performance, model 2%/3%/4% budgets, impact on pay equity, compa-ratio projection, market alignment)
- [ ] Create `POST /api/v1/analytics/modeling/succession-impact` - succession pipeline impact modeling (what if key leaders leave? model coverage gaps, identify critical single-points-of-failure, development timeline to readiness)
- [ ] Create `POST /api/v1/analytics/modeling/org-restructure` - org restructuring simulator (model reorgs: merge departments, flatten hierarchies, create new teams — impact on span of control, reporting lines, cost structure, culture risk)
- [ ] Create `POST /api/v1/analytics/modeling/headcount-plan` - headcount planning with budget constraints (plan new hires by role/quarter, constrained by budget, forecast fully-loaded cost, model attrition replacement, capacity gap analysis)
- [ ] Create `POST /api/v1/analytics/modeling/intervention-roi` - flight risk intervention ROI modeling (model cost of interventions: retention bonus, promotion, transfer, coaching vs cost of replacement — calculate NPV of retention investment)
- [ ] Create `POST /api/v1/analytics/modeling/strategic-plan` - strategic workforce planning (3-5 year horizon: demographic shifts, skill evolution, automation impact, talent supply forecast, build-buy-borrow strategy, gap closure roadmap)

---

### 23.4 Benchmarking & Market Intelligence APIs (6 Tasks)

> **Status**: Compensation analytics has market comparison (mock). No actual external benchmarking data integration.
> Visier provides industry benchmarking. Radford and Mercer supply comp data. Enterprise HR leaders need "how do we compare?" answers.

- [ ] Create `GET /api/v1/analytics/benchmark/industry` - external benchmarking (compare turnover, engagement, time-to-fill, span of control, HR-to-employee ratio against industry peers by NAICS code, company size, geography — powered by survey data)
- [ ] Create `POST /api/v1/analytics/benchmark/compensation` - market compensation data integration (import from Mercer, Radford, Payscale, Salary.com — match to internal job codes, age data, calculate market position, identify underpayment risk)
- [ ] Create `GET /api/v1/analytics/benchmark/employee-experience` - employee experience benchmark (compare engagement score, eNPS, Glassdoor rating against GPTW, Fortune 100 Best Companies, industry avg — identify improvement areas)
- [ ] Create `GET /api/v1/analytics/benchmark/turnover` - turnover rate benchmarking (voluntary/involuntary turnover by industry, role type, geography — identify above-benchmark attrition areas, seasonal patterns vs industry norms)
- [ ] Create `GET /api/v1/analytics/benchmark/time-to-hire` - time-to-hire benchmarking (compare by role level, function, location against industry medians — identify bottleneck stages, set data-driven SLA targets)
- [ ] Create `GET /api/v1/analytics/benchmark/benefits` - benefits competitiveness scoring (compare benefit offering value against market — medical plan richness, PTO days, retirement match, wellness programs — percentile ranking)

---

### 23.5 Organizational Network Analysis (ONA) APIs (6 Tasks)

> **Status**: No ONA features found. Org chart exists but no communication/collaboration analysis.
> Microsoft Viva Insights, Humanyze, and TrustSphere provide ONA. This is emerging as a key differentiator for understanding how work actually happens vs how the org chart says it should.

- [ ] Create `POST /api/v1/analytics/ona/communication-patterns` - communication pattern analysis (analyze email/Slack/Teams metadata: frequency, response time, network breadth — no content access, only metadata — identify communication bottlenecks)
- [ ] Create `GET /api/v1/analytics/ona/collaboration-graph` - collaboration graph visualization (network diagram of who works with whom, edge weight = interaction frequency, node size = centrality, cluster detection for teams)
- [ ] Create `GET /api/v1/analytics/ona/influence-map` - influence mapping & key connector identification (betweenness centrality scoring, identify informal leaders, bridge connectors between silos, single-point-of-failure risk)
- [ ] Create `GET /api/v1/analytics/ona/team-connectivity` - team connectivity scoring (cross-team collaboration index, intra-team cohesion, external connectivity, meeting network diversity — benchmark against high-performing teams)
- [ ] Create `GET /api/v1/analytics/ona/silo-detection` - silo detection & cross-functional metrics (identify isolated teams, measure cross-department collaboration density, recommend bridging interventions, track improvement over time)
- [ ] Create `GET /api/v1/analytics/ona/meeting-burden` - meeting burden analysis (meeting hours per week by role/level, % of week in meetings, meeting-free time blocks, attendee-to-participant ratio, meeting ROI estimation)

---

### 23.6 Advanced Compliance & Audit Analytics APIs (8 Tasks)

> **Status**: AuditLog model exists. Module-specific analytics endpoints. No compliance-specific dashboards or audit-ready evidence packages.
> SOC 2, ISO 27001, SOX all require evidence-based audit. Regulatory reports (EEO-1, VETS-4212, AAP) are legally mandated for US employers of certain sizes.

- [ ] Create `GET /api/v1/analytics/compliance/sox-dashboard` - SOX compliance dashboard (payroll controls, access reviews, segregation of duties, change management — control testing status, finding tracker, remediation progress)
- [ ] Create `POST /api/v1/analytics/compliance/audit-package` - audit-ready evidence package generation (select compliance framework: SOC 2/ISO 27001/SOX — auto-collect evidence: access logs, change logs, approval trails, policy acknowledgments — export as ZIP)
- [ ] Create `GET /api/v1/analytics/compliance/regulatory-reports` - regulatory report library (EEO-1 Component 1, VETS-4212, AAP narrative/statistical analysis, CA Pay Data Report, UK Gender Pay Gap — auto-generate from employee data)
- [ ] Create `GET /api/v1/analytics/compliance/privacy-dashboard` - data privacy compliance dashboard (GDPR/CCPA/UAE PDPL/KSA PDPL — data subject requests status, retention policy compliance, consent tracking, data processing activities register)
- [ ] Create `GET /api/v1/analytics/compliance/policy-violations` - policy violation trend analysis (violations by policy type, repeat offenders, department hotspots, seasonal patterns, resolution time, escalation rate)
- [ ] Create `GET /api/v1/analytics/compliance/access-audit` - access control audit analytics (user access review status, excessive permissions, dormant accounts, privilege escalation detection, admin activity monitoring)
- [ ] Create `GET /api/v1/analytics/compliance/training-gaps` - training compliance gap analytics (mandatory training completion by regulation, overdue by department, risk score by employee, auto-generate non-compliance report)
- [ ] Create `GET /api/v1/analytics/compliance/ethics-hotline` - whistleblower/ethics hotline analytics (case volume, category distribution, resolution time, substantiation rate, retaliation monitoring, anonymous vs identified — trend analysis)

---

## Section 24: ENTERPRISE ADMIN & PLATFORM APIs (50 Tasks)

> **Gap Source**: Codebase audit vs Workday Admin Console, ServiceNow Platform, SAP BTP, Oracle Fusion Admin, Ceridian Dayforce Admin
> **Existing Foundation**: 15 admin routes (9 sub-domains), WorkflowDesigner (425L), WorkflowService (711L), RBAC (6 roles, 29 resources), multi-tenant middleware (306L), API key module (424L), webhook CRUD + microservice, audit service (500L, 63 actions), form builder (353L, 11 field types), branding customizer, integration registry (862L, 7 connectors), 12 settings routes
> **Critical Finding**: Many admin routes return hardcoded/mock data. AuditService not wired to DB. Form builder lacks Prisma model. No BPMN 2.0, ABAC, tenant provisioning, custom field engine, or iPaaS event bus.

### 24.1 Process Automation & Workflow Engine (10 Tasks)

> **Gap**: Current workflow engine uses custom JSON nodes/edges — no BPMN standard, no parallel execution, no SLA timers, no decision tables. WorkflowService.getWorkflowById() returns null. Microservice engine exists but not connected to main app.
> **Benchmark**: ServiceNow Flow Designer, Workday Business Process Framework, SAP Build Process Automation

- [ ] Create `POST /api/v1/admin/workflows/import-bpmn` - BPMN 2.0 XML import/export (parse BPMN XML → internal node/edge JSON, export internal → valid BPMN 2.0 XML with lanes, gateways, events)
- [ ] Create `POST /api/v1/admin/workflows/parallel-gateway` - parallel gateway execution engine (fork into multiple parallel branches, synchronize at join gateway, handle partial completion, timeout per branch)
- [ ] Create `POST /api/v1/admin/workflows/timer-trigger` - timer/cron-based workflow triggers with SLA escalation engine (cron expressions, duration-based timers, escalation chains with configurable thresholds, auto-reassign on SLA breach)
- [ ] Create `POST /api/v1/admin/workflows/sub-process` - sub-process and call activity support (nested workflow invocation, parameter passing between parent/child, error boundary events, compensation handlers)
- [ ] Create `POST /api/v1/admin/workflows/decision-table` - DMN decision table engine (decision tables with input/output columns, hit policies: UNIQUE/FIRST/PRIORITY/COLLECT, FEEL expression language, versioned decision definitions)
- [ ] Create `GET /api/v1/admin/workflows/[id]/versions` - process versioning with diff and rollback (version comparison side-by-side, safe rollback to previous version, migration of running instances to new version, version-locked execution)
- [ ] Create `POST /api/v1/admin/workflows/[id]/simulate` - process simulation and what-if analysis (simulate execution with test data, bottleneck prediction, cost/time estimation, capacity planning based on historical data)
- [ ] Create `GET /api/v1/admin/workflows/analytics` - process performance analytics (cycle time by node, SLA breach rates, bottleneck heat map, approver response time, process cost attribution, completion funnel)
- [ ] Create `POST /api/v1/admin/workflows/delegation-rules` - delegation of authority rules engine (auto-forward approvals during absence, delegation by amount/category/department, delegation chains with expiry, audit trail for delegated decisions)
- [ ] Create `GET /api/v1/admin/workflows/marketplace` - workflow template marketplace (shared templates across tenants, community-contributed processes, one-click deploy with customization, rating and usage analytics)

### 24.2 Tenant Administration & Provisioning (8 Tasks)

> **Gap**: Multi-tenant middleware exists but no tenant lifecycle management. No provisioning API, no usage metering, no feature flags per tenant.
> **Benchmark**: Workday Tenant Management, ServiceNow Instance Management, SAP BTP Subaccount Administration

- [ ] Create `POST /api/v1/admin/tenants` - tenant provisioning API (create tenant with initial admin user, seed default roles/permissions/settings, configure country/currency/locale defaults, provision isolated storage buckets, generate initial API keys)
- [ ] Create `POST /api/v1/admin/tenants/[id]/onboard` - tenant onboarding wizard (guided data import: company structure → departments → positions → employees, org chart setup, policy configuration, integration connectivity check, go-live readiness checklist)
- [ ] Create `GET /api/v1/admin/tenants/[id]/usage` - per-tenant resource quotas and usage metering (active users, storage consumed, API calls per month, feature usage heatmap, quota threshold alerts, overage billing triggers)
- [ ] Create `POST /api/v1/admin/tenants/[id]/billing` - tenant billing integration (usage-based pricing tiers, invoice generation, payment method management, subscription upgrade/downgrade, billing history and statements)
- [ ] Create `GET /api/v1/admin/tenants/analytics` - cross-tenant analytics dashboard for super-admins (tenant health scores, adoption metrics, feature utilization comparison, growth trends, churn risk signals, support ticket volume)
- [ ] Create `POST /api/v1/admin/tenants/[id]/export` - tenant data export and migration tools (full tenant data export in portable format, schema migration between versions, tenant-to-tenant data migration, GDPR-compliant data portability, export audit trail)
- [ ] Create `PUT /api/v1/admin/tenants/[id]/features` - tenant feature flag management (enable/disable features per tenant, gradual rollout percentages, A/B testing flags, feature dependency graph, override inheritance from parent config)
- [ ] Create `GET /api/v1/admin/tenants/[id]/health` - tenant health monitoring and alerting (database connection pool status, background job queue depth, integration connectivity checks, error rate monitoring, performance SLA tracking, auto-remediation triggers)

### 24.3 Enterprise Access Governance (8 Tasks)

> **Gap**: Current RBAC is role-based with static enums. No attribute-based policies, no field-level security, no SoD enforcement, no access review campaigns. Permission matrix route returns hardcoded data.
> **Benchmark**: Workday Security Groups & Domain Security, SAP GRC Access Control, SailPoint Identity Governance

- [ ] Create `POST /api/v1/admin/security/abac-policies` - attribute-based access control (ABAC) engine (policies based on user attributes + resource attributes + environment context, JSON-based policy language, policy evaluation engine with caching, conflict resolution strategies)
- [ ] Create `PUT /api/v1/admin/security/field-level` - field-level and record-level security configuration (PII field masking rules per role, sensitive field encryption-at-rest, row-level security predicates, dynamic data filtering based on org hierarchy, view-only vs edit permissions per field)
- [ ] Create `POST /api/v1/admin/security/data-masking` - data masking and anonymization engine (configurable masking patterns: partial SSN, email domain-only, salary range, role-based unmasking with audit, anonymization for analytics/reporting, reversible vs irreversible masking)
- [ ] Create `POST /api/v1/admin/security/sod-rules` - segregation of duties (SoD) rule engine (define conflicting role/permission combinations, real-time SoD violation detection on role assignment, compensating controls for accepted risks, SoD violation dashboard, SOX compliance evidence)
- [ ] Create `POST /api/v1/admin/security/access-reviews` - access certification/recertification campaigns (scheduled access review campaigns per manager/department, bulk approve/revoke decisions, escalation for overdue reviews, compliance evidence generation, micro-certification for sensitive access)
- [ ] Create `POST /api/v1/admin/security/delegation` - delegation of authority management (approval delegation during absence with date range, delegation by transaction type/amount/department, delegation chains with max depth, auto-recall on delegator return, delegation audit trail)
- [ ] Create `PUT /api/v1/admin/security/sessions` - session management and control (concurrent session limits per user/role, forced session termination by admin, session timeout policies per sensitivity level, device fingerprinting and trust scoring, suspicious activity auto-lockout)
- [ ] Create `PUT /api/v1/admin/security/ip-restrictions` - IP restriction and geo-fencing for admin access (IP whitelist/blacklist per role, geo-fence polygons for admin portal access, VPN-only enforcement for sensitive operations, temporary access grants with expiry, location-based step-up authentication)

### 24.4 Configuration & Customization Engine (8 Tasks)

> **Gap**: No custom field engine, no custom objects, no formula fields, no picklist management, no page layout designer, no business rules. Branding config is hardcoded. No i18n engine.
> **Benchmark**: Workday Custom Fields & Calculated Fields, Salesforce Custom Objects & Formulas, ServiceNow Table Extensions, SAP BTP Extension Suite

- [ ] Create `POST /api/v1/admin/config/custom-fields` - custom field engine (add custom fields to any entity: Employee, Department, Position, etc.; field types: text, number, date, dropdown, multi-select, lookup, rich-text, file; field validation rules; field visibility per role; migration-safe schema extension via JSON columns)
- [ ] Create `POST /api/v1/admin/config/custom-objects` - custom object engine (create new data entities with relationships, auto-generate CRUD APIs, define indexes and constraints, relationship types: 1:1, 1:N, M:N, integrate custom objects into workflows and reports)
- [ ] Create `POST /api/v1/admin/config/formula-fields` - calculated/formula field engine (expression language with field references, date arithmetic, conditional logic IF/THEN/ELSE, aggregation functions SUM/AVG/COUNT across related records, formula dependency graph and recalculation triggers)
- [ ] Create `POST /api/v1/admin/config/picklists` - picklist and dropdown management (global and entity-scoped picklists, dependent picklists with cascading filters, active/inactive status, sort order control, multi-language labels, import/export picklist values)
- [ ] Create `POST /api/v1/admin/config/page-layouts` - page layout designer per role/profile (drag-and-drop section and field arrangement, conditional section visibility, required field enforcement per layout, tab-based page organization, compact vs detailed view per role)
- [ ] Create `POST /api/v1/admin/config/business-rules` - business rule engine (field-level triggers: on change, on save, on create; validation rules with error messages; auto-populate rules; cross-object update rules; rule execution order and priority; rule testing sandbox)
- [ ] Create `POST /api/v1/admin/config/i18n` - multi-language/i18n engine with translation management (language pack management, translation memory, machine translation integration, locale-specific date/number/currency formatting, RTL support for Arabic/Hebrew, per-tenant default language, user language override)
- [ ] Create `PUT /api/v1/admin/config/localization` - locale, date format, number format, and currency configuration (per-tenant locale settings, custom date format patterns, decimal/thousands separators, currency display rules, timezone management, calendar system support: Gregorian/Hijri/fiscal)

### 24.5 Integration Platform (iPaaS) (8 Tasks)

> **Gap**: Integration registry has 7 hardcoded connectors — no event bus, no marketplace, no health monitoring, no scheduled sync, no token lifecycle management. OAuth callback routes exist but token exchange not implemented.
> **Benchmark**: Workday Integration Cloud, SAP BTP Integration Suite, ServiceNow IntegrationHub, MuleSoft Anypoint

- [ ] Create `POST /api/v1/admin/integrations/event-bus` - event bus with pub/sub and dead-letter queues (publish domain events: employee.created, leave.approved, payroll.completed; subscribe integrations to event topics; dead-letter queue for failed deliveries; event replay capability; event schema registry with versioning)
- [ ] Create `GET /api/v1/admin/integrations/marketplace` - integration marketplace and app store (browse available connectors by category, one-click install with OAuth flow, connector versioning and update management, usage analytics per connector, community ratings and reviews, certified vs community connectors)
- [ ] Create `GET /api/v1/admin/integrations/health` - integration health monitoring dashboard (real-time connectivity status per integration, error rate trends, latency percentiles, last successful sync timestamp, SLA compliance tracking, auto-disable on repeated failures with alert)
- [ ] Create `POST /api/v1/admin/integrations/data-transform` - data transformation and mapping engine (visual field mapping UI, data type conversion rules, lookup/reference resolution, default value injection, conditional mapping logic, transformation preview with sample data)
- [ ] Create `POST /api/v1/admin/integrations/sync-jobs` - scheduled sync jobs with CRON and monitoring (CRON expression-based scheduling, full sync vs delta/incremental, conflict resolution strategies: source-wins/target-wins/manual, sync history with row-level status, automatic retry on transient failures)
- [ ] Create `GET /api/v1/admin/integrations/errors` - integration error handling with retry policies (exponential backoff configuration, circuit breaker per integration, error categorization: auth/network/data/rate-limit, manual retry queue, error notification routing)
- [ ] Create `POST /api/v1/admin/integrations/sso-federation` - SSO federation as SAML/OIDC identity provider (SAML 2.0 IdP metadata generation, OIDC discovery endpoint, user attribute mapping to claims, multi-factor authentication enforcement, just-in-time user provisioning from IdP assertions)
- [ ] Create `POST /api/v1/admin/integrations/oauth-lifecycle` - OAuth token lifecycle management with encryption (encrypted token storage with tenant-scoped keys, automatic token refresh before expiry, token rotation policies, revocation propagation to connected apps, consent scope management, token usage audit trail)

### 24.6 Data Governance & Compliance Engine (8 Tasks)

> **Gap**: AuditLog Prisma model exists but AuditService writes to Redis only — search/compliance methods return empty. No data retention policies, no archival, no GDPR automation, no consent management.
> **Benchmark**: Workday Data Governance, SAP Data Privacy Management, OneTrust Privacy Platform, ServiceNow GRC

- [ ] Create `POST /api/v1/admin/governance/audit-persistence` - wire audit log database persistence (connect AuditService.log() to Prisma AuditLog table, implement AuditService.search() with full-text + filters, backfill Redis audit entries to database, partitioned storage by month, configurable write-through vs async persistence)
- [ ] Create `POST /api/v1/admin/governance/retention-policies` - data retention and purge policy engine (configurable retention periods per entity type, automated purge scheduling with preview, legal hold override to prevent deletion, retention policy inheritance for related records, purge audit trail with compliance evidence)
- [ ] Create `POST /api/v1/admin/governance/archival` - data archival with cold storage tiering (hot → warm → cold storage tiers based on age, archived data searchable via separate index, restore from archive on demand, archival compression and deduplication, cost optimization analytics per storage tier)
- [ ] Create `POST /api/v1/admin/governance/dsar` - GDPR/CCPA data subject access request automation (automated PII discovery across all models, subject access report generation in machine-readable format, data portability export in JSON/CSV, processing timeline tracking with SLA, request categorization: access/rectification/erasure/restriction)
- [ ] Create `POST /api/v1/admin/governance/data-classification` - data classification and sensitivity labeling (auto-classify fields by sensitivity: PUBLIC/INTERNAL/CONFIDENTIAL/RESTRICTED, PII/PHI/PCI tagging, classification inheritance to derived data, label-based access control integration, classification audit dashboard)
- [ ] Create `POST /api/v1/admin/governance/consent` - consent management with preference center (granular consent categories: essential/analytics/marketing/third-party, consent capture with timestamp and version, consent withdrawal with downstream propagation, cookie consent integration, consent audit trail for regulators)
- [ ] Create `DELETE /api/v1/admin/governance/right-to-erasure` - right-to-be-forgotten automation with cascade (identify all PII across tables for a subject, cascading anonymization preserving referential integrity, exempt legally-required retention data, generate erasure certificate, notify downstream integrations of data deletion)
- [ ] Create `GET /api/v1/admin/governance/compliance-reports` - compliance report generation (SOC 2 Type II evidence packs: access controls, change management, availability; ISO 27001 ISMS control assessment; GDPR Article 30 processing register; automated evidence collection per control; audit-ready PDF/Excel export with attestation)

---

## Section 25: ENTERPRISE DATABASE & DATA PLATFORM (46 Tasks)

> **Gap Source**: Codebase audit vs Oracle Database Enterprise, PostgreSQL best practices, AWS Aurora, Workday data platform, SAP HANA governance
> **Existing Foundation**: 5,941-line monolithic schema, 207 models, 31 enums, 465 indexes, 118 tenant-scoped models, connection pool config, slow query logging, 47 seed files, 6 migrations
> **Critical Finding**: No soft delete, no RLS, no audit triggers, no table partitioning, no schema splitting, 54 un-indexed models, PascalCase table names, sparse createdBy/updatedBy, deprecated $use middleware, schema-index divergence

### 25.1 Database Schema Governance (8 Tasks)

> **Gap**: 5,941-line monolithic schema with no splitting tooling, no @@map conventions, no soft delete, sparse audit columns. Enterprise schemas require modular organization, naming conventions, and universal audit trails.
> **Benchmark**: Workday schema governance, SAP data dictionary standards, Oracle Fusion schema modules

- [ ] Implement schema splitting with `prisma-merge` tooling (split monolithic `schema.prisma` into per-module files: `employee.prisma`, `payroll.prisma`, `attendance.prisma`, `recruitment.prisma`, `benefits.prisma`, `learning.prisma`, `workflow.prisma`, `audit.prisma`, `integration.prisma`; CI merge step; import/export resolution)
- [ ] Apply `@@map` snake_case table naming convention across all 207 models (map `Employee` → `employees`, `AttendanceRecord` → `attendance_records`; apply `@map` to all column names; generate migration; backward-compatible view layer for existing queries)
- [ ] Implement universal soft delete pattern across all entity models (add `deletedAt DateTime?` and `isDeleted Boolean @default(false)` to all non-lookup models; Prisma client extension for automatic `where: { isDeleted: false }` filtering; `includeDeleted` bypass for admin/audit queries; cascade soft delete for child records)
- [ ] Add `createdBy`/`updatedBy`/`deletedBy` audit columns to ALL entity models (add String? fields referencing User.id to all 207 models; Prisma middleware/extension to auto-populate from session context; migration script to backfill existing records; index on `updatedBy` for "who changed this" queries)
- [ ] Migrate critical Json columns to typed sub-models for queryability (extract `WorkflowDefinition.nodes` → `WorkflowNode` model, `Assessment.questions` → `AssessmentQuestion` model, `BenefitPlan.coverageTiers` → `CoverageTier` model, `ReportDefinition.columns` → `ReportColumn` model; preserve JSON for config-only fields; data migration scripts)
- [ ] Create schema documentation generator (auto-generate ERD diagrams from schema, per-model markdown docs with field descriptions, relation maps, index coverage report; integrate with CI for up-to-date docs on every schema change; publish to internal wiki)
- [ ] Implement schema versioning and backward compatibility enforcement (semantic versioning for schema changes, breaking change detection in CI, deprecation annotations for fields scheduled for removal, compatibility matrix between schema versions and API versions)
- [ ] Create schema review tooling and CI checks (pre-commit hooks: lint schema for naming conventions, require @@index on foreign keys, require tenantId on entity models, require audit columns, require soft delete; block PR merge on schema violations; auto-suggest missing indexes)

### 25.2 Database Security & Isolation (8 Tasks)

> **Gap**: Tenant isolation is application-only (middleware). No PostgreSQL RLS policies, no column encryption, no database-level audit triggers. Enterprise databases require defense-in-depth at the database layer.
> **Benchmark**: Oracle Database Vault, PostgreSQL RLS, AWS RDS encryption, Azure SQL Always Encrypted

- [ ] Implement PostgreSQL Row-Level Security (RLS) policies for tenant isolation (create RLS policies on all 118 tenant-scoped tables; set `app.current_tenant_id` via `SET LOCAL` in transaction; `FORCE ROW LEVEL SECURITY` even for table owners; super-admin bypass policy; RLS policy testing framework; performance impact assessment)
- [ ] Create database-level audit triggers for critical tables (PostgreSQL trigger functions on Employee, PayrollRun, SalaryStructure, BenefitEnrollment, Role, Permission; capture old/new row values to `audit_log` table; trigger on INSERT/UPDATE/DELETE; async trigger processing to minimize latency impact; configurable per-table audit granularity)
- [ ] Implement column-level encryption for PII fields (encrypt SSN, bank account, salary, tax ID fields using `pgcrypto` or application-level AES-256-GCM; transparent encrypt-on-write/decrypt-on-read via Prisma extension; per-tenant encryption keys stored in KMS; key rotation without re-encryption downtime; encrypted column indexing strategy)
- [ ] Enforce database connection encryption and certificate pinning (require TLS 1.3 for all connections; mutual TLS for service-to-service DB access; certificate rotation automation; connection string validation in CI; reject unencrypted connections at PostgreSQL level; audit connection encryption status)
- [ ] Create database credential rotation automation (automated password rotation on schedule; credential storage in HashiCorp Vault or AWS Secrets Manager; zero-downtime rotation with dual-credential overlap; rotation audit trail; emergency credential revocation; separate credentials per microservice)
- [ ] Implement read replica routing for reporting queries (configure PostgreSQL streaming replication; route SELECT-heavy analytics/reporting queries to read replicas; Prisma client extension for read/write splitting; connection pooler configuration for replica routing; replica lag monitoring with automatic failback to primary)
- [ ] Create database backup encryption and point-in-time recovery (encrypt backups with AES-256; automated daily full + continuous WAL archiving; point-in-time recovery to any second; cross-region backup replication; backup integrity verification; recovery time objective (RTO) testing automation; backup retention policies per compliance standard)
- [ ] Implement cross-tenant data leak detection (scheduled queries to detect tenantId mismatches in related records; orphan record detection across tenant boundaries; alert on cross-tenant JOIN patterns in slow query log; monthly tenant isolation integrity report; automated quarantine of suspicious records)

### 25.3 Performance & Scalability (8 Tasks)

> **Gap**: No table partitioning for high-volume tables, 54 models without indexes, separate SQL index file outside Prisma, no materialized views, no sharding strategy. Enterprise databases must handle millions of records efficiently.
> **Benchmark**: Oracle Partitioning, PostgreSQL declarative partitioning, CitusDB sharding, AWS Aurora auto-scaling

- [ ] Implement table partitioning for high-volume tables (partition `AuditLog` by month on `timestamp`, `AttendancePunch` by month on `clockIn`, `PayrollRun` by quarter on `periodStart`, `WPSRecord` by month, `GOSIRecord` by month; declarative range partitioning; automatic partition creation via pg_partman; partition pruning verification; data retention via partition drop)
- [ ] Add index coverage for all 54 un-indexed models (add `@@index` on foreign keys for: GapAnalysis, GapAnalysisItem, DevelopmentPlan, DevelopmentActivity, SkillAssessment, Candidate, CompetencyCatalog, ProficiencyFramework, ProficiencyLevel, and 45 other models; composite indexes for common query patterns; partial indexes for status-filtered queries; index usage monitoring post-deployment)
- [ ] Create query performance baseline and regression testing (establish P50/P95/P99 latency baselines for top 100 queries; automated query regression tests in CI; explain-analyze capture for critical paths; query plan change detection; performance budget per API endpoint; automated slow query alerting with Slack/PagerDuty integration)
- [ ] Configure PgBouncer production deployment (deploy PgBouncer in transaction pooling mode; configure `max_client_conn=1000`, `default_pool_size=20`; per-database pool sizing; health check interval; stats monitoring via `SHOW STATS`; Kubernetes sidecar deployment pattern; connection draining for zero-downtime restarts)
- [ ] Implement read/write splitting with connection routing (Prisma client extension for `$primary` and `$replica` connection routing; automatic read-after-write consistency via session pinning; configurable read tolerance for eventual consistency; circuit breaker on replica failure; connection pool per replica; load balancing across multiple replicas)
- [ ] Design database sharding strategy for multi-region deployment (tenant-based sharding with shard key on `tenantId`; shard routing layer; cross-shard query support for super-admin; shard rebalancing tooling; schema synchronization across shards; regional data residency compliance; shard health monitoring dashboard)
- [ ] Implement slow query alerting and auto-explain (configure `pg_stat_statements` extension; auto-explain for queries >500ms; real-time slow query stream to monitoring; weekly slow query report with optimization suggestions; query fingerprinting for pattern detection; index suggestion engine based on query patterns)
- [ ] Create materialized views for dashboard and analytics queries (materialized views for: headcount by department/location, attendance summary by period, payroll cost rollup, leave utilization rates, recruitment pipeline funnel, benefits enrollment stats; scheduled refresh with `REFRESH MATERIALIZED VIEW CONCURRENTLY`; stale data indicator; cache invalidation triggers)

### 25.4 Migration & Data Operations (8 Tasks)

> **Gap**: Only 6 migrations for 207 models. One massive catch-all migration with no rollback granularity. No zero-downtime migration tooling, no schema drift detection, no environment promotion workflow.
> **Benchmark**: Flyway Enterprise, Liquibase Pro, AWS DMS, pg_squeeze for online operations

- [ ] Implement granular migration strategy per module (break future changes into per-module migrations: `YYYYMMDD_module_description`; maximum 20 DDL statements per migration; migration dependency graph; migration squashing for long-running schemas; migration linting in CI to prevent dangerous operations like `ALTER TABLE ... DROP COLUMN` without data backup)
- [ ] Create zero-downtime migration tooling (use `pg_repack` or `pgroll` for online schema changes; no `ACCESS EXCLUSIVE` locks on large tables; background index creation via `CREATE INDEX CONCURRENTLY`; column add-before-backfill-before-constraint pattern; feature flag integration for schema-dependent code changes; migration canary deployment)
- [ ] Implement migration rollback automation (auto-generate down migrations for every up migration; rollback testing in CI; point-of-no-return marking for irreversible changes; staged rollback: code first then schema; rollback verification queries; emergency rollback runbook with tested procedures)
- [ ] Create data migration scripts framework for schema changes (ETL framework for data transformations during migrations; batch processing with configurable chunk size; progress tracking and resume capability; dry-run mode with impact report; parallel execution for independent tables; data validation pre and post migration)
- [ ] Implement seed data versioning and idempotency (version stamp on all seed records; upsert-based seeding for re-runnability; seed dependency ordering; tenant-specific seed data; environment-specific seeds: dev gets sample data, staging gets anonymized production subset, prod gets master data only; seed rollback capability)
- [ ] Create database snapshot and restore automation (automated daily snapshots with retention policy; on-demand snapshot before risky operations; snapshot tagging with migration version; cross-environment restore: production → staging anonymized; snapshot size monitoring; restore time SLA tracking and alerting)
- [ ] Implement schema drift detection (compare `prisma db pull` output against `schema.prisma` in CI; detect manual DDL changes in production; reconcile out-of-band index additions from `add_performance_indexes.sql` back into schema; weekly drift report; auto-generate corrective migrations for detected drift)
- [ ] Create multi-environment migration promotion workflow (dev → staging → production promotion pipeline; migration approval gates per environment; automated smoke tests post-migration; canary migration on subset of tenants; rollback trigger on error rate spike; migration audit trail with approver identity)

### 25.5 Data Quality & Integrity (8 Tasks)

> **Gap**: No CHECK constraints, no enum-to-database-enum migration, sparse NOT NULL enforcement, no orphan detection, no referential integrity auditing. Enterprise data quality requires database-level enforcement.
> **Benchmark**: Oracle Data Quality, Informatica Data Quality, Great Expectations, dbt tests

- [ ] Implement foreign key constraint validation and enforcement (audit all 180 relations for proper ON DELETE behavior; replace `NoAction` with appropriate `Cascade`/`SetNull`/`Restrict`; add missing foreign keys for implicit relations; constraint violation monitoring; weekly referential integrity report)
- [ ] Add database-level CHECK constraints for data validation (email format validation on all email fields; phone number pattern validation; date range checks: `endDate > startDate`; salary non-negative; percentage 0-100; status field allowed values; currency code ISO 4217 format; constraint violation error mapping to user-friendly messages)
- [ ] Create referential integrity audit tool (scheduled job to detect orphan records across all relations; count orphans per table per tenant; auto-cleanup for safe orphans like WebhookLog without parent Webhook; alert for critical orphans like Employee without Tenant; monthly integrity report with trend analysis)
- [ ] Implement orphan record detection and cleanup automation (identify records where foreign key target no longer exists; categorize: safe-to-delete orphans vs requires-investigation; automated cleanup for cascading child records; quarantine table for suspicious orphans; orphan prevention via deferred constraints)
- [ ] Create data consistency checks for denormalized fields (validate `Employee.departmentName` matches `Department.name`; payroll total = sum of components; leave balance = accrued - taken; attendance hours = clockOut - clockIn; scheduled consistency checks with auto-repair for safe mismatches; alert for unsafe inconsistencies)
- [ ] Migrate string-based enums to PostgreSQL native enums (convert status fields, type fields, category fields from `String` to Prisma `enum` backed by PostgreSQL `CREATE TYPE`; migration script with data transformation; enum value addition workflow; backward-compatible enum extension; enum usage audit across all models)
- [ ] Implement NOT NULL enforcement and default value migration (audit all 207 models for nullable fields that should be required; add `@default` values for new NOT NULL columns; batch backfill existing NULL values; staged NOT NULL addition: add default → backfill → add constraint; default value documentation per model)
- [ ] Create data deduplication engine (fuzzy matching for Employee records: name + DOB + email similarity; duplicate candidate pair detection; merge workflow with field-level conflict resolution; surviving record selection rules; redirect table for merged IDs; deduplication audit trail; scheduled dedup scan for new records)

### 25.6 Prisma Client & ORM Enhancement (6 Tasks)

> **Gap**: Using deprecated `$use` middleware instead of modern `$extends`. No computed fields, no automatic audit logging at ORM level, no batch optimization, no type-safe JSON accessors.
> **Benchmark**: Prisma 5.x Client Extensions, TypeORM entity subscribers, Sequelize hooks, Django ORM signals

- [ ] Migrate from `$use` middleware to `$extends` client extensions (replace deprecated `$use` slow query logger with `$extends` query extension; add `$allOperations` timing wrapper; tenant context injection via `$extends` model extension; soft delete filtering via result extension; type-safe extension composition)
- [ ] Implement result transformers for computed fields (virtual `Employee.fullName` from `firstName + lastName`; `Employee.tenure` computed from `hireDate`; `PayrollRun.netPay` computed from components; `LeaveBalance.available` computed from `accrued - taken - pending`; `AttendanceRecord.hoursWorked` from clock times; cacheable computed fields)
- [ ] Create model-level middleware for automatic audit logging (auto-capture `create`/`update`/`delete` operations to AuditLog table via `$extends`; capture old and new values for updates; skip audit for read operations; configurable per-model audit granularity; batch audit write for bulk operations; async audit to minimize latency)
- [ ] Evaluate and implement Prisma Accelerate for edge/serverless (connection pooling via Prisma Accelerate; global cache layer for frequently-read master data; edge deployment for low-latency reads; serverless-compatible connection handling; cache invalidation strategy; cost-benefit analysis vs self-hosted PgBouncer)
- [ ] Create type-safe JSON field accessors (Zod schemas for all 115 Json fields; runtime validation on read/write; TypeScript type inference for Json column contents; JSON path query helpers for PostgreSQL `jsonb` operators; migration path from untyped to validated JSON; JSON schema versioning for evolving structures)
- [ ] Implement batch operation optimization (Prisma `createMany`/`updateMany`/`deleteMany` wrappers with chunking; configurable batch size per table; progress callback for large operations; transaction batching for atomic bulk updates; deadlock retry logic; batch operation audit logging; performance comparison: batch vs sequential)

---

## Section 26: ENTERPRISE JOB PROCESSING & EVENT PLATFORM (38 Tasks)

> **Gap Source**: Codebase audit vs Temporal.io, Apache Airflow, AWS Step Functions, Celery/RabbitMQ best practices, Netflix Conductor
> **Existing Foundation**: 10 mock job files, RabbitMQ (6 queues + 3 DLQ), BullMQ in 3 microservices (4 workers), node-cron scheduler (8 jobs), dual EventBus, @aura/messaging package, Phase 3 init chain with graceful shutdown
> **Critical Finding**: All 10 job files are mock stubs. No distributed locking. DLQ consumers missing. Two parallel queue stacks (RabbitMQ + BullMQ) with impedance mismatch. Scheduler state is in-memory only.

### 26.1 Job Orchestration & Pipeline Engine (8 Tasks)

> **Gap**: All 10 job files contain zero DB queries — hardcoded mock data throughout. No job dependency chains, no priority enforcement, no deduplication, no distributed locking. Enterprise workloads require reliable, exactly-once job execution.
> **Benchmark**: Temporal.io Workflows, Apache Airflow DAGs, AWS Step Functions, Netflix Conductor

- [ ] Wire all 10 mock job files to actual database operations (replace hardcoded data in `payrollProcessingJob.ts` with Prisma queries for real employees, replace `Math.random()` in `reportGenerationJob.ts` with actual report data, connect `leaveAccrualJob.ts` to LeaveBalance model, connect `complianceCheckJob.ts` to real compliance rules, connect `dataRetentionJob.ts` to actual purge logic — extract shared `JobResult` interface to common module)
- [ ] Create DAG-based job pipeline engine (define job dependency graphs: payroll pipeline = validate → calculate gross → apply deductions → calculate net → generate payslips → send notifications; parallel execution of independent steps; pipeline state machine with checkpoint/resume; pipeline-level retry vs step-level retry; pipeline visualization UI)
- [ ] Implement job priority queues with SLA enforcement (configure RabbitMQ `x-max-priority` on queues; priority levels: CRITICAL=10, HIGH=7, NORMAL=5, LOW=2, BATCH=1; SLA per priority: CRITICAL <1min, HIGH <5min, NORMAL <30min; SLA breach alerting; priority-based worker allocation; priority escalation for aging jobs)
- [ ] Create job deduplication with idempotency keys (generate deterministic job IDs from payload hash instead of `crypto.randomUUID()`; BullMQ `jobId` deduplication; RabbitMQ message dedup via Redis-backed idempotency store with TTL; idempotent job execution pattern: check-before-process; dedup metrics dashboard)
- [ ] Implement distributed job locking with Redlock (use `redlock` or `ioredis` distributed locks for all 8 cron jobs; lock acquisition before execution, auto-release on completion/failure; lock TTL with safety margin; lock contention monitoring; fallback behavior when lock unavailable; lock debugging dashboard)
- [ ] Create job timeout and cancellation framework (configurable timeout per job type: payroll=30min, report=10min, webhook=30s; graceful cancellation via abort signal; timeout escalation: warn at 80%, kill at 100%; orphaned job detection and cleanup; cancellation audit trail; timeout metrics per job type)
- [ ] Implement job batching and chunking for large datasets (process employees in configurable chunks: 1000/batch for payroll, 500/batch for leave accrual; progress tracking per chunk; resume from last successful chunk on failure; parallel chunk processing with concurrency limit; memory-efficient streaming for large exports; chunk-level transaction isolation)
- [ ] Create job pipeline templates for common workflows (payroll end-to-end template: data validation → tax calculation → deduction processing → net pay → bank file → payslips → notifications; onboarding pipeline: IT provisioning → badge creation → training enrollment → buddy assignment → day-1 checklist; offboarding pipeline: access revocation → asset return → F&F calculation → exit interview → alumni enrollment)

### 26.2 Queue Infrastructure & Reliability (8 Tasks)

> **Gap**: Two parallel queue stacks (RabbitMQ in web app + BullMQ in microservices) with no unified strategy. DLQ sinks declared but no consumers. No queue depth monitoring, no back-pressure handling, no message schema validation.
> **Benchmark**: AWS SQS/SNS, Azure Service Bus, Confluent Kafka, RabbitMQ production patterns

- [ ] Unify RabbitMQ and BullMQ into single queue strategy (define canonical queue routing: RabbitMQ for cross-service pub/sub, BullMQ for within-service job processing; eliminate `messaging.service.ts` impedance mismatch where scheduled jobs route to `events.audit` queue; shared queue naming convention; unified job status tracking; migration plan for queue consolidation)
- [ ] Create DLQ consumer workers with alerting (implement consumer workers for `dlq.notifications`, `dlq.documents`, `dlq.payroll` sinks; categorize failures: transient vs permanent; auto-retry transient failures with exponential backoff; route permanent failures to incident management; DLQ depth alerting via Slack/PagerDuty; DLQ dashboard with message inspection and manual replay)
- [ ] Implement queue depth monitoring with auto-scaling (expose RabbitMQ queue depth as Prometheus metrics; BullMQ queue size via `Queue.getJobCounts()`; auto-scale worker concurrency based on queue depth; high-water mark alerts; queue growth rate trend analysis; consumer lag monitoring; back-pressure signaling to producers)
- [ ] Create message schema validation and versioning (JSON Schema validation on message publish; schema registry with version compatibility checks; backward-compatible schema evolution rules; schema violation metrics; message envelope with `schemaVersion` field; consumer schema negotiation; dead-letter on schema mismatch)
- [ ] Implement back-pressure handling for queue overflow (producer-side rate limiting when queue depth exceeds threshold; circuit breaker pattern: open → half-open → closed; queue overflow routing to overflow storage; load shedding for non-critical messages; back-pressure propagation to API layer with 429 responses; overflow recovery automation)
- [ ] Create queue health monitoring dashboard (Bull Board deployment for BullMQ queues; RabbitMQ Management UI proxy; unified dashboard showing all queues: depth, throughput, latency, error rate, consumer count; queue comparison view; historical trends; alerting configuration per queue; one-click purge with confirmation for stuck queues)
- [ ] Implement queue encryption for sensitive payloads (encrypt payroll and PII-containing messages at rest in queue; per-tenant message encryption keys; transparent encrypt-on-publish / decrypt-on-consume middleware; key rotation without message loss; encrypted message audit logging; compliance evidence for data-in-transit)
- [ ] Create queue disaster recovery and failover (RabbitMQ cluster with mirrored queues for HA; BullMQ Redis Sentinel/Cluster configuration; queue state backup and restore; cross-region queue replication for DR; failover testing automation; RTO/RPO measurement per queue; queue data integrity verification post-failover)

### 26.3 Scheduler & Cron Management (6 Tasks)

> **Gap**: Scheduler state is in-memory only — lost on restart. No distributed locking — all instances fire simultaneously. No timezone awareness for global deployments. No dynamic schedule management.
> **Benchmark**: Kubernetes CronJobs, Apache Airflow Scheduler, Quartz Scheduler, Celery Beat

- [ ] Implement distributed cron locking to prevent duplicate fires (Redis-based distributed lock acquisition before each cron execution; lock TTL = expected job duration + safety margin; leader election pattern for scheduler: only one instance is the active scheduler; leader failover on health check failure; lock contention metrics; duplicate execution detection and alerting)
- [ ] Persist scheduler state to Redis/database (store `lastRun`, `lastResult`, `processedCount`, `errors`, `duration` in Redis or Prisma `SchedulerState` model instead of in-memory Map; survive process restarts without losing execution history; scheduler state API for historical queries; state cleanup for old entries; state replication across regions)
- [ ] Create dynamic schedule management via API (CRUD endpoints for schedule definitions: create/update/delete cron jobs without code deployment; schedule validation: cron expression parsing, conflict detection; schedule enable/disable toggle; schedule ownership and access control; schedule change audit trail; schedule import/export for environment promotion)
- [ ] Implement schedule dependency resolution (define job execution order: statutory reports depend on payroll completion; dependency graph validation: no circular dependencies; wait-for-completion triggers; dependency timeout handling; dependency skip-on-failure vs fail-cascade configurable per dependency; dependency visualization)
- [ ] Create timezone-aware scheduling for global deployments (per-tenant timezone configuration; cron execution relative to tenant timezone: "midnight" means tenant's midnight; DST handling: skip or double-fire awareness; timezone conversion in schedule display; multi-timezone schedule conflict detection; UTC normalization for cross-tenant scheduling)
- [ ] Implement schedule dry-run and simulation (simulate next N executions of a schedule; estimate resource consumption per execution; execution timeline visualization for all scheduled jobs; conflict detection: two resource-heavy jobs at same time; schedule optimization suggestions; what-if analysis for schedule changes)

### 26.4 Event-Driven Architecture (8 Tasks)

> **Gap**: Two separate EventBus implementations (local 346L + domain 143L) with no unified platform. Only 23 domain events defined. No event sourcing, no saga pattern, no event schema registry, no cross-service propagation.
> **Benchmark**: Apache Kafka, EventStoreDB, Axon Framework, MassTransit, Debezium CDC

- [ ] Unify dual EventBus into single event platform (merge local `eventBus.ts` and domain `@aura/events` into single `@aura/event-platform`; standardize on `DomainEvent<T>` with correlationId/causationId; preserve wildcard subscription support; unified dead-letter handling; single event history store; backward-compatible migration from both existing buses)
- [ ] Implement event sourcing for critical aggregates (event-sourced `Employee` aggregate: store all state changes as events instead of current-state-only; event-sourced `PayrollRun`: full audit trail of every calculation step; event replay for point-in-time reconstruction; snapshot optimization for long event streams; event versioning with upcasters)
- [ ] Create event schema registry with versioning (centralized schema definitions for all domain events; schema version compatibility matrix; backward/forward compatibility validation; auto-generate TypeScript types from schema; schema evolution rules: additive changes only; breaking change detection in CI; consumer compatibility testing)
- [ ] Implement saga/choreography pattern for cross-domain workflows (employee onboarding saga: HR creates employee → IT provisions access → Payroll sets up salary → Benefits enrolls → Learning assigns training; compensation change saga: approvals → salary update → payroll recalculation → benefits adjustment; saga state machine with compensating actions on failure; saga timeout handling)
- [ ] Create event replay and reprocessing capability (replay events from specific point in time; selective replay by event type, aggregate, or tenant; replay to different consumer for data migration; replay speed control: real-time or accelerated; replay progress tracking; idempotent consumers for safe replay; replay audit trail)
- [ ] Implement event-driven notification dispatch (subscribe notification service to domain events; event-to-notification mapping: `LeaveApproved` → email to employee + push to manager; notification template selection based on event payload; batching multiple events into digest notifications; notification preference checking before dispatch; notification delivery tracking)
- [ ] Create cross-service event propagation (RabbitMQ topic exchange for domain event distribution to microservices; event fan-out to analytics-service, integration-service, workflow-service; at-least-once delivery guarantee; consumer group management; event ordering within aggregate; cross-service event correlation via `correlationId`)
- [ ] Implement event audit trail and compliance logging (persist all domain events to append-only event store; event metadata: who, when, where (IP), what (aggregate), why (correlationId); event retention policies per compliance standard; tamper-evident event log with hash chain; event export for regulatory audit; event search and filtering API)

### 26.5 Job Monitoring & Observability (8 Tasks)

> **Gap**: Job failures only logged to `console.error`. No dashboard, no metrics, no alerting, no tracing. BullMQ progress tracking exists in 2 of 4 workers but no consumer for progress events. Scheduler status API exists but returns in-memory state only.
> **Benchmark**: Grafana + Prometheus, Datadog APM, Honeycomb, Bull Board, Flower (Celery)

- [ ] Deploy Bull Board dashboard for BullMQ queue inspection (install `@bull-board/api` + `@bull-board/fastify`; mount dashboard at `/admin/queues`; display all 4 BullMQ queues: depth, processing, completed, failed, delayed; job detail inspection with payload and logs; manual retry/remove/promote from UI; auth-protected access for admin only)
- [ ] Implement Prometheus metrics for all queues (export RabbitMQ queue metrics: `rabbitmq_queue_depth`, `rabbitmq_messages_published_total`, `rabbitmq_messages_consumed_total`, `rabbitmq_consumer_count`; BullMQ metrics: `bullmq_active_count`, `bullmq_waiting_count`, `bullmq_completed_total`, `bullmq_failed_total`; job duration histograms; Grafana dashboard with alerting rules)
- [ ] Create job failure alerting pipeline (alert on: job failure rate >5%, DLQ depth >0, queue depth growing for >10min, worker crash, scheduler missed execution; alert channels: Slack webhook, PagerDuty incident, email escalation; alert severity: P1 payroll failures, P2 notification failures, P3 report generation; alert deduplication and grouping; on-call rotation integration)
- [ ] Implement distributed tracing for job execution (OpenTelemetry spans for: job enqueue → queue wait → worker pickup → processing → completion; trace propagation from API request through queue to worker; parent-child span relationships for pipeline steps; trace sampling for high-volume jobs; trace search by jobId, tenantId, or traceId; Jaeger/Tempo backend integration)
- [ ] Create job SLA monitoring and breach alerting (define SLA per job type: payroll processing <30min, webhook delivery <30s, report generation <5min, leave accrual <10min; measure: queue wait time + processing time; SLA compliance percentage dashboard; SLA breach root cause analysis: was it queue depth? worker capacity? data volume?; weekly SLA report per tenant)
- [ ] Build historical job analytics dashboard (job execution trends: volume, success rate, duration P50/P95/P99 over time; top failing jobs with error categorization; busiest execution windows; resource utilization per job type; tenant-level job analytics; capacity planning projections based on job volume growth; anomaly detection for unusual job patterns)
- [ ] Implement job cost attribution per tenant (track compute time, memory usage, and I/O per job execution; attribute costs to originating tenant; cost allocation reports for multi-tenant billing; resource quota enforcement per tenant; cost anomaly detection; budget alerting when tenant approaches job processing limit; monthly cost summary per job type per tenant)
- [ ] Create automated failed job recovery system (auto-classify job failures: transient vs permanent; auto-retry transient failures with exponential backoff; route permanent failures to manual review queue; self-healing patterns: restart stuck workers, reconnect dropped queues; recovery playbook automation; recovery success rate tracking; escalation to on-call for unrecoverable failures)

---

## Section 27: ENTERPRISE MICROSERVICES & SERVICE MESH (38 Tasks)

> **Gap Source**: Codebase audit vs Netflix OSS, Kubernetes best practices, 12-Factor App, CNCF landscape, Workday/SAP cloud architecture
> **Existing Foundation**: 10 microservices (6 functional + 4 stubs), auth-service fully mature, Kong API gateway, Istio service mesh (auth only), K8s manifests (auth only), docker-compose, 11 shared @aura packages
> **Critical Finding**: 4 services are empty stubs. All 3rd-party integration calls are TODO. No cross-service messaging wired. No gRPC. No circuit breakers. Only auth-service has production-grade infrastructure.

### 27.1 Service Implementation Completion (8 Tasks)

> **Gap**: 4 services are pure HTTP stubs (34L raw `http.createServer`). All third-party integration calls are TODO stubs. In-memory state in scheduling + workflow services. Port collision ai-service:3000.
> **Benchmark**: Each service should match auth-service maturity: Fastify, typed config, health checks, graceful shutdown, tracing

- [ ] Complete employee-service implementation (migrate from raw `http.createServer` to Fastify; implement employee CRUD routes, search via Elasticsearch, employment history, org chart, emergency contacts; connect to `@aura/database` Prisma client; dependency-aware health check: DB + Elasticsearch; typed config following auth-service pattern; port 3002)
- [ ] Complete notification-service implementation (migrate to Fastify; implement multi-channel dispatch: email via nodemailer/SES, SMS via Twilio, push via Firebase Admin SDK; connect to `@aura/messaging` RabbitMQ as consumer for `notifications.email`, `notifications.sms`, `notifications.push` queues; template engine with variable substitution; delivery tracking; preference checking; graceful shutdown with queue drain; port 3003)
- [ ] Complete document-service implementation (migrate to Fastify; implement S3 upload/download via `@aws-sdk/client-s3`, presigned URL generation; virus scanning via ClamAV; document metadata in Prisma; document versioning; thumbnail generation for images; PDF text extraction; content-type validation; storage quota per tenant; port 3004)
- [ ] Complete payroll-service implementation (migrate to Fastify; implement payroll calculation engine with `decimal.js` for precision; multi-country tax calculation adapters; salary component processing; deduction engine; net pay calculation; payslip PDF generation; bank file generation; integration with statutory services; port 3005)
- [ ] Wire all TODO integration stubs to real APIs (connect slackService to `@slack/web-api` with real OAuth token management; connect teamsService to `@microsoft/microsoft-graph-client` with Azure AD auth; connect calendarService to Google Calendar API + Outlook REST API; connect resumeParsingService to OpenAI API; connect reportService to pdfkit/exceljs for real PDF/Excel generation; test with sandbox/dev API credentials)
- [ ] Fix port collision and standardize service ports (reassign ai-service from port 3000 to 3006; update docker-compose.yml port mapping; update Kong/Istio routing; establish port registry: auth=3001, employee=3002, notification=3003, document=3004, payroll=3005, ai=3006, analytics=3007, integration=3008, scheduling=3009, workflow=3010; document in service catalog)
- [ ] Migrate in-memory stores to persistent storage (scheduling-service: replace `Map<string, Schedule>` with Prisma `Schedule` model; workflow-service: replace `Map<string, WorkflowInstance>` with Prisma `WorkflowInstance` queries; ensure state survives pod restarts; add cache layer with Redis for hot data; implement optimistic locking for concurrent updates)
- [ ] Add typed configuration to all services (create `config.ts` following auth-service pattern for each service; centralized env var validation with Zod; typed config interface per service; required vs optional env vars; default values per environment; config validation on startup — fail fast on missing required vars; shared base config for common settings: DB, Redis, logging)

### 27.2 Service Communication & Discovery (8 Tasks)

> **Gap**: Zero cross-service communication exists. No gRPC despite declaring deps. @aura/messaging (RabbitMQ) and @aura/events (EventBus) built but imported by zero services. No service discovery. Kong routes only auth-service.
> **Benchmark**: gRPC for sync, RabbitMQ for async, Consul for discovery, Istio for mesh

- [ ] Implement gRPC service-to-service communication (create `.proto` definitions for core contracts: EmployeeService, PayrollService, NotificationService; generate TypeScript stubs via `@grpc/proto-loader`; implement gRPC server in auth-service on port 50051; gRPC client factory with connection pooling; deadline/timeout propagation; gRPC health checking protocol; proto-buf versioning strategy)
- [ ] Wire @aura/messaging RabbitMQ to all services (import QueueManager in notification-service for email/sms/push consumption; import in payroll-service for payroll.calculate/export; import in document-service for documents.generate/process; import in integration-service for webhook event dispatch; standardize connection config across all services; connection health monitoring; graceful drain on shutdown)
- [ ] Wire @aura/events across service boundaries via Redis pub/sub (replace in-memory EventBus with Redis-backed implementation using ioredis pub/sub; domain events published by one service consumed by all subscribers across process boundaries; event ordering within aggregate via sequence numbers; consumer group support; event persistence to event store; backward-compatible migration from in-memory)
- [ ] Implement service discovery and registration (Consul agent sidecar per service OR Kubernetes-native DNS discovery; service registration on startup, deregistration on shutdown; health check integration with discovery; service catalog with metadata: version, endpoints, capabilities; client-side load balancing with discovery; fallback to static config when discovery unavailable)
- [ ] Add service-to-service authentication (mutual TLS certificates per service identity; JWT-based service tokens for service-to-service API calls; token rotation automation; service identity verification; audit trail for inter-service calls; zero-trust network: deny by default, allow by policy; service-level RBAC: which service can call which endpoint)
- [ ] Configure Kong API gateway for all services (add routing rules for all 10 services; per-service rate limiting and circuit breaking; request/response transformation plugins; authentication plugin per route; CORS configuration per service; request logging and analytics; blue-green deployment support via upstream targets; canary release via Kong traffic splitting)
- [ ] Implement request correlation across service boundaries (generate `X-Correlation-ID` at API gateway; propagate through HTTP headers, gRPC metadata, and RabbitMQ message properties; log correlation ID in all services; trace aggregation in centralized logging; correlation-based request replay for debugging; correlation dashboard showing full request journey)
- [ ] Extend Istio service mesh to all services (create VirtualService + DestinationRule for all 10 services; traffic management: canary releases, A/B testing, traffic mirroring; mTLS STRICT mode for all service-to-service; outlier detection and circuit breaking per service; distributed tracing via Istio telemetry; authorization policies per service pair; fault injection for testing)

### 27.3 Container Orchestration & Deployment (8 Tasks)

> **Gap**: Only auth-service has K8s manifests. Kustomize base/overlays are empty. No Helm charts. Terraform and Ansible directories are empty `.gitkeep`. No CI/CD per service.
> **Benchmark**: Kubernetes, Helm 3, ArgoCD/FluxCD, Terraform, GitHub Actions

- [ ] Create Kubernetes deployment manifests for all 9 remaining services (Deployment with resource limits/requests, SecurityContext, topology spread; Service with named ports; ConfigMap and Secret references; PodAntiAffinity for HA; livenessProbe + readinessProbe + startupProbe per service; environment-specific replicas; node affinity for compute-intensive services like ai-service and payroll-service)
- [ ] Create Helm charts with environment overlays (Helm 3 chart per service with `values.yaml`, `values-dev.yaml`, `values-staging.yaml`, `values-prod.yaml`; shared library chart for common templates; chart dependency management; chart versioning aligned with service version; chart testing with `helm test`; chart museum/OCI registry for chart storage)
- [ ] Implement HPA and PDB for all services (HorizontalPodAutoscaler: CPU target 70%, memory target 80%, custom metrics support; min/max replicas per environment; PodDisruptionBudget: minAvailable=2 for critical services, maxUnavailable=1 for others; scale-to-zero for non-critical services in dev; event-driven autoscaling via KEDA for queue-based workers)
- [ ] Create rolling update strategy with zero-downtime (RollingUpdate: maxSurge=1, maxUnavailable=0; readiness gates for traffic shifting; pre-stop hook with sleep for in-flight request completion; connection draining period; database migration as init container; canary deployment with automatic rollback on error rate spike; blue-green deployment option for major versions)
- [ ] Implement Kustomize overlays for multi-environment (populate `base/` with common resources; `overlays/dev/`: single replica, debug logging, relaxed limits; `overlays/staging/`: 2 replicas, production-like config; `overlays/prod/`: 3+ replicas, strict security, resource guarantees; `overlays/dr/`: disaster recovery region config; patchesStrategicMerge for per-env customization)
- [ ] Create Terraform IaC for cloud infrastructure (EKS/GKE/AKS cluster provisioning; VPC/networking with private subnets; RDS PostgreSQL with Multi-AZ; ElastiCache Redis cluster; Amazon MQ for RabbitMQ; S3 buckets for document storage; CloudFront CDN; Route53 DNS; IAM roles and policies; state management in S3+DynamoDB; module structure per resource group)
- [ ] Implement CI/CD pipeline per service (GitHub Actions workflow per service: build → test → lint → security scan → Docker build → push to registry → deploy to dev; promotion gates: staging requires QA approval, prod requires release approval; parallel builds for independent services; selective builds: only rebuild changed services; rollback automation; deployment notifications)
- [ ] Create container image registry and versioning (ECR/GCR/ACR repository per service; image tagging: `service:sha-abc1234`, `service:v1.2.3`, `service:latest`; image scanning for vulnerabilities via Trivy/Snyk; image size optimization: multi-stage Docker builds, Alpine base; image pull policy: Always in prod, IfNotPresent in dev; image retention policy: keep last 20 versions)

### 27.4 Service Resilience & Reliability (8 Tasks)

> **Gap**: No circuit breakers in any service. Only auth-service has rate limiting. 9/10 services have no dependency health checks. 5/10 have no graceful shutdown. No chaos engineering, no bulkhead pattern.
> **Benchmark**: Netflix Hystrix/Resilience4j, opossum, Envoy proxy, Chaos Monkey, Gremlin

- [ ] Implement circuit breaker library for all inter-service calls (install `opossum` in all services; circuit breaker per external dependency: DB, Redis, RabbitMQ, external APIs; configurable: failure threshold=5, reset timeout=30s, half-open max=3; circuit state exposed via health endpoint; fallback functions per dependency; circuit breaker metrics exported to Prometheus; dashboard with circuit state visualization)
- [ ] Add retry policies with exponential backoff for all services (configurable per-call retry: max attempts, base delay, max delay, jitter; retry only on transient errors (5xx, ECONNRESET, ETIMEDOUT); no retry on 4xx client errors; retry budget per service: max 20% of total requests can be retries; retry metrics: attempt distribution, success rate per attempt; integrate with circuit breaker: no retry when circuit open)
- [ ] Configure request timeouts for all services and external calls (Fastify server timeout per service; per-route timeout configuration; upstream call timeouts: DB=5s, Redis=2s, external API=30s, gRPC=10s; timeout propagation: reduce remaining budget at each hop; timeout monitoring: alert on timeout rate >5%; timeout metric: histogram of request durations vs timeout limit)
- [ ] Add rate limiting to all services (install @fastify/rate-limit in all Fastify services; per-tenant rate limits based on subscription tier; rate limit headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset; sliding window algorithm via Redis; rate limit exemptions for internal service-to-service calls; rate limit dashboard with per-tenant usage; 429 response with Retry-After header)
- [ ] Implement bulkhead pattern for fault isolation (separate thread pools/connection pools per downstream dependency; bulkhead per tenant for noisy-neighbor protection; semaphore-based concurrency limiting per service; queue-based bulkhead for async operations; bulkhead metrics: rejection count, queue depth; bulkhead auto-tuning based on downstream latency; fallback behavior when bulkhead full)
- [ ] Create fallback strategies per service (employee-service: cache last-known data on DB failure; notification-service: queue to disk on RabbitMQ failure; document-service: local temp storage on S3 failure; payroll-service: read-only mode with cached calculations; ai-service: rule-based recommendations when ML model unavailable; configurable degraded mode per service; fallback audit trail)
- [ ] Implement chaos engineering testing framework (scheduled chaos experiments: random pod termination, network latency injection, dependency failure simulation; game day automation: run predefined failure scenarios; steady-state verification before and after experiments; experiment library: CPU stress, memory pressure, disk fill, DNS failure; blast radius control: target specific services/tenants; experiment reports with recovery metrics)
- [ ] Create service-level SLA monitoring (define SLA per service: auth=99.99%, payroll=99.95%, notification=99.9%; measure: availability, latency P99, error rate; SLA tracking dashboard with burn-rate alerting; error budget calculation: (1 - SLA) × time period; error budget policy: freeze deployments when budget exhausted; monthly SLA report per service; SLA comparison across environments)

### 27.5 Configuration & Secrets Management (6 Tasks)

> **Gap**: Only auth-service has typed config. Other services use inline `process.env.PORT` only. No centralized secrets management. Feature flags are static env vars. K8s secrets referenced but not defined.
> **Benchmark**: HashiCorp Vault, AWS Secrets Manager, Unleash, ConfigCat, Spring Cloud Config

- [ ] Create shared base configuration package (shared `@aura/config` package with base config interface: db, redis, logging, tracing, metrics; per-service config extension with Zod validation; fail-fast on missing required env vars; config precedence: env vars > config file > defaults; config diffing between environments; config audit trail for changes; typed config injection for dependency injection)
- [ ] Implement centralized secrets management (HashiCorp Vault or AWS Secrets Manager integration; dynamic secret generation for database credentials; secret rotation without service restart via watch/poll; per-service secret scope: only payroll-service can access payroll encryption keys; secret access audit trail; emergency secret revocation; K8s ExternalSecrets operator for secret synchronization)
- [ ] Integrate feature flag service (deploy Unleash server or integrate LaunchDarkly SDK; per-tenant feature flags for gradual rollout; per-service feature flags for canary deployments; flag evaluation caching for performance; flag change webhooks for cache invalidation; flag override for testing/debugging; flag audit trail with who/when/why; killswitch flags for emergency feature disable)
- [ ] Create per-environment configuration management (dev: debug logging, relaxed timeouts, mock external APIs; staging: production-like config with sanitized data; prod: strict security, real API credentials, full monitoring; DR: regional failover config; config promotion pipeline: dev → staging → prod with diff review; configuration drift detection between environments)
- [ ] Implement config validation on startup with fail-fast (Zod schema validation for all config values; type checking: ports are numbers, URLs are valid, timeouts are positive; dependency checking: if RabbitMQ enabled, RabbitMQ URL required; cross-service config consistency validation: all services agree on shared infrastructure endpoints; human-readable error messages for config violations; startup config dump in debug mode)
- [ ] Create dynamic configuration updates without restart (Redis-backed config store for runtime-changeable settings; config change notification via pub/sub; hot-reload for: log level, rate limits, feature flags, timeout values; immutable config for: ports, database URLs, encryption keys (require restart); config change propagation latency SLA; config rollback for last-known-good on error; audit trail for dynamic config changes)

---

## Section 28: ENTERPRISE SEED DATA & MASTER DATA MANAGEMENT (44 Tasks)

> **Gap Source**: Codebase audit vs SAP Master Data Governance, Oracle MDM, Informatica MDM, ISO 3166/4217/639 standards
> **Existing Foundation**: 40 seed files (12,127 lines), 22 numbered seeds (01-22), 15 named seeds (3.1.1-3.1.15), seed.ts orchestrator (943L), 17 countries, 50 currencies, ~700 states/cities
> **Critical Finding**: 14 of 15 named seeds target non-existent Prisma models (will FAIL). Named seeds not wired to orchestrator. Only 30% of 207 models have seed data. Zero data import/migration tools.

### 28.1 Schema-Seed Alignment & Orchestration (8 Tasks)

> **Gap**: 14 named seeds reference models that don't exist in schema. Seeds not wired to orchestrator. No transactions, no rollback, no validation. Plain text password. Numbering collisions.
> **Benchmark**: Django fixtures, Rails db:seed, Prisma seeding best practices

- [ ] Create 14 missing Prisma models for Section 3 named seeds (add to schema.prisma: `HolidayCalendar` with country FK and floating-date resolver, `TaxJurisdiction` with bracket arrays, `IndustryCode` with NAICS/SIC/ISIC system types, `JobClassification` with SOC/ISCO levels, `ComplianceRule` with jurisdiction/category/threshold, `DocumentTemplate` with Markdown body + variables, `EmailTemplate` with HTML body + channel, `ReportTemplate` with column definitions, `ApprovalChain` with step array, `BreakRule` with jurisdiction + duration, `OvertimeRule` with multiplier + threshold, `IntegrationConfig` with OAuth/API-key fields, `WorkflowTemplate` referencing WorkflowDefinition; run migration; fix `skills-taxonomy.seed.ts` `key` → `code` field mismatch)
- [ ] Wire all 15 named seeds into `prisma/seed.ts` orchestrator (import and call all seed functions in dependency order: reference data first → templates → rules → workflows; add execution logging per seed; add skip-if-already-seeded check per seed; configurable seed profile: MINIMAL/STANDARD/FULL; support selective re-seeding of individual modules)
- [ ] Add transaction wrappers for atomic seeding (wrap each seed module in `prisma.$transaction()` for atomic commit/rollback; nested transaction support for large seeds via savepoints; timeout configuration per seed; partial failure handling: rollback current module, continue with next; seeding state table to track which modules completed; resume-from-failure capability)
- [ ] Fix seed file numbering collisions and data integrity issues (resolve: 19-asset-categories vs 19-performance, 20-employment-history vs 20-learning, 21-compensation vs 21-positions; renumber to sequential 19-24; fix employment-history stub to actually insert records; fix HRK currency to EUR for Croatia; fix SWIFT codes to valid 8/11 char BIC format; validate all ISO codes)
- [ ] Hash admin password and remove plain text credentials (replace "Admin@123" with bcrypt hash in 16-users.seed.ts; use environment variable for initial admin password; generate random strong password if not provided; log generated password securely on first seed only; add password complexity validation; ensure seed never writes plain text passwords to DB or logs)
- [ ] Implement idempotent upsert pattern everywhere (replace all `findFirst + create` patterns with proper `upsert` on unique keys; define canonical unique keys per model for idempotent seeding; handle composite unique key upserts; test re-runnability: running seed twice should produce identical state; add `--force` flag to overwrite existing data; seed conflict resolution: skip vs update vs error)
- [ ] Create seed data validation framework (validate all seeded data against Prisma schema constraints before insert; check referential integrity: FK targets exist; validate data quality: email formats, phone patterns, ISO codes, date ranges; report validation errors with file/line/field context; fail-fast on critical validation errors; warning mode for non-critical issues)
- [ ] Implement seed data CI pipeline (run seed validation on every PR touching seed files; seed integration test: seed fresh DB → verify model counts → spot-check data quality; seed performance benchmark: track seeding time per module; seed drift detection: compare seed data against expected baseline; seed regression test: verify idempotency by running twice)

### 28.2 GCC & MENA Statutory Data (8 Tasks)

> **Gap**: Kuwait missing entirely as a country. No Saudi GOSI rates, no UAE WPS config, no Bahrain SIO, no Oman PASI, no GCC EOSB formulas. GCC is the primary market but statutory data is almost empty.
> **Benchmark**: Bayzat/ZenHR GCC statutory engines, MenaITech payroll rules, Darwinbox GCC compliance

- [ ] Seed Saudi Arabia GOSI contribution rates and rules (employer 12% + employee 10% for Saudi nationals; employer 2% + employee 0% for non-Saudi GOCI occupational hazard; SANED unemployment contribution 1.5%+1.5%; contribution ceiling 45,000 SAR/month; GOSI registration requirements by company size; wage definition for GOSI base; annual rate update mechanism)
- [ ] Seed UAE WPS mandatory payment configuration (Wage Protection System payment file format; SIF file structure per Central Bank; payment deadline rules: salary due by last day of month, 15-day grace; penalty thresholds: 10%+ workforce unpaid triggers auto-complaint; bank agent codes per authorized bank; WPS-exempt categories: domestic workers, freezone specific rules; MOHRE complaint auto-generation rules)
- [ ] Seed Bahrain SIO contribution rates (employee 7% + employer 12% for Bahraini nationals; employee 1% + employer 3% for non-Bahraini; occupational hazard 3% employer-only; maternity fund 2% employer-only; contribution ceiling BD 4,000/month; SIO registration requirements; quarterly filing deadlines)
- [ ] Seed Oman PASI contribution rates (employee 7% + employer 11.5% for Omani nationals; non-Omani: employer 1% occupational hazard only; PASI ceiling OMR 3,000/month; registration by company type; branch-level registration requirements; annual compliance certificate)
- [ ] Seed Qatar GRSIA rules (employer 10% + employee 5% for Qatari nationals; non-Qatari exempt from social insurance; retirement pension eligibility: 20 years service; disability/death benefits schedule; contribution ceiling QAR 100,000/month; WPS payment rules per Ministry of Labour)
- [ ] Seed GCC End-of-Service Benefit (EOSB) calculation formulas per jurisdiction (UAE: 21 days/year first 5 years + 30 days/year after; Saudi: 15 days/year first 5 + 30 days/year after; Bahrain: 15 days/year; Oman: 15 days for first 3 years + 30 days after; Qatar: 21 days/year; Kuwait: 15 days first 5 + 30 days after; pro-rata for partial years; resignation vs termination multipliers; maximum EOSB caps; basic salary definition per country)
- [ ] Seed Kuwait country data and labor law compliance (add Kuwait as country: KW, KWT, +965, KWD; add 6 governorates + major cities; add banks: NBK, Gulf Bank, Burgan Bank, KFH, ABK; add holidays: National Day, Liberation Day, Islamic holidays; labor law: 48hr/week max, 30 days annual leave, 15 days sick at full pay, EOSB formula, probation max 100 days, notice period rules; Kuwait Social Security rates)
- [ ] Seed GCC holiday calendars with Islamic date awareness (Eid al-Fitr, Eid al-Adha, Islamic New Year, Prophet's Birthday across all GCC countries; implement Hijri-to-Gregorian date conversion library; moon-sighting override mechanism: government announces official dates 1-2 days before; multi-year holiday projection with confidence intervals; country-specific holiday variations: UAE National Day, Saudi National Day, Bahrain National Day, Qatar National Day, Oman Renaissance Day, Kuwait National/Liberation Day)

### 28.3 India Statutory Data (6 Tasks)

> **Gap**: No PF/ESI/Professional Tax/TDS/LWF/Gratuity seed data despite India being a primary market. Compensation seed has component names but no actual statutory rate tables.
> **Benchmark**: greytHR, Keka, Darwinbox India payroll engines

- [ ] Seed India PF contribution rates and administration charges (employee 12% of basic + DA; employer 12% split: 3.67% EPF + 8.33% EPS (capped at ₹15,000 basic); EDLI: employer 0.5% (capped); admin charges: 0.5% EPF + 0.5% EDLI; PF ceiling ₹15,000 basic; voluntary PF above ceiling; PF exemption for salary >₹15,000 new joiners; EPFO registration by establishment size; monthly ECR filing deadlines)
- [ ] Seed India ESI contribution rates and coverage threshold (employee 0.75% + employer 3.25% of gross wages; coverage threshold: gross ≤₹21,000/month; ESI-exempt: establishment <10 employees in most states; state dispensary coverage mapping; ESI registration per state; contribution period: April-Sept, Oct-March; benefit types: sickness, maternity, disablement, dependent; ESIC filing deadlines)
- [ ] Seed India Professional Tax slabs for all states (Maharashtra: ₹0/₹175/₹200/₹300 based on salary slabs; Karnataka: ₹0/₹200 (threshold ₹15,000); Tamil Nadu: ₹0/₹100/₹135/₹190/₹300; Telangana: ₹0/₹175/₹200; West Bengal: ₹0/₹110/₹130/₹150; Gujarat: ₹0/₹80/₹150/₹200; Madhya Pradesh, Rajasthan, Bihar, Assam, Meghalaya, Odisha, Kerala, Jharkhand, Chhattisgarh, Andhra Pradesh; maximum ₹2,500/year cap per Article 276; monthly vs annual payment by state; registration per state)
- [ ] Seed India TDS salary slabs and Section 80 deduction limits (Old Regime: 0%/5%/20%/30% with ₹2.5L/₹5L/₹10L slabs; New Regime FY2024-25: 0%/5%/10%/15%/20%/25%/30% with revised slabs; surcharge: 10%/15%/25%/37% based on income; health & education cess 4%; Section 80C limit ₹1.5L, 80D health ₹25K/₹50K senior, 80E education loan interest, 80G donations, 80TTA ₹10K savings; HRA exemption formula; LTA exemption rules; standard deduction ₹50,000; Form 16 generation rules)
- [ ] Seed India Labour Welfare Fund rates by state (Maharashtra: ₹12 employee + ₹36 employer per half-year; Karnataka: ₹20 + ₹40 per year; Tamil Nadu: ₹10 + ₹20 per half-year; Delhi: ₹0.50 + ₹1.00 per month; Gujarat: ₹6 + ₹12 per half-year; Madhya Pradesh, Rajasthan, West Bengal, Andhra Pradesh, Telangana; filing frequency per state; due dates; penalty for late filing)
- [ ] Seed India Gratuity calculation formula and rules (formula: 15 days × last drawn salary × years of service ÷ 26; eligibility: 5 years continuous service; maximum limit ₹20 lakh; basic salary definition for gratuity base; death/disability: no 5-year requirement; seasonal establishment: 7 days instead of 15; forfeiture conditions; gratuity tax exemption under Section 10(10); Payment of Gratuity Act 1972 compliance rules)

### 28.4 Global Reference Data Standards (8 Tasks)

> **Gap**: Only 17 of ~250 ISO countries seeded. No ISIC/NIC/NACE industry codes. No ESCO skills taxonomy. Only 13 banks with incomplete SWIFT codes. Exchange rates are static snapshots.
> **Benchmark**: ISO 3166/4217/639 complete datasets, UN ISIC Rev.4, ESCO v1.1, SWIFT/BIC directory

- [ ] Seed complete ISO 3166-1 country coverage (expand from 17 to 250+ countries; all ISO2/ISO3/numeric codes; include all UN member states + territories; phone dialing codes; internet TLDs; continent/region/subregion classification; UN M49 region codes; EU/EEA/Schengen membership flags; currency code FK; primary language; capital city; data sovereignty classification for GDPR)
- [ ] Seed ISIC Rev.4 industry codes for GCC/international use (20 top-level sections A-U; 88 divisions; 238 groups; 419 classes; used by GCC governments for commercial licensing; ISIC-to-NAICS concordance table; ISIC-to-NACE mapping for European operations; activity descriptions in English and Arabic)
- [ ] Seed India NIC 2008 industry codes (21 sections; 88 divisions; 238 groups; 456 classes; mandatory for India GST registration, EPFO registration, ESIC registration; NIC-to-ISIC concordance; NIC-to-NAICS mapping; descriptions in English and Hindi)
- [ ] Seed ESCO v1.1 skills and qualifications taxonomy (2,942 occupations; 13,890 skills/competences; 8 qualification levels; ESCO-to-ISCO-08 mapping; ESCO-to-O\*NET crosswalk; skill relationships: essential vs optional per occupation; knowledge, skill, competence hierarchy; multilingual labels)
- [ ] Seed complete banking data per country (expand from 13 to 200+ banks across target markets; valid 8/11 character SWIFT/BIC codes from SWIFT directory; IBAN format and validation regex per country; bank branch codes where required; WPS-authorized banks per GCC country; NEFT/RTGS/IMPS routing for India; ACH routing numbers for US; sort codes for UK; clearing house identifiers)
- [ ] Seed exchange rate data source configuration and historical rates (configure exchange rate sources: ECB daily rates, US Fed, CBs per country; seed baseline exchange rates for all 50 currencies; historical rate table for last 12 months; rate update schedule: daily at 6 AM UTC; stale rate alerting threshold: 48 hours; rate precision per currency pair; triangulation rules for exotic pairs)
- [ ] Seed QF-Emirates and NQF-India qualifications frameworks (UAE: QF-Emirates 10 levels mapping to education/vocational qualifications; India: NSQF 10 levels; international: EQF 8 levels; framework-to-framework mapping; qualification-to-job-level mapping; recognition of prior learning (RPL) eligibility rules; qualification expiry and renewal requirements)
- [ ] Seed additional language data for GCC workforce (add: Urdu (ur), Tagalog (tl), Malayalam (ml), Tamil (ta), Telugu (te), Bengali (bn), Nepali (ne), Sinhala (si), Bahasa Indonesia (id), Bahasa Malay (ms), Pashto (ps), Farsi (fa), Thai (th), Amharic (am); all with ISO 639-1 codes; RTL flags for Arabic, Urdu, Farsi, Pashto; script identifiers; GCC expat population percentages per language)

### 28.5 Demo & Test Data Generation (6 Tasks)

> **Gap**: Only 1 admin user seeded. No realistic employee population. No recruitment pipeline data. No anonymization. No test data factories. Enterprise products need demo environments with realistic data.
> **Benchmark**: Faker.js, Factory Bot, Django Factory, Prisma seed factories

- [ ] Create realistic employee population generator (generate 100-1000 synthetic employees with realistic demographics; nationality distribution matching GCC workforce (30% national, 40% South Asian, 20% Arab, 10% Western); salary ranges per grade/country; department distribution; reporting hierarchy with realistic span of control; leave balances; attendance records for last 90 days; profile photos via DiceBear/UI Avatars API; configurable per-tenant)
- [ ] Create performance and goals data generator (generate performance reviews for last 2 cycles; realistic rating distribution: 5% exceptional, 25% exceeds, 50% meets, 15% needs improvement, 5% unsatisfactory; goals per employee: 3-5 per cycle; progress tracking with milestones; 360 feedback with peer/manager/self; competency assessments aligned to job-competency mappings; PIP records for low performers)
- [ ] Create recruitment pipeline data generator (generate 50-200 job postings across departments; 10-50 applications per posting; candidate profiles with resumes; interview schedules with feedback; offer letters with compensation details; source distribution: 40% job boards, 25% referral, 20% agency, 15% direct; pipeline metrics: time-to-fill, cost-per-hire, offer-acceptance rate; diversity metrics per stage)
- [ ] Create data anonymization tool for production-to-staging (anonymize PII: names → fake names preserving ethnicity distribution, emails → @example.com, phones → random valid format, SSN/Emirates ID → fake valid format, bank accounts → masked; preserve referential integrity; preserve data distributions and statistical properties; configurable anonymization rules per field; reversible for authorized recovery; audit trail of anonymization runs)
- [ ] Create test data factory framework (Prisma-based factory definitions per model: `createEmployee({overrides})`, `createPayrollRun({overrides})`; trait system: `createEmployee({trait: 'probation'})`, `createEmployee({trait: 'senior-manager'})`; sequence generators for unique fields; relationship auto-creation: `createEmployee` auto-creates Tenant, Department, Position; cleanup utilities: `factory.cleanup()` for test isolation; integration with Jest/Vitest)
- [ ] Create multi-tenant demo data per country (tenant seed profiles: UAE Demo (500 employees, AED), Saudi Demo (300 employees, SAR), India Demo (1000 employees, INR), US Demo (200 employees, USD); each with country-specific: departments, job titles, salary ranges, leave types, holidays, statutory deductions; one-click tenant provisioning with demo data; demo data refresh automation; demo tenant isolation from production)

### 28.6 Master Data Management Infrastructure (8 Tasks)

> **Gap**: No MDM workflow, no version history, no data quality rules, no bulk import, no data lineage, no deduplication. Enterprise MDM requires governed, versioned, auditable master data.
> **Benchmark**: SAP Master Data Governance, Informatica MDM, Reltio MDM, Stibo STEP

- [ ] Create MDM approval workflow for master data changes (approval required for: country/currency/tax rate changes, new industry codes, compliance rule updates, job classification changes; maker-checker pattern: requester → reviewer → approver; auto-approve for non-critical master data; impact analysis before approval: "changing this tax rate affects 500 employees"; approval audit trail; bulk approval for related changes)
- [ ] Implement master data versioning with effective dating (every master data record has `effectiveFrom` and `effectiveTo` date range; historical versions preserved — never overwrite; point-in-time queries: "what was the tax rate on 2024-06-15?"; future-dated changes: schedule rate updates before effective date; version comparison diff view; rollback to previous version)
- [ ] Create data quality rules framework (configurable validation rules per master data type: email format, phone pattern, ISO code verification, date range checks; data completeness scoring per entity; data freshness monitoring: alert on stale exchange rates, outdated tax brackets; automated data quality reports; quality score dashboard; remediation workflow for low-quality records)
- [ ] Implement CSV/Excel bulk import tooling for master data (upload CSV/XLSX → preview → map columns → validate → import; column auto-mapping by header name similarity; data type inference and conversion; duplicate detection during import; error report with row/column details; import history with undo capability; template download per entity type; support for 100K+ row imports with streaming)
- [ ] Create data lineage and change audit trail (track every master data change: who, when, what field, old value, new value; lineage graph: which seed file or import created this record; downstream impact tracking: which payroll runs used this tax rate; export lineage for regulatory audit; tamper-evident hash chain for compliance; retention per compliance standard: SOX 7 years, GDPR as needed)
- [ ] Implement golden record deduplication for master data (fuzzy matching for: bank names, city names, skill names with different spellings; confidence scoring for potential duplicates; merge workflow: select surviving record, redirect references; automatic dedup for exact matches; manual review queue for fuzzy matches; merge audit trail with undo; prevention rules: block creation of near-duplicates)
- [ ] Create reference data governance framework (ownership assignment: who owns tax rates? who owns industry codes?; update schedule: annual tax rate review, quarterly exchange rate audit; data source documentation: where does this data come from?; certification process: data steward certifies accuracy; lifecycle management: draft → review → active → deprecated → archived; governance dashboard with compliance metrics)
- [ ] Implement seed data CI validation pipeline (automated validation on every PR: schema compatibility check, referential integrity, data quality rules, idempotency test; seed performance tracking: time to seed fresh DB; seed regression: verify record counts match baseline; seed coverage report: which models have seed data, which don't; automated seed documentation generation; seed freshness alerting: flag seeds with outdated regulatory data)

---

## Section 29: ENTERPRISE SECURITY OPERATIONS & THREAT MANAGEMENT (30 Tasks)

> **Gap Source**: Architecture doc v4.1 Security Architecture, OWASP ASVS 4.0, NIST CSF 2.0, CIS Benchmarks, SOC 2 TSC, ISO 27001 Annex A
> **Existing Foundation**: JWT auth, RBAC (6 roles, 29 resources), audit service (63 actions), HMAC webhook signing, bcrypt password hashing, AES-256-GCM field encryption, @fastify/rate-limit in auth-service, dd-trace APM in auth-service
> **Critical Finding**: No WAF, no DDoS protection, no SIEM integration, no vulnerability management program, no security awareness training automation, no third-party risk management, no container runtime security, no certificate lifecycle management, no bot detection, no API abuse prevention. Architecture doc specifies these as requirements but zero implementation exists.

### 29.1 Web Application Firewall & DDoS Protection (8 Tasks)

> **Gap**: Architecture doc specifies WAF and DDoS protection at API gateway layer. Zero implementation. Enterprise customers require WAF for PCI-DSS, SOC 2, and insurance compliance.
> **Benchmark**: AWS WAF + Shield, Cloudflare Enterprise, Akamai Kona, Azure Front Door WAF

- [ ] Deploy WAF at API gateway layer (AWS WAF / Cloudflare / Azure Front Door — OWASP Core Rule Set, SQL injection detection, XSS prevention, request size limits, geo-blocking for sanctioned countries, rate-based rules, IP reputation lists, custom rules for HR-specific attack patterns)
- [ ] Implement DDoS protection with auto-mitigation (Layer 3/4 DDoS via cloud provider shield, Layer 7 DDoS via WAF rate rules, challenge-response for suspicious traffic, auto-scale origin during volumetric attacks, DDoS runbook with escalation, post-attack forensics report, SLA: mitigate within 10 minutes)
- [ ] Implement bot detection and mitigation (distinguish legitimate bots: search engines, monitoring; block malicious: credential stuffing, scraping, API abuse; CAPTCHA challenge for suspicious requests; device fingerprinting; behavioral analysis: request velocity, navigation patterns; bot traffic dashboard with classification breakdown)
- [ ] Configure Content Security Policy (CSP) headers (strict CSP: script-src 'self', style-src 'self' 'unsafe-inline' for Tailwind, connect-src to API domains only, frame-ancestors 'none', report-uri for violation tracking; CSP report analysis dashboard; nonce-based script loading for inline scripts; CSP violation alerting for potential XSS attempts)
- [ ] Implement API abuse detection and prevention (detect credential stuffing: failed auth rate per IP/user-agent; detect enumeration: sequential ID probing; detect data scraping: bulk export patterns; implement progressive challenges: CAPTCHA → block → IP ban; abuse detection ML model: learn normal patterns, flag anomalies; abuse dashboard with real-time threat level)
- [ ] Configure TLS certificate management and automation (Let's Encrypt or ACM for auto-renewal; certificate monitoring: expiry alerting 30/14/7 days; certificate transparency log monitoring for unauthorized certs; HSTS preload list submission; TLS 1.3 enforcement with fallback to 1.2; cipher suite hardening: ECDHE-RSA-AES256-GCM only; certificate pinning for mobile apps)
- [ ] Implement request signing for critical APIs (HMAC-SHA256 request signing for payroll, bank detail, and compensation APIs; timestamp-based replay protection with 5-minute window; per-tenant signing keys with rotation; signature verification middleware; signed request audit trail; integration SDKs with built-in signing)
- [ ] Deploy DNS security (DNSSEC validation; DNS-based threat intelligence feeds; DNS sinkholing for malware C&C domains; DNS query logging for security analytics; split-horizon DNS for internal services; DNS failover configuration; DNS TTL optimization for failover speed)

### 29.2 SIEM Integration & Security Monitoring (8 Tasks)

> **Gap**: Architecture doc specifies security event logging in SIEM-compatible format. Audit service logs 63 action types but not in SIEM format. No centralized security event correlation, no threat detection rules.
> **Benchmark**: Splunk Enterprise Security, Microsoft Sentinel, Elastic SIEM, Sumo Logic Cloud SIEM, CrowdStrike Falcon LogScale

- [ ] Implement SIEM integration for all security events (forward authentication events, authorization failures, API access logs, admin actions to SIEM via syslog/CEF/LEEF format; real-time streaming via Kafka or Fluentd; event enrichment with geo-IP, user context, tenant context; retention: 1 year hot, 7 years cold for compliance)
- [ ] Create security detection rules library (50+ detection rules: brute force, credential stuffing, privilege escalation, impossible travel, off-hours admin access, mass data export, API key abuse, session hijacking, account takeover, lateral movement; rule severity: INFO/LOW/MEDIUM/HIGH/CRITICAL; false positive tuning; MITRE ATT&CK mapping)
- [ ] Implement security incident response automation (SOAR playbooks: auto-lock account on confirmed compromise, auto-block IP on DDoS, auto-revoke API key on abuse, auto-notify security team; incident severity classification: SEV1-SEV4; incident timeline reconstruction; evidence preservation; post-incident review template; mean-time-to-detect and mean-time-to-respond tracking)
- [ ] Create insider threat detection (anomalous data access patterns: employee viewing many salary records, bulk profile downloads, off-hours sensitive data access; user behavior analytics (UBA): baseline normal behavior per role, alert on deviation; data loss prevention: block large exports without approval; insider threat risk scoring per employee)
- [ ] Implement vulnerability management program (weekly automated scanning: Snyk for dependencies, Trivy for containers, SonarQube for SAST, OWASP ZAP for DAST; vulnerability severity classification: CVSS scoring; remediation SLA: Critical <24h, High <7d, Medium <30d, Low <90d; vulnerability dashboard with trending; exception workflow for accepted risks)
- [ ] Create penetration testing program (quarterly external penetration tests by certified firm; annual red team exercise; continuous bug bounty program on HackerOne/Bugcrowd; penetration test scope: all public APIs, mobile app, web app, infrastructure; findings tracking with remediation verification; penetration test report distribution to stakeholders)
- [ ] Implement container runtime security (Falco or Sysdig for runtime threat detection; detect: container escape attempts, privilege escalation, cryptomining, reverse shells, unexpected network connections; immutable containers: read-only root filesystem; seccomp profiles per service; AppArmor/SELinux enforcement; container image signing with Cosign/Notary; admission controller to reject unsigned images)
- [ ] Create security compliance dashboard (real-time compliance posture: SOC 2 controls status, ISO 27001 controls, GDPR obligations; evidence auto-collection for each control; gap analysis: which controls are not met; remediation tracking per control; auditor-ready reports on demand; compliance score trending; next audit preparation checklist)

### 29.3 Third-Party Risk & Supply Chain Security (8 Tasks)

> **Gap**: Integration marketplace has 7 connectors but no vendor security assessment process. No SCA (software composition analysis) beyond npm audit. No SBOM generation. Supply chain attacks are a top enterprise concern post-SolarWinds/Log4Shell.
> **Benchmark**: Vanta, Drata, ServiceNow VRM, OneTrust Third-Party Risk, NIST SP 800-161

- [ ] Implement Software Bill of Materials (SBOM) generation (auto-generate CycloneDX/SPDX SBOM for every build; SBOM includes: direct + transitive dependencies, versions, licenses, known vulnerabilities; SBOM storage and versioning; SBOM diff between releases; SBOM sharing with enterprise customers on request; CI/CD integration: fail build on critical vulnerability in SBOM)
- [ ] Create vendor security assessment framework (security questionnaire template: SOC 2, encryption, access controls, incident response, data handling; risk scoring: inherent risk × control effectiveness; assessment frequency: annual for critical, biannual for high, as-needed for low; vendor risk register; vendor access monitoring; contractual security requirements template)
- [ ] Implement dependency vulnerability monitoring (continuous monitoring: Snyk/Dependabot/Renovate for auto-PR on vulnerable dependencies; license compliance: flag GPL/AGPL in commercial product; end-of-life dependency alerting; dependency health scoring: maintenance activity, community size, CVE history; monthly dependency audit report; zero-day response procedure)
- [ ] Create security awareness training automation (annual mandatory security training for all employees: phishing, social engineering, data handling, password hygiene; role-based modules: developer secure coding, admin privilege management, HR PII handling; phishing simulation campaigns: monthly, track click rates; training completion tracking with compliance deadlines; new hire security onboarding within 7 days)
- [ ] Implement data processing agreement (DPA) management (template DPA library per regulation: GDPR, UAE PDPL, KSA PDPL; automated DPA generation with vendor details; DPA tracking: which vendors have signed, which are pending; sub-processor notification workflow; DPA renewal reminders; cross-border transfer impact assessment per vendor)
- [ ] Create API integration security scanning (scan all third-party API integrations: OAuth token handling, data exposure, error disclosure; API security testing for each integration connector; rate limit validation per vendor API; credential storage audit for integration secrets; integration access review: which data flows to which vendor; integration kill-switch for emergency vendor disconnect)
- [ ] Implement open source license compliance (scan all dependencies for license compatibility; flag: GPL contamination in MIT/Apache project, AGPL in SaaS product, missing license files; license obligation tracking: attribution requirements, source code availability; approved license whitelist: MIT, Apache 2.0, BSD, ISC; legal review workflow for unknown licenses)
- [ ] Create security metrics and KPI dashboard (monthly security scorecard: vulnerability count by severity, MTTD, MTTR, phishing simulation results, security training completion, patch compliance, incident count; board-level security report: risk posture, major incidents, compliance status, security investment ROI; benchmark against industry peers; security maturity model progression tracking)

### 29.4 Data Protection & Privacy Operations (6 Tasks)

> **Gap**: GDPR/PDPL requirements are in Section 8.2 but operational privacy tooling is missing. No cookie consent platform, no privacy impact assessment tool, no breach notification automation, no cross-border data transfer mechanism.
> **Benchmark**: OneTrust, TrustArc, BigID, Securiti.ai

- [ ] Implement privacy impact assessment (PIA/DPIA) tooling (template-based DPIA workflow per GDPR Article 35; automated risk scoring: data volume, sensitivity, processing purpose, retention; DPA review integration; DPIA approval workflow: privacy officer → legal → DPO; DPIA registry searchable by processing activity; DPIA review triggers: new feature, new vendor, data breach)
- [ ] Create data breach notification automation (breach detection → classification: personal data affected, severity, scope → notification timeline: 72 hours for GDPR supervisory authority, without undue delay for UAE PDPL, 72 hours for KSA SDAIA; affected individual notification template; breach register; breach post-mortem template; regulatory response preparation; breach simulation drills quarterly)
- [ ] Implement cross-border data transfer mechanisms (Standard Contractual Clauses (SCCs) for EU data; UAE PDPL adequacy assessment for international transfers; KSA PDPL cross-border transfer approval workflow; data localization enforcement: GCC data stays in GCC region; transfer impact assessment per destination country; data residency dashboard showing where each data type is stored)
- [ ] Create cookie consent and preference management (cookie consent banner with granular categories: essential, analytics, marketing, third-party; consent storage with timestamp and version; consent withdrawal with downstream propagation to analytics/marketing tools; geo-based consent rules: GDPR opt-in, US opt-out; consent audit trail for regulators; preference center integration with notification preferences)
- [ ] Implement data discovery and classification automation (scan all databases for PII/PHI/PCI fields; auto-classify using pattern matching: email, phone, SSN, bank account, salary; confidence scoring for classification; classification inheritance to derived datasets; data map: which PII exists where, who has access, how long retained; monthly data inventory report; unclassified data alerting)
- [ ] Create privacy-by-design review process (privacy review checkpoint in development lifecycle; privacy checklist per feature: data minimization, purpose limitation, storage limitation, consent requirements; privacy review approval gate before production deployment; privacy design patterns library; developer privacy training; privacy champion program per engineering team)

---

## Section 30: CLOUD INFRASTRUCTURE, FINOPS & DEVELOPER EXPERIENCE (26 Tasks)

> **Gap Source**: Architecture doc v4.1 specifies multi-region deployment, CDN, blue-green/canary releases, but no FinOps, no developer portal, no internal developer platform, no capacity planning automation. These are essential for enterprise cloud operations at scale.
> **Existing Foundation**: Docker Compose for 10 services, Kubernetes manifests (auth-service only), empty Terraform/Helm directories, Kong API gateway, Istio service mesh (auth-service only)
> **Benchmark**: AWS Well-Architected Framework, Azure Cloud Adoption Framework, Google Cloud Architecture Framework, FinOps Foundation, Backstage.io, Port.io

### 30.1 Multi-Region & CDN Architecture (8 Tasks)

> **Gap**: Architecture doc specifies multi-region with Primary (UAE Central) + DR (UAE North/Bahrain). CDN layer shown in architecture diagram but zero CDN tasks exist. No edge computing, no regional data routing.
> **Benchmark**: AWS CloudFront + Global Accelerator, Cloudflare CDN, Azure Front Door, Akamai

- [ ] Configure CDN for static assets and API acceleration (CloudFront/Cloudflare distribution for: Next.js static assets, fonts, images, JS bundles with immutable cache headers; API acceleration for read-heavy endpoints; cache invalidation on deployment; custom domain with TLS; geo-restriction for sanctioned countries; CDN access logs for analytics; cost optimization: cache hit ratio >95% target)
- [ ] Implement multi-region active-passive architecture (Primary: UAE/GCC region with all services; DR: secondary region with read replicas + standby services; RPO <1 hour, RTO <4 hours per architecture spec; automated health monitoring with DNS failover; data replication lag monitoring; quarterly failover drill automation; runbook for manual failover; cost optimization: scale-down DR during normal operations)
- [ ] Configure regional data routing for data residency (route GCC tenant data to GCC region, EU data to EU region, India data to India region; data residency metadata per tenant; cross-region API routing based on tenant location; data residency compliance dashboard; prevent cross-region data leakage; data residency audit report for regulators; configurable per data classification level)
- [ ] Implement edge caching for employee self-service (edge-cached responses for: employee profile, leave balance, org chart, company announcements, policy documents; cache invalidation via event-driven purge; personalization at edge: language, currency, timezone; edge computing for: attendance GPS validation, document thumbnail generation; latency target: <100ms for cached responses globally)
- [ ] Create global load balancing with health-aware routing (DNS-based global load balancing: Route 53 / Cloudflare LB; health check probes per region per service; automatic traffic rerouting on regional failure; weighted routing for gradual region migration; latency-based routing for optimal user experience; traffic analytics per region; capacity monitoring with auto-scale triggers)
- [ ] Implement asset optimization pipeline (image optimization: WebP/AVIF conversion, responsive srcsets, lazy loading; JavaScript: tree-shaking verification, bundle splitting per route, compression: Brotli > gzip; CSS: PurgeCSS for unused styles, critical CSS inlining; font optimization: subset, preload, font-display: swap; performance budget: <200KB JS per route, <50KB CSS; automated Lighthouse CI checks)
- [ ] Configure multi-region database replication (PostgreSQL streaming replication: primary → read replicas per region; replication lag monitoring: alert at >5s, critical at >30s; promote replica procedure with data verification; conflict resolution for multi-master scenarios; region-specific connection strings in application config; read-replica routing for analytics queries; backup per region with cross-region archival)
- [ ] Implement content delivery for document storage (S3/Blob storage with CloudFront for document delivery; pre-signed URLs with configurable expiry per document sensitivity; origin access identity to prevent direct S3 access; document watermarking at edge; bandwidth optimization: range requests for large files; geographic redundancy for document storage; storage class lifecycle: Standard → IA → Glacier based on access patterns)

### 30.2 FinOps & Cloud Cost Optimization (10 Tasks)

> **Gap**: Zero FinOps implementation. Enterprise multi-tenant platforms must track cost per tenant, optimize cloud spend, and provide billing transparency. This is critical for sustainable unit economics.
> **Benchmark**: FinOps Foundation Framework, AWS Cost Explorer, CloudHealth, Spot.io, Kubecost

- [ ] Implement cloud cost tagging strategy (mandatory tags: environment, service, tenant, team, cost-center; tag enforcement via AWS SCP / Azure Policy; untagged resource alerting; tag compliance dashboard; tag-based cost allocation reports; tag propagation to child resources; monthly tag audit with remediation)
- [ ] Create per-tenant cost attribution model (track compute, storage, bandwidth, database, and queue costs per tenant; cost allocation keys: CPU time × memory × duration per API request; storage: per-tenant S3 prefix size; database: query cost estimation per tenant; monthly per-tenant cost report; cost anomaly detection per tenant; margin analysis per tenant tier)
- [ ] Implement reserved capacity and savings plans (analyze usage patterns: stable baseline vs burst; purchase reserved instances for baseline (DB, Redis, core services); savings plans for compute; spot instances for batch processing: payroll, reports, AI training; reserved capacity renewal calendar; savings tracking dashboard; break-even analysis per commitment)
- [ ] Create cost anomaly detection and alerting (ML-based anomaly detection on daily cloud spend; per-service cost monitoring; alert thresholds: 20% daily increase, 50% weekly increase; root cause identification: which service/tenant/feature caused spike; automated remediation: scale-down orphaned resources, right-size over-provisioned instances; weekly cost review meeting cadence)
- [ ] Implement right-sizing automation (analyze resource utilization: CPU, memory, disk, network per container; recommend right-sized instances: downsize if avg utilization <30%; Kubernetes VPA (Vertical Pod Autoscaler) for automatic right-sizing; right-sizing recommendations with cost impact; quarterly right-sizing review; historical utilization reports; environment-specific sizing: dev smaller than prod)
- [ ] Create cloud budget management and forecasting (annual cloud budget per environment per service; monthly budget tracking with burn-rate alerts; budget forecast: extrapolate current trend to month/quarter/year end; budget approval workflow for overage; budget reallocation between services; showback reports for engineering teams; board-level cloud cost summary)
- [ ] Implement idle resource cleanup automation (detect: stopped EC2/VMs, unattached EBS/disks, unused Elastic IPs, empty S3 buckets, orphaned snapshots, idle load balancers; auto-terminate dev/staging resources after business hours; idle resource report with estimated savings; cleanup approval workflow for production; scheduled cleanup jobs; cost savings tracking)
- [ ] Create Kubernetes cost optimization (Kubecost or OpenCost deployment; per-namespace/per-pod cost tracking; cluster right-sizing recommendations; node pool optimization: spot vs on-demand mix; resource quota enforcement per namespace; cost allocation to teams via labels; idle pod detection; over-provisioned container recommendations; cluster autoscaler cost-efficiency metrics)
- [ ] Implement data transfer cost optimization (analyze cross-AZ, cross-region, and internet egress costs; optimize: use VPC endpoints for AWS services, CDN for public content, compression for API responses; data transfer budget per service; regional data processing: process data near storage; API response pagination to reduce payload size; GraphQL to reduce over-fetching; monthly data transfer report)
- [ ] Create sustainability and carbon footprint tracking (track cloud carbon emissions per service: AWS Customer Carbon Footprint Tool / Azure Emissions Dashboard; carbon-aware scheduling: batch jobs during low-carbon grid periods; green region selection for non-latency-sensitive workloads; sustainability report for ESG compliance; carbon reduction targets and tracking; energy-efficient instance type selection)

### 30.3 Developer Experience & API Economy (8 Tasks)

> **Gap**: Architecture doc specifies OpenAPI/Swagger documentation and SDK generation. No developer portal, API sandbox, or internal developer platform exists. Enterprise API products need developer-facing tooling for partner/customer integrations.
> **Benchmark**: Backstage.io, Port.io, Stripe Developer Portal, Twilio Developer Portal

- [ ] Create API developer portal (branded developer portal: API reference docs auto-generated from OpenAPI specs, getting started guides, authentication flow documentation, code samples in TypeScript/Python/Java/C#, rate limit documentation per endpoint, changelog with breaking change alerts, sandbox environment credentials, community forum/Q&A; portal hosted at developers.kreupai.com)
- [ ] Implement API sandbox environment (isolated sandbox per developer/partner: separate database with synthetic data, sandbox API keys with rate limits, sandbox webhook testing with request inspector, mock responses for external integrations: WPS/GOSI/PF, sandbox data reset on demand, sandbox usage analytics, sandbox → production migration guide)
- [ ] Create SDK generation pipeline (auto-generate typed client SDKs from OpenAPI spec: TypeScript/JavaScript (npm), Python (pip), Java (Maven), C# (.NET NuGet); SDK versioning aligned with API versions; SDK includes: authentication helpers, pagination utilities, error handling, retry logic, type definitions; SDK documentation with examples; SDK CI/CD: auto-publish on API change; SDK usage telemetry)
- [ ] Implement internal developer platform (Backstage-based service catalog: all 10 microservices with ownership, documentation, API specs, runbooks; scaffolding templates: create new service/component/library from template; CI/CD visibility: build status, deployment history per service; dependency graph visualization; tech radar: approved technologies; documentation hub: ADRs, RFCs, design docs; onboarding checklist for new engineers)
- [ ] Create API versioning and lifecycle management (URL-based versioning: /api/v1/, /api/v2/; sunset policy: 12-month minimum support after deprecation notice; Sunset and Deprecation HTTP headers; version migration guide per breaking change; API version usage analytics: which tenants use which versions; automated compatibility testing between versions; version negotiation via Accept-Version header)
- [ ] Implement webhook developer experience (webhook event catalog: list all available events with payload schemas; webhook testing tool: send test events to registered URLs; webhook request inspector: view request/response for debugging; webhook retry visualization: show delivery attempts with status codes; webhook security documentation: signature verification guide per language; webhook payload versioning)
- [ ] Create API usage analytics and monetization foundation (per-API-key usage tracking: requests, bandwidth, error rate; usage tiers: free (1K req/day), growth (100K), enterprise (unlimited); overage alerting and throttling; usage dashboard for API consumers; billing integration: usage-based invoicing per API key; top consumer analysis; API performance per consumer; fair-use policy enforcement)
- [ ] Implement GitOps deployment workflow (ArgoCD or FluxCD for declarative Kubernetes deployments; Git as single source of truth: all K8s manifests in Git; auto-sync: changes to Git → automatic deployment; manual sync gate for production; drift detection: alert when cluster state diverges from Git; rollback via Git revert; deployment audit trail via Git history; multi-cluster GitOps for dev/staging/prod)

---

## Section 31: AI GOVERNANCE, MLOPS & RESPONSIBLE AI (20 Tasks)

> **Gap Source**: Architecture doc v4.1 AI Service section specifies predictive analytics, NLP, recommendations. Section 7 covers AI capabilities but ZERO governance, ZERO MLOps pipeline, ZERO bias detection, ZERO model monitoring. EU AI Act (effective 2025) and MENA AI regulations require governance for HR AI systems classified as "high-risk."
> **Existing Foundation**: ai-service (port 3006), predictiveService (335L), resumeParsingService, recommendationService, AttritionPredictionService (828L), WorkforceAnalyticsService (847L), SentimentAnalysis, agentic AI framework (hr-agent, recruitment-agent, analytics-agent)
> **Benchmark**: MLflow, Weights & Biases, Amazon SageMaker, Google Vertex AI, Microsoft Responsible AI Toolkit, EU AI Act High-Risk Requirements

### 31.1 ML Pipeline & Model Lifecycle Management (8 Tasks)

> **Gap**: All AI services use inline model logic with hardcoded weights. No ML pipeline, no model registry, no experiment tracking, no A/B testing, no model retraining automation. Enterprise AI requires reproducible, auditable ML pipelines.
> **Benchmark**: MLflow, Kubeflow, Amazon SageMaker Pipelines, Google Vertex AI Pipelines

- [ ] Create ML model registry and versioning (centralized model registry: model name, version, training dataset, hyperparameters, metrics, artifact storage; model lifecycle states: development → staging → production → archived; model approval workflow: data scientist → ML engineer → product owner; model comparison dashboard; model lineage: which data → which features → which model → which predictions; model rollback capability)
- [ ] Implement ML experiment tracking (track all experiments: hyperparameters, training metrics, validation metrics, training duration, resource utilization; experiment comparison: side-by-side metric comparison across runs; artifact logging: model weights, feature importance, confusion matrices; reproducibility: capture exact code version, data snapshot, environment for each experiment; team collaboration: shared experiment dashboard)
- [ ] Create automated model retraining pipeline (scheduled retraining: attrition model monthly, recommendation model weekly, sentiment model quarterly; trigger-based retraining: data drift detected, performance degradation; retraining pipeline: fetch latest data → feature engineering → train → evaluate → compare with production → auto-promote if better; retraining audit trail; retraining cost tracking)
- [ ] Implement feature store for ML features (centralized feature definitions: employee tenure, compensation ratio, performance trend, engagement score, absence pattern; feature computation pipeline: batch (daily) + real-time (event-driven); feature versioning: track feature schema changes; feature sharing across models; feature freshness monitoring; feature lineage: which source data → which features; feature access control per model/team)
- [ ] Create model serving infrastructure (model serving API: versioned endpoints per model; A/B testing: route traffic between model versions; shadow mode: run new model alongside production without affecting users; model warm-up on deployment; auto-scaling based on prediction request volume; model latency monitoring: P50 <100ms, P99 <500ms; model serving cost per prediction; canary deployment for model updates)
- [ ] Implement model performance monitoring and drift detection (monitor: prediction accuracy, precision, recall, F1 score in production; data drift detection: compare incoming data distribution vs training data; concept drift: model predictions diverging from ground truth; performance alerts: alert when accuracy drops below threshold; drift dashboard with trend visualization; automated investigation: which features drifted?)
- [ ] Create ML data pipeline for training datasets (ETL pipeline: extract employee data → anonymize PII → create features → split train/test/validation; data versioning: DVC or similar for dataset snapshots; data quality validation: completeness, consistency, freshness; bias detection in training data: demographic balance; data catalog: available datasets with descriptions, schemas, freshness; synthetic data generation for imbalanced classes)
- [ ] Implement model A/B testing framework (define A/B experiments: control model vs challenger model; traffic splitting: configurable percentage per model; statistical significance calculation: sample size estimation, p-value tracking; guardrail metrics: ensure no regression on critical metrics; experiment duration: minimum required sample before conclusion; experiment report with confidence intervals; winner auto-promotion with rollback)

### 31.2 Responsible AI & Compliance (12 Tasks)

> **Gap**: EU AI Act classifies employment/HR AI as "high-risk" requiring: transparency, human oversight, bias testing, data governance, technical documentation. UAE AI regulations (National AI Strategy 2031) and KSA (SDAIA AI Ethics) also mandate responsible AI. Zero compliance implementation exists.
> **Benchmark**: EU AI Act (Regulation 2024/1689), IEEE 7000, NIST AI RMF 1.0, Microsoft Responsible AI Standard, Google AI Principles

- [ ] Implement AI bias detection and fairness testing (bias testing for all HR AI models: hiring, performance, compensation, attrition prediction; protected attributes: gender, age, nationality, disability, religion; fairness metrics: demographic parity, equal opportunity, equalized odds, calibration; disparate impact testing: 4/5ths rule; bias testing report per model version; remediation recommendations; bias testing in CI/CD: block model deployment on fairness violation)
- [ ] Create AI explainability (XAI) framework (global explanations: feature importance ranking per model; local explanations: per-prediction SHAP/LIME values explaining why this employee was flagged; counterfactual explanations: "what would need to change for a different prediction?"; explanation delivery: dashboard for HR, API for integrations; explanation language: non-technical summaries for HR users; explanation audit trail)
- [ ] Implement human-in-the-loop oversight for high-stakes AI decisions (AI recommendations flagged for human review: attrition risk → HR reviews before action, hiring match → recruiter validates, compensation recommendation → manager approves; override tracking: when and why humans override AI; override feedback loop: retrain model with override data; no autonomous termination/hiring/compensation decisions without human approval)
- [ ] Create AI transparency and documentation (EU AI Act Article 13 compliance: technical documentation per AI system; model card: intended use, training data description, performance metrics, limitations, ethical considerations; data card: data sources, collection methods, preprocessing, known biases; user-facing transparency: "This recommendation is AI-generated" labels; AI system registry: all deployed AI systems with risk classification)
- [ ] Implement AI risk assessment framework (EU AI Act risk classification: unacceptable → high → limited → minimal; HR AI classification: recruitment screening (high), attrition prediction (high), chatbot (limited), analytics (minimal); risk-appropriate controls per level; conformity assessment documentation; post-market monitoring plan; AI incident reporting procedure; annual AI system audit)
- [ ] Create AI ethics review board process (AI ethics committee: cross-functional with HR, legal, engineering, DEI; ethics review triggers: new AI use case, model trained on sensitive data, automated decision affecting employees; ethics review checklist: fairness, transparency, accountability, privacy, safety; ethics review decisions: approve/modify/reject; ethics policy document with principles; quarterly ethics review of all active AI systems)
- [ ] Implement AI audit trail and accountability (log all AI predictions: input features, model version, prediction output, confidence score, timestamp, requesting user; prediction outcome tracking: was the prediction correct? what action was taken?; model decision audit: auditor can reconstruct any prediction; AI audit export for regulators; AI audit retention: 7 years for employment decisions; tamper-evident AI audit log)
- [ ] Create AI data governance for model training (training data consent: explicit consent for using employee data in AI models per GDPR Art. 22; data minimization: use only necessary features; data retention for training: configurable per regulation; right to object: employee can opt-out of AI profiling; data anonymization for model training: k-anonymity, differential privacy; cross-border training data compliance)
- [ ] Implement AI model robustness testing (adversarial testing: test model resilience to manipulated inputs; edge case testing: extreme values, missing data, unusual combinations; stress testing: performance under high load; degradation testing: model behavior when data quality drops; regression testing: ensure new model version doesn't break existing capabilities; robustness report per model version)
- [ ] Create AI incident response procedure (AI incident classification: incorrect prediction with material harm, biased outcome detected, data leak from AI system, model producing nonsensical output; incident response steps: contain → investigate → remediate → communicate → prevent; model emergency rollback procedure; affected employee notification template; regulatory notification for AI incidents; AI incident register with lessons learned)
- [ ] Implement differential privacy for analytics (differential privacy for aggregate HR analytics: ensure individual employee data cannot be reconstructed from analytics results; epsilon budget per query; noise injection for small group analytics: minimum group size 5 for department reports; privacy budget tracking; utility-privacy tradeoff configuration per report type; privacy-preserving benchmarking data sharing)
- [ ] Create AI carbon footprint and sustainability tracking (track compute resources per AI training job: GPU hours, energy consumption, carbon emissions; carbon budget per model: limit training iterations; efficient model selection: prefer smaller models with acceptable accuracy; model compression: quantization, pruning, distillation for production inference; green AI reporting: carbon per prediction; sustainability in model selection criteria)

---

## ============================================================

## SUMMARY

## ============================================================

| Section                                            | Tasks     | Status            | Priority | % of Total |
| -------------------------------------------------- | --------- | ----------------- | -------- | ---------- |
| **1. Frontend**                                    | 189       | COMPLETED         | —        | 9.7%       |
| **2. Backend**                                     | 143       | COMPLETED         | —        | 7.3%       |
| **3. Seeds & Data**                                | 206       | 78 DONE + 128 NEW | P0-P1    | 9.9%       |
| **4. Backend-UI Integration**                      | 183       | 77 DONE + 106 NEW | P0-P1    | 8.4%       |
| **5. Enterprise Infrastructure**                   | 92        | NEW               | P0-P1    | 4.7%       |
| **6. MENA/APAC Compliance**                        | 68        | NEW               | P0       | 3.5%       |
| **7. AI/ML & Advanced Analytics**                  | 52        | NEW               | P1       | 2.7%       |
| **8. Security & Data Governance**                  | 76        | NEW               | P0-P1    | 3.9%       |
| **9. DevOps, Testing & Observability**             | 90        | NEW               | P1       | 4.6%       |
| **10. Global HR Operations**                       | 124       | NEW               | P0-P1    | 6.4%       |
| **11. Advanced Payroll Engine**                    | 48        | NEW               | P0       | 2.5%       |
| **12. Advanced Time & Shift Management**           | 28        | NEW               | P1       | 1.4%       |
| **13. Employee Engagement & Communication**        | 36        | NEW               | P1-P2    | 1.8%       |
| **14. Statutory Reports & Government Filings**     | 24        | NEW               | P0       | 1.2%       |
| **15. Enterprise Mobile Experience**               | 96        | NEW               | P1       | 4.9%       |
| **16. Enterprise Backend Platform**                | 78        | NEW               | P0-P1    | 4.0%       |
| **17. Enterprise Employee Self-Service**           | 76        | NEW               | P0       | 3.9%       |
| **18. Enterprise Benefits & Insurance**            | 62        | NEW               | P0-P1    | 3.2%       |
| **19. Enterprise Payroll Engine**                  | 42        | NEW               | P0       | 2.2%       |
| **20. Enterprise Recruitment & Talent**            | 48        | NEW               | P1       | 2.5%       |
| **21. Enterprise Learning & Development**          | 46        | NEW               | P1       | 2.4%       |
| **22. Enterprise Time & Attendance**               | 40        | NEW               | P0-P1    | 2.1%       |
| **23. Enterprise Analytics & People Intel**        | 44        | NEW               | P1       | 2.3%       |
| **24. Enterprise Admin & Platform**                | 50        | NEW               | P1       | 2.6%       |
| **25. Enterprise Database & Data Platform**        | 46        | NEW               | P1       | 2.4%       |
| **26. Enterprise Job Processing & Events**         | 38        | NEW               | P1       | 2.0%       |
| **27. Enterprise Microservices & Service Mesh**    | 38        | NEW               | P1-P2    | 2.0%       |
| **28. Enterprise Seed Data & Master Data Mgmt**    | 44        | NEW               | P1       | 2.3%       |
| **29. Enterprise Security Ops & Threat Mgmt**      | 30        | NEW               | P0-P1    | 1.5%       |
| **30. Cloud Infra, FinOps & Developer Experience** | 26        | NEW               | P1       | 1.3%       |
| **31. AI Governance, MLOps & Responsible AI**      | 20        | NEW               | P1       | 1.0%       |
| **TOTAL**                                          | **1,949** | —                 | —        | **100%**   |

---

### Completion Tracking

```
COMPLETED SECTIONS (v1.0):
Frontend:         [████████████████████] 189/189 (100%)
Backend:          [████████████████████] 143/143 (100%)
Seeds & Data:     [███████░░░░░░░░░░░░░] 78/206  (37.9%)
Backend-UI:       [████████░░░░░░░░░░░░] 77/183  (42.1%)
─────────────────────────────────────────────────
Subtotal v1.0:    [███████████░░░░░░░░░] 487/721 (67.5%)

ENTERPRISE GRADE (v2.0 — Sections 5-9):
Infrastructure:   [░░░░░░░░░░░░░░░░░░░░] 0/92   (0%)
MENA/APAC:        [░░░░░░░░░░░░░░░░░░░░] 0/68   (0%)
AI/ML:            [░░░░░░░░░░░░░░░░░░░░] 0/52   (0%)
Security:         [░░░░░░░░░░░░░░░░░░░░] 0/76   (0%)
DevOps/Testing:   [░░░░░░░░░░░░░░░░░░░░] 0/90   (0%)
─────────────────────────────────────────────────
Subtotal v2.0:    [░░░░░░░░░░░░░░░░░░░░] 0/378  (0%)

ENTERPRISE MODULES (v3.0 — Sections 10-22):
Global HR Ops:    [░░░░░░░░░░░░░░░░░░░░] 0/124  (0%)
Payroll Engine:   [░░░░░░░░░░░░░░░░░░░░] 0/48   (0%)
Time & Shift:     [░░░░░░░░░░░░░░░░░░░░] 0/28   (0%)
Engagement:       [░░░░░░░░░░░░░░░░░░░░] 0/36   (0%)
Statutory Reports:[░░░░░░░░░░░░░░░░░░░░] 0/24   (0%)
Mobile Enterprise:[░░░░░░░░░░░░░░░░░░░░] 0/96   (0%)
Backend Platform: [░░░░░░░░░░░░░░░░░░░░] 0/78   (0%)
ESS Enterprise:   [░░░░░░░░░░░░░░░░░░░░] 0/76   (0%)
Benefits & Ins:   [░░░░░░░░░░░░░░░░░░░░] 0/62   (0%)
Ent. Payroll:     [░░░░░░░░░░░░░░░░░░░░] 0/42   (0%)
Ent. Recruitment: [░░░░░░░░░░░░░░░░░░░░] 0/48   (0%)
Ent. Learning:    [░░░░░░░░░░░░░░░░░░░░] 0/46   (0%)
Ent. Time & Att:  [░░░░░░░░░░░░░░░░░░░░] 0/40   (0%)
Ent. Analytics:   [░░░░░░░░░░░░░░░░░░░░] 0/44   (0%)
Ent. Admin/Plat:  [░░░░░░░░░░░░░░░░░░░░] 0/50   (0%)
Ent. Database:    [░░░░░░░░░░░░░░░░░░░░] 0/46   (0%)
Ent. Jobs/Events: [░░░░░░░░░░░░░░░░░░░░] 0/38   (0%)
Ent. Microservices:[░░░░░░░░░░░░░░░░░░░░] 0/38   (0%)
Ent. Seed/MDM:    [░░░░░░░░░░░░░░░░░░░░] 0/44   (0%)
─────────────────────────────────────────────────
Subtotal v3.0:    [░░░░░░░░░░░░░░░░░░░░] 0/1008 (0%)

ENTERPRISE SECURITY & CLOUD (v4.0 — Sections 29-31):
SecOps & Threat:  [░░░░░░░░░░░░░░░░░░░░] 0/30   (0%)
Cloud & FinOps:   [░░░░░░░░░░░░░░░░░░░░] 0/26   (0%)
AI Gov & MLOps:   [░░░░░░░░░░░░░░░░░░░░] 0/20   (0%)
─────────────────────────────────────────────────
Subtotal v4.0:    [░░░░░░░░░░░░░░░░░░░░] 0/76   (0%)

═════════════════════════════════════════════════
OVERALL:          [████░░░░░░░░░░░░░░░░░] 487/2183 (22.3%)
```

---

### Priority Matrix (All Enterprise Sections)

| Priority                  | Section                                       | Tasks | Business Impact                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------- | --------------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **P0 — Revenue Blocking** | 17.1 Expense & Reimbursement                  | 14    | Every enterprise customer needs expense management                                                                                                                                                                                                                                                                                                                                                                                                           |
| **P0 — Revenue Blocking** | 17.2 Profile Change Requests                  | 12    | Bank/address changes are daily HR operations                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **P0 — Revenue Blocking** | 6.1 UAE WPS                                   | 9     | Cannot sell in UAE without WPS                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **P0 — Revenue Blocking** | 6.2 KSA GOSI                                  | 7     | Cannot sell in KSA without GOSI                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **P0 — Revenue Blocking** | 6.4 India PF/ESI/TDS                          | 11    | Cannot enter India market                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| **P0 — Revenue Blocking** | 14.1-14.3 Statutory Reports                   | 24    | Payroll useless without statutory output                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **P0 — Revenue Blocking** | 11.4 Full & Final Settlement                  | 10    | Every termination needs F&F                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **P0 — Revenue Blocking** | 10.4 Visa/Immigration (MENA)                  | 18    | Every GCC customer requires visa tracking                                                                                                                                                                                                                                                                                                                                                                                                                    |
| **P0 — Revenue Blocking** | 16.1 Bulk Data Operations                     | 10    | Every enterprise deal needs mass import                                                                                                                                                                                                                                                                                                                                                                                                                      |
| **P0 — Revenue Blocking** | 21.3 Compliance Training Engine               | 8     | SOX/HIPAA/OSHA mandatory training is legally required                                                                                                                                                                                                                                                                                                                                                                                                        |
| **P0 — Revenue Blocking** | 22.4 FMLA & Extended Leave Mgmt               | 8     | US employers 50+ employees must track FMLA                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **P0 — Revenue Blocking** | 22.2 Advanced Labor Compliance                | 8     | FLSA/predictive scheduling laws are legal requirements                                                                                                                                                                                                                                                                                                                                                                                                       |
| **P0 — Revenue Blocking** | 19.1 Global Payroll Operations                | 10    | Multi-country customers need consolidated payroll                                                                                                                                                                                                                                                                                                                                                                                                            |
| **P0 — Revenue Blocking** | 19.4 Payroll Integration Hub                  | 8     | Enterprise customers need GL/bank/govt filing                                                                                                                                                                                                                                                                                                                                                                                                                |
| **P0 — Revenue Blocking** | 18.1 Benefits Claims Processing               | 10    | Claims adjudication is core benefits function                                                                                                                                                                                                                                                                                                                                                                                                                |
| **P0 — Revenue Blocking** | 18.2 COBRA / Continuation Coverage            | 8     | US federal mandate for 20+ employee companies                                                                                                                                                                                                                                                                                                                                                                                                                |
| **P1 — Competitive**      | 23.6 Compliance & Audit Analytics             | 8     | SOX/SOC 2/ISO 27001 audit evidence is sales blocker                                                                                                                                                                                                                                                                                                                                                                                                          |
| **P1 — Competitive**      | 23.2 Self-Service BI & Visualization          | 8     | NLQ and drag-and-drop BI expected by enterprise HR                                                                                                                                                                                                                                                                                                                                                                                                           |
| **P1 — Competitive**      | 23.3 Advanced People Modeling                 | 8     | CHRO scenario modeling is top-3 Visier feature                                                                                                                                                                                                                                                                                                                                                                                                               |
| **P1 — Competitive**      | 21.1 SCORM/xAPI Content Runtime               | 8     | Enterprise L&D teams require SCORM for 3rd-party content                                                                                                                                                                                                                                                                                                                                                                                                     |
| **P1 — Competitive**      | 21.4 External Content Integration             | 6     | LinkedIn Learning/Udemy/Coursera integration expected                                                                                                                                                                                                                                                                                                                                                                                                        |
| **P1 — Competitive**      | 22.1 AI-Powered Scheduling Engine             | 8     | Match UKG/Ceridian auto-scheduling capabilities                                                                                                                                                                                                                                                                                                                                                                                                              |
| **P1 — Competitive**      | 22.3 Workforce Analytics Dashboard            | 8     | Real-time headcount and absence cost is table stakes                                                                                                                                                                                                                                                                                                                                                                                                         |
| **P1 — Competitive**      | 19.2 Pay Equity & Compensation Analytics      | 8     | US/EU pay transparency laws require equity analysis                                                                                                                                                                                                                                                                                                                                                                                                          |
| **P1 — Competitive**      | 19.5 Payroll Audit & Compliance               | 8     | SOX compliance required for publicly traded customers                                                                                                                                                                                                                                                                                                                                                                                                        |
| **P1 — Competitive**      | 19.3 Advanced Deduction & Earnings Engine     | 8     | Commission, tips, shift differentials are table stakes                                                                                                                                                                                                                                                                                                                                                                                                       |
| **P1 — Competitive**      | 20.1 Talent CRM & Pipeline Nurturing          | 10    | Every enterprise recruiting team needs talent CRM                                                                                                                                                                                                                                                                                                                                                                                                            |
| **P1 — Competitive**      | 20.4 DEI in Hiring                            | 8     | EEO-1 reporting legally required, DEI analytics expected                                                                                                                                                                                                                                                                                                                                                                                                     |
| **P1 — Competitive**      | 20.6 Recruitment Operations & Analytics       | 8     | Budget tracking and SLA management for recruiting teams                                                                                                                                                                                                                                                                                                                                                                                                      |
| **P1 — Competitive**      | 18.3 Life Insurance & AD&D                    | 8     | Standard benefit offering in enterprise HCM                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **P1 — Competitive**      | 18.4 Benefits Compliance & Tax Reporting      | 8     | ACA 1095-B/C, ERISA, IRS Form 8889 required                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **P1 — Competitive**      | 18.5 Provider Directory & Care Navigation     | 8     | Match Zenefits/Gusto provider search features                                                                                                                                                                                                                                                                                                                                                                                                                |
| **P1 — Competitive**      | 17.3 IT Service Desk / Helpdesk               | 12    | Employee support is core ESS feature                                                                                                                                                                                                                                                                                                                                                                                                                         |
| **P1 — Competitive**      | 17.5 Salary Advance & Loan                    | 8     | Standard in MENA/India HCM                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **P1 — Competitive**      | 17.7 Letter Self-Service                      | 8     | Employees self-request salary cert, NOC, experience                                                                                                                                                                                                                                                                                                                                                                                                          |
| **P1 — Competitive**      | 17.8 Task Aggregation & Calendar              | 6     | Unified ESS dashboard is expected                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **P1 — Competitive**      | 16.3 Report Generation Engine                 | 10    | Enterprise customers require server-side reports                                                                                                                                                                                                                                                                                                                                                                                                             |
| **P1 — Competitive**      | 16.4 Notification Orchestration               | 10    | Multi-channel notifications are table stakes                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **P1 — Competitive**      | 16.6 Audit Trail & CDC                        | 8     | SOC 2/ISO 27001 compliance requirement                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **P1 — Competitive**      | 15.2 Mobile Manager Experience                | 16    | Managers won't adopt without mobile approvals                                                                                                                                                                                                                                                                                                                                                                                                                |
| **P1 — Competitive**      | 15.3 Mobile Employee Self-Service             | 20    | 60%+ of HR interactions happen on mobile                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **P1 — Competitive**      | 15.1 Mobile Component Library                 | 14    | Foundation for all mobile screens                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **P1 — Competitive**      | 15.5 Mobile Security Hardening                | 18    | Enterprise security requirement for MDM/MAM                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **P1 — Competitive**      | 10.1 Succession Planning                      | 14    | Top-5 enterprise buyer requirement                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **P1 — Competitive**      | 10.5 Exit Management                          | 14    | Every HR process needs exit workflow                                                                                                                                                                                                                                                                                                                                                                                                                         |
| **P1 — Competitive**      | 11.1 Salary Structure Builder                 | 10    | India/MENA customers need multi-component                                                                                                                                                                                                                                                                                                                                                                                                                    |
| **P1 — Competitive**      | 7.2 Agentic AI                                | 18    | Match Darwinbox/Oracle                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **P1 — Competitive**      | 8.1 Advanced Security                         | 18    | Enterprise sales requirement                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **P1 — Competitive**      | 8.4 Multi-Tenancy                             | 12    | Enterprise sales requirement                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **P1 — Competitive**      | 10.3 Employee Relations                       | 14    | Enterprise HR operations must-have                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **P1 — Competitive**      | 13.1 Pulse Surveys                            | 12    | Match Culture Amp / Qualtrics                                                                                                                                                                                                                                                                                                                                                                                                                                |
| **P0 — Revenue Blocking** | 24.6 Data Governance & Compliance             | 8     | GDPR/CCPA compliance legally required, audit persistence not wired                                                                                                                                                                                                                                                                                                                                                                                           |
| **P0 — Revenue Blocking** | 24.3 Enterprise Access Governance             | 8     | SoD rules and access certification required for SOX/SOC 2                                                                                                                                                                                                                                                                                                                                                                                                    |
| **P0 — Revenue Blocking** | 24.1 Process Automation & Workflow            | 10    | Delegation rules and SLA escalation needed for any approval workflow                                                                                                                                                                                                                                                                                                                                                                                         |
| **P1 — Competitive**      | 24.2 Tenant Administration                    | 8     | Self-service tenant provisioning expected by channel partners                                                                                                                                                                                                                                                                                                                                                                                                |
| **P1 — Competitive**      | 24.4 Configuration & Customization            | 8     | Custom fields/objects are table stakes for enterprise HCM                                                                                                                                                                                                                                                                                                                                                                                                    |
| **P1 — Competitive**      | 24.5 Integration Platform (iPaaS)             | 8     | Event bus and marketplace match Workday Integration Cloud                                                                                                                                                                                                                                                                                                                                                                                                    |
| **P0 — Revenue Blocking** | 25.2 Database Security & Isolation            | 8     | RLS and encryption required for SOC 2/ISO 27001 certification                                                                                                                                                                                                                                                                                                                                                                                                |
| **P0 — Revenue Blocking** | 25.1 Database Schema Governance               | 8     | Soft delete and audit columns legally required for GDPR data recovery                                                                                                                                                                                                                                                                                                                                                                                        |
| **P1 — Competitive**      | 25.3 Performance & Scalability                | 8     | Table partitioning and indexing required for 50K+ employee deployments                                                                                                                                                                                                                                                                                                                                                                                       |
| **P1 — Competitive**      | 25.4 Migration & Data Operations              | 8     | Zero-downtime migrations required for 99.9% SLA commitments                                                                                                                                                                                                                                                                                                                                                                                                  |
| **P1 — Competitive**      | 25.6 Prisma Client & ORM Enhancement          | 6     | Modern $extends API and batch ops match enterprise ORM standards                                                                                                                                                                                                                                                                                                                                                                                             |
| **P0 — Revenue Blocking** | 26.1 Job Orchestration & Pipeline Engine      | 8     | Mock jobs must be wired to DB — payroll/leave/compliance non-functional                                                                                                                                                                                                                                                                                                                                                                                      |
| **P0 — Revenue Blocking** | 26.3 Scheduler & Cron Management              | 6     | Distributed locking prevents duplicate payroll runs in multi-instance                                                                                                                                                                                                                                                                                                                                                                                        |
| **P1 — Competitive**      | 26.2 Queue Infrastructure & Reliability       | 8     | DLQ consumers and unified queue strategy for production reliability                                                                                                                                                                                                                                                                                                                                                                                          |
| **P1 — Competitive**      | 26.4 Event-Driven Architecture                | 8     | Saga patterns and event sourcing match Temporal/Axon standards                                                                                                                                                                                                                                                                                                                                                                                               |
| **P1 — Competitive**      | 26.5 Job Monitoring & Observability           | 8     | Bull Board, Prometheus metrics, and alerting for production ops                                                                                                                                                                                                                                                                                                                                                                                              |
| **P0 — Revenue Blocking** | 27.1 Service Implementation Completion        | 8     | 4 stub services must be functional for microservice architecture to work                                                                                                                                                                                                                                                                                                                                                                                     |
| **P0 — Revenue Blocking** | 27.3 Container Orchestration & Deployment     | 8     | K8s manifests for all services required for production deployment                                                                                                                                                                                                                                                                                                                                                                                            |
| **P1 — Competitive**      | 27.2 Service Communication & Discovery        | 8     | gRPC, RabbitMQ wiring, and service mesh for enterprise reliability                                                                                                                                                                                                                                                                                                                                                                                           |
| **P1 — Competitive**      | 27.4 Service Resilience & Reliability         | 8     | Circuit breakers, retries, and chaos testing for 99.9%+ SLA                                                                                                                                                                                                                                                                                                                                                                                                  |
| **P1 — Competitive**      | 3.1.7 Workflow Templates Enterprise           | 12    | Architecture specifies 10+ workflows — only 8 seeded; payroll/recruitment/grievance missing                                                                                                                                                                                                                                                                                                                                                                  |
| **P1 — Competitive**      | 3.1.8 Skills Taxonomy Enterprise              | 10    | No ESCO/O\*NET crosswalk, no emerging tech skills, no GCC-specific skills, no multilingual names                                                                                                                                                                                                                                                                                                                                                             |
| **P0 — Revenue Blocking** | 3.1.9 Notification Templates Enterprise       | 12    | EMAIL templates completely missing — most critical channel; no WhatsApp for MENA/India market                                                                                                                                                                                                                                                                                                                                                                |
| **P0 — Revenue Blocking** | 3.1.10 Industry Codes Enterprise              | 8     | No ISIC Rev.4 — mandatory for ALL GCC commercial licensing; no NIC for India GST/EPFO registration                                                                                                                                                                                                                                                                                                                                                           |
| **P0 — Revenue Blocking** | 3.1.12 Overtime Rules Enterprise              | 8     | No FLSA exempt/non-exempt rules — foundational for US payroll; no GCC Ramadan OT rules                                                                                                                                                                                                                                                                                                                                                                       |
| **P0 — Revenue Blocking** | 3.1.15 Integration Configs Enterprise         | 10    | Missing WPS/GOSI/EPFO portal configs and accounting connectors — blocks payroll go-live                                                                                                                                                                                                                                                                                                                                                                      |
| **P1 — Competitive**      | 3.1.11 Job Classifications Enterprise         | 8     | No EEO-1 categories (EEOC mandate), no FLSA statuses, no GCC MOHRE/HRSD occupation codes                                                                                                                                                                                                                                                                                                                                                                     |
| **P1 — Competitive**      | 3.1.13 Break Rules Enterprise                 | 8     | No GCC prayer breaks, no Ramadan adjustments, no heat ban rules — critical for MENA market                                                                                                                                                                                                                                                                                                                                                                   |
| **P1 — Competitive**      | 3.1.14 Approval Chains Enterprise             | 10    | Only 3 chains seeded — enterprise needs 15+ with thresholds, delegation, SLA escalation                                                                                                                                                                                                                                                                                                                                                                      |
| **P0 — Revenue Blocking** | 3.2.1 Countries Enterprise                    | 8     | No data sovereignty classification — blocks multi-region SaaS; no immigration framework for GCC visa processing                                                                                                                                                                                                                                                                                                                                              |
| **P0 — Revenue Blocking** | 3.2.2 Leave Types Enterprise                  | 10    | No GCC-specific leaves (Hajj/Iddah), no FMLA, no India maternity 26-week — blocks statutory compliance                                                                                                                                                                                                                                                                                                                                                       |
| **P1 — Competitive**      | 3.2.3 Seed Runner Enterprise                  | 8     | No env-specific profiles, no tenant-aware seeding, no rollback — blocks production-grade deployment                                                                                                                                                                                                                                                                                                                                                          |
| **P0 — Revenue Blocking** | 3.3.1 Geographic Data Enterprise              | 8     | No UAE free zone data (DIFC/DMCC/JAFZA have different labor laws) — blocks GCC multi-entity deployment                                                                                                                                                                                                                                                                                                                                                       |
| **P1 — Competitive**      | 3.3.2 Currency Expansion Enterprise           | 8     | Only 50/180 ISO currencies, static rates only — no live FX, no historical rates for payroll back-dating                                                                                                                                                                                                                                                                                                                                                      |
| **P1 — Competitive**      | 4.1 Service Layer Enterprise                  | 10    | No API client interceptors, no error handling framework, no offline queue — blocks production-grade frontend                                                                                                                                                                                                                                                                                                                                                 |
| **P1 — Competitive**      | 4.2 React Query Infrastructure                | 3     | ~~CRITICAL: NOT INSTALLED~~ → **STALE 2026-06-03**: `@tanstack/react-query ^5.8.4` IS installed. `QueryClientProvider` wiring + missing core HCM hooks need re-audit but no longer a P0 install blocker.                                                                                                                                                                                                                                                     |
| **P1 — Competitive**      | 4.2 React Query Enterprise                    | 17    | No optimistic updates (architecture requires), no prefetch, no infinite scroll, no Suspense, no offline persistence, no per-module cache TTL, no cross-module invalidation map, no retry strategies — poor UX for large enterprise datasets                                                                                                                                                                                                                  |
| **P1 — Competitive**      | 4.3 Zustand Infrastructure                    | 3     | ~~CRITICAL: NOT INSTALLED~~ → **STALE 2026-06-03**: `zustand ^4.4.7` IS installed. Inconsistent store implementations (4/8 still on React Context) and the broken `ThemeToggle` import remain valid follow-ups but are not install blockers.                                                                                                                                                                                                                 |
| **P1 — Competitive**      | 4.3 Zustand Enterprise                        | 15    | No auth/session store for web, no permission/RBAC store, no selector patterns (full state re-renders), no hydration guards for SSR, no cross-tab sync, no computed state, no form dirty tracking, no barrel exports, inconsistent localStorage keys                                                                                                                                                                                                          |
| **P1 — Competitive**      | 4.4 WebSocket Infrastructure                  | 6     | ~~CRITICAL: NOT INSTALLED~~ → **STALE 2026-06-03**: `socket.io ^4.7.4` and `socket.io-client ^4.8.3` ARE installed in `apps/web`. Deeper findings (server initialization, SocketProvider mount, JWT auth, event type wiring) need re-audit but are not install blockers.                                                                                                                                                                                     |
| **P1 — Competitive**      | 4.4 WebSocket Enterprise                      | 14    | No reconnection (linear not exponential), no horizontal scaling, no offline buffer, no event ACK, no rate limiting, no presence broadcasting, no namespaces, no Zod validation, no heartbeat                                                                                                                                                                                                                                                                 |
| **P1 — Competitive**      | 4.5 Form Validation Infrastructure            | 3     | ~~CRITICAL: NOT INSTALLED~~ → **STALE 2026-06-03**: `react-hook-form ^7.71.2` + `@hookform/resolvers ^5.2.2` ARE installed. Schema duplication and password rule inconsistency remain valid follow-ups but are independent of install status.                                                                                                                                                                                                                |
| **P1 — Competitive**      | 4.5 Form Validation Enterprise                | 15    | No GCC identity validators (Emirates ID, TRN, Saudi NatID), no per-country phone/address/IBAN schemas, no cross-entity validation, no validation telemetry, no env-specific strictness                                                                                                                                                                                                                                                                       |
| **P1 — Competitive**      | 4.6 Integration Infrastructure                | 4     | ~~No SDKs installed~~ → **PARTIALLY STALE 2026-06-03**: `nodemailer ^6.9.7` IS in `apps/web`. Other SDKs live in `services/integration-service`, `services/notification-service`, `services/document-service` (by design). Genuine concerns that REMAIN: Slack/Teams OAuth callbacks are STUBS, DocuSign HMAC verification COMMENTED OUT, no Slack signing secret verification, demo-endpoint hardcoded — these are install-independent security follow-ups. |
| **P1 — Competitive**      | 4.6 Integration Enterprise                    | 16    | No SMS/WhatsApp (critical for GCC), no S3 file storage, no SAML/SCIM provisioning, no email production transport, connection service is stub, microservices are stubs, no external rate limit respect, no integration testing                                                                                                                                                                                                                                |
| **P0 — Revenue Blocking** | 29.1 WAF & DDoS Protection                    | 8     | Enterprise customers require WAF/DDoS for production — sales blocker                                                                                                                                                                                                                                                                                                                                                                                         |
| **P0 — Revenue Blocking** | 29.2 SIEM Integration & Security Monitoring   | 8     | SOC 2/ISO 27001 certification requires centralized security monitoring                                                                                                                                                                                                                                                                                                                                                                                       |
| **P0 — Revenue Blocking** | 29.3 Third-Party Risk & Supply Chain Security | 8     | Vendor security assessments required by enterprise procurement teams                                                                                                                                                                                                                                                                                                                                                                                         |
| **P0 — Revenue Blocking** | 29.4 Data Protection & Privacy Operations     | 6     | GDPR/UAE PDPL DPA management and privacy ops legally required                                                                                                                                                                                                                                                                                                                                                                                                |
| **P1 — Competitive**      | 30.1 Multi-Region & CDN Architecture          | 8     | Active-active multi-region required for 99.99% SLA targets                                                                                                                                                                                                                                                                                                                                                                                                   |
| **P1 — Competitive**      | 30.2 FinOps & Cloud Cost Optimization         | 10    | Cloud cost governance expected by CFO/CTO during enterprise deals                                                                                                                                                                                                                                                                                                                                                                                            |
| **P1 — Competitive**      | 30.3 Developer Experience & API Economy       | 8     | Developer portal and SDK generation match Workday/SAP integration model                                                                                                                                                                                                                                                                                                                                                                                      |
| **P1 — Competitive**      | 31.1 ML Pipeline & Model Lifecycle            | 8     | MLOps maturity required for enterprise AI feature production readiness                                                                                                                                                                                                                                                                                                                                                                                       |
| **P1 — Competitive**      | 31.2 Responsible AI & Compliance              | 12    | EU AI Act (2024/1689) mandates bias audits for HR AI — legal requirement by Aug 2026                                                                                                                                                                                                                                                                                                                                                                         |
| **P0 — Revenue Blocking** | 28.1 Schema-Seed Alignment                    | 8     | 14/15 named seeds target non-existent models — ALL seeds fail at runtime                                                                                                                                                                                                                                                                                                                                                                                     |
| **P0 — Revenue Blocking** | 28.2 GCC Statutory Master Data                | 8     | GOSI/WPS/SIO/PASI rates required for any GCC payroll run                                                                                                                                                                                                                                                                                                                                                                                                     |
| **P1 — Competitive**      | 28.3 India Statutory Master Data              | 6     | PF/ESI/TDS/LWF rates required for India market entry                                                                                                                                                                                                                                                                                                                                                                                                         |
| **P1 — Competitive**      | 28.4 Global Reference Data                    | 8     | ISO country/currency/industry codes, holidays for multi-country HCM                                                                                                                                                                                                                                                                                                                                                                                          |
| **P2 — Scale**            | 28.5 Demo & Test Data Factories               | 6     | Faker-based factories for 100K+ employee load testing                                                                                                                                                                                                                                                                                                                                                                                                        |
| **P2 — Scale**            | 27.5 Configuration & Secrets Management       | 6     | Vault integration and feature flags for multi-env deployments                                                                                                                                                                                                                                                                                                                                                                                                |
| **P2 — Scale**            | 23.1 Data Platform & ETL Engine               | 8     | Separate OLTP/OLAP required for analytics at scale                                                                                                                                                                                                                                                                                                                                                                                                           |
| **P2 — Scale**            | 23.4 Benchmarking & Market Intelligence       | 6     | Enterprise HR needs "how do we compare?" answers                                                                                                                                                                                                                                                                                                                                                                                                             |
| **P2 — Scale**            | 22.6 Union & Collective Bargaining            | 4     | Required for manufacturing/healthcare/govt sectors                                                                                                                                                                                                                                                                                                                                                                                                           |
| **P2 — Scale**            | 22.5 Advanced Biometric & Identity            | 4     | Anti-spoofing for large workforce deployments                                                                                                                                                                                                                                                                                                                                                                                                                |
| **P2 — Scale**            | 20.2 Job Distribution & Employer Branding     | 8     | Job board syndication expected for volume hiring                                                                                                                                                                                                                                                                                                                                                                                                             |
| **P2 — Scale**            | 20.3 Advanced Assessment & Selection          | 8     | HackerRank/Codility integration for tech hiring                                                                                                                                                                                                                                                                                                                                                                                                              |
| **P2 — Scale**            | 18.6 Advanced Eligibility & Dependent Mgmt    | 10    | Complex eligibility rules for large employers                                                                                                                                                                                                                                                                                                                                                                                                                |
| **P2 — Scale**            | 17.4 Employee Directory & Search              | 8     | Required for 1000+ employee orgs                                                                                                                                                                                                                                                                                                                                                                                                                             |
| **P2 — Scale**            | 16.7 Database Performance                     | 8     | Required for 50K+ employee deployments                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **P2 — Scale**            | 16.8 Inter-Service Communication              | 8     | Required for microservice reliability                                                                                                                                                                                                                                                                                                                                                                                                                        |
| **P2 — Scale**            | 16.2 Enterprise Search                        | 8     | Required for 50K+ employee deployments                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **P2 — Scale**            | 5.1-5.2 DR & Events                           | 32    | Required for 1000+ employee deployments                                                                                                                                                                                                                                                                                                                                                                                                                      |
| **P2 — Scale**            | 9.1-9.3 DevOps & Observability                | 64    | Production readiness                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| **P2 — Scale**            | 10.2 Position Control                         | 16    | Required for large org management                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **P2 — Scale**            | 10.6 Multi-Entity                             | 10    | Required for holding companies                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **P2 — Scale**            | 11.5 GL Posting                               | 10    | Required for ERP integration                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **P2 — Scale**            | 15.6-15.7 Mobile Testing & Offline            | 14    | Production app quality                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **P3 — Differentiation**  | 23.5 Organizational Network Analysis          | 6     | Emerging differentiator — how work actually happens                                                                                                                                                                                                                                                                                                                                                                                                          |
| **P3 — Differentiation**  | 21.2 Learning Experience Platform (LXP)       | 8     | Social learning and UGC for knowledge orgs                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **P3 — Differentiation**  | 21.5 Gamification & Engagement                | 8     | Points/badges increase completion by 40-60%                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **P3 — Differentiation**  | 21.6 Learning Analytics & ROI                 | 8     | Training ROI demanded by CLOs at enterprise                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **P3 — Differentiation**  | 20.5 Internal Mobility & Rehire               | 6     | Reduce external hiring costs, improve retention                                                                                                                                                                                                                                                                                                                                                                                                              |
| **P3 — Differentiation**  | 18.7 Benefits Analytics & Statement           | 6     | Total benefits statement is executive differentiator                                                                                                                                                                                                                                                                                                                                                                                                         |
| **P3 — Differentiation**  | 18.8 Pension & End-of-Service Benefits        | 4     | MENA/India gratuity and pension calculations                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **P3 — Differentiation**  | 17.6 Wellness & Health Programs               | 8     | Match Darwinbox wellness features                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **P3 — Differentiation**  | 16.5 Document Processing                      | 8     | OCR, watermarking — premium feature                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **P3 — Differentiation**  | 16.9 Configuration & Feature Flags            | 8     | Per-tenant customization engine                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **P3 — Differentiation**  | 16.10 HRMS Migration Tools                    | 8     | Accelerate enterprise onboarding                                                                                                                                                                                                                                                                                                                                                                                                                             |
| **P3 — Differentiation**  | 7.1 Predictive Analytics                      | 14    | Match Workday capabilities                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **P3 — Differentiation**  | 7.3 Advanced Analytics                        | 20    | Match SAP SuccessFactors                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **P3 — Differentiation**  | 12.1 Auto-Scheduling                          | 8     | Manufacturing/retail differentiator                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **P3 — Differentiation**  | 10.7 Letter Engine                            | 12    | Automation differentiator                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| **P3 — Differentiation**  | 13.3 Internal Comms                           | 10    | Match Darwinbox Buzz                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| **P3 — Differentiation**  | 28.6 MDM Infrastructure                       | 8     | Effective dating, golden record dedup, data lineage for enterprise data governance                                                                                                                                                                                                                                                                                                                                                                           |
| **P3 — Differentiation**  | 15.4 Mobile Specialized Screens               | 14    | Shift workers, learning, surveys on mobile                                                                                                                                                                                                                                                                                                                                                                                                                   |

---

_This todolist represents the complete work required to achieve 100% feature parity with industry-leading HCM platforms AND enterprise-grade infrastructure for production deployment at scale._
_Sections 1-4 represent v1.0 feature parity (Sections 1-2 completed; Section 3 upgraded with 128 enterprise seed/data tasks; Section 4 upgraded with 106 enterprise backend-UI tasks incl. 17 P0 infrastructure blockers: React Query, Zustand, Socket.IO, react-hook-form, Slack/Teams/DocuSign SDKs not installed). Sections 5-9 represent v2.0 enterprise infrastructure (pending). Sections 10-28 represent v3.0 enterprise HR modules + mobile + backend + ESS + benefits + payroll + recruitment + L&D + T&A + analytics + admin platform + database platform + job processing + microservices + seed data & MDM (pending). Sections 29-31 represent v4.0 enterprise security operations + cloud infrastructure & FinOps + AI governance & MLOps (pending)._
_Update progress bars as tasks are completed._
_Version: 4.12 | Created: January 2025 | Enterprise Upgrade: February 2026 | Enterprise Modules: February 2026 | Security Operations: February 2026 | Cloud & FinOps: February 2026 | AI Governance: February 2026_
