import { useMemo, useState } from "react";

const usePagination = (initial = { page: 1, pageSize: 10 }) => {
  const [page, setPage] = useState(initial.page);
  const [pageSize, setPageSize] = useState(initial.pageSize);

  const offset = useMemo(() => (page - 1) * pageSize, [page, pageSize]);

  const updatePage = (nextPage) => {
    setPage(nextPage);
  };

  const updatePageSize = (nextSize) => {
    setPageSize(nextSize);
    setPage(1);
  };

  return {
    page,
    pageSize,
    offset,
    setPage: updatePage,
    setPageSize: updatePageSize
  };
};

export default usePagination;

