import { Cfg } from '../config/environments';
import { getS3Instance } from '../sdkLayer/sdkIntances';
const s3 = getS3Instance();
const bucketName = Cfg.ATTACHMENT_S3_BUCKET;
const urlExpiration = Cfg.SIGNED_URL_EXPIRATION;

export async function createPutSignedUrl(Key: string): Promise<string> {
  const attachmentUrl = await s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key,
    Expires: urlExpiration,
  });
  
  return attachmentUrl;
}
