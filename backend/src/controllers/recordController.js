import { executeCombinedRecordFetch } from '../services/recordRetrievalService.js';

export async function fetchCombinedPatientRecords(req, res, next) {
  try {
    const { patientId } = req.body;
    const result = await executeCombinedRecordFetch({
      doctor: req.user,
      patientId
    });

    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    return next(error);
  }
}

