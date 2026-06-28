const profileService = require('../services/profile.service');

async function getMyProfile(req, res, next) {
  try {
    const profile = await profileService.getMyProfile(req.user.user_id);
    return res.status(200).json(profile);
  } catch (err) {
    return next(err);
  }
}

async function updateMyProfile(req, res, next) {
  try {
    const updatedProfile = await profileService.updateMyProfile(req.user.user_id, req.body);
    return res.status(200).json(updatedProfile);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getMyProfile,
  updateMyProfile,
};
