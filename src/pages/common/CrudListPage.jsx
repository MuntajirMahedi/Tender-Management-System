import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import usePagination from "../../hooks/usePagination";
import useDebounce from "../../hooks/useDebounce";
import DataTable from "../../components/DataTable";
import PageHeader from "../../components/PageHeader";

const CrudListPage = ({
  title,
  subtitle,
  columns,
  fetcher,
  dataKey,
  createPath,
  filters = [],
  actions,
  headerExtras,
  transformParams,
  responseAdapter
}) => {
  const { page, pageSize, setPage, setPageSize } = usePagination();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [filterValues, setFilterValues] = useState({});
  const debouncedSearch = useDebounce(search, 500);

  const params = useMemo(
    () => ({
      page,
      limit: pageSize,
      search: debouncedSearch,
      ...filterValues
    }),
    [page, pageSize, debouncedSearch, filterValues]
  );

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await fetcher(
          transformParams ? transformParams(params) : params
        );
        const adapted = responseAdapter
          ? responseAdapter(response)
          : {
              items: response[dataKey] || [],
              total: response.count || response.total || 0
            };
        setRecords(adapted.items);
        setTotal(adapted.total);
      } catch (error) {
        console.error(`Failed to load ${title}`, error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [fetcher, params, transformParams, responseAdapter, dataKey, title]);

  const filterControls = filters.map((filter) => {
    if (filter.type === "select") {
      return (
        <div key={filter.key}>
          <label className="form-label text-muted small mb-1">
            {filter.label}
          </label>
          <select
            className="form-select"
            value={filterValues[filter.key] || ""}
            onChange={(event) =>
              setFilterValues((prev) => ({
                ...prev,
                [filter.key]: event.target.value || undefined
              }))
            }
          >
            <option value="">All</option>
            {filter.options.map((option) => (
              <option key={option.value || option} value={option.value || option}>
                {option.label || option}
              </option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <div key={filter.key}>
        <label className="form-label text-muted small mb-1">
          {filter.label}
        </label>
        <input
          className="form-control"
          placeholder={filter.placeholder}
          value={filterValues[filter.key] || ""}
          onChange={(event) =>
            setFilterValues((prev) => ({
              ...prev,
              [filter.key]: event.target.value || undefined
            }))
          }
        />
      </div>
    );
  });

  return (
    <div>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={[
          headerExtras,
          createPath && (
            <Link key="create" to={createPath} className="btn btn-primary">
              <i className="bi bi-plus-circle me-2" />
              Add {title.slice(0, -1)}
            </Link>
          )
        ]}
      />

      <div className="d-flex flex-wrap align-items-end gap-3 mb-3">
        <div style={{ minWidth: 220 }}>
          <label className="form-label text-muted small mb-1">Search</label>
          <input
            className="form-control"
            placeholder={`Search ${title.toLowerCase()}`}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        {filterControls}
        {Object.keys(filterValues).length > 0 && (
          <button
            className="btn btn-link text-decoration-none"
            onClick={() => setFilterValues({})}
          >
            Clear filters
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={records}
        loading={loading}
        actions={actions}
        pagination={{
          page,
          pageSize,
          total,
          onPageChange: setPage,
          onPageSizeChange: setPageSize
        }}
      />
    </div>
  );
};

export default CrudListPage;

