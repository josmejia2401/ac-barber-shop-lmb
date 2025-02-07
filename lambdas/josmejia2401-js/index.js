const dynamoDBRepository = require('./repository/dynamo-db.repository');
const commonConstants = require('./lib/constants');
const globalException = require('./lib/global-exception-handler');
const JWT = require('./lib/jwt');
const listValues = require('./lib/list-values');
const logger = require('./lib/logger');
const responseHandler = require('./lib/response-handler');
const schemaValidator = require('./lib/schema');
const commonUtils = require('./lib/util');
const jsonwebtoken = require('jsonwebtoken');
const joi = require('joi');

module.exports = {
    dynamoDBRepository: dynamoDBRepository,
    commonConstants: commonConstants.constants,
    globalException: globalException,
    JWT: JWT.JWT,
    listValues: listValues,
    logger: logger,
    responseHandler: responseHandler,
    schemaValidator: schemaValidator,
    commonUtils: commonUtils,
    jsonwebtoken: jsonwebtoken,
    joi: joi
  }