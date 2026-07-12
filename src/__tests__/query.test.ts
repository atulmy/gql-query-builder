import DefaultAppSyncQueryAdapter from "../adapters/DefaultAppSyncQueryAdapter";
import * as queryBuilder from "../index";

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

  test("generates query with alias", () => {
    const query = queryBuilder.query({
      operation: {
        name: "thoughts",
        alias: "myThoughts",
      },
      fields: ["id", "name", "thought"],
    });

    expect(query).toEqual({
      query: `query  { myThoughts: thoughts  { id, name, thought } }`,
      variables: {},
    });
  });

  test("generates queries with the same operation with different alias", () => {
    const query = queryBuilder.query([
      {
        operation: {
          name: "thoughts",
          alias: "myThoughts",
        },
        fields: ["id", "name", "thought"],
      },
      {
        operation: {
          name: "thoughts",
          alias: "yourThoughts",
        },
        fields: ["id", "name", "thought"],
      },
    ]);

    expect(query).toEqual({
      query: `query  { myThoughts: thoughts  { id, name, thought } yourThoughts: thoughts  { id, name, thought } }`,
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

  test("generates query when adapter and alias arguments are provided", () => {
    const query = queryBuilder.query(
      {
        operation: {
          name: "thoughts",
          alias: "myThoughts",
        },
        fields: ["id", "name", "thought"],
      },
      DefaultAppSyncQueryAdapter
    );

    expect(query).toEqual({
      query: `query Thoughts  { myThoughts: thoughts  { nodes { id, name, thought } } }`,
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
            {
              account: ["holder"],
            },
          ],
        },
      ],
    });

    expect(query).toEqual({
      query: `query  { orders  { id, amount, user { id, name, email, address { city, country }, account { holder } } } }`,
      variables: {},
    });
  });

  test("generates query with multiple sub fields selection in same object", () => {
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
              account: ["holder"],
            },
          ],
        },
      ],
    });

    expect(query).toEqual({
      query: `query  { orders  { id, amount, user { id, name, email, address { city, country }, account { holder } } } }`,
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

  test("generates query with nested variables in nested fields", () => {
    const query = queryBuilder.query([
      {
        operation: "getPublicationNames",
        fields: [
          {
            operation: "publication",
            variables: { id: { value: 12, type: "ID" } },
            fields: [
              "id",
              "name",
              {
                operation: "platforms",
                variables: {
                  visible: { type: "Boolean", value: true },
                  platformLimit: { name: "limit", value: 999, type: "Int" },
                },
                fields: [
                  "totalCount",
                  {
                    edges: [
                      "label",
                      "code",
                      "parentId",
                      "id",
                      {
                        operation: "rights",
                        variables: {
                          idChannel: { type: "Int", required: true },
                          rightsLimit: {
                            name: "limit",
                            value: 999,
                            type: "Int",
                          },
                          rightsOffset: {
                            name: "offset",
                            value: 0,
                            type: "Int",
                          },
                        },
                        fields: [
                          "id",
                          "label",
                          {
                            operation: "users",
                            variables: {
                              userLimit: {
                                name: "limit",
                                value: 999,
                                type: "Int",
                              },
                              userFilter: {
                                name: "filters",
                                value: "doe",
                                type: "String",
                              },
                            },
                            fields: ["id", "name"],
                          },
                        ],
                      },
                    ],
                  },
                  "subField",
                  {
                    operation: "channels",
                    variables: {
                      idChannel: { name: "id", type: "Int", required: true },
                      channelLimit: { name: "limit", value: 999, type: "Int" },
                    },
                    fields: ["id", "label"],
                  },
                ],
              },
            ],
          },
        ],
      },
    ]);

    expect(query).toEqual({
      query: `query ($id: ID, $visible: Boolean, $platformLimit: Int, $idChannel: Int!, $channelLimit: Int, $rightsLimit: Int, $rightsOffset: Int, $userLimit: Int, $userFilter: String) { getPublicationNames  { publication (id: $id) { id, name, platforms (visible: $visible, limit: $platformLimit) { totalCount, edges { label, code, parentId, id, rights (idChannel: $idChannel, limit: $rightsLimit, offset: $rightsOffset) { id, label, users (limit: $userLimit, filters: $userFilter) { id, name } } }, subField, channels (id: $idChannel, limit: $channelLimit) { id, label } } } } }`,
      variables: {
        id: 12,
        visible: true,
        platformLimit: 999,
        idChannel: undefined,
        channelLimit: 999,
        rightsLimit: 999,
        rightsOffset: 0,
        userLimit: 999,
        userFilter: "doe",
      },
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

  test("generates queries with object variables for multiple queries", () => {
    const query = queryBuilder.query([
      {
        operation: "getPublicationData",
        variables: { id: { type: "ID", value: 12 } },
        fields: ["publishedAt"],
      },
      {
        operation: "getPublicationUsers",
        variables: { name: { value: "johndoe" } },
        fields: ["full_name"],
      },
    ]);

    expect(query).toEqual({
      query: `query ($id: ID, $name: String) { getPublicationData (id: $id) { publishedAt } getPublicationUsers (name: $name) { full_name } }`,
      variables: {
        id: 12,
        name: "johndoe",
      },
    });
  });

  test("generates queries with object variables for multiple queries with nested variables", () => {
    const query = queryBuilder.query([
      {
        operation: "getPublicationData",
        variables: { id: { type: "ID", value: 12 } },
        fields: [
          "publishedAt",
          {
            operation: "publicationOrg",
            variables: { location: "mars" },
            fields: ["name"],
          },
        ],
      },
      {
        operation: "getPublicationUsers",
        variables: { name: { value: "johndoe" } },
        fields: ["full_name"],
      },
    ]);

    expect(query).toEqual({
      query: `query ($id: ID, $location: String, $name: String) { getPublicationData (id: $id) { publishedAt, publicationOrg (location: $location) { name } } getPublicationUsers (name: $name) { full_name } }`,
      variables: {
        id: 12,
        location: "mars",
        name: "johndoe",
      },
    });
  });

  test("generates query with operation name", () => {
    const query = queryBuilder.query(
      [
        {
          operation: "getPublicationNames",
          variables: { id: { type: "ID", value: 12 } },
          fields: ["name", "publishedAt"],
        },
      ],
      null,
      {
        operationName: "operation",
      }
    );

    expect(query).toEqual({
      query: `query operation ($id: ID) { getPublicationNames (id: $id) { name, publishedAt } }`,
      variables: {
        id: 12,
      },
    });
  });

  test("generates query arguments different from variable name", () => {
    const query = queryBuilder.query([
      {
        operation: "someoperation",
        fields: [
          {
            operation: "nestedoperation",
            fields: ["field1"],
            variables: {
              id2: {
                name: "id",
                type: "ID",
                value: 123,
              },
            },
          },
        ],
        variables: {
          id1: {
            name: "id",
            type: "ID",
            value: 456,
          },
        },
      },
    ]);

    expect(query).toEqual({
      query: `query ($id2: ID, $id1: ID) { someoperation (id: $id1) { nestedoperation (id: $id2) { field1 } } }`,
      variables: {
        id1: 456,
        id2: 123,
      },
    });
  });

  test("generates query arguments with inline fragment", () => {
    const query = queryBuilder.query({
      operation: "thought",
      fields: [
        "id",
        "name",
        "thought",
        {
          operation: "FragmentType",
          fields: ["grade"],
          fragment: true,
        },
      ],
    });

    expect(query).toEqual({
      query: `query  { thought  { id, name, thought, ... on FragmentType  { grade } } }`,
      variables: {},
    });
  });

  test("generates aliased nested queries", () => {
    const query = queryBuilder.query([
      {
        operation: "singleRootQuery",
        variables: {},
        fields: [
          {
            operation: "nestedQuery",
            variables: {},
            fields: ["whatever"],
          },
          {
            operation: {
              alias: "duplicatedNestedQuery",
              name: "nestedQuery",
            },
            variables: {},
            fields: ["whatever"],
          },
        ],
      },
    ]); // query
    expect(query).toEqual({
      query: `query  { singleRootQuery  { nestedQuery  { whatever }, duplicatedNestedQuery: nestedQuery  { whatever } } }`,
      variables: {},
    }); // expect
  }); // test
});
