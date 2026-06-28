const transfersRepository = require('../repositories/transfers.repository');

function createError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function getTransfersDashboard(filters = {}) {
  if (filters && typeof filters !== 'object') {
    throw createError(400, 'Invalid filters');
  }

  return transfersRepository.getTransfersDashboard(filters);
}

module.exports = {
  getTransfersDashboard,
};
