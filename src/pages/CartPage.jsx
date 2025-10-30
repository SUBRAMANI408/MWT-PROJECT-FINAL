import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import paymentService from '../services/paymentService'; // <-- Import payment service

const CartPage = () => {
    const { cartItems, removeItemFromCart, increaseQuantity, decreaseQuantity } = useCart();
    const [isLoading, setIsLoading] = useState(false); // <-- Loading state

    const calculateSubtotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
    };

    // --- NEW: Stripe Checkout handler ---
    const handleCheckout = async () => {
        setIsLoading(true);
        try {
            const response = await paymentService.createCheckoutSession(cartItems);
            // Redirect user to Stripe payment page
            window.location.href = response.data.url;
        } catch (err) {
            console.error('Checkout failed:', err);
            alert('Checkout failed. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 sm:p-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Your Cart</h1>
            
            {cartItems.length === 0 ? (
                <div className="text-center p-10 bg-white rounded-lg shadow-md">
                    <p className="text-gray-600 text-xl">Your cart is empty.</p>
                    <Link 
                        to="/medicines" 
                        className="mt-6 inline-block bg-indigo-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-indigo-700"
                    >
                        Continue Shopping
                    </Link>
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* --- Cart Items Section --- */}
                    <div className="flex-grow bg-white p-6 rounded-lg shadow-md">
                        {cartItems.map(item => (
                            <div key={item._id} className="flex items-center gap-4 border-b py-4">
                                <img 
                                    src={item.imageUrl} 
                                    alt={item.name} 
                                    className="w-20 h-20 object-contain rounded border p-1" 
                                />
                                <div className="flex-grow">
                                    <h3 className="font-semibold text-gray-800">{item.name}</h3>
                                    <p className="text-sm text-gray-500">{item.manufacturer}</p>
                                    <p className="font-semibold text-lg mt-1">₹{item.price.toFixed(2)}</p>
                                </div>

                                {/* Quantity Controls */}
                                <div className="flex items-center gap-2 border rounded-lg p-1">
                                    <button 
                                        onClick={() => decreaseQuantity(item._id)} 
                                        className="w-8 h-8 font-bold text-xl text-indigo-600"
                                    >
                                        -
                                    </button>
                                    <span className="w-10 text-center font-semibold">{item.quantity}</span>
                                    <button 
                                        onClick={() => increaseQuantity(item._id)} 
                                        className="w-8 h-8 font-bold text-xl text-indigo-600"
                                    >
                                        +
                                    </button>
                                </div>

                                <button 
                                    onClick={() => removeItemFromCart(item._id)} 
                                    className="text-red-500 hover:text-red-700 font-medium ml-4"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* --- Order Summary Section --- */}
                    <div className="w-full lg:w-1/3">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Order Summary</h2>
                            
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-semibold">₹{calculateSubtotal()}</span>
                            </div>

                            <div className="flex justify-between mb-4">
                                <span className="text-gray-600">Delivery Fee</span>
                                <span className="font-semibold text-green-600">FREE</span>
                            </div>

                            <div className="flex justify-between font-bold text-xl border-t pt-4">
                                <span>Total</span>
                                <span>₹{calculateSubtotal()}</span>
                            </div>

                            {/* --- Checkout Button --- */}
                            <button 
                                onClick={handleCheckout} 
                                disabled={isLoading}
                                className={`mt-6 w-full py-3 rounded-lg font-bold text-white transition ${
                                    isLoading 
                                        ? 'bg-green-400 cursor-not-allowed' 
                                        : 'bg-green-500 hover:bg-green-600'
                                }`}
                            >
                                {isLoading ? 'Processing...' : 'Proceed to Checkout'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;
