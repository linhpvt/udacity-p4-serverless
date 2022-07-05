import { History } from 'history'
import * as React from 'react'
import {
  Button,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader} from 'semantic-ui-react'

import { createTodo, deleteTodo, getTodos } from '../api/todos-api'
import Auth from '../auth/Auth'
import { TodoStatus } from '../consts/todoStatus'
import { calculateDueDate, todoStatusToText } from '../helpers'
import { Todo } from '../types/Todo'

interface TodosProps {
  auth: Auth
  history: History
}

interface TodosState {
  todos: Todo[]
  newTodoName: string
  requesting: boolean,
  errors: any
}

export class Todos extends React.PureComponent<TodosProps, TodosState> {
  state: TodosState = {
    todos: [],
    newTodoName: '',
    requesting: true,
    errors: {}
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    const elementId = event.target.id
    const newError = { [elementId]: value ? '': 'Task name is required' }
    this.setState({ newTodoName: value, errors: { ...this.state.errors, ...newError} })
  }

  onEditButtonClick = (todoId: string) => {
    const todo = this.state.todos.find((todo) =>  todo.todoId === todoId);
    localStorage.setItem('todo', JSON.stringify(todo))
    this.props.history.push(`/todos/${todoId}/edit`)
  }
  startRequest = () => {
    this.setState({ requesting: true })
  }
  endRequest = () => {
    this.setState({ requesting: false })
  }
  onTodoCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    if (!this.state.newTodoName) {
      this.setState({ errors: { ...this.state.errors, ...{taskName: 'Task name is required'} }})
      return;
    }
    try {
      const dueDate = calculateDueDate()
      this.startRequest()
      const newTodo = await createTodo(this.props.auth.getIdToken(), {
        name: this.state.newTodoName,
        dueDate,
        status: TodoStatus.INIT
      })
      this.setState({
        todos: [newTodo, ...this.state.todos],
        newTodoName: '',
        requesting: false
      })
    } catch {
      this.endRequest()
      alert('Todo creation failed')
    }
    this.inputFocus()
  }
  onSubmit = (e: any) => {
    e.preventDefault()
  }

  onTodoDelete = async (todoId: string) => {
    // eslint-disable-next-line no-restricted-globals
    const ok = confirm('Are you soure to delete this TODO?')
    if (!ok) {
      return
    }
    try {
      this.startRequest()
      await deleteTodo(this.props.auth.getIdToken(), todoId)
      this.setState({
        todos: this.state.todos.filter(todo => todo.todoId !== todoId),
        requesting: false
      })
    } catch {
      alert('Todo deletion failed')
      this.endRequest();
    }
  }

  inputFocus = () => {
    const taskName = document.getElementById('taskName')
    if (!taskName) {
      return
    }
    taskName.focus()
  }

  async componentDidMount() {
    this.inputFocus()
    try {
      const todos = await getTodos(this.props.auth.getIdToken())
      this.setState({
        todos: todos.reverse(),
        requesting: false
      })
    } catch (e: any) {
      alert(`Failed to fetch todos: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">TODOs</Header>

        {this.renderCreateTodoInput()}

        {this.renderTodos()}
      </div>
    )
  }
  
  renderCreateTodoInput() {
    const {errors} = this.state
    const errorClass = errors.taskName ? 'input-error' : ''
    return (
      <Grid.Row>
          <form onSubmit={this.onSubmit}>
            <Grid.Column width={16}>
              <Input
                className={errorClass}
                id='taskName'
                value={this.state.newTodoName}
                action={{
                  color: 'teal',
                  labelPosition: 'left',
                  icon: 'add',
                  content: 'New task',
                  onClick: this.onTodoCreate
                }}
                fluid
                actionPosition="left"
                placeholder="To change the world..."
                onChange={this.handleNameChange}
              />
            </Grid.Column>
        </form>
        {
          errors.taskName && <label className='label-error'>{errors.taskName}</label>
        }
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderTodos() {
    if (this.state.requesting) {
      return this.renderLoading()
    }

    return this.renderTodosList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Calling API...
        </Loader>
      </Grid.Row>
    )
  }
  renderHeaderTable() {
    return (
      <Grid.Row key={'0'} className="bolder">
        <Grid.Column width={2} verticalAlign="middle">
          STATUS
        </Grid.Column>
        <Grid.Column width={4} verticalAlign="middle">
          TASK NAME
        </Grid.Column>
        <Grid.Column width={6} verticalAlign="middle">
          DESCRIPTION
        </Grid.Column>
        <Grid.Column width={2} floated="right">
          DUE DATE
        </Grid.Column>
        <Grid.Column width={1} floated="right">
          ACTIONS
        </Grid.Column>
        <Grid.Column width={1} floated="right">
          
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>

    )
  }

  renderTodosList() {
    let { todos } = this.state
    return (
      <Grid padded>
        {this.renderHeaderTable()}
        {todos.map((todo, pos) => {
          return (
            <Grid.Row key={todo.todoId}>
              <Grid.Column width={2} verticalAlign="middle">
                {todoStatusToText(todo.status)}
              </Grid.Column>
              <Grid.Column width={4} verticalAlign="middle">
                {todo.name}
              </Grid.Column>
              <Grid.Column width={6} verticalAlign="middle">
                {todo.description}
              </Grid.Column>
              <Grid.Column width={2} floated="right">
                {todo.dueDate}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(todo.todoId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onTodoDelete(todo.todoId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {todo.attachmentUrl && (
                <Image src={todo.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }
}
