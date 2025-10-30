import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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


// --- Reusable Star Component ---
const Stars = ({ rating, count }) => { /* ... (Your Stars component code) ... */ };

const SurgeryDetailsPage = () => {
    useChatbot(); // <-- ADD THIS LINE to activate the chatbot

    const { id } = useParams();
    const navigate = useNavigate();
    const [surgery, setSurgery] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSurgery = async () => {
            setLoading(true);
            try {
                const response = await surgeryService.getSurgeryById(id);
                setSurgery(response.data);
            } catch (err) {
                setError('Could not find this surgery information.');
            } finally {
                setLoading(false);
            }
        };
        fetchSurgery();
    }, [id]);

    const handleBookConsult = () => {
        navigate(`/find-doctor?specialization=${surgery.specialistToConsult}`);
    };

    if (loading) return <p className="text-center p-10">Loading details...</p>;
    if (error) return <p className="text-center p-10 text-red-500">{error}</p>;
    if (!surgery) return null;

    return (
        <div className="bg-white">
            <div className="container mx-auto p-4 sm:p-8">
                {/* Back Link */}
                <div className="mb-4">
                    <Link to="/surgeries" className="text-indigo-600 hover:text-indigo-800 font-semibold">
                        &larr; Back to all surgeries
                    </Link>
                </div>
                
                {/* --- Main Content Area --- */}
                <div className="flex flex-col lg:flex-row gap-12">
                    
                    {/* Left Column (Details) */}
                    <div className="lg:w-2/3 fade-in-up">
                        <img 
                            src={surgery.imageUrl} 
                            alt={surgery.title} 
                            className="w-full h-96 object-cover rounded-lg shadow-lg mb-6"
                            onError={(e) => { e.target.onerror = null; e.target.src='https://via.placeholder.com/800x400?text=Procedure'; }}
                        />
                        
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">{surgery.title}</h1>
                        <p className="text-lg text-gray-600 mb-8">{surgery.detailedDescription}</p>
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-semibold mb-3 text-gray-800 border-b pb-2">Procedure & Treatment</h2>
                                <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{surgery.procedureAndTreatment}</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Booking Box) */}
                    <div className="lg:w-1/3 fade-in-up" style={{ animationDelay: '200ms' }}>
                        <div className="sticky top-28 bg-gray-50 p-6 rounded-lg shadow-lg border">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Ready for the next step?</h2>
                            <p className="text-gray-600 mb-4">
                                This procedure is typically performed by a <strong className="text-indigo-700">{surgery.specialistToConsult}</strong>.
                            </p>
                            <button 
                                onClick={handleBookConsult}
                                className="w-full bg-green-500 text-white py-3 px-6 rounded-lg font-bold text-lg hover:bg-green-600 transition-all duration-300 shadow-md hover:shadow-lg"
                            >
                                Consult a Specialist Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SurgeryDetailsPage;