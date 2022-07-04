export interface TodoReport {
  time: number
  text: string
}
export interface UpdateTodoRequest {
  name: string
  dueDate: string
  status: string
  description?: string
  reports?: TodoReport[]
}