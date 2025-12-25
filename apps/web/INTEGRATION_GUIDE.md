# Attendance Module - Quick Integration Guide

## Integration Status

### ✅ Completed (100%)
- **22 API Routes**: All created and tested with mock data
- **Client Service Library**: Centralized API client created
- **Menu Integration**: All 20 features added to menu
- **Documentation**: Complete integration summary created
- **2 UI Pages**: time-capture and comp-off fully integrated

### 🔄 In Progress
- **19 UI Pages**: Ready for API integration

## Quick Integration Steps

### Step 1: Import the Client Service

```typescript
// At the top of your page.tsx file
import { serviceName } from '@/lib/services/attendance-client';
```

### Step 2: Add State Management

```typescript
const [data, setData] = useState<DataType[]>([]);
const [summary, setSummary] = useState<SummaryType | null>(null);
const [loading, setLoading] = useState(true);
```

### Step 3: Fetch Data on Mount

```typescript
useEffect(() => {
  fetchData();
}, []);

const fetchData = async () => {
  try {
    const result = await serviceName.getItems(params);
    if (result.success) {
      setData(result.data.items || []);
      setSummary(result.data.summary || null);
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    setLoading(false);
  }
};
```

### Step 4: Add Action Handlers

```typescript
const handleCreate = async (formData) => {
  setLoading(true);
  try {
    const result = await serviceName.createItem(formData);
    if (result.success) {
      await fetchData(); // Refresh data
      // Show success message
    }
  } catch (error) {
    console.error('Error creating:', error);
  } finally {
    setLoading(false);
  }
};

const handleApprove = async (id: string, status: 'APPROVED' | 'REJECTED') => {
  setLoading(true);
  try {
    await serviceName.approveItem(id, status);
    await fetchData(); // Refresh data
  } catch (error) {
    console.error('Error approving:', error);
  } finally {
    setLoading(false);
  }
};
```

### Step 5: Update UI to Use State

```typescript
// Replace mock data arrays with state
{loading ? (
  <div>Loading...</div>
) : data.length === 0 ? (
  <div>No data found</div>
) : data.map(item => (
  <div key={item.id}>
    {/* Render item */}
  </div>
))}
```

## Page-Specific Integration

### 1. Overtime Page
```typescript
import { overtime } from '@/lib/services/attendance-client';

const fetchData = async () => {
  const result = await overtime.getOvertime();
  // Update state
};

const handleSubmit = async (data) => {
  await overtime.submitOvertime({
    employeeId: user.id,
    date: data.date,
    overtimeMinutes: data.hours * 60,
    reason: data.reason
  });
};
```

### 2. Regularization Page
```typescript
import { regularization } from '@/lib/services/attendance-client';

const fetchRegularizations = async () => {
  const result = await regularization.getRegularizations({
    status: 'PENDING'
  });
};

const handleApprove = async (id, status) => {
  await regularization.approveRegularization(id, status);
};
```

### 3. Work From Home Page
```typescript
import { workFromHome } from '@/lib/services/attendance-client';

const fetchWFH = async () => {
  const result = await workFromHome.getWFHRequests();
};

const handleRequest = async (data) => {
  await workFromHome.requestWFH({
    employeeId: user.id,
    startDate: data.startDate,
    endDate: data.endDate,
    reason: data.reason,
    isRecurring: data.isRecurring
  });
};
```

### 4. Timesheets Page
```typescript
import { timesheets } from '@/lib/services/attendance-client';

const fetchTimesheets = async () => {
  const result = await timesheets.getTimesheets();
};

const handleSubmit = async (data) => {
  await timesheets.submitTimesheet({
    employeeId: user.id,
    weekEnding: data.weekEnding,
    entries: data.entries
  });
};
```

### 5. Shift Management Page
```typescript
import { shifts } from '@/lib/services/attendance-client';

const fetchShifts = async () => {
  const result = await shifts.getShifts({ isActive: true });
};

const handleCreate = async (data) => {
  await shifts.createShift(data);
};
```

### 6. Roster Assignment Page
```typescript
import { roster } from '@/lib/services/attendance-client';

const fetchRosters = async () => {
  const result = await roster.getRosters();
};

const handleAssign = async (data) => {
  await roster.createRoster(data);
};
```

### 7. Exceptions Page
```typescript
import { exceptions } from '@/lib/services/attendance-client';

const fetchExceptions = async () => {
  const result = await exceptions.getExceptions({
    status: 'PENDING'
  });
};
```

### 8. Field Force Page
```typescript
import { fieldForce } from '@/lib/services/attendance-client';

const fetchVisits = async () => {
  const result = await fieldForce.getVisits();
};

const handleCheckIn = async (data) => {
  await fieldForce.checkIn(data);
};

const handleCheckOut = async (visitId, data) => {
  await fieldForce.checkOut(visitId, data.checkOut, data.notes);
};
```

### 9. Geo-Fencing Page
```typescript
import { geoFencing } from '@/lib/services/attendance-client';

const fetchGeoFences = async () => {
  const result = await geoFencing.getGeoFences();
};

const validateLocation = async (lat, lng) => {
  const result = await geoFencing.validateLocation(lat, lng);
  return result.data.isValid;
};
```

### 10. Approval Workflow Page
```typescript
import { approvalWorkflow } from '@/lib/services/attendance-client';

const fetchWorkflows = async () => {
  const result = await approvalWorkflow.getWorkflows();
};

const handleCreate = async (data) => {
  await approvalWorkflow.createWorkflow(data);
};
```

## Common Patterns

### Loading States
```typescript
{loading ? (
  <div className="p-8 text-center">
    <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
    <p className="mt-2 text-slate-500">Loading...</p>
  </div>
) : (
  // Content
)}
```

### Empty States
```typescript
{data.length === 0 ? (
  <div className="p-8 text-center text-slate-400">
    <p>No data found</p>
    <button onClick={() => /* action */}>Create New</button>
  </div>
) : (
  // Data rendering
)}
```

### Error Handling
```typescript
const [error, setError] = useState<string | null>(null);

try {
  // API call
  setError(null);
} catch (err) {
  setError(err instanceof Error ? err.message : 'An error occurred');
}

// In UI
{error && (
  <div className="bg-red-50 text-red-600 p-4 rounded-lg">
    {error}
  </div>
)}
```

### Success Messages
```typescript
const [success, setSuccess] = useState<string | null>(null);

const handleAction = async () => {
  try {
    await apiCall();
    setSuccess('Action completed successfully!');
    setTimeout(() => setSuccess(null), 3000);
  } catch (error) {
    // Handle error
  }
};

// In UI
{success && (
  <div className="bg-green-50 text-green-600 p-4 rounded-lg">
    {success}
  </div>
)}
```

## Testing Checklist

For each integrated page:

- [ ] Data fetches on page load
- [ ] Loading state shows while fetching
- [ ] Empty state shows when no data
- [ ] Data displays correctly
- [ ] Create/submit actions work
- [ ] Approve/reject actions work (if applicable)
- [ ] Success messages appear
- [ ] Error handling works
- [ ] Page refreshes after actions
- [ ] UI updates reflect API changes

## Performance Tips

1. **Debounce Search**: Use debounce for search inputs
```typescript
const debouncedSearch = useMemo(
  () => debounce((value) => fetchData({ search: value }), 300),
  []
);
```

2. **Pagination**: Implement for large datasets
```typescript
const [page, setPage] = useState(1);
const [limit] = useState(20);

const fetchData = async () => {
  const result = await api.get({ page, limit });
};
```

3. **Caching**: Use SWR or React Query for caching
```typescript
import useSWR from 'swr';

const { data, error, mutate } = useSWR(
  '/api/attendance/comp-off',
  fetcher
);
```

## Next Steps

1. Start with **critical pages**: overtime, regularization, work-from-home
2. Then **management pages**: comp-off-management, overtime-management
3. Then **configuration pages**: shifts, roster, rules
4. Finally **advanced features**: geo-fencing, field-force, workflows

## Estimated Time

- **Each simple page**: 15-20 minutes
- **Each complex page**: 30-40 minutes
- **Total for all 19 pages**: 6-8 hours

## Support

All APIs are ready and tested. If you encounter issues:
1. Check the API route file for expected request/response format
2. Check `/lib/services/attendance-client.ts` for method signatures
3. Review `/ATTENDANCE_INTEGRATION_SUMMARY.md` for complete documentation
