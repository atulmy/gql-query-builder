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
- Fixed a crash on `null` variable values (`variables: { id: null }` now emits `$id: String` and keeps the `null` in the variables map).
- Fixed a crash in the AppSync mutation adapter when called without variables.
- Subscriptions now render nested operations, inline fragments, and the `name` variable descriptor exactly like queries/mutations (previously crashed or were silently ignored).
- AppSync adapters now honor `list` and `default` variable descriptors, declare every operation's variables in multi-operation documents (previously only the last operation's), and work with `config.fragments` — fragment definitions are appended by the dispatch layer, so they work with any adapter.
- `rawGraphQL()` values are recognized across the dual CJS/ESM builds (registry-symbol brand instead of `instanceof`).
- Sourcemaps are no longer shipped to npm (~100KB of a ~190KB payload).

**New GraphQL spec features:**

- Variable default values: `{ value, type, default }` descriptors emit `$var: Type = <literal>`. Strings are quoted and input objects use unquoted keys; the new `rawGraphQL()` helper inserts enum literals verbatim (`default: rawGraphQL("JEDI")` -> `= JEDI`). `toGraphQLLiteral()` is exported too.
- Named fragments: `config.fragments` (`{ name, on, fields }[]`) appends `fragment ... on ... { ... }` definitions to the document; spread them with plain `"...name"` field strings. Supported by query, mutation, and subscription.
- `subscription()` now accepts a third `config` argument supporting `operationName` and `fragments`, matching query/mutation.
- Field-level directives (`@include`/`@skip`/`@defer`), field aliases, and meta fields (`__typename`) via string passthrough are now covered by tests and documented.

**Other changes:**

- Migrated npm -> pnpm, TSLint/Prettier -> Biome, Jest -> Vitest, tsc build -> tsup.
- Source fully rewritten with a modern structure: kebab-case modules, named exports, consolidated `src/types.ts`, native `#private` class fields, string-union `OperationType` instead of an enum.
- The package root now exports all public types (`QueryBuilderOptions`, `Operation`, `Fields`, `NestedField`, `VariableOptions`, `OperationResult`, `AdapterConfig`), the adapter contracts (`QueryAdapter`, `MutationAdapter`, `SubscriptionAdapter` — old `I*` names remain as deprecated aliases), the adapter constructor types, and the default adapter classes for reuse/extension.
- Custom adapters are now properly typed as constructor parameters; removed all `@ts-ignore`s.
- Releases are automated with Changesets and published to npm via OIDC trusted publishing (no `NPM_TOKEN` secret), with provenance attestations generated automatically.
