/*
@class DefaulAppSynctMutationAdapter
@desc A basic implementation to use with AWS AppSync
@desc modify the output of the mutation template by passing a second argument to mutation(options, AdapterClass)
 */
import Fields from "../Fields";
import IQueryBuilderOptions, { IOperation } from "../IQueryBuilderOptions";
import OperationType from "../OperationType";
import Utils from "../Utils";
import IMutationAdapter from "./IMutationAdapter";

export default class DefaultAppSyncMutationAdapter implements IMutationAdapter {
  private variables: any | undefined;
  private fields: Fields | undefined;
  private operation!: string | IOperation;

  constructor(options: IQueryBuilderOptions | IQueryBuilderOptions[]) {
    if (Array.isArray(options)) {
      this.variables = Utils.resolveVariables(options);
    } else {
      this.variables = options.variables;
      this.fields = options.fields;
      this.operation = options.operation;
    }
  }

  public mutationBuilder() {
    return this.operationWrapperTemplate(
      this.variables,
      this.operationTemplate(this.operation)
    );
  }

  public mutationsBuilder(mutations: IQueryBuilderOptions[]) {
    const content = mutations.map((opts) => {
      this.operation = opts.operation;
      this.variables = opts.variables;
      this.fields = opts.fields;
      return this.operationTemplate(opts.operation);
    });
    return this.operationWrapperTemplate(
      Utils.resolveVariables(mutations),
      content.join("\n  ")
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

  private queryDataArgumentAndTypeMap(variables: any): string {
    return Object.keys(variables).length
      ? `(${Object.keys(variables).reduce(
          (dataString, key, i) =>
            `${dataString}${i !== 0 ? ", " : ""}$${key}: ${Utils.queryDataType(
              variables[key]
            )}`,
          ""
        )})`
      : "";
  }

  // start of mutation building
  private operationWrapperTemplate(variables: any, content: string): any {
    const operation =
      typeof this.operation === "string" ? this.operation : this.operation.name;

    return {
      query: `${OperationType.Mutation} ${
        operation.charAt(0).toUpperCase() + operation.slice(1)
      } ${this.queryDataArgumentAndTypeMap(variables)} {
  ${content}
}`,
      variables: Utils.queryVariablesMap(variables),
    };
  }

  private operationTemplate(operation: string | IOperation): string {
    const operationName =
      typeof operation === "string"
        ? operation
        : `${operation.alias}: ${operation.name}`;

    return `${operationName} ${this.queryDataNameAndArgumentMap()} {
    ${this.queryFieldsMap(this.fields)}
  }`;
  }

  // Fields selection map. eg: { id, name }
  private queryFieldsMap(fields?: Fields): string {
    return Array.isArray(fields)
      ? fields
          .map((field) =>
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
