import ModuleTable from "@/components/ModuleTable";
import Pagination from "@/components/Pagination";
import { ModuleService } from "@/service/ModuleService";
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
import { AxiosError } from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

export const HomePage = () => {
  const navigate = useNavigate();
  const onboardedModules = useRepoState((state) => state.onboardedRepos);
  const setRepoState = useRepoState((state) => state.setRepoState);
  const moduleServiceRef = useRef(new ModuleService());

  const isAuthenticated = useAuthState((state) => state.isAuthenticated);
  const accessToken = useAuthState((state) => state.accessToken);
  const user = useAuthState((state) => state.user);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredModules, setFilteredModules] = useState<ModuleData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [slicedModules, setSlicedModules] = useState<ModuleData[]>([]);

  const handleSearch = (e: Ui5CustomEvent<InputDomRef>) => {
    setSearchTerm(e.target.value);
  };

  const onPageChange = useCallback(
    (page: number) => {
      if (loading) return;
      setLoading(true);
      const { start, end } = calculatePageSlice(
        page,
        10,
        filteredModules.length
      );
      setSlicedModules(filteredModules.slice(start, end));
      setLoading(false);
    },
    [filteredModules, loading]
  );

  function triggerSearch() {
    if (!searchTerm || searchTerm.length < 3) return;
    const searchFilteredModules = onboardedModules.filter((module) => {
      return (
        module.name.includes(searchTerm) ||
        module.description?.includes(searchTerm) ||
        module.repo.name.includes(searchTerm) ||
        module.repo.description.includes(searchTerm)
      );
    });

    setFilteredModules(searchFilteredModules);
  }

  function clearSearch() {
    setSearchTerm("");
    setFilteredModules(onboardedModules);
  }

  async function refreshModules() {
    setLoading(true);
    if (!accessToken) return;
    const data = await moduleServiceRef.current.getModules(
      accessToken,
      user.id,
      true
    );
    setRepoState({ repos: data });
    setFilteredModules(data);
    setLoading(false);
  }

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    (async () => {
      try {
        const data = await moduleServiceRef.current.getModules(
          accessToken,
          user.id
        );
        setRepoState({ onboardedRepos: data });
        setFilteredModules(data);
        setLoading(false);
      } catch (err) {
        if (err instanceof AxiosError && err.response?.status === 403) {
          navigate("/login");
        } else {
          console.error("[REPO SVC ERROR]", err);
        }
        setLoading(false);
      }
    })();
  }, [accessToken, isAuthenticated, setRepoState, user, navigate]);

  return (
    <section>
      <Title style={{ marginBottom: "1rem" }} level="H1">
        Home Page
      </Title>

      <div style={{ gap: "2rem" }}>
        <FlexBox direction="Column" fitContainer>
          <Bar design="Header">
            <div slot="startContent">
              <Text>
                Showing {(currentPage - 1) * 10} to{" "}
                {(currentPage - 1) * 10 + 10} of {filteredModules.length}{" "}
                records
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
                  onClick={refreshModules}
                  tooltip="Refresh Data"
                />
              </FlexBox>
            </div>
          </Bar>
          <ModuleTable modules={slicedModules} loading={loading} />
          <Pagination
            dataSize={filteredModules.length}
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
