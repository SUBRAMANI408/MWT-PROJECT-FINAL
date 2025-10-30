import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import BookingSuccessPage from './pages/BookingSuccessPage';

// Layouts and Pages
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PatientProfile from './pages/PatientProfile';
import DoctorProfile from './pages/DoctorProfile';
import NotFoundPage from './pages/NotFoundPage';
import AuthCallback from './pages/AuthCallback';
import FindDoctorPage from './pages/FindDoctorPage';
import ReschedulePage from './pages/ReschedulePage';
import BookingPage from './pages/BookingPage';
import DoctorDetailsPage from './pages/DoctorDetailsPage';
import SymptomCheckerPage from './pages/SymptomCheckerPage';
import NutritionScannerPage from './pages/NutritionScannerPage'; // ✅ NEW IMPORT
import MyPrescriptionsPage from './pages/MyPrescriptionsPage';
import VideoCallPage from './pages/VideoCallPage';
import MedicinePage from './pages/MedicinePage';
import MedicineDetailsPage from './pages/MedicineDetailsPage';
import CartPage from './pages/CartPage';
import SurgeriesPage from './pages/SurgeriesPage';
import SurgeryDetailsPage from './pages/SurgeryDetailsPage';
import MyClaimsPage from './pages/MyClaimsPage';
import OrderSuccessPage from './pages/OrderSuccessPage'; // ✅ NEW IMPORT
import MyOrdersPage from './pages/MyOrdersPage'; // ✅ NEW IMPORT

// Admin Pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminRegisterPage from './pages/admin/AdminRegisterPage';
import AdminDashboard from './pages/admin/AdminDashboard';

// ======================================================
// Route Guards
// ======================================================
const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/admin" />;
    }

    try {
        const decoded = jwtDecode(token);
        if (decoded.user.role !== 'admin') {
            return <Navigate to="/admin" />;
        }
    } catch (error) {
        console.error('Invalid admin token:', error);
        return <Navigate to="/admin" />;
    }

    return children;
};

// ======================================================
// Main App Component
// ======================================================
function App() {
    return (
        <Router>
            <Routes>
                {/* ---------- Public User Routes ---------- */}
                <Route path="/" element={<HomePage />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/auth/callback" element={<AuthCallback />} />

                {/* ---------- Public Admin Routes ---------- */}
                <Route path="/admin" element={<AdminLoginPage />} />
                <Route path="/admin/register" element={<AdminRegisterPage />} />

                {/* ---------- Private User Routes ---------- */}
                <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/profile" element={<PatientProfile />} />
                    <Route path="/doctor/profile" element={<DoctorProfile />} />
                    <Route path="/find-doctor" element={<FindDoctorPage />} />
                    <Route path="/doctor/:id" element={<DoctorDetailsPage />} />
                    <Route path="/book-appointment/:doctorId" element={<BookingPage />} />
                    <Route path="/booking-success" element={<BookingSuccessPage />} />
                    <Route path="/reschedule-appointment/:appointmentId" element={<ReschedulePage />} />

                    {/* ✅ NEW FEATURE ROUTES FOR PATIENTS */}
                    <Route path="/symptom-checker" element={<SymptomCheckerPage />} />
                    <Route path="/nutrition-scanner" element={<NutritionScannerPage />} />
                    <Route path="/my-prescriptions" element={<MyPrescriptionsPage />} />
                    <Route path="/video-call/:appointmentId" element={<VideoCallPage />} />
                    <Route path="/medicines" element={<MedicinePage />} />
                    <Route path="/medicine/:id" element={<MedicineDetailsPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/surgeries" element={<SurgeriesPage />} />
                    <Route path="/surgeries/:id" element={<SurgeryDetailsPage />} />
                    <Route path="/my-claims" element={<MyClaimsPage />} />

                    {/* ✅ NEW ORDER ROUTES */}
                    <Route path="/order-success" element={<OrderSuccessPage />} />
                    <Route path="/my-orders" element={<MyOrdersPage />} />
                </Route>

                {/* ---------- Private Admin Route ---------- */}
                <Route
                    path="/admin/dashboard"
                    element={<AdminRoute><AdminDashboard /></AdminRoute>}
                />

                {/* ---------- Fallback Route ---------- */}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Router>
    );
}

export default App;
