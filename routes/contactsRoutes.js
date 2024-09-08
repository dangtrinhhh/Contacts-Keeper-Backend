const express = require("express");
const router = express.Router();
const { getAllContacts, getSpecificContact, createContact, updateContact, deleteContact } = require("../controllers/contactsController");
const validateToken = require("../middleware/validateTokenHandler");

// Validate token before handle request
router.use(validateToken);
router.route('/').get(getAllContacts).post(createContact);

router.route('/:id').get(getSpecificContact).put(updateContact).delete(deleteContact);

module.exports = router;
