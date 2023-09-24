import nodemailer from 'nodemailer';

async function sendEmail (options) {
    // 1- create transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    // 2- define the email options
    const mailOptions = {
        from: 'TABISH JAVED <tabish@yahoo.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    // send email
    await transporter.sendMail(mailOptions);
}

export default sendEmail;