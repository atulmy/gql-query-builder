'use strict'

/**
 * GraphQL Query Builder
 * @param {Object} options - Query data
 * @param {String} options.type - Operation type { query, mutation}
 * @param {String} options.operation - Operation name
 * @param {Array} options.fields - Selection of fields to be returned by the operation
 * @param {Object} options.data - Data sent to the operation
 * @param {Object} options.variables - Any variables for the operation
 */
module.exports = function queryBuilder (options) {
  options.type = options.type ? options.type : 'query'
  options.operation = options.operation ? options.operation : ''
  options.fields = options.fields ? options.fields : []
  options.data = options.data ? options.data : {}
  options.variables = options.variables ? options.variables : {}

  return {
    query: `${ options.type } ${ queryDataArgumentAndTypeMap(options.data) } {
              ${ options.operation } ${ queryDataNameAndArgumentMap(options.data) } {
                ${ options.fields.join(', ') }
              }
            }`,
    variables: Object.assign(options.data, options.variables)
  }
}

// Convert object to name and argument map eg: (id: $id)
function queryDataNameAndArgumentMap (data) {
  return Object.keys(data).length ? `(${ Object.keys(data).reduce((dataString, key, i) => `${ dataString }${ i !== 0 ? ', ' : '' }${ key }: $${ key }`, '') })` : ''
}

// Convert object to argument and type map eg: ($id: Int)
function queryDataArgumentAndTypeMap (data) {
  return Object.keys(data).length ? `(${ Object.keys(data).reduce((dataString, key, i) => `${ dataString }${ i !== 0 ? ', ' : '' }$${ key }: ${ queryDataType(data[key]) }`, '') })` : ''
}

// Private - Get GraphQL equivalent type of data passed (String, Int, Float, Boolean)
function queryDataType (data) {
  switch (typeof data) {
    case 'object':
      const type = data._type
      delete data._type
      return type
    case 'boolean':
      return 'Boolean'
    case 'number':
      return (data % 1 === 0) ? 'Int' : 'Float'
    case 'string':
    default:
      return 'String'
  }
}
