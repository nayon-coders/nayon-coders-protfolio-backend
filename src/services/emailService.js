/**
 * Abstract Email Service
 * 
 * This service currently mocks email sending by logging to the console.
 * In a real production environment, you can integrate Nodemailer, SendGrid, Resend, etc.
 * without changing the controller logic.
 */

const sendContactNotification = async ({ name, email, subject, message }) => {
  try {
    // Mock sending email
    console.log('==================================================');
    console.log(`✉️  NEW CONTACT FORM SUBMISSION`);
    console.log(`From: ${name} <${email}>`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: \n${message}`);
    console.log('==================================================');

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return true;
  } catch (error) {
    console.error('Email service failed:', error);
    return false;
  }
};

module.exports = {
  sendContactNotification
};
