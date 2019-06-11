import DefaultAppSyncQueryAdapter from "../src/adapters/DefaultAppSyncQueryAdapter";
import * as queryBuilder from "./";

describe("Query", () => {
  test("generates query", () => {
    const query = queryBuilder.query({
      operation: "thoughts",
      fields: ["id", "name", "thought"]
    });

    expect(query).toEqual({
      query: `query  { thoughts  { id, name, thought } }`,
      variables: {}
    });
  });

  test("generates query when adapter argument is provided", () => {
    const query = queryBuilder.query(
      {
        operation: "thoughts",
        fields: ["id", "name", "thought"]
      },
      DefaultAppSyncQueryAdapter
    );

    expect(query).toEqual({
      query: `query Thoughts  { thoughts  { nodes { id, name, thought } } }`,
      variables: {}
    });
  });

  test("generates query with variables", () => {
    const query = queryBuilder.query({
      operation: "thought",
      variables: { id: 1 },
      fields: ["id", "name", "thought"]
    });

    expect(query).toEqual({
      query: `query ($id: Int) { thought (id: $id) { id, name, thought } }`,
      variables: { id: 1 }
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
              address: ["city", "country"]
            }
          ]
        }
      ]
    });

    expect(query).toEqual({
      query: `query  { orders  { id, amount, user { id, name, email, address { city, country } } } }`,
      variables: {}
    });
  });

  test("generates query with required variables", () => {
    const query = queryBuilder.query({
      operation: "userLogin",
      variables: {
        email: { value: "jon.doe@example.com", required: true },
        password: { value: "123456", required: true }
      },
      fields: ["userId", "token"]
    });

    expect(query).toEqual({
      query: `query ($email: String!, $password: String!) { userLogin (email: $email, password: $password) { userId, token } }`,
      variables: { email: "jon.doe@example.com", password: "123456" }
    });
  });

  test("generates multiple queries", () => {
    const query = queryBuilder.query([
      {
        operation: "thoughts",
        fields: ["id", "name", "thought"]
      },
      {
        operation: "prayers",
        fields: ["id", "name", "prayer"]
      }
    ]);

    expect(query).toEqual({
      query: `query  { thoughts  { id, name, thought } prayers  { id, name, prayer } }`,
      variables: {}
    });
  });
});

describe("Mutation", () => {
  test("generates mutation query", () => {
    const query = queryBuilder.mutation({
      operation: "thoughtCreate",
      variables: {
        name: "Tyrion Lannister",
        thought: "I drink and I know things."
      },
      fields: ["id"]
    });

    expect(query).toEqual({
      query: `mutation ($name: String, $thought: String) {
  thoughtCreate (name: $name, thought: $thought) {
    id
  }
}`,
      variables: {
        name: "Tyrion Lannister",
        thought: "I drink and I know things."
      }
    });
  });

  test("generates mutation query with required variables", () => {
    const query = queryBuilder.mutation({
      operation: "userSignup",
      variables: {
        name: "Jon Doe",
        email: { value: "jon.doe@example.com", required: true },
        password: { value: "123456", required: true }
      },
      fields: ["userId"]
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
        password: "123456"
      }
    });
  });

  test("generates multiple mutations", () => {
    const query = queryBuilder.mutation([
      {
        operation: "thoughtCreate",
        variables: {
          name: "Tyrion Lannister",
          thought: "I drink and I know things."
        },
        fields: ["id"]
      },
      {
        operation: "prayerCreate",
        variables: {
          name: { value: "Tyrion Lannister" },
          prayer: { value: "I wish for winter." }
        },
        fields: ["id"]
      }
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
        prayer: "I wish for winter."
      }
    });
  });

  test("generates mutation with required variables", () => {
    const query = queryBuilder.mutation({
      operation: "userSignup",
      variables: {
        name: "Jon Doe",
        email: { value: "jon.doe@example.com", required: true },
        password: { value: "123456", required: true }
      },
      fields: ["id"]
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
        password: "123456"
      }
    });
  });

  test("generates mutation custom type", () => {
    const query = queryBuilder.mutation({
      operation: "userPhoneNumber",
      variables: {
        phone: {
          value: { prefix: "+91", number: "9876543210" },
          type: "PhoneNumber",
          required: true
        }
      },
      fields: ["id"]
    });

    expect(query).toEqual({
      query: `mutation ($phone: PhoneNumber!) {
  userPhoneNumber (phone: $phone) {
    id
  }
}`,
      variables: {
        phone: { prefix: "+91", number: "9876543210" }
      }
    });
  });

  test("generate mutation without fields selection", () => {
    const query = queryBuilder.mutation({
      operation: "logout"
    });

    expect(query).toEqual({
      query: `mutation  {
  logout  
}`,
      variables: {}
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
          thought: "I drink and I know things."
        },
        fields: ["id"]
      },
      {
        operation: "prayerCreate",
        variables: {
          name: { value: "Tyrion Lannister" },
          prayer: { value: "I wish for winter." }
        },
        fields: ["id"]
      }
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
        prayer: "I wish for winter."
      }
    });
  });

  test("generates subscription with required variables", () => {
    const query = queryBuilder.subscription({
      operation: "userSignup",
      variables: {
        name: "Jon Doe",
        email: { value: "jon.doe@example.com", required: true },
        password: { value: "123456", required: true }
      },
      fields: ["id"]
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
        password: "123456"
      }
    });
  });

  test("generates subscription custom type", () => {
    const query = queryBuilder.subscription({
      operation: "userPhoneNumber",
      variables: {
        phone: {
          value: { prefix: "+91", number: "9876543210" },
          type: "PhoneNumber",
          required: true
        }
      },
      fields: ["id"]
    });

    expect(query).toEqual({
      query: `subscription ($phone: PhoneNumber!) {
  userPhoneNumber (phone: $phone) {
    id
  }
}`,
      variables: {
        phone: { prefix: "+91", number: "9876543210" }
      }
    });
  });
});
