const joi = require('joi');

const createPostValidation = (data) => {
  const schema = joi.object({
    username: joi.string().min(3).max(30).required(),
    email: joi.string().email().required(),
    password: joi.string().min(6).max(30).required(),
  });
  // now return the result of the validation || we can seperate the error and value
  return schema.validate(data);
  //  const { error, value } = schema.validate(data);
  // return { error, value };
}



// A Joi schema is defined to enforce that:

// username must be a string between 3 and 30 characters.

// email must be a valid email address.

// password must be a string between 6 and 30 characters.

// Validation:
// The schema.validate(data) method checks the provided data against the schema and returns the result (including any validation errors).

module.exports = { createPostValidation };




// Joi is one of the most popular validation libraries for Node.js, especially for validating API request payloads and other input data in production applications. However, there are several alternatives you might consider depending on your project's needs:
// alterNative : express-validator, celebrate, validator.js, zod
