# GraphQL Query Builder
A simple helper function to generate GraphQL queries

# Usage
### Install

`npm install gql-query-builder --save` or `yarn add gql-query-builder`

### Example

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

Query (with data):
```javascript
import queryBuilder from 'gql-query-builder'

const query = queryBuilder({
  type: 'query',
  operation: 'thought',
  data: {id: parseInt(id, 10)},
  fields: ['id', 'name', 'thought']
})

console.log(query)

// Output
query {
  thought(id: 1) {
    id,
    name,
    thought
  }
}
```

Query (with sub fields selection)
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
query  {
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

Mutation:
```javascript
import queryBuilder from 'gql-query-builder'

const query = queryBuilder({
  type: 'mutation', 
  operation: 'thoughtCreate', 
  data: { 
    name: "Tyrion Lannister", 
    thought: "I drink and I know things." 
  }, 
  fields: ['id']
})

console.log(query)

// Output
mutation {
  thoughtCreate(
    name: "Tyrion Lannister", 
    thought:"I drink and I know things."
  ) {
    id
  }
}
```

#### Example with [Axios](https://github.com/axios/axios)

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

# Showcase
Following projects are using [gql-query-builder](https://github.com/atulmy/gql-query-builder)
- Crate - Get monthly subscription of trendy clothes and accessories - [GitHub](https://github.com/atulmy/crate)
- Fullstack GraphQL Application - [GitHub](https://github.com/atulmy/fullstack-graphql)
- Would really appreciate if you add your project to this list by sending a PR
