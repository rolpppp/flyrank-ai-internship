const express = require("express");
const app = express();

// middleware
app.use(express.json());

// in-memory list of sample tasks
const TASKS = [
    {id: 0, title: "Do laundry", done: false},
    {id: 1, title: "Cook rice", done: false},
    {id: 2, title: "Take a bath", done: true}
]

// GET
app.get(
    "/", (req, res) => {
        res.json({
            "name": "Task API",
            "version": "1.0",
            "endpoints": ["/tasks"]
        });
    }
);

app.get(
    "/health", (req, res) =>{
        res.json({
            "status": "ok"
        });
    }
)

// GET TASK
app.get(
    "/tasks", (req, res) => {
        res.json(TASKS)
    }
)

app.get(
    "/tasks/:id", (req, res) => {
        const taskId = parseInt(req.params.id);
        const task = TASKS.find(t => t.id === taskId);

        if (!task){
            return res.status(404).json({error: `Task ${taskId} not found`});
        }

        res.status(200).json(task);
    }
)

// POST
app.post(
    "/tasks", (req, res) => {
        // check input first
        const {title} = req.body;

        if (!title) {
            return res.status(400).json({error: "Title is required."});
        }

        const newTask = {
            id: TASKS.length,
            title: title,
            done: false
        };

        TASKS.push(newTask);
        res.status(201).json(newTask);
    }
)

app.listen(3000);