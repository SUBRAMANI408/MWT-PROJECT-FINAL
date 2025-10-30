import React, { useState, useEffect } from 'react';
import patientService from '../services/patientService';

// --- Reusable Navigation Button Component ---
const NavButton = ({ label, active, onClick }) => (
    <button
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

// --- The Main Patient Profile Component ---
const PatientProfile = () => {
    const [activeTab, setActiveTab] = useState('personal'); // 'personal', 'insurance', 'medical'
    const [profile, setProfile] = useState({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: 'Male',
        contactNumber: '',
        medicalHistory: [],
        insuranceDetails: { provider: '', policyNumber: '' }
    });
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await patientService.getMyProfile();
                setProfile({
                    firstName: res.data.firstName || '',
                    lastName: res.data.lastName || '',
                    dateOfBirth: res.data.dateOfBirth ? new Date(res.data.dateOfBirth).toISOString().split('T')[0] : '',
                    gender: res.data.gender || 'Male',
                    contactNumber: res.data.contactNumber || '',
                    medicalHistory: res.data.medicalHistory || [],
                    insuranceDetails: res.data.insuranceDetails || { provider: '', policyNumber: '' }
                });
            } catch (err) {
                console.error("No profile found, initializing form.");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const onChange = e => setProfile({ ...profile, [e.target.name]: e.target.value });

    const onInsuranceChange = e => {
        setProfile({
            ...profile,
            insuranceDetails: {
                ...profile.insuranceDetails,
                [e.target.name]: e.target.value
            }
        });
    };

    // --- Medical History Handlers ---
    const onHistoryChange = (index, e) => {
        const updatedHistory = profile.medicalHistory.map((item, i) => 
            index === i ? { ...item, [e.target.name]: e.target.value } : item
        );
        setProfile({ ...profile, medicalHistory: updatedHistory });
    };
    const addHistoryItem = () => {
        setProfile({ ...profile, medicalHistory: [...profile.medicalHistory, { condition: '', diagnosedDate: '', notes: '' }] });
    };
    const removeHistoryItem = (index) => {
        setProfile({ ...profile, medicalHistory: profile.medicalHistory.filter((_, i) => i !== index) });
    };

    // --- Form Submit ---
    const onSubmit = async e => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await patientService.updateMyProfile(profile);
            alert('Profile Updated Successfully!');
        } catch (err) {
            console.error('Failed to update profile:', err);
            alert('Failed to update profile. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return <div className="text-center p-10">Loading profile...</div>;
    }

    return (
        <div className="container mx-auto p-4 sm:p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">My Profile</h1>
            <div className="flex flex-col md:flex-row gap-8">
                
                {/* --- Left Column: Navigation --- */}
                <div className="w-full md:w-1/4">
                    <div className="bg-white p-4 rounded-lg shadow-md space-y-2">
                        <NavButton label="Personal Details" active={activeTab === 'personal'} onClick={() => setActiveTab('personal')} />
                        <NavButton label="Insurance Details" active={activeTab === 'insurance'} onClick={() => setActiveTab('insurance')} />
                        <NavButton label="Medical History" active={activeTab === 'medical'} onClick={() => setActiveTab('medical')} />
                    </div>
                </div>

                {/* --- Right Column: Form Content --- */}
                <div className="w-full md:w-3/4">
                    <form onSubmit={onSubmit} className="bg-white p-8 rounded-lg shadow-lg space-y-6 fade-in">
                        
                        {/* --- Personal Details Section --- */}
                        {activeTab === 'personal' && (
                            <div className="fade-in">
                                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Personal Details</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">First Name</label>
                                        <input type="text" name="firstName" value={profile.firstName} onChange={onChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md"/>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                        <input type="text" name="lastName" value={profile.lastName} onChange={onChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md"/>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                                        <input type="date" name="dateOfBirth" value={profile.dateOfBirth} onChange={onChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md"/>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Gender</label>
                                        <select name="gender" value={profile.gender} onChange={onChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                                            <option>Male</option>
                                            <option>Female</option>
                                            <option>Other</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                                        <input type="tel" name="contactNumber" value={profile.contactNumber} onChange={onChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md"/>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- Insurance Details Section --- */}
                        {activeTab === 'insurance' && (
                            <div className="fade-in">
                                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Insurance Details</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Insurance Provider</label>
                                        <input type="text" name="provider" value={profile.insuranceDetails.provider} onChange={onInsuranceChange} placeholder="e.g., Star Health" className="mt-1 block w-full p-2 border border-gray-300 rounded-md"/>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Policy Number</label>
                                        <input type="text" name="policyNumber" value={profile.insuranceDetails.policyNumber} onChange={onInsuranceChange} placeholder="e.g., 123-456-789" className="mt-1 block w-full p-2 border border-gray-300 rounded-md"/>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- Medical History Section --- */}
                        {activeTab === 'medical' && (
                            <div className="fade-in">
                                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Medical History</h2>
                                {profile.medicalHistory.map((item, index) => (
                                    <div key={index} className="p-4 border rounded-md mb-4 bg-gray-50 relative">
                                        <button type="button" onClick={() => removeHistoryItem(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold text-xl">
                                            &times;
                                        </button>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600">Condition</label>
                                                <input type="text" name="condition" value={item.condition} onChange={e => onHistoryChange(index, e)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md"/>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600">Diagnosed Date</label>
                                                <input type="date" name="diagnosedDate" value={item.diagnosedDate ? item.diagnosedDate.split('T')[0] : ''} onChange={e => onHistoryChange(index, e)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md"/>
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <label className="block text-xs font-medium text-gray-600">Notes</label>
                                            <textarea name="notes" value={item.notes} onChange={e => onHistoryChange(index, e)} rows="2" className="mt-1 block w-full p-2 border border-gray-300 rounded-md"></textarea>
                                        </div>
                                    </div>
                                ))}
                                <button type="button" onClick={addHistoryItem} className="w-full bg-gray-200 text-gray-700 p-2 rounded-md hover:bg-gray-300 mt-2 transition-colors">
                                    + Add Medical History Item
                                </button>
                            </div>
                        )}
                        
                        {/* --- Save Button --- */}
                        <div className="text-right border-t pt-6 mt-6">
                            <button type="submit" disabled={isSaving} className="bg-indigo-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:bg-gray-400">
                                {isSaving ? 'Saving...' : 'Save Profile'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PatientProfile;