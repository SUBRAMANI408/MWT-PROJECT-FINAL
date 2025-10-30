// src/pages/AuthCallback.jsx
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AuthCallback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');

        if (token) {
            console.log("Token received, saving to localStorage...");
            localStorage.setItem('token', token);
            navigate('/dashboard');
        } else {
            console.error("Authentication failed, no token received.");
            navigate('/login');
        }
    }, [navigate, searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-xl">Please wait, logging you in...</p>
        </div>
    );
};

export default AuthCallback;