import Fields from "../Fields";
import IQueryBuilderOptions from "../IQueryBuilderOptions";
import OperationType from "../OperationType";
import Utils from "../Utils";
import IMutationAdapter from "./IMutationAdapter";

export default class DefaultMutationAdapter implements IMutationAdapter {
  private static queryDataType(variable: any) {
    let type = "String";

    const value = typeof variable === "object" ? variable.value : variable;

    if (variable.type !== undefined) {
      type = variable.type;
    } else {
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
    }

    if (typeof variable === "object" && variable.required) {
      type += "!";
    }

    return type;
  }
  private readonly variables: any | undefined;
  private readonly fields: Fields | undefined;
  private readonly operation: string;

  constructor(options: IQueryBuilderOptions | IQueryBuilderOptions[]) {
    if (Array.isArray(options)) {
      this.variables = Utils.resolveVariables(options);
      this.operation = OperationType.Query;
    } else {
      this.variables = options.variables;
      this.fields = options.fields;
      this.operation = OperationType.Query;
    }
  }

  public mutationBuilder() {
    return this.operationWrapperTemplate(
      OperationType.Mutation,
      this.variables,
      this.operationTemplate()
    );
  }

  public mutationsBuilder(mutations: IQueryBuilderOptions[]) {
    return this.operationWrapperTemplate(
      OperationType.Mutation,
      Utils.resolveVariables(mutations),
      mutations.map(this.operationTemplate).join("\n  ")
    );
  }
  // Convert object to name and argument map. eg: (id: $id)
  private queryDataNameAndArgumentMap() {
    return this.variables && Object.keys(this.variables).length
      ? `(${Object.keys(this.variables).reduce(
          (dataString, key, i) =>
            `${dataString}${i !== 0 ? ", " : ""}${key}: $${key}`,
          ""
        )})`
      : "";
  }

  // Convert object to argument and type map. eg: ($id: Int)
  private queryDataArgumentAndTypeMap(variables: any): string {
    return Object.keys(variables).length
      ? `(${Object.keys(variables).reduce(
          (dataString, key, i) =>
            `${dataString}${
              i !== 0 ? ", " : ""
            }$${key}: ${DefaultMutationAdapter.queryDataType(variables[key])}`,
          ""
        )})`
      : "";
  }

  // start of mutation building
  private operationWrapperTemplate(
    type: OperationType,
    variables: any,
    content: string
  ) {
    return {
      query: `${type} ${this.queryDataArgumentAndTypeMap(variables)} {
  ${content}
}`,
      variables: this.queryVariablesMap(variables)
    };
  }

  private queryVariablesMap(variables: any) {
    const variablesMapped: { [key: string]: unknown } = {};

    Object.keys(variables).map(key => {
      variablesMapped[key] =
        typeof variables[key] === "object"
          ? variables[key].value
          : variables[key];
    });

    return variablesMapped;
  }

  private operationTemplate() {
    return `${this.operation} ${this.queryDataNameAndArgumentMap()} {
    ${this.queryFieldsMap(this.fields)}
  }`;
  }

  // Fields selection map. eg: { id, name }
  private queryFieldsMap(fields?: Fields): string {
    return fields
      ? fields
          .map(field =>
            typeof field === "object"
              ? `${Object.keys(field)[0]} { ${this.queryFieldsMap(
                  Object.values(field)[0]
                )} }`
              : `${field}`
          )
          .join(", ")
      : "";
  }
}
