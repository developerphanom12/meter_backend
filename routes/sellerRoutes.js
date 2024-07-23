const express = require('express')
const router = express.Router();
const sellercontroller = require('../controller/sellerController');
const { validateSeller, validateotp, verifyOtp, validateForgetPassword, validateSubcription,validateusers, validateOtpVerify } = require('../Validation/Validation');
const authenticateToken = require('../Middleware/Authentication');


//---------------------user-Register Process ---------------------------//

router.post('/user-register', validateSeller, sellercontroller.createseller);
router.post('/user-login',validateusers, sellercontroller.loginseller);
router.post('/user-otp', validateotp, sellercontroller.sendOTP);
router.post('/user-verifyOtp',verifyOtp, sellercontroller.verifyOTPHandler);
router.post('/user-passwordchange', validateForgetPassword,sellercontroller.changePasswordHandler);
router.post('/user-otpverify',validateOtpVerify, sellercontroller.verifyUserRegisterOtp);



//---------------------user-Subscription Process ---------------------------//

router.post("/user-subscription",authenticateToken, validateSubcription, sellercontroller.userSubscription)

router.get("/list-subscription",authenticateToken,sellercontroller.ListSubscription)


    
module.exports = router;




