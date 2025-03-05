import { Wizard, WizardStep } from "@ui5/webcomponents-react";

function OnboardRepositoryPage() {
  return (
    <Wizard contentLayout="SingleStep">
      <WizardStep icon="tnt/github" titleText="Connect to GitHub"></WizardStep>
      <WizardStep icon="chain-link" titleText="Choose Repository"></WizardStep>
      <WizardStep
        icon="action-settings"
        titleText="Configure Deployment Options"
      ></WizardStep>
      <WizardStep icon="accept" titleText="Done"></WizardStep>
    </Wizard>
  );
}

export default OnboardRepositoryPage;
