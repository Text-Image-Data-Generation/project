import React from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const { setAuthenticated, setUsername, username } = useAuth();
    const { showSuccessToast, showErrorToast } = useToast();
    const navigate = useNavigate();

    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${process.env.REACT_APP_ServerUrl}/logout`, null, {
                withCredentials: true,
            });

            if (response.status === 200) {
                setAuthenticated(false);
                setUsername('');
                showSuccessToast('Logout successful!');
                navigate('/');
            } else {
                showErrorToast('Logout failed. Please try again.');
            }
        } catch (error) {
            showErrorToast('An error occurred. Please try again.');
        }
    };

    return (
        <nav className="navbar navbar-expand-lg bg-secondary text-light shadow-sm px-4 py-3">
            <div className="container-fluid d-flex justify-content-between align-items-center">
                <a className="navbar-brand fw-bold fs-4 text-light" href="/">
                    Data Augmentation & Generation
                </a>

                <div className="d-flex align-items-center">
                    <span className="me-4 text-light fw-semibold text-uppercase">
                        Welcome {username || "User"}
                    </span>

                    <button
                        className="btn btn-outline-warning fw-semibold px-3"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
