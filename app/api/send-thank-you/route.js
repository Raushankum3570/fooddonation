import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// The verified email address for testing
const VERIFIED_TEST_EMAIL = '3570kumarraushan@gmail.com';

// Set to true when you've verified a domain and want to send to any email
// You must also update your EMAIL_FROM environment variable to use your verified domain
const PRODUCTION_READY = process.env.EMAIL_PRODUCTION === 'true';

// Development mode - simulate email success without actually sending
// Set this to true during development to avoid hitting Resend API limitations
const DEV_MODE = process.env.NODE_ENV === 'development';

export async function POST(request) {
  try {
    // Check if API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY environment variable is not set');
      return NextResponse.json(
        { success: false, message: 'Email service configuration error', details: 'Missing API key' },
        { status: 500 }
      );
    }

    // Get the request body which now includes userData
    const { email, foodName, name, sendActualEmail, userData } = await request.json();

    // Validate input
    if (!email || !foodName) {
      return NextResponse.json(
        { success: false, message: 'Validation error', details: 'Email and food name are required' },
        { status: 400 }
      );
    }

    // Use logged-in user information if available, otherwise fallback to provided name
    let recipientName = "Donor";
    let senderName = "Food Share Team";
    let senderEmail = null;
    
    if (userData) {
      // If userData is provided, use it for the email
      recipientName = userData.name || name || "Donor";
      senderName = userData.name || "Food Share Team";
      senderEmail = userData.email;
      console.log(`Using logged-in user data: ${JSON.stringify(userData)}`);
    } else if (name) {
      recipientName = name;
    }

    // If we're in dev mode and not explicitly requesting actual email, simulate a successful email send
    if (DEV_MODE && !sendActualEmail && email !== VERIFIED_TEST_EMAIL) {
      console.log(`⚠️  DEVELOPMENT MODE: NO ACTUAL EMAIL SENT TO ${email}`);
      console.log(`📧 Email would have contained: Thank you for donation of ${foodName}`);
      console.log(`📧 In production, this would be sent to: ${email}`);
      console.log(`📝 To send real emails:`);
      console.log(`   1. Deploy to production`);
      console.log(`   2. Verify a domain at resend.com/domains`);
      console.log(`   3. Update EMAIL_FROM to use verified domain`);
      console.log(`   4. Set EMAIL_PRODUCTION=true`);
      console.log(`   5. Or pass sendActualEmail=true in your request`);
      
      // Return a success response that indicates it's a simulated send
      return NextResponse.json({
        success: true,
        emailSent: false, // Explicitly set to false to be clear
        simulated: true,
        id: 'dev-mode-simulated-id',
        actualRecipient: email, // Add the actual recipient email that would be used in production
        message: `DEVELOPMENT MODE: No actual email was sent to ${email}.`,
        details: 'In development, emails are NOT delivered by default. Set sendActualEmail=true to send actual emails.'
      });
    }

    // Email sender configuration - must use a verified domain in production
    const fromEmail = process.env.EMAIL_FROM || 'Food Share <onboarding@resend.dev>';
    
    // Use the actual recipient email if explicitly requested or if in production mode
    const targetEmail = sendActualEmail ? email : (PRODUCTION_READY ? email : VERIFIED_TEST_EMAIL);
    
    console.log(`Attempting to send email from: ${fromEmail} to: ${targetEmail}`);

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: targetEmail,
      subject: 'Thank You for Your Food Donation!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #4CAF50; text-align: center;">Thank You for Your Donation!</h2>
          <p>Dear ${recipientName},</p>
          <p>We sincerely thank you for your generous donation of <strong>${foodName}</strong>. Your contribution will help someone in need and make a meaningful difference in their life.</p>
          <p>Your kindness helps us fight food waste and hunger in our community. We appreciate your support in our mission.</p>
          <div style="margin: 30px 0; text-align: center;">
            <p style="color: #4CAF50; font-size: 18px; font-weight: bold;">Together, we can make a difference!</p>
          </div>
          <p>Warm regards,</p>
          <p><strong>${senderName}</strong>${senderEmail ? ` (${senderEmail})` : ''}</p>
          ${(!PRODUCTION_READY && !sendActualEmail && email !== targetEmail) ? 
            `<p style="font-size: 12px; color: #888;">Note: This is a test email. In production, this would be sent to ${email}.</p>` : ''}
        </div>
      `,
      // Add reply-to header if sender email is available
      ...(senderEmail && { replyTo: senderEmail }),
    });

    if (error) {
      console.error('Resend API error details:', error);
      
      // Provide user-friendly message when in development
      if (error.name === 'validation_error' && error.message.includes('can only send testing emails')) {
        return NextResponse.json(
          { 
            success: false, 
            emailSent: false,
            devMode: true,
            message: 'Development mode email limitation',
            details: 'In development, emails can only be sent to verified addresses. Your donation was recorded successfully.'
          },
          { status: 200 } // Return 200 not 400, as this is expected in development
        );
      }
      
      return NextResponse.json(
        { 
          success: false, 
          emailSent: false,
          message: 'Email service error', 
          details: error.message || 'Unknown error from email provider' 
        },
        { status: 500 }
      );
    }

    console.log('Email sent successfully with ID:', data?.id);
    return NextResponse.json({ 
      success: true, 
      emailSent: true,
      id: data?.id,
      actualRecipient: targetEmail,
      message: `Email successfully sent to ${targetEmail} with ID: ${data?.id}`,
      details: 'This was a real email delivery, not a simulation.',
      senderInfo: userData ? { name: senderName, email: senderEmail } : null
    });
    
  } catch (error) {
    console.error('Exception in email sending route:', error);
    return NextResponse.json(
      { 
        success: false, 
        emailSent: false,
        message: 'Server error', 
        details: error.message || 'Unknown server error' 
      },
      { status: 500 }
    );
  }
}
