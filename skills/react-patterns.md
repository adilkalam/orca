---
title: React Patterns
category: react
tags: [hooks, components, state, effects]
version: 1.0.0
---

Essential React patterns for hooks, components, and state management.
Use when building React components, implementing custom hooks, or debugging
state management issues. Covers useState, useEffect, useCallback, useMemo,
and context patterns.

## Custom Hook Patterns

### useDebounce
```typescript
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
}
```

### useLocalStorage
```typescript
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });
  
  const setValue = (value: T | ((val: T) => T)) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    window.localStorage.setItem(key, JSON.stringify(valueToStore));
  };
  
  return [storedValue, setValue] as const;
}
```

## Component Patterns

### Compound Components
```tsx
const Tabs = ({ children }: { children: React.ReactNode }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  return (
    <TabsContext.Provider value={{ activeIndex, setActiveIndex }}>
      {children}
    </TabsContext.Provider>
  );
};

Tabs.Tab = ({ index, children }) => {
  const { activeIndex, setActiveIndex } = useContext(TabsContext);
  return (
    <button 
      onClick={() => setActiveIndex(index)}
      data-active={activeIndex === index}
    >
      {children}
    </button>
  );
};
```

### Render Props
```tsx
const MouseTracker = ({ render }: { render: (pos: {x: number, y: number}) => React.ReactNode }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMove = (e: MouseEvent) => setPosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);
  
  return <>{render(position)}</>;
};
```

## Performance Patterns

### Memoization
- Use `useMemo` for expensive computations
- Use `useCallback` for callback stability
- Use `React.memo` for component memoization
- Always check if memoization is actually needed (profile first)

### Code Splitting
```tsx
const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

## Anti-Patterns to Avoid

1. **State in useEffect deps that triggers the effect** - leads to infinite loops
2. **Missing cleanup functions** - causes memory leaks
3. **Deriving state from props without key** - use `key` prop to reset
4. **Overusing Context** - creates unnecessary re-renders
5. **useState for derived values** - use useMemo instead
