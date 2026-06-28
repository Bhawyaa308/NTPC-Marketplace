const { pool } = require('../config/db');

function normalizeRole(role) {
  if (role === null || role === undefined) return '';
  const value = String(role).trim().toUpperCase();
  const roleMap = {
    USER: 'USER',
    ADMIN: 'ADMIN',
    SUPER_ADMIN: 'SUPER_ADMIN',
    SUPERADMIN: 'SUPER_ADMIN',
    '1': 'USER',
    '2': 'ADMIN',
    '3': 'SUPER_ADMIN',
  };

  return roleMap[value] || value;
}

function authorizeRoles(...allowedRoles) {
  return async function (req, res, next) {
    if (!req.user || !req.user.user_id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to access this resource',
      });
    }

    try {
      // Fetch user role from users.role_id directly (no user_roles table)
      const { rows } = await pool.query(
        'SELECT role_id FROM users WHERE user_id = $1 LIMIT 1',
        [req.user.user_id]
      );

      if (!rows[0]) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You do not have permission to access this resource',
        });
      }

      const userRole = rows[0].role_id;
      const hasRole = allowedRoles.some((allowedRole) => normalizeRole(allowedRole) === normalizeRole(userRole));

      if (!hasRole) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You do not have permission to access this resource',
        });
      }

      return next();
    } catch (err) {
      return next(err);
    }
  };
}

module.exports = {
  authorizeRoles,
};
