/**
 * Default adapter for `mutation()`. Renders one or more mutation operations into
 * a single GraphQL document. Pass your own class implementing {@link MutationAdapter}
 * as the second argument of `mutation()` to customize the output.
 */
import type {
  AdapterConfig,
  Fields,
  Operation,
  OperationResult,
  QueryBuilderOptions,
} from "../types";
import {
  getNestedVariables,
  queryDataNameAndArgumentMap,
  queryDataTypeAndDefault,
  queryFieldsMap,
  queryVariablesMap,
  resolveVariables,
} from "../utils";
import type { MutationAdapter } from "./types";

export class DefaultMutationAdapter implements MutationAdapter {
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
  public mutationBuilder(): OperationResult {
    return this.#operationWrapperTemplate(
      this.#variables,
      this.#operationTemplate(this.#operation)
    );
  }

  /** Builds one document combining several mutation operations. */
  public mutationsBuilder(mutations: QueryBuilderOptions[]): OperationResult {
    const content = mutations.map((opts) => {
      this.#operation = opts.operation;
      this.#variables = opts.variables;
      this.#fields = opts.fields;
      return this.#operationTemplate(opts.operation);
    });
    return this.#operationWrapperTemplate(
      resolveVariables(mutations),
      content.join("\n  ")
    );
  }

  // Convert object to argument and type map. eg: ($id: Int)
  #queryDataArgumentAndTypeMap(variablesUsed: any): string {
    if (this.#fields && typeof this.#fields === "object") {
      variablesUsed = {
        ...getNestedVariables(this.#fields),
        ...variablesUsed,
      };
    }
    return variablesUsed && Object.keys(variablesUsed).length > 0
      ? `(${Object.keys(variablesUsed).reduce(
          (dataString, key, i) =>
            `${dataString}${
              i !== 0 ? ", " : ""
            }$${key}: ${queryDataTypeAndDefault(variablesUsed[key])}`,
          ""
        )})`
      : "";
  }

  #operationWrapperTemplate(variables: any, content: string): OperationResult {
    let query = `mutation ${this.#queryDataArgumentAndTypeMap(variables)} {
  ${content}
}`;

    if (this.#config.operationName) {
      query = query.replace(
        "mutation",
        `mutation ${this.#config.operationName}`
      );
    }

    return {
      query,
      variables: queryVariablesMap(variables, this.#fields),
    };
  }

  #operationTemplate(operation: string | Operation): string {
    const operationName =
      typeof operation === "string"
        ? operation
        : `${operation.alias}: ${operation.name}`;

    return `${operationName} ${queryDataNameAndArgumentMap(this.#variables)} ${
      this.#fields && this.#fields.length > 0
        ? `{
    ${queryFieldsMap(this.#fields)}
  }`
        : ""
    }`;
  }
}
