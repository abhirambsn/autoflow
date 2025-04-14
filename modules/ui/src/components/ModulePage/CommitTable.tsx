import {
  Button,
  FlexBox,
  IllustratedMessage,
  Link,
  Popover,
  Table,
  TableCell,
  TableHeaderCell,
  TableHeaderRow,
  TableRow,
  TableSelectionDomRef,
  TableVirtualizer,
  Text,
  Ui5CustomEvent,
} from "@ui5/webcomponents-react";
import { format } from "date-fns";
import { useState } from "react";

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
      <TableHeaderCell>Repository</TableHeaderCell>
      <TableHeaderCell>Time</TableHeaderCell>
      <TableHeaderCell></TableHeaderCell>
    </TableHeaderRow>
  );
};

export const CommitTable = ({ commits, loading }: Props) => {
  const [infoPopoverOpen, setInfoPopoverOpen] = useState(false);
  const [selectedCommit, setSelectedCommit] = useState<CommitRecord | null>(
    null
  );

  const openInfoPopover = (currentCommit: CommitRecord) => {
    setInfoPopoverOpen(true);
    setSelectedCommit(currentCommit);
  };

  return (
    <>
      <Table
        loading={loading}
        loadingDelay={50}
        headerRow={<TableHeader />}
        nodata={<IllustratedMessage name="NoData" />}
      >
        <TableVirtualizer slot="features" rowCount={10} />
        {commits.map((commit, index) => (
          <TableRow key={index} rowKey={commit._id}>
            <TableCell>
              <Text>{commit.commitId}</Text>
            </TableCell>
            <TableCell>
              <Text>{commit.module.name}</Text>
            </TableCell>
            <TableCell>
              <Text>{format(commit.commitTime, "MMMM do, yyyy H:mma")}</Text>
            </TableCell>
            <TableCell>
              <Button
                onClick={() => openInfoPopover(commit)}
                id="openInfoPopover"
                icon="hint"
              ></Button>
            </TableCell>
          </TableRow>
        ))}
      </Table>

      <Popover
        open={infoPopoverOpen}
        opener="openInfoPopover"
        onClose={() => setInfoPopoverOpen(false)}
        headerText="Build Info"
      >
        <FlexBox gap={"0.5rem"} direction="Column">
          <FlexBox gap={"0.5rem"} direction="Row">
            <Text style={{ fontWeight: "bold" }}>Repository: </Text>
            <Link href={selectedCommit?.link} target="_blank">
              {selectedCommit?.module.name}
            </Link>
          </FlexBox>
          <FlexBox gap={"0.5rem"} direction="Row">
            <Text style={{ fontWeight: "bold" }}>Branch: </Text>
            <Text>{selectedCommit?.branch}</Text>
          </FlexBox>
          <FlexBox gap={"0.5rem"} direction="Row">
            <Text style={{ fontWeight: "bold" }}>Author: </Text>
            <Link href={`mailto:${selectedCommit?.email}`} target="_blank">
              {selectedCommit?.author}
            </Link>
          </FlexBox>
          <FlexBox gap={"0.5rem"} direction="Row">
            <Text style={{ fontWeight: "bold" }}>Commit Message: </Text>
            <Text>{selectedCommit?.message}</Text>
          </FlexBox>
        </FlexBox>
      </Popover>
    </>
  );
};
