import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import appointmentService from '../services/appointmentService';
import paymentService from '../services/paymentService'; // <-- Import payment service
import Modal from '../components/common/Modal';

const BookingPage = () => {
    const { doctorId } = useParams();
    const navigate = useNavigate();
    const socket = useRef(null);

    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [slots, setSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [loading, setLoading] = useState(false); // This is for the main "Proceed to Pay" button
    const [loadingSlots, setLoadingSlots] = useState(false); // This is for the slot list
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(''); // We won't use this, as success is handled by Stripe

    // --- SOCKET.IO REAL-TIME CONNECTION ---
    useEffect(() => {
        socket.current = io('http://localhost:5001');
        socket.current.emit('joinBookingRoom', doctorId);
        socket.current.on('slotBooked', ({ timeSlot }) => {
            console.log(`Slot ${timeSlot} just booked by another user.`);
            setSlots(prevSlots => prevSlots.filter(slot => slot !== timeSlot));
        });

        return () => {
            if (socket.current) {
                socket.current.emit('leaveBookingRoom', doctorId);
                socket.current.disconnect();
            }
        };
    }, [doctorId]);

    // --- FETCH AVAILABLE SLOTS ---
    useEffect(() => {
        if (date) {
            setLoadingSlots(true);
            setError('');
            setSlots([]);
            setSelectedSlot(null);
            appointmentService.getAvailableSlots(doctorId, date)
                .then(response => setSlots(response.data))
                .catch(() => setError('No slots available for this day or failed to fetch.'))
                .finally(() => setLoadingSlots(false));
        }
    }, [date, doctorId]);

    // --- UPDATED: HANDLE PAYMENT ---
    const handleBooking = async () => {
        if (!selectedSlot) {
            setError('Please select a time slot.');
            return;
        }
        setLoading(true); // Start main loading spinner
        try {
            // 1. Create a checkout session
            const response = await paymentService.createAppointmentCheckoutSession({
                doctorId,
                appointmentDate: date,
                timeSlot: selectedSlot,
            });
            
            // 2. Redirect to Stripe's payment page
            window.location.href = response.data.url;

        } catch (err) {
            const message = err.response?.data?.msg || 'Failed to start payment. Please try again.';
            setError(message);
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-4 text-center">Book Appointment</h1>

            <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
                {/* --- DATE PICKER --- */}
                <div className="mb-6">
                    <label htmlFor="date-picker" className="block text-lg font-medium text-gray-700 mb-2">
                        Select a Date:
                    </label>
                    <input
                        type="date"
                        id="date-picker"
                        value={date}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setDate(e.target.value)}
                        className="p-2 border rounded-md w-full"
                    />
                </div>

                {/* --- SLOT DISPLAY --- */}
                <>
                    <h2 className="text-xl font-semibold mb-4 text-center">Available Slots</h2>
                    {loadingSlots ? (
                        <p className="text-center">Loading slots...</p>
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                            {slots.length > 0 ? (
                                slots.map(slot => (
                                    <button
                                        key={slot}
                                        onClick={() => setSelectedSlot(slot)}
                                        className={`p-2 rounded-md text-center border transition ${
                                            selectedSlot === slot
                                                ? 'bg-indigo-600 text-white border-indigo-600'
                                                : 'bg-gray-100 hover:bg-indigo-100'
                                        }`}
                                    >
                                        {slot}
                                    </button>
                                ))
                            ) : (
                                <p className="text-center col-span-3 text-gray-600">
                                    No slots available for the selected date.
                                </p>
                            )}
                        </div>
                    )}

                    {/* --- CONFIRM BUTTON --- */}
                    <div className="mt-8 border-t pt-6">
                        <button
                            onClick={handleBooking}
                            disabled={!selectedSlot || loading}
                            className="w-full bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 disabled:bg-gray-400 font-bold text-lg transition"
                        >
                            {loading ? 'Processing...' : (selectedSlot ? `Proceed to Pay for ${selectedSlot}` : 'Select a Time Slot')}
                        </button>
                    </div>
                </>
            </div>

            {/* --- ERROR MODAL --- */}
            <Modal isOpen={!!error} onClose={() => setError('')} title="Booking Error">
                <p>{error}</p>
            </Modal>
        </div>
    );
};

export default BookingPage;