// This is the "mock" or "simulation" controller for the AI Symptom Checker.
// It now checks for keywords to provide different responses.

exports.symptomCheck = async (req, res) => {
    const { symptoms } = req.body;
    const lowerCaseSymptoms = symptoms.toLowerCase();
    
    console.log(`Simulating AI analysis for symptoms: "${symptoms}"`);

    let fakeAnalysis = '';

    // --- NEW: Keyword-based logic ---

    if (lowerCaseSymptoms.includes('headache') || lowerCaseSymptoms.includes('migraine')) {
        // --- Headache Response ---
        fakeAnalysis = `
            Based on your symptoms (headache), here is a preliminary analysis:

            1.  Possible Conditions:
                * Tension Headache
                * Migraine
                * Dehydration

            2.  Recommended Specialist:
                * You should consult a **General Physician** or a **Neurologist** for these symptoms.

            3.  Important Disclaimer:
                * This is a preliminary analysis and not a medical diagnosis. Please consult a qualified healthcare professional for an accurate diagnosis and treatment plan.
        `;

    } else if (lowerCaseSymptoms.includes('stomach') || lowerCaseSymptoms.includes('nausea') || lowerCaseSymptoms.includes('diarrhea')) {
        // --- Stomach Response ---
        fakeAnalysis = `
            Based on your symptoms (stomach pain), here is a preliminary analysis:

            1.  Possible Conditions:
                * Gastroenteritis (Stomach Flu)
                * Acid Reflux (GERD)
                * Food Poisoning

            2.  Recommended Specialist:
                * You should consult a **General Physician** or a **Gastroenterologist**.

            3.  Important Disclaimer:
                * This is a preliminary analysis and not a medical diagnosis. Please consult a qualified healthcare professional for an accurate diagnosis and treatment plan.
        `;

    } else if (lowerCaseSymptoms.includes('knee') || lowerCaseSymptoms.includes('joint pain')) {
        // --- Knee/Joint Response ---
        fakeAnalysis = `
            Based on your symptoms (knee pain), here is a preliminary analysis:

            1.  Possible Conditions:
                * Sprain or Strain
                * Arthritis
                * Meniscus Tear

            2.  Recommended Specialist:
                * You should consult an **Orthopedic Surgeon** or a **Physiotherapist**.

            3.  Important Disclaimer:
                * This is a preliminary analysis and not a medical diagnosis. Please consult a qualified healthcare professional for an accurate diagnosis and treatment plan.
        `;

    } else {
        // --- Default Response (if no keywords match) ---
        fakeAnalysis = `
            Based on your symptoms, here is a preliminary analysis:

            1.  Possible Conditions:
                * Common Cold
                * Influenza (Flu)
                * Allergic Rhinitis

            2.  Recommended Specialist:
                * You should consult a **General Physician** for these symptoms.

            3.  Important Disclaimer:
                * This is a preliminary analysis and not a medical diagnosis. Please consult a qualified healthcare professional for an accurate diagnosis and treatment plan.
        `;
    }

    // We use a timeout to simulate the delay of a real AI API call
    setTimeout(() => {
        res.json({ analysis: fakeAnalysis.trim() });
    }, 1500); // Wait for 1.5 seconds before sending the response
};