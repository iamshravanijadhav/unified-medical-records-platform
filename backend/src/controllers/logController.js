import { listAccessLogs } from '../repositories/dataStore.js';

export async function getAccessLogs(req, res, next) {
  try {
    const { patientId, action } = req.query;
    const logs = await listAccessLogs({
      patientId: patientId || null,
      action: action || null
    });

    return res.status(200).json({
      success: true,
      total: logs.length,
      logs
    });
  } catch (error) {
    return next(error);
  }
}

