/*
@interface IQueryAdapter
@desc defines public methods for building a full query template
 */
import type IQueryBuilderOptions from "../IQueryBuilderOptions";

export default interface IQueryAdapter {
  queryBuilder: () => { variables: any; query: string };
  queriesBuilder: (options: IQueryBuilderOptions[]) => {
    variables: any;
    query: string;
  };
}
