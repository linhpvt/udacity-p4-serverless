import { SNSHandler, SNSEvent, S3Event } from 'aws-lambda';
import 'source-map-support/register';
import { deleteItem, scanItems } from '../../baseLayer/dynamoOperators';
import { Cfg } from '../../config/environments';

import { toJson } from '../../utils';
import { createLogger } from '../../utils/logger';
import { sendMessage } from '../../baseLayer/socketOperators';
import { HttpStatus } from '../../consts/httpStatus';

const logger = createLogger('sendNotification');

const CONNECTIONS_TABLE = Cfg.CONNECTIONS_TABLE;

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
  const { Records = [] } = s3Event;

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
      logger.info(`SEND TO ${connectionId} - ${JSON.stringify(payload)}`);
      const status = await sendMessage(connectionId, payload);
      // delete stale connection.
      if (status === HttpStatus.STALE_CONNECTION) {
        deleteItem(CONNECTIONS_TABLE, { id: connectionId });
      }
    }
  }
}
