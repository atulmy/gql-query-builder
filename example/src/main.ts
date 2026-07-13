import {
  adapters,
  mutation,
  type OperationResult,
  query,
  rawGraphQL,
  subscription,
} from "gql-query-builder";
import { categories, type Recipe, recipes, RM_ENDPOINT } from "./recipes";
import "./styles.css";

/**
 * Evaluate a recipe's source with the builder helpers in scope. This is a demo
 * running your own code locally, so a plain `Function` sandbox is fine — never
 * do this with untrusted input in production.
 */
function evaluate(source: string): OperationResult {
  const fn = new Function(
    "query",
    "mutation",
    "subscription",
    "rawGraphQL",
    "adapters",
    `"use strict";\nreturn (\n${source}\n);`
  );
  return fn(query, mutation, subscription, rawGraphQL, adapters);
}

// ── tiny helpers ──────────────────────────────────────────────────────────
const el = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Partial<HTMLElementTagNameMap[K]> = {},
  children: (Node | string)[] = []
): HTMLElementTagNameMap[K] => {
  const node = Object.assign(document.createElement(tag), props);
  for (const child of children) node.append(child);
  return node;
};

const escapeHtml = (s: string) =>
  s.replace(
    /[&<>]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c] as string
  );

/** Minimal, safe GraphQL highlighter (runs after HTML-escaping). */
const highlightGraphQL = (source: string) =>
  escapeHtml(source)
    .replace(/(\$[A-Za-z_]\w*)/g, '<span class="tok-var">$1</span>')
    .replace(/(@[A-Za-z_]\w*)/g, '<span class="tok-dir">$1</span>')
    .replace(
      /\b(query|mutation|subscription|fragment|on)\b/g,
      '<span class="tok-kw">$1</span>'
    );

// ── state ─────────────────────────────────────────────────────────────────
const drafts = new Map<string, string>(recipes.map((r) => [r.id, r.source]));
let currentId = recipes[0].id;

// ── shell ─────────────────────────────────────────────────────────────────
const app = document.querySelector<HTMLDivElement>("#app")!;

app.append(
  el("header", { className: "site-header" }, [
    el("div", { className: "brand" }, [
      el("span", { className: "logo", textContent: "🔧" }),
      el("div", {}, [
        el("h1", { textContent: "gql-query-builder" }),
        el("p", {
          className: "tagline",
          textContent: "Plain JavaScript objects → GraphQL documents. Live.",
        }),
      ]),
    ]),
    el("nav", { className: "header-links" }, [
      el("a", {
        href: "https://github.com/atulmy/gql-query-builder",
        target: "_blank",
        rel: "noreferrer",
        textContent: "GitHub",
      }),
      el("a", {
        href: "https://www.npmjs.com/package/gql-query-builder",
        target: "_blank",
        rel: "noreferrer",
        textContent: "npm",
      }),
    ]),
  ])
);

const layout = el("div", { className: "layout" });
const sidebar = el("aside", { className: "sidebar" });
const main = el("main", { className: "main" });
layout.append(sidebar, main);
app.append(layout);

// ── sidebar ───────────────────────────────────────────────────────────────
function renderSidebar() {
  sidebar.replaceChildren();
  for (const category of categories) {
    sidebar.append(
      el("h2", { className: "cat-title", textContent: category })
    );
    const list = el("ul", { className: "recipe-list" });
    for (const recipe of recipes.filter((r) => r.category === category)) {
      const button = el("button", {
        className:
          "recipe-btn" + (recipe.id === currentId ? " is-active" : ""),
        onclick: () => selectRecipe(recipe.id),
      });
      button.append(
        el("span", { className: "recipe-name", textContent: recipe.title }),
        el("span", {
          className: `pill pill-${recipe.kind}`,
          textContent: recipe.kind,
        })
      );
      list.append(el("li", {}, [button]));
    }
    sidebar.append(list);
  }
}

function selectRecipe(id: string) {
  currentId = id;
  renderSidebar();
  renderMain();
}

// ── main panel ──────────────────────────────────────────────────────────────
function renderMain() {
  const recipe = recipes.find((r) => r.id === currentId)!;
  main.replaceChildren();

  main.append(
    el("div", { className: "recipe-head" }, [
      el("h2", { className: "recipe-title", textContent: recipe.title }),
      el("p", { className: "blurb", innerHTML: mdCode(recipe.blurb) }),
    ])
  );

  // Editable source
  const editor = el("textarea", {
    className: "editor",
    spellcheck: false,
    value: drafts.get(recipe.id)!,
  });
  // Grow the textarea to fit its content so it never scrolls internally —
  // an internal scrollbar would swallow the wheel and block the main pane.
  const autosize = () => {
    editor.style.height = "auto";
    editor.style.height = `${editor.scrollHeight}px`;
  };

  const resetBtn = el("button", {
    className: "ghost-btn",
    textContent: "Reset",
    onclick: () => {
      drafts.set(recipe.id, recipe.source);
      editor.value = recipe.source;
      autosize();
      update();
    },
  });

  main.append(
    el("section", { className: "panel" }, [
      el("div", { className: "panel-head" }, [
        el("span", {
          className: "panel-label",
          textContent: "Input · edit me",
        }),
        resetBtn,
      ]),
      editor,
    ])
  );

  // Output containers
  const docPre = el("pre", { className: "code-out doc-out" });
  const varsPre = el("pre", { className: "code-out vars-out" });
  const errorBox = el("div", { className: "error-box", hidden: true });

  const copyDoc = copyButton(() => docPre.textContent ?? "");
  const copyVars = copyButton(() => varsPre.textContent ?? "");

  main.append(
    errorBox,
    el("div", { className: "outputs" }, [
      el("section", { className: "panel" }, [
        el("div", { className: "panel-head" }, [
          el("span", { className: "panel-label", textContent: "query" }),
          copyDoc,
        ]),
        docPre,
      ]),
      el("section", { className: "panel" }, [
        el("div", { className: "panel-head" }, [
          el("span", { className: "panel-label", textContent: "variables" }),
          copyVars,
        ]),
        varsPre,
      ]),
    ])
  );

  // Live-run row
  const responsePre = el("pre", { className: "code-out response-out" });
  const runBtn = el("button", { className: "run-btn" });
  const runStatus = el("span", { className: "run-status" });

  const runPanel = el("section", { className: "panel run-panel" }, [
    el("div", { className: "panel-head" }, [
      el("span", {
        className: "panel-label",
        textContent: "Live response",
      }),
      runStatus,
    ]),
    el("div", { className: "run-row" }, [runBtn]),
    responsePre,
  ]);

  if (recipe.runnable) {
    runBtn.textContent = "Run against Rick & Morty API  ▶";
    runBtn.onclick = () => runLive(recipe, responsePre, runBtn, runStatus);
    responsePre.textContent = "Press Run to POST the generated document to a real GraphQL server.";
  } else {
    runBtn.textContent = "Run  ▶";
    runBtn.disabled = true;
    runBtn.classList.add("is-disabled");
    responsePre.textContent = recipe.note ?? "This recipe is string-only.";
    runStatus.textContent = "string-only";
  }
  main.append(runPanel);

  // Re-evaluate on every keystroke.
  function update() {
    const source = editor.value;
    drafts.set(recipe.id, source);
    try {
      const result = evaluate(source);
      errorBox.hidden = true;
      docPre.innerHTML = highlightGraphQL(result.query);
      varsPre.textContent = JSON.stringify(result.variables, null, 2);
    } catch (err) {
      errorBox.hidden = false;
      errorBox.textContent = `⚠ ${(err as Error).message}`;
    }
  }

  editor.addEventListener("input", () => {
    autosize();
    update();
  });
  autosize(); // editor is in the DOM now, so scrollHeight is valid
  update();
}

async function runLive(
  recipe: Recipe,
  out: HTMLElement,
  btn: HTMLButtonElement,
  status: HTMLElement
) {
  let built: OperationResult;
  try {
    built = evaluate(drafts.get(recipe.id)!);
  } catch (err) {
    out.textContent = `⚠ Fix the input first: ${(err as Error).message}`;
    return;
  }

  btn.disabled = true;
  status.textContent = "requesting…";
  out.textContent = "";
  const started = performance.now();
  try {
    const res = await fetch(RM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: built.query, variables: built.variables }),
    });
    const json = await res.json();
    const ms = Math.round(performance.now() - started);
    status.textContent = `${res.status} · ${ms} ms`;
    out.textContent = JSON.stringify(json, null, 2);
  } catch (err) {
    status.textContent = "network error";
    out.textContent = `⚠ ${(err as Error).message}`;
  } finally {
    btn.disabled = false;
  }
}

// ── small UI utilities ──────────────────────────────────────────────────────
function copyButton(getText: () => string) {
  const btn = el("button", { className: "copy-btn", textContent: "Copy" });
  btn.onclick = async () => {
    try {
      await navigator.clipboard.writeText(getText());
      btn.textContent = "Copied ✓";
      setTimeout(() => (btn.textContent = "Copy"), 1200);
    } catch {
      btn.textContent = "Copy failed";
      setTimeout(() => (btn.textContent = "Copy"), 1200);
    }
  };
  return btn;
}

/** Render `backtick` spans in blurbs as inline code. */
function mdCode(text: string) {
  return escapeHtml(text).replace(
    /`([^`]+)`/g,
    (_, code) => `<code>${code}</code>`
  );
}

renderSidebar();
renderMain();
