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


module.exports = { validateSeller };
