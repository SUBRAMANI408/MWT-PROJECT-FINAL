// src/pages/admin/AdminLoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import adminService from '../../services/adminService';

const AdminLoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setError('');
        try {
            const response = await adminService.login(formData);
            localStorage.setItem('token', response.data.token);
            navigate('/admin/dashboard');
        } catch (err) {
            setError(err.response?.data?.msg || 'Login failed.');
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
            <div className="p-8 bg-gray-800 rounded-lg shadow-xl w-full max-w-sm">
                <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                <form onSubmit={onSubmit}>
                    <input type="email" name="email" placeholder="Email" onChange={onChange} required className="w-full p-3 mb-4 border rounded bg-gray-700 border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <input type="password" name="password" placeholder="Password" onChange={onChange} required className="w-full p-3 mb-4 border rounded bg-gray-700 border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <button type="submit" className="w-full bg-indigo-600 p-3 rounded hover:bg-indigo-700">Login</button>
                </form>
                <p className="text-center mt-4 text-sm text-gray-400">
                    Need to create an admin account? <Link to="/admin/register" className="text-indigo-400 hover:underline">Register here</Link>
                </p>
            </div>
        </div>
    );
};

export default AdminLoginPage;