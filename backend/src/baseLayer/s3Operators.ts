import { Cfg } from '../config/environments';
import { getS3Instance } from '../sdkLayer/sdkIntances';
import { createLogger } from '../utils/logger';
const s3 = getS3Instance();
const bucketName = Cfg.ATTACHMENT_S3_BUCKET;
const urlExpiration = Cfg.SIGNED_URL_EXPIRATION;


const logger = createLogger('s3Operators')

export async function createPutSignedUrl(Key: string): Promise<string> {
  const attachmentUrl = await s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key,
    Expires: urlExpiration,
  });
  
  return attachmentUrl;
}

export async function getObject(Bucket: string, Key: string): Promise<any> {
  let result = null;
  try {
    result = await s3.getObject({ Bucket, Key }).promise()
  } catch (e: any) {
    logger.error('getObject', Bucket, Key,  e);
  }
  return result;
}

export async function putObject(Bucket: string, Key: string, Body: Buffer): Promise<boolean> {
  let result = true;
  try {
    await s3.putObject({ Bucket, Key, Body }).promise()
  } catch (e: any) {
    result = false;
    logger.error('putObject', Bucket, Key, e);
  }
  return result;
}