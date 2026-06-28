const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

function authMiddleware(req, res, next) {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    const error = new Error('Unauthorized');
    error.status = 401;
    return next(error);
  }

  const token = authorizationHeader.split(' ')[1];
  if (!token) {
    const error = new Error('Unauthorized');
    error.status = 401;
    return next(error);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.user_id ?? decoded.id ?? decoded.sub ?? decoded.user?.user_id;

    if (!userId) {
      const error = new Error('Unauthorized');
      error.status = 401;
      return next(error);
    }

    req.user = {
      user_id: userId,
      employee_id: decoded.employee_id ?? decoded.employeeId ?? null,
      email: decoded.email ?? decoded.user?.email ?? null,
    };

    return next();
  } catch (err) {
    const error = new Error('Unauthorized');
    error.status = 401;
    return next(error);
  }
}

module.exports = authMiddleware;
