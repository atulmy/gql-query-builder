/**
 * Adapter contracts. An adapter is a class constructed with the builder options
 * (and optionally a config object) that renders the final GraphQL document.
 * Pass a custom adapter class as the second argument of `query`/`mutation`/`subscription`.
 */
import type {
  AdapterConfig,
  OperationResult,
  QueryBuilderOptions,
} from "../types";

/** Contract for query adapters. */
export interface QueryAdapter {
  /** Builds a document for the single operation the adapter was constructed with. */
  queryBuilder(): OperationResult;
  /** Builds one document combining several operations. */
  queriesBuilder(options: QueryBuilderOptions[]): OperationResult;
}

/** Contract for mutation adapters. */
export interface MutationAdapter {
  mutationBuilder(): OperationResult;
  mutationsBuilder(options: QueryBuilderOptions[]): OperationResult;
}

/** Contract for subscription adapters. */
export interface SubscriptionAdapter {
  subscriptionBuilder(): OperationResult;
  subscriptionsBuilder(options: QueryBuilderOptions[]): OperationResult;
}

/** Constructor of a custom query adapter class. */
export type QueryAdapterConstructor = new (
  options: QueryBuilderOptions | QueryBuilderOptions[],
  config?: AdapterConfig
) => QueryAdapter;

/** Constructor of a custom mutation adapter class. */
export type MutationAdapterConstructor = new (
  options: QueryBuilderOptions | QueryBuilderOptions[],
  config?: AdapterConfig
) => MutationAdapter;

/** Constructor of a custom subscription adapter class. */
export type SubscriptionAdapterConstructor = new (
  options: QueryBuilderOptions | QueryBuilderOptions[]
) => SubscriptionAdapter;

/** @deprecated Use {@link QueryAdapter} instead. */
export type IQueryAdapter = QueryAdapter;
/** @deprecated Use {@link MutationAdapter} instead. */
export type IMutationAdapter = MutationAdapter;
/** @deprecated Use {@link SubscriptionAdapter} instead. */
export type ISubscriptionAdapter = SubscriptionAdapter;
