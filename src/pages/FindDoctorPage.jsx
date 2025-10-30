import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import doctorService from '../services/doctorService';
import DoctorCard from '../components/DoctorCard';

const FindDoctorPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --- For specialization dropdown ---
  const [specializations, setSpecializations] = useState([]);

  // --- URL-based filters ---
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedSpec, setSelectedSpec] = useState(searchParams.get('specialization') || '');
  const [insuranceTerm, setInsuranceTerm] = useState(searchParams.get('insurance') || '');
  const [cashlessOnly, setCashlessOnly] = useState(searchParams.get('cashless') === 'true');

  // --- Fetch available specializations for dropdown ---
  useEffect(() => {
    const fetchSpecs = async () => {
      try {
        const response = await doctorService.getSpecializations();
        setSpecializations(response.data || []);
      } catch (err) {
        console.error('Could not fetch specializations', err);
      }
    };
    fetchSpecs();
  }, []);

  // --- Fetch doctors whenever filters change ---
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      setError('');
      try {
        // Build filters dynamically
        const filters = {};
        if (searchTerm) filters.search = searchTerm;
        if (selectedSpec) filters.specialization = selectedSpec;
        if (insuranceTerm) filters.insurance = insuranceTerm;
        if (cashlessOnly) filters.cashless = 'true';

        // Update URL query params
        setSearchParams(filters, { replace: true });

        // Fetch from backend
        const response = await doctorService.getAllDoctors(filters);
        setDoctors(response.data);
      } catch (err) {
        console.error('Error fetching doctors:', err);
        setDoctors([]);
        setError('No doctors match your search criteria.');
      } finally {
        setLoading(false);
      }
    };

    // --- Debounce search for better UX ---
    const delayDebounceFn = setTimeout(() => {
      fetchDoctors();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedSpec, insuranceTerm, cashlessOnly, setSearchParams]);

  return (
    <div className="container mx-auto p-4 sm:p-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Find a Doctor</h1>

      {/* --- Filters Section --- */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* --- UPDATED Search Input --- */}
          <div className="flex-grow">
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700"
            >
              Search by Name, City, or Clinic
            </label>
            <input
              type="text"
              id="search"
              placeholder="e.g., Dr. Gokul, Mumbai, or Apollo Clinic"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* --- Specialization Dropdown --- */}
          <div className="w-full md:w-1/3">
            <label
              htmlFor="specialization"
              className="block text-sm font-medium text-gray-700"
            >
              Filter by Specialization
            </label>
            <select
              id="specialization"
              value={selectedSpec}
              onChange={(e) => setSelectedSpec(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Specializations</option>
              {specializations.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* --- Insurance Filter Input --- */}
        <div className="w-full">
          <label
            htmlFor="insurance"
            className="block text-sm font-medium text-gray-700"
          >
            Filter by Insurance Provider
          </label>
          <input
            type="text"
            id="insurance"
            placeholder="e.g., Star Health, ICICI Lombard"
            value={insuranceTerm}
            onChange={(e) => setInsuranceTerm(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* --- Cashless Filter Checkbox --- */}
        <div className="flex items-center">
          <input
            id="cashless"
            type="checkbox"
            checked={cashlessOnly}
            onChange={(e) => setCashlessOnly(e.target.checked)}
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
          />
          <label
            htmlFor="cashless"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            Cashless Available
          </label>
        </div>
      </div>

      {/* --- Search Results Section --- */}
      {loading ? (
        <p className="text-center p-10">Searching for doctors...</p>
      ) : doctors.length === 0 ? (
        <div className="text-center p-10 bg-white rounded-lg shadow-md">
          <p className="text-gray-600">{error || 'No doctors found.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12 pt-12">
          {doctors.map((doctorProfile) => (
            <DoctorCard key={doctorProfile._id} doctor={doctorProfile} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FindDoctorPage;
