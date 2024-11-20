const {
  createLot,
  readLot,
  updateLot,
  deleteLot,
  readLots,
  readWinner,
  bidForLot,
  reserveLot,
  closeLot,
  purchaseLot,
} = require("../controller/lot");
const router = require('express').Router();

router.post('/lot', createLot);
router.get('/lot/:lotID([a-z0-9]{24})', readLot);
router.put('/lot/:lotID([a-z0-9]{24})', updateLot);
router.delete('/lot/:lotID([a-z0-9]{24})', deleteLot);
router.get('/lots', readLots);
router.get('/lot/:lotID([a-z0-9]{24})/winner', readWinner);
router.post('/lot/:lotID([a-z0-9]{24})/reserve', reserveLot);
router.post('/lot/:paymentID([A-Z0-9]{17})/close', closeLot);

router.post('/user/:userID([a-z0-9]{24})/lot/:lotID([a-z0-9]{24})/bid', bidForLot);
router.post('/user/:userID([a-z0-9]{24})/lot/:lotID([a-z0-9]{24})/purchase', purchaseLot);

module.exports = router;
