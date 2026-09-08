import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDatabase } from "../config/database.js";
import { PhishingRound } from "../models/PhishingRound.js";

dotenv.config();

const email = (id, senderEmail, subject, body) => ({
  id,
  senderEmail,
  subject,
  body,
});
const round = (number, emails, correctEmailId, explanation) => ({
  level: 3,
  type: "phishing",
  title: "Identify the phishing email",
  emails,
  correctEmailId,
  explanation,
  difficulty: "Advanced",
  active: true,
  importKey: `L3-Q${String(number).padStart(2, "0")}`,
});

const questions = [
  round(
    1,
    [
      email(
        "A",
        "security@microsoft.com",
        "Unusual sign-in detected",
        "We detected a sign-in to your account from a new device. If this was you, no action is required. You can review recent activity from your Microsoft account.",
      ),
      email(
        "B",
        "account-security@microsoft.com",
        "Your password expires today",
        "Your password will expire today. Please sign in through the Microsoft portal to update it.",
      ),
      email(
        "C",
        "microsoft-security@micros0ft-support.com",
        "URGENT: Account suspension pending",
        "We detected unusual activity on your account. Your access will be suspended within 30 minutes. Verify your identity using the secure link below.",
      ),
      email(
        "D",
        "no-reply@microsoft.com",
        "Security information updated",
        "Your security information was successfully updated.",
      ),
      email(
        "E",
        "notifications@microsoft.com",
        "New Microsoft account activity",
        "You can review recent account activity from your account dashboard.",
      ),
    ],
    "C",
    "Look-alike domain, urgency, and an unsolicited request to verify identity.",
  ),
  round(
    2,
    [
      email(
        "A",
        "alerts@securebank.com",
        "New transaction notification",
        "A transaction of ₹4,850 was completed. If you don't recognize it, review your transactions through the official banking app.",
      ),
      email(
        "B",
        "security@securebank.com",
        "New device registered",
        "A new device was registered on your account.",
      ),
      email(
        "C",
        "securebank-alert@securebank.com",
        "Monthly statement available",
        "Your latest statement is available through online banking.",
      ),
      email(
        "D",
        "securebank.security@gmail.com",
        "URGENT — Account will be frozen",
        "We detected suspicious activity. To prevent your account from being frozen, reply with your card number, CVV and OTP within 15 minutes.",
      ),
      email(
        "E",
        "notifications@securebank.com",
        "Payment successful",
        "Your payment has been processed successfully.",
      ),
    ],
    "D",
    "The sender uses a free email domain, urgency, and asks for card details, CVV, and OTP.",
  ),
  round(
    3,
    [
      email(
        "A",
        "support@amazon.com",
        "Your order has shipped",
        "Your order has been dispatched and is expected to arrive soon.",
      ),
      email(
        "B",
        "order-update@amazon.com",
        "Delivery update",
        "Your package is currently in transit.",
      ),
      email(
        "C",
        "amazon-delivery@amaz0n-support.com",
        "Delivery failed — action required",
        "Our delivery partner could not deliver your package. Pay ₹29 to reschedule delivery.",
      ),
      email(
        "D",
        "no-reply@amazon.com",
        "Your order confirmation",
        "Thank you for your order.",
      ),
      email(
        "E",
        "tracking@amazon.com",
        "Package delivered",
        "Your package was delivered successfully.",
      ),
    ],
    "C",
    "Look-alike domain, unexpected payment request, and urgency.",
  ),
  round(
    4,
    [
      email(
        "A",
        "support@linkedin.com",
        "New connection request",
        "You have a new connection request. Sign in to LinkedIn to view it.",
      ),
      email(
        "B",
        "notifications@linkedin.com",
        "Someone viewed your profile",
        "You can view recent profile activity from your LinkedIn account.",
      ),
      email(
        "C",
        "linkedin-security@linkedln.com",
        "Your account violates our policies",
        "Your account will be permanently restricted unless you appeal within 24 hours. Click here to submit your appeal.",
      ),
      email(
        "D",
        "messages-noreply@linkedin.com",
        "New message",
        "You have received a new message.",
      ),
      email(
        "E",
        "jobs-noreply@linkedin.com",
        "Job recommendation",
        "We found job opportunities that may match your profile.",
      ),
    ],
    "C",
    "The domain is a look-alike spelling, combined with a threat and urgency.",
  ),
  round(
    5,
    [
      email(
        "A",
        "support@dropbox.com",
        "Storage notification",
        "You are currently using 85% of your available storage.",
      ),
      email(
        "B",
        "no-reply@dropbox.com",
        "New login detected",
        "A new device signed into your account.",
      ),
      email(
        "C",
        "dropbox-support@dropbox.com",
        "Account verification required",
        "Please review your account information through the Dropbox website.",
      ),
      email(
        "D",
        "dropbox-security@dropboxverify.com",
        "Your files are scheduled for deletion",
        "Your account has exceeded its storage limit. Download the attached verification file and sign in to prevent deletion.",
      ),
      email(
        "E",
        "notifications@dropbox.com",
        "Shared folder notification",
        "A folder has been shared with you.",
      ),
    ],
    "D",
    "Fake domain, threatening deadline, and suspicious attachment.",
  ),
  round(
    6,
    [
      email(
        "A",
        "hr@company.com",
        "Updated leave policy",
        "The updated leave policy is available on the employee portal.",
      ),
      email(
        "B",
        "hr-notifications@company.com",
        "Performance review reminder",
        "Your performance review is scheduled for next week.",
      ),
      email(
        "C",
        "hr@company.com",
        "Employee survey",
        "Please complete the annual employee survey through the employee portal.",
      ),
      email(
        "D",
        "hr-team@company-payroll.com",
        "Salary verification required",
        "Your salary account could not be verified. Open the attached Excel file and enter your banking credentials.",
      ),
      email(
        "E",
        "learning@company.com",
        "Mandatory training reminder",
        "Please complete your assigned training.",
      ),
    ],
    "D",
    "External look-alike domain, suspicious attachment, and request for banking credentials.",
  ),
  round(
    7,
    [
      email(
        "A",
        "security@google.com",
        "New sign-in detected",
        "A new sign-in was detected. Review your account activity if you don't recognize it.",
      ),
      email(
        "B",
        "accounts-noreply@google.com",
        "Security alert",
        "Your account security information has been updated.",
      ),
      email(
        "C",
        "google.security-team@gmail.com",
        "Critical security warning",
        "Your Google account has been compromised. Send us the verification code you receive on your phone to restore access.",
      ),
      email(
        "D",
        "notifications@google.com",
        "New device connected",
        "A new device was connected to your account.",
      ),
      email(
        "E",
        "support@google.com",
        "Account recovery information",
        "Your account recovery information is available in your account settings.",
      ),
    ],
    "C",
    "Fake sender, request for a verification code, and fear-based language.",
  ),
  round(
    8,
    [
      email(
        "A",
        "support@spotify.com",
        "Your subscription receipt",
        "Your subscription payment has been successfully processed.",
      ),
      email(
        "B",
        "billing@spotify.com",
        "Payment method updated",
        "Your payment information has been updated.",
      ),
      email(
        "C",
        "spotify-billing@spotify.com",
        "Subscription renewal",
        "Your subscription will renew automatically.",
      ),
      email(
        "D",
        "spotify-refund@spotify-billing.net",
        "Refund available — claim within 2 hours",
        "You are eligible for a ₹1,200 refund. Confirm your card number and CVV using the link below.",
      ),
      email(
        "E",
        "notifications@spotify.com",
        "New music recommendations",
        "Here are this week's recommendations.",
      ),
    ],
    "D",
    "Look-alike domain, time pressure, and request for card security information.",
  ),
  round(
    9,
    [
      email(
        "A",
        "support@courier.com",
        "Package out for delivery",
        "Your package is scheduled for delivery today.",
      ),
      email(
        "B",
        "tracking@courier.com",
        "Delivery update",
        "Your package is currently in transit.",
      ),
      email(
        "C",
        "delivery@courier.com",
        "Address confirmation",
        "Please review your delivery address through your account.",
      ),
      email(
        "D",
        "courier-delivery@courier-update.com",
        "Delivery failed",
        "Your package could not be delivered. Pay ₹25 through the link below to schedule another attempt.",
      ),
      email(
        "E",
        "notifications@courier.com",
        "Package delivered",
        "Your package was successfully delivered.",
      ),
    ],
    "D",
    "Untrusted domain, unexpected payment request, and urgency.",
  ),
  round(
    10,
    [
      email(
        "A",
        "security@instagram.com",
        "New login",
        "A new login was detected. Review your login activity from the Instagram app.",
      ),
      email(
        "B",
        "notifications@instagram.com",
        "New follower",
        "You have a new follower.",
      ),
      email(
        "C",
        "instagram-help@instagram.com",
        "Account security",
        "You can review your security settings from the Instagram app.",
      ),
      email(
        "D",
        "instagram-support@instagrarn.com",
        "Copyright violation — appeal required",
        "Your account will be permanently disabled unless you complete the appeal form within 12 hours.",
      ),
      email(
        "E",
        "mail@instagram.com",
        "New message",
        "You have received a new message.",
      ),
    ],
    "D",
    "The sender domain is a look-alike spelling and uses a threatening deadline.",
  ),
  round(
    11,
    [
      email(
        "A",
        "billing@adobe.com",
        "Payment confirmation",
        "Your Adobe subscription payment has been processed.",
      ),
      email(
        "B",
        "notifications@adobe.com",
        "New sign-in",
        "A new sign-in was detected on your Adobe account.",
      ),
      email(
        "C",
        "adobe-billing@adobe.com",
        "Subscription renewal",
        "Your subscription is scheduled for renewal.",
      ),
      email(
        "D",
        "adobe.support@adobe-verification.com",
        "Payment failed",
        "Your account will be suspended today. Open the attached PDF and update your payment information.",
      ),
      email(
        "E",
        "support@adobe.com",
        "Product update",
        "A new version of your application is available.",
      ),
    ],
    "D",
    "Impersonation domain, urgent suspension threat, and suspicious attachment.",
  ),
  round(
    12,
    [
      email(
        "A",
        "support@paypal.com",
        "Payment received",
        "Your payment has been successfully received.",
      ),
      email(
        "B",
        "service@paypal.com",
        "Account notification",
        "Please review recent activity in your PayPal account.",
      ),
      email(
        "C",
        "paypal-security@paypa1.com",
        "Account limitation",
        "Your account has been temporarily limited. Click below and confirm your password and card information to restore access.",
      ),
      email(
        "D",
        "notifications@paypal.com",
        "Money received",
        "You've received a payment.",
      ),
      email(
        "E",
        "billing@paypal.com",
        "Transaction receipt",
        "Your transaction receipt is available.",
      ),
    ],
    "C",
    "Look-alike domain and a request for password and card information.",
  ),
  round(
    13,
    [
      email(
        "A",
        "support@zoom.us",
        "Meeting invitation",
        "You have been invited to a meeting.",
      ),
      email(
        "B",
        "no-reply@zoom.us",
        "Meeting recording available",
        "The meeting recording is available.",
      ),
      email(
        "C",
        "zoom-support@zoom-meeting.net",
        "Meeting access issue",
        "Your Zoom account needs verification. Download the attached file and sign in using your Zoom credentials.",
      ),
      email(
        "D",
        "notifications@zoom.us",
        "Upcoming meeting reminder",
        "Your meeting begins in 30 minutes.",
      ),
      email(
        "E",
        "support@zoom.us",
        "Password reset request",
        "A password reset was requested. If this wasn't you, secure your account through Zoom.",
      ),
    ],
    "C",
    "Impersonation domain, suspicious attachment, and credential request.",
  ),
  round(
    14,
    [
      email(
        "A",
        "admin@company.com",
        "Scheduled maintenance",
        "The internal portal will be unavailable from 11 PM to 1 AM.",
      ),
      email(
        "B",
        "it-support@company.com",
        "Password policy update",
        "Our password policy has been updated. Please review the changes on the employee portal.",
      ),
      email(
        "C",
        "IT-Security@company.com",
        "Security awareness training",
        "Your security awareness training is due next Friday.",
      ),
      email(
        "D",
        "it-helpdesk@company-login.com",
        "Mailbox storage exceeded",
        "Your mailbox is 99% full. Failure to verify your account within 1 hour will result in permanent email deletion.",
      ),
      email(
        "E",
        "support@company.com",
        "System update",
        "Several systems will be updated this weekend.",
      ),
    ],
    "D",
    "External look-alike domain and a threatening verification deadline.",
  ),
  round(
    15,
    [
      email(
        "A",
        "support@airline.com",
        "Booking confirmed",
        "Your flight booking has been confirmed.",
      ),
      email(
        "B",
        "notifications@airline.com",
        "Check-in reminder",
        "Online check-in is now available.",
      ),
      email(
        "C",
        "airline-refund@airline.com",
        "Refund processed",
        "Your refund has been initiated.",
      ),
      email(
        "D",
        "airline-support@airline-refunds.net",
        "Flight refund pending",
        "To receive your refund immediately, confirm your card details and OTP using the secure form.",
      ),
      email(
        "E",
        "booking@airline.com",
        "Itinerary update",
        "Your itinerary has been updated.",
      ),
    ],
    "D",
    "Look-alike refund domain and request for card details and OTP.",
  ),
  round(
    16,
    [
      email(
        "A",
        "support@cloudservice.com",
        "Storage report",
        "Your monthly storage report is ready.",
      ),
      email(
        "B",
        "security@cloudservice.com",
        "Login notification",
        "A new device signed into your account.",
      ),
      email(
        "C",
        "cloudservice-security@cloudservice.com",
        "Security update",
        "Please review your account security settings.",
      ),
      email(
        "D",
        "cloudservice-alert@cloudservlce.com",
        "Immediate action required",
        "We detected malicious activity. Download the attached security tool and run it immediately to secure your account.",
      ),
      email(
        "E",
        "billing@cloudservice.com",
        "Invoice available",
        "Your latest invoice is available.",
      ),
    ],
    "D",
    "The domain contains a look-alike character, urgent language, and a suspicious download.",
  ),
  round(
    17,
    [
      email(
        "A",
        "support@socialnetwork.com",
        "Privacy policy update",
        "Our privacy policy has been updated.",
      ),
      email(
        "B",
        "notifications@socialnetwork.com",
        "New message",
        "You have received a new message.",
      ),
      email(
        "C",
        "socialnetwork-security@socialnetwork.com",
        "Security alert",
        "Review recent login activity through your account.",
      ),
      email(
        "D",
        "socialnetwork.verify@socialnetwork-mail.com",
        "Your account has been reported",
        "Several complaints have been filed against your account. Download the attached form and provide your password to prevent permanent suspension.",
      ),
      email(
        "E",
        "support@socialnetwork.com",
        "New feature available",
        "A new privacy feature is now available.",
      ),
    ],
    "D",
    "External look-alike domain, suspicious attachment, password request, and threat.",
  ),
  round(
    18,
    [
      email(
        "A",
        "finance@company.com",
        "Invoice approval required",
        "Please review the pending invoice through the finance portal.",
      ),
      email(
        "B",
        "accounts@company.com",
        "Monthly financial report",
        "The monthly report is now available.",
      ),
      email(
        "C",
        "finance@company.com",
        "Payment schedule",
        "Payments scheduled for this month are listed in the finance system.",
      ),
      email(
        "D",
        "finance-director@company-mail.com",
        "Urgent — Confidential",
        "I am travelling and need this invoice paid immediately. Do not contact anyone else. Purchase gift cards and send the activation codes to me.",
      ),
      email(
        "E",
        "billing@company.com",
        "Expense report reminder",
        "Please submit your pending expenses.",
      ),
    ],
    "D",
    "External sender, secrecy instruction, urgency, and gift-card fraud request.",
  ),
  round(
    19,
    [
      email(
        "A",
        "support@streaming.com",
        "New content available",
        "New content is available on your account.",
      ),
      email(
        "B",
        "billing@streaming.com",
        "Subscription renewed",
        "Your subscription has been successfully renewed.",
      ),
      email(
        "C",
        "security@streaming.com",
        "New login detected",
        "A new device signed into your account.",
      ),
      email(
        "D",
        "streaming-support@streamlng.com",
        "Payment verification required",
        "Your payment could not be verified. Confirm your card number and security code within 24 hours.",
      ),
      email(
        "E",
        "notifications@streaming.com",
        "Recommended for you",
        "We've selected some recommendations based on your viewing history.",
      ),
    ],
    "D",
    "Look-alike domain, payment pressure, and request for card security information.",
  ),
  round(
    20,
    [
      email(
        "A",
        "support@online-store.com",
        "Order confirmation",
        "Your order has been confirmed.",
      ),
      email(
        "B",
        "orders@online-store.com",
        "Your order has shipped",
        "Your order has been dispatched.",
      ),
      email(
        "C",
        "online-store-support@online-store.com",
        "Delivery update",
        "Your package is currently in transit.",
      ),
      email(
        "D",
        "online-store@order-confirmation.net",
        "Your order has been cancelled",
        "Your order has been cancelled due to a payment issue. Re-enter your card details using the link below to reactivate the order.",
      ),
      email(
        "E",
        "notifications@online-store.com",
        "Order delivered",
        "Your order was delivered successfully.",
      ),
    ],
    "D",
    "Untrusted domain, cancellation pressure, and request to re-enter card details.",
  ),
  round(
    21,
    [
      email(
        "A",
        "security@banking.com",
        "Login notification",
        "A login was detected from a new device.",
      ),
      email(
        "B",
        "alerts@banking.com",
        "Transaction alert",
        "A transaction was completed using your account.",
      ),
      email(
        "C",
        "banking-security@banking.com",
        "Security settings",
        "Your security settings were recently updated.",
      ),
      email(
        "D",
        "banking-alert@banking-support.com",
        "Unusual activity detected",
        "To secure your account, download the attached HTML file and enter your banking username, password and OTP.",
      ),
      email(
        "E",
        "notifications@banking.com",
        "Statement ready",
        "Your monthly statement is now available.",
      ),
    ],
    "D",
    "Look-alike domain, malicious HTML attachment, and request for credentials and OTP.",
  ),
  round(
    22,
    [
      email(
        "A",
        "support@videocall.com",
        "Meeting reminder",
        "Your meeting begins at 2:00 PM.",
      ),
      email(
        "B",
        "notifications@videocall.com",
        "Recording available",
        "Your meeting recording is ready.",
      ),
      email(
        "C",
        "videocall-security@videocall.com",
        "Account alert",
        "A new device signed into your account.",
      ),
      email(
        "D",
        "videocall-support@videocall-secure.com",
        "Account verification",
        "Your account requires immediate verification. Click here and enter your password. Failure to verify within 30 minutes will result in account suspension.",
      ),
      email(
        "E",
        "support@videocall.com",
        "Application update",
        "A new application update is available.",
      ),
    ],
    "D",
    "Look-alike domain, password request, and account-suspension threat.",
  ),
  round(
    23,
    [
      email(
        "A",
        "notifications@payment.com",
        "Payment successful",
        "Your payment was processed successfully.",
      ),
      email(
        "B",
        "support@payment.com",
        "Transaction receipt",
        "Your transaction receipt is available.",
      ),
      email(
        "C",
        "security@payment.com",
        "New device login",
        "A new device was used to access your account.",
      ),
      email(
        "D",
        "payment-security@paymеnt.com",
        "Account verification required",
        "Your account has been flagged for suspicious activity. Verify your identity immediately using the link below.",
      ),
      email(
        "E",
        "billing@payment.com",
        "Invoice available",
        "Your invoice is ready.",
      ),
    ],
    "D",
    "The sender uses a look-alike Unicode domain and urgent identity-verification language.",
  ),
  round(
    24,
    [
      email(
        "A",
        "support@jobportal.com",
        "New job recommendations",
        "We found several jobs that match your profile.",
      ),
      email(
        "B",
        "notifications@jobportal.com",
        "Application update",
        "Your application status has changed.",
      ),
      email(
        "C",
        "recruitment@jobportal.com",
        "Interview invitation",
        "You have been shortlisted for an interview.",
      ),
      email(
        "D",
        "jobportal-careers@jobporta1.com",
        "Congratulations — job offer",
        "Congratulations! You have been selected. Pay ₹999 for background verification and upload your identity documents using the link below.",
      ),
      email(
        "E",
        "support@jobportal.com",
        "Profile update reminder",
        "Please keep your profile information updated.",
      ),
    ],
    "D",
    "Look-alike domain, advance payment request, and identity-document collection.",
  ),
  round(
    25,
    [
      email(
        "A",
        "security@cloud.com",
        "Password changed",
        "Your password was successfully changed.",
      ),
      email(
        "B",
        "notifications@cloud.com",
        "New device login",
        "A new device signed into your account.",
      ),
      email(
        "C",
        "billing@cloud.com",
        "Subscription renewal",
        "Your subscription will renew next month.",
      ),
      email(
        "D",
        "cloud-security@cloud.com",
        "Account protection",
        "You can review your security settings from your account.",
      ),
      email(
        "E",
        "cloud-security@cloud-secure.net",
        "Critical malware alert",
        "We detected malware associated with your account. Download the attached scanner and run it immediately. Do not close this email until the scan is complete.",
      ),
    ],
    "E",
    "Look-alike domain, suspicious attachment, urgent malware claim, and coercive instruction.",
  ),
];

const run = async () => {
  const connected = await connectDatabase();
  if (!connected)
    throw new Error("MongoDB is not connected. Configure backend/.env first.");

  await PhishingRound.deleteMany({ level: 3 });
  await PhishingRound.insertMany(questions);
  console.log(`Seeded ${questions.length} Level 3 phishing rounds.`);
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect();
  process.exitCode = 1;
});
