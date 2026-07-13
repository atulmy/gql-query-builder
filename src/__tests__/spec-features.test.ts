import * as queryBuilder from "../index";
import { rawGraphQL, toGraphQLLiteral } from "../index";

describe("Variable default values", () => {
  test("query emits inferred-type default", () => {
    const query = queryBuilder.query({
      operation: "items",
      variables: { first: { value: 10, default: 5 } },
      fields: ["id"],
    });

    expect(query).toEqual({
      query: `query ($first: Int = 5) { items (first: $first) { id } }`,
      variables: { first: 10 },
    });
  });

  test("query emits quoted string default", () => {
    const query = queryBuilder.query({
      operation: "greeting",
      variables: { lang: { value: "fr", type: "String", default: "en" } },
      fields: ["text"],
    });

    expect(query).toEqual({
      query: `query ($lang: String = "en") { greeting (lang: $lang) { text } }`,
      variables: { lang: "fr" },
    });
  });

  test("query emits enum default via rawGraphQL", () => {
    const query = queryBuilder.query({
      operation: "hero",
      variables: {
        episode: {
          value: "EMPIRE",
          type: "Episode",
          default: rawGraphQL("JEDI"),
        },
      },
      fields: ["name"],
    });

    expect(query).toEqual({
      query: `query ($episode: Episode = JEDI) { hero (episode: $episode) { name } }`,
      variables: { episode: "EMPIRE" },
    });
  });

  test("mutation emits input object default with unquoted keys", () => {
    const query = queryBuilder.mutation({
      operation: "createReview",
      variables: {
        review: {
          value: { stars: 5, commentary: "great" },
          type: "ReviewInput",
          default: { stars: 4, tags: ["a", "b"], approved: true, note: null },
        },
      },
      fields: ["id"],
    });

    expect(query).toEqual({
      query: `mutation ($review: ReviewInput = {stars: 4, tags: ["a", "b"], approved: true, note: null}) {
  createReview (review: $review) {
    id
  }
}`,
      variables: { review: { stars: 5, commentary: "great" } },
    });
  });

  test("subscription emits default", () => {
    const query = queryBuilder.subscription({
      operation: "postAdded",
      variables: { topic: { value: "news", default: "all" } },
      fields: ["id"],
    });

    expect(query).toEqual({
      query: `subscription ($topic: String = "all") {
  postAdded (topic: $topic) {
    id
  }
}`,
      variables: { topic: "news" },
    });
  });
});

describe("Named fragments", () => {
  test("query appends fragment definition and spreads it", () => {
    const query = queryBuilder.query(
      {
        operation: "hero",
        fields: ["...heroFields"],
      },
      null,
      {
        fragments: [
          { name: "heroFields", on: "Character", fields: ["name", "friends"] },
        ],
      }
    );

    expect(query).toEqual({
      query: `query  { hero  { ...heroFields } }

fragment heroFields on Character { name, friends }`,
      variables: {},
    });
  });

  test("query supports multiple fragments with nested fields", () => {
    const query = queryBuilder.query(
      {
        operation: "hero",
        fields: ["...heroFields", "...comparisonFields"],
      },
      null,
      {
        fragments: [
          { name: "heroFields", on: "Character", fields: ["name"] },
          {
            name: "comparisonFields",
            on: "Character",
            fields: ["appearsIn", { friends: ["name"] }],
          },
        ],
      }
    );

    expect(query).toEqual({
      query: `query  { hero  { ...heroFields, ...comparisonFields } }

fragment heroFields on Character { name }

fragment comparisonFields on Character { appearsIn, friends { name } }`,
      variables: {},
    });
  });

  test("mutation appends fragment definition", () => {
    const query = queryBuilder.mutation(
      {
        operation: "createReview",
        variables: { stars: 5 },
        fields: ["...reviewFields"],
      },
      null,
      {
        fragments: [
          {
            name: "reviewFields",
            on: "Review",
            fields: ["stars", "commentary"],
          },
        ],
      }
    );

    expect(query).toEqual({
      query: `mutation ($stars: Int) {
  createReview (stars: $stars) {
    ...reviewFields
  }
}

fragment reviewFields on Review { stars, commentary }`,
      variables: { stars: 5 },
    });
  });

  test("subscription appends fragment definition", () => {
    const query = queryBuilder.subscription(
      {
        operation: "postAdded",
        fields: ["...postFields"],
      },
      null,
      {
        fragments: [
          { name: "postFields", on: "Post", fields: ["id", "title"] },
        ],
      }
    );

    expect(query).toEqual({
      query: `subscription  {
  postAdded  {
    ...postFields
  }
}

fragment postFields on Post { id, title }`,
      variables: {},
    });
  });
});

describe("Subscription operation name", () => {
  test("generates subscription with operation name", () => {
    const query = queryBuilder.subscription(
      {
        operation: "postAdded",
        variables: { topic: "news" },
        fields: ["id"],
      },
      null,
      { operationName: "OnPostAdded" }
    );

    expect(query).toEqual({
      query: `subscription OnPostAdded ($topic: String) {
  postAdded (topic: $topic) {
    id
  }
}`,
      variables: { topic: "news" },
    });
  });
});

describe("Directives and field aliases (string passthrough)", () => {
  test("field-level @include/@skip directives pass through", () => {
    const query = queryBuilder.query({
      operation: "hero",
      variables: {
        withFriends: { value: true, type: "Boolean", required: true },
      },
      fields: ["name", "friends @include(if: $withFriends)"],
    });

    expect(query).toEqual({
      query: `query ($withFriends: Boolean!) { hero (withFriends: $withFriends) { name, friends @include(if: $withFriends) } }`,
      variables: { withFriends: true },
    });
  });

  test("field-level aliases pass through", () => {
    const query = queryBuilder.query({
      operation: "hero",
      fields: ["empireHero: name", "__typename"],
    });

    expect(query).toEqual({
      query: `query  { hero  { empireHero: name, __typename } }`,
      variables: {},
    });
  });
});

describe("toGraphQLLiteral", () => {
  test("serializes scalars, lists, input objects, and raw values", () => {
    expect(toGraphQLLiteral("hi")).toBe(`"hi"`);
    expect(toGraphQLLiteral(4.5)).toBe("4.5");
    expect(toGraphQLLiteral(false)).toBe("false");
    expect(toGraphQLLiteral(null)).toBe("null");
    expect(toGraphQLLiteral([1, "a", rawGraphQL("JEDI")])).toBe(
      `[1, "a", JEDI]`
    );
    expect(toGraphQLLiteral({ a: { b: [true] } })).toBe("{a: {b: [true]}}");
  });

  test("rejects unserializable values", () => {
    expect(() => toGraphQLLiteral(undefined)).toThrow(TypeError);
    expect(() => toGraphQLLiteral(() => 1)).toThrow(TypeError);
  });
});
