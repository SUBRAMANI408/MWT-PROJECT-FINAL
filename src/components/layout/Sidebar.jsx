import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useCart } from '../../context/CartContext';

// --- Icon Components (for a clean look) ---
const DashboardIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18M3 6h18M3 18h18"></path></svg>;
const SymptomIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>;
const NutritionIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.4 18.6L19.4 18.6c-2.3 2.3-6.1 2.3-8.5 0l-5.6-5.6c-2.3-2.3-2.3-6.1 0-8.5l.6-.6c2.3-2.3 6.1-2.3 8.5 0l5.6 5.6c2.3 2.3 2.3 6.1 0 8.5l-.6.6zM12 12c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"></path></svg>;
const PrescriptionIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>;
const FindDoctorIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zM.7 13.025A11.025 11.025 0 0112 2.001a11.025 11.025 0 0111.3 11.024M12 21.999A11.025 11.025 0 01.7 13.025"></path></svg>;
const MedicineIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4-8-4V7l8-4 8 4zM4 7v10l8 4 8-4V7"></path></svg>;
const SurgeryIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.25 7.756a4.5 4.5 0 010 8.488M12 18.75l-2.625-2.625M12 5.25l-2.625 2.625M12 18.75l2.625-2.625m-5.25 0l2.625 2.625"></path></svg>;
const ProfileIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>;
const CartIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>;
const LogoutIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>;
const ClaimsIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>;
const OrdersIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>;


// --- Reusable NavLink Component ---
const NavItem = ({ to, icon, label }) => (
    <NavLink
        to={to}
        // This 'className' function automatically styles the active link
        className={({ isActive }) =>
            `flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                isActive
                    ? 'bg-indigo-600 text-white shadow-lg' // Active link style
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900' // Inactive link style
            }`
        }
    >
        {icon}
        <span className="font-medium text-sm">{label}</span>
    </NavLink>
);

// --- The Main Sidebar Component ---
const Sidebar = () => {
    const { cartItems } = useCart();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    
    let userRole = null;
    let userName = "User";
    if (token) {
        try {
            const decodedToken = jwtDecode(token);
            userRole = decodedToken.user.role;
            userName = decodedToken.user.name || "User";
        } catch (error) {
            console.error("Invalid token:", error);
            localStorage.removeItem('token');
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const profileLink = userRole === 'doctor' ? '/doctor/profile' : '/profile';

    return (
        <div className="w-64 h-screen bg-white shadow-xl flex flex-col">
            {/* Logo */}
            <div className="flex items-center justify-center h-20 border-b">
                <Link to="/dashboard" className="text-3xl font-bold text-indigo-600">
                    SmartHealth
                </Link>
            </div>

            {/* Navigation Links */}
            <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
                <NavItem to="/dashboard" icon={<DashboardIcon />} label="Dashboard" />
                <NavItem to="/find-doctor" icon={<FindDoctorIcon />} label="Find a Doctor" />
                <NavItem to="/medicines" icon={<MedicineIcon />} label="Medicines" />
                <NavItem to="/surgeries" icon={<SurgeryIcon />} label="Surgeries" />
                
                {/* Patient-Only Links */}
                {userRole === 'patient' && (
                    <>
                        <div className="pt-2">
                            <span className="px-3 text-xs font-semibold uppercase text-gray-400">Tools</span>
                        </div>
                        <NavItem to="/symptom-checker" icon={<SymptomIcon />} label="Symptom Checker" />
                        <NavItem to="/nutrition-scanner" icon={<NutritionIcon />} label="Nutrition Scanner" />
                        
                        <div className="pt-2">
                             <span className="px-3 text-xs font-semibold uppercase text-gray-400">My Records</span>
                        </div>
                        <NavItem to="/my-prescriptions" icon={<PrescriptionIcon />} label="My Prescriptions" />
                        <NavItem to="/my-claims" icon={<ClaimsIcon />} label="My Claims" />
                        <NavItem to="/my-orders" icon={<OrdersIcon />} label="My Orders" />
                    </>
                )}
            </nav>

            {/* Profile & Logout Section */}
            <div className="p-4 border-t mt-auto">
                <NavLink
                    to={profileLink}
                    className={({ isActive }) =>
                        `flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                            isActive
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'text-gray-600 hover:bg-gray-100'
                        }`
                    }
                >
                    <ProfileIcon />
                    <div>
                        <p className="font-medium text-sm">{userName}</p>
                        <p className="text-xs text-gray-500">View Profile</p>
                    </div>
                </NavLink>
                
                <NavLink
                    to="/cart"
                    className={({ isActive }) =>
                        `flex items-center justify-between p-3 rounded-lg transition-all duration-200 mt-2 ${
                            isActive
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'text-gray-600 hover:bg-gray-100'
                        }`
                    }
                >
                    <div className="flex items-center space-x-3">
                        <CartIcon />
                        <span className="font-medium text-sm">Cart</span>
                    </div>
                    {cartItems.length > 0 && (
                        <span className="flex items-center justify-center bg-red-500 text-white text-xs rounded-full w-5 h-5">
                            {cartItems.length}
                        </span>
                    )}
                </NavLink>

                <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 p-3 w-full rounded-lg text-red-500 hover:bg-red-50 transition-all duration-200 mt-2"
                >
                    <LogoutIcon />
                    <span className="font-medium text-sm">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;