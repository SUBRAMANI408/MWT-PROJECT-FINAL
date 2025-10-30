const Claim = require('../models/Claim');

/**
 * @desc    Submit a new insurance claim (for patients)
 * @route   POST /api/claims
 * @access  Private (Patient)
 */
exports.submitClaim = async (req, res) => {
    try {
        const { insuranceProvider, policyNumber, notes } = req.body;
        const patientId = req.user.id;

        // --- Validate file uploads ---
        if (!req.files || !req.files.hospitalBill || !req.files.medicalReports) {
            return res
                .status(400)
                .json({ msg: 'Please upload both hospital bill and medical reports.' });
        }

        const hospitalBillUrl = req.files.hospitalBill[0].path;
        const medicalReportsUrl = req.files.medicalReports[0].path;

        const newClaim = new Claim({
            patient: patientId,
            insuranceProvider,
            policyNumber,
            notes,
            hospitalBillUrl,
            medicalReportsUrl,
            status: 'Pending',
        });

        await newClaim.save();
        res.status(201).json(newClaim);
    } catch (err) {
        console.error('Error submitting claim:', err.message);
        res.status(500).send('Server Error');
    }
};

/**
 * @desc    Get all claims for the logged-in patient
 * @route   GET /api/claims/my
 * @access  Private (Patient)
 */
exports.getMyClaims = async (req, res) => {
    try {
        const claims = await Claim.find({ patient: req.user.id })
            .sort({ createdAt: -1 });
        res.json(claims);
    } catch (err) {
        console.error('Error fetching claims:', err.message);
        res.status(500).send('Server Error');
    }
};

// =====================================================================
//                            ADMIN FUNCTIONS
// =====================================================================

/**
 * @desc    Get all insurance claims (Admin only)
 * @route   GET /api/claims/all
 * @access  Private (Admin)
 */
exports.getAllClaims = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'User not authorized' });
        }

        const claims = await Claim.find()
            .populate('patient', 'name email') // Get basic patient info
            .sort({ createdAt: -1 });

        res.json(claims);
    } catch (err) {
        console.error('Error fetching all claims:', err.message);
        res.status(500).send('Server Error');
    }
};

/**
 * @desc    Update the status of an insurance claim (Admin only)
 * @route   PUT /api/claims/:id/status
 * @access  Private (Admin)
 */
exports.updateClaimStatus = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'User not authorized' });
        }

        const { status } = req.body;

        // --- Validate status values ---
        const validStatuses = ['Pending', 'In Review', 'Approved', 'Rejected'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ msg: 'Invalid status value.' });
        }

        const claim = await Claim.findById(req.params.id);
        if (!claim) {
            return res.status(404).json({ msg: 'Claim not found.' });
        }

        claim.status = status;
        await claim.save();

        // TODO: Optionally send email notification to patient about status update
        // Example: sendEmail(claim.patient.email, `Your claim status is now ${status}`);

        res.json({
            msg: 'Claim status updated successfully.',
            claim,
        });
    } catch (err) {
        console.error('Error updating claim status:', err.message);
        res.status(500).send('Server Error');
    }
};
