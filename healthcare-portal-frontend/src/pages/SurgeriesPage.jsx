import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import surgeryService from '../services/surgeryService';

// --- This is the new hook that adds/removes the chatbot ---
const useChatbot = () => {
    useEffect(() => {
        // 1. Create the config script
        const configScript = document.createElement('script');
        configScript.innerHTML = `
            window.chatpilotConfig = {
                chatbotId: "a8b1e9d052cf4e9b88e9ee6e28137808",
                domain: "https://www.newoaks.ai",
                chatModeOnly: true
            };
        `;
        document.head.appendChild(configScript);

        // 2. Create the main embed script
        const embedScript = document.createElement('script');
        embedScript.src = "https://www.newoaks.ai/embed.min.js";
        embedScript.charset = "utf-8";
        embedScript.defer = true;
        document.head.appendChild(embedScript);

        // 3. Cleanup function: This runs when the user leaves the page
        return () => {
            // Remove the scripts
            document.head.removeChild(configScript);
            document.head.removeChild(embedScript);
            
            // Find and remove the chat bubble widget from the DOM
            const widget = document.getElementById('chatpilot-bubble-embed');
            if (widget) {
                widget.remove();
            }
        };
    }, []); // The empty array means this runs only once when the page loads
};


// --- Modern Surgery Card Component ---
const SurgeryCard = ({ surgery, index }) => (
    <div 
        className="fade-in-up bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
        style={{ animationDelay: `${index * 50}ms` }}
    >
        <Link to={`/surgeries/${surgery._id}`} className="block">
            <img 
                src={surgery.imageUrl} 
                alt={surgery.title} 
                className="w-full h-48 object-cover"
                onError={(e) => { e.target.onerror = null; e.target.src='https://via.placeholder.com/400x200?text=Procedure'; }}
            />
            <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{surgery.title}</h3>
                <p className="text-sm text-gray-600 h-20">{surgery.summary}</p>
                <div className="mt-4 text-indigo-600 font-semibold hover:text-indigo-800 transition-colors">
                    Learn More &rarr;
                </div>
            </div>
        </Link>
    </div>
);

// --- Main Surgeries Page ---
const SurgeriesPage = () => {
    useChatbot(); // <-- ADD THIS LINE to activate the chatbot
    
    const [surgeries, setSurgeries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSurgeries = async () => {
            try {
                const response = await surgeryService.getAllSurgeries();
                setSurgeries(response.data);
            } catch (err) {
                setError('Could not fetch surgery information. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchSurgeries();
    }, []);

    if (loading) return <p className="text-center p-10">Loading information...</p>;
    if (error) return <p className="text-center p-10 text-red-500">{error}</p>;

    return (
        <div className="container mx-auto p-4 sm:p-8">
            <h1 className="text-4xl font-bold mb-8 text-gray-900">Surgeries & Procedures</h1>
            <p className="text-lg text-gray-600 mb-12">
                Learn more about common procedures, what to expect, and find the right specialist for your needs.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {surgeries.map((surgery, index) => (
                    <SurgeryCard key={surgery._id} surgery={surgery} index={index} />
                ))}
            </div>
        </div>
    );
};

export default SurgeriesPage;