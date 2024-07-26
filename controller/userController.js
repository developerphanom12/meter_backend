const { response } = require("express");
const { resposne } = require("../Middleware/resposne");
const sellerService = require("../service/userService");
const bcrypt = require("bcrypt");

let saltRounds = 10;

const usercreate = async (req, res) => {
  try {
    const { name, email, password, mobile_number } = req.body;

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
      email,
      hashedPassword,
      mobile_number
    );

    if (userid) {
      const otp = sellerService.generateOTP();
      const otpsend = await sellerService.RegisterOtp(
        userid,
        otp,
        mobile_number
      );

      if (otpsend) {
        res.status(201).json({
          status: resposne.successTrue,
          message: resposne.otpsend,
        });
      } else {
        res.status(500).json({
          status: resposne.successFalse,
          message: resposne.failedotp,
        });
      }
    } else {
      res.status(500).json({
        status: resposne.successFalse,
        message: resposne.userfailed,
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
  const { google_id, apple_id, name, mobile_number, password } = req.body;

  try {
    if (google_id || apple_id) {
      const sociallogin = await sellerService.socialogin(google_id, apple_id);

      if (sociallogin.error) {
        if (mobile_number) {
          if (!/^\d{10}$/.test(mobile_number)) {
            return res.status(400).json({
              status: false,
              message: "Invalid phone number format. Must be 10 digits.",
            });
          }

          const phoneExists = await sellerService.checkphone(mobile_number);

          if (phoneExists) {
            return res.status(400).json({
              status: false,
              message: "The phone number already exists",
            });
          }

          if (!name) {
            return res.status(400).json({
              status: false,
              message: "Name is required for registration",
            });
          }

          const newUser = await sellerService.socialRegister(name, mobile_number, google_id, apple_id);

          if (newUser.error) {
            return res.status(400).json({
              status: false,
              message: "Failed to register user",
            });
          }

          const userid = newUser.id;
          console.log("undefined",userid)
          const otp = sellerService.generateOTP();
          const otpsend = await sellerService.RegisterOtp(userid, otp, mobile_number);

          if (otpsend) {
            return res.status(200).json({
              status: true,
              message: "OTP sent successfully",
            });
          } else {
            return res.status(400).json({
              status: false,
              message: "Failed to send OTP",
            });
          }
        } else {
          return res.status(400).json({
            status: false,
            message: "Phone number is required",
          });
        }
      } else {
        return res.status(200).json({
          status: true,
          message: "Social Login successfully",
          data: sociallogin.data
        });
      }
    }

    if (mobile_number && password) {
      if (!/^\d{10}$/.test(mobile_number)) {
        return res.status(400).json({
          status: false,
          message: "Invalid phone number format. Must be 10 digits.",
        });
      }

      const loginResult = await sellerService.loginseller(mobile_number, password);

      if (loginResult.error) {
        return res.status(400).json({
          status: false,
          message: loginResult.error,
        });
      }

      return res.status(200).json({
        status: true,
        message: "User login successfully",
        data: loginResult.data,
      });
    }

    return res.status(400).json({
      status: false,
      message: "Required Socail fields are missing",
    });
  } catch (error) {
    return res.status(400).json({
      status: false,
      message: "Internal server error",
    });
  }
};




const sendOTP = async (req, res) => {
  const { mobile_number } = req.body;

  try {
    const phoneExists = await sellerService.checkphone(mobile_number);

    if (!phoneExists) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: "The provided phone number does not exist in our records",
      });
    }

    const otp = sellerService.generateOTP();

    try {
      await sellerService.storeOTP(mobile_number, otp);
      res.status(200).json({
        status: resposne.successTrue,
        message: resposne.otpsend,
      });
    } catch (storeError) {
      res.status(400).json({
        status: false,
        message: "Failed to store OTP",
      });
    }
  } catch (error) {
    res.status(400).json({
      status: false,
      message: "Failed To Send Otp",
    });
  }
};

const verifyOTPHandler = async (req, res) => {
  const { mobile_number, otp } = req.body;

  try {
    const phone = await sellerService.checkphone(mobile_number);
    if (!phone) {
      return res.status(400).json({
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
      message: "Inetrnal Server Error",
    });
  }
};

const changePasswordHandler = async (req, res) => {
  const { mobile_number, password } = req.body;

  try {
    const phoneExists = await sellerService.checkphoneotp(mobile_number);

    if (!phoneExists) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: "OTP NOT VERIFIED",
      });
    }

    const result = await sellerService.changePassword({
      mobile_number,
      password,
    });

    res.status(200).json({
      status: resposne.successTrue,
      message: result,
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: error.message,
    });
  }
};
const userSubscription = async (req, res) => {
  const userId = req.user.id;
  try {
    const { longitude, latitude, address } = req.body;

    const subscriptionDetails = await sellerService.userSubscription(
      longitude,
      latitude,
      address,
      userId
    );

    if (subscriptionDetails) {
      const updateResult = await sellerService.updateUserLocation(userId);

      if (updateResult) {
        return res.status(200).json({
          status: true,
          message: "User Location Added",
        });
      } else {
        return res.status(400).json({
          status: false,
          message: "Failed to update user location",
        });
      }
    } else {
      return res.status(400).json({
        status: false,
        message: "Failed to add user subscription",
      });
    }
  } catch (error) {
    res.status(400).json({
      status: false,
      message: error.message,
    });
  }
};




const userVehicle = async (req, res) => {
  const userId = req.user.id;
  try {
    const { carname } = req.body;

    const subscriptionDetails = await sellerService.userVehicle(
      carname,
      userId
    );

    if (subscriptionDetails) {
      const updateResult = await sellerService.updateUserLocation(userId);

      if (updateResult) {
        return res.status(200).json({
          status: true,
          message: "Vehicle Add Successfully",

        });
      } else {
        return res.status(400).json({
          status: false,
          message: "Failed to update user vehicle",
        });
      }
    } else {
      return res.status(400).json({
        status: false,
        message: "Failed to add user vehicle",
      });
    }
  } catch (error) {
    res.status(400).json({
      status: false,
      message: "Internal Server Error",
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
  usercreate,
  loginseller,
  sendOTP,
  verifyOTPHandler,
  changePasswordHandler,
  userSubscription,
  ListSubscription,
  verifyUserRegisterOtp,
  userVehicle
};
