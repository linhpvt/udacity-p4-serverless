import { TodoReport } from '../models/TodoReport';
/**
 * Fields in a request to update a single TODO item.
 */
export interface UpdateTodoRequest {
  name: string
  dueDate: string
  status: string
  
  description?: string
  reports?: TodoReport[]
}