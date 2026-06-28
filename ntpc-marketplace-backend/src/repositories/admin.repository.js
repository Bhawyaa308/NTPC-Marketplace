const { pool } = require('../config/db');

async function getAllUsers() {
  const { rows } = await pool.query(
    `SELECT
       user_id,
       employee_id,
       email,
       name,
       phone,
       department_id,
       designation,
       township_id,
       email_verified,
       last_login,
       is_active,
       deleted_at,
       created_at
     FROM users
     ORDER BY user_id`);
  return rows;
}

async function updateUserActive(user_id, is_active) {
  const { rows } = await pool.query(
    `UPDATE users
     SET is_active = $1
     WHERE user_id = $2
     RETURNING
       user_id,
       employee_id,
       email,
       name,
       phone,
       department_id,
       designation,
       township_id,
       email_verified,
       last_login,
       is_active,
       deleted_at,
       created_at`,
    [is_active, user_id]);
  return rows[0];
}

async function getAllReports() {
  const { rows } = await pool.query(
    `SELECT
       report_id,
       listing_id,
       reported_by,
       reviewed_by,
       reason,
       status,
       created_at,
       resolved_at
     FROM listing_reports
     ORDER BY report_id`);
  return rows;
}

async function updateReportStatus(report_id, status, admin_user_id) {
  const { rows } = await pool.query(
    `UPDATE listing_reports
     SET status = $1,
         reviewed_by = $2,
         resolved_at = NOW()
     WHERE report_id = $3
     RETURNING report_id, listing_id, reported_by, reviewed_by, reason, status, created_at, resolved_at`,
    [status, admin_user_id, report_id]);
  return rows[0];
}

module.exports = {
  getAllUsers,
  updateUserActive,
  getAllReports,
  updateReportStatus,
};
