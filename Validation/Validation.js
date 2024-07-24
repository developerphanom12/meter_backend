const Joi = require("joi");

const sellergister = Joi.object({
  name: Joi.string().required().messages({
    'string.empty': 'Name is required',
    'any.required': 'Name is required',
  }),
  mobile_number: Joi.string()
    .length(10)
    .pattern(/[6-9]{1}[0-9]{9}/)
    .required()
    .messages({
      'string.length': 'Mobile number must be exactly 10 digits long',
      'string.pattern.base': 'Mobile number must start with digits 6-9 and contain only digits',
      'any.required': 'Mobile number is required',
    }),
  email: Joi.string().email().required().messages({
    'string.email': 'Email must be a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().max(16).min(8).required().messages({
    'string.max': 'Password must be at most 16 characters long',
    'string.min': 'Password must be at least 8 characters long',
    'any.required': 'Password is required',
  }),
  address: Joi.string().required().messages({
    'string.empty': 'Address is required',
    'any.required': 'Address is required',
  }),
  company_name: Joi.string().required().messages({
    'string.empty': 'Company name is required',
    'any.required': 'Company name is required',
  }),
  gst_number: Joi.string().required().messages({
    'string.empty': 'GST number is required',
    'any.required': 'GST number is required',
  })
});

const validateSeller = (req, res, next) => {
  const { error } = sellergister.validate(req.body);

  if (error) {
    return res.status(400).json({ status: false, message: error.details[0].message });
  }

  next();
};const userlogin = Joi.object({
  emailOrMobile: Joi.string()
    .required()
    .custom((value, helpers) => {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const mobilePattern = /^[0-9]{10,}$/;

      if (emailPattern.test(value) || mobilePattern.test(value)) {
        return value;
      }

      return helpers.message('Invalid email or mobile number');
    })
    .messages({
      'any.required': 'emailOrMobile is required',
    }),
  password: Joi.string().max(16).min(8).required().messages({
    'string.max': 'Password must be at most 16 characters long',
    'string.min': 'Password must be at least 8 characters long',
    'any.required': 'Password is required',
  }),
});

const validateusers = (req, res, next) => {
  const { error } = userlogin.validate(req.body);

  if (error) {
    return res.status(400).json({ status: false, message: error.details[0].message });
  }

  next();
};


const OTPsend = Joi.object({
  mobile_number: Joi.string()
    .length(10)
    .pattern(/[6-9]{1}[0-9]{9}/)
    .required()
    .messages({
      'string.length': 'Mobile number must be exactly 10 digits long',
      'string.pattern.base': 'Mobile number must start with a digit between 6 and 9 and be followed by 9 digits',
      'any.required': 'Mobile number is required',
    }),
});

const validateotp = (req, res, next) => {
  const { error } = OTPsend.validate(req.body);

  if (error) {
    return res.status(400).json({ status: false, message: error.details[0].message });
  }

  next();
};
const OTPverify = Joi.object({
  mobile_number: Joi.string()
    .length(10)
    .pattern(/^[6-9]{1}[0-9]{9}$/)
    .required()
    .messages({
      'string.length': 'Mobile number must be exactly 10 digits long',
      'string.pattern.base': 'Mobile number must start with a digit between 6 and 9 and be followed by 9 digits',
      'any.required': 'Mobile number is required',
    }),
  otp: Joi.string()
    .length(6)
    .pattern(/^[0-9]{6}$/)
    .required()
    .messages({
      'string.length': 'OTP must be exactly 6 digits long',
      'string.pattern.base': 'OTP must be exactly 6 digits consisting of numbers only',
      'any.required': 'OTP is required',
    }),
});

const verifyOtp = (req, res, next) => {
  const { error } = OTPverify.validate(req.body);

  if (error) {
    return res.status(400).json({ status: false, message: error.details[0].message });
  }

  next();
};




const forgetPassword = Joi.object({
  mobile_number: Joi.string()
    .length(10)
    .pattern(/^[6-9]{1}[0-9]{9}$/)
    .required()
    .messages({
      'string.length': 'Mobile number must be exactly 10 digits long',
      'string.pattern.base': 'Mobile number must start with a digit between 6 and 9 and be followed by 9 digits',
      'any.required': 'Mobile number is required',
    }),
  password: Joi.string()
    .max(16)
    .min(8)
    .required()
    .messages({
      'string.max': 'Password must not exceed 16 characters',
      'string.min': 'Password must be at least 8 characters long',
      'any.required': 'Password is required',
    }),
});

const validateForgetPassword = (req, res, next) => {
  const { error } = forgetPassword.validate(req.body);

  if (error) {
    return res.status(400).json({ status: false, message: error.details[0].message });
  }

  next();
};



const subscription = Joi.object({
  sub_id: Joi.string().pattern(/^[0-9]+$/).required(),
});
const validateSubcription = (req, res, next) => {
  const { error } = subscription.validate(req.body);

  if (error) {
    return res.status(400).json({status:false, message: error.details[0].message });
  }

  next();
};


const verifyUserRegisterOtp = Joi.object({
  mobile_number: Joi.string()
    .length(10)
    .pattern(/[6-9]{1}[0-9]{9}/)
    .required()
    .messages({
      'string.length': 'Mobile number must be exactly 10 digits long',
      'string.pattern.base': 'Mobile number must start with a digit between 6 and 9 and be followed by 9 digits',
      'any.required': 'Mobile number is required',
    }),
  otp: Joi.string()
    .length(6)
    .pattern(/^[0-9]{6}$/)
    .required()
    .messages({
      'string.length': 'OTP must be exactly 6 digits long',
      'string.pattern.base': 'OTP must contain only digits',
      'any.required': 'OTP is required',
    }),
});

const validateOtpVerify = (req, res, next) => {
  const { error } = verifyUserRegisterOtp.validate(req.body);

  if (error) {
    return res.status(400).json({ status: false, message: error.details[0].message });
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
