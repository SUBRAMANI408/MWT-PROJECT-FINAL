import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import paymentService from '../services/paymentService';

const BookingSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const navigate = useNavigate();
    const [status, setStatus] = useState('Verifying payment...');

    useEffect(() => {
        if (!sessionId) {
            setStatus('Invalid session. Redirecting...');
            setTimeout(() => navigate('/find-doctor'), 3000);
            return;
        }

        const verifyPayment = async () => {
            try {
                // Send the session_id to our backend to verify
                await paymentService.verifyAppointmentPayment(sessionId);
                setStatus('Payment successful! Your appointment is confirmed.');
                
                // Redirect to dashboard after a short delay
                setTimeout(() => navigate('/dashboard'), 3000);
                
            } catch (err) {
                console.error('Payment verification failed:', err);
                setStatus('Payment verification failed. Please contact support.');
                setTimeout(() => navigate('/dashboard'), 5000);
            }
        };

        verifyPayment();
    }, [sessionId, navigate]);

    return (
        <div className="container mx-auto p-8 text-center">
            <div className="bg-white p-10 rounded-lg shadow-lg max-w-md mx-auto">
                <h1 className="text-3xl font-bold mb-4 text-gray-800">Booking Status</h1>
                <p className="text-xl text-gray-600">{status}</p>
            </div>
        </div>
    );
};

export default BookingSuccessPage;