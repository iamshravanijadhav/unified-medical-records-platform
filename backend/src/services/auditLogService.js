import crypto from 'crypto';
import { appendAccessLog } from '../repositories/dataStore.js';

/**
 * Writes an audit entry to accessLogs without storing sensitive clinical findings.
 */
export async function logPlatformActivity({
  actor,
  patientId = 'N/A',
  hospitalSource = 'Platform Exchange',
  action,
  summary
}) {
  const logEntry = {
    logId: `LOG-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
    actorId: actor?.uid || 'system',
    actorName: actor?.name || 'System',
    actorRole: actor?.role || 'system',
    patientId: patientId || 'N/A',
    hospitalSource,
    action,
    summary,
    timestamp: new Date().toISOString()
  };

  return appendAccessLog(logEntry);
}

