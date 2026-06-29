const { pool } = require('../config/db');

async function checkDuplicateReport(user_id, listing_id) {
  const { rows } = await pool.query(
    `SELECT report_id FROM listing_reports WHERE reported_by = $1 AND listing_id = $2 LIMIT 1`,
    [user_id, listing_id]
  );

  return rows.length > 0;
}

async function createReport(listing_id, reported_by, reason) {
  const { rows } = await pool.query(
    `INSERT INTO listing_reports (listing_id, reported_by, reason, status, created_at)
     VALUES ($1, $2, $3, 'OPEN', NOW())
     RETURNING report_id, listing_id, reported_by, reviewed_by, reason, status, created_at, resolved_at`,
    [listing_id, reported_by, reason]
  );

  return rows[0];
}

async function getReportsByUser(user_id) {
  const { rows } = await pool.query(
    `SELECT
       lr.report_id,
       lr.listing_id,
       lr.reported_by,
       lr.reviewed_by,
       lr.reason,
       lr.status,
       lr.created_at,
       lr.resolved_at,
       reporter.name AS reporter_name,
       listing.title AS listing_title,
       seller.name AS seller_name
     FROM listing_reports lr
     JOIN users reporter ON reporter.user_id = lr.reported_by
     JOIN listings listing ON listing.listing_id = lr.listing_id
     JOIN users seller ON seller.user_id = listing.seller_id
     WHERE lr.reported_by = $1
     ORDER BY lr.created_at DESC`,
    [user_id]
  );

  return rows;
}

async function getReportById(report_id) {
  const { rows } = await pool.query(
    `SELECT
       lr.report_id,
       lr.listing_id,
       lr.reported_by,
       lr.reviewed_by,
       lr.reason,
       lr.status,
       lr.created_at,
       lr.resolved_at,
       reporter.name AS reporter_name,
       listing.title AS listing_title,
       seller.name AS seller_name
     FROM listing_reports lr
     JOIN users reporter ON reporter.user_id = lr.reported_by
     JOIN listings listing ON listing.listing_id = lr.listing_id
     JOIN users seller ON seller.user_id = listing.seller_id
     WHERE lr.report_id = $1
     LIMIT 1`,
    [report_id]
  );

  return rows[0];
}

async function getUserRole(user_id) {
  const { rows } = await pool.query(
    `SELECT role_id FROM users WHERE user_id = $1 LIMIT 1`,
    [user_id]
  );

  return rows[0];
}

async function getAllReports() {
  const { rows } = await pool.query(
    `SELECT 
       lr.report_id,
       lr.listing_id,
       lr.reported_by,
       lr.reason,
       lr.status,
       lr.created_at,
       reporter.name AS reporter_name,
       listing.title AS listing_title,
       seller.name AS seller_name
     FROM listing_reports lr
     JOIN users reporter ON reporter.user_id = lr.reported_by
     JOIN listings listing ON listing.listing_id = lr.listing_id
     JOIN users seller ON seller.user_id = listing.seller_id
     ORDER BY lr.created_at DESC`
  );

  return rows;
}

async function updateReportStatus(report_id, status, reviewed_by) {
  const { rows } = await pool.query(
    `UPDATE listing_reports
     SET status = $2,
         reviewed_by = $3,
         resolved_at = CASE WHEN $2 IN ('RESOLVED', 'REJECTED') THEN NOW() ELSE resolved_at END
     WHERE report_id = $1
     RETURNING report_id, listing_id, reported_by, reviewed_by, reason, status, created_at, resolved_at`,
    [report_id, status, reviewed_by]
  );

  return rows[0];
}

async function withdrawReport(report_id) {
  await pool.query(`ALTER TABLE listing_reports ADD COLUMN IF NOT EXISTS withdrawn_at TIMESTAMP WITH TIME ZONE`);

  const { rows } = await pool.query(
    `UPDATE listing_reports
     SET status = 'WITHDRAWN', withdrawn_at = NOW(), resolved_at = COALESCE(resolved_at, NOW())
     WHERE report_id = $1
     RETURNING report_id, listing_id, reported_by, reviewed_by, reason, status, created_at, resolved_at, withdrawn_at`,
    [report_id]
  );

  return rows[0];
}

module.exports = {
  checkDuplicateReport,
  createReport,
  getReportsByUser,
  getReportById,
  getUserRole,
  getAllReports,
  updateReportStatus,
  withdrawReport,
};
