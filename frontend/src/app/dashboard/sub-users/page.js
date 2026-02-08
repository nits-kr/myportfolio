"use client";

import React, { useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import SubUserModal from "@/components/subUser/SubUserModal";
import {
  useGetAllSubUsersQuery,
  useCreateSubUserMutation,
  useUpdateSubUserMutation,
  useDeleteSubUserMutation,
  useChangeSubUserStatusMutation,
  useSubuserDeleteStatusMutation,
} from "@/store/services/subUserApi";
import { useSelector } from "react-redux";

export default function SubUsersPage() {
  const { user } = useSelector((state) => state.auth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // API Hooks
  const { data: subUsersData, isLoading, error } = useGetAllSubUsersQuery();
  const [createSubUser] = useCreateSubUserMutation();
  const [updateSubUser] = useUpdateSubUserMutation();
  const [deleteSubUser] = useDeleteSubUserMutation();
  const [changeStatus] = useChangeSubUserStatusMutation();

  const subUsers = subUsersData?.subusers || [];

  const handleCreate = async (data) => {
    try {
      await createSubUser(data).unwrap();
      setIsModalOpen(false);
      alert("Sub User created successfully!");
    } catch (err) {
      console.error(err);
      alert(err?.data?.message || "Failed to create sub user");
    }
  };

  const handleUpdate = async (data) => {
    if (!selectedUser) return;
    try {
      await updateSubUser({ id: selectedUser._id, ...data }).unwrap();
      setIsModalOpen(false);
      setSelectedUser(null);
      alert("Sub User updated successfully!");
    } catch (err) {
      console.error(err);
      alert(err?.data?.message || "Failed to update sub user");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteSubUser(id).unwrap();
        alert("Sub User deleted successfully!");
      } catch (err) {
        console.error(err);
        alert(err?.data?.message || "Failed to delete sub user");
      }
    }
  };

  const handleStatusChange = async (id, currentStatus) => {
    const newStatus = currentStatus === true ? false : true;
    try {
      await changeStatus({ id, status: newStatus }).unwrap();
    } catch (err) {
      console.error(err);
      alert(err?.data?.message || "Failed to change status");
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  // Only Admin should access this, though ProtectedRoute + API checks also enforce it
  if (user && user.role !== "admin") {
    return (
      <ProtectedRoute>
        <div className="container py-5 text-center text-danger">
          <h3>Access Denied</h3>
          <p>Only Admins can manage sub-users.</p>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="fw-bold">Manage Sub-Users</h1>
            <p className="text-muted">
              Create and manage access for your team.
            </p>
          </div>
          <button className="btn btn-primary" onClick={openCreateModal}>
            + Add New User
          </button>
        </div>

        <div className="glass-card">
          <div className="table-responsive">
            <table
              className="table table-hover bg-transparent mb-0"
              style={{ "--bs-table-bg": "transparent" }}
            >
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Permissions</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-danger">
                      Failed to load users.
                    </td>
                  </tr>
                ) : subUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      No sub-users found.
                    </td>
                  </tr>
                ) : (
                  subUsers.map((subUser) => (
                    <tr key={subUser._id}>
                      <td>{subUser.name}</td>
                      <td>{subUser.email}</td>
                      <td>
                        <span className="badge bg-secondary">
                          {subUser.role}
                        </span>
                      </td>
                      <td>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={subUser.status}
                            onChange={() =>
                              handleStatusChange(subUser._id, subUser.status)
                            }
                          />
                          <label className="form-check-label small">
                            {subUser.status}
                          </label>
                        </div>
                      </td>
                      <td>
                        {subUser.permissions?.length > 0 ? (
                          subUser.permissions.map((p) => (
                            <span
                              key={p}
                              className="badge bg-dark me-1 border border-secondary"
                            >
                              {p}
                            </span>
                          ))
                        ) : (
                          <span className="text-muted small">None</span>
                        )}
                      </td>
                      <td>
                        {new Date(subUser.createdAt).toLocaleDateString(
                          "en-US",
                          { year: "numeric", month: "short", day: "numeric" },
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-info me-2"
                          onClick={() => openEditModal(subUser)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(subUser._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <SubUserModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={selectedUser ? handleUpdate : handleCreate}
          initialData={selectedUser}
        />
      </div>
    </ProtectedRoute>
  );
}
