const { response } = require("express");
const { resposne } = require("../Middleware/resposne");
const sellerService = require("../service/sellerService");
const bcrypt = require("bcrypt");

let saltRounds = 10;

const createseller = async (req, res) => {
  try {
    const {
      name,
      mobile_number,
      email,
      password,
      address,
      company_name,
      gst_number,
    } = req.body;

    const namecheck = await sellerService.checkname(name);
    if (namecheck) {
      return res.status(404).json({
        status: resposne.successFalse,
        message: resposne.checkusername,
      });
    }

    const emailcheck = await sellerService.checkemail(email);
    if (emailcheck) {
      return res.status(404).json({
        status: resposne.successFalse,
        message: resposne.checkEmail,
      });
    }

    const phone = await sellerService.checkphone(mobile_number);
    if (phone) {
      return res.status(404).json({
        status: resposne.successFalse,
        message: resposne.checkphone,
      });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const userid = await sellerService.sellergister(
      name,
      mobile_number,
      email,
      hashedPassword,
      address,
      company_name,
      gst_number
    );

    if (userid) {
      const otp = sellerService.generateOTP();
      const otpsend = await sellerService.RegisterOtp(userid, otp, mobile_number);

      if (otpsend) {
        res.status(201).json({
          status: resposne.successTrue,
          message: resposne.otpsend,
        });
      } else {
        res.status(500).json({
          status: resposne.successFalse,
          message:resposne.failedotp,
        });
      }
    } else {
      res.status(500).json({
        status: resposne.successFalse,
        message:resposne.userfailed,
      });
    }
  } catch (error) {
    res.status(500).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};
const loginseller = async (req, res) => {
  const { emailOrMobile, password } = req.body;

  try {
    const verified = await sellerService.checkverifed(emailOrMobile);
    if (!verified) {
      return res.status(404).json({
        status: resposne.successFalse,
        message: "Your mobile number is not verified",
      });
    }

    sellerService.loginseller(emailOrMobile, password, (err, result) => {
      if (err) {
        console.error("Error:", err);
        return res.status(500).json({
          status: resposne.successFalse,
          message: resposne.loginuser,
        });
      }

      if (result.error) {
        return res.status(401).json({
          status: resposne.successFalse,
          message: result.error,
        });
      }

      res.status(200).json({
        status: resposne.successTrue,
        message: resposne.lginmessage,
        data: result.data,
      });
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};


module.exports = loginseller;

const sendOTP = async (req, res) => {
  const { mobile_number } = req.body;

  try {
    const phoneExists = await sellerService.checkphone(mobile_number);

    if (!phoneExists) {
      return res.status(404).json({
        status: resposne.successFalse,
        message: "The provided phone number does not exist in our records",
      });
    }

    const otp = sellerService.generateOTP();

    try {
      await sellerService.storeOTP(mobile_number, otp);
      res.status(201).json({
        status: resposne.successTrue,
        message: resposne.otpsend,
        otp: otp,
      });
    } catch (storeError) {
      console.error("Error storing OTP:", storeError);
      res.status(500).json({
        status: "failure",
        error: "Failed to store OTP",
        message: storeError.message,
      });
    }
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({
      status: "failure",
      error: "Failed to send OTP",
      message: error.message,
    });
  }
};

const verifyOTPHandler = async (req, res) => {
  const { mobile_number, otp } = req.body;

  try {
    const phone = await sellerService.checkphone(mobile_number);
    if (!phone) {
      return res.status(404).json({
        status: resposne.successFalse,
        message: "Invalid phone number",
      });
    }

     await sellerService.verifyOTP(mobile_number, otp);

    res.status(200).json({
      status: resposne.successTrue,
      message: "OTP verified successfully",
    });
  } catch (error) {
    res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

const changePasswordHandler = async (req, res) => {
  const { mobile_number, password } = req.body;

  try {
    const phoneExists = await sellerService.checkphoneotp(mobile_number);

    if (!phoneExists) {
      return res.status(404).json({
        status: resposne.successFalse,
        message: "OTP NOT VERIFIED",
      });
    }

    const result = await sellerService.changePassword({
      mobile_number,
      password,
    });

    res.status(201).json({
      status: resposne.successTrue,
      message: result,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
};
const userSubscription = async (req, res) => {
  const userId = req.user.id;
  try {
    const { sub_id } = req.body;

    const subId = await sellerService.checkSubId(sub_id);
    if (!subId) {
      return res
        .status(404)
        .json({ status: resposne.successFalse, message: resposne.checksubscriptionId });
    }

    const subscriptionDetails = await sellerService.userSubscription(
      sub_id,
      userId
    );

    if (subscriptionDetails) {
      return res.status(201).json({
        status: resposne.successTrue,
        data: subscriptionDetails,
      });
    } else {
      return res.status(500).json({
        status: resposne.successFalse,
        error: "Failed to add user subscription",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

const ListSubscription = async (req, res) => {
  if (req.user.role !== "user") {
    return res.status(403).json({
      status: resposne.successFalse,
      error: "Forbidden. Only seller can activate gig.",
    });
  }

  try {
    const result = await sellerService.ListAllSubId();

    res.status(200).json({
      status: resposne.successFalse,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

const verifyUserRegisterOtp = async (req, res) => {
  const { mobile_number, otp } = req.body;

  try {
    const phone = await sellerService.checkphone(mobile_number);
    if (!phone) {
      return res.status(404).json({
        status: resposne.successFalse,
        message: "Invalid phone number",
      });
    }

    const result = await sellerService.verifyUserOtp(mobile_number, otp);

    res.status(200).json({
      status: resposne.successTrue,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    res.status(400).json({
      status: response.successFalse,
      message: error.message,
    });
  }
};

module.exports = {
  createseller,
  loginseller,
  sendOTP,
  verifyOTPHandler,
  changePasswordHandler,
  userSubscription,
  ListSubscription,
  verifyUserRegisterOtp
};
