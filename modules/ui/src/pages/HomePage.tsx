import {
  Table,
  TableCell,
  TableHeaderCell,
  TableHeaderRow,
  TableRow,
  TableSelection,
  Title,
} from "@ui5/webcomponents-react";

const TableHeader = ({ slot }: { slot?: string }) => {
  return (
    <TableHeaderRow slot={slot} sticky>
      <TableHeaderCell>Module Name</TableHeaderCell>
      <TableHeaderCell>Version</TableHeaderCell>
      <TableHeaderCell>Time</TableHeaderCell>
      <TableHeaderCell></TableHeaderCell>
    </TableHeaderRow>
  );
};

export const HomePage = () => {
  return (
    <section>
      <Title style={{ marginBottom: "1rem" }} level="H1">
        Home Page
      </Title>

      <div style={{ gap: "2rem" }}>
        <Table headerRow={<TableHeader />} rowActionCount={3}>
          <TableSelection mode="Multiple" slot="features" />
          <TableRow rowKey="row-1">
            <TableCell>Module 1</TableCell>
            <TableCell>1.0.0</TableCell>
            <TableCell>1:00 PM</TableCell>
            <TableCell></TableCell>
          </TableRow>
          <TableRow rowKey="row-2">
            <TableCell>Module 2</TableCell>
            <TableCell>2.0.0</TableCell>
            <TableCell>2:00 PM</TableCell>
            <TableCell></TableCell>
          </TableRow>
          <TableRow rowKey="row-3">
            <TableCell>Module 3</TableCell>
            <TableCell>3.0.0</TableCell>
            <TableCell>3:00 PM</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </Table>
      </div>
    </section>
  );
};
