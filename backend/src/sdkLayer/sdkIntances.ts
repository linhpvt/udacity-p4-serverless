import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger';

const XAWS = AWSXRay.captureAWS(AWS);
const logger = createLogger('TodosAccess')

export function createDynamoClientInstance(endpoint: string = ''): DocumentClient {
  
  if (process.env.IS_OFFLINE) {
    logger.info('Creating a local DynamoDB instance');
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: endpoint || 'http://localhost:8000',
    });
  }
  logger.info('Creating a AWS DynamoDB instance');
  return new XAWS.DynamoDB.DocumentClient();
}

export function getS3Instance(): AWS.S3 {
  logger.info('Creating a S3 instance');
  return new XAWS.S3({
    signatureVersion: 'v4',
  });
}