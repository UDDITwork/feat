const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify email configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email service configuration error:', error);
  } else {
    console.log('✅ Email service is ready to send messages');
  }
});

// SITABIENCE IP Brand Colors and Styling
const BRAND_COLORS = {
  primary: '#00C060', // Vibrant green
  teal: '#004C57',    // Dark teal
  white: '#FFFFFF',
  gray: '#6B7280',
  lightGray: '#F3F4F6'
};

// Base HTML template with SITABIENCE IP branding
const getBaseTemplate = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SITABIENCE IP - Patent Services</title>
    <style>
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #374151;
            margin: 0;
            padding: 0;
            background-color: #F9FAFB;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #FFFFFF;
        }
        .header {
            background: linear-gradient(135deg, ${BRAND_COLORS.teal} 0%, ${BRAND_COLORS.primary} 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        .logo {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .tagline {
            font-size: 16px;
            opacity: 0.9;
            margin-bottom: 5px;
        }
        .subtitle {
            font-size: 14px;
            opacity: 0.8;
        }
        .content {
            padding: 40px 30px;
        }
        .section {
            margin-bottom: 30px;
        }
        .section-title {
            color: ${BRAND_COLORS.teal};
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
            border-bottom: 2px solid ${BRAND_COLORS.primary};
            padding-bottom: 10px;
        }
        .highlight-box {
            background: linear-gradient(135deg, #F0FDFA 0%, #CCFBF1 100%);
            border: 1px solid ${BRAND_COLORS.primary};
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
        }
        .cta-button {
            display: inline-block;
            background: ${BRAND_COLORS.primary};
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: all 0.3s ease;
        }
        .cta-button:hover {
            background: #00a854;
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 192, 96, 0.3);
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin: 30px 0;
        }
        .stat-item {
            text-align: center;
            padding: 20px;
            background: white;
            border-radius: 12px;
            border: 1px solid #E5E7EB;
        }
        .stat-number {
            font-size: 28px;
            font-weight: bold;
            color: ${BRAND_COLORS.primary};
            margin-bottom: 5px;
        }
        .stat-label {
            font-size: 14px;
            color: ${BRAND_COLORS.gray};
        }
        .footer {
            background: ${BRAND_COLORS.teal};
            color: white;
            padding: 30px;
            text-align: center;
        }
        .contact-info {
            margin: 20px 0;
        }
        .contact-item {
            margin: 10px 0;
            font-size: 14px;
        }
        .social-links {
            margin-top: 20px;
        }
        .social-link {
            display: inline-block;
            margin: 0 10px;
            color: white;
            text-decoration: none;
            font-size: 14px;
        }
        @media (max-width: 600px) {
            .stats-grid {
                grid-template-columns: 1fr;
            }
            .header, .content, .footer {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">SITABIENCE IP</div>
            <div class="tagline">Built by Engineers. Trusted by Founders.</div>
            <div class="subtitle">Patent Services & IP Consulting</div>
        </div>
        
        <div class="content">
            ${content}
        </div>
        
        <div class="footer">
            <div class="contact-info">
                <div class="contact-item">
                    <strong>Need Help?</strong> +91 9211 5654 66
                </div>
                <div class="contact-item">
                    <strong>Email:</strong> mail@sitabienceip.com
                </div>
                <div class="contact-item">
                    <strong>Location:</strong> Noida, Sector 58 (New Delhi, India)
                </div>
            </div>
            
            <div class="social-links">
                <a href="#" class="social-link">LinkedIn</a>
                <a href="#" class="social-link">Facebook</a>
                <a href="#" class="social-link">Instagram</a>
            </div>
            
            <div style="margin-top: 20px; font-size: 12px; opacity: 0.8;">
                © 2025 SITABIENCE IP. All rights reserved.
            </div>
        </div>
    </div>
</body>
</html>
`;

// Patent Application Invitation Email Template
const getPatentInvitationTemplate = (adminName, clientEmail, formLink) => {
  const content = `
    <div class="section">
        <h2 class="section-title">Patent Application Invitation</h2>
        <p>Dear Innovator,</p>
        
        <p>You've been invited by <strong>${adminName}</strong> to submit your patent application through SITABIENCE IP's streamlined system.</p>
        
        <div class="highlight-box">
            <h3 style="color: ${BRAND_COLORS.teal}; margin-top: 0;">Why Choose SITABIENCE IP?</h3>
            <ul style="margin: 15px 0; padding-left: 20px;">
                <li><strong>Deep Technical Fluency:</strong> We speak your language - algorithms, antennas, batteries, biotech, or blockchain</li>
                <li><strong>98%+ Patent Grant Rate:</strong> Our expertise ensures your innovation gets the protection it deserves</li>
                <li><strong>Business-First Approach:</strong> We draft patents that help you raise, license, and win</li>
                <li><strong>Global Standards:</strong> Aligned with USPTO, EPO, JPO, and Indian Patent Office expectations</li>
            </ul>
        </div>
        
        <p>Our team of experts has personally drafted 1,000+ patents across AI, telecom, software, semiconductors, medical devices, and more.</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="${formLink}" class="cta-button">
                Start Your Patent Application
            </a>
        </div>
        
        <p><strong>What to expect:</strong></p>
        <ol style="margin: 15px 0; padding-left: 20px;">
            <li><strong>Invention Discovery:</strong> We'll understand your innovation in detail</li>
            <li><strong>Strategic Drafting:</strong> We'll translate your tech into airtight patents</li>
            <li><strong>Ongoing Support:</strong> We don't disappear after filing</li>
        </ol>
        
        <div class="stats-grid">
            <div class="stat-item">
                <div class="stat-number">18+</div>
                <div class="stat-label">Years Experience</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">98%+</div>
                <div class="stat-label">Grant Success Rate</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">60%+</div>
                <div class="stat-label">Faster TAT</div>
            </div>
        </div>
        
        <p style="text-align: center; font-style: italic; color: ${BRAND_COLORS.gray};">
            "At SITABIENCE, we don't just draft patents — we build IP foundations for future unicorns."
        </p>
    </div>
  `;
  
  return getBaseTemplate(content);
};

// Form Submission Confirmation Email Template
const getFormSubmissionTemplate = (clientName, submissionId, nextSteps) => {
  const content = `
    <div class="section">
        <h2 class="section-title">Patent Application Received</h2>
        <p>Dear ${clientName},</p>
        
        <p>Thank you for submitting your patent application through SITABIENCE IP. We're excited to work with you on protecting your innovation!</p>
        
        <div class="highlight-box">
            <h3 style="color: ${BRAND_COLORS.teal}; margin-top: 0;">Submission Confirmed</h3>
            <p><strong>Submission ID:</strong> ${submissionId}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        
        <h3 style="color: ${BRAND_COLORS.teal};">What Happens Next?</h3>
        <ol style="margin: 15px 0; padding-left: 20px;">
            ${nextSteps.map((step, index) => `<li><strong>Step ${index + 1}:</strong> ${step}</li>`).join('')}
        </ol>
        
        <p>Our expert team will review your submission within 24 hours and contact you to schedule a detailed consultation.</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="mailto:mail@sitabienceip.com" class="cta-button">
                Contact Our Team
            </a>
        </div>
        
        <p><strong>Need immediate assistance?</strong></p>
        <p>Call us at <strong>+91 9211 5654 66</strong> or email <strong>mail@sitabienceip.com</strong></p>
        
        <div class="highlight-box">
            <h3 style="color: ${BRAND_COLORS.teal}; margin-top: 0;">Why SITABIENCE IP?</h3>
            <p>We understand founders because we've advised them — and because we're building too. We become part of your journey, especially when it matters most.</p>
        </div>
    </div>
  `;
  
  return getBaseTemplate(content);
};

// Patent Status Update Email Template
const getStatusUpdateTemplate = (clientName, patentTitle, status, details) => {
  const content = `
    <div class="section">
        <h2 class="section-title">Patent Status Update</h2>
        <p>Dear ${clientName},</p>
        
        <p>We have an important update regarding your patent application: <strong>${patentTitle}</strong></p>
        
        <div class="highlight-box">
            <h3 style="color: ${BRAND_COLORS.teal}; margin-top: 0;">Current Status: ${status}</h3>
            <p>${details}</p>
        </div>
        
        <h3 style="color: ${BRAND_COLORS.teal};">Next Steps</h3>
        <p>Our team is actively working on your case. You'll receive another update within the next 48 hours.</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="mailto:mail@sitabienceip.com" class="cta-button">
                Get More Details
            </a>
        </div>
        
        <p><strong>Questions?</strong> Don't hesitate to reach out to our team.</p>
        <p>Phone: <strong>+91 9211 5654 66</strong><br>
        Email: <strong>mail@sitabienceip.com</strong></p>
    </div>
  `;
  
  return getBaseTemplate(content);
};

// Newsletter Template
const getNewsletterTemplate = (title, content, ctaText, ctaLink) => {
  const newsletterContent = `
    <div class="section">
        <h2 class="section-title">${title}</h2>
        
        <div class="highlight-box">
            ${content}
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="${ctaLink}" class="cta-button">
                ${ctaText}
            </a>
        </div>
        
        <p style="text-align: center; font-style: italic; color: ${BRAND_COLORS.gray};">
            Stay updated with the latest IP insights and patent trends from SITABIENCE IP.
        </p>
    </div>
  `;
  
  return getBaseTemplate(newsletterContent);
};

// Send email function
const sendEmail = async (to, subject, htmlContent) => {
  try {
    console.log(`📧 Attempting to send email to: ${to}`);
    
    const mailOptions = {
      from: `"SITABIENCE IP" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      response: error.response
    });
    return { success: false, error: error.message };
  }
};

// Send patent invitation
const sendPatentInvitation = async (to, adminName, formLink) => {
  const subject = 'Patent Application Invitation - SITABIENCE IP';
  const htmlContent = getPatentInvitationTemplate(adminName, to, formLink);
  return await sendEmail(to, subject, htmlContent);
};

// Send form submission confirmation
const sendFormSubmissionConfirmation = async (to, clientName, submissionId) => {
  const nextSteps = [
    'Initial review and technical assessment',
    'Detailed consultation call',
    'Patent strategy development',
    'Draft preparation and filing'
  ];
  
  const subject = 'Patent Application Received - SITABIENCE IP';
  const htmlContent = getFormSubmissionTemplate(clientName, submissionId, nextSteps);
  return await sendEmail(to, subject, htmlContent);
};

// Send status update
const sendStatusUpdate = async (to, clientName, patentTitle, status, details) => {
  const subject = `Patent Status Update: ${status} - SITABIENCE IP`;
  const htmlContent = getStatusUpdateTemplate(clientName, patentTitle, status, details);
  return await sendEmail(to, subject, htmlContent);
};

// Send newsletter
const sendNewsletter = async (to, title, content, ctaText, ctaLink) => {
  const subject = `${title} - SITABIENCE IP Newsletter`;
  const htmlContent = getNewsletterTemplate(title, content, ctaText, ctaLink);
  return await sendEmail(to, subject, htmlContent);
};

// Generate form token
const generateFormToken = (email) => {
  return uuidv4();
};

// Generate form link
const generateFormLink = (token) => {
  // Use production URL in production environment, otherwise use localhost
  const frontendUrl = process.env.NODE_ENV === 'production' 
    ? (process.env.FRONTEND_URL_PROD || process.env.FRONTEND_URL || 'https://feat-olive.vercel.app')
    : (process.env.FRONTEND_URL_LOCAL || process.env.FRONTEND_URL || 'http://localhost:5173');
  
  console.log(`🔗 Generating form link for environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Using frontend URL: ${frontendUrl}`);
  
  return `${frontendUrl}/form/${token}`;
};

// Send form invitation (wrapper for sendPatentInvitation)
const sendFormInvitation = async (email, adminName) => {
  try {
    const token = generateFormToken(email);
    const formLink = generateFormLink(token);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    const result = await sendPatentInvitation(email, adminName, formLink);
    
    if (result.success) {
      return {
        success: true,
        token,
        formLink,
        expiresAt,
        messageId: result.messageId
      };
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Error in sendFormInvitation:', error);
    throw error;
  }
};

// Send bulk invitations
const sendBulkInvitations = async (emails, adminName) => {
  const results = [];
  const errors = [];
  let successful = 0;
  let failed = 0;

  for (const email of emails) {
    try {
      const result = await sendFormInvitation(email, adminName);
      results.push({
        email,
        success: true,
        token: result.token,
        formLink: result.formLink,
        expiresAt: result.expiresAt,
        messageId: result.messageId
      });
      successful++;
    } catch (error) {
      errors.push({
        email,
        error: error.message
      });
      failed++;
    }
  }

  return {
    results,
    errors,
    summary: {
      total: emails.length,
      successful,
      failed
    }
  };
};

module.exports = {
  sendEmail,
  sendPatentInvitation,
  sendFormInvitation,
  sendBulkInvitations,
  sendFormSubmissionConfirmation,
  sendStatusUpdate,
  sendNewsletter,
  generateFormToken,
  generateFormLink,
  getBaseTemplate,
  getPatentInvitationTemplate,
  getFormSubmissionTemplate,
  getStatusUpdateTemplate,
  getNewsletterTemplate
};
