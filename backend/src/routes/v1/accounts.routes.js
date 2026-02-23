const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const { getAccounts, addAccount, updateAccount, deleteAccount } = require('../../controllers/accounts.controller');

router.use(protect);

router.get('/', getAccounts);
router.post('/', addAccount);
router.put('/:id', updateAccount);
router.delete('/:id', deleteAccount);

module.exports = router;
