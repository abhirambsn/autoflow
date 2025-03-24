import {
  FlexBox,
  Label,
  Link,
  ObjectPageHeader,
  ObjectPageHeaderPropTypes,
} from "@ui5/webcomponents-react";

type Props = ObjectPageHeaderPropTypes;

export const ModulePageHeader = (props: Props) => {
  return (
    <ObjectPageHeader {...props}>
      <FlexBox alignItems="Center" wrap="Wrap">
        <FlexBox direction="Column">
          <Link>+33 6 4512 5158</Link>
          <Link href="mailto:ui5-webcomponents-react@sap.com">
            DeniseSmith@sap.com
          </Link>
          <Link href="https://github.com/SAP/ui5-webcomponents-react">
            https://github.com/SAP/ui5-webcomponents-react
          </Link>
        </FlexBox>
        <FlexBox direction="Column" style={{ padding: "10px" }}>
          <Label>San Jose</Label>
          <Label>California, USA</Label>
        </FlexBox>
      </FlexBox>
    </ObjectPageHeader>
  );
};
