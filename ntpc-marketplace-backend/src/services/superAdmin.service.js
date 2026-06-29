const superAdminRepository = require('../repositories/superAdmin.repository');

function createError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function requireName(value, label) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw createError(400, `${label} is required`);
  }
  return value.trim();
}

async function getDashboardSummary() {
  return superAdminRepository.getDashboardSummary();
}

async function getAnalytics() {
  return superAdminRepository.getAnalytics();
}

async function getAuditLogs(filters) {
  return {
    logs: await superAdminRepository.getAuditLogs(filters),
    actions: await superAdminRepository.getAuditActions(),
  };
}

async function getPlatformSettings() {
  return superAdminRepository.getPlatformSettings();
}

async function updatePlatformSetting(payload) {
  const settingKey = requireName(payload?.setting_key, 'Setting key');
  const settingValue = typeof payload?.setting_value === 'string' ? payload.setting_value : String(payload?.setting_value ?? '');
  const updated = await superAdminRepository.updatePlatformSetting(settingKey, settingValue);
  if (!updated) {
    throw createError(404, 'Setting not found');
  }
  return updated;
}

async function getDepartments() {
  return superAdminRepository.getDepartments();
}

async function createDepartment(payload) {
  return superAdminRepository.createDepartment({
    department_name: requireName(payload?.department_name || payload?.name, 'Department name'),
    description: typeof payload?.description === 'string' ? payload.description.trim() : null,
  });
}

async function updateDepartment(departmentId, payload) {
  const updatePayload = {};
  if (payload?.department_name !== undefined || payload?.name !== undefined) {
    updatePayload.department_name = requireName(payload.department_name || payload.name, 'Department name');
  }
  if (payload?.description !== undefined) {
    updatePayload.description = typeof payload.description === 'string' ? payload.description.trim() : null;
  }

  const department = await superAdminRepository.updateDepartment(departmentId, updatePayload);
  if (!department) {
    throw createError(404, 'Department not found');
  }
  return department;
}

async function deleteDepartment(departmentId) {
  const assignedUsers = await superAdminRepository.countDepartmentUsers(departmentId);
  if (assignedUsers > 0) {
    throw createError(400, 'Cannot delete department while employees are still assigned');
  }

  const deleted = await superAdminRepository.deleteDepartment(departmentId);
  if (!deleted) {
    throw createError(404, 'Department not found');
  }

  return { message: 'Department deleted successfully' };
}

async function getTownships() {
  return superAdminRepository.getTownships();
}

async function createTownship(payload) {
  return superAdminRepository.createTownship({
    name: requireName(payload?.name, 'Township name'),
    state: typeof payload?.state === 'string' ? payload.state.trim() : null,
    region: typeof payload?.region === 'string' ? payload.region.trim() : null,
  });
}

async function updateTownship(townshipId, payload) {
  const updatePayload = {};
  if (payload?.name !== undefined) {
    updatePayload.name = requireName(payload.name, 'Township name');
  }
  if (payload?.state !== undefined) {
    updatePayload.state = typeof payload.state === 'string' ? payload.state.trim() : null;
  }
  if (payload?.region !== undefined) {
    updatePayload.region = typeof payload.region === 'string' ? payload.region.trim() : null;
  }

  const township = await superAdminRepository.updateTownship(townshipId, updatePayload);
  if (!township) {
    throw createError(404, 'Township not found');
  }
  return township;
}

async function deleteTownship(townshipId) {
  const assignments = await superAdminRepository.countTownshipAssignments(townshipId);
  if (assignments.total_users > 0 || assignments.total_listings > 0) {
    throw createError(400, 'Cannot delete township while users or listings still belong to it');
  }

  const deleted = await superAdminRepository.deleteTownship(townshipId);
  if (!deleted) {
    throw createError(404, 'Township not found');
  }

  return { message: 'Township deleted successfully' };
}

module.exports = {
  getDashboardSummary,
  getAnalytics,
  getAuditLogs,
  getPlatformSettings,
  updatePlatformSetting,
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getTownships,
  createTownship,
  updateTownship,
  deleteTownship,
};
