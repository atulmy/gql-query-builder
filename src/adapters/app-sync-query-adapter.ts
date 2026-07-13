/**
 * AWS AppSync flavored query adapter. Wraps the selection in `nodes { ... }`
 * and names the operation after the capitalized root field.
 * Use via `query(options, adapters.DefaultAppSyncQueryAdapter)`.
 */
import type {
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
import type { QueryAdapter } from "./types";

export class DefaultAppSyncQueryAdapter implements QueryAdapter {
  #variables: any;
  #fields: Fields | undefined;
  #operation!: string | Operation;

  constructor(options: QueryBuilderOptions | QueryBuilderOptions[]) {
    if (Array.isArray(options)) {
      this.#variables = resolveVariables(options);
    } else {
      this.#variables = options.variables;
      this.#fields = options.fields || [];
      this.#operation = options.operation;
    }
  }

  /** Builds the document for the single operation passed to the constructor. */
  public queryBuilder(): OperationResult {
    return this.#operationWrapperTemplate(this.#operationTemplate());
  }

  /** Builds one document combining several query operations. */
  public queriesBuilder(queries: QueryBuilderOptions[]): OperationResult {
    const present = queries.filter(Boolean);
    const content = present
      .map((query) => {
        this.#operation = query.operation;
        this.#fields = query.fields;
        this.#variables = query.variables;
        return this.#operationTemplate();
      })
      .join(" ");
    // Declarations and the variables map must cover every operation, not just
    // the last one iterated above.
    this.#variables = resolveVariables(present);
    return this.#operationWrapperTemplate(content);
  }

  // Convert object to argument and type map. eg: ($id: Int)
  #queryDataArgumentAndTypeMap(): string {
    return this.#variables && Object.keys(this.#variables).length
      ? `(${Object.keys(this.#variables).reduce(
          (dataString, key, i) =>
            `${dataString}${
              i !== 0 ? ", " : ""
            }$${key}: ${queryDataTypeAndDefault(this.#variables[key])}`,
          ""
        )})`
      : "";
  }

  #operationWrapperTemplate(content: string): OperationResult {
    const operation =
      typeof this.#operation === "string"
        ? this.#operation
        : this.#operation.name;

    return {
      query: `query ${operation.charAt(0).toUpperCase()}${operation.slice(
        1
      )} ${this.#queryDataArgumentAndTypeMap()} { ${content} }`,
      variables: queryVariablesMap(this.#variables),
    };
  }

  #operationTemplate(): string {
    const operation =
      typeof this.#operation === "string"
        ? this.#operation
        : `${this.#operation.alias}: ${this.#operation.name}`;

    return `${operation} ${
      this.#variables ? queryDataNameAndArgumentMap(this.#variables) : ""
    } { nodes { ${queryFieldsMap(this.#fields)} } }`;
  }
}
