import ModuleOnboardingForm from "@/components/ModuleOnboardingForm";
import RepositoryTable from "@/components/RepositoryTable";
import { ModuleService } from "@/service/ModuleService";
import { RepositoryService } from "@/service/RepositoryService";
import { useAuthState, useRepoState } from "@/store";
import {
  Bar,
  Button,
  FlexBox,
  Input,
  TableSelectionDomRef,
  Text,
  Title,
  Ui5CustomEvent,
  Wizard,
  WizardStep,
  MessageStrip,
  Link,
} from "@ui5/webcomponents-react";
import { AxiosError } from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

function OnboardRepositoryPage() {
  const navigate = useNavigate();
  const user = useAuthState((state) => state.user);

  const permissionUrl = `${import.meta.env.VITE_API_URL}/api/v1/auth/github`;
  const permissionsNeeded = !(
    user.permissions.includes("repo") && user.permissions.includes("workflow")
  );

  const [selected, setSelected] = useState(permissionsNeeded ? "1" : "2");
  const [disabled, setDisabled] = useState<Record<string, boolean>>({
    "1": !permissionsNeeded,
    "2": false,
    "3": true,
    "4": true,
    "5": true,
  });

  const repos = useRepoState((state) => state.repos);
  const access_token = useAuthState((state) => state.accessToken);
  const repoServiceRef = useRef(new RepositoryService());
  const moduleServiceRef = useRef(new ModuleService());

  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
  const [selectRepoBranches, setSelectedRepoBranches] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [messageVisible, setMessageVisible] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  const [moduleOnboardingData, setModuleOnboardingData] = useState<ModuleData>({
    name: "",
    description: "",
    repo: {} as Repo,
    branch: "",
    hasDockerCompose: false,
    hasDockerfile: false,
    hasKubernetes: false,
    hasPipeline: false,
    requiresDockerCompose: true,
    requiresDockerfile: true,
    requiresKubernetes: true,
    requiresPipeline: true,
    version: "1.0.0",
    workflowType: "github",
    otherRequirements: "",
    email: "",
    ownerId: user.id,
  });

  useEffect(() => {
    if (!selectedRepo) return;
    (async () => {
      const branches = await repoServiceRef.current.getRepoBranches(
        access_token,
        selectedRepo.name,
        selectedRepo.author
      );
      setSelectedRepoBranches(branches);
    })();
  }, [selectedRepo, access_token, user]);

  function nextStep(prevStep: string, step: string) {
    setSelected(step);
    setDisabled((prev) => ({ ...prev, [step]: false, [prevStep]: true }));
  }

  function validateForm() {
    const keys = ["name", "version", "branch", "description", "email"];
    const valid = keys.every(
      (key) => !!moduleOnboardingData[key as keyof ModuleData]
    );
    return valid;
  }

  function onRepoSelect(e: Ui5CustomEvent<TableSelectionDomRef, never>) {
    const selectedRepoId = e.target.selected;
    const sRepo = repos.find((repo) => repo.id.toString() === selectedRepoId);
    if (!sRepo) {
      return;
    }
    setSelectedRepo(sRepo);
  }

  function editFormValue(key: string, value: string | Repo) {
    setModuleOnboardingData((prev) => ({ ...prev, [key]: value }));
  }

  function saveFormAndReview() {
    validateForm();
    nextStep("4", "5");
  }

  function handleRelatedBooleanChange(
    key1: string,
    key2: string,
    value: boolean
  ) {
    setModuleOnboardingData((prev) => ({
      ...prev,
      [key1]: value,
      [key2]: !value,
    }));
  }
  function populateFormAndNextStep() {
    if (!selectedRepo) return;
    editFormValue("repo", selectedRepo);
    editFormValue("name", selectedRepo.name);
    editFormValue("description", selectedRepo.description);
    if (selectRepoBranches.length > 0) {
      editFormValue("branch", selectRepoBranches[0]);
    }
    nextStep("2", "3");
  }

  function dismissErrorMessage(index: number) {
    setErrorMessages((prev) => prev.filter((_, i) => i !== index));
  }

  function validateEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function buildGithubIntegration() {
    const state = JSON.stringify({
      repoId: selectedRepo?.id,
    });
    return `https://github.com/apps/autoflow-integration/installations/new?state=${state}`;
  }

  async function startOnboarding() {
    setSubmitting(true);
    const isFormValid = validateForm();
    if (!isFormValid) {
      setErrorMessages(["Please fill all required fields"]);
      return;
    }
    if (!validateEmail(moduleOnboardingData.email)) {
      setErrorMessages(["Please enter a valid email"]);
      return;
    }
    setErrorMessages([]);
    try {
      const resp = await moduleServiceRef.current.createModule(
        access_token,
        moduleOnboardingData
      );
      navigate(`/modules/${resp.id}`);
    } catch (err) {
      console.error("[REPO SVC ERROR]", err);
      const messages = ["Failed to onboard module. Please try again later."];
      if (err instanceof AxiosError) {
        messages.push(err.response?.data?.message);
      }
      setErrorMessages(messages);
      setSubmitting(false);
    }
    return;
  }

  return (
    <Wizard
      contentLayout="SingleStep"
      style={{ height: "100dvh", overflow: "hidden" }}
    >
      <WizardStep
        icon="tnt/github"
        titleText="Connect to GitHub"
        disabled={disabled["1"]}
        selected={selected === "1"}
        subtitleText={
          permissionsNeeded
            ? "Grant Required Permissions"
            : "Permissions Granted"
        }
      >
        <Title>
          Connect your GitHub Account with necessary permissions to fetch Repos
        </Title>

        <FlexBox direction="Column">
          <Text>Click the button below to connect to GitHub</Text>
          <Button
            design="Emphasized"
            onClick={() => window.location.assign(permissionUrl)}
          >
            Grant Permissions
          </Button>
        </FlexBox>
      </WizardStep>

      <WizardStep
        icon="chain-link"
        titleText="Choose Repository"
        disabled={disabled["2"]}
        selected={selected === "2"}
        subtitleText={
          selectedRepo ? `Selected ${selectedRepo.name}` : undefined
        }
      >
        <Title>Choose a Repository to onboard</Title>

        <FlexBox direction="Column" gap="1rem">
          <Bar>
            <Input
              placeholder="Search for repositories"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Bar>
          <RepositoryTable
            repos={repos}
            searchTerm={searchTerm}
            type="wizard"
            onRepoSelect={onRepoSelect}
          />
        </FlexBox>
        {selectedRepo && (
          <Button
            style={{ marginTop: "1rem" }}
            design="Emphasized"
            onClick={() => populateFormAndNextStep()}
          >
            Next
          </Button>
        )}
      </WizardStep>
      <WizardStep
        icon="action-settings"
        disabled={disabled["3"]}
        selected={selected === "3"}
        titleText="Configure Deployment Options"
        style={{ gap: "1rem" }}
      >
        {selectedRepo && (
          <FlexBox direction="Column">
            {selectedRepo.type === "private" && messageVisible && (
              <MessageStrip
                design="Critical"
                onClose={() => setMessageVisible(false)}
              >
                You have selected a private repository. Make sure you have the
                necessary permissions to access this repository.
              </MessageStrip>
            )}
            <ModuleOnboardingForm
              selectedRepo={selectedRepo}
              selectRepoBranches={selectRepoBranches}
              editFormValue={editFormValue}
              handleRelatedBooleanChange={handleRelatedBooleanChange}
              moduleOnboardingData={moduleOnboardingData}
              reviewMode={false}
            />
          </FlexBox>
        )}
        <FlexBox direction="Row" justifyContent="SpaceBetween">
          <Button
            style={{ marginTop: "1rem" }}
            design="Default"
            onClick={() => nextStep("3", "2")}
          >
            Previous
          </Button>
          <Button
            style={{ marginTop: "1rem" }}
            design="Emphasized"
            disabled={!validateForm()}
            onClick={() => nextStep("3", "4")}
          >
            Next
          </Button>
        </FlexBox>
      </WizardStep>
      <WizardStep
        disabled={disabled["4"]}
        selected={selected === "4"}
        icon="add-equipment"
        titleText="Install Github App"
      >
        <Title style={{ marginBottom: "0.1rem" }}>
          Install Github App on {moduleOnboardingData?.repo?.name}
        </Title>

        <Text style={{ marginTop: "1rem" }}>
          To onboard the selected repository, you need to install the Autoflow
          Github App on your repository. Click the link below to install the
          app, after that go to the next step.

          <br/>
          <strong>NOTE:</strong> if you have already installed the app in your account once, please select the repository or you can click <strong>All repositories</strong>
        </Text>
        <br />
        <Link target="_blank" rel="noopener noreferrer" href={buildGithubIntegration()}>Install Github Integration</Link>

        <FlexBox direction="Row" justifyContent="SpaceBetween">
          <Button
            style={{ marginTop: "1rem" }}
            design="Default"
            onClick={() => {
              nextStep("4", "3");
              setErrorMessages([]);
            }}
            disabled={submitting}
          >
            Previous
          </Button>
          <Button
            style={{ marginTop: "1rem" }}
            design="Emphasized"
            disabled={
              errorMessages.length > 0 ||
              submitting ||
              (!validateForm() && !selectedRepo)
            }
            onClick={() => saveFormAndReview()}
          >
            Next
          </Button>
        </FlexBox>
      </WizardStep>
      <WizardStep
        disabled={disabled["5"]}
        selected={selected === "5"}
        icon="accept"
        titleText="Review and Done"
        style={{ gap: "1rem" }}
      >
        <Title style={{ marginBottom: "0.1rem" }}>Review and Submit</Title>

        {errorMessages.length > 0 &&
          errorMessages.map((msg, i) => (
            <MessageStrip
              key={i}
              onClose={() => dismissErrorMessage(i)}
              design="Negative"
              style={{ marginBottom: "0.25rem" }}
            >
              {msg}
            </MessageStrip>
          ))}

        {selectedRepo && (
          <ModuleOnboardingForm
            selectedRepo={selectedRepo}
            selectRepoBranches={selectRepoBranches}
            editFormValue={editFormValue}
            handleRelatedBooleanChange={handleRelatedBooleanChange}
            moduleOnboardingData={moduleOnboardingData}
            reviewMode
          />
        )}

        <FlexBox direction="Row" justifyContent="SpaceBetween">
          <Button
            style={{ marginTop: "1rem" }}
            design="Default"
            onClick={() => {
              nextStep("5", "4");
              setErrorMessages([]);
            }}
            disabled={submitting}
          >
            Previous
          </Button>
          <Button
            style={{ marginTop: "1rem" }}
            design="Emphasized"
            disabled={
              errorMessages.length > 0 ||
              submitting ||
              (!validateForm() && !selectedRepo)
            }
            onClick={startOnboarding}
          >
            Submit
          </Button>
        </FlexBox>
      </WizardStep>
    </Wizard>
  );
}

export default OnboardRepositoryPage;
