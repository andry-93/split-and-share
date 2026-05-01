# AGENTS.md

## Project
- **Name:** Split & Share
- **Type:** React Native (Expo dev client), offline-first expense sharing app
- **Language:** TypeScript (strict)

## Quick Start
1. `npm ci`
2. `npm run typecheck`
3. `npm test -- --ci`
4. `npm run android` or `npm run ios`

## Run & Build Commands
- Start dev server: `npm run start`
- Android (native): `npm run android`
- iOS (native): `npm run ios`
- Web: `npm run web`
- Regenerate native projects: `npm run prebuild`
- Type check: `npm run typecheck`
- Tests: `npm test -- --ci`

## Architecture Rules
- Keep UI orchestration in `src/features/**`.
- Keep pure calculation logic in `src/domain/**` (especially `src/domain/finance/**`).
- Keep app state in Redux slices/selectors under `src/state/**`.
- Use selectors for derived values; avoid recalculating finance logic inside screens.
- Prefer IDs in navigation params; avoid passing mutable full objects.

## Data & Persistence
- Storage: `react-native-mmkv` (encrypted key path already integrated in state/storage).
- Persist only state slices, not derived data.
- All amounts in business logic are **minor units** (`amountMinor`); format only at UI boundaries.
- Pool-related payments (`source: "pool"`) must never be dropped by debt-reset logic.

## UI/UX Conventions
- Reuse shared components from `src/shared/ui/**`.
- Keep list interactions consistent (selection mode, press states, bulk actions).
- Keep copy in i18next locale files under `src/shared/i18n/locales/**`.
- Do not hardcode user-facing strings in components.

## Quality Gates (before merge)
1. `npm run typecheck` passes.
2. `npm test -- --ci` passes.
3. No new lint/type suppressions without strong reason.
4. State changes preserve existing behavior for:
   - Debts (Detailed/Simplified)
   - Pools contributions/top-ups
   - Event totals and outstanding totals

## Security & Privacy
- Never log PII (phone/email) in debug or error paths.
- Keep Android release permissions minimal; avoid adding dangerous permissions by default.
- Validate all persisted payloads via guards in `src/state/storage/guards.ts`.

## Agent Working Agreement
- Make focused, minimal diffs.
- Add/adjust tests for finance and storage behavior when changing those areas.
- If a migration or state-shape change is needed, update guards and migration path together.
- If uncertain about UX impact, preserve existing visual behavior first, then iterate.
