'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';
import { useForm } from 'react-hook-form';
import { updateProfile, addProject } from '@/store/slices/contentSlice';

export default function DashboardPage() {
    const { user } = useSelector((state) => state.auth);
    const { profile } = useSelector((state) => state.content);
    const dispatch = useDispatch();

    // Profile Form
    const { register: registerProfile, handleSubmit: handleSubmitProfile } = useForm({
        defaultValues: profile
    });

    // Project Form
    const { register: registerProject, handleSubmit: handleSubmitProject, reset: resetProject } = useForm();

    const onUpdateProfile = (data) => {
        dispatch(updateProfile(data));
        alert('Profile Updated!');
    };

    const onAddProject = (data) => {
        dispatch(addProject({ ...data, id: Date.now(), date: moment().format('YYYY-MM-DD') }));
        resetProject();
        alert('Project Added!');
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
                                    <h4 className="mb-3">Add New Project</h4>
                                    <form onSubmit={handleSubmitProject(onAddProject)}>
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
                                                <button type="submit" className="btn btn-success btn-sm">Add Project</button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </>
                        )}


                    </div>
                </div>

                <div className="row g-4">
                    {['Views', 'Projects', 'Messages'].map((stat, idx) => (
                        <div key={idx} className="col-md-4">
                            <div className="glass-card">
                                <h5 className="text-muted mb-2">{stat}</h5>
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
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>E-Commerce Redesign</td>
                                        <td><span className="badge bg-success">Completed</span></td>
                                        <td>{moment('2023-10-24').format('MMM D, YYYY')}</td>
                                    </tr>
                                    <tr>
                                        <td>Portfolio V2</td>
                                        <td><span className="badge bg-warning">In Progress</span></td>
                                        <td>{moment().subtract(2, 'days').format('MMM D, YYYY')}</td>
                                    </tr>
                                    <tr>
                                        <td>Banking App</td>
                                        <td><span className="badge bg-primary">Review</span></td>
                                        <td>{moment().add(5, 'days').format('MMM D, YYYY')}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
