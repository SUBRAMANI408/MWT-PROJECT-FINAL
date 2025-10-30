const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // This is the corrected transporter configuration
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: `SmartHealth <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.response);
    } catch (error) {
        console.error('Error sending email:', error);
        // We re-throw the error so the calling function knows something went wrong
        throw new Error('Email could not be sent');
    }
};

module.exports = sendEmail;