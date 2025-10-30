import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import doctorService from '../services/doctorService';
import defaultAvatar from '../assets/default-avatar.png';

// ============================================================
// Reusable Stars Component
// ============================================================
const Stars = ({ rating }) => {
    const totalStars = 5;
    let stars = [];

    for (let i = 1; i <= totalStars; i++) {
        stars.push(
            <svg
                key={i}
                className={`w-4 h-4 ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
            >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
        );
    }

    return <div className="flex items-center">{stars}</div>;
};

// ============================================================
// Main Doctor Details Page
// ============================================================
const DoctorDetailsPage = () => {
    const { id } = useParams();
    const [doctor, setDoctor] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDoctorDetails = async () => {
            try {
                const response = await doctorService.getDoctorById(id);
                setDoctor(response.data.profile);
                setReviews(response.data.reviews);
            } catch (err) {
                setError('Doctor not found.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDoctorDetails();
    }, [id]);

    if (loading) return <p className="text-center p-10 text-gray-500">Loading doctor's details...</p>;
    if (error) return <p className="text-center p-10 text-red-500">{error}</p>;
    if (!doctor) return null;

    const imageUrl =
        doctor.user?.profilePicture && doctor.user.profilePicture.startsWith('http')
            ? doctor.user.profilePicture
            : defaultAvatar;

    return (
        <div className="container mx-auto p-4 sm:p-8">

            {/* 🔙 BACK LINK */}
            <div className="max-w-4xl mx-auto mb-4">
                <Link
                    to="/find-doctor"
                    className="text-indigo-600 hover:text-indigo-800 font-semibold"
                >
                    &larr; Back to Search Results
                </Link>
            </div>

            {/* 🔹 DOCTOR CARD SECTION */}
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
                    <img
                        src={imageUrl}
                        alt={doctor.user?.name}
                        className="w-40 h-40 rounded-full object-cover border-4 border-indigo-100"
                    />
                    <div className="text-center sm:text-left">
                        <h1 className="text-4xl font-bold text-gray-800">
                            Dr. {doctor.user?.name}
                        </h1>
                        <p className="text-xl text-indigo-600 font-semibold mt-2">
                            {doctor.specialization}
                        </p>

                        {doctor.numberOfReviews > 0 && (
                            <div className="flex items-center justify-center sm:justify-start mt-2">
                                <Stars rating={doctor.averageRating} />
                                <span className="text-sm text-gray-500 ml-2">
                                    ({doctor.numberOfReviews} reviews)
                                </span>
                            </div>
                        )}

                        <p className="mt-4 text-gray-600">
                            <strong>Experience:</strong> {doctor.experienceInYears} years
                        </p>
                        <p className="text-gray-600">
                            <strong>Fee:</strong> ₹{doctor.consultationFee}
                        </p>

                        <Link
                            to={`/book-appointment/${doctor.user?._id}`}
                            className="mt-6 inline-block bg-green-500 text-white py-3 px-8 rounded-lg font-bold hover:bg-green-600 transition"
                        >
                            Book Appointment
                        </Link>
                    </div>
                </div>

                {/* 🔹 DETAILS SECTIONS */}
                <div className="mt-12 border-t pt-8 space-y-8">
                    {/* QUALIFICATIONS */}
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">Qualifications</h2>
                        {doctor.qualifications?.length > 0 ? (
                            <ul className="list-disc list-inside space-y-2 text-gray-700">
                                {doctor.qualifications.map((qual, i) => (
                                    <li key={i}>
                                        <strong>{qual.degree}</strong> from {qual.university} ({qual.year})
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500">No qualification details available.</p>
                        )}
                    </div>

                    {/* AVAILABILITY */}
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">Weekly Availability</h2>
                        {doctor.availability?.length > 0 ? (
                            doctor.availability.map((day, index) => (
                                <p key={index}>
                                    <strong className="w-24 inline-block">{day.day}:</strong>{' '}
                                    {day.timeSlots.map((s) => `${s.startTime}-${s.endTime}`).join(', ')}
                                </p>
                            ))
                        ) : (
                            <p className="text-gray-500">Availability details not provided.</p>
                        )}
                    </div>

                    {/* REVIEWS */}
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">Patient Reviews</h2>
                        <div className="space-y-6">
                            {reviews.length > 0 ? (
                                reviews.map((review) => (
                                    <div key={review._id} className="border-b pb-4">
                                        <div className="flex items-center">
                                            <p className="font-semibold">{review.patient.name}</p>
                                            <div className="ml-4">
                                                <Stars rating={review.rating} />
                                            </div>
                                        </div>
                                        <p className="mt-2 text-gray-600">{review.comment}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">No reviews yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorDetailsPage;
