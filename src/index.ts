import DefaultMutationAdapter from "./adapters/DefaultMutationAdapter";
import DefaultQueryAdapter from "./adapters/DefaultQueryAdapter";
import IMutationAdapter from "./adapters/IMutationAdapter";
import IQueryAdapter from "./adapters/IQueryAdapter";
import IQueryBuilderOptions from "./IQueryBuilderOptions";

function queryOperation(
  options: IQueryBuilderOptions | IQueryBuilderOptions[],
  adapter?: any
) {
  if (Array.isArray(options)) {
    if (adapter) {
      return adapter.queriesBuilder(options);
    } else {
      const adapt: IQueryAdapter = new DefaultQueryAdapter(options);
      return adapt.queriesBuilder(options);
    }
  }
  if (adapter) {
    // @ts-ignore
    const adapt: IQueryAdapter = new adapter(options);
    return adapt.queryBuilder();
  } else {
    const adapt: IQueryAdapter = new DefaultQueryAdapter(options);
    return adapt.queryBuilder();
  }
}

function mutationOperation(
  options: IQueryBuilderOptions | IQueryBuilderOptions[],
  adapter?: any
) {
  if (Array.isArray(options)) {
    if (adapter) {
      return adapter.mutationsBuilder(options);
    } else {
      const adapt: IMutationAdapter = new DefaultMutationAdapter(options);
      return adapt.mutationsBuilder(options);
    }
  }
  if (adapter) {
    // @ts-ignore
    const adapt: IMutationAdapter = new adapter(options);
    return adapt.mutationBuilder();
  } else {
    const adapt: IMutationAdapter = new DefaultMutationAdapter(options);
    return adapt.mutationBuilder();
  }
}

export { mutationOperation as mutation, queryOperation as query };
