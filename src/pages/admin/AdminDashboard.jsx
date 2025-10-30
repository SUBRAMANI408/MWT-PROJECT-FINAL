import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import Modal from '../../components/common/Modal';
import defaultAvatar from '../../assets/default-avatar.png'; // Import default avatar

// --- MAIN DASHBOARD COMPONENT ---
const AdminDashboard = () => {
    // --- Data states ---
    const [pendingDoctors, setPendingDoctors] = useState([]);
    const [allDoctors, setAllDoctors] = useState([]);
    const [allPatients, setAllPatients] = useState([]);
    const [allAppointments, setAllAppointments] = useState([]);
    const [allMedicines, setAllMedicines] = useState([]);
    const [allSurgeries, setAllSurgeries] = useState([]);
    const [allClaims, setAllClaims] = useState([]);
    
    // --- UI states ---
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview'); // Default tab is 'overview'
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // --- Filter states ---
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [appointmentStatusFilter, setAppointmentStatusFilter] = useState('All');
    
    // --- Filtered result states ---
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [filteredMedicines, setFilteredMedicines] = useState([]);
    const [filteredSurgeries, setFilteredSurgeries] = useState([]);
    const [filteredClaims, setFilteredClaims] = useState([]);

    // --- Fetch all data on load ---
    const fetchAllData = async () => {
        setLoading(true);
        try {
            // Fetch all data in parallel
            const [pendingRes, doctorsRes, patientsRes, appointmentsRes, medicinesRes, surgeriesRes, claimsRes] = await Promise.all([
                adminService.getPendingDoctors(),
                adminService.getAllDoctors(),
                adminService.getAllPatients(),
                adminService.getAllAppointments(),
                adminService.getAllMedicines(),
                adminService.getAllSurgeries(),
                adminService.getAllClaims(),
            ]);
            setPendingDoctors(pendingRes.data);
            setAllDoctors(doctorsRes.data);
            setAllPatients(patientsRes.data);
            setAllAppointments(appointmentsRes.data);
            setAllMedicines(medicinesRes.data);
            setAllSurgeries(surgeriesRes.data);
            setAllClaims(claimsRes.data);
        } catch (error) {
            console.error('Failed to fetch admin data:', error);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => { fetchAllData(); }, []);

    // --- Filtering logic ---
    useEffect(() => {
        // Doctors
        let doctorsData = allDoctors.map(d => ({ ...d.user, status: d.status, _id: d.user._id, createdAt: d.user.createdAt, specialization: d.specialization }));
        if (searchTerm && activeTab === 'doctors') doctorsData = doctorsData.filter(doc => doc.name.toLowerCase().includes(searchTerm.toLowerCase()));
        if (filterDate && activeTab === 'doctors') doctorsData = doctorsData.filter(doc => new Date(doc.createdAt).toLocaleDateString() === new Date(filterDate).toLocaleDateString());
        setFilteredDoctors(doctorsData);
        // Patients
        let patientsData = [...allPatients];
        if (searchTerm && activeTab === 'patients') patientsData = patientsData.filter(patient => patient.name.toLowerCase().includes(searchTerm.toLowerCase()));
        if (filterDate && activeTab === 'patients') patientsData = patientsData.filter(patient => new Date(patient.createdAt).toLocaleDateString() === new Date(filterDate).toLocaleDateString());
        setFilteredPatients(patientsData);
        // Appointments
        let appointmentsData = [...allAppointments];
        if (appointmentStatusFilter !== 'All' && activeTab === 'appointments') appointmentsData = appointmentsData.filter(app => app.status === appointmentStatusFilter);
        setFilteredAppointments(appointmentsData);
        // Medicines
        let medicinesData = [...allMedicines];
        if (searchTerm && activeTab === 'medicines') medicinesData = medicinesData.filter(med => med.name.toLowerCase().includes(searchTerm.toLowerCase()));
        setFilteredMedicines(medicinesData);
        // Surgeries
        let surgeriesData = [...allSurgeries];
        if (searchTerm && activeTab === 'surgeries') surgeriesData = surgeriesData.filter(surgery => surgery.title.toLowerCase().includes(searchTerm.toLowerCase()));
        setFilteredSurgeries(surgeriesData);
        // Claims
        let claimsData = [...allClaims];
        if (searchTerm && activeTab === 'claims')
            claimsData = claimsData.filter(claim => 
                claim.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                claim.policyNumber.includes(searchTerm)
            );
        setFilteredClaims(claimsData);
    }, [searchTerm, filterDate, appointmentStatusFilter, allDoctors, allPatients, allAppointments, allMedicines, allSurgeries, allClaims, activeTab]);

    // --- Handlers ---
    const handleViewDetails = (doctor) => { setSelectedDoctor(doctor); setIsModalOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); setSelectedDoctor(null); };
    const handleApprove = async (doctorId) => { try { await adminService.approveDoctor(doctorId); fetchAllData(); } catch (err) { console.error(err); } };
    const handleReject = async (doctorId) => { try { await adminService.rejectDoctor(doctorId); fetchAllData(); } catch (err) { console.error(err); } };
    const handleLogout = () => { localStorage.removeItem('token'); window.location.href = '/admin'; };

    // Medicine Handlers
    const handleAddMedicine = async (formData) => {
        try {
            await adminService.addMedicine(formData);
            fetchAllData();
            alert('Medicine added successfully!');
            return true;
        } catch (error) {
            alert(`Failed to add medicine: ${error.response?.data?.msg || error.message}`);
            return false;
        }
    };
    const handleUpdateMedicine = async (id, formData) => {
        try {
            await adminService.updateMedicine(id, formData);
            fetchAllData();
            alert('Medicine updated successfully!');
            return true;
        } catch (error) {
            alert(`Failed to update medicine: ${error.response?.data?.msg || error.message}`);
            return false;
        }
    };
    const handleDeleteMedicine = async (id) => {
        if (window.confirm('Are you sure you want to delete this medicine?')) {
            try { await adminService.deleteMedicine(id); fetchAllData(); alert('Medicine deleted!'); }
            catch (error) { alert('Failed to delete medicine.'); }
        }
    };

    // Surgery Handlers
    const handleAddSurgery = async (surgeryData) => {
        try {
            await adminService.addSurgery(surgeryData);
            fetchAllData();
            alert('Surgery added successfully!');
            return true;
        } catch (error) {
            alert(`Failed to add surgery: ${error.response?.data?.msg || error.message}`);
            return false;
        }
    };
    const handleUpdateSurgery = async (id, surgeryData) => {
        try {
            await adminService.updateSurgery(id, surgeryData);
            fetchAllData();
            alert('Surgery updated successfully!');
            return true;
        } catch (error) {
            alert(`Failed to update surgery: ${error.response?.data?.msg || error.message}`);
            return false;
        }
    };
    const handleDeleteSurgery = async (id) => {
        if (window.confirm('Are you sure you want to delete this surgery?')) {
            try { await adminService.deleteSurgery(id); fetchAllData(); alert('Surgery deleted!'); }
            catch (error) { alert('Failed to delete surgery.'); }
        }
    };

    // Claim Handlers
    const handleUpdateClaim = async (id, status) => {
        try {
            await adminService.updateClaimStatus(id, status);
            fetchAllData(); // Refresh the list
            alert(`Claim status updated to ${status}`);
        } catch (err) {
            alert('Failed to update claim status.');
        }
    };

    // --- Render content based on tab ---
    const renderContent = () => {
        if (loading) return <p className="text-center p-10">Loading Dashboard...</p>;
        switch (activeTab) {
            case 'overview': return <DashboardOverview stats={{ totalPatients: allPatients.length, totalDoctors: allDoctors.length, totalAppointments: allAppointments.length, pendingDoctors: pendingDoctors.length }} setActiveTab={setActiveTab} />;
            case 'pending': return <PendingDoctorsTable doctors={pendingDoctors} onView={handleViewDetails} onApprove={handleApprove} onReject={handleReject} />;
            case 'doctors': return <UsersTable users={filteredDoctors} title="All Doctors" />;
            case 'patients': return <UsersTable users={filteredPatients} title="All Patients" />;
            case 'appointments': return <AppointmentsTable appointments={filteredAppointments} />;
            case 'medicines': return <MedicinesTable medicines={filteredMedicines} onAdd={handleAddMedicine} onUpdate={handleUpdateMedicine} onDelete={handleDeleteMedicine} />;
            case 'surgeries': return <SurgeriesTable surgeries={filteredSurgeries} onAdd={handleAddSurgery} onUpdate={handleUpdateSurgery} onDelete={handleDeleteSurgery} />;
            case 'claims': return <ClaimsTable claims={filteredClaims} onUpdateStatus={handleUpdateClaim} />;
            default: return null;
        }
    };

    // --- Main JSX ---
    return (
        <div className="p-4 sm:p-8 bg-gray-100 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                    <button onClick={handleLogout} className="mt-4 sm:mt-0 bg-red-600 text-white py-2 px-4 rounded-lg shadow hover:bg-red-700 transition">Logout</button>
                </div>

                {/* Tabs */}
                <div className="mb-6 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto" aria-label="Tabs">
                        <Tab label="Overview" tabKey="overview" activeTab={activeTab} setActiveTab={setActiveTab} />
                        <Tab label="Pending Approvals" badge={pendingDoctors.length} tabKey="pending" activeTab={activeTab} setActiveTab={setActiveTab} />
                        <Tab label="All Doctors" tabKey="doctors" activeTab={activeTab} setActiveTab={setActiveTab} />
                        <Tab label="All Patients" tabKey="patients" activeTab={activeTab} setActiveTab={setActiveTab} />
                        <Tab label="All Appointments" tabKey="appointments" activeTab={activeTab} setActiveTab={setActiveTab} />
                        <Tab label="Manage Medicines" tabKey="medicines" activeTab={activeTab} setActiveTab={setActiveTab} />
                        <Tab label="Manage Surgeries" tabKey="surgeries" activeTab={activeTab} setActiveTab={setActiveTab} />
                        <Tab label="Manage Claims" tabKey="claims" activeTab={activeTab} setActiveTab={setActiveTab} />
                    </nav>
                </div>
                
                {/* Filters */}
                {(activeTab === 'doctors' || activeTab === 'patients' || activeTab === 'medicines' || activeTab === 'surgeries' || activeTab === 'claims') && (
                    <div className="mb-4 p-4 bg-white rounded-lg shadow-sm flex flex-col sm:flex-row gap-4 items-center">
                        <input type="text" placeholder={
                            activeTab === 'surgeries' ? "Search by title..." :
                            activeTab === 'claims' ? "Search by patient or policy..." :
                            "Search by name..."
                        } value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full sm:w-auto flex-grow p-2 border rounded-md"/>
                        {(activeTab === 'doctors' || activeTab === 'patients') && <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="w-full sm:w-auto p-2 border rounded-md"/>}
                        <button onClick={() => { setSearchTerm(''); setFilterDate(''); }} className="w-full sm:w-auto text-sm text-gray-600 hover:text-gray-900 px-4 py-2 bg-gray-200 rounded-md">Clear Filters</button>
                    </div>
                )}
                {activeTab === 'appointments' && (
                    <div className="mb-4 p-4 bg-white rounded-lg shadow-sm flex flex-wrap gap-4 items-center">
                        <span className="font-medium text-gray-700">Filter by Status:</span>
                        <div className="flex gap-2">
                            {['All', 'Scheduled', 'Completed', 'Cancelled'].map(status => (
                                <button key={status} onClick={() => setAppointmentStatusFilter(status)} className={`px-3 py-1 text-sm rounded-full ${appointmentStatusFilter === status ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="bg-white p-6 rounded-lg shadow-md">{renderContent()}</div>
            </div>

            {/* Doctor Modal */}
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Doctor Profile Details">
                {selectedDoctor && (
                    <div className="space-y-4 text-gray-700">
                        <div><strong className="font-semibold text-gray-900">Name:</strong> {selectedDoctor.user.name}</div>
                        <div><strong className="font-semibold text-gray-900">Email:</strong> {selectedDoctor.user.email}</div><hr/>
                        <div><strong className="font-semibold text-gray-900">Specialization:</strong> {selectedDoctor.specialization}</div>
                        <div><strong className="font-semibold text-gray-900">Experience:</strong> {selectedDoctor.experienceInYears} years</div>
                        <div><strong className="font-semibold text-gray-900">Consultation Fee:</strong> ₹{selectedDoctor.consultationFee}</div>
                        <div className="border-t pt-4 mt-4">
                            <h4 className="font-semibold text-lg mb-2 text-gray-900">Qualifications</h4>
                            {selectedDoctor.qualifications && selectedDoctor.qualifications.length > 0 ? (
                                <ul className="list-disc list-inside space-y-2">
                                    {selectedDoctor.qualifications.map((qual, index) => (<li key={index}><strong>{qual.degree}</strong> from {qual.university} ({qual.year})</li>))}
                                </ul>
                            ) : (<p>No qualifications listed.</p>)}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

// --- HELPER COMPONENTS ---
// --- (These must be in the same file) ---

const Tab = ({ label, badge, tabKey, activeTab, setActiveTab }) => (
    <button onClick={() => setActiveTab(tabKey)} className={`${activeTab === tabKey ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
        {label}
        {badge > 0 && <span className="bg-yellow-200 text-yellow-800 ml-2 px-2 py-0.5 rounded-full text-xs">{badge}</span>}
    </button>
);

const DashboardOverview = ({ stats, setActiveTab }) => (
    <div>
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">Platform Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <button onClick={() => setActiveTab('patients')} className="text-left w-full">
                <StatCard 
                    title="Total Patients" 
                    value={stats.totalPatients} 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>}
                    color="blue"
                />
            </button>
            <button onClick={() => setActiveTab('doctors')} className="text-left w-full">
                <StatCard 
                    title="Total Doctors" 
                    value={stats.totalDoctors} 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.375 3.375 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>}
                    color="green"
                />
            </button>
            <button onClick={() => setActiveTab('appointments')} className="text-left w-full">
                <StatCard 
                    title="Total Appointments" 
                    value={stats.totalAppointments} 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008z" /></svg>}
                    color="indigo"
                />
            </button>
            <button onClick={() => setActiveTab('pending')} className="text-left w-full">
                <StatCard 
                    title="Pending Approvals" 
                    value={stats.pendingDoctors} 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    color="yellow"
                />
            </button>
        </div>
    </div>
);

const StatCard = ({ title, value, icon, color }) => {
    const colors = {
        blue: 'bg-blue-500 hover:bg-blue-600',
        green: 'bg-green-500 hover:bg-green-600',
        indigo: 'bg-indigo-500 hover:bg-indigo-600',
        yellow: 'bg-yellow-500 hover:bg-yellow-600',
    };
    return (
        <div className={`p-6 rounded-lg shadow-lg text-white ${colors[color]} transition-all duration-300`}>
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-sm font-medium uppercase opacity-80">{title}</p>
                    <p className="text-4xl font-bold">{value}</p>
                </div>
                <div className="opacity-70">
                    {icon}
                </div>
            </div>
        </div>
    );
};

const PendingDoctorsTable = ({ doctors, onView, onApprove, onReject }) => (
    <div>
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Pending Doctor Approvals</h2>
        {doctors.length === 0 ? <p className="text-gray-500">No new doctors awaiting approval.</p> : (
            <div className="space-y-4">
                {doctors.map(doctor => (
                    <div key={doctor._id} className="p-4 border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div><p className="font-bold text-lg">{doctor.user.name}</p><p className="text-gray-600">{doctor.specialization}</p></div>
                        <div className="flex gap-2 sm:gap-4 flex-shrink-0">
                            <button onClick={() => onView(doctor)} className="bg-blue-500 text-white px-3 py-2 text-sm rounded hover:bg-blue-600">View Details</button>
                            <button onClick={() => onApprove(doctor._id)} className="bg-green-500 text-white px-3 py-2 text-sm rounded hover:bg-green-600">Approve</button>
                            <button onClick={() => onReject(doctor._id)} className="bg-yellow-500 text-white px-3 py-2 text-sm rounded hover:bg-yellow-600">Reject</button>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
);

const UsersTable = ({ users, title }) => (
    <div>
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">{title}</h2>
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        {title === 'All Doctors' && <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialization</th>}
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined On</th>
                        {title === 'All Doctors' && <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {users.map(user => (
                        <tr key={user._id}>
                            <td className="py-4 px-6 whitespace-nowrap">{user.name}</td>
                            <td className="py-4 px-6 whitespace-nowrap">{user.email}</td>
                            {title === 'All Doctors' && <td className="py-4 px-6 whitespace-nowrap">{user.specialization}</td>}
                            <td className="py-4 px-6 whitespace-nowrap">{new Date(user.createdAt).toLocaleDateString()}</td>
                            {title === 'All Doctors' && <td className="py-4 px-6 whitespace-nowrap">{user.status}</td>}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const AppointmentsTable = ({ appointments }) => (
    <div>
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">All Appointments</h2>
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {appointments.map(app => (
                        <tr key={app._id}>
                            <td className="py-4 px-6 whitespace-nowrap">{app.patient?.name || 'N/A'}</td>
                            <td className="py-4 px-6 whitespace-nowrap">{app.doctor?.name || 'N/A'}</td>
                            <td className="py-4 px-6 whitespace-nowrap">{new Date(app.appointmentDate).toLocaleDateString()}</td>
                            <td className="py-4 px-6 whitespace-nowrap">{app.timeSlot}</td>
                            <td className="py-4 px-6 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ app.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' : app.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800' }`}>
                                    {app.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const MedicinesTable = ({ medicines, onAdd, onUpdate, onDelete }) => {
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingMedicine, setEditingMedicine] = useState(null); 
    const [formData, setFormData] = useState({ name: '', description: '', price: '', manufacturer: '', stock: '', ingredientsAndBenefits: '', uses: '', dosage: '', generalWarnings: '', leafletUrl: '' });
    const [medicineImage, setMedicineImage] = useState(null);
    const [preview, setPreview] = useState(null);

    const initialFormState = { name: '', description: '', price: '', manufacturer: '', stock: '', ingredientsAndBenefits: '', uses: '', dosage: '', generalWarnings: '', leafletUrl: '' };

    const handleOpenAddForm = () => {
        setEditingMedicine(null);
        setFormData(initialFormState);
        setMedicineImage(null);
        setPreview(null);
        setShowForm(true);
    };

    const handleOpenEditForm = (medicine) => {
        setEditingMedicine(medicine);
        setFormData({
            name: medicine.name || '',
            description: medicine.description || '',
            price: medicine.price || '',
            manufacturer: medicine.manufacturer || '',
            stock: medicine.stock || '',
            ingredientsAndBenefits: medicine.ingredientsAndBenefits || '',
            uses: medicine.uses || '',
            dosage: medicine.dosage || '',
            generalWarnings: medicine.generalWarnings || '',
            leafletUrl: medicine.leafletUrl || ''
        });
        setMedicineImage(null);
        setPreview(medicine.imageUrl || defaultAvatar);
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingMedicine(null);
    };

    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMedicineImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (medicineImage) {
            data.append('medicineImage', medicineImage);
        }

        let success = false;
        if (editingMedicine) {
            success = await onUpdate(editingMedicine._id, data);
        } else {
            success = await onAdd(data);
        }
        
        if (success) {
            handleCloseForm();
        }
        setIsSubmitting(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-700">Medicines</h2>
                <button onClick={showForm ? handleCloseForm : handleOpenAddForm} className="bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-600 transition">
                    {showForm ? 'Cancel' : '+ Add New Medicine'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg bg-gray-50 space-y-4">
                    <h3 className="text-lg font-medium">{editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}</h3>
                    <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleInputChange} required className="w-full p-2 border rounded-md"/>
                    <textarea name="description" placeholder="Description" value={formData.description} onChange={handleInputChange} required className="w-full p-2 border rounded-md"></textarea>
                    <input type="number" name="price" placeholder="Price (₹)" value={formData.price} onChange={handleInputChange} required className="w-full p-2 border rounded-md"/>
                    <input type="text" name="manufacturer" placeholder="Manufacturer" value={formData.manufacturer} onChange={handleInputChange} required className="w-full p-2 border rounded-md"/>
                    <input type="number" name="stock" placeholder="Stock Quantity" value={formData.stock} onChange={handleInputChange} required className="w-full p-2 border rounded-md"/>
                    <textarea name="ingredientsAndBenefits" placeholder="Ingredients and Benefits" value={formData.ingredientsAndBenefits} onChange={handleInputChange} className="w-full p-2 border rounded-md" rows="3"></textarea>
                    <textarea name="uses" placeholder="Uses" value={formData.uses} onChange={handleInputChange} className="w-full p-2 border rounded-md" rows="3"></textarea>
                    <textarea name="dosage" placeholder="Dosage" value={formData.dosage} onChange={handleInputChange} className="w-full p-2 border rounded-md" rows="3"></textarea>
                    <textarea name="generalWarnings" placeholder="General Warnings" value={formData.generalWarnings} onChange={handleInputChange} className="w-full p-2 border rounded-md" rows="3"></textarea>
                    <input type="text" name="leafletUrl" placeholder="Leaflet URL (e.g., https://.../leaflet.pdf)" value={formData.leafletUrl} onChange={handleInputChange} className="w-full p-2 border rounded-md"/>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Image {editingMedicine ? '(Optional: Leave blank to keep existing)' : ''}</label>
                        <input type="file" name="medicineImage" accept="image/*" onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
                        {preview && <img src={preview} alt="Preview" className="h-20 mt-2 object-contain rounded-md"/>}
                    </div>
                    <button type="submit" disabled={isSubmitting} className="bg-indigo-600 text-white px-4 py-2 rounded-md shadow hover:bg-indigo-700 disabled:bg-gray-400">
                        {isSubmitting ? (editingMedicine ? 'Updating...' : 'Adding...') : (editingMedicine ? 'Update Medicine' : 'Add Medicine')}
                    </button>
                </form>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Manufacturer</th>
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {medicines.map(med => (
                            <tr key={med._id}>
                                <td className="py-4 px-6">
                                    <img src={med.imageUrl || defaultAvatar} alt={med.name} className="h-10 w-10 object-contain rounded"/>
                                </td>
                                <td className="py-4 px-6 whitespace-nowrap font-medium">{med.name}</td>
                                <td className="py-4 px-6 whitespace-nowrap">{med.manufacturer}</td>
                                <td className="py-4 px-6 whitespace-nowrap">₹{med.price.toFixed(2)}</td>
                                <td className="py-4 px-6 whitespace-nowrap">{med.stock}</td>
                                <td className="py-4 px-6 whitespace-nowrap">
                                    <button onClick={() => handleOpenEditForm(med)} className="text-indigo-600 hover:text-indigo-900 text-sm mr-4">Edit</button>
                                    <button onClick={() => onDelete(med._id)} className="text-red-600 hover:text-red-900 text-sm">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const SurgeriesTable = ({ surgeries, onAdd, onUpdate, onDelete }) => {
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingSurgery, setEditingSurgery] = useState(null);
    const [formData, setFormData] = useState({ title: '', imageUrl: '', summary: '', specialistToConsult: '', detailedDescription: '', procedureAndTreatment: '' });

    const handleOpenAddForm = () => {
        setEditingSurgery(null);
        setFormData({ title: '', imageUrl: '', summary: '', specialistToConsult: '', detailedDescription: '', procedureAndTreatment: '' });
        setShowForm(true);
    };

    const handleOpenEditForm = (surgery) => {
        setEditingSurgery(surgery);
        setFormData(surgery);
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingSurgery(null);
    };

    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        let success = false;
        if (editingSurgery) {
            success = await onUpdate(editingSurgery._id, formData);
        } else {
            success = await onAdd(formData);
        }
        if (success) {
            handleCloseForm();
        }
        setIsSubmitting(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-700">Surgeries</h2>
                <button onClick={showForm ? handleCloseForm : handleOpenAddForm} className="bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-600 transition">
                    {showForm ? 'Cancel' : '+ Add New Surgery'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg bg-gray-50 space-y-4">
                    <h3 className="text-lg font-medium">{editingSurgery ? 'Edit Surgery' : 'Add New Surgery'}</h3>
                    <input type="text" name="title" placeholder="Surgery Title (e.g., Appendectomy)" value={formData.title} onChange={handleInputChange} required className="w-full p-2 border rounded-md"/>
                    <input type="text" name="imageUrl" placeholder="Image URL (e.g., https://.../image.jpg)" value={formData.imageUrl} onChange={handleInputChange} required className="w-full p-2 border rounded-md"/>
                    <input type="text" name="summary" placeholder="Short Summary (200 chars max)" value={formData.summary} onChange={handleInputChange} required className="w-full p-2 border rounded-md"/>
                    <input type="text" name="specialistToConsult" placeholder="Specialist (e.g., General Surgeon)" value={formData.specialistToConsult} onChange={handleInputChange} required className="w-full p-2 border rounded-md"/>
                    <textarea name="detailedDescription" placeholder="Detailed Description" value={formData.detailedDescription} onChange={handleInputChange} required className="w-full p-2 border rounded-md" rows="4"></textarea>
                    <textarea name="procedureAndTreatment" placeholder="Procedure and Treatment" value={formData.procedureAndTreatment} onChange={handleInputChange} required className="w-full p-2 border rounded-md" rows="4"></textarea>
                    <button type="submit" disabled={isSubmitting} className="bg-indigo-600 text-white px-4 py-2 rounded-md shadow hover:bg-indigo-7V00 disabled:bg-gray-400">
                        {isSubmitting ? (editingSurgery ? 'Updating...' : 'Adding...') : (editingSurgery ? 'Update Surgery' : 'Add Surgery')}
                    </button>
                </form>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Specialist</th>
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {surgeries.map(surgery => (
                            <tr key={surgery._id}>
                                <td className="py-4 px-6 whitespace-nowrap font-medium">{surgery.title}</td>
                                <td className="py-4 px-6 whitespace-nowrap">{surgery.specialistToConsult}</td>
                                <td className="py-4 px-6 whitespace-nowrap">
                                    <button onClick={() => handleOpenEditForm(surgery)} className="text-indigo-600 hover:text-indigo-900 text-sm mr-4">Edit</button>
                                    <button onClick={() => onDelete(surgery._id)} className="text-red-600 hover:text-red-900 text-sm">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const ClaimsTable = ({ claims, onUpdateStatus }) => {
    
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
        <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Manage Insurance Claims</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Policy #</th>
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Documents</th>
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {claims.map(claim => (
                            <tr key={claim._id}>
                                <td className="py-4 px-6 whitespace-nowrap">{claim.patient?.name || 'N/A'}</td>
                                <td className="py-4 px-6 whitespace-nowrap">{claim.insuranceProvider}</td>
                                <td className="py-4 px-6 whitespace-nowrap">{claim.policyNumber}</td>
                                <td className="py-4 px-6 whitespace-nowrap">{new Date(claim.createdAt).toLocaleDateString()}</td>
                                <td className="py-4 px-6 whitespace-nowrap">
                                    <a href={claim.hospitalBillUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline">View Bill</a>
                                    <br/>
                                    <a href={claim.medicalReportsUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-6Git00 hover:underline">View Reports</a>
                                </td>
                                <td className="py-4 px-6 whitespace-nowrap">
                                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(claim.status)}`}>
                                        {claim.status}
                                    </span>
                                </td>
                                <td className="py-4 px-6 whitespace-nowrap">
                                    <select 
                                        onChange={(e) => onUpdateStatus(claim._id, e.target.value)} 
                                        value={claim.status}
                                        className="p-1 border rounded-md text-sm"
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="In Review">In Review</option>
                                        <option value="Approved">Approve</option>
                                        <option value="Rejected">Reject</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminDashboard;