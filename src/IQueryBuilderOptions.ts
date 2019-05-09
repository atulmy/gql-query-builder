import IQueryAdapterType from "./adapters/IQueryAdapterType";
import Fields from "./Fields";

interface IQueryBuilderOptions {
  adapter?: IQueryAdapterType /* Adapter to define query/mutation output */;
  operation: string /* Operation name */;
  fields?: Fields /* Selection of fields to be returned by the operation */;
  variables?: any /* Any variables for the operation */;
}

export default IQueryBuilderOptions;
