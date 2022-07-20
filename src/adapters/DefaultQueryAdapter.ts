/*
@class DefaultQueryAdapter
@desc A basic implementation to use
@desc modify the output of the query template by passing a second argument to query(options, AdapterClass)
 */
import Fields from "../Fields";
import IQueryBuilderOptions, { IOperation } from "../IQueryBuilderOptions";
import OperationType from "../OperationType";
import Utils from "../Utils";
import IQueryAdapter from "./IQueryAdapter";
import VariableOptions from "../VariableOptions";

export default class DefaultQueryAdapter implements IQueryAdapter {
  private variables!: any | undefined;
  private fields: Fields | undefined;
  private operation!: string | IOperation;
  private config: { [key: string]: unknown };

  constructor(
    options: IQueryBuilderOptions | IQueryBuilderOptions[],
    configuration?: { [key: string]: unknown }
  ) {
    // Default configs
    this.config = {
      operationName: "",
    };
    if (configuration) {
      Object.entries(configuration).forEach(([key, value]) => {
        this.config[key] = value;
      });
    }

    if (Array.isArray(options)) {
      this.variables = Utils.resolveVariables(options);
    } else {
      this.variables = options.variables;
      this.fields = options.fields || [];
      this.operation = options.operation;
    }
  }
  // kicks off building for a single query
  public queryBuilder() {
    return this.operationWrapperTemplate(
      this.operationTemplate(this.variables)
    );
  }
  // if we have an array of options, call this
  public queriesBuilder(queries: IQueryBuilderOptions[]) {
    const content = () => {
      const tmpl: string[] = [];
      queries.forEach((query) => {
        if (query) {
          this.operation = query.operation;
          this.fields = query.fields;
          tmpl.push(this.operationTemplate(query.variables));
        }
      });
      return tmpl.join(" ");
    };
    return this.operationWrapperTemplate(content());
  }

  // Convert object to argument and type map. eg: ($id: Int)
  private queryDataArgumentAndTypeMap(): string {
    let variablesUsed: { [key: string]: unknown } = this.variables;

    if (this.fields && typeof this.fields === "object") {
      variablesUsed = {
        ...Utils.getNestedVariables(this.fields),
        ...variablesUsed,
      };
    }
    return variablesUsed && Object.keys(variablesUsed).length > 0
      ? `(${Object.keys(variablesUsed).reduce(
          (dataString, key, i) =>
            `${dataString}${i !== 0 ? ", " : ""}$${key}: ${Utils.queryDataType(
              variablesUsed[key]
            )}`,
          ""
        )})`
      : "";
  }

  private operationWrapperTemplate(content: string): {
    variables: { [p: string]: unknown };
    query: string;
  } {
    let query = `${
      OperationType.Query
    } ${this.queryDataArgumentAndTypeMap()} { ${content} }`;
    query = query.replace(
      "query",
      `query${
        this.config.operationName !== "" ? " " + this.config.operationName : ""
      }`
    );
    return {
      query,
      variables: Utils.queryVariablesMap(this.variables, this.fields),
    };
  }
  // query
  private operationTemplate(variables: VariableOptions | undefined) {
    const operation =
      typeof this.operation === "string"
        ? this.operation
        : `${this.operation.alias}: ${this.operation.name}`;

    return `${operation} ${
      variables ? Utils.queryDataNameAndArgumentMap(variables) : ""
    } ${
      this.fields && this.fields.length > 0
        ? "{ " + Utils.queryFieldsMap(this.fields) + " }"
        : ""
    }`;
  }
}
