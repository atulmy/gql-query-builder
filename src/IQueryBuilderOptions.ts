/*
@interface IQueryBuilderOptions
@desc defines public methods for building a full mutation template
 */
import type Fields from "./Fields";
import type VariableOptions from "./VariableOptions";

/** An aliased operation: `alias: name` in the generated document. */
export interface IOperation {
  /** Name of the GraphQL operation (field on the root type). */
  name: string;
  /** Alias under which the result is returned. */
  alias: string;
}

/** Describes one GraphQL operation to generate. */
interface IQueryBuilderOptions {
  /** Operation name, or `{ name, alias }` to alias it. */
  operation: string | IOperation;
  /** Selection of fields returned by the operation. Strings, nested objects, or fragments. */
  fields?: Fields;
  /** Operation variables: plain values or `{ value, type, required, list, name }` descriptors. */
  variables?: VariableOptions;
}

export default IQueryBuilderOptions;
