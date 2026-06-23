// frontend/api/send-otp-email.js
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Create a transporter using Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,    // Your Gmail address
        pass: process.env.GMAIL_PASS,    // The App Password you generated
      },
    });

    // Email HTML content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; background: #0a0a0f; color: white; padding: 20px; max-width: 500px; margin: 0 auto; border-radius: 15px; border: 1px solid #2a2a4a;">
        <h1 style="color: #fbbf24; text-align: center;">🔐 Your OTP Code</h1>
        <div style="background: #1a1a2e; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0; border: 1px solid #2a2a4a;">
          <span style="font-size: 36px; font-weight: bold; color: #8b5cf6; letter-spacing: 8px;">${otp}</span>
        </div>
        <p style="color: #94a3b8; text-align: center; font-size: 14px;">This OTP is valid for <strong>5 minutes</strong>.</p>
        <p style="color: #64748b; text-align: center; font-size: 12px;">If you didn't request this, please ignore this email.</p>
      </div>
    `;

    // Send email
    await transporter.sendMail({
      from: `"Kaira Yadav Platform" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Your OTP Code',
      html: htmlContent,
    });

    // Return the OTP to store temporarily
    res.status(200).json({ success: true, otp: otp });

  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ error: 'Failed to send OTP. Please try again later.' });
  }
}