---
name: testing-patterns
description: Vitest and React Testing Library patterns for React applications. Use when writing unit tests, creating test factories, or following TDD workflow. Triggers on tasks involving tests, testing, Vitest, describe/it blocks, or test-driven development.
---

# Testing Patterns

## Setup Requirements

This template uses Vitest with React Testing Library. Dependencies are pre-installed:

```json
{
  "devDependencies": {
    "@testing-library/react": "^16.0.1",
    "@testing-library/jest-dom": "^6.6.2",
    "vitest": "^2.1.4"
  },
  "scripts": {
    "test": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

---

## TDD Workflow

### Red-Green-Refactor Cycle

1. **RED:** Write failing test first
   ```tsx
   it('renders button with correct text', () => {
     render(<Button>Click me</Button>);
     expect(screen.getByRole('button')).toHaveTextContent('Click me');
   });
   // ❌ Test fails - component doesn't exist yet
   ```

2. **GREEN:** Write minimal code to pass
   ```tsx
   export function Button({ children }) {
     return <button>{children}</button>;
   }
   // ✅ Test passes
   ```

3. **REFACTOR:** Improve without changing behavior
   ```tsx
   // Add styling while keeping tests passing
   ```

---

## Test Utilities

### Custom Render with Providers

```tsx
// src/test-utils.tsx
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { ThemeProvider } from '@/context/ThemeContext';

function AllProviders({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export * from '@testing-library/react';
export { renderWithProviders as render };
```

### Factory Functions

```tsx
// src/test-factories.ts

// Props Factory for Components
export function createButtonProps(
  overrides: Partial<React.ComponentProps<typeof Button>> = {}
) {
  return {
    children: 'Click me',
    onClick: vi.fn(),
    variant: 'primary' as const,
    disabled: false,
    ...overrides,
  };
}

// Data Factory
export function createUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    ...overrides,
  };
}
```

---

## Component Testing Patterns

### Testing User Interactions

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Button', () => {
  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<Button onClick={onClick}>Click</Button>);
    await user.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<Button disabled onClick={onClick}>Click</Button>);
    await user.click(screen.getByRole('button'));

    expect(onClick).not.toHaveBeenCalled();
  });
});
```

### Testing Accessibility

```tsx
describe('Button accessibility', () => {
  it('decorative elements are hidden from screen readers', () => {
    const { container } = render(<Button>Accessible</Button>);
    const decorativeElements = container.querySelectorAll('[aria-hidden="true"]');

    decorativeElements.forEach(el => {
      expect(el).toHaveAttribute('aria-hidden', 'true');
    });
  });

  it('button is keyboard accessible', () => {
    render(<Button>Click</Button>);
    const button = screen.getByRole('button');
    button.focus();
    expect(document.activeElement).toBe(button);
  });

  it('disabled button is not interactive', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });
});
```

---

## Mocking Patterns

### Mocking Components

```tsx
vi.mock('@/components/ui/Button', () => ({
  Button: ({ children, onClick }: any) => (
    <button onClick={onClick} data-testid="mock-button">
      {children}
    </button>
  ),
}));
```

### Mocking Animations

```tsx
// Disable animations in tests
beforeAll(() => {
  vi.useFakeTimers();
});

afterAll(() => {
  vi.useRealTimers();
});

it('completes animation', () => {
  render(<AnimatedComponent />);
  vi.advanceTimersByTime(500); // Skip 500ms animation
  expect(screen.getByText('Done')).toBeInTheDocument();
});
```

---

## Query Priority

Use queries in this order (most to least preferred):

1. **`getByRole`** - Accessible elements
   ```tsx
   screen.getByRole('button', { name: 'Submit' })
   ```

2. **`getByLabelText`** - Form elements
   ```tsx
   screen.getByLabelText('Email')
   ```

3. **`getByText`** - Text content
   ```tsx
   screen.getByText('Welcome')
   ```

4. **`getByTestId`** - Last resort
   ```tsx
   screen.getByTestId('custom-element')
   ```

---

## Anti-Patterns

### ❌ Testing Implementation Details
```tsx
// BAD: Tests internal state
expect(component.state.isHovered).toBe(true);

// GOOD: Tests visible behavior
await user.hover(button);
expect(button).toHaveClass('hover-state');
```

### ❌ Snapshot Overuse
```tsx
// BAD: Entire component snapshot
expect(container).toMatchSnapshot();

// GOOD: Targeted assertion
expect(button).toHaveClass('btn-primary');
```

### ❌ Manual Data Creation
```tsx
// BAD: Hardcoded in every test
const user = { id: '1', name: 'Test', ... };

// GOOD: Use factory
const user = createUser({ name: 'Custom' });
```

---

## File Organization

```
src/
├── components/
│   └── ui/
│       ├── Button.tsx
│       └── Button.test.tsx    # Tests live next to components
├── test-utils.tsx             # Custom render with providers
└── test-factories.ts          # Data factories
```
