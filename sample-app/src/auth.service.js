// Sign-up service for the demo app.
// VIOLATION (GDPR): user.email is forwarded to a third-party analytics
// processor without checking consent or holding a DPA.
import { db } from './db.js';
import { analytics } from './analytics.js';
import { sendWelcomeEmail } from './mailer.js';

export async function registerUser(req, res) {
  const { email, password, name } = req.body;

  const user = await db.users.insert({
    email,
    password_hash: await hashPassword(password),
    name,
  });

  // Welcome email — fine, processor agreement is in place for the mailer.
  await sendWelcomeEmail(user.email, user.name);

  // !!! GDPR Article 7 & 28 violation !!!
  // No consent flag is checked before piping personal data into Segment.
  analytics.identify(user.id, { email: user.email, name: user.name });

  res.status(201).json({ id: user.id, email: user.email });
}

async function hashPassword(password) {
  const { scryptSync, randomBytes } = await import('crypto');
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}
