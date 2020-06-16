import IQueryBuilderOptions from "./IQueryBuilderOptions";
import Fields from "./Fields";

/*
Defines an array of strings or objects to define query fields
@example ['id', 'name']
@example [{id: 1, name: 'Chuck'}]
 */
type NestedField = {
  operation: String;
  variables: IQueryBuilderOptions[];
  fields: Fields;
};

export default NestedField;

export function isNestedField(object: any): object is NestedField {
  return (
    typeof object === "object" &&
    object.hasOwnProperty("operation") &&
    object.hasOwnProperty("variables") &&
    object.hasOwnProperty("fields")
  );
}
