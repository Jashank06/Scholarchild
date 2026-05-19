/**
 * 🔔 Multi-Channel Notification Engine
 * Intelligently pushes personalized alerts to users (Email, In-App)
 * based on Student DNA match scores.
 */

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send personalized opportunity alerts to a student/parent
 */
async function sendMatchAlert(userEmail, userName, matchedOpportunities) {
  if (!userEmail) return;

  const listHtml = matchedOpportunities.map(opp => `
    <div style="margin-bottom: 20px; padding: 15px; border-left: 4px solid #4F46E5; background: #F3F4F6;">
      <h3 style="margin: 0 0 10px 0;">${opp.title}</h3>
      <p style="margin: 0 0 10px 0;"><strong>Match Score: ${opp.matchScore}%</strong> | Reward: ${opp.rewards?.description || 'N/A'}</p>
      <a href="https://vidyapath.in/opportunities/${opp._id}" style="color: #4F46E5; text-decoration: none; font-weight: bold;">View Details &rarr;</a>
    </div>
  `).join('');

  const mailOptions = {
    from: `"Vidyapath AI" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `🔥 ${matchedOpportunities.length} New High-Match Scholarships for ${userName}`,
    html: `
      <h2>Hello ${userName},</h2>
      <p>Our AI has found new opportunities that perfectly match your Student DNA profile!</p>
      ${listHtml}
      <p>Log in to Vidyapath to apply before the deadlines.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✉️ Alert sent to ${userEmail}`);
  } catch (error) {
    console.error(`Failed to send email to ${userEmail}:`, error.message);
  }
}

async function sendSchoolUpdateRequest(schoolEmail, schoolName, updateUrl) {
  if (!schoolEmail) return;

  const mailOptions = {
    from: `"Vidyapath Portal" <${process.env.EMAIL_USER || 'no-reply@vidyapath.in'}>`,
    to: schoolEmail,
    subject: `📋 Action Required: Update Profile for ${schoolName}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
        <div style="text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #f1f5f9;">
          <h2 style="color: #0f172a; margin: 0; font-size: 24px; font-weight: 800;">🏫 VidyaPath School Portal</h2>
          <p style="color: #64748b; margin: 4px 0 0 0; font-size: 14px;">Verify and Complete Your Institution's Profile</p>
        </div>
        
        <div style="color: #334155; line-height: 1.6; font-size: 15px;">
          <p>Dear Administrator,</p>
          <p>The system administrator of <strong>VidyaPath</strong> has requested you to review and update the institutional details for <strong>${schoolName}</strong>.</p>
          <p>Keeping your school profile up to date ensures your students have access to the most accurate scholarship match listings, state boards benefits, and educational facilities directory updates.</p>
          
          <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 16px; border-radius: 8px; margin: 24px 0;">
            <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">What you need to check:</h4>
            <ul style="margin: 0; padding-left: 20px; color: #475569; font-size: 14px;">
              <li>Contact details (Phone, Website, Email)</li>
              <li>Academic Board & Institution Type</li>
              <li>Custom Facilities & Categories details</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${updateUrl}" style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; text-decoration: none; padding: 14px 28px; border-radius: 9999px; font-weight: bold; font-size: 15px; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2); display: inline-block;">Update School Profile</a>
          </div>
          
          <p style="color: #ef4444; font-size: 13px; font-style: italic; background: #fef2f2; padding: 12px; border-radius: 8px; border: 1px solid #fca5a5;">
            ⚠️ <strong>Security Note:</strong> This is a secure verification link. Do not share this email or link with unauthorized personnel. This link will expire in 7 days.
          </p>
        </div>
        
        <div style="margin-top: 36px; padding-top: 16px; border-top: 1px solid #f1f5f9; text-align: center; color: #94a3b8; font-size: 12px;">
          <p>This is an automated system email. Please do not reply directly to this message.</p>
          <p>&copy; ${new Date().getFullYear()} VidyaPath. All Rights Reserved.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✉️ School update request sent to ${schoolEmail}`);
    return { success: true };
  } catch (error) {
    console.error(`Failed to send school email to ${schoolEmail}:`, error.message);
    throw error;
  }
}

module.exports = { sendMatchAlert, sendSchoolUpdateRequest };
