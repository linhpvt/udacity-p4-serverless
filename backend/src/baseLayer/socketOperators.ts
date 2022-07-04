import { getApiGatewayManagementApi } from '../sdkLayer/sdkIntances';
import { toString } from '../utils';
import { createLogger } from '../utils/logger';

const logger = createLogger('socketOperators');
// local environment for this lambda function
const STAGE = process.env.STAGE;
const API_ID = process.env.API_ID;
const connectionParams = {
  apiVersion: '2018-11-29',
  endpoint: `${API_ID}.execute-api.us-east-1.amazonaws.com/${STAGE}`,
}
const apiGateway = getApiGatewayManagementApi(connectionParams);

export async function sendMessage(ConnectionId, payload) {
  let success = 0;
  try {
    await apiGateway.postToConnection({ ConnectionId, Data: toString(payload) }).promise();
    logger.info(`SEND OK`);
  } catch (e: any) {
    success = e.statusCode;
    logger.info(`SEND FAILED ${e.statusCode} - ${e.message}`);
  }
  return success;
}
