import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import { deleteItem } from '../../baseLayer/dynamoOperators';
import { buildResponse } from '../../utils/index';
import { HttpStatus } from '../../consts/httpStatus';
import { createLogger } from '../../utils/logger';

const CONNECTIONS_TABLE = process.env.CONNECTIONS_TABLE;
const logger = createLogger('disconnect');

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Websocket disconnect', event)

  const connectionId = event.requestContext.connectionId;
  const key = { id: connectionId };

  logger.info('Removing item with key: ', key);
  const result = await deleteItem(CONNECTIONS_TABLE, key);
  return buildResponse(result? HttpStatus.SUCCESS : HttpStatus.BAD_REQUEST, null)
}
