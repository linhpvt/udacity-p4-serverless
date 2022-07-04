import * as React from 'react'
import { Form, Button, Grid } from 'semantic-ui-react';
import Auth from '../auth/Auth'
import { getUploadUrl, uploadFile } from '../api/todos-api'
import { History } from 'history';
import { TodoItem } from '../../../backend/src/models/TodoItem';

enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile,
}

interface EditTodoProps {
  match: {
    params: {
      todoId: string
    }
  }
  auth: Auth
}

interface EditTodoState {
  file: any
  uploadState: UploadState,
  todoItem: TodoItem
}

export class EditTodo extends React.PureComponent<
  EditTodoProps,
  EditTodoState
> {
  state: EditTodoState = {
    file: undefined,
    uploadState: UploadState.NoUpload,
    todoItem: JSON.parse((localStorage.getItem('todo') || '{}'))
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    this.setState({
      file: files[0]
    })
  }

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    try {
      if (!this.state.file) {
        alert('File should be selected')
        return
      }

      this.setUploadState(UploadState.FetchingPresignedUrl)
      const uploadUrl = await getUploadUrl(this.props.auth.getIdToken(), this.props.match.params.todoId)

      this.setUploadState(UploadState.UploadingFile)
      await uploadFile(uploadUrl, this.state.file)

      alert('File was uploaded!')
    } catch (e: any) {
      alert('Could not upload a file: ' + e.message)
    } finally {
      this.setUploadState(UploadState.NoUpload)
    }
  }

  setUploadState(uploadState: UploadState) {
    this.setState({
      uploadState
    })
  }
  onChange = (e: any) => {
    const fieldName = e.target.name
    const fieldValue = e.target.value

    console.log({ [fieldName]: fieldValue })
  }

  render() {
    const { todoItem } = this.state
    return (
      <div>
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
              <label>Due date</label>
              <input type="date" placeholder="task name" name='dueDate' value={todoItem.dueDate}  onChange={this.onChange}/>
            </div>
            <div className="field">
              <label>Status</label>
              <select className="ui search dropdown" name='status' onChange={this.onChange}>
                <option value="INIT" selected>Initial</option>
                <option value="INPROGRESS">In progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          <div className="fields two">
            <div className="field">
              <label>Description</label>
              <textarea placeholder="description" name='description' onChange={this.onChange}/>
            </div>
            <div className="field">
              <label>Report</label>
              <textarea placeholder="Your report"  name='reports' onChange={this.onChange}/>
            </div>
          </div>

          <div>
            <div className="field">
              <label>Report history:</label>
              <Grid padded>
        {[this.state.todoItem].map((todo, pos) => {
          return (
            <Grid.Row key={todo.todoId}>
              <Grid.Column width={1} verticalAlign="middle">
                {todo.status}
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                {todo.name}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {todo.dueDate}
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
        {this.state.uploadState === UploadState.FetchingPresignedUrl && <p>Uploading image metadata</p>}
        {this.state.uploadState === UploadState.UploadingFile && <p>Uploading file</p>}
        <Button className='upload'
        onClick={this.handleSubmit}
          loading={this.state.uploadState !== UploadState.NoUpload}
          type="submit"
        >
          Upload
        </Button>
      </div>
    )
  }
}
