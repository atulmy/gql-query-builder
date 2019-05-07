import OperationType from "../OperationType";

class DefaultQueryAdapter {
  // Convert object to name and argument map. eg: (id: $id)
  private static queryDataNameAndArgumentMap(variables?: any) {
    return variables && Object.keys(variables).length
      ? `(${Object.keys(variables).reduce(
          (dataString, key, i) =>
            `${dataString}${i !== 0 ? ", " : ""}${key}: $${key}`,
          ""
        )})`
      : "";
  }
  // Variables map. eg: { "id": 1, "name": "Jon Doe" }
  public queryVariablesMap(variables: any) {
    const variablesMapped: { [key: string]: unknown } = {};

    Object.keys(variables).map(key => {
      variablesMapped[key] =
        typeof variables[key] === "object"
          ? variables[key].value
          : variables[key];
    });

    return variablesMapped;
  }
  private queriesBuilder(queries: IQueryBuilderOptions[]) {
    return operationWrapperTemplate(
      OperationType.Query,
      resolveVariables(queries),
      queries.map(operationTemplate).join("\n  ")
    );
  }
  private operationWrapperTemplate(
    type: OperationType,
    variables: any,
    content: string
  ): { variables: any; query: string } {
    return {
      query: `${type} ${queryDataArgumentAndTypeMap(variables)} {
  ${content}
}`,
      variables: queryVariablesMap(variables)
    };
  }
  // query
  private operationTemplate({
    variables,
    operation,
    fields
  }: IQueryBuilderOptions) {
    return `${operation} ${DefaultQueryAdapter.queryDataNameAndArgumentMap(
      variables
    )} {
    ${queryFieldsMap(fields)}
  }`;
  }
}
