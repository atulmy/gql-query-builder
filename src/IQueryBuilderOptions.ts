/*
@interface IQueryBuilderOptions
@desc defines public methods for building a full mutation template
 */
import Fields from "./Fields";

interface IQueryBuilderOptions {
  operation: string /* Operation name */;
  fields?: Fields /* Selection of fields to be returned by the operation */;
  variables?: any /* Any variables for the operation */;
}

export default IQueryBuilderOptions;
