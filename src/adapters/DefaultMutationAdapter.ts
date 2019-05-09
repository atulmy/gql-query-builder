import Fields from "../Fields";
import IQueryBuilderOptions from "../IQueryBuilderOptions";
import OperationType from "../OperationType";
import Utils from "../Utils";
import IMutationAdapter from "./IMutationAdapter";

export default class DefaultMutationAdapter implements IMutationAdapter {
  private readonly variables: any | undefined;
  private readonly fields: Fields | undefined;
  private readonly operation: string;

  constructor(options: IQueryBuilderOptions | IQueryBuilderOptions[]) {
    if (Array.isArray(options)) {
      this.variables = Utils.resolveVariables(options);
      this.operation = OperationType.Query;
    } else {
      this.variables = options.variables;
      this.fields = options.fields;
      this.operation = OperationType.Query;
    }
  }

  public mutationBuilder() {
    return this.operationWrapperTemplate(
      OperationType.Mutation,
      this.variables,
      this.operationTemplate()
    );
  }

  public mutationsBuilder(mutations: IQueryBuilderOptions[]) {
    return this.operationWrapperTemplate(
      OperationType.Mutation,
      Utils.resolveVariables(mutations),
      mutations.map(this.operationTemplate).join("\n  ")
    );
  }

  // start of mutation building
  private operationWrapperTemplate(
    type: OperationType,
    variables: any,
    content: string
  ) {
    return {
      query: `${type} ${queryDataArgumentAndTypeMap(variables)} {
  ${content}
}`,
      variables: queryVariablesMap(variables)
    };
  }

  private operationTemplate() {
    return `${this.operation} ${this.queryDataNameAndArgumentMap()} {
    ${this.queryFieldsMap(this.fields)}
  }`;
  }

  // Fields selection map. eg: { id, name }
  private queryFieldsMap(fields?: Fields): string {
    return fields
      ? fields
          .map(field =>
            typeof field === "object"
              ? `${Object.keys(field)[0]} { ${this.queryFieldsMap(
                  Object.values(field)[0]
                )} }`
              : `${field}`
          )
          .join(", ")
      : "";
  }
}
