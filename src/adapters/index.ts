import { DefaultAppSyncMutationAdapter } from "./app-sync-mutation-adapter";
import { DefaultAppSyncQueryAdapter } from "./app-sync-query-adapter";

export { DefaultAppSyncMutationAdapter } from "./app-sync-mutation-adapter";
export { DefaultAppSyncQueryAdapter } from "./app-sync-query-adapter";
export { DefaultMutationAdapter } from "./default-mutation-adapter";
export { DefaultQueryAdapter } from "./default-query-adapter";
export { DefaultSubscriptionAdapter } from "./default-subscription-adapter";
export type {
  MutationAdapter,
  MutationAdapterConstructor,
  QueryAdapter,
  QueryAdapterConstructor,
  SubscriptionAdapter,
  SubscriptionAdapterConstructor,
} from "./types";

/** Bundled non-default adapters, e.g. `query(options, adapters.DefaultAppSyncQueryAdapter)`. */
export const adapters = {
  DefaultAppSyncQueryAdapter,
  DefaultAppSyncMutationAdapter,
};
