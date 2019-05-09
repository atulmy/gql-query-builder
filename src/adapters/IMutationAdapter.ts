import IQueryBuilderOptions from "../IQueryBuilderOptions";

export default interface IMutationAdapter {
  mutationBuilder: () => { variables: any; query: string };
  mutationsBuilder: (
    options: IQueryBuilderOptions[]
  ) => { variables: any; query: string };
}
