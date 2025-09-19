import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const registrationOtpTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Account</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #6a1b9a; /* Deep Purple */
            color: #ffffff;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .content {
            padding: 20px;
            text-align: center;
        }
        .otp-code {
            font-size: 2em;
            font-weight: bold;
            color: #ffb300; /* Amber */
            margin: 20px 0;
            padding: 10px;
            border: 2px dashed #ffb300;
            display: inline-block;
            border-radius: 5px;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 0.9em;
            color: #777777;
        }
        .button {
            display: inline-block;
            background-color: #6a1b9a;
            color: #ffffff;
            padding: 10px 20px;
            margin-top: 20px;
            border-radius: 5px;
            text-decoration: none;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Inventory Manager</h1>
        </div>
        <div class="content">
            <h2>Email Verification</h2>
            <p>Hello,</p>
            <p>Thank you for registering with Inventory Manager. Please use the One-Time Password (OTP) below to verify your account:</p>
            <div class="otp-code">{{otp}}</div>
            <p>This OTP is valid for <strong>1 hour</strong>.</p>
            <p>If you did not request this, please ignore this email.</p>
            <a href="{{verificationLink}}" class="button">Verify Account</a>
        </div>
        <div class="footer">
            <p>&copy; {{year}} Inventory Manager. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
const forgotPasswordOtpTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset OTP</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #ff5722; /* Deep Orange */
            color: #ffffff;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .content {
            padding: 20px;
            text-align: center;
        }
        .otp-code {
            font-size: 2em;
            font-weight: bold;
            color: #ffb300; /* Amber */
            margin: 20px 0;
            padding: 10px;
            border: 2px dashed #ffb300;
            display: inline-block;
            border-radius: 5px;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 0.9em;
            color: #777777;
        }
        .button {
            display: inline-block;
            background-color: #ff5722;
            color: #ffffff;
            padding: 10px 20px;
            margin-top: 20px;
            border-radius: 5px;
            text-decoration: none;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Inventory Manager</h1>
        </div>
        <div class="content">
            <h2>Password Reset Request</h2>
            <p>Hello,</p>
            <p>We received a request to reset your password. Please use the One-Time Password (OTP) below to proceed with the password reset:</p>
            <div class="otp-code">{{otp}}</div>
            <p>This OTP is valid for <strong>1 hour</strong>.</p>
            <p>If you did not request a password reset, please ignore this email.</p>
            <a href="{{resetPasswordLink}}" class="button">Reset Password</a>
        </div>
        <div class="footer">
            <p>&copy; {{year}} Inventory Manager. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
const passwordResetConfirmationTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Successful</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #4285f4; /* Google Blue */
            color: #ffffff;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .content {
            padding: 20px;
            text-align: center;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 0.9em;
            color: #777777;
        }
        .button {
            display: inline-block;
            background-color: #4285f4;
            color: #ffffff;
            padding: 10px 20px;
            margin-top: 20px;
            border-radius: 5px;
            text-decoration: none;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Inventory Manager</h1>
        </div>
        <div class="content">
            <h2>Password Reset Successful</h2>
            <p>Hello,</p>
            <p>Your password for Inventory Manager has been successfully reset. You can now log in with your new password.</p>
            <a href="{{loginLink}}" class="button">Go to Login</a>
        </div>
        <div class="footer">
            <p>&copy; {{year}} Inventory Manager. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
const successfulRegistrationTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Inventory Manager!</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #4caf50; /* Green */
            color: #ffffff;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .content {
            padding: 20px;
            text-align: center;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 0.9em;
            color: #777777;
        }
        .button {
            display: inline-block;
            background-color: #6a1b9a;
            color: #ffffff;
            padding: 10px 20px;
            margin-top: 20px;
            border-radius: 5px;
            text-decoration: none;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Inventory Manager!</h1>
        </div>
        <div class="content">
            <h2>Registration Successful</h2>
            <p>Hello {{username}},</p>
            <p>Your account with Inventory Manager has been successfully created and verified. You can now log in and start managing your inventory.</p>
            <a href="{{loginLink}}" class="button">Go to Login</a>
        </div>
        <div class="footer">
            <p>&copy; {{year}} Inventory Manager. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;

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

// Helper function to replace placeholders in email templates
const replacePlaceholders = (template: string, replacements: { [key: string]: string | number }) => {
  let html = template;
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
  const html = replacePlaceholders(registrationOtpTemplate, { otp, year: new Date().getFullYear() });
  await sendEmail({ to: email, subject, text: `Your OTP is: ${otp}`, html });
};

export const sendSuccessfulRegistration = async (email: string, username: string) => {
  const subject = 'Welcome to Inventory Manager!';
  const loginLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`;
  const html = replacePlaceholders(successfulRegistrationTemplate, { username, loginLink, year: new Date().getFullYear() });
  await sendEmail({ to: email, subject, text: `Welcome ${username}! Your registration is complete.`, html });
};

export const sendForgotPasswordOtp = async (email: string, otp: string) => {
  const subject = 'Inventory Manager Password Reset OTP';
  const resetPasswordLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password`; // Assuming frontend route
  const html = replacePlaceholders(forgotPasswordOtpTemplate, { otp, resetPasswordLink, year: new Date().getFullYear() });
  await sendEmail({ to: email, subject, text: `Your password reset OTP is: ${otp}`, html });
};

export const sendPasswordResetConfirmation = async (email: string) => {
  const subject = 'Inventory Manager Password Reset Successful';
  const loginLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`;
  const html = replacePlaceholders(passwordResetConfirmationTemplate, { loginLink, year: new Date().getFullYear() });
  await sendEmail({ to: email, subject, text: 'Your password has been successfully reset.', html });
};

const lowStockNotificationTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Low Stock Alert</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #ffcc00; /* Yellow */
            color: #333333;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .content {
            padding: 20px;
            text-align: left;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 0.9em;
            color: #777777;
        }
        .product-info {
            font-size: 1.2em;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Low Stock Alert</h1>
        </div>
        <div class="content">
            <p>Hello,</p>
            <p>This is an alert that the stock for one of your products is running low.</p>
            <div class="product-info">
                <p><strong>Product:</strong> {{productName}}</p>
                <p><strong>SKU:</strong> {{sku}}</p>
                <p><strong>Remaining Quantity:</strong> {{quantity}}</p>
            </div>
            <p>Please restock soon to avoid running out of inventory.</p>
        </div>
        <div class="footer">
            <p>&copy; {{year}} Inventory Manager. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;

export const sendLowStockNotification = async (email: string, productName: string, sku: string, quantity: number) => {
  const subject = `Low Stock Alert for ${productName}`;
  const html = replacePlaceholders(lowStockNotificationTemplate, {
    productName,
    sku,
    quantity,
    year: new Date().getFullYear(),
  });
  await sendEmail({ to: email, subject, text: `Your product ${productName} (SKU: ${sku}) is low on stock. Remaining quantity: ${quantity}`, html });
};
