import crypto from 'crypto';
import { getFirebaseState } from '../config/firebaseAdmin.js';
import { hashDemoPassword } from '../data/seedData.js';
import { isValidEmail } from '../middleware/validateMiddleware.js';
import {
  createUserProfile,
  findUserByEmail,
  findUserById,
  updateUserProfile
} from '../repositories/dataStore.js';
import { logPlatformActivity } from '../services/auditLogService.js';
import { signDemoToken } from '../services/demoTokenService.js';

function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, ...safe } = user;
  return safe;
}

export async function registerUser(req, res, next) {
  try {
    const {
      name,
      email,
      password,
      role = 'doctor',
      medicalLicenseId = '',
      specialization = 'General Medicine',
      hospitalAffiliation = 'Connected Network Hospital',
      phone = ''
    } = req.body;

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_EMAIL',
        message: 'Please provide a valid email address.'
      });
    }

    if (!['doctor', 'hospital_admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_ROLE',
        message: 'Role must be either "doctor" or "hospital_admin".'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const { isFirebaseMode, firebaseAuth } = getFirebaseState();

    if (isFirebaseMode && firebaseAuth) {
      // In Firebase mode, client registers via Firebase Web Auth and passes ID token in Bearer header
      const authHeader = req.headers.authorization || '';
      if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          code: 'FIREBASE_TOKEN_REQUIRED',
          message: 'Firebase registration requires a valid Firebase ID token in Authorization header.'
        });
      }
      const decoded = await firebaseAuth.verifyIdToken(authHeader.slice(7).trim());
      const existing = await findUserById(decoded.uid);
      if (existing) {
        return res.status(200).json({
          success: true,
          mode: 'firebase',
          user: sanitizeUser(existing)
        });
      }

      const newProfile = {
        uid: decoded.uid,
        name: name.trim(),
        email: decoded.email || normalizedEmail,
        role,
        medicalLicenseId: medicalLicenseId.trim() || `REG-${Date.now()}`,
        specialization: specialization.trim(),
        hospitalAffiliation: hospitalAffiliation.trim(),
        phone: phone.trim(),
        isDemoAccount: false,
        createdAt: new Date().toISOString()
      };

      await createUserProfile(newProfile);
      await logPlatformActivity({
        actor: newProfile,
        action: 'USER_REGISTERED',
        summary: `New ${role} account registered via Firebase Authentication`
      });

      return res.status(201).json({
        success: true,
        mode: 'firebase',
        user: sanitizeUser(newProfile)
      });
    }

    // Local Demo Mode registration
    if (!password || String(password).length < 6) {
      return res.status(400).json({
        success: false,
        code: 'WEAK_PASSWORD',
        message: 'Password must be at least 6 characters long.'
      });
    }

    const existingUser = await findUserByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        code: 'EMAIL_EXISTS',
        message: 'An account with this email already exists.'
      });
    }

    const uid = `${role === 'hospital_admin' ? 'admin' : 'doc'}-${crypto.randomBytes(4).toString('hex')}`;
    const newUser = {
      uid,
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: hashDemoPassword(password),
      role,
      medicalLicenseId: medicalLicenseId.trim() || `DEMO-REG-${Math.floor(1000 + Math.random() * 9000)}`,
      specialization: specialization.trim(),
      hospitalAffiliation: hospitalAffiliation.trim(),
      phone: phone.trim() || '+91-98XXX-DEMO',
      isDemoAccount: true,
      createdAt: new Date().toISOString()
    };

    await createUserProfile(newUser);
    const token = signDemoToken(newUser);

    await logPlatformActivity({
      actor: newUser,
      action: 'USER_REGISTERED',
      summary: `New ${role} registered in Local Demo Mode`
    });

    return res.status(201).json({
      success: true,
      mode: 'local-demo',
      token,
      user: sanitizeUser(newUser)
    });
  } catch (error) {
    return next(error);
  }
}

export async function loginUser(req, res, next) {
  try {
    const { isFirebaseMode, firebaseAuth } = getFirebaseState();

    if (isFirebaseMode && firebaseAuth) {
      const authHeader = req.headers.authorization || '';
      const rawToken = req.body.idToken || (authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '');
      if (!rawToken) {
        return res.status(400).json({
          success: false,
          code: 'FIREBASE_TOKEN_REQUIRED',
          message: 'Firebase ID token is required to create session.'
        });
      }

      const decoded = await firebaseAuth.verifyIdToken(rawToken);
      let profile = await findUserById(decoded.uid);
      if (!profile) {
        profile = {
          uid: decoded.uid,
          name: decoded.name || decoded.email?.split('@')[0] || 'Authenticated Doctor',
          email: decoded.email || '',
          role: 'doctor',
          medicalLicenseId: 'FIREBASE-USER',
          specialization: 'General Medicine',
          hospitalAffiliation: 'Network Hospital',
          phone: '',
          isDemoAccount: false,
          createdAt: new Date().toISOString()
        };
        await createUserProfile(profile);
      }

      return res.status(200).json({
        success: true,
        mode: 'firebase',
        user: sanitizeUser(profile)
      });
    }

    // Local Demo Mode login
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        code: 'CREDENTIALS_REQUIRED',
        message: 'Email and password are required.'
      });
    }

    const user = await findUserByEmail(email);
    if (!user || user.passwordHash !== hashDemoPassword(password)) {
      return res.status(401).json({
        success: false,
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password.'
      });
    }

    const token = signDemoToken(user);

    await logPlatformActivity({
      actor: user,
      action: 'USER_LOGIN',
      summary: `Signed in via Local Demo Mode (${user.role})`
    });

    return res.status(200).json({
      success: true,
      mode: 'local-demo',
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    return next(error);
  }
}

export async function getCurrentUser(req, res, next) {
  try {
    const profile = await findUserById(req.user.uid);
    if (!profile) {
      return res.status(404).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'User profile not found.'
      });
    }

    const { mode, initMessage } = getFirebaseState();
    return res.status(200).json({
      success: true,
      mode,
      modeDescription: initMessage,
      user: sanitizeUser(profile)
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateCurrentUser(req, res, next) {
  try {
    const { name, specialization, hospitalAffiliation, phone, medicalLicenseId } = req.body;
    const updates = {};

    if (name !== undefined && String(name).trim()) updates.name = String(name).trim();
    if (specialization !== undefined) updates.specialization = String(specialization).trim();
    if (hospitalAffiliation !== undefined) updates.hospitalAffiliation = String(hospitalAffiliation).trim();
    if (phone !== undefined) updates.phone = String(phone).trim();
    if (medicalLicenseId !== undefined) updates.medicalLicenseId = String(medicalLicenseId).trim();

    const updated = await updateUserProfile(req.user.uid, updates);
    if (!updated) {
      return res.status(404).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'User profile not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: sanitizeUser(updated)
    });
  } catch (error) {
    return next(error);
  }
}

export function getDemoModeInfo(req, res) {
  const { mode, firebaseConfigured, initMessage } = getFirebaseState();
  return res.status(200).json({
    success: true,
    mode,
    firebaseConfigured,
    message: initMessage,
    demoAccounts: mode === 'local-demo'
      ? [
          {
            label: 'Demo Doctor (Primary)',
            email: 'doctor@unifiedhealth.demo',
            role: 'doctor',
            hint: 'Authorized clinician account with full access to Patient Search and combined record retrieval'
          },
          {
            label: 'Demo Doctor (Secondary)',
            email: 'doctor2@unifiedhealth.demo',
            role: 'doctor',
            hint: 'Secondary clinician account for multi-doctor audit log testing'
          },
          {
            label: 'Demo Hospital Administrator',
            email: 'admin@unifiedhealth.demo',
            role: 'hospital_admin',
            hint: 'Can register, edit, enable/disable hospitals and simulate outages'
          }
        ]
      : []
  });
}

