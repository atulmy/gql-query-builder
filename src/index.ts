interface IVariable {
  value: unknown;
  required?: boolean;
}
interface IVariables {
  [key: string]: IVariable;
}
type Fields = Array<string | object>;

interface IQueryBuilderOptions {
  operation: string /* Operation name */;
  fields?: Fields /* Selection of fields to be returned by the operation */;
  variables?: IVariables /* Any variables for the operation */;
}

type BaseQueryOptions = IQueryBuilderOptions & {
  type: "query" | "mutation";
};

function queryBuilder({
  operation,
  fields = [],
  variables = {}
}: IQueryBuilderOptions) {
  return baseQuery({ type: "query", operation, fields, variables });
}

function mutationBuilder({
  operation,
  fields = [],
  variables = {}
}: IQueryBuilderOptions) {
  return baseQuery({ type: "mutation", operation, fields, variables });
}

function baseQuery({
  type,
  operation,
  fields = [],
  variables = {}
}: BaseQueryOptions) {
  return {
    query: `${type} ${queryDataArgumentAndTypeMap(variables)} {
  ${operation} ${queryDataNameAndArgumentMap(variables)} {
    ${queryFieldsMap(fields)}
  }
}`,
    variables: queryVariablesMap(variables)
  };
}

// Convert object to name and argument map. eg: (id: $id)
function queryDataNameAndArgumentMap(variables: IVariables) {
  return Object.keys(variables).length
    ? `(${Object.keys(variables).reduce(
        (dataString, key, i) =>
          `${dataString}${i !== 0 ? ", " : ""}${key}: $${key}`,
        ""
      )})`
    : "";
}

// Convert object to argument and type map. eg: ($id: Int)
function queryDataArgumentAndTypeMap(variables: IVariables): string {
  return Object.keys(variables).length
    ? `(${Object.keys(variables).reduce(
        (dataString, key, i) =>
          `${dataString}${i !== 0 ? ", " : ""}$${key}: ${queryDataType(
            variables[key]
          )}`,
        ""
      )})`
    : "";
}

// Fields selection map. eg: { id, name }
function queryFieldsMap(fields: Fields): string {
  return fields
    .map(field =>
      typeof field === "object"
        ? `${Object.keys(field)[0]} { ${queryFieldsMap(
            Object.values(field)[0]
          )} }`
        : `${field}`
    )
    .join(", ");
}

// Variables map. eg: { "id": 1, "name": "Jon Doe" }
function queryVariablesMap(variables: IVariables) {
  const variablesMapped: { [key: string]: unknown } = {};

  Object.keys(variables).map(key => {
    variablesMapped[key] = variables[key].value;
  });

  return variablesMapped;
}

// Get GraphQL equivalent type of data passed (String, Int, Float, Boolean)
function queryDataType(variable: IVariable) {
  let type = "String";

  const { value } = variable;

  switch (typeof value) {
    case "object":
      type = "Object";
      break;

    case "boolean":
      type = "Boolean";
      break;

    case "number":
      type = value % 1 === 0 ? "Int" : "Float";
      break;
  }

  if (typeof variable === "object" && variable.required) {
    type += "!";
  }

  return type;
}

export { mutationBuilder as mutation, queryBuilder as query };
