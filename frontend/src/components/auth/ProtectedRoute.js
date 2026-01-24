'use client';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';

export default function ProtectedRoute({ children, roles = [] }) {
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        } else if (roles.length > 0 && !roles.includes(user?.role)) {
            router.push('/unauthorized'); // Or handle it gracefully
        }
    }, [isAuthenticated, user, roles, router]);

    if (!isAuthenticated) {
        return null;
    }

    if (roles.length > 0 && !roles.includes(user?.role)) {
        return (
            <div className="container py-5 text-center">
                <div className="glass-card p-5">
                    <h2 className="text-danger">Access Denied</h2>
                    <p>You do not have permission to view this page.</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
