// src/pages/admin/AdminRegisterPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import adminService from '../../services/adminService';

const AdminRegisterPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', secretKey: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setError('');
        try {
            const response = await adminService.register(formData);
            localStorage.setItem('token', response.data.token);
            navigate('/admin/dashboard');
        } catch (err) {
            setError(err.response?.data?.msg || 'Registration failed.');
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
            <div className="p-8 bg-gray-800 rounded-lg shadow-xl w-full max-w-sm">
                <h2 className="text-2xl font-bold mb-6 text-center">Admin Registration</h2>
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                <form onSubmit={onSubmit}>
                    <input type="text" name="name" placeholder="Full Name" onChange={onChange} required className="w-full p-3 mb-4 border rounded bg-gray-700 border-gray-600" />
                    <input type="email" name="email" placeholder="Email" onChange={onChange} required className="w-full p-3 mb-4 border rounded bg-gray-700 border-gray-600" />
                    <input type="password" name="password" placeholder="Password" minLength="6" onChange={onChange} required className="w-full p-3 mb-4 border rounded bg-gray-700 border-gray-600" />
                    <input type="password" name="secretKey" placeholder="Admin Secret Key" onChange={onChange} required className="w-full p-3 mb-4 border rounded bg-gray-700 border-gray-600" />
                    <button type="submit" className="w-full bg-green-600 p-3 rounded hover:bg-green-700">Register Admin</button>
                </form>
                 <p className="text-center mt-4 text-sm text-gray-400">
                    Already an admin? <Link to="/admin" className="text-green-400 hover:underline">Login here</Link>
                </p>
            </div>
        </div>
    );
};

export default AdminRegisterPage;