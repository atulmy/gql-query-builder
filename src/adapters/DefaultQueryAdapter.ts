import Fields from "../Fields";
import IQueryBuilderOptions from "../IQueryBuilderOptions";
import OperationType from "../OperationType";
import Utils from "../Utils";
import IQueryAdapter from "./IQueryAdapter";

export default class DefaultQueryAdapter implements IQueryAdapter {
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
  // kicks off building for a single query
  public queryBuilder() {
    return this.operationWrapperTemplate(
      OperationType.Query,
      this.variables,
      this.operationTemplate()
    );
  }
  // if we have an array of options, call this
  public queriesBuilder(queries: IQueryBuilderOptions[]) {
    return this.operationWrapperTemplate(
      OperationType.Query,
      Utils.resolveVariables(queries),
      queries.map(this.operationTemplate).join("\n  ")
    );
  }

  // Convert object to name and argument map. eg: (id: $id)
  public queryDataNameAndArgumentMap() {
    return this.variables && Object.keys(this.variables).length
      ? `(${Object.keys(this.variables).reduce(
          (dataString, key, i) =>
            `${dataString}${i !== 0 ? ", " : ""}${key}: $${key}`,
          ""
        )})`
      : "";
  }
  // Variables map. eg: { "id": 1, "name": "Jon Doe" }
  public queryVariablesMap() {
    const variablesMapped: { [key: string]: unknown } = {};

    Object.keys(this.variables).map(key => {
      variablesMapped[key] =
        typeof this.variables[key] === "object"
          ? this.variables[key].value
          : this.variables[key];
    });

    return variablesMapped;
  }

  // Convert object to argument and type map. eg: ($id: Int)
  private queryDataArgumentAndTypeMap(): string {
    return Object.keys(this.variables).length
      ? `(${Object.keys(this.variables).reduce(
          (dataString, key, i) =>
            `${dataString}${i !== 0 ? ", " : ""}$${key}: ${this.queryDataType(
              this.variables[key]
            )}`,
          ""
        )})`
      : "";
  }

  private queryDataType = (variable: any) => {
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
  };

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

  private operationWrapperTemplate(
    type: OperationType,
    variables: any,
    content: string
  ): { variables: any; query: string } {
    return {
      query: `${type} ${this.queryDataArgumentAndTypeMap()} {
  ${content}
}`,
      variables: this.queryVariablesMap()
    };
  }
  // query
  private operationTemplate() {
    return `${this.operation} ${this.queryDataNameAndArgumentMap()} {
    ${this.queryFieldsMap(this.fields)}
  }`;
  }
}
