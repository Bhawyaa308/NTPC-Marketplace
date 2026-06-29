const reportsRepository = require('../repositories/reports.repository');
const listingsRepository = require('../repositories/listings.repository');
const { createNotification } = require('../utils/notificationHelper');

function createError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function createReport(user_id, payload) {
  const listing_id = payload.listing_id;
  const reason = payload.reason;

  if (!listing_id || isNaN(listing_id)) {
    throw createError(400, 'Valid listing_id is required');
  }

  if (!reason || typeof reason !== 'string' || reason.trim() === '') {
    throw createError(400, 'Reason is required');
  }

  const listing = await listingsRepository.findListingById(listing_id);
  if (!listing) {
    throw createError(404, 'Listing not found');
  }

  if (listing.seller_id === user_id) {
    throw createError(403, 'You cannot report your own listing');
  }

  const alreadyReported = await reportsRepository.checkDuplicateReport(user_id, listing_id);
  if (alreadyReported) {
    throw createError(400, 'You have already reported this listing');
  }

  const report = await reportsRepository.createReport(listing_id, user_id, reason);
  return reportsRepository.getReportById(report.report_id);
}

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

async function getReportsByUser(user_id) {
  return reportsRepository.getReportsByUser(user_id);
}

async function getReportById(reportId, user_id) {
  const report = await reportsRepository.getReportById(reportId);
  if (!report) {
    throw createError(404, 'Report not found');
  }

  const userRole = await reportsRepository.getUserRole(user_id);
  const roleName = normalizeRole(userRole?.role_id);
  const isAdmin = roleName === 'ADMIN' || roleName === 'SUPER_ADMIN';

  if (!isAdmin && Number(report.reported_by) !== Number(user_id)) {
    throw createError(403, 'You do not have permission to view this report');
  }

  return report;
}

async function withdrawReport(reportId, user_id) {
  const report = await reportsRepository.getReportById(reportId);
  if (!report) {
    throw createError(404, 'Report not found');
  }

  if (Number(report.reported_by) !== Number(user_id)) {
    throw createError(403, 'You do not have permission to withdraw this report');
  }

  if (String(report.status).toUpperCase() !== 'OPEN') {
    throw createError(400, 'Only OPEN reports can be withdrawn');
  }

  const updatedReport = await reportsRepository.withdrawReport(reportId);
  if (!updatedReport) {
    throw createError(404, 'Report not found');
  }

  return reportsRepository.getReportById(updatedReport.report_id);
}

async function getAllReports() {
  return reportsRepository.getAllReports();
}

async function updateReportStatus(reportId, status, adminUserId) {
  const validStatuses = ['RESOLVED', 'REJECTED'];

  if (!status || !validStatuses.includes(String(status).toUpperCase())) {
    throw createError(400, 'Valid status is required');
  }

  const currentReport = await reportsRepository.getReportById(reportId);
  if (!currentReport) {
    throw createError(404, 'Report not found');
  }

  if (String(currentReport.status).toUpperCase() === 'WITHDRAWN') {
    throw createError(400, 'Withdrawn reports cannot be updated');
  }

  const normalizedStatus = String(status).toUpperCase();
  const report = await reportsRepository.updateReportStatus(reportId, normalizedStatus, adminUserId);
  if (!report) {
    throw createError(404, 'Report not found');
  }

  const messageMap = {
    RESOLVED: 'Your report has been resolved.',
    REJECTED: 'Your report was rejected.',
  };

  await createNotification({
    user_id: report.reported_by,
    title: 'Report status updated',
    message: messageMap[normalizedStatus] || 'Your report status has been updated.',
    type: 'REPORT',
    related_entity_type: 'REPORT',
    related_entity_id: report.report_id,
  });

  return reportsRepository.getReportById(report.report_id);
}

async function resolveReport(reportId, adminUserId) {
  return updateReportStatus(reportId, 'RESOLVED', adminUserId);
}

async function rejectReport(reportId, adminUserId) {
  return updateReportStatus(reportId, 'REJECTED', adminUserId);
}

module.exports = {
  createReport,
  getReportsByUser,
  getReportById,
  withdrawReport,
  getAllReports,
  updateReportStatus,
  resolveReport,
  rejectReport,
};
