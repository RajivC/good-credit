// pages/api/contact.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  // Configure Nodemailer to use Mandrill SMTP
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,       // e.g. smtp.mandrillapp.com
    port: Number(process.env.SMTP_PORT), // e.g. 587
    auth: {
      user: process.env.SMTP_USER,     // e.g. "WEI HOLDINGS"
      pass: process.env.SMTP_PASS,     // your Mandrill API key (md-xxx)
    },
  });

  try {
    await transporter.sendMail({
      from:    email,                       // email the user entered
      to:      process.env.CONTACT_TO_EMAIL, // your inbox address
      subject: `Contact Form: ${name}`,
      text:    message,
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Error sending email:', err);
    return res.status(500).json({ error: 'Email send failed' });
  }
}