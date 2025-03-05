import Pagination from "@/components/Pagination";
import { RepositoryService } from "@/service/RepositoryService";
import { useAuthState } from "@/store";
import { calculatePageSlice, capitalizeText } from "@/utils";
import {
  Bar,
  BusyIndicator,
  Button,
  FlexBox,
  Icon,
  Input,
  InputDomRef,
  Link,
  Table,
  TableCell,
  TableHeaderCell,
  TableHeaderRow,
  TableRow,
  TableSelection,
  TableVirtualizer,
  Tag,
  Text,
  Title,
  Ui5CustomEvent,
} from "@ui5/webcomponents-react";
import { useCallback, useEffect, useRef, useState } from "react";

const TableHeader = ({ slot }: { slot?: string }) => {
  return (
    <TableHeaderRow slot={slot} sticky>
      <TableHeaderCell>Id</TableHeaderCell>
      <TableHeaderCell>Repository Name</TableHeaderCell>
      <TableHeaderCell>Repo Type</TableHeaderCell>
      <TableHeaderCell>Description</TableHeaderCell>
      <TableHeaderCell></TableHeaderCell>
    </TableHeaderRow>
  );
};

export const RepositoriesPage = () => {
  const service = new RepositoryService();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const handleSearch = (e: Ui5CustomEvent<InputDomRef>) => {
    setSearchTerm(e.target.value);
  };
  const [repos, setRepos] = useState<Repo[]>([]);
  const [filteredRepos, setFilteredRepos] = useState<Repo[]>([]);
  const [slicedRepos, setSlicedRepos] = useState<Repo[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const accessToken = useAuthState((state) => state.accessToken);
  const serviceRef = useRef(service);

  const onPageChange = useCallback(
    (page: number) => {
      if (loading) return;
      setLoading(true);
      console.log("Page changed to: ", page);
      const { start, end } = calculatePageSlice(page, 10, filteredRepos.length);
      console.log(
        "Slice: ",
        start,
        end,
        filteredRepos.slice(start, end),
        filteredRepos.length
      );
      setSlicedRepos(filteredRepos.slice(start, end));
      setLoading(false);
    },
    [filteredRepos, loading]
  );

  useEffect(() => {
    setLoading(true);
    (async () => {
      if (!accessToken) return;
      const data = await serviceRef.current.getRepositories(accessToken);
      setRepos(data);
      setFilteredRepos(data);
      setLoading(false);
    })();
  }, [accessToken]);

  async function refreshRepos() {
    setLoading(true);
    if (!accessToken) return;
    const data = await serviceRef.current.getRepositories(accessToken, true);
    setRepos(data);
    setFilteredRepos(data);
    setLoading(false);
  }

  function triggerSearch() {
    if (!searchTerm || searchTerm.length < 3) return;
    const searchFilteredRepos = repos.filter((repo) => {
      return (
        repo.full_name.includes(searchTerm) ||
        repo.description?.includes(searchTerm) ||
        repo.type.includes(searchTerm)
      );
    });

    setFilteredRepos(searchFilteredRepos);
  }

  function clearSearch() {
    setSearchTerm("");
    setFilteredRepos(repos);
  }

  return (
    <section>
      <Title style={{ marginBottom: "1rem" }} level="H1">
        My Repositories
      </Title>

      <div style={{ gap: "2rem" }}>
        <BusyIndicator
          style={{ display: "block" }}
          active={loading}
          delay={5}
          size="M"
        >
          <FlexBox direction="Column" fitContainer>
            <Bar design="Header">
              <div slot="startContent">
                <Text>
                  Showing {(currentPage-1) * 10} to {(currentPage-1) * 10 + 10} of{" "}
                  {filteredRepos.length} records
                </Text>
              </div>
              <Input
                placeholder="Search by name, description"
                icon={<Icon name="search" />}
                onInput={handleSearch}
                onChange={triggerSearch}
              />
              <div slot="endContent">
                <Button
                  icon="clear-filter"
                  tooltip="Clear Search Filters"
                  onClick={clearSearch}
                />
                <Button
                  icon="refresh"
                  onClick={refreshRepos}
                  tooltip="Refresh Data"
                />
              </div>
            </Bar>
            <Table headerRow={<TableHeader />} rowActionCount={1}>
              <TableSelection mode="Multiple" slot="features" />
              <TableVirtualizer rowCount={10} slot="features" />
              {slicedRepos.map((repo) => (
                <TableRow key={repo.id} rowKey={repo.id}>
                  <TableCell>
                    <Text>{repo.id}</Text>
                  </TableCell>
                  <TableCell>
                    <Text>
                      <Link
                        target="_blank"
                        rel="noopener noreferer"
                        href={repo.url}
                      >
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
            <Pagination
              dataSize={filteredRepos.length}
              perPage={10}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              onPageChange={onPageChange}
            />
          </FlexBox>
        </BusyIndicator>
      </div>
    </section>
  );
};
