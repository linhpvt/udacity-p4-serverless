import dateFormat from "dateformat"
import { TodoStatus } from "../consts/todoStatus"

const  TodoStatusTexts = {
  [TodoStatus.INIT]: 'Initialization',
  [TodoStatus.INPROGRESS]: 'In progress',
  [TodoStatus.COMPLETED]: 'Completed',

}
export const todoStatusToText = (key: string) => {
  return TodoStatusTexts[key]
}

export function calculateDueDate(): string {
  const date = new Date()
  date.setDate(date.getDate() + 7)
  return dateFormat(date, 'dd/mm/yyyy') as string
}

export function timeStampToDateString(time: number): string {
  const date = new Date(time)
  const str = dateFormat(date, 'dd/mm/yyyy HH:MM') as string
  return str
}
export function toYYYYMMDD(str: string) {
  const arr = str.split('/');
  return `${arr[2]}-${arr[1]}-${arr[0]}`
}
export function toDDMMYYYY(str: string) {
  const arr = str.split('-');
  return `${arr[2]}/${arr[1]}/${arr[0]}`
}