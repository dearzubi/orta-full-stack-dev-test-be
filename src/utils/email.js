import { createTransport } from "nodemailer";
import * as process from "node:process";
import { AppError } from "./errors/app.error.js";

const transporter = createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USERNAME,
    pass: process.env.GMAIL_PASSWORD,
  },
});

/**
 * Send an email using nodemailer and gmail SMTP
 * @param {string} to - recipient email address
 * @param subject - email subject
 * @param html - email body in HTML format
 * @throws {AppError} If there is an error sending the email
 */
export const sendEmail = async (to, subject, html) => {
  if (process.env.NODE_ENV === "test") {
    console.log(`Mock email sent to: ${to}, subject: ${subject}`);
    return;
  }

  const mailOptions = {
    from: process.env.SUPPORT_EMAIL,
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions, function (error, _info) {
    if (error) {
      throw new AppError({
        message: "Error sending email",
        statusCode: 500,
        errorCode: "EMAIL_SEND_ERROR",
        cause: error,
      });
    }
  });
};
