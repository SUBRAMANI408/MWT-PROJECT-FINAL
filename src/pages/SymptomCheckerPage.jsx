import React, { useState } from 'react';
import aiService from '../services/aiService'; // Make sure you have this service file

const SymptomCheckerPage = () => {
    const [symptoms, setSymptoms] = useState('');
    const [analysis, setAnalysis] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setAnalysis('');

        try {
            // Call the backend API (which is now running the simulation)
            const response = await aiService.getSymptomAnalysis(symptoms);
            setAnalysis(response.data.analysis);
        } catch (err) {
            setError('Failed to get analysis. Please try again later.');
            console.error('Symptom checker error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 sm:p-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold mb-4 text-gray-800">AI Symptom Checker</h1>
                <p className="mb-6 text-gray-600">
                    Describe your symptoms in the text box below to get a preliminary analysis and a recommendation for the type of specialist to consult.
                </p>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="symptoms" className="block text-lg font-medium text-gray-700">
                            How are you feeling?
                        </label>
                        <textarea
                            id="symptoms"
                            rows="5"
                            value={symptoms}
                            onChange={(e) => setSymptoms(e.target.value)}
                            className="mt-2 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="e.g., I have a persistent dry cough and a slight headache for the last 3 days..."
                        ></textarea>
                        <button
                            type="submit"
                            disabled={isLoading || !symptoms}
                            className="mt-4 w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400"
                        >
                            {isLoading ? 'Analyzing...' : 'Get AI Analysis'}
                        </button>
                    </form>
                </div>

                {error && (
                    <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                        <p>{error}</p>
                    </div>
                )}

                {analysis && (
                    <div className="mt-6 bg-blue-50 p-6 rounded-lg shadow-md fade-in-up">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Analysis Result</h2>
                        {/* The <pre> tag respects the formatting from our simulation */}
                        <pre className="whitespace-pre-wrap font-sans text-gray-700">{analysis}</pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SymptomCheckerPage;