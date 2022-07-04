import { TodoReport } from "./TodoReport"

export interface TodoUpdate {
  name: string
  dueDate: string
  status: string

  updatedAt: string
  description: string
  reports: TodoReport[]
}