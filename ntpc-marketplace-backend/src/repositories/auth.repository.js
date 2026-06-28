const { pool } = require('../config/db');

async function findUserByEmployeeId(employee_id) {
  const { rows } = await pool.query(
    'SELECT user_id FROM users WHERE employee_id = $1 LIMIT 1',
    [employee_id]
  );
  return rows[0];
}

async function findUserByEmail(email) {
  const { rows } = await pool.query(
    'SELECT user_id FROM users WHERE email = $1 LIMIT 1',
    [email]
  );
  return rows[0];
}

async function findLoginUserByEmail(email) {
  const { rows } = await pool.query(
    `SELECT
      user_id,
      email,
      name,
      password_hash,
      is_active,
      role_id
    FROM users
    WHERE email = $1
    LIMIT 1`,
    [email]
  );
  return rows[0];
}

async function findUserByPhone(phone) {
  const { rows } = await pool.query(
    'SELECT user_id FROM users WHERE phone = $1 LIMIT 1',
    [phone]
  );
  return rows[0];
}

async function findUserById(user_id) {
  const { rows } = await pool.query(
    `SELECT
      user_id,
      employee_id,
      name,
      email,
      phone,
      department_id,
      designation,
      township_id
    FROM users
    WHERE user_id = $1
    LIMIT 1`,
    [user_id]
  );
  return rows[0];
}

async function createUser({
  employee_id,
  email,
  name,
  phone,
  department_id,
  designation,
  township_id,
  profile_picture,
  password_hash,
  role_id = 'USER', // Default role is 'USER'
}) {
  const { rows } = await pool.query(
    `INSERT INTO users (
      employee_id,
      email,
      name,
      phone,
      department_id,
      designation,
      township_id,
      profile_picture,
      password_hash,
      role_id,
      email_verified,
      is_active,
      created_at,
      updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, false, true, NOW(), NOW())
    RETURNING
      user_id,
      employee_id,
      email,
      name,
      phone,
      department_id,
      designation,
      township_id,
      profile_picture,
      role_id,
      email_verified,
      last_login,
      is_active,
      deleted_at,
      created_at,
      updated_at`,
    [
      employee_id,
      email,
      name,
      phone,
      department_id,
      designation,
      township_id,
      profile_picture,
      password_hash,
      role_id,
    ]
  );

  return rows[0];
}

async function updateLastLogin(user_id) {
  await pool.query(
    'UPDATE users SET last_login = NOW() WHERE user_id = $1',
    [user_id]
  );
}

module.exports = {
  findUserByEmployeeId,
  findUserByEmail,
  findLoginUserByEmail,
  findUserByPhone,
  createUser,
  updateLastLogin,
  findUserById,
};
