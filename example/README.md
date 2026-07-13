# gql-query-builder · Interactive Playground

A single-page playground that showcases the **full surface** of
[`gql-query-builder`](../README.md): every feature is a live, editable recipe,
and the query recipes can be **run against a real GraphQL server** (the public
[Rick & Morty API](https://rickandmortyapi.com/)) so you can see the generated
string actually work end-to-end.

![kinds of recipes](https://img.shields.io/badge/recipes-12-e535ab) &nbsp;
Queries · nested selections · required & list variables · aliases · multi-op
documents · directives · field aliases · meta fields · input objects · inline
& named fragments · the full variable-descriptor vocabulary · mutations ·
subscriptions · custom (AppSync) adapters.

## Run it

```bash
cd example
pnpm install     # or npm install / yarn
pnpm dev         # → http://localhost:5173
```

That's it — no need to build the library first. Vite aliases
`gql-query-builder` straight to the package source (`../src`), so edits to the
library show up in the playground instantly.

```bash
pnpm build       # type-check + production bundle into dist/
pnpm preview     # serve the production build
```

## How it works

- **`src/recipes.ts`** — the gallery. Each recipe is a snippet of source code
  that evaluates to `{ query, variables }`.
- **`src/main.ts`** — evaluates each snippet with the builder helpers in scope
  (`query`, `mutation`, `subscription`, `rawGraphQL`, `adapters`), renders the
  generated document + variables live as you type, and POSTs runnable recipes to
  the Rick & Morty endpoint.

Because the editor and the gallery share one evaluator, **what you see is
literally what runs** — there is no pre-baked "expected output" that can drift
from the library.

> The `new Function` sandbox used to evaluate editable snippets is fine for a
> local demo of code you wrote yourself — never evaluate untrusted input that way
> in a real app.
