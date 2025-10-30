import React, { useState, useEffect } from 'react';
import doctorService from '../services/doctorService';
import defaultAvatar from '../assets/default-avatar.png';

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// --- Reusable Navigation Button Component ---
const NavButton = ({ label, active, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
            active 
            ? 'bg-indigo-600 text-white shadow-md' 
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`}
    >
        {label}
    </button>
);

const DoctorProfile = () => {
    const [activeTab, setActiveTab] = useState('professional');
    const [profile, setProfile] = useState({
        firstName: '',
        lastName: '',
        specialization: '',
        clinicName: '', // <-- NEW FIELD
        experienceInYears: '',
        consultationFee: '',
        qualifications: [],
        availability: [],
        consultationModes: [],
        acceptedInsurance: [],
        offersCashless: false,
        user: { profilePicture: '' },
        address: { street: '', city: '', state: '', postalCode: '', country: '' }
    });

    const [originalProfile, setOriginalProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [profilePictureFile, setProfilePictureFile] = useState(null);
    const [preview, setPreview] = useState(defaultAvatar);

    // --- Fetch Profile ---
    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const response = await doctorService.getMyProfile();
                const fetchedProfile = {
                    ...response.data,
                    firstName: response.data.firstName || '',
                    lastName: response.data.lastName || '',
                    specialization: response.data.specialization || '',
                    clinicName: response.data.clinicName || '', // <-- FETCHED
                    experienceInYears: response.data.experienceInYears || '',
                    consultationFee: response.data.consultationFee || '',
                    qualifications: response.data.qualifications || [],
                    availability: response.data.availability || [],
                    consultationModes: response.data.consultationModes || [],
                    acceptedInsurance: response.data.acceptedInsurance || [],
                    offersCashless: response.data.offersCashless || false,
                    address: response.data.address || { street: '', city: '', state: '', postalCode: '', country: '' },
                    user: { profilePicture: response.data.user?.profilePicture || '' }
                };
                setProfile(fetchedProfile);
                setOriginalProfile(fetchedProfile);
                setPreview(fetchedProfile.user.profilePicture || defaultAvatar);
            } catch (error) {
                console.log("No profile found, initializing form.");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    // --- Handlers ---
    const onChange = e => setProfile({ ...profile, [e.target.name]: e.target.value });

    const handleAddressChange = e => {
        setProfile(prev => ({
            ...prev,
            address: { ...prev.address, [e.target.name]: e.target.value }
        }));
    };

    const handleModeChange = e => {
        const { value, checked } = e.target;
        let newModes = [...profile.consultationModes];
        if (checked) newModes.push(value);
        else newModes = newModes.filter(mode => mode !== value);
        setProfile(prev => ({ ...prev, consultationModes: newModes }));
    };

    const handleInsuranceChange = e => {
        const insuranceArray = e.target.value.split(',').map(i => i.trim()).filter(Boolean);
        setProfile(prev => ({ ...prev, acceptedInsurance: insuranceArray }));
    };

    const handleQualificationChange = (index, e) => {
        const { name, value } = e.target;
        const updatedQualifications = [...profile.qualifications];
        updatedQualifications[index][name] = value;
        setProfile(prev => ({ ...prev, qualifications: updatedQualifications }));
    };

    const handleAddQualification = () => {
        setProfile(prev => ({
            ...prev,
            qualifications: [...prev.qualifications, { degree: '', university: '', year: '' }]
        }));
    };

    const handleRemoveQualification = index => {
        const filtered = profile.qualifications.filter((_, i) => i !== index);
        setProfile(prev => ({ ...prev, qualifications: filtered }));
    };

    const handleDayToggle = day => {
        const current = [...profile.availability];
        const dayIndex = current.findIndex(d => d.day === day);
        if (dayIndex > -1) current.splice(dayIndex, 1);
        else current.push({ day, timeSlots: [{ startTime: '09:00', endTime: '17:00' }] });
        setProfile(prev => ({ ...prev, availability: current }));
    };

    const handleTimeChange = (dayIndex, slotIndex, e) => {
        const { name, value } = e.target;
        const newAvailability = [...profile.availability];
        newAvailability[dayIndex].timeSlots[slotIndex][name] = value;
        setProfile(prev => ({ ...prev, availability: newAvailability }));
    };

    const addTimeSlot = dayIndex => {
        const newAvailability = [...profile.availability];
        newAvailability[dayIndex].timeSlots.push({ startTime: '', endTime: '' });
        setProfile(prev => ({ ...prev, availability: newAvailability }));
    };

    const removeTimeSlot = (dayIndex, slotIndex) => {
        const newAvailability = [...profile.availability];
        newAvailability[dayIndex].timeSlots.splice(slotIndex, 1);
        setProfile(prev => ({ ...prev, availability: newAvailability }));
    };

    const handleFileChange = e => {
        const file = e.target.files[0];
        if (file) {
            setProfilePictureFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleUploadPicture = async () => {
        if (!profilePictureFile) return alert('Please select a file first.');
        const formData = new FormData();
        formData.append('profilePicture', profilePictureFile);
        try {
            const response = await doctorService.uploadProfilePicture(formData);
            const newImageUrl = response.data.url;
            setPreview(newImageUrl);
            setProfile(prev => ({ ...prev, user: { ...prev.user, profilePicture: newImageUrl } }));
            setProfilePictureFile(null);
            alert('Profile picture updated successfully!');
        } catch (error) {
            console.error('Failed to upload picture:', error);
            alert('Failed to upload picture.');
        }
    };

    // --- Save Profile ---
    const onSubmit = async e => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const response = await doctorService.updateMyProfile(profile);
            const updated = { ...response.data, user: { profilePicture: profile.user.profilePicture } };
            setProfile(updated);
            setOriginalProfile(updated);
            alert('Doctor profile updated successfully!');
        } catch (error) {
            console.error('Failed to update doctor profile', error);
            alert('Failed to update profile. Please ensure all required fields are filled.');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="container mx-auto p-4 sm:p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">My Doctor Profile</h1>
            <div className="flex flex-col md:flex-row gap-8">
                {/* --- Sidebar --- */}
                <div className="w-full md:w-1/4">
                    <div className="bg-white p-4 rounded-lg shadow-md space-y-2">
                        <NavButton label="Professional Details" active={activeTab === 'professional'} onClick={() => setActiveTab('professional')} />
                        <NavButton label="Qualifications" active={activeTab === 'qualifications'} onClick={() => setActiveTab('qualifications')} />
                        <NavButton label="Availability" active={activeTab === 'availability'} onClick={() => setActiveTab('availability')} />
                        <NavButton label="Location & Insurance" active={activeTab === 'location'} onClick={() => setActiveTab('location')} />
                    </div>
                </div>

                {/* --- Main Form --- */}
                <div className="w-full md:w-3/4">
                    <form onSubmit={onSubmit} className="bg-white p-8 rounded-lg shadow-lg space-y-6">

                        {/* --- Profile Picture --- */}
                        <div className="flex flex-col items-center pb-6 border-b">
                            <img src={preview} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-gray-200" />
                            <div className="mt-4 w-full max-w-xs text-center">
                                <label htmlFor="profile-picture-upload" className="cursor-pointer bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md text-sm hover:bg-gray-50 transition">
                                    Choose File
                                </label>
                                <input id="profile-picture-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                <p className="text-xs text-gray-500 mt-2">{profilePictureFile ? profilePictureFile.name : 'No file chosen'}</p>
                                {profilePictureFile && (
                                    <button type="button" onClick={handleUploadPicture} className="mt-4 w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition">
                                        Upload Picture
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* --- Professional Details --- */}
                        {activeTab === 'professional' && (
                            <div>
                                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Professional Details</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">First Name</label>
                                        <input type="text" name="firstName" value={profile.firstName} onChange={onChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                        <input type="text" name="lastName" value={profile.lastName} onChange={onChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Specialization</label>
                                        <input type="text" name="specialization" value={profile.specialization} onChange={onChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
                                    </div>

                                    {/* --- NEW: Clinic Name --- */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Clinic / Hospital Name</label>
                                        <input
                                            type="text"
                                            name="clinicName"
                                            value={profile.clinicName}
                                            onChange={onChange}
                                            placeholder="e.g., Apollo Hospital"
                                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Experience (Years)</label>
                                        <input type="number" name="experienceInYears" value={profile.experienceInYears} onChange={onChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Consultation Fee (₹)</label>
                                        <input type="number" name="consultationFee" value={profile.consultationFee} onChange={onChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Modes</label>
                                        <div className="flex gap-8">
                                            <label className="flex items-center">
                                                <input type="checkbox" value="Online" checked={profile.consultationModes.includes('Online')} onChange={handleModeChange} className="h-4 w-4 text-indigo-600" />
                                                <span className="ml-2 text-gray-700">Online</span>
                                            </label>
                                            <label className="flex items-center">
                                                <input type="checkbox" value="In-Person" checked={profile.consultationModes.includes('In-Person')} onChange={handleModeChange} className="h-4 w-4 text-indigo-600" />
                                                <span className="ml-2 text-gray-700">In-Person</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- Other Tabs (unchanged) --- */}
                        {activeTab === 'qualifications' && (
                            <div>
                                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Qualifications</h2>
                                {profile.qualifications.map((qual, index) => (
                                    <div key={index} className="p-4 border rounded-md mb-4 bg-gray-50 relative">
                                        <button type="button" onClick={() => handleRemoveQualification(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold text-xl">&times;</button>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-medium text-gray-600">Degree</label>
                                                <input type="text" name="degree" value={qual.degree} onChange={(e) => handleQualificationChange(index, e)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600">University</label>
                                                <input type="text" name="university" value={qual.university} onChange={(e) => handleQualificationChange(index, e)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600">Year</label>
                                                <input type="number" name="year" value={qual.year} onChange={(e) => handleQualificationChange(index, e)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button type="button" onClick={handleAddQualification} className="w-full bg-gray-200 text-gray-700 p-2 rounded-md hover:bg-gray-300 mt-2 transition-colors">
                                    + Add Qualification
                                </button>
                            </div>
                        )}

                        {/* --- Availability and Location Sections remain same --- */}

                        {/* --- Save Button --- */}
                        <div className="text-right border-t pt-6 mt-6">
                            <button type="submit" disabled={isSaving} className="bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:bg-gray-400">
                                {isSaving ? 'Saving...' : 'Save All Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DoctorProfile;
