'use strict'

/**
 * GraphQL Query Builder
 * @param {Object} options - Query data (required)
 * @param {String} options.type - Operation type { query, mutation } (required)
 * @param {String} options.operation - Operation name (required)
 * @param {Array}  options.fields - Selection of fields to be returned by the operation (optional)
 * @param {Object} options.variables - Any variables for the operation (optional)
 */
module.exports = function queryBuilder (options) {
  options.type = options.type || 'query'
  options.operation = options.operation || ''
  options.fields = options.fields || []
  options.variables = options.variables || {}

return {
  query: `${ options.type } ${ queryDataArgumentAndTypeMap(options.variables) } {
      ${ options.operation } ${ queryDataNameAndArgumentMap(options.variables) } {
        ${ queryFieldsMap(options.fields) }
      }
    }`,
  variables: queryVariablesMap(options.variables)
}
}

// Convert object to name and argument map. eg: (id: $id)
function queryDataNameAndArgumentMap (variables) {
  return Object.keys(variables).length
    ? `(${ Object.keys(variables).reduce((dataString, key, i) => `${ dataString }${ i !== 0 ? ', ' : '' }${ key }: $${ key }`, '') })`
    : ''
}

// Convert object to argument and type map. eg: ($id: Int)
function queryDataArgumentAndTypeMap (variables) {
  return Object.keys(variables).length
    ? `(${ Object.keys(variables).reduce((dataString, key, i) => `${ dataString }${ i !== 0 ? ', ' : '' }$${ key }: ${ queryDataType(variables[key]) }`, '') })`
    : ''
}

// Fields selection map. eg: { id, name }
function queryFieldsMap(fields) {
  return fields.map(field => typeof field === 'object'
    ? `${ Object.keys(field)[0] } { ${ queryFieldsMap(Object.values(field)[0]) } }`
    : `${ field }`).join(', ')
}

// Variables map. eg: { "id": 1, "name": "Jon Doe" }
function queryVariablesMap(variables) {
  const variablesMapped = {}

  Object.keys(variables).map(key => {
    variablesMapped[key] = typeof variables[key] === 'object' ? variables[key].value : variables[key]
  })

  return variablesMapped
}

// Get GraphQL equivalent type of data passed (String, Int, Float, Boolean)
function queryDataType (variable) {
  let type = 'String'

  const value = typeof variable === 'object' ? variable.value : variable

  switch (typeof value) {
    case 'object':
      type = value._type
      delete value._type
      break

    case 'boolean':
      type = 'Boolean'
      break

    case 'number':
      type = (value % 1 === 0) ? 'Int' : 'Float'
      break
  }

  if(typeof variable === 'object' && variable.required) {
    type += '!'
  }

  return type
}
