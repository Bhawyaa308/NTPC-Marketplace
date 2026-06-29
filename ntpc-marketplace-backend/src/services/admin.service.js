const adminRepository = require('../repositories/admin.repository');
const { createNotification } = require('../utils/notificationHelper');

function createError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function listUsers() {
  return adminRepository.getAllUsers();
}

async function getDashboardSummary() {
  return adminRepository.getDashboardSummary();
}

async function deactivateUser(user_id, currentAdminId) {
  if (String(user_id) === String(currentAdminId)) {
    throw createError(403, 'Admins cannot deactivate their own account');
  }

  const user = await adminRepository.updateUserActive(user_id, false);
  if (!user) {
    throw createError(404, 'User not found');
  }

  const auditService = require('./audit.service');
  await auditService.logEvent({
    user_id: user_id,
    action: 'USER_DEACTIVATED',
    entity_type: 'USER',
    entity_id: user_id,
  });

  return user;
}

async function activateUser(user_id) {
  const user = await adminRepository.updateUserActive(user_id, true);
  if (!user) {
    throw createError(404, 'User not found');
  }

  const auditService = require('./audit.service');
  await auditService.logEvent({
    user_id: user_id,
    action: 'USER_ACTIVATED',
    entity_type: 'USER',
    entity_id: user_id,
  });

  return user;
}

async function listReports() {
  return adminRepository.getAllReports();
}

async function resolveReport(report_id, admin_user_id) {
  const report = await adminRepository.updateReportStatus(report_id, 'RESOLVED', admin_user_id);
  if (!report) {
    throw createError(404, 'Report not found');
  }

  // Notify reporter that their report has been resolved
  await createNotification({
    user_id: report.reported_by,
    title: 'Report Resolved',
    message: 'Your report has been reviewed and resolved by admin',
    type: 'REPORT_RESOLVED',
    related_entity_type: 'LISTING_REPORT',
    related_entity_id: report_id,
  });

  return report;
}

async function rejectReport(report_id, admin_user_id) {
  const report = await adminRepository.updateReportStatus(report_id, 'REJECTED', admin_user_id);
  if (!report) {
    throw createError(404, 'Report not found');
  }

  // Notify reporter that their report has been rejected
  await createNotification({
    user_id: report.reported_by,
    title: 'Report Rejected',
    message: 'Your report has been reviewed and rejected by admin',
    type: 'REPORT_REJECTED',
    related_entity_type: 'LISTING_REPORT',
    related_entity_id: report_id,
  });

  return report;
}

module.exports = {
  getDashboardSummary,
  listUsers,
  deactivateUser,
  activateUser,
  listReports,
  resolveReport,
  rejectReport,
};
