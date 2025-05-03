import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { useNavigate } from 'react-router-dom';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const colors = ['#0d6efd', '#198754', '#fd7e14', '#6f42c1']; // Bootstrap blue, green, orange, purple

const Home = () => {
    const { userId } = useAuth();
    const { showSuccessToast, showErrorToast } = useToast();
    

    return (
        <div className="container py-4">
            <h2>hello</h2>
        </div>
    );
};

export default Home;
