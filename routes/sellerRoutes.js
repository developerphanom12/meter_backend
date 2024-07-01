const express = require('express')
const router = express.Router();
const sellercontroller = require('../controller/sellerController');
const { validateSeller } = require('../Validation/Validation');



router.post('/user-registrer', validateSeller, sellercontroller.createseller);
router.post('/user-login', sellercontroller.loginseller);


module.exports = router;




