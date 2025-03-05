import {
  Input,
  InputDomRef,
  InputPropTypes,
  Link,
  Text,
  Ui5CustomEvent,
} from "@ui5/webcomponents-react";
import InputType from "@ui5/webcomponents/dist/types/InputType.js";

interface StandardInputFieldProps
  extends Omit<InputPropTypes, "type" | "value" | "onInput"> {
  editMode: boolean;
  value: string;
  inputType?: InputType;
  onInput?: (e: Ui5CustomEvent<InputDomRef>) => void;
}

const StandardInputField = ({
  value,
  editMode,
  inputType,
  onInput,
  ...rest
}: StandardInputFieldProps) => {
  if (editMode) {
    return (
      <Input
        value={value}
        style={{ width: "100%" }}
        type={inputType}
        onInput={onInput}
        {...rest}
      />
    );
  }

  if (inputType === InputType.URL || inputType === InputType.Email) {
    return (
      <Link
        href={inputType === InputType.Email ? `mailto:${value}` : value}
        target="_blank"
      >
        {value}
      </Link>
    );
  }

  return <Text>{value}</Text>;
};

export default StandardInputField;
