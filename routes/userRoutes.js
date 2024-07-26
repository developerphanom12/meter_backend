const express = require('express')
const router = express.Router();
const sellercontroller = require('../controller/userController');
const { validateotp, verifyOtp, validateForgetPassword, validateOtpVerify, validateUser, validatelocation, validatevehicle } = require('../Validation/Validation');
const authenticateToken = require('../Middleware/Authentication');


//---------------------user-Register Process ---------------------------//
     
router.post('/user-register', validateUser, sellercontroller.usercreate);
router.post('/user-login', sellercontroller.loginseller);
router.post('/user-otp', validateotp, sellercontroller.sendOTP);
router.post('/user-verifyOtp',verifyOtp, sellercontroller.verifyOTPHandler);
router.post('/user-passwordchange', validateForgetPassword,sellercontroller.changePasswordHandler);
router.post('/user-otpverify',validateOtpVerify, sellercontroller.verifyUserRegisterOtp);


//---------------------user-Subscription Process ---------------------------//

router.post("/user-location",authenticateToken,validatelocation, sellercontroller.userSubscription)


router.post("/user-vehicle",authenticateToken,validatevehicle, sellercontroller.userVehicle)

    
module.exports = router;




