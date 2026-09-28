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
  title: 'Cybersecurity Analyst',
  location: 'Ottawa, CA',
  // One-line summary under the title. Every claim here is backed by an entry below.
  tagline:
    'I work in security operations for North American enterprise clients, from alert triage and threat hunting to ransomware containment.',
  // Shown on the downloadable CV only (it was on the original PDF).
  phone: '+92 320 5610211',
  portfolio: 'muhammad-abdullah-resume.vercel.app',
  portfolioHref: 'https://muhammad-abdullah-resume.vercel.app',
  // Third-person summary for the downloadable CV. Every claim is backed below.
  cvSummary:
    'Cybersecurity analyst with two years of SOC, incident response and IT operations work for North American enterprise clients. Investigates 100+ alerts a week in Elastic SIEM and Microsoft 365 Defender and supported the response to an active, threat actor-led ransomware attack. Also designs and builds accessible websites using AI-assisted development.',
  site: 'linkedin.com/in/mabddullah',
  siteHref: 'https://www.linkedin.com/in/mabddullah',
  about: [
    "I'm a cybersecurity analyst at Ninpo Inc., working remotely as a SOC analyst for North American enterprise clients. For the past **two years** I've triaged alerts, hunted threats and helped contain incidents, including an **active, threat actor-led ransomware attack**, where I helped isolate compromised domain controllers and ESXi hosts before large-scale encryption.",
    "Each week I investigate **100+ alerts** in Elastic SIEM and Microsoft 365 Defender, and I use Python and Pandas to automate log analysis so triage stays fast. I also keep Canadian client environments running: Microsoft 365 tenant administration, firewall and VPN configuration, and endpoint provisioning.",
    'I also design and build websites. I use AI coding tools for the build and put my own time into layout, accessibility and user experience. This site is one example.',
    "I'm finishing a B.S. in Remote Sensing & GIS and studying for CompTIA Security+.",
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
    title: 'Cybersecurity Analyst',
    subtitle: 'Ninpo Inc.',
    href: 'https://ninpo.com',
    meta: 'Ottawa, Canada · Remote',
    description:
      'SOC analyst for a Canadian cybersecurity firm. I handle threat detection, incident response and IT operations across several North American enterprise client environments.',
    sections: [
      {
        label: 'Incident response',
        text: 'Supported the response to an active **threat actor-led** ransomware attack by isolating compromised domain controllers and ESXi hosts before large-scale encryption.',
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
    href: 'https://github.com/muhammad1502/AfterDesk',
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
    href: 'https://github.com/SyedSaribSultan/fitsmart',
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
    note: 'Valid through Jul 2027',
  },
];

export const education: ResumeEntry[] = [
  {
    id: 'comsats',
    period: '2023 to 2027',
    title: 'B.S., Remote Sensing & GIS',
    subtitle: 'COMSATS University Islamabad',
    meta: 'Islamabad, PK · Expected Jul 2027',
  },
];
