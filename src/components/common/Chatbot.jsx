import React, { useState, useRef, useEffect } from 'react';

// --- The Bot's "Brain" ---
// It just looks for keywords in the user's message.
const getBotResponse = (message) => {
    const msg = message.toLowerCase();

    if (msg.includes('hello') || msg.includes('hi')) {
        return "Hello! How can I help you today? You can ask me about features, doctors, or medicines.";
    }
    if (msg.includes('feature') || msg.includes('help') || msg.includes('what can you do')) {
        return "I can help you: \n • Find a Doctor \n • Book Appointments \n • Check Symptoms \n • Scan Nutrition \n • Order Medicines \n • View Surgeries \n • Manage Prescriptions";
    }
    if (msg.includes('doctor') || msg.includes('appointment') || msg.includes('video call')) {
        return "You can click 'Find a Doctor' to search for a specialist. From there, you can view their profile, book an appointment, and even have a video consultation.";
    }
    if (msg.includes('medicine') || msg.includes('cart') || msg.includes('order')) {
        return "Yes, you can browse and buy medicines. Just click the 'Medicines' link. You can add items to your cart and check out securely.";
    }
    if (msg.includes('symptom')) {
        return "The 'Symptom Checker' lets you describe your symptoms and an AI will suggest a possible specialist to consult.";
    }
    if (msg.includes('nutrition')) {
        return "The 'Nutrition Scanner' lets you upload a photo of your food, and an AI will estimate its nutritional info (calories, protein, etc.).";
    }
    if (msg.includes('bye') || msg.includes('thanks')) {
        return "You're welcome! Have a great day.";
    }

    return "Sorry, I'm just a simple bot. I can answer questions about our features, like 'doctors', 'medicines', or 'symptoms'.";
};


// --- The Chatbot Component ---
const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([
        { sender: 'bot', text: 'Hello! I am your SmartHealth assistant. Ask me about our features!' }
    ]);
    const chatEndRef = useRef(null);

    // Scroll to the bottom when a new message appears
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    const handleSend = () => {
        if (!message.trim()) return;

        const userMessage = { sender: 'user', text: message };
        
        // Add user message and get bot response
        setChatHistory(prev => [...prev, userMessage]);
        const botResponse = { sender: 'bot', text: getBotResponse(message) };
        
        // Simulate bot "thinking"
        setTimeout(() => {
            setChatHistory(prev => [...prev, botResponse]);
        }, 700);

        setMessage('');
    };

    return (
        <div className="fixed bottom-5 right-5 z-50">
            {/* Chat Window */}
            {isOpen && (
                <div className="fade-in-up w-80 h-96 bg-white rounded-lg shadow-2xl flex flex-col">
                    {/* Header */}
                    <div className="bg-indigo-600 text-white p-3 rounded-t-lg flex justify-between items-center">
                        <h3 className="font-semibold">SmartHealth Assistant</h3>
                        <button onClick={() => setIsOpen(false)} className="font-bold text-xl">&times;</button>
                    </div>
                    {/* Chat Messages */}
                    <div className="flex-grow p-3 space-y-3 overflow-y-auto bg-gray-50">
                        {chatHistory.map((chat, index) => (
                            <div key={index} className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`p-2 rounded-lg max-w-xs ${chat.sender === 'user' ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                    <pre className="whitespace-pre-wrap font-sans text-sm">{chat.text}</pre>
                                </div>
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>
                    {/* Input */}
                    <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 border-t flex">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-grow p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button type="submit" className="bg-indigo-600 text-white px-4 rounded-r-md hover:bg-indigo-700">
                            Send
                        </button>
                    </form>
                </div>
            )}
            
            {/* Chat Bubble Toggle Button */}
            {!isOpen && (
                <button 
                    onClick={() => setIsOpen(true)} 
                    className="bg-indigo-600 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-indigo-700"
                    title="Open Chat"
                >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                </button>
            )}
        </div>
    );
};

export default Chatbot;