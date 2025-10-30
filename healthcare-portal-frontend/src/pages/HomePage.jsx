import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/layout/Footer';
import Chatbot from '../components/common/Chatbot'; 

// --- Icon Components (defined locally to prevent import errors) ---
const MedicineIcon = () => <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4-8-4V7l8-4 8 4zM4 7v10l8 4 8-4V7"></path></svg>;
const SymptomIcon = () => <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>;
const FindDoctorIcon = () => <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zM.7 13.025A11.025 11.025 0 0112 2.001a11.025 11.025 0 0111.3 11.024M12 21.999A11.025 11.025 0 01.7 13.025"></path></svg>;

// --- Sub-Component: Public Navbar ---
// A simple navbar for your logged-out homepage
const PublicNavbar = () => (
    <nav className="bg-white shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
                <div className="flex-shrink-0">
                    <Link to="/" className="text-3xl font-bold text-indigo-600">
                        SmartHealth
                    </Link>
                </div>
                <div className="flex space-x-4">
                    <Link to="/login" className="text-gray-600 hover:text-indigo-600 font-medium px-3 py-2 rounded-md">
                        Login
                    </Link>
                    <Link to="/register" className="bg-indigo-600 text-white font-medium px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
                        Register
                    </Link>
                </div>
            </div>
        </div>
    </nav>
);

// --- Sub-Component: Hero Section ---
const HeroSection = () => {
    const navigate = useNavigate();
    const [location, setLocation] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        // We navigate the user to the "Find a Doctor" page with their search terms
        navigate(`/find-doctor?location=${location}&search=${searchTerm}`);
    };

    return (
        <section className="relative bg-gradient-to-br from-indigo-500 to-blue-500 text-white">
            {/* Abstract Shapes for modern feel */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 right-0 w-72 h-72 bg-white opacity-10 rounded-full translate-x-20 translate-y-20"></div>
            
            <div className="relative container mx-auto px-4 py-32 text-center">
                <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 fade-in-up">Your Health, Our Priority</h1>
                <p className="text-lg md:text-xl text-indigo-100 mb-8 fade-in-up" style={{ animationDelay: '200ms' }}>
                    Find trusted doctors, book appointments, and manage your health all in one place.
                </p>
                <form 
                    onSubmit={handleSearch} 
                    className="max-w-2xl mx-auto bg-white rounded-lg flex items-center shadow-2xl p-2 fade-in-up"
                    style={{ animationDelay: '400ms' }}
                >
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="p-3 w-1/3 text-gray-700 focus:outline-none rounded-l-lg"
                        placeholder="Location (e.g., Mumbai)"
                    />
                    <div className="border-l border-gray-300 h-10"></div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="p-3 w-2/3 text-gray-700 focus:outline-none"
                        placeholder="Search doctors, clinics, hospitals, etc."
                    />
                    <button type="submit" className="bg-indigo-600 text-white font-semibold py-3 px-6 rounded-r-lg hover:bg-indigo-700 transition-colors">
                        Search
                    </button>
                </form>
            </div>
        </section>
    );
};

// --- Sub-Component: How It Works ---
const HowItWorksSection = () => (
    <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-12 fade-in-up">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-12">
                <div className="fade-in-up" style={{ animationDelay: '200ms' }}>
                    <div className="bg-indigo-500 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl font-bold">1</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Find a Doctor</h3>
                    <p className="text-gray-600">Search by specialist, city, or insurance. Read profiles and patient reviews.</p>
                </div>
                <div className="fade-in-up" style={{ animationDelay: '400ms' }}>
                    <div className="bg-indigo-500 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl font-bold">2</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Book an Appointment</h3>
                    <p className="text-gray-600">Select a time, pay the consultation fee, and get instant confirmation.</p>
                </div>
                <div className="fade-in-up" style={{ animationDelay: '600ms' }}>
                    <div className="bg-indigo-500 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl font-bold">3</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Start Your Consult</h3>
                    <p className="text-gray-600">Join your video call from your dashboard or visit the doctor's clinic.</p>
                </div>
            </div>
        </div>
    </section>
);

// --- Sub-Component: Services Section ---
const ServiceCard = ({ title, description, link, icon }) => (
    <Link to={link} className="block bg-white p-6 rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
        <div className="text-indigo-600 mb-4">{icon}</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
    </Link>
);

const ServicesSection = () => (
    <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12 fade-in-up">All Your Health Needs in One Place</h2>
            <div className="grid md:grid-cols-3 gap-8">
                <div className="fade-in-up" style={{ animationDelay: '200ms' }}>
                    <ServiceCard 
                        title="Find a Doctor"
                        description="Easily search for doctors by specialty, location, or insurance. Read real patient reviews and book appointments."
                        link="/find-doctor"
                        icon={<FindDoctorIcon />}
                    />
                </div>
                <div className="fade-in-up" style={{ animationDelay: '400ms' }}>
                    <ServiceCard 
                        title="Order Medicines"
                        description="Get genuine medicines delivered to your doorstep. Browse our wide selection and checkout securely."
                        link="/medicines"
                        icon={<MedicineIcon />}
                    />
                </div>
                <div className="fade-in-up" style={{ animationDelay: '600ms' }}>
                    <ServiceCard 
                        title="AI Symptom Checker"
                        description="Not sure where to start? Use our AI tool to check your symptoms and find the right specialist."
                        link="/symptom-checker"
                        icon={<SymptomIcon />}
                    />
                </div>
            </div>
        </div>
    </section>
);


// --- The Main HomePage Component ---
const HomePage = () => {
    return (
        <div className="flex flex-col min-h-screen">
            
            {/* This simple navbar will show for logged-out users */}
            <PublicNavbar />
            
            <main className="flex-grow">
                <HeroSection />
                <ServicesSection />
                <HowItWorksSection />
            </main>
            
            <Footer />
            
            {/* This will render the floating chatbot bubble on the homepage */}
            <Chatbot />
        </div>
    );
};

export default HomePage;