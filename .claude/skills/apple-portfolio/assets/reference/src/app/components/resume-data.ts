export interface LabeledBullet {
  label: string;
  text: string;
}

export interface Role {
  label: string;
  text: string;
  description?: string;
  href?: string;
}

export interface ResumeEntry {
  id: string;
  period: string;
  title: string;
  subtitle?: string;
  meta?: string;
  description?: string;
  bullets?: string[];
  sections?: LabeledBullet[];
  roles?: Role[];
  href?: string;
  tag?: string;
  /** Headline numbers for the tile. Each value + label restates a metric that
   *  already appears in this entry's copy. Never add a figure that isn't. */
  stats?: Stat[];
}

export interface Stat {
  value: string;
  label: string;
}

export interface LabeledLink {
  id: string;
  label: string;
  value: string;
  href?: string;
}

export interface SkillGroup {
  id: string;
  label: string;
  value: string;
}

export interface Project {
  id: string;
  name: string;
  /** What it is, e.g. "Browser extension". */
  kind: string;
  description: string;
  /** One line for the CV. */
  cvLine: string;
  points: string[];
  tech: string;
  href: string;
  /** Optional long-form write-up, shown in the details modal. */
  writeup?: ResumeEntry;
}

/** An anonymized write-up of a real investigation: no client, host, user or IP details. */
export interface CaseStudy {
  id: string;
  /** Type of work and main tool, e.g. "False positive · Elastic Defend". */
  kind: string;
  title: string;
  summary: string;
  tools: string;
  writeup: ResumeEntry;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  /** What kind of credential it is, e.g. "Certification" vs "Course certificate". */
  kind: string;
  note?: string;
}

export const profile = {
  name: 'Muhammad Abdullah',
  title: 'Security Operations Analyst',
  location: 'Islamabad, PK',
  // One-line summary under the title. Every claim here is backed by an entry below.
  tagline:
    'I work in security operations for North American enterprise clients, from alert triage and threat hunting to ransomware containment.',
  portfolio: 'mabddullah.vercel.app',
  portfolioHref: 'https://mabddullah.vercel.app',
  // Third-person summary for the downloadable CV. Every claim is backed below.
  cvSummary:
    'Security operations analyst with two years of SOC, incident response and IT operations work for North American enterprise clients. Investigates 100+ alerts a week in Elastic SIEM and Microsoft 365 Defender and supported the response to an active, threat actor-led ransomware attack. Also designs and builds accessible websites using AI-assisted development.',
  site: 'linkedin.com/in/mabddullah',
  siteHref: 'https://www.linkedin.com/in/mabddullah',
  about: [
    "I'm a security operations analyst at Ninpo Inc., working remotely in the SOC for North American enterprise clients. For the past **two years** I've triaged alerts, hunted threats and helped contain incidents, including an **active, threat actor-led ransomware attack**, where I helped isolate compromised domain controllers and ESXi hosts before large-scale encryption.",
    "Each week I investigate **100+ alerts** in Elastic SIEM and Microsoft 365 Defender, and I use Python and Pandas to automate log analysis so triage stays fast. I also keep Canadian client environments running: Microsoft 365 tenant administration, firewall and VPN configuration, and endpoint provisioning.",
    'I also design and build websites. I use AI coding tools for the build and put my own time into layout, accessibility and user experience. This site is one example.',
  ],
};

export const contacts: LabeledLink[] = [
  { id: 'email', label: 'Email', value: 'muhammaddabddullah@outlook.com', href: 'mailto:muhammaddabddullah@outlook.com' },
  { id: 'linkedin', label: 'LinkedIn', value: 'in/mabddullah', href: 'https://www.linkedin.com/in/mabddullah' },
  { id: 'github', label: 'GitHub', value: 'muhammad1502', href: 'https://github.com/muhammad1502' },
];

// Current role first, then the rest newest to oldest.
export const experience: ResumeEntry[] = [
  {
    id: 'ninpo',
    period: 'Oct 2024 to present',
    title: 'Security Operations Analyst',
    subtitle: 'Ninpo Inc.',
    href: 'https://ninpo.com',
    meta: 'Ottawa, Canada · Remote',
    description:
      'SOC analyst for a Canadian cybersecurity firm. I handle threat detection, incident response and IT operations across several North American enterprise client environments.',
    sections: [
      {
        label: 'Incident response',
        text: 'Supported the response to an active, **threat actor-led** ransomware attack by isolating compromised domain controllers and ESXi hosts before large-scale encryption.',
      },
      {
        label: 'Threat hunting and triage',
        text: 'Investigate **100+** alerts a week in Elastic SIEM and classify phishing in Perception Point with **95%+** accuracy. Findings have ranged from compromised VPN credentials to unauthorized RDP lateral movement.',
      },
      {
        label: 'Detection engineering',
        text: 'Worked with engineering to tune SIEM detection rules, cutting false positives by **20%** through baseline behavior analysis and log correlation.',
      },
      {
        label: 'Endpoint hardening',
        text: 'Audited Elastic EDR health across hybrid environments and fixed hosts where anti-tampering protection had been turned off, reaching **100%** telemetry coverage.',
      },
      {
        label: 'IT operations and Microsoft 365',
        text: 'Administer Microsoft 365 tenants through Pax8, configure VPNs and firewall updates, resolve client support tickets and provision endpoints for new hires.',
      },
      {
        label: 'Reporting',
        text: 'Built incident metrics mapped to MITRE ATT&CK, giving leadership clear data on adversary tactics, techniques and procedures (TTPs).',
      },
    ],
    stats: [
      { value: '100+', label: 'alerts investigated each week in Elastic SIEM' },
      { value: '95%+', label: 'phishing classification accuracy' },
      { value: '20%', label: 'fewer false positives after rule tuning' },
      { value: '100%', label: 'EDR telemetry coverage' },
    ],
  },
  {
    id: 'afterdesk',
    period: 'Jul 2026 to Aug 2026',
    title: 'Product Growth & Strategy',
    subtitle: 'AfterDesk · Independent Product',
    meta: 'Remote',
    description:
      'Built the product and growth groundwork for AfterDesk, an after-sales case manager for small online sellers that keeps the evidence with every case.',
    sections: [
      {
        label: 'Product strategy',
        text: 'Defined the core case workflow: the customer report, evidence, deadlines, resolution, third-party recovery and the final financial outcome.',
      },
      {
        label: 'Acquisition and activation',
        text: 'Built a public site with transparent pilot pricing, an interactive product demo and a protected pilot workspace, so prospects can go from first visit to trying the product.',
      },
      {
        label: 'Trust and readiness',
        text: 'Wrote **37** linked notes on product, architecture, security, API and ethics, and documented the privacy policy and terms, evidence-security boundaries and pilot release risks.',
      },
    ],
    stats: [{ value: '37', label: 'linked notes on product, architecture, security, API and ethics' }],
  },
  {
    id: 'fitsmart-growth',
    period: 'Jul 2026',
    title: 'Product Growth Auditor',
    subtitle: 'FitSmart AI · Project Contribution',
    meta: 'Remote',
    description:
      'Ran an evidence-based UX and growth review of an AI fitness and nutrition app, then turned the risks I found into a remediation plan the team could implement.',
    sections: [
      {
        label: 'Growth and monetization',
        text: 'Audited nine product areas and designed clearer quota visibility, plan-aware paywalls, pricing guardrails and retention flows, plus a measured path toward token or credit pricing.',
      },
      {
        label: 'Conversion and trust',
        text: 'Gave upgrade prompts more context, made payments safer and removed misleading "unlimited" language. Users who hit a limit keep what they were doing, and product claims now match how the system actually behaves.',
      },
      {
        label: 'Product quality',
        text: 'Specified and validated fixes for accessibility, data integrity, AI routing and usage observability, covering **37** audited icon controls with **18/18** Worker tests passing.',
      },
    ],
    stats: [
      { value: '9', label: 'product areas audited' },
      { value: '37', label: 'icon controls audited' },
      { value: '18/18', label: 'Worker tests passing' },
    ],
  },
];

// Public repos on github.com/muhammad1502. Descriptions restate each README.
export const projects: Project[] = [
  {
    id: 'gitlab-triage',
    name: 'GitLab Triage Accelerator',
    kind: 'Browser extension',
    description:
      'Speeds up high-volume security triage in GitLab for L1 and L2 analysts by removing the repetitive manual work: entering common findings, assigning leads and closing issues.',
    cvLine: 'Quick actions and hotkeys that speed up high-volume GitLab security triage for L1 and L2 analysts.',
    points: [
      'Custom quick actions for your own triage categories and slash commands',
      'Alt + key hotkeys that trigger an action instantly',
      'A floating action bar that stays in reach while you scroll',
      "Works with GitLab's single-page app by watching for page changes",
    ],
    tech: 'JavaScript · Chrome, Brave, Edge and Kiwi on Android',
    href: 'https://github.com/muhammad1502/gitlab-automator',
    // Written only from the project's README; no invented metrics or claims.
    writeup: {
      id: 'writeup-gitlab-triage',
      period: 'Write-up · 2026',
      title: 'Taking the repetitive clicks out of GitLab triage',
      subtitle: 'GitLab Triage Accelerator',
      meta: 'Browser extension',
      href: 'https://github.com/muhammad1502/gitlab-automator',
      description:
        'Why I built a browser extension for security analysts who triage in GitLab, and how it works.',
      sections: [
        {
          label: 'The problem',
          text: 'High-volume security triage involves the same manual steps on issue after issue: entering common findings, assigning a lead and closing the issue. Doing that by hand slows the response down and makes mistakes more likely.',
        },
        {
          label: 'Who it is for',
          text: 'L1 and L2 cybersecurity analysts who work through security findings as GitLab issues.',
        },
        {
          label: 'The approach',
          text: 'Rather than changing GitLab itself, the extension adds a customizable automation layer on top of the GitLab page, so a multi-step triage response runs from a single click or keyboard shortcut.',
        },
        {
          label: 'How it works',
          text: "Analysts define their own quick actions, each a triage category and the slash commands behind it, on the extension's options page, and give each one an Alt + key shortcut. On a GitLab issue, a floating action bar keeps those actions in reach while scrolling. GitLab is a single-page app that swaps content without full page loads, so the extension watches for page changes with MutationObservers and the actions keep working as you move between issues.",
        },
        {
          label: 'Where it runs',
          text: 'Chrome, Brave and Edge on desktop, and Kiwi Browser on Android, installed as an unpacked extension.',
        },
      ],
    },
  },
  {
    id: 'vt-extension',
    name: 'VT Extension',
    kind: 'Browser extension',
    description:
      'Right-click any selected IP address, URL, file hash or domain and check it on VirusTotal straight away.',
    cvLine: 'Right-click a selected IP, URL, hash or domain to check it on VirusTotal (Manifest V3).',
    points: [
      'One right-click opens the VirusTotal result in a new tab',
      'Manifest V3 with a lightweight background service worker',
      'No data collection: lookups go straight to VirusTotal',
    ],
    tech: 'JavaScript · Manifest V3 · Chrome, Brave and Edge · MIT licence',
    href: 'https://github.com/muhammad1502/vt-extension',
  },
  {
    id: 'vt-checker',
    name: 'VT Checker for Android',
    kind: 'Android app',
    description:
      'Adds "Check on VirusTotal" to the Android text-selection menu, so an IP address, domain or URL can be checked from any app.',
    cvLine: 'Adds "Check on VirusTotal" to the text-selection menu in any Android app.',
    points: [
      "Works system-wide through Android's text-selection menu",
      'No API key needed: it opens a VirusTotal search in the browser',
      'Runs invisibly and closes as soon as the lookup opens',
    ],
    tech: 'Android 6.0 or later',
    href: 'https://github.com/muhammad1502/vt-checker-android',
  },
];

// Real Ninpo investigations, anonymized: no client names, hostnames, users or IPs.
export const caseStudies: CaseStudy[] = [
  {
    id: 'case-aspnet',
    kind: 'False positive · Elastic Defend',
    title: 'A malware alert that was really a compiler',
    summary:
      "Elastic's machine-learning model flagged a new DLL on a client's web server. Tracing the process chain showed it was ASP.NET compiling its own pages.",
    tools: 'Elastic Defend · Kibana · Windows process telemetry',
    writeup: {
      id: 'writeup-case-aspnet',
      period: 'Case study',
      title: 'A malware alert that was really a compiler',
      subtitle: 'False positive investigation',
      meta: 'Client details removed',
      description: 'How I worked out that a machine-learning malware alert on an IIS web server was normal ASP.NET behavior.',
      sections: [
        {
          label: 'The alert',
          text: "Elastic Defend's machine-learning malware model flagged a newly written DLL (App_Web_*.dll) on a Windows web server running IIS. Its score, about 0.62, was only just above the 0.58 detection threshold.",
        },
        {
          label: 'What I checked',
          text: 'Instead of treating the file as malicious by default, I traced where it came from. The IIS worker process (w3wp.exe) had started the C# compiler (csc.exe), which then ran cvtres.exe, all under the IIS application pool identity. The DLL was written to the ASP.NET Temporary Files folder, and I reviewed the compiler command line as well.',
        },
        {
          label: 'Why it was benign',
          text: 'That chain is how ASP.NET dynamic compilation works: IIS compiles site code into DLLs in that folder when pages are requested. Nothing in the chain pointed to malicious activity.',
        },
        {
          label: 'The outcome',
          text: 'I closed the alert as a false positive, based on the process evidence rather than the model score.',
        },
      ],
    },
  },
  {
    id: 'case-missing-mail',
    kind: 'Email investigation · Microsoft 365',
    title: 'Bank security codes that "never arrived"',
    summary:
      "A client said a bank's security-code emails weren't reaching two mailboxes. The logs showed they had been delivered, then deleted.",
    tools: 'Exchange Online · Message Trace · Mailbox audit logs · Perception Point',
    writeup: {
      id: 'writeup-case-missing-mail',
      period: 'Case study',
      title: 'Bank security codes that "never arrived"',
      subtitle: 'Email investigation',
      meta: 'Client details removed',
      description: 'How I traced "missing" emails to activity that happened after they were delivered.',
      sections: [
        {
          label: 'The report',
          text: 'A client reported that security-code emails from their bank were missing from two mailboxes.',
        },
        {
          label: 'Ruling out delivery',
          text: 'Message Trace in Exchange Online showed the messages had been delivered. The email security gateway, Perception Point, had classified them as clean, and I checked the mail routing and connectors as well.',
        },
        {
          label: 'Finding the emails',
          text: 'The messages were in Deleted Items. Mailbox audit logs showed **five** of them moved from the Inbox to Deleted Items within about three minutes, all from the same signed-in session in Outlook on the web.',
        },
        {
          label: 'The outcome',
          text: 'That turned the question from "why is email not being delivered" into "what deleted these messages after delivery", which is a different investigation.',
        },
      ],
    },
  },
  {
    id: 'case-usb',
    kind: 'Malware analysis · Endpoint',
    title: 'Unpacking a malicious USB drive',
    summary:
      'A suspicious USB drive carried a script chain that tried to drop a DLL. Elastic blocked it, and I got the payload out for analysis when the usual route failed.',
    tools: 'Elastic Defend · Elastic Fleet · Isolated endpoint',
    writeup: {
      id: 'writeup-case-usb',
      period: 'Case study',
      title: 'Unpacking a malicious USB drive',
      subtitle: 'Malware analysis',
      meta: 'Client details removed',
      description: 'How I examined a suspicious USB drive safely and recovered its payload.',
      sections: [
        {
          label: 'The situation',
          text: 'A USB drive suspected of carrying malware needed to be examined. I worked on an isolated endpoint so nothing could spread.',
        },
        {
          label: 'The chain',
          text: 'I reconstructed what the drive did: a VBScript launched a batch file, which then tried to drop a DLL. Elastic blocked the DLL drop.',
        },
        {
          label: 'Getting the sample out',
          text: "Elastic's Fleet Server failed, so I couldn't retrieve the file the usual way. I encoded the payload as base64 text and moved it out through Zoho WorkDrive so it could be analyzed.",
        },
      ],
    },
  },
  {
    id: 'case-device-code',
    kind: 'Phishing analysis · Sandbox',
    title: 'A phishing link that asked for a device code',
    summary:
      'A suspicious link turned out to be an adversary-in-the-middle device code phishing chain running through Cloudflare Workers.',
    tools: 'Elastic (KQL) · ANY.RUN · Microsoft Entra ID sign-in logs',
    writeup: {
      id: 'writeup-case-device-code',
      period: 'Case study',
      title: 'A phishing link that asked for a device code',
      subtitle: 'Phishing analysis',
      meta: 'Client details removed',
      description: 'How I worked out what a suspicious link really did, then checked whether it had worked.',
      sections: [
        {
          label: 'Triage',
          text: 'A suspicious link came in for analysis. I started by searching Elastic with KQL for related activity.',
        },
        {
          label: 'The sandbox',
          text: 'I ran the link in an ANY.RUN sandbox. It revealed an adversary-in-the-middle device code phishing chain running through Cloudflare Workers. Device code phishing gets a victim to enter a code on a real Microsoft sign-in page, which signs the attacker in to their account.',
        },
        {
          label: 'Follow-up',
          text: 'I then checked the Microsoft Entra ID sign-in logs for signs that anyone had completed the flow.',
        },
      ],
    },
  },
];

export const skills: SkillGroup[] = [
  {
    id: 'secops',
    label: 'Security operations',
    value: 'Elastic Security (SIEM), Incident response, Alert triage, Phishing analysis with Perception Point, IOC hunting, OSINT',
  },
  {
    id: 'detection',
    label: 'Threat detection',
    value: 'MITRE ATT&CK mapping, TTP analysis, Sysmon, Osquery, Anomaly detection, Cyber Kill Chain',
  },
  {
    id: 'infra',
    label: 'Infrastructure and admin',
    value: 'Microsoft 365 Defender and Admin via Pax8, SonicWall and WatchGuard firewall & VPN, RDP/SSH forensics, VMware ESXi, Windows and Linux',
  },
  {
    id: 'data',
    label: 'Data and programming',
    value: 'Python (Pandas, NumPy, OOP), Bash scripting, SQL, Regex, Jupyter, Matplotlib',
  },
  {
    id: 'web',
    label: 'Web design and development',
    value: 'Responsive and accessible web design (WCAG 2.2), AI-assisted development (React, TypeScript), UX and growth audits, Landing pages and interactive product demos',
  },
];

// Named for what each credential actually is: an exam-based certification,
// a multi-course professional certificate, or a course certificate.
export const certifications: Certification[] = [
  {
    id: 'google-cyber',
    name: 'Google Cybersecurity Professional Certificate',
    issuer: 'Google',
    kind: 'Professional certificate',
  },
  { id: 'security-plus', name: 'CompTIA Security+', issuer: 'CompTIA', kind: 'Certification exam', note: 'In progress' },
  {
    id: 'blue-team',
    name: 'Blue Team Junior Analyst (BTJA)',
    issuer: 'Security Blue Team',
    kind: 'Training pathway certificate',
  },
  {
    id: 'ibm-intro',
    name: 'Introduction to Cybersecurity Essentials',
    issuer: 'IBM',
    kind: 'Course certificate',
  },
  {
    id: 'watchguard',
    name: 'Identity Security Sales Certification',
    issuer: 'WatchGuard',
    kind: 'Sales certification',
    note: 'Valid through Sep 2027',
  },
];
