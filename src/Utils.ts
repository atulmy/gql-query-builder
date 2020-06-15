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

  public static createVariableString(variables: IQueryBuilderOptions[]) {
    return Object.keys(variables).length
      ? `(${Object.keys(variables).reduce(
          (dataString, key, i) =>
            `${dataString}${i !== 0 ? ", " : ""}${key}: $${key}`,
          ""
        )})`
      : "";
  }

  public static queryFieldsMap(fields?: Fields): string {
    return fields
      ? fields
          .map((field) =>
            typeof field === "object"
              ? field.hasOwnProperty("operation")
                ? `${
                    (field as { operation: String }).operation
                  } ${this.createVariableString(
                    (field as { variables: IQueryBuilderOptions[] }).variables
                  )} { ${this.queryFieldsMap(
                    (field as { fields: Fields }).fields
                  )} }`
                : `${Object.keys(field)[0]} { ${this.queryFieldsMap(
                    Object.values(field)[0]
                  )} }`
              : `${field}`
          )
          .join(", ")
      : "";
  }

  // Variables map. eg: { "id": 1, "name": "Jon Doe" }
  public static queryVariablesMap(variables: any, fields?: any) {
    let variablesMapped: { [key: string]: unknown } = {};
    if (variables) {
      Object.keys(variables).map((key) => {
        variablesMapped[key] =
          typeof variables[key] === "object"
            ? variables[key].value
            : variables[key];
      });
    }
    fields?.forEach((field: any) => {
      if ((field as { variables: IQueryBuilderOptions[] }).variables) {
        variablesMapped = {
          ...(field as { variables: IQueryBuilderOptions[] }).variables,
          ...variablesMapped,
        };
      }
    });
    return variablesMapped;
  }

  public static queryDataType(variable: any) {
    let type = "String";

    const value = typeof variable === "object" ? variable.value : variable;

    if (variable?.type != null) {
      type = variable.type;
    } else {
      // TODO: Should handle the undefined value (either in array value or single value)
      const candidateValue = Array.isArray(value) ? value[0] : value;
      switch (typeof candidateValue) {
        case "object":
          type = "Object";
          break;

        case "boolean":
          type = "Boolean";
          break;

        case "number":
          type = candidateValue % 1 === 0 ? "Int" : "Float";
          break;
      }
    }

    // set object based variable properties
    if (typeof variable === "object") {
      if (variable.list === true) {
        type = `[${type}]`;
      } else if (Array.isArray(variable.list)) {
        type = `[${type}${variable.list[0] ? "!" : ""}]`;
      }

      if (variable.required) {
        type += "!";
      }
    }

    return type;
  }
}
