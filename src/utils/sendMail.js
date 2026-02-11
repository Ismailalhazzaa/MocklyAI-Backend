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
        <div style="max-width: 90%; margin: auto; padding-top: 20px; font-family: Arial;">
          <h2>Welcome to MocklyAI</h2>
          <p>Your One-Time (OTP) is:</p>
          <h1 style="font-size: 40px; letter-spacing: 2px; text-align:center;">
            ${OTP}
          </h1>
          <p>This code will expire shortly.</p>
        </div>
      `,
    });

    return info;
  } catch (error) {
    console.error('Mail Error:', error.message);
    return false;
  }
};
