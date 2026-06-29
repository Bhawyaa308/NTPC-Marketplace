const reportsService = require('../services/reports.service');

async function createReport(req, res, next) {
  try {
    const report = await reportsService.createReport(req.user.user_id, req.body);
    return res.status(201).json(report);
  } catch (err) {
    return next(err);
  }
}

async function getMyReports(req, res, next) {
  try {
    const reports = await reportsService.getReportsByUser(req.user.user_id);
    return res.status(200).json(reports);
  } catch (err) {
    return next(err);
  }
}

async function getReportById(req, res, next) {
  try {
    const report = await reportsService.getReportById(req.params.id, req.user.user_id);
    return res.status(200).json(report);
  } catch (err) {
    return next(err);
  }
}

async function withdrawReport(req, res, next) {
  try {
    const report = await reportsService.withdrawReport(req.params.id, req.user.user_id);
    return res.status(200).json(report);
  } catch (err) {
    return next(err);
  }
}

async function getAllReports(req, res, next) {
  try {
    const reports = await reportsService.getAllReports();
    return res.status(200).json(reports);
  } catch (err) {
    return next(err);
  }
}

async function updateReportStatus(req, res, next) {
  try {
    const report = await reportsService.updateReportStatus(req.params.id, req.body?.status, req.user.user_id);
    return res.status(200).json(report);
  } catch (err) {
    return next(err);
  }
}

async function resolveReport(req, res, next) {
  try {
    const report = await reportsService.resolveReport(req.params.id, req.user.user_id);
    return res.status(200).json(report);
  } catch (err) {
    return next(err);
  }
}

async function rejectReport(req, res, next) {
  try {
    const report = await reportsService.rejectReport(req.params.id, req.user.user_id);
    return res.status(200).json(report);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createReport,
  getMyReports,
  getReportById,
  withdrawReport,
  getAllReports,
  updateReportStatus,
  resolveReport,
  rejectReport,
};
