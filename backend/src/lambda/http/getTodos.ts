import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getTodosForUser } from '../../businessLogic/todos'
import { getUserId } from '../utils';
import { buildResponse } from '../../utils/index';
import { HttpStatus } from '../../consts/httpStatus';

// TODO: Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here
    const userId = getUserId(event);
    if (!userId) {
      return buildResponse(HttpStatus.SYSTEM_ERROR, { message: 'Can not get User ID'});
    }
    const items = await getTodosForUser(userId);
    return buildResponse(HttpStatus.SUCCESS, { items });

  });

handler.use(
  cors({
    credentials: true
  })
);
