import { TodoReport } from './UpdateTodoRequest';
export interface Todo {
  todoId: string
  createdAt: string
  name: string
  dueDate: string
  status: string
  attachmentUrl?: string
  updatedAt: string
  description: string
  reports: TodoReport[]
}
