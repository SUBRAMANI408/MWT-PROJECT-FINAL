import React, { useState, useEffect } from 'react';
import orderService from '../services/orderService';
import { Link } from 'react-router-dom';

const MyOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await orderService.getMyOrders();
                setOrders(res.data);
            } catch (err) {
                console.error("Failed to fetch orders:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const getStatusColor = (status) => {
        return status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
    };

    return (
        <div className="container mx-auto p-4 sm:p-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">My Medicine Orders</h1>

            <div className="bg-white p-6 rounded-lg shadow-md">
                {loading ? (
                    <p>Loading your order history...</p>
                ) : orders.length === 0 ? (
                    <p className="text-gray-500">You have not placed any orders yet. <Link to="/medicines" className="text-indigo-600">Browse medicines</Link></p>
                ) : (
                    <div className="space-y-6">
                        {orders.map(order => (
                            <div key={order._id} className="border rounded-lg p-4">
                                <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
                                    <div>
                                        <h2 className="text-lg font-semibold">Order ID: {order._id}</h2>
                                        <p className="text-sm text-gray-500">Placed on: {new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.paymentStatus)}`}>
                                        {order.paymentStatus}
                                    </span>
                                </div>
                                <div className="border-t pt-4">
                                    {order.products.map(product => (
                                        <div key={product.medicineId} className="flex justify-between items-center py-2">
                                            <span className="text-gray-700">{product.name} (x{product.quantity})</span>
                                            <span className="text-gray-900">₹{(product.price * product.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t pt-4 mt-4 flex justify-between items-center font-bold text-lg">
                                    <span>Total Paid</span>
                                    <span>₹{order.totalAmount.toFixed(2)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrdersPage;