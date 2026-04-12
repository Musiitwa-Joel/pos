/**
 * Generate HTML email template for results upload verification code
 * @param {string} userName - User's name
 * @param {string} code - 6-digit verification code
 * @returns {string} HTML email content
 */
export const getVerificationCodeEmailTemplate = (userName, code) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verification Code Required</title>
</head>
<body>
  <p>🔐 <strong>Verification Code Required to Proceed With Results Upload</strong></p>
  
  <p>Dear <strong>${userName}</strong>,</p>
  
  <p>A request has been initiated to upload academic results to the Tredumo Results Management Portal.</p>
  
  <p>To verify and authorize this action, please enter the secure verification code below:</p>
  
  <p>🔐 <strong>AUTHORIZATION CODE: ${code}</strong></p>
  
  <p>
    <strong>Action:</strong> Results Upload Authorization<br>
    <strong>Validity:</strong> 10 minutes<br>
    <strong>Status:</strong> Required Before Upload Can Proceed
  </p>
  
  <p>⚠️ <strong>IMPORTANT SECURITY NOTICE</strong></p>
  
  <p>
    Uploading results is a restricted and sensitive operation.<br>
    To protect student data and maintain system integrity:
  </p>
  
  <ul>
    <li><strong>Do not share this code</strong> with any other staff member.</li>
    <li>If you <strong>did not initiate</strong> this upload request, cancel immediately and notify the system administrator.</li>
    <li>Any unauthorized attempts are <strong>automatically logged</strong> for security auditing.</li>
  </ul>
  
  <p>Thank you for helping us maintain the confidentiality and accuracy of academic records.</p>
  
  <p><strong>Tredumo</strong> – All Systems Operational</p>
</body>
</html>
  `.trim();
};

/**
 * Generate plain text version of verification email
 * @param {string} userName - User's name
 * @param {string} code - 6-digit verification code
 * @returns {string} Plain text email content
 */
export const getVerificationCodeEmailText = (userName, code) => {
  return `
🔐 Verification Code Required to Proceed With Results Upload

Dear ${userName},

A request has been initiated to upload academic results to the Tredumo Results Management Portal.

To verify and authorize this action, please enter the secure verification code below:

🔐 AUTHORIZATION CODE: ${code}

Action: Results Upload Authorization
Validity: 10 minutes
Status: Required Before Upload Can Proceed

⚠️ IMPORTANT SECURITY NOTICE

Uploading results is a restricted and sensitive operation.
To protect student data and maintain system integrity:

- Do not share this code with any other staff member.
- If you did not initiate this upload request, cancel immediately and notify the system administrator.
- Any unauthorized attempts are automatically logged for security auditing.

Thank you for helping us maintain the confidentiality and accuracy of academic records.

Tredumo – All Systems Operational
  `.trim();
};
