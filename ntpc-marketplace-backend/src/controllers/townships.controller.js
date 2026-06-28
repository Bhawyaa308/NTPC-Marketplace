const townshipsService = require('../services/townships.service');

async function getTownships(req, res, next) {
  try {
    const townships = await townshipsService.getAllTownships();
    return res.status(200).json({
      townships: townships.map(t => ({
        id: t.township_id,
        name: t.name,
      })),
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getTownships,
};
