import * as queryBuilder from "../index";

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

  test("generates subscription without variables", () => {
    const query = queryBuilder.subscription({
      operation: "thoughtCreated",
      fields: ["id"],
    });

    expect(query).toEqual({
      query: `subscription  {
  thoughtCreated  {
    id
  }
}`,
      variables: {},
    });
  });

  test("generates subscriptions with query alias", () => {
    const query = queryBuilder.subscription([
      {
        operation: {
          name: "thoughtCreate",
          alias: "myThoughtCreate",
        },
        variables: {
          name: "Tyrion Lannister",
          thought: "I drink and I know things.",
        },
        fields: ["id"],
      },
      {
        operation: {
          name: "prayerCreate",
          alias: "myPrayerCreate",
        },
        variables: {
          name: { value: "Tyrion Lannister" },
          prayer: { value: "I wish for winter." },
        },
        fields: ["id"],
      },
    ]);

    expect(query).toEqual({
      query: `subscription ($name: String, $thought: String, $prayer: String) {
  myThoughtCreate: thoughtCreate (name: $name, thought: $thought) {
    id
  }
  myPrayerCreate: prayerCreate (name: $name, prayer: $prayer) {
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
