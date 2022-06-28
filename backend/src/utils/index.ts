import * as uuid from 'uuid';
import { decode, verify } from 'jsonwebtoken';
import { JwtPayload } from '../auth/JwtPayload';
import { createLogger } from './logger';
import { APIGatewayProxyEvent } from 'aws-lambda';

const logger = createLogger('utils');


export const getTimestamp = () => {
  return new Date().toISOString();
}

export const generateUUID = () => {
  return uuid.v4();
}

// export const decodeJwtToken = (jwtToken: string, defaultValue: any = null): JwtPayload => {
//   try {
//     return decode(jwtToken) as JwtPayload
//   } catch (e) {
//     logger.write(`tokenToJson: ${e.message}`);
//   }
//   return defaultValue;
// }

export const toJson = (str: string, defaultValue: any = '') => {
  try {
    return JSON.parse(str)
  } catch (e) {
    logger.write(`toJson: ${e.message}`);
  }
  return defaultValue;
}

export const buildResponse = (statusCode: number, body: any): any => {
  return {
    statusCode,
    body: JSON.stringify(body),
  }
}
