import NestedField from "./NestedField";

/*
Defines an array of strings or objects to define query fields
@example ['id', 'name']
@example [{id: 1, name: 'Chuck'}]
 */
type Fields = Array<string | object | NestedField>;

export default Fields;
