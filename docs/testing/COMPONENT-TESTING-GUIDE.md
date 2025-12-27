# Component Testing Best Practices Guide
**Version:** 1.0
**Last Updated:** December 27, 2024
**Owner:** Dev B (QA Specialist)
**Framework:** React + Vitest + Testing Library

---

## Table of Contents

1. [Philosophy](#philosophy)
2. [Setup & Tools](#setup--tools)
3. [Writing Good Component Tests](#writing-good-component-tests)
4. [Testing Patterns](#testing-patterns)
5. [Common Testing Scenarios](#common-testing-scenarios)
6. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)
7. [Examples](#examples)

---

## Philosophy

### Test Behavior, Not Implementation

**❌ Don't test:**
- Internal component state
- CSS classes or inline styles
- Component structure (div > span > button)
- Implementation details

**✅ Do test:**
- What the user sees
- How the user interacts
- Accessibility (keyboard, screen reader)
- Error states and edge cases

### The Testing Library Way

> "The more your tests resemble the way your software is used, the more confidence they can give you." - Kent C. Dodds

Use queries in this priority order:
1. **getByRole** - Best for accessibility
2. **getByLabelText** - For form fields
3. **getByPlaceholderText** - Only if no label
4. **getByText** - For non-interactive elements
5. **getByTestId** - Last resort

---

## Setup & Tools

### Required Dependencies

```json
{
  "devDependencies": {
    "@testing-library/react": "^16.3.1",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/user-event": "^14.5.2",
    "vitest": "^4.0.16",
    "@vitest/ui": "^4.0.16"
  }
}
```

### Test File Structure

```
src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx       ← Component test
│   │   └── index.ts
│   └── EmployeeCard/
│       ├── EmployeeCard.tsx
│       ├── EmployeeCard.test.tsx
│       └── index.ts
└── __tests__/
    ├── setup.ts                   ← Global test setup
    ├── setupAxe.ts                ← Accessibility setup
    └── factories/                 ← Test data factories
        ├── employee.factory.ts
        └── user.factory.ts
```

---

## Writing Good Component Tests

### 1. Test Structure (AAA Pattern)

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('calls onClick handler when clicked', () => {
    // Arrange - Set up test data and component
    const handleClick = vi.fn();

    // Act - Render and interact
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByRole('button', { name: /click me/i }));

    // Assert - Verify expected outcome
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### 2. Descriptive Test Names

**Format:** `it('[action/state] [expected result] [condition]')`

```typescript
// ✅ Good
it('displays error message when form submission fails')
it('disables submit button when form is invalid')
it('shows loading spinner while data is fetching')

// ❌ Bad
it('works correctly')
it('test 1')
it('handles edge case')
```

### 3. Testing User Interactions

Use `@testing-library/user-event` for realistic interactions:

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBox } from './SearchBox';

it('filters results as user types', async () => {
  const user = userEvent.setup();
  const onSearch = vi.fn();

  render(<SearchBox onSearch={onSearch} />);

  const input = screen.getByRole('textbox', { name: /search/i });
  await user.type(input, 'John Doe');

  expect(onSearch).toHaveBeenLastCalledWith('John Doe');
});
```

---

## Testing Patterns

### Pattern 1: Rendering Tests

**Test that component renders with correct content:**

```typescript
import { render, screen } from '@testing-library/react';
import { EmployeeCard } from './EmployeeCard';
import { EmployeeFactory } from '@/__tests__/factories';

describe('EmployeeCard - Rendering', () => {
  it('renders employee name and position', () => {
    const employee = EmployeeFactory.build({
      firstName: 'John',
      lastName: 'Doe',
      position: 'Software Engineer'
    });

    render(<EmployeeCard employee={employee} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
  });

  it('displays active status badge', () => {
    const employee = EmployeeFactory.buildActive();

    render(<EmployeeCard employee={employee} />);

    expect(screen.getByText(/active/i)).toBeInTheDocument();
  });
});
```

### Pattern 2: Interaction Tests

**Test user interactions and callbacks:**

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmployeeCard } from './EmployeeCard';
import { EmployeeFactory } from '@/__tests__/factories';

describe('EmployeeCard - Interactions', () => {
  it('calls onEdit when edit button is clicked', async () => {
    const user = userEvent.setup();
    const handleEdit = vi.fn();
    const employee = EmployeeFactory.build({ id: 'emp-123' });

    render(<EmployeeCard employee={employee} onEdit={handleEdit} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));

    expect(handleEdit).toHaveBeenCalledWith('emp-123');
  });

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();
    const handleDelete = vi.fn();
    const employee = EmployeeFactory.build({ id: 'emp-123' });

    render(<EmployeeCard employee={employee} onDelete={handleDelete} />);

    await user.click(screen.getByRole('button', { name: /delete/i }));

    expect(handleDelete).toHaveBeenCalledWith('emp-123');
  });
});
```

### Pattern 3: Conditional Rendering

**Test conditional display logic:**

```typescript
describe('EmployeeCard - Conditional Rendering', () => {
  it('shows edit button only when editable is true', () => {
    const employee = EmployeeFactory.build();

    const { rerender } = render(
      <EmployeeCard employee={employee} editable={false} />
    );

    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();

    rerender(<EmployeeCard employee={employee} editable={true} />);

    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
  });

  it('displays terminated badge for terminated employees', () => {
    const employee = EmployeeFactory.buildTerminated();

    render(<EmployeeCard employee={employee} />);

    expect(screen.getByText(/terminated/i)).toBeInTheDocument();
  });
});
```

### Pattern 4: Form Testing

**Test form inputs and validation:**

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmployeeForm } from './EmployeeForm';

describe('EmployeeForm', () => {
  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(<EmployeeForm onSubmit={handleSubmit} />);

    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/email/i), 'john.doe@test.com');

    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@test.com'
      });
    });
  });

  it('shows validation errors for invalid email', async () => {
    const user = userEvent.setup();

    render(<EmployeeForm onSubmit={vi.fn()} />);

    await user.type(screen.getByLabelText(/email/i), 'invalid-email');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
    });
  });

  it('disables submit button while submitting', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<EmployeeForm onSubmit={handleSubmit} />);

    const submitButton = screen.getByRole('button', { name: /submit/i });

    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.click(submitButton);

    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });
});
```

### Pattern 5: Async Data Loading

**Test loading states and error handling:**

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { EmployeeList } from './EmployeeList';
import { EmployeeFactory } from '@/__tests__/factories';

describe('EmployeeList - Async', () => {
  it('displays loading state while fetching', () => {
    render(<EmployeeList />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('displays employee list after successful fetch', async () => {
    const employees = EmployeeFactory.buildMany(3);

    // Mock API response
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: employees })
    });

    render(<EmployeeList />);

    await waitFor(() => {
      expect(screen.getAllByTestId('employee-card')).toHaveLength(3);
    });
  });

  it('displays error message when fetch fails', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Failed to fetch'));

    render(<EmployeeList />);

    await waitFor(() => {
      expect(screen.getByText(/error loading employees/i)).toBeInTheDocument();
    });
  });
});
```

---

## Common Testing Scenarios

### Scenario 1: Testing Modals/Dialogs

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeleteConfirmModal } from './DeleteConfirmModal';

describe('DeleteConfirmModal', () => {
  it('does not render when closed', () => {
    render(<DeleteConfirmModal isOpen={false} onConfirm={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders modal when open', () => {
    render(<DeleteConfirmModal isOpen={true} onConfirm={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', async () => {
    const user = userEvent.setup();
    const handleConfirm = vi.fn();

    render(<DeleteConfirmModal isOpen={true} onConfirm={handleConfirm} onCancel={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /confirm/i }));

    expect(handleConfirm).toHaveBeenCalled();
  });

  it('calls onCancel when escape key is pressed', async () => {
    const user = userEvent.setup();
    const handleCancel = vi.fn();

    render(<DeleteConfirmModal isOpen={true} onConfirm={vi.fn()} onCancel={handleCancel} />);

    await user.keyboard('{Escape}');

    expect(handleCancel).toHaveBeenCalled();
  });
});
```

### Scenario 2: Testing Dropdowns/Selects

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DepartmentSelect } from './DepartmentSelect';

describe('DepartmentSelect', () => {
  const departments = [
    { id: '1', name: 'Engineering' },
    { id: '2', name: 'Sales' },
    { id: '3', name: 'Marketing' }
  ];

  it('displays all department options', async () => {
    const user = userEvent.setup();

    render(<DepartmentSelect departments={departments} value="" onChange={vi.fn()} />);

    await user.click(screen.getByRole('combobox'));

    expect(screen.getByRole('option', { name: /engineering/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /sales/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /marketing/i })).toBeInTheDocument();
  });

  it('calls onChange when option is selected', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<DepartmentSelect departments={departments} value="" onChange={handleChange} />);

    await user.selectOptions(screen.getByRole('combobox'), '2');

    expect(handleChange).toHaveBeenCalledWith('2');
  });
});
```

### Scenario 3: Testing Tables

```typescript
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmployeeTable } from './EmployeeTable';
import { EmployeeFactory } from '@/__tests__/factories';

describe('EmployeeTable', () => {
  const employees = EmployeeFactory.buildMany(5);

  it('renders all employee rows', () => {
    render(<EmployeeTable employees={employees} />);

    const rows = screen.getAllByRole('row');
    // +1 for header row
    expect(rows).toHaveLength(employees.length + 1);
  });

  it('sorts by column when header is clicked', async () => {
    const user = userEvent.setup();

    render(<EmployeeTable employees={employees} sortable={true} />);

    const nameHeader = screen.getByRole('columnheader', { name: /name/i });
    await user.click(nameHeader);

    // Verify sort icon or aria-sort attribute
    expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');
  });

  it('calls onRowClick when row is clicked', async () => {
    const user = userEvent.setup();
    const handleRowClick = vi.fn();

    render(<EmployeeTable employees={employees} onRowClick={handleRowClick} />);

    const firstRow = screen.getAllByRole('row')[1]; // Skip header
    await user.click(firstRow);

    expect(handleRowClick).toHaveBeenCalledWith(employees[0]);
  });
});
```

---

## Anti-Patterns to Avoid

### ❌ Anti-Pattern 1: Testing Implementation Details

```typescript
// BAD - Testing internal state
it('updates state when input changes', () => {
  const { container } = render(<MyComponent />);
  const component = container.querySelector('.my-component');

  expect(component.__state.value).toBe('');
});

// GOOD - Testing user-facing behavior
it('displays typed value in input', async () => {
  const user = userEvent.setup();
  render(<MyComponent />);

  const input = screen.getByRole('textbox');
  await user.type(input, 'test');

  expect(input).toHaveValue('test');
});
```

### ❌ Anti-Pattern 2: Using getByTestId Everywhere

```typescript
// BAD
it('renders button', () => {
  render(<Button>Click</Button>);
  expect(screen.getByTestId('submit-button')).toBeInTheDocument();
});

// GOOD
it('renders button', () => {
  render(<Button>Click</Button>);
  expect(screen.getByRole('button', { name: /click/i })).toBeInTheDocument();
});
```

### ❌ Anti-Pattern 3: Not Cleaning Up

```typescript
// BAD - No cleanup
it('test 1', () => {
  render(<Component />);
  // ... test
});

it('test 2', () => {
  // Previous component still in DOM!
  render(<Component />);
});

// GOOD - Testing Library auto-cleanup or manual cleanup
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});
```

### ❌ Anti-Pattern 4: Testing Third-Party Libraries

```typescript
// BAD - Testing React Router
it('navigates to correct route', () => {
  // Don't test React Router - it's already tested!
});

// GOOD - Test your component's behavior
it('calls navigate with correct path when button is clicked', async () => {
  const mockNavigate = vi.fn();
  vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate
  }));

  // ... test your component
});
```

---

## Accessibility Testing

**Every component test should include accessibility check:**

```typescript
import { render } from '@testing-library/react';
import { axe } from '@/__tests__/setupAxe';
import { MyComponent } from './MyComponent';

describe('MyComponent - Accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<MyComponent />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

---

## Performance Testing

**Test component doesn't cause unnecessary re-renders:**

```typescript
import { render } from '@testing-library/react';
import { vi } from 'vitest';
import { ExpensiveComponent } from './ExpensiveComponent';

describe('ExpensiveComponent - Performance', () => {
  it('does not re-render when props do not change', () => {
    const renderSpy = vi.fn();

    function TrackedComponent(props) {
      renderSpy();
      return <ExpensiveComponent {...props} />;
    }

    const { rerender } = render(<TrackedComponent data={{ id: 1 }} />);

    expect(renderSpy).toHaveBeenCalledTimes(1);

    // Same props reference
    rerender(<TrackedComponent data={{ id: 1 }} />);

    // Should re-render because new object reference
    expect(renderSpy).toHaveBeenCalledTimes(2);
  });
});
```

---

## Summary Checklist

**For every component test:**
- [ ] Test renders without crashing
- [ ] Test user-visible content
- [ ] Test user interactions
- [ ] Test edge cases and error states
- [ ] Test accessibility (axe-core)
- [ ] Test keyboard navigation
- [ ] Use appropriate queries (getByRole > getByTestId)
- [ ] Clean up after tests
- [ ] Mock external dependencies
- [ ] Test loading/error states for async components

---

**Next Steps:**
- Review examples in `/apps/web/src/__tests__/`
- Run tests: `pnpm test`
- View coverage: `pnpm test:coverage`
- Open test UI: `pnpm test:ui`

**Last Updated:** December 27, 2024
**Next Review:** January 3, 2025
