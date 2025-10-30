import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-gray-300 shadow-inner mt-auto">
            <div className="container mx-auto p-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Column 1: Brand */}
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-2">SmartHealth</h3>
                        <p className="text-sm">Your health, our priority. Book appointments and manage your health all in one place.</p>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-3">Quick Links</h4>
                        <ul className="space-y-2">
                            <li><Link to="/dashboard" className="hover:text-white">Dashboard</Link></li>
                            <li><Link to="/find-doctor" className="hover:text-white">Find a Doctor</Link></li>
                            <li><Link to="/medicines" className="hover:text-white">Medicines</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Patient Tools */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-3">For Patients</h4>
                        <ul className="space-y-2">
                            <li><Link to="/symptom-checker" className="hover:text-white">Symptom Checker</Link></li>
                            <li><Link to="/my-prescriptions" className="hover:text-white">My Prescriptions</Link></li>
                            <li><Link to="/my-orders" className="hover:text-white">My Orders</Link></li>
                        </ul>
                    </div>

                    {/* Column 4: Social */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-3">Follow Us</h4>
                        <div className="flex space-x-4">
                            {/* You can add links to your social media here */}
                            <a href="#" className="hover:text-white">Facebook</a>
                            <a href="#" className="hover:text-white">Twitter</a>
                            <a href="#" className="hover:text-white">LinkedIn</a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm">
                    <p>&copy; {new Date().getFullYear()} SmartHealth. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;