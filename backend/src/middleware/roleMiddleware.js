/**
 * Role-based authorization middleware.
 * Ensures only users with permitted roles ('doctor', 'hospital_admin') can access protected operations.
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        code: 'UNAUTHORIZED',
        message: 'Authentication required.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        code: 'FORBIDDEN_ROLE',
        message: `Access denied. This action requires role: ${allowedRoles.join(' or ')}. Your role is "${req.user.role}".`
      });
    }

    return next();
  };
}

