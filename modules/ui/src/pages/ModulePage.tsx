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
                {capitalizeText(moduleData?.repo?.type || '')}
              </Tag>
            </FormItem>
          </Form>
        </ObjectPageSubSection>

        <ObjectPageSubSection id="module-info" titleText="Module Informaton">
          <div>Module Info</div>
        </ObjectPageSubSection>
      </ObjectPageSection>

      <ObjectPageSection aria-label="Commits" id="commits" titleText="Commits">
        <FlexBox direction="Column" fitContainer>
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

      {/* <ObjectPageSection
        aria-label="Employment"
        id="employment"
        titleText="Employment"
      >
        <ObjectPageSubSection
          aria-label="Job Information"
          id="employment-job-information"
          titleText="Job Information"
        >
          <Form>
            <FormItem
              labelContent={<Label showColon>Job Classification</Label>}
            >
              <FlexBox direction="Column">
                <Text>Senior UI Developer</Text>
                <Label>(UIDEV-SR)</Label>
              </FlexBox>
            </FormItem>
            <FormItem labelContent={<Label showColon>Job Title</Label>}>
              <Text>Developer</Text>
            </FormItem>
            <FormItem labelContent={<Label showColon>Employee Class</Label>}>
              <Text>Employee</Text>
            </FormItem>
            <FormItem labelContent={<Label showColon>Manager</Label>}>
              <FlexBox direction="Column">
                <Text>Dan Smith</Text>
                <Label>Development Manager</Label>
              </FlexBox>
            </FormItem>
            <FormItem labelContent={<Label showColon>Pay Grade</Label>}>
              <Text>Salary Grade 18 (GR-14)</Text>
            </FormItem>
            <FormItem labelContent={<Label showColon>FTE</Label>}>
              <Text>1</Text>
            </FormItem>
          </Form>
        </ObjectPageSubSection>
        <ObjectPageSubSection
          aria-label="Employee Details"
          id="employment-employee-details"
          titleText="Employee Details"
        >
          <Form>
            <FormItem labelContent={<Label showColon>Start Date</Label>}>
              <Text>Jan 01, 2018</Text>
            </FormItem>
            <FormItem labelContent={<Label showColon>End Date</Label>}>
              <Text>Dec 31, 9999</Text>
            </FormItem>
            <FormItem
              labelContent={<Label showColon>Payroll Start Date</Label>}
            >
              <Text>Jan 01, 2018</Text>
            </FormItem>
            <FormItem
              labelContent={<Label showColon>Benefits Start Date</Label>}
            >
              <Text>Jul 01, 2018</Text>
            </FormItem>
            <FormItem
              labelContent={<Label showColon>Company Car Eligibility</Label>}
            >
              <Text>Jan 01, 2021</Text>
            </FormItem>
            <FormItem labelContent={<Label showColon>Equity Start Date</Label>}>
              <Text>Jul 01, 2018</Text>
            </FormItem>
          </Form>
        </ObjectPageSubSection>
        <ObjectPageSubSection
          aria-label="Job Relationship"
          id="employment-job-relationship"
          titleText="Job Relationship"
        >
          <Form>
            <FormItem labelContent={<Label showColon>Manager</Label>}>
              <Text>John Doe</Text>
            </FormItem>
            <FormItem labelContent={<Label showColon>Scrum Master</Label>}>
              <Text>Michael Adams</Text>
            </FormItem>
            <FormItem labelContent={<Label showColon>Product Owner</Label>}>
              <Text>John Miller</Text>
            </FormItem>
          </Form>
        </ObjectPageSubSection>
      </ObjectPageSection> */}
    </ObjectPage>
  );
}

export default ModulePage;
