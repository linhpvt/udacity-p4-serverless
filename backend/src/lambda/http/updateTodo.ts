import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updateTodo } from '../../businessLogic/todos'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'
import { toJson } from '../../utils'
import { buildResponse } from '../../utils/index';
import { HttpStatus } from '../../consts/httpStatus';

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const { pathParameters: { todoId } = {}, body = '{}' } = event;
    const upTodo: UpdateTodoRequest = toJson(body, {});
    const userId = getUserId(event);
    // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
    if (!todoId || !userId || (Object.keys(upTodo).length === 0)) {
      return buildResponse(HttpStatus.BAD_REQUEST, { message: 'TODO ID not found or payload is empty', todoId, userId, updatedTodo: upTodo });
    }
    upTodo
    const result = await updateTodo(todoId, upTodo, userId);
    if (result) {
      return buildResponse(HttpStatus.SUCCESS, { item: result });
    }
    return buildResponse(HttpStatus.SYSTEM_ERROR, { message: 'Can not update TODO at the moment' });
  });

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  );
  
