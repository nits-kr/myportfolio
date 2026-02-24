import React, { useEffect } from "react";
import { useForm } from "react-hook-form";

export default function SubUserModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) {
  const { register, handleSubmit, reset, setValue } = useForm();

  useEffect(() => {
    if (initialData) {
      setValue("name", initialData.name);
      setValue("email", initialData.email);
      setValue("role", initialData.role);
      // Ensure permissions is an array if API returns something else, or leave empty
      setValue("permissions", initialData.permissions || []);
    } else {
      reset();
    }
  }, [initialData, setValue, reset]);

  const handleFormSubmit = (data) => {
    // If we're editing (initialData exists) and password is empty, remove it
    if (initialData && !data.password) {
      delete data.password;
    }
    onSubmit(data);
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal d-block"
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
      }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content glass-card border-0">
          <div className="modal-header border-bottom-0">
            <h5 className="modal-title">
              {initialData ? "Edit Sub User" : "Add Sub User"}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit(handleFormSubmit)}>
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input
                  {...register("name", { required: true })}
                  className="form-control bg-transparent text-light"
                  placeholder="Enter name"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  {...register("email", { required: true })}
                  className="form-control bg-transparent text-light"
                  placeholder="Enter email"
                  disabled={!!initialData} // Email usually shouldn't change or backend restriction
                />
              </div>
              <div className="mb-3">
                <label className="form-label">
                  Password{" "}
                  {initialData && (
                    <small className="text-muted">
                      (Leave blank to keep current)
                    </small>
                  )}
                </label>
                <input
                  type="password"
                  {...register("password", { required: !initialData })}
                  className="form-control bg-transparent text-light"
                  placeholder={
                    initialData ? "Enter new password" : "Enter password"
                  }
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Role</label>
                <select
                  {...register("role", { required: true })}
                  className="form-select bg-transparent text-light"
                >
                  <option className="text-dark" value="sub-admin">
                    Sub-Admin
                  </option>
                  <option className="text-dark" value="editor">
                    Editor
                  </option>
                  <option className="text-dark" value="viewer">
                    Viewer
                  </option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Permissions</label>
                <div className="d-flex flex-wrap gap-2">
                  {["read", "write", "delete", "publish"].map((perm) => (
                    <div key={perm} className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        value={perm}
                        id={`perm-${perm}`}
                        {...register("permissions")}
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`perm-${perm}`}
                      >
                        {perm.charAt(0).toUpperCase() + perm.slice(1)}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-outline-light"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {initialData ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
