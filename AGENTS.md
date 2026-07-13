# gql-query-builder — Agent Guide

Zero-runtime-dependency TypeScript library that generates GraphQL query/mutation/subscription **strings** (plus a `variables` object) from plain JavaScript objects. Published to npm as `gql-query-builder`.

## Commands

Package manager is **pnpm** (see `packageManager` in package.json). Node >= 20.

| Task | Command |
| --- | --- |
| Install | `pnpm install` |
| Build (ESM + CJS + d.ts to `dist/`) | `pnpm build` |
| Typecheck (no emit) | `pnpm typecheck` |
| Lint + format check (Biome) | `pnpm lint` |
| Auto-fix lint/format | `pnpm format` |
| Test (Vitest) | `pnpm test` |
| Single test file | `pnpm exec vitest run src/__tests__/query.test.ts` |
| Coverage | `pnpm coverage` |
| Validate published package shape | `pnpm check-package` (publint + arethetypeswrong) |

## Layout

- `src/index.ts` — public entry: `query()`, `mutation()`, `subscription()`, `adapters`, plus all public types (named exports only).
- `src/types.ts` — option/result types (`QueryBuilderOptions`, `Fields`, `NestedField`, `VariableOptions`, `Operation`, `OperationResult`) and the `isNestedField` guard. Deprecated `I*` aliases live here too.
- `src/utils.ts` — shared pure helpers (field maps, variable resolution, GraphQL type inference).
- `src/adapters/types.ts` — adapter contracts (`QueryAdapter`, `MutationAdapter`, `SubscriptionAdapter`) and their constructor types.
- `src/adapters/default-{query,mutation,subscription}-adapter.ts` — default string-generation classes (use native `#private` fields).
- `src/adapters/app-sync-{query,mutation}-adapter.ts` — AWS AppSync variants, bundled in the `adapters` export.
- `src/__tests__/` — Vitest suites (globals enabled, no imports of `describe`/`it` needed).
- `docs/api.md` — compact API reference with canonical examples.

## Public API contract

`query/mutation/subscription(options, adapter?, config?)` returns `{ query: string, variables: object }`. `options` is `{ operation, fields?, variables? }` or an array of those. See `docs/api.md` for the full options/variables shapes and examples.

## Hard constraints

- **Zero runtime dependencies.** Never add anything to `dependencies`.
- **Exact output strings are the API.** Tests assert generated strings character-for-character (including spaces and commas). Any change to templates in the adapters is a breaking change; don't "clean up" whitespace in template literals.
- Public API surface (named exports, option shapes, adapter interfaces) must stay backward compatible unless a major release is planned.
- Dual ESM/CJS package: keep `exports` map in package.json consistent with tsup output (`dist/index.mjs` / `dist/index.js`).

## Conventions

- Strict TypeScript; Biome enforces lint + format (config in `biome.json`). Run `pnpm format` before committing.
- Tests use Vitest with `globals: true`; add tests next to the feature in `src/__tests__/`.
- Releases via **Changesets**: every user-facing change needs a changeset file (`pnpm changeset`). Merging the auto-generated "Version Packages" PR publishes to npm from CI via OIDC trusted publishing (no `NPM_TOKEN`; provenance is automatic). Requires a Trusted Publisher configured on npmjs.com pointing at this repo + `release.yml`.
- Git hooks (husky): pre-commit runs Biome on staged files; pre-push runs lint + typecheck + tests.
