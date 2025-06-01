import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './components/AuthContext';
import Home from './components/Home';
import Login from './components/Login';
import SignUp from './components/signup';
import Navbar from './components/Navbar';
import { ToastProvider } from './components/ToastContext';
import Augmentation from './components/Augmentation';
import CTGANUploader from './components/CTGANUploader';
import Uploads from './components/Uploads';
import EnhancedManager from './components/EnhancedManager';
import ImageGenerationDashboard from './components/ImageGenerationDashboard';
import PreviewDataset from './components/PreviewDataset';
import PreviewEnhanced from './components/PreviewEnhanced ';

const ProtectedRoute = ({ children }) => {
    const { authenticated } = useAuth();
    return authenticated ? children : <Navigate to="/" replace />;
};

const App = () => {
    const { authenticated, setAuthenticated, setUsername, setTopic, setUserId } = useAuth();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_ServerUrl}/getProfile`, {
                    withCredentials: true,
                });
                if (response.status === 200) {
                    const { username, userid } = response.data;
                    setUsername(username);
                    setUserId(userid);
                    setAuthenticated(true);
                } else {
                    setAuthenticated(false);
                }
            } catch (error) {
                console.error('Error checking authentication status:', error);
                setAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };
        checkAuthStatus();
    }, [setAuthenticated, setUsername, setTopic, setUserId]);

    if (loading) return <div>Loading...</div>;

    return (
        <ToastProvider>
            <Router>
                {authenticated && <Navbar />}
                <Routes>
                    {/* If authenticated and trying to access login/signup, redirect to home */}
                    <Route path="/" element={authenticated ? <Navigate to="/home" /> : <Login />} />
                    <Route path="/signup" element={authenticated ? <Navigate to="/home" /> : <SignUp />} />

                    {/* Protected route for home */}
                    <Route path="/home" element={
                        <ProtectedRoute>
                            <Home />
                        </ProtectedRoute>
                    } />
                    {/* Protected route for home */}
                    <Route path="/augmentation" element={
                        <ProtectedRoute>
                            <Augmentation />
                        </ProtectedRoute>
                    } />
                    <Route path="/image-resolution" element={
                        <ProtectedRoute>
                            <EnhancedManager />

                        </ProtectedRoute>
                    } />
                    <Route path="/preview/:encodedDatasetName/:contentType" element={
                        <ProtectedRoute>
                            <PreviewDataset />
                        </ProtectedRoute>
                    } />
                    <Route path="/preview/:encodedDatasetName/:contentType/:runId" element={
                        <ProtectedRoute>
                            <PreviewDataset />
                        </ProtectedRoute>
                    } />
                    <Route path="/preview_enhanced/:encodedDatasetName"
                        element={
                            <ProtectedRoute>
                                <PreviewEnhanced />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/lung-image-generation" element={
                        <ProtectedRoute>
                            <ImageGenerationDashboard />

                        </ProtectedRoute>
                    } />
                    {/* Protected route for home */}
                    <Route path="/Uploads" element={
                        <ProtectedRoute>
                            <Uploads />
                        </ProtectedRoute>
                    } />
                    {/* Protected route for home */}
                    <Route path="/csv-generation" element={
                        <ProtectedRoute>
                            <CTGANUploader />
                        </ProtectedRoute>
                    } />

                    {/* Redirect unknown routes */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </ToastProvider>
    );
};

export default App;
