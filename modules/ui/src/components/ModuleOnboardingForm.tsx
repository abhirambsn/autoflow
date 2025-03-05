import {
  CheckBox,
  Form,
  FormGroup,
  FormItem,
  Icon,
  Label,
  Option,
  Select,
  Tag,
  TextArea,
} from "@ui5/webcomponents-react";
import StandardInputField from "./StandardInputField";
import InputType from "@ui5/webcomponents/dist/types/InputType.js";
import { capitalizeText } from "@/utils";

type ModuleOnboardingFormProps = {
  moduleOnboardingData: ModuleData;
  selectedRepo: Repo;
  selectRepoBranches: string[];
  editFormValue: (key: string, value: string) => void;
  handleRelatedBooleanChange: (
    key: string,
    relatedKey: string,
    value: boolean
  ) => void;
  reviewMode: boolean;
};

const ModuleOnboardingForm = ({
  moduleOnboardingData,
  selectedRepo,
  selectRepoBranches,
  editFormValue,
  handleRelatedBooleanChange,
  reviewMode,
}: ModuleOnboardingFormProps) => {
  function mapWorkflowTypeToText(type: string) {
    switch (type) {
      case "github":
        return "Github Actions";
      case "jenkins":
        return "Jenkins";
      case "none":
        return "None";
      default:
        return "";
    }
  }
  return (
    <Form labelSpan="S12 M4 L4 XL4" layout="S1 M1 L2 XL2">
      <FormGroup headerText="Module Details">
        <FormItem labelContent={<Label>Module Name</Label>}>
          <StandardInputField
            editMode={!reviewMode}
            value={moduleOnboardingData.name}
            onInput={(e) => editFormValue("name", e.target.value)}
            inputType={InputType.Text}
            required
          />
        </FormItem>
        <FormItem labelContent={<Label>Version</Label>}>
          <StandardInputField
            editMode={!reviewMode}
            value={moduleOnboardingData.version}
            onInput={(e) => editFormValue("version", e.target.value)}
            inputType={InputType.Text}
            required
          />
        </FormItem>
        <FormItem labelContent={<Label>Branch</Label>}>
          {reviewMode ? (
            <StandardInputField
              editMode={false}
              value={moduleOnboardingData.branch}
              onInput={() => {}}
              inputType={InputType.Text}
            />
          ) : (
            <Select
              onChange={(e) => editFormValue("branch", e.target.value)}
              required
              valueState="None"
            >
              {selectRepoBranches.map((branch) => (
                <Option key={branch}>{branch}</Option>
              ))}
            </Select>
          )}
        </FormItem>
        <FormItem labelContent={<Label>Description</Label>}>
          {reviewMode ? (
            <StandardInputField
              editMode={false}
              value={moduleOnboardingData.description}
              onInput={() => {}}
              inputType={InputType.Text}
            />
          ) : (
            <TextArea
              value={moduleOnboardingData.description}
              onInput={(e) => editFormValue("description", e.target.value)}
              rows={5}
              placeholder="A short module description"
            />
          )}
        </FormItem>
        <FormItem labelContent={<Label>Email</Label>}>
          <StandardInputField
            editMode={!reviewMode}
            value={moduleOnboardingData.email}
            onInput={(e) => editFormValue("email", e.target.value)}
            inputType={InputType.Email}
            placeholder="Enter you email (notification will be sent here)"
            required
          />
        </FormItem>
      </FormGroup>
      <FormGroup headerText="Repository Details">
        <FormItem labelContent={<Label>Name</Label>}>
          <StandardInputField
            editMode={!reviewMode}
            value={selectedRepo.name}
            disabled
          />
        </FormItem>
        <FormItem labelContent={<Label>Github Link</Label>}>
          <StandardInputField
            editMode={!reviewMode}
            value={selectedRepo.url}
            inputType={InputType.URL}
            disabled
          />
        </FormItem>
        <FormItem labelContent={<Label>Description</Label>}>
          <StandardInputField
            editMode={!reviewMode}
            value={selectedRepo.description}
            disabled
          />
        </FormItem>
        <FormItem labelContent={<Label>Author</Label>}>
          <StandardInputField
            editMode={!reviewMode}
            value={selectedRepo.author}
            disabled
          />
        </FormItem>

        {reviewMode && (
          <FormItem labelContent={<Label>Type</Label>}>
            <Tag
              colorScheme={selectedRepo.type === "private" ? "6" : "5"}
              icon={
                <Icon
                  name={selectedRepo.type === "private" ? "locked" : "unlocked"}
                />
              }
              design="Set2"
            >
              {capitalizeText(selectedRepo.type)}
            </Tag>
          </FormItem>
        )}
      </FormGroup>

      <FormGroup headerText="Deployment Settings">
        <FormItem labelContent={<Label>Pipeline Type</Label>}>
          {reviewMode ? (
            <StandardInputField
              editMode={false}
              value={mapWorkflowTypeToText(moduleOnboardingData.workflowType)}
              onInput={() => {}}
              inputType={InputType.Text}
            />
          ) : (
            <Select
              disabled={!moduleOnboardingData.requiresPipeline}
              onChange={(e) => editFormValue("workflowType", e.target.value)}
              value={moduleOnboardingData.workflowType}
            >
              <Option value="github">Github Actions</Option>
              <Option value="jenkins">Jenkins</Option>
              <Option value="none">None</Option>
            </Select>
          )}
        </FormItem>

        <FormItem labelContent={<Label>Generate Dockerfile</Label>}>
          {reviewMode ? (
            <StandardInputField
              editMode={false}
              value={moduleOnboardingData.requiresDockerfile ? "Yes" : "No"}
              onInput={() => {}}
              inputType={InputType.Text}
            />
          ) : (
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
          )}
        </FormItem>

        <FormItem labelContent={<Label>Generate Docker Compose</Label>}>
          {reviewMode ? (
            <StandardInputField
              editMode={false}
              value={moduleOnboardingData.requiresDockerCompose ? "Yes" : "No"}
              onInput={() => {}}
              inputType={InputType.Text}
            />
          ) : (
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
          )}
        </FormItem>

        <FormItem labelContent={<Label>Generate Kubernetes Manifests</Label>}>
          {reviewMode ? (
            <StandardInputField
              editMode={false}
              value={moduleOnboardingData.requiresKubernetes ? "Yes" : "No"}
              onInput={() => {}}
              inputType={InputType.Text}
            />
          ) : (
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
          )}
        </FormItem>

        <FormItem labelContent={<Label>Generate Pipeline File</Label>}>
          {reviewMode ? (
            <StandardInputField
              editMode={false}
              value={moduleOnboardingData.requiresPipeline ? "Yes" : "No"}
              onInput={() => {}}
              inputType={InputType.Text}
            />
          ) : (
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
          )}
        </FormItem>
      </FormGroup>

      <FormGroup headerText="Other Details">
        <FormItem labelContent={<Label>Other Requirements (if any)</Label>}>
          {reviewMode ? (
            <StandardInputField
              editMode={false}
              value={moduleOnboardingData.otherRequirements || "None"}
              onInput={() => {}}
              inputType={InputType.Text}
            />
          ) : (
            <TextArea
              value={moduleOnboardingData.otherRequirements}
              onInput={(e) =>
                editFormValue("otherRequirements", e.target.value)
              }
              rows={5}
              placeholder="Write additonal requirements in the files (if any)"
            />
          )}
        </FormItem>
      </FormGroup>
    </Form>
  );
};

export default ModuleOnboardingForm;
