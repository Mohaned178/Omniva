# Spec 0001: Omniva MVP

**Status:** Draft, awaiting the user's review and approval. Not ready for agents until approved.
**Sources:** `omniva-product-definition.html` (Scope, Journeys, MVP M1–M8), `omniva-system-design.html` (D1–D9), `GLOSSARY.md`, `docs/adr/0001`–`0020`.
**Vocabulary:** terms follow `GLOSSARY.md` (Record, Item, Obligation, Key date, Capture, Member, and so on).

---

## Problem Statement

People who already organize their lives by hand (spreadsheets, folders, notes) still lose track of things. Their information is scattered across email, photos, paper and files, and nothing tells them what is coming. A free trial converts, an insurance policy renews at a higher price, a passport is found to be expiring at the airport, a covered repair gets paid because the warranty invoice can't be found. Their tools store information but never connect it: the car doesn't know about its insurance, the washing machine doesn't know it is covered by the home contents policy, and no single place answers "what am I paying for?" or "what needs my attention this month?".

In the user's words: *"I keep my life organized by hand, but the information is scattered and nothing tells me what's coming, so things slip and I can't find what I need when it matters."*

## Solution

Omniva is one private place where a person keeps the important records of their life, connected to each other. In the MVP, a self-organizer can:

- Sign up after browsing public pages, and in the first session create a handful of real records (a car, a passport, subscriptions, insurance) with the one Key date that matters for each, and immediately see what is coming.
- Capture things with low effort from a phone browser or by forwarding email, and sort them later from the Inbox.
- Connect records to each other (the invoice is attached to the laptop, the policy covers the car, the washing machine is located at the apartment), helped by suggestions they confirm.
- Rely on calm, correct reminders and a weekly digest, so nothing important slips.
- Find anything in seconds, together with everything related to it.
- See useful facts in context: what they pay in total each month, what the car has cost so far, which items might be covered by a policy, whether their passport is valid for a trip.
- Leave at any time with a complete export, and trust that deleting really deletes.

The MVP covers three modules in full (Documents & Files, Assets & Possessions, Subscriptions & Services), four lightly (Finance, Home, Productivity, Travel), and a minimal People directory, all built on the shared Records core. It has a personal workspace only, no AI and no Vault.

---

## User Stories

Actor: **visitor** (not signed in), **user** (signed in; Owner of their personal workspace), **Omniva** (system behaviour the user observes).

### A. Public website and access

1. As a visitor, I want to see a home page explaining what Omniva does, so that I can decide whether it is for me.
2. As a visitor, I want to see features, how it works, pricing, privacy and FAQ pages, so that I understand the product before creating an account.
3. As a visitor, I want screenshots and short videos of the app, so that I can see what is inside without signing up.
4. As a visitor, I want to be asked to sign up or sign in as soon as I try to use the app, so that my data is always protected by an account.
5. As a visitor, I want to sign up with my email address and a password, so that I can start using Omniva.
6. As a new user, I want to verify my email address, so that reminders and recovery reach me.
7. As a user, I want to sign in with email and password, so that I can reach my records.
8. As a user, I want to turn on authenticator-app codes, so that a stolen password is not enough to reach my data.
9. As a user, I want to add a passkey, so that I can sign in securely without typing a password.
10. As a user, I want recovery codes when I turn on two-factor sign-in, so that I can still get in if I lose my phone.
11. As a user who forgot my password, I want to reset it with an email link, and be notified that it was reset, so that I regain access safely.
12. As a user who lost my second factor and my recovery codes, I want an email-based reset that waits 72 hours, is announced everywhere and can be cancelled, so that an attacker with only my inbox cannot take over my account.
13. As a user, I want to see every signed-in device and sign out one or all of them, so that I stay in control of access.
14. As a user, I want to be asked to sign in again before a full export, an email, password or two-factor change, or deleting my account, so that a forgotten open session can't be misused.
15. As a user, I want to be notified of new sign-ins, exports and security changes, so that I notice anything I didn't do.
16. As a user, I want repeated failed sign-in attempts to lock sign-in temporarily and notify me, so that guessing attacks fail.
17. As a user, I want to see my Security log (sign-ins, devices, exports, security changes), visible only to me, so that I can check my account's history.
18. As a user, I want to delete my account, so that my data is really gone.

### B. First session

19. As a new user, I want a short, plain-language privacy promise before I enter anything, so that I know how my data is treated.
20. As a new user, I want to be asked (optionally) what brought me here, choosing "What am I paying for?", "My car / my things", "Getting organized" or "Upcoming trip", so that the first steps fit my situation.
21. As a new user, I want 5–8 short prompts tailored to my choice, each asking only what the thing is and the one Key date that matters, so that I get value without filling in long forms.
22. As a new user, I want to skip any prompt, so that I am never stuck.
23. As a new user, I want to see the default reminder Omniva will set for each record and change it if I like, so that nothing happens behind my back.
24. As a new user, I want Omniva to offer connections in plain words ("Is this insurance for your car?"), so that my records connect without effort.
25. As a new user, I want document upload to be optional in the first session, so that I'm not asked for an ID scan before I trust the product.
26. As a self-organizer, I want to import my existing spreadsheet as a side path in the first session, so that I don't retype what I already have.
27. As a new user, I want to land on an Overview showing real upcoming dates and only the areas I have used, so that I see value immediately.

### C. Records, Types and the People directory

28. As a user, I want to create a record from a built-in Type (Car, Passport, Subscription, Insurance policy and others), so that the right fields and Key dates are suggested.
29. As a user, I want each record to live in its home module automatically, decided by its Type, so that I never have to choose where things go.
30. As a user, I want a record to appear in every module where it is relevant without being copied, so that there is one source of truth.
31. As a user, I want to create my own Type inside a module (for example "Bicycle" in Assets), with custom fields and Key dates, so that Omniva fits my life.
32. As a user, I want a general fallback area for records that fit no module, so that I can store anything.
33. As a user, I want to add custom fields and tags to any record, so that I can capture details the Type doesn't have.
34. As a user, I want to archive a record, keeping its links and history, so that finished things stop cluttering the Overview but stay findable.
35. As a user, I want to see a record's lifecycle state (an Item owned or disposed; an Obligation active, ending or ended; a Document valid or expired; a Task open or done; a Plan upcoming, in progress or past), so that I know where each thing stands.
36. As a user, I want to delete a record after seeing everything linked to it, with nothing deleted silently, so that I stay in control.
37. As a user, I want deletion to remove the record's content everywhere, including its history, so that "delete" really means delete.
38. As a user, I want a "Me" record created for me automatically in the People directory, so that policies can cover me and identity documents can be mine.
39. As a user, I want to add People (a technician, an insurer, a landlord, a family member), so that I can link them to records.
40. As a user, I want to set the Holder of an Identity document, so that Omniva knows whose passport it is.
41. As a user, I want to set my workspace's main currency and my time zone, so that totals and reminders are right for me.

### D. Key dates and reminders

42. As a user, I want to give a Key date as an exact day, as a month only ("March 2027"), or mark it as date missing, so that I can record what I actually know.
43. As a user, I want a month-only date to remind me early enough to be safe and invite me to confirm the exact day later, so that approximate knowledge never causes a miss.
44. As a user, I want records with a missing date surfaced gently in the attention list, with an optional task to find the date, so that gaps get filled over time.
45. As a user, I want implausible dates (a year like 2205, an expiry before the issue date) flagged before saving, so that typos don't create wrong reminders.
46. As a user, I want every date confirmed in plain words ("renews in 3 days", "expires in 7 months"), so that I notice mistakes immediately.
47. As a user, I want smart default reminders per Type (a few days before a free trial ends, about 30 days before an annual renewal, months before a passport expires, none for monthly subscriptions), visible and editable, so that I get proactive support without noise.
48. As a user, I want urgent reminders to notify me directly and less urgent ones to go into the digest, so that I'm not interrupted needlessly.
49. As a user, I want in-app and email notifications, so that I see reminders wherever I am.
50. As a user, I want quiet hours, so that I am never notified at night.
51. As a user, I want a test notification during setup, so that I know reminders reach me.
52. As a user, I want every reminder to stay in the Overview's attention list until I handle it, whatever happens to the email, so that nothing is missed if an email is lost.
53. As a user, I want to be told if emails to me keep failing, so that I can fix my address.
54. As a user, I want each reminder to arrive exactly once, never duplicated and never skipped, so that I can trust Omniva.
55. As a user, I want auto-renewing commitments (subscriptions, auto-renewing policies) to roll their renewal date forward automatically, visibly and undoably, so that I don't maintain them by hand.
56. As a user, I want renewals that need my action (passport, licence, registration) to become expired until I enter the new date, so that Omniva never pretends I renewed something.
57. As a user, I want to snooze or mark a reminder handled, so that my attention list stays accurate.
58. As a user, I want recurring tasks (service the car every 12 months) and recurring events (birthdays) to repeat on schedule, so that I set them up once.

### E. Weekly digest

59. As a user, I want a weekly digest by default, adjustable to every two weeks or monthly, so that Omniva fits my rhythm.
60. As a user, I want the digest to show what is coming up, decisions to make before renewals (keep or cancel, trials ending), Inbox items to sort, at most 1–2 connection suggestions and one short insight, so that one calm message covers what matters.
61. As a user, I want to act on each digest entry directly (done, snooze, open), so that handling things is quick.
62. As a user, I want a one-line "nothing needs you this week" message in a quiet week, which I can turn off, so that I know Omniva is still watching.
63. As a user, I want the digest delivered in my time zone outside quiet hours, so that it arrives at a sensible time.
64. As a user, I want to turn connection suggestions in the digest off, so that I control how much Omniva prompts me.

### F. Capture and the Inbox

65. As a user, I want a quick add that works well on my phone's browser, so that I can capture things where they happen.
66. As a user, I want to photograph a receipt or document with my phone camera through the browser, so that paper becomes a record quickly.
67. As a user, I want to add Omniva to my phone's home screen, so that capture is one tap away.
68. As a user, I want, at capture, an optional "link to…" a likely record and an optional "is there a date?", so that I can connect and date things in one step or skip.
69. As a user, I want anything I don't sort right away to wait in the Inbox as a Capture, so that capture is never blocked by organizing.
70. As a user, I want Captures to be searchable but not to create reminders, calendar entries or totals until sorted, so that unsorted input never causes false alarms.
71. As a user, I want a private, random forwarding address, which I can change at any time, so that I can forward emails into Omniva.
72. As a user, I want forwarded emails to become Captures with their attachments as files, so that confirmations and invoices land in Omniva.
73. As a user, I want only emails from my verified sender addresses accepted, so that strangers can't fill my Inbox.
74. As a user, I want to add and verify extra sender addresses, so that I can forward from my work and personal mailboxes.
75. As a user, I want rule-based suggestions for Captures (an email from a known sender matches an existing subscription; a booking confirmation suggests creating a trip), which I confirm, so that sorting is fast.
76. As a user, I want Omniva to suggest possible duplicates (the same subscription forwarded and typed) with a merge option, never merging silently, so that my records stay clean.
77. As a user, I want gentle reminders in the digest to sort my Inbox, so that it doesn't become a graveyard.

### G. Links and connections

78. As a user, I want to link records with named relationships (attached to, costs, covers, maintains, located at, replaces, involves, part of, related to), so that my records reflect how my life fits together.
79. As a user, I want every link visible from both sides (the car shows its insurance; the insurance shows its car), so that I can navigate either way.
80. As a user, I want Omniva to suggest likely connections when I create a record ("Is this insurance for your car?", likely items suggested by type), which I confirm, so that connecting takes no effort.
81. As a user, I want links to stay within my workspace, so that my data never leaks across workspaces.
82. As a user, I want to see "possibly covered by" on an item when a policy covers the property it is located at, always worded "check your policy", so that I don't miss cover I already pay for.
83. As a user, I want Omniva to point out when two policies cover the same item, so that I can stop paying twice.
84. As a user, I want the connection suggestions and inferred connections to be rule-based and explainable, so that I understand why Omniva says something.

### H1. Documents & Files

85. As a user, I want to upload files of any common type and attach them to any record, so that every important file lives with what it is about.
86. As a user, I want uploaded files scanned for malware, so that Omniva never stores or serves something harmful.
87. As a user, I want previews of images and PDFs, so that I can check a document without downloading it.
88. As a user, I want to record Identity documents (passport, ID card, driving licence, residence permit) with a Holder and an expiry Key date, so that I'm reminded long before they expire.
89. As a user, I want Documents organized by Type, tags and smart views (expiring soon, without a link, recently added), with no folder tree, so that I find files by what they are, not where I put them.
90. As a user, I want to download all documents attached to a record or a Plan together, so that I can send a claim pack or a trip pack.
91. As a user, I want sensitive fields such as document numbers stored with extra encryption, so that a leak of ordinary data doesn't expose them.

### H2. Assets & Possessions

92. As a user, I want to record a car with make, plate, purchase date and price, and get suggested Key dates (warranty end, inspection, registration renewal, service interval), so that its whole life is tracked.
93. As a user, I want to record electronics, appliances, furniture and valuables, so that I know what I own and what covers it.
94. As a user, I want warranty status shown on an item ("Under warranty until Mar 2027"), so that I know instantly whether a repair is covered.
95. As a user, I want to log maintenance and repairs as Events or Tasks that maintain the item, with their costs, so that I keep a full history.
96. As a user, I want the item page to show everything about it (documents, policies, loans, costs, history, people involved), so that one page answers every question.
97. As a user, I want to mark an item disposed (sold, given away or discarded, with a sale price), so that its lifecycle is complete.
98. As a user disposing of an item, I want Omniva to ask me about each linked Obligation ("Have you cancelled the insurance?") and mark it ended only when I confirm, keeping its reminders active until then, so that Omniva never assumes something it can't know.
99. As a user, I want a new item to replace an old one with the history kept, so that I can trace what replaced what.
100. As a user, I want to track a warranty or insurance claim as a Task with notes (reference number) and a follow-up date, so that claims don't fall through the cracks.

### H3. Subscriptions & Services

101. As a user, I want to record subscriptions, insurance policies, memberships, service contracts and free trials with a cycle, price and next renewal date, so that every recurring commitment is known.
102. As a user, I want a checklist of common categories and named services (names only, no prices) to add many subscriptions quickly, so that "What am I paying for?" takes minutes.
103. As a user, I want an All recurring view across modules (subscriptions, insurance, rent or mortgage, utilities, loans, memberships) with monthly and yearly totals and a renewal timeline, so that I see everything I'm committed to.
104. As a user, I want to record a price change and see the price history, so that I notice increases.
105. As a user, I want to start a cancellation: Omniva shows how to cancel (from my notes), creates a Task and marks the Obligation ending, then ended only when I confirm, so that I never lose track of a half-finished cancellation.
106. As a user, I want an insurance policy to cover items and people (including Me), so that cover is visible on what it protects.

### H4. Finance (light)

107. As a user, I want to record costs (Money records) on any record (purchase price, repair bill), so that money is connected to life.
108. As a user, I want Obligations to generate projected Money records for each cycle that count in totals but are never shown as paid and never need confirming, so that totals are useful without busywork.
109. As a user, I want to record loans and bills as Obligations with their monthly cost and end date, so that they appear in recurring totals.
110. As a user, I want every Money record to keep its own currency, and totals converted into my main currency marked approximate, so that multi-currency life is handled honestly.
111. As a user, I want a record's cost of ownership (purchase, repairs, premiums, loan), which states what it includes and which parts are projected, so that I understand what something really costs.

### H5. Home (light)

112. As a user, I want to record a property I live in, so that things can be located at it and policies can cover it.
113. As a user, I want to set items as located at a property, so that home contents cover can apply to them.
114. As a user, I want rent or mortgage and utilities recorded as Obligations of the property, so that they appear in my recurring commitments.

### H6. Productivity (light)

115. As a user, I want Tasks attached to any record, with due dates, recurrence and reminders, so that what I need to do is connected to what it is about.
116. As a user, I want to mark tasks done, so that my attention list stays current.

### H7. Travel (light trip)

117. As a user, I want a forwarded booking confirmation to suggest "Create a trip?", so that trips start from what I already have.
118. As a user, I want a Trip (a Plan) with dates, where bookings become Events and Documents that are part of the trip, so that everything for the trip is together.
119. As a user, I want Omniva to check that each traveller's Identity document is valid through the trip plus a margin (six months by default, editable), so that I'm not stopped at the border.
120. As a user, I want Omniva to show whether a policy covers me for the trip dates, or say "no travel insurance found", so that I don't travel uncovered by accident.
121. As a user, I want Omniva to tell me to check the official entry requirements for my destination rather than state them, so that I'm never misled by stale rules.
122. As a user, I want the trip's cost total from the costs that are part of it, so that I know what the trip cost.
123. As a user, I want trips to move from upcoming to in progress to past automatically by date, so that my Overview stays relevant.

### I. Overview, Calendar and Search

124. As a user, I want an attention-first Overview (upcoming Key dates, overdue tasks, expiring items, missing dates), then a card per active area, then recent changes, so that I see what matters first.
125. As a user, I want to hide or reorder area cards, so that the Overview fits me without a setup burden.
126. As a user, I want a calendar showing Events and Key dates together, visually distinct, filterable by module and type, so that I see my life's timeline in one place.
127. As a user, I want to search across all my records and Captures by title, type, tag and field, and find records through the titles of linked records ("washing machine" finds its warranty), so that I can find anything in seconds.
128. As a user, I want search results to show each record with what is attached to it, so that the answer is one click away.
129. As a user, I want saved smart views for things I look up often, so that recurring questions are instant.

### J. Insights

130. As a user, I want insights shown in context (recurring totals, cost of ownership, price changes, overlapping cover) rather than in a separate analytics area, so that facts appear where they help.
131. As a user, I want every insight to say what it includes and what it doesn't, so that I'm never misled.

### K. Activity Timeline and undo

132. As a user, I want an Activity Timeline of changes in my workspace, including automatic ones shown as "by Omniva", so that I can see what happened.
133. As a user, I want to undo an automatic change, so that automation never traps me.
134. As a user, I want a record's history (what changed, before and after), so that I can trace mistakes.
135. As a user, I want the timeline to record changes, never views, so that Omniva doesn't track what I look at.

### L. Import, export and calendar feed

136. As a user, I want to import a CSV or Excel file, match its columns to a Type, preview the result and import it as one batch that I can undo as a whole, so that moving from spreadsheets is safe.
137. As a user, I want a full export at any time as one ZIP (complete re-importable JSON, a CSV per Type, all original files, a README), prepared in the background with an expiring download link, so that I can always leave with everything.
138. As a user, I want a read-only calendar feed of my Key dates and Events for my own calendar app, off by default, with a plain-language note on what leaves Omniva, minimal titles by default and a revocable secret link, so that I can see dates where I already look without giving away more than I choose.

### M. Privacy, trust and reliability (behaviour users can observe)

139. As a user, I want no one at Omniva to be able to read my records unless I grant time-limited support access, shown in my Security log, so that "private by default" is real.
140. As a user, I want no third-party trackers or advertising in the app, so that my behaviour isn't sold or profiled.
141. As a user, I want my records never visible to anyone outside my workspace, so that my life stays mine.
142. As a user, I want deleted data gone from live systems immediately and from backups within 14 days, stated plainly, so that I know what deletion means.
143. As a user, I want Omniva to keep working if a secondary service (such as the cache) is down, so that reliability doesn't depend on extras.
144. As a user, I want the app usable on phones, with screen readers and keyboard only, so that everyone can use it.
145. As a user, I want all wording plain, with internal names (Item, Obligation, Money record) never shown, so that Omniva speaks my language ("Recurring", "Costs", "Important dates", "Plan", "Inbox").

---

## Implementation Decisions

### Architecture (ADRs 0006–0008, 0016, 0019, 0020)

- One NestJS application deployed as an API service and a worker service from the same codebase; a Next.js web app for public pages and the app UI; one pnpm-workspaces repository with shared packages for domain types, Zod schemas and the domain-rules package.
- The Next.js server has no database access and renders no personal data. Public pages are pre-rendered; app pages run in the browser and use only the API.
- Internal capability modules, each exposing an interface and never reading another module's data: **Identity & Access**, **Workspaces & Membership**, **Records core**, **Life modules** (type packs), **Capture & Ingestion**, **Files**, **Scheduling & Reminders**, **Notifications & Digest**, **Automation**, **Insights & Inferred connections**, **Search**, **History**, **Portability**.
- Records are the source of truth. Reminder schedules, the search index, Insights and inferred connections are derived and rebuildable. Records core emits **durable change notifications** (for example key date changed, link added, record deleted) saved in the same transaction as the change and processed by the worker. The Activity Timeline entry is written in the same transaction as the change.
- Background jobs and change notifications are queued in PostgreSQL with pg-boss. Redis (Valkey) is used only for shared rate limiting, a session secondary store and a short-lived cache of non-personal data; it holds no record content, every key expires, and the app keeps working without it.

### Domain model (D1, D4; ADRs 0001–0005, 0011)

- **Record** is any entry; it carries the shared anatomy: title, Type, home module (from the Type), workspace, lifecycle state, archived flag, tags, custom fields, Key dates, links, attachments, history. Records belong to their workspace; "created by" is history, not ownership.
- Ten building blocks; MVP uses Item, Document, Money record, Obligation, Event, Task, Person, Note and Plan (Trip only). Measurement is not used.
- **Storage:** anatomy and block structure in fixed columns; Type-specific and custom fields in a flexible structured field validated against the Type definition.
- **Type definitions:** built-in Types are defined in code within their life-module pack, versioned with releases; custom types are stored per workspace as data; both use one definition shape (fields, Key-date fields, default reminder rules, home module, block).
- **MVP built-in Types (initial set, extendable):**
  - Documents & Files: Document (general), Identity document (Passport, ID card, Driving licence, Residence permit), Contract, Receipt or invoice, Warranty document.
  - Assets & Possessions: Vehicle, Electronics, Appliance, Furniture, Valuable.
  - Subscriptions & Services: Subscription, Insurance policy, Membership, Service contract, Free trial.
  - Finance (light): Cost (Money record), Loan, Bill (Obligations).
  - Home (light): Property (Item), Rent or mortgage, Utility (Obligations).
  - Productivity (light): Task.
  - Travel (light): Trip (Plan), Booking (Event with attached Document).
  - Social (minimal): Person, including the automatic "Me".
  - General fallback area for custom types that fit no module.
- **Lifecycle states** per block: Item owned/disposed; Obligation active/ending/ended; Document valid/expired; Task open/done; Plan upcoming/in progress/past. Archived is a separate universal flag.
- **Key dates** live in one dedicated collection (record, kind, date, precision exact or month-only, or missing), maintained by Records core whenever a date field changes. An Event's start is also a Key date. Reminders, the calendar and the Overview read only from this collection.
- **Recurrence** for Obligations (cycle and next renewal), Tasks and Events only, stored as iCalendar RRULE plus next occurrence; occurrences generated for a rolling window of about 13 months. Date-only Key dates have no time zone; timed Events keep theirs.
- **Money:** integer minor units plus currency code per Money record; each workspace has a main currency; conversions record rate, date and source and are marked approximate. Money records are **projected** (generated from an Obligation's cycle, never paid, never confirmed) or **recorded** (entered or confirmed by the user). There is no "paid" state.
- **Links:** one collection (from, to, relationship, workspace); the same-workspace rule is enforced by the data; two-way visibility by reading both directions. Identity documents have a **Holder** (a Person). **Inferred connections** are computed by rules and never stored.
- **Captures** are not records: raw input (file, forwarded email, text) waiting in the Inbox until sorted into a record.
- **Deletion** is real: the record and its content are removed from live systems, timeline entries keep only "a record was deleted" and refer to records rather than copying content, and linked records are shown first with nothing cascading silently. Archive keeps everything.
- **Identifiers** are random and non-guessable everywhere.
- **Me:** every workspace member is represented by a Person record in that workspace connected to their User; in the MVP this is "Me" in the personal workspace.

### Identity and access (D3; ADRs 0009, 0010)

- Better Auth with email and password, optional authenticator-app codes and passkeys, recovery codes; no social sign-in. Sessions in secure HTTP-only cookies on subdomains of one domain with CSRF protection; PostgreSQL is the session source of truth, Redis a secondary store.
- Password reset by email link with notification; lost second factor without recovery codes uses an email reset with a 72-hour wait, announced on every channel and cancellable.
- Every API action checks membership and role in the target workspace, even though the MVP has only personal workspaces where the user is Owner.
- Isolation in two layers: an application gate that scopes every data access to the workspace, and PostgreSQL row-level security that refuses rows from other workspaces. With Prisma, isolation policies are written in hand-written SQL migrations and each request's transaction carries the workspace through a Prisma client extension.
- Re-authentication for full export, email, password and two-factor changes, and account deletion. Rate limits (Redis, falling back to PostgreSQL) on sign-in, sign-up, password reset and email intake; temporary lockout with notification.
- No routine staff access to user content; support access only by the user's time- and scope-limited grant, recorded in their Security log.
- The public website is reachable without an account; every app route and API endpoint except the public, sign-up, sign-in, recovery, email-intake and calendar-feed endpoints requires a session.

### Reminders, notifications and digest (D5; ADR 0012)

- Reminder rules (from Type defaults or the user) are applied to Key dates to produce a derived **schedule of due notices**. The worker checks every minute; each send is recorded under a unique key derived from the Key date, rule and occurrence, so retries never send twice and never skip.
- A daily **reconciliation** rebuilds the expected schedule from Key dates, compares it with the live one, repairs differences and raises an alert.
- Month-only dates remind counting from the first of the month; missing dates produce attention-list entries, not reminders.
- Auto-roll applies only to auto-renewing Obligations; action-required renewals move the record to expired until the user enters a new date. Every automatic change is written to the Activity Timeline as "by Omniva" and can be undone.
- Notifications go in-app and by email (Mailgun EU); delivery outcomes (bounces, failures) are tracked and surfaced. Urgency decides direct notification versus digest. Quiet hours are respected.
- The digest is built per user in their time zone at their chosen cadence, with the contents described in user stories 59–64.

### Capture, files, search, import, export, feed (D5)

- Each user has a private random forwarding address (changeable). Inbound email arrives through the provider's inbound webhook, is accepted only from the user's verified sender addresses, and becomes a Capture with attachments as files.
- Rule-based suggestions for Captures and duplicates run in the worker, are deterministic, and are always confirmed by the user.
- Files are stored in Cloudflare R2 (EU jurisdiction) separately from the database, scanned with ClamAV in the worker before becoming available, served through short-lived download links, with per-plan size limits and image/PDF previews. Files and designated sensitive fields are encrypted with a per-workspace data key protected by an AWS KMS master key (crypto-shredding on deletion).
- Search uses PostgreSQL full-text search over titles, Types, tags, fields and the titles of linked records, filtered by workspace, including Captures. Document text is not indexed in the MVP.
- Spreadsheet import (CSV, Excel): upload, column matching to a Type, preview, then one batch with one timeline entry, undoable as a whole.
- Full export: a background job produces one ZIP with re-importable JSON, CSV per Type, original files and a README; the download link expires; re-authentication required.
- Calendar feed: off by default; when enabled, an iCalendar feed of Key dates and Events behind a secret revocable link, minimal titles by default, full titles optional.

### Insights and inferred connections (D5, M5)

- Rule-based and deterministic, computed in the worker on change notifications and rebuildable: recurring totals (monthly, yearly, by area), cost of ownership, price changes, overlapping cover (two *covers* links to the same item), indirect coverage ("possibly covered by" via *covers* a property and *located at* that property), and trip checks (Identity document validity against trip dates plus margin; a policy covering the traveller for the trip dates).
- Every Insight states what it includes; projected amounts are labelled.

### API contract (D9)

- REST under `/v1`, described by an OpenAPI document generated from the NestJS application; a typed client is generated for the web app. Inputs are defined by the shared Zod schemas. Changes within `/v1` are additive only.
- Resource areas: authentication and account (sessions, devices, two-factor, passkeys, recovery, Security log); workspace settings (main currency, time zone, notification preferences, digest cadence, quiet hours, forwarding address, verified senders, calendar feed); Types (built-in and custom); records (create, read, update, archive, dispose, delete with link preview, lifecycle actions such as confirming an Obligation ended); links; Key dates and reminders (attention list, snooze, handled); Captures (Inbox, sort into record, suggestions, duplicates); files (upload, preview, download, item- and Plan-level download); Overview; calendar; search and smart views; Insights for a record or area; Activity Timeline and undo; import jobs; export jobs; inbound email webhook; calendar feed.

### Web app (D9)

- TanStack Query for data, React Hook Form with the shared Zod schemas for forms, shadcn/ui on Radix with Tailwind. All strings through next-intl translation files; direction-neutral styling; locale formatting for dates, numbers and currencies; English only at launch.
- Fully responsive; camera capture through the browser; installable to the home screen; no offline mode.
- WCAG 2.2 AA.

### Measurement (M8; D6)

- First-party, aggregate, content-free product events sufficient to compute the M8 criteria: items added in week one, first reminder set in the first session and time to it, share of records with at least one link, monthly return at 3 months, reminders acted on before their date ("saves"), first-session trigger chosen, capture channel, identity-document uploads. No third-party trackers in the app; cookie-free analytics on the public website.

### Operations (D6–D8; ADRs 0013, 0017)

- Environments: local (Docker: PostgreSQL, Redis, MinIO, Mailpit, ClamAV), staging (free tiers, synthetic data only), production (beta). Real user data only in production.
- Production: Neon PostgreSQL Frankfurt with a 14-day history window; Render Frankfurt (web, API, worker, Key Value); R2 EU; Mailgun EU; AWS KMS Frankfurt; Sentry EU with content scrubbing; uptime monitor.
- Daily encrypted backups with 14-day point-in-time recovery; automated monthly restore drill into a temporary Neon branch.
- Logs never contain user content; 30-day retention.
- Migrations forward-only and expand–contract, run before new code starts, rehearsed on staging, including the isolation policies.
- Alerts: any reminder more than 5 minutes late, reconciliation differences, delivery-failure spikes, failed restore drill.
- Secrets only in a managed secrets store; the repository is public.

---

## Testing Decisions

**What makes a good test:** it exercises external behaviour through a seam and asserts on what a user or an external system would observe (API responses, delivered emails, export contents, feed contents), never on internal NestJS services, repositories or Prisma details. Tests survive refactoring.

**Seam 1 (primary): the `/v1` API and the worker on real infrastructure.**
- Real PostgreSQL and Redis in Docker, a controllable clock that tests advance, the worker running, a mail catcher capturing outbound email, inbound email simulated by posting to the email-intake webhook as the provider would.
- Acceptance tests for every user-story area A–M.
- **Exactly-once reminder delivery is proven here**, not only in Seam 2: tests advance the clock across reminder times and assert exactly one email per due notice in the mail catcher while injecting faults: the worker stopping mid-send, a job delivered twice, retries after a provider error, Redis unavailable, and the schedule deliberately corrupted so that reconciliation must repair it.
- **Isolation suite (ADR 0018):** every endpoint is called by a user from another workspace and must refuse; a new endpoint without an isolation test fails the build.
- **Database-level isolation test:** a separate test bypasses the application gate and confirms PostgreSQL row-level security refuses rows from another workspace.
- Deletion tests confirm content is gone from records, timeline entries, search results, exports and the calendar feed.

**Seam 2: the domain-rules package (pure functions).**
- Recurrence (RRULE expansion, end-of-month 31st → 30th, leap years), Key-date precision (exact, month only, missing), reminder timing and lead times, quiet hours, daylight-saving transitions and time-zone moves, auto-roll versus expiry, deduplication keys, inferred-connection rules, trip checks, cost-of-ownership arithmetic with projected and recorded money and approximate conversion.
- Property-based tests generate thousands of cases asserting, among other things, that each due notice is produced exactly once.
- Written test-first with the `tdd` skill.

**Seam 3: browser end-to-end tests (Playwright).**
- The 7 essential journeys (first session; reminders and digest; capture from mobile web and email forwarding with Inbox sorting; finding through search and the item page; renewal season and the All recurring view; the car lifecycle including disposal; something breaks, including "possibly covered by") and the light trip.
- UI-specific behaviour: connection prompts, plain-language date confirmation, responsive phone layouts, camera capture flow, add to home screen.
- Accessibility checks with axe on every journey (WCAG 2.2 AA).
- Business rules already proven at Seam 1 are not re-tested here.

**CI:** GitHub Actions on every pull request runs lint, type checks and all three seams plus the isolation suite; a red run blocks merging; merging deploys to staging; production deploys are a manual promote.

**Prior art:** none yet; the repository is greenfield. The first tickets establish the test harness for each seam (real-infrastructure API harness with controllable clock and mail catcher; property-based test setup; Playwright with axe), and later tickets follow them.

---

## Out of Scope

Postponed, not rejected (Product Definition M6):

- **Journeys:** the move, the new baby, shared workspaces.
- **Modules:** Health & Fitness, Career & Professional, Knowledge & Learning, Entertainment & Lifestyle; deeper Finance (accounts, balances, net worth, budgets, bank import); deeper Home (maintenance schedules, shopping lists); deeper Social (important dates, gift ideas, contact import); Travel depth (itinerary depth, wish list, reusable checklists).
- **Capabilities:** AI of any level; the E2EE Vault; text inside documents in search; the Measurement block (mileage-based service, meter readings); push notifications and native mobile apps; offline mode; calendar-file import and two-way calendar sync; cloud-drive import; any third-party data integration; the Arabic interface (designed for, not shipped).
- **J6 additions postponed:** Claim template, user-created and record-based templates, bulk relocation of items, shared-cost splits, task assignment, several Owners, leaving with copies, "last updated" labels on imported data.
- **Relationship:** *results in*.
- **Sharing of any kind:** shared workspaces, item-level sharing, time-limited links, managed profiles, legacy and emergency access, moving records between workspaces (designed as a seam only).
- **Public site extras:** an interactive demo or guest mode (rejected in D3).
- **Never:** moving money or a "paid" state, ads or data sales, a separate analytics area, gamification, social sign-in, destination entry-rule databases, built-in medical schedules, prices in the service catalog.

## Further Notes

- **Scope guard (M6.3):** anything listed as out of scope enters the MVP only through a documented decision recorded in the Product Definition's decision log.
- **Hard gates (M8):** zero missed or wrong reminders caused by Omniva, and zero cross-account data exposure. Both have dedicated test suites and production alerts above; a failure stops feature work until fixed.
- **Principles that resolve ambiguity during implementation:** trust and control → reliability → low effort and calm → connection → breadth. "Ask, never assume": Omniva never marks a real-world commitment ended, cancelled or paid on its own.
- **Wording:** user-facing words follow the J6 wording decisions (Recurring, Costs, Plan, Task, Note, Document, People, Important dates, Inbox, "At a glance"); internal block names never appear in the UI.
- **Provider prices** (ADR 0017) are estimates to confirm at account setup; development and staging cost $0.
- **Validation in parallel (M7):** problem interviews and a landing page can run while this spec is implemented; their results may adjust M8 thresholds before the beta.
- **Next step after approval:** `/to-tickets` breaks this spec into vertical tracer-bullet tickets, each delivering a complete, testable user capability. Tickets and this spec become `ready-for-agent` only after the user approves both.
