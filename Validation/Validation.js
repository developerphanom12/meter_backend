const Joi = require("joi");

const sellergister = Joi.object({
  name: Joi.string().required(),
  mobile_number: Joi.string()
    .length(10)
    .pattern(/[6-9]{1}[0-9]{9}/)
    .required(),
  email: Joi.string().email().required(),
  password: Joi.string().max(16).min(8).required(),
  address: Joi.string().required(),
  company_name: Joi.string().required(),
  gst_number: Joi.string().required()
});
const validateSeller = (req, res, next) => {
  const { error } = sellergister.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  next();
};


const userlogin = Joi.object({
  emailOrMobile: Joi.string()
    .required()
    .custom((value, helpers) => {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const mobilePattern = /^[0-9]{10,}$/;

      if (emailPattern.test(value) || mobilePattern.test(value)) {
        return value;
      }
      
      return helpers.message('Invalid email or mobile number. Mobile number must be at least 10 digits long.');
    }),
  password: Joi.string().max(16).min(8).required()
});

const validateusers = (req, res, next) => {
  const { error } = userlogin.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  next();
};


const OTPsend = Joi.object({
  mobile_number: Joi.string()
    .length(10)
    .pattern(/[6-9]{1}[0-9]{9}/)
    .required(),
  });
const validateotp = (req, res, next) => {
  const { error } = OTPsend.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  next();
};
const OTPverify = Joi.object({
  mobile_number: Joi.string()
    .length(10)
    .pattern(/^[6-9]{1}[0-9]{9}$/)
    .required(),
  otp: Joi.string()
    .length(6)
    .pattern(/^[0-9]{6}$/)
    .required(),
});

const verifyOtp = (req, res, next) => {
  const { error } = OTPverify.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  next();
};



const forgetPassword = Joi.object({
  mobile_number: Joi.string()
    .length(10)
    .pattern(/[6-9]{1}[0-9]{9}/)
    .required(),
  password: Joi.string().max(16).min(8).required(),
});
const validateForgetPassword = (req, res, next) => {
  const { error } = forgetPassword.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  next();
};


const subscription = Joi.object({
  sub_id: Joi.string().pattern(/^[0-9]+$/).required(),
});
const validateSubcription = (req, res, next) => {
  const { error } = subscription.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  next();
};



const verifyUserRegisterOtp = Joi.object({
  mobile_number: Joi.string()
    .length(10)
    .pattern(/[6-9]{1}[0-9]{9}/)
    .required(),
    otp: Joi.string()
    .length(6)
    .pattern(/^[0-9]{6}$/)
    .required(),
});
const validateOtpVerify = (req, res, next) => {
  const { error } = verifyUserRegisterOtp.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  next();
};

module.exports = { 
  validateSeller,
  validateotp,
  verifyOtp,
  validateForgetPassword,
  validateSubcription,
  validateusers,
  validateOtpVerify
};
