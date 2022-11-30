# GraphQL Query Builder

A simple helper function to generate GraphQL queries using plain JavaScript Objects (JSON).

<a href="https://www.npmjs.com/package/gql-query-builder">
<img src="https://img.shields.io/npm/dt/gql-query-builder?label=Downloads" alt="downloads" />
</a>

<a href="https://replit.com/@atulmy/gql-query-builder#index.js">
<img src="https://img.shields.io/badge/Demo-replit-blue" alt="demo" />
</a>

## Install

`npm install gql-query-builder --save` or `yarn add gql-query-builder`

## Usage

```typescript
import * as gql from 'gql-query-builder'

const query = gql.query(options: object)
const mutation = gql.mutation(options: object)
const subscription = gql.subscription(options: object)
```

You can also import `query` or `mutation` or `subscription` individually:

```typescript
import  { query, mutation, subscription } from 'gql-query-builder'

query(options: object)
mutation(options: object)
subscription(options: object)
```

### Options

`options` is `{ operation, fields, variables }` or an array of `options`

<table width="100%">
  <thead>

  <tr>
    <th>Name</th>
    <th>Description</th>
    <th>Type</th>
    <th>Required</th>
    <th>Example</th>

  </tr>

  </thead>
  <tbody>

  <tr>
    <td>operation</td>
    <td>Name of operation to be executed on server</td>
    <td>String | Object</td>
    <td>Yes</td>
    <td>
      getThoughts, createThought
      <br/><br />
      <code>{ name: 'getUser', alias: 'getAdminUser' }</code>
    </td>

  </tr>

  <tr>
    <td>fields</td>
    <td>Selection of fields</td>
    <td>Array</td>
    <td>No</td>
    <td>
      <code>['id', 'name', 'thought']</code>
      <br/><br />
      <code>['id', 'name', 'thought', { user: ['id', 'email'] }]</code>
    </td>

  </tr>
  <tr>
    <td>variables</td>
    <td>Variables sent to the operation</td>
    <td>Object</td>
    <td>No</td>
    <td>
      { key: value } eg: <code>{ id: 1 }</code>
      <br/><br/>
      { key: { value: value, required: true, type: GQL type, list: true, name: argument name } eg:
      <br />
      <code>
      {
        email: { value: "user@example.com", required: true },
        password: { value: "123456", required: true },
        secondaryEmails: { value: [], required: false, type: 'String', list: true, name: secondaryEmail }
      }
      </code>
    </td>

  </tr>

  </tbody>
</table>

### Adapter

An optional second argument `adapter` is a typescript/javascript class that implements `src/adapters/IQueryAdapter` or `src/adapters/IMutationAdapter`.

If adapter is undefined then `src/adapters/DefaultQueryAdapter` or `src/adapters/DefaultMutationAdapter` is used.

```
import * as gql from 'gql-query-builder'

const query = gql.query(options: object, adapter?: MyCustomQueryAdapter,config?: object)
const mutation = gql.mutation(options: object, adapter?: MyCustomQueryAdapter)
const subscription = gql.subscription(options: object, adapter?: MyCustomSubscriptionAdapter)
```

### Config

<table width="100%">
  <thead>

  <tr>
    <th>Name</th>
    <th>Description</th>
    <th>Type</th>
    <th>Required</th>
    <th>Example</th>
  </tr>

  </thead>
  <tbody>

  <tr>
    <td>operationName</td>
    <td>Name of operation to be sent to the server</td>
    <td>String</td>
    <td>No</td>
    <td>
      getThoughts, createThought
    </td>
  </tr>
  </tbody>
</table>

## Examples

1. <a href="#query">Query</a>
2. <a href="#query-with-variables">Query (with variables)</a>
3. <a href="#query-with-nested-fields-selection">Query (with nested fields selection)</a>
4. <a href="#query-with-required-variables">Query (with required variables)</a>
5. <a href="#query-with-custom-argument-name">Query (with custom argument name)</a>
6. <a href="#query-with-operation-name">Query (with operation name)</a>
7. <a href="#query-with-empty-fields">Query (with empty fields)</a>
8. <a href="#query-with-alias">Query (with alias)</a>
9. <a href="#query-with-adapter-defined">Query (with adapter defined)</a>
10. <a href="#mutation">Mutation</a>
11. <a href="#mutation-with-required-variables">Mutation (with required variables)</a>
12. <a href="#mutation-with-custom-types">Mutation (with custom types)</a>
13. <a href="#mutation-with-adapter-defined">Mutation (with adapter defined)</a>
14. <a href="#mutation-with-operation-name">Mutation (with operation name)</a>
15. <a href="#subscription">Subscription</a>
16. <a href="#subscription-with-adapter-defined">Subscription (with adapter defined)</a>
17. <a href="#example-with-axios">Example with Axios</a>

#### Query:

```javascript
import * as gql from 'gql-query-builder'

const query = gql.query({
  operation: 'thoughts',
  fields: ['id', 'name', 'thought']
})

console.log(query)

// Output
query {
  thoughts {
    id,
    name,
    thought
  }
}
```

[↑ all examples](#examples)

#### Query (with variables):

```javascript
import * as gql from 'gql-query-builder'

const query = gql.query({
  operation: 'thought',
  variables: { id: 1 },
  fields: ['id', 'name', 'thought']
})

console.log(query)

// Output
query ($id: Int) {
  thought (id: $id) {
    id, name, thought
  }
}

// Variables
{ "id": 1 }
```

[↑ all examples](#examples)

#### Query (with nested fields selection):

```javascript
import * as gql from 'gql-query-builder'

const query = gql({
  operation: 'orders',
  fields: [
    'id',
    'amount',
    {
     user: [
        'id',
        'name',
        'email',
        {
          address: [
            'city',
            'country'
          ]
        }
      ]
    }
  ]
})

console.log(query)

// Output
query {
  orders  {
    id,
    amount,
    user {
      id,
      name,
      email,
      address {
        city,
        country
      }
    }
  }
}
```

[↑ all examples](#examples)

#### Query (with required variables):

```javascript
import * as gql from 'gql-query-builder'

const query = gql.query({
  operation: 'userLogin',
  variables: {
    email: { value: 'jon.doe@example.com', required: true },
    password: { value: '123456', required: true }
  },
  fields: ['userId', 'token']
})

console.log(query)

// Output
query ($email: String!, $password: String!) {
  userLogin (email: $email, password: $password) {
    userId, token
  }
}

// Variables
{
  email: "jon.doe@example.com",
  password: "123456"
}
```

[↑ all examples](#examples)

#### Query (with custom argument name):

```javascript
import * as gql from 'gql-query-builder'

const query = gql.query([{
  operation: "someoperation",
  fields: [{
    operation: "nestedoperation",
    fields: ["field1"],
    variables: {
      id2: {
        name: "id",
        type: "ID",
        value: 123,
      },
    },
  }, ],
  variables: {
    id1: {
      name: "id",
      type: "ID",
      value: 456,
    },
  },
}, ]);

console.log(query)

// Output
query($id2: ID, $id1: ID) {
  someoperation(id: $id1) {
    nestedoperation(id: $id2) {
      field1
    }
  }
}

// Variables
{
  "id1": 1,
  "id2": 1
}
```

[↑ all examples](#examples)

#### Query (with operation name):

```javascript
import * as gql from 'gql-query-builder'

const query = gql.query({
  operation: 'userLogin',
  fields: ['userId', 'token']
}, null, {
  operationName: 'someoperation'
})

console.log(query)

// Output
query someoperation {
  userLogin {
    userId
    token
  }
}
```

[↑ all examples](#examples)

#### Query (with empty fields):

```javascript
import * as gql from 'gql-query-builder'

const query = gql.query([{
  operation: "getFilteredUsersCount",
},
  {
    operation: "getAllUsersCount",
    fields: []
  },
  operation: "getFilteredUsers",
  fields: [{
  count: [],
}, ],
]);

console.log(query)

// Output
query {
  getFilteredUsersCount
  getAllUsersCount
  getFilteredUsers {
    count
  }
}
```

[↑ all examples](#examples)

#### Query (with alias):

```javascript
import * as gql from 'gql-query-builder'

const query = gql.query({
  operation: {
    name: 'thoughts',
    alias: 'myThoughts',
  },
  fields: ['id', 'name', 'thought']
})

console.log(query)

// Output
query {
  myThoughts: thoughts {
    id,
    name,
    thought
  }
}
```

[↑ all examples](#examples)

#### Query (with inline fragment):

```javascript
import * as gql from 'gql-query-builder'

const query = gql.query({
    operation: "thought",
    fields: [
        "id",
        "name",
        "thought",
        {
            operation: "FragmentType",
            fields: ["emotion"],
            fragment: true,
        },
    ],
});

console.log(query)

// Output
query {
    thought {
        id,
        name,
        thought,
        ... on FragmentType {
            emotion
        }
    }
}
```

[↑ all examples](#examples)

#### Query (with adapter defined):

For example, to inject `SomethingIDidInMyAdapter` in the `operationWrapperTemplate` method.

```javascript
import * as gql from 'gql-query-builder'
import MyQueryAdapter from 'where/adapters/live/MyQueryAdapter'

const query = gql.query({
  operation: 'thoughts',
  fields: ['id', 'name', 'thought']
}, MyQueryAdapter)

console.log(query)

// Output
query SomethingIDidInMyAdapter {
  thoughts {
    id,
    name,
    thought
  }
}
```

Take a peek at [DefaultQueryAdapter](src/adapters/DefaultQueryAdapter.ts) to get an understanding of how to make a new adapter.

[↑ all examples](#examples)

#### Mutation:

```javascript
import * as gql from 'gql-query-builder'

const query = gql.mutation({
  operation: 'thoughtCreate',
  variables: {
    name: 'Tyrion Lannister',
    thought: 'I drink and I know things.'
  },
  fields: ['id']
})

console.log(query)

// Output
mutation ($name: String, $thought: String) {
  thoughtCreate (name: $name, thought: $thought) {
    id
  }
}

// Variables
{
  "name": "Tyrion Lannister",
  "thought": "I drink and I know things."
}
```

[↑ all examples](#examples)

#### Mutation (with required variables):

```javascript
import * as gql from 'gql-query-builder'

const query = gql.mutation({
  operation: 'userSignup',
  variables: {
    name: { value: 'Jon Doe' },
    email: { value: 'jon.doe@example.com', required: true },
    password: { value: '123456', required: true }
  },
  fields: ['userId']
})

console.log(query)

// Output
mutation ($name: String, $email: String!, $password: String!) {
  userSignup (name: $name, email: $email, password: $password) {
    userId
  }
}

// Variables
{
  name: "Jon Doe",
  email: "jon.doe@example.com",
  password: "123456"
}
```

[↑ all examples](#examples)

#### Mutation (with custom types):

```javascript
import * as gql from 'gql-query-builder'

const query = gql.mutation({
  operation: "userPhoneNumber",
  variables: {
    phone: {
      value: { prefix: "+91", number: "9876543210" },
      type: "PhoneNumber",
      required: true
    }
  },
  fields: ["id"]
})

console.log(query)

// Output
mutation ($phone: PhoneNumber!) {
  userPhoneNumber (phone: $phone) {
    id
  }
}

// Variables
{
  phone: {
    prefix: "+91", number: "9876543210"
  }
}
```

[↑ all examples](#examples)

#### Mutation (with adapter defined):

For example, to inject `SomethingIDidInMyAdapter` in the `operationWrapperTemplate` method.

```javascript
import * as gql from 'gql-query-builder'
import MyMutationAdapter from 'where/adapters/live/MyQueryAdapter'

const query = gql.mutation({
  operation: 'thoughts',
  fields: ['id', 'name', 'thought']
}, MyMutationAdapter)

console.log(query)

// Output
mutation SomethingIDidInMyAdapter {
  thoughts {
    id,
    name,
    thought
  }
}
```

[↑ all examples](#examples)

Take a peek at [DefaultMutationAdapter](src/adapters/DefaultMutationAdapter.ts) to get an understanding of how to make a new adapter.

#### Mutation (with operation name):

```javascript
import * as gql from 'gql-query-builder'

const query = gql.mutation({
  operation: 'thoughts',
  fields: ['id', 'name', 'thought']
}, undefined, {
  operationName: 'someoperation'
})

console.log(query)

// Output
mutation someoperation {
  thoughts {
    id
    name
    thought
  }
}
```

[↑ all examples](#examples)

#### Subscription:

```javascript
import axios from "axios";
import { subscription } from "gql-query-builder";

async function saveThought() {
  try {
    const response = await axios.post(
      "http://api.example.com/graphql",
      subscription({
        operation: "thoughtCreate",
        variables: {
          name: "Tyrion Lannister",
          thought: "I drink and I know things.",
        },
        fields: ["id"],
      })
    );

    console.log(response);
  } catch (error) {
    console.log(error);
  }
}
```

[↑ all examples](#examples)

#### Subscription (with adapter defined):

For example, to inject `SomethingIDidInMyAdapter` in the `operationWrapperTemplate` method.

```javascript
import * as gql from 'gql-query-builder'
import MySubscriptionAdapter from 'where/adapters/live/MyQueryAdapter'

const query = gql.subscription({
  operation: 'thoughts',
  fields: ['id', 'name', 'thought']
}, MySubscriptionAdapter)

console.log(query)

// Output
subscription SomethingIDidInMyAdapter {
  thoughts {
    id,
    name,
    thought
  }
}
```

Take a peek at [DefaultSubscriptionAdapter](src/adapters/DefaultSubscriptionAdapter.ts) to get an understanding of how to make a new adapter.

[↑ all examples](#examples)

#### Example with [Axios](https://github.com/axios/axios)

**Query:**

```javascript
import axios from "axios";
import { query } from "gql-query-builder";

async function getThoughts() {
  try {
    const response = await axios.post(
      "http://api.example.com/graphql",
      query({
        operation: "thoughts",
        fields: ["id", "name", "thought"],
      })
    );

    console.log(response);
  } catch (error) {
    console.log(error);
  }
}
```

[↑ all examples](#examples)

**Mutation:**

```javascript
import axios from "axios";
import { mutation } from "gql-query-builder";

async function saveThought() {
  try {
    const response = await axios.post(
      "http://api.example.com/graphql",
      mutation({
        operation: "thoughtCreate",
        variables: {
          name: "Tyrion Lannister",
          thought: "I drink and I know things.",
        },
        fields: ["id"],
      })
    );

    console.log(response);
  } catch (error) {
    console.log(error);
  }
}
```

[↑ all examples](#examples)

# Showcase

Following projects are using [gql-query-builder](https://github.com/atulmy/gql-query-builder)

- Crate - Get monthly subscription of trendy clothes and accessories - [GitHub](https://github.com/atulmy/crate)
- Fullstack GraphQL Application - [GitHub](https://github.com/atulmy/fullstack-graphql)
- Would really appreciate if you add your project to this list by sending a PR

## Author

- Atul Yadav - [GitHub](https://github.com/atulmy) · [Twitter](https://twitter.com/atulmy)

## Contributors

**If you are interested in actively maintaining / enhancing this project, get in <a href="mailto:atul.12788@gmail.com">touch</a>.**

- Juho Vepsäläinen - [GitHub](https://github.com/bebraw) · [Twitter](https://twitter.com/bebraw)
- Daniel Hreben - [GitHub](https://github.com/DanielHreben) · [Twitter](https://twitter.com/DanielHreben)
- Todd Baur - [GitHub](https://github.com/toadkicker) · [Twitter](https://twitter.com/toadkicker)
- Alireza Hariri - [GitHub](https://github.com/ARHariri)
- Cédric - [GitHub](https://github.com/cbonaudo)
- Clayton Collie - [GitHub](https://github.com/ccollie)
- Devon Reid - [GitHub](https://github.com/Devorein)
- Harry Brundage - [GitHub](https://github.com/airhorns) · [Twitter](https://twitter.com/harrybrundage)
- Clément Berard - [GitHub](https://github.com/clement-berard) · [Twitter](https://twitter.com/clementberard)
- Lee Rose - [GitHub](https://github.com/leeroyrose)
- Christian Westgaard - [GitHub](https://github.com/ComLock)
- [YOUR NAME HERE] - Feel free to contribute to the codebase by resolving any open issues, refactoring, adding new features, writing test cases or any other way to make the project better and helpful to the community. Feel free to fork and send pull requests.

## Donate

If you liked this project, you can donate to support it ❤️

[![Donate via PayPal](https://raw.githubusercontent.com/atulmy/atulmy.github.io/master/images/mix/paypal-me-smaller.png)](http://paypal.me/atulmy)

## License

Copyright (c) 2018 Atul Yadav <http://github.com/atulmy>

The MIT License (<http://www.opensource.org/licenses/mit-license.php>)
