const express = require('express');
const router = express.Router();
const {
  createRazorpayOrder,
  verifyPayment,
  downloadInvoicePdf,
  getPayments,
  getPackages,
  createPackage
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const { requireEntitlement } = require('../middleware/entitlementMiddleware');

// Public/Client payment routes
router.post('/create-order', createRazorpayOrder);
router.post('/verify', verifyPayment);
router.get('/invoice/:id', downloadInvoicePdf);

// Protected therapist payment & package management routes
router.use(protect);
router.get('/', getPayments);
router.get('/packages', getPackages);
router.post('/packages', requireEntitlement('packages'), createPackage);

module.exports = router;
