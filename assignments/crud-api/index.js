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
        return res.json(TASKS)
    }
)

app.get(
    "/tasks/:id", (req, res) => {
        const taskId = Number(req.params.id);

        // check id if valid
        if (!Number.isInteger(taskId)) {
            return res.status(400).json({ error: "Invalid task ID" });
        }

        const task = TASKS.find(t => t.id === taskId);

        if (!task){
            return res.status(404).json({error: `Task ${taskId} not found`});
        }

        return res.status(200).json(task);
    }
)

// POST
app.post(
    "/tasks", (req, res) => {
        // check input first
        const {title} = req.body;

        if (typeof title !== "string" || !title.trim()) {
            return res.status(400).json({error: "Title is required."});
        }

        // get the max ID (realization after adding delete feature)
        const id = TASKS.length === 0 ? 0 : Math.max(...TASKS.map(task => task.id)) + 1;

        const newTask = {
            id: id,
            title: title.trim(),
            done: false
        };

        TASKS.push(newTask);
        return res.status(201).json(newTask);
    }
)

// PUT
app.put(
    "/tasks/:id", (req, res) => {
        const id = Number(req.params.id);

        // check id if valid
        if (!Number.isInteger(id)) {
            return res.status(400).json({ error: "Invalid task ID" });
        }

        const { title, done } = req.body;

        const taskId = TASKS.findIndex(task => task.id === id);

        if (taskId === - 1){ // if no match
            return res.status(404).json({error: "Unknown ID"});
        }

        // input validation
        if (title !== undefined && (typeof title !== "string" || !title.trim())){
            return res.status(400).json({error: "Title must be a string."});
        }

        if (done !== undefined && typeof done !== "boolean"){
            return res.status(400).json({error: "Done must be a boolean"});
        }

        const updatedTask = {
            id: TASKS[taskId].id,
            title: title === undefined ? TASKS[taskId].title : title.trim(),
            done: done ?? TASKS[taskId].done
        }

        TASKS[taskId] = updatedTask;
        return res.status(200).json(updatedTask);
    }
)

app.delete(
    "/tasks/:id", (req, res) => {
        const id = Number(req.params.id);

        // check id if valid
        if (!Number.isInteger(id)) {
            return res.status(400).json({ error: "Invalid task ID" });
        }

        const taskId = TASKS.findIndex(task => task.id === id);

        if (taskId === -1){
            return res.status(404).json({error: "Task ID does not exist"});
        }
        
        TASKS.splice(taskId, 1);
        return res.status(204).send();
    }
)
app.listen(3000);