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


module.exports = { 
  validateSeller,
  validateotp,
  verifyOtp,
  validateForgetPassword
};
