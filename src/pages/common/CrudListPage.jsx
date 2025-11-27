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
  renderCreateButton,
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

  const [reloadKey, setReloadKey] = useState(0);

  const params = useMemo(
    () => ({
      page,
      limit: pageSize,
      search: debouncedSearch,
      ...filterValues,
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
              items: (response && response[dataKey]) || [],
              total: response?.count || response?.total || 0,
            };

        setRecords(adapted.items);
        setTotal(adapted.total);
      } catch (err) {
        console.error(`Failed to load ${title}`, err);
        setRecords([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [params, fetcher, transformParams, responseAdapter, dataKey, title, reloadKey]);

  useEffect(() => {
    const onReload = () => setReloadKey((k) => k + 1);
    window.addEventListener("reloadList", onReload);
    return () => window.removeEventListener("reloadList", onReload);
  }, []);

  // Filters UI
  const filterControls = filters.map((filter) => {
    const value = filterValues[filter.key] || "";

    return (
      <div key={filter.key} className="flex-grow-1" style={{ minWidth: 160 }}>
        <label className="form-label text-muted small mb-1">
          {filter.label}
        </label>

        {filter.type === "select" ? (
          <select
            className="form-select"
            value={value}
            onChange={(e) =>
              setFilterValues((prev) => ({
                ...prev,
                [filter.key]: e.target.value || undefined,
              }))
            }
          >
            <option value="">All</option>
            {filter.options?.map((opt) => (
              <option key={opt.value || opt} value={opt.value || opt}>
                {opt.label || opt}
              </option>
            ))}
          </select>
        ) : (
          <input
            className="form-control"
            value={value}
            placeholder={filter.placeholder}
            onChange={(e) =>
              setFilterValues((prev) => ({
                ...prev,
                [filter.key]: e.target.value || undefined,
              }))
            }
          />
        )}
      </div>
    );
  });

  // Create button
  const createButton = (() => {
    if (typeof renderCreateButton === "function") return renderCreateButton();

    if (createPath) {
      return (
        <Link to={createPath} className="btn btn-primary">
          <i className="bi bi-plus-circle me-2" />
          Add {title.slice(0, -1)}
        </Link>
      );
    }
    return null;
  })();

  return (
    <div>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={[headerExtras, createButton]}
      />

      {/* FILTER BAR */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">

            {/* Search */}
            <div className="col-lg-3 col-md-4 col-sm-6">
              <label className="form-label text-muted small mb-1">Search</label>
              <input
                className="form-control"
                placeholder={`Search ${title.toLowerCase()}`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Dynamic Filters */}
            {filters.length > 0 && (
              <div className="col-12 d-flex flex-wrap gap-3">
                {filterControls}
              </div>
            )}

            {/* Clear filters */}
            {Object.keys(filterValues).length > 0 && (
              <div className="col-12">
                <button
                  className="btn btn-link text-decoration-none p-0"
                  onClick={() => setFilterValues({})}
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MAIN TABLE */}
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
          onPageSizeChange: setPageSize,
        }}
      />
    </div>
  );
};

export default CrudListPage;
