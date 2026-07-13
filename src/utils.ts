/**
 * Shared pure helpers for turning options objects into GraphQL document fragments.
 */
import type {
  Fields,
  FragmentDefinition,
  NestedField,
  QueryBuilderOptions,
  VariableOptions,
} from "./types";
import { isNestedField } from "./types";

/**
 * Registry-scoped brand so raw values survive crossing the dual CJS/ESM builds:
 * `instanceof` fails when the class is duplicated per bundle, `Symbol.for` does not.
 */
const GRAPHQL_RAW: unique symbol = Symbol.for("gql-query-builder.raw");

/** A raw GraphQL snippet inserted verbatim into the document. Create with {@link rawGraphQL}. */
export class GraphQLRaw {
  readonly [GRAPHQL_RAW] = true;
  constructor(readonly value: string) {}
}

function isGraphQLRaw(value: unknown): value is GraphQLRaw {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as Record<PropertyKey, unknown>)[GRAPHQL_RAW] === true
  );
}

/**
 * Marks a string to be inserted into the document verbatim, without quoting.
 * Needed for enum literals, e.g. `default: rawGraphQL("JEDI")` emits `= JEDI`.
 */
export function rawGraphQL(value: string): GraphQLRaw {
  return new GraphQLRaw(value);
}

/**
 * Serializes a JavaScript value as a GraphQL literal: strings are quoted,
 * input object keys are unquoted, and {@link GraphQLRaw} values pass through.
 */
export function toGraphQLLiteral(value: unknown): string {
  if (isGraphQLRaw(value)) {
    return String(value.value);
  }
  if (value === null) {
    return "null";
  }
  if (Array.isArray(value)) {
    return `[${value.map(toGraphQLLiteral).join(", ")}]`;
  }
  switch (typeof value) {
    case "string":
      return JSON.stringify(value);
    case "number":
    case "boolean":
      return String(value);
    case "object":
      return `{${Object.entries(value as Record<string, unknown>)
        .map(([key, entry]) => `${key}: ${toGraphQLLiteral(entry)}`)
        .join(", ")}}`;
    default:
      throw new TypeError(
        `Cannot serialize ${typeof value} as a GraphQL literal`
      );
  }
}

/** Merges the variables of several operations (including nested field variables) into one object. */
export function resolveVariables(operations: QueryBuilderOptions[]): any {
  let resolved: any = {};

  for (const { variables, fields } of operations) {
    resolved = {
      ...resolved,
      ...variables,
      ...((fields && getNestedVariables(fields)) || {}),
    };
  }
  return resolved;
}

/** Converts variables to a name/argument map, e.g. `(id: $id)`. */
export function queryDataNameAndArgumentMap(variables: VariableOptions) {
  return variables && Object.keys(variables).length
    ? `(${Object.entries(variables).reduce((dataString, [key, value], i) => {
        return `${dataString}${i !== 0 ? ", " : ""}${
          value?.name ? value.name : key
        }: $${key}`;
      }, "")})`
    : "";
}

/** Renders a selection set, e.g. `id, name, user { email }`. */
export function queryFieldsMap(fields?: Fields): string {
  return fields
    ? fields
        .map((field) => {
          if (isNestedField(field)) {
            return queryNestedFieldMap(field);
          }
          if (typeof field === "object") {
            let result = "";

            Object.entries<Fields>(field as Record<string, Fields>).forEach(
              ([key, values], index, array) => {
                result += `${key} ${
                  values.length > 0 ? `{ ${queryFieldsMap(values)} }` : ""
                }`;

                // If it's not the last item in array, join with comma
                if (index < array.length - 1) {
                  result += ", ";
                }
              }
            );

            return result;
          }
          return `${field}`;
        })
        .join(", ")
    : "";
}

/** Renders an operation as `name` or `alias: name`. */
export function operationOrAlias(
  operation: QueryBuilderOptions["operation"]
): string {
  return typeof operation === "string"
    ? operation
    : `${operation.alias}: ${operation.name}`;
}

/** Whether a nested field is an inline fragment (`... on Type`). */
export function isFragment(field: NestedField): boolean {
  return field?.fragment === true;
}

function operationOrFragment(field: NestedField): string {
  return isFragment(field)
    ? field.operation
    : operationOrAlias(field.operation);
}

/** Renders one nested field: a sub-operation with arguments or an inline fragment. */
export function queryNestedFieldMap(field: NestedField) {
  const prefix = isFragment(field) ? "... on " : "";
  return `${prefix}${operationOrFragment(field)} ${
    isFragment(field) ? "" : queryDataNameAndArgumentMap(field.variables)
  } ${field.fields.length > 0 ? `{ ${queryFieldsMap(field.fields)} }` : ""}`;
}

/** Extracts the values sent alongside the document, e.g. `{ "id": 1, "name": "Jon Doe" }`. */
export function queryVariablesMap(variables: any, fields?: Fields) {
  const variablesMapped: Record<string, unknown> = {};
  const collect = (vars: any) => {
    if (vars) {
      Object.keys(vars).forEach((key) => {
        variablesMapped[key] =
          vars[key] !== null && typeof vars[key] === "object"
            ? vars[key].value
            : vars[key];
      });
    }
  };

  collect(variables);
  if (fields && typeof fields === "object") {
    collect(getNestedVariables(fields));
  }
  return variablesMapped;
}

/** Collects variables declared on nested fields, at any depth. */
export function getNestedVariables(fields: Fields) {
  let variables = {};

  function getDeepestVariables(innerFields: Fields) {
    innerFields?.forEach((field: string | object | NestedField) => {
      if (isNestedField(field)) {
        variables = {
          ...field.variables,
          ...variables,
          ...(field.fields && getDeepestVariables(field.fields)),
        };
      } else if (typeof field === "object") {
        for (const [, value] of Object.entries(field)) {
          getDeepestVariables(value);
        }
      }
    });

    return variables;
  }

  getDeepestVariables(fields);

  return variables;
}

/**
 * Renders the full variable definition type expression: the inferred/declared
 * type plus a `= default` literal when the descriptor carries one.
 */
export function queryDataTypeAndDefault(variable: any): string {
  const type = queryDataType(variable);
  return typeof variable === "object" &&
    variable !== null &&
    !Array.isArray(variable) &&
    variable.default !== undefined
    ? `${type} = ${toGraphQLLiteral(variable.default)}`
    : type;
}

/** Renders named fragment definitions appended to a document (empty string when none). */
export function queryFragmentsMap(fragments?: FragmentDefinition[]): string {
  return fragments?.length
    ? fragments
        .map(
          (fragment) =>
            `\n\nfragment ${fragment.name} on ${fragment.on} { ${queryFieldsMap(
              fragment.fields
            )} }`
        )
        .join("")
    : "";
}

/** Infers the GraphQL type of a variable, honoring `type`, `required`, and `list` descriptors. */
export function queryDataType(variable: any) {
  let type = "String";

  const value =
    variable !== null && typeof variable === "object"
      ? variable.value
      : variable;

  if (variable?.type != null) {
    type = variable.type;
  } else {
    // TODO: Should handle the undefined value (either in array value or single value)
    const candidateValue = Array.isArray(value) ? value[0] : value;
    if (candidateValue != null) {
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
  }

  // set object based variable properties
  if (variable !== null && typeof variable === "object") {
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
