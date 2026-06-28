const profileRepository = require('../repositories/profile.repository');

function createError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function getMyProfile(user_id) {
  const profile = await profileRepository.getProfileByUserId(user_id);
  if (!profile) {
    throw createError(404, 'Profile not found');
  }

  return profile;
}

async function updateMyProfile(user_id, payload) {
  const disallowedFields = ['user_id', 'employee_id', 'email', 'roles'];
  const payloadKeys = Object.keys(payload || {});

  for (const key of payloadKeys) {
    if (disallowedFields.includes(key)) {
      throw createError(400, `Updating ${key} is not allowed`);
    }
  }

  const updateFields = {};

  if (payload.name !== undefined) {
    if (typeof payload.name !== 'string' || payload.name.trim() === '') {
      throw createError(400, 'Valid name is required');
    }
    updateFields.name = payload.name.trim();
  }

  if (payload.phone !== undefined) {
    if (typeof payload.phone !== 'string' || payload.phone.trim() === '') {
      throw createError(400, 'Valid phone is required');
    }
    updateFields.phone = payload.phone.trim();
  }

  if (payload.designation !== undefined) {
    if (typeof payload.designation !== 'string' || payload.designation.trim() === '') {
      throw createError(400, 'Valid designation is required');
    }
    updateFields.designation = payload.designation.trim();
  }

  if (payload.profile_picture !== undefined) {
    if (typeof payload.profile_picture !== 'string' || payload.profile_picture.trim() === '') {
      throw createError(400, 'Valid profile_picture is required');
    }
    updateFields.profile_picture = payload.profile_picture.trim();
  }

  if (Object.keys(updateFields).length === 0) {
    throw createError(400, 'No valid profile fields provided');
  }

  const updatedProfile = await profileRepository.updateProfileById(user_id, updateFields);
  return updatedProfile;
}

module.exports = {
  getMyProfile,
  updateMyProfile,
};
