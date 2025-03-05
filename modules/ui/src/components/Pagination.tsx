import {
  Toolbar,
  ToolbarButton,
  ToolbarSpacer,
} from "@ui5/webcomponents-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

type PaginationProps = {
  dataSize: number;
  perPage: number;
  currentPage: number;
  setCurrentPage: Dispatch<SetStateAction<number>>;
  onPageChange: (page: number) => void;
};

const Pagination = ({
  dataSize,
  perPage,
  currentPage,
  setCurrentPage,
  onPageChange,
}: PaginationProps) => {
  const [numPages, setNumPages] = useState<number>(1);
  useEffect(() => {
    setNumPages(dataSize / perPage);
  }, [dataSize, perPage]);

  useEffect(() => {
    onPageChange(currentPage);
  }, [onPageChange, currentPage]);

  return (
    <Toolbar>
      <ToolbarSpacer />
      <ToolbarButton
        icon="navigation-left-arrow"
        disabled={currentPage === 1}
        text="Previous"
        onClick={() => setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev))}
      />
      {Array.from({ length: numPages }).map((_, index) => (
        <ToolbarButton
          text={String(index + 1)}
          key={index + 1}
          design={currentPage === index + 1 ? "Emphasized" : "Default"}
          onClick={() => setCurrentPage(index + 1)}
        />
      ))}
      <ToolbarButton
        icon="navigation-right-arrow"
        disabled={currentPage === dataSize / perPage}
        text="Next"
        onClick={() =>
          setCurrentPage((prev) => (prev < numPages ? prev + 1 : prev))
        }
      />
      <ToolbarSpacer />
    </Toolbar>
  );
};

export default Pagination;
