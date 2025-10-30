// src/pages/MedicineDetailsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import medicineService from '../services/medicineService';
import defaultAvatar from '../assets/default-avatar.png';
import { useCart } from '../context/CartContext'; // <-- Import the hook

// --- Reusable Star Component ---
const Stars = ({ rating, count }) => {
    const totalStars = 5;
    let stars = [];
    for (let i = 1; i <= totalStars; i++) {
        stars.push(
            <svg key={i} className={`w-5 h-5 ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
        );
    }
    return (
        <div className="flex items-center">
            {stars}
            {count > 0 && <span className="text-gray-500 text-sm ml-2">({count} reviews)</span>}
        </div>
    );
};

const MedicineDetailsPage = () => {
    const { id } = useParams();
    const { addItemToCart } = useCart(); // <-- Cart hook
    const [medicine, setMedicine] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMedicine = async () => {
            setLoading(true);
            try {
                const response = await medicineService.getMedicineById(id);
                setMedicine(response.data);
            } catch (err) {
                setError('Medicine not found.');
            } finally {
                setLoading(false);
            }
        };
        fetchMedicine();
    }, [id]);

    const imageUrl = (medicine?.imageUrl && medicine.imageUrl.startsWith('http')) 
        ? medicine.imageUrl 
        : defaultAvatar;

    if (loading) return <p className="text-center p-10">Loading medicine details...</p>;
    if (error) return <p className="text-center p-10 text-red-500">{error}</p>;
    if (!medicine) return null;

    return (
        <div className="bg-gray-50">
            <div className="container mx-auto p-4 sm:p-8">
                {/* --- Back Link --- */}
                <div className="mb-4">
                    <Link to="/medicines" className="text-indigo-600 hover:text-indigo-800 font-semibold">
                        &larr; Back to Medicines
                    </Link>
                </div>
                
                {/* --- Main Product Section --- */}
                <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col md:flex-row gap-8">
                    {/* Image Column */}
                    <div className="md:w-1/2 flex flex-col items-center">
                        <img
                            src={imageUrl}
                            alt={medicine.name}
                            className="w-full max-w-sm h-auto object-contain rounded-lg border p-4"
                            onError={(e) => { e.target.onerror = null; e.target.src = defaultAvatar; }}
                        />
                    </div>

                    {/* Details Column */}
                    <div className="md:w-1/2">
                        <h1 className="text-3xl font-bold text-gray-800">{medicine.name}</h1>
                        <p className="text-lg text-gray-500 mt-2">By {medicine.manufacturer}</p>
                        
                        {/* Star Ratings */}
                        <div className="my-4">
                            <Stars rating={medicine.averageRating} count={medicine.numberOfReviews} />
                        </div>

                        <div className="my-6">
                            <span className="text-4xl font-bold text-gray-800">₹{medicine.price.toFixed(2)}</span>
                        </div>

                        {/* --- Add to Cart Button --- */}
                        <button 
                            onClick={() => addItemToCart(medicine)}
                            className="w-full bg-green-500 text-white py-3 px-6 rounded-lg font-bold text-lg hover:bg-green-600 transition"
                        >
                            Add to Cart
                        </button>

                        {/* Offers Section */}
                        <div className="mt-6 border border-gray-200 rounded-lg p-4">
                            <h3 className="font-bold text-lg mb-2">Offers just for you</h3>
                            <p className="text-sm text-green-600 mb-2">27% OFF - Save Live: Get 27%* OFF</p>
                            <p className="text-sm text-gray-600">Get 24% OFF on orders with 12 Months Plus Membership</p>
                        </div>
                    </div>
                </div>

                {/* --- Description Section --- */}
                <div className="mt-12 bg-white p-8 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800">Description</h2>
                    <p className="text-gray-600 whitespace-pre-wrap mb-6">{medicine.description}</p>

                    <h3 className="text-xl font-semibold mb-2 text-gray-800">Ingredients and Benefits</h3>
                    <p className="text-gray-600 whitespace-pre-wrap mb-6">{medicine.ingredientsAndBenefits}</p>
                    
                    <h3 className="text-xl font-semibold mb-2 text-gray-800">Uses</h3>
                    <p className="text-gray-600 whitespace-pre-wrap mb-6">{medicine.uses}</p>

                    <h3 className="text-xl font-semibold mb-2 text-gray-800">Dosage</h3>
                    <p className="text-gray-600 whitespace-pre-wrap mb-6">{medicine.dosage}</p>

                    <h3 className="text-xl font-semibold mb-2 text-gray-800">Other General Warnings</h3>
                    <p className="text-gray-600 whitespace-pre-wrap">{medicine.generalWarnings}</p>
                </div>
            </div>
        </div>
    );
};

export default MedicineDetailsPage;
