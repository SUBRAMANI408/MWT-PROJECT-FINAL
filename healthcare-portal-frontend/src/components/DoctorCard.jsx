import React from 'react';
import { Link } from 'react-router-dom';
import defaultAvatar from '../assets/default-avatar.png';

// --- Reusable Star Component (for ratings) ---
const Stars = ({ rating }) => {
    const totalStars = 5;
    let stars = [];
    for (let i = 1; i <= totalStars; i++) {
        stars.push(
            <svg key={i} className={`w-4 h-4 ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
        );
    }
    return <div className="flex items-center">{stars}</div>;
};

// --- Modern Doctor Card ---
const DoctorCard = ({ doctor, index }) => {
    
    // Determine the correct image (Cloudinary or default)
    const imageUrl = (doctor.user?.profilePicture && doctor.user.profilePicture.startsWith('http'))
        ? doctor.user.profilePicture
        : defaultAvatar;
    
    // Determine the correct name
    const displayName = (doctor.firstName && doctor.lastName) 
        ? `Dr. ${doctor.firstName} ${doctor.lastName}` 
        : `Dr. ${doctor.user.name}`;

    return (
        <div 
            className="fade-in bg-white rounded-lg shadow-lg overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
            style={{ animationDelay: `${index * 50}ms` }} // Staggered fade-in
        >
            <div className="p-6">
                <div className="flex items-center space-x-4">
                    {/* Profile Picture */}
                    <img
                        src={imageUrl}
                        alt={displayName}
                        className="w-20 h-20 rounded-full object-cover border-4 border-gray-100"
                        onError={(e) => { e.target.onerror = null; e.target.src = defaultAvatar; }}
                    />
                    {/* Doctor Info */}
                    <div className="flex-1 text-left">
                        <Link to={`/doctor/${doctor.user._id}`}>
                            <h3 className="text-xl font-bold text-gray-900 hover:text-indigo-600">{displayName}</h3>
                        </Link>
                        <p className="text-md font-semibold text-indigo-600">{doctor.specialization}</p>
                        {/* --- NEW: Clinic Name --- */}
                        {doctor.clinicName && (
                            <p className="text-sm text-gray-500 mt-1">{doctor.clinicName}</p>
                        )}
                    </div>
                </div>

                {/* Star Rating (shows if reviews exist) */}
                {doctor.numberOfReviews > 0 && (
                    <div className="flex items-center mt-4">
                        <Stars rating={doctor.averageRating} />
                        <span className="text-xs text-gray-500 ml-2">({doctor.numberOfReviews} reviews)</span>
                    </div>
                )}
            </div>

            {/* Details Section */}
            <div className="px-6 pb-6 space-y-3">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Experience</span>
                    <span className="font-semibold text-gray-800">{doctor.experienceInYears} years</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Consultation Fee</span>
                    <span className="font-semibold text-gray-800">₹{doctor.consultationFee}</span>
                </div>
            </div>
            
            {/* Book Button */}
            <div className="mt-auto">
                <Link 
                    to={`/book-appointment/${doctor.user._id}`} 
                    className="block w-full text-center bg-indigo-600 text-white py-3 px-4 font-semibold hover:bg-indigo-700 transition-colors"
                >
                    Book Appointment
                </Link>
            </div>
        </div>
    );
};

export default DoctorCard;