const Pagination = ({
  page,
  pageSize,
  total = 0,
  onPageChange,
  onPageSizeChange,
  pageSizes = [5, 10, 20, 50, 100]
}) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mt-3">
      <div className="d-flex align-items-center gap-2">
        <span className="text-muted small">Show</span>
        <select
          className="form-select form-select-sm"
          style={{ width: 80 }}
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
        >
          {pageSizes.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span className="text-muted small">entries</span>
      </div>
      <div className="btn-group">
        <button
          className="btn btn-outline-secondary btn-sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Prev
        </button>
        <button className="btn btn-outline-secondary btn-sm" disabled>
          Page {page} / {totalPages}
        </button>
        <button
          className="btn btn-outline-secondary btn-sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;

