import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils';
import { createTodo } from '../../businessLogic/todos'
import { toJson, generateUUID, buildResponse } from '../../utils/index';
import { TodoItem } from '../../models/TodoItem';
import { HttpStatus } from '../../consts/httpStatus';

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = toJson(event.body);
    // TODO: Implement creating a new TODO item
    const userId = getUserId(event);
    if (!userId) {
      return buildResponse(HttpStatus.SYSTEM_ERROR, { message: 'User ID not found' });
    }
    const todoId = generateUUID();
    const item: TodoItem = await createTodo(todoId, userId, newTodo);
    if (!item) {
      return buildResponse(HttpStatus.SYSTEM_ERROR, { message: 'Can not create Todo at this time' });
    }
    return buildResponse(HttpStatus.CREATED, {item})
  });

handler.use(
  cors({
    credentials: true
  })
);
