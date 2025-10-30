import React, { useState, useEffect } from 'react';
import medicineService from '../services/medicineService';
import MedicineCard from '../components/MedicineCard';

const MedicinePage = () => {
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchMedicines = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await medicineService.searchMedicines(searchTerm);
                setMedicines(response.data);
            } catch (err) {
                setMedicines([]);
                setError('Could not fetch medicines. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        const delayDebounceFn = setTimeout(() => {
            fetchMedicines();
        }, 300); // Shorter delay for a "snappier" feel

        return () => clearTimeout(delayDebounceFn);

    }, [searchTerm]);

    return (
        <div className="container mx-auto p-4 sm:p-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Medicines & Health Products</h1>

            {/* --- NEW: Modern Search Bar --- */}
            <div className="mb-8 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input
                    type="text"
                    placeholder="Search for medicines, health products and more..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 pl-12 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>

            {/* Results Grid */}
            {loading ? (
                <p className="text-center text-gray-500">Searching...</p>
            ) : error ? (
                <p className="text-center text-red-500">{error}</p>
            ) : medicines.length === 0 ? (
                 <p className="text-center text-gray-500">{searchTerm ? 'No medicines found.' : 'Enter a search term.'}</p>
            ): (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {/* We pass the 'index' to the card for the animation delay */}
                    {medicines.map((med, index) => (
                        <MedicineCard key={med._id} medicine={med} index={index} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default MedicinePage;