import * as AWSSDK from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger';

const logger = createLogger('TodosAccess')

export const AWS = AWSXRay.captureAWS(AWSSDK);

export function createDynamoClientInstance(endpoint: string = ''): DocumentClient {
  
  if (process.env.IS_OFFLINE) {
    logger.info('Creating a local DynamoDB instance');
    return new AWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: endpoint || 'http://localhost:8000',
    });
  }
  logger.info('Creating a AWS DynamoDB instance');
  return new AWS.DynamoDB.DocumentClient();
}

export function getS3Instance(): AWSSDK.S3 {
  logger.info('Creating a S3 instance');
  return new AWS.S3({
    signatureVersion: 'v4',
  });
}

export function getApiGatewayManagementApi(connectionParams: any): AWSSDK.ApiGatewayManagementApi {
  return new AWS.ApiGatewayManagementApi(connectionParams);
}
