import { TodoReport } from "./TodoReport"

export interface TodoItem {
  userId?: string
  todoId?: string
  createdAt?: string
  updatedAt?: string
  name: string
  dueDate: string
  status: string
  attachmentUrl?: string
  
  description?: string
  reports?: TodoReport[]
  report?: string
}
