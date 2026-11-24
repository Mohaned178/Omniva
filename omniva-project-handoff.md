# Omniva Project Handoff

**Purpose:** the primary continuity document for Omniva. A new session, with no access to earlier conversations, should be able to understand the project, its history, every decision and its reasoning, the current state, and the next steps from this file plus the living Product Definition document.

**Last updated:** 24 November 2026 (session 2: Area 2 User Journeys completed)
**Companion document:** `F:\Omniva\omniva-product-definition.html`, the living Product Definition document. This handoff complements it and does not replace it.

---

## 0. Instructions for the next session (read before doing anything)

1. Read this file (`omniva-project-handoff.md`) completely.
2. Read `F:\Omniva\omniva-product-definition.html` completely.
3. Compare the two documents and report any inconsistencies to the user before continuing.
4. Understand the approved decisions, proposals, pending items, deferred topics and current progress (Section 1).
5. Do not repeat completed discussions.
6. Do not reopen approved decisions unless you find a genuine contradiction or a significant issue. If you do, raise it explicitly.
7. Continue from the exact point where session 1 stopped (Section 1.3).
8. **System Design is in progress** (moved there by the user on 24 Nov 2026). Continue from the next pending D topic in `omniva-system-design.html`. Read the relevant Matt Pocock skills in full before using them (Part F). The Section 1.2 discrepancy is resolved: S1–S8 stand as approved.
9. Follow the working agreements in Section 2.
10. Do not start System Design, development planning or implementation until the user explicitly moves the project to that stage.

---

## 1. Current project state

### 1.1 Progress as recorded in the session 1 conversation

| Stage | Status | Notes |
|---|---|---|
| Product discovery (idea, competitors, differentiation, feasibility, audience, problems, value) | **Done** | Ended with the user locking the product direction (Section A0) |
| Product Vision Finalization, Areas 1–7 | **Approved** | Areas 1–6 decided one by one. In Area 7, the user approved 7.1 and 7.2 and then said "approve and do recommendation for the rest", which approved 7.3–7.9 as recommended. |
| Product Definition, Area 1: Product Scope (S1–S8) | **Approved** | S1 approved with user clarifications. S2: "approve all recommendations for S2". S3a and S3b approved. S4 Part 1, S4 Part 2 and S5–S8: user said "approve your recommendation for the rest… for area 1". |
| Product Definition, Area 2: User Journeys & Use Cases (J1–J6) | **Approved** | Session 2. J1–J3.3 approved topic by topic (recommendations accepted). J3.4–J6 approved in bulk: "approve all recommendations for J3.3 and for the rest to J6". |
| Product Definition, Area 3: MVP Definition (M1–M8) | **Approved** | Session 2, topic by topic (recommendations accepted). **Product Definition complete.** |
| System Design | **In progress** | Started 24 Nov 2026 (session 2). Framing approved. D1–D7 approved; D8 next. Index: `omniva-system-design.html`. |
| Development Planning | **Not started** | Methodology notes only (Part F) |
| Implementation | **Not started** | Must not start during product discovery or definition |

### 1.2 Progress discrepancy (RESOLVED 24 Nov 2026)

**Resolution:** the user confirmed "S2 is approved, continue tomorrow with J1." The conversation record below is correct, and S1–S8 are approved. The historical note is kept for context only.

At the end of session 1, the user pasted handoff instructions that described the state differently:
- "Product Vision areas 1–6 have been worked through and approved"
- "S2 is currently under discussion and has not yet been formally approved", "I have not yet explicitly approved the complete S2 proposal", and an "incomplete Tasks vs. Reminders section"
- "S3 and subsequent topics have not been completed"

The session 1 conversation records something different:
- Area 7 (Long-Term Direction) was also completed and approved.
- The user replied **"approve all recommendations for S2"**. The Tasks vs reminders sub-decision was presented in full and approved as part of that.
- S3a ("approve all recommendations for S3a"), S3b ("approve"), and S4–S8 ("approve your recommendation for the rest… for area 1") were also approved.

The pasted instructions may have been written earlier, or in another tool (the user also reviews decisions with ChatGPT). **This document records the conversation's state, labels S4–S8 as approved through accepted recommendations, and asks the next session to confirm with the user.** If the user says the S2–S8 approvals don't stand, change their status to **Proposed** in both documents and re-present them one at a time, starting with S2.

### 1.3 Exact stopping point
- Session 2 (24 Nov 2026) completed **Area 2 User Journeys (J1–J6)**, recorded in both documents. It also made two scope clarifications along the way (passport home; S4 disposal rule) and J6 amendments G1–G19.
- **Product Definition complete** (Areas 1–3). Nothing further is pending in this stage.
- **Next stage: System Design (Part E)**, only when the user explicitly moves the project there. In parallel, the user may start validation steps 1–2 (problem interviews, landing page), per M7.2.
- Suggested first step for the next session: offer the user a short review of the bulk-approved J3.4–J6 items (especially G10 shared costs, G12 several Owners, G13 leaving with copies, G16 auto-roll, and the wording) before starting M1.

### 1.4 Status vocabulary used in this document
| Status | Meaning |
|---|---|
| **Approved** | Explicitly accepted by the user and recorded |
| **Approved (recommendation accepted)** | The user accepted Claude's recommendations in bulk ("approve all recommendations") without discussing each point. Treat as approved, but these are the most open to the user revisiting them. |
| **Proposed** | Suggested but not accepted |
| **Pending** | Needs a future decision |
| **Deferred** | Intentionally postponed |
| **Rejected** | Considered and explicitly rejected |

---

## 2. Working agreements with the user

- **The process for every area and topic:** split it into decision topics, present **one topic at a time**, explain the problem and why it matters, give alternatives with trade-offs, challenge weak assumptions, give a reasoned recommendation, **wait for the user's decision**, record it, then move on.
- **Don't overwhelm.** Avoid dozens of decisions in one response. Each topic gets one open question per item where possible.
- **Never turn a recommendation into an approved decision without the user's confirmation.**
- **Keep documentation current:** update `omniva-product-definition.html` after every approved decision (approved vs proposed clearly marked, decision log updated).
- **No technical decisions during product work.** No database schema, APIs, architecture, technology choices, tickets or code until the user moves to those stages.
- **Be realistic and critical.** The user explicitly asked to be challenged, and accepts honest disagreement. They did not want motivational overviews.
- **Respect the locked identity (Section A0).** Never narrow or rename Omniva's identity (for example, to "expat document management"). Narrower things are entry segments, MVP priorities or messaging.
- The user sometimes reviews decisions with ChatGPT and returns with formal decision lists. Treat their pasted decision lists as authoritative, but point out factual conflicts with the record (as in Section 1.2).
- Use they/them for people not yet introduced with pronouns.
- Environment: Windows 11, project folder `F:\Omniva` (not a git repository). Claude Code memory for this project is in `C:\Users\pc\.claude\projects\F--Omniva\memory\`.

---

## 3. History of session 1 (with reasoning)

1. **Initial idea.** "Omniva — Your Life, All in One Place." The user wanted to discuss the project without code. Claude raised the main risk of all-in-one apps (doing many things at a mediocre level) and three possible directions: integrator, replacement, AI assistant.
2. **The user's scope.** 12 life areas (Productivity, Finance & Wealth, Health & Fitness, Knowledge & Learning, Career & Professional, Assets & Possessions, Social & Relationships, Travel & Experiences, Home Management, Subscriptions & Services, Documents & Files, Entertainment & Lifestyle) and five cross-cutting ideas (Universal Search, Unified Calendar, Automation Engine, Personal Analytics, AI Personal Assistant).
   - Claude's insight: the cross-cutting features are the real product, and the areas share common building blocks.
   - Claude also proposed five pillars for grouping and phased modules.
3. **First decisions.** Path: me → group → public. Web first, then mobile. Explicitly **not just another productivity app**. Private by default, the user owns their data, nothing visible to others unless explicitly shared.
4. **Workspaces and privacy.**
   - The user defined **personal workspaces** and **shared workspaces**, both designed from the start.
   - Hybrid privacy: strong standard encryption plus an optional E2EE Vault for highly sensitive information. The user understood the complexity this adds to search, automation, AI and key management.
   - A discovery-level MVP direction was agreed: Life Overview, Documents & Files, Assets & Possessions, Subscriptions & Services, Finance, Home Management, plus light Productivity.
5. **Competitor research.** Claude searched the web and published a feature-matrix artifact: https://claude.ai/artifact/XMsEpwEWr3hK7zLLEuTQrW (private to the user).
   - Compared: Quicken LifeHub, Trustworthy, Hubmee, Vritto, Everplans, HomeZada, Under My Roof, Privora, Notion Life OS templates, and AI "Life OS" apps (Tridigm, Supering, LifeOS AI).
   - Closest competitor: **Vritto** (30+ modules, cross-record AI that asks before changing anything, module-level AI exclusion, but mobile-first with no visible workspace or sharing model).
   - Hubmee is household and finance focused. Trustworthy, LifeHub and Everplans are strong on vaults and sharing but thin on daily life.
   - Ratings come from vendor material and are unverified.
6. **Differentiation.** No competitor was found that combines:
   - connected building blocks across broad modules
   - personal and shared workspaces in one account
   - hybrid privacy
   - cross-life AI with limits
   - a serious web experience

   Switching happens at **trigger moments** (a near-miss, renewal season, a move, a new family member, tool fatigue). What can't easily be copied: the connected data model, trust, and accumulated life data.
7. **Feasibility assessment.** At the user's request, a critical engineering and product assessment. Key points (all **Proposed / advisory**, not decisions):
   - Challenged assumptions: 12 modules is a liability if built as 12 products. The MVP of 7 modules may be too big. Life admin is **episodic**, not daily (Claude corrected its own earlier claim). Data is born on phones, which matters for capture. Web E2EE protects less than it sounds. Automation rule builders and early analytics are weak. AI conflicts with privacy unless designed carefully.
   - Top risks: scope collapse, empty-app abandonment, a breach or account takeover, low engagement frequency, the trust barrier, cross-workspace leaks, weak willingness to pay, a wrong early data model, Vault data loss or false security, regional integration and compliance gaps.
   - Hidden challenges: shared workspaces and real relationships (breakups, controlling partners), legal and compliance (GDPR special-category health data), regional bank-sync gaps, mobile backward compatibility, notification fatigue.
   - Technical suggestions made then (modular monolith, PostgreSQL, a database-backed job queue, envelope encryption, row-level security, and others) are **advisory only. They are not approved architecture** (see Part E).
8. **Audience, problems, value.**
   - Claude recommended **expats** as the first segment and proposed repositioning around deadlines and documents.
   - **The user rejected the repositioning.** Omniva stays a comprehensive platform, the audience is individuals, and expats are only one candidate entry segment (Section A0).
   - Claude acknowledged it had confused identity with entry strategy.
9. **Product Vision Finalization, Areas 1–7.** Decided collaboratively (Part A).
10. **Product Definition & Planning started.** Structure set (Scope → Journeys → MVP). The HTML document was created. S1–S8 approved (Part B).
11. **End of session.** The user asked for this handoff and said they would continue tomorrow, possibly in a new chat.

---

# Part A: Product Foundation (approved Product Vision)

## A0. Locked product direction (approved before Product Vision Finalization)
1. **Vision:** Omniva remains an all-in-one platform for managing the different aspects of personal life. All **12 modules** remain the long-term vision.
2. **Audience:** individuals in general. An initial entry segment may be chosen, but it **must not redefine the product's identity**.
3. **Core value:** different aspects of personal life in one connected environment, where information, activities, commitments and resources across modules work together.
4. **Scope:** a smaller MVP is a **prioritization decision**, not a change of vision.
5. **Expats:** a potential entry segment to evaluate, not a committed direction.

**Rejected:** redefining Omniva as an expat life-admin or document-management product.

**Caveat recorded (not a reopening):** "connected life" value is the hardest to communicate and the slowest to appear, because connections only matter once several areas contain data. Validation must prove that people feel the value of connection, and the entry experience must show it quickly.

## A1. Product identity (Area 1, approved)
| Element | Decision |
|---|---|
| Formal category | **Personal Life Management Platform** |
| Public description | **A connected platform for managing your personal life** |
| Main tagline | **Your Life, All in One Place** |
| Supporting line | **Your Life, Connected** |
| Product structure | **Structured core, flexible edges:** predefined module structures, extended with custom fields, tags and custom item types |
| Product approach | **Hybrid:** Omniva is the primary environment for managing and connecting personal life data, and it integrates with specialist services where appropriate |

Suggested usage, not formally decided: tagline for brand and headlines, supporting line under the tagline, public description for app stores and "about" text.

**Identity statement (approved):**
> Omniva is a comprehensive Personal Life Management Platform that brings together and connects the different aspects of an individual's life in one private environment. It provides structured tools for managing personal information, responsibilities, resources, and activities, allowing different areas of life to interact and support one another.

**What Omniva is not (approved):** not a productivity-focused application · not a blank-canvas tool like Notion · not trying to compete with specialist apps on every feature · not exclusively a family application · not an AI chatbot with storage · not a social network · not a collection of disconnected mini-apps · not a platform that forces users to use every module · not a business management or ERP system.

**Rejected alternatives and why:**
- **"Life OS" as the category:** crowded, and it signals productivity.
- **A blank canvas:** a canvas can't understand that an insurance policy belongs to a car and renews yearly, so it can't deliver the connected value.
- **Replace-only:** a feature race with every specialist app.
- **Connect-only:** too dependent on third parties, and Omniva wouldn't be a destination.

## A2. Product vision (Area 2, approved)
- **Vision:** "A world where people feel informed, prepared, and in control of the important aspects of their lives, with the clarity and confidence to make better decisions and focus on what truly matters."
- **Mission:** "Omniva brings together and connects the different aspects of personal life, helping people organize their information, understand their circumstances, manage their responsibilities, and stay ahead of what matters through one private and intelligent platform."
  - Interpretation note: "intelligent" covers Omniva's built-in structured understanding of data, not only AI.
- **Central outcome:** **Clarity** and **Proactive support** are the outcomes. **Ownership** (control over personal information and decisions) is the foundation. "Less effort" was deliberately not made the vision, because it pulls toward a productivity identity.
- **Role of intelligence:** **an organizer growing into a partner.**
  - First: organize, understand and connect.
  - Later: understand relationships between areas, spot conflicts, anticipate commitments, suggest, help plan and decide.
  - **Constraint:** Omniva's core value must not depend on AI.
- **Privacy in the vision:** a brief mention in the vision, with detail in the principles. Privacy is a basic condition of the product, not its whole identity.
- **What success looks like (long-term outcomes, not metrics):**
  1. Users rarely miss an important commitment, renewal or deadline.
  2. Users can answer any question about their life in seconds.
  3. Users trust Omniva with their most sensitive information.
  4. Life areas inform each other without manual effort.
  5. People call Omniva "where my life lives."
  6. Users understand how decisions or events in one area affect other areas.
  7. Users manage personal and shared responsibilities without losing control of their private information.

## A3. Target audience (Area 3, approved)
| Layer | Decision |
|---|---|
| Broad audience | Individuals in general |
| Primary user profile | **People with complex lives:** people managing many aspects of life at once (responsibilities, finances, possessions, commitments, documents, sometimes on behalf of others). **Not defined by age or occupation.** |
| Early adopters | **Self-organizers:** people already organizing life with spreadsheets, notes, folders, Notion or similar |
| Entry-segment shortlist (to validate, no commitment) | 1. Self-organizers. 2. People in major life transitions (moving, marriage, a child, a new job, a first home), with expats as a possible sub-group. 3. Young couples building a shared life |
| Selection rule | The final entry segment is chosen through validation and reachability. Segments never narrow the broad audience. |
| Participants | **Shared workspace members** (invited users with their own private accounts) and **managed profiles** (dependants without accounts). These are two separate concepts. Managed profiles are long-term. |
| Not designed for (positioning boundaries, not bans) | Businesses and teams. People who only need a simple to-do list. Specialist power users. Minors as independent account holders (they can be managed profiles). People unwilling to store personal information digitally. |
| Geography | **Global product, regional entry.** Entry region: **Pending.** |
| Language | Arabic and English are both intended product languages. LTR and RTL designed from the start. Launch may prioritize English. Not restricted to one language or region. |

Earlier segment analysis (advisory): segments were scored on pain, document and deadline load, willingness to pay, reachability, fit and competition gap. Later, the criteria were revised to focus on **connected value**: breadth of need, pain from disconnection, triggers, willingness to pay, reachability and expansion path. Aging-parent caregivers were rated a strong second segment, but sharing-first.

Validation methods discussed (Proposed, for later use): desk research in forums; 15–20 problem interviews following "Mom Test" principles (past behaviour, not hypotheticals); a survey of 100+ people; a landing page with pricing and a waitlist; a concierge test (manually tracking 5 people's deadlines for 4–6 weeks); decision thresholds set in advance. The key hypothesis to test first: *people suffer because life information is scattered and disconnected, and they value having it connected.*

## A4. Value proposition (Area 4, approved)
- **Headline:** "Your whole life, connected, so you always know where things stand and what's coming next."
- **Explanation:** "Omniva links your commitments, money, possessions, documents, health and plans, so information in one area supports the others and nothing important falls through the cracks."
- **Pillars:**

| Pillar | User benefit | Link to vision |
|---|---|---|
| See | One clear picture of every area of life | Clarity |
| Connect | Related things stay together as one record | Core value |
| Anticipate | Know what's coming before it becomes a problem | Proactive support |
| Control | Private, exportable, shared only by choice | Ownership |

- **Low effort is not a pillar.** It's a binding principle (A5). Rationale: it keeps the value proposition focused while still holding the product to effortless capture.
- **Value timeline (part of the official value proposition):**
  - First session: immediate clarity from a few entries.
  - First weeks: the first useful reminder, and the first time one area helps another.
  - Months onward: compounding value.
  - Rationale: connected value builds up over time, so the first week is the riskiest.
- **Differentiation:** vs specialist apps (they see one area), other all-in-ones (side-by-side modules, single-country, family-only), blank-canvas tools (DIY, no understanding of the data), and **the status quo** (folders, email, spreadsheets, memory). The status quo is the main competitor in practice.
- **Segment entry messages (validation drafts, not final copy):**
  - Self-organizers: "Everything you've been organizing by hand, finally connected, and it reminds you."
  - Life transitions: "Big change touches every part of your life. Keep all of it under control in one place."
  - Young couples: "Build your shared life without giving up your private one."
- **Signature scenarios (approved as illustrations):** the car, the move, the trip, the new baby.

## A5. Product principles (Area 5, approved)
Five core principles, each with supporting rules:
1. **Your life, your control:** private by default · the user owns their data (full export in open formats, real deletion) · sharing is explicit, granular and revocable · no data monetization (no ads, no data sales, no AI training on user data).
2. **Honest and reliable:** trust through transparency (plain language, including limits) · **reliable above all** (accuracy before new features). The reliability principle was added by Claude because a system of record loses trust after one missed reminder.
3. **Connected by design:** connected, never isolated · structured core, flexible edges · integrate rather than replicate.
4. **Effortless and calm:** low effort first · show only what's relevant · proactive, but calm (digests over noise, no engagement tricks).
5. **Grow with quality:** useful without AI, AI assists and the user decides · depth before breadth · global and inclusive by design (languages, RTL/LTR, currencies, time zones, accessibility).

**Conflict priority (approved):** trust & control → reliability → low effort & calm → connection → breadth and new capabilities.
- Recorded trade-off: putting low effort above connection means a connection feature waits until it can be made simple. Rationale: a connection users find too complicated delivers no value.

## A6. Public commitments to users (approved)
- We never sell your data or show you ads.
- We never use your data to train AI models.
- You can export everything, anytime.
- Deleting your data really deletes it.
- Nothing is shared unless you share it.
- You keep **read-only access and export with no time limit**, even if you stop paying. (Accepted business cost: some users keep reading their data for free. Rejected alternatives: time-limited read-only access, and export-only.)

## A7. Product boundaries and ownership model (Area 6, approved)
- **Three-zone model**, used for all modules and all future feature decisions:
  - **Own:** built and maintained natively.
  - **Connect:** handled by specialists, with Omniva importing or syncing the data and connecting it.
  - **Out of scope:** not provided, unless the direction is deliberately reconsidered.
- **Module boundaries:** see Section B4. The table was approved with clarifications for Learning, Social and Finance.
- **Cross-cutting boundaries:**
  - **Moving money: never.** Omniva may direct users to banks or licensed providers.
  - **Professional advice: informational only.** Omniva organizes, highlights patterns, gives general information and flags matters needing attention. It never presents itself as a medical, financial or legal adviser. This applies to AI too.
  - **Acting on the user's behalf: prepare first, delegated actions later.** Delegated actions require: explicit approval before execution, a clear description of the action and its consequences, revocable authorization, recording in the Activity Timeline, and separate approval for high-risk or irreversible actions.
  - **Communication: comments on items only.** No general messaging. Comments inherit the item's permissions.
  - **Third-party ecosystem:** deferred to Area 7, then decided (A8, 7.5).
- **Boundary-change rule:** moving a capability from Out of scope into Own or Connect requires a deliberate decision, evaluation against the Vision and the Principles, and documented reasoning. Shifts between Own and Connect go through normal planning.

## A8. Long-term direction (Area 7, approved)
- **7.1 Destination (approved):** the trusted home of personal life, growing into a proactive personal life partner. The "developer platform" destination was left open, then not pursued (7.5). Stage-based with indicative horizons, no fixed dates. Rationale: reaching stage 4 depends on resources more than on vision.
  - Destination statement: "In the long term, Omniva is the trusted place where people keep and connect the important parts of their lives, and a proactive partner that helps them anticipate what's coming, plan ahead, and make better decisions, always under their control."
- **7.2 Stages (approved):**

| Stage | Purpose | Exit criteria | Horizon |
|---|---|---|---|
| 1 Trusted Foundation | Prove the core value with early adopters. **Connected from the start.** | Early adopters rely on Omniva for real commitments, the value timeline is delivered, no trust or reliability failures | ~Year 1 |
| 2 Expanded Life | Expand across life. **Public launch** at the start. | Users manage several areas and shared responsibilities, connections used regularly, paying users sustain the product | ~Years 1–3 |
| 3 Proactive Life | Omniva anticipates | Users act on warnings and suggestions | ~Years 2–4 |
| 4 Life Partner | Intelligent partner | Users trust Omniva to plan and, where approved, act. Still useful without these features. | ~Years 4–5+ |

  - Progression is **criteria-based**. Stage 2 was renamed from "Connected Life" to "Expanded Life" so it doesn't imply connection is missing in stage 1.
  - Capability placement: shared workspaces (2), Vault (2, before public launch), mobile capture (2), Arabic (2), managed profiles (3), analytics and automation (3), delegated actions (4).
  - **Conditional:** shared workspaces and Arabic may move to stage 1, depending on the entry segment (young couples) or region (Arabic-speaking).
  - *Note:* the Vault's stage placement here is a direction. Its product definition was decided later in S3b.
- **7.3 Module expansion (approved, recommendation accepted):** modules are ordered by connection value, validated demand, low-effort potential, integration availability and risk. Each uses the module contract and quality bar, and may start as templates and deepen.
  - Indicative sequence:
    - Stage 1: Documents, Assets, Subscriptions, Finance (tracking), Home, light Productivity, Life Overview
    - Stage 2: Travel, Social, Career, basic Health
    - Stage 3: deeper Health, Learning, Entertainment, deeper Finance
    - Stage 4: all modules at the quality bar
  - *This is a direction, not the MVP decision.*
- **7.4 Intelligence (approved, recommendation accepted):**
  - L0 structured intelligence, no AI (stage 1)
  - L1 assisted capture, opt-in (stages 1–2)
  - L2 insight and anticipation (stage 3)
  - L3 conversational assistant with citations (stages 3–4)
  - L4 planning and delegated actions (stage 4)
  - Guardrails: opt-in per workspace and module, never the Vault, informational only, confirmation before changes, no-retention providers, no training, swappable provider.
- **7.5 Ecosystem (approved, recommendation accepted):**
  - Stages 1–2: no public API or plugins. Omniva builds its own integrations, plus full export and read-only calendar feeds.
  - Stage 3: user-authorized personal connections (scoped, revocable).
  - Stage 4: evaluate curated partner integrations.
  - Not pursued: an open plugin marketplace, or Omniva as a developer platform. Rationale: third-party code touching life data is a privacy risk.
- **7.6 Platforms (approved, recommendation accepted):**
  - Web is primary from stage 1 (with mobile-web capture and email forwarding).
  - Native mobile in stage 2 (capture, reminders, lookup, offline read).
  - No desktop app.
  - Wearables and voice through Connect in stages 3–4.
  - Notifications: in-app and email, then push.
- **7.7 Shared life (approved, recommendation accepted):**
  - Stage 1: personal workspace, with sharing designed into the model.
  - Stage 2: shared workspaces (Owner, Editor, Viewer roles, module-level access, comments).
  - Stage 3: managed profiles, item-level sharing, time-limited links, shared Vault items.
  - Stages 3–4: legacy and emergency access (trusted contacts, waiting period, the owner can cancel).
  - Constant rules: personal data is never reachable through shared membership, and leaving is always possible.
- **7.8 Sustainability (approved, recommendation accepted):**
  - Freemium subscription. The free tier must deliver real value. Paid tiers add storage, Vault, sharing, intelligence and integrations. Annual pricing, maybe a lifetime option. AI usage capped per tier.
  - Distribution through organizations (employers, relocation services) may be evaluated later, only if the organization never has data access.
  - **Pricing details: Pending.**
- **7.9 Guardrails (approved, recommendation accepted):** never ads or data monetization; never a social network or engagement-maximizing app; never a surveillance tool; never data lock-in; never silent AI actions; never privacy-compromising growth tactics (contact scraping, invite spam); never forced use of every module; never business or ERP software; never trading reliability for features; never moving money.

---

# Part B: Product Definition, Area 1 Product Scope

Structure of Product Definition (approved): **Product Scope (S1–S8) → User Journeys & Use Cases (J1–J6) → MVP Definition (M1–M8)**.

**Amendments after approval (session 2):** S2 passport clarification (Identity document in Documents, not an Item); S4 disposal clarification ("ask, never assume"); J6 additions and clarifications G1–G19 (see Part C). The tables below show the original approved text except where marked. Each builds on the previous one. Gaps found in the journeys must be sent back to scope explicitly, never added silently.

## B1. S1 Platform structure (Approved)
- **Option C, layered hybrid**, with four conceptual layers:
  1. **Foundation:** account and identity, workspaces, permissions and sharing, privacy, import and export, notifications. Later resolved in S3b: the E2EE Vault (optional, limited), Automation (behind the scenes) and the Security log also sit here.
  2. **Core building blocks** (S2).
  3. **Life modules (12).**
  4. **Cross-life experiences:** Life Overview, Unified Calendar, Universal Search, Activity Timeline, Insights (embedded), AI Assistant (optional).

  Plus **integrations (Connect)** feeding data into modules and building blocks. It must support structured core, flexible edges, and connected by design. *This is a product structure, not a system architecture.*
- **Rejected:**
  - Option A, module-centric: produces mini-apps, connection becomes an afterthought, duplication.
  - Option B, building-blocks only: modules become too thin for domain concepts like medications or itineraries.
- **Items and modules:** **one canonical home module per item, visible in others.** One source of truth, never duplicated records. Example: a gym membership lives in Subscriptions & Services, appears in Health & Fitness, and its cost connects to Finance & Wealth.
- **Custom item types:** created inside the module where they belong, with a general fallback area. They always use the shared building blocks.
- **User clarifications at approval:** privacy, identity, permissions and sharing belong to the Foundation. The E2EE Vault was not approved at S1 (it was later approved in a limited form in S3b). Personal Analytics and Automation placement were left to S3.

## B2. S2 Core building blocks (Approved; confirmed by the user on 24 Nov 2026)
**The problem:** which shared types exist, and what every block has in common. Missing concepts force each module to invent its own, too many blur the core, and unclear definitions break the one-source-of-truth rule.

**Ten blocks:**
| Block | Represents | Examples |
|---|---|---|
| Item | Something you own, hold or have | Car, laptop, apartment, bank account |
| Document | A file plus what it's about | Invoice, warranty, contract, ID scan |
| Money record | A one-time amount of money | Purchase cost, repair bill, refund |
| Obligation | An ongoing commitment that repeats or renews | Subscription, insurance, rent, loan, licence renewal |
| Event | Something that happens at a specific time | Appointment, flight, birthday |
| Task | Something to do | Renew passport, service the car |
| Person | Someone in your life | Family member, doctor, mechanic |
| Note | Lightweight text linked to anything | Book notes, repair history notes |
| **Plan** (added) | A time-bound life situation grouping things across modules | Trip, move, renovation, wedding, new baby |
| **Measurement** (added, long-term set) | A value recorded over time | Weight, blood pressure, car mileage, meter reading |

- **Why Plan was added:** without it, a move is scattered tasks, costs and documents with no container. It's the natural home for cross-module journeys. Risk of overlap with Travel, resolved by building Travel's Trip on Plan.
- **Why Measurement was added:** otherwise Health, Assets (mileage) and Home (meter readings) each invent their own. When it's needed is an MVP question.
- **Considered and not made blocks:**
  - Place or address: an attribute, with properties as Items.
  - Goal: a Productivity type.
  - Account: an Item type.

**Tasks vs reminders (approved as part of S2):**
- Task is a building block (something to *do*).
- **Reminders are a shared capability** that attaches to *any key date* (a document's expiry, an obligation's renewal, an event, a task's due date).
- Rationale: a passport expiry shouldn't need a separate task just to get a reminder, and making users create tasks for reminders breaks the low-effort principle.
- Rejected alternative: reminders only inside tasks.

**Shared anatomy:** every block, module type and custom type has:
- title and type
- home module
- workspace and owner
- **key dates (universal)**
- status
- links
- attachments
- tags and custom fields
- history

Rationale for universal key dates: they turn stored information into proactive support. Without them, the Calendar and Reminders can't work across areas. Rejected: a minimal anatomy with module-specific properties.

**Visibility:** block names are **mostly invisible** to users, who see real-world types ("Car", "Passport", "Netflix"). Which plain words appear in the interface ("Plan", "Note", "Insights") is decided in the journeys (**Pending**).

## B3. S3 Shared platform capabilities (Approved; S3a and S3b)
**S3a, core experiences (approved):**
| Capability | Definition | Rejected alternatives |
|---|---|---|
| Life Overview | **Attention-first:** what needs attention (upcoming key dates, overdue tasks, expiring items), then a card for where each active area stands, then recent changes. Light customization (hide or reorder cards). | Dashboard of every module (clutter, mini-apps on one page); fully customizable (setup effort, blank-canvas drift) |
| Unified Calendar | Events and **key dates together, visually distinct**, filterable by module, workspace and type, across all workspaces the user belongs to, within permissions. External sync is in S6. | Events only (hides deadlines); separate views (breaks "unified") |
| Universal Search | One search across all blocks, modules and workspaces, within permissions. **Text inside documents is in long-term scope** (timing is an MVP question). Natural-language questions belong to the AI Assistant. | Titles and metadata only |
| Reminders & notifications | Reminders on any key date. **Smart defaults per type, visible and editable, delivered calmly:** urgent ones notify directly, others go to a periodic **digest**. In-app and email, with push later. Quiet hours. | Smart defaults that all notify (noise); user-set only (proactive value disappears) |
| Capture & import | Quick add, templates, document upload, email forwarding, bulk import (spreadsheets, calendar files), plus a **capture Inbox** (capture now, organize later) with gentle prompts in the digest to sort it. Assisted extraction is opt-in intelligence, never required. | No Inbox (more people give up during capture) |
| Export & portability | Full export of all blocks and modules in open formats, anytime, including after cancelling | — |

Dependency noted: Overview, Calendar and Reminders all rely on reliable key dates, so the journeys must show low-effort, verifiable date capture.

**S3b, advanced capabilities (approved):**
| Capability | Definition | Rejected alternatives |
|---|---|---|
| Activity Timeline & Security log | **Two separate concepts.** Activity Timeline: changes and actions on items (including automatic changes and future delegated actions), within permissions. Security log: sign-ins, devices, exports and sharing changes, **owner only**. **Rule: record changes, never views.** No "last seen", nothing about a member's private items. Life history is covered by past calendar entries and key dates. | One combined stream (mixes security with life, visibility problems); three concepts (life history duplicates the calendar) |
| Automation | A **behind-the-scenes shared capability**, not a user-facing experience. Committed core: **built-in smart behaviours** (renewals roll dates forward, expiry changes status, templates create default reminders, recurring obligations create expected costs). Every automatic change is visible in the Activity Timeline and can be undone. User-configurable rules are a possible future capability (S8). | A user rule builder (few people build rules, complexity, canvas drift) |
| Insights (formerly "Personal Analytics") | **Embedded in context:** cost of ownership on an item, subscription totals, spending trends, plus summaries in the Overview and digest. No separate analytics area. Informational only. Final wording is Pending (journeys). | A separate analytics dashboard (empty with sparse data); no analytics |
| AI Assistant | **Embedded first, with an optional "Ask" interface** whose answers cite the records used. **Can be switched off entirely at account level, and Omniva stays fully functional.** All 7.4 guardrails apply. | Chat interface first (risks the "chatbot with storage" identity); embedded only |
| E2EE Vault | **In long-term scope, limited:** an optional protected area for **sensitive files and notes only**. Per item, the user chooses whether the title and key dates stay outside encryption. Mandatory recovery key. Plain-language explanation of its limits. Excluded from server search, insights, AI and automation. Timing is an MVP or stage question. | Not in scope; defer the decision. Claude said openly that deferring was also reasonable, given the privacy paradox. |

Caveats recorded for the Vault: permanent data loss if both the passphrase and the recovery key are lost; in a web app, E2EE doesn't protect against a compromised server delivering modified code, so marketing must stay honest; Vault items lose connected features.

## B4. S4 Module responsibilities (Approved, recommendation accepted; boundaries from Area 6 approved)
| Module | Purpose | Main types | Key connections | Defining decision | Own | Connect | Out of scope |
|---|---|---|---|---|---|---|---|
| Personal Productivity | Manage personal actions and commitments across life | Task (subtasks, recurrence), Commitment (a task owed to a person), Goal, Habit | Tasks attach to any item. Goals link to Plans. | **Light habits, no streaks, badges or guilt notifications** (gamification conflicts with "calm" and the non-productivity identity) | Personal tasks, reminders, commitments, light goals and habits | External task and calendar apps | Team project management, time tracking, complex productivity methods |
| Finance & Wealth | Understand where money stands and goes across life | Financial account (Item), Expense and income (Money record), Bill, loan and debt (Obligation), simple Budget, Net worth (Insight) | Costs of assets, obligations, trips and plans. Multi-currency. | **"Money connected to life":** Omniva owns money attached to things, account balances and net worth. Detailed transaction history comes through import or Connect. Rejected: full transaction tracking (a feature race with budgeting apps). | Tracking accounts, assets, obligations, expenses, recurring costs. Overviews, simple budgets, net worth. | Bank data, investment platforms | **Executing transactions**, tax filing, professional financial advice |
| Health & Fitness | Keep health information organized, current and ready | Health record (Document), Appointment (Event), Medication, Vaccination, Condition and allergy, Measurement, Provider (Person) | Costs and insurance link to Finance and Subscriptions. Appointments appear in the Calendar. Memberships show here. | **Excluded from AI and Insights by default**, enabled only by explicit choice (most sensitive category). Dependants' records come with managed profiles. | Records, appointments, medications, logged metrics | Wearables, health apps | Diagnosis, medical advice, coaching programs, telemedicine |
| Knowledge & Learning | Track what you learn and want to learn | Course, Book and resource, Skill, Learning goal, lightweight Notes | Course costs link to Finance. Courses result in certificates. Goals link to Productivity. | **Certificates live in Career**, linked to the course and visible in Learning | Courses, books, skills, goals, lightweight linked notes | Learning platforms, reading apps | Hosting courses. **A full note-taking or knowledge-management app** (not a Notion or Obsidian competitor) |
| Career & Professional | Keep working-life records in one place | Employment, Credential and certificate, CV (Document), Application, Professional contact | Contracts, payslips and permits link to Documents. Income to Finance. Credentials to Learning. | **Light application tracking** (company, role, status, dates, linked documents). No pipeline tooling. | CV, certificates, history, applications, contacts | Professional networks, job platforms | Job board, professional social network, business tools |
| Assets & Possessions | Everything you own, across its lifecycle | Vehicle, Electronics, Appliance, Furniture, Valuable, Collection item, custom types | Invoice and warranty to Documents, cost to Finance, insurance to Subscriptions, maintenance to Tasks, mileage to Measurements | **The lifecycle includes disposal** (sold, given away, discarded, with sale price). *Clarified 24 Nov 2026 (J3.1):* on disposal Omniva asks about each linked obligation and marks it ended only when the user confirms; reminders stay active until then; warranties end with the item. | Inventory, value, warranties, maintenance, links | Insurance or valuation services (later) | Marketplace for buying or selling |
| Social & Relationships | Remember and care for the people who matter | Person, Important date, Relationship note, Gift idea | **The home of every Person** (people directory), referenced everywhere. Gifts link to Finance. | **Information about others:** only what the user enters, for private use. No enrichment, scraping or AI profiling of others. Selective contact import. Removal requests honoured where a person can be identified. | Contacts, important dates, notes, gift ideas, under privacy principles | Phone contacts, external calendars | Messaging, feeds, public profiles. **Surveillance or people-tracking.** Profiling others without their knowledge or consent. |
| Travel & Experiences | Plan trips and keep what matters together | Trip (built on Plan), Itinerary item (Event), Booking, Trip budget, Places-to-go list | Travel documents to Documents, costs to Finance, companions to People | **Rule-based checks** (no AI), for example a passport expiring within six months of the trip. Light wish list. | Trips, itineraries, stored bookings, travel documents, budgets | Booking confirmations (email or import) | Booking engine, travel agency services |
| Home Management | Run the place you live | Property, Lease and mortgage, Utility (Obligation), Maintenance (Task), Shopping list (light), Service provider | Items located at the property. Lease to Documents, costs to Finance, utilities in the Subscriptions overview. | **A property's home is Home Management** (visible in Assets and Finance). **Utilities live in Home.** | Properties, maintenance, utilities, household tasks, shopping lists | Utility providers, smart-home data (later) | Smart-home control, landlord property management |
| Subscriptions & Services | Know every recurring commitment, its cost and renewal | Subscription, Insurance policy, Membership, Service contract, Free trial | Insurance covers items and people. Costs to Finance. Streaming to Entertainment. Gym to Health. | **Insurance's home is Subscriptions**, visible on the insured item. Free trials tracked. An **All recurring commitments** view across modules (rent, loans, utilities). | Tracking, renewals, costs, links | Bank data to detect subscriptions | Payment processing, negotiating with providers |
| Documents & Files | One library for every important file | Document, Identity document, Contract, Receipt and invoice, Certificate file | Attached to anything. Expiry dates feed reminders. Identity documents feed Travel checks. | **The home of all files**, attached to and visible on related items. Organized by types, tags and smart views. **No folder tree.** | Storage, classification, expiry dates, search, links | Cloud drives, email (import) | Full cloud-drive replacement, collaborative editing |
| Entertainment & Lifestyle | Track what you enjoy and want to enjoy | Watch, read and play list item, private log with rating, Hobby, Event ticket | Memberships in Subscriptions, collections in Assets, tickets in Documents and Calendar | **Light private log and ratings. No social sharing.** | Lists, hobbies, events, memberships | Streaming and media services | Streaming or content delivery |

## B5. S5 Cross-module relationships (Approved, recommendation accepted)
- A defined set of **named relationships**, plus a generic "related to":

| Relationship | Connects | Example |
|---|---|---|
| attached to | Document → anything | Invoice attached to a laptop |
| costs | Money record → anything | Repair bill for the car |
| covers | Obligation → Item or Person | Insurance covers the apartment |
| maintains | Task or Event → Item | Annual boiler service |
| part of | Anything → Plan | Flight is part of the trip |
| involves | Anything → Person | Landlord on the lease |
| located at | Item → Property | Washing machine at the apartment |
| results in | Anything → anything | Course results in a certificate |
| replaces | Item → Item | New phone replaces the old one |
| related to | Anything ↔ anything | Generic |

- Links are **two-way visible**.
- **Links stay within one workspace.** Connecting a personal item to a shared one means moving it. When an item moves, the user chooses which related items move with it and sees what will become visible. (Private references across workspaces are a possible future capability.)
- Plans group things through "part of" without changing each item's home module.
- **No silent cascading deletes.** The user sees what's linked and decides.
- A module connection map (strong and common connections) is in the HTML document.

## B6. S6 External integrations (Approved, recommendation accepted)
**Rules:** opt-in, read-only by default, revocable · the user sees what is imported · imported data follows ownership, export and deletion rules · a failure never breaks the core · regional availability documented · never used to move money or act on the user's behalf.

| Integration | Direction | Stage | Notes |
|---|---|---|---|
| External calendars | Import events, read-only feed out | 2 | Two-way sync is a possible future capability |
| Cloud drives | Import files | 2 | Not a drive replacement |
| Phone contacts | Selective import | 2 (mobile) | No bulk upload (protects other people's privacy) |
| Travel bookings | Via email forwarding | 2–3 | Become events and documents |
| Bank and financial data | Read-only import | 2–3 | **Region-dependent.** Never payments. |
| Mailbox connection | Read-only, opt-in | 3 | Privacy-heavy. Email forwarding comes first. |
| Health platforms and wearables | Read-only import | 3 | Needs mobile. Health excluded from AI and Insights by default. |
| Streaming, learning, professional networks | Import | 4 | Low priority |
| Insurance, valuation, utility providers | Import | Later, to evaluate | Region-dependent |

Specific providers per region are **Pending** (they depend on the entry region).

## B7. S7 Dependencies (Approved, recommendation accepted)
Order: Foundation → building blocks and anatomy (key dates) → shared capabilities → modules → cross-life experiences.

| Dependency | Required by | Implication |
|---|---|---|
| Key dates + Reminders | Every proactive feature, Overview, Calendar | Must be reliable before any module counts as done |
| Documents & Files | Almost every module | The dependency hub. It comes early. |
| People directory (Social home) | Health and Home providers, Career contacts, Travel | A basic directory is needed early, even if full Social comes later |
| Obligations | Subscriptions, utilities, insurance, loans | Underpins all recurring commitments |
| Money records | Cost of ownership, Insights, Finance | Needed for the first connected insights |
| Plans | Travel, moves, life transitions | Needed for life-transition journeys |
| Measurements | Health, mileage, meter readings | Can follow later |
| Shared workspaces | Couple and household journeys | Conditional placement (7.2) |
| Managed profiles | Family health and documents | Needs mature sharing and privacy rules |
| Integrations | Health depth, bank data, travel import | Region-dependent, never block the core |
| AI Assistant | Ask, suggestions | Depends on everything, and nothing depends on it (it's optional) |

## B8. S8 Long-term product vs future capabilities (Approved, recommendation accepted)
- **Committed long-term scope:**
  - all 12 modules as in S4
  - the ten blocks and the anatomy
  - all S3 capabilities, including the limited Vault
  - shared workspaces and managed profiles
  - legacy and emergency access (stages 3–4)
  - user-authorized personal connections (stage 3)
  - delegated actions with every Area 6 safeguard (stage 4)
  - text inside documents in search
- **Possible future capabilities (not committed; evaluated through the boundary-change rule):**
  - user-configurable automation rules
  - two-way calendar sync
  - private references across workspaces
  - curated partner integrations (stage 4)
  - offline editing on mobile
  - voice assistants and smart devices
  - distribution through organizations (no data access)
- **Not pursued:**
  - a public developer platform or plugin marketplace
  - general messaging or chat
  - payments or moving money
  - a separate analytics area
  - gamification
  - a separate desktop app
  - everything marked Out of scope
- **Managed profiles (approved concept, details Pending):**
  - A Person with managed status. Their records belong to the managing user's workspace (personal or shared, for example both parents).
  - The dependant has no access while managed.
  - When the dependant becomes an adult, the profile can be handed over as their own account, transferring their records, with consent.
  - Stage 3. Detailed permissions, privacy and edge cases come during specification.

---

# Part C: User Journeys & Use Cases (Area 2, **approved**)

**Status:** J1 approved in session 2 (24 Nov 2026, "approve all recommendations for J1"). Next topic: **J2**.

**J1 (Approved, recommendation accepted):**
- **Personas:** thin, situation-based, labelled as hypotheses (life load, current tools, trigger, fear, success), each mapped to an entry segment, replaced by interview evidence, never justifying a feature alone. P1 self-organizer · P2 person in transition (expats a variant) · P3 couple building a shared life (secondary role: the less-engaged partner) · P4 person carrying others (long-term, stage 3). The "not designed for" profiles are a check only. Rejected: demographic personas; jobs-only.
- **Format:** narrative + breakdown: trigger · goal · status quo without Omniva · steps (user / Omniva) · connections that make the difference · value-timeline placement · effort points & failure risks · capabilities used (S refs) · gaps found (to J6). No UI flows. Rejected: user-story lists; UX storyboards.
- **Qualifying criteria:** ≥2 modules/blocks in a way that matters, a nameable status-quo failure, a real persona trigger. Tagged episodic / recurring / daily. No forced module coverage; an absent module is an MVP finding.

**J2 Part 1 (Approved, recommendation accepted):**
- **J2.1 First session:** trigger-led life inventory: optional "What brought you here?", then 5–8 tailored prompts asking only the thing + one key date; default reminders shown (visible, editable); connections offered in natural language; land on an Overview with real dates and cards only for used areas; plain-language privacy promise; document upload optional in session one; import as a side path for P1. Rejected: module picker + empty Overview; import-first default.
- **J2.2 First weeks:** calm digest is the return path; the first miss-preventing reminder is the moment of truth; digest suggestions connection-driven, max 1–2, switchable off. Rejected: no suggestions; completeness scores (gamification).
- **Gaps for J6:** missing key date ("I don't know the date": suggested "date missing" state surfaced gently). Note for M8: "first useful reminder within 10 minutes".

**J2 Part 2 (Approved, recommendation accepted):**
- **J2.3 Capture:** mobile browser + email forwarding in stage 1; optional "link to…" and "is there a date?" hints, else Inbox; simple rule-based suggestions; AI extraction opt-in later. Rejected: classify at capture; Inbox-only.
- **J2.4 Finding:** search + the connected item page as hub (people search by the thing); results show item with attachments; saved smart views; Ask optional. Risk: offline lookups wait for native mobile (stage 2).
- **J2.5 Digest:** weekly default, adjustable; actionable entries incl. keep-or-cancel before renewals; optional quiet-week "nothing needs you" line; no separate weekly-review feature (digest + Overview is the review).
- **Gaps for J6 (cumulative):** missing key date (J2.1); rule-based non-AI matching at capture (J2.3).
- J2 complete.

**J3.0 and J3.1 (Approved, recommendation accepted):**
- **J3.0 Set:** six signature journeys in order: car → something breaks → renewal season → trip → move (covers new job / new country) → new baby (long-term, stage 3). Not now: tax season (out of scope, region-dependent), standalone health episode.
- **J3.1 Car:** works in fragments (day 0 purchase: essentials + suggested key dates, invoice/registration attached; week 1: forwarded insurance email → "link to your car?" → policy covers car; loan if financed; months: service reminder, bill costs car, car page with cost of ownership; renewal: keep-or-review with last premium; sale: asks about each linked item, replaces link, history kept). Essentials first, rest prompted later.
- **Disposal clarification to S4 (Approved, user chose to fix now):** Omniva asks about each linked obligation on disposal and marks it ended only on confirmation. Reason: Omniva can't cancel real policies; assuming would break "reliable above all".
- **J3.2 Something breaks (Approved, recommendation accepted):** item page answers "is it covered?" (warranty status, invoice, possible other cover, past repairs, technician); Omniva prepares (contacts, documents needed), never files claims; claim tracked as a task with notes and follow-up date, reimbursement as Money record; outcome = repair Event or replacing item. Honest limitation: only pays off if captured earlier; strongest demo story.
- **Gaps for J6 (cumulative):** missing key date (J2.1); rule-based capture matching (J2.3); insights must state what they include (J3.1); Claim template candidate, indirect coverage via "located at" ("possibly covered, check your policy"), item-level document download (J3.2). **For M3:** Measurement timing (mileage-based service).
- **J3.3 Renewal season (Approved, recommendation accepted):** category/service checklist (price + cycle only) → All recurring commitments view with monthly/yearly totals and renewal timeline; cancel = Omniva shows how + task, ended only on confirmation; price history; insights incl. overlapping cover (two direct *covers* links). Manual until bank import. **J3.3a** reminders by type (trials a few days before, annual ~30 days, price changes; monthly none by default). **J3.3b** "ask, never assume" is a cross-cutting rule. **J3.3c** service catalog = names and categories, never prices. Note for M2: "What am I paying for?" as a strong first-session trigger.

> **From here on, the user said "approve all recommendations for J3.3 and for the rest to J6".** J3.4–J6 were therefore drafted by Claude and recorded as **Approved (recommendation accepted)** without being discussed point by point. They are the items most open to the user revisiting.

- **J3.4 Trip:** forwarded booking → "Create a trip?" → Trip (Plan) with bookings as Events + Documents; rule-based checks (each traveller's identity document valid through the trip + editable margin, default 6 months; licence if rental car; policy covering the traveller for those dates or "no travel insurance found"); reusable checklist copied from a previous trip; itinerary on mobile web; cost total after. **J3.4a** no destination rules database (never states visa/entry rules; prompts to check official requirements). **J3.4b** companions' documents checked only if in the user's workspace.
- **J3.5 Move:** Move Plan from template; notice deadline computed from the old lease; generated "who has my address?" list from obligations, accounts, identity documents, employer records → tasks; contents policy flagged (covers old property); bulk move of items *located at* old → new property; deposit as an expected amount with key date. New-country variant: permits as identity documents, multi-currency, region items in user-editable templates without legal claims.
- **J3.6 New baby:** long-term reference journey (managed profiles, Health, sharing); no MVP commitments; before stage 3 the baby is a Person with records in the parents' workspace. **No built-in medical schedules.**

**J4 Shared workspaces (Approved, recommendation accepted):**
- J4.1 Setup: invite by email; **several Owners allowed**, co-owner suggested for couples; no Owner removes another; anyone can leave.
- J4.2 Moving the car to shared: preview of what becomes visible; choose related items (illustrates S5).
- J4.3 **Shared costs: split per cost (workspace default, editable), "your share" in personal totals; no balances/settle-up ledger (Connect zone; never move money).** Resolves Part H item 5.
- J4.4 Less-engaged partner: **task assignment to members**, reminders to assignee, digest limited to shared items + own assignments; Viewer role available.
- J4.5 Leaving/breakup: instant, no approval; copy chosen items or export before leaving, **except another member's identity documents and private records about that member**; Omniva doesn't resolve disputes; timeline shows only "left the workspace"; last Owner leaving closes the workspace with a final export offered.

**J5 Edge cases (Approved, recommendation accepted):** reminders persist in the attention list + test notification + delivery-failure notice; date plausibility checks and plain-language confirmation; "date missing" state; **auto-roll only for auto-renewing commitments, action-required renewals expire until updated (clarifies S3b)**; duplicate suggestions, never silent merge; recovery via verified channels with waiting period (Vault unrecoverable without passphrase/recovery key); sign-in/export/sharing notifications and sign-out-all; Vault hidden dates = no reminders (warned); key dates are calendar dates without time, reminding in current time zone; concurrent edits flagged, not lost; "last updated" on imported data; nothing deleted for exceeding limits; legacy access stage 3–4, stated honestly; controlling-partner protections restated.

**J6 Scope gaps (Approved, recommendation accepted).** No addition moves anything out of Out of scope. MVP timing for each is an Area 3 question.
| # | Decision | Amends |
|---|---|---|
| G1 | "Date missing" state | S2 anatomy, S3a reminders |
| G2 | Rule-based (non-AI) capture suggestions, user confirms | S3b automation, S3a capture |
| G3 | Insights state what they include | S3b insights |
| G4 | Claim template (not a block) | S3a templates |
| G5 | Indirect coverage "possibly covered by" via covers → located at; informational | S5 |
| G6 | Item-level / Plan-level document download | S3a export |
| G7 | User-created templates from Plans/checklists | S3a templates |
| G8 | Templates drawing suggestions from existing records | S3a templates |
| G9 | Bulk change of *located at* | S5 |
| G10 | Shared-cost split + "your share"; settle-up ledger Out of scope | S4 Finance, sharing |
| G11 | Task assignment in shared workspaces | S4 Productivity |
| G12 | Several Owners per shared workspace | 7.7 roles |
| G13 | Leaving with copies (exclusions above) | Foundation: sharing |
| G14 | Date plausibility checks | S2 anatomy |
| G15 | Duplicate suggestions | S3b automation |
| G16 | Auto-roll only for auto-renewing commitments | S3b automation |
| G17 | "Ask, never assume" cross-cutting rule | All modules |
| G18 | "Last updated" on imported data | S6 rules |
| G19 | Security notifications | Foundation |
| — | Not pursued: destination entry rules database, built-in medical schedules, prices in the service catalog | Boundaries |

**User-facing wording (decided in J6):** Item, Obligation, Money record, Measurement never shown as words; users see real types plus groupings **Recurring**, **Costs**, **Readings**. Visible: **Plan**, **Task**, **Note**, **Document**, **People**, **Important dates** (key dates), **Inbox**; digest named by cadence ("Your week"). Insights have no standing label (inline facts; heading "At a glance" where needed). Arabic equivalents during specification.

**Area 2 is complete.** Next: Area 3, M1.

**Passport clarification (Approved, session 2):** a passport is an Identity document with its home in Documents & Files (scan attached, expiry as key date), not an Item. Fixed the conflicting S2 example in the HTML.

**The user's requirements for this area:**
- Translate the approved scope into realistic experiences: primary journeys, individual workflows, shared workspace workflows, **cross-module journeys (main focus)**, important scenarios and edge cases, how users interact with connected information, and how they achieve meaningful goals.
- **No artificial journeys** made up just to cover every module. Focus on realistic situations where connection makes a real difference.
- Describe how people actually use Omniva, not feature lists.
- If journeys reveal missing capabilities, **revisit scope explicitly** (J6), never add features silently.

**The user's reference example (car purchase):** record the car as an asset → link the purchase cost to Finance → store the invoice in Documents → record the warranty expiry → track insurance in Subscriptions → add maintenance activities and reminders → see upcoming obligations in the Unified Calendar.

**Planned topics:**
| # | Topic | Status |
|---|---|---|
| J1 | Journey framework & personas (personas from the primary profile and entry segments; journey format) | Approved |
| J2 | Foundational journeys (first session, capture, finding things, weekly review) | Approved |
| J3 | Cross-module signature journeys | Approved (J3.4–J3.6 in bulk) |
| J4 | Shared workspace journeys | Approved (in bulk) |
| J5 | Edge cases & failure scenarios | Approved (in bulk) |
| J6 | Scope gaps review (gaps go back to scope explicitly) | Approved (in bulk) |

**Approved inputs to use:** the signature scenarios (car, move, trip, new baby) from A4; the value timeline (A4); the three entry segments (A3); the S3 capabilities (Inbox, digest, smart default reminders, attention-first Overview); Plans (S2); the "changes, never views" rule (S3b); links within one workspace and moving items with their related items (S5); the conditional placement of shared workspaces (7.2).

**Pending wording decisions to settle in the journeys:** which building-block words users see; "Insights" as the user-facing name.

**Considerations raised earlier that journeys should cover (from the feasibility assessment, not decisions):** the empty-app problem and onboarding (a "life inventory" first session); the "where does this go?" problem (the Inbox); notification fatigue; relationship breakdowns and controlling partners in shared workspaces; moving an item from personal to shared (what becomes visible); shared costs between partners (only noted, not defined); lost access and recovery; reliability of dates.

---

# Part D: MVP Definition (Area 3, **approved**)

**Status:** Scope and Journeys are approved, so the MVP can now be defined.

**M1 (Approved, recommendation accepted, user said "approve"):**
- **M1.1** MVP entry-segment assumption = **self-organizers**, with life transitions as *triggers* within the group (move, new car, renewal season). Young couples stay a stage-2 segment, so shared workspaces stay stage 2 (conditional not triggered). Risk: hardest group to win from the status quo.
- **M1.2** Problem: *"I keep my life organized by hand, but the information is scattered and nothing tells me what's coming, so things slip and I can't find what I need when it matters."* Proofs: nothing important slips (Anticipate); anything found in seconds with everything related (See + Connect). Feed M8.
- **M1.3** Region-neutral, English first; multi-currency; no region-dependent features; generic catalog; Arabic/RTL designed in, launched stage 2. Revisit if a specific (especially Arabic-speaking) region is chosen.

**M2 (Approved, recommendation accepted):**
- **Essential (end to end):** J2.1 first session · J2.2/J2.5 reminders + weekly digest · J2.3 capture (mobile web, email forwarding, Inbox) · J2.4 finding · J3.3 renewal season · J3.1 car (without mileage-based service) · J3.2 something breaks.
- **Light:** J3.4 trip (from forwarded booking; documents/events part of trip; passport + insurance checks; cost total; no reusable checklists).
- **Later:** J3.5 move (first candidate to pull in if transitions drive acquisition), J3.6 new baby, J4 shared workspaces.
- **Essential reliability cases:** reminders persist until handled; test notification; date plausibility; date missing; auto-roll only for auto-renewing; ask-never-assume; recovery + security notifications; full export.
- **First-session triggers:** "What am I paying for?", "My car / my things", "Getting organized", "Upcoming trip". No "Moving" trigger yet.

**M3 (Approved, recommendation accepted):**
| Module | Depth | In the MVP | Waits |
|---|---|---|---|
| Documents & Files | Full | upload, types incl. identity docs with expiry, attach to anything, tags, smart views, email forwarding, item-level download | document-text search, cloud-drive import |
| Assets & Possessions | Full | vehicle, electronics, appliances, valuables, custom types; purchase, warranty, maintenance, disposal (ask, never assume), replaces | mileage, valuation |
| Subscriptions & Services | Full | subscriptions, insurance (covers), memberships, trials, All recurring view, totals, price history, reminders by type, catalog of names | bank detection |
| Finance & Wealth | Light | costs on things, loans/bills as obligations, totals, cost of ownership, multi-currency | accounts, balances, net worth, budgets, bank import |
| Home Management | Light | property as a place (located at, covered by), rent/mortgage/utilities as obligations | maintenance schedules, shopping lists |
| Personal Productivity | Light | tasks on anything, due dates, recurrence, reminders | goals, habits, commitments |
| Travel & Experiences | Light | trip (Plan), bookings, passport + insurance checks, cost total | itinerary depth, wish list, reusable checklists |
| Social & Relationships | Minimal | basic People directory | important dates, notes, gifts, contact import |
| Health, Career, Learning, Entertainment | Not in MVP | their documents still work as Documents; health insurance in Subscriptions | all specialised features |
- Reconciles the discovery 7-area direction with the narrower feasibility proposal. Quality risk concentrated in the 3 full modules.
- **M3.2** Measurement not in MVP (time-based car service only). **M3.3** Document-text search not in MVP; first post-MVP candidate.

**M4 (Approved, recommendation accepted, user said "approve"):**
- **M4.1** Essential: account & identity (strong sign-in, 2FA available, recovery with waiting period, security notifications); personal workspace only (sharing designed in, no UI until stage 2); privacy promise; full export + item-level download; **spreadsheet import**; **read-only calendar feed out**; notifications (in-app, email, weekly digest, quiet hours, test notification; no push); built-in automation (G16 auto-roll, expiry status, default reminders, expected costs, G15 duplicates, G2 rule-based capture suggestions); basic Activity Timeline with undo; Security log; flexible edges (tags, custom fields, custom types, fallback); Life Overview; Unified Calendar; Universal Search (no document text). Light Insights (recurring totals, cost of ownership, price changes, overlapping cover; G3). English, RTL-ready, accessible baseline.
- **M4.2** No AI in MVP (L0). L1 opt-in extraction is the first intelligence step after.
- **M4.3** No Vault in MVP (7.2: stage 2 before public launch). No wording implying E2EE.
- **M4.4** J6 in MVP: G1, G2, G3, G6, G14, G15, G16, G17, G19. Later: G4, G7–G9, G10–G13, G18. G5 → M5.

**M5 (Approved, recommendation accepted):**
- **M5.1** Relationship types in MVP: attached to, costs, covers, maintains, located at, replaces, involves, part of (trip only), related to. Later: results in.
- **M5.2** Derived (rule-based): G5 indirect coverage ("possibly covered, check your policy"), overlapping cover, cost of ownership, trip checks.
- **M5.3** Connection prompts essential (creation, capture, digest), always confirmed by the user. M8 candidate: share of items with ≥1 link.
- **M5.4** Automatic "Me" Person record per account.

**M6 (Approved, recommendation accepted):**
- **M6.1** Not in MVP (postponed, not rejected): journeys move/baby/shared; modules Health, Career, Learning, Entertainment + deeper Finance/Home/Social; capabilities AI, Vault, doc-text search, Measurement, push, native mobile, calendar import, cloud drives, bank import, integrations, Arabic UI; J6 G4, G7–G13, G18; *results in*.
- **M6.2** Default order after MVP: wave 1 strengthen the core (doc-text search, L1 extraction, People important dates, claim template + reusable checklists) → wave 2 conditional pull-ins (move; shared workspaces) → wave 3 before public launch (Vault, native mobile + push, Arabic, calendar import, cloud drives, shared if not in) → wave 4 expanded life (Travel depth, basic Health, Career, Social depth, bank import).
- **M6.3** Scope guard: anything not-in-MVP enters only via a documented decision naming what it replaces or why the MVP can absorb it.

**M7 (Approved, recommendation accepted, user said "approve"):**
- **M7.1** Hypotheses, riskiest first: H1 connection value · H2 return without engagement tricks · H3 problem real for self-organizers · H4 low-effort capture · H5 trust without Vault · H6 willingness to pay · H7 reachability · H8 which triggers bring people in · H9 web-first capture enough · H10 reliability holds. H1–H3 decide direction, H4–H10 shape.
- **M7.2** Sequence: problem interviews (15–20, Mom Test) + landing page with pricing/waitlist **start now in parallel with the next stage** → concierge test (5 people, 4–6 weeks) before full build → MVP beta (10–30).
- **M7.3** Failure responses: H3 → revisit entry segment (never identity); H1 → revisit connections/presentation (never silently become a reminder app); H2 → revisit digest/triggers/cadence (never engagement tricks).

**M8 (Approved, recommendation accepted):** thresholds set in advance; may be adjusted from interview data before the beta, never after results.
- **Gates:** A founder use (2 months, catches ≥1 real deadline) → B concierge test (≥3 of 5 see one area help another and would be worse off without it) → C beta (10–30 people, ~3 months).
- **Hard gates:** zero missed/wrong reminders caused by Omniva; zero cross-account data exposure.
- **Core:** ≥60% add 10+ items in week one · ≥80% set a useful reminder in the first session (median ≤10 min) · ≥50% of items linked · ≥40% monthly active at 3 months · ≥50% of active users get ≥1 "save" in 3 months.
- **Signals:** 5+ willing to pay; identity-document uploads; trigger choice; capture channel.
- **Decision rule:** hard gate fails → stop and fix; 4–5 core pass → toward stage 2 (wave 3); 2–3 → iterate (M7.3) and re-run; 0–1 → revisit M1 and MVP shape, never identity.
- **Not success measures:** time in app, DAU, session counts; sign-ups are vanity until activation holds.

**Product Definition (Scope, Journeys, MVP) is complete as of 24 Nov 2026.**

**The user's requirements:** define the smallest **coherent** version that delivers the core value (connecting aspects of life). It must not be a generic CRUD app or a set of disconnected modules. Evaluate scope by core value contribution, user necessity, dependencies, implementation complexity, risk and ability to validate the hypothesis.

**Planned topics:**
| # | Topic | Status |
|---|---|---|
| M1 | Target users & primary problem (entry segment assumption) | Approved |
| M2 | Essential journeys | Approved |
| M3 | Modules & required depth | Approved |
| M4 | Foundational capabilities | Approved |
| M5 | Required connections | Approved |
| M6 | Postponed & excluded | Approved |
| M7 | Assumptions to validate | Approved |
| M8 | Success criteria | Approved |

**Inputs and their status:**
| Input | Status |
|---|---|
| Discovery-stage agreement: MVP modules = Life Overview, Documents & Files, Assets & Possessions, Subscriptions & Services, Finance, Home Management, plus light Productivity | **Agreed direction in discovery.** To be confirmed or adjusted formally in M3. |
| 7.3 indicative stage-1 module sequence (same set) | Approved as a direction, not the MVP decision |
| Feasibility proposal: a narrower MVP (Documents + Assets + Subscriptions/Renewals + Tasks/Reminders + Overview + Search; Finance as "costs attached to things"; Home as a place) | **Proposed**, not accepted |
| Feasibility proposal: gates (founder relies on it for 2 months and it catches a real deadline; beta of 10–30 with ≥60% onboarding with 10+ items, ≥40% monthly active at 3 months, 5+ willing to pay, zero isolation bugs) | **Proposed**, not accepted |
| Feasibility proposal: "first useful reminder within 10 minutes" as an onboarding metric | **Proposed** |
| Conditional placement: shared workspaces and Arabic may enter stage 1 depending on the entry segment or region | Approved (7.2) |
| Timing questions left to the MVP: Measurement block (incl. mileage-based service, J3.1), text inside documents in search, Vault timing, and every J6 addition G1–G19 | Pending |
| Notes from journeys for MVP: "first useful reminder within 10 minutes" (J2.1, M8); "What am I paying for?" as a first-session trigger (J3.3, M2); "something breaks" as the strongest demo story (J3.2); shared workspaces remain conditional (7.2) | Inputs |
| Entry segment and region | MVP assumption set in M1 (self-organizers; region-neutral, English first); final choice after validation |

---

# Part E: System Design (**in progress**, started 24 Nov 2026)

**Framing (Approved, recommendation accepted):** MVP in detail, long-term (sharing, Vault, native mobile, AI) as seams only · decisions in `GLOSSARY.md` + `docs/adr/` (ADR only if hard to reverse, surprising, real trade-off) + living index `omniva-system-design.html` · method: `domain-modeling` + `grilling` one topic at a time; `wayfinder` optional (user-invoked, needs tracker) · git initialised in `F:\Omniva`, remote `https://github.com/Mohaned178/Omniva.git` (**public** repo; the user confirmed on 24 Nov 2026 that it is public on purpose and authorized pushing) · default constraints: low running cost, mainstream cloud host, EU-friendly residency · **Answered in D7:** mostly AI agents; TypeScript + NestJS; budget $0–1/month.

**D1 round 1 (Approved, recommendation accepted):** Record = any entry, Item = possession block only (ADR 0001) · User signs in, Member = participation with role, "Account" only for financial accounts · each member is a Person in each workspace connected to their User ("Me" likewise) · records belong to the workspace, creator is history (ADR 0002) · Block → Type (decides home module) → Template · Event start counts as key date, reminders attach to key dates only · projected vs recorded money records, no "paid" state in MVP (ADR 0003) · Link (stored, named Relationship) vs Inferred connection (computed) · Identity documents have a Holder · Plan Types have home modules (Trip→Travel, Move/Renovation→Home, generic→Productivity). Glossary in `GLOSSARY.md`.

**D1 round 2 (Approved, recommendation accepted):** Archived (universal) separate from block-specific lifecycle state (Item owned/disposed; Obligation active/ending/ended; Document valid/expired; Task open/done; Plan upcoming/in progress/past) · archive keeps everything, delete is real and leaves only "a record was deleted" (ADR 0004) · recurrence only for Obligations, Tasks, Events · per-record currency, workspace main currency, approximate converted totals · key dates exact, month-only or date missing · Captures are not records (ADR 0005). **D1 complete.**

**D2 (Approved, user said "yes to all"):** modular monolith + worker process on the same codebase (ADR 0006) · internal modules by capability: Identity & Access, Workspaces & Membership, Records core, Life modules, Capture & Ingestion, Files, Scheduling & Reminders, Notifications & Digest, Automation, Insights & Inferred connections, Search, History, Portability; interfaces only, no reaching into another module's data · life modules = type packs on Records core (ADR 0007) · records are the source of truth; schedules, search index, insights, inferred connections derived and rebuildable; Activity Timeline in the same transaction; durable change notifications processed by the worker (ADR 0008). **D2 complete.**

**D3 round 1 (Approved, user said "yes to all"):** one shared database, isolation in two layers (app gate + database) with mandatory cross-workspace tests (ADR 0009) · full membership/role checks from day one · email + password, optional authenticator codes and passkeys, no social sign-in in MVP, proven auth library/service, no custom security code · recovery: email reset link + notification; lost 2FA → recovery codes, else email reset with 72-hour wait, announced and cancellable · device sessions in Security log, sign out one/all, re-auth for export, email/password/2FA changes, account deletion · moving records = atomic set move, identity kept, both timelines (stage-2 seam) · no routine staff access to user content (ADR 0010).
**User addition (24 Nov 2026):** visitors must be able to see the home page and other pages, and see what is inside the app, **without signing in**; signing up is required to actually use it. Decided in D3 Q8 (user chose **A**): public pages only (home, features, how it works, pricing, privacy, FAQ, screenshots and videos); using the app requires sign-up/sign-in; no demo, no guest mode. Recorded in the Product Definition as an MVP addition under the M6.3 scope guard. **D3 complete.**

**D4 (Approved, user said "yes to all"):** hybrid storage: fixed anatomy/block columns + flexible structured fields validated by Type definition (ADR 0011) · built-in Types in code per life-module pack, custom types as workspace data, same definition shape · one dedicated key-date collection (record, kind, date, precision, missing) read by reminders/calendar/Overview · RRULE + next occurrence, occurrences for ~13-month rolling window, date-only key dates without time zone, timed Events keep theirs · money as integer minor units + currency, conversions record rate/date/source, marked approximate · one link collection, same-workspace rule enforced in data, two-way by reading both directions · history = timeline filtered by record, by reference, content purged on deletion · random non-guessable IDs, stable across moves. **D4 complete.**

**D5 (Approved, user said "yes to all"):** reminders = derived schedule checked every minute, idempotent sends, daily reconciliation with alerts (ADR 0012) · in-app + email via transactional provider, bounces tracked and shown, weekly digest in user's time zone with quiet hours, reminders persist in Overview · private random forwarding address, mail → Capture, accepted only from verified sender addresses · separate encrypted file storage, short-lived links, malware scanning, per-plan size limits, image/PDF previews · database built-in full-text search over titles, types, tags, fields and linked records' titles, workspace-filtered, Captures included · CSV/Excel import with column matching, preview, one undoable batch · calendar feed off by default, privacy note, minimal titles default, revocable secret link · export ZIP (re-importable JSON, CSV per Type, files, README), background, expiring link, re-auth · automation/insights in worker, deterministic, "by Omniva", undoable. **D5 complete.**

**D6 (Approved, user said "yes to all"):** encryption in transit/at rest + per-workspace keys (managed key service) for files and designated sensitive fields → crypto-shredding; not E2EE, never described so (ADR 0013) · daily encrypted backups, 14-day point-in-time recovery, same region, monthly restore tests · deletion immediate from live systems, account key destroyed, rest gone within 14 days, stated in privacy policy · EU hosting, GDPR worldwide baseline, DPAs, public provider list, no health data in MVP · first-party aggregate content-free measurement, no third-party trackers/pixels, cookie-free website analytics · logs never contain user content, 30 days, scrubbed error reports · rate limits and lockout with notification, upload limits · managed secrets store (repo is public), dependency scanning, security review before beta, external pen test before public launch · Vault seam (key holder separated from byte location). **D6 complete.**

**D7 round 1:** user facts: **built mostly by AI coding agents** with the user reviewing; **TypeScript, NestJS preferred**; **budget $0–1/month** (conflicts with managed services, 14-day PITR backups and an always-on worker; raised in round 2). Approved: PostgreSQL only (ADR 0014); jobs queued in PostgreSQL (ADR 0015); managed EU services over self-run servers; no proprietary BaaS for core data.

**D7 round 2 (Approved; user said "yes to all but I will pick Prisma over Drizzle"):** budget option A: $0–1/month during development (local + free tiers for staging, no real data), small paid budget (~$30–60/month, to confirm) from the beta · NestJS API + worker · Next.js (React) for public pages and app · one pnpm-workspaces repo (`apps/web`, `apps/api`, shared `packages/`) · **Prisma** (user's choice; consequences: RLS policies in hand-written SQL migrations, workspace set per transaction via Prisma client extension, full-text search via raw SQL) · shared Zod schemas · pg-boss · Better Auth (ADR 0016). 

**D7 round 3 (Approved, user said "yes to all"):** development local in Docker (PostgreSQL, MinIO, Mailpit), staging on free tiers with no real data ($0) · beta: Neon PostgreSQL Frankfurt with 14-day history window (Render PG rejected: 3–7 days) · Render Frankfurt for web, API, worker (~$7 each; Vercel rejected: non-commercial free plan) · Cloudflare R2 EU-jurisdiction bucket · Mailgun EU for send + inbound (Lettermint fallback) · AWS KMS Frankfurt, one master key + per-workspace data keys · ClamAV in worker (bigger worker) · Sentry EU + free uptime monitor alerting on failed reconciliation (ADR 0017). Estimated beta ~$55–80/month + domain; confirm prices at account setup. Neon is a US company (data in Frankfurt). **D7 complete.** Next: D8 Reliability & testing.

**Topic order (approved):** D1 Domain model & glossary → D2 Architecture shape & boundaries → D3 Tenancy, identity & access → D4 Data modelling → D5 Core platform services → D6 Security & privacy → D7 Technology stack & infrastructure → D8 Reliability & testing → D9 API & clients.

**Methodology facts (read in full, session 2):** `domain-modeling` = challenge terms, invent edge-case scenarios, update `GLOSSARY.md` inline (glossary only, no implementation detail; opinionated, "_Avoid_" lists), ADRs lazily in `docs/adr/NNNN-slug.md`, 1–3 sentences. `grilling` = rounds over a design tree's frontier, numbered questions each with a recommended answer, worded so "yes" accepts. `wayfinder` = user-invoked map of decision tickets on an issue tracker (needs `/setup-matt-pocock-skills`). `grill-with-docs` = grilling + domain-modeling.

**Nothing in this part is an approved technical decision.** These are topics to investigate and design after Product Requirements are sufficiently established. Do not invent a schema, technology stack or architecture and present it as decided.

**Topics to design:**
1. System architecture and architectural boundaries
2. Domain modeling (building blocks, module types, the glossary)
3. Data modeling and relationships (anatomy, links, home module, custom fields)
4. Multi-tenancy and workspace isolation
5. Authentication and authorization
6. Permissions and sharing (roles, module-level and item-level access, moving items between workspaces)
7. Cross-module data relationships (the S5 relationship types)
8. Core services and platform capabilities (S3)
9. API design (versioning matters once mobile exists)
10. Background jobs and event-driven workflows, where justified
11. Notifications and scheduling (recurrence, time zones, digest, quiet hours)
12. Search (permissions-filtered, document text, the Vault excluded)
13. File and document handling
14. Audit history and activity tracking (Activity Timeline vs Security log, "changes, never views")
15. Security and privacy (account security, encryption, the Vault, key management, recovery, backups, deletion)
16. Scalability, reliability and performance
17. External integrations (S6 rules)
18. Deployment and infrastructure
19. Testing strategy (including cross-workspace isolation tests)

**Advisory input from the session 1 feasibility assessment (Proposed only, to be evaluated in System Design):**
- a modular monolith rather than microservices
- PostgreSQL with JSON columns for flexible fields
- Postgres full-text search before a separate search engine
- a database-backed job queue
- envelope encryption with per-workspace keys (crypto-shredding for deletion)
- row-level security as defence in depth
- signed short-lived file URLs
- recurrence rules via the iCalendar RRULE standard, with occurrences materialized in a rolling window
- money stored as integer minor units plus a currency code
- passkeys and MFA
- no custom cryptography
- an external penetration test before public launch
- tested backup restores
- MFA reset with a waiting period
- avoiding proprietary backend-as-a-service platforms for core data
- a versioned API for mobile

The user has not approved any of these.

---

# Part F: Development Planning (future stage, **not started**)

**Condition:** development planning happens only after Product Requirements and System Design are sufficiently established. **Do not start implementation during product discovery or definition.**

**Scope the stage should eventually cover:** translating approved requirements into implementation specifications · breaking specifications into well-defined tickets · dependencies and implementation order · acceptance criteria · testing requirements · tracking progress and completed work · reviewing implementation against specifications.

**Methodology: Matt Pocock skills (the user's chosen methodology).**
Installed at `C:\Users\pc\.claude\plugins\cache\claude-plugins-official\mattpocock-skills\1.3.1\skills\`. In session 1, only the **opening sections** of `to-spec`, `to-tickets`, `implement-spec`, `implement`, `domain-modeling`, `grill-with-docs` and `wayfinder` were read. **The next planning session must read each relevant SKILL.md in full before using it, and must not misrepresent the methodology.**

Skills found and what their headers say:
| Skill | Path (under `skills/`) | Purpose per its header | Notes |
|---|---|---|---|
| setup-matt-pocock-skills | engineering/setup-matt-pocock-skills | Configures the issue tracker and triage labels | `to-spec`, `to-tickets`, `implement-spec` and `wayfinder` all say to run `/setup-matt-pocock-skills` if no tracker is configured |
| to-spec | engineering/to-spec | Turns the conversation into a spec (problem statement, solution, a long list of user stories, implementation decisions, test seams) and publishes it to the issue tracker. No interview. | `disable-model-invocation: true` (user-invoked) |
| to-tickets | engineering/to-tickets | Breaks a spec into **tracer-bullet vertical slices** with blocking edges. Each slice is complete through every layer, demoable, and sized for one context window. Wide refactors use expand–contract. | User-invoked |
| implement-spec | engineering/implement-spec | Implements a spec plus its tickets as a task graph on an integration branch, using implementer subagents that call `tdd`, then `code-review` | User-invoked |
| implement | engineering/implement | Implements one spec or ticket, using `tdd` at agreed seams, then `code-review` | User-invoked |
| tdd | engineering/tdd | Test-driven development (red-green-refactor) | Invocable in session 1 |
| code-review | engineering/code-review | Reviews changes against coding standards and the originating spec | Invocable in session 1 |
| domain-modeling | engineering/domain-modeling | Builds the domain model: `GLOSSARY.md`, ADRs in `docs/adr/`, challenging terms, edge-case scenarios | Invocable in session 1. A natural fit for turning building blocks and module types into a glossary during System Design. |
| grill-with-docs | engineering/grill-with-docs | Runs `grilling` plus `domain-modeling`: an interview that produces ADRs and a glossary | User-invoked |
| grilling | productivity/grilling | Stress-tests a plan or decision | Invocable |
| wayfinder | engineering/wayfinder | Plans a very large effort as a map of **decision tickets** on the issue tracker, resolved one at a time | User-invoked. Possibly relevant for System Design decisions. |
| codebase-design | engineering/codebase-design | Vocabulary for designing deep modules and seams | Invocable |
| prototype | engineering/prototype | Throwaway prototypes to answer design questions | Invocable |
| research | engineering/research | Research against primary sources into a Markdown file | Invocable |
| improve-codebase-architecture, triage, retro, pr, diagnosing-bugs, wizard | engineering/* | Supporting skills | Read before use |
| handoff, writing-for-agents, teach, to-questionnaire, wait-what, grill-me | productivity/* | Supporting skills | — |

**Likely workflow (to confirm against the full skill text):** domain model and glossary (`domain-modeling` or `grill-with-docs`) → design decisions and ADRs (possibly `wayfinder`) → `to-spec` → `to-tickets` → `implement-spec` or `implement` with `tdd` → `code-review`. This sequence is inferred from the skill headers and is **not yet confirmed**. Prerequisites the headers mention: a git repository and a configured issue tracker. `F:\Omniva` is **not** a git repository yet.

---

# Part G: Decision register summary

| Area | Item | Status |
|---|---|---|
| Discovery | Locked direction (A0) | Approved |
| Discovery | Expat-centric repositioning | **Rejected** |
| Discovery | Feasibility recommendations (technical and MVP narrowing) | Proposed (advisory) |
| Vision 1–6 | All items in A1–A7 | Approved |
| Vision 7.1–7.2 | Destination, stages | Approved |
| Vision 7.3–7.9 | Expansion, intelligence, ecosystem, platforms, shared life, sustainability, guardrails | Approved (recommendation accepted) |
| Definition S1 | Platform structure | Approved |
| Definition S2 | Building blocks, Tasks vs reminders, anatomy, visibility | Approved (confirmed by the user on 24 Nov 2026) |
| Definition S3a / S3b | Shared capabilities | Approved (recommendation accepted) |
| Definition S4–S8 | Modules, relationships, integrations, dependencies, horizons | Approved (recommendation accepted) |
| Definition J1–J3.3 | Personas, format, criteria; passport home; foundational journeys; car, something breaks, renewal season; disposal clarification | Approved (recommendation accepted, topic by topic) |
| Definition J3.4–J6 | Trip, move, new baby; shared workspaces; edge cases; scope gaps G1–G19; user-facing wording | Approved (recommendation accepted, in bulk) |
| Definition M1–M8 | MVP: segment & problem, essential journeys, modules & depth, foundational capabilities, connections, postponed, assumptions, success criteria | Approved (recommendation accepted, topic by topic) |
| — | Entry segment and region | MVP assumption set in M1 (self-organizers; region-neutral, English first); final choice after validation |
| — | Pricing details | Pending |
| — | Managed profile details | Pending (specification) |
| — | Specific integration providers per region | Pending |
| — | User-facing wording | Approved in J6 (Arabic equivalents in specification) |
| — | System Design | In progress (framing approved; D1 next) |
| — | Development Planning | Deferred (future stage) |

**Explicitly rejected options (selection):** Life OS category · blank canvas · replace-only / connect-only · module-centric (A) and blocks-only (B) structures · reminders only inside tasks · dashboard-of-every-module and fully custom Overview · events-only calendar · user-set-only reminders · a combined activity stream · a user rule builder as core automation · a separate analytics area · chat-first AI · full transaction tracking · gamified habits · a folder tree for documents · general messaging · moving money · a plugin marketplace or developer platform · a desktop app · microservices (advised against in feasibility, not formally decided).

---

# Part H: Open questions and context

1. ~~Progress discrepancy~~: resolved. S2–S8 are approved.
2. **Entry segment and region:** chosen after validation. They affect the conditional placement of shared workspaces and Arabic, integration availability and templates.
3. **Pricing:** freemium structure approved, details open.
4. **Managed profiles:** concept approved. Permissions, privacy, consent at adulthood, and shared-workspace ownership are still open.
5. ~~Shared costs between partners~~: resolved in J4.3 / J6 G10 (split + "your share", no settle-up ledger).
6. **Information about other people:** rules approved (S4 Social). Operational handling of removal requests still to be specified.
7. ~~User-facing terminology~~: resolved in J6 (Arabic equivalents in specification).
8. **Vault timing and the honesty of its wording:** MVP and stage question.
9. **Validation plan execution:** sequence approved in M7.2 (interviews + landing page start in parallel with the next stage). Not yet scheduled or prepared.
10. **Legal and compliance:** health data as a special category, data residency, breach duties. Flagged in feasibility, not yet addressed.

---

# Part I: Files and artifacts

| Item | Location | Role |
|---|---|---|
| System Design index | `F:\Omniva\omniva-system-design.html` | Living index of design decisions (framing, D1–D9, decision log) |
| GitHub repository | https://github.com/Mohaned178/Omniva.git | Remote for `F:\Omniva` (public on purpose; pushing authorized) |
| Living Product Definition document | `F:\Omniva\omniva-product-definition.html` | Standalone HTML (sidebar navigation, expandable sections, module cards, layer diagram, connection map, decision log, open items). Shows Product Vision foundation plus S1–S8 as approved. J1–J6 and M1–M8 not started. |
| This handoff | `F:\Omniva\omniva-project-handoff.md` | Continuity document |
| Competitor feature matrix | https://claude.ai/artifact/XMsEpwEWr3hK7zLLEuTQrW | Private artifact from discovery research (10 products, vendor-sourced ratings) |
| Claude Code project memory | `C:\Users\pc\.claude\projects\F--Omniva\memory\omniva-product-direction.md` | Short summary of locked decisions, loaded automatically in new Claude Code sessions in `F:\Omniva` |

Research sources used in discovery (vendor and app-store pages, unverified): Quicken LifeHub product page and FAQ, CBS News and Kiplinger LifeHub reviews, Trustworthy features, security and "Next" pages, Hubmee App Store and Capterra pages, Vritto Google Play listing, Quicken blog comparisons, Under My Roof, Privora, Tridigm and Supering App Store listings, LifeOS AI and Notion Life OS listings on Product Hunt.
