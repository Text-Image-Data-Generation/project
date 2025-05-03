import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Select from 'react-select';
import countryList from 'react-select-country-list';
import { useToast } from './ToastContext';

function SignUp() {
    const navigate = useNavigate();
    const { showSuccessToast, showErrorToast } = useToast();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        country: '',
    });

    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

    const options = countryList().getData();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCountryChange = (value) => {
        setFormData(prev => ({ ...prev, country: value.label }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            showErrorToast("Passwords do not match");
            return;
        }

        const strongPasswordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if (!strongPasswordRegex.test(formData.password)) {
            showErrorToast("Password must be at least 8 characters long and include one uppercase letter, one number, and one special character.");
            return;
        }

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_ServerUrl}/signup`,
                {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    country: formData.country,
                }
            );

            if (response.status === 201) {
                showSuccessToast("Account created! Please log in.");
                navigate('/login');
            }
        } catch (err) {
            showErrorToast(err.response?.data?.message || 'Signup failed');
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100" style={{ background: 'linear-gradient(135deg, #cdeffd, #e3f6ff)' }}>
            <div className="card shadow p-4" style={{ maxWidth: '500px', width: '100%', borderRadius: '20px' }}>
                <div className="text-center mb-4">
                    <h2 className="text-primary fw-bold">Task Tracker</h2>
                    <p className="text-muted">Manage projects effectively</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Name</label>
                        <input type="text" className="form-control" name="name" required value={formData.name} onChange={handleChange} />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input type="email" className="form-control" name="email" required value={formData.email} onChange={handleChange} />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input type={passwordVisible ? 'text' : 'password'} className="form-control" name="password" required value={formData.password} onChange={handleChange} />
                        <div className="form-check mt-1">
                            <input className="form-check-input" type="checkbox" id="showPassword" onChange={() => setPasswordVisible(!passwordVisible)} />
                            <label className="form-check-label" htmlFor="showPassword">Show Password</label>
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Confirm Password</label>
                        <input type={confirmPasswordVisible ? 'text' : 'password'} className="form-control" name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange} />
                        <div className="form-check mt-1">
                            <input className="form-check-input" type="checkbox" id="showConfirmPassword" onChange={() => setConfirmPasswordVisible(!confirmPasswordVisible)} />
                            <label className="form-check-label" htmlFor="showConfirmPassword">Show Confirm Password</label>
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Country</label>
                        <Select
                            options={options}
                            onChange={handleCountryChange}
                            placeholder="Select your country"
                            styles={{ control: (base) => ({ ...base, borderRadius: '8px', borderColor: '#ced4da' }) }}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-100">Sign Up</button>

                    <div className="mt-3 text-center">
                        Already have an account?{' '}
                        <span style={{ color: '#007bff', cursor: 'pointer' }} onClick={() => navigate('/login')}>
                            Login
                        </span>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SignUp;
