import nodemailer from 'nodemailer';


const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});


export async function sendRegistrationEmail(to, eventTitle) {
    try {
        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: to,
            subject: `Registration Confirmed: ${eventTitle}`,
            text: `You have successfully registered for "${eventTitle}".`
        });
        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error("Email failed:", error.message);
        // Don't throw — email failure shouldn't break the API response
    }
}
