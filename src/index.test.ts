import DefaultAppSyncQueryAdapter from "../src/adapters/DefaultAppSyncQueryAdapter";
import * as queryBuilder from "./";

describe("Query", () => {
  test("generates query", () => {
    const query = queryBuilder.query({
      operation: "thoughts",
      fields: ["id", "name", "thought"],
    });

    expect(query).toEqual({
      query: `query  { thoughts  { id, name, thought } }`,
      variables: {},
    });
  });

  test("generates query when adapter argument is provided", () => {
    const query = queryBuilder.query(
      {
        operation: "thoughts",
        fields: ["id", "name", "thought"],
      },
      DefaultAppSyncQueryAdapter
    );

    expect(query).toEqual({
      query: `query Thoughts  { thoughts  { nodes { id, name, thought } } }`,
      variables: {},
    });
  });

  test("generate query with undefined variables", () => {
    const query = queryBuilder.query({
      operation: "user",
      fields: ["id", "name", "email"],
      variables: { id: { type: "Int" }, name: undefined },
    });

    expect(query).toEqual({
      query: `query ($id: Int, $name: String) { user (id: $id, name: $name) { id, name, email } }`,
      variables: { id: undefined, name: undefined },
    });
  });

  test("generates query with variables", () => {
    const query = queryBuilder.query({
      operation: "thought",
      variables: { id: 1 },
      fields: ["id", "name", "thought"],
    });

    expect(query).toEqual({
      query: `query ($id: Int) { thought (id: $id) { id, name, thought } }`,
      variables: { id: 1 },
    });
  });

  test("generates query with sub fields selection", () => {
    const query = queryBuilder.query({
      operation: "orders",
      fields: [
        "id",
        "amount",
        {
          user: [
            "id",
            "name",
            "email",
            {
              address: ["city", "country"],
            },
          ],
        },
      ],
    });

    expect(query).toEqual({
      query: `query  { orders  { id, amount, user { id, name, email, address { city, country } } } }`,
      variables: {},
    });
  });

  test("generates query with required variables", () => {
    const query = queryBuilder.query({
      operation: "userLogin",
      variables: {
        email: { value: "jon.doe@example.com", required: true },
        password: { value: "123456", required: true },
      },
      fields: ["userId", "token"],
    });

    expect(query).toEqual({
      query: `query ($email: String!, $password: String!) { userLogin (email: $email, password: $password) { userId, token } }`,
      variables: { email: "jon.doe@example.com", password: "123456" },
    });
  });

  test("generate query with array variable (array items are not nullable)", () => {
    const query = queryBuilder.query({
      operation: "search",
      variables: {
        tags: { value: ["a", "b", "c"], list: [true], type: "String" },
      },
      fields: ["id", "title", "content", "tag"],
    });

    expect(query).toEqual({
      query: `query ($tags: [String!]) { search (tags: $tags) { id, title, content, tag } }`,
      variables: { tags: ["a", "b", "c"] },
    });
  });

  test("generate query with array variable (array items are nullable)", () => {
    const query = queryBuilder.query({
      operation: "search",
      variables: {
        tags: { value: ["a", "b", "c", null], list: true },
      },
      fields: ["id", "title", "content", "tag"],
    });

    expect(query).toEqual({
      query: `query ($tags: [String]) { search (tags: $tags) { id, title, content, tag } }`,
      variables: { tags: ["a", "b", "c", null] },
    });
  });

  test("generates multiple queries", () => {
    const query = queryBuilder.query([
      {
        operation: "thoughts",
        fields: ["id", "name", "thought"],
      },
      {
        operation: "prayers",
        fields: ["id", "name", "prayer"],
      },
    ]);

    expect(query).toEqual({
      query: `query  { thoughts  { id, name, thought } prayers  { id, name, prayer } }`,
      variables: {},
    });
  });

  test("generates query with variables nested in fields", () => {
    const query = queryBuilder.query([
      {
        operation: "getPublicationNames",
        fields: [
          {
            operation: "publication",
            variables: { id: { value: 12, type: "ID" } },
            fields: ["id", "name"],
          },
        ],
      },
    ]);

    expect(query).toEqual({
      query: `query ($id: ID) { getPublicationNames  { publication (id: $id) { id, name } } }`,
      variables: { id: 12 },
    });
  });

  test("generates query with object variables nested in fields", () => {
    const query = queryBuilder.query([
      {
        operation: "getPublicationNames",
        variables: { id: { type: "ID", value: 12 } },
        fields: [
          {
            operation: "publication",
            variables: {
              input: {
                value: { type: "news", tz: "EST" },
                type: "FilterInput",
              },
            },
            fields: ["name", "publishedAt"],
          },
        ],
      },
    ]);

    expect(query).toEqual({
      query: `query ($input: FilterInput, $id: ID) { getPublicationNames (id: $id) { publication (input: $input) { name, publishedAt } } }`,
      variables: {
        id: 12,
        input: { type: "news", tz: "EST" },
      },
    });
  });

  test("generates query without extraneous brackets for operation with no fields", () => {
    const query = queryBuilder.query({
      operation: "getFilteredUsersCount",
    });

    expect(query).toEqual({
      query: `query  { getFilteredUsersCount   }`,
      variables: {},
    });
  });

  test("generates queries without extraneous brackets for operations with no fields", () => {
    const query = queryBuilder.query([
      {
        operation: "getFilteredUsersCount",
      },
      {
        operation: "getAllUsersCount",
      },
    ]);

    expect(query).toEqual({
      query: `query  { getFilteredUsersCount   getAllUsersCount   }`,
      variables: {},
    });
  });

  test("generates query without extraneous brackets for operations with empty fields", () => {
    const query = queryBuilder.query({
      operation: "getFilteredUsersCount",
      fields: [],
    });

    expect(query).toEqual({
      query: `query  { getFilteredUsersCount   }`,
      variables: {},
    });
  });

  test("generates queries without extraneous brackets for operations with empty fields", () => {
    const query = queryBuilder.query([
      {
        operation: "getFilteredUsersCount",
        fields: [],
      },
      {
        operation: "getAllUsersCount",
        fields: [],
      },
    ]);

    expect(query).toEqual({
      query: `query  { getFilteredUsersCount   getAllUsersCount   }`,
      variables: {},
    });
  });

  test("generates query without extraneous brackets for operation with empty fields of fields", () => {
    const query = queryBuilder.query({
      operation: "getFilteredUsers",
      fields: [
        {
          count: [],
        },
      ],
    });

    expect(query).toEqual({
      query: `query  { getFilteredUsers  { count  } }`,
      variables: {},
    });
  });

  test("generates queries without extraneous brackets for operations with empty fields of fields", () => {
    const query = queryBuilder.query([
      {
        operation: "getFilteredUsers",
        fields: [
          {
            count: [],
          },
        ],
      },
      {
        operation: "getFilteredPosts",
        fields: [
          {
            count: [],
          },
        ],
      },
    ]);

    expect(query).toEqual({
      query: `query  { getFilteredUsers  { count  } getFilteredPosts  { count  } }`,
      variables: {},
    });
  });

  test("generates query without extraneous brackets for operation with nested operation empty fields", () => {
    const query = queryBuilder.query({
      operation: "getFilteredUsers",
      fields: [
        {
          operation: "average_age",
          fields: [],
          variables: { format: "months" },
        },
      ],
    });

    expect(query).toEqual({
      query: `query ($format: String) { getFilteredUsers  { average_age (format: $format)  } }`,
      variables: { format: "months" },
    });
  });

  test("generates queries without extraneous brackets for operations with nested operation empty fields", () => {
    const query = queryBuilder.query([
      {
        operation: "getFilteredUsers",
        fields: [
          {
            operation: "average_age",
            fields: [],
            variables: {},
          },
        ],
      },
      {
        operation: "getFilteredPosts",
        fields: [
          {
            operation: "average_viewers",
            fields: [],
            variables: {},
          },
        ],
      },
    ]);

    expect(query).toEqual({
      query: `query  { getFilteredUsers  { average_age   } getFilteredPosts  { average_viewers   } }`,
      variables: {},
    });
  });
});

describe("Mutation", () => {
  test("generates mutation query", () => {
    const query = queryBuilder.mutation({
      operation: "thoughtCreate",
      variables: {
        name: "Tyrion Lannister",
        thought: "I drink and I know things.",
      },
      fields: ["id"],
    });

    expect(query).toEqual({
      query: `mutation ($name: String, $thought: String) {
  thoughtCreate (name: $name, thought: $thought) {
    id
  }
}`,
      variables: {
        name: "Tyrion Lannister",
        thought: "I drink and I know things.",
      },
    });
  });

  test("generates mutation query with required variables", () => {
    const query = queryBuilder.mutation({
      operation: "userSignup",
      variables: {
        name: "Jon Doe",
        email: { value: "jon.doe@example.com", required: true },
        password: { value: "123456", required: true },
      },
      fields: ["userId"],
    });

    expect(query).toEqual({
      query: `mutation ($name: String, $email: String!, $password: String!) {
  userSignup (name: $name, email: $email, password: $password) {
    userId
  }
}`,
      variables: {
        name: "Jon Doe",
        email: "jon.doe@example.com",
        password: "123456",
      },
    });
  });

  test("generates multiple mutations", () => {
    const query = queryBuilder.mutation([
      {
        operation: "thoughtCreate",
        variables: {
          name: "Tyrion Lannister",
          thought: "I drink and I know things.",
        },
        fields: ["id"],
      },
      {
        operation: "prayerCreate",
        variables: {
          name: { value: "Tyrion Lannister" },
          prayer: { value: "I wish for winter." },
        },
        fields: ["id"],
      },
    ]);

    expect(query).toEqual({
      query: `mutation ($name: String, $thought: String, $prayer: String) {
  thoughtCreate (name: $name, thought: $thought) {
    id
  }
  prayerCreate (name: $name, prayer: $prayer) {
    id
  }
}`,
      variables: {
        name: "Tyrion Lannister",
        thought: "I drink and I know things.",
        prayer: "I wish for winter.",
      },
    });
  });

  test("generates mutation with required variables", () => {
    const query = queryBuilder.mutation({
      operation: "userSignup",
      variables: {
        name: "Jon Doe",
        email: { value: "jon.doe@example.com", required: true },
        password: { value: "123456", required: true },
      },
      fields: ["id"],
    });

    expect(query).toEqual({
      query: `mutation ($name: String, $email: String!, $password: String!) {
  userSignup (name: $name, email: $email, password: $password) {
    id
  }
}`,
      variables: {
        name: "Jon Doe",
        email: "jon.doe@example.com",
        password: "123456",
      },
    });
  });

  test("generates mutation custom type", () => {
    const query = queryBuilder.mutation({
      operation: "userPhoneNumber",
      variables: {
        phone: {
          value: { prefix: "+91", number: "9876543210" },
          type: "PhoneNumber",
          required: true,
        },
      },
      fields: ["id"],
    });

    expect(query).toEqual({
      query: `mutation ($phone: PhoneNumber!) {
  userPhoneNumber (phone: $phone) {
    id
  }
}`,
      variables: {
        phone: { prefix: "+91", number: "9876543210" },
      },
    });
  });

  test("generate mutation without fields selection", () => {
    const query = queryBuilder.mutation({
      operation: "logout",
    });

    expect(query).toEqual({
      query: `mutation  {
  logout  
}`,
      variables: {},
    });
  });
});

describe("Subscriptions", () => {
  test("generates subscriptions", () => {
    const query = queryBuilder.subscription([
      {
        operation: "thoughtCreate",
        variables: {
          name: "Tyrion Lannister",
          thought: "I drink and I know things.",
        },
        fields: ["id"],
      },
      {
        operation: "prayerCreate",
        variables: {
          name: { value: "Tyrion Lannister" },
          prayer: { value: "I wish for winter." },
        },
        fields: ["id"],
      },
    ]);

    expect(query).toEqual({
      query: `subscription ($name: String, $thought: String, $prayer: String) {
  thoughtCreate (name: $name, thought: $thought) {
    id
  }
  prayerCreate (name: $name, prayer: $prayer) {
    id
  }
}`,
      variables: {
        name: "Tyrion Lannister",
        thought: "I drink and I know things.",
        prayer: "I wish for winter.",
      },
    });
  });

  test("generates subscription with required variables", () => {
    const query = queryBuilder.subscription({
      operation: "userSignup",
      variables: {
        name: "Jon Doe",
        email: { value: "jon.doe@example.com", required: true },
        password: { value: "123456", required: true },
      },
      fields: ["id"],
    });

    expect(query).toEqual({
      query: `subscription ($name: String, $email: String!, $password: String!) {
  userSignup (name: $name, email: $email, password: $password) {
    id
  }
}`,
      variables: {
        name: "Jon Doe",
        email: "jon.doe@example.com",
        password: "123456",
      },
    });
  });

  test("generates subscription custom type", () => {
    const query = queryBuilder.subscription({
      operation: "userPhoneNumber",
      variables: {
        phone: {
          value: { prefix: "+91", number: "9876543210" },
          type: "PhoneNumber",
          required: true,
        },
      },
      fields: ["id"],
    });

    expect(query).toEqual({
      query: `subscription ($phone: PhoneNumber!) {
  userPhoneNumber (phone: $phone) {
    id
  }
}`,
      variables: {
        phone: { prefix: "+91", number: "9876543210" },
      },
    });
  });
});
