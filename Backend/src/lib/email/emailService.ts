import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import fs from 'fs'; // Import Node.js file system module
import path from 'path'; // Import Node.js path module

dotenv.config();
// Configure your email transporter (replace with your actual SMTP settings or environment variables)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com", // e.g., "smtp.gmail.com"
  port: parseInt(process.env.SMTP_PORT || "587"), // e.g., 587 for TLS, 465 for SSL
  secure: process.env.SMTP_SECURE === 'true' || false, // Use true for 465, false for other ports (STARTTLS)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  },
});

// Helper function to read email templates
const readEmailTemplate = (templateName: string, replacements: { [key: string]: string | number }) => {
  const templatePath = path.join(__dirname, 'templates', `${templateName}.html`);
  let html = fs.readFileSync(templatePath, 'utf8');
  for (const key in replacements) {
    html = html.replace(new RegExp(`{{${key}}}`, 'g'), String(replacements[key]));
  }
  return html;
};

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

async function sendEmail(options: EmailOptions) {
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Inventory Manager" <shresthasagar657@gmail.com>', // Sender address
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html || `<p>${options.text}</p>`, // Default to text in HTML if html is not provided
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Error sending email to ${options.to}:`, error);
  }
}

export const sendRegistrationOtp = async (email: string, otp: string) => {
  const subject = 'Verify Your Inventory Manager Account';
  const html = readEmailTemplate('registrationOtp', { otp, year: new Date().getFullYear() });
  await sendEmail({ to: email, subject, text: `Your OTP is: ${otp}`, html });
};

export const sendSuccessfulRegistration = async (email: string, username: string) => {
  const subject = 'Welcome to Inventory Manager!';
  const loginLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`;
  const html = readEmailTemplate('successfulRegistration', { username, loginLink, year: new Date().getFullYear() });
  await sendEmail({ to: email, subject, text: `Welcome ${username}! Your registration is complete.`, html });
};

export const sendForgotPasswordOtp = async (email: string, otp: string) => {
  const subject = 'Inventory Manager Password Reset OTP';
  const resetPasswordLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password`; // Assuming frontend route
  const html = readEmailTemplate('forgotPasswordOtp', { otp, resetPasswordLink, year: new Date().getFullYear() });
  await sendEmail({ to: email, subject, text: `Your password reset OTP is: ${otp}`, html });
};

export const sendPasswordResetConfirmation = async (email: string) => {
  const subject = 'Inventory Manager Password Reset Successful';
  const loginLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`;
  const html = readEmailTemplate('passwordResetConfirmation', { loginLink, year: new Date().getFullYear() });
  await sendEmail({ to: email, subject, text: 'Your password has been successfully reset.', html });
};
