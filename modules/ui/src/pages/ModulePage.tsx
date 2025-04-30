import { CommitTable } from "@/components/ModulePage";
import { CommitService } from "@/service/CommitService";
import { DeploymentService } from "@/service/DeploymentService";
import { ModuleService } from "@/service/ModuleService";
import { useAuthState } from "@/store";
import { useDeploymentState } from "@/store/deploymentsState";
import { capitalizeText } from "@/utils";
import {
  Link,
  Breadcrumbs,
  BreadcrumbsItem,
  Button,
  FlexBox,
  ObjectPage,
  ObjectPageHeader,
  ObjectPageSection,
  ObjectPageTitle,
  ObjectStatus,
  Text,
  Toolbar,
  ToolbarButton,
  IllustratedMessage,
  Bar,
  ObjectPageSubSection,
  Form,
  FormItem,
  Label,
  Tag,
  Icon,
  MessageStrip,
  Dialog,
  Select,
  Option,
} from "@ui5/webcomponents-react";
import ButtonDesign from "@ui5/webcomponents/dist/types/ButtonDesign.js";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router";

const parseAIGeneratedFiles = (module: ModuleData) => {
  let result = "";
  if (!module?.hasDockerCompose) result += "Docker Compose, ";
  if (!module?.hasKubernetes) result += "Kubernetes Manifests, ";
  if (!module?.hasDockerfile) result += "Dockerfile, ";
  if (!module?.hasPipeline) result += "CI/CD Pipeline File, ";

  return result.slice(0, -2);
};

const parseCICDWorkflowType = (workflowType: string) => {
  switch (workflowType) {
    case "github":
      return "GitHub Actions";
    case "jenkins":
      return "Jenkins";
    default:
      return "None";
  }
};

function ModulePage() {
  const { module } = useParams();
  const access_token = useAuthState((state) => state.accessToken);
  const startDeployment = useDeploymentState((state) => state.startDeployment);
  const moduleServiceRef = useRef(new ModuleService());
  const commitServiceRef = useRef(new CommitService());
  const deploymentServiceRef = useRef(new DeploymentService());

  const currentDeploymentStatus = useDeploymentState((state) => state.status);

  const [moduleData, setModuleData] = useState<ModuleData>();
  const [commits, setCommits] = useState<CommitRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<Message>({} as Message);

  const [deploymentSelectModalOpen, setDeploymentSelectModalOpen] =
    useState(false);
  const [deploymentWorkflows, setDeploymentWorkflows] = useState([] as any[]);
  const [selectedWorkflow, setSelectedWorkflow] = useState("");

  const getModuleDetails = useCallback(
    async (module: string) => {
      if (!access_token || !module) return;
      const moduleDetails = await moduleServiceRef.current.getModuleData(
        access_token,
        module
      );
      return moduleDetails;
    },
    [access_token]
  );

  const getCommitDetails = useCallback(
    async (repoId: string) => {
      if (!access_token || !repoId) return;
      const commitDetails = await commitServiceRef.current.getCommits(
        access_token,
        repoId
      );
      return commitDetails;
    },
    [access_token]
  );

  async function getDeployments(refresh: boolean = false) {
    const data = await deploymentServiceRef.current.getGithubDeploymentOptions(
      access_token,
      moduleData?.repo.full_name as string,
      refresh
    );
    setDeploymentWorkflows(data);
  }

  async function refreshCommits() {
    setLoading(true);
    if (!access_token) return;
    const data = await commitServiceRef.current.getCommits(
      access_token,
      moduleData?.repo?.id as string,
      true
    );
    setCommits(data);
    setLoading(false);
  }

  async function triggerGenerateFiles() {
    if (!access_token) return;
    setLoading(true);
    try {
      const data = await moduleServiceRef.current.generateFilesTrigger(
        access_token,
        module as string
      );
      const parsedMessage = `${data?.message}: Job ID: ${data?.jobId}`;
      setMessage({ type: "success", message: parsedMessage });
    } catch (err) {
      setMessage({
        type: "error",
        message: "Unable to trigger file generation",
      });
      console.error("[MODULE SVC ERROR]", err);
    } finally {
      setLoading(false);
    }
  }

  function onMessageClose() {
    setMessage({} as Message);
  }

  async function triggerDeployment() {
    if (!moduleData) return;
    if (moduleData.workflowType === "github") {
      // Open Deployment Choosing Messagebox
      setDeploymentSelectModalOpen(true);
    } else {
      alert("Jenkins deployment is not supported yet");
    }
  }

  async function startDeploymentWorkflow() {
    if (!access_token || !selectedWorkflow) return;
    setLoading(true);
    try {
      await startDeployment(access_token, "github", {
        repo: moduleData?.repo.full_name,
        workflow: selectedWorkflow,
        branch: moduleData?.branch,
      });
      setMessage({
        type: "success",
        message: "Deployment triggered successfully",
      });
      setDeploymentSelectModalOpen(false);
    } catch (err) {
      setMessage({
        type: "error",
        message: "Unable to trigger deployment",
      });
      console.error("[MODULE SVC ERROR]", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      if (!module) return;
      const fetchedModuleData = await getModuleDetails(module);
      const fetchedCommitDetails = await getCommitDetails(
        fetchedModuleData?.repo?.id
      );
      setModuleData(fetchedModuleData);
      setCommits(fetchedCommitDetails);
      setLoading(false);
      setError("");
    })();
  }, [module, getModuleDetails, getCommitDetails]);
  return (
    <>
      <title>Autoflow | {moduleData?.name}</title>
      <ObjectPage
        headerArea={
          <ObjectPageHeader>
            <FlexBox alignItems="Center" wrap="Wrap">
              <FlexBox direction="Column">
                <Link href={moduleData?.repo.url}>
                  {moduleData?.repo.full_name}
                </Link>
                <Link href={moduleData?.repo.url}>{moduleData?.repo.url}</Link>
              </FlexBox>
            </FlexBox>
          </ObjectPageHeader>
        }
        image={moduleData?.repo.avatar}
        imageShapeCircle
        mode="Default"
        onBeforeNavigate={function Js() {}}
        onPinButtonToggle={function Js() {}}
        onSelectedSectionChange={function Js() {}}
        onToggleHeaderArea={function Js() {}}
        selectedSectionId="commits"
        style={{
          height: "90dvh",
        }}
        titleArea={
          <ObjectPageTitle
            actionsBar={
              <Toolbar design="Transparent">
                <ToolbarButton
                  design="Emphasized"
                  onClick={triggerDeployment}
                  text="Trigger Deployment"
                />
                <ToolbarButton
                  onClick={triggerGenerateFiles}
                  design="Transparent"
                  text="Regenerate Required Files"
                />
              </Toolbar>
            }
            breadcrumbs={
              <Breadcrumbs>
                <BreadcrumbsItem>Modules</BreadcrumbsItem>
                <BreadcrumbsItem>{moduleData?.name}</BreadcrumbsItem>
              </Breadcrumbs>
            }
            header={moduleData?.name}
            subHeader={moduleData?.description}
            expandedContent={
              Object.keys(message).length > 0 ? (
                <MessageStrip
                  design={message?.type === "success" ? "Positive" : "Negative"}
                  onClose={onMessageClose}
                >
                  {message.message}
                </MessageStrip>
              ) : (
                <></>
              )
            }
            snappedContent={
              Object.keys(message).length > 0 ? (
                <MessageStrip
                  design={message?.type === "success" ? "Positive" : "Negative"}
                  onClose={onMessageClose}
                >
                  {message.message}
                </MessageStrip>
              ) : (
                <></>
              )
            }
          >
            {currentDeploymentStatus?.status === "completed" ? (
              currentDeploymentStatus?.conclusion === "failure" ? (
                <ObjectStatus state="Negative">FAILED</ObjectStatus>
              ) : (
                <ObjectStatus state="Positive">DEPLOYED</ObjectStatus>
              )
            ) : !currentDeploymentStatus?.status ||
              currentDeploymentStatus?.status !== "starting" ? (
              <ObjectStatus state="None">Not Started</ObjectStatus>
            ) : (
              <ObjectStatus state="Critical">In Progress</ObjectStatus>
            )}
          </ObjectPageTitle>
        }
        placeholder={error && <IllustratedMessage name="UnableToLoad" />}
      >
        <ObjectPageSection
          aria-label="General Information"
          id="general-info"
          titleText="General Information"
        >
          <ObjectPageSubSection
            id="repo-info"
            titleText="Repository Information"
          >
            <Form>
              <FormItem labelContent={<Label showColon>Repository Name</Label>}>
                <Text>{moduleData?.repo.name}</Text>
              </FormItem>
              <FormItem labelContent={<Label showColon>Repository URL</Label>}>
                <Link href={moduleData?.repo?.url} target="_blank">
                  {moduleData?.repo?.url}
                </Link>
              </FormItem>
              <FormItem labelContent={<Label showColon>Owner</Label>}>
                <Text>{moduleData?.repo.author}</Text>
              </FormItem>
              <FormItem
                labelContent={<Label showColon>Repository Description</Label>}
              >
                <Text>{moduleData?.repo?.description}</Text>
              </FormItem>
              <FormItem labelContent={<Label showColon>Type</Label>}>
                <Text>{moduleData?.repo?.description}</Text>
              </FormItem>
              <FormItem
                labelContent={<Label showColon>Repository Description</Label>}
              >
                <Tag
                  colorScheme={moduleData?.repo?.type === "private" ? "6" : "5"}
                  icon={
                    <Icon
                      name={
                        moduleData?.repo?.type === "private"
                          ? "locked"
                          : "unlocked"
                      }
                    />
                  }
                  design="Set2"
                >
                  {capitalizeText(moduleData?.repo?.type || "")}
                </Tag>
              </FormItem>
            </Form>
          </ObjectPageSubSection>

          <ObjectPageSubSection id="module-info" titleText="Module Informaton">
            <Form>
              <FormItem labelContent={<Label showColon>Name</Label>}>
                <Text>{moduleData?.name}</Text>
              </FormItem>
              <FormItem labelContent={<Label showColon>Version</Label>}>
                <Text>{moduleData?.version}</Text>
              </FormItem>
              <FormItem
                labelContent={<Label showColon>CI/CD Workflow Type</Label>}
              >
                <Text>
                  {parseCICDWorkflowType(moduleData?.workflowType as string)}
                </Text>
              </FormItem>
              <FormItem labelContent={<Label>AI Generated Files</Label>}>
                <Text>{moduleData && parseAIGeneratedFiles(moduleData)}</Text>
              </FormItem>
              <FormItem labelContent={<Label showColon>Branch</Label>}>
                <Text>{moduleData?.branch}</Text>
              </FormItem>
              <FormItem labelContent={<Label showColon>Email</Label>}>
                <Link href={`mailto:${moduleData?.email}`}>
                  {moduleData?.email}
                </Link>
              </FormItem>
            </Form>
          </ObjectPageSubSection>

          {currentDeploymentStatus && (
            <ObjectPageSubSection
              id="last-deployment-info"
              titleText="Last Deployment Information"
            >
              <Form>
                <FormItem labelContent={<Label showColon>Run ID</Label>}>
                  <Text>{currentDeploymentStatus.id}</Text>
                </FormItem>
                <FormItem labelContent={<Label showColon>Workflow ID</Label>}>
                  <Text>{currentDeploymentStatus.workflow_id}</Text>
                </FormItem>
                <FormItem
                  labelContent={<Label showColon>Workflow Title</Label>}
                >
                  <Text>{currentDeploymentStatus.workflow_title}</Text>
                </FormItem>
                <FormItem labelContent={<Label showColon>Started At</Label>}>
                  <Text>{currentDeploymentStatus.started_at}</Text>
                </FormItem>
                <FormItem labelContent={<Label showColon>Updated At</Label>}>
                  <Text>{currentDeploymentStatus.updated_at}</Text>
                </FormItem>
                <FormItem
                  labelContent={<Label showColon>Workflow Status</Label>}
                >
                  <Text
                    style={{
                      color:
                        currentDeploymentStatus?.status === "completed"
                          ? "green"
                          : "yellow",
                    }}
                  >
                    {capitalizeText(
                      currentDeploymentStatus.status as string
                    ).toUpperCase()}
                  </Text>
                </FormItem>
                <FormItem
                  labelContent={<Label showColon>Completion State</Label>}
                >
                  <Text
                    style={{
                      color:
                        currentDeploymentStatus?.conclusion === "success"
                          ? "green"
                          : "red",
                    }}
                  >
                    {capitalizeText(
                      currentDeploymentStatus.conclusion as string
                    ).toUpperCase()}
                  </Text>
                </FormItem>
                <FormItem
                  labelContent={<Label showColon>Logs / Tracking Link</Label>}
                >
                  <Link
                    href={currentDeploymentStatus?.html_url}
                    target="_blank"
                  >
                    Github Link
                  </Link>
                </FormItem>
              </Form>
            </ObjectPageSubSection>
          )}
        </ObjectPageSection>

        <ObjectPageSection
          aria-label="Commits"
          id="commits"
          titleText="Commits"
        >
          <FlexBox
            style={{ marginTop: "0.5rem" }}
            direction="Column"
            fitContainer
          >
            <Bar design="Header">
              <div slot="startContent">
                <Text>Showing Last 10 commits</Text>
              </div>
              <div slot="endContent">
                <FlexBox gap={"0.5rem"} alignItems="Center">
                  <Button
                    icon="refresh"
                    onClick={refreshCommits}
                    tooltip="Refresh Data"
                  />
                </FlexBox>
              </div>
            </Bar>
            <CommitTable loading={loading} commits={commits} />
          </FlexBox>
        </ObjectPageSection>
      </ObjectPage>
      <Dialog
        footer={
          <FlexBox
            fitContainer
            justifyContent="End"
            style={{ paddingBlock: "0.25rem", gap: "0.5rem" }}
          >
            <Button
              design={ButtonDesign.Emphasized}
              onClick={startDeploymentWorkflow}
            >
              Start Deployment
            </Button>
            <Button onClick={() => setDeploymentSelectModalOpen(false)}>
              Close
            </Button>
          </FlexBox>
        }
        headerText="Choose Deployment Workflow"
        open={deploymentSelectModalOpen}
        onOpen={() => getDeployments()}
      >
        <Select
          style={{ width: "100%" }}
          onChange={(e) =>
            setSelectedWorkflow(e.detail.selectedOption.value as string)
          }
        >
          <Option selected value="">
            Choose a workflow
          </Option>
          {deploymentWorkflows.length > 0 &&
            deploymentWorkflows.map((workflow) => (
              <Option value={workflow?.id}>{workflow?.name}</Option>
            ))}
        </Select>
        <Link
          design="Default"
          onClick={() => getDeployments(true)}
          wrappingType="None"
        >
          Refresh Workflow List
        </Link>
      </Dialog>
    </>
  );
}

export default ModulePage;
