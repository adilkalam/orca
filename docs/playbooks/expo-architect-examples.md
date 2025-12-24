# Expo Architect – Comprehensive Planning Examples

This playbook contains detailed examples extracted from the expo-architect-agent to demonstrate comprehensive planning for different complexity levels.

These examples show:
- How to use chain-of-thought planning with `<thinking>` and `<answer>` tags
- Breaking down features into testable phases
- Assigning specialists appropriately
- Setting quality targets aligned with the Expo Quality Rubric
- Providing rollback strategies

---

## Example 1: Implementing Offline-First Shopping Cart

**Complexity: Medium (3 days)**

**Request:** "Make the shopping cart work offline and sync when network returns"

```xml
<thinking>
1. **Requirement Analysis**
   - User wants cart persistence across app restarts
   - Cart should work without network
   - Sync to backend when online
   - Acceptance: Add items offline, checkout syncs correctly

2. **Architecture Impact**
   - Data layer (major): New offline storage + sync logic
   - UI layer (minor): Loading states during sync
   - Navigation: No changes
   - Files affected: ~15 (cart screens, state, API, storage)

3. **Task Decomposition**
   - Phase 1: Offline storage infrastructure
   - Phase 2: Cart state refactor to use offline-first
   - Phase 3: Sync engine
   - Phase 4: UI loading/error states

4. **Risk Assessment**
   - Performance: Storage I/O on every cart change (use debouncing)
   - Security: Cart data includes prices (validate server-side)
   - Architecture: Need to choose storage (SQLite vs AsyncStorage)

5. **Agent Selection**
   - @expo-builder-agent (implementation)
   - @performance-prophet (predict sync performance)
   - @security-specialist (validate sync security)
   - @expo-verification-agent (test offline/online transitions)

6. **Quality Targets**
   - Implementation: 90+ (clean storage abstraction)
   - Performance: 85+ (fast cart updates)
   - Security: 90+ (no price tampering)
</thinking>

<answer>
## Implementation Plan: Offline-First Shopping Cart

### Requirements
- Cart persists across app restarts
- All cart operations work offline (add/remove/update quantity)
- Automatic sync when network available
- Conflict resolution (server cart vs local cart)
- Loading states during sync
- Error handling for failed syncs

### Architecture Path
- Navigation: No changes (existing Expo Router cart flow)
- State: Migrate cart from `useState` → React Query + AsyncStorage
- Data: Offline-first pattern with background sync
- Storage: AsyncStorage (cart is small, <100kb typically)

### Impact Surface
- Screens: `app/(tabs)/cart.tsx`, `app/(tabs)/checkout.tsx`
- State: New `lib/stores/cart-store.ts` (offline-first)
- APIs: `lib/api/cart.ts` (add sync methods)
- Storage: `lib/storage/cart-storage.ts` (new)
- Sync: `lib/sync/cart-sync.ts` (new)

### Implementation Phases

**Phase 1: Storage Infrastructure (Day 1)**
- Task 1: Create `cart-storage.ts` with AsyncStorage wrapper → @expo-builder-agent
- Task 2: Add cart state schema and migrations
- Task 3: Unit test storage operations
- Gate: @performance-enforcer (check storage I/O speed)

**Phase 2: Offline-First Cart State (Day 2)**
- Task 1: Refactor cart to use React Query with AsyncStorage persistence
- Task 2: Add optimistic updates for cart operations
- Task 3: Update UI to show offline indicator
- Agent: @expo-builder-agent
- Gate: @design-token-guardian (check loading states use design tokens)

**Phase 3: Sync Engine (Day 3)**
- Task 1: Build sync logic (NetInfo listener + background sync)
- Task 2: Conflict resolution (server wins for prices, client wins for quantities)
- Task 3: Retry logic for failed syncs
- Agent: @expo-builder-agent
- Gate: @security-specialist (validate price tampering prevention)
- Gate: @performance-prophet (predict sync performance at scale)

**Phase 4: Testing & Edge Cases (Day 4)**
- Task 1: Test offline→online transitions
- Task 2: Test concurrent updates (same item added on web + mobile)
- Task 3: Test error states (network failure during checkout)
- Agent: @expo-verification-agent
- Gate: @a11y-enforcer (check loading/error states are accessible)

### Quality Targets (Expo Rubric)
- Implementation Standards: 90+ (clean separation: storage/state/sync/UI)
- UI/Design: 85+ (loading states use tokens, accessible error messages)
- Architecture: 90+ (follows offline-first best practices)
- Performance: 85+ (cart updates <50ms, sync doesn't block UI)
- Security: 90+ (server validates all prices, no tampering possible)

### Rollback Strategy
If sync implementation fails:
1. Keep Phase 1+2 (offline cart works, just doesn't sync)
2. Revert Phase 3 (sync engine)
3. Add "manual sync" button as fallback
4. Document sync as "v2 feature"

### Predicted Complexity: Medium (3 days)
**Agent count: 6**
- 1 architect (this plan)
- 1 builder (4 phases)
- 4 gates (design-token, security, performance-prophet, a11y)
</answer>
```

---

## Example 2: Adding Biometric Authentication

**Complexity: Simple (5 hours)**

**Request:** "Add Face ID/Touch ID to login screen"

```xml
<thinking>
1. **Requirement Analysis**
   - User wants biometric auth as alternative to password
   - Should work on both iOS (Face ID) and Android (fingerprint)
   - Fallback to password if biometric unavailable
   - Acceptance: Tap "Use Face ID" → authenticate → login succeeds

2. **Architecture Impact**
   - UI: Add biometric button to login screen
   - Auth: New biometric auth service
   - Storage: Securely store biometric preference
   - Files affected: ~8 (login screen, auth service, storage, tests)

3. **Task Decomposition**
   - Phase 1: Add Expo LocalAuthentication module
   - Phase 2: Build biometric auth service
   - Phase 3: Update login UI
   - Phase 4: Testing on real devices

4. **Risk Assessment**
   - Security: CRITICAL - must use Secure Storage for tokens
   - UX: Must handle "biometric not enrolled" gracefully
   - Platform: Different UX on iOS vs Android

5. **Agent Selection**
   - @expo-builder-agent (implementation)
   - @security-specialist (validate secure storage)
   - @a11y-enforcer (ensure fallback is accessible)
   - @expo-verification-agent (test on devices)

6. **Quality Targets**
   - Security: 95+ (no token leaks, proper secure storage)
   - Implementation: 90+ (clean service abstraction)
   - Accessibility: 90+ (fallback for users without biometrics)
</thinking>

<answer>
## Implementation Plan: Biometric Authentication

### Requirements
- Support Face ID (iOS) and Fingerprint/Face Unlock (Android)
- Optional feature (users can enable/disable)
- Fallback to password if biometric fails or unavailable
- Store auth preference securely
- Show platform-appropriate biometric icons

### Architecture Path
- Navigation: No changes (existing auth flow)
- State: Add `useBiometricAuth` hook
- Security: Use Expo SecureStore for tokens
- Platform: Conditional UI based on device capabilities

### Impact Surface
- Screens: `app/(auth)/login.tsx`
- Services: `lib/auth/biometric-auth.ts` (new)
- Storage: `lib/storage/secure-storage.ts` (enhanced)
- State: `lib/hooks/use-biometric-auth.ts` (new)

### Implementation Phases

**Phase 1: Infrastructure (1 hour)**
- Task 1: Install `expo-local-authentication` → @expo-builder-agent
- Task 2: Create `biometric-auth.ts` service (check support, authenticate)
- Task 3: Add unit tests for service
- Gate: @security-specialist (review service API)

**Phase 2: Login UI Update (2 hours)**
- Task 1: Add biometric button to login screen
- Task 2: Add platform icons (🔒 for Android, 👤 for iOS)
- Task 3: Add "Enable Biometric Auth" toggle in settings
- Agent: @expo-builder-agent
- Gate: @design-token-guardian (icons use design system)
- Gate: @a11y-enforcer (button has accessible label)

**Phase 3: Secure Storage (1 hour)**
- Task 1: Store biometric preference in SecureStore
- Task 2: Store auth token securely after biometric success
- Task 3: Clear stored token on logout
- Agent: @expo-builder-agent
- Gate: @security-specialist (validate SecureStore usage - CRITICAL)

**Phase 4: Testing (1 hour)**
- Task 1: Test on iOS device with Face ID
- Task 2: Test on Android device with fingerprint
- Task 3: Test fallback when biometric fails
- Task 4: Test "biometric not enrolled" flow
- Agent: @expo-verification-agent

### Quality Targets (Expo Rubric)
- Security: 95+ (CRITICAL - must use SecureStore correctly, no plaintext tokens)
- Implementation Standards: 90+ (clean service, proper error handling)
- UI/Design: 85+ (platform-appropriate icons, accessible labels)
- Accessibility: 90+ (password fallback always available)

### Rollback Strategy
If biometric implementation has issues:
1. Hide biometric button with feature flag
2. Keep password login working
3. Fix issues in next release
4. Biometric is additive - password auth unaffected

### Predicted Complexity: Simple (5 hours)
**Agent count: 5**
- 1 architect (this plan)
- 1 builder (4 phases)
- 3 gates (security [CRITICAL], design-token, a11y)
</answer>
```

---

## Key Takeaways from These Examples

### 1. Always Use Chain-of-Thought for Standard+ Complexity
For anything beyond simple bugfixes, explicitly think through:
- Requirements and acceptance criteria
- Architecture impact (which layers affected)
- Task decomposition (each phase independently testable)
- Risk assessment (performance, security, architectural)
- Agent selection (which specialists needed)
- Quality targets (which rubric dimensions matter)

### 2. Be Specific with Agent Delegation
Don't say "implement the feature" - say:
- "Phase 1: @expo-builder-agent implements cart storage infrastructure"
- "Phase 2: @expo-builder-agent adds sync engine"

### 3. Target Expo Rubric Dimensions Explicitly
Tell builder which scores matter:
- "Security: 95+ CRITICAL"
- "Implementation: 90+"
- "Design: 85+ acceptable"

### 4. Provide Rollback Strategies
Every plan should explain how to revert if implementation fails. This shows you've thought about risk.

### 5. Record Architectural Decisions
When you choose React Query over Redux, or Expo Router over React Navigation, save that decision via `mcp__project-context__save_decision` so future tasks build on it.

### 6. Break Down by Testing Boundaries
Each phase should be independently testable. Create phases like:
- "Phase 1: Storage (testable)"
- "Phase 2: UI (testable)"
- "Phase 3: Sync (testable)"

Not: "Phase 1: Implement everything"

### 7. Consider Performance and Security Proactively
Don't wait for gates to catch issues:
- List with 1000+ items → assign @performance-prophet
- Auth or payments → assign @security-specialist

### 8. Estimate Agent Count Upfront
Help /orca understand scope:
- Simple (3-5 agents)
- Standard (5-7)
- Medium (7-10)
- High (10-15)

### 9. Use Concrete Examples in Plans
Instead of "update cart screen", say:
- "app/(tabs)/cart.tsx: add offline indicator, update quantity buttons to show optimistic updates"

### 10. Response Awareness Tagging
Use RA tags to surface assumptions:
- `#PATH_DECISION` for architecture choices
- `#PATH_RATIONALE` for reasoning
- `#COMPLETION_DRIVE` for assumptions
- `#CONTEXT_DEGRADED` if context is missing
