---
name: react-performance
description: >
  React/Next.js performance patterns with wrong/right code examples.
  Apply when building or reviewing React components.
  Adapted from Vercel React Best Practices by @shuding.
---

# React Performance Patterns

## 1. Eliminating Waterfalls -- CRITICAL

### 1.1 Defer Await Until Needed
Why: Avoid blocking paths that never use the result.

**Wrong:**
```ts
async function handle(id: string, skip: boolean) {
  const data = await fetchData(id)
  if (skip) return { skipped: true }
  return process(data)
}
```
**Right:**
```ts
async function handle(id: string, skip: boolean) {
  if (skip) return { skipped: true }
  return process(await fetchData(id))
}
```

### 1.2 Start Independent Work Immediately
Why: Sequential awaits add full round-trip per call. Fire promises early, await when needed.

**Wrong:**
```ts
const session = await auth()
const config = await fetchConfig()
const data = await fetchData(session.user.id)
```
**Right:**
```ts
const sessionP = auth(), configP = fetchConfig()
const session = await sessionP
const [config, data] = await Promise.all([configP, fetchData(session.user.id)])
```

### 1.3 Promise.all for Independent Operations
Why: N sequential awaits = N round trips; Promise.all = 1.

**Wrong:** `const a = await f1(); const b = await f2()`
**Right:** `const [a, b] = await Promise.all([f1(), f2()])`

### 1.4 Strategic Suspense Boundaries
Why: Wrap only data-dependent sections so the rest renders immediately.

**Wrong:**
```tsx
async function Page() {
  const data = await fetchData() // blocks entire page
  return <div><Header /><DataView data={data} /><Footer /></div>
}
```
**Right:**
```tsx
function Page() {
  return <div><Header /><Suspense fallback={<Skeleton />}><DataView /></Suspense><Footer /></div>
}
async function DataView() { const data = await fetchData(); return <div>{data.content}</div> }
```

## 2. Bundle Size -- CRITICAL

### 2.1 Avoid Barrel File Imports
Why: Barrel re-exports load thousands of modules (200-800ms cold start).

**Wrong:** `import { Check } from 'lucide-react'`
**Right:** `import Check from 'lucide-react/dist/esm/icons/check'`
Or use `optimizePackageImports` in next.config.js.

### 2.2 Conditional Module Loading
Why: Load heavy modules only when the feature activates.

**Wrong:** `import { frames } from './animation-frames'`
**Right:** `if (enabled) import('./animation-frames').then(m => setFrames(m.frames))`

### 2.3 Defer Non-Critical Libraries
Why: Analytics/logging don't block interaction. Load after hydration.

**Wrong:** `import { Analytics } from '@vercel/analytics/react'`
**Right:** `const Analytics = dynamic(() => import('@vercel/analytics/react').then(m => m.Analytics), { ssr: false })`

### 2.4 Dynamic Imports for Heavy Components
Why: Large components not needed initially load on demand.

**Wrong:** `import { MonacoEditor } from './monaco-editor'`
**Right:** `const MonacoEditor = dynamic(() => import('./monaco-editor').then(m => m.MonacoEditor), { ssr: false })`

### 2.5 Preload on User Intent
Why: Start loading on hover so bundle is ready on click.

**Right:** `<button onMouseEnter={() => void import('./editor')} onClick={open}>Open</button>`

## 3. Server-Side Performance -- HIGH

### 3.1 Cross-Request LRU Caching
Why: React.cache is per-request. LRU shares across sequential requests.

```ts
const cache = new LRUCache<string, any>({ max: 1000, ttl: 5 * 60_000 })
async function getUser(id: string) {
  return cache.get(id) ?? (() => { const p = db.user.findUnique({ where: { id } }); p.then(u => cache.set(id, u)); return p })()
}
```

### 3.2 Minimize RSC Serialization
Why: Props crossing server/client boundary are serialized. Pass only needed fields.

**Wrong:** `<Profile user={user} />` (50 fields)
**Right:** `<Profile name={user.name} />` (1 field)

### 3.3 Parallel Fetching via Composition
Why: RSCs in parent-child tree fetch sequentially. Siblings parallelize.

**Wrong:** `async function Page() { const h = await fetchHeader(); return <div>{h}<Sidebar /></div> }`
**Right:** `function Page() { return <div><Header /><Sidebar /></div> }` (both fetch in parallel)

### 3.4 React.cache for Per-Request Dedup
Why: Multiple components calling same function share one execution per request.

```ts
export const getUser = cache(async () => {
  const s = await auth(); return s?.user?.id ? db.user.findUnique({ where: { id: s.user.id } }) : null
})
```

### 3.5 after() for Non-Blocking Side Effects
Why: Logging should not delay response.

**Wrong:** `await updateDB(req); await log(req); return json({ ok: 1 })`
**Right:** `await updateDB(req); after(() => log(req)); return json({ ok: 1 })`

## 4. Client-Side Fetching -- MEDIUM-HIGH

### 4.1 Deduplicate Global Listeners
Why: N hook instances share 1 listener via `useSWRSubscription`, not N.

### 4.2 SWR for Deduplication
Why: Multiple components fetching same key share one request.

**Wrong:** `useEffect(() => { fetch(url).then(r => r.json()).then(set) }, [])`
**Right:** `const { data } = useSWR(url, fetcher)`

## 5. Re-render Optimization -- MEDIUM

### 5.1 Defer State Reads
Why: searchParams subscription re-renders on every URL change.

**Wrong:** `const sp = useSearchParams(); const fn = () => sp.get('ref')`
**Right:** `const fn = () => new URLSearchParams(location.search).get('ref')`

### 5.2 Memoized Component Extraction
Why: Expensive work behind loading guard still runs in same component.

**Wrong:**
```tsx
function Profile({ user, loading }) {
  const av = useMemo(() => compute(user), [user])
  if (loading) return <Skeleton />; return <div>{av}</div>
}
```
**Right:**
```tsx
const Avatar = memo(({ user }) => <Img id={useMemo(() => compute(user), [user])} />)
function Profile({ user, loading }) { if (loading) return <Skeleton />; return <Avatar user={user} /> }
```

### 5.3 Narrow Effect Dependencies
**Wrong:** `useEffect(() => log(user.id), [user])`
**Right:** `useEffect(() => log(user.id), [user.id])`

### 5.4 Derived State Subscriptions
Why: Continuous values re-render every pixel; booleans only on transition.

**Wrong:** `const w = useWindowWidth(); const m = w < 768`
**Right:** `const m = useMediaQuery('(max-width: 767px)')`

### 5.5 Functional setState
Why: Prevents stale closures; removes state from deps.

**Wrong:** `useCallback(() => setItems([...items, x]), [items])`
**Right:** `useCallback(x => setItems(c => [...c, x]), [])`

### 5.6 Lazy State Initialization
**Wrong:** `useState(buildIndex(items))` (runs every render)
**Right:** `useState(() => buildIndex(items))` (runs once)

### 5.7 Transitions for Non-Urgent Updates
**Wrong:** `setScrollY(window.scrollY)` (blocks UI)
**Right:** `startTransition(() => setScrollY(window.scrollY))`

## 6. Rendering Performance -- MEDIUM

### 6.1 Animate SVG Wrapper
Why: No GPU acceleration on SVG elements directly.

**Wrong:** `<svg className="animate-spin">...</svg>`
**Right:** `<div className="animate-spin"><svg>...</svg></div>`

### 6.2 content-visibility for Lists
Why: Browser skips layout/paint for off-screen items.

`.item { content-visibility: auto; contain-intrinsic-size: 0 80px; }`

### 6.3 Hoist Static JSX
**Wrong:** `function C() { return loading && <div className="sk" /> }`
**Right:** `const sk = <div className="sk" />; function C() { return loading && sk }`

### 6.4 SVG Precision
**Wrong:** `d="M 10.293847 20.847362"`
**Right:** `d="M 10.3 20.8"` (svgo --precision=1)

### 6.5 Hydration Without Flicker
Use synchronous `<script>` to read localStorage before React hydrates instead of useEffect.

### 6.6 Activity for Show/Hide
Preserves state/DOM: `<Activity mode={open ? 'visible' : 'hidden'}><Menu /></Activity>`

### 6.7 Explicit Conditionals
Why: `{count && <Badge />}` renders "0" when count is 0.

**Wrong:** `{count && <span>{count}</span>}`
**Right:** `{count > 0 ? <span>{count}</span> : null}`

## 7. JS Patterns (Cherry-Picked)

### 7.1 Early Return
**Wrong:** `for (u of users) { if (!u.email) err = 'req' } return err ? ...`
**Right:** `for (u of users) { if (!u.email) return { error: 'req' } } return { valid: true }`

### 7.2 Set/Map for O(1) Lookups
**Wrong:** `['a','b'].includes(id)` (O(n))
**Right:** `new Set(['a','b']).has(id)` (O(1))
