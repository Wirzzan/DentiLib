const nodemailer = require("nodemailer");
require("dotenv").config();

const isTest = process.env.NODE_ENV === "test";

const transporter = nodemailer.createTransport(
  isTest
    ? {
        host: "127.0.0.1",
        port: 1025,
        secure: false,
      }
    : {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: false,
        requireTLS: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      }
);

const sendMail = async (to, subject, html) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
};

module.exports = { sendMail };
