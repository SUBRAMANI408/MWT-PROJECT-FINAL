// src/pages/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GoogleButton from 'react-google-button';
import authService from '../services/authService';

const Register = () => {
    const [step, setStep] = useState(1); // 1 for details, 2 for OTP
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'patient', phoneNumber: '' });
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const response = await authService.sendOtpForRegistration(formData);
            console.log(response.data.msg); // "OTP sent..."
            setStep(2); // Move to OTP verification step
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to send OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyAndRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const response = await authService.verifyOtpAndRegister({ email: formData.email, otp });
            localStorage.setItem('token', response.data.token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.msg || 'Registration failed. Please check your OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="p-8 bg-white rounded-lg shadow-xl w-full max-w-md">
                {step === 1 ? (
                    <div>
                        <h2 className="text-2xl font-bold mb-4 text-center">Create Account</h2>
                        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                        <form onSubmit={handleSendOtp}>
                            {/* Input fields */}
                            <input type="text" name="name" placeholder="Full Name" onChange={onChange} required className="w-full p-3 mb-4 border rounded" />
                            <input type="email" name="email" placeholder="Email Address" onChange={onChange} required className="w-full p-3 mb-4 border rounded" />
                            <input type="password" name="password" placeholder="Password" minLength="6" onChange={onChange} required className="w-full p-3 mb-4 border rounded" />
                            <input type="tel" name="phoneNumber" placeholder="Phone Number" onChange={onChange} required className="w-full p-3 mb-4 border rounded" />
                            <select name="role" value={formData.role} onChange={onChange} className="w-full p-3 mb-4 border rounded">
                                <option value="patient">Register as Patient</option>
                                <option value="doctor">Register as Doctor</option>
                            </select>
                            <button type="submit" disabled={isLoading} className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 disabled:bg-blue-300">
                                {isLoading ? 'Sending OTP...' : 'Send OTP'}
                            </button>
                        </form>
                        <div className="text-center my-4">
                            <p className="text-gray-500">Already have an account? <Link to="/login" className="text-blue-500 hover:underline">Login</Link></p>
                        </div>
                    </div>
                ) : (
                    <div>
                        <h2 className="text-2xl font-bold mb-2 text-center">Verify Your Email</h2>
                        <p className="text-center text-gray-600 mb-4">An OTP has been sent to {formData.email}</p>
                        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                        <form onSubmit={handleVerifyAndRegister}>
                            <input type="text" value={otp} onChange={e => setOtp(e.target.value)} placeholder="Enter 6-Digit OTP" maxLength="6" className="w-full p-3 mb-4 border rounded text-center tracking-[1em]" />
                            <button type="submit" disabled={isLoading} className="w-full bg-green-500 text-white p-3 rounded hover:bg-green-600 disabled:bg-green-300">
                                {isLoading ? 'Verifying...' : 'Create Account'}
                            </button>
                        </form>
                    </div>
                )}
                <div className="flex items-center my-4">
                    <hr className="flex-grow border-t border-gray-300" />
                    <span className="px-4 text-gray-500">OR</span>
                    <hr className="flex-grow border-t border-gray-300" />
                </div>
                <div className="flex justify-center">
                    {/* The Google button is an 'a' tag pointing to the backend route */}
                    <a href="http://localhost:5001/api/auth/google">
                        <GoogleButton type="light" />
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Register;