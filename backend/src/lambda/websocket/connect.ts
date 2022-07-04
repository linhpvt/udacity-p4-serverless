import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import 'source-map-support/register';
import { addItem } from '../../baseLayer/dynamoOperators';
import { Cfg } from '../../config/environments';
import { getTimestamp } from '../../utils';
import { createLogger } from '../../utils/logger';
import { buildResponse } from '../../utils/index';
import { HttpStatus } from '../../consts/httpStatus';

const CONNECTIONS_TABLE = Cfg.CONNECTIONS_TABLE;
const logger = createLogger('connect')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const connectionId = event.requestContext.connectionId;
  const timestamp = getTimestamp();
  const item = { id: connectionId, timestamp };
  logger.info('Storing connection info: ', item);

  const addedItem = await addItem(CONNECTIONS_TABLE, item);
  return buildResponse(HttpStatus.SUCCESS, addedItem);
}
