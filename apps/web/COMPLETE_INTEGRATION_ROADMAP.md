# Complete Integration Roadmap
**Status as of**: December 24, 2024
**Completed**: 6/40 pages (15%)
**Remaining**: 34 pages (85%)

## ✅ Completed Integrations (6 pages)

### Attendance Module - DONE
1. ✅ `time-capture/page.tsx` - Live data fetch, punch actions, GPS tracking
2. ✅ `comp-off/page.tsx` - CRUD operations, balance tracking, expiry management
3. ✅ `overtime/page.tsx` - Submission, earnings calc, approval workflow
4. ✅ `regularization/page.tsx` - Bidirectional (employee + manager), form handling
5. ✅ `work-from-home/page.tsx` - WFH requests, calendar integration, balance
6. ✅ `timesheets/page.tsx` - Weekly timesheet, project tracking, submission

---

## 🔄 Remaining Integrations (34 pages)

### ATTENDANCE MODULE (15 remaining)

#### 7. shift-management/page.tsx
**API**: `/api/attendance/shifts`
**Client Method**: `shifts.getShifts()`, `shifts.createShift()`, `shifts.updateShift()`, `shifts.deleteShift()`

```typescript
import { shifts } from '@/lib/services/attendance-client';

const [shiftList, setShiftList] = useState([]);
const [loading, setLoading] = useState(true);

const fetchShifts = async () => {
  const result = await shifts.getShifts({ isActive: true });
  if (result.success) setShiftList(result.data.shifts || []);
};

const handleCreate = async (shiftData) => {
  await shifts.createShift(shiftData);
  await fetchShifts();
};

const handleDelete = async (id) => {
  await shifts.deleteShift(id);
  await fetchShifts();
};
```

**Changes**:
- Replace `SHIFTS` array with `shiftList` state
- Wire "Add New Shift" button to `handleCreate`
- Wire Edit/Delete buttons to handlers
- Add loading states

---

#### 8. roster-assignment/page.tsx
**API**: `/api/attendance/roster`
**Client Method**: `roster.getRosters()`, `roster.createRoster()`, `roster.assignShift()`

```typescript
import { roster } from '@/lib/services/attendance-client';

const [rosters, setRosters] = useState([]);
const [employees, setEmployees] = useState([]);

const fetchRosters = async () => {
  const result = await roster.getRosters();
  if (result.success) {
    setRosters(result.data.rosters || []);
    setEmployees(result.data.employees || []);
  }
};

const handleAssign = async (employeeId, shiftId, dates) => {
  await roster.createRoster({ employeeId, shiftId, dates });
  await fetchRosters();
};
```

---

#### 9. attendance-exceptions/page.tsx
**API**: `/api/attendance/exceptions`
**Client Method**: `exceptions.getExceptions()`, `exceptions.resolveException()`

```typescript
import { exceptions } from '@/lib/services/attendance-client';

const [exceptionList, setExceptionList] = useState([]);
const [stats, setStats] = useState(null);

const fetchExceptions = async () => {
  const result = await exceptions.getExceptions({ status: 'PENDING' });
  if (result.success) {
    setExceptionList(result.data.exceptions || []);
    setStats(result.data.stats || null);
  }
};

const handleResolve = async (id, resolution) => {
  await exceptions.resolveException(id, resolution);
  await fetchExceptions();
};
```

---

#### 10. overtime-management/page.tsx
**API**: `/api/attendance/overtime-management`
**Client Method**: `overtimeManagement.getOvertimeRequests()`, `overtimeManagement.approveOvertime()`

```typescript
import { overtimeManagement } from '@/lib/services/attendance-client';

const [requests, setRequests] = useState([]);
const [summary, setSummary] = useState(null);

const fetchRequests = async () => {
  const result = await overtimeManagement.getOvertimeRequests({ status: 'PENDING' });
  if (result.success) {
    setRequests(result.data.requests || []);
    setSummary(result.data.summary || null);
  }
};

const handleApprove = async (id, status) => {
  await overtimeManagement.approveOvertime(id, status);
  await fetchRequests();
};
```

---

#### 11. comp-off-management/page.tsx
**API**: `/api/attendance/comp-off-management`
**Client Method**: `compOffManagement.getCompOffRequests()`, `compOffManagement.approveCompOff()`

```typescript
import { compOffManagement } from '@/lib/services/attendance-client';

const [compOffRequests, setCompOffRequests] = useState([]);
const [teamStats, setTeamStats] = useState(null);

const fetchRequests = async () => {
  const result = await compOffManagement.getCompOffRequests();
  if (result.success) {
    setCompOffRequests(result.data.requests || []);
    setTeamStats(result.data.summary || null);
  }
};

const handleApprove = async (id, status, notes) => {
  await compOffManagement.approveCompOff(id, status, notes);
  await fetchRequests();
};
```

---

#### 12. regularization-request/page.tsx
**API**: `/api/attendance/regularization-request`
**Client Method**: `regularizationRequest.getRequests()`, `regularizationRequest.approveRequest()`

```typescript
import { regularizationRequest } from '@/lib/services/attendance-client';

const [regularizationRequests, setRegularizationRequests] = useState([]);

const fetchRequests = async () => {
  const result = await regularizationRequest.getRequests({ status: 'PENDING' });
  if (result.success) {
    setRegularizationRequests(result.data.requests || []);
  }
};

const handleApprove = async (id, status) => {
  await regularizationRequest.approveRequest(id, status);
  await fetchRequests();
};
```

---

#### 13. shift-swapping/page.tsx
**API**: `/api/attendance/shift-swapping`
**Client Method**: `shiftSwapping.getSwapRequests()`, `shiftSwapping.requestSwap()`, `shiftSwapping.approveSwap()`

```typescript
import { shiftSwapping } from '@/lib/services/attendance-client';

const [swapRequests, setSwapRequests] = useState([]);

const fetchSwaps = async () => {
  const result = await shiftSwapping.getSwapRequests();
  if (result.success) {
    setSwapRequests(result.data.swaps || []);
  }
};

const handleRequest = async (fromShiftId, toShiftId, reason) => {
  await shiftSwapping.requestSwap({ fromShiftId, toShiftId, reason });
  await fetchSwaps();
};

const handleApprove = async (id, status) => {
  await shiftSwapping.approveSwap(id, status);
  await fetchSwaps();
};
```

---

#### 14. punch-rules/page.tsx
**API**: `/api/attendance/punch-rules`
**Client Method**: `punchRules.getPunchRules()`, `punchRules.createPunchRule()`, `punchRules.updatePunchRule()`

```typescript
import { punchRules } from '@/lib/services/attendance-client';

const [rules, setRules] = useState([]);

const fetchRules = async () => {
  const result = await punchRules.getPunchRules();
  if (result.success) {
    setRules(result.data.rules || []);
  }
};

const handleCreate = async (ruleData) => {
  await punchRules.createPunchRule(ruleData);
  await fetchRules();
};
```

---

#### 15. rules/page.tsx
**API**: `/api/attendance/rules`
**Client Method**: `attendanceRules.getRules()`, `attendanceRules.createRule()`, `attendanceRules.updateRule()`

```typescript
import { attendanceRules } from '@/lib/services/attendance-client';

const [rulesList, setRulesList] = useState([]);

const fetchRules = async () => {
  const result = await attendanceRules.getRules();
  if (result.success) {
    setRulesList(result.data.rules || []);
  }
};

const handleUpdate = async (id, updates) => {
  await attendanceRules.updateRule(id, updates);
  await fetchRules();
};
```

---

#### 16. time-rounding/page.tsx
**API**: `/api/attendance/time-rounding`
**Client Method**: `timeRounding.getTimeRoundingRules()`, `timeRounding.calculateRounding()`

```typescript
import { timeRounding } from '@/lib/services/attendance-client';

const [roundingRules, setRoundingRules] = useState([]);
const [calculator, setCalculator] = useState(null);

const fetchRules = async () => {
  const result = await timeRounding.getTimeRoundingRules();
  if (result.success) {
    setRoundingRules(result.data.rules || []);
  }
};

const handleCalculate = async (time, roundingType, interval) => {
  const result = await timeRounding.calculateRounding(time, roundingType, interval);
  if (result.success) {
    setCalculator(result.data);
  }
};
```

---

#### 17. geo-fencing/page.tsx
**API**: `/api/attendance/geo-fencing`
**Client Method**: `geoFencing.getGeoFences()`, `geoFencing.createGeoFence()`, `geoFencing.validateLocation()`

```typescript
import { geoFencing } from '@/lib/services/attendance-client';

const [geoFences, setGeoFences] = useState([]);
const [validation, setValidation] = useState(null);

const fetchGeoFences = async () => {
  const result = await geoFencing.getGeoFences();
  if (result.success) {
    setGeoFences(result.data.geoFences || []);
  }
};

const handleValidate = async (lat, lng) => {
  const result = await geoFencing.validateLocation(lat, lng);
  if (result.success) {
    setValidation(result.data);
  }
};
```

---

#### 18. ip-restriction/page.tsx
**API**: `/api/attendance/ip-restriction`
**Client Method**: `ipRestriction.getIPRules()`, `ipRestriction.addIP()`, `ipRestriction.removeIP()`

```typescript
import { ipRestriction } from '@/lib/services/attendance-client';

const [ipRules, setIpRules] = useState([]);
const [whitelist, setWhitelist] = useState([]);

const fetchIPRules = async () => {
  const result = await ipRestriction.getIPRules();
  if (result.success) {
    setIpRules(result.data.rules || []);
    setWhitelist(result.data.whitelist || []);
  }
};

const handleAddIP = async (ip, label, type) => {
  await ipRestriction.addIP(ip, label, type);
  await fetchIPRules();
};
```

---

#### 19. field-force/page.tsx
**API**: `/api/attendance/field-force`
**Client Method**: `fieldForce.getVisits()`, `fieldForce.checkIn()`, `fieldForce.checkOut()`

```typescript
import { fieldForce } from '@/lib/services/attendance-client';

const [visits, setVisits] = useState([]);
const [agents, setAgents] = useState([]);

const fetchVisits = async () => {
  const result = await fieldForce.getVisits();
  if (result.success) {
    setVisits(result.data.visits || []);
    setAgents(result.data.agents || []);
  }
};

const handleCheckIn = async (visitData) => {
  await fieldForce.checkIn(visitData);
  await fetchVisits();
};

const handleCheckOut = async (visitId, checkOut, notes) => {
  await fieldForce.checkOut(visitId, checkOut, notes);
  await fetchVisits();
};
```

---

#### 20. approval-workflow/page.tsx
**API**: `/api/attendance/approval-workflow`
**Client Method**: `approvalWorkflow.getWorkflows()`, `approvalWorkflow.createWorkflow()`

```typescript
import { approvalWorkflow } from '@/lib/services/attendance-client';

const [workflows, setWorkflows] = useState([]);

const fetchWorkflows = async () => {
  const result = await approvalWorkflow.getWorkflows();
  if (result.success) {
    setWorkflows(result.data.workflows || []);
  }
};

const handleCreate = async (workflowData) => {
  await approvalWorkflow.createWorkflow(workflowData);
  await fetchWorkflows();
};
```

---

#### 21. page.tsx (Attendance Dashboard)
**API**: Multiple endpoints for summary data
**Client Methods**: Mix of all attendance services

```typescript
import { timeCapture, overtime, compOff, workFromHome } from '@/lib/services/attendance-client';

const [dashboardData, setDashboardData] = useState({
  todayStats: null,
  recentActivity: [],
  pendingApprovals: [],
});

const fetchDashboard = async () => {
  const [captures, overtimeData, compOffData, wfhData] = await Promise.all([
    timeCapture.getCaptures(),
    overtime.getOvertime(),
    compOff.getCompOffs(),
    workFromHome.getWFHRequests(),
  ]);

  setDashboardData({
    todayStats: captures.data.summary,
    recentActivity: [...],
    pendingApprovals: [...],
  });
};
```

---

### AI AUTOMATION MODULE (18 pages)

#### 22. attrition-prediction/page.tsx
**API**: `/api/ai/attrition`
**Client Method**: `attrition.predict()`, `attrition.batchPredict()`, `attrition.getAnalytics()`

```typescript
import { attrition } from '@/lib/services/ai-client';

const [predictions, setPredictions] = useState([]);
const [analytics, setAnalytics] = useState(null);

const fetchPredictions = async () => {
  const result = await attrition.predict({ tenantId: 'current' });
  if (result.success) {
    setPredictions(result.data.predictions || []);
  }
};

const handleBatchPredict = async (employeeIds) => {
  await attrition.batchPredict({ employeeIds });
  await fetchPredictions();
};
```

---

#### 23. org-health-predictor/page.tsx
**API**: `/api/ai/org-health`
**Client Method**: `orgHealth.getHealth()`, `orgHealth.getRecommendations()`, `orgHealth.simulate()`

```typescript
import { orgHealth } from '@/lib/services/ai-client';

const [healthData, setHealthData] = useState(null);
const [recommendations, setRecommendations] = useState([]);

const fetchHealth = async () => {
  const result = await orgHealth.getHealth({ tenantId: 'current' });
  if (result.success) {
    setHealthData(result.data);
  }
};

const fetchRecommendations = async (metricType) => {
  const result = await orgHealth.getRecommendations(metricType, 70, 85);
  if (result.success) {
    setRecommendations(result.data.recommendations || []);
  }
};
```

---

#### 24. chatbot/page.tsx
**API**: `/api/ai/chatbot`
**Client Method**: `chatbot.chat()`, `chatbot.getHistory()`

```typescript
import { chatbot } from '@/lib/services/ai-client';

const [messages, setMessages] = useState([]);
const [conversationId] = useState(`conv_${Date.now()}`);

const handleSend = async (message) => {
  const result = await chatbot.chat(message, conversationId);
  if (result.success) {
    setMessages([...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: result.data.response }
    ]);
  }
};

const fetchHistory = async () => {
  const result = await chatbot.getHistory(conversationId);
  if (result.success) {
    setMessages(result.data.messages || []);
  }
};
```

---

#### 25. leave-forecasting/page.tsx
**API**: `/api/ai/leave-forecasting`
**Client Method**: `leaveForecasting.forecast()`, `leaveForecasting.analyze()`

```typescript
import { leaveForecasting } from '@/lib/services/ai-client';

const [forecast, setForecast] = useState(null);
const [analysis, setAnalysis] = useState(null);

const fetchForecast = async () => {
  const result = await leaveForecasting.forecast({
    tenantId: 'current',
    period: 'QUARTERLY'
  });
  if (result.success) {
    setForecast(result.data.forecast);
  }
};
```

---

#### 26. resume-screening/page.tsx
**API**: `/api/ai/resume`
**Client Method**: `resume.screenResume()`, `resume.batchScreen()`, `resume.extractSkills()`

```typescript
import { resume } from '@/lib/services/ai-client';

const [screeningResults, setScreeningResults] = useState([]);

const handleScreen = async (resumeText, jobDescription) => {
  const result = await resume.screenResume(resumeText, jobDescription);
  if (result.success) {
    setScreeningResults([...screeningResults, result.data]);
  }
};
```

---

#### 27. ai-coaching-bot/page.tsx
**API**: `/api/ai/coaching`
**Client Method**: `coaching.startSession()`, `coaching.getRecommendations()`

```typescript
import { coaching } from '@/lib/services/ai-client';

const [session, setSession] = useState(null);
const [recommendations, setRecommendations] = useState([]);

const startSession = async (employeeId, focus) => {
  const result = await coaching.startSession({ employeeId, focus });
  if (result.success) {
    setSession(result.data.session);
    setRecommendations(result.data.recommendations || []);
  }
};
```

---

#### 28. workflow-generator/page.tsx
**API**: `/api/ai/workflow`
**Client Method**: `workflow.generate()`, `workflow.optimize()`

```typescript
import { workflow } from '@/lib/services/ai-client';

const [generatedWorkflow, setGeneratedWorkflow] = useState(null);

const handleGenerate = async (processDescription, constraints) => {
  const result = await workflow.generate({ processDescription, constraints });
  if (result.success) {
    setGeneratedWorkflow(result.data.workflow);
  }
};
```

---

#### 29. anomaly-detection/page.tsx
**API**: `/api/ai/anomaly`
**Client Method**: `anomaly.detect()`, `anomaly.analyze()`

```typescript
import { anomaly } from '@/lib/services/ai-client';

const [anomalies, setAnomalies] = useState([]);
const [analysis, setAnalysis] = useState(null);

const detectAnomalies = async () => {
  const result = await anomaly.detect({
    tenantId: 'current',
    metricType: 'ATTENDANCE'
  });
  if (result.success) {
    setAnomalies(result.data.anomalies || []);
  }
};
```

---

#### 30. interview-scheduling/page.tsx
**API**: `/api/ai/interview`
**Client Method**: `interview.schedule()`, `interview.optimize()`, `interview.getAvailability()`

```typescript
import { interview } from '@/lib/services/ai-client';

const [interviews, setInterviews] = useState([]);
const [availability, setAvailability] = useState([]);

const handleSchedule = async (candidateId, interviewerIds, duration) => {
  const result = await interview.schedule({ candidateId, interviewerIds, duration });
  if (result.success) {
    setInterviews([...interviews, result.data.interview]);
  }
};
```

---

#### 31. l-d-recommendation/page.tsx
**API**: `/api/ai/learning`
**Client Method**: `learning.getRecommendations()`, `learning.analyzeSkills()`

```typescript
import { learning } from '@/lib/services/ai-client';

const [learningPaths, setLearningPaths] = useState([]);
const [skillGaps, setSkillGaps] = useState([]);

const fetchRecommendations = async (employeeId) => {
  const result = await learning.getRecommendations({ employeeId });
  if (result.success) {
    setLearningPaths(result.data.recommendations || []);
    setSkillGaps(result.data.skillGaps || []);
  }
};
```

---

#### 32. job-matching/page.tsx
**API**: `/api/ai/job-matching`
**Client Method**: `jobMatching.matchJobsForCandidate()`, `jobMatching.matchCandidatesForJob()`

```typescript
import { jobMatching } from '@/lib/services/ai-client';

const [matches, setMatches] = useState([]);

const handleMatch = async (candidateId) => {
  const result = await jobMatching.matchJobsForCandidate(candidateId);
  if (result.success) {
    setMatches(result.data.matches || []);
  }
};
```

---

#### 33. job-boards/page.tsx
**API**: `/api/ai/job-boards`
**Client Method**: `jobBoards.postJob()`, `jobBoards.syncBoards()`, `jobBoards.analyzePerformance()`

```typescript
import { jobBoards } from '@/lib/services/ai-client';

const [postings, setPostings] = useState([]);
const [analytics, setAnalytics] = useState(null);

const handlePostJob = async (jobData, boards) => {
  const result = await jobBoards.postJob({ jobData, boards });
  if (result.success) {
    await fetchPostings();
  }
};

const fetchPostings = async () => {
  const result = await jobBoards.syncBoards();
  if (result.success) {
    setPostings(result.data.postings || []);
  }
};
```

---

#### 34. email-parsing/page.tsx
**API**: `/api/ai/email-parser`
**Client Method**: `emailParser.parse()`, `emailParser.classify()`, `emailParser.generateResponse()`

```typescript
import { emailParser } from '@/lib/services/ai-client';

const [parsedEmails, setParsedEmails] = useState([]);

const handleParse = async (emailContent) => {
  const result = await emailParser.parse(emailContent);
  if (result.success) {
    setParsedEmails([...parsedEmails, result.data.parsed]);
  }
};

const handleGenerateResponse = async (emailContent, context) => {
  const result = await emailParser.generateResponse(emailContent, context);
  return result.data.response;
};
```

---

#### 35. auto-accruals/page.tsx
**API**: `/api/ai/auto-accruals`
**Client Method**: `autoAccruals.calculate()`, `autoAccruals.process()`, `autoAccruals.configure()`

```typescript
import { autoAccruals } from '@/lib/services/ai-client';

const [accruals, setAccruals] = useState(null);
const [config, setConfig] = useState(null);

const handleCalculate = async () => {
  const result = await autoAccruals.calculate({ tenantId: 'current' });
  if (result.success) {
    setAccruals(result.data);
  }
};

const handleProcess = async () => {
  const result = await autoAccruals.process({ tenantId: 'current' });
  if (result.success) {
    await handleCalculate();
  }
};
```

---

#### 36. nlp-insights/page.tsx (Sentiment Analysis)
**API**: `/api/ai/sentiment`
**Client Method**: `sentiment.analyze()`, `sentiment.batchAnalyze()`, `sentiment.getInsights()`

```typescript
import { sentiment } from '@/lib/services/ai-client';

const [insights, setInsights] = useState([]);

const analyzeSentiment = async (texts) => {
  const result = await sentiment.batchAnalyze(texts);
  if (result.success) {
    setInsights(result.data.results || []);
  }
};
```

---

#### 37. performance-analysis/page.tsx
**API**: `/api/ai/performance`
**Client Method**: `performance.analyze()`, `performance.predict()`, `performance.getRecommendations()`

```typescript
import { performance } from '@/lib/services/ai-client';

const [performanceData, setPerformanceData] = useState(null);
const [predictions, setPredictions] = useState([]);

const analyzePerformance = async (employeeId) => {
  const result = await performance.analyze({ employeeId });
  if (result.success) {
    setPerformanceData(result.data);
  }
};
```

---

#### 38. ai-analytics/page.tsx (Workforce Analytics)
**API**: `/api/ai/workforce`
**Client Method**: `workforce.getAnalytics()`, `workforce.forecast()`, `workforce.optimize()`

```typescript
import { workforce } from '@/lib/services/ai-client';

const [analytics, setAnalytics] = useState(null);
const [forecast, setForecast] = useState(null);

const fetchAnalytics = async () => {
  const result = await workforce.getAnalytics({ tenantId: 'current' });
  if (result.success) {
    setAnalytics(result.data);
  }
};
```

---

#### 39. page.tsx (AI Dashboard)
**API**: Multiple AI endpoints for dashboard summary
**Client Methods**: Mix of all AI services

```typescript
import { attrition, orgHealth, chatbot, leaveForecasting } from '@/lib/services/ai-client';

const [aiDashboard, setAiDashboard] = useState({
  attritionRisk: null,
  healthScore: null,
  leaveProjections: null,
});

const fetchDashboard = async () => {
  const [attritionData, healthData, forecastData] = await Promise.all([
    attrition.predict({ tenantId: 'current' }),
    orgHealth.getHealth({ tenantId: 'current' }),
    leaveForecasting.forecast({ tenantId: 'current', period: 'MONTHLY' }),
  ]);

  setAiDashboard({
    attritionRisk: attritionData.data,
    healthScore: healthData.data.overallScore,
    leaveProjections: forecastData.data.forecast,
  });
};
```

---

## Implementation Checklist Per Page

For each page integration:

- [ ] Import appropriate client service from `@/lib/services/[attendance|ai]-client`
- [ ] Add state management: `[data, setData]`, `[loading, setLoading]`, `[error, setError]`
- [ ] Create `fetchData()` function with try/catch and loading states
- [ ] Add `useEffect(() => { fetchData(); }, [])` for initial load
- [ ] Create action handlers (create, update, delete, approve, etc.)
- [ ] Replace mock data arrays with state variables
- [ ] Wire buttons/forms to action handlers with `onClick={handleAction}`
- [ ] Add loading states to UI: `{loading ? <Spinner /> : <Content />}`
- [ ] Add empty states: `{data.length === 0 ? <EmptyState /> : <Data />}`
- [ ] Add disabled states to buttons during loading
- [ ] Test all CRUD operations
- [ ] Verify data refresh after mutations

---

## Estimated Completion Time

- **Per simple page**: 10-15 minutes
- **Per complex page**: 20-30 minutes
- **34 remaining pages**: 8-12 hours total

## Status Tracking

Update this as pages are completed:

```
Attendance: 6/21 (29%)
AI Automation: 0/18 (0%)
Total: 6/40 (15%)
```

---

**Last Updated**: December 24, 2024
**Next Action**: Continue with shift-management, roster-assignment, then batch the simpler config pages
