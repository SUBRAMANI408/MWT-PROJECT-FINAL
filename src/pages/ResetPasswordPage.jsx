// src/pages/ResetPasswordPage.jsx
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';

const ResetPasswordPage = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const { token } = useParams(); // Gets token from URL
    const navigate = useNavigate();

    const onSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }
        setError('');
        try {
            await authService.resetPassword(token, { password });
            setMessage('Password has been reset successfully! You can now log in.');
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to reset password. The token may be invalid or expired.');
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="p-8 bg-white rounded-lg shadow-xl w-full max-w-sm">
                <h2 className="text-2xl font-bold mb-6 text-center">Reset Password</h2>
                {message ? (
                    <div>
                        <p className="text-center text-green-600">{message}</p>
                         <Link to="/login" className="mt-4 block text-center w-full bg-green-500 text-white p-3 rounded hover:bg-green-600">Go to Login</Link>
                    </div>
                ) : (
                    <form onSubmit={onSubmit}>
                        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                        <input type="password" placeholder="New Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full p-3 mb-4 border rounded" />
                        <input type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full p-3 mb-4 border rounded" />
                        <button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded hover:bg-indigo-700">Reset Password</button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPasswordPage;