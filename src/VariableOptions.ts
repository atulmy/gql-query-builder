type VariableOptions =
  | {
      type?: string;
      name?: string;
      value: any;
      list?: boolean | [boolean];
      required?: boolean;
      builder?: (key: string, value: VariableOptions | any) => string;
    }
  | { [k: string]: any };

export default VariableOptions;
