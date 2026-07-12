/**
 * Default adapter for `query()`. Renders one or more query operations into a
 * single GraphQL document. Pass your own class implementing {@link QueryAdapter}
 * as the second argument of `query()` to customize the output.
 */
import type {
  AdapterConfig,
  Fields,
  Operation,
  OperationResult,
  QueryBuilderOptions,
  VariableOptions,
} from "../types";
import {
  getNestedVariables,
  queryDataNameAndArgumentMap,
  queryDataType,
  queryFieldsMap,
  queryVariablesMap,
  resolveVariables,
} from "../utils";
import type { QueryAdapter } from "./types";

export class DefaultQueryAdapter implements QueryAdapter {
  #variables: any;
  #fields: Fields | undefined;
  #operation!: string | Operation;
  readonly #config: AdapterConfig;

  constructor(
    options: QueryBuilderOptions | QueryBuilderOptions[],
    configuration?: AdapterConfig
  ) {
    this.#config = {
      operationName: "",
      ...configuration,
    };

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
    return this.#operationWrapperTemplate(
      this.#operationTemplate(this.#variables)
    );
  }

  /** Builds one document combining several query operations. */
  public queriesBuilder(queries: QueryBuilderOptions[]): OperationResult {
    const content = queries
      .filter(Boolean)
      .map((query) => {
        this.#operation = query.operation;
        this.#fields = query.fields;
        return this.#operationTemplate(query.variables);
      })
      .join(" ");
    return this.#operationWrapperTemplate(content);
  }

  // Convert object to argument and type map. eg: ($id: Int)
  #queryDataArgumentAndTypeMap(): string {
    let variablesUsed: Record<string, unknown> = this.#variables;

    if (this.#fields && typeof this.#fields === "object") {
      variablesUsed = {
        ...getNestedVariables(this.#fields),
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

  #operationWrapperTemplate(content: string): OperationResult {
    let query = `query ${this.#queryDataArgumentAndTypeMap()} { ${content} }`;
    query = query.replace(
      "query",
      `query${
        this.#config.operationName !== ""
          ? ` ${this.#config.operationName}`
          : ""
      }`
    );
    return {
      query,
      variables: queryVariablesMap(this.#variables, this.#fields),
    };
  }

  #operationTemplate(variables: VariableOptions | undefined): string {
    const operation =
      typeof this.#operation === "string"
        ? this.#operation
        : `${this.#operation.alias}: ${this.#operation.name}`;

    return `${operation} ${
      variables ? queryDataNameAndArgumentMap(variables) : ""
    } ${
      this.#fields && this.#fields.length > 0
        ? `{ ${queryFieldsMap(this.#fields)} }`
        : ""
    }`;
  }
}
