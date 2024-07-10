const express = require('express')
const router = express.Router();
const sellercontroller = require('../controller/sellerController');
const { validateSeller } = require('../Validation/Validation');



router.post('/user-registrer', validateSeller, sellercontroller.createseller);
router.post('/user-login', sellercontroller.loginseller);
router.post('/user-otp', sellercontroller.sendOTP);


    
module.exports = router;




