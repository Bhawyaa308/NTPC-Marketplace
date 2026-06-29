const bcrypt = require('bcrypt');
const settingsRepository = require('../repositories/settings.repository');

const SALT_ROUNDS = 12;
const PROFILE_VISIBILITY = ['PUBLIC', 'NTPC_EMPLOYEES_ONLY', 'PRIVATE'];

function createError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function normalizeSettings(settings) {
  return {
    ...settings,
    preferred_categories: Array.isArray(settings?.preferred_categories)
      ? settings.preferred_categories
      : [],
  };
}

function validateBoolean(payload, key, updateFields) {
  if (payload[key] === undefined) return;
  if (typeof payload[key] !== 'boolean') {
    throw createError(400, `${key} must be a boolean`);
  }
  updateFields[key] = payload[key];
}

async function getSettings(user_id) {
  const settings = await settingsRepository.getSettings(user_id);
  return normalizeSettings(settings);
}

async function updateSettings(user_id, payload = {}) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw createError(400, 'Settings payload must be an object');
  }

  const allowedFields = [
    'two_factor_enabled',
    'email_notifications',
    'push_notifications',
    'transfer_alerts',
    'profile_visibility',
    'show_contact_to_buyers',
    'default_township_id',
    'preferred_categories',
  ];

  const unknownField = Object.keys(payload).find((key) => !allowedFields.includes(key));
  if (unknownField) {
    throw createError(400, `Updating ${unknownField} is not allowed`);
  }

  const updateFields = {};

  validateBoolean(payload, 'two_factor_enabled', updateFields);
  validateBoolean(payload, 'email_notifications', updateFields);
  validateBoolean(payload, 'push_notifications', updateFields);
  validateBoolean(payload, 'transfer_alerts', updateFields);
  validateBoolean(payload, 'show_contact_to_buyers', updateFields);

  if (payload.profile_visibility !== undefined) {
    const value = String(payload.profile_visibility).trim().toUpperCase();
    if (!PROFILE_VISIBILITY.includes(value)) {
      throw createError(400, 'Invalid profile_visibility');
    }
    updateFields.profile_visibility = value;
  }

  if (payload.default_township_id !== undefined) {
    if (payload.default_township_id === null || payload.default_township_id === '') {
      updateFields.default_township_id = null;
    } else {
      const townshipId = Number(payload.default_township_id);
      if (!Number.isInteger(townshipId) || townshipId < 1) {
        throw createError(400, 'default_township_id must be a positive integer');
      }

      const exists = await settingsRepository.townshipExists(townshipId);
      if (!exists) {
        throw createError(400, 'Selected township does not exist');
      }

      updateFields.default_township_id = townshipId;
    }
  }

  let categoryIdsToReplace = null;

  if (payload.preferred_categories !== undefined) {
    if (!Array.isArray(payload.preferred_categories)) {
      throw createError(400, 'preferred_categories must be an array');
    }

    const categoryIds = [...new Set(payload.preferred_categories.map(Number))];
    if (categoryIds.some((id) => !Number.isInteger(id) || id < 1)) {
      throw createError(400, 'preferred_categories must contain positive integers');
    }

    const existingIds = await settingsRepository.getExistingCategoryIds(categoryIds);
    if (existingIds.length !== categoryIds.length) {
      throw createError(400, 'One or more preferred categories do not exist');
    }

    categoryIdsToReplace = categoryIds;
  }

  let settings = await settingsRepository.updateSettings(user_id, updateFields);

  if (categoryIdsToReplace !== null) {
    settings = await settingsRepository.replacePreferredCategories(user_id, categoryIdsToReplace);
  }

  return normalizeSettings(settings);
}

function validatePasswordPolicy(password) {
  if (typeof password !== 'string' || password.length < 8) {
    throw createError(400, 'Password must be at least 8 characters long');
  }

  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
    throw createError(400, 'Password must include uppercase, lowercase, number, and special character');
  }
}

async function changePassword(user_id, payload = {}) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw createError(400, 'Password payload must be an object');
  }

  const { current_password, new_password, confirm_password } = payload;

  if (!current_password || !new_password || !confirm_password) {
    throw createError(400, 'Current password, new password, and confirmation are required');
  }

  if (new_password !== confirm_password) {
    throw createError(400, 'New password and confirmation do not match');
  }

  validatePasswordPolicy(new_password);

  const passwordHash = await settingsRepository.getPasswordHash(user_id);
  if (!passwordHash) {
    throw createError(404, 'User not found');
  }

  const matches = await bcrypt.compare(current_password, passwordHash);
  if (!matches) {
    throw createError(401, 'Current password is incorrect');
  }

  const isSamePassword = await bcrypt.compare(new_password, passwordHash);
  if (isSamePassword) {
    throw createError(400, 'New password must be different from current password');
  }

  const newHash = await bcrypt.hash(new_password, SALT_ROUNDS);
  await settingsRepository.updatePasswordHash(user_id, newHash);

  return { message: 'Password updated successfully' };
}

module.exports = {
  getSettings,
  updateSettings,
  changePassword,
};
