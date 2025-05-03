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
        <nav
            className="navbar navbar-expand-lg"
            style={{
                backgroundColor: '#FFDAB9', // Peach color
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                borderRadius: '0 0 12px 12px',
                padding: '0.8rem 1.5rem',
            }}
        >
            <div className="container-fluid d-flex justify-content-between align-items-center">
                <a className="navbar-brand d-flex align-items-center" href="/">
                    <img
                        src="/logo1.jpeg"
                        alt="Logo"
                        height="60"
                        className="navbar-logo me-3"
                        style={{ borderRadius: '8px' }}
                    />
                    <span style={{
                        fontSize: '1.8rem',
                        fontWeight: '700',
                        color: '#333',
                    }}>
                        Project Tracker
                    </span>
                </a>

                <div className="d-flex align-items-center">
                    <span style={{
                        marginRight: '24px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: '#3B3B98'
                    }}>
                        Welcome {username ? username.toUpperCase() : "USER"}
                    </span>

                    <button
                        className="btn"
                        onClick={handleLogout}
                        style={{
                            backgroundColor: '#FF6B6B',
                            color: 'white',
                            fontWeight: '600',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: 'none',
                            transition: 'background-color 0.3s ease',
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#e55a5a'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#FF6B6B'}
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
