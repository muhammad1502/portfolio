# Content: honesty, voice and every decision so far

## Contents
1. The honesty rule
2. Voice and banned patterns
3. Confirmed facts (current)
4. Decisions already made (do not reopen)
5. Open questions (ask before using)
6. Case studies: anonymisation
7. Write-up template
8. Getting facts out of the user's other chats

## 1. The honesty rule

Only publish what the user said, what is in their own material (resumes they uploaded, their public GitHub READMEs), or what they confirm. Things an AI wrote in another chat are not facts unless the user confirmed the substance.

- If a detail is missing, leave it out or ask. Never fill gaps with plausible-sounding specifics.
- Numbers on stat tiles (`stats` in `resume-data.ts`) must restate a figure already in that entry's text.
- When writing from a README, describe what the README says the tool does. Don't invent users, time saved or adoption.
- "Lessons learned" sections are only allowed if the user actually said them.
- Keep claims at the strength the source supports. "Supported the response to" is not "led the response to".

## 2. Voice and banned patterns

- **No em dashes anywhere** (site, CV, meta, commit messages, PR text). The user treats them as an AI tell. Use commas, colons, full stops; ranges use "to" ("Oct 2024 to present").
- Avoid AI-sounding words: passionate, leverage, seamless, robust, delve, cutting-edge, synergy, "in today's…", "I'm excited to…", "proven track record".
- Short sentences, concrete nouns, real tool names. First person on the site ("I investigate…"), third person without a pronoun in the CV summary ("Investigates…").
- Bold (`**text**`) only for key numbers and the one or two phrases a skimmer should catch.
- American spelling on the site (behavior, analyze).
- AI use: describe web work as "AI-assisted development" and say he puts his own time into layout, accessibility and UX. Don't hide it, don't make it sound like the AI did everything. The user asked that it not be portrayed against him.
- Don't add availability or "open to work" lines. The user felt one sounded "kind of cheap".

## 3. Confirmed facts (current)

| Field | Value |
|---|---|
| Name | Muhammad Abdullah |
| Title | **Security Operations Analyst** (matches his Ninpo signature and LinkedIn headline; changed from "Cybersecurity Analyst") |
| Location | Islamabad, PK. Works remotely. |
| Email | muhammaddabddullah@outlook.com |
| LinkedIn | linkedin.com/in/mabddullah |
| GitHub | github.com/muhammad1502 |
| Site | https://mabddullah.vercel.app (old muhammad-abdullah-resume.vercel.app 308-redirects here) |
| Repo | muhammad1502/portfolio (renamed from muhammad-abdullah-resume) |
| Employer | Ninpo Inc., Ottawa, Canada, remote. Oct 2024 to present. |

Ninpo resume claims in use (from his uploaded resumes; the method behind each number was never stated, so don't expand them): 100+ alerts a week in Elastic SIEM; 95%+ phishing classification accuracy in Perception Point; 20% fewer false positives after rule tuning with engineering; 100% EDR telemetry coverage after fixing disabled anti-tamper; supported the response to an active, threat actor-led ransomware attack (isolating domain controllers and ESXi hosts before large-scale encryption); M365 via Pax8, VPN and firewall work, endpoint provisioning; incident metrics mapped to MITRE ATT&CK.

Other experience on the site: AfterDesk (Product Growth & Strategy, independent product, Jul to Aug 2026, 37 linked notes) and FitSmart AI (Product Growth Auditor, project contribution, Jul 2026: 9 areas, 37 icon controls, 18/18 Worker tests). Do not say AfterDesk "launched".

Certifications (exact wording matters):
- Google Cybersecurity Professional Certificate (professional certificate)
- CompTIA Security+: **In progress**, shown only on the certification card
- Blue Team Junior Analyst (**BTJA**), Security Blue Team, training pathway certificate. It is the free pathway, **not BTL1**, even though an old resume says BTL1.
- Introduction to Cybersecurity Essentials, IBM (course certificate)
- Identity Security Sales Certification, WatchGuard. He renewed it: **valid through Sep 2027**.

Projects (public repos; descriptions restate each README): GitLab Triage Accelerator (`gitlab-automator`, has a write-up), VT Extension, VT Checker for Android. Other public repos not yet on the site: link-opener, FocusBlocker, lead_miner, engineering-kit, fcc-javascript, QuackWashProject. Read a repo's README before adding it, and ask whether he wants it shown.

## 4. Decisions already made (do not reopen)

- **No phone number** anywhere (site, CV, JSON-LD).
- **No university education** on the site or CV, and no PCRWR internship. Don't mention current studies.
- **Don't name the ransomware group.** Say "an active, threat actor-led ransomware attack". It was one incident, so keep it singular unless he says there were more.
- **Security+:** removed from the About text to match his LinkedIn; it stays as "In progress" on the certification card. Update it when he passes or books the exam.
- **Job title** is Security Operations Analyst everywhere, including the OG image, CV metadata and JSON-LD.
- **GitHub profile bio and pins:** he said leave them as they are.
- **Recommendations / testimonials:** he has none. Don't add a section.
- **Akira-style named-entity timelines** were skipped as fabrication risk.
- **Analytics:** undecided. Don't add tracking without asking (it would also need CSP and privacy changes).

## 5. Open questions (ask before using)

- How the 20%, 95%+, 100% and 100+ figures were measured.
- FitSmart: the site version (growth audit, Jul 2026) and an older resume version (QA & Product Quality Lead, Jan 2026 to present, 12 surfaces, ~180 defects) conflict. He was unsure, so the site version stays.
- Some Ninpo email signatures say "Abdullah Hameed". The site uses Muhammad Abdullah.
- Languages spoken: never stated.

## 6. Case studies: anonymisation

The Case studies section holds real Ninpo investigations, published with his permission on the condition that they're anonymised. For any new one:

- Remove client and company names, people, email addresses, hostnames, tenant names, IPs, ticket IDs, internal domains (e.g. dojo.ninpo.com), bank names. "A client", "a bank", "a Windows web server" are fine.
- Tool and vendor names (Elastic, ANY.RUN, Perception Point, Zoho WorkDrive, Cloudflare Workers) are fine.
- Exact times can become "within about three minutes".
- Only state the outcome if it's known. If the sign-in check result isn't known, end at "I checked…".
- The QA suite has a list of known client identifiers that must never appear on the page. Add to it when new ones come up.

Known identifiers to keep off the site: RBC, EC2AMAZ hostnames, Lawson, rioux.ca, Dean and Associates, PMI Structures, PlugCPA / CPA Plus, Texlon Plastics, AVI Media, Feed It Forward, CREAAMIK / TERRL, Seona, Mahsa, Herman Lo, Andy, Seyed, Asad.

## 7. Write-up template

Used for project write-ups and case studies (a `ResumeEntry` with `sections`, opened in the details modal). Pick the sections that the facts support; skip any that would need guessing.

- **The problem / The alert / The report:** what was going wrong, in one or two sentences.
- **Who it is for** (projects): the actual users.
- **The approach / What I checked:** what he did and why, step by step.
- **How it works** (projects): the mechanism in plain words.
- **Why it was benign / Finding the cause:** the reasoning.
- **The outcome / Result:** only if known. Numbers only if he gave them.
- **Where it runs** (projects): platforms.

Title: a short, specific hook ("A malware alert that was really a compiler"). Card: kind eyebrow ("False positive · Elastic Defend"), one-sentence summary, tools line, one "Read write-up" button.

## 8. Getting facts out of the user's other chats

You can't read claude.ai or ChatGPT history from Claude Code. Give the user a prompt to paste into the regular Claude app (Settings → Memory → "Search and reference chats" must be on; paid plans; it searches outside Projects and inside each Project separately; incognito chats are never searched). The prompt should demand: only things he actually said, the source chat for each fact, conflicts flagged, a "Needs confirming" list, confidentiality flags, and no em dashes. Then cross-check everything returned against section 3 before using it, and treat AI-drafted text from those chats as unconfirmed.
