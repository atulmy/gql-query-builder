# GraphQL Query Builder
A simple helper function to generate GraphQL queries

# Usage
### Install

npm

`npm install gql-query-builder --save`

yarn

`yarn add gql-query-builder`

### Example

Query
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

Query (with data)
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

Mutation
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

# Showcase
Following projects are using [gql-query-builder](https://github.com/atulmy/gql-query-builder)
- Crate - Get monthly subscription of trendy clothes and accessories - [GitHub](https://github.com/atulmy/crate)
- HIRESMART - Application to streamline hiring process - [GitHub](https://github.com/atulmy/hire-smart)
- Would really appreciate if you add your project to this list by sending a PR
