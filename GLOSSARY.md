# Omniva

A Personal Life Management Platform: one private place where the different areas of a person's life are kept and connected, so information in one area supports the others.

## Structure

**Record**:
Any single entry in Omniva, of any building block: a car, a passport, a subscription, a task.
_Avoid_: Item (an Item is one building block), entry, object

**Type**:
A specific kind of record built on a building block, such as "Car" on Item or "Passport" on Identity document. Built in or created by the user. A record's Type decides its home module.
_Avoid_: Category, class, kind

**Archived**:
A record the user has put away: hidden from the Overview, still searchable, with its links and history kept. Any record can be archived.
_Avoid_: Deleted, hidden, inactive

**Lifecycle state**:
Where a record stands in its own life, specific to its building block: an Item is owned or disposed; an Obligation is active, ending or ended; a Document is valid or expired; a Task is open or done; a Plan is upcoming, in progress or past.
_Avoid_: Status (too vague), stage

**Disposed**:
The lifecycle state of an Item that is no longer owned: sold, given away or discarded.
_Avoid_: Deleted, removed, archived

**Ending**:
The lifecycle state of an Obligation whose cancellation is pending until the user confirms it has really ended.
_Avoid_: Cancelled, closing

**Template**:
A preset for creating records of a Type, with default key dates and reminders.
_Avoid_: Blueprint, form

**Workspace**:
The space that owns a set of records. Every record belongs to exactly one workspace; whoever created it is history, not ownership. Every user has a personal workspace; shared workspaces are joined by invitation.
_Avoid_: Space, vault (Vault is a separate concept), account

**Personal workspace**:
A user's own workspace, never reachable through membership of any shared workspace.
_Avoid_: Private space, my account

**Shared workspace**:
A workspace with several members, such as a couple or household.
_Avoid_: Team, group, family space

**Module**:
One of the twelve life areas (for example Assets & Possessions, Subscriptions & Services) that gives records a home and a domain-specific view.
_Avoid_: App, section, category

**Home module**:
The single module a record belongs to; other modules may show it but never hold a copy.
_Avoid_: Primary module, owner module

**Building block**:
One of the ten fixed kinds that every record is built from: Item, Document, Money record, Obligation, Event, Task, Person, Note, Plan, Measurement. Never shown to users as words.
_Avoid_: Entity, base type, object

## Building blocks

**Item**:
Something a person owns, holds or has, such as a car, a laptop or an apartment.
_Avoid_: Asset, possession, thing

**Document**:
A file together with what it is about, such as an invoice, a contract or a passport.
_Avoid_: File, attachment, upload

**Identity document**:
A Document that identifies a person and usually expires, such as a passport, ID card or driving licence. Its home module is Documents & Files.

**Holder**:
The Person an Identity document belongs to.
_Avoid_: Owner, bearer
_Avoid_: ID item, travel document

**Money record**:
A single amount of money connected to something in life, such as a purchase cost or a repair bill. It keeps its own currency. Either projected or recorded; Omniva never marks money as paid.
_Avoid_: Transaction, expense, payment

**Projected money record**:
A Money record generated from an Obligation's cycle. Counted in totals as projected, never treated as paid, and never needs confirming.
_Avoid_: Expected payment, scheduled payment, pending transaction

**Recorded money record**:
A Money record the user entered or confirmed.
_Avoid_: Actual, paid, settled

**Obligation**:
An ongoing commitment that repeats or renews, such as a subscription, insurance policy, rent or loan. It has a cycle and a next renewal date. Shown to users as "Recurring".
_Avoid_: Bill, subscription (a subscription is one kind of Obligation), contract

**Event**:
Something that happens at a specific time, such as an appointment or a flight. Its start is also its key date.
_Avoid_: Meeting, calendar entry

**Task**:
Something a person needs to do.
_Avoid_: To-do, action item, reminder

**Person**:
Someone in a user's life, recorded for private use within one workspace. Every Person's home is the People directory (Social & Relationships).
_Avoid_: Contact, user, member

**Me**:
The Person record that represents a user in their own personal workspace.
_Avoid_: Profile, self, owner

**Note**:
Lightweight text linked to anything.
_Avoid_: Comment, memo

**Plan**:
A time-bound life situation that groups records from several modules, such as a trip or a move. Its home module comes from its Type (a Trip lives in Travel).
_Avoid_: Project, collection, folder

**Measurement**:
A value recorded over time, such as mileage or a meter reading. Shown to users as "Readings".
_Avoid_: Metric, log entry

## Connections

**Link**:
A stored connection between two records in the same workspace, of a named Relationship. Visible from both sides.
_Avoid_: Reference, association, relation

**Relationship**:
The named kind of a Link: attached to, costs, covers, maintains, part of, involves, located at, results in, replaces, related to.
_Avoid_: Link type, edge

**Inferred connection**:
A connection Omniva computes from Links by rules and never stores, such as "possibly covered by" or overlapping cover.
_Avoid_: Suggested link, smart link, derived link

## Time and attention

**Key date**:
A meaningful date on any record, such as an expiry, renewal or due date. Key dates feed the calendar and reminders. Shown to users as "Important dates".
_Avoid_: Deadline, due date (one kind of key date)

**Month-only date**:
A key date known only to the month ("March 2027"). It reminds early enough to be safe and invites confirming the exact day.
_Avoid_: Approximate date, fuzzy date

**Date missing**:
The state of a key date the user doesn't know yet, surfaced gently until it is filled in.
_Avoid_: Unknown date, empty date

**Attention list**:
What needs the user's notice, shown first on the Overview: key dates coming up or just passed, and dates missing. Items stay on it until handled.
_Avoid_: Notifications, to-do list

**Reminder**:
A notice attached to a key date (an Event's start counts as a key date). Reminders are not records of their own.
_Avoid_: Alert, notification (the delivery, not the reminder)

**Digest**:
The periodic summary that gathers what is coming up, decisions to make and items to sort.
_Avoid_: Newsletter, report

**Inbox**:
Where captures wait until they are sorted.
_Avoid_: Drafts, unsorted

**Capture**:
Raw input (a file, a forwarded email, some text) waiting in the Inbox. A capture is searchable but is not a record: it creates no reminders, calendar entries or totals until sorted into a record.
_Avoid_: Draft record, unsorted item, inbox item

## History and trust

**Activity Timeline**:
The record of changes and actions on records within a workspace, including automatic ones. Records changes, never views.
_Avoid_: Audit log, feed, history (history is a record's own changes)

**Security log**:
A user's record of sign-ins, devices, exports and sharing changes, visible only to that user.
_Avoid_: Audit log, activity log

**Vault**:
An optional end-to-end encrypted area for sensitive files and notes, excluded from search, insights, automation and AI.
_Avoid_: Safe, locker, secure folder

**Insight**:
A fact Omniva derives from records and shows in context, such as a cost of ownership or a yearly total. It always states what it includes.
_Avoid_: Analytics, report, stat

## People and access

**User**:
A human who signs in to Omniva.
_Avoid_: Account, customer, member

**Member**:
A user's participation in a workspace, with a role (Owner, Editor or Viewer). In each workspace, a member is represented by a Person record connected to their User.
_Avoid_: Participant, collaborator, user

**Main currency**:
The currency a workspace's totals are shown in; amounts in other currencies are converted and marked approximate.
_Avoid_: Base currency, default currency

**Account**:
Only a financial account, such as a bank account (a Type of Item). Never a user's login.
_Avoid_: Using it for users, logins or subscriptions to Omniva

**Managed profile**:
A Person whose records are managed by a user on their behalf, such as a child, without that person having access.
_Avoid_: Dependant account, child account, sub-user
