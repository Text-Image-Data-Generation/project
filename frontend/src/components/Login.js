import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';

const LoginPage = () => {
    const { setAuthenticated, setUsername, setUserId } = useAuth();
    const { showSuccessToast, showErrorToast } = useToast();

    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const navigate = useNavigate();

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_ServerUrl}/login`,
                { identifier, password },
                { withCredentials: true }
            );
            if (response.status === 200) {
                setUsername(response.data.username);
                setUserId(response.data.userid);
                showSuccessToast('Login successful!');
                setTimeout(() => {
                    navigate('/project');
                    setAuthenticated(true);
                }, 500);
            } else {
                showErrorToast('Login failed. Please try again.');
            }
        } catch (error) {
            showErrorToast('An error occurred. Please try again.');
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100" style={{ background: 'linear-gradient(135deg, #f0f0f0, #d9d9d9)' }}>
            <div className="card shadow p-4" style={{ maxWidth: '500px', width: '100%', borderRadius: '20px' }}>
                <div className="text-center mb-4">
                    <h2 className="text-primary fw-bold">Data Generation and Augmentation</h2>
                    <p className="text-muted">Manage datasets effectively</p>

                </div>

                <h4 className="text-center mb-4">Login</h4>

                <form onSubmit={handleFormSubmit}>
                    <div className="form-floating mb-3">
                        <input
                            type="text"
                            className="form-control rounded-3"
                            id="identifier"
                            name="identifier"
                            placeholder="Username"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                        />
                        <label htmlFor="identifier">Username</label>
                    </div>

                    <div className="form-floating mb-1">
                        <input
                            type={passwordVisible ? 'text' : 'password'}
                            className="form-control rounded-3"
                            id="password"
                            name="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <label htmlFor="password">Password</label>
                    </div>

                    <div className="form-check mb-3 mt-1">
                        <input
                            type="checkbox"
                            className="form-check-input me-2"
                            id="showPassword"
                            onChange={() => setPasswordVisible(!passwordVisible)}
                        />
                        <label htmlFor="showPassword" className="form-check-label">Show password</label>
                    </div>

                    <button className="w-100 btn btn-lg btn-dark rounded-3 mb-3" type="submit">Login</button>

                    <div className="text-center">
                        <span className="text-muted">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-decoration-none">Sign up</Link>
                        </span>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
