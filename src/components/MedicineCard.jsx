// src/components/MedicineCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import defaultAvatar from '../assets/default-avatar.png';
import { useCart } from '../context/CartContext'; // Import the hook

const MedicineCard = ({ medicine, index }) => {
    const { addItemToCart } = useCart(); // Get the function from the context

    const imageUrl = medicine.imageUrl && medicine.imageUrl.startsWith('http')
        ? medicine.imageUrl
        : defaultAvatar;

    return (
        <div 
            className="fade-in bg-white rounded-lg shadow-md p-4 flex flex-col items-center text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            style={{ animationDelay: `${index * 50}ms` }}
        >
            {/* Make the image a link */}
            <Link to={`/medicine/${medicine._id}`}>
                <img
                    src={imageUrl}
                    alt={medicine.name}
                    className="w-32 h-32 object-contain mb-4 cursor-pointer"
                    onError={(e) => { e.target.onerror = null; e.target.src = defaultAvatar; }}
                />
            </Link>
            
            {/* Make the name a link */}
            <Link to={`/medicine/${medicine._id}`}>
                <h3 className="font-bold text-gray-800 text-md mb-1 h-12 flex items-center justify-center hover:text-indigo-600">
                    {medicine.name}
                </h3>
            </Link>
            
            <p className="text-sm text-gray-400 mb-2 flex-grow">
                {medicine.manufacturer}
            </p>
            
            <p className="font-bold text-xl text-gray-900 mb-4">
                ₹{medicine.price.toFixed(2)}
            </p>
            
            {/* Add to Cart Button */}
            <button 
                onClick={() => addItemToCart(medicine)}
                className="w-full bg-indigo-500 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-indigo-600 transition-colors"
            >
                Add to Cart
            </button>
        </div>
    );
};

export default MedicineCard;
