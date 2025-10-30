import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import orderService from '../services/orderService';
import { useCart } from '../context/CartContext'; // Import useCart

const OrderSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const navigate = useNavigate();
    const [status, setStatus] = useState('Verifying your payment...');
    const { clearCart } = useCart(); // Get the clearCart function

    useEffect(() => {
        if (!sessionId) {
            setStatus('Invalid session. Redirecting...');
            setTimeout(() => navigate('/medicines'), 3000);
            return;
        }

        const verifyPayment = async () => {
            try {
                await orderService.verifyOrderPayment(sessionId);
                setStatus('Payment successful! Your order is confirmed.');
                clearCart(); // <-- Clear the cart after successful order
                
                setTimeout(() => navigate('/my-orders'), 3000);
                
            } catch (err) {
                console.error('Payment verification failed:', err);
                setStatus('Payment verification failed. Please contact support.');
                setTimeout(() => navigate('/cart'), 5000);
            }
        };

        verifyPayment();
    }, [sessionId, navigate, clearCart]);

    return (
        <div className="container mx-auto p-8 text-center">
            <div className="bg-white p-10 rounded-lg shadow-lg max-w-md mx-auto">
                <h1 className="text-3xl font-bold mb-4 text-gray-800">Thank You!</h1>
                <p className="text-xl text-gray-600">{status}</p>
            </div>
        </div>
    );
};

export default OrderSuccessPage;