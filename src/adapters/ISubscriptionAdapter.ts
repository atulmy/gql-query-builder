/*
@interface IMutationAdapter
@desc defines public methods for building a full subscription template
 */
import type IQueryBuilderOptions from "../IQueryBuilderOptions";

export default interface IMutationAdapter {
  subscriptionBuilder: () => { variables: any; query: string };
  subscriptionsBuilder: (options: IQueryBuilderOptions[]) => {
    variables: any;
    query: string;
  };
}
