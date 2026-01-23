# KreupAI AuraOS - Complete 100% GAP Closure Todolist

> **Goal**: Close ALL identified gaps to achieve 100% feature parity with industry leaders
> **Total Tasks**: 487 items across 4 sections
> **Created**: January 2025

---

## SECTION 1: FRONTEND (189 Tasks)

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

## SECTION 2: BACKEND (143 Tasks)

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

## SECTION 3: SEEDS & DATA (78 Tasks)

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
- [x] Create `/packages/@aura/database/src/seeds/workflow-templates.seed.ts`
- [x] Add employee onboarding workflow (IT setup → docs → orientation → training)
- [x] Add employee offboarding workflow (exit interview → asset return → access revoke)
- [x] Add leave approval workflow (employee → manager → HR optional)
- [x] Add expense approval workflow (employee → manager → finance)
- [x] Add job requisition workflow (manager → HR → budget approval)
- [x] Add promotion workflow (manager → HR → comp review → approval)
- [x] Add transfer workflow (current manager → HR → new manager)
- [x] Add probation confirmation workflow (manager → HR → confirmation letter)

#### 3.1.8 Skills Taxonomy
- [x] Create `/packages/@aura/database/src/seeds/skills-taxonomy.seed.ts`
- [x] Add technical skills category (programming languages, frameworks, tools)
- [x] Add soft skills category (communication, leadership, teamwork)
- [x] Add management skills category (delegation, coaching, strategy)
- [x] Add industry-specific skills (healthcare, finance, manufacturing)
- [x] Add certifications (PMP, AWS, CPA, PHR, SHRM)
- [x] Add proficiency levels (beginner, intermediate, advanced, expert)
- [x] Map skills to job families/roles

#### 3.1.9 Notification Templates
- [x] Create `/packages/@aura/database/src/seeds/notification-templates.seed.ts`
- [x] Add push notification templates (approval needed, approved, reminder)
- [x] Add SMS templates (clock-in reminder, emergency, OTP)
- [x] Add in-app notification templates (all events)

#### 3.1.10 Industry Codes
- [x] Create `/packages/@aura/database/src/seeds/industry-codes.seed.ts`
- [x] Add NAICS codes (top 3 levels)
- [x] Add SIC codes (major groups)

#### 3.1.11 Job Classifications
- [x] Create `/packages/@aura/database/src/seeds/job-classifications.seed.ts`
- [x] Add O*NET SOC codes (major groups + detailed)
- [x] Add ISCO-08 codes (international classification)

#### 3.1.12 Overtime Rules
- [x] Create `/packages/@aura/database/src/seeds/overtime-rules.seed.ts`
- [x] Add overtime multipliers by jurisdiction
- [x] Add weekly/daily threshold configurations

#### 3.1.13 Break Rules
- [x] Create `/packages/@aura/database/src/seeds/break-rules.seed.ts`
- [x] Add meal break rules by jurisdiction
- [x] Add rest break rules by jurisdiction

#### 3.1.14 Approval Chains
- [x] Create `/packages/@aura/database/src/seeds/approval-chains.seed.ts`
- [x] Add default leave approval chain
- [x] Add default expense approval chain
- [x] Add default requisition approval chain

#### 3.1.15 Integration Configs
- [x] Create `/packages/@aura/database/src/seeds/integration-configs.seed.ts`
- [x] Add Slack integration config template
- [x] Add Teams integration config template
- [x] Add Google Workspace config template

---

### 3.2 Seed Enhancements (16 Tasks)

#### 3.2.1 Countries Enhancement
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

#### 3.2.2 Leave Types Enhancement
- [x] Add carry forward rules (max days, expiry period)
- [x] Add encashment rules (eligible types, max days)
- [x] Add probation eligibility (which leave types available during probation)
- [x] Add document requirements (medical certificate for sick leave > X days)
- [x] Add negative balance policy (allow/deny, max negative days)
- [x] Add sandwich rule configuration (weekend between leave days)

#### 3.2.3 Seed Runner Update
- [x] Update seed runner to include all new seed files in correct order
- [x] Add idempotency checks (don't duplicate on re-run)
- [x] Add seed versioning for incremental updates

---

### 3.3 Seed Data Expansion (10 Tasks)

#### 3.3.1 Geographic Data
- [x] Expand states/provinces data for US (all 50 + territories)
- [x] Add states/provinces for India (all 28 states + 8 UTs)
- [x] Add states/provinces for UK (counties)
- [x] Add states/provinces for Canada (provinces + territories)
- [x] Add major cities for top 20 countries
- [x] Add timezone data per state/province

#### 3.3.2 Currency Expansion
- [x] Expand from 10 to 50+ currencies
- [x] Add exchange rate seed (static reference rates)
- [x] Add currency formatting rules (symbol position, decimals)
- [x] Add currency to country mapping

---

## SECTION 4: BACKEND-UI INTEGRATION (77 Tasks)

---

### 4.1 Frontend Service Layer (21 Tasks)

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

---

### 4.2 React Query Hooks (14 Tasks)

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

---

### 4.3 State Management (Zustand Stores) (7 Tasks)

- [x] Create `/apps/web/src/stores/notification-store.ts` (notifications[], unreadCount, markAsRead, clearAll)
- [x] Create `/apps/web/src/stores/approval-store.ts` (pendingApprovals[], count, refresh)
- [x] Create `/apps/web/src/stores/user-preferences-store.ts` (theme, language, dashboardLayout)
- [x] Create `/apps/web/src/stores/offline-store.ts` (isOnline, pendingActions[], sync)
- [x] Create `/apps/web/src/stores/search-store.ts` (recentSearches, results, filters)
- [x] Create `/apps/web/src/stores/dashboard-store.ts` (widgets[], layout, addWidget, removeWidget)
- [x] Create `/apps/web/src/stores/theme-store.ts` (mode: light/dark/system, setMode)

---

### 4.4 Real-Time WebSocket Layer (14 Tasks)

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

---

### 4.5 Form Validation Schemas (8 Tasks)

- [x] Create `/apps/web/src/lib/validation/benefitsEnrollment.schema.ts` (Zod schema)
- [x] Create `/apps/web/src/lib/validation/dependent.schema.ts`
- [x] Create `/apps/web/src/lib/validation/lifeEvent.schema.ts`
- [x] Create `/apps/web/src/lib/validation/feedback.schema.ts`
- [x] Create `/apps/web/src/lib/validation/recognition.schema.ts`
- [x] Create `/apps/web/src/lib/validation/customReport.schema.ts`
- [x] Create `/apps/web/src/lib/validation/workflowDefinition.schema.ts`
- [x] Create `/apps/web/src/lib/validation/webhook.schema.ts`

---

### 4.6 Third-Party Integrations (13 Tasks)

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

---

## SUMMARY

| Section | Tasks | % of Total |
|---------|-------|------------|
| **Frontend** | 189 | 38.8% |
| **Backend** | 143 | 29.4% |
| **Seeds & Data** | 78 | 16.0% |
| **Backend-UI Integration** | 77 | 15.8% |
| **TOTAL** | **487** | **100%** |

---

### Completion Tracking

```
Frontend:         [████████████████████] 189/189 (100%)
Backend:          [████████████████████] 143/143 (100%)
Seeds & Data:     [████████████████████] 78/78   (100%)
Backend-UI:       [████████████████████] 77/77   (100%)
─────────────────────────────────────────────────
OVERALL:          [████████████████████] 487/487 (100%)
```

---

*This todolist represents the complete work required to achieve 100% feature parity with industry-leading HCM platforms.*
*Update progress bars as tasks are completed.*
*Version: 1.0 | Created: January 2025*
