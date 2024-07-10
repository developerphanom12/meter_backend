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
      gst_number
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


function generateOTP() {
  let digits = '0123456789';
  let OTP = '';
  let length = digits.length;
  for (let i = 0; i < 4; i++) {
      OTP += digits[Math.floor(Math.random() * length)];
  }
  return OTP;
}


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

    const token = sellerService.generateToken(mobile_number);

    res.status(200).json({
      message: result,
      status: 200,
      token, // Return the token
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

module.exports = {
  createseller,
  loginseller,
  sendOTP

};
