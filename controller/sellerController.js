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

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const namecheck = await sellerService.checkname(name);
    if (namecheck) {
      return res
        .status(404)
        .json({ status: 404, message: "Username already registered" });
    }

    const emailcheck = await sellerService.checkemail(email);
    if (emailcheck) {
      return res
        .status(404)
        .json({ status: 404, message: "email already registered" });
    }

    const datacreate = await sellerService.sellergister(
      name,
      mobile_number,
      email,
      hashedPassword,
      address,
      company_name,
      gst_number
    );

    if (datacreate) {
      res.status(201).json({
        status: 201,
        message: datacreate,
      });
    } else {
      res.status(500).json({
        status: 500,
        message: "Failed to create seller",
      });
    }
  } catch (error) {
    console.error("Error in add seller:", error);
    res.status(500).json({
      status: 500,
      error: "Failed to create seller",
      message: error.message,
      stack: error.stack,
    });
  }
};

const loginseller = async (req, res) => {
  const { email, password } = req.body;
  try {
    sellerService.loginseller(email, password, (err, result) => {
      if (err) {
        console.error("Error:", err);
        return res
          .status(500)
          .json({ error: "An internal server error occurred" });
      }

      if (result.error) {
        return res.status(401).json({ error: result.error });
      }

      res.status(200).json({
        message: "user login success",
        status: 200,
        data: result.data,
        token: result.token,
      });
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({
      status: 500,
      error: "Failed to login user",
      message: error.message,
      stack: error.stack,
    });
  }
};

const sendOTP = async (req, res) => {
  const { mobile_number } = req.body;

  try {
    const phoneExists = await sellerService.checkphone(mobile_number);

    if (!phoneExists) {
      return res.status(404).json({
        status: 404,
        error: "Phone number not found",
        message: "The provided phone number does not exist in our records",
      });
    }

    const otp = sellerService.generateOTP();

    const result = await sellerService.storeOTP(mobile_number, otp);

    // const token = sellerService.generateToken(mobile_number);

    res.status(201).json({
      message: result,
      status: 201,
      data: {
        otp: otp,
      },
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({
      status: 500,
      error: "Failed to send OTP",
      message: error.message,
    });
  }
};

const verifyOTPHandler = async (req, res) => {
  const { mobile_number, otp } = req.body;

  try {
    const result = await sellerService.verifyOTP(mobile_number, otp);

    res.status(200).json({
      status: 200,
      message: result,
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(400).json({
      status: 400,
      error: "Failed to verify OTP",
      message: error.message,
    });
  }
};

const changePasswordHandler = async (req, res) => {
  const { mobile_number, password } = req.body;

  try {
    const result = await sellerService.changePassword({
      mobile_number,
      password,
    });

    res.status(201).json({
      status: 201,
      data: {
        message: result,
      },
    });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({
      status: 500,
      error: "Failed to change password",
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
      return res.status(404).json({ status: 404, message: "Subscription ID not found" });
    }

    const subscriptionDetails = await sellerService.userSubscription(sub_id, userId);

    if (subscriptionDetails) {
      return res.status(201).json({
        status: 201,
        data: subscriptionDetails 
      });
    } else {
      return res.status(500).json({
        status: 500,
        error: "Failed to add user subscription",
        message: "Error occurred while creating subscription"
      });
    }
  } catch (error) {
    console.error("Error in add subscription:", error);
    res.status(500).json({
      status: 500,
      error: "Failed to add user subscription",
      message: error.message,
      stack: error.stack,
    });
  }
};

const ListSubscription = async (req, res) => {
  if (req.user.role !== "user") {
    return res.status(403).json({
      status: 403,
      error: "Forbidden. Only seller can activate gig.",
    });
  }
  
  try {
    const result = await sellerService.ListAllSubId();

    res.status(200).json({
      status: 200,
      data: result,
      
    });
  } catch (error) {
    console.error("Error listing subscriptions:", error);
    res.status(500).json({
      status: 500,
      error: "Failed to list subscriptions",
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
  ListSubscription
};
