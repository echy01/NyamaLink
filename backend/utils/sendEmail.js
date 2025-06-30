import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_SENDER,
    pass: process.env.EMAIL_PASS, 
  },
});

const sendEmail = async ({ to, subject, text }) => {
  await transporter.sendMail({
    from: `"NyamaLink Support" <${process.env.EMAIL_SENDER}>`,
    to,
    subject,
    text,
  });
};

export default sendEmail;
