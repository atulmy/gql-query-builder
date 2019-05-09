import IQueryBuilderOptions from "../IQueryBuilderOptions";

export default interface IQueryAdapter {
  queryBuilder: () => { variables: any; query: string };
  queriesBuilder: (
    options: IQueryBuilderOptions[]
  ) => { variables: any; query: string };
}
