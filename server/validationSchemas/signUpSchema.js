const Joi = require('joi');

const schema = Joi.object().keys({
    name: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
    phone: Joi.number().min(1000000000).max(9999999999).required(),
    gender:Joi.string().valid(['Male','Female']).required()
});

module.exports=schema;