/*
@class DefaultMutationAdapter
@desc A basic implementation to use
@desc modify the output of the subscription template by passing a second argument to subscription(options, AdapterClass)
 */
import Fields from "../Fields";
import IQueryBuilderOptions from "../IQueryBuilderOptions";
import OperationType from "../OperationType";
import Utils from "../Utils";
import ISubscriptionAdapter from "./ISubscriptionAdapter";

export default class DefaultSubscriptionAdapter
  implements ISubscriptionAdapter {
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

  public subscriptionBuilder() {
    return this.operationWrapperTemplate(
      OperationType.Subscription,
      this.variables,
      this.operationTemplate(this.operation)
    );
  }

  public subscriptionsBuilder(subscriptions: IQueryBuilderOptions[]) {
    const content = subscriptions.map(opts => {
      this.operation = opts.operation;
      this.variables = opts.variables;
      this.fields = opts.fields;
      return this.operationTemplate(opts.operation);
    });
    return this.operationWrapperTemplate(
      OperationType.Subscription,
      Utils.resolveVariables(subscriptions),
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

  // start of subscription building
  private operationWrapperTemplate(
    type: OperationType,
    variables: any,
    content: string
  ) {
    return {
      query: `${type} ${this.queryDataArgumentAndTypeMap(variables)} {
  ${content}
}`,
      variables: Utils.queryVariablesMap(variables)
    };
  }

  private operationTemplate(operation: string) {
    return `${operation} ${this.queryDataNameAndArgumentMap()} {
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
