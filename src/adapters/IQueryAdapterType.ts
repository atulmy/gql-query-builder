import IQueryBuilderOptions from "../IQueryBuilderOptions";

type IQueryAdapterType = (options: IQueryBuilderOptions) => string;

export default IQueryAdapterType;
