import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GoogleButton from 'react-google-button';
import authService from '../services/authService';
import Footer from '../components/layout/Footer'; // ✅ Added Footer import

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const navigate = useNavigate();

    const onChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await authService.login(formData);
            localStorage.setItem('token', response.data.token);
            navigate('/dashboard');
        } catch (err) {
            console.error(err.response?.data || err.message);
        }
    };

    return (
        // ✅ Wrapping page in flex layout so Footer stays at bottom
        <div className="flex flex-col min-h-screen bg-gray-100">
            
            {/* --- Main Section --- */}
            <main className="flex-grow flex items-center justify-center py-12 px-4">
                <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                        Login
                    </h2>

                    <form onSubmit={onSubmit}>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            onChange={onChange}
                            required
                            className="w-full p-3 mb-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            onChange={onChange}
                            required
                            className="w-full p-3 mb-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />

                        {/* --- Forgot Password Link --- */}
                        <div className="text-right mb-4">
                            <Link
                                to="/forgot-password"
                                className="text-sm text-indigo-600 hover:underline"
                            >
                                Forgot Password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-green-500 text-white p-3 rounded hover:bg-green-600 transition-colors"
                        >
                            Login
                        </button>
                    </form>

                    {/* --- Register Redirect --- */}
                    <p className="text-center mt-4 text-gray-600">
                        Don't have an account?{' '}
                        <Link
                            to="/register"
                            className="text-green-500 font-medium hover:underline"
                        >
                            Register
                        </Link>
                    </p>

                    {/* --- Divider --- */}
                    <div className="flex items-center my-6">
                        <hr className="flex-grow border-t border-gray-300" />
                        <span className="px-4 text-gray-500">OR</span>
                        <hr className="flex-grow border-t border-gray-300" />
                    </div>

                    {/* --- Google Login --- */}
                    <div className="flex justify-center">
                        <a href="http://localhost:5001/api/auth/google">
                            <GoogleButton type="light" />
                        </a>
                    </div>
                </div>
            </main>

            {/* ✅ Added Footer at the bottom */}
            <Footer />
        </div>
    );
};

export default Login;
