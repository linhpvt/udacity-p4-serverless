import * as React from 'react'
import { Button, Grid, Loader } from 'semantic-ui-react';
import { History } from 'history'
import Auth from '../auth/Auth'
import { getUploadUrl, patchTodo, uploadFile } from '../api/todos-api'
import { TodoItem } from '../../../backend/src/models/TodoItem';
import { TodoStatus } from '../consts/todoStatus';
import { timeStampToDateString, todoStatusToText, toYYYYMMDD } from '../helpers'
import { toDDMMYYYY } from '../helpers/index';

const EditState = {
  UPLOAD_FILE: 'Uploading file',
  FETCHING_SINGED_URL: 'Uploading image metadata',
  UPDATE_TODO: 'Saving TODO item',
  READY: ''
}

interface EditTodoProps {
  match: {
    params: {
      todoId: string
    }
  }
  auth: Auth,
  history: History
}

interface EditTodoState {
  file: any
  uploadState: string,
  todoItem: TodoItem
}

export class EditTodo extends React.Component<
  EditTodoProps,
  EditTodoState
> {
  constructor(props: any) {
    super(props)
    const todoItem: TodoItem = JSON.parse((localStorage.getItem('todo') || '{}'))
    this.state = {
      file: undefined,
      uploadState: EditState.READY,
      todoItem,
      originName: todoItem.name
    } as EditTodoState
    
  }
  
  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    this.setState({
      file: files[0]
    })
  }

  handleSubmit = async (event: React.SyntheticEvent) => {
    if (this.state.uploadState !== EditState.READY) {
      return;
    }
    event.preventDefault()
    // console.log(this.state.todoItem)
    let { name, dueDate, status, report, reports, todoId = '', description = '' } = this.state.todoItem

    let upTodoItem: TodoItem = {name, dueDate, status };
    if (report) {
      reports = reports || [];
      reports = [{ time: Date.now(), text: report }, ...reports]
    }
    if (reports) {
      upTodoItem = {...upTodoItem, reports, description }
    }
    
    try {
      if (this.state.file) {
        // fetching signed url
        this.setUploadState(EditState.FETCHING_SINGED_URL)
        const uploadUrl = await getUploadUrl(this.props.auth.getIdToken(), this.props.match.params.todoId)
        
        // uploading file
        this.setUploadState(EditState.UPLOAD_FILE)
        await uploadFile(uploadUrl, this.state.file)
      }
      // update todo
      this.setUploadState(EditState.UPDATE_TODO)
      await patchTodo(this.props.auth.getIdToken(), todoId, upTodoItem)
    } catch (e: any) {
      alert(`Update Todo item error ${e.message}`)
    } finally {
      this.setState({ uploadState: EditState.READY })
    }
    this.props.history.push(`/`)
  }

  setUploadState(uploadState: string) {
    this.setState({
      uploadState
    })
  }
  onChange = (e: any) => {
    const fieldName = e.target.name
    let fieldValue = e.target.value
    const { todoItem } = this.state
    if (fieldName === 'dueDate') {
      fieldValue = toDDMMYYYY(fieldValue)
    }
    this.setState({ todoItem: { ...todoItem, ...{ [fieldName]: fieldValue } } })
  }
  
  renderOptions = () => {
    // @ts-ignore
    const { status } = this.state.todoItem
    const opts = [TodoStatus.INIT, TodoStatus.INPROGRESS, TodoStatus.COMPLETED].map((s: string) => {
      if (status === s) {
        return <option value={s} selected>{todoStatusToText(s)}</option>
      }
      return <option value={s} >{todoStatusToText(s)}</option>
    })
    return (
      <>
        {opts} 
      </>
    )
  }

  renderLoading(text: string) {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          {text}
        </Loader>
      </Grid.Row>
    )
  }

  render() {
    const { todoItem, uploadState } = this.state
    return (
      <div>
        {uploadState && this.renderLoading(uploadState)}
        <div className="ui form">
          <h1>Upload new image</h1>
          <div className="fields">
              <input
                type="file"
                accept="image/*"
                placeholder="Image to upload"
                onChange={this.handleFileChange}
              />
              {this.renderButton()}
          </div>

          <div className="fields two">
            <div className="field">
              <label>Task name</label>
              <input type="text" placeholder="task name" name='name' value={todoItem.name} onChange={this.onChange} />
            </div>
            <div className="field">
              <label>Due date(MM/DD/YYYY)</label>
              <input type="date" placeholder="task name" name='dueDate' value={toYYYYMMDD(todoItem.dueDate)}  onChange={this.onChange}/>
            </div>
            <div className="field">
              <label>Status</label>
              <select className="ui search dropdown" name='status' onChange={this.onChange}>
                {this.renderOptions()}
              </select>
            </div>
          </div>

          <div className="fields two">
            <div className="field">
              <label>Description</label>
              <textarea placeholder="description" name='description' value={todoItem.description} onChange={this.onChange}/>
            </div>
            <div className="field">
              <label>Report</label>
              <textarea placeholder="Your report"  name='report' onChange={this.onChange}/>
            </div>
          </div>

          <div>
            <div className="field">
              <label>Report history:</label>
              <Grid padded>
                {(todoItem.reports || []).map((report, pos) => {
                  return (
                    <Grid.Row key={report.time}>
                      <Grid.Column width={4} verticalAlign="middle">
                        {timeStampToDateString(report.time)}
                      </Grid.Column>
                      <Grid.Column width={12} verticalAlign="middle">
                        {report.text}
                      </Grid.Column>
                    </Grid.Row>
                  )
                })}
              </Grid>
            </div>
          </div>
        </div>
      </div>
    )
  }

  renderButton() {

    return (
      <div>
        
        <Button className='upload'
        onClick={this.handleSubmit}
          type="submit"
        >
          Save
        </Button>
      </div>
    )
  }
}
