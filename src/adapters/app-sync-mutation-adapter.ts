/**
 * AWS AppSync flavored mutation adapter. Names the operation after the
 * capitalized root field. Use via
 * `mutation(options, adapters.DefaultAppSyncMutationAdapter)`.
 */
import type {
  Fields,
  Operation,
  OperationResult,
  QueryBuilderOptions,
} from "../types";
import { queryDataType, queryVariablesMap, resolveVariables } from "../utils";
import type { MutationAdapter } from "./types";

export class DefaultAppSyncMutationAdapter implements MutationAdapter {
  #variables: any;
  #fields: Fields | undefined;
  #operation!: string | Operation;

  constructor(options: QueryBuilderOptions | QueryBuilderOptions[]) {
    if (Array.isArray(options)) {
      this.#variables = resolveVariables(options);
    } else {
      this.#variables = options.variables;
      this.#fields = options.fields;
      this.#operation = options.operation;
    }
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

  // Convert object to name and argument map. eg: (id: $id)
  #queryDataNameAndArgumentMap(): string {
    return this.#variables && Object.keys(this.#variables).length
      ? `(${Object.keys(this.#variables).reduce(
          (dataString, key, i) =>
            `${dataString}${i !== 0 ? ", " : ""}${key}: $${key}`,
          ""
        )})`
      : "";
  }

  // Convert object to argument and type map. eg: ($id: Int)
  #queryDataArgumentAndTypeMap(variables: any): string {
    return Object.keys(variables).length
      ? `(${Object.keys(variables).reduce(
          (dataString, key, i) =>
            `${dataString}${i !== 0 ? ", " : ""}$${key}: ${queryDataType(
              variables[key]
            )}`,
          ""
        )})`
      : "";
  }

  #operationWrapperTemplate(variables: any, content: string): OperationResult {
    const operation =
      typeof this.#operation === "string"
        ? this.#operation
        : this.#operation.name;

    return {
      query: `mutation ${
        operation.charAt(0).toUpperCase() + operation.slice(1)
      } ${this.#queryDataArgumentAndTypeMap(variables)} {
  ${content}
}`,
      variables: queryVariablesMap(variables),
    };
  }

  #operationTemplate(operation: string | Operation): string {
    const operationName =
      typeof operation === "string"
        ? operation
        : `${operation.alias}: ${operation.name}`;

    return `${operationName} ${this.#queryDataNameAndArgumentMap()} {
    ${this.#queryFieldsMap(this.#fields)}
  }`;
  }

  // Fields selection map. eg: { id, name }
  #queryFieldsMap(fields?: Fields): string {
    return Array.isArray(fields)
      ? fields
          .map((field) =>
            typeof field === "object"
              ? `${Object.keys(field)[0]} { ${this.#queryFieldsMap(
                  Object.values(field)[0]
                )} }`
              : `${field}`
          )
          .join(", ")
      : "";
  }
}
