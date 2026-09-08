# FortressAssureX — evidence-led assessment MVP

FortressAssureX is a browser-only evidence register for authorized security assessment work. Its first MVP records **human-entered findings that are linked to stated evidence**. It intentionally does not create a cybersecurity assurance result from pasted text, uploaded files, or heuristic rules.

## Current boundary

### Supported

Evidence-backed human finding intake is available for exactly these modules:

1. **Architecture & Network**
2. **Vulnerability & Exposure**

A finding cannot be recorded unless the assessor supplies a title, observation, evidence reference, evidence excerpt or locator, impact statement, recommendation, and an assessor-selected severity.

### Not supported in this MVP

All other listed domains are marked **Not supported in MVP**. They cannot accept input, generate a finding, or produce an outcome.

This version does **not**:

- scan systems or parse configuration, logs, reports, or attachments;
- auto-generate findings from keywords or heuristics;
- validate control design or operating effectiveness;
- calculate maturity, posture, risk, or assurance scores;
- issue compliance conclusions, certifications, or attestations.

## Assessment status

The product reports a stable coverage status, never a favorable posture score:

- **Not assessed** — no evidence-backed human findings are recorded for supported modules.
- **Evidence intake incomplete** — at least one, but not every, supported module has recorded evidence. No assurance outcome is available.
- **Evidence recorded — human review required** — both supported modules have an evidence-linked record. This is still not an assurance conclusion, control validation, or compliance attestation.

Records are held only in the active browser session. Preserve source artifacts and follow your organization’s review and retention process before relying on any finding.

## Run locally

```bash
npm ci
npm run dev
```

## Verification

```bash
npm test
npm run typecheck
npm run build
npm run audit:prod
```

GitHub Actions runs test, typecheck, and build on pushes to `main`/`master` and on pull requests.

## Responsible use

Use only authorized evidence. The assessor is responsible for checking each finding against its cited source and obtaining qualified review. FortressAssureX is not a substitute for a formal assessment, technical validation, legal advice, or a compliance program.
