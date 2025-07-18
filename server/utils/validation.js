const Joi = require('joi');

const registerValidation = (data) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  });
  return schema.validate(data);
};

const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });
  return schema.validate(data);
};

const postValidation = (data) => {
  const schema = Joi.object({
    title: Joi.string().max(200).required(),
    content: Joi.string().required(),
    excerpt: Joi.string().max(500).optional(),
    category: Joi.string().required(),
    tags: Joi.array().items(Joi.string()).optional(),
    status: Joi.string().valid('draft', 'published').optional()
  });
  return schema.validate(data);
};

const categoryValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().max(50).required(),
    description: Joi.string().max(200).optional()
  });
  return schema.validate(data);
};

const commentValidation = (data) => {
  const schema = Joi.object({
    content: Joi.string().max(1000).required(),
    post: Joi.string().required(),
    parent: Joi.string().optional()
  });
  return schema.validate(data);
};

module.exports = {
  registerValidation,
  loginValidation,
  postValidation,
  categoryValidation,
  commentValidation
};