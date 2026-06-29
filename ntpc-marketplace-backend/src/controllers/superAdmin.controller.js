const superAdminService = require('../services/superAdmin.service');

async function getDashboard(req, res, next) {
  try {
    const dashboard = await superAdminService.getDashboardSummary();
    return res.status(200).json(dashboard);
  } catch (error) {
    return next(error);
  }
}

async function getAnalytics(req, res, next) {
  try {
    const analytics = await superAdminService.getAnalytics();
    return res.status(200).json(analytics);
  } catch (error) {
    return next(error);
  }
}

async function getAuditLogs(req, res, next) {
  try {
    const auditLogs = await superAdminService.getAuditLogs(req.query);
    return res.status(200).json(auditLogs);
  } catch (error) {
    return next(error);
  }
}

async function getSettings(req, res, next) {
  try {
    const settings = await superAdminService.getPlatformSettings();
    return res.status(200).json(settings);
  } catch (error) {
    return next(error);
  }
}

async function updateSetting(req, res, next) {
  try {
    const setting = await superAdminService.updatePlatformSetting(req.body);
    return res.status(200).json(setting);
  } catch (error) {
    return next(error);
  }
}

async function getDepartments(req, res, next) {
  try {
    const departments = await superAdminService.getDepartments();
    return res.status(200).json(departments);
  } catch (error) {
    return next(error);
  }
}

async function createDepartment(req, res, next) {
  try {
    const department = await superAdminService.createDepartment(req.body);
    return res.status(201).json(department);
  } catch (error) {
    return next(error);
  }
}

async function updateDepartment(req, res, next) {
  try {
    const department = await superAdminService.updateDepartment(req.params.id, req.body);
    return res.status(200).json(department);
  } catch (error) {
    return next(error);
  }
}

async function deleteDepartment(req, res, next) {
  try {
    const result = await superAdminService.deleteDepartment(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function getTownships(req, res, next) {
  try {
    const townships = await superAdminService.getTownships();
    return res.status(200).json(townships);
  } catch (error) {
    return next(error);
  }
}

async function createTownship(req, res, next) {
  try {
    const township = await superAdminService.createTownship(req.body);
    return res.status(201).json(township);
  } catch (error) {
    return next(error);
  }
}

async function updateTownship(req, res, next) {
  try {
    const township = await superAdminService.updateTownship(req.params.id, req.body);
    return res.status(200).json(township);
  } catch (error) {
    return next(error);
  }
}

async function deleteTownship(req, res, next) {
  try {
    const result = await superAdminService.deleteTownship(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getDashboard,
  getAnalytics,
  getAuditLogs,
  getSettings,
  updateSetting,
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getTownships,
  createTownship,
  updateTownship,
  deleteTownship,
};
