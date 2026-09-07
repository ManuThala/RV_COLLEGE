import type { MalwareRound } from '../types'

const fileTemplates = [
  { id: 'F-BASE-01', name: 'budget-final.pdf', extension: '.pdf', type: 'Document', size: '1.2 MB', modified: '2026-08-11', source: 'Received via email', suspicious: false, reasons: ['Legitimate document format'] },
  { id: 'F-BASE-02', name: 'invoice_2026.xlsm', extension: '.xlsm', type: 'Macro-enabled spreadsheet', size: '3.8 MB', modified: '2026-08-10', source: 'Attached email', suspicious: true, reasons: ['Macro-enabled file', 'Unexpected invoice attachment'] },
  { id: 'F-BASE-03', name: 'holiday-photo.jpg', extension: '.jpg', type: 'Image', size: '890 KB', modified: '2026-08-01', source: 'Downloads folder', suspicious: false, reasons: ['Common image file'] },
  { id: 'F-BASE-04', name: 'setup.exe', extension: '.exe', type: 'Executable', size: '14.6 MB', modified: '2026-08-09', source: 'Unknown source', suspicious: true, reasons: ['Executable format', 'Untrusted source'] },
  { id: 'F-BASE-05', name: 'report.pdf.exe', extension: '.exe', type: 'Executable', size: '21.3 MB', modified: '2026-08-06', source: 'Downloaded from chat', suspicious: true, reasons: ['Double extension', 'Executable disguised as PDF'] },
  { id: 'F-BASE-06', name: 'payroll.doc', extension: '.doc', type: 'Document', size: '1.8 MB', modified: '2026-08-08', source: 'HR shared drive', suspicious: false, reasons: ['Expected office file'] },
  { id: 'F-BASE-07', name: 'downloaded.zip', extension: '.zip', type: 'Archive', size: '8.4 MB', modified: '2026-08-07', source: 'Unknown sender', suspicious: true, reasons: ['Unexpected ZIP archive', 'Compressed malicious payload possible'] },
  { id: 'F-BASE-08', name: 'meeting-notes.txt', extension: '.txt', type: 'Text file', size: '12 KB', modified: '2026-08-10', source: 'Notes folder', suspicious: false, reasons: ['Plain text document'] },
  { id: 'F-BASE-09', name: 'policy.pdf', extension: '.pdf', type: 'Document', size: '720 KB', modified: '2026-08-08', source: 'Shared drive', suspicious: false, reasons: ['Valid policy doc'] },
  { id: 'F-BASE-10', name: 'install.scr', extension: '.scr', type: 'Screen saver', size: '2.1 MB', modified: '2026-08-05', source: 'Untrusted inbox', suspicious: true, reasons: ['Screen-saver file', 'Untrusted execution type'] },
  { id: 'F-BASE-11', name: 'contract.docm', extension: '.docm', type: 'Macro-enabled document', size: '2.2 MB', modified: '2026-08-11', source: 'Email attachment', suspicious: true, reasons: ['Macro-enabled document', 'Unexpected sender'] },
  { id: 'F-BASE-12', name: 'profile.png', extension: '.png', type: 'Image', size: '1.1 MB', modified: '2026-08-03', source: 'Downloads folder', suspicious: false, reasons: ['Standard image format'] },
  { id: 'F-BASE-13', name: 'bank-statement.pdf', extension: '.pdf', type: 'Document', size: '600 KB', modified: '2026-08-12', source: 'Bank portal', suspicious: false, reasons: ['Expected financial document'] },
  { id: 'F-BASE-14', name: 'final_task.lnk', extension: '.lnk', type: 'Shortcut', size: '12 KB', modified: '2026-08-10', source: 'Unknown mail attachment', suspicious: true, reasons: ['Shortcut file', 'Potential payload link'] },
  { id: 'F-BASE-15', name: 'update.ps1', extension: '.ps1', type: 'Script', size: '45 KB', modified: '2026-08-09', source: 'Downloaded from forum', suspicious: true, reasons: ['PowerShell script', 'Execution script'] },
  { id: 'F-BASE-16', name: 'app-installer.msi', extension: '.msi', type: 'Installer', size: '30 MB', modified: '2026-08-01', source: 'Known vendor', suspicious: false, reasons: ['Valid installer'] },
  { id: 'F-BASE-17', name: 'system-log.txt', extension: '.txt', type: 'Log file', size: '214 KB', modified: '2026-08-09', source: 'System folder', suspicious: false, reasons: ['Expected system log'] },
  { id: 'F-BASE-18', name: 'team-briefing.pptx', extension: '.pptx', type: 'Presentation', size: '2.8 MB', modified: '2026-08-08', source: 'Shared drive', suspicious: false, reasons: ['Standard business file'] },
  { id: 'F-BASE-19', name: 'alerts.html', extension: '.html', type: 'HTML file', size: '70 KB', modified: '2026-08-03', source: 'Downloaded', suspicious: true, reasons: ['Unexpected HTML script from email', 'Could execute in browser'] },
  { id: 'F-BASE-20', name: 'screenshot.png', extension: '.png', type: 'Image', size: '2.1 MB', modified: '2026-08-08', source: 'Project folder', suspicious: false, reasons: ['Known image format'] },
  { id: 'F-BASE-21', name: 'password_reset.pdf', extension: '.pdf', type: 'Document', size: '320 KB', modified: '2026-08-02', source: 'Email message', suspicious: false, reasons: ['Expected document'] },
  { id: 'F-BASE-22', name: 'new-release.exe', extension: '.exe', type: 'Executable', size: '18.7 MB', modified: '2026-08-14', source: 'Untrusted link', suspicious: true, reasons: ['Executable file from untrusted source'] },
  { id: 'F-BASE-23', name: 'scan-report.docx', extension: '.docx', type: 'Document', size: '1.4 MB', modified: '2026-08-03', source: 'Internal email', suspicious: false, reasons: ['Standard internal file'] },
  { id: 'F-BASE-24', name: 'archive.zip.exe', extension: '.exe', type: 'Executable', size: '9.2 MB', modified: '2026-08-12', source: 'Downloaded archive', suspicious: true, reasons: ['Double extension', 'Executable hidden inside archive'] },
  { id: 'F-BASE-25', name: 'course-materials.pdf', extension: '.pdf', type: 'Document', size: '1.9 MB', modified: '2026-08-11', source: 'Campus LMS', suspicious: false, reasons: ['Expected learning resource'] },
  { id: 'F-BASE-26', name: 'drivers.msi', extension: '.msi', type: 'Installer', size: '42.1 MB', modified: '2026-08-03', source: 'Official portal', suspicious: false, reasons: ['Trusted installer'] },
  { id: 'F-BASE-27', name: 'receipt.pif', extension: '.pif', type: 'Shortcuts', size: '26 KB', modified: '2026-08-04', source: 'Email attachment', suspicious: true, reasons: ['Unexpected PIF file', 'Potential malicious shortcut'] },
  { id: 'F-BASE-28', name: 'report.xls', extension: '.xls', type: 'Spreadsheet', size: '840 KB', modified: '2026-08-09', source: 'Finance team', suspicious: false, reasons: ['Expected spreadsheet'] },
  { id: 'F-BASE-29', name: 'suspicious.js', extension: '.js', type: 'Script', size: '25 KB', modified: '2026-08-11', source: 'Untrusted source', suspicious: true, reasons: ['JavaScript file', 'Could run browser code'] },
  { id: 'F-BASE-30', name: 'backup.tar.gz', extension: '.gz', type: 'Archive', size: '5.8 MB', modified: '2026-08-05', source: 'Known backup tool', suspicious: false, reasons: ['Legitimate backup archive'] },
  { id: 'F-BASE-31', name: 'business.pdf', extension: '.pdf', type: 'Document', size: '1.7 MB', modified: '2026-08-06', source: 'Received through portal', suspicious: false, reasons: ['Normal PDF file'] },
  { id: 'F-BASE-32', name: 'wallpaper.jpg.exe', extension: '.exe', type: 'Executable', size: '11.8 MB', modified: '2026-08-04', source: 'Fake image site', suspicious: true, reasons: ['Double extension', 'Disguised executable'] },
]

export const level4Rounds: MalwareRound[] = Array.from({ length: 30 }, (_, index) => {
  const files = shuffleFiles(fileTemplates, index)
  // The designed "correct" file must be identified from the source list, not the
  // post-shuffle array — its position in `files` is randomized by the shuffle below.
  const correct = fileTemplates[index % fileTemplates.length]
  return {
    id: `L4-R${String(index + 1).padStart(2, '0')}`,
    title: `Suspicious item ${index + 1}`,
    files: files as MalwareRound['files'],
    correctFileId: correct.id,
    explanation: 'The malicious file shows suspicious metadata, an unexpected extension pattern, script behavior, or a disguised executable. It should be quarantined before opening or executing.',
    active: true,
  }
})

function shuffleFiles(items: typeof fileTemplates, index: number): Array<typeof fileTemplates[number] & { id: string }> {
  const list = [...items]
  const ordered = [...list]
  const correct = ordered[index % ordered.length]
  const withoutCorrect = ordered.filter((file) => file !== correct)
  const shuffled = [correct, ...withoutCorrect.slice(0, 4)]
  const final = [...shuffled]
  for (let i = final.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[final[i], final[j]] = [final[j], final[i]]
  }
  return final as Array<typeof fileTemplates[number] & { id: string }>
}
