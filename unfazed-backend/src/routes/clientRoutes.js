const express = require('express');
const router = express.Router();
const {
  getClients,
  getClientById,
  createClient,
  updateClient,
  submitIntakeConsent
} = require('../controllers/clientController');
const { protect } = require('../middleware/authMiddleware');
const { requireEntitlement } = require('../middleware/entitlementMiddleware');

// Client intake + consent (can be called by client portal directly)
router.post('/intake-consent', submitIntakeConsent);

// Protected therapist CRM routes
router.use(protect);
router.get('/', getClients);
router.get('/:id', getClientById);
router.post('/', requireEntitlement('add_client'), createClient);
router.put('/:id', updateClient);

module.exports = router;
