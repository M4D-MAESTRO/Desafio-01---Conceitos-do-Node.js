const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find(u => u.username == username);

  if (!user) {
    return response.status(400).json({
      error: `User ${username} not found!`
    });
  }
  request.user = user;
  next();

}

function checksExistsTodo(request, response, next) {
  const { user } = request;
  const { id } = request.params;

  const todoIndex = user.todos.findIndex(todo => todo.id == id);
  if (todoIndex < 0) {
    return response.status(404).json({
      error: `Todo ${id} not found!`
    });
  }
  request.todoIndex = todoIndex;
  next();

}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userExists = users.find(u => u.username == username);

  if(userExists){
    return response.status(400).json({
      error: `User ${username} already exists!`
    });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);


});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).json(todo);

});

app.put('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { user, todoIndex } = request;
  const { title, deadline } = request.body;

  const updatedTodo = user.todos[todoIndex];
  updatedTodo.title = title;
  updatedTodo.deadline = deadline;

  user.todos[todoIndex] = updatedTodo;

  return response.status(200).json(updatedTodo);

});

app.patch('/todos/:id/done', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { user, todoIndex } = request;

  const updatedTodo = user.todos[todoIndex];
  updatedTodo.done = true;

  user.todos[todoIndex] = updatedTodo;

  return response.status(200).json(updatedTodo);
});

app.delete('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { user, todoIndex } = request;

  user.todos.splice(todoIndex, 1);

  return response.status(204).json(user.todos);
});

module.exports = app;