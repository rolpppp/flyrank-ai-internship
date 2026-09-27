const Database = require('better-sqlite3');

// create and connect to the database
const db = new Database('tasks.db', { verbose: console.log });

// performance optimization: Enable Write-Ahead Logging (WAL) mode
db.pragma('journal_mode = WAL');

// create task table { id, title, done }
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0 CHECK (done IN (0,1))
  )
`);

console.log("Database and table successfully created!");

const seedTasks = [
    {id: 0, title: "Do laundry", done: false},
    {id: 1, title: "Cook rice", done: false},
    {id: 2, title: "Take a bath", done: true}
];

const count  = db.prepare("SELECT COUNT(*) AS count FROM tasks").get();

if (count.count === 0){
    const insert = db.prepare(`
        INSERT INTO tasks (title, done)
        VALUES (?, ?)`);
    
    const seed = db.transaction(() => {
        for (const task of seedTasks){
            insert.run(task.title, task.done ? 1 : 0);
        }
    });

    try{
        seed();
        console.log("Tasks seeded succesfully");
    }catch(error){
        console.error("Transaction failed. Rolled back.", error);
    }
}

// get all tasks
function getAllTasks(){
    const rows = db.prepare(`
        SELECT id, title, done
        FROM tasks
        ORDER BY id
        `).all();
    
    return rows.map(task =>({
        ...task,
        done: Boolean(task.done)
    }));
}

// get task by id
function getTaskById(id){
    const task = db.prepare(`
        SELECT id, title, done
        FROM tasks
        WHERE id = ?
        `).get(id);
    
    if (!task){
        return undefined;
    }

    return {
        ...task,
        done: Boolean(task.done)
    }
}

// insert task
function createTask(title){

    try{
        const result = db.prepare(`
            INSERT INTO tasks(title, done)
            VALUES (?, ?)
            `).run(title, 0);
        
        return getTaskById(result.lastInsertRowid);
    }catch(err){
        return ({error: err})
    }
    
}

function updateTask(id, title, done){

    try{
    const currentTask = getTaskById(id);

    if (!currentTask){
        return undefined;
    }

    db.prepare(`
        UPDATE tasks
        SET title = ?, done = ?
        WHERE id = ?
        `).run(
            title === undefined ? currentTask.title : title,
            done === undefined ? (currentTask.done ? 1 : 0) : (done ? 1 : 0),
            id
        );
        
        return getTaskById(id);
    }catch(err){
        return ({error: err});
    }
}

// this returns either 0 (no task match ID) or 1 (there is a task deleted)
function deleteTask(id){
    const result = db.prepare(`
        DELETE FROM tasks
        WHERE id = ?`).run(id);
    
    return result.changes > 0;
}

module.exports = {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask
};