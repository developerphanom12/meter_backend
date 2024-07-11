const express = require('express')
const router = express.Router();
const sellercontroller = require('../controller/sellerController');
const { validateSeller, validateotp, verifyOtp, validateForgetPassword } = require('../Validation/Validation');



router.post('/user-registrer', validateSeller, sellercontroller.createseller);
router.post('/user-login', sellercontroller.loginseller);
router.post('/user-otp', validateotp, sellercontroller.sendOTP);
router.post('/user-verifyOtp',verifyOtp, sellercontroller.verifyOTPHandler);
router.post('/user-passwordchange', validateForgetPassword,sellercontroller.changePasswordHandler);


    
module.exports = router;




