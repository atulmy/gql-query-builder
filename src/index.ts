import adapters from "./adapters";
import DefaultMutationAdapter from "./adapters/DefaultMutationAdapter";
import DefaultQueryAdapter from "./adapters/DefaultQueryAdapter";
import DefaultSubscriptionAdapter from "./adapters/DefaultSubscriptionAdapter";
import IMutationAdapter from "./adapters/IMutationAdapter";
import IQueryAdapter from "./adapters/IQueryAdapter";
import ISubscriptionAdapter from "./adapters/ISubscriptionAdapter";
import IQueryBuilderOptions from "./IQueryBuilderOptions";

function queryOperation(
  options: IQueryBuilderOptions | IQueryBuilderOptions[],
  adapter?: any
) {
  let defaultAdapter: IQueryAdapter;
  if (Array.isArray(options)) {
    if (adapter) {
      const customAdapter: IQueryAdapter = new adapter(options);
      return customAdapter.queriesBuilder(options);
    }
    defaultAdapter = new DefaultQueryAdapter(options);
    return defaultAdapter.queriesBuilder(options);
  }
  if (adapter) {
    const customAdapter: IQueryAdapter = new adapter(options);
    return customAdapter.queryBuilder();
  }
  defaultAdapter = new DefaultQueryAdapter(options);
  return defaultAdapter.queryBuilder();
}

function mutationOperation(
  options: IQueryBuilderOptions | IQueryBuilderOptions[],
  adapter?: IMutationAdapter
) {
  let customAdapter: IMutationAdapter;
  let defaultAdapter: IMutationAdapter;
  if (Array.isArray(options)) {
    if (adapter) {
      // @ts-ignore
      customAdapter = new adapter(options);
      return customAdapter.mutationsBuilder(options);
    }
    defaultAdapter = new DefaultMutationAdapter(options);
    return defaultAdapter.mutationsBuilder(options);
  }
  if (adapter) {
    // @ts-ignore
    customAdapter = new adapter(options);
    return customAdapter.mutationBuilder();
  }
  defaultAdapter = new DefaultMutationAdapter(options);
  return defaultAdapter.mutationBuilder();
}

function subscriptionOperation(
  options: IQueryBuilderOptions | IQueryBuilderOptions[],
  adapter?: ISubscriptionAdapter
) {
  let customAdapter: ISubscriptionAdapter;
  let defaultAdapter: ISubscriptionAdapter;
  if (Array.isArray(options)) {
    if (adapter) {
      // @ts-ignore
      customAdapter = new adapter(options);
      return customAdapter.subscriptionsBuilder(options);
    }
    defaultAdapter = new DefaultSubscriptionAdapter(options);
    return defaultAdapter.subscriptionsBuilder(options);
  }
  if (adapter) {
    // @ts-ignore
    customAdapter = new adapter(options);
    return customAdapter.subscriptionBuilder();
  }
  defaultAdapter = new DefaultSubscriptionAdapter(options);
  return defaultAdapter.subscriptionBuilder();
}

export {
  subscriptionOperation as subscription,
  mutationOperation as mutation,
  queryOperation as query,
  adapters
};
