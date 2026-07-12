import type Fields from "./Fields";
import type IQueryBuilderOptions from "./IQueryBuilderOptions";

/*
Defines an array of strings or objects to define query fields
@example ['id', 'name']
@example [{id: 1, name: 'Chuck'}]
 */
type NestedField = {
  operation: string;
  variables: IQueryBuilderOptions[];
  fields: Fields;
  fragment?: boolean | null;
};

export default NestedField;

export function isNestedField(object: any): object is NestedField {
  return (
    (typeof object === "object" &&
      Object.hasOwn(object, "operation") &&
      Object.hasOwn(object, "variables") &&
      Object.hasOwn(object, "fields")) ||
    (typeof object === "object" &&
      Object.hasOwn(object, "operation") &&
      Object.hasOwn(object, "fragment") &&
      Object.hasOwn(object, "fields"))
  );
}
