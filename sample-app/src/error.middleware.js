// Express error handler for the demo app.
// VIOLATION (GDPR): req.ip is shipped to Sentry verbatim. IP addresses are
// personal data; forwarding them to a third-party processor without a
// minimisation step breaches Article 5(1)(c).
import * as Sentry from '@sentry/node';

export function errorHandler(err, req, res, _next) {
  // !!! GDPR Article 5(1)(c) violation !!!
  // Raw IP should be hashed/truncated before being attached to telemetry.
  Sentry.captureException(err, {
    user: { ip_address: req.ip, email: req.user?.email },
    tags: { route: req.path },
  });

  res.status(500).json({ error: 'Internal Server Error' });
}
