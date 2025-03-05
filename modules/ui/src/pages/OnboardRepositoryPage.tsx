import { RepositoryService } from "@/service/RepositoryService";
import { useAuthState, useRepoState } from "@/store";
import { capitalizeText } from "@/utils";
import {
  Bar,
  Button,
  FlexBox,
  Icon,
  Input,
  Link,
  Table,
  TableCell,
  TableHeaderCell,
  TableHeaderRow,
  TableRow,
  TableSelection,
  TableSelectionDomRef,
  TableVirtualizer,
  Tag,
  Text,
  Title,
  Ui5CustomEvent,
  Wizard,
  WizardStep,
  Form,
  FormGroup,
  FormItem,
  Label,
  Select,
  Option,
  CheckBox,
  TextArea,
  MessageStrip,
} from "@ui5/webcomponents-react";
import { useEffect, useRef, useState } from "react";

function OnboardRepositoryPage() {
  const user = useAuthState((state) => state.user);

  const permissionUrl = `http://localhost:3000/api/v1/auth/github`;
  const permissionsNeeded = !(
    user.permissions.includes("repo") && user.permissions.includes("workflow")
  );

  const [selected, setSelected] = useState(permissionsNeeded ? "1" : "2");
  const [disabled, setDisabled] = useState<Record<string, boolean>>({
    "1": !permissionsNeeded,
    "2": false,
    "3": false,
    "4": true,
  });

  const repos = useRepoState((state) => state.repos);
  const access_token = useAuthState((state) => state.accessToken);
  const repoServiceRef = useRef(new RepositoryService());

  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
  const [selectRepoBranches, setSelectedRepoBranches] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [messageVisible, setMessageVisible] = useState(true);

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
  });

  const TableHeader = ({ slot }: { slot?: string }) => {
    return (
      <TableHeaderRow slot={slot} sticky>
        <TableHeaderCell>Repository Name</TableHeaderCell>
        <TableHeaderCell>Type</TableHeaderCell>
        <TableHeaderCell>Link</TableHeaderCell>
      </TableHeaderRow>
    );
  };

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
  }, [selectedRepo, access_token]);

  function nextStep(prevStep: string, step: string) {
    console.log("Moving to step", step);
    setSelected(step);
    setDisabled((prev) => ({ ...prev, [step]: false, [prevStep]: true }));
  }

  function validateForm() {
    console.log("Validating form...", moduleOnboardingData);
    const keys = ["name", "version", "branch", "description"];
    const valid = keys.every(
      (key) => !!moduleOnboardingData[key as keyof ModuleData]
    );
    console.log("Form validation result: ", valid);
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
    nextStep("3", "4");
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
          <Table headerRow={<TableHeader />}>
            <TableVirtualizer slot="features" rowCount={10} />
            <TableSelection
              onChange={onRepoSelect}
              mode="Single"
              slot="features"
            />

            {repos
              .filter((repo) => repo.name.includes(searchTerm))
              .map((repo) => (
                <TableRow key={repo.id} rowKey={repo.id}>
                  <TableCell>
                    <Text>{repo.full_name}</Text>
                  </TableCell>
                  <TableCell>
                    <Tag
                      colorScheme={repo.type === "private" ? "6" : "5"}
                      icon={
                        <Icon
                          name={repo.type === "private" ? "locked" : "unlocked"}
                        />
                      }
                      design="Set2"
                    >
                      {capitalizeText(repo.type)}
                    </Tag>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={repo.url}
                      rel="noopener noreferer"
                      target="_blank"
                    >
                      {repo.url}
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
          </Table>
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
            <Form labelSpan="S12 M4 L4 XL4" layout="S1 M1 L2 XL2">
              <FormGroup headerText="Module Details">
                <FormItem labelContent={<Label>Module Name</Label>}>
                  <Input
                    value={moduleOnboardingData.name}
                    required
                    onInput={(e) => editFormValue("name", e.target.value)}
                  />
                </FormItem>
                <FormItem labelContent={<Label>Version</Label>}>
                  <Input
                    value={moduleOnboardingData.version}
                    required
                    onInput={(e) => editFormValue("version", e.target.value)}
                  />
                </FormItem>
                <FormItem labelContent={<Label>Branch</Label>}>
                  <Select
                    onChange={(e) => editFormValue("branch", e.target.value)}
                    required
                    valueState="None"
                  >
                    {selectRepoBranches.map((branch) => (
                      <Option key={branch}>{branch}</Option>
                    ))}
                  </Select>
                </FormItem>
                <FormItem labelContent={<Label>Description</Label>}>
                  <TextArea
                    value={moduleOnboardingData.description}
                    onInput={(e) =>
                      editFormValue("description", e.target.value)
                    }
                    rows={5}
                    placeholder="A short module description"
                  />
                </FormItem>
              </FormGroup>
              <FormGroup headerText="Repository Details">
                <FormItem labelContent={<Label>Name</Label>}>
                  <Input value={selectedRepo.name} disabled />
                </FormItem>
                <FormItem labelContent={<Label>Github Link</Label>}>
                  <Input value={selectedRepo.url} disabled />
                </FormItem>
                <FormItem labelContent={<Label>Description</Label>}>
                  <Input value={selectedRepo.description} disabled />
                </FormItem>
                <FormItem labelContent={<Label>Author</Label>}>
                  <Input value={selectedRepo.author} disabled />
                </FormItem>
              </FormGroup>

              <FormGroup headerText="Deployment Settings">
                <FormItem labelContent={<Label>Pipeline Type</Label>}>
                  <Select
                    disabled={!moduleOnboardingData.requiresPipeline}
                    onChange={(e) =>
                      editFormValue("workflowType", e.target.value)
                    }
                    value={moduleOnboardingData.workflowType}
                  >
                    <Option value="github">Github Actions</Option>
                    <Option value="jenkins">Jenkins</Option>
                    <Option value="none">None</Option>
                  </Select>
                </FormItem>

                <FormItem labelContent={<Label>Generate Dockerfile</Label>}>
                  <CheckBox
                    checked={moduleOnboardingData.requiresDockerfile}
                    onChange={(e) =>
                      handleRelatedBooleanChange(
                        "requiresDockerfile",
                        "hasDockerfile",
                        e.target.checked
                      )
                    }
                  />
                </FormItem>

                <FormItem labelContent={<Label>Generate Docker Compose</Label>}>
                  <CheckBox
                    checked={moduleOnboardingData.requiresDockerCompose}
                    onChange={(e) =>
                      handleRelatedBooleanChange(
                        "requiresDockerCompose",
                        "hasDockerCompose",
                        e.target.checked
                      )
                    }
                  />
                </FormItem>

                <FormItem
                  labelContent={<Label>Generate Kubernetes Manifests</Label>}
                >
                  <CheckBox
                    checked={moduleOnboardingData.requiresKubernetes}
                    onChange={(e) =>
                      handleRelatedBooleanChange(
                        "requiresKubernetes",
                        "hasKubernetes",
                        e.target.checked
                      )
                    }
                  />
                </FormItem>

                <FormItem labelContent={<Label>Generate Pipeline File</Label>}>
                  <CheckBox
                    checked={moduleOnboardingData.requiresPipeline}
                    onChange={(e) => {
                      handleRelatedBooleanChange(
                        "requiresPipeline",
                        "hasPipeline",
                        e.target.checked
                      );
                      if (!e.target.checked) {
                        editFormValue("workflowType", "none");
                      }
                    }}
                  />
                </FormItem>
              </FormGroup>

              <FormGroup headerText="Other Details">
                <FormItem
                  labelContent={<Label>Other Requirements (if any)</Label>}
                >
                  <TextArea
                    value={moduleOnboardingData.otherRequirements}
                    onInput={(e) =>
                      editFormValue("otherRequirements", e.target.value)
                    }
                    rows={5}
                    placeholder="Write additonal requirements in the files (if any)"
                  />
                </FormItem>
              </FormGroup>
            </Form>
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
            onClick={() => saveFormAndReview()}
          >
            Next
          </Button>
        </FlexBox>
      </WizardStep>
      <WizardStep
        disabled={disabled["4"]}
        selected={selected === "4"}
        icon="accept"
        titleText="Review and Done"
      >
        <Title>Review and Submit</Title>
      </WizardStep>
    </Wizard>
  );
}

export default OnboardRepositoryPage;
