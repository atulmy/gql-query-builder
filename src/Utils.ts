import Fields from "./Fields";
import IQueryBuilderOptions from "./IQueryBuilderOptions";

export default class Utils {
  public static resolveVariables(operations: IQueryBuilderOptions[]): any {
    let ret: any = {};

    for (const { variables } of operations) {
      ret = { ...ret, ...variables };
    }

    return ret;
  }

  public static queryFieldsMap(fields?: Fields): string {
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
