"use client";

import { Suspense } from "react";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import RichTextEditor from "./RichTextEditor";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useSelector, useDispatch } from "react-redux";
// import moment from "moment";
import { useForm } from "react-hook-form";
import { updateProfile } from "@/store/slices/contentSlice";
import {
  useGetProjectsQuery,
  useGetProjectQuery,
  useAddProjectMutation,
  useUpdateDeleteStatusMutation,
  useUpdateProjectMutation,
} from "@/store/services/projectsApi";
import {
  useGetAnalyticsStatsQuery,
  useGetAnalyticsSessionsQuery,
} from "@/store/services/analyticsApi";
import {
  useGetBlogsQuery,
  useGetBlogQuery,
  useAddBlogMutation,
  useUpdateBlogMutation,
  useUpdateBlogDeleteStatusMutation,
} from "@/store/services/blogsApi";

import { useSearchParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
  background: "rgba(255, 255, 255, 0.9)",
  color: "#333",
});

function DashboardContent() {
  const { user } = useSelector((state) => state.auth);
  const { profile } = useSelector((state) => state.content);
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const router = useRouter();

  // API Hooks
  const { data: projectsData, isLoading: isProjectsLoading } =
    useGetProjectsQuery();
  const { data: blogsData, isLoading: isBlogsLoading } = useGetBlogsQuery();
  const [analyticsWindow, setAnalyticsWindow] = useState("7d");
  const { data: analyticsStatsData } = useGetAnalyticsStatsQuery(
    { window: analyticsWindow },
    {
      skip: user?.role !== "admin",
    },
  );
  const { data: analyticsSessionsData, isLoading: isSessionsLoading } =
    useGetAnalyticsSessionsQuery(
      { page: 1, limit: 20 },
      { skip: user?.role !== "admin" },
    );
  const [addProject, { isLoading: isAdding }] = useAddProjectMutation();
  const [updateProject, { isLoading: isUpdating }] = useUpdateProjectMutation();
  const [deleteProject] = useUpdateDeleteStatusMutation();

  const [addBlog, { isLoading: isAddingBlog }] = useAddBlogMutation();
  const [updateBlog, { isLoading: isUpdatingBlog }] = useUpdateBlogMutation();
  const [deleteBlog] = useUpdateBlogDeleteStatusMutation();

  const projects = projectsData?.data || [];
  const blogs = blogsData?.data || [];

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

  // Blog Form
  const {
    register: registerBlog,
    handleSubmit: handleSubmitBlog,
    reset: resetBlog,
    setValue: setBlogValue,
    watch: watchBlog,
  } = useForm();
  const [showBlogEditor, setShowBlogEditor] = useState(false);
  const blogBody = watchBlog("body");
  const [editingBlog, setEditingBlog] = useState(null);

  // Tab State
  const tab = searchParams.get("tab") || "projects";

  // Check for edit/view params
  const editId = searchParams.get("edit");
  const viewId = searchParams.get("view");
  const targetId = editId || viewId;

  const { data: projectToEditData } = useGetProjectQuery(targetId, {
    skip: !targetId || tab !== "projects",
  });

  const { data: blogToEditData } = useGetBlogQuery(targetId, {
    skip: !targetId || tab !== "blogs",
  });

  useEffect(() => {
    if (targetId && projectToEditData?.data) {
      const projectToEdit = projectToEditData.data;
      setEditingProject(projectToEdit);
      setProjectValue("title", projectToEdit.title);
      setProjectValue("subheading", projectToEdit.subheading || "");
      setProjectValue("status", projectToEdit.status);
      setProjectValue("body", projectToEdit.body);
      setProjectValue("description", projectToEdit.description);
      setShowProjectEditor(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [targetId, projectToEditData, setProjectValue]);

  useEffect(() => {
    if (targetId && tab === "blogs" && blogToEditData?.data) {
      const blogToEdit = blogToEditData.data;
      setEditingBlog(blogToEdit);
      setBlogValue("title", blogToEdit.title);
      setBlogValue("subheading", blogToEdit.subheading || "");
      setBlogValue("status", blogToEdit.status);
      setBlogValue("body", blogToEdit.body);
      setShowBlogEditor(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [targetId, tab, blogToEditData, setBlogValue]);

  const onUpdateProfile = (data) => {
    dispatch(updateProfile(data));
    Toast.fire({
      icon: "success",
      title: "Profile Updated successfully",
    });
  };

  const onSubmitProject = async (data) => {
    try {
      if (editingProject) {
        await updateProject({ id: editingProject._id, ...data }).unwrap();
        Toast.fire({
          icon: "success",
          title: "Project Updated successfully",
        });
        setEditingProject(null);
        // Navigate to the public projects page as requested
        router.push("/projects");
      } else {
        await addProject(data).unwrap();
        Toast.fire({
          icon: "success",
          title: "Project Added successfully",
        });
        // Remove this router.push since we are already on the dashboard and want to stay or reset
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

      Toast.fire({
        icon: "error",
        title: errorMessage,
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingProject(null);
    resetProject();
    setShowProjectEditor(false);
    router.push("/dashboard");
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
    router.push(`/dashboard?edit=${project._id}`);
  };

  const onSubmitBlog = async (data) => {
    try {
      if (editingBlog) {
        await updateBlog({ id: editingBlog._id, ...data }).unwrap();
        Toast.fire({
          icon: "success",
          title: "Blog Updated successfully",
        });
        setEditingBlog(null);
        router.push("/dashboard?tab=blogs");
      } else {
        await addBlog(data).unwrap();
        Toast.fire({
          icon: "success",
          title: "Blog Added successfully",
        });
        router.push("/dashboard?tab=blogs");
      }
      resetBlog();
      setShowBlogEditor(false);
    } catch (err) {
      console.error("Failed to save blog:", err);
      // Helper to extract error message
      let errorMessage = "Failed to save blog";
      if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (err?.data?.error) {
        errorMessage = Array.isArray(err.data.error)
          ? err.data.error.join("\n")
          : err.data.error;
      } else if (err?.error) {
        errorMessage = err.error;
      }

      Toast.fire({
        icon: "error",
        title: errorMessage,
      });
    }
  };

  const handleCancelEditBlog = () => {
    setEditingBlog(null);
    resetBlog();
    setShowBlogEditor(false);
    router.push("/dashboard?tab=blogs");
  };

  const handleDeleteBlog = async (id) => {
    if (window.confirm("Are you sure you want to delete this blog?")) {
      try {
        await deleteBlog(id).unwrap();
        if (editingBlog?._id === id) {
          handleCancelEditBlog();
        }
      } catch (err) {
        console.error("Failed to delete blog:", err);
      }
    }
  };

  const handleEditBlogClick = (blog) => {
    router.push(`/dashboard?tab=blogs&edit=${blog._id}`);
  };

  const stats = {
    views: analyticsStatsData?.data?.totalViews || 0,
    projects: projects.length,
    messages: 45,
    avgTimeSeconds: analyticsStatsData?.data?.avgTimeSeconds || 0,
    viewsChangePct: analyticsStatsData?.data?.viewsChangePct ?? 0,
    projectsChangePct: analyticsStatsData?.data?.projectsChangePct ?? 0,
  };

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

            {/* Tab Navigation */}
            <div className="d-flex gap-3 mb-4">
              <button
                className={`btn ${tab === "projects" ? "btn-primary" : "btn-outline-light"}`}
                onClick={() => router.push("/dashboard?tab=projects")}
              >
                Projects
              </button>
              <button
                className={`btn ${tab === "blogs" ? "btn-primary" : "btn-outline-light"}`}
                onClick={() => router.push("/dashboard?tab=blogs")}
              >
                Blogs
              </button>
            </div>

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

                {tab === "projects" && (
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
                        <div className="col-md-12">
                          <input
                            {...registerProject("subheading")}
                            className="form-control bg-transparent"
                            placeholder="Subheading (Short Description)"
                          />
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
                                dangerouslySetInnerHTML={{
                                  __html: projectBody,
                                }}
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
                )}

                {tab === "blogs" && (
                  <div className="glass-card p-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h4 className="mb-0">
                        {editingBlog ? "Edit Blog" : "Add New Blog"}
                      </h4>
                      {editingBlog && (
                        <button
                          onClick={handleCancelEditBlog}
                          className="btn btn-outline-light btn-sm"
                        >
                          Cancel Edit
                        </button>
                      )}
                    </div>
                    <form onSubmit={handleSubmitBlog(onSubmitBlog)}>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <input
                            {...registerBlog("title")}
                            className="form-control bg-transparent"
                            placeholder="Blog Title"
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <select
                            {...registerBlog("status")}
                            className="form-select bg-transparent"
                          >
                            <option className="text-dark" value="Draft">
                              Draft
                            </option>
                            <option className="text-dark" value="Published">
                              Published
                            </option>
                          </select>
                        </div>
                        <div className="col-md-12">
                          <input
                            {...registerBlog("subheading")}
                            className="form-control bg-transparent"
                            placeholder="Subheading (Short Description)"
                          />
                        </div>
                        <div className="col-12">
                          <label className="form-label">Body</label>
                          <div
                            className="form-control bg-transparent"
                            style={{
                              minHeight: "100px",
                              cursor: "pointer",
                              border: "1px solid rgba(255, 255, 255, 0.1)",
                              background: "rgba(0,0,0,0.1) !important",
                            }}
                            onClick={() => setShowBlogEditor(true)}
                          >
                            {blogBody ? (
                              <div
                                dangerouslySetInnerHTML={{ __html: blogBody }}
                              />
                            ) : (
                              <span className="text-secondary opacity-50">
                                Click to add body content...
                              </span>
                            )}
                          </div>
                          <input type="hidden" {...registerBlog("body")} />
                        </div>
                        {showBlogEditor && (
                          <RichTextEditor
                            value={blogBody}
                            onChange={(content) =>
                              setBlogValue("body", content)
                            }
                            onClose={() => setShowBlogEditor(false)}
                          />
                        )}
                        <div className="col-12 text-end">
                          <button
                            type="submit"
                            className="btn btn-success"
                            disabled={isAddingBlog || isUpdatingBlog}
                          >
                            {isAddingBlog || isUpdatingBlog
                              ? editingBlog
                                ? "Updating..."
                                : "Adding..."
                              : editingBlog
                                ? "Update Blog"
                                : "Add Blog"}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="d-flex justify-content-end mb-3">
          <select
            className="form-select w-auto bg-transparent"
            value={analyticsWindow}
            onChange={(event) => setAnalyticsWindow(event.target.value)}
          >
            <option className="text-dark" value="1d">
              Yesterday
            </option>
            <option className="text-dark" value="7d">
              Last 7 days
            </option>
            <option className="text-dark" value="30d">
              Last 30 days
            </option>
          </select>
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
                <span
                  className={`badge bg-${
                    stats.viewsChangePct > 0
                      ? "success"
                      : stats.viewsChangePct < 0
                        ? "danger"
                        : "secondary"
                  } bg-opacity-10 text-${
                    stats.viewsChangePct > 0
                      ? "success"
                      : stats.viewsChangePct < 0
                        ? "danger"
                        : "secondary"
                  } border-0 px-3 py-2 rounded-pill`}
                >
                  {stats.viewsChangePct > 0 ? "+" : ""}
                  {stats.viewsChangePct}%
                </span>
              </div>
              <h5 className="text-muted fw-medium mb-1">Total Views</h5>
              <h2 className="display-6 fw-bold mb-0">
                {stats.views.toLocaleString()}
              </h2>
              <small className="text-muted">
                Avg time: {Math.round(stats.avgTimeSeconds)}s
              </small>
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
                <span
                  className={`badge bg-${
                    stats.projectsChangePct > 0
                      ? "success"
                      : stats.projectsChangePct < 0
                        ? "danger"
                        : "secondary"
                  } bg-opacity-10 text-${
                    stats.projectsChangePct > 0
                      ? "success"
                      : stats.projectsChangePct < 0
                        ? "danger"
                        : "secondary"
                  } border-0 px-3 py-2 rounded-pill`}
                >
                  {stats.projectsChangePct > 0 ? "+" : ""}
                  {stats.projectsChangePct}%
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

            {tab === "projects" && (
              <>
                {/* Desktop Table View */}
                <div className="table-responsive d-none d-md-block">
                  <table className="table table-hover table-transparent mb-0">
                    <thead>
                      <tr>
                        <th>Project</th>
                        <th>Subheading</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isProjectsLoading ? (
                        <tr>
                          <td colSpan="5" className="text-center py-3">
                            Loading projects...
                          </td>
                        </tr>
                      ) : projects.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center py-3">
                            No projects found
                          </td>
                        </tr>
                      ) : (
                        projects.map((project) => (
                          <tr key={project._id} id={`project-${project._id}`}>
                            <td>{project.title}</td>
                            <td>
                              <span className="text-muted small">
                                {project.subheading || "-"}
                              </span>
                            </td>
                            <td>
                              <span
                                className={`badge bg-${project.status === "Completed" ? "success" : project.status === "In Progress" ? "warning" : "primary"}`}
                              >
                                {project.status}
                              </span>
                            </td>
                            <td>
                              {new Date(project.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
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
                  {isProjectsLoading ? (
                    <div className="text-center py-3">Loading projects...</div>
                  ) : projects.length === 0 ? (
                    <div className="text-center py-3">No projects found</div>
                  ) : (
                    <div className="d-flex flex-column gap-3">
                      {projects.map((project) => (
                        <div
                          key={project._id}
                          className={`glass-card p-3 border-start border-4 ${
                            project.status === "Completed"
                              ? "border-status-completed"
                              : project.status === "In Progress"
                                ? "border-status-progress"
                                : "border-status-review"
                          }`}
                        >
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <h6 className="fw-bold mb-0">{project.title}</h6>
                              <p className="text-muted small mb-0">
                                {project.subheading}
                              </p>
                            </div>
                            <span
                              className={`badge bg-${project.status === "Completed" ? "success" : project.status === "In Progress" ? "warning" : "primary"} border-0`}
                            >
                              {project.status}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">
                              {new Date(project.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
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
              </>
            )}

            {tab === "blogs" && (
              <>
                {/* Desktop Table View */}
                <div className="table-responsive d-none d-md-block">
                  <table className="table table-hover table-transparent mb-0">
                    <thead>
                      <tr>
                        <th>Blog</th>
                        <th>Subheading</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isBlogsLoading ? (
                        <tr>
                          <td colSpan="5" className="text-center py-3">
                            Loading blogs...
                          </td>
                        </tr>
                      ) : blogs.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center py-3">
                            No blogs found
                          </td>
                        </tr>
                      ) : (
                        blogs.map((blog) => (
                          <tr key={blog._id} id={`blog-${blog._id}`}>
                            <td>{blog.title}</td>
                            <td>
                              <span className="text-muted small">
                                {blog.subheading || "-"}
                              </span>
                            </td>
                            <td>
                              <span
                                className={`badge bg-${blog.status === "Published" ? "success" : "warning"}`}
                              >
                                {blog.status}
                              </span>
                            </td>
                            <td>
                              {new Date(blog.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </td>
                            <td>
                              <button
                                onClick={() => handleEditBlogClick(blog)}
                                className="btn btn-outline-info btn-sm py-0 px-2 me-2"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteBlog(blog._id)}
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
                  {isBlogsLoading ? (
                    <div className="text-center py-3">Loading blogs...</div>
                  ) : blogs.length === 0 ? (
                    <div className="text-center py-3">No blogs found</div>
                  ) : (
                    <div className="d-flex flex-column gap-3">
                      {blogs.map((blog) => (
                        <div
                          key={blog._id}
                          className={`glass-card p-3 border-start border-4 ${
                            blog.status === "Published"
                              ? "border-status-completed"
                              : "border-status-review"
                          }`}
                        >
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <h6 className="fw-bold mb-0">{blog.title}</h6>
                              <p className="text-muted small mb-0">
                                {blog.subheading}
                              </p>
                            </div>
                            <span
                              className={`badge bg-${blog.status === "Published" ? "success" : "warning"} border-0`}
                            >
                              {blog.status}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">
                              {new Date(blog.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </small>
                            <div className="d-flex gap-2">
                              <button
                                onClick={() => handleEditBlogClick(blog)}
                                className="btn btn-premium btn-sm py-1 px-3"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteBlog(blog._id)}
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
              </>
            )}
          </div>
        </div>

        {user?.role === "admin" && (
          <div className="mt-5">
            <div className="glass-card p-4">
              <h3 className="mb-4">Viewer Details</h3>
              <div className="table-responsive">
                <table className="table table-hover table-transparent mb-0">
                  <thead>
                    <tr>
                      <th>IP Hash</th>
                      <th>Last Path</th>
                      <th>Total Time</th>
                      <th>Last Seen</th>
                      <th>First Seen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isSessionsLoading ? (
                      <tr>
                        <td colSpan="5" className="text-center py-3">
                          Loading viewers...
                        </td>
                      </tr>
                    ) : analyticsSessionsData?.data?.length ? (
                      analyticsSessionsData.data.map((session) => (
                        <tr key={session._id}>
                          <td className="text-muted small">
                            {session.ipHash?.slice(0, 12)}...
                          </td>
                          <td>
                            <span className="text-muted small">
                              {session.lastPath || "-"}
                            </span>
                          </td>
                          <td>{Math.round(session.totalTimeSeconds || 0)}s</td>
                          <td>
                            {new Date(session.lastSeenAt).toLocaleString(
                              "en-US",
                            )}
                          </td>
                          <td>
                            {new Date(session.firstSeenAt).toLocaleString(
                              "en-US",
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-3">
                          No viewers yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
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
