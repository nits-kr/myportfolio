'use client';

import React, { useState, useEffect } from 'react';
import RichTextEditor from './RichTextEditor';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';
import { useForm } from 'react-hook-form';
import { updateProfile } from '@/store/slices/contentSlice';
import { useGetProjectsQuery, useGetProjectQuery, useAddProjectMutation, useDeleteProjectMutation, useUpdateProjectMutation } from '@/store/services/projectsApi';
import { useSearchParams, useRouter } from 'next/navigation';

export default function DashboardPage() {
    const { user } = useSelector((state) => state.auth);
    const { profile } = useSelector((state) => state.content);
    const dispatch = useDispatch();
    const searchParams = useSearchParams();
    const router = useRouter();

    // API Hooks
    const { data: projectsData, isLoading } = useGetProjectsQuery();
    const [addProject, { isLoading: isAdding }] = useAddProjectMutation();
    const [updateProject, { isLoading: isUpdating }] = useUpdateProjectMutation();
    const [deleteProject] = useDeleteProjectMutation();

    const projects = projectsData?.data || [];

    // Profile Form
    const { register: registerProfile, handleSubmit: handleSubmitProfile } = useForm({
        defaultValues: profile
    });

    // Project Form
    const { register: registerProject, handleSubmit: handleSubmitProject, reset: resetProject, setValue: setProjectValue, watch: watchProject } = useForm();
    const [showProjectEditor, setShowProjectEditor] = useState(false);
    const projectBody = watchProject('body');
    const [editingProject, setEditingProject] = useState(null);

    // Check for edit/view params
    const editId = searchParams.get('edit');
    const viewId = searchParams.get('view');
    const targetId = editId || viewId;

    const { data: projectToEditData } = useGetProjectQuery(targetId, {
        skip: !targetId
    });

    useEffect(() => {
        if (targetId && projectToEditData?.data) {
            const projectToEdit = projectToEditData.data;
            setEditingProject(projectToEdit);
            setProjectValue('title', projectToEdit.title);
            setProjectValue('status', projectToEdit.status);
            setProjectValue('body', projectToEdit.body);
            setProjectValue('description', projectToEdit.description);
            setShowProjectEditor(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [targetId, projectToEditData, setProjectValue]);

    const onUpdateProfile = (data) => {
        dispatch(updateProfile(data));
        alert('Profile Updated!');
    };

    const onSubmitProject = async (data) => {
        try {
            if (editingProject) {
                await updateProject({ id: editingProject._id, ...data }).unwrap();
                alert('Project Updated!');
                setEditingProject(null);
                router.push('/projects');
            } else {
                await addProject(data).unwrap();
                alert('Project Added!');
                router.push('/projects');
            }
            resetProject();
            setShowProjectEditor(false);
        } catch (err) {
            console.error('Failed to save project:', err);
            const errorMessage = err?.data?.error
                ? (Array.isArray(err.data.error) ? err.data.error.join('\n') : err.data.error)
                : 'Failed to save project';
            alert(errorMessage);
        }
    };

    const handleCancelEdit = () => {
        setEditingProject(null);
        resetProject();
        setShowProjectEditor(false);
        router.push('/projects');
    };

    const handleDeleteProject = async (id) => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            try {
                await deleteProject(id).unwrap();
                if (editingProject?._id === id) {
                    handleCancelEdit();
                }
            } catch (err) {
                console.error('Failed to delete project:', err);
            }
        }
    };

    const handleEditClick = (project) => {
        setEditingProject(project);
        setProjectValue('title', project.title);
        setProjectValue('status', project.status);
        setProjectValue('body', project.body);
        setShowProjectEditor(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <ProtectedRoute>
            <div className="container py-5">
                <div className="row mb-4">
                    <div className="col">
                        <h1 className="fw-bold">Admin Dashboard</h1>
                        <p className="text-muted">Welcome, {user?.name} ({user?.role})</p>

                        {user?.role === 'admin' && (
                            <>
                                <div className="glass-card mt-4 p-4">
                                    <h4 className="mb-3">Edit Profile</h4>
                                    <form onSubmit={handleSubmitProfile(onUpdateProfile)}>
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <input {...registerProfile('name')} className="form-control bg-transparent text-white" placeholder="Full Name" />
                                            </div>
                                            <div className="col-md-6">
                                                <input {...registerProfile('title')} className="form-control bg-transparent text-white" placeholder="Job Title" />
                                            </div>
                                            <div className="col-12">
                                                <textarea {...registerProfile('bio')} className="form-control bg-transparent text-white" placeholder="Bio" rows="3"></textarea>
                                            </div>
                                            <div className="col-12">
                                                <button type="submit" className="btn btn-primary btn-sm">Update Profile</button>
                                            </div>
                                        </div>
                                    </form>
                                </div>

                                <div className="glass-card mt-4 p-4">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h4 className="mb-0">{editingProject ? 'Edit Project' : 'Add New Project'}</h4>
                                        {editingProject && (
                                            <button onClick={handleCancelEdit} className="btn btn-outline-light btn-sm">Cancel Edit</button>
                                        )}
                                    </div>
                                    <form onSubmit={handleSubmitProject(onSubmitProject)}>
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <input {...registerProject('title')} className="form-control bg-transparent text-white" placeholder="Project Title" required />
                                            </div>
                                            <div className="col-md-6">
                                                <select {...registerProject('status')} className="form-select bg-transparent text-white">
                                                    <option className="text-dark" value="In Progress">In Progress</option>
                                                    <option className="text-dark" value="Completed">Completed</option>
                                                </select>
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label text-white">Description</label>
                                                <div
                                                    className="form-control bg-transparent text-white"
                                                    style={{ minHeight: '100px', cursor: 'pointer', border: '1px solid #444' }}
                                                    onClick={() => setShowProjectEditor(true)}
                                                >
                                                    {projectBody ? (
                                                        <div dangerouslySetInnerHTML={{ __html: projectBody }} />
                                                    ) : (
                                                        <span className="text-gray-400 text-opacity-75">Click to add description...</span>
                                                    )}
                                                </div>
                                                <input type="hidden" {...registerProject('body')} />
                                            </div>
                                            {showProjectEditor && (
                                                <RichTextEditor
                                                    value={projectBody}
                                                    onChange={(content) => setProjectValue('body', content)}
                                                    onClose={() => setShowProjectEditor(false)}
                                                />
                                            )}
                                            <div className="col-12">
                                                <button type="submit" className="btn btn-success btn-sm" disabled={isAdding || isUpdating}>
                                                    {isAdding || isUpdating ? (editingProject ? 'Updating...' : 'Adding...') : (editingProject ? 'Update Project' : 'Add Project')}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </>
                        )}


                    </div>
                </div>

                <div className="row g-4 text-white">
                    {['Views', 'Projects', 'Messages'].map((stat, idx) => (
                        <div key={idx} className="col-md-4">
                            <div className="glass-card">
                                <h5 className="text-white mb-2">{stat}</h5>
                                <div className="d-flex align-items-end justify-content-between">
                                    <span className="display-4 fw-bold">{Math.floor(Math.random() * 1000)}</span>
                                    <span className="text-success small">+12%</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-5">
                    <div className="glass-card">
                        <h3 className="mb-4">Recent Activity</h3>
                        <div className="table-responsive">
                            <table className="table table-dark table-hover bg-transparent mb-0" style={{ '--bs-table-bg': 'transparent' }}>
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
                                        <tr><td colSpan="4" className="text-center py-3 text-white">Loading projects...</td></tr>
                                    ) : projects.length === 0 ? (
                                        <tr><td colSpan="4" className="text-center py-3 text-white">No projects found</td></tr>
                                    ) : (
                                        projects.map((project) => (
                                            <tr key={project._id} id={`project-${project._id}`}>
                                                <td>{project.title}</td>
                                                <td>
                                                    <span className={`badge bg-${project.status === 'Completed' ? 'success' : project.status === 'In Progress' ? 'warning' : 'primary'}`}>
                                                        {project.status}
                                                    </span>
                                                </td>
                                                <td>{moment(project.createdAt).format('MMM D, YYYY')}</td>
                                                <td>
                                                    <button onClick={() => handleEditClick(project)} className="btn btn-outline-info btn-sm py-0 px-2 me-2">
                                                        Edit
                                                    </button>
                                                    <button onClick={() => handleDeleteProject(project._id)} className="btn btn-outline-danger btn-sm py-0 px-2">
                                                        &times;
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
