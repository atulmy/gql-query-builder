/*
@class DefaultMutationAdapter
@desc A basic implementation to use
@desc modify the output of the mutation template by passing a second argument to mutation(options, AdapterClass)
 */
import Fields from "../Fields";
import IQueryBuilderOptions, { IOperation } from "../IQueryBuilderOptions";
import OperationType from "../OperationType";
import IMutationAdapter from "./IMutationAdapter";
import {
  getNestedVariables,
  queryDataNameAndArgumentMap,
  queryDataType,
  queryFieldsMap,
  queryVariablesMap,
  resolveVariables,
} from "../Utils";

export default class DefaultMutationAdapter implements IMutationAdapter {
  private variables: any | undefined;
  private fields: Fields | undefined;
  private operation!: string | IOperation;
  private config: { [key: string]: unknown };

  constructor(
    options: IQueryBuilderOptions | IQueryBuilderOptions[],
    configuration?: { [key: string]: unknown }
  ) {
    if (Array.isArray(options)) {
      this.variables = resolveVariables(options);
    } else {
      this.variables = options.variables;
      this.fields = options.fields;
      this.operation = options.operation;
    }

    // Default configs
    this.config = {
      operationName: "",
    };
    if (configuration) {
      Object.entries(configuration).forEach(([key, value]) => {
        this.config[key] = value;
      });
    }
  }

  public mutationBuilder() {
    return this.operationWrapperTemplate(
      OperationType.Mutation,
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
      OperationType.Mutation,
      resolveVariables(mutations),
      content.join("\n  ")
    );
  }

  private queryDataArgumentAndTypeMap(variablesUsed: any): string {
    if (this.fields && typeof this.fields === "object") {
      variablesUsed = {
        ...getNestedVariables(this.fields),
        ...variablesUsed,
      };
    }
    return variablesUsed && Object.keys(variablesUsed).length > 0
      ? `(${Object.keys(variablesUsed).reduce(
          (dataString, key, i) =>
            `${dataString}${i !== 0 ? ", " : ""}$${key}: ${queryDataType(
              variablesUsed[key]
            )}`,
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
    let query = `${type} ${this.queryDataArgumentAndTypeMap(variables)} {
      ${content}
    }`;

    if (this.config.operationName) {
      query = query.replace(
        "mutation",
        `mutation ${this.config.operationName}`
      );
    }

    return {
      query,
      variables: queryVariablesMap(variables, this.fields),
    };
  }

  private operationTemplate(operation: string | IOperation) {
    const operationName =
      typeof operation === "string"
        ? operation
        : `${operation.alias}: ${operation.name}`;

    return `${operationName} ${queryDataNameAndArgumentMap(this.variables)} ${
      this.fields && this.fields.length > 0
        ? `{
    ${queryFieldsMap(this.fields)}
  }`
        : ""
    }`;
  }
}
