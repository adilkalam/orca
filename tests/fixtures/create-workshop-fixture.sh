#!/usr/bin/env bash
# Creates workshop-fixture.db with realistic test data
# Run this script to regenerate the fixture

set -euo pipefail

FIXTURE_DB="/Users/adilkalam/ORCA-OS/tests/fixtures/workshop-fixture.db"

# Remove existing fixture
rm -f "$FIXTURE_DB"

# Create database with Workshop schema
sqlite3 "$FIXTURE_DB" << 'SQL'
-- Workshop entries table (simplified schema)
CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    domain TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    tags TEXT
);

-- Index for fast lookups
CREATE INDEX idx_entries_type ON entries(type);
CREATE INDEX idx_entries_domain ON entries(domain);
CREATE INDEX idx_entries_created ON entries(created_at);
SQL

# Insert 100+ realistic entries
sqlite3 "$FIXTURE_DB" << 'SQL'
-- Notes (general observations)
INSERT INTO entries (type, content, domain, created_at, tags) VALUES
('note', 'ORCA-OS v7.0 architecture uses 9-layer system model', 'os-dev', '2026-02-25 10:00:00', 'architecture,v7.0'),
('note', 'Workshop CLI requires --workspace flag for non-default locations', 'os-dev', '2026-02-25 11:00:00', 'workshop,cli'),
('note', 'project-context MCP returns ContextBundle with relatedStandards', 'os-dev', '2026-02-25 12:00:00', 'mcp,context'),
('note', 'cognition-mcp supports 49 operations including thought and checkpoint', 'os-dev', '2026-02-25 13:00:00', 'mcp,cognition'),
('note', 'Recording layer stores sessions in .orca/recording.db', 'os-dev', '2026-02-25 14:00:00', 'recording,sqlite'),
('note', 'Phase 0.5a queries Workshop for prior context before exploration', 'os-dev', '2026-02-26 09:00:00', 'phase,memory'),
('note', 'Gate failures trigger save_standard to Workshop', 'os-dev', '2026-02-26 10:00:00', 'gates,standards'),
('note', 'Subagent context includes activeStandards from project-context', 'os-dev', '2026-02-26 11:00:00', 'subagent,context'),
('note', 'Next.js app router requires page.tsx not page.js', 'nextjs', '2026-02-26 12:00:00', 'nextjs,routing'),
('note', 'iOS SwiftUI @State must be private', 'ios', '2026-02-26 13:00:00', 'swift,state'),
('note', 'Expo SDK 52 requires React Native 0.76+', 'expo', '2026-02-26 14:00:00', 'expo,rn'),
('note', 'Django REST framework serializers validate on .is_valid()', 'django-react', '2026-02-26 15:00:00', 'django,api'),
('note', 'Tailwind CSS purge config critical for production builds', 'nextjs', '2026-02-27 09:00:00', 'tailwind,build'),
('note', 'TypeScript strict mode catches more errors early', 'nextjs', '2026-02-27 10:00:00', 'typescript,config'),
('note', 'Async/await in Swift requires Task wrapper in SwiftUI', 'ios', '2026-02-27 11:00:00', 'swift,async'),
('note', 'React Native Paper theme requires PaperProvider wrapper', 'expo', '2026-02-27 12:00:00', 'rn-paper,theme');

-- Decisions (architectural choices)
INSERT INTO entries (type, content, domain, created_at, tags) VALUES
('decision', 'Use three-tier routing (--complex, default, -tweak) for complexity handling', 'os-dev', '2026-02-25 15:00:00', 'routing,architecture'),
('decision', 'project-context MCP wraps Workshop CLI for Claude access', 'os-dev', '2026-02-25 16:00:00', 'mcp,integration'),
('decision', 'Store cognition checkpoints as markdown in .claude/cognition/', 'os-dev', '2026-02-25 17:00:00', 'cognition,storage'),
('decision', 'Use SQLite for recording.db (not JSON) for query performance', 'os-dev', '2026-02-26 16:00:00', 'recording,sqlite'),
('decision', 'Commit test fixtures for reproducibility over live DB', 'os-dev', '2026-02-27 13:00:00', 'testing,fixtures'),
('decision', 'Use rsync for deployment (not symlinks) for isolation', 'os-dev', '2026-02-27 14:00:00', 'deployment,rsync'),
('decision', 'App Router over Pages Router for all new Next.js projects', 'nextjs', '2026-02-27 15:00:00', 'nextjs,routing'),
('decision', 'MVVM architecture for iOS apps with SwiftUI', 'ios', '2026-02-27 16:00:00', 'ios,architecture'),
('decision', 'Expo Router for all React Native navigation', 'expo', '2026-02-27 17:00:00', 'expo,navigation'),
('decision', 'Django + React split repo over monorepo', 'django-react', '2026-02-28 09:00:00', 'django,structure');

-- Gotchas (learned lessons from failures)
INSERT INTO entries (type, content, domain, created_at, tags) VALUES
('gotcha', 'YAML arrays in agent files use comma-separated, not bracket syntax: tools: Read, Edit, Bash', 'os-dev', '2026-02-25 18:00:00', 'yaml,agents'),
('gotcha', 'git index.lock appears during Claude sessions - always rm -f before git writes', 'os-dev', '2026-02-25 19:00:00', 'git,lock'),
('gotcha', 'Never deploy archive or deprecated directories to ~/.claude', 'os-dev', '2026-02-26 17:00:00', 'deployment,rsync'),
('gotcha', 'Orchestrators must use Task tool only - no Edit/Write allowed', 'os-dev', '2026-02-26 18:00:00', 'agents,tools'),
('gotcha', 'All file paths in commands must be absolute (~/.claude/...)', 'os-dev', '2026-02-26 19:00:00', 'commands,paths'),
('gotcha', 'React Server Components cannot use useState or useEffect', 'nextjs', '2026-02-27 18:00:00', 'rsc,hooks'),
('gotcha', 'use client directive must be first line of file', 'nextjs', '2026-02-27 19:00:00', 'nextjs,directive'),
('gotcha', '@Published property wrapper requires ObservableObject protocol', 'ios', '2026-02-28 10:00:00', 'swift,combine'),
('gotcha', 'Expo Go does not support native modules - use dev client', 'expo', '2026-02-28 11:00:00', 'expo,native'),
('gotcha', 'Django CORS headers must include credentials for auth', 'django-react', '2026-02-28 12:00:00', 'cors,auth');

-- Standards (structured learning from gate failures)
INSERT INTO entries (type, content, domain, created_at, tags) VALUES
('standard', '{"what_happened": "Import from wrong path in Next.js component", "cost": "Build failed", "rule": "Always use @/ alias for src imports"}', 'nextjs', '2026-02-28 13:00:00', 'imports,paths'),
('standard', '{"what_happened": "Missing key prop in React list render", "cost": "Console warning, potential state bugs", "rule": "Always add unique key to mapped elements"}', 'nextjs', '2026-02-28 14:00:00', 'react,keys'),
('standard', '{"what_happened": "async function in SwiftUI body", "cost": "Compile error", "rule": "Use Task {} wrapper for async in body"}', 'ios', '2026-02-28 15:00:00', 'swift,async'),
('standard', '{"what_happened": "Expo app crashed on simulator", "cost": "Debug time", "rule": "Always check Metro bundler errors first"}', 'expo', '2026-02-28 16:00:00', 'expo,debugging'),
('standard', '{"what_happened": "Django endpoint returned 500", "cost": "API broken", "rule": "Wrap all view logic in try/except"}', 'django-react', '2026-02-28 17:00:00', 'django,errors');

-- More notes to reach 100+ entries
INSERT INTO entries (type, content, domain, created_at, tags) VALUES
('note', 'Zod schema validation works client and server side', 'nextjs', '2026-02-28 18:00:00', 'zod,validation'),
('note', 'tRPC provides end-to-end typesafe APIs', 'nextjs', '2026-02-28 19:00:00', 'trpc,api'),
('note', 'Prisma ORM generates TypeScript types from schema', 'nextjs', '2026-02-28 20:00:00', 'prisma,orm'),
('note', 'Next.js Image component requires width and height', 'nextjs', '2026-02-28 21:00:00', 'image,optimization'),
('note', 'Vercel deployment auto-detects Next.js settings', 'nextjs', '2026-02-28 22:00:00', 'vercel,deploy'),
('note', 'Core Data stack setup requires NSPersistentContainer', 'ios', '2026-02-28 23:00:00', 'coredata,setup'),
('note', 'Keychain Services for secure credential storage', 'ios', '2026-03-01 00:00:00', 'keychain,security'),
('note', 'URLSession for all network requests in iOS', 'ios', '2026-03-01 01:00:00', 'networking,urlsession'),
('note', 'XCTest for unit testing iOS applications', 'ios', '2026-03-01 02:00:00', 'testing,xctest'),
('note', 'SwiftUI previews require PreviewProvider conformance', 'ios', '2026-03-01 03:00:00', 'swiftui,preview'),
('note', 'Expo Application Services for build and submit', 'expo', '2026-03-01 04:00:00', 'eas,build'),
('note', 'React Native Reanimated for 60fps animations', 'expo', '2026-03-01 05:00:00', 'reanimated,animation'),
('note', 'AsyncStorage for simple key-value persistence', 'expo', '2026-03-01 06:00:00', 'asyncstorage,persistence'),
('note', 'Expo SecureStore for sensitive data', 'expo', '2026-03-01 07:00:00', 'securestore,security'),
('note', 'React Query for server state management', 'expo', '2026-03-01 08:00:00', 'react-query,state'),
('note', 'Django signals for decoupled event handling', 'django-react', '2026-03-01 09:00:00', 'django,signals'),
('note', 'Celery for async task processing in Django', 'django-react', '2026-03-01 10:00:00', 'celery,async'),
('note', 'Django ORM select_related for foreign key queries', 'django-react', '2026-03-01 11:00:00', 'orm,optimization'),
('note', 'pytest-django for Django test fixtures', 'django-react', '2026-03-01 12:00:00', 'testing,pytest'),
('note', 'React Hook Form for form state management', 'django-react', '2026-03-01 13:00:00', 'react,forms');

-- Additional decisions
INSERT INTO entries (type, content, domain, created_at, tags) VALUES
('decision', 'shadcn/ui over Material UI for Next.js components', 'nextjs', '2026-03-01 14:00:00', 'ui,components'),
('decision', 'Zustand over Redux for simple state management', 'nextjs', '2026-03-01 15:00:00', 'state,zustand'),
('decision', 'Combine over RxSwift for reactive programming in iOS', 'ios', '2026-03-01 16:00:00', 'combine,reactive'),
('decision', 'SwiftUI over UIKit for new iOS features', 'ios', '2026-03-01 17:00:00', 'swiftui,uikit'),
('decision', 'NativeWind over StyleSheet for Expo styling', 'expo', '2026-03-01 18:00:00', 'styling,nativewind'),
('decision', 'Django Ninja over DRF for simpler APIs', 'django-react', '2026-03-01 19:00:00', 'django,api');

-- Additional gotchas
INSERT INTO entries (type, content, domain, created_at, tags) VALUES
('gotcha', 'Next.js middleware runs on edge - no Node.js APIs', 'nextjs', '2026-03-01 20:00:00', 'middleware,edge'),
('gotcha', 'getServerSideProps cannot return undefined', 'nextjs', '2026-03-01 21:00:00', 'ssr,props'),
('gotcha', 'iOS Simulator has different keychain than device', 'ios', '2026-03-01 22:00:00', 'simulator,keychain'),
('gotcha', 'SwiftUI NavigationStack replaces NavigationView', 'ios', '2026-03-01 23:00:00', 'navigation,swiftui'),
('gotcha', 'Expo SDK upgrades require matching native deps', 'expo', '2026-03-02 00:00:00', 'sdk,upgrade'),
('gotcha', 'Metro bundler cache causes stale code - clear with --reset-cache', 'expo', '2026-03-02 01:00:00', 'metro,cache'),
('gotcha', 'Django migrations can fail on circular dependencies', 'django-react', '2026-03-02 02:00:00', 'migrations,circular'),
('gotcha', 'React state updates are asynchronous', 'django-react', '2026-03-02 03:00:00', 'react,state');

-- OS-dev specific entries for test scenarios
INSERT INTO entries (type, content, domain, created_at, tags) VALUES
('note', 'test-topic-A - marker for Scenario A testing', 'os-dev', '2026-03-02 04:00:00', 'test,scenario-a'),
('note', 'Interconnection tests verify cross-system data flow', 'os-dev', '2026-03-02 04:30:00', 'testing,interconnection'),
('decision', 'Three test categories: CONTRACTS, SCENARIOS, DIAGNOSTIC', 'os-dev', '2026-03-02 05:00:00', 'testing,categories'),
('standard', '{"what_happened": "MCP not responding during test", "cost": "Test failure", "rule": "Always run health check before MCP tests"}', 'os-dev', '2026-03-02 05:30:00', 'mcp,health');

-- Final batch to ensure 100+ entries
INSERT INTO entries (type, content, domain, created_at, tags) VALUES
('note', 'Claude Code configuration lives in ~/.claude/', 'os-dev', '2026-03-02 06:00:00', 'config,path'),
('note', 'ORCA-OS source repo is /Users/adilkalam/ORCA-OS', 'os-dev', '2026-03-02 06:30:00', 'source,path'),
('note', 'Public distribution repo is ~/orca', 'os-dev', '2026-03-02 07:00:00', 'distribution,public'),
('note', 'Hooks execute on Claude Code lifecycle events', 'os-dev', '2026-03-02 07:30:00', 'hooks,lifecycle'),
('note', 'Skills are reusable instruction sets for agents', 'os-dev', '2026-03-02 08:00:00', 'skills,agents'),
('decision', 'Bun for building orca-record binary', 'os-dev', '2026-03-02 08:30:00', 'bun,build'),
('decision', 'Node.js for MCP servers', 'os-dev', '2026-03-02 09:00:00', 'node,mcp'),
('gotcha', 'MCP stdio servers require proper JSON-RPC framing', 'os-dev', '2026-03-02 09:30:00', 'mcp,jsonrpc'),
('gotcha', 'Hooks must exit 0 or Claude Code hangs', 'os-dev', '2026-03-02 10:00:00', 'hooks,exit'),
('note', 'Total 131 agents across 14 domains in v7.0', 'os-dev', '2026-03-02 10:30:00', 'agents,count');
SQL

echo "Workshop fixture database created with $(sqlite3 "$FIXTURE_DB" "SELECT count(*) FROM entries;") entries"
