import { useState, useEffect } from 'react';
import patientService from '../services/patientService';

export const usePatientProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await patientService.getMyProfile();
                setProfile(res.data);
            } catch (err) {
                console.error("Failed to fetch patient profile:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    return { profile, loading };
};