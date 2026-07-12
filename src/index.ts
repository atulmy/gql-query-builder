/**
 * gql-query-builder — generates GraphQL query/mutation/subscription strings
 * (plus a matching variables object) from plain JavaScript objects.
 */
import { DefaultMutationAdapter } from "./adapters/default-mutation-adapter";
import { DefaultQueryAdapter } from "./adapters/default-query-adapter";
import { DefaultSubscriptionAdapter } from "./adapters/default-subscription-adapter";
import type {
  MutationAdapterConstructor,
  QueryAdapterConstructor,
  SubscriptionAdapterConstructor,
} from "./adapters/types";
import type {
  AdapterConfig,
  OperationResult,
  QueryBuilderOptions,
} from "./types";

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
export function query(
  options: QueryBuilderOptions | QueryBuilderOptions[],
  adapter?: QueryAdapterConstructor | null,
  config?: AdapterConfig
): OperationResult {
  const AdapterClass = adapter ?? DefaultQueryAdapter;
  const queryAdapter = new AdapterClass(options, config);
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
export function mutation(
  options: QueryBuilderOptions | QueryBuilderOptions[],
  adapter?: MutationAdapterConstructor | null,
  config?: AdapterConfig
): OperationResult {
  const AdapterClass = adapter ?? DefaultMutationAdapter;
  const mutationAdapter = new AdapterClass(options, config);
  return Array.isArray(options)
    ? mutationAdapter.mutationsBuilder(options)
    : mutationAdapter.mutationBuilder();
}

/**
 * Builds a GraphQL subscription string plus its variables object.
 *
 * @param options - A single operation or an array of operations to combine into one subscription.
 * @param adapter - Optional custom adapter class controlling how the subscription string is generated.
 * @param config - Optional adapter configuration (e.g. `{ operationName: "..." }`).
 * @returns `{ query, variables }` ready to send to a GraphQL server.
 *
 * @example
 * subscription({ operation: "thoughtCreated", fields: ["id"] })
 */
export function subscription(
  options: QueryBuilderOptions | QueryBuilderOptions[],
  adapter?: SubscriptionAdapterConstructor | null,
  config?: AdapterConfig
): OperationResult {
  const AdapterClass = adapter ?? DefaultSubscriptionAdapter;
  const subscriptionAdapter = new AdapterClass(options, config);
  return Array.isArray(options)
    ? subscriptionAdapter.subscriptionsBuilder(options)
    : subscriptionAdapter.subscriptionBuilder();
}

export {
  adapters,
  DefaultAppSyncMutationAdapter,
  DefaultAppSyncQueryAdapter,
  DefaultMutationAdapter,
  DefaultQueryAdapter,
  DefaultSubscriptionAdapter,
} from "./adapters";
export type {
  IMutationAdapter,
  IQueryAdapter,
  ISubscriptionAdapter,
  MutationAdapter,
  MutationAdapterConstructor,
  QueryAdapter,
  QueryAdapterConstructor,
  SubscriptionAdapter,
  SubscriptionAdapterConstructor,
} from "./adapters/types";
export type {
  AdapterConfig,
  Fields,
  FragmentDefinition,
  IOperation,
  IQueryBuilderOptions,
  NestedField,
  Operation,
  OperationResult,
  OperationType,
  QueryBuilderOptions,
  VariableOptions,
} from "./types";
export { isNestedField } from "./types";
export { GraphQLRaw, rawGraphQL, toGraphQLLiteral } from "./utils";
