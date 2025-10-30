import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Footer from './Footer'; // <-- 1. Import the Footer

const MainLayout = () => {
    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar (Fixed on the left) */}
            <Sidebar />

            {/* Main Content Area (Scrollable on the right) */}
            <main className="flex-1 flex flex-col overflow-y-auto">
                {/* Page Content */}
                <div className="flex-grow">
                    <Outlet /> {/* This is where your pages will be rendered */}
                </div>
                
                {/* Footer (at the bottom of the scrollable content) */}
                <Footer />
            </main>
        </div>
    );
};

export default MainLayout;