# Contributing to KreupAI AuraOS

Thank you for your interest in contributing to AuraOS! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Requirements](#testing-requirements)
- [Documentation](#documentation)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. We expect all contributors to:

- Be respectful and inclusive in all interactions
- Accept constructive criticism gracefully
- Focus on what is best for the project and community
- Show empathy towards other contributors

## Getting Started

### 1. Fork the Repository

```bash
# Fork via GitHub UI, then clone your fork
git clone https://github.com/YOUR_USERNAME/KreupAI.AuraOS.git
cd KreupAI.AuraOS
```

### 2. Set Up Development Environment

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
# Configure your .env file

# Generate Prisma client
pnpm prisma generate

# Start development server
pnpm dev
```

### 3. Create a Feature Branch

```bash
# Always branch from main
git checkout main
git pull origin main

# Create your feature branch
git checkout -b feature/your-feature-name
```

## Development Workflow

### Branch Naming Convention

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/description` | `feature/add-leave-calendar` |
| Bug Fix | `fix/description` | `fix/attendance-calculation` |
| Hotfix | `hotfix/description` | `hotfix/login-redirect` |
| Refactor | `refactor/description` | `refactor/employee-service` |
| Documentation | `docs/description` | `docs/api-endpoints` |

### Development Cycle

1. **Create Branch** - Branch from `main`
2. **Develop** - Make your changes
3. **Test** - Run tests locally
4. **Commit** - Follow commit guidelines
5. **Push** - Push to your fork
6. **PR** - Open a pull request

## Coding Standards

### TypeScript

We use strict TypeScript. Follow these guidelines:

```typescript
// DO: Use explicit types
function calculateSalary(employee: Employee, month: number): SalaryResult {
  // ...
}

// DON'T: Use 'any' type
function processData(data: any) { // Avoid this!
  // ...
}

// DO: Use interfaces for objects
interface EmployeeInput {
  firstName: string;
  lastName: string;
  email: string;
  departmentId?: string;
}

// DO: Handle errors properly
try {
  await someOperation();
} catch (error) {
  logger.error({ error }, 'Operation failed');
  throw new ApplicationError('Operation failed', 500);
}
```

### React Components

```tsx
// DO: Use functional components with TypeScript
interface EmployeeCardProps {
  employee: Employee;
  onSelect?: (id: string) => void;
}

export function EmployeeCard({ employee, onSelect }: EmployeeCardProps) {
  return (
    <div onClick={() => onSelect?.(employee.id)}>
      {employee.firstName} {employee.lastName}
    </div>
  );
}

// DO: Use hooks for state and side effects
const [loading, setLoading] = useState(false);

useEffect(() => {
  // Effect logic
}, [dependencies]);
```

### API Routes

```typescript
// DO: Use route wrappers for consistency
export const GET = createProtectedRoute(
  async (request, { auth }) => {
    const data = await service.getData(auth.tenantId);
    return { data };
  },
  {
    requiredPermissions: ['resource:read'],
  }
);

// DO: Validate inputs with Zod
const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
});
```

### File Organization

```
src/
├── app/                    # Next.js App Router
│   ├── (modules)/          # Feature modules
│   │   └── module-name/
│   │       ├── page.tsx
│   │       └── components/
│   └── api/                # API routes
│       └── resource/
│           └── route.ts
├── components/             # Shared components
├── hooks/                  # Custom hooks
├── lib/                    # Utilities
├── services/               # API services
└── types/                  # Type definitions
```

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code style (formatting, semicolons) |
| `refactor` | Code refactoring |
| `perf` | Performance improvements |
| `test` | Adding or fixing tests |
| `chore` | Maintenance tasks |

### Examples

```bash
# Feature
git commit -m "feat(leave): add leave calendar view"

# Bug fix
git commit -m "fix(attendance): correct overtime calculation"

# Documentation
git commit -m "docs(api): update employee endpoints"

# With body
git commit -m "feat(payroll): add tax calculation

- Add India GST calculation
- Add UAE VAT calculation
- Update payslip generation"
```

## Pull Request Process

### 1. Before Submitting

- [ ] Code follows project coding standards
- [ ] All tests pass locally (`pnpm test`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Type checking passes (`pnpm type-check`)
- [ ] Documentation is updated if needed
- [ ] Commits follow conventional commit format

### 2. PR Title Format

```
<type>(<scope>): <description>
```

Example: `feat(employee): add bulk import functionality`

### 3. PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- Change 1
- Change 2

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing performed

## Screenshots (if applicable)
Add screenshots here

## Related Issues
Fixes #123
```

### 4. Review Process

1. **Automated Checks** - CI must pass
2. **Code Review** - At least 1 approval required
3. **Testing** - Reviewer may request additional tests
4. **Merge** - Squash and merge preferred

## Testing Requirements

### Unit Tests

All new code should have unit tests:

```typescript
// employee.service.test.ts
describe('EmployeeService', () => {
  describe('createEmployee', () => {
    it('should create employee with valid input', async () => {
      const input = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        tenantId: 'tenant-1',
        companyId: 'company-1',
        hireDate: new Date(),
      };

      const result = await service.createEmployee(input, 'user-1', '127.0.0.1');

      expect(result.success).toBe(true);
      expect(result.employee).toBeDefined();
    });

    it('should reject duplicate email', async () => {
      // Test implementation
    });
  });
});
```

### Coverage Requirements

| Metric | Minimum |
|--------|---------|
| Lines | 30% |
| Functions | 30% |
| Branches | 25% |
| Statements | 30% |

### Running Tests

```bash
# All tests
pnpm test

# With coverage
pnpm test:coverage

# Watch mode
pnpm test:watch

# E2E tests
pnpm test:e2e
```

## Documentation

### When to Document

- New features or APIs
- Complex business logic
- Configuration options
- Breaking changes

### Documentation Locations

| Type | Location |
|------|----------|
| API docs | `docs/API-DOCUMENTATION.md` |
| Architecture | `docs/BACKEND_ARCHITECTURE.md` |
| Module docs | `docs/modules/` |
| Code comments | In-file JSDoc |

### JSDoc Example

```typescript
/**
 * Creates a new employee in the system
 *
 * @param input - Employee creation data
 * @param createdBy - ID of the user creating the employee
 * @param ipAddress - IP address of the request
 * @returns Result object with success status and employee data
 *
 * @example
 * ```typescript
 * const result = await employeeService.createEmployee(
 *   { firstName: 'John', lastName: 'Doe', ... },
 *   'user-123',
 *   '192.168.1.1'
 * );
 * ```
 */
async createEmployee(
  input: CreateEmployeeInput,
  createdBy: string,
  ipAddress: string
): Promise<ServiceResult<Employee>> {
  // Implementation
}
```

## Questions?

If you have questions about contributing:

1. Check existing documentation in `docs/`
2. Search existing issues and PRs
3. Open a new issue with the `question` label
4. Reach out to the development team

---

Thank you for contributing to AuraOS!
