---
"gql-query-builder": major
---

Full modernization of the toolchain and package format.

**Breaking changes:**

- Node.js >= 20 is now required (`engines` field enforced).
- The package now ships both ESM and CJS builds with an `exports` map. Deep imports into `build/` no longer work (output moved to `dist/` and only the package root is exported).
- Build target is now ES2022 instead of ES5.
- Fixed mutation output indentation regression introduced in 3.8.0: generated mutation strings are indented consistently with queries and subscriptions again (2 spaces, closing brace at column 0).
- Fixed a crash when calling `subscription()` without `variables`.

**Other changes:**

- Migrated npm -> pnpm, TSLint/Prettier -> Biome, Jest -> Vitest, tsc build -> tsup.
- Custom adapters are now properly typed as constructor parameters (`QueryAdapterConstructor`, `MutationAdapterConstructor`, `SubscriptionAdapterConstructor` are exported); removed all `@ts-ignore`s.
- Releases are automated with Changesets and published with npm provenance.
