const DeleteConfirmModal = ({ open, title, message, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="delete-modal-backdrop">
      <div className="delete-modal">
        <h5>{title}</h5>
        <p className="text-muted">{message}</p>
        <div className="d-flex justify-content-end gap-2">
          <button className="btn btn-light" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;

