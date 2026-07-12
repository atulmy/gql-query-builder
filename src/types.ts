/**
 * Public option and result types for gql-query-builder.
 */

/** GraphQL operation keyword used at the start of a generated document. */
export type OperationType = "query" | "mutation" | "subscription";

/** An aliased operation, rendered as `alias: name` in the generated document. */
export interface Operation {
  /** Name of the GraphQL operation (field on the root type). */
  name: string;
  /** Alias under which the result is returned. */
  alias: string;
}

/**
 * Selection set of an operation.
 *
 * @example ["id", "name"]
 * @example ["id", { user: ["id", "email"] }]
 * @example ["id", { operation: "FragmentType", fields: ["emotion"], fragment: true }]
 */
export type Fields = Array<string | object | NestedField>;

/** A nested operation (sub-selection with its own variables) or an inline fragment. */
export type NestedField = {
  operation: string;
  variables: QueryBuilderOptions[];
  fields: Fields;
  fragment?: boolean | null;
};

/**
 * Variables of an operation: plain values (`{ id: 1 }`, type inferred) or
 * descriptor objects controlling the emitted variable definition.
 */
export type VariableOptions =
  | {
      /** GraphQL type name, e.g. `"ID"` or `"PhoneNumber"`. Inferred from the value when omitted. */
      type?: string;
      /** Argument name when it differs from the variable key, e.g. `(id: $id2)`. */
      name?: string;
      value: any;
      /** `true` emits `[T]`; `[true]` emits `[T!]`. */
      list?: boolean | [boolean];
      /** Appends `!` to the emitted type. */
      required?: boolean;
      /**
       * Default value emitted in the variable definition, e.g. `$episode: Episode = JEDI`.
       * Serialized as a GraphQL literal; wrap enum names with `rawGraphQL()`.
       */
      default?: unknown;
    }
  | Record<string, any>;

/** Describes one GraphQL operation to generate. */
export interface QueryBuilderOptions {
  /** Operation name, or `{ name, alias }` to alias it. */
  operation: string | Operation;
  /** Selection of fields returned by the operation. */
  fields?: Fields;
  /** Operation variables: plain values or descriptor objects. */
  variables?: VariableOptions;
}

/** The generated GraphQL document and its variables object. */
export interface OperationResult {
  query: string;
  variables: Record<string, unknown>;
}

/**
 * A named fragment definition, appended to the generated document.
 * Spread it in a selection with a plain `"...name"` field string.
 *
 * @example
 * query(
 *   { operation: "hero", fields: ["...heroFields"] },
 *   null,
 *   { fragments: [{ name: "heroFields", on: "Character", fields: ["name"] }] }
 * )
 * // => query  { hero  { ...heroFields } }
 * //
 * //    fragment heroFields on Character { name }
 */
export interface FragmentDefinition {
  /** Fragment name, referenced by `"...name"` spreads. */
  name: string;
  /** Type condition: the type the fragment applies to. */
  on: string;
  /** Selection set of the fragment. */
  fields: Fields;
}

/** Configuration accepted by the default adapters. */
export interface AdapterConfig {
  /** Named operation added after the operation keyword, e.g. `query MyOperation { ... }`. */
  operationName?: string;
  /** Named fragment definitions appended to the generated document. */
  fragments?: FragmentDefinition[];
  [key: string]: unknown;
}

/** @deprecated Use {@link QueryBuilderOptions} instead. */
export type IQueryBuilderOptions = QueryBuilderOptions;
/** @deprecated Use {@link Operation} instead. */
export type IOperation = Operation;

/** Narrows a field entry to a {@link NestedField} (nested operation or inline fragment). */
export function isNestedField(value: unknown): value is NestedField {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  return (
    (Object.hasOwn(value, "operation") &&
      Object.hasOwn(value, "variables") &&
      Object.hasOwn(value, "fields")) ||
    (Object.hasOwn(value, "operation") &&
      Object.hasOwn(value, "fragment") &&
      Object.hasOwn(value, "fields"))
  );
}
