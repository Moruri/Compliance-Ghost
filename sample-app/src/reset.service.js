// Password reset for the demo app.
// VIOLATION (GDPR Article 32 / PCI-DSS 8.3): the reset token is persisted in
// plaintext, which makes a database read sufficient to take over any account.
import { randomBytes } from 'crypto';
import { db } from './db.js';
import { sendResetEmail } from './mailer.js';

export async function requestPasswordReset(req, res) {
  const { email } = req.body;
  const user = await db.users.findByEmail(email);
  if (!user) return res.status(204).end(); // do not leak user existence

  const token = randomBytes(32).toString('hex');

  // !!! GDPR Article 32 / PCI-DSS 8.3 violation !!!
  // The token is a credential-equivalent and must be stored hashed, not raw.
  await db.users.update(user.id, {
    reset_token: token,
    reset_expires: Date.now() + 60 * 60 * 1000,
  });

  await sendResetEmail(user.email, token);
  res.status(204).end();
}
