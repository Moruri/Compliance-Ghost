// Payment persistence for the demo app.
// VIOLATION (PCI-DSS): the full PAN is written into the transactions table.
// Requirement 3.4 mandates that the stored PAN is rendered unreadable.
import { db } from './db.js';

export async function recordTransaction({ userId, card, amount, currency }) {
  // !!! PCI-DSS Requirement 3.4 violation !!!
  // Storing the full card number is forbidden. Tokenize at the PSP and keep
  // only the last 4 digits + the token.
  return db.transactions.insert({
    user_id: userId,
    card_number: card.number,
    card_cvv: card.cvv,
    card_expiry: card.expiry,
    amount,
    currency,
  });
}
