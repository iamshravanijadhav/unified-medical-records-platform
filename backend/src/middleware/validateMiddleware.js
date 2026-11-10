/**
 * Lightweight request payload validation helpers.
 */
export function requireFields(fields) {
  return (req, res, next) => {
    const missing = [];
    for (const field of fields) {
      const value = req.body?.[field];
      if (value === undefined || value === null || String(value).trim() === '') {
        missing.push(field);
      }
    }

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        code: 'VALIDATION_ERROR',
        message: `Missing required field(s): ${missing.join(', ')}`,
        missingFields: missing
      });
    }

    return next();
  };
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

