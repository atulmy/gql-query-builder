import Fields from "./Fields";
import IQueryBuilderOptions from "./IQueryBuilderOptions";
import NestedField, { isNestedField } from "./NestedField";
import VariableOptions from "./VariableOptions";

export default class Utils {
  public static resolveVariables(operations: IQueryBuilderOptions[]): any {
    let ret: any = {};

    for (const { variables, fields } of operations) {
      ret = {
        ...ret,
        ...variables,
        ...((fields && Utils.getNestedVariables(fields)) || {}),
      };
    }
    return ret;
  }

  // Convert object to name and argument map. eg: (id: $id)
  public static queryDataNameAndArgumentMap(variables: VariableOptions) {
    return variables && Object.keys(variables).length
      ? `(${Object.entries(variables).reduce((dataString, [key, value], i) => {
          return `${dataString}${i !== 0 ? ", " : ""}${
            value && value.name ? value.name : key
          }: $${key}`;
        }, "")})`
      : "";
  }

  public static queryFieldsMap(fields?: Fields): string {
    return fields
      ? fields
          .map((field) => {
            if (isNestedField(field)) {
              return Utils.queryNestedFieldMap(field);
            } else if (typeof field === "object") {
              const values = Object.values(field)[0];
              return `${Object.keys(field)[0]} ${
                values.length > 0
                  ? "{ " + this.queryFieldsMap(values as Fields) + " }"
                  : ""
              }`;
            } else {
              return `${field}`;
            }
          })
          .join(", ")
      : "";
  }

  public static queryNestedFieldMap(field: NestedField) {
    return `${field.operation} ${this.queryDataNameAndArgumentMap(
      field.variables
    )} ${
      field.fields.length > 0
        ? "{ " + this.queryFieldsMap(field.fields) + " }"
        : ""
    }`;
  }

  // Variables map. eg: { "id": 1, "name": "Jon Doe" }
  public static queryVariablesMap(variables: any, fields?: Fields) {
    const variablesMapped: { [key: string]: unknown } = {};
    const update = (vars: any) => {
      if (vars) {
        Object.keys(vars).map((key) => {
          variablesMapped[key] =
            typeof vars[key] === "object" ? vars[key].value : vars[key];
        });
      }
    };

    update(variables);
    if (fields && typeof fields === "object") {
      update(Utils.getNestedVariables(fields));
    }
    return variablesMapped;
  }

  public static getNestedVariables(fields: Fields) {
    let variables = {};
    fields?.forEach((field: string | object | NestedField) => {
      if (isNestedField(field)) {
        variables = {
          ...field.variables,
          ...variables,
          ...(field.fields && Utils.getNestedVariables(field.fields)),
        };
      }
    });
    return variables;
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
