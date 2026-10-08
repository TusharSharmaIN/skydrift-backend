import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  API_PREFIX: Joi.string().default('api'),
  UPLOAD_DIR: Joi.string().default('./uploads'),
  DB_TYPE: Joi.string().valid('postgres').default('postgres'),
  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().default('skydrift'),
  DB_PASSWORD: Joi.string().default('skydrift_password'),
  DB_NAME: Joi.string().default('skydrift_dev'),
  GEMMA_API_KEY: Joi.string().allow('').optional(),
});
