import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDatabase } from "../config/database.js";
import { MalwareRound } from "../models/MalwareRound.js";

dotenv.config();

const file = (id, name) => ({
  id,
  name,
  extension: name.includes(".") ? `.${name.split(".").pop()}` : "",
  type: "file",
  suspicious: false,
});

const round = (number, names, correctFileId, explanation) => ({
  level: 4,
  type: "malware",
  title: "Identify the malicious file",
  files: names.map((name, index) => file(String(index + 1), name)),
  correctFileId: String(correctFileId),
  explanation,
  difficulty: "Advanced",
  active: true,
  importKey: `L4-Q${String(number).padStart(2, "0")}`,
});

const questions = [
  round(
    1,
    [
      "Invoice_March2026.pdf",
      "Family_Photos.zip",
      "Report_Q1.docx.exe",
      "Meeting_Notes.txt",
      "Presentation.pptx",
    ],
    3,
    "Double extension (.docx.exe) disguises an executable as a Word document.",
  ),
  round(
    2,
    [
      "Holiday_Pics.jpg",
      "Salary_Slip.pdf",
      "Setup_FlashPlayerUpdate.scr",
      "Team_Roster.xlsx",
      "Project_Plan.docx",
    ],
    3,
    ".scr is a screensaver-executable extension commonly used to disguise malware as a harmless update.",
  ),
  round(
    3,
    [
      "Budget_2026.xlsx",
      "WinRAR_Installer.exe (from official vendor, verified)",
      "free_movie_download.torrent.exe",
      "Company_Logo.png",
      "Client_List.csv",
    ],
    3,
    "Torrent/movie-file names with an .exe tail are a classic malware-bundling trick.",
  ),
  round(
    4,
    [
      "Photo_2026-01-15.jpg",
      "Resume_JohnDoe.pdf",
      "svch0st.exe",
      "Notes.txt",
      "Quarterly_Report.docx",
    ],
    3,
    "Mimics the legitimate Windows process svchost.exe with a zero substituted for o.",
  ),
  round(
    5,
    [
      "Vacation_Itinerary.pdf",
      "Invoice_774521.html (opens a fake login page)",
      "Team_Photo.png",
      "Expense_Report.xlsx",
      "Agenda.docx",
    ],
    2,
    "A disguised HTML file loads a phishing or credential-stealing page instead of a real invoice.",
  ),
  round(
    6,
    [
      "readme.txt",
      "system32_update.bat",
      "Company_Handbook.pdf",
      "Org_Chart.pptx",
      "Contacts.vcf",
    ],
    2,
    "An unsolicited .bat script referencing a core system folder can execute arbitrary malicious commands.",
  ),
  round(
    7,
    [
      "Wedding_Invite.docm (macro-enabled, unknown sender)",
      "Holiday_Card.jpg",
      "Music_Playlist.mp3",
      "Family_Budget.xlsx",
      "Recipe_Book.pdf",
    ],
    1,
    ".docm is macro-enabled and an unknown sender is a common vector for macro-based malware.",
  ),
  round(
    8,
    [
      "Sales_Deck.pptx",
      "Annual_Report.pdf",
      "update_flash_player_now.jar",
      "Employee_Handbook.docx",
      "Payroll_Summary.xlsx",
    ],
    3,
    "An unsolicited Java archive posing as a Flash update can drop malware.",
  ),
  round(
    9,
    [
      "Photo_Backup.zip",
      "hidden_x7f2q9z.exe (randomly-named hidden file)",
      "Client_Agreement.pdf",
      "Timesheet.xlsx",
      "Company_Newsletter.pdf",
    ],
    2,
    "A random alphanumeric filename and hidden attribute are classic signs of dropped malware.",
  ),
  round(
    10,
    [
      "Project_Charter.docx",
      "Server_Backup.tar.gz",
      "invoice_view.pdf.js",
      "Team_Calendar.ics",
      "Budget_Forecast.xlsx",
    ],
    3,
    "A double extension ending in .js disguises a script as a PDF.",
  ),
  round(
    11,
    [
      "Q1_Financials.xlsx",
      "urgent_password_reset.html",
      "Company_Policy.pdf",
      "Onboarding_Guide.docx",
      "IT_Asset_List.csv",
    ],
    2,
    "A locally-saved HTML password-reset page is typically a phishing or credential-capture tool.",
  ),
  round(
    12,
    [
      "Client_Presentation.pptx",
      "Network_Diagram.vsdx",
      "RemoteAccessTool_unsigned.exe",
      "Server_Logs.txt",
      "Backup_Schedule.xlsx",
    ],
    3,
    "An unsigned remote-access tool with no verified publisher can disguise a Remote Access Trojan.",
  ),
  round(
    13,
    [
      "Event_Flyer.pdf",
      "Team_Photo.png",
      "READ_ME_TO_DECRYPT.txt (appears alongside encrypted files)",
      "Agenda_Meeting.docx",
      "Budget_Sheet.xlsx",
    ],
    3,
    "A ransom note accompanying encrypted files is a signature of ransomware infection.",
  ),
  round(
    14,
    [
      "Company_Brochure.pdf",
      "install_codec_pack.exe (unsigned, from pop-up ad)",
      "Sales_Figures.xlsx",
      "Team_Org_Chart.pptx",
      "Client_Feedback.docx",
    ],
    2,
    "Codec-pack installers pushed via pop-up ads are a long-running malware-delivery scam.",
  ),
  round(
    15,
    [
      "Meeting_Minutes.docx",
      "Product_Catalog.pdf",
      "free_giftcard_generator.exe",
      "Company_Logo.svg",
      "Employee_Directory.csv",
    ],
    3,
    "Generator tools promising free gift cards are almost always malware or scam payloads.",
  ),
  round(
    16,
    [
      "Invoice_Jan.pdf",
      "keylogger_svc.dll (unexpected DLL in Documents folder)",
      "Sales_Report.xlsx",
      "Team_Notes.txt",
      "Presentation_Final.pptx",
    ],
    2,
    "A DLL suggesting keylogging behavior outside a normal system folder is a major red flag.",
  ),
  round(
    17,
    [
      "Photo_Album.zip",
      "Bank_Statement.pdf",
      "system_optimizer_pro_crack.exe",
      "Notes_App.txt",
      "Contact_List.xlsx",
    ],
    3,
    "Cracked or pirated optimizer software is a common malware carrier.",
  ),
  round(
    18,
    [
      "Company_Policy_Update.pdf",
      "urgent_invoice.zip (password-protected, unknown sender)",
      "Weekly_Standup_Notes.docx",
      "Sales_Dashboard.xlsx",
      "Team_Calendar.ics",
    ],
    2,
    "Password-protected archives from unknown senders are used to bypass malware scanning.",
  ),
  round(
    19,
    [
      "Project_Timeline.xlsx",
      "Client_Contract.pdf",
      "adobe_flashplayer_update.apk (on a Windows PC)",
      "Team_Photo.jpg",
      "Meeting_Recording.mp4",
    ],
    3,
    "An Android .apk on a Windows machine, disguised as a Flash update, is out of place.",
  ),
  round(
    20,
    [
      "Expense_Claim.pdf",
      "New_Employee_Form.docx",
      "windows_defender_disable.reg",
      "Vendor_List.xlsx",
      "Company_Holidays.ics",
    ],
    3,
    "A registry file designed to disable Windows Defender is a malware evasion hallmark.",
  ),
  round(
    21,
    [
      "Team_Building_Photos.zip",
      "Client_Proposal.pdf",
      "resume_candidate.pdf.exe",
      "Budget_Q2.xlsx",
      "Onboarding_Checklist.docx",
    ],
    3,
    "A double extension disguises an executable as a resume PDF.",
  ),
  round(
    22,
    [
      "Sales_Pitch.pptx",
      "Network_Config_Backup.cfg",
      "crypto_miner_service.exe (high CPU usage, unsigned)",
      "Team_Directory.xlsx",
      "Meeting_Agenda.docx",
    ],
    3,
    "An unsigned background process causing unexplained high CPU usage can indicate cryptojacking.",
  ),
  round(
    23,
    [
      "Company_Update.pdf",
      "Product_Roadmap.pptx",
      "autorun.inf (unexpected on a USB drive, points to hidden .exe)",
      "Budget_Report.xlsx",
      "Team_Notes.docx",
    ],
    3,
    "Malicious autorun.inf files on removable drives can auto-launch malware.",
  ),
  round(
    24,
    [
      "Invoice_774.pdf",
      "Employee_Survey.docx",
      "macro_enabled_form.xlsm (unsolicited, prompts Enable Content)",
      "Team_Schedule.xlsx",
      "Company_Newsletter.pdf",
    ],
    3,
    "An unsolicited macro-enabled spreadsheet prompting Enable Content is a common malware delivery method.",
  ),
  round(
    25,
    [
      "Photo_Backup.zip",
      "Client_Invoice.pdf",
      "chrome_update_now.exe (downloaded from a non-Google site)",
      "Team_Roster.xlsx",
      "Meeting_Notes.docx",
    ],
    3,
    "Browser updates should come from the browser itself, never a third-party download link.",
  ),
  round(
    26,
    [
      "Company_Handbook.pdf",
      "free_vpn_installer.exe (unsigned, bundled toolbar)",
      "Team_Photo.jpg",
      "Budget_Sheet.xlsx",
      "Meeting_Recording.mp4",
    ],
    2,
    "Unsigned free VPN installers bundling extra software are frequent malware carriers.",
  ),
  round(
    27,
    [
      "Q4_Report.pdf",
      "urgent_court_notice.pdf.exe",
      "Team_Org_Chart.pptx",
      "Vendor_Contract.docx",
      "Sales_Data.xlsx",
    ],
    2,
    "Fear-based filename plus a double extension disguises an executable.",
  ),
  round(
    28,
    [
      "Company_Directory.xlsx",
      "Meeting_Invite.ics",
      "remote_desktop_helper_unsigned.exe (requested unexpectedly by IT support)",
      "Project_Brief.docx",
      "Team_Photo.png",
    ],
    3,
    "Unsolicited unsigned remote-access software requested by unexpected IT support is a tech-support scam sign.",
  ),
  round(
    29,
    [
      "Sales_Contract.pdf",
      "HR_Policy.docx",
      "payroll_update_form.xls (contains a hidden macro calling an external URL)",
      "Team_Schedule.xlsx",
      "Company_Logo.png",
    ],
    3,
    "A spreadsheet macro silently calling an external URL is a common malware-download technique.",
  ),
  round(
    30,
    [
      "Annual_Budget.xlsx",
      "Client_Presentation.pptx",
      "adobe_reader_patch.exe (unsigned, no publisher info, from email attachment)",
      "Team_Meeting_Notes.docx",
      "Company_Policy.pdf",
    ],
    3,
    "An unsigned patch with no publisher information arriving as an email attachment is a textbook malware disguise.",
  ),
];

const run = async () => {
  const connected = await connectDatabase();
  if (!connected)
    throw new Error("MongoDB is not connected. Configure backend/.env first.");

  await MalwareRound.deleteMany({ level: 4 });
  await MalwareRound.insertMany(questions);
  console.log(`Seeded ${questions.length} Level 4 malware rounds.`);
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect();
  process.exitCode = 1;
});
