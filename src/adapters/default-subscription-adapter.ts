/**
 * Default adapter for `subscription()`. Renders one or more subscription
 * operations into a single GraphQL document. Pass your own class implementing
 * {@link SubscriptionAdapter} as the second argument of `subscription()` to
 * customize the output.
 */
import type {
  AdapterConfig,
  Fields,
  Operation,
  OperationResult,
  QueryBuilderOptions,
} from "../types";
import {
  queryDataNameAndArgumentMap,
  queryDataTypeAndDefault,
  queryFieldsMap,
  queryVariablesMap,
  resolveVariables,
} from "../utils";
import type { SubscriptionAdapter } from "./types";

export class DefaultSubscriptionAdapter implements SubscriptionAdapter {
  #variables: any;
  #fields: Fields | undefined;
  #operation!: string | Operation;
  readonly #config: AdapterConfig;

  constructor(
    options: QueryBuilderOptions | QueryBuilderOptions[],
    configuration?: AdapterConfig
  ) {
    if (Array.isArray(options)) {
      this.#variables = resolveVariables(options);
    } else {
      this.#variables = options.variables;
      this.#fields = options.fields;
      this.#operation = options.operation;
    }

    this.#config = {
      operationName: "",
      ...configuration,
    };
  }

  /** Builds the document for the single operation passed to the constructor. */
  public subscriptionBuilder(): OperationResult {
    return this.#operationWrapperTemplate(
      this.#variables,
      this.#operationTemplate()
    );
  }

  /** Builds one document combining several subscription operations. */
  public subscriptionsBuilder(
    subscriptions: QueryBuilderOptions[]
  ): OperationResult {
    const content = subscriptions.map((opts) => {
      this.#operation = opts.operation;
      this.#variables = opts.variables;
      this.#fields = opts.fields;
      return this.#operationTemplate();
    });
    return this.#operationWrapperTemplate(
      resolveVariables(subscriptions),
      content.join("\n  ")
    );
  }

  // Convert object to argument and type map. eg: ($id: Int)
  #queryDataArgumentAndTypeMap(variables: any): string {
    return variables && Object.keys(variables).length
      ? `(${Object.keys(variables).reduce(
          (dataString, key, i) =>
            `${dataString}${
              i !== 0 ? ", " : ""
            }$${key}: ${queryDataTypeAndDefault(variables[key])}`,
          ""
        )})`
      : "";
  }

  #operationWrapperTemplate(variables: any, content: string): OperationResult {
    let query = `subscription ${this.#queryDataArgumentAndTypeMap(variables)} {
  ${content}
}`;

    if (this.#config.operationName) {
      query = query.replace(
        "subscription",
        `subscription ${this.#config.operationName}`
      );
    }

    return {
      query,
      variables: queryVariablesMap(variables),
    };
  }

  #operationTemplate(): string {
    const operationName =
      typeof this.#operation === "string"
        ? this.#operation
        : `${this.#operation.alias}: ${this.#operation.name}`;

    return `${operationName} ${
      this.#variables ? queryDataNameAndArgumentMap(this.#variables) : ""
    } {
    ${queryFieldsMap(this.#fields)}
  }`;
  }
}
