
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
import * as dyOps from '../baseLayer/dynamoOperators';
import * as s3Ops from '../baseLayer/s3Operators';
import { Cfg } from '../config/environments';

const TodoTable = Cfg.TODOS_TABLE;
const TodoIndex = Cfg.TODOS_CREATED_AT_INDEX;
const BucketName = Cfg.ATTACHMENT_S3_BUCKET;
const logger = createLogger('TodosAccess');

// TODO: Implement the dataLayer logic

export async function getTodosForUser(userId: String): Promise<TodoItem[]> {
  logger.info(`Getting all todos of userId: ${userId}`);
  const items = await dyOps.queryItems<TodoItem>(TodoTable, TodoIndex, 'userId = :userId', {
    ':userId': userId,
  });
  return items;
}

export async function createTodo(todo: TodoItem): Promise<TodoItem> {
  logger.info('Creating a new todo: ', todo)
  const item = await dyOps.addItem<TodoItem>(TodoTable, todo);
  return item;
}

export async function updateTodo(
  todoId: string,
  userId: string,
  item: TodoUpdate,
): Promise<TodoUpdate> {
  logger.info('Updating todoId: ', todoId, ' userId: ', userId);
  const result = await dyOps.updateItem(TodoTable, {
      todoId,
      userId,
    },
    'set #name = :name, #dueDate = :dueDate, #status = :status, #updatedAt = :updatedAt, #description = :description, #reports = :reports ',
    {
      ':name': item.name,
      ':dueDate': item.dueDate,
      ':status': item.status,
      ':updatedAt': item.updatedAt,
      ':description': item.description,
       ':reports': item.reports,
    }, {
      '#name': 'name',
      '#dueDate': 'dueDate',
      '#status': 'status',
      '#updatedAt': 'updatedAt',
      '#description': 'description',
      '#reports': 'reports',
    });

  const resp: TodoUpdate = result ? item : null;
  return resp;
}

export async function deleteTodo(todoId: String, userId: String): Promise<void> {
  logger.info('Delete todoId: ', todoId, ' userId: ', userId);
  await dyOps.deleteItem(TodoTable, {
    todoId,
    userId,
  });
}

export async function createAttachmentSignedUrl(todoId: string, imageId: string, userId: string): Promise<string> {
  const putSignedUrl = await s3Ops.createPutSignedUrl(imageId);

  if (!putSignedUrl) {
    return '';
  }
  const updateResult = await dyOps.updateItem(TodoTable, {
    todoId,
    userId,
  },
  'set #attachmentUrl = :attachmentUrl',
  {
    ':attachmentUrl': `https://${BucketName}.s3.amazonaws.com/${imageId}`,
  },{
    '#attachmentUrl': 'attachmentUrl'
  });

  return updateResult ? putSignedUrl : '';
}


