const townshipsRepository = require('../repositories/townships.repository');

async function getAllTownships() {
  return townshipsRepository.getAllTownships();
}

module.exports = {
  getAllTownships,
};
