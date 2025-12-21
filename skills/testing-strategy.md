---
title: Testing Strategy
category: testing
tags: [unit, integration, e2e, mocking, coverage]
version: 1.0.0
---

Testing strategies and best practices for unit, integration, and end-to-end tests.
Use when setting up test infrastructure, writing test cases, or deciding what
to test. Covers test pyramid, mocking strategies, and coverage guidelines.

## Test Pyramid

```
        /\
       /  \      E2E Tests (few)
      /----\     - Critical user flows
     /      \    - Smoke tests
    /--------\   
   /          \  Integration Tests (some)
  /------------\ - API contracts
 /              \- Database queries
/----------------\
     Unit Tests (many)
     - Pure functions
     - Business logic
     - Edge cases
```

## Unit Testing Principles

### What to Test
- Pure functions with business logic
- Edge cases and boundary conditions
- Error handling paths
- State transitions

### What NOT to Unit Test
- Framework code
- Third-party libraries
- Simple getters/setters
- Trivial code

### AAA Pattern
```typescript
test('calculates total with discount', () => {
  // Arrange
  const items = [{ price: 100 }, { price: 50 }];
  const discount = 0.1;
  
  // Act
  const total = calculateTotal(items, discount);
  
  // Assert
  expect(total).toBe(135);
});
```

## Mocking Strategies

### When to Mock
- External services (APIs, databases)
- Time-dependent code
- Random values
- Side effects (file system, network)

### When NOT to Mock
- The code under test
- Simple value objects
- Internal implementation details

### Mock Examples
```typescript
// Jest mock
jest.mock('./api', () => ({
  fetchUser: jest.fn().mockResolvedValue({ id: 1, name: 'Test' })
}));

// Spy on method
const spy = jest.spyOn(service, 'save');
expect(spy).toHaveBeenCalledWith(expectedData);

// Mock timer
jest.useFakeTimers();
jest.advanceTimersByTime(1000);
```

## Integration Testing

### API Testing
```typescript
describe('POST /users', () => {
  it('creates user with valid data', async () => {
    const response = await request(app)
      .post('/users')
      .send({ name: 'Test', email: 'test@example.com' })
      .expect(201);
    
    expect(response.body).toMatchObject({
      id: expect.any(Number),
      name: 'Test'
    });
  });
});
```

### Database Testing
- Use test database or in-memory
- Reset state between tests
- Use transactions for isolation

## E2E Testing

### What to Cover
- Critical user journeys
- Authentication flows
- Payment/checkout flows
- Error states users might see

### Best Practices
- Use data-testid attributes
- Wait for elements properly
- Test in isolation when possible
- Keep tests deterministic

```typescript
// Playwright example
test('user can complete checkout', async ({ page }) => {
  await page.goto('/products');
  await page.click('[data-testid="add-to-cart"]');
  await page.click('[data-testid="checkout"]');
  await page.fill('[data-testid="email"]', 'test@example.com');
  await page.click('[data-testid="submit"]');
  await expect(page.locator('[data-testid="success"]')).toBeVisible();
});
```

## Coverage Guidelines

- Aim for 80% coverage as baseline
- 100% coverage != bug-free code
- Focus on critical paths, not metrics
- Exclude generated code, config files
