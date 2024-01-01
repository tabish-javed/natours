import path from 'path';
import { fileURLToPath } from 'url';
import pug from 'pug';
import nodemailer from 'nodemailer';
import { htmlToText } from 'html-to-text';

// creating "__dirname" variable (unavailable by default in ES6 module system)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `${process.env.EMAIL_SENDER} ${process.env.EMAIL_FROM}`;
    }

    makeTransport () {
        if (process.env.NODE_ENV === 'production') {
            // Yahoo Configured => To FIX ("There was an error sending the email. Try again later!")
            return nodemailer.createTransport({
                host: process.env.PRD_EMAIL_HOST,
                port: process.env.PRD_EMAIL_PORT,
                secure: false,
                auth: {
                    user: process.env.PRD_EMAIL_USERNAME,
                    pass: process.env.PRD_EMAIL_PASSWORD
                }
            });
        }

        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    async send (template, subject) {
        // 1- render HTML based on a pug template
        const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
            firstName: this.firstName,
            url: this.url,
            subject: subject
        });

        // 2- define email options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject: subject,
            html: html,
            text: htmlToText(html, { wordwrap: 120 }),
        };

        // 3- create a transport and send email
        await this.makeTransport().sendMail(mailOptions);
    }

    async sendWelcome () {
        await this.send('welcome', 'Welcome to the Natours Family!');
    }

    async sendPasswordReset () {
        await this.send('passwordReset', 'Your password reset token (valid only for 10 minutes)');
    }
}


export default Email;