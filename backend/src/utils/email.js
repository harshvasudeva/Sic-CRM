const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email error:', error);
    throw error;
  }
};

const sendWelcomeEmail = async (email, name) => {
  const html = `
    <h2>Welcome to Sic CRM!</h2>
    <p>Hello ${name},</p>
    <p>Welcome to Sic CRM! Your account has been successfully created.</p>
    <p>You can now login and start managing your business operations.</p>
    <p>Best regards,<br>Sic CRM Team</p>
  `;

  return sendEmail({
    to: email,
    subject: 'Welcome to Sic CRM',
    html,
  });
};

const sendInvoiceEmail = async (email, invoiceNumber, total) => {
  const html = `
    <h2>Invoice Created</h2>
    <p>Hello,</p>
    <p>A new invoice <strong>${invoiceNumber}</strong> has been created for your account.</p>
    <p><strong>Total Amount:</strong> $${total}</p>
    <p>Please log in to view the invoice details.</p>
    <p>Best regards,<br>Sic CRM Team</p>
  `;

  return sendEmail({
    to: email,
    subject: `Invoice ${invoiceNumber} Created`,
    html,
  });
};

const sendQuotationEmail = async (email, quotationNumber) => {
  const html = `
    <h2>New Quotation Received</h2>
    <p>Hello,</p>
    <p>A new quotation <strong>${quotationNumber}</strong> has been sent to you.</p>
    <p>Please log in to view the quotation details and accept or decline it.</p>
    <p>Best regards,<br>Sic CRM Team</p>
  `;

  return sendEmail({
    to: email,
    subject: `Quotation ${quotationNumber} Received`,
    html,
  });
};

const sendPurchaseOrderEmail = async (email, orderNumber) => {
  const html = `
    <h2>Purchase Order Created</h2>
    <p>Hello,</p>
    <p>A new purchase order <strong>${orderNumber}</strong> has been created.</p>
    <p>Please log in to view the order details and update the status.</p>
    <p>Best regards,<br>Sic CRM Team</p>
  `;

  return sendEmail({
    to: email,
    subject: `Purchase Order ${orderNumber} Created`,
    html,
  });
};

const sendReminderEmail = async (email, type, reference) => {
  const html = `
    <h2>Reminder</h2>
    <p>Hello,</p>
    <p>This is a reminder regarding your ${type}: <strong>${reference}</strong>.</p>
    <p>Please log in to view details and take necessary action.</p>
    <p>Best regards,<br>Sic CRM Team</p>
  `;

  return sendEmail({
    to: email,
    subject: `Reminder: ${type} ${reference}`,
    html,
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendInvoiceEmail,
  sendQuotationEmail,
  sendPurchaseOrderEmail,
  sendReminderEmail,
};
