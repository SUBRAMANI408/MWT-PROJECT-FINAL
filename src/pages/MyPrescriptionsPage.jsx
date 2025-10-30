import React, { useState, useEffect } from 'react';
import prescriptionService from '../services/prescriptionService';

// --- Trash Icon Component (using Heroicons SVG) ---
const TrashIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-5 h-5"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
        />
    </svg>
);

const MyPrescriptionsPage = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const fetchPrescriptions = async () => {
        setIsLoading(true);
        try {
            const response = await prescriptionService.getMyPrescriptions();
            setPrescriptions(response.data);
        } catch (err) {
            console.error('Failed to fetch prescriptions:', err);
            setError('Could not load your prescriptions.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPrescriptions();
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
            setError('');
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Please choose a file to upload.');
            return;
        }
        setUploading(true);
        setError('');
        const formData = new FormData();
        formData.append('prescriptionImage', selectedFile);

        try {
            await prescriptionService.uploadPrescription(formData);
            setSelectedFile(null);
            setPreview(null);
            fetchPrescriptions();
        } catch (err) {
            console.error('Failed to upload prescription:', err);
            setError('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    // --- NEW: Delete Handler ---
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this prescription?')) {
            try {
                await prescriptionService.deletePrescription(id);
                fetchPrescriptions(); // Refresh after deletion
            } catch (err) {
                console.error('Failed to delete prescription:', err);
                setError('Delete failed. Please try again.');
            }
        }
    };

    return (
        <div className="container mx-auto p-4 sm:p-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">My Prescriptions</h1>

            {/* Upload Section */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Upload New Prescription</h2>
                <div className="flex flex-col items-center sm:flex-row sm:items-end gap-4">
                    <div className="flex-grow w-full sm:w-auto">
                        <label
                            htmlFor="prescription-upload"
                            className="cursor-pointer inline-block bg-white border border-gray-400 text-gray-700 py-2 px-4 rounded-md font-semibold hover:bg-gray-50 text-sm"
                        >
                            Choose Image File
                        </label>
                        <input
                            id="prescription-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        {selectedFile && (
                            <span className="ml-4 text-sm text-gray-600">{selectedFile.name}</span>
                        )}
                    </div>
                    {preview && (
                        <div className="mt-4 sm:mt-0 sm:ml-4 flex-shrink-0">
                            <img
                                src={preview}
                                alt="Prescription preview"
                                className="h-20 w-auto border rounded"
                            />
                        </div>
                    )}
                    <button
                        onClick={handleUpload}
                        disabled={uploading || !selectedFile}
                        className="w-full sm:w-auto bg-indigo-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 mt-4 sm:mt-0"
                    >
                        {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>

            {/* Display Section */}
            <div className="bg-white p-6 rounded-lg shadow-md mt-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">
                    Uploaded Prescriptions
                </h2>
                {isLoading ? (
                    <p>Loading prescriptions...</p>
                ) : prescriptions.length === 0 ? (
                    <p className="text-gray-500">
                        You haven't uploaded any prescriptions yet.
                    </p>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {prescriptions.map((presc) => (
                            <div
                                key={presc._id}
                                className="relative group border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                            >
                                <a
                                    href={presc.imageUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block hover:opacity-80 transition-opacity"
                                >
                                    <img
                                        src={presc.imageUrl}
                                        alt={`Prescription uploaded on ${new Date(
                                            presc.createdAt
                                        ).toLocaleDateString()}`}
                                        className="w-full h-48 object-contain bg-gray-100"
                                    />
                                </a>
                                <p className="text-xs text-center text-gray-500 p-1">
                                    Uploaded:{' '}
                                    {new Date(presc.createdAt).toLocaleDateString()}
                                </p>

                                {/* Delete Button (shows on hover) */}
                                <button
                                    onClick={() => handleDelete(presc._id)}
                                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Delete Prescription"
                                >
                                    <TrashIcon />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyPrescriptionsPage;
