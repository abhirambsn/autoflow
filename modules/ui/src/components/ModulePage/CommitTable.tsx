import {
  IllustratedMessage,
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

type Props = {
  slot?: string;
  commits: CommitRecord[];
  onCommitSelect?: (e: Ui5CustomEvent<TableSelectionDomRef, never>) => void;
  loading?: boolean;
};

const TableHeader = ({ slot }: { slot?: string }) => {
  return (
    <TableHeaderRow slot={slot} sticky>
      <TableHeaderCell>ID</TableHeaderCell>
      <TableHeaderCell>Repository Name</TableHeaderCell>
      <TableHeaderCell>Repo Type</TableHeaderCell>
      <TableHeaderCell>Description</TableHeaderCell>
    </TableHeaderRow>
  );
};

export const CommitTable = ({ commits, onCommitSelect, loading }: Props) => {
  return (
    <Table
      loading={loading}
      loadingDelay={50}
      headerRow={<TableHeader />}
      nodata={<IllustratedMessage name="NoData" />}
    >
      <TableVirtualizer slot="features" rowCount={10} />
      <TableSelection onChange={onCommitSelect} mode="Single" slot="features" />
      {commits.map((commit) => (
        <TableRow key={commit.commitId} rowKey={commit.commitId}>
          <TableCell>
            <Text>{commit.commitId}</Text>
          </TableCell>
        </TableRow>
      ))}
    </Table>
  );
};
