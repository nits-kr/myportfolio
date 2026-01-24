'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '@/store/slices/authSlice';
import { FaUserCircle } from 'react-icons/fa';

export default function Navbar() {
    const pathname = usePathname();
    const dispatch = useDispatch();
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
        { name: 'Projects', path: '/projects' },
    ];

    return (
        <nav className="navbar navbar-expand-lg fixed-top" style={{ padding: '1rem 0' }}>
            <div className="container glass-nav custom-nav-mobile d-flex justify-content-between align-items-center rounded-4">
                <Link href="/" className="navbar-brand fw-bold text-white fs-4">
                    Port<span style={{ color: '#a855f7' }}>folio</span>.
                </Link>

                <button
                    className="navbar-toggler border-0 text-white"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon" style={{ filter: 'invert(1)' }}></span>
                </button>

                <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
                    <ul className="navbar-nav align-items-center gap-3">
                        {navLinks.map((link) => (
                            <li className="nav-item" key={link.path}>
                                <Link
                                    href={link.path}
                                    className={`nav-link text-white ${pathname === link.path ? 'fw-bold text-primary active-link' : ''}`}
                                >
                                    {link.name}
                                </Link>
                            </li>
                        ))}

                        {isMounted && isAuthenticated ? (
                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle text-white d-flex align-items-center gap-2" href="#" role="button" data-bs-toggle="dropdown">
                                    <FaUserCircle size={24} />
                                    <span>{user?.name}</span>
                                </a>
                                <ul className="dropdown-menu dropdown-menu-end glass-card border-0 mt-2">
                                    <li><Link className="dropdown-item text-white" href="/dashboard">Dashboard</Link></li>
                                    <li><hr className="dropdown-divider bg-white" /></li>
                                    <li><button className="dropdown-item text-danger" onClick={() => dispatch(logout())}>Logout</button></li>
                                </ul>
                            </li>
                        ) : (
                            <li className="nav-item ms-lg-2">
                                <Link href="/login" className="btn btn-premium btn-sm px-4">Login</Link>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
}
