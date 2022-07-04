import { SNSEvent, SNSHandler, S3EventRecord } from 'aws-lambda';
import 'source-map-support/register';
import Jimp from 'jimp';

import { getObject, putObject } from '../../baseLayer/s3Operators';
import { toJson } from '../../utils';
import { Cfg } from '../../config/environments';
import { createLogger } from '../../utils/logger';

const logger = createLogger('resizeImage');
// source bucket
const ATTACHMENT_S3_BUCKET = Cfg.ATTACHMENT_S3_BUCKET;
// destination bucket
const THUMBNAILS_S3_BUCKET = Cfg.THUMBNAILS_S3_BUCKET;

export const handler: SNSHandler = async (event: SNSEvent) => {
  const { Records } = event;
  // interate over the SNS records
  for (const snsRecord of Records) {
    const s3EventStr = snsRecord.Sns.Message;
    const s3Event = toJson(s3EventStr);

    // iterate over s3 records
    for (const record of s3Event.Records) {
      await processImage(record);
    }
  }
}

async function processImage(record: S3EventRecord) {
  const key = record.s3.object.key;
  // source bucket
  let resp = await getObject(ATTACHMENT_S3_BUCKET, key);
  if (!resp) {
    logger.error('Can not get the image from', ATTACHMENT_S3_BUCKET, key);
    return;
  }

  const body = resp.Body;
  const image = await Jimp.read(body);

  image.resize(120, Jimp.AUTO);
  // @ts-ignore
  const buffer = await image.getBufferAsync(Jimp.AUTO);
  // destination bucket
  resp = await putObject(THUMBNAILS_S3_BUCKET, `${key}.jpeg`, buffer);
  if (!resp) {
    logger.error('Can not write the image to', THUMBNAILS_S3_BUCKET, key);
  }
  
}
