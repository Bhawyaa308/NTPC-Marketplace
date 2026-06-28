const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authRepository = require('../repositories/auth.repository');

const SALT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

function createError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function sanitizeUser(user) {
  const sanitized = { ...user };
  delete sanitized.password_hash;
  return sanitized;
}

async function registerUser({
  employee_id,
  email,
  name,
  phone,
  department_id,
  township_id,
  password,
  designation = null,
  profile_picture = null,
  role_id = 1, // Default to USER role
}) {
  const [existingByEmployeeId, existingByEmail, existingByPhone] = await Promise.all([
    authRepository.findUserByEmployeeId(employee_id),
    authRepository.findUserByEmail(email),
    authRepository.findUserByPhone(phone),
  ]);

  if (existingByEmployeeId) {
    throw createError(409, 'Employee ID is already registered');
  }

  if (existingByEmail) {
    throw createError(409, 'Email is already registered');
  }

  if (existingByPhone) {
    throw createError(409, 'Phone is already registered');
  }

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await authRepository.createUser({
    employee_id,
    email,
    name,
    phone,
    department_id,
    designation,
    township_id,
    profile_picture,
    password_hash,
    role_id: Number(role_id) || 1, // Pass role_id to createUser - now stored directly in users table
  });

  const auditService = require('./audit.service');
  await auditService.logEvent({
    user_id: user.user_id,
    action: 'USER_REGISTERED',
    entity_type: 'USER',
    entity_id: user.user_id,
  });

  return sanitizeUser(user);
}

async function loginUser({ email, password }) {
  if (!JWT_SECRET) {
    throw createError(500, 'JWT configuration is missing');
  }

  const user = await authRepository.findLoginUserByEmail(email);

  if (!user) {
    throw createError(401, 'Invalid credentials');
  }

  if (user.is_active === false) {
    throw createError(403, 'Account is inactive');
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    throw createError(401, 'Invalid credentials');
  }

  await authRepository.updateLastLogin(user.user_id);

  const token = jwt.sign(
    { user_id: user.user_id, email: user.email },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
    }
  );

  const auditService = require('./audit.service');
  await auditService.logEvent({
    user_id: user.user_id,
    action: 'USER_LOGIN',
    entity_type: 'USER',
    entity_id: user.user_id,
  });

  return {
    message: 'Login successful',
    token,
    user: {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      role_id: user.role_id,
    },
  };
}

async function getCurrentUser(user_id) {
  const user = await authRepository.findUserById(user_id);

  if (!user) {
    throw createError(404, 'User not found');
  }

  return user;
}

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
};
