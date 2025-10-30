import React, { useState, useEffect } from 'react';
import claimService from '../services/claimService';
import { usePatientProfile } from '../hooks/usePatientProfile'; // We will use this hook

const MyClaimsPage = () => {
    const { profile, loading: profileLoading } = usePatientProfile(); // Get patient profile
    const [claims, setClaims] = useState([]);
    const [loadingClaims, setLoadingClaims] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Form state
    const [insuranceProvider, setInsuranceProvider] = useState('');
    const [policyNumber, setPolicyNumber] = useState('');
    const [hospitalBill, setHospitalBill] = useState(null);
    const [medicalReports, setMedicalReports] = useState(null);
    const [notes, setNotes] = useState('');

    // Pre-fill form from profile
    useEffect(() => {
        if (profile && profile.insuranceDetails) {
            setInsuranceProvider(profile.insuranceDetails.provider || '');
            setPolicyNumber(profile.insuranceDetails.policyNumber || '');
        }
    }, [profile]);

    // Fetch claims
    const fetchClaims = async () => {
        try {
            setLoadingClaims(true);
            const res = await claimService.getMyClaims();
            setClaims(res.data);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch past claims.');
        } finally {
            setLoadingClaims(false);
        }
    };

    useEffect(() => {
        fetchClaims();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!hospitalBill || !medicalReports) {
            setError('Please upload both a hospital bill and your medical reports.');
            return;
        }

        setIsSubmitting(true);
        setError('');

        const formData = new FormData();
        formData.append('insuranceProvider', insuranceProvider);
        formData.append('policyNumber', policyNumber);
        formData.append('hospitalBill', hospitalBill);
        formData.append('medicalReports', medicalReports);
        formData.append('notes', notes);

        try {
            await claimService.submitClaim(formData);
            alert('Claim submitted successfully!');
            // Clear form
            setHospitalBill(null);
            setMedicalReports(null);
            setNotes('');
            // Refresh claims list
            fetchClaims();
        } catch (err) {
            console.error('Claim submission error:', err);
            setError(err.response?.data?.msg || 'Failed to submit claim.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            case 'In Review': return 'bg-blue-100 text-blue-800';
            case 'Approved': return 'bg-green-100 text-green-800';
            case 'Rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="container mx-auto p-4 sm:p-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">My Insurance Claims</h1>

            {/* Submit New Claim Form */}
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8 space-y-4">
                <h2 className="text-xl font-semibold text-gray-700">Submit a New Claim</h2>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Insurance Provider</label>
                        <input type="text" value={insuranceProvider} onChange={(e) => setInsuranceProvider(e.target.value)} required className="mt-1 block w-full p-2 border rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Policy Number</label>
                        <input type="text" value={policyNumber} onChange={(e) => setPolicyNumber(e.target.value)} required className="mt-1 block w-full p-2 border rounded-md" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Hospital Bill</label>
                    <input type="file" accept="image/*,application/pdf" onChange={(e) => setHospitalBill(e.target.files[0])} required className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Medical Reports</label>
                    <input type="file" accept="image/*,application/pdf" onChange={(e) => setMedicalReports(e.target.files[0])} required className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows="3" className="mt-1 block w-full p-2 border rounded-md"></textarea>
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400">
                    {isSubmitting ? 'Submitting...' : 'Submit Claim'}
                </button>
            </form>

            {/* Past Claims List */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">My Claim History</h2>
                {loadingClaims ? <p>Loading claims...</p> : (
                    <div className="space-y-4">
                        {claims.length === 0 ? <p className="text-gray-500">You have not submitted any claims yet.</p> : (
                            claims.map(claim => (
                                <div key={claim._id} className="border rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start">
                                    <div>
                                        <p className="font-semibold">{claim.insuranceProvider} - {claim.policyNumber}</p>
                                        <p className="text-sm text-gray-500">Submitted: {new Date(claim.createdAt).toLocaleDateString()}</p>
                                        <div className="flex gap-4 mt-2">
                                            <a href={claim.hospitalBillUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline">View Bill</a>
                                            <a href={claim.medicalReportsUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline">View Reports</a>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(claim.status)}`}>
                                        {claim.status}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyClaimsPage; // <-- THIS LINE WAS MISSING