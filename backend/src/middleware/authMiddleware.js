import { env } from '../config/env.js';
import { getFirebaseState } from '../config/firebaseAdmin.js';
import { findUserById } from '../repositories/dataStore.js';
import { verifyDemoToken } from '../services/demoTokenService.js';

/**
 * Authenticates incoming user requests via Authorization: Bearer <token>.
 * Supports Firebase ID Tokens when Firebase Admin is configured,
 * or signed HMAC tokens in clearly documented Local Demo Mode.
 */
export async function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        code: 'AUTH_TOKEN_MISSING',
        message: 'Authentication required. Missing Bearer token.'
      });
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
      return res.status(401).json({
        success: false,
        code: 'AUTH_TOKEN_EMPTY',
        message: 'Authentication token is empty.'
      });
    }

    const { isFirebaseMode, firebaseAuth } = getFirebaseState();

    if (isFirebaseMode && firebaseAuth) {
      const decoded = await firebaseAuth.verifyIdToken(token);
      const profile = await findUserById(decoded.uid);
      if (!profile) {
        return res.status(401).json({
          success: false,
          code: 'PROFILE_NOT_FOUND',
          message: 'Firebase user exists, but no doctor/admin profile was registered.'
        });
      }
      req.user = {
        uid: decoded.uid,
        email: decoded.email || profile.email,
        name: profile.name,
        role: profile.role,
        authMode: 'firebase'
      };
      return next();
    }

    // Local Demo Mode token verification
    const payload = verifyDemoToken(token);
    const profile = await findUserById(payload.uid);
    if (!profile) {
      return res.status(401).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'Demo user profile no longer exists.'
      });
    }

    req.user = {
      uid: profile.uid,
      email: profile.email,
      name: profile.name,
      role: profile.role,
      authMode: 'local-demo'
    };
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      code: 'AUTH_INVALID',
      message: error.message || 'Invalid or expired authentication token.'
    });
  }
}

/**
 * Protects individual demo hospital REST API endpoints.
 * Allows either the central exchange gateway service key (x-exchange-key)
 * or an authenticated platform user Bearer token (e.g., for Postman testing).
 */
export async function authenticateHospitalGateway(req, res, next) {
  const gatewayKey = req.headers['x-exchange-key'];
  if (gatewayKey && gatewayKey === env.exchangeGatewayKey) {
    req.gatewayCaller = { type: 'central-exchange-service' };
    return next();
  }

  return authenticateUser(req, res, next);
}

