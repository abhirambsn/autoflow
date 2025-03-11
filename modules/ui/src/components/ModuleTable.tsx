import {
  Link,
  Table,
  TableCell,
  TableHeaderCell,
  TableHeaderRow,
  TableRow,
  TableSelection,
  TableSelectionDomRef,
  TableVirtualizer,
  Text,
  Ui5CustomEvent,
} from "@ui5/webcomponents-react";

type ModuleTableProps = {
  modules: ModuleData[];
  loading: boolean;
  onModuleSelect?: (e: Ui5CustomEvent<TableSelectionDomRef, never>) => void;
};

const parseWorkflowData = (workflowType: "github" | "jenkins" | "none") => {
  switch (workflowType) {
    case "github":
      return "GitHub Actions";
    case "jenkins":
      return "Jenkins";
    default:
      return "None";
  }
};

const TableHeader = ({ slot }: { slot?: string }) => {
  return (
    <TableHeaderRow slot={slot} sticky>
      <TableHeaderCell>Module Name</TableHeaderCell>
      <TableHeaderCell>Version</TableHeaderCell>
      <TableHeaderCell>Repository</TableHeaderCell>
      <TableHeaderCell>CI/CD Provider</TableHeaderCell>
      <TableHeaderCell>Branch</TableHeaderCell>
      <TableHeaderCell>Email</TableHeaderCell>
      <TableHeaderCell>Created At</TableHeaderCell>
      <TableHeaderCell></TableHeaderCell>
    </TableHeaderRow>
  );
};

const ModuleTable = ({
  modules,
  loading,
  onModuleSelect,
}: ModuleTableProps) => {
  return (
    <Table loading={loading} loadingDelay={50} headerRow={<TableHeader />}>
      <TableVirtualizer slot="features" rowCount={10} />
      <TableSelection
        mode="Multiple"
        onChange={onModuleSelect}
        slot="features"
      />
      {modules.map((module) => (
        <TableRow key={module.id} rowKey={module.id}>
          <TableCell>
            <Link
              target="_blank"
              rel="noopener noreferrer"
              href={`/modules/${module.id}`}
            >
              {module.name}
            </Link>
          </TableCell>
          <TableCell>
            <Text>{module.version}</Text>
          </TableCell>
          <TableCell>
            <Link
              target="_blank"
              rel="noopener noreferrer"
              href={module.repo.url}
            >
              {module.repo.name}
            </Link>
          </TableCell>
          <TableCell>
            <Text>{parseWorkflowData(module.workflowType)}</Text>
          </TableCell>
          <TableCell>
            <Text>{module.branch}</Text>
          </TableCell>
          <TableCell>
            <Link
              target="_blank"
              rel="noopener noreferrer"
              href={`mailto:${module.email}`}
            >
              {module.email}
            </Link>
          </TableCell>
          <TableCell>
            {module.createdAt ? (
              <Text>{new Date(module.createdAt).toLocaleString()}</Text>
            ) : (
              <Text>Unknown</Text>
            )}
          </TableCell>
        </TableRow>
      ))}
    </Table>
  );
};

export default ModuleTable;
