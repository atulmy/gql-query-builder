/*
@class DefaultMutationAdapter
@desc A basic implementation to use
@desc modify the output of the mutation template by passing a second argument to mutation(options, AdapterClass)
 */
import Fields from "../Fields";
import IQueryBuilderOptions from "../IQueryBuilderOptions";
import OperationType from "../OperationType";
import Utils from "../Utils";
import IMutationAdapter from "./IMutationAdapter";

export default class DefaultMutationAdapter implements IMutationAdapter {
  private variables: any | undefined;
  private fields: Fields | undefined;
  private operation!: string;

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
      Utils.resolveVariables(mutations),
      content.join("\n  ")
    );
  }

  private queryDataArgumentAndTypeMap(variablesUsed: any): string {
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
      variables: Utils.queryVariablesMap(variables, this.fields),
    };
  }

  private operationTemplate(operation: string) {
    return `${operation} ${Utils.queryDataNameAndArgumentMap(this.variables)} ${
      this.fields && this.fields.length > 0
        ? `{
    ${Utils.queryFieldsMap(this.fields)}
  }`
        : ""
    }`;
  }
}
