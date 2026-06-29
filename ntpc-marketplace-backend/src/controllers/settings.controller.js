const settingsService = require('../services/settings.service');

async function getSettings(req, res, next) {
  try {
    const settings = await settingsService.getSettings(req.user.user_id);
    return res.status(200).json(settings);
  } catch (err) {
    return next(err);
  }
}

async function updateSettings(req, res, next) {
  try {
    const settings = await settingsService.updateSettings(req.user.user_id, req.body);
    return res.status(200).json(settings);
  } catch (err) {
    return next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const result = await settingsService.changePassword(req.user.user_id, req.body);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getSettings,
  updateSettings,
  changePassword,
};
