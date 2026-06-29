const adminService = require('../services/admin.service');

async function getDashboard(req, res, next) {
  try {
    const dashboard = await adminService.getDashboardSummary();
    return res.status(200).json(dashboard);
  } catch (err) {
    return next(err);
  }
}

async function getUsers(req, res, next) {
  try {
    const users = await adminService.listUsers();
    return res.status(200).json(users);
  } catch (err) {
    return next(err);
  }
}

async function deactivateUser(req, res, next) {
  try {
    const user = await adminService.deactivateUser(req.params.id, req.user.user_id);
    return res.status(200).json(user);
  } catch (err) {
    return next(err);
  }
}

async function activateUser(req, res, next) {
  try {
    const user = await adminService.activateUser(req.params.id);
    return res.status(200).json(user);
  } catch (err) {
    return next(err);
  }
}

async function getReports(req, res, next) {
  try {
    const reports = await adminService.listReports();
    return res.status(200).json(reports);
  } catch (err) {
    return next(err);
  }
}

async function resolveReport(req, res, next) {
  try {
    const report = await adminService.resolveReport(req.params.id, req.user.user_id);
    return res.status(200).json(report);
  } catch (err) {
    return next(err);
  }
}

async function rejectReport(req, res, next) {
  try {
    const report = await adminService.rejectReport(req.params.id, req.user.user_id);
    return res.status(200).json(report);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getDashboard,
  getUsers,
  deactivateUser,
  activateUser,
  getReports,
  resolveReport,
  rejectReport,
};
