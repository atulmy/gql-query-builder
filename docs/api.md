# gql-query-builder API Reference

Generates GraphQL operation strings (plus a matching `variables` object) from plain JavaScript objects. Zero runtime dependencies. Ships ESM and CJS builds with full TypeScript types.

## Entry points

```typescript
import { query, mutation, subscription, adapters } from "gql-query-builder";

query(options, adapter?, config?);        // -> { query: string, variables: object }
mutation(options, adapter?, config?);     // -> { query: string, variables: object }
subscription(options, adapter?, config?); // -> { query: string, variables: object }
```

- `options`: one operation object `{ operation, fields?, variables? }`, or an array of them (combined into a single document).
- `adapter` (optional): a class implementing `QueryAdapter` / `MutationAdapter` / `SubscriptionAdapter` to customize string generation. Pass `null`/`undefined` to use the defaults.
- `config` (optional): `{ operationName?: string, fragments?: FragmentDefinition[] }` — adds a named operation and/or named fragment definitions to the document.

## The options object

| Key | Type | Required | Meaning |
| --- | --- | --- | --- |
| `operation` | `string` or `{ name, alias }` | yes | Root field to call. The object form emits `alias: name`. |
| `fields` | array | no | Selection set. Strings, nested objects, or fragment objects. |
| `variables` | object | no | Plain values or descriptor objects (below). |

### Variable descriptors

A variable value can be a plain value (`{ id: 1 }` → type inferred: `Int`, `Float`, `Boolean`, `String`, `Object`) or a descriptor:

```typescript
{
  email: { value: "jon@example.com", required: true },        // -> $email: String!
  phone: { value: {...}, type: "PhoneNumber", required: true }, // -> $phone: PhoneNumber!
  tags:  { value: [], type: "String", list: true },            // -> $tags: [String]
  id2:   { name: "id", type: "ID", value: 123 },               // custom argument name: (id: $id2)
  first: { value: 10, default: 5 },                            // -> $first: Int = 5
  ep:    { value: "EMPIRE", type: "Episode", default: rawGraphQL("JEDI") }, // -> $ep: Episode = JEDI
}
```

Descriptor keys: `value`, `type` (GraphQL type name), `required` (appends `!`), `list` (`true` → `[T]`, `[true]` → `[T!]`), `name` (argument name if different from the variable key), `default` (emits `= <literal>` in the variable definition; strings are quoted, input object keys unquoted — wrap enum names in `rawGraphQL()` from the package root; when only `default` is given, also give `type` or the type is inferred as `String`).

## Canonical examples

### Query with variables

```typescript
query({ operation: "thought", variables: { id: 1 }, fields: ["id", "name"] });
// query: "query ($id: Int) { thought (id: $id) { id, name } }"
// variables: { id: 1 }
```

### Nested field selection

```typescript
query({ operation: "orders", fields: ["id", { user: ["name", { address: ["city"] }] }] });
// query { orders { id, user { name, address { city } } } }
```

### Alias

```typescript
query({ operation: { name: "thoughts", alias: "myThoughts" }, fields: ["id"] });
// query { myThoughts: thoughts { id } }
```

### Inline fragment

```typescript
query({
  operation: "thought",
  fields: ["id", { operation: "FragmentType", fields: ["emotion"], fragment: true }],
});
// query { thought { id, ... on FragmentType { emotion } } }
```

### Named fragment (definition + spread)

```typescript
query(
  { operation: "hero", fields: ["...heroFields"] },
  null,
  { fragments: [{ name: "heroFields", on: "Character", fields: ["name"] }] }
);
// query { hero { ...heroFields } }
//
// fragment heroFields on Character { name }
```

Fragment definitions are appended by the dispatch layer, so they work with any adapter (default, AppSync, or custom). Limitation: variables used by nested operations *inside* fragment fields are not auto-collected into the operation's variable definitions — declare any variable a fragment references in the operation's own `variables`.

### Directives, field aliases, meta fields (string passthrough)

Field strings are inserted verbatim, so any field-level GraphQL syntax works:

```typescript
query({
  operation: "hero",
  variables: { withFriends: { value: true, type: "Boolean", required: true } },
  fields: ["name", "friends @include(if: $withFriends)", "empireHero: name", "__typename"],
});
```

### Nested operation with variables (sub-selection with arguments)

```typescript
query([{
  operation: "someoperation",
  fields: [{
    operation: "nestedoperation",
    fields: ["field1"],
    variables: { id2: { name: "id", type: "ID", value: 123 } },
  }],
  variables: { id1: { name: "id", type: "ID", value: 456 } },
}]);
// query ($id2: ID, $id1: ID) { someoperation (id: $id1) { nestedoperation (id: $id2) { field1 } } }
```

### Multiple operations in one document

```typescript
query([
  { operation: "getFilteredUsersCount" },
  { operation: "getAllUsersCount", fields: [] },
]);
// query { getFilteredUsersCount getAllUsersCount }
```

### Mutation

```typescript
mutation({
  operation: "thoughtCreate",
  variables: { name: "Tyrion Lannister", thought: "I drink and I know things." },
  fields: ["id"],
});
// mutation ($name: String, $thought: String) { thoughtCreate (name: $name, thought: $thought) { id } }
// variables: { name: "...", thought: "..." }
```

### Operation name

```typescript
query({ operation: "userLogin", fields: ["token"] }, null, { operationName: "loginQuery" });
// query loginQuery { userLogin { token } }
```

### Subscription

```typescript
subscription({ operation: "thoughtCreated", fields: ["id"] });
// subscription { thoughtCreated { id } }
```

## Custom adapters

An adapter is a class constructed with `(options, config?)` that implements the builder methods. Exported constructor types: `QueryAdapterConstructor`, `MutationAdapterConstructor`, `SubscriptionAdapterConstructor`.

```typescript
import { query, adapters } from "gql-query-builder";

// Bundled AWS AppSync adapters:
query(options, adapters.DefaultAppSyncQueryAdapter);
```

Interfaces to implement (exported from the package root, defined in `src/adapters/types.ts`):

- `QueryAdapter`: `queryBuilder()`, `queriesBuilder(options[])`
- `MutationAdapter`: `mutationBuilder()`, `mutationsBuilder(options[])`
- `SubscriptionAdapter`: `subscriptionBuilder()`, `subscriptionsBuilder(options[])`

(The pre-v4 `IQueryAdapter`/`IMutationAdapter`/`ISubscriptionAdapter` names still work as deprecated aliases.)

Each returns `{ query: string, variables: object }`. Reference implementations: `src/adapters/default-query-adapter.ts`, `default-mutation-adapter.ts`, `default-subscription-adapter.ts`. The default adapter classes are also exported from the package root for reuse.
