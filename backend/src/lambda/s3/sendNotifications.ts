import { SNSHandler, SNSEvent, S3Event } from 'aws-lambda';
import 'source-map-support/register';
import { deleteItem, scanItems } from '../../baseLayer/dynamoOperators';
import { Cfg } from '../../config/environments';

import { getApiGatewayManagementApi } from '../../sdkLayer/sdkIntances';
import { toJson } from '../../utils/index';
import { createLogger } from '../../utils/logger';

const logger = createLogger('sendNotification');

const CONNECTIONS_TABLE = Cfg.CONNECTIONS_TABLE;

// local environment for this lambda function
const STAGE = process.env.STAGE;
const APIID = process.env.API_ID;
const connectionParams = {
  apiVersion: "2018-11-29",
  endpoint: `${APIID}.execute-api.us-east-1.amazonaws.com/${STAGE}`
}
const apiGateway = getApiGatewayManagementApi(connectionParams);

export const handler: SNSHandler = async (event: SNSEvent) => {
  const { Records } = event;
  for (const snsRecord of Records) {
    const s3EventStr = snsRecord.Sns.Message;
    const s3Event = toJson(s3EventStr);
    await processS3Event(s3Event);
  }
}

async function processS3Event(s3Event: S3Event) {
  // interate over s3 records
  const { Records = []} = s3Event;

  const connections = await scanItems<{ id: string }>(CONNECTIONS_TABLE);
  
  // no connections to send notification to
  if (connections.length === 0) {
    return;
  }

  // iterate over s3 records event
  for (const record of Records) {
    const key = record.s3.object.key;
    const payload = { imageId: key };

    // send notification to all connection;
    for (const c of connections) {
      const connectionId = c.id;
      await sendMessageToClient(connectionId, payload);
    }
  }
}

async function sendMessageToClient(connectionId, payload) {
  try {
    await apiGateway.postToConnection({
      ConnectionId: connectionId,
      Data: toJson(payload),
    }).promise()
  } catch (e: any) {
    // the old connection
    if (e.statusCode === 410) {
      logger.error('Stale connection', connectionId)
      await deleteItem(CONNECTIONS_TABLE, { id: connectionId });
    }
  }
}