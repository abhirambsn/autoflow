import { CommitTable } from "@/components/ModulePage";
import { CommitService } from "@/service/CommitService";
import { ModuleService } from "@/service/ModuleService";
import { useAuthState } from "@/store";
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
} from "@ui5/webcomponents-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router";

const parseAIGeneratedFiles = (module: ModuleData) => {
  let result = '';
  if (!module?.hasDockerCompose) result += "Docker Compose, ";
  if (!module?.hasKubernetes) result += "Kubernetes Manifests, ";
  if (!module?.hasDockerfile) result += "Dockerfile, ";
  if (!module?.hasPipeline) result += "CI/CD Pipeline File, ";

  return result.slice(0, -2);
}

const parseCICDWorkflowType = (workflowType: string) => {
  switch (workflowType) {
    case "github":
      return "GitHub Actions";
    case "jenkins":
      return "Jenkins";
    default:
      return "None";
  }
}

function ModulePage() {
  const { module } = useParams();
  const access_token = useAuthState((state) => state.accessToken);
  const moduleServiceRef = useRef(new ModuleService());
  const commitServiceRef = useRef(new CommitService());

  const [moduleData, setModuleData] = useState<ModuleData>();
  const [commits, setCommits] = useState<CommitRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const getModuleDetails = useCallback(
    async (module: string) => {
      if (!access_token || !module) return;
      const moduleDetails = await moduleServiceRef.current.getModuleData(
        access_token,
        module
      );
      console.log(moduleDetails);
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
      console.log(commitDetails);
      return commitDetails;
    },
    [access_token]
  );

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

  useEffect(() => {
    console.log(module);
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
              <ToolbarButton design="Emphasized" text="Trigger Deployment" />
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
        >
          <ObjectStatus state="Positive">deployed</ObjectStatus>
        </ObjectPageTitle>
      }
      placeholder={error && <IllustratedMessage name="UnableToLoad" />}
    >
      <ObjectPageSection
        aria-label="General Information"
        id="general-info"
        titleText="General Information"
      >
        <ObjectPageSubSection id="repo-info" titleText="Repository Information">
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
              <Text>{parseCICDWorkflowType(moduleData?.workflowType as string)}</Text>
            </FormItem>
            <FormItem
              labelContent={<Label>AI Generated Files</Label>}
            >
              <Text>{moduleData && parseAIGeneratedFiles(moduleData)}</Text>
            </FormItem>
            <FormItem labelContent={<Label showColon>Branch</Label>}>
              <Text>{moduleData?.branch}</Text>
            </FormItem>
            <FormItem labelContent={<Label showColon>Email</Label>}>
              <Link href={`mailto:${moduleData?.email}`}>{moduleData?.email}</Link>
            </FormItem>
          </Form>
        </ObjectPageSubSection>
      </ObjectPageSection>

      <ObjectPageSection aria-label="Commits" id="commits" titleText="Commits">
        <FlexBox style={{marginTop: '0.5rem'}} direction="Column" fitContainer>
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
  );
}

export default ModulePage;
