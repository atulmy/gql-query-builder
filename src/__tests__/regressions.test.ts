import * as queryBuilder from "../index";
import { adapters, toGraphQLLiteral } from "../index";

describe("null variable values", () => {
  test("query with a null variable emits String type and keeps the null value", () => {
    const query = queryBuilder.query({
      operation: "user",
      variables: { id: null },
      fields: ["name"],
    });

    expect(query).toEqual({
      query: `query ($id: String) { user (id: $id) { name } }`,
      variables: { id: null },
    });
  });
});

describe("operationName robustness", () => {
  test("explicitly undefined operationName is not stringified into the document", () => {
    const query = queryBuilder.query(
      { operation: "thoughts", fields: ["id"] },
      null,
      { operationName: undefined }
    );

    expect(query).toEqual({
      query: `query  { thoughts  { id } }`,
      variables: {},
    });
  });
});

describe("subscription parity with query/mutation", () => {
  test("nested operation fields render instead of crashing", () => {
    const query = queryBuilder.subscription({
      operation: "onX",
      fields: [{ operation: "user", variables: {}, fields: ["id"] }],
    });

    expect(query).toEqual({
      query: `subscription  {
  onX  {
    user  { id }
  }
}`,
      variables: {},
    });
  });

  test("variable name descriptor renames the argument", () => {
    const query = queryBuilder.subscription({
      operation: "sub",
      variables: { id2: { value: 1, name: "id" } },
      fields: ["x"],
    });

    expect(query).toEqual({
      query: `subscription ($id2: Int) {
  sub (id: $id2) {
    x
  }
}`,
      variables: { id2: 1 },
    });
  });
});

describe("AppSync adapters", () => {
  test("mutation without variables does not crash", () => {
    const query = queryBuilder.mutation(
      { operation: "ping", fields: ["ok"] },
      adapters.DefaultAppSyncMutationAdapter
    );

    expect(query).toEqual({
      query: `mutation Ping  {
  ping  {
    ok
  }
}`,
      variables: {},
    });
  });

  test("multi-operation query declares every operation's variables", () => {
    const query = queryBuilder.query(
      [
        { operation: "a", variables: { x: 1 }, fields: ["id"] },
        { operation: "b", variables: { y: 2 }, fields: ["id"] },
      ],
      adapters.DefaultAppSyncQueryAdapter
    );

    expect(query).toEqual({
      query: `query B ($x: Int, $y: Int) { a (x: $x) { nodes { id } } b (y: $y) { nodes { id } } }`,
      variables: { x: 1, y: 2 },
    });
  });

  test("list and default variable descriptors are honored", () => {
    const query = queryBuilder.query(
      {
        operation: "users",
        variables: {
          ids: { value: [1], type: "Int", list: [true], required: true },
        },
        fields: ["id"],
      },
      adapters.DefaultAppSyncQueryAdapter
    );

    expect(query).toEqual({
      query: `query Users ($ids: [Int!]!) { users (ids: $ids) { nodes { id } } }`,
      variables: { ids: [1] },
    });
  });

  test("config.fragments works with AppSync (and any custom) adapter", () => {
    const query = queryBuilder.query(
      { operation: "users", fields: ["...userFields"] },
      adapters.DefaultAppSyncQueryAdapter,
      { fragments: [{ name: "userFields", on: "User", fields: ["id"] }] }
    );

    expect(query).toEqual({
      query: `query Users  { users  { nodes { ...userFields } } }

fragment userFields on User { id }`,
      variables: {},
    });
  });
});

describe("rawGraphQL across module copies", () => {
  test("brand check accepts a raw value built by another copy of the library", () => {
    const foreignRaw = {
      [Symbol.for("gql-query-builder.raw")]: true,
      value: "JEDI",
    };

    expect(toGraphQLLiteral(foreignRaw)).toBe("JEDI");
  });
});
