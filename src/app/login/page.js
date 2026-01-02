'use client';

import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { login } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function LoginPage() {
    const dispatch = useDispatch();
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm();

    const onSubmit = (data) => {
        // Simulate API call with form data
        if (data.email && data.password) {
            dispatch(login({
                name: data.role === 'admin' ? 'Nitish Kumar (Admin)' : 'Guest User',
                email: data.email,
                role: data.role // 'admin' or 'user'
            }));
            router.push('/dashboard');
        }
    };

    return (
        <div className="container min-vh-100 d-flex align-items-center justify-content-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="col-md-5"
            >
                <div className="glass-card p-5">
                    <h2 className="text-center fw-bold mb-4">Welcome Back</h2>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-3">
                            <label className="form-label text-muted">Email Address</label>
                            <input
                                type="email"
                                className={`form-control bg-transparent text-white border-secondary ${errors.email ? 'is-invalid' : ''}`}
                                placeholder="admin@example.com"
                                {...register("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Invalid email address"
                                    }
                                })}
                            />
                            {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
                        </div>

                        <div className="mb-4">
                            <label className="form-label text-muted">Password</label>
                            <input
                                type="password"
                                className={`form-control bg-transparent text-white border-secondary ${errors.password ? 'is-invalid' : ''}`}
                                placeholder="••••••••"
                                {...register("password", {
                                    required: "Password is required",
                                    minLength: {
                                        value: 6,
                                        message: "Password must be at least 6 characters"
                                    }
                                })}
                            />
                            {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
                        </div>

                        <div className="mb-4">
                            <label className="form-label text-muted">Role</label>
                            <select
                                className="form-select bg-transparent text-white border-secondary"
                                {...register("role")}
                            >
                                <option value="admin" className="text-dark">Admin</option>
                                <option value="user" className="text-dark">User</option>
                            </select>
                        </div>

                        <button type="submit" className="btn btn-premium w-100">Access Dashboard</button>
                    </form>
                    <div className="text-center mt-3">
                        <small className="text-muted">Hint: Use any valid email & 6+ chars password</small>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
