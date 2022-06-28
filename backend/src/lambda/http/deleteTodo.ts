import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { deleteTodo } from '../../businessLogic/todos'
import { getUserId } from '../utils'
import { buildResponse } from '../../utils/index';
import { HttpStatus } from '../../consts/httpStatus';

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const { pathParameters: { todoId = ''} = {} } = event;
    
    // TODO: Remove a TODO item by id
    if (!todoId) {
      return buildResponse(HttpStatus.BAD_REQUEST, { message: 'todo id not provided' });
    }
    
    const userId = getUserId(event);
    if (!userId) {
      buildResponse(HttpStatus.SYSTEM_ERROR, { message: 'Can not get user id'});
    }

    await deleteTodo(todoId, userId)
    return buildResponse(HttpStatus.SUCCESS, null);   
  });

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  );
