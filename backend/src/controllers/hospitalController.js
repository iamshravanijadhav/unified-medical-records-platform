import {
  createHospital,
  findHospitalById,
  findHospitalBySlug,
  listAccessLogs,
  listHospitals,
  listRecordsMetadata,
  updateHospital
} from '../repositories/dataStore.js';
import { logPlatformActivity } from '../services/auditLogService.js';

function slugifyHospitalName(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 28);
}

export async function getHospitals(req, res, next) {
  try {
    const [hospitals, metadata, logs] = await Promise.all([
      listHospitals(),
      listRecordsMetadata(),
      listAccessLogs()
    ]);

    const enriched = hospitals.map((h) => {
      const recordsCount = metadata.filter((m) => m.hospitalId === h.hospitalId).length;
      const sharedEventsCount = logs.filter(
        (l) => l.action === 'RECORDS_FETCHED' && l.hospitalSource?.includes(h.name)
      ).length;

      return {
        ...h,
        recordsCount,
        sharedEventsCount
      };
    });

    return res.status(200).json({
      success: true,
      hospitals: enriched
    });
  } catch (error) {
    return next(error);
  }
}

export async function registerHospital(req, res, next) {
  try {
    const { name, location, specialties = [], contactEmail = '' } = req.body;
    let slug = req.body.slug ? slugifyHospitalName(req.body.slug) : slugifyHospitalName(name);
    if (!slug) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_HOSPITAL_NAME',
        message: 'Hospital name must contain alphanumeric characters.'
      });
    }

    const existingSlug = await findHospitalBySlug(slug);
    if (existingSlug) {
      slug = `${slug}-${Math.floor(100 + Math.random() * 900)}`;
    }

    const hospitalId = `HOSP-${slug.toUpperCase().slice(0, 12)}`;
    const parsedSpecialties = Array.isArray(specialties)
      ? specialties
      : String(specialties)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

    const newHospital = {
      hospitalId,
      slug,
      name: name.trim(),
      location: location.trim(),
      apiEndpoint: `/api/hospitals/${slug}/records/:patientId`,
      systemStatus: 'online',
      isEnabled: true,
      specialties: parsedSpecialties.length > 0 ? parsedSpecialties : ['General Healthcare'],
      contactEmail: contactEmail.trim() || `api@${slug}-demo.health`,
      isDemo: true,
      updatedAt: new Date().toISOString()
    };

    await createHospital(newHospital);

    await logPlatformActivity({
      actor: req.user,
      hospitalSource: newHospital.name,
      action: 'HOSPITAL_REGISTERED',
      summary: `Registered demo hospital node "${newHospital.name}" (${newHospital.hospitalId})`
    });

    return res.status(201).json({
      success: true,
      message: `Hospital "${newHospital.name}" registered successfully.`,
      hospital: { ...newHospital, recordsCount: 0, sharedEventsCount: 0 }
    });
  } catch (error) {
    return next(error);
  }
}

export async function editHospital(req, res, next) {
  try {
    const { hospitalId } = req.params;
    const existing = await findHospitalById(hospitalId);
    if (!existing) {
      return res.status(404).json({
        success: false,
        code: 'HOSPITAL_NOT_FOUND',
        message: `Hospital "${hospitalId}" not found.`
      });
    }

    const { name, location, specialties, contactEmail } = req.body;
    const updates = {
      updatedAt: new Date().toISOString()
    };

    if (name !== undefined && String(name).trim()) updates.name = String(name).trim();
    if (location !== undefined && String(location).trim()) updates.location = String(location).trim();
    if (contactEmail !== undefined) updates.contactEmail = String(contactEmail).trim();
    if (specialties !== undefined) {
      updates.specialties = Array.isArray(specialties)
        ? specialties
        : String(specialties)
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
    }

    const updated = await updateHospital(hospitalId, updates);

    await logPlatformActivity({
      actor: req.user,
      hospitalSource: updated.name,
      action: 'HOSPITAL_UPDATED',
      summary: `Updated hospital configuration for ${updated.name}`
    });

    return res.status(200).json({
      success: true,
      message: 'Hospital details updated.',
      hospital: updated
    });
  } catch (error) {
    return next(error);
  }
}

export async function toggleHospitalStatus(req, res, next) {
  try {
    const { hospitalId } = req.params;
    const existing = await findHospitalById(hospitalId);
    if (!existing) {
      return res.status(404).json({
        success: false,
        code: 'HOSPITAL_NOT_FOUND',
        message: `Hospital "${hospitalId}" not found.`
      });
    }

    const { isEnabled, systemStatus } = req.body;
    const updates = {
      updatedAt: new Date().toISOString()
    };

    if (typeof isEnabled === 'boolean') {
      updates.isEnabled = isEnabled;
    }

    if (systemStatus !== undefined) {
      if (!['online', 'offline'].includes(systemStatus)) {
        return res.status(400).json({
          success: false,
          code: 'INVALID_STATUS',
          message: 'systemStatus must be "online" or "offline".'
        });
      }
      updates.systemStatus = systemStatus;
    }

    const updated = await updateHospital(hospitalId, updates);

    await logPlatformActivity({
      actor: req.user,
      hospitalSource: updated.name,
      action: 'HOSPITAL_STATUS_CHANGED',
      summary: `Updated ${updated.name} -> enabled: ${updated.isEnabled}, status: ${updated.systemStatus}`
    });

    return res.status(200).json({
      success: true,
      message: `${updated.name} connection status updated.`,
      hospital: updated
    });
  } catch (error) {
    return next(error);
  }
}

export async function getHospitalSharedRecords(req, res, next) {
  try {
    const { hospitalId } = req.params;
    const hospital = await findHospitalById(hospitalId);
    if (!hospital) {
      return res.status(404).json({
        success: false,
        code: 'HOSPITAL_NOT_FOUND',
        message: `Hospital "${hospitalId}" not found.`
      });
    }

    const [allMeta, logs] = await Promise.all([
      listRecordsMetadata(),
      listAccessLogs()
    ]);

    const sharedRecords = allMeta.filter((m) => m.hospitalId === hospitalId);
    const hospitalLogs = logs.filter((l) => l.hospitalSource?.includes(hospital.name)).slice(0, 15);

    return res.status(200).json({
      success: true,
      hospital,
      totalSharedRecords: sharedRecords.length,
      sharedRecords,
      recentShareActivity: hospitalLogs
    });
  } catch (error) {
    return next(error);
  }
}

