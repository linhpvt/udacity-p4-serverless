import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { TodoUpdate } from '../models/TodoUpdate'
import * as todoAccess from '../dataLayer/todosAccess';
import { getTimestamp } from '../utils';

// TODO: Implement businessLogic


export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
  return await todoAccess.getTodosForUser(userId);
}

export async function createTodo(todoId: string, userId: string,createTodoRequest: CreateTodoRequest): Promise<TodoItem> {
  const {name, dueDate } = createTodoRequest;
  const todo = todoAccess.createTodo({
    todoId: todoId,
    userId: userId,
    name,
    dueDate,
    done: false,
    createdAt:  getTimestamp(),
    attachmentUrl: '',
  } as TodoItem);
  return todo;
}

export async function updateTodo(todoId: string, updatedTodo: UpdateTodoRequest, userId: string): Promise<TodoUpdate> {
  const result = await todoAccess.updateTodo(todoId, userId, updatedTodo);
  return result;
}

export async function deleteTodo(todoId: string, userId: string): Promise<void> {
  await todoAccess.deleteTodo(todoId, userId);
}

export async function createSignedUrl(
  todoId: string,
  imageId: string,
  userId: string
): Promise<string> {
  return await todoAccess.createAttachmentSignedUrl(todoId, imageId, userId);
}
