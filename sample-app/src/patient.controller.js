// Patient lookup endpoint for the demo app.
// VIOLATION (HIPAA): patient diagnosis is written to console.log, which lands
// in stdout / container logs / log aggregator — a textbook PHI leak.
import { db } from './db.js';

export async function getPatient(req, res) {
  const patient = await db.patients.findById(req.params.id);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  // !!! HIPAA 45 CFR 164.312(b) violation !!!
  // PHI must never be written to general-purpose logs. Use an audit logger
  // that records the action, not the data.
  console.log(`[patient.read] actor=${req.user.id} patient=${patient.id} diagnosis="${patient.diagnosis}" notes="${patient.notes}"`);

  res.json(patient);
}
