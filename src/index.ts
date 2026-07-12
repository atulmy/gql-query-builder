import adapters from "./adapters";
import DefaultMutationAdapter from "./adapters/DefaultMutationAdapter";
import DefaultQueryAdapter from "./adapters/DefaultQueryAdapter";
import DefaultSubscriptionAdapter from "./adapters/DefaultSubscriptionAdapter";
import type IMutationAdapter from "./adapters/IMutationAdapter";
import type IQueryAdapter from "./adapters/IQueryAdapter";
import type ISubscriptionAdapter from "./adapters/ISubscriptionAdapter";
import type IQueryBuilderOptions from "./IQueryBuilderOptions";

/** Constructor of a custom query adapter, e.g. `class MyAdapter implements IQueryAdapter`. */
export type QueryAdapterConstructor = new (
  options: IQueryBuilderOptions | IQueryBuilderOptions[],
  config?: any
) => IQueryAdapter;

/** Constructor of a custom mutation adapter, e.g. `class MyAdapter implements IMutationAdapter`. */
export type MutationAdapterConstructor = new (
  options: IQueryBuilderOptions | IQueryBuilderOptions[],
  config?: any
) => IMutationAdapter;

/** Constructor of a custom subscription adapter, e.g. `class MyAdapter implements ISubscriptionAdapter`. */
export type SubscriptionAdapterConstructor = new (
  options: IQueryBuilderOptions | IQueryBuilderOptions[]
) => ISubscriptionAdapter;

/**
 * Builds a GraphQL query string plus its variables object.
 *
 * @param options - A single operation or an array of operations to combine into one query.
 * @param adapter - Optional custom adapter class controlling how the query string is generated.
 * @param config - Optional adapter configuration (e.g. `{ operationName: "..." }`).
 * @returns `{ query, variables }` ready to send to a GraphQL server.
 *
 * @example
 * query({ operation: "thoughts", fields: ["id", "name"] })
 * // => { query: "query { thoughts { id, name } }", variables: {} }
 */
function queryOperation(
  options: IQueryBuilderOptions | IQueryBuilderOptions[],
  adapter?: QueryAdapterConstructor | null,
  config?: any
) {
  const AdapterClass = adapter ?? DefaultQueryAdapter;
  const queryAdapter: IQueryAdapter = new AdapterClass(options, config);
  return Array.isArray(options)
    ? queryAdapter.queriesBuilder(options)
    : queryAdapter.queryBuilder();
}

/**
 * Builds a GraphQL mutation string plus its variables object.
 *
 * @param options - A single operation or an array of operations to combine into one mutation.
 * @param adapter - Optional custom adapter class controlling how the mutation string is generated.
 * @param config - Optional adapter configuration (e.g. `{ operationName: "..." }`).
 * @returns `{ query, variables }` ready to send to a GraphQL server.
 *
 * @example
 * mutation({ operation: "thoughtCreate", variables: { name: "Tyrion" }, fields: ["id"] })
 */
function mutationOperation(
  options: IQueryBuilderOptions | IQueryBuilderOptions[],
  adapter?: MutationAdapterConstructor | null,
  config?: any
) {
  const AdapterClass = adapter ?? DefaultMutationAdapter;
  const mutationAdapter: IMutationAdapter = new AdapterClass(options, config);
  return Array.isArray(options)
    ? mutationAdapter.mutationsBuilder(options)
    : mutationAdapter.mutationBuilder();
}

/**
 * Builds a GraphQL subscription string plus its variables object.
 *
 * @param options - A single operation or an array of operations to combine into one subscription.
 * @param adapter - Optional custom adapter class controlling how the subscription string is generated.
 * @returns `{ query, variables }` ready to send to a GraphQL server.
 *
 * @example
 * subscription({ operation: "thoughtCreated", fields: ["id"] })
 */
function subscriptionOperation(
  options: IQueryBuilderOptions | IQueryBuilderOptions[],
  adapter?: SubscriptionAdapterConstructor | null
) {
  const AdapterClass = adapter ?? DefaultSubscriptionAdapter;
  const subscriptionAdapter: ISubscriptionAdapter = new AdapterClass(options);
  return Array.isArray(options)
    ? subscriptionAdapter.subscriptionsBuilder(options)
    : subscriptionAdapter.subscriptionBuilder();
}

export {
  adapters,
  mutationOperation as mutation,
  queryOperation as query,
  subscriptionOperation as subscription,
};
