"use client";

import { Suspense } from "react";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import RichTextEditor from "./RichTextEditor";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useSelector, useDispatch } from "react-redux";
import moment from "moment";
import { useForm } from "react-hook-form";
import { updateProfile } from "@/store/slices/contentSlice";
import {
  useGetProjectsQuery,
  useGetProjectQuery,
  useAddProjectMutation,
  useUpdateDeleteStatusMutation,
  useUpdateProjectMutation,
} from "@/store/services/projectsApi";
import { useSearchParams, useRouter } from "next/navigation";

function DashboardContent() {
  const { user } = useSelector((state) => state.auth);
  const { profile } = useSelector((state) => state.content);
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const router = useRouter();

  // API Hooks
  const { data: projectsData, isLoading } = useGetProjectsQuery();
  const [addProject, { isLoading: isAdding }] = useAddProjectMutation();
  const [updateProject, { isLoading: isUpdating }] = useUpdateProjectMutation();
  const [deleteProject] = useUpdateDeleteStatusMutation();

  const projects = projectsData?.data || [];

  // Profile Form
  const { register: registerProfile, handleSubmit: handleSubmitProfile } =
    useForm({
      defaultValues: profile,
    });

  // Project Form
  const {
    register: registerProject,
    handleSubmit: handleSubmitProject,
    reset: resetProject,
    setValue: setProjectValue,
    watch: watchProject,
  } = useForm();
  const [showProjectEditor, setShowProjectEditor] = useState(false);
  const projectBody = watchProject("body");
  const [editingProject, setEditingProject] = useState(null);

  // Check for edit/view params
  const editId = searchParams.get("edit");
  const viewId = searchParams.get("view");
  const targetId = editId || viewId;

  const { data: projectToEditData } = useGetProjectQuery(targetId, {
    skip: !targetId,
  });

  useEffect(() => {
    if (targetId && projectToEditData?.data) {
      const projectToEdit = projectToEditData.data;
      setEditingProject(projectToEdit);
      setProjectValue("title", projectToEdit.title);
      setProjectValue("status", projectToEdit.status);
      setProjectValue("body", projectToEdit.body);
      setProjectValue("description", projectToEdit.description);
      setShowProjectEditor(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [targetId, projectToEditData, setProjectValue]);

  const onUpdateProfile = (data) => {
    dispatch(updateProfile(data));
    alert("Profile Updated!");
  };

  const onSubmitProject = async (data) => {
    try {
      if (editingProject) {
        await updateProject({ id: editingProject._id, ...data }).unwrap();
        alert("Project Updated!");
        setEditingProject(null);
        router.push("/projects");
      } else {
        await addProject(data).unwrap();
        alert("Project Added!");
        router.push("/projects");
      }
      resetProject();
      setShowProjectEditor(false);
    } catch (err) {
      console.error("Failed to save project:", err);
      const errorMessage = err?.data?.error
        ? Array.isArray(err.data.error)
          ? err.data.error.join("\n")
          : err.data.error
        : "Failed to save project";
      alert(errorMessage);
    }
  };

  const handleCancelEdit = () => {
    setEditingProject(null);
    resetProject();
    setShowProjectEditor(false);
    router.push("/projects");
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await deleteProject(id).unwrap();
        if (editingProject?._id === id) {
          handleCancelEdit();
        }
      } catch (err) {
        console.error("Failed to delete project:", err);
      }
    }
  };

  const handleEditClick = (project) => {
    setEditingProject(project);
    setProjectValue("title", project.title);
    setProjectValue("status", project.status);
    setProjectValue("body", project.body);
    setShowProjectEditor(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const [stats] = useState({
    views: 1250,
    projects: 12,
    messages: 45,
  });

  return (
    <ProtectedRoute>
      <div className="container py-5">
        <div className="row mb-5">
          <div className="col">
            <h1 className="fw-bold">Admin Dashboard</h1>
            <p className="text-muted mb-4">
              Welcome, {user?.name} ({user?.role})
            </p>

            {user?.role === "admin" && (
              <div className="mb-5">
                <Link href="/dashboard/sub-users" className="btn btn-primary">
                  Manage Sub-Users
                </Link>
              </div>
            )}

            {user?.role === "admin" && (
              <div className="d-flex flex-column gap-5">
                <div className="glass-card p-4">
                  <h4 className="mb-3">Edit Profile</h4>
                  <form onSubmit={handleSubmitProfile(onUpdateProfile)}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <input
                          {...registerProfile("name")}
                          className="form-control bg-transparent"
                          placeholder="Full Name"
                        />
                      </div>
                      <div className="col-md-6">
                        <input
                          {...registerProfile("title")}
                          className="form-control bg-transparent"
                          placeholder="Job Title"
                        />
                      </div>
                      <div className="col-12">
                        <textarea
                          {...registerProfile("bio")}
                          className="form-control bg-transparent"
                          placeholder="Bio"
                          rows="3"
                        ></textarea>
                      </div>
                      <div className="col-12 text-end">
                        <button type="submit" className="btn btn-primary">
                          Update Profile
                        </button>
                      </div>
                    </div>
                  </form>
                </div>

                <div className="glass-card p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="mb-0">
                      {editingProject ? "Edit Project" : "Add New Project"}
                    </h4>
                    {editingProject && (
                      <button
                        onClick={handleCancelEdit}
                        className="btn btn-outline-light btn-sm"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>
                  <form onSubmit={handleSubmitProject(onSubmitProject)}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <input
                          {...registerProject("title")}
                          className="form-control bg-transparent"
                          placeholder="Project Title"
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <select
                          {...registerProject("status")}
                          className="form-select bg-transparent"
                        >
                          <option className="text-dark" value="In Progress">
                            In Progress
                          </option>
                          <option className="text-dark" value="Completed">
                            Completed
                          </option>
                        </select>
                      </div>
                      <div className="col-12">
                        <label className="form-label">Description</label>
                        <div
                          className="form-control bg-transparent"
                          style={{
                            minHeight: "100px",
                            cursor: "pointer",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            background: "rgba(0,0,0,0.1) !important",
                          }}
                          onClick={() => setShowProjectEditor(true)}
                        >
                          {projectBody ? (
                            <div
                              dangerouslySetInnerHTML={{ __html: projectBody }}
                            />
                          ) : (
                            <span className="text-secondary opacity-50">
                              Click to add description...
                            </span>
                          )}
                        </div>
                        <input type="hidden" {...registerProject("body")} />
                      </div>
                      {showProjectEditor && (
                        <RichTextEditor
                          value={projectBody}
                          onChange={(content) =>
                            setProjectValue("body", content)
                          }
                          onClose={() => setShowProjectEditor(false)}
                        />
                      )}
                      <div className="col-12 text-end">
                        <button
                          type="submit"
                          className="btn btn-success"
                          disabled={isAdding || isUpdating}
                        >
                          {isAdding || isUpdating
                            ? editingProject
                              ? "Updating..."
                              : "Adding..."
                            : editingProject
                              ? "Update Project"
                              : "Add Project"}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="row g-4 mb-5">
          <div className="col-md-4">
            <div className="glass-card h-100 p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="icon-box bg-primary bg-opacity-10 p-3 rounded-4">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary"
                  >
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </div>
                <span className="badge bg-success bg-opacity-10 text-success border-0 px-3 py-2 rounded-pill">
                  +12%
                </span>
              </div>
              <h5 className="text-muted fw-medium mb-1">Total Views</h5>
              <h2 className="display-6 fw-bold mb-0">
                {stats.views.toLocaleString()}
              </h2>
            </div>
          </div>
          <div className="col-md-4">
            <div className="glass-card h-100 p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div
                  className="icon-box bg-purple bg-opacity-10 p-3 rounded-4"
                  style={{ backgroundColor: "rgba(124, 58, 237, 0.1)" }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#7c3aed"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
                    <path d="m12 12 8-4.5" />
                    <path d="M12 12v9" />
                    <path d="m12 12-8-4.5" />
                    <path d="m16 5.25-8 4.5" />
                  </svg>
                </div>
                <span className="badge bg-success bg-opacity-10 text-success border-0 px-3 py-2 rounded-pill">
                  +5%
                </span>
              </div>
              <h5 className="text-muted fw-medium mb-1">Projects</h5>
              <h2 className="display-6 fw-bold mb-0">{stats.projects}</h2>
            </div>
          </div>
          <div className="col-md-4">
            <div className="glass-card h-100 p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="icon-box bg-info bg-opacity-10 p-3 rounded-4">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-info"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <span className="badge bg-success bg-opacity-10 text-success border-0 px-3 py-2 rounded-pill">
                  +8%
                </span>
              </div>
              <h5 className="text-muted fw-medium mb-1">Messages</h5>
              <h2 className="display-6 fw-bold mb-0">{stats.messages}</h2>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <div className="glass-card p-4">
            <h3 className="mb-4">Recent Activity</h3>
            {/* Desktop Table View */}
            <div className="table-responsive d-none d-md-block">
              <table
                className="table table-hover bg-transparent mb-0"
                style={{ "--bs-table-bg": "transparent" }}
              >
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan="4" className="text-center py-3">
                        Loading projects...
                      </td>
                    </tr>
                  ) : projects.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-3">
                        No projects found
                      </td>
                    </tr>
                  ) : (
                    projects.map((project) => (
                      <tr key={project._id} id={`project-${project._id}`}>
                        <td>{project.title}</td>
                        <td>
                          <span
                            className={`badge bg-${project.status === "Completed" ? "success" : project.status === "In Progress" ? "warning" : "primary"}`}
                          >
                            {project.status}
                          </span>
                        </td>
                        <td>
                          {moment(project.createdAt).format("MMM D, YYYY")}
                        </td>
                        <td>
                          <button
                            onClick={() => handleEditClick(project)}
                            className="btn btn-outline-info btn-sm py-0 px-2 me-2"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProject(project._id)}
                            className="btn btn-outline-danger btn-sm py-0 px-2"
                          >
                            &times;
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="d-md-none">
              {isLoading ? (
                <div className="text-center py-3">Loading projects...</div>
              ) : projects.length === 0 ? (
                <div className="text-center py-3">No projects found</div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {projects.map((project) => (
                    <div
                      key={project._id}
                      className="glass-card p-3 border-start border-4"
                      style={{
                        borderColor:
                          project.status === "Completed"
                            ? "#10b981"
                            : project.status === "In Progress"
                              ? "#f59e0b"
                              : "#7c3aed",
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="fw-bold mb-0">{project.title}</h6>
                        <span
                          className={`badge bg-${project.status === "Completed" ? "success" : project.status === "In Progress" ? "warning" : "primary"} border-0`}
                        >
                          {project.status}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                          {moment(project.createdAt).format("MMM D, YYYY")}
                        </small>
                        <div className="d-flex gap-2">
                          <button
                            onClick={() => handleEditClick(project)}
                            className="btn btn-premium btn-sm py-1 px-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProject(project._id)}
                            className="btn btn-outline-danger btn-sm py-1"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="container py-5 text-center">Loading dashboard...</div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
