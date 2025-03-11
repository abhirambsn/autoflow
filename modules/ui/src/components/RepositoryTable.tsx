import { capitalizeText } from "@/utils";
import {
  Icon,
  IllustratedMessage,
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
  Ui5CustomEvent,
} from "@ui5/webcomponents-react";

const TableHeader = ({
  slot,
  type,
}: {
  slot?: string;
  type: "detail" | "wizard";
}) => {
  return type === "wizard" ? (
    <TableHeaderRow slot={slot} sticky>
      <TableHeaderCell>Repository Name</TableHeaderCell>
      <TableHeaderCell>Type</TableHeaderCell>
      <TableHeaderCell>Link</TableHeaderCell>
    </TableHeaderRow>
  ) : (
    <TableHeaderRow slot={slot} sticky>
      <TableHeaderCell>ID</TableHeaderCell>
      <TableHeaderCell>Repository Name</TableHeaderCell>
      <TableHeaderCell>Repo Type</TableHeaderCell>
      <TableHeaderCell>Description</TableHeaderCell>
    </TableHeaderRow>
  );
};

type RepoTableProps = {
  repos: Repo[];
  type: "detail" | "wizard";
  searchTerm?: string;
  onRepoSelect?: (e: Ui5CustomEvent<TableSelectionDomRef, never>) => void;
  loading?: boolean;
};
const RepositoryTable = ({
  repos,
  onRepoSelect,
  type,
  loading,
  searchTerm,
}: RepoTableProps) => {
  if (type === "wizard") {
    return (
      <Table
        headerRow={<TableHeader type={type} />}
        nodata={<IllustratedMessage name="NoData" />}
      >
        <TableVirtualizer slot="features" rowCount={10} />
        <TableSelection onChange={onRepoSelect} mode="Single" slot="features" />

        {repos
          .filter((repo) => repo.name.includes(searchTerm as string))
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
                <Link href={repo.url} rel="noopener noreferer" target="_blank">
                  {repo.url}
                </Link>
              </TableCell>
            </TableRow>
          ))}
      </Table>
    );
  } else {
    return (
      <Table
        loading={loading}
        loadingDelay={50}
        headerRow={<TableHeader type={type} />}
        nodata={<IllustratedMessage name="NoData" />}
      >
        <TableSelection mode="Multiple" slot="features" />
        <TableVirtualizer rowCount={10} slot="features" />
        {repos.map((repo) => (
          <TableRow key={repo.id} rowKey={repo.id}>
            <TableCell>
              <Text>{repo.id}</Text>
            </TableCell>
            <TableCell>
              <Text>
                <Link target="_blank" rel="noopener noreferer" href={repo.url}>
                  {repo.full_name}
                </Link>
              </Text>
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
              <Text emptyIndicatorMode="On">{repo.description}</Text>
            </TableCell>
          </TableRow>
        ))}
      </Table>
    );
  }
};

export default RepositoryTable;
