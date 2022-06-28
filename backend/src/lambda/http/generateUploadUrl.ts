import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors, httpErrorHandler } from 'middy/middlewares';

import { createSignedUrl } from '../../businessLogic/todos';
import { getUserId } from '../utils';
import { generateUUID, buildResponse } from '../../utils/index';
import { HttpStatus } from '../../consts/httpStatus';

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    const userId = getUserId(event);
    if (!userId) {
      return buildResponse(HttpStatus.SYSTEM_ERROR, { message: 'Can not get User ID for signing image'});
    }
    const imageId =generateUUID();
    const uploadUrl = await createSignedUrl(todoId, imageId, userId);
    return buildResponse(HttpStatus.CREATED, { uploadUrl });
  }
);

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  );
