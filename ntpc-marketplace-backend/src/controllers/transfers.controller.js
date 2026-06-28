const transfersService = require('../services/transfers.service');

async function getTransfers(req, res, next) {
  try {
    const payload = {
      from: req.query.from,
      to: req.query.to,
    };

    const data = await transfersService.getTransfersDashboard(payload);
    return res.status(200).json(data);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getTransfers,
};
