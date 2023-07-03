/**
  You need to create an express HTTP server in Node.js which will handle the logic of a todo list app.
  - Don't use any database, just store all the data in an array to store the todo list data (in-memory)
  - Hard todo: Try to save responses in files, so that even if u exit the app and run it again, the data remains (similar to databases)

  Each todo has a title and a description. The title is a string and the description is a string.
  Each todo should also get an unique autogenerated id every time it is created
  The expected API endpoints are defined below,
  1.GET /todos - Retrieve all todo items
    Description: Returns a list of all todo items.
    Response: 200 OK with an array of todo items in JSON format.
    Example: GET http://localhost:3000/todos
    
  2.GET /todos/:id - Retrieve a specific todo item by ID
    Description: Returns a specific todo item identified by its ID.
    Response: 200 OK with the todo item in JSON format if found, or 404 Not Found if not found.
    Example: GET http://localhost:3000/todos/123
    
  3. POST /todos - Create a new todo item
    Description: Creates a new todo item.
    Request Body: JSON object representing the todo item.
    Response: 201 Created with the ID of the created todo item in JSON format. eg: {id: 1}
    Example: POST http://localhost:3000/todos
    Request Body: { "title": "Buy groceries", "completed": false, description: "I should buy groceries" }
    
  4. PUT /todos/:id - Update an existing todo item by ID
    Description: Updates an existing todo item identified by its ID.
    Request Body: JSON object representing the updated todo item.
    Response: 200 OK if the todo item was found and updated, or 404 Not Found if not found.
    Example: PUT http://localhost:3000/todos/123
    Request Body: { "title": "Buy groceries", "completed": true }
    
  5. DELETE /todos/:id - Delete a todo item by ID
    Description: Deletes a todo item identified by its ID.
    Response: 200 OK if the todo item was found and deleted, or 404 Not Found if not found.
    Example: DELETE http://localhost:3000/todos/123

    - For any other route not defined in the server return 404

  Testing the server - run `npm run test-todoServer` command in terminal
 */
const express = require('express');
const bodyParser = require('body-parser');
const fs = require("fs");
const app = express();
const path = require("path");
const cors = require("cors");
//app.use(cors());

var filename = "./todos.json"
app.use(express.static('/Volumes/SD/kirat_FS/todo_app'));
app.use(bodyParser.json());

function getAllTodos(req, res){
  function getTodoFn(err, data){
    if (err){
      res.status(500).send()
    } else {
      var data = JSON.parse(data)
      //data = Object.keys(data).map((key) => [key, data[key]])
      res.send(data)
    }
  }
  fs.readFile(filename, getTodoFn)
}

function getTodoById( req, res){
  var id = req.params.id;
  function getTodoFn2(err, data) 
  {
    if (err) {console.log(err); res.status(500).send()}
    else {
      data = JSON.parse(data);
      if (id in data) {
        res.send(data[id]);
      } else { res.status(404).send(`No ToDo with Id ${id}`)}
    }
  }
  fs.readFile(filename, getTodoFn2)
}

function createTodo(req, res) {
  function createToDoFn(err, data){
    data = JSON.parse(data);
    var ids = Object.keys(data);
    var max_id = 0;
    for( var i=0; i<ids.length; i++){
      if (Number(ids[i])>=max_id) {
        max_id = Number(ids[i]);
      }
    }
    max_id += 1
    var todobody = req.body;
    var item = {"id":max_id};
    for (var key in todobody){
      item[key] = todobody[key]
    }
    //data.table.push(item)
    data[max_id] = todobody
    fs.writeFile(filename, JSON.stringify(data), 'utf-8', ()=>res.status(201).send({
      "id": max_id,
      "title": req.body.title,
      "description": req.body.description
    }));
  }
  fs.readFile(filename, "UTF-8", createToDoFn)
}

function updateTodoById(req, res) {
  var id = req.params.id;
  var newtodo = req.body;
  //console.log("In updateToDoByID; id:",id," body:", newtodo);
  function getTodoFn(err, data){
    if (err){
      res.status(500).send()
    } else {
      data = JSON.parse(data)
      if (id in data) {
        data[id] = newtodo;
        fs.writeFile(filename, JSON.stringify(data), 'utf-8', ()=>res.send({
          "id": id,
          "title": newtodo.title,
          "description": newtodo.description
        }));
      }
      else {res.status(404).send("ToDo not found")}
    }
  }
  fs.readFile(filename, "UTF-8", getTodoFn)
}

function deleteTodoById(req, res) {
  var id = req.params.id;
  //console.log("in delete"+id);
  function getTodoFn(err, data){
    if (err){
      res.status(500).send()
    } else {
      data = JSON.parse(data)
      if (id in data) {
        delete data[id];
        fs.writeFile(filename, JSON.stringify(data), ()=>res.send())
      }
      else {res.status(404).send("ToDo not found")}
    }
  }
  fs.readFile(filename, "UTF-8", getTodoFn)
}
app.get("/",  (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
  //res.sendFile(path.join(__dirname, "styles.css"));
})
app.get("/todos", getAllTodos);
app.get("/todos/:id", getTodoById);
app.post("/todos", createTodo);
app.put("/todos/:id", updateTodoById);
app.delete("/todos/:id", deleteTodoById);
app.get("*", (req,res)=>res.status(404).send("Route not found"));

app.listen(3000, ()=>console.log("Listening to port 3000"));
module.exports = app;
