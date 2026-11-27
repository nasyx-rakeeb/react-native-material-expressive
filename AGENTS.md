## HARD STOP RULE (overrides everything else)

- You may never start Day N+1 until ALL of these are true: (a) every exit criterion of Day N is verified MET with evidence, or listed as NOT MET with the reason; (b) you have posted a Day-Close Report in the chat to the user; (c) the user has replied approving the next day. "Continue" or "go" from the user counts. Silence does not.
- Day-Close Report format (always the same): Day N status (CLOSED / NOT CLOSED); exit criteria table (criterion, MET/NOT MET, evidence); what was skipped or deferred; decisions made (ADR numbers); failing tests or open risks; what I need from the user; proposed next step.
- Maintain docs/progress/CURRENT.md at all times with exactly: current day, status (IN PROGRESS / AWAITING USER APPROVAL), last closed day, and the last commit hash. Update it before starting work and again when you stop. Create a git tag `day-N-closed` when a day is approved.
- After any context compaction, FIRST read CURRENT.md and `git log`. If it says AWAITING USER APPROVAL, or if you find yourself working on a day that has not been approved, stop immediately and report. Never assume the previous day was approved or finished.
- Never merge two days into one. Never start the next day "while waiting".
- Gates (Days 10, 24, 37) require the user to look at the gallery and diff reports, so give the exact commands to run them.
