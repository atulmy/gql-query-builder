/*
@class DefaultQueryAdapter
@desc A basic implementation to use
@desc modify the output of the query template by passing a second argument to query(options, AdapterClass)
 */
import Fields from "../Fields";
import IQueryBuilderOptions from "../IQueryBuilderOptions";
import OperationType from "../OperationType";
import Utils from "../Utils";
import IQueryAdapter from "./IQueryAdapter";

export default class DefaultQueryAdapter implements IQueryAdapter {
  private variables!: any | undefined;
  private fields: Fields | undefined;
  private operation!: string;

  constructor(options: IQueryBuilderOptions | IQueryBuilderOptions[]) {
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
    return this.operationWrapperTemplate(this.operationTemplate());
  }
  // if we have an array of options, call this
  public queriesBuilder(queries: IQueryBuilderOptions[]) {
    const content = () => {
      const tmpl: string[] = [];
      queries.forEach((query) => {
        if (query) {
          this.operation = query.operation;
          this.fields = query.fields;
          this.variables = query.variables;
          tmpl.push(this.operationTemplate());
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
    return variablesUsed && Object.keys(variablesUsed).length
      ? `(${Object.keys(variablesUsed).reduce(
          (dataString, key, i) =>
            `${dataString}${i !== 0 ? ", " : ""}$${key}: ${Utils.queryDataType(
              variablesUsed[key]
            )}`,
          ""
        )})`
      : "";
  }

  private operationWrapperTemplate(
    content: string
  ): { variables: { [p: string]: unknown }; query: string } {
    return {
      query: `${
        OperationType.Query
      } ${this.queryDataArgumentAndTypeMap()} { ${content} }`,
      variables: Utils.queryVariablesMap(this.variables, this.fields),
    };
  }
  // query
  private operationTemplate() {
    return `${this.operation} ${Utils.queryDataNameAndArgumentMap(
      this.variables
    )} { ${Utils.queryFieldsMap(this.fields)} }`;
  }
}
