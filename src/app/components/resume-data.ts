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
  note?: string;
}

export const profile = {
  name: 'Muhammad Abdullah',
  title: 'Cybersecurity Analyst',
  location: 'Ottawa, CA',
  site: 'linkedin.com/in/mabddullah',
  siteHref: 'https://www.linkedin.com/in/mabddullah',
  about:
    "Cybersecurity analyst with two years of remote SOC, incident response, and IT operations supporting North American enterprise clients. I investigate 100+ alerts a week in Elastic SIEM and Microsoft 365 Defender, hunt threats, and drive containment — including tactical support during an active, threat actor-led ransomware engagement, isolating compromised domain controllers and ESXi hosts before large-scale encryption. A foundation in Python and Pandas lets me automate log analysis for fast, high-volume triage, and I keep Canadian client environments running through Microsoft 365 tenant administration, firewall and VPN configuration, and endpoint provisioning. I'm finishing a B.S. in Remote Sensing & GIS and studying for CompTIA Security+.",
};

export const contacts: LabeledLink[] = [
  { id: 'email', label: 'Email', value: 'muhammaddabddullah@outlook.com', href: 'mailto:muhammaddabddullah@outlook.com' },
  { id: 'linkedin', label: 'LinkedIn', value: 'in/mabddullah', href: 'https://www.linkedin.com/in/mabddullah' },
  { id: 'github', label: 'GitHub', value: 'muhammad1502', href: 'https://github.com/muhammad1502' },
];

export const experience: ResumeEntry[] = [
  {
    id: 'ninpo',
    period: '2024 — Present',
    title: 'Cybersecurity Analyst',
    subtitle: 'Ninpo Inc.',
    href: 'https://ninpo.com',
    meta: 'Ottawa, Canada · Remote',
    description:
      'Remote SOC analyst for a Canadian cybersecurity firm serving North American enterprise clients — threat detection, incident response, and IT operations across multiple client environments.',
    sections: [
      {
        label: 'Incident Response',
        text: 'Provided tactical support during an active **threat actor-led** ransomware engagement, isolating compromised domain controllers and ESXi hosts before large-scale encryption.',
      },
      {
        label: 'Threat Hunting & Triage',
        text: 'Investigate **100+** alerts weekly in Elastic SIEM and classify phishing in Perception Point with **95%+** accuracy, surfacing access vectors from compromised VPN credentials to unauthorized RDP lateral movement.',
      },
      {
        label: 'Detection Engineering',
        text: 'Tuned SIEM detection rules alongside engineering, cutting false positives **20%** through baseline behavior analysis and log correlation.',
      },
      {
        label: 'Endpoint Hardening',
        text: 'Audited Elastic EDR health across hybrid environments, remediating hosts with disabled anti-tampering protection to reach **100%** telemetry coverage.',
      },
      {
        label: 'IT Operations & M365',
        text: 'Administer Microsoft 365 tenants through Pax8, configure VPNs and firewall updates, resolve client support tickets, and provision endpoints for new hires.',
      },
      {
        label: 'Reporting',
        text: 'Built incident metrics mapped to MITRE ATT&CK, giving leadership actionable data on adversary TTPs.',
      },
    ],
  },
  {
    id: 'pcrwr',
    period: 'Jul — Sep 2025',
    title: 'GIS Intern',
    subtitle: 'PCRWR',
    meta: 'Islamabad, PK',
    description:
      'Summer research internship in geospatial data automation. Built Python scripts to automate ingestion of spatial datasets for government resource planning, and applied statistical methods to surface pattern anomalies — high-volume data work that transfers directly to security log analysis.',
  },
];

export const skills: SkillGroup[] = [
  {
    id: 'secops',
    label: 'Security Operations',
    value: 'Elastic Security (SIEM), incident response, alert triage, phishing analysis with Perception Point, IOC hunting, OSINT',
  },
  {
    id: 'detection',
    label: 'Threat Detection',
    value: 'MITRE ATT&CK mapping, TTP analysis, Sysmon, Osquery, anomaly detection, Cyber Kill Chain',
  },
  {
    id: 'infra',
    label: 'Infrastructure & Admin',
    value: 'Microsoft 365 Defender and Admin via Pax8, SonicWall and WatchGuard firewall & VPN, RDP/SSH forensics, VMware ESXi, Windows and Linux',
  },
  {
    id: 'data',
    label: 'Data & Programming',
    value: 'Python (Pandas, NumPy, OOP), Bash scripting, SQL, Regex, Jupyter, Matplotlib',
  },
];

export const certifications: Certification[] = [
  { id: 'google-cyber', name: 'Google Cybersecurity Professional Certificate' },
  { id: 'blue-team', name: 'Blue Team Junior Analyst — Security Blue Team (BTL1)' },
  { id: 'ibm-intro', name: 'IBM Introduction to Cybersecurity Essentials' },
  { id: 'security-plus', name: 'CompTIA Security+', note: 'In progress' },
  { id: 'watchguard', name: 'Identity Security Sales Certification — WatchGuard', note: 'Exp. 2026' },
];

export const education: ResumeEntry[] = [
  {
    id: 'comsats',
    period: '2023 — 2027',
    title: 'BS, Remote Sensing & GIS',
    subtitle: 'COMSATS University Islamabad',
    meta: 'Islamabad, PK',
  },
];
