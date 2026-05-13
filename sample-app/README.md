# Compliance Ghost — Sample Non-Compliant App

This is an **intentionally insecure** Express-style application bundled with
Compliance Ghost. It is the demo target that Bob scans during the pitch.

Every file in `src/` contains at least one baked-in regulatory violation. None
of this code is meant to run — it exists purely so Compliance Ghost has
realistic source material to reason about.

| # | File | Regulation | What's wrong |
|---|------|------------|--------------|
| 1 | `src/auth.service.js` | GDPR | User email shipped to Segment with no consent gate |
| 2 | `src/patient.controller.js` | HIPAA | Patient diagnosis written to `console.log` |
| 3 | `src/payment.repository.js` | PCI-DSS | Full credit-card PAN persisted to the DB |
| 4 | `src/error.middleware.js` | GDPR | Raw `req.ip` forwarded to Sentry |
| 5 | `src/reset.service.js` | GDPR / PCI-DSS | Password reset token stored in plaintext |

Bob should catch all five with exact file paths, line numbers, plain-English
explanations, and remediation code.

> **Do not deploy this app.** It is deliberately broken.
