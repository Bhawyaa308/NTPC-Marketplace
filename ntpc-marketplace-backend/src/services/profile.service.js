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
  const disallowedFields = ['user_id', 'employee_id', 'roles'];
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

  if (payload.email !== undefined) {
    if (typeof payload.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email.trim())) {
      throw createError(400, 'Valid email is required');
    }
    updateFields.email = payload.email.trim().toLowerCase();
  }

  if (payload.designation !== undefined) {
    if (typeof payload.designation !== 'string' || payload.designation.trim() === '') {
      throw createError(400, 'Valid designation is required');
    }
    updateFields.designation = payload.designation.trim();
  }

  if (payload.department_id !== undefined) {
    const departmentId = Number(payload.department_id);
    if (!Number.isInteger(departmentId) || departmentId < 1) {
      throw createError(400, 'Valid department_id is required');
    }
    updateFields.department_id = departmentId;
  }

  if (payload.department !== undefined) {
    if (typeof payload.department !== 'string' || payload.department.trim() === '') {
      throw createError(400, 'Valid department is required');
    }
    const departmentId = await profileRepository.findDepartmentIdByName(payload.department.trim());
    if (!departmentId) {
      throw createError(400, 'Department not found');
    }
    updateFields.department_id = departmentId;
  }

  if (payload.township_id !== undefined) {
    const townshipId = Number(payload.township_id);
    if (!Number.isInteger(townshipId) || townshipId < 1) {
      throw createError(400, 'Valid township_id is required');
    }
    updateFields.township_id = townshipId;
  }

  if (payload.township !== undefined) {
    if (typeof payload.township !== 'string' || payload.township.trim() === '') {
      throw createError(400, 'Valid township is required');
    }
    const townshipId = await profileRepository.findTownshipIdByName(payload.township.trim());
    if (!townshipId) {
      throw createError(400, 'Township not found');
    }
    updateFields.township_id = townshipId;
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
