const express = require("express");
const swaggerUi = require("swagger-ui-express");
const openapi = require('./openapi.json');
const app = express();

// database functions
const {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask
} = require("./db");

// middleware
app.use(express.json());

// swagger ui
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi));

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
        return res.json(getAllTasks());
    }
)

app.get(
    "/tasks/:id", (req, res) => {
        const taskId = Number(req.params.id);

        // check id if valid
        if (!Number.isInteger(taskId)) {
            return res.status(400).json({ error: "Invalid task ID" });
        }
        
        // check if an ID exists
        const task = getTaskById(taskId);

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

        const newTask = createTask(title.trim());

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

        // input validation
        if (title !== undefined && (typeof title !== "string" || !title.trim())){
            return res.status(400).json({error: "Title must be a string."});
        }

        if (done !== undefined && typeof done !== "boolean"){
            return res.status(400).json({error: "Done must be a boolean"});
        }

        const updatedTask = updateTask(id, title, done);

        if (!updatedTask){
            return res.status(404).json({error: "Task not found"});
        }

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
    
        const deleted = deleteTask(id);

        if (!deleted){
            return res.status(404).json({error: "Task not found"});
        }

        return res.status(204).send();
    }
)
app.listen(3000);