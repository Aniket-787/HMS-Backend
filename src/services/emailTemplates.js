// Email templates for the Hospital Management System

const getHospitalName = (hospitalId) => {
  // This will be passed from the controller
  return hospitalId?.name || "our Hospital";
};

// ============================================
// APPOINTMENT REQUEST TEMPLATES
// ============================================

const appointmentRequestReceived = (data) => {
  const { name, email, appointmentDate, hospitalName, symptoms } = data;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Appointment Request Received</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f7fa;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f7fa; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Appointment Request Received</h1>
                  <p style="color: #bfdbfe; margin: 10px 0 0 0; font-size: 16px;">${hospitalName || 'Healthcare Center'}</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 22px;">Dear ${name},</h2>
                  
                  <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                    Thank you for booking an appointment with <strong>${hospitalName || 'our healthcare facility'}</strong>. We have received your appointment request and it is currently under review.
                  </p>
                  
                  <!-- Appointment Details Card -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; margin: 20px 0;">
                    <tr>
                      <td style="padding: 20px;">
                        <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px;">Appointment Details</h3>
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Requested Date</td>
                            <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">${new Date(appointmentDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                          </tr>
                          ${symptoms ? `
                          <tr>
                            <td style="padding: 8px 0; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb;">Symptoms/Reason</td>
                            <td style="padding: 8px 0; color: #1f2937; font-size: 14px; text-align: right; border-top: 1px solid #e5e7eb;">${symptoms}</td>
                          </tr>
                          ` : ''}
                        </table>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 20px 0;">
                    <strong>What happens next?</strong><br>
                    Our medical team will review your request and confirm your appointment within 24-48 hours. You will receive an email notification once your appointment is approved.
                  </p>
                  
                  <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                    <p style="margin: 0; color: #92400e; font-size: 14px;">
                      <strong>Note:</strong> Please arrive 15 minutes before your scheduled appointment time. Bring any relevant medical records or previous prescriptions.
                    </p>
                  </div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 20px 30px; border-radius: 0 0 12px 12px; text-align: center;">
                  <p style="color: #6b7280; font-size: 12px; margin: 0;">
                    This is an automated message. Please do not reply to this email.<br>
                    © ${new Date().getFullYear()} ${hospitalName || 'Healthcare Center'}. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

const appointmentApproved = (data) => {
  const { name, email, appointmentDate, hospitalName, tokenNumber, doctorName, amount } = data;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Appointment Confirmed</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f7fa;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f7fa; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <!-- Header with Success Icon -->
              <tr>
                <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                  <div style="width: 60px; height: 60px; background-color: #ffffff; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Appointment Confirmed!</h1>
                  <p style="color: #a7f3d0; margin: 10px 0 0 0; font-size: 16px;">${hospitalName || 'Healthcare Center'}</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 22px;">Dear ${name},</h2>
                  
                  <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                    Great news! Your appointment has been <strong style="color: #10b981;">confirmed</strong>. We look forward to seeing you.
                  </p>
                  
                  <!-- Token & Appointment Card -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 12px; margin: 25px 0; border: 1px solid #bae6fd;">
                    <tr>
                      <td style="padding: 25px; text-align: center;">
                        <p style="color: #0369a1; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">Your Token Number</p>
                        <p style="color: #0284c7; font-size: 48px; font-weight: 700; margin: 0; line-height: 1;">#${tokenNumber}</p>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Details Grid -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; margin: 20px 0;">
                    <tr>
                      <td style="padding: 20px;">
                        <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px;">Appointment Information</h3>
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding: 10px 0; color: #6b7280; font-size: 14px; border-bottom: 1px solid #e5e7eb;">Date</td>
                            <td style="padding: 10px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${new Date(appointmentDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                          </tr>
                          <tr>
                            <td style="padding: 10px 0; color: #6b7280; font-size: 14px; border-bottom: 1px solid #e5e7eb;">Time</td>
                            <td style="padding: 10px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${new Date(appointmentDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</td>
                          </tr>
                          ${doctorName ? `
                          <tr>
                            <td style="padding: 10px 0; color: #6b7280; font-size: 14px; border-bottom: 1px solid #e5e7eb;">Doctor</td>
                            <td style="padding: 10px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">Dr. ${doctorName}</td>
                          </tr>
                          ` : ''}
                          ${amount !== undefined && amount > 0 ? `
                          <tr>
                            <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Consultation Fee</td>
                            <td style="padding: 10px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">₹${amount}</td>
                          </tr>
                          ` : ''}
                        </table>
                      </td>
                    </tr>
                  </table>
                  
                  <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                    <p style="margin: 0; color: #065f46; font-size: 14px;">
                      <strong>Important:</strong> Please arrive 15 minutes early. Bring this email confirmation, a valid ID, and any medical records or prescriptions you may have.
                    </p>
                  </div>
                  
                  <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                    If you need to reschedule or cancel your appointment, please contact us at least 24 hours in advance.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 20px 30px; border-radius: 0 0 12px 12px; text-align: center;">
                  <p style="color: #6b7280; font-size: 12px; margin: 0;">
                    This is an automated message. Please do not reply to this email.<br>
                    © ${new Date().getFullYear()} ${hospitalName || 'Healthcare Center'}. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

const appointmentRejected = (data) => {
  const { name, email, appointmentDate, hospitalName} = data;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Appointment Update</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f7fa;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f7fa; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                  <div style="width: 60px; height: 60px; background-color: #ffffff; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                  </div>
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Appointment Update</h1>
                  <p style="color: #d1d5db; margin: 10px 0 0 0; font-size: 16px;">${hospitalName || 'Healthcare Center'}</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 22px;">Dear ${name},</h2>
                  
                  <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                    Thank you for considering <strong>${hospitalName || 'our healthcare facility'}</strong> for your medical needs. Unfortunately, we are unable to process your appointment request at this time.
                  </p>
                  
                  <!-- Original Request Details -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; margin: 20px 0;">
                    <tr>
                      <td style="padding: 20px;">
                        <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px;">Original Request Details</h3>
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Requested Date</td>
                            <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">${appointmentDate ? new Date(appointmentDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 20px 0;">
                    <strong>What can you do next?</strong><br>
                    • Try booking for a different date or time<br>
                    • Contact us directly for assistance<br>
                    • Visit us during our working hours
                  </p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="#" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">Book New Appointment</a>
                  </div>
                  
                  <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                    We apologize for any inconvenience. Please don't hesitate to reach out if you have any questions.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 20px 30px; border-radius: 0 0 12px 12px; text-align: center;">
                  <p style="color: #6b7280; font-size: 12px; margin: 0;">
                    This is an automated message. Please do not reply to this email.<br>
                    © ${new Date().getFullYear()} ${hospitalName || 'Healthcare Center'}. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

// ============================================
// EXPORT ALL TEMPLATES
// ============================================

module.exports = {
  appointmentRequestReceived,
  appointmentApproved,
  appointmentRejected,
};