/**
 * The recipe gallery. Each recipe is a self-contained snippet of `source` that
 * evaluates (with `query`, `mutation`, `subscription`, `rawGraphQL` and
 * `adapters` in scope) to a `{ query, variables }` result.
 *
 * The exact same evaluator powers the editable code panel, so what you see is
 * literally what runs — there is no hidden "expected output" that can drift.
 *
 * `runnable` recipes target the public Rick & Morty GraphQL API
 * (https://rickandmortyapi.com/graphql), so you can prove the generated string
 * really works by hitting a live server. The rest use an illustrative
 * Star-Wars-style schema to demonstrate a feature the R&M schema can't show.
 */
export const RM_ENDPOINT = "https://rickandmortyapi.com/graphql";

export type OperationKind = "query" | "mutation" | "subscription";

export interface Recipe {
  id: string;
  category: string;
  title: string;
  blurb: string;
  kind: OperationKind;
  /** A JS expression, evaluated with the builder helpers in scope. */
  source: string;
  /** True when the generated document is valid against the Rick & Morty API. */
  runnable: boolean;
  /** Shown for non-runnable recipes to explain the illustrative schema. */
  note?: string;
}

const dedent = (s: string) => s.replace(/^\n/, "").replace(/\n[ \t]+$/, "\n");

export const recipes: Recipe[] = [
  // ── Queries ────────────────────────────────────────────────────────────
  {
    id: "simple",
    category: "Queries",
    title: "Nested selection + pagination",
    blurb:
      "Objects become selection sets. A key with an array value nests a sub-selection — arbitrarily deep.",
    kind: "query",
    runnable: true,
    source: dedent(`
query({
  operation: "characters",
  variables: { page: 1 },
  fields: [
    { info: ["count", "pages"] },
    { results: ["id", "name", "status", "species", "image"] },
  ],
})`),
  },
  {
    id: "by-id",
    category: "Queries",
    title: "Required variable + nested edge",
    blurb:
      "A variable descriptor pins the GraphQL type. `required: true` appends the `!`, so `id` becomes `ID!`.",
    kind: "query",
    runnable: true,
    source: dedent(`
query({
  operation: "character",
  variables: { id: { type: "ID", required: true, value: 1 } },
  fields: [
    "id",
    "name",
    "status",
    "species",
    "image",
    { episode: ["id", "name", "air_date"] },
  ],
})`),
  },
  {
    id: "list-var",
    category: "Queries",
    title: "List variable — [ID!]!",
    blurb:
      "`list: [true]` emits `[T!]`; `list: true` emits `[T]`. Combine with `required` for `[ID!]!`.",
    kind: "query",
    runnable: true,
    source: dedent(`
query({
  operation: "charactersByIds",
  variables: {
    ids: { value: [1, 2, 3], type: "ID", list: [true], required: true },
  },
  fields: ["id", "name", "species"],
})`),
  },

  // ── Aliases & multiple operations ──────────────────────────────────────
  {
    id: "multi-alias",
    category: "Aliases & multi-op",
    title: "Two aliased calls in one document",
    blurb:
      "Pass an array of operations to fold them into a single request. Each `{ name, alias }` renders `alias: name`, and each carries its own variable — renamed to `id` via the `name` key.",
    kind: "query",
    runnable: true,
    source: dedent(`
query([
  {
    operation: { name: "character", alias: "rick" },
    variables: { rickId: { name: "id", type: "ID", required: true, value: 1 } },
    fields: ["name", "species", "image"],
  },
  {
    operation: { name: "character", alias: "morty" },
    variables: { mortyId: { name: "id", type: "ID", required: true, value: 2 } },
    fields: ["name", "species", "image"],
  },
])`),
  },

  // ── Field power-ups ────────────────────────────────────────────────────
  {
    id: "directives",
    category: "Field power-ups",
    title: "Directives · field aliases · meta fields",
    blurb:
      "Field entries are inserted verbatim, so any field-level GraphQL just works: `@include`/`@skip` directives, `portrait: image` aliases, and `__typename`. (Swap `true` for a `$Boolean` variable to drive it dynamically — just remember a declared variable also becomes an operation argument.)",
    kind: "query",
    runnable: true,
    source: dedent(`
query({
  operation: "character",
  variables: { id: { type: "ID", required: true, value: 2 } },
  fields: [
    "name",
    "status @include(if: true)",
    "portrait: image",
    "__typename",
  ],
})`),
  },
  {
    id: "input-object",
    category: "Field power-ups",
    title: "Input-object variable",
    blurb:
      "A whole input object rides along as one typed variable. Name the type explicitly (`FilterCharacter`) — the object is passed straight through in `variables`.",
    kind: "query",
    runnable: true,
    source: dedent(`
query({
  operation: "characters",
  variables: {
    filter: {
      value: { name: "rick", status: "Alive", species: "Human" },
      type: "FilterCharacter",
    },
  },
  fields: [{ info: ["count"] }, { results: ["id", "name", "gender"] }],
})`),
  },

  // ── Fragments ──────────────────────────────────────────────────────────
  {
    id: "inline-fragment",
    category: "Fragments",
    title: "Inline fragments (… on Type)",
    blurb:
      "A nested field with `fragment: true` becomes an inline fragment — how you select type-specific fields off a union or interface.",
    kind: "query",
    runnable: false,
    note: "Illustrative schema — the Rick & Morty API has no union field to spread over.",
    source: dedent(`
query({
  operation: "search",
  variables: { text: { value: "l", required: true } },
  fields: [
    "__typename",
    { operation: "Human", fields: ["name", "homePlanet"], fragment: true },
    { operation: "Droid", fields: ["name", "primaryFunction"], fragment: true },
  ],
})`),
  },
  {
    id: "named-fragment",
    category: "Fragments",
    title: "Named fragment (definition + spread)",
    blurb:
      "Declare reusable fragments in `config.fragments`; spread them with a plain `\"...name\"` field string. The definition is appended to the document.",
    kind: "query",
    runnable: false,
    note: "Illustrative schema. Note: variables used *inside* fragment fields must still be declared on the operation itself.",
    source: dedent(`
query(
  { operation: "hero", fields: ["...heroFields", { friends: ["...heroFields"] }] },
  null,
  {
    fragments: [
      { name: "heroFields", on: "Character", fields: ["id", "name", "appearsIn"] },
    ],
  }
)`),
  },

  // ── Variables deep-dive ────────────────────────────────────────────────
  {
    id: "descriptors",
    category: "Variables deep-dive",
    title: "Every descriptor at once",
    blurb:
      "One operation exercising the full descriptor vocabulary: inferred `String!`, a custom enum type with a `rawGraphQL` default, a `[String]` list, and an argument renamed from `orgId` to `organizationId`.",
    kind: "query",
    runnable: false,
    note: "Illustrative schema — showcases the variable descriptor options, not a real endpoint.",
    source: dedent(`
query({
  operation: "users",
  variables: {
    email: { value: "jon@winterfell.com", required: true },        // String!
    role: { value: "ADMIN", type: "Role", default: rawGraphQL("MEMBER") }, // Role = MEMBER
    tags: { value: ["dragons", "north"], type: "String", list: true },     // [String]
    orgId: { name: "organizationId", type: "ID", required: true, value: "42" },
  },
  fields: ["id", "name", { profile: ["avatar", "bio"] }],
})`),
  },

  // ── Mutations & subscriptions ──────────────────────────────────────────
  {
    id: "mutation",
    category: "Mutations & subscriptions",
    title: "Mutation with input types",
    blurb:
      "`mutation()` mirrors `query()`. Required enum and input-object arguments flow through as typed variables.",
    kind: "mutation",
    runnable: false,
    note: "Illustrative schema — a Star-Wars-style review mutation.",
    source: dedent(`
mutation({
  operation: "createReview",
  variables: {
    episode: { value: "JEDI", type: "Episode", required: true },
    review: {
      value: { stars: 5, commentary: "Best one yet." },
      type: "ReviewInput",
      required: true,
    },
  },
  fields: ["stars", "commentary"],
})`),
  },
  {
    id: "subscription",
    category: "Mutations & subscriptions",
    title: "Subscription",
    blurb:
      "`subscription()` builds the third GraphQL operation kind with the same options shape.",
    kind: "subscription",
    runnable: false,
    note: "Illustrative schema — real subscriptions need a WebSocket transport, out of scope for this demo.",
    source: dedent(`
subscription({
  operation: "reviewAdded",
  variables: { episode: { value: "JEDI", type: "Episode" } },
  fields: ["stars", "commentary", { author: ["name"] }],
})`),
  },

  // ── Custom adapters ────────────────────────────────────────────────────
  {
    id: "appsync",
    category: "Custom adapters",
    title: "Swap the string generator",
    blurb:
      "The second argument is an adapter class that owns string generation. The bundled AWS AppSync adapter wraps selections in a `nodes { … }` connection and names the operation.",
    kind: "query",
    runnable: false,
    note: "Illustrative — AppSync output targets an AWS AppSync endpoint, not Rick & Morty.",
    source: dedent(`
query(
  {
    operation: "getCharacters",
    fields: ["id", "name", "species"],
  },
  adapters.DefaultAppSyncQueryAdapter
)`),
  },
];

export const categories = [...new Set(recipes.map((r) => r.category))];
