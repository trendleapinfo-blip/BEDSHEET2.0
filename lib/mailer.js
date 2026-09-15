import nodemailer from "nodemailer";

/**
 * Dynamic SMTP Transporter
 * Configured with service: 'gmail' for optimal deliverability and reliability.
 */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER || "trendleap.info@gmail.com",
    pass: process.env.SMTP_PASS || "qxzqmzjjdqxzoabf",
  },
  tls: {
    rejectUnauthorized: false
  }
});

const fromEmail = process.env.SMTP_FROM || "trendleap.info@gmail.com";

/**
 * Send a plain OTP email
 * @param {string} to  - recipient email
 * @param {string} otp - 6-digit code
 * @param {string} purpose - "reset_password" | "login" | "signup"
 */
export async function sendOtpEmail(to, otp, purpose = "verification") {
  const purposeLabel = {
    reset_password: "Password Reset",
    login: "Login Verification",
    signup: "Email Verification",
  }[purpose] || "Verification";

  const mailOptions = {
    from: `"ClosetRush" <${fromEmail}>`,
    to,
    subject: `Your ClosetRush ${purposeLabel} Code: ${otp}`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>ClosetRush OTP</title>
</head>
<body style="margin:0;padding:0;background:#F5F0E8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F0E8;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e5e0d5;max-width:520px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#0F172A;padding:28px 40px;text-align:center;">
              <span style="font-size:22px;font-weight:800;letter-spacing:4px;color:#B2905F;font-family:Georgia,serif;text-transform:uppercase;">
                ClosetRush
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 28px;">
              <p style="margin:0 0 8px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#B2905F;">
                ${purposeLabel}
              </p>
              <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#1a1a2e;font-family:Georgia,serif;line-height:1.3;">
                Your verification code
              </h1>
              <p style="margin:0 0 28px;font-size:14px;color:#555;line-height:1.6;">
                Use the code below to complete your ${purposeLabel.toLowerCase()}. 
                This code expires in <strong>5 minutes</strong>.
              </p>

              <!-- OTP Box -->
              <div style="background:#F5F0E8;border:2px solid #B2905F;padding:24px;text-align:center;margin-bottom:28px;">
                <span style="font-size:40px;font-weight:900;letter-spacing:12px;color:#0F172A;font-family:'Courier New',monospace;">
                  ${otp}
                </span>
              </div>

              <p style="margin:0 0 8px;font-size:12px;color:#888;line-height:1.6;">
                If you did not request this code, you can safely ignore this email. 
                Your account remains secure.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid #e5e0d5;margin:0;" />
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#aaa;font-weight:600;">
                © ${new Date().getFullYear()} ClosetRush. All rights reserved. •
                <a href="https://closetrush.in" style="color:#B2905F;text-decoration:none;">closetrush.in</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`[MAILER] OTP email sent successfully to ${to}. Message ID: ${info.messageId}`);
  return info;
}

/**
 * Send a beautiful HTML order confirmation email to the user
 * @param {string} to  - recipient email
 * @param {object} orderDetails - order information
 */
export async function sendOrderConfirmationEmail(to, orderDetails) {
  const {
    userName,
    bundleOrderId,
    bundleName,
    orderType,
    subscriptionType,
    price,
    securityDeposit,
    gst,
    discount,
    totalPrice,
    deliveryAddress,
    startDate,
    duration
  } = orderDetails;

  const isBuy = orderType === "BUY";

  // Format dates nicely
  const formattedDate = new Date(startDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  // Next Bed Sheet Arrival Logic
  let arrivalTitle = "Next Sheet Swap Service";
  let arrivalDescription = "";

  if (isBuy) {
    arrivalTitle = "Estimated Delivery Timeline";
    arrivalDescription = `Your premium vacuum-sealed, thermodynamically sanitized linen set is being prepared at our fulfillment center. It will be dispatched via express courier and will arrive at your address within <strong>3-5 business days</strong>. This is a direct retail purchase.`;
  } else if (subscriptionType === "weekly") {
    arrivalTitle = "Weekly Bedding Swap Schedule";
    arrivalDescription = `Our professional hygiene swap staff will visit your delivery address every <strong>7 days</strong>. On your swap day, our specialist will strip your bed, handle the dirty sheets, and lay down freshly sanitized organic linen.`;
  } else {
    arrivalTitle = "Monthly Fresh Linen Kit";
    arrivalDescription = `Your next fresh linen kit is scheduled for delivery in <strong>30 days</strong>. We will drop off the fresh kit and collect your used linens. Please pack your dirty sheets in your custom ClosetRush laundry bag before our dispatch agent arrives.`;
  }

  const mailOptions = {
    from: `"ClosetRush" <${fromEmail}>`,
    to,
    subject: `Order Confirmed: ${bundleOrderId} - ClosetRush`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>ClosetRush Order Confirmed</title>
</head>
<body style="margin:0;padding:0;background-color:#F5F0E8;font-family:'Segoe UI',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F0E8;padding:40px 10px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border:1px solid #e5e0d5;max-width:600px;width:100%;box-shadow:0 4px 12px rgba(0,0,0,0.03);">

          <!-- Brand Header -->
          <tr>
            <td style="background-color:#0F172A;padding:32px 40px;text-align:center;">
              <span style="font-size:24px;font-weight:800;letter-spacing:4px;color:#B2905F;font-family:Georgia,serif;text-transform:uppercase;">
                ClosetRush
              </span>
            </td>
          </tr>

          <!-- Success Banner -->
          <tr>
            <td style="padding:40px 40px 20px;text-align:center;">
              <div style="width:56px;height:56px;background-color:#F0FDF4;border:2px solid #BBF7D0;border-radius:50%;display:inline-block;line-height:56px;text-align:center;margin-bottom:20px;">
                <span style="font-size:28px;color:#15803D;font-weight:bold;">✓</span>
              </div>
              <h1 style="margin:0 0 10px;font-size:24px;font-weight:700;color:#0F172A;font-family:Georgia,serif;">
                Order Confirmed!
              </h1>
              <p style="margin:0;font-size:14px;color:#555;line-height:1.6;font-weight:500;">
                Hi ${userName}, your ${isBuy ? 'purchase' : 'subscription'} has been successfully placed. Here are your order details:
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid #e5e0d5;margin:0;" />
            </td>
          </tr>

          <!-- Order Summary Section -->
          <tr>
            <td style="padding:30px 40px;">
              <h3 style="margin:0 0 16px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#B2905F;font-family:Georgia,serif;">
                Order Summary
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;line-height:2.0;color:#444;">
                <tr>
                  <td width="40%" style="font-weight:bold;color:#666;">Order ID:</td>
                  <td width="60%" style="font-weight:bold;color:#0F172A;">${bundleOrderId}</td>
                </tr>
                <tr>
                  <td style="font-weight:bold;color:#666;">Bundle Item:</td>
                  <td style="color:#0F172A;">${bundleName}</td>
                </tr>
                <tr>
                  <td style="font-weight:bold;color:#666;">Order Type:</td>
                  <td style="color:#0F172A;text-transform:uppercase;font-weight:700;">${orderType}</td>
                </tr>
                <tr>
                  <td style="font-weight:bold;color:#666;">Service Duration:</td>
                  <td style="color:#0F172A;">${duration}</td>
                </tr>
                <tr>
                  <td style="font-weight:bold;color:#666;">Start Date:</td>
                  <td style="color:#0F172A;">${formattedDate}</td>
                </tr>
                <tr>
                  <td style="font-weight:bold;color:#666;vertical-align:top;padding-top:4px;">Delivery Address:</td>
                  <td style="color:#0F172A;line-height:1.4;padding-top:4px;">${deliveryAddress}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Next Bedsheet Arrival Info Block -->
          <tr>
            <td style="padding:0 40px 10px;">
              <div style="background-color:#F5F0E8;border-left:4px solid #B2905F;padding:20px;margin-bottom:20px;">
                <h4 style="margin:0 0 8px;font-size:13px;font-weight:700;color:#0F172A;text-transform:uppercase;letter-spacing:1px;font-family:Georgia,serif;">
                  ⏰ ${arrivalTitle}
                </h4>
                <p style="margin:0;font-size:12.5px;color:#555;line-height:1.6;">
                  ${arrivalDescription}
                </p>
              </div>
            </td>
          </tr>

          <!-- Pricing Table -->
          <tr>
            <td style="padding:20px 40px 30px;">
              <h3 style="margin:0 0 16px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#B2905F;font-family:Georgia,serif;">
                Payment Details
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;line-height:1.8;color:#444;border-collapse:collapse;">
                <tr style="border-bottom:1px solid #f1f1f1;">
                  <td style="padding:8px 0;color:#666;">Base Price:</td>
                  <td align="right" style="padding:8px 0;font-weight:bold;color:#0F172A;">₹${price}</td>
                </tr>
                <tr style="border-bottom:1px solid #f1f1f1;">
                  <td style="padding:8px 0;color:#666;">GST (18% Included):</td>
                  <td align="right" style="padding:8px 0;font-weight:bold;color:#0F172A;">Included ₹${gst}</td>
                </tr>
                <tr style="border-bottom:1px solid #f1f1f1;">
                  <td style="padding:8px 0;color:#666;">Security Deposit:</td>
                  <td align="right" style="padding:8px 0;font-weight:bold;color:#0F172A;">₹${securityDeposit}</td>
                </tr>
                ${discount > 0 ? `
                <tr style="border-bottom:1px solid #f1f1f1;color:#16A34A;">
                  <td style="padding:8px 0;">Coupon Discount:</td>
                  <td align="right" style="padding:8px 0;font-weight:bold;">-₹${discount}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding:12px 0 0;font-size:15px;font-weight:bold;color:#0F172A;">Total Paid Amount:</td>
                  <td align="right" style="padding:12px 0 0;font-size:18px;font-weight:900;color:#B2905F;">₹${totalPrice}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid #e5e0d5;margin:0;" />
            </td>
          </tr>

          <!-- Need Help banner -->
          <tr>
            <td style="padding:30px 40px;text-align:center;">
              <h4 style="margin:0 0 8px;font-size:13px;font-weight:700;color:#0F172A;font-family:Georgia,serif;">
                Have questions or need to reschedule?
              </h4>
              <p style="margin:0;font-size:12px;color:#666;line-height:1.6;">
                You can easily reschedule swaps or create support requests directly in your Customer Dashboard, or email us at 
                <a href="mailto:support@closetrush.in" style="color:#B2905F;text-decoration:none;font-weight:bold;">support@closetrush.in</a>
              </p>
            </td>
          </tr>

          <!-- Footer Bar -->
          <tr>
            <td style="background-color:#0F172A;padding:24px 40px;text-align:center;">
              <p style="margin:0 0 4px;font-size:11px;color:#aaa;font-weight:600;">
                © ${new Date().getFullYear()} ClosetRush. All rights reserved.
              </p>
              <p style="margin:0;font-size:11px;">
                <a href="https://closetrush.in" style="color:#B2905F;text-decoration:none;font-weight:bold;letter-spacing:1px;text-transform:uppercase;">closetrush.in</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  };

  await transporter.sendMail(mailOptions);
}

/**
 * Send cancellation confirmation email to the user
 * @param {string} to - user email address
 * @param {object} details - details of cancellation (name, planName, refundAmount)
 */
export async function sendCancellationEmailToUser(to, details) {
  const { userName, planName, refundAmount } = details;
  const mailOptions = {
    from: `"ClosetRush" <${fromEmail}>`,
    to,
    subject: `Subscription Cancelled: Refund Pending - ClosetRush`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Subscription Cancelled</title>
</head>
<body style="margin:0;padding:0;background-color:#F5F0E8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F0E8;padding:40px 10px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border:1px solid #e5e0d5;max-width:600px;width:100%;">
          <tr>
            <td style="background-color:#0F172A;padding:32px 40px;text-align:center;">
              <span style="font-size:24px;font-weight:800;letter-spacing:4px;color:#B2905F;font-family:Georgia,serif;text-transform:uppercase;">
                ClosetRush
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 40px 20px;text-align:center;">
              <h1 style="margin:0 0 10px;font-size:22px;font-weight:700;color:#0F172A;font-family:Georgia,serif;">
                Subscription Cancelled
              </h1>
              <p style="margin:0;font-size:14px;color:#555;line-height:1.6;">
                Hi ${userName}, your ClosetRush plan subscription has been cancelled.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px 30px;">
              <div style="background-color:#F9F9F9;border:1px solid #EAEAEA;padding:20px;font-size:13px;line-height:1.8;color:#444;">
                <p style="margin:0 0 8px;"><strong>Cancelled Plan:</strong> ${planName}</p>
                <p style="margin:0 0 8px;"><strong>Security Deposit Paid:</strong> ₹${refundAmount}</p>
                <p style="margin:0;"><strong>Refund Status:</strong> <span style="color:#B2905F;font-weight:bold;">PENDING RETURN</span></p>
              </div>
              <p style="font-size:13px;color:#555;line-height:1.6;margin-top:20px;">
                Our logistics staff will coordinate the final pickup of ClosetRush linens from your address. Once the items are collected and verified, your security deposit of <strong>₹${refundAmount}</strong> will be refunded to your original payment account.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#0F172A;padding:24px 40px;text-align:center;color:#aaa;font-size:11px;">
              © ${new Date().getFullYear()} ClosetRush. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim()
  };
  await transporter.sendMail(mailOptions);
}

/**
 * Send cancellation alert email to the admin
 * @param {string} adminEmail - contact support/admin email
 * @param {object} details - details of cancellation (name, email, phone, planName, refundAmount)
 */
export async function sendCancellationEmailToAdmin(adminEmail, details) {
  const { userName, userEmail, userPhone, planName, refundAmount } = details;
  const mailOptions = {
    from: `"ClosetRush Notifications" <${fromEmail}>`,
    to: adminEmail,
    subject: `ALERT: Subscription Cancelled & Refund Due for ${userName}`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Subscription Cancelled Alert</title>
</head>
<body style="font-family:'Segoe UI',Arial,sans-serif;color:#333;background:#FCFBF9;padding:20px;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #DDD;padding:30px;border-top:4px solid #B2905F;">
    <h2 style="font-family:Georgia,serif;margin-top:0;">Subscription Cancelled Alert</h2>
    <p>A customer has cancelled their subscription plan. A security deposit refund is pending processing.</p>
    
    <table width="100%" cellpadding="5" style="border-collapse:collapse;margin:20px 0;font-size:14px;">
      <tr style="background:#F9F9F9;border-bottom:1px solid #EEE;">
        <td width="40%"><strong>Customer Name:</strong></td>
        <td>${userName}</td>
      </tr>
      <tr style="border-bottom:1px solid #EEE;">
        <td><strong>Customer Email:</strong></td>
        <td>${userEmail}</td>
      </tr>
      <tr style="background:#F9F9F9;border-bottom:1px solid #EEE;">
        <td><strong>Customer Phone:</strong></td>
        <td>${userPhone || "Not Provided"}</td>
      </tr>
      <tr style="border-bottom:1px solid #EEE;">
        <td><strong>Cancelled Plan:</strong></td>
        <td>${planName}</td>
      </tr>
      <tr style="background:#F9F9F9;border-bottom:1px solid #EEE;">
        <td><strong>Refund Deposit Amount:</strong></td>
        <td style="color:#B2905F;font-weight:bold;">₹${refundAmount}</td>
      </tr>
    </table>
    
    <p style="font-size:13px;color:#666;">
      Please coordinate the linen collection from their address. Once collected, update the refund status on the Admin panel Refunds tab and return the deposit via the payment gateway.
    </p>
  </div>
</body>
</html>
    `.trim()
  };
  await transporter.sendMail(mailOptions);
}

/**
 * Send subscription pause email to the user
 * @param {string} to - user email
 * @param {object} details - details of pause (name, planName, duration, resumeDate, pauseAction)
 */
export async function sendPauseEmailToUser(to, details) {
  const { userName, planName, duration, resumeDate, pauseAction } = details;
  const mailOptions = {
    from: `"ClosetRush" <${fromEmail}>`,
    to,
    subject: `Vacation Mode Activated: Subscription Paused - ClosetRush`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Subscription Paused</title>
</head>
<body style="margin:0;padding:0;background-color:#F5F0E8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F0E8;padding:40px 10px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border:1px solid #e5e0d5;max-width:600px;width:100%;">
          <tr>
            <td style="background-color:#0F172A;padding:32px 40px;text-align:center;">
              <span style="font-size:24px;font-weight:800;letter-spacing:4px;color:#B2905F;font-family:Georgia,serif;text-transform:uppercase;">
                ClosetRush
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 40px 20px;text-align:center;">
              <h1 style="margin:0 0 10px;font-size:22px;font-weight:700;color:#0F172A;font-family:Georgia,serif;">
                Vacation Mode Activated
              </h1>
              <p style="margin:0;font-size:14px;color:#555;line-height:1.6;">
                Hi ${userName}, your subscription to <strong>${planName}</strong> has been paused.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px 30px;">
              <div style="background-color:#F9F9F9;border:1px solid #EAEAEA;padding:20px;font-size:13px;line-height:1.8;color:#444;">
                <p style="margin:0 0 8px;"><strong>Pause Duration:</strong> ${duration}</p>
                <p style="margin:0 0 8px;"><strong>Resumes Automatically On:</strong> ${new Date(resumeDate).toLocaleDateString()}</p>
                <p style="margin:0 0 8px;"><strong>Linen Preference:</strong> ${pauseAction === "pickup" ? "Schedule pickup (linens collected)" : "Hold sheets (keep them with you)"}</p>
                <p style="margin:0;"><strong>Status:</strong> <span style="color:#B2905F;font-weight:bold;">PAUSED</span></p>
              </div>
              <p style="font-size:13px;color:#555;line-height:1.6;margin-top:20px;">
                While paused, billing cycles and monthly delivery swaps are stopped. If you requested a linen pickup, our logistics team will contact you shortly to coordinate collection. You can resume service at any time from your Customer Dashboard.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#0F172A;padding:24px 40px;text-align:center;color:#aaa;font-size:11px;">
              © ${new Date().getFullYear()} ClosetRush. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim()
  };
  await transporter.sendMail(mailOptions);
}

/**
 * Send pause alert email to the admin
 * @param {string} adminEmail - contact support/admin email
 * @param {object} details - details of pause (name, email, phone, planName, duration, resumeDate, pauseAction)
 */
export async function sendPauseEmailToAdmin(adminEmail, details) {
  const { userName, userEmail, userPhone, planName, duration, resumeDate, pauseAction } = details;
  const mailOptions = {
    from: `"ClosetRush Notifications" <${fromEmail}>`,
    to: adminEmail,
    subject: `ALERT: Subscription Paused by ${userName} (Vacation Mode)`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Subscription Paused Alert</title>
</head>
<body style="font-family:'Segoe UI',Arial,sans-serif;color:#333;background:#FCFBF9;padding:20px;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #DDD;padding:30px;border-top:4px solid #B2905F;">
    <h2 style="font-family:Georgia,serif;margin-top:0;">Subscription Paused Alert</h2>
    <p>A customer has activated Vacation Mode and paused their subscription.</p>
    
    <table width="100%" cellpadding="5" style="border-collapse:collapse;margin:20px 0;font-size:14px;">
      <tr style="background:#F9F9F9;border-bottom:1px solid #EEE;">
        <td width="40%"><strong>Customer Name:</strong></td>
        <td>${userName}</td>
      </tr>
      <tr style="border-bottom:1px solid #EEE;">
        <td><strong>Customer Email:</strong></td>
        <td>${userEmail}</td>
      </tr>
      <tr style="background:#F9F9F9;border-bottom:1px solid #EEE;">
        <td><strong>Customer Phone:</strong></td>
        <td>${userPhone || "Not Provided"}</td>
      </tr>
      <tr style="border-bottom:1px solid #EEE;">
        <td><strong>Active Plan:</strong></td>
        <td>${planName}</td>
      </tr>
      <tr style="background:#F9F9F9;border-bottom:1px solid #EEE;">
        <td><strong>Pause Duration:</strong></td>
        <td>${duration}</td>
      </tr>
      <tr style="border-bottom:1px solid #EEE;">
        <td><strong>Resumes On:</strong></td>
        <td>${new Date(resumeDate).toLocaleDateString()}</td>
      </tr>
      <tr style="background:#F9F9F9;border-bottom:1px solid #EEE;">
        <td><strong>Linen Preference:</strong></td>
        <td style="color:#B2905F;font-weight:bold;">${pauseAction === "pickup" ? "PICKUP REQUESTED" : "HOLD SHEETS"}</td>
      </tr>
    </table>
    
    <p style="font-size:13px;color:#666;">
      ${pauseAction === "pickup" ? "Please coordinate the linen collection from their address." : "No collection is needed; the user is keeping the sheets at home."}
    </p>
  </div>
</body>
</html>
    `.trim()
  };
  await transporter.sendMail(mailOptions);
}

/**
 * Send subscription resume email to the user
 * @param {string} to - user email
 * @param {object} details - details of resume (name, planName)
 */
export async function sendResumeEmailToUser(to, details) {
  const { userName, planName } = details;
  const mailOptions = {
    from: `"ClosetRush" <${fromEmail}>`,
    to,
    subject: `Welcome Back! Subscription Resumed - ClosetRush`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Subscription Resumed</title>
</head>
<body style="margin:0;padding:0;background-color:#F5F0E8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F0E8;padding:40px 10px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border:1px solid #e5e0d5;max-width:600px;width:100%;">
          <tr>
            <td style="background-color:#0F172A;padding:32px 40px;text-align:center;">
              <span style="font-size:24px;font-weight:800;letter-spacing:4px;color:#B2905F;font-family:Georgia,serif;text-transform:uppercase;">
                ClosetRush
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 40px 20px;text-align:center;">
              <h1 style="margin:0 0 10px;font-size:22px;font-weight:700;color:#0F172A;font-family:Georgia,serif;">
                Subscription Resumed!
              </h1>
              <p style="margin:0;font-size:14px;color:#555;line-height:1.6;">
                Hi ${userName}, welcome back! Your subscription to <strong>${planName}</strong> has been resumed.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px 30px;font-size:13px;color:#555;line-height:1.6;">
              Billing cycles and your sheet swap schedules have been successfully restored. Our logistics team will include your address in our next swap delivery cycle.
            </td>
          </tr>
          <tr>
            <td style="background-color:#0F172A;padding:24px 40px;text-align:center;color:#aaa;font-size:11px;">
              © ${new Date().getFullYear()} ClosetRush. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim()
  };
  await transporter.sendMail(mailOptions);
}

/**
 * Send resume alert email to the admin
 * @param {string} adminEmail - contact support/admin email
 * @param {object} details - details of resume (name, email, phone, planName)
 */
export async function sendResumeEmailToAdmin(adminEmail, details) {
  const { userName, userEmail, userPhone, planName } = details;
  const mailOptions = {
    from: `"ClosetRush Notifications" <${fromEmail}>`,
    to: adminEmail,
    subject: `ALERT: Subscription Resumed by ${userName}`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Subscription Resumed Alert</title>
</head>
<body style="font-family:'Segoe UI',Arial,sans-serif;color:#333;background:#FCFBF9;padding:20px;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #DDD;padding:30px;border-top:4px solid #B2905F;">
    <h2 style="font-family:Georgia,serif;margin-top:0;">Subscription Resumed Alert</h2>
    <p>A customer has resumed their paused subscription plan.</p>
    
    <table width="100%" cellpadding="5" style="border-collapse:collapse;margin:20px 0;font-size:14px;">
      <tr style="background:#F9F9F9;border-bottom:1px solid #EEE;">
        <td width="40%"><strong>Customer Name:</strong></td>
        <td>${userName}</td>
      </tr>
      <tr style="border-bottom:1px solid #EEE;">
        <td><strong>Customer Email:</strong></td>
        <td>${userEmail}</td>
      </tr>
      <tr style="background:#F9F9F9;border-bottom:1px solid #EEE;">
        <td><strong>Customer Phone:</strong></td>
        <td>${userPhone || "Not Provided"}</td>
      </tr>
      <tr style="border-bottom:1px solid #EEE;">
        <td><strong>Resumed Plan:</strong></td>
        <td>${planName}</td>
      </tr>
    </table>
    
    <p style="font-size:13px;color:#666;">
      Please include this address in the upcoming logistics delivery scheduling.
    </p>
  </div>
</body>
</html>
    `.trim()
  };
  await transporter.sendMail(mailOptions);
}

