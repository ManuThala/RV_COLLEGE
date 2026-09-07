import type { PhishingRound } from '../types'

const baseEmails = [
  {
    id: 'E-BASE-01',
    senderName: 'IT Security Team', senderEmail: 'security@campus.edu', subject: 'Password renewal required', dateTime: '09:14 AM', body: 'Your password must be renewed within 24 hours to maintain account access.', link: 'https://secure-campus.edu/reset', attachment: '', suspicious: false, reasons: ['Official channel', 'Recognized domain'],
  },
  {
    id: 'E-BASE-02',
    senderName: 'Banking Portal', senderEmail: 'alerts@banking-portal.co', subject: 'Unusual login detected', dateTime: '08:51 AM', body: 'We noticed a login from a new device. Please verify your account urgently.', link: 'https://banking-portal.co/verify', attachment: '', suspicious: true, reasons: ['Urgent tone', 'Suspicious domain'],
  },
  {
    id: 'E-BASE-03',
    senderName: 'University HR', senderEmail: 'hr@campus.edu', subject: 'Payroll update', dateTime: 'Yesterday', body: 'Your payroll record has been updated and your direct deposit schedule is attached.', link: '', attachment: 'payroll.pdf', suspicious: false, reasons: ['Valid sender', 'Expected doc'],
  },
  {
    id: 'E-BASE-04',
    senderName: 'Cloud Storage', senderEmail: 'storage@cloudsync.net', subject: 'Storage limit reached', dateTime: '06:00 AM', body: 'Your shared drive is at 99% usage. Upgrade now to avoid file loss.', link: 'https://cloudsync.net/upgrade', attachment: '', suspicious: false, reasons: ['Legitimate brand behavior'],
  },
  {
    id: 'E-BASE-05',
    senderName: 'PayPal Support', senderEmail: 'payment-support@paypal-verify.app', subject: 'Review your recent charge', dateTime: '07:22 AM', body: 'Please confirm your account before the charge is released.', link: 'https://paypal-verify.app/confirm', attachment: '', suspicious: true, reasons: ['Lookalike domain', 'Urgent ask'],
  },
  {
    id: 'E-BASE-06',
    senderName: 'IT Helpdesk', senderEmail: 'helpdesk@college.edu', subject: 'New device sign-in', dateTime: '10:02 AM', body: 'A new device accessed your account from a different campus building.', link: '', attachment: '', suspicious: false, reasons: ['Internal helpdesk'],
  },
  {
    id: 'E-BASE-07',
    senderName: 'Shipping Team', senderEmail: 'fulfillment@shipment-order.com', subject: 'Package delayed', dateTime: '05:08 AM', body: 'Your package is delayed. Review delivery information here.', link: 'https://shipment-order.com/track', attachment: '', suspicious: false, reasons: ['Common shipping workflow'],
  },
  {
    id: 'E-BASE-08',
    senderName: 'Account Protection', senderEmail: 'security@paypa1.com', subject: 'Action required: account disabled', dateTime: '03:41 PM', body: 'Your account access has been temporarily disabled. Please enter your OTP to restore access.', link: 'https://paypa1.com/restore', attachment: '', suspicious: true, reasons: ['Typo in domain', 'Asks for OTP'],
  },
  {
    id: 'E-BASE-09',
    senderName: 'Campus Library', senderEmail: 'library@campus.edu', subject: 'Book return reminder', dateTime: '11:10 AM', body: 'Your overdue book is due today. Please return it at the desk.', link: '', attachment: '', suspicious: false, reasons: ['Routine notice'],
  },
  {
    id: 'E-BASE-10',
    senderName: 'Office Admin', senderEmail: 'admin@office-task.com', subject: 'Invoice for review', dateTime: '08:04 AM', body: 'Please review the attached invoice before noon.', link: '', attachment: 'invoice.pdf', suspicious: false, reasons: ['Expected business doc'],
  },
  {
    id: 'E-BASE-11',
    senderName: 'Payroll', senderEmail: 'payroll@company.org', subject: 'Direct deposit change request', dateTime: '09:36 AM', body: 'Your direct deposit information changed. Open the secure portal to approve the update.', link: 'https://company-org-secure.net/approve', attachment: '', suspicious: true, reasons: ['External link mismatch', 'Unexpected change request'],
  },
  {
    id: 'E-BASE-12',
    senderName: 'Microsoft Teams', senderEmail: 'alerts@teams.microsoft.com', subject: 'Meeting canceled', dateTime: '12:42 PM', body: 'Your scheduled meeting has been moved. Open the calendar link for details.', link: 'https://teams.microsoft.com/calendar', attachment: '', suspicious: false, reasons: ['Trusted domain'],
  },
  {
    id: 'E-BASE-13',
    senderName: 'Finance Team', senderEmail: 'accounts@financecorp.net', subject: 'Payment confirmation', dateTime: '02:19 PM', body: 'The payment approval is still pending. Kindly check the attached invoice.', link: '', attachment: 'payment-confirmation.xls', suspicious: false, reasons: ['Known domain'],
  },
  {
    id: 'E-BASE-14',
    senderName: 'Cloud Backup', senderEmail: 'backup@securecloudbackup.cloud', subject: 'Backup failure notice', dateTime: '04:17 PM', body: 'Critical backup failed. Confirm account access and restore configuration.', link: 'https://securecloudbackup.cloud/confirm', attachment: '', suspicious: false, reasons: ['Brand-consistent'],
  },
  {
    id: 'E-BASE-15',
    senderName: 'OpenAI Support', senderEmail: 'support@openai-verify.online', subject: 'Use your account now', dateTime: '01:05 PM', body: 'We have noticed unusual activity. Click here to log in and verify your account immediately.', link: 'https://openai-verify.online/login', attachment: '', suspicious: true, reasons: ['Lookalike domain', 'Urgent login pressure'],
  },
  {
    id: 'E-BASE-16',
    senderName: 'Student Services', senderEmail: 'students@campus.edu', subject: 'Registration reminder', dateTime: '03:00 PM', body: 'Please complete your registration checklist before the final day.', link: '', attachment: '', suspicious: false, reasons: ['Legit school portal'],
  },
  {
    id: 'E-BASE-17',
    senderName: 'Amazon', senderEmail: 'order-update@amazon.com', subject: 'Your delivery has been rescheduled', dateTime: '10:14 AM', body: 'Track your new delivery slot and confirm your address.', link: 'https://amazon-com.co/track', attachment: '', suspicious: true, reasons: ['Lookalike domain', 'Unexpected tracking prompt'],
  },
  {
    id: 'E-BASE-18',
    senderName: 'Research Lab', senderEmail: 'lab@research-institute.edu', subject: 'Grant document', dateTime: '06:55 AM', body: 'Your proposal review has been completed. Attached is the final version.', link: '', attachment: 'proposal-final.docx', suspicious: false, reasons: ['Known sender'],
  },
  {
    id: 'E-BASE-19',
    senderName: 'DocuSign', senderEmail: 'noreply@docusign-verify.net', subject: 'Action required: signature needed', dateTime: '08:55 AM', body: 'Your document is waiting for signature. Please review and sign immediately.', link: 'https://docusign-verify.net/sign', attachment: '', suspicious: true, reasons: ['Lookalike brand', 'Generic urgency'],
  },
  {
    id: 'E-BASE-20',
    senderName: 'Library Overdue', senderEmail: 'books@library-system.net', subject: 'Fee notice', dateTime: 'Yesterday', body: 'Your recent check-out has accrued a late fee. Pay the fee now to avoid restrictions.', link: 'https://library-system.net/pay', attachment: '', suspicious: false, reasons: ['Contextual and recognized'],
  },
  {
    id: 'E-BASE-21',
    senderName: 'MFA Protection', senderEmail: 'mfa@secure-login.io', subject: 'Multiple device warning', dateTime: '09:10 AM', body: 'We detected multiple sign-ins. Confirm your account to continue.', link: 'https://secure-login.io/confirm', attachment: '', suspicious: false, reasons: ['Trusted service'],
  },
  {
    id: 'E-BASE-22',
    senderName: 'IT Admin', senderEmail: 'admin@campus.edu', subject: 'Software update', dateTime: '08:33 AM', body: 'Your device needs a software patch before end of day. Please schedule a reboot.', link: '', attachment: '', suspicious: false, reasons: ['Internal process'],
  },
  {
    id: 'E-BASE-23',
    senderName: 'Credit Card Company', senderEmail: 'support@creditcard-alerts.com', subject: 'Unusual card activity', dateTime: '11:17 AM', body: 'We detected unusual activity and require you to verify your card.', link: 'https://card-alerts.security-review.com/verify', attachment: '', suspicious: true, reasons: ['Urgent card claim', 'Untrusted domain'],
  },
  {
    id: 'E-BASE-24',
    senderName: 'Office Supplies', senderEmail: 'orders@officesupplies.biz', subject: 'Reorder reminder', dateTime: '07:49 AM', body: 'Your order is ready to reorder. Visit the supplier portal to confirm.', link: 'https://officesupplies.biz/order', attachment: '', suspicious: false, reasons: ['Business context'],
  },
  {
    id: 'E-BASE-25',
    senderName: 'Human Resources', senderEmail: 'hr@company.co', subject: 'Benefits enrollment', dateTime: '02:41 PM', body: 'Your annual enrollment window closes today. Log in to review benefits.', link: 'https://company.co/login', attachment: '', suspicious: false, reasons: ['Valid internal sender'],
  },
  {
    id: 'E-BASE-26',
    senderName: 'Web Hosting', senderEmail: 'support@webhost-urgent.net', subject: 'Server outage alert', dateTime: '04:03 PM', body: 'Your server is under threat. Please login immediately to review incidents and reset access.', link: 'https://webhost-urgent.net/reset', attachment: '', suspicious: true, reasons: ['Urgent threat', 'Unexpected login ask'],
  },
  {
    id: 'E-BASE-27',
    senderName: 'Campus Finance', senderEmail: 'finance@campus.edu', subject: 'Tuition payment due', dateTime: '12:20 PM', body: 'Your payment deadline is approaching. Use the student portal to complete your balance.', link: '', attachment: '', suspicious: false, reasons: ['Expected institution'],
  },
  {
    id: 'E-BASE-28',
    senderName: 'Travel Booking', senderEmail: 'trips@booking-portal.co', subject: 'Flight itinerary', dateTime: '06:41 AM', body: 'Your itinerary is confirmed. Review attached trip details and seat assignment.', link: '', attachment: 'itinerary.pdf', suspicious: false, reasons: ['Routine itinerary'],
  },
  {
    id: 'E-BASE-29',
    senderName: 'Support Desk', senderEmail: 'support@service-center.online', subject: 'Verify your account', dateTime: '08:01 AM', body: 'We have blocked your account. Submit your password now so we can restore access.', link: 'https://service-center.online/restore', attachment: '', suspicious: true, reasons: ['Requests password', 'Urgent tone'],
  },
  {
    id: 'E-BASE-30',
    senderName: 'Network Admin', senderEmail: 'admin@network.campus.edu', subject: 'Network maintenance scheduled', dateTime: 'Yesterday', body: 'Scheduled maintenance on your network segment tomorrow from 2-3 AM. Minimal impact expected.', link: '', attachment: '', suspicious: false, reasons: ['Internal IT notice', 'Expected maintenance'],
  },
]

const roundTemplates = [
  { title: 'Password reset request', correctIndex: 1, suspiciousIndex: 1 },
  { title: 'Urgent security alert', correctIndex: 5, suspiciousIndex: 7 },
  { title: 'Shared drive warning', correctIndex: 3, suspiciousIndex: 4 },
  { title: 'Direct payment review', correctIndex: 9, suspiciousIndex: 10 },
  { title: 'New sign-in warning', correctIndex: 5, suspiciousIndex: 1 },
  { title: 'Payroll update', correctIndex: 2, suspiciousIndex: 10 },
  { title: 'Action required for account access', correctIndex: 13, suspiciousIndex: 14 },
  { title: 'Cloud storage ticket', correctIndex: 13, suspiciousIndex: 0 },
  { title: 'Delayed package alert', correctIndex: 6, suspiciousIndex: 16 },
  { title: 'Review invoice', correctIndex: 9, suspiciousIndex: 16 },
  { title: 'Confirm account status', correctIndex: 20, suspiciousIndex: 28 },
  { title: 'Software patch notice', correctIndex: 22, suspiciousIndex: 23 },
  { title: 'Confirm direct deposit', correctIndex: 10, suspiciousIndex: 14 },
  { title: 'Payment failed notification', correctIndex: 23, suspiciousIndex: 8 },
  { title: 'Secure sign-in review', correctIndex: 20, suspiciousIndex: 15 },
  { title: 'Order tracking issue', correctIndex: 16, suspiciousIndex: 17 },
  { title: 'Document signature request', correctIndex: 18, suspiciousIndex: 19 },
  { title: 'Travel itinerary update', correctIndex: 27, suspiciousIndex: 29 },
  { title: 'Suspicious account verification', correctIndex: 21, suspiciousIndex: 26 },
  { title: 'Access timeout warning', correctIndex: 5, suspiciousIndex: 28 },
  { title: 'Review cloud backup alert', correctIndex: 13, suspiciousIndex: 25 },
  { title: 'Campus registration reminder', correctIndex: 15, suspiciousIndex: 1 },
  { title: 'Security challenge confirmation', correctIndex: 20, suspiciousIndex: 24 },
  { title: 'Support restoration request', correctIndex: 28, suspiciousIndex: 29 },
  { title: 'Critical server notice', correctIndex: 25, suspiciousIndex: 24 },
  { title: 'New session alert', correctIndex: 20, suspiciousIndex: 6 },
  { title: 'Payment authorization', correctIndex: 10, suspiciousIndex: 11 },
  { title: 'Meeting update request', correctIndex: 11, suspiciousIndex: 1 },
  { title: 'Benefits reminder', correctIndex: 24, suspiciousIndex: 20 },
  { title: 'Library fee notice', correctIndex: 19, suspiciousIndex: 28 },
]

export const level3Rounds: PhishingRound[] = roundTemplates.map((round, index) => {
  const emails = shuffleRound(baseEmails, round.correctIndex)
  // The designed "correct" email must be identified from the source list, not the
  // post-shuffle array — its position in `emails` is randomized by the shuffle below.
  const correct = baseEmails[round.correctIndex].id
  return {
    id: `L3-R${String(index + 1).padStart(2, '0')}`,
    title: round.title,
    emails,
    correctEmailId: correct,
    explanation: 'The phishing email uses urgency, a suspicious sender or domain, and a request for credentials or an OTP. Legitimate notices typically use the correct brand and expected context.',
    active: true,
  }
})

function shuffleRound(items: typeof baseEmails, correctIndex: number): typeof baseEmails {
  const list = [...items]
  const selected = list.splice(correctIndex, 1)[0]
  const rest = list.slice(0, 4)
  const mixed = [selected, ...rest]
  const shuffled = [...mixed]
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}
