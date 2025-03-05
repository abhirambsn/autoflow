import { Button, Dialog, FlexBox } from "@ui5/webcomponents-react";
import OnboardingWizard from "./OnboardingWizard";

type Props = {
  owDialogOpen: boolean;
  onCloseDialog: () => void;
};

const OnboardingWizardDialog = ({ owDialogOpen, onCloseDialog }: Props) => {
  return (
    <Dialog
    style={{ height: "80%", width: "85%" }}
      footer={
        <FlexBox
          fitContainer
          justifyContent="End"
          style={{ paddingTop: "0.25rem",paddingBlock: "0.25rem" }}
        >
          <Button onClick={onCloseDialog}>Close</Button>
        </FlexBox>
      }
      open={owDialogOpen}
    >
      <OnboardingWizard />
    </Dialog>
  );
};

export default OnboardingWizardDialog;
