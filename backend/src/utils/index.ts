import * as uuid from 'uuid';
import { createLogger } from './logger';

const logger = createLogger('utils');


export const getTimestamp = () => {
  return new Date().toISOString();
}

export const generateUUID = () => {
  return uuid.v4();
}

export const toJson = (str: string, defaultValue: any = '') => {
  try {
    return JSON.parse(str)
  } catch (e) {
    logger.error(`toJson: ${e.message}`);
  }
  return defaultValue;
}

export const buildResponse = (statusCode: number, body: any): any => {
  return {
    statusCode,
    body: JSON.stringify(body),
  }
}
export const toString = (o: any, defaultValue: any = ''): string => {
  try {
    return JSON.stringify(o);
  } catch(e) {
    logger.error(e.message);
    return defaultValue;
  }
}
