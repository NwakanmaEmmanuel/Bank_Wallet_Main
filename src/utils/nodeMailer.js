import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Send an email with a password reset link to the recipient
export async function sendEmail(recipient, token) {
  console.log(token);
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER  ,
    to: recipient,
    subject: "PASSWORD RESET",
    text: `Here is the link to reset your password
    localhost:6000/authUser/reset-password/${token}
    NOTE: This link expires in 1 hour
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.log(error);
    throw new Error("Email could not be sent.");
  }
}

// Send a registration success email to the recipient
export async function sendRegisterEmail(recipient) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER  ,
    to: recipient,
    subject: "REGISTRATION SUCCESSFUL",
    text: "Thank you for registering with DANNY PHATHOM TESTS",
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.log(error);
    throw new Error("Email could not be sent.");
  }
}

export async function sendAdminRegisterEmail(recipient) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER  ,
    to: recipient,
    subject: "ADMIN REGISTRATION SUCCESSFUL",
    text: "Thank you for registering as an admin with DANNY PHATHOM TESTS",
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.log(error);
    throw new Error("Email could not be sent.");
  }
}

export async function sendAdminRegisterTokenEmail(recipient, token) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER  ,
    to: recipient,
    subject: "USE THE TOKEN BELOW TO COMPLETE ADMIN REGISTRATION",
    text: `token: ${token}`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.log(error);
    throw new Error("Email could not be sent.");
  }
}
