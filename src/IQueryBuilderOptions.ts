/*
@interface IQueryBuilderOptions
@desc defines public methods for building a full mutation template
 */
import Fields from "./Fields";
import VariableOptions from "./VariableOptions";

interface IQueryBuilderOptions {
  operation: string /* Operation name */;
  fields?: Fields /* Selection of fields to be returned by the operation */;
  variables?: VariableOptions;
  /* VariableOptions Interface or regular single key object */
}

export default IQueryBuilderOptions;
