const axios = require('axios');

// This is the Spoonacular API endpoint for image analysis
const API_URL = 'https://api.spoonacular.com/food/images/analyze';

exports.scanImage = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ msg: 'No image file uploaded.' });
    }

    try {
        // The image URL from Cloudinary
        const imageUrl = req.file.path;

        // Make the API call to Spoonacular
        const response = await axios.get(API_URL, {
            params: {
                apiKey: process.env.SPOONACULAR_API_KEY,
                imageUrl: imageUrl,
            }
        });

        // Check if Spoonacular found nutritional info
        if (response.data && response.data.nutrition && response.data.nutrition.calories) {
            const nutrition = response.data.nutrition;
            // Send the formatted data back to the frontend
            res.json({
                food_name: response.data.category.name,
                calories: nutrition.calories.value,
                protein_g: nutrition.protein.value,
                fat_total_g: nutrition.fat.value,
                carbohydrates_total_g: nutrition.carbs.value,
            });
        } else {
            return res.status(404).json({ msg: 'Could not find nutritional information for this image.' });
        }

    } catch (error) {
        console.error('Spoonacular API Error:', error.response ? error.response.data : error.message);
        res.status(500).send('Failed to analyze image with the nutrition service.');
    }
};