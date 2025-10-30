import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import appointmentService from '../services/appointmentService';

const ReschedulePage = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Get doctorId from URL query parameter
    const queryParams = new URLSearchParams(location.search);
    const doctorId = queryParams.get('doctor');

    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [slots, setSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (date && doctorId) {
            setLoading(true);
            setError('');
            setSlots([]);
            setSelectedSlot(null);
            appointmentService.getAvailableSlots(doctorId, date)
                .then(response => setSlots(response.data))
                .catch(err => {
                    console.error("Failed to fetch slots:", err);
                    setError('No slots available for this day.');
                })
                .finally(() => setLoading(false));
        }
    }, [date, doctorId]);

    const handleReschedule = async () => {
        if (!selectedSlot) {
            setError('Please select a new time slot.');
            return;
        }
        try {
            await appointmentService.rescheduleAppointment(appointmentId, {
                appointmentDate: date,
                timeSlot: selectedSlot,
            });
            setSuccess('Appointment rescheduled successfully! Redirecting to dashboard...');
            setTimeout(() => navigate('/dashboard'), 3000);
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to reschedule. The slot may have been taken.');
            console.error("Reschedule failed:", err);
        }
    };

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-4">Reschedule Appointment</h1>
            <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
                <div className="mb-6">
                    <label htmlFor="date-picker" className="block text-lg font-medium text-gray-700 mb-2">Select a New Date:</label>
                    <input type="date" id="date-picker" value={date} min={new Date().toISOString().split('T')[0]} onChange={(e) => setDate(e.target.value)} className="p-2 border rounded-md w-full" />
                </div>
                
                {error && <p className="text-red-500 text-center my-4">{error}</p>}
                {success && <p className="text-green-500 text-center my-4">{success}</p>}

                {!success && (
                    <>
                        <h2 className="text-xl font-semibold mb-4">Available Slots for the New Date</h2>
                        {loading ? <p>Loading slots...</p> : (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                                {slots.length > 0 ? slots.map(slot => (
                                    <button key={slot} onClick={() => setSelectedSlot(slot)} className={`p-2 rounded-md text-center border ${selectedSlot === slot ? 'bg-indigo-600 text-white' : 'bg-gray-100 hover:bg-indigo-100'}`}>
                                        {slot}
                                    </button>
                                )) : <p>No slots available for the selected date.</p>}
                            </div>
                        )}
                        <div className="mt-8 border-t pt-6">
                            <button onClick={handleReschedule} disabled={!selectedSlot} className="w-full bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 disabled:bg-gray-400 font-bold text-lg">
                                Confirm Reschedule for {selectedSlot}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ReschedulePage;