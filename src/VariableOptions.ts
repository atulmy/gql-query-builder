type VariableOptions =
  | {
      type?: string;
      name?: string;
      value: any;
      list?: boolean | [boolean];
      required?: boolean;
    }
  | { [k: string]: any };

export default VariableOptions;
