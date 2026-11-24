# Omniva: Claude Code instructions

@AGENTS.md

## Implementing a ticket

Tickets are GitHub issues #2–#36, sub-issues of the spec #1. Each ticket names its model and effort in its **Agent** section. Work one ticket per branch, through these steps in order.

1. **Load the ticket.** Read the issue (`gh issue view <n> --comments`), the spec sections and user stories it cites in `docs/specs/0001-omniva-mvp.md`, and every ADR those sections name. Query the graph for the area (`graphify query "<area>"`). Done when you can list each acceptance criterion and the ADRs that bind it.
2. **Check the gate.** Every issue blocking this one is closed. If one is open, stop and report which.
3. **Branch** from an up-to-date `main` as `ticket/NN-short-slug`.
4. **Build test-first with `/tdd`**, one acceptance criterion at a time, at the highest seam that fits (Seam 1 API + worker, Seam 2 domain rules, Seam 3 browser journey). Done when every acceptance criterion has a test that went red and then green.
5. **Close the isolation gaps.** Every new workspace-owned table has its row-level security policy in the same migration; every new endpoint has an isolation test. Done when the isolation suite passes with the new endpoints listed.
6. **Refactor against `CODING_STANDARDS.md`** with the tests green. Done when every rule in it holds for the diff.
7. **Verify locally:** lint, type checks and every test seam pass; run `graphify update .`.
8. **Review with `/code-review`** against the ticket. Done when the Standards and Spec reports show no hard violations, and each judgement call is either fixed or explained in the PR.
9. **Open the pull request** with `Closes #<n>`, shaped by `/pr`, acceptance criteria ticked. Done when CI is green. The user reviews and merges.

## While working

- The approved documents are requirements: `omniva-product-definition.html`, `omniva-system-design.html`, `GLOSSARY.md`, `docs/adr/`, the spec. Build what they say.
- A need the spec places out of scope, or a change that contradicts an ADR, is raised with the user before any code is written for it.
- Ambiguity is settled by the principle order: trust & control → reliability → low effort & calm → connection → breadth. Record the choice in the PR description.
- A new domain term goes through `/domain-modeling` into `GLOSSARY.md` before code uses it.
