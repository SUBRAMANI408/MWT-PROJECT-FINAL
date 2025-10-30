// src/pages/ForgotPasswordPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            await authService.forgotPassword({ email });
            setMessage('If an account with that email exists, a password reset link has been sent.');
        } catch (error) {
            setMessage('An error occurred. Please try again.');
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="p-8 bg-white rounded-lg shadow-xl w-full max-w-sm">
                <h2 className="text-2xl font-bold mb-6 text-center">Forgot Password</h2>
                {message ? (
                    <p className="text-center text-green-600">{message}</p>
                ) : (
                    <form onSubmit={onSubmit}>
                        <p className="text-center text-gray-600 mb-4">Enter your email address and we will send you a link to reset your password.</p>
                        <input type="email" name="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-3 mb-4 border rounded" />
                        <button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded hover:bg-indigo-700">Send Reset Link</button>
                    </form>
                )}
                <div className="text-center mt-4">
                    <Link to="/login" className="text-sm text-indigo-600 hover:underline">Back to Login</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;