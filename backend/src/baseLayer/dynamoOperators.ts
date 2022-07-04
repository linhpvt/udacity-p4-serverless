
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { createDynamoClientInstance } from '../sdkLayer/sdkIntances';

const logger = createLogger('DynamoOperators')
const client: DocumentClient = createDynamoClientInstance()

export async function queryItems<T>(TableName: string, IndexName: string, KeyConditionExpression: string, ExpressionAttributeValues: any): Promise<T[]> {
  try {
    const { Items } = await client.query({
      TableName,
      IndexName,
      KeyConditionExpression,
      ExpressionAttributeValues
    }).promise();
    return Items as T[];
  } catch (e) {
    logger.error(`queryItems-${TableName} ${e.message}`, TableName, IndexName, KeyConditionExpression, ExpressionAttributeValues);
  }
  return [];
}

export async function addItem<T>(TableName, Item: T): Promise<T> {
  let result = Item;
  try {
    await client.put({
      TableName,
      Item,
    }).promise();
  } catch (e) {
    logger.error(`addItem-${TableName} ${e.message}`, TableName, Item);
    result = null;
  }
  return result;
}

export async function updateItem(TableName: string,  Key: any, UpdateExpression: string, ExpressionAttributeValues: any, ExpressionAttributeNames: any): Promise<Boolean> {
  let result = true;
  try {
    await client.update({
      TableName,
      Key,
      UpdateExpression,
      ExpressionAttributeValues,
      ExpressionAttributeNames
    }).promise();
  } catch (e) {
    logger.error(`updateItem-${TableName} ${e.message}`, TableName, Key, UpdateExpression, ExpressionAttributeValues, ExpressionAttributeNames);
    result = false;
  }
  return result;
}

export async function deleteItem(TableName: string, Key: object): Promise<Boolean> {
  let result = true;
  try {
    await client.delete({
      TableName,
      Key,
    }).promise();
  } catch (e) {
    logger.error(`deleteItem-${TableName} ${e.message}`, TableName, Key);
    result = false;
  }
  return result;
}

export async function scanItems<T>(TableName: string): Promise<T[]> {
  try {
    const { Items = [] } = await client.scan({ TableName}).promise();
    return Items as T[];
  } catch (e: any) {
    logger.error('scanItems', TableName, e);
  }
  return [];
}
