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

enum OperationType {
  Mutation = "mutation",
  Query = "query"
}

function queryOperation(
  options: IQueryBuilderOptions | IQueryBuilderOptions[]
) {
  if (Array.isArray(options)) {
    return queriesBuilder(options);
  }

  return queryBuilder(options);
}

function queryBuilder({
  operation,
  fields = [],
  variables = {}
}: IQueryBuilderOptions) {
  return operationWrapperTemplate(
    OperationType.Query,
    variables,
    operationTemplate({ variables, operation, fields })
  );
}

function queriesBuilder(queries: IQueryBuilderOptions[]) {
  return operationWrapperTemplate(
    OperationType.Query,
    resolveVariables(queries),
    queries.map(operationTemplate).join("\n  ")
  );
}

function mutationOperation(
  options: IQueryBuilderOptions | IQueryBuilderOptions[]
) {
  if (Array.isArray(options)) {
    return mutationsBuilder(options);
  }

  return mutationBuilder(options);
}

function mutationBuilder({
  operation,
  fields = [],
  variables = {}
}: IQueryBuilderOptions) {
  return operationWrapperTemplate(
    OperationType.Mutation,
    variables,
    operationTemplate({ variables, operation, fields })
  );
}

function mutationsBuilder(mutations: IQueryBuilderOptions[]) {
  return operationWrapperTemplate(
    OperationType.Mutation,
    resolveVariables(mutations),
    mutations.map(operationTemplate).join("\n  ")
  );
}

function resolveVariables(operations: IQueryBuilderOptions[]): IVariables {
  let ret: IVariables = {};

  operations.forEach(({ variables }) => {
    ret = { ...ret, ...variables };
  });

  return ret;
}

function operationWrapperTemplate(
  type: OperationType,
  variables: IVariables,
  content: string
) {
  return {
    query: `${type} ${queryDataArgumentAndTypeMap(variables)} {
  ${content}
}`,
    variables: queryVariablesMap(variables)
  };
}

function operationTemplate({
  variables,
  operation,
  fields
}: IQueryBuilderOptions) {
  return `${operation} ${queryDataNameAndArgumentMap(variables)} {
    ${queryFieldsMap(fields)}
  }`;
}

// Convert object to name and argument map. eg: (id: $id)
function queryDataNameAndArgumentMap(variables?: IVariables) {
  return variables && Object.keys(variables).length
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
function queryFieldsMap(fields?: Fields): string {
  return fields
    ? fields
        .map(field =>
          typeof field === "object"
            ? `${Object.keys(field)[0]} { ${queryFieldsMap(
                Object.values(field)[0]
              )} }`
            : `${field}`
        )
        .join(", ")
    : "";
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

export { mutationOperation as mutation, queryOperation as query };
