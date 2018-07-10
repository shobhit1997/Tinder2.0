const Joi = require('joi');

const schema = Joi.object().keys({
    name: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(6).max(30).required(),
    phone: Joi.number().integer().min(1000000000).max(9999999999).required(),
    gender:Joi.string().valid(['Male','Female']).required()
});

module.exports=schema;