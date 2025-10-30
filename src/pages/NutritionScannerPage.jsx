// src/pages/NutritionScannerPage.jsx

import React, { useState } from 'react';
import nutritionService from '../services/nutritionService';

const NutritionScannerPage = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
            setResult(null); // Clear previous results
        }
    };

    const handleAnalyze = async () => {
        if (!selectedFile) {
            setError('Please select an image to analyze.');
            return;
        }

        setIsLoading(true);
        setError('');
        setResult(null);

        const formData = new FormData();
        formData.append('foodImage', selectedFile);

        try {
            const response = await nutritionService.analyzeImage(formData);
            // ✅ UPDATED: backend now sends formatted data directly
            setResult(response.data);
        } catch (err) {
            // ✅ UPDATED: show specific backend error message if available
            setError(err.response?.data?.msg || 'Failed to analyze image. Please try again.');
            console.error('Nutrition scanner error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 sm:p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-4 text-gray-800">AI Nutrition Scanner</h1>
                <p className="mb-6 text-gray-600">
                    Upload a photo of your meal to get an estimated nutritional breakdown.
                </p>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex flex-col items-center">
                        <div className="w-full h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-4">
                            {preview ? (
                                <img
                                    src={preview}
                                    alt="Food preview"
                                    className="max-h-full max-w-full object-contain"
                                />
                            ) : (
                                <p className="text-gray-400">Image preview will appear here</p>
                            )}
                        </div>

                        <label
                            htmlFor="food-upload"
                            className="cursor-pointer bg-white border border-gray-400 text-gray-700 py-2 px-4 rounded-md font-semibold hover:bg-gray-50"
                        >
                            Choose File
                        </label>
                        <input
                            id="food-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            {selectedFile ? selectedFile.name : 'No file selected'}
                        </p>

                        <button
                            onClick={handleAnalyze}
                            disabled={isLoading || !selectedFile}
                            className="mt-6 w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400"
                        >
                            {isLoading ? 'Analyzing...' : 'Analyze Food'}
                        </button>
                    </div>
                </div>

                {error && <p className="text-red-500 text-center mt-4">{error}</p>}

                {result && (
                    <div className="mt-6 bg-green-50 p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800 capitalize">
                            {result.food_name}
                        </h2>
                        <div className="grid grid-cols-2 gap-4 text-lg">
                            <div className="p-4 bg-white rounded-lg shadow-sm">
                                <p className="text-sm text-gray-500">Calories</p>
                                <p className="font-bold text-2xl text-green-600">{result.calories}</p>
                            </div>
                            <div className="p-4 bg-white rounded-lg shadow-sm">
                                <p className="text-sm text-gray-500">Protein</p>
                                <p className="font-bold text-2xl text-green-600">
                                    {result.protein_g}g
                                </p>
                            </div>
                            <div className="p-4 bg-white rounded-lg shadow-sm">
                                <p className="text-sm text-gray-500">Fat</p>
                                <p className="font-bold text-2xl text-green-600">
                                    {result.fat_total_g}g
                                </p>
                            </div>
                            <div className="p-4 bg-white rounded-lg shadow-sm">
                                <p className="text-sm text-gray-500">Carbs</p>
                                <p className="font-bold text-2xl text-green-600">
                                    {result.carbohydrates_total_g}g
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NutritionScannerPage;
