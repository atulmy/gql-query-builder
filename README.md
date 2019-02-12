# GraphQL Query Builder
A simple helper function to generate GraphQL queries using plain JavaScript Objects (JSON).

# Usage
### Install

`npm install gql-query-builder --save` or `yarn add gql-query-builder`

### API
`const query = queryBuilder(options: object)` 

where `options` is `{ type, operation, fields, variables }`

<table width="100%">
  <thead>
    <tr>
      <th>Name</th>
      <th>Description</th>
      <th>Type</th>
      <th>Requred</th>
      <th>Example</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>type</td>
      <td>The type of operation</td>
      <td>String</td>
      <td>Yes</td>
      <td>
        query, mutation 
      </td>
    </tr>
    <tr>
      <td>operation</td>
      <td>Name of operation to be executed on server</td>
      <td>String</td>
      <td>Yes</td>
      <td>
        getThougts, createThought
      </td>
    </tr>
    <tr>
      <td>fields</td>
      <td>Selection of fields</td>
      <td>Array</td>
      <td>Yes</td>
      <td>
        ['id', 'name', 'thought'] <br/><br />
        ['id', 'name', 'thought', { user: ['id', 'email'] }]
      </td>
    </tr>
    <tr>
      <td>variables</td>
      <td>Variables sent to the operation</td>
      <td>Object</td>
      <td>No</td>
      <td>
        { key: value } eg: { id: 1 } <br /><br />
        { key: { value: value, required: true } eg:<br />
        {
          email: { value: "user@example.com", required: true },
          password: { value: "123456", required: true }
        }
      </td>
    </tr>
  </tbody>
</table>

### Examples

Query:
```javascript
import queryBuilder from 'gql-query-builder'

const query = queryBuilder({
  type: 'query',
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

Query (with variables):
```javascript
import queryBuilder from 'gql-query-builder'

const query = queryBuilder({
  type: 'query',
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

Query (with nested fields selection)
```javascript
import queryBuilder from 'gql-query-builder'

const query = queryBuilder({
  type: 'query',
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

Query (with required variables):
```javascript
import queryBuilder from 'gql-query-builder'

const query = queryBuilder({
  type: 'query',
  operation: 'userLogin',
  variables: {
    email: { value: "jon.doe@example.com", required: true },
    password: { value: "123456", required: true }
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

Mutation:
```javascript
import queryBuilder from 'gql-query-builder'

const query = queryBuilder({
  type: 'mutation', 
  operation: 'thoughtCreate', 
  variables: { 
    name: "Tyrion Lannister", 
    thought: "I drink and I know things." 
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

Mutation (with required variables):
```javascript
import queryBuilder from 'gql-query-builder'

const query = queryBuilder({
  type: 'mutation',
  operation: 'userSignup',
  variables: {
    name: "Jon Doe",
    email: { value: "jon.doe@example.com", required: true },
    password: { value: "123456", required: true }
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

#### Example with [Axios](https://github.com/axios/axios)

Query
```javascript
import axios from 'axios'
import queryBuilder from 'gql-query-builder'

async function getThoughts() {
  try {
    const response = await axios.post('http://api.example.com/graphql', queryBuilder({
      type: 'query',
      operation: 'thoughts',
      fields: ['id', 'name', 'thought']
    }))
    
    console.log(response)
  } catch(error) {
    console.log(error)
  }
}

```

Mutation
```javascript
import axios from 'axios'
import queryBuilder from 'gql-query-builder'

async function saveThought() {
  try {
    const response = await axios.post('http://api.example.com/graphql', queryBuilder({
      type: 'mutation', 
        operation: 'thoughtCreate', 
        variables: {
          name: "Tyrion Lannister", 
          thought: "I drink and I know things." 
        },
        fields: ['id']
    }))
    
    console.log(response)
  } catch(error) {
    console.log(error)
  }
}
```

# Showcase
Following projects are using [gql-query-builder](https://github.com/atulmy/gql-query-builder)
- Crate - Get monthly subscription of trendy clothes and accessories - [GitHub](https://github.com/atulmy/crate)
- Fullstack GraphQL Application - [GitHub](https://github.com/atulmy/fullstack-graphql)
- Would really appreciate if you add your project to this list by sending a PR


## Authors
- Atul Yadav - [GitHub](https://github.com/atulmy) · [Twitter](https://twitter.com/atulmy)
- [YOUR NAME HERE] - Feel free to contribute to the codebase by resolving any open issues, refactoring, adding new features, writing test cases or any other way to make the project better and helpful to the community. Feel free to fork and send pull requests.


## Donate
If you liked this project, you can donate to support it ❤️

[![Donate via PayPal](https://raw.githubusercontent.com/atulmy/atulmy.github.io/master/images/mix/paypal-me-smaller.png)](http://paypal.me/atulmy)


## License
Copyright (c) 2018 Atul Yadav http://github.com/atulmy

The MIT License (http://www.opensource.org/licenses/mit-license.php)
