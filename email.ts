import { createTransport, getTestMessageUrl, createTestAccount } from 'nodemailer'; // Add createTestAccount

// Create a test SMTP transporter using Ethereal for development

export async function createTransporter() {
  // For testing, use Ethereal (generates temporary credentials)
  const testAccount = await createTestAccount();
  return createTransport({
    // host: 'smtp.ethereal.email',
    // port: 587,
    service: 'gmail', // Use Gmail for sending emails
    secure: false, // true for 465, false for other ports
    auth: {
      user: "vallimangai94@gmail.com", // e.g., user@ethereal.email
      pass: "ghpi posv caxr arso",
    },
  });
}

// Send email function
export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html?: string
) {
  const transporter = await createTransporter();
  const mailOptions = {
    from: '"Employee Recognition API" <no-reply@company.com>',
    to,
    subject,
    text,
    html,
  };
  const info = await transporter.sendMail(mailOptions);
  console.log('Email sent:', info.messageId);
  // Log preview URL for Ethereal
  console.log('Preview URL:', getTestMessageUrl(info));
}