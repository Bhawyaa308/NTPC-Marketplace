const auditRepository = require('../repositories/audit.repository');

async function logEvent({ user_id, action, entity_type = null, entity_id = null, metadata = null }) {
  await auditRepository.createAuditLog({ user_id, action, entity_type, entity_id, metadata });
}

module.exports = {
  logEvent,
};
