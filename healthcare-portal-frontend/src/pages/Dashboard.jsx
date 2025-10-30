import React, { useState, useEffect, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';
import { Link } from 'react-router-dom';
import io from 'socket.io-client';
import appointmentService from '../services/appointmentService';
import reviewService from '../services/reviewService';
import prescriptionService from '../services/prescriptionService';
import Modal from '../components/common/Modal';

// --- Star Rating Component ---
const StarRatingInput = ({ rating, setRating }) => (
    <div className="flex">
        {[...Array(5)].map((_, index) => {
            const starValue = index + 1;
            return (
                <svg
                    key={starValue}
                    className={`w-8 h-8 cursor-pointer ${starValue <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor" viewBox="0 0 20 20" onClick={() => setRating(starValue)}
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            );
        })}
    </div>
);

// --- Main Dashboard Component ---
const Dashboard = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const socket = useRef();

    // Review Modal States
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [reviewError, setReviewError] = useState('');

    // Prescription Modal States
    const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
    const [patientPrescriptions, setPatientPrescriptions] = useState([]);
    const [loadingPrescriptions, setLoadingPrescriptions] = useState(false);
    const [prescriptionError, setPrescriptionError] = useState('');
    const [selectedPatientName, setSelectedPatientName] = useState('');

    const fetchAppointments = async () => {
        try {
            const response = await appointmentService.getMyAppointments();
            setAppointments(response.data);
        } catch (error) { console.error("Failed to fetch appointments:", error); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        socket.current = io('http://localhost:5001');
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setUser(decodedToken.user);
                socket.current.emit('addUser', decodedToken.user.id);
            } catch (error) { console.error("Invalid token:", error); localStorage.removeItem('token'); }
        }
        fetchAppointments();
        socket.current.on('appointmentStatusChanged', () => fetchAppointments());
        return () => { socket.current.disconnect(); };
    }, []);

    // --- Action Handlers ---
    const handleCancel = async (appointmentId) => {
        if (window.confirm('Are you sure?')) {
            try { await appointmentService.cancelAppointment(appointmentId); fetchAppointments(); }
            catch (error) { alert('Could not cancel appointment.'); }
        }
    };
    const handleComplete = async (appointmentId) => {
        try { await appointmentService.completeAppointment(appointmentId); fetchAppointments(); }
        catch (error) { alert('Could not mark as complete.'); }
    };
    const handleHide = async (appointmentId) => {
        try { await appointmentService.hideAppointment(appointmentId); fetchAppointments(); }
        catch (error) { alert('Could not hide appointment.'); }
    };
    const handleOpenReviewModal = (appointment) => { setSelectedAppointment(appointment); setIsReviewModalOpen(true); setRating(0); setComment(''); setReviewError(''); };
    const handleCloseReviewModal = () => { setIsReviewModalOpen(false); setSelectedAppointment(null); };
    const handleSubmitReview = async () => {
        if (rating === 0 || !comment) { setReviewError('Please provide rating and comment.'); return; }
        try {
            await reviewService.createReview(selectedAppointment.doctor._id, selectedAppointment._id, { rating, comment });
            handleCloseReviewModal();
            fetchAppointments();
        } catch (error) { setReviewError(error.response?.data?.msg || 'Failed to submit review.'); }
    };
    const handleOpenPrescriptionModal = async (patientId, patientName) => {
        setIsPrescriptionModalOpen(true);
        setLoadingPrescriptions(true);
        setPrescriptionError('');
        setSelectedPatientName(patientName);
        try {
            const res = await prescriptionService.getPrescriptionsForPatient(patientId);
            setPatientPrescriptions(res.data);
        } catch (err) {
            console.error("Failed to fetch prescriptions:", err);
            setPrescriptionError(err.response?.data?.msg || "Could not fetch prescriptions.");
        } finally {
            setLoadingPrescriptions(false);
        }
    };
    const handleClosePrescriptionModal = () => { setIsPrescriptionModalOpen(false); setPatientPrescriptions([]); setPrescriptionError(''); setSelectedPatientName(''); };

    const getGreeting = () => {
        const hours = new Date().getHours();
        if (hours < 12) return 'Good Morning';
        if (hours < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <>
            <div className="container mx-auto p-4 sm:p-8 fade-in">
                <div className="max-w-7xl mx-auto py-6">
                    <h1 className="text-4xl font-bold text-gray-800">{getGreeting()}!</h1>
                    <p className="mt-2 text-lg text-gray-600">Here's a summary of your appointments.</p>
                    
                    <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-700">My Appointments</h2>
                        {loading ? <p>Loading...</p> : appointments.length === 0 ? <p className="text-gray-500">You have no appointments scheduled.</p> : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{user?.role === 'patient' ? 'Doctor' : 'Patient'}</th>
                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {appointments.map(app => (
                                            <tr key={app._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="py-4 px-6 font-medium whitespace-nowrap">{user?.role === 'patient' ? app.doctor.name : app.patient.name}</td>
                                                <td className="py-4 px-6 whitespace-nowrap">{new Date(app.appointmentDate).toLocaleDateString()}</td>
                                                <td className="py-4 px-6 whitespace-nowrap">{app.timeSlot}</td>
                                                <td className="py-4 px-6 whitespace-nowrap">
                                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        app.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                                                        app.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                        {app.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 whitespace-nowrap">
                                                    <div className="flex flex-wrap gap-2 items-center">
                                                        {app.status === 'Scheduled' && app.videoCallId && (
                                                            <Link to={`/video-call/${app._id}?roomId=${app.videoCallId}`} className="px-3 py-1 text-xs font-semibold text-white bg-purple-600 rounded-md hover:bg-purple-700 transition">Join Call</Link>
                                                        )}
                                                        {app.status === 'Scheduled' && user?.role === 'patient' && (
                                                            <>
                                                                <button onClick={() => handleCancel(app._id)} className="px-3 py-1 text-xs font-semibold text-white bg-red-500 rounded-md hover:bg-red-600 transition">Cancel</button>
                                                                <Link to={`/reschedule-appointment/${app._id}?doctor=${app.doctor._id}`} className="px-3 py-1 text-xs font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600 transition">Reschedule</Link>
                                                            </>
                                                        )}
                                                        {app.status === 'Scheduled' && user?.role === 'doctor' && (
                                                            <button onClick={() => handleComplete(app._id)} className="px-3 py-1 text-xs font-semibold text-white bg-green-500 rounded-md hover:bg-green-600 transition">Mark as Completed</button>
                                                        )}
                                                        {user?.role === 'doctor' && (
                                                            <button onClick={() => handleOpenPrescriptionModal(app.patient._id, app.patient.name)} className="px-3 py-1 text-xs font-semibold text-white bg-gray-500 rounded-md hover:bg-gray-600 transition">View Prescriptions</button>
                                                        )}
                                                        {app.status === 'Completed' && !app.isReviewed && user?.role === 'patient' && (
                                                            <button onClick={() => handleOpenReviewModal(app)} className="px-3 py-1 text-xs font-semibold text-white bg-purple-500 rounded-md hover:bg-purple-600 transition">Leave a Review</button>
                                                        )}
                                                        {(app.status === 'Completed' || app.status === 'Cancelled') && user?.role === 'patient' && (
                                                            <button onClick={() => handleHide(app._id)} className="text-xs text-gray-500 hover:underline ml-2">Hide</button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Review Modal */}
            <Modal isOpen={isReviewModalOpen} onClose={handleCloseReviewModal} title={`Review for Dr. ${selectedAppointment?.doctor.name}`}>
                <div className="space-y-4">
                    <div><label className="block text-sm font-medium text-gray-700">Your Rating</label><StarRatingInput rating={rating} setRating={setRating} /></div>
                    <div><label className="block text-sm font-medium text-gray-700">Your Comment</label><textarea value={comment} onChange={(e) => setComment(e.target.value)} rows="4" className="mt-1 block w-full p-2 border border-gray-300 rounded-md" placeholder="Share your experience..."></textarea></div>
                    {reviewError && <p className="text-red-500 text-sm">{reviewError}</p>}
                    <div className="flex justify-end"><button onClick={handleSubmitReview} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Submit Review</button></div>
                </div>
            </Modal>

            {/* Prescription Modal */}
            <Modal isOpen={isPrescriptionModalOpen} onClose={handleClosePrescriptionModal} title={`Prescriptions for ${selectedPatientName}`}>
                {loadingPrescriptions ? <p>Loading prescriptions...</p> : prescriptionError ? <p className="text-red-500">{prescriptionError}</p> : patientPrescriptions.length === 0 ? <p>This patient has not uploaded any prescriptions.</p> : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-96 overflow-y-auto p-2">
                        {patientPrescriptions.map(presc => (
                            <a key={presc._id} href={presc.imageUrl} target="_blank" rel="noopener noreferrer" className="block border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                                <img src={presc.imageUrl} alt={`Prescription from ${new Date(presc.createdAt).toLocaleDateString()}`} className="w-full h-40 object-contain bg-gray-100"/>
                                <p className="text-xs text-center text-gray-500 p-1">Uploaded: {new Date(presc.createdAt).toLocaleDateString()}</p>
                            </a>
                        ))}
                    </div>
                )}
            </Modal>
        </>
    );
};

export default Dashboard;