const Joi = require("joi");

const sellergister = Joi.object({
  name: Joi.string().required().messages({
    'string.empty': 'Name is required',
    'any.required': 'Name is required',
  }),
  email: Joi.string().email().messages({
    'string.email': 'Email must be a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().max(16).min(8).required().messages({
    'string.max': 'Password must be at most 16 characters long',
    'string.min': 'Password must be at least 8 characters long',
    'any.required': 'Password is required',
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
});

const validateUser = (req, res, next) => {
  const { error } = sellergister.validate(req.body);

  if (error) {
    return res.status(400).json({ status: false, message: error.details[0].message });
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


const userlocation = Joi.object({
  longitude: Joi.string()
    .messages({
      'any.required': 'Longitude is required',
    }),
  latitude: Joi.string()
    .messages({
      'any.required': 'Latitude is required',
    }),
  address: Joi.string()
    .min(8)
    .max(50)
    .messages({
      'string.max': 'Address must not exceed 16 characters',
      'string.min': 'Address must be at least 8 characters long',
      'any.required': 'Address is required',
    }),
});

const validatelocation = (req, res, next) => {
  const { error } = userlocation.validate(req.body);

  if (error) {
    return res.status(400).json({ status: false, message: error.details[0].message });
  }

  next();
};




const uservEHICLE = Joi.object({
carname: Joi.string()
.valid('suv', 'sedan', 'hatchback', 'bike')
.required()
.messages({
  'any.only': 'Carname must be one of suv, sedan, hatchback, or bike',
  'any.required': 'Carname is required',
}),
});

const validatevehicle = (req, res, next) => {
  const { error } = uservEHICLE.validate(req.body);

  if (error) {
    return res.status(400).json({ status: false, message: error.details[0].message });
  }

  next();
};
module.exports = { 
  validateotp,
  verifyOtp,
  validateForgetPassword,
  validateusers,
  validateOtpVerify,
  validateUser,
  validatelocation,
  validatevehicle
};
