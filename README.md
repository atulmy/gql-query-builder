# GraphQL Query Builder
A simple helper function to generate GraphQL queries

# Usage
### Install

npm

`npm install query-builder --save`

yarn

`yarn add query-builder`

### Example

Query
```
import queryBuilder from 'gql-query-builder'

const query = queryBuilder({
  type: 'query',
  operation: 'thoughts',
  fields: ['id', 'name', 'thought']
}))

console.log(query)

query {
  thoughts {
    id,
    name,
    thought
  }
}
```

Query (with data)
```
import queryBuilder from 'gql-query-builder'

const query = queryBuilder({
  type: 'query',
  operation: 'thought',
  data: {id: parseInt(id, 10)},
  fields: ['id', 'name', 'thought']
})

console.log(query)

query {
  thought(id: 1) {
    id,
    name,
    thought
  }
}
```

Mutation
```
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

mutation {
  thoughtCreate(
    name: "Tyrion Lannister", 
    thought:"I drink and I know things."
  ) {
    id
  }
}
```

