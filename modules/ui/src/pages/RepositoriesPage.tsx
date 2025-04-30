import Pagination from "@/components/Pagination";
import RepositoryTable from "@/components/RepositoryTable";
import { RepositoryService } from "@/service/RepositoryService";
import { useAuthState, useRepoState } from "@/store";
import { calculatePageSlice } from "@/utils";
import {
  Bar,
  Button,
  FlexBox,
  Icon,
  Input,
  InputDomRef,
  Text,
  Title,
  Ui5CustomEvent,
} from "@ui5/webcomponents-react";
import { useCallback, useEffect, useRef, useState } from "react";

export const RepositoriesPage = () => {
  const service = new RepositoryService();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const handleSearch = (e: Ui5CustomEvent<InputDomRef>) => {
    setSearchTerm(e.target.value);
  };
  const repos = useRepoState((state) => state.repos);
  const setRepoState = useRepoState((state) => state.setRepoState);
  const [filteredRepos, setFilteredRepos] = useState<Repo[]>([]);
  const [slicedRepos, setSlicedRepos] = useState<Repo[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const accessToken = useAuthState((state) => state.accessToken);
  const serviceRef = useRef(service);

  const onPageChange = useCallback(
    (page: number) => {
      if (loading) return;
      setLoading(true);
      const { start, end } = calculatePageSlice(page, 10, filteredRepos.length);
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
      setRepoState({ repos: data });
      setFilteredRepos(data);
      setLoading(false);
    })();
  }, [setRepoState, accessToken]);

  async function refreshRepos() {
    setLoading(true);
    if (!accessToken) return;
    const data = await serviceRef.current.getRepositories(accessToken, true);
    setRepoState({ repos: data });
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
      <title>Autoflow | Repositories</title>
      <Title style={{ marginBottom: "1rem" }} level="H1">
        My Repositories
      </Title>

      <div style={{ gap: "2rem" }}>
        <FlexBox direction="Column" fitContainer>
          <Bar design="Header">
            <div slot="startContent">
              <Text>
                Showing {(currentPage - 1) * 10} to{" "}
                {(currentPage - 1) * 10 + 10} of {filteredRepos.length} records
              </Text>
            </div>
            <Input
              placeholder="Search by name, description"
              icon={<Icon name="search" />}
              onInput={handleSearch}
              onChange={triggerSearch}
            />
            <div slot="endContent">
              <FlexBox gap={"0.5rem"} alignItems="Center">
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
              </FlexBox>
            </div>
          </Bar>
          <RepositoryTable
            type="detail"
            repos={slicedRepos}
            loading={loading}
          />
          <Pagination
            dataSize={filteredRepos.length}
            perPage={10}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            onPageChange={onPageChange}
          />
        </FlexBox>
      </div>
    </section>
  );
};
