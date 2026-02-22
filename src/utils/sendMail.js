require('dotenv').config();
const nodemailer = require('nodemailer');

const MAIL_SETTINGS = {
  service: 'gmail',
  auth: {
    user: process.env.MAIL_EMAIL,
    pass: process.env.MAIL_PASSWORD,
  },
};

const transporter = nodemailer.createTransport(MAIL_SETTINGS);

module.exports.sendMail = async ({ to, OTP }) => {
  try {
    const info = await transporter.sendMail({
      from: `"MocklyAI" <${MAIL_SETTINGS.auth.user}>`,
      to,
      subject: 'MocklyAI Verification Code',
      html: `
          <div style="max-width: 600px; margin: auto; padding: 20px; font-family: Arial, sans-serif; background-color: #f9f9f9; border: 1px solid #e0e0e0; border-radius: 10px;">
            <div style="text-align: center; padding-bottom: 20px;">
              <h2 style="color: #333;">Welcome to MocklyAI</h2>
              <p style="color: #555; font-size: 16px;">Your One-Time (OTP) is:</p>
            </div>
            <div style="background-color: #fff; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h1 style="font-size: 36px; color: #1a73e8; letter-spacing: 2px; margin: 0;">
                ${OTP}
              </h1>
            </div>
            <p style="color: #777; font-size: 14px; text-align: center; margin-top: 20px;">
              This code will expire shortly. If you did not request this, please ignore this email.
            </p>
          </div>
      `,
    });

    return info;
  } catch (error) {
    console.error('Mail Error:', error.message);
    return false;
  }
};
