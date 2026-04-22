// src/services/emailService.js
// Importing nodemailer for email delivery
const nodemailer = require("nodemailer");

// Configuring Gmail SMTP transporter for sending emails
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Defining welcome email template function
/**
 * Welcome email after successful registration
 */
const getWelcomeEmailTemplate = (userName, userRole) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to myRentals!</h1>
        </div>
        <div class="content">
          <h2>Hi ${userName},</h2>
          <p>Thank you for joining myRentals as a <strong>${userRole}</strong>!</p>
          
          ${
            userRole === "tenant"
              ? `
          <p>You can now:</p>
          <ul>
            <li>Browse available rooms in your area</li>
            <li>Book rooms securely for at least one month</li>
            <li>Manage your rentals from your dashboard</li>
            <li>Save your favorite listings</li>
          </ul>
          `
              : userRole === "owner"
                ? `
          <p>You can now:</p>
          <ul>
            <li>List your rooms and properties</li>
            <li>Manage rental requests</li>
            <li>Track your bookings and revenue</li>
            <li>Update property details anytime</li>
          </ul>
          `
                : `
          <p>As an admin, you have full access to manage the platform, users, and all listings.</p>
          `
          }
          
          <p style="text-align: center;">
            <a href="${process.env.CLIENT_URL || "http://localhost:3000"}/login" class="button">Get Started</a>
          </p>
          
          <p>If you have any questions, feel free to contact our support team.</p>
          
          <p>Best regards,<br>The myRentals Team</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} myRentals. All rights reserved.</p>
          <p>Pokhara, Nepal</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Defining password reset email template function
/**
 * Password reset email template
 */
const getPasswordResetEmailTemplate = (userName, resetLink) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        .warning { background: #fee2e2; border-left: 4px solid #ef4444; padding: 12px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Hi ${userName},</h2>
          <p>We received a request to reset your password for your myRentals account.</p>
          
          <p style="text-align: center;">
            <a href="${resetLink}" class="button">Reset Password</a>
          </p>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #ef4444;">${resetLink}</p>
          
          <div class="warning">
            <strong>Security Notice:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email and your password will remain unchanged.
          </div>
          
          <p>Best regards,<br>The myRentals Team</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} myRentals. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Defining booking confirmation email template function
/**
 * Booking confirmation email (for tenants)
 */
const getBookingConfirmationEmailTemplate = (
  userName,
  roomTitle,
  roomLocation,
  moveInDate,
  moveOutDate,
  totalPrice,
  bookingId,
) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .booking-details { background: white; border: 2px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-label { font-weight: bold; color: #666; }
        .detail-value { color: #333; }
        .total { background: #dcfce7; padding: 15px; border-radius: 6px; margin-top: 15px; font-size: 18px; font-weight: bold; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Booking Confirmed</h1>
        </div>
        <div class="content">
          <h2>Hi ${userName},</h2>
          <p>Congratulations! Your rental booking has been confirmed. Here are your booking details:</p>
          
          <div class="booking-details">
            <h3 style="margin-top: 0; color: #10b981;">Booking Information</h3>
            
            <div class="detail-row">
              <span class="detail-label">Booking ID:</span>
              <span class="detail-value">#${bookingId}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Room:</span>
              <span class="detail-value">${roomTitle}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Location:</span>
              <span class="detail-value">${roomLocation}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Move-in Date:</span>
              <span class="detail-value">${new Date(moveInDate).toLocaleDateString()}</span>
            </div>
            
            <div class="detail-row" style="border-bottom: none;">
              <span class="detail-label">Move-out Date:</span>
              <span class="detail-value">${new Date(moveOutDate).toLocaleDateString()}</span>
            </div>
            
            <div class="total">
              Total Amount Paid: Rs ${totalPrice.toLocaleString()}
            </div>
          </div>
          
          <p><strong>Important Information:</strong></p>
          <ul>
            <li>Please save this email for your records</li>
            <li>Contact the property owner before your move-in date</li>
            <li>You can view your receipt in the tenant dashboard</li>
            <li>For any issues, contact our support team</li>
          </ul>
          
          <p style="text-align: center;">
            <a href="${process.env.CLIENT_URL || "http://localhost:3000"}/tenant/dashboard" class="button">View My Rentals</a>
          </p>
          
          <p>We hope you enjoy your stay!</p>
          
          <p>Best regards,<br>The myRentals Team</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} myRentals. All rights reserved.</p>
          <p>Need help? Contact us at ${process.env.EMAIL_USER}</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Defining new booking notification template for property owners
/**
 * New booking request notification (for owners)
 */
const getNewBookingRequestEmailTemplate = (
  ownerName,
  tenantName,
  roomTitle,
  moveInDate,
  moveOutDate,
  totalPrice,
) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .info-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Booking Request</h1>
        </div>
        <div class="content">
          <h2>Hi ${ownerName},</h2>
          <p>You have received a new booking request for your property!</p>
          
          <div class="info-box">
            <strong>Booking Details:</strong><br>
            <strong>Room:</strong> ${roomTitle}<br>
            <strong>Tenant:</strong> ${tenantName}<br>
            <strong>Move-in Date:</strong> ${new Date(moveInDate).toLocaleDateString()}<br>
            <strong>Move-out Date:</strong> ${new Date(moveOutDate).toLocaleDateString()}<br>
            <strong>Total Amount:</strong> Rs ${totalPrice.toLocaleString()}
          </div>
          
          <p>The tenant has completed the payment. The booking is now confirmed automatically.</p>
          
          <p style="text-align: center;">
            <a href="${process.env.CLIENT_URL || "http://localhost:3000"}/owner/dashboard" class="button">View Dashboard</a>
          </p>
          
          <p>Best regards,<br>The myRentals Team</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} myRentals. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Defining password reset success confirmation template
/**
 * Password reset success confirmation email
 */
const getPasswordResetSuccessEmailTemplate = (userName) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .success-box { background: #dcfce7; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Successful</h1>
        </div>
        <div class="content">
          <h2>Hi ${userName},</h2>
          <p>Your password has been successfully reset!</p>
          
          <div class="success-box">
            <strong>What happened:</strong><br>
            Your myRentals account password was changed on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}.
          </div>
          
          <p><strong>Next Steps:</strong></p>
          <ul>
            <li>You can now log in with your new password</li>
            <li>Make sure to keep your password secure</li>
            <li>Don't share your password with anyone</li>
          </ul>
          
          <p>If you did not request this password reset, please contact our support team immediately.</p>
          
          <p style="text-align: center;">
            <a href="${process.env.CLIENT_URL || "http://localhost:3000"}/login" class="button">Go to Login</a>
          </p>
          
          <p>Best regards,<br>The myRentals Team</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} myRentals. All rights reserved.</p>
          <p>Security Notice: Never share your password with anyone.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Sending welcome email after registration
/**
 * Send welcome email after registration
 */
const sendWelcomeEmail = async (userEmail, userName, userRole) => {
  try {
    const mailOptions = {
      from: `"myRentals" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: "Welcome to myRentals",
      html: getWelcomeEmailTemplate(userName, userRole),
    };

    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${userEmail}`);
    return { success: true };
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return { success: false, error: error.message };
  }
};

// Sending password reset email with token link
/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (userEmail, userName, resetToken) => {
  try {
    const resetLink = `${process.env.CLIENT_URL || "http://localhost:3000"}/reset-password/${resetToken}`;

    const mailOptions = {
      from: `"myRentals" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: "Password Reset Request",
      html: getPasswordResetEmailTemplate(userName, resetLink),
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${userEmail}`);
    return { success: true };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return { success: false, error: error.message };
  }
};

// Sending booking confirmation email to tenant
/**
 * Send booking confirmation email to tenant
 */
const sendBookingConfirmationEmail = async (
  tenantEmail,
  tenantName,
  roomTitle,
  roomLocation,
  moveInDate,
  moveOutDate,
  totalPrice,
  bookingId,
) => {
  try {
    const mailOptions = {
      from: `"myRentals" <${process.env.EMAIL_USER}>`,
      to: tenantEmail,
      subject: "Booking Confirmed",
      html: getBookingConfirmationEmailTemplate(
        tenantName,
        roomTitle,
        roomLocation,
        moveInDate,
        moveOutDate,
        totalPrice,
        bookingId,
      ),
    };

    await transporter.sendMail(mailOptions);
    console.log(`Booking confirmation sent to ${tenantEmail}`);
    return { success: true };
  } catch (error) {
    console.error("Error sending booking confirmation:", error);
    return { success: false, error: error.message };
  }
};

// Sending booking notification to property owner
/**
 * Send new booking notification to owner
 */
const sendNewBookingNotificationEmail = async (
  ownerEmail,
  ownerName,
  tenantName,
  roomTitle,
  moveInDate,
  moveOutDate,
  totalPrice,
) => {
  try {
    const mailOptions = {
      from: `"myRentals" <${process.env.EMAIL_USER}>`,
      to: ownerEmail,
      subject: "New Booking Request",
      html: getNewBookingRequestEmailTemplate(
        ownerName,
        tenantName,
        roomTitle,
        moveInDate,
        moveOutDate,
        totalPrice,
      ),
    };

    await transporter.sendMail(mailOptions);
    console.log(`New booking notification sent to ${ownerEmail}`);
    return { success: true };
  } catch (error) {
    console.error("Error sending booking notification:", error);
    return { success: false, error: error.message };
  }
};

// Sending password reset success confirmation email
/**
 * Send password reset success email
 */
const sendPasswordResetSuccessEmail = async (userEmail, userName) => {
  try {
    const mailOptions = {
      from: `"myRentals" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: "Password Reset Successful",
      html: getPasswordResetSuccessEmailTemplate(userName),
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset success email sent to ${userEmail}`);
    return { success: true };
  } catch (error) {
    console.error("Error sending password reset success email:", error);
    return { success: false, error: error.message };
  }
};

// Defining room approval notification template
/**
 * Room approval email template
 */
const getRoomApprovedEmailTemplate = (ownerName, roomTitle, roomId) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .success-box { background: #dcfce7; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Room Approved!</h1>
        </div>
        <div class="content">
          <h2>Hi ${ownerName},</h2>
          <p>Great news! Your room has been approved and is now live on myRentals.</p>
          
          <div class="success-box">
            <strong>Room Details:</strong><br>
            <strong>Title:</strong> ${roomTitle}<br>
            <strong>Room ID:</strong> ${roomId}
          </div>
          
          <p><strong>Next Steps:</strong></p>
          <ul>
            <li>Your room is now visible to tenants</li>
            <li>You can manage booking requests from your dashboard</li>
            <li>Monitor tenant inquiries regularly</li>
            <li>Respond promptly to booking requests</li>
          </ul>
          
          <p style="text-align: center;">
            <a href="${process.env.CLIENT_URL || "http://localhost:3000"}/owner/dashboard" class="button">Go to Dashboard</a>
          </p>
          
          <p>Thank you for listing with myRentals!</p>
          
          <p>Best regards,<br>The myRentals Team</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} myRentals. All rights reserved.</p>
          <p>Need help? Contact us at ${process.env.EMAIL_USER}</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Sending room approval notification to owner
/**
 * Send room approval email to owner
 */
const sendRoomApprovedEmail = async (
  ownerEmail,
  ownerName,
  roomTitle,
  roomId,
) => {
  try {
    const mailOptions = {
      from: `"myRentals" <${process.env.EMAIL_USER}>`,
      to: ownerEmail,
      subject: "Your Room Has Been Approved!",
      html: getRoomApprovedEmailTemplate(ownerName, roomTitle, roomId),
    };

    await transporter.sendMail(mailOptions);
    console.log(`Room approval email sent to ${ownerEmail}`);
    return { success: true };
  } catch (error) {
    console.error("Error sending room approval email:", error);
    return { success: false, error: error.message };
  }
};

// Exporting email service functions and transporter
module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPasswordResetSuccessEmail,
  sendRoomApprovedEmail,
  sendBookingConfirmationEmail,
  sendNewBookingNotificationEmail,
  transporter,
};
