
AI Assistance Notice

Quick note
----------
We used AI-assisted tools (for example, GitHub Copilot and ChatGPT) occasionally to help with difficult or repetitive work. These tools were used to speed specific tasks — not to replace developer judgment or design decisions.

Where AI was helpful
--------------------
- Debugging complex issues (e.g., CORS, connectivity, and subtle runtime errors)
- Generating boilerplate or scaffolding (DTOs, mapper stubs, test skeletons)
- Suggesting query/API improvements (pagination, safer casting, small optimizations)
- Code-review suggestions and light refactoring ideas
- Test case examples and initial unit test scaffolding
- Short documentation and inline comment drafts

Review and accountability
------------------------
All AI-generated suggestions or code were reviewed, edited, and tested by the development team before being merged. Security-sensitive and business-critical logic (authentication, authorization, and data integrity) received manual review and validation.

Practical guidance
------------------
- Treat AI output as a starting point — always review for correctness, security, and style.
- Add or update tests for any AI-assisted change that affects behavior.
- Prefer human oversight for design, architecture, and privacy/security decisions.

Questions
---------
If you need details about AI-assisted changes, check the commit history or contact the project maintainers.

More detail (what we mean by the bullets above)
------------------------------------------------
- Debugging complex issues: AI helped analyze logs and error traces and suggested likely root causes. For example, CORS preflight failures were investigated with AI-provided diagnostic steps and a suggested change to the security configuration; the final solution was written and verified by the team.

- Boilerplate generation: small DTOs, mapper methods, and unit-test skeletons were sometimes generated to reduce repetitive typing. Generated code was adapted to fit our naming conventions and data model.

- Query/API improvements: AI suggested changes such as using pageable queries instead of an inline `LIMIT` in JPQL and safer numeric casting (casting to `Number` then `longValue()`/`doubleValue()`), which were reviewed and applied where appropriate.

- Code review and refactoring: AI provided alternative method names, small refactors, and comment suggestions to improve clarity; maintainers accepted or adjusted these suggestions.

- Tests and documentation: AI produced basic test cases and short documentation drafts (e.g., concise comments or an initial `AI_USAGE.md`). All such outputs were edited for accuracy and style.

Limitations and policy
----------------------
- AI suggestions were not used for cryptographic code, secrets management, or other high-risk areas without human verification.
- No third-party proprietary content was copied verbatim from AI responses. Any externally sourced snippets were treated as references and validated.

How to review AI-assisted commits
--------------------------------
1. Inspect recent commits for messages indicating AI assistance (commit messages may reference the change purpose).
2. Run unit and integration tests (e.g., `./mvnw test`) to confirm behavior.
3. Review security-sensitive changes (authentication, authorization, password handling) manually before promotion to production.

Contact
-------
For questions about a specific change, review the pull request/commit and contact the corresponding author listed in the repository history.


